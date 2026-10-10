#!/usr/bin/env python3
"""Classify harvested GitHub repos into Eaglercraft mod/client/pack sources.

NOTE: the sandbox lazily materialises snapshot files, so every read is retried
until it returns real bytes.
"""
import json, time, collections, os

HERE = os.path.dirname(os.path.abspath(__file__))


def read_text(path, tries=10):
    for i in range(tries):
        try:
            with open(path, encoding="utf-8") as f:
                data = f.read()
            if data:
                return data
        except FileNotFoundError:
            pass
        time.sleep(1.0)
    raise SystemExit("cannot read " + path)


def load_jsonl(path):
    return [json.loads(l) for l in read_text(path).splitlines() if l.strip()]


rows = load_jsonl(os.path.join(HERE, "repos.jsonl"))

MOD_W = ["client", "mod", "hack", "cheat", "xray", "x-ray", "shader", "texture",
         "resource pack", "resourcepack", "pack", "launcher", "utility", "utilities",
         "inject", "forge", "hud", "pvp", "qol", "tweak", "addon", "add-on", "plugin",
         "overlay", "menu", "essentials", "extras", "archive", "collection", "bundle",
         "optifine", "sodium", "fps", "reach", "killaura", "aura", "fly", "freecam"]
BAD_W = ["host", "server", "deploy", "vercel", "netlify", "replit", "template",
         "proxy", "website", "tutorial", "guide", "instructions", "how to",
         "unblocked", "bypass", "discord", "backend", "workspace",
         "source code for eaglercraft", "mirror", "dmca"]


def blob(r):
    return " ".join([r["full_name"], r.get("description") or "",
                     " ".join(r.get("topics") or []), r.get("homepage") or ""]).lower()


def classify(r):
    b = blob(r)
    score, hits = 0, []
    for w in MOD_W:
        if w in b:
            score += 2
            hits.append(w)
    bad = [w for w in BAD_W if w in b]
    score -= len(bad)
    if r.get("archived"):
        score -= 1
    if (r.get("size") or 0) <= 64:
        score -= 10
    if not (r.get("description") or "").strip() and not (r.get("topics") or []):
        score -= 2
    if r["full_name"].lower().endswith(".github.io") and "client" not in b and "mod" not in b:
        score -= 2
    return score, hits, bad


for r in rows:
    r["_score"], r["_hits"], r["_bad"] = classify(r)

rows.sort(key=lambda r: (-r["_score"], -(r.get("size") or 0)))
print("total repos:", len(rows))
print("score distribution:", collections.Counter(max(-9, r["_score"]) for r in rows).most_common())
pos = [r for r in rows if r["_score"] >= 3 and (r.get("size") or 0) > 64]
print("strong candidates (score>=3, non-empty):", len(pos))
mid = [r for r in rows if 1 <= r["_score"] <= 2 and (r.get("size") or 0) > 64]
print("weak candidates (score 1-2, non-empty):", len(mid))

print("\nTop 30 strong candidates by size:")
for r in sorted(pos, key=lambda x: -(x.get("size") or 0))[:30]:
    print(f"  s={r['_score']:>2} {r['size']:>9}KB {r['full_name'][:46]:<46} {r['_hits'][:3]}")

print("\nSample weak candidates:")
for r in sorted(mid, key=lambda x: -(x.get("size") or 0))[:15]:
    print(f"  s={r['_score']} {r['size']:>8}KB {r['full_name'][:46]:<46} {r['_hits'][:3]} bad={r['_bad'][:2]}")

with open(os.path.join(HERE, "classified.json"), "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False)
print("\nsaved classified.json")
