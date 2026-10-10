#!/usr/bin/env python3
"""Scan the user-supplied repos, pull every EaglerForge .js candidate into
artifacts.jsonl so extract_js2.py can validate + de-dupe them against the
existing set. Also records repo metadata for the provenance files."""
import os, re, json, time, socket, tarfile, hashlib, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

socket.setdefaulttimeout(60)
HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(HERE, "artifacts.jsonl")
EXTRA = "/tmp/extra"
os.makedirs(EXTRA, exist_ok=True)

TARGETS = [(x, None) for x in open("/tmp/targets.txt").read().split() if x.strip()]

H = {"User-Agent": "Mozilla/5.0"}
MARK = re.compile(rb"(ModAPI\.|PluginAPI\.|EaglerForgeModInfo|eaglerforge|EaglerReborn|==UserScript==)", re.I)
DOMISH = re.compile(rb"(document\.createElement|new Audio|Minecraft\.|onload\s*\()")
SKIP = re.compile(r"(node_modules|\.min\.js|/primitives/)", re.I)


def rt(p, t=12):
    for _ in range(t):
        try:
            d = open(p, encoding="utf-8").read()
            if d:
                return d
        except FileNotFoundError:
            pass
        time.sleep(1)
    return ""


def gh_meta(repo):
    try:
        r = urllib.request.urlopen(urllib.request.Request(
            "https://api.github.com/repos/" + repo, headers=dict(H, **{"Accept": "application/vnd.github+json"})), timeout=30)
        d = json.loads(r.read().decode())
        lic = d.get("license") or {}
        return {"full_name": d["full_name"], "html_url": d["html_url"],
                "description": d.get("description"), "size": d.get("size"),
                "stargazers_count": d.get("stargazers_count"), "forks_count": d.get("forks_count"),
                "language": d.get("language"), "created_at": d.get("created_at"),
                "pushed_at": d.get("pushed_at"), "updated_at": d.get("updated_at"),
                "archived": d.get("archived"), "fork": d.get("fork"),
                "default_branch": d.get("default_branch"),
                "license": (lic.get("spdx_id") if isinstance(lic, dict) else None),
                "topics": d.get("topics") or [], "homepage": d.get("homepage"),
                "open_issues_count": d.get("open_issues_count"), "has_pages": d.get("has_pages"),
                "_score": 6, "_hits": ["user-supplied"], "_bad": []}
    except Exception as e:
        print("   meta err", repo, str(e)[:70])
        return None


class Counted:
    def __init__(self, r, cap):
        self.r, self.cap, self.n = r, cap, 0

    def read(self, k=-1):
        if self.n >= self.cap:
            return b""
        b = self.r.read(k)
        self.n += len(b) if b else 0
        return b


def scan(repo, ref):
    metas = []
    branches = [ref] if ref else []
    m = gh_meta(repo)
    if m:
        metas.append(m)
        if not ref:
            branches = [m["default_branch"], "main", "master"]
    if not branches:
        branches = ["main", "master"]
    found = []
    for br in branches:
        url = f"https://codeload.github.com/{repo}/tar.gz/{br if len(br) == 40 else 'refs/heads/' + urllib.parse.quote(br)}"
        try:
            resp = urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=90)
        except Exception:
            continue
        cs = Counted(resp, 700 * 1024 * 1024)
        try:
            tf = tarfile.open(fileobj=cs, mode="r|gz")
        except Exception:
            continue
        prefix = None
        try:
            for e in tf:
                if not e.isfile():
                    continue
                if prefix is None:
                    prefix = e.name.split("/", 1)[0] + "/"
                rel = e.name[len(prefix):] if prefix and e.name.startswith(prefix) else e.name
                base = os.path.basename(rel)
                extless = "." not in base
                if SKIP.search(rel) or not (rel.lower().endswith((".js", ".mjs")) or extless):
                    continue
                if rel.lower().endswith((".ts", ".json", ".md", ".css", ".png", ".ico", ".yml")):
                    continue
                if not e.size or e.size > 3_000_000 or e.size < 60:
                    continue
                try:
                    data = tf.extractfile(e).read()
                except Exception:
                    continue
                head = data[:400000]
                if not (MARK.search(head) or ("mod" in repo.lower() and DOMISH.search(head))):
                    continue
                h = hashlib.sha256(data).hexdigest()[:16]
                p = os.path.join(EXTRA, h + "_" + re.sub(r"[^A-Za-z0-9._-]", "_", os.path.basename(rel))[:60])
                if not os.path.exists(p):
                    open(p, "wb").write(data)
                found.append({"repo": repo, "rank": 0, "path": rel, "size": e.size,
                              "kind": "eaglerforge_mod", "sha": h, "staged": p, "branch": br,
                              "url": f"https://raw.githubusercontent.com/{repo}/{br}/{urllib.parse.quote(rel)}",
                              "repo_size_kb": (m or {}).get("size"),
                              "repo_desc": ((m or {}).get("description") or "")[:200]})
        except Exception as ex:
            pass
        finally:
            try:
                tf.close()
            except Exception:
                pass
            try:
                resp.close()
            except Exception:
                pass
        if found:
            break
    return found, metas


existing = {}
for line in rt(ART).splitlines():
    if not line.strip():
        continue
    try:
        a = json.loads(line)
    except Exception:
        continue
    existing[(a.get("repo"), a.get("path"))] = a

classified = json.loads(rt(os.path.join(HERE, "classified.json")))
have_repo = {r["full_name"].lower() for r in classified}

new_arts, new_metas = [], []
for repo, ref in TARGETS:
    was = repo.lower() in have_repo
    surveyed = repo in set(rt(os.path.join(HERE, "surveyed.txt")).split())
    found, metas = scan(repo, ref)
    dup = sum(1 for f in found if (f["repo"], f["path"]) in existing)
    add = [f for f in found if (f["repo"], f["path"]) not in existing]
    new_arts += add
    for mm in metas:
        if mm["full_name"].lower() not in have_repo:
            new_metas.append(mm)
            have_repo.add(mm["full_name"].lower())
    print(f"{repo:<42} ref={'commit' if ref else 'default'} | sudah_dipanen={was} "
          f"sudah_dipindai={surveyed} | .js kandidat={len(found)} baru={len(add)} (dup artefak={dup})")

with open(ART, "a", encoding="utf-8") as f:
    for a in new_arts:
        f.write(json.dumps(a, ensure_ascii=False) + "\n")
if new_metas:
    with open(os.path.join(HERE, "classified.json"), "w", encoding="utf-8") as f:
        json.dump(classified + new_metas, f, ensure_ascii=False)
print(f"\nartefak baru ditambahkan: {len(new_arts)} | repo metadata baru: {len(new_metas)}")
