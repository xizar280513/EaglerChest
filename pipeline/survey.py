#!/usr/bin/env python3
"""Stream GitHub tarballs of Eaglercraft mod repos, catalogue every mod-like
artifact and stage the small ones for bundling.

Artifacts are classified as:
  eaglerforge_mod  .js containing the ModAPI. marker      (the real "mods")
  resource_pack    .zip with pack.mcmeta / assets/
  shader_pack      .zip/.folder with .fsh/.vsh shaders
  client_build     .jar / single-file .html client
  pack_zip         other .zip that looks like a mod/pack
  other            recorded, never staged
"""
import os, re, sys, json, time, socket, tarfile, hashlib, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

socket.setdefaulttimeout(60)
HERE = os.path.dirname(os.path.abspath(__file__))
STAGE = "/tmp/stage"
ART = os.path.join(HERE, "artifacts.jsonl")
DONE = os.path.join(HERE, "surveyed.txt")
os.makedirs(STAGE, exist_ok=True)

# ---------------- budgets -------------------------------------------------
STREAM_CAP_REPO = int(os.environ.get("CAP_REPO", 320)) * 1024 * 1024   # per repo
STREAM_BUDGET = float(os.environ.get("BUDGET_STREAM_GB", 9)) * 1e9     # total
EXTRACT_BUDGET = int(os.environ.get("BUDGET_EXTRACT_MB", 78)) * 1024 * 1024
TIME_BUDGET = float(os.environ.get("BUDGET_MIN", 11)) * 60
SMALL_FILE = int(os.environ.get("SMALL_FILE_MB", "1")) * 1024 * 1024
TINY_SKIP = 400                     # ignore dust

state = {"stream": 0.0, "extract": 0, "t0": time.time(), "artifacts": 0, "staged": 0}

MODISH = re.compile(r"(client|mod|hack|cheat|shader|texture|resource|pack|utility|"
                    r"essentials|extras|optifine|fps|xray|aura|hud|menu|qol|tweak|"
                    r"forge|inject|launcher|build|release|v\d)", re.I)
SKIPPATH = re.compile(r"(node_modules|/\.git/|/libs?/|\.min\.js|/dist/|/build/tmp|"
                      r"site-packages|/vendor/|\.map$)", re.I)
DANGER = re.compile(r"\.(exe|bat|cmd|com|scr|vbs|vbe|ps1|msi|dll|apk|deb)$", re.I)
# dependency / library jars that are NOT mods
LIBJAR = re.compile(r"(log4j|jna-|jackson|protobuf|gson|guava|lwjgl|netty|paper-|spigot|bukkit|"
                    r"commons-|slf4j|snakeyaml|velocity|bungee|waterfall|massivecore|hppc|jopt|"
                    r"jline|asm-|asm\d|bytecode|servlet|javax|sqlite|mysql|h2-|hikari|caffeine|"
                    r"adventure|brigadier|authlib|realms|text2speech|oshi|javacpp|trove|icu4j|"
                    r"annotations|checker-qual|error_prone|failureaccess|j2objc|listenablefuture|"
                    r"gradle|maven|ant-|junit|hamcrest|mockito|kotlin|scala|jodatime|json-|"
                    r"json-simple|json-smart|accessors|websockets|websocket|tyrus|nv-websocket|"
                    r"tea-vm|teavm|jsoup|httpclient|httpcore|fluent-hc|codec|logging|nashorn|"
                    r"rhino|closure|javassist|cglib|objenesis|reflections|javapoet|auto-|"
                    r"javax\.inject|inject-|aopalliance|plexus|sisu|wagon|aether|jansi|jdom|"
                    r"dom4j|xpp3|xmlpull|kxml|xstream|opencsv|univocity|opencsv|jctools|"
                    r"disruptor|agrona|sbe-|flatbuffers|rocksdb|leveldb|lmdb|zstd|lz4|snappy|"
                    r"brotli|conscrypt|bouncycastle|bcprov|bcpkix|tink|protobuf-javalite|"
                    r"apache-|eclipse-|jboss|netty-|reactive|rsocket|grpc|opentelemetry|"
                    r"micrometer|prometheus|jmx|jcl-over|jul-to|logback|tinylog|reload4j|"
                    r"terminal|jline|jnr|ffi|posix|jffi|jffil|javafx|jogl|gluegen|steamworks|"
                    r"discord-|javacord|jda|okhttp|okio|retrofit|gson-extras|semver|"
                    r"annotations-|jetbrains|checkerframework|findbugs|spotbugs|jsr305|"
                    r"version-|api-|-api\.|core-|-core-|-sources|-javadoc|javadoc|-tests)"
                    , re.I)
LIBPATH = re.compile(r"(/libraries?/|/libs?/|/maven/|/\.gradle/|/\.m2/|/deps?/|/vendor/|"
                     r"/node_modules/|/repository/|/paperclip|/plugins?/(?!.*client)|/jars?/lib)", re.I)


def read_text(path, tries=12):
    for _ in range(tries):
        try:
            with open(path, encoding="utf-8") as f:
                d = f.read()
            if d:
                return d
        except FileNotFoundError:
            pass
        time.sleep(1.0)
    return ""


class CountingStream:
    def __init__(self, resp, cap):
        self.r, self.cap, self.n = resp, cap, 0

    def read(self, k=-1):
        if self.n >= self.cap:
            return b""
        b = self.r.read(k)
        self.n += len(b) if b else 0
        return b


def classify_path(name, size, repo_modish=False):
    low = name.lower()
    ext = low.rsplit(".", 1)[-1] if "." in low.rsplit("/", 1)[-1] else ""
    if SKIPPATH.search(low) or DANGER.search(low):
        return "skip", ""
    if ext == "js":
        return "maybe_jsmod", ""
    if ext == "zip":
        if re.search(r"(shader)", low):
            return "shader_pack", "zip"
        if re.search(r"(texture|resource|pack|faithful|sphax|vanilla tweak)", low):
            return "resource_pack", "zip"
        if MODISH.search(low):
            return "pack_zip", "zip"
        return "skip", "zip"
    if ext == "jar":
        base = os.path.basename(low)
        if LIBJAR.search(base) or LIBPATH.search(low):
            return "skip", "jar"
        if size and size < 20_000:
            return "skip", "jar"
        return "client_build", "jar"
    if ext == "html" and size and size > 900_000 and (
            MODISH.search(os.path.basename(low))
            or re.search(r"/(clients?|builds?|mods?|releases?|offline)/", low)
            or repo_modish):
        return "client_build", "html"
    if ext in ("mcpack", "mcaddon", "mcworld"):
        return "resource_pack", ext
    return "skip", ext


def safe_name(s, n=90):
    s = re.sub(r"[^A-Za-z0-9._ -]+", "_", s).strip(" ._")
    return s[:n] or "file"


def process(repo, rank):
    """Stream one repo's tarball; return list of artifact dicts."""
    owner_name = repo["full_name"]
    rmeta = (owner_name + " " + (repo.get("description") or "")).lower()
    repo_modish = bool(MODISH.search(rmeta)) and not re.search(
        r"(\bserver\b|hosting|relay|proxy|docker|deploy|website|vanilla)", rmeta)
    branch = repo.get("default_branch") or "main"
    out = []
    for br in [branch, "main", "master"]:
        url = f"https://codeload.github.com/{owner_name}/tar.gz/refs/heads/{urllib.parse.quote(br)}"
        try:
            resp = urllib.request.urlopen(
                urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}))
        except Exception:
            continue
        cs = CountingStream(resp, STREAM_CAP_REPO)
        try:
            tf = tarfile.open(fileobj=cs, mode="r|gz")
        except Exception as e:
            state["stream"] += cs.n
            continue
        prefix = None
        got = 0
        try:
            for m in tf:
                if state["stream"] + cs.n > STREAM_BUDGET or time.time() - state["t0"] > TIME_BUDGET:
                    break
                if not m.isfile():
                    continue
                if prefix is None:
                    prefix = m.name.split("/", 1)[0] + "/"
                rel = m.name[len(prefix):] if prefix and m.name.startswith(prefix) else m.name
                if not rel or rel.startswith(".git/"):
                    continue
                kind, ext = classify_path(rel, m.size, repo_modish)
                if kind == "skip":
                    continue
                blob = None
                if kind == "maybe_jsmod":
                    if not m.size or m.size > 2_500_000 or m.size < TINY_SKIP:
                        continue
                    try:
                        blob = tf.extractfile(m).read()
                    except Exception:
                        continue
                    if not (b"ModAPI." in blob or b"PluginAPI." in blob
                            or b"EaglerForgeModInfo" in blob
                            or b"eaglerforge" in blob.lower()):
                        continue                      # not an EaglerForge mod
                    kind = "eaglerforge_mod"
                    if state["extract"] + len(blob) > EXTRACT_BUDGET:
                        blob = None
                elif kind in ("resource_pack", "shader_pack", "pack_zip", "client_build"):
                    if m.size and m.size <= SMALL_FILE and state["extract"] + m.size < EXTRACT_BUDGET:
                        try:
                            blob = tf.extractfile(m).read()
                        except Exception:
                            blob = None
                        if blob and state["extract"] + len(blob) > EXTRACT_BUDGET:
                            blob = None
                if blob:
                        h = hashlib.sha256(blob).hexdigest()[:16]
                        d = os.path.join(STAGE, f"{rank:04d}_{safe_name(owner_name.replace('/', '__'))}")
                        os.makedirs(d, exist_ok=True)
                        p = os.path.join(d, f"{h}_{safe_name(os.path.basename(rel))}")
                        if not os.path.exists(p):
                            with open(p, "wb") as g:
                                g.write(blob)
                            state["extract"] += len(blob)
                            state["staged"] += 1
                        out.append({"repo": owner_name, "rank": rank, "path": rel,
                                    "size": m.size, "kind": kind, "sha": h,
                                    "staged": p, "branch": br,
                                    "url": f"https://raw.githubusercontent.com/{owner_name}/{br}/{urllib.parse.quote(rel)}"})
                else:
                    out.append({"repo": owner_name, "rank": rank, "path": rel,
                                "size": m.size or 0, "kind": kind, "sha": None,
                                "staged": None, "branch": br,
                                "url": f"https://raw.githubusercontent.com/{owner_name}/{br}/{urllib.parse.quote(rel)}"})
                got += 1
                if got > 4000:
                    break
        except Exception as e:
            pass
        finally:
            state["stream"] += cs.n
            try:
                tf.close()
            except Exception:
                pass
            try:
                resp.close()
            except Exception:
                pass
        if out:
            return out
    return out


def main():
    repos = json.loads(read_text(os.path.join(HERE, "classified.json")))
    done = set(read_text(DONE).split())
    mode = os.environ.get("SCAN_MODE", "scored")
    sz = lambda r: (r.get("size") or 0)
    if mode == "small":
        lo = int(os.environ.get("SMALL_LO_KB", 80))
        hi = int(os.environ.get("SMALL_HI_MB", 12)) * 1024
        cand = [r for r in repos if lo < sz(r) <= hi]
    else:
        cand = [r for r in repos if r["_score"] >= 1 and sz(r) > 64]
    # high score first, then biggest repo first (user asked: largest sources first)
    if os.environ.get("SORT_ASC"):
        cand.sort(key=lambda r: (r.get("size") or 0))
    else:
        cand.sort(key=lambda r: (-r["_score"], -(r.get("size") or 0)))
    only = os.environ.get("REPOS_ONLY", "")
    if only:
        want = set(x.strip() for x in only.split(",") if x.strip())
        cand = [r for r in repos if r["full_name"] in want]
        todo = cand[: int(os.environ.get("MAXREPOS", 400))]
    else:
        todo = [r for r in cand if r["full_name"] not in done][: int(os.environ.get("MAXREPOS", 400))]
    print(f"candidates={len(cand)} already_done={len(done)} todo_this_run={len(todo)}", flush=True)

    lock_writes = []
    with open(ART, "a", encoding="utf-8") as fa, open(DONE, "a", encoding="utf-8") as fd:
        def run(item):
            i, r = item
            t = time.time()
            try:
                arts = process(r, i)
            except Exception as e:
                arts = []
                print(f"  !! {r['full_name']}: {str(e)[:90]}", flush=True)
            for a in arts:
                a["repo_size_kb"] = r.get("size")
                a["repo_desc"] = (r.get("description") or "")[:200]
                fa.write(json.dumps(a, ensure_ascii=False) + "\n")
            fa.flush()
            fd.write(r["full_name"] + "\n")
            fd.flush()
            state["artifacts"] += len(arts)
            kinds = {}
            for a in arts:
                kinds[a["kind"]] = kinds.get(a["kind"], 0) + 1
            print(f"[{i:>4}] {r['full_name'][:44]:<44} {(r.get('size') or 0)/1024:>8.1f}MB "
                  f"-> {len(arts):>4} art {kinds if len(arts)<40 else ''} "
                  f"({time.time()-t:.0f}s) stream={state['stream']/1e9:.2f}GB "
                  f"staged={state['extract']/1e6:.1f}MB/{state['staged']}f", flush=True)
            return len(arts)

        with ThreadPoolExecutor(int(os.environ.get("WORKERS", 4))) as ex:
            list(ex.map(run, enumerate(todo, 1)))

    print(f"DONE artifacts={state['artifacts']} staged_files={state['staged']} "
          f"staged_MB={state['extract']/1e6:.1f} streamed_GB={state['stream']/1e9:.2f} "
          f"elapsed={(time.time()-state['t0'])/60:.1f}min", flush=True)


if __name__ == "__main__":
    main()
