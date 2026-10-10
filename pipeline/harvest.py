#!/usr/bin/env python3
"""Recursively enumerate every GitHub repository mentioning eaglercraft-related keywords.

GitHub's search API caps any single query at 1000 results, so we split by `created:`
date ranges until each slice is <= 1000, then paginate it fully.
Results are appended to repos.jsonl (dedup on load), so runs are resumable.
"""
import urllib.request, urllib.parse, socket, json, time, os, sys, datetime

socket.setdefaulttimeout(40)
BASE = "https://api.github.com/search/repositories"
HDRS = {"User-Agent": "qwen-eaglercraft-indexer",
        "Accept": "application/vnd.github+json"}
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "repos.jsonl")

seen = {}
if os.path.exists(OUT):
    for line in open(OUT, encoding="utf-8"):
        try:
            r = json.loads(line)
            seen[r["full_name"].lower()] = r
        except Exception:
            pass

state = {"requests": 0, "deadline": time.time() + float(os.environ.get("BUDGET", "1200")),
         "stopped": False}


def api(url):
    """GET with rate-limit awareness. Returns (json, headers)."""
    for attempt in range(6):
        if time.time() > state["deadline"]:
            state["stopped"] = True
            return None, {}
        try:
            req = urllib.request.Request(url, headers=HDRS)
            resp = urllib.request.urlopen(req)
            state["requests"] += 1
            data = json.loads(resp.read().decode("utf-8", "replace"))
            rem = resp.headers.get("X-RateLimit-Remaining")
            reset = resp.headers.get("X-RateLimit-Reset")
            if rem is not None and int(rem) <= 1 and reset:
                wait = max(1, int(reset) - int(time.time()) + 2)
                print(f"  [rate-limit] sleeping {wait}s", flush=True)
                time.sleep(min(wait, 120))
            else:
                time.sleep(6.6)          # 10 search req/min unauthenticated
            return data, resp.headers
        except urllib.error.HTTPError as e:
            body = e.read(300).decode("utf-8", "replace")
            if e.code in (403, 429):
                reset = e.headers.get("X-RateLimit-Reset") or e.headers.get("Retry-After")
                wait = 70
                try:
                    wait = max(10, int(reset) - int(time.time()) + 3) if reset and int(reset) > 10**9 else int(reset) + 3
                except Exception:
                    pass
                print(f"  [403/429] {body[:120]} -> sleep {min(wait,150)}s", flush=True)
                time.sleep(min(wait, 150))
                continue
            if e.code == 422:
                print(f"  [422] {body[:160]}", flush=True)
                return None, {}
            print(f"  [HTTP {e.code}] {body[:120]}", flush=True)
            time.sleep(8)
        except Exception as e:
            print(f"  [err] {str(e)[:120]}", flush=True)
            time.sleep(8)
    return None, {}


def save(rec):
    key = rec["full_name"].lower()
    if key in seen:
        return False
    slim = {k: rec.get(k) for k in
            ("full_name", "html_url", "description", "size", "stargazers_count",
             "forks_count", "language", "created_at", "pushed_at", "updated_at",
             "archived", "fork", "default_branch", "license", "topics", "homepage",
             "open_issues_count", "has_pages")}
    if isinstance(slim.get("license"), dict):
        slim["license"] = slim["license"].get("spdx_id")
    seen[key] = slim
    with open(OUT, "a", encoding="utf-8") as f:
        f.write(json.dumps(slim, ensure_ascii=False) + "\n")
    return True


def search(query, page=1, per_page=100):
    url = f"{BASE}?q={urllib.parse.quote(query)}&per_page={per_page}&page={page}"
    data, _ = api(url)
    return data


def paginate(query, maxpages=10):
    got = 0
    for p in range(1, maxpages + 1):
        d = search(query, p)
        if state["stopped"] or not d:
            return got
        items = d.get("items", [])
        if not items:
            break
        for it in items:
            if save(it):
                got += 1
        if len(items) < 100:
            break
    return got


def harvest(query, lo, hi, depth=0):
    """Recursively slice by created: date until each slice < 1000 results."""
    if state["stopped"]:
        return
    if depth > 14:
        return
    q = query if lo is None else f"{query} created:{lo}..{hi}"
    d = search(q, 1, 1)
    if state["stopped"] or d is None:
        return
    total = d.get("total_count", 0)
    print(f"{'  '*depth}{q}  -> {total}", flush=True)
    if total == 0:
        return
    if total <= 900:
        n = paginate(q)
        print(f"{'  '*depth}  collected {n} new (db={len(seen)})", flush=True)
        return
    if lo is None:
        lo, hi = datetime.date(2010, 1, 1), datetime.date.today() + datetime.timedelta(days=30)
    span = (hi - lo).days
    if span <= 1:
        # can't split further: take the first 1000
        paginate(q)
        return
    mid = lo + datetime.timedelta(days=span // 2)
    harvest(query, lo, mid, depth + 1)
    harvest(query, mid + datetime.timedelta(days=1), hi, depth + 1)


ROOT_QUERIES = [
    "eaglercraft",
    "eaglercraftx",
    "eaglerforge",
    "eaglerrinth",
    "eagler in:name",
    "eaglercraft in:name",
]

if __name__ == "__main__":
    only = sys.argv[1:] or ROOT_QUERIES
    for q in only:
        if state["stopped"]:
            break
        print(f"=== ROOT: {q} ===", flush=True)
        harvest(q, None, None)
    print(f"DONE requests={state['requests']} repos={len(seen)} stopped={state['stopped']}", flush=True)
