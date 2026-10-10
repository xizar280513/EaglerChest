#!/usr/bin/env python3
"""v2: ambil SEMUA kandidat .js ber-marker EaglerForge dari artifacts.jsonl
(validasi berdasarkan ISI, bukan nama file), lalu deduplikasi keras dan tulis ke root."""
import os, re, json, time, hashlib, shutil, collections, socket, urllib.request
from concurrent.futures import ThreadPoolExecutor

socket.setdefaulttimeout(45)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/tmp/jsmods"


def read_text(p, tries=12):
    for _ in range(tries):
        try:
            d = open(p, encoding="utf-8").read()
            if d:
                return d
        except FileNotFoundError:
            pass
        time.sleep(1)
    return ""


arts = [json.loads(l) for l in read_text(os.path.join(HERE, "artifacts.jsonl")).splitlines() if l.strip()]
repos = {r["full_name"]: r for r in json.loads(read_text(os.path.join(HERE, "classified.json")))}
cand = [a for a in arts if a["kind"] == "eaglerforge_mod"]
print("kandidat .js dari artefak:", len(cand))

# ---- pastikan semua punya file lokal (unduh yang belum)
os.makedirs("/tmp/jsdl", exist_ok=True)
need = [a for a in cand if not (a.get("staged") and os.path.exists(a["staged"]))]
print("perlu diunduh:", len(need))


def dl(a):
    u = a.get("url")
    if not u:
        return
    ext = re.sub(r"[^A-Za-z0-9._-]", "_", a["path"])[-60:]
    p = "/tmp/jsdl/" + hashlib.sha1((a["repo"] + a["path"]).encode()).hexdigest()[:12] + "_" + os.path.basename(ext)
    if os.path.exists(p) and os.path.getsize(p) > 0:
        a["local"] = p
        return
    for i in range(2):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as r:
                d = r.read()
            if d:
                open(p, "wb").write(d)
                a["local"] = p
                return
        except Exception:
            time.sleep(1)


for a in cand:
    if a.get("staged") and os.path.exists(a["staged"]):
        a["local"] = a["staged"]
with ThreadPoolExecutor(16) as ex:
    list(ex.map(dl, need))
have = [a for a in cand if a.get("local") and os.path.exists(a["local"])]
print("punya file lokal:", len(have))

# ---- analisa isi
META = {k: re.compile(r"(?:ModAPI|PluginAPI)\.meta\.%s\s*\(\s*[\"'`]([^\"'`]{1,%d})[\"'`]" % (v[0], v[1]))
        for k, v in {"title": (r"(?:title|name)", 90), "description": (r"description", 400),
                     "credits": (r"credits", 140), "version": (r"version", 40)}.items()}
LOADER = re.compile(r"(window\.ModAPI\s*=|ModAPI\.hooks\._rippedMethodKeys\s*=|"
                    r"class ModAPI|ModAPI\s*=\s*\{\s*meta\s*:)")
BUNDLE = re.compile(r"(__webpack_require__|webpackJsonp|var \w+=Object\.defineProperty)")
OBFUSC = re.compile(r"_0x[0-9a-f]{4,}")
BUILDER = re.compile(r"(javascriptGenerator|registerBlock\s*\(|Blockly\.Workspace|"
                     r"categoryPrefix|@param \{Blockly|import registerBlock|"
                     r"PRIMITIVES\[|globalThis\.ModAPIVersion|doEaglerforge|"
                     r"modapi_modloader|modapi_guikit|PatchesRegistry|"
                     r"PRIMITIVES_MARKER_NEVER_MATCH)")

BADPATH = re.compile(r"(^|/)(core|primitives|build|dist|webpack|\.next)/", re.I)
BADFILE = re.compile(r"(^|/)(injector|functions|modloader|modgui|patches|browser|cli|"
                     r"npx_wrapper|backgroundlogger|register|polyfill|runtime|index|main|"
                     r"app|script)\.js$", re.I)
STRIP_COM = re.compile(r"/\*.*?\*/", re.S)
STRIP_LN = re.compile(r"//[^\n]*")
STR_S, STR_Q, STR_T = re.compile(r'"(?:\\.|[^"\\])*"'), re.compile(r"'(?:\\.|[^'\\])*'"), re.compile(r"`(?:\\.|[^`\\])*`", re.S)
WS = re.compile(r"\s+")
TOK = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]{2,}")
APIUSE = re.compile(r"(?:ModAPI|PluginAPI)\.(meta|hooks|reflect|events|network|world|player|"
                    r"client|utils|screen|item|block|require|settings|addEventListener|updateComponent)")
DOMISH = re.compile(r"(document\.createElement|new Audio\s*\(|Minecraft\.\$|"
                    r"window\.addEventListener|onload\s*\(\s*\))")
MODREPO = re.compile(r"(mods?|plugin)", re.I)


_DBG = os.environ.get("DBG_PATH", "")


def _no(why):
    if _DBG and _DBG in _DBG_CUR[0]:
        print(f"      [DBG] ditolak alasan #{why}: {_DBG_CUR[0]}")
    return None


_DBG_CUR = [""]


def analyse(a):
    _DBG_CUR[0] = a.get("path", "")
    raw = open(a["local"], "rb").read()
    if len(raw) < 60 or len(raw) > 3_000_000:
        return _no(1)
    txt = raw.decode("utf-8", "replace")
    old_fmt = bool("EaglerForgeModInfo" in txt or "eaglerforgeModInfo" in txt
                   or "PluginAPI." in txt or "EaglerReborn" in txt
                   or (("==UserScript==" in txt or "unsafeWindow" in txt)
                       and re.search(r"eagler", txt, re.I)))
    dom_only = False
    if "ModAPI." not in txt and not old_fmt:
        if DOMISH.search(txt) and MODREPO.search(a["repo"]):
            dom_only = True
        else:
            return _no(2)
    meta = {k: (rx.search(txt).group(1).strip() if rx.search(txt) else "") for k, rx in META.items()}
    bundleish = bool(BUNDLE.search(txt))
    if not meta["title"] and not old_fmt and not dom_only:
        # tanpa judul: harus jelas memakai API mod, bukan runtime/loader
        if bundleish:
            # bundle mod hasil kompilasi (webpack/esbuild): terima bila kecil,
            # jelas merujuk API mod, dan bukan folder build/dist
            if (len(raw) > 1_200_000 or re.search(r"(^|/)(build|dist)/", a["path"], re.I)
                    or len(re.findall(r"(?:ModAPI|PluginAPI)\.", txt)) < 3):
                return _no(3)
        elif len(APIUSE.findall(txt)) < 1 or LOADER.search(txt):
            return _no(4)
        if len(raw) > 1_500_000:
            return _no(5)
    if OBFUSC.search(txt) and not meta["title"]:
        return _no(6)
    # bukan mod: source generator Blockly / EaglerForgeBuilder, atau runtime loader
    if BUILDER.search(txt):
        return _no(7)
    # bundle hasil kompilasi: boleh kalau kecil & jelas mod, bukan build client
    if BUNDLE.search(txt) or (len(raw) > 100_000 and txt.count("\n") < 12):
        if len(raw) > 1_200_000 or re.search(r"(^|/)(build|dist)/", a["path"], re.I):
            return _no(8)
        if not re.search(r"(ModAPI|PluginAPI)\.", txt):
            return _no(9)
    base = os.path.basename(a["path"])
    # chunk webpack / bundle client (ada css-loader, node_modules, bootstrap webpack)
    if re.search(r"(css-loader|style-loader|node_modules/)", txt) and not meta["title"]:
        return _no(10)
    if re.match(r"^EaglerForge-[a-z0-9]{6,12}\.js$", base, re.I):
        return _no(11)
    if "src/gui_based_mods/handler" in txt:
        return _no(12)
    # file test / mock / bukan mod yang bisa dimuat mandiri
    if re.search(r"(mock-modapi|\.test\.js$|(^|/)tests?/|__tests__|\.spec\.js$)", a["path"], re.I):
        return _no(13)
    if re.search(r"Mock of the EaglerForgeInjector ModAPI", txt):
        return _no(14)
    if (re.search(r"require\(\s*[\"']\.\.?/", txt) and not meta["title"]
            and not BUNDLE.search(txt)):
        return _no(15)
    if BADPATH.search(a["path"]):
        return _no(16)
    if BADFILE.search(a["path"]) and not meta["title"]:
        return _no(17)
    if re.search(r"(^|/)libs?/", a["path"], re.I) and not meta["title"]:
        return _no(18)
    # file yang mendefinisikan API untuk mod lain = bukan mod
    if re.search(r"(^|/)(plugin-api|mod-?api|modapi|api|lib\.[\w.-]+|uwuapi|"
                 r"meteorxstarscript)\.js$", a["path"], re.I) and not meta["title"]:
        return _no(19)
    if re.search(r"(\bfunction\s+\w*[Rr]egister\w*\s*\(|ModAPI\.\w+\s*=\s*function|"
                 r"globalThis\.\w*API\s*=)", txt) and not meta["title"]:
        return _no(20)
    code = STR_T.sub("``", STR_S.sub('""', STR_Q.sub("''", txt)))
    code = STRIP_LN.sub("", STRIP_COM.sub("", code))
    norm = WS.sub("", code)
    toks = frozenset(TOK.findall(norm))
    if len(toks) < (3 if dom_only else 8):
        return _no(21)
    return {"raw": raw, "meta": meta, "sha": hashlib.sha256(raw).hexdigest(),
            "sig": hashlib.sha256(norm.encode("utf-8", "ignore")).hexdigest(),
            "toks": toks, "ntok": len(toks), "bytes": len(raw), "a": a, "old_fmt": old_fmt,
            "dom_only": dom_only}


info = [x for x in (analyse(a) for a in have) if x]
print("valid sebagai mod (berdasarkan isi):", len(info))

# ---- nama & author
def norm(s):
    s = re.sub(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F]", " ", s or "")
    return re.sub(r"[^A-Za-z0-9]+", "", s).lower()


def nice(s, n=58, dflt=""):
    s = re.sub(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F]", "", s or "")
    s = s.replace("|", "-").replace("/", "-").replace("\\", "-").replace(":", "-")
    s = re.sub(r"[^A-Za-z0-9._ +-]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip(" ._+-")
    return s[:n].strip() or dflt


for x in info:
    a = x["a"]
    stem = re.sub(r"^[0-9a-f]{16,20}_", "", re.sub(r"\.js$", "", os.path.basename(a["path"]), flags=re.I))
    x["title"] = nice(x["meta"]["title"], 58) or nice(stem, 58) or nice(a["repo"].split("/")[1], 58)
    cred = x["meta"]["credits"]
    x["author"] = nice(cred, 40) if cred else nice(a["repo"].split("/")[0], 40)
    x["key_name"], x["key_author"] = norm(x["title"]), norm(x["author"])
    x["stars"] = (repos.get(a["repo"]) or {}).get("stargazers_count", 0) or 0
    rn = norm(a["repo"].split("/")[1])
    tn = x["key_name"]
    match = 1 if (tn and (tn in rn or rn in tn or
                          len(set(re.findall(r"[a-z0-9]{4,}", tn)) &
                                  set(re.findall(r"[a-z0-9]{4,}", rn))) > 0)) else 0
    x["repo_match"] = match
    x["quality"] = (match, bool(x["meta"]["title"]) * 4 + bool(cred) * 2 + bool(x["meta"]["description"]),
                    x["stars"], x["bytes"])
    x["also_in"] = []

info.sort(key=lambda x: (-x["quality"][0], -x["quality"][1], -x["quality"][2], -x["quality"][3]))

# dump SEMUA varian valid (unik per isi) supaya versi lain bisa dikelompokkan nanti
_u = {}
for x in info:
    _u.setdefault(x["sha"], x)
json.dump([{"title": x["title"], "author": x["author"], "repo": x["a"]["repo"],
            "path": x["a"]["path"], "bytes": x["bytes"], "sha": x["sha"], "sig": x["sig"],
            "ntok": x["ntok"], "vers": x["meta"]["version"], "credits": x["meta"]["credits"],
            "local": x["a"].get("local"), "url": x["a"].get("url"),
            "dom": x.get("dom_only", False)} for x in _u.values()],
          open(os.path.join(HERE, "all_valid.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("varian valid unik (per isi):", len(_u))

kept, drop = [], collections.Counter()
seen = {"sha": set(), "sig": set(), "name": set(), "na": set()}
by_sha, by_sig = {}, {}
for x in info:
    if x["sha"] in seen["sha"]:
        drop["isi identik (copy persis)"] += 1
        by_sha[x["sha"]].setdefault(x["a"]["repo"], "isi identik"); continue
    if x["sig"] in seen["sig"]:
        drop["kode identik (beda nama/komentar)"] += 1
        by_sig[x["sig"]].setdefault(x["a"]["repo"], "kode identik"); continue
    n = x["ntok"]; copy_of = None
    for b in kept:
        if abs(b["ntok"] - n) > max(60, 0.30 * max(n, b["ntok"])):
            continue
        sim = len(x["toks"] & b["toks"]) / (len(x["toks"] | b["toks"]) or 1)
        same_name = x["key_name"] == b["key_name"]
        same_ver = (x["meta"]["version"] or "") == (b["meta"]["version"] or "")
        if sim >= 0.97:
            copy_of = (b, "salinan hampir identik %.0f%%" % (sim * 100)); break
        if sim >= 0.90 and same_name and same_ver:
            copy_of = (b, "versi sama di repo lain %.0f%%" % (sim * 100)); break
    if copy_of:
        drop["salinan, bukan versi baru"] += 1
        copy_of[0].setdefault("_alts", {})[x["a"]["repo"]] = copy_of[1]
        continue
    seen["sha"].add(x["sha"]); by_sha[x["sha"]] = {}
    seen["sig"].add(x["sig"]); by_sig[x["sig"]] = {}
    x["_alt"] = (by_sha[x["sha"]], by_sig[x["sig"]])
    kept.append(x)

print("DIBUANG:", drop.most_common(), "total:", sum(drop.values()))
print("LOLOS:", len(kept))

shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
used, final = set(), []
for x in kept:
    alt = {}
    for d in x.pop("_alt"):
        alt.update(d)
    alt.update(x.pop("_alts", {}))
    alt.pop(x["a"]["repo"], None)
    x["also_in"] = sorted(alt.items(), key=lambda kv: kv[0])
for x in sorted(kept, key=lambda y: (-y["bytes"], y["title"].lower())):
    base = nice(x["title"], 50, "mod")
    v = nice(x["meta"]["version"], 14)
    owner = x["a"]["repo"].split("/")[0]
    cands = [base] + ([f"{base} {v}"] if v else []) + \
            [f"{base} ({owner})"] + ([f"{base} {v} ({owner})"] if v else [])
    fn = None
    for c in cands:
        f2 = nice(c, 68, "mod") + ".js"
        if f2.lower() not in used:
            fn = f2; break
    if fn is None:
        i = 2
        while True:
            f2 = nice(f"{base} {i}", 68, "mod") + ".js"
            if f2.lower() not in used:
                fn = f2; break
            i += 1
    used.add(fn.lower())
    open(os.path.join(OUT, fn), "wb").write(x["raw"])
    x["file"] = fn; final.append(x)

print("DITULIS:", len(final), "| %.2f MB" % (sum(x["bytes"] for x in final) / 1e6))
au = collections.Counter(x["author"] for x in final)
print("author unik:", len(au), "| author >1 mod:", sum(1 for v in au.values() if v > 1), "|", au.most_common(6))
json.dump([{"file": x["file"], "nama": x["title"], "author": x["author"], "versi": x["meta"]["version"],
            "deskripsi": x["meta"]["description"], "credits": x["meta"]["credits"], "bytes": x["bytes"],
            "format_lama": x["old_fmt"], "sumber": "https://github.com/" + x["a"]["repo"],
            "path_di_repo": x["a"]["path"], "link_langsung": x["a"].get("url"),
            "sha256": x["sha"], "stars_repo": x["stars"],
            "tanpa_modapi": x.get("dom_only", False),
            "juga_ditemukan_di": [{"repo": r, "alasan": w} for r, w in x.get("also_in", [])]}
           for x in final],
          open(os.path.join(HERE, "jsmods_final.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("contoh:")
for x in final[:15]:
    print(f"   {x['bytes']/1024:>7.1f}KB {x['title'][:42]:<42} by {x['author'][:22]:<22} {x['a']['repo'][:26]}")
