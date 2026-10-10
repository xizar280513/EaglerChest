#!/usr/bin/env python3
"""Build the clean Eaglercraft mod catalogue.

For every staged file we look *inside* it to validate the type and pull out the
real mod name / author / description, so the catalogue is not just filenames.
"""
import os, re, json, time, hashlib, zipfile, collections

HERE = os.path.dirname(os.path.abspath(__file__))


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
print("raw artifacts:", len(arts))

# ------------------------------------------------------------- blocklists
RUNTIME_JS = re.compile(r"(^|/)(modapi|modloader|modgui|modguihandler|browser|cli|npx_wrapper|"
                        r"backgroundlogger|sw|service-worker|serviceworker|register|index|main|"
                        r"app|script|home|generate|bundle|webpack|runtime|polyfill|inject|"
                        r"injector|eaglerforge|eaglerforge-[a-z0-9]{6,}|mod|mods|plugin|"
                        r"workbox|precache)\.js$", re.I)
CHUNK_JS = re.compile(r"(eaglerforge-[a-z0-9]{6,12}\.js$|\.chunk\.js$|\.bundle\.js$|"
                      r"[0-9a-f]{8,}\.js$)", re.I)
BADDIR = re.compile(r"/(out|build|dist|libs?|node_modules|\.next|webpack|target|classes)/", re.I)
LIBJAR = re.compile(r"(log4j|jna-|jackson|protobuf|gson|guava|lwjgl|netty|paper-|spigot|bukkit|"
                    r"commons-|slf4j|snakeyaml|velocity|bungee|waterfall|massivecore|hppc|jopt|"
                    r"jline|asm-|servlet|javax|sqlite|mysql|hikari|caffeine|adventure|brigadier|"
                    r"authlib|realms|text2speech|oshi|javacpp|trove|icu4j|checker-qual|error_prone|"
                    r"failureaccess|j2objc|listenablefuture|gradle|maven|junit|hamcrest|mockito|"
                    r"kotlin|scala|json-|json-simple|json-smart|accessors|websocket|tyrus|"
                    r"teavm|tea-vm|jsoup|httpclient|httpcore|nashorn|rhino|closure|javassist|"
                    r"cglib|objenesis|reflections|javapoet|aopalliance|plexus|sisu|wagon|aether|"
                    r"jansi|jdom|dom4j|xpp3|xmlpull|kxml|xstream|opencsv|univocity|jctools|"
                    r"disruptor|agrona|flatbuffers|rocksdb|leveldb|lmdb|zstd|lz4|snappy|brotli|"
                    r"conscrypt|bouncycastle|bcprov|bcpkix|tink|apache-|eclipse-|jboss|reactive|"
                    r"rsocket|grpc-|opentelemetry|micrometer|prometheus|jcl-over|jul-to|logback|"
                    r"tinylog|reload4j|jnr-|ffi|posix|jogl|gluegen|discord-|javacord|jda-|"
                    r"okhttp|okio|retrofit|semver|jetbrains|jsr305|-sources\.jar|-javadoc|"
                    r"webrtc|-tests\.jar|annotations-)", re.I)
LIBPATH = re.compile(r"(/libraries?/|/libs?/|/maven/|/\.gradle/|/\.m2/|/deps?/|/vendor/|"
                     r"/node_modules/|/repository/|/paperclip|/wrapper/)", re.I)
NONMOD = re.compile(r"(^|/)(package|web|minified-web|plugin_download|relay_download|"
                    r"sp-relay|eaglermotd|originblacklist|blacklist|motd|relay|proxy|backend|"
                    r"server|websocket|download|assets|static|favicon|logo|icon|screenshot|"
                    r"banner|preview|thumb|cover|wallpaper)", re.I)
BASEGAME = re.compile(r"(eaglercraftx?_1\.(5|8|12)|offline_signed_client|vanilla|"
                      r"offline_download|wasm-?gc_offline|eaglercraft\.dev_(alpha|beta|classic|"
                      r"indev)|eaglerforge_(v1|prerelease|1\.)|browsercraft|webcraft|"
                      r"eaglercraft_1\.\d+|singleplayer_1\.)", re.I)
CLIENTNAME = re.compile(r"(client|mod|hack|cheat|astra|shadow|death|dragon|kitten|meteor|tuff|"
                        r"pixel|resent|legend|mega|uwu|starlike|galactic|green|percision|"
                        r"precision|macers?|auto|gaius|fushia|treasure|flame|lume|x-strike|"
                        r"n0va|zeta|infinity|silicon|nit|odd|pi-|skid|lynx|nebula|rise|"
                        r"waterbucket|bounty|hyper|aurora|phantom|phantasm|vape|wurst|"
                        r"impact|liquidbounce|jello|rise|novoline|skid|solar|aether|"
                        r"justin|band|nuker|reach|aura|xray|penguin|cube|mine|2d|ir_)", re.I)


def sha20(path):
    try:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for c in iter(lambda: f.read(1 << 20), b""):
                h.update(c)
        return h.hexdigest()[:20]
    except Exception:
        return None


META_TITLE = re.compile(r"ModAPI\.meta\.(?:title|name)\s*\(\s*[\"'`]([^\"'`]{1,80})[\"'`]")
META_DESC = re.compile(r"ModAPI\.meta\.description\s*\(\s*[\"'`]([^\"'`]{1,200})[\"'`]")
META_CRED = re.compile(r"ModAPI\.meta\.credits\s*\(\s*[\"'`]([^\"'`]{1,120})[\"'`]")
META_VER = re.compile(r"ModAPI\.meta\.version\s*\(\s*[\"'`]([^\"'`]{1,30})[\"'`]")


def inspect_js(path):
    """Return (ok, meta) - a real EaglerForge mod must talk to ModAPI.meta."""
    try:
        with open(path, "rb") as f:
            head = f.read(300_000)
    except Exception:
        return False, {}
    txt = head.decode("utf-8", "replace")
    meta = {}
    for rx, key in ((META_TITLE, "title"), (META_DESC, "description"),
                    (META_CRED, "credits"), (META_VER, "version")):
        m = rx.search(txt)
        if m:
            meta[key] = m.group(1).strip()
    ok = ("ModAPI." in txt) and bool(meta.get("title") or re.search(r"ModAPI\.(hooks|reflect|events|meta)", txt))
    return ok, meta


def inspect_zip(path):
    try:
        with zipfile.ZipFile(path) as z:
            names = z.namelist()
    except Exception:
        return "broken", []
    low = [n.lower() for n in names]
    if any(n.endswith("pack.mcmeta") for n in low):
        return ("shader_pack" if any("/shaders/" in n or n.startswith("shaders/") for n in low)
                else "resource_pack"), names
    if any(n.endswith((".fsh", ".vsh", ".glsl")) for n in low):
        return "shader_pack", names
    if any(n.endswith(".class") or n.endswith("mod.info") or "mods/" in " ".join(low[:50]) for n in low):
        return "jar_mod", names
    if any(n.endswith((".html", ".js")) for n in low):
        return "web_bundle", names
    return "zip_unknown", names


out = []
stats = collections.Counter()
for a in arts:
    p, low, base = a["path"], a["path"].lower(), os.path.basename(a["path"]).lower()
    tier = a["kind"]
    meta = {}
    staged = a.get("staged") if a.get("staged") and os.path.exists(a.get("staged")) else None

    if tier == "eaglerforge_mod":
        if RUNTIME_JS.search(low) or CHUNK_JS.search(base) or BADDIR.search(low):
            stats["drop_js_runtime"] += 1
            continue
        if staged:
            ok, meta = inspect_js(staged)
            if not ok:
                stats["drop_js_notamod"] += 1
                continue
            tier = "js_mod"
        else:
            if base in ("index.js", "main.js", "app.js", "script.js"):
                stats["drop_js_generic"] += 1
                continue
            tier = "js_mod"
    elif tier in ("resource_pack", "shader_pack", "pack_zip"):
        if NONMOD.search(base):
            stats["drop_pack_nonmod"] += 1
            continue
        if staged:
            kind2, names = inspect_zip(staged)
            if kind2 in ("resource_pack", "shader_pack"):
                tier = kind2
            elif kind2 == "jar_mod":
                tier = "client_jar"
            elif kind2 == "broken":
                stats["drop_zip_broken"] += 1
                continue
            else:
                if tier != "pack_zip":
                    stats["drop_zip_unknown"] += 1
                    continue
                tier = "pack_zip"
        else:
            tier = {"resource_pack": "resource_pack", "shader_pack": "shader_pack"}.get(tier, "pack_zip")
    elif tier == "client_build":
        if base.endswith(".jar"):
            if LIBJAR.search(base) or LIBPATH.search(low) or a["size"] < 30_000 or NONMOD.search(base):
                stats["drop_jar_lib"] += 1
                continue
            tier = "client_jar"
        elif base.endswith(".html"):
            if BASEGAME.search(base) and not CLIENTNAME.search(base):
                stats["drop_html_basegame"] += 1
                continue
            if a["size"] < 700_000:
                stats["drop_html_small"] += 1
                continue
            tier = "client_html"
        else:
            stats["drop_other"] += 1
            continue
    else:
        stats["drop_other"] += 1
        continue

    a["tier"] = tier
    a["meta"] = meta
    a["staged_path"] = staged
    a["full_sha"] = sha20(staged) if staged else None
    out.append(a)

print("after filtering:", len(out))
print("drops:", stats.most_common())

# ------------------------------------------------------------- dedupe
by = {}
for a in out:
    key = ("sha:" + a["full_sha"]) if a.get("full_sha") else \
          ("ns:" + os.path.basename(a["path"]).lower() + ":" + str(a["size"]))
    cur = by.get(key)
    if cur is None:
        by[key] = a
    elif a.get("staged_path") and not cur.get("staged_path"):
        by[key] = a
mods = list(by.values())
print("distinct mods:", len(mods), collections.Counter(m["tier"] for m in mods).most_common())

# ------------------------------------------------------------- naming
def clean(s, n=52):
    s = re.sub(r"^[0-9a-f]{16,20}_", "", s or "")
    s = re.sub(r"[^A-Za-z0-9 ._+-]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip(" ._+-")
    return s[:n] or "mod"


used = collections.Counter()
for m in mods:
    meta = m.get("meta") or {}
    if meta.get("title"):
        nm = clean(meta["title"])
    else:
        base = os.path.basename(m["path"])
        stem = re.sub(r"\.(js|jar|zip|html|mcpack|mcaddon)$", "", base, flags=re.I)
        stem = re.sub(r"^[0-9a-f]{16,20}_", "", stem)
        if stem.lower() in ("index", "offline", "main", "app", "script", "download",
                            m["repo"].split("/")[1].lower()):
            stem = m["repo"].split("/")[1]
        nm = clean(stem)
    m["name"] = nm
    used[nm.lower()] += 1

for m in mods:
    if used[m["name"].lower()] > 1:
        owner, rn = m["repo"].split("/")
        m["name"] = clean(f"{m['name']} [{owner}]", 60)

# re-dedupe identical names coming from different files (keep both, suffix)
used2 = collections.Counter()
for m in sorted(mods, key=lambda x: -x["size"]):
    used2[m["name"].lower()] += 1
    if used2[m["name"].lower()] > 1:
        m["name"] = clean(f"{m['name']} v{used2[m['name'].lower()]}", 60)

mods.sort(key=lambda m: (-(m.get("repo_size_kb") or 0), -m["size"]))
json.dump(mods, open(os.path.join(HERE, "mods_final.json"), "w", encoding="utf-8"), ensure_ascii=False)

print("\nsaved mods_final.json")
print("with bundled file:", sum(1 for m in mods if m.get("staged_path")))
print("staged MB: %.1f" % (sum(os.path.getsize(m["staged_path"]) for m in mods if m.get("staged_path")) / 1e6))
print("source repos:", len(set(m["repo"] for m in mods)))
print("\nsample js mods with extracted metadata:")
for m in [x for x in mods if x["tier"] == "js_mod" and x.get("meta", {}).get("title")][:15]:
    print(f"   {m['name'][:34]:<34} | {(m['meta'].get('credits') or '')[:26]:<26} | {m['repo'][:28]}")
print("\ntop 12 by source size:")
for m in mods[:12]:
    print(f"   {(m.get('repo_size_kb') or 0)/1024:>8.1f}MB src | {m['size']/1e6:>6.2f}MB | {m['tier']:<13} | {m['name'][:38]:<38} | {m['repo'][:26]}")
