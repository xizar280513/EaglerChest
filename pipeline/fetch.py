#!/usr/bin/env python3
"""Download the remaining small mod files so as many mods as possible end up
inside the final zip.  Big offline clients stay catalogue-only (link + script)."""
import os, re, json, time, socket, hashlib, urllib.request, urllib.parse, collections
from concurrent.futures import ThreadPoolExecutor

socket.setdefaulttimeout(60)
HERE = os.path.dirname(os.path.abspath(__file__))
STAGE = "/tmp/stage2"
os.makedirs(STAGE, exist_ok=True)

WANT_MB = float(os.environ.get("WANT_MB", 300))
state = {"bytes": 0, "n": 0, "t0": time.time()}
LIMIT_S = (WANT_MB * 1024 * 1024)


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


mods = json.loads(read_text(os.path.join(HERE, "mods_final.json")))

# ---- re-tier: separate real offline clients from launcher pages, drop base game
BASEGAME = re.compile(r"(offline_signed_client|eaglercraftx_1_?8_offline|eaglercraftl_1\.9|"
                      r"eaglercraft_1\.\d+_\w*offline|vanilla)", re.I)
for m in mods:
    if m["tier"] == "client_html":
        if BASEGAME.search(m["name"]) or BASEGAME.search(os.path.basename(m["path"])):
            m["tier"] = "base_game"
        elif m["size"] >= 8_000_000:
            m["tier"] = "client_offline"
        else:
            m["tier"] = "launcher_page"
    if m["tier"] == "client_jar" and re.search(r"(eaglermotd|originblacklist|sp-relay|relay|"
                                               r"websocket|webrtc|-rpc|backend)", m["name"], re.I):
        m["tier"] = "server_tool"

print("retiered:", collections.Counter(m["tier"] for m in mods).most_common())

# ---- what to fetch
def want(m):
    t, s = m["tier"], m["size"] or 0
    if m.get("staged_path") and os.path.exists(m["staged_path"]):
        return 0                                   # already have it
    if t == "js_mod":
        return 1 if s <= 3_000_000 else 0
    if t in ("shader_pack", "resource_pack", "pack_zip"):
        return 2 if s <= 6_000_000 else 0
    if t in ("client_jar", "server_tool"):
        return 3 if s <= 5_000_000 else 0
    if t == "launcher_page":
        return 4 if s <= 2_500_000 else 0
    return 0


todo = [m for m in mods if want(m)]
todo.sort(key=lambda m: (want(m), m["size"] or 0))
print("to fetch:", len(todo), "| MB %.1f" % (sum(m["size"] or 0 for m in todo) / 1e6))


def clean(s, n=60):
    s = re.sub(r"[^A-Za-z0-9._ +-]+", "_", s or "").strip(" ._")
    return s[:n] or "file"


def fetch(m):
    url = m.get("url")
    if not url:
        return None
    if state["bytes"] > LIMIT_S or time.time() - state["t0"] > float(os.environ.get("BUDGET_MIN", 9)) * 60:
        return None
    ext = os.path.splitext(m["path"])[1] or ".bin"
    dest = os.path.join(STAGE, f"{clean(m['name'],48)}__{m['repo'].replace('/','_')[:28]}{ext}")
    if os.path.exists(dest) and os.path.getsize(dest) == (m["size"] or -1):
        m["staged_path"] = dest
        return m
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as r:
                data = r.read()
            if not data:
                return None
            with open(dest, "wb") as f:
                f.write(data)
            m["staged_path"] = dest
            m["full_sha"] = hashlib.sha256(data).hexdigest()[:20]
            m["size"] = len(data)
            state["bytes"] += len(data)
            state["n"] += 1
            return m
        except Exception as e:
            if attempt == 2:
                m["fetch_error"] = str(e)[:80]
            time.sleep(1.5)
    return None


ok = 0
with ThreadPoolExecutor(int(os.environ.get("WORKERS", 10))) as ex:
    for i, r in enumerate(ex.map(fetch, todo), 1):
        if r:
            ok += 1
        if i % 50 == 0:
            print(f"  ...{i}/{len(todo)} fetched={ok} {state['bytes']/1e6:.1f}MB "
                  f"{time.time()-state['t0']:.0f}s", flush=True)

print(f"FETCH DONE ok={ok} bytes={state['bytes']/1e6:.1f}MB elapsed={(time.time()-state['t0'])/60:.1f}min")

have = [m for m in mods if m.get("staged_path") and os.path.exists(m["staged_path"])]
print("mods with a local file now:", len(have),
      "| MB %.1f" % (sum(os.path.getsize(m["staged_path"]) for m in have) / 1e6))
print("by tier:", collections.Counter(m["tier"] for m in have).most_common())

# de-dupe again on real content hashes
seen, uniq = {}, []
for m in mods:
    if m.get("staged_path") and m.get("full_sha"):
        if m["full_sha"] in seen:
            continue
        seen[m["full_sha"]] = m
    uniq.append(m)
print("after content dedupe:", len(uniq), collections.Counter(m["tier"] for m in uniq).most_common())
json.dump(uniq, open(os.path.join(HERE, "mods_v2.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("saved mods_v2.json")
