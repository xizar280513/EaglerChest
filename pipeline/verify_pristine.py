#!/usr/bin/env python3
"""Hapus semua file hasil kompilasi/modifikasi AI, lalu verifikasi bahwa SETIAP
file .js di root workspace identik byte-per-byte dengan sumber aslinya di GitHub."""
import os, re, json, time, hashlib, urllib.request, urllib.parse, socket
from concurrent.futures import ThreadPoolExecutor

socket.setdefaulttimeout(90)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
H = {"User-Agent": "Mozilla/5.0"}


def rtjson(p, t=15):
    for _ in range(t):
        try:
            d = open(p, encoding="utf-8").read()
            if d:
                return json.loads(d)
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        time.sleep(1)
    raise SystemExit("gagal baca " + p)


def sha(b):
    return hashlib.sha256(b).hexdigest()


mods = rtjson(os.path.join(HERE, "mods_root.json"))
print("mod sebelum pembersihan:", len(mods))

# ---- 1) buang semua file yang pernah saya kompilasi / modifikasi
compiled = [m for m in mods if m.get("kompilasi") or m.get("versi") == "compiled"]
for m in compiled:
    p = os.path.join(ROOT, m["lokasi"])
    if os.path.exists(p):
        os.remove(p)
        print("  DIHAPUS (hasil kompilasi/modifikasi AI):", m["lokasi"],
              "| komponen:", m.get("kompilasi"))
mods = [m for m in mods if m not in compiled]

# ---- 2) kembalikan komponen ASLI yang tadinya dilebur (byte asli dari upstream)
JS = "/tmp/jsmods"
restore = ["laser_start_item.js", "laser_end_item.js"]
allv = rtjson(os.path.join(HERE, "all_valid.json")) if os.path.exists(os.path.join(HERE, "all_valid.json")) else []
arts = {}
for line in open(os.path.join(HERE, "artifacts.jsonl"), encoding="utf-8"):
    try:
        a = json.loads(line)
    except Exception:
        continue
    arts.setdefault(os.path.basename(a["path"]), a)
for f in restore:
    if any(m["lokasi"] == f for m in mods):
        continue
    a = arts.get(f)
    if not a:
        print("  ! sumber", f, "tidak ditemukan")
        continue
    url = a.get("url")
    try:
        d = urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=90).read()
    except Exception as e:
        print("  ! gagal unduh ulang", f, str(e)[:60])
        continue
    open(os.path.join(ROOT, f), "wb").write(d)
    cand = [x for x in allv if x.get("url") == url] or [{}]
    src = cand[0]
    mods.append({"file": f, "nama": re.sub(r"\.js$", "", f), "author": a["repo"].split("/")[0],
                 "credits": src.get("credits", ""), "versi": src.get("vers", ""),
                 "deskripsi": src.get("deskripsi", ""), "bytes": len(d),
                 "sumber": "https://github.com/" + a["repo"], "path_di_repo": a["path"],
                 "link_langsung": url, "sha256": sha(d), "stars_repo": 0,
                 "tanpa_modapi": False, "lokasi": f,
                 "catatan": "komponen asli (tidak dilebur/diubah); dulu sempat dikompilasi AI, "
                            "hasil kompilasi sudah dihapus"})
    print(f"  DIPULIHKAN (byte asli upstream): {f}  {len(d)} B  sha={sha(d)[:12]}")

# ---- 3) verifikasi setiap file: unduh ulang dari sumber, bandingkan sha256
def verify(m):
    p = os.path.join(ROOT, m["lokasi"])
    if not os.path.exists(p):
        return (m, "HILANG", None, None)
    local = open(p, "rb").read()
    rec = (m.get("sha256") or "").lower()
    url = m.get("link_langsung") or ""
    if not url.startswith("http"):
        return (m, "TANPA-LINK", sha(local), rec)
    for u in [url] + ([url.replace("/main/", "/master/")] if "/main/" in url else []):
        try:
            up = urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=120).read()
            if sha(local) == sha(up):
                return (m, "IDENTIK", sha(local), sha(up))
            # berbeda -> timpa dengan byte asli upstream
            open(p, "wb").write(up)
            m["bytes"] = len(up)
            m["sha256"] = sha(up)
            return (m, "DIPERBAIKI-KE-ASLI", sha(local), sha(up))
        except Exception:
            continue
    # tidak bisa diunduh ulang: andalkan sha yang direkam saat pertama diambil
    if rec and sha(local) == rec:
        return (m, "IDENTIK(catatan-lokal)", sha(local), rec)
    return (m, "TAK-TERVERIFIKASI", sha(local), rec)


with ThreadPoolExecutor(10) as ex:
    res = list(ex.map(verify, mods))

stat = {}
for m, st, a, b in res:
    stat[st] = stat.get(st, 0) + 1
    m["status_keaslian"] = st
    if st in ("HILANG", "TAK-TERVERIFIKASI"):
        print(f"  {st}: {m['lokasi']}  lokal={str(a)[:12]} sumber={str(b)[:12]}")
print("\nhasil verifikasi:", stat)

# buang yang tidak bisa dipastikan keasliannya
before = len(mods)
mods = [m for m, st, a, b in res if st.startswith("IDENTIK") or st == "DIPERBAIKI-KE-ASLI"]
for m, st, a, b in res:
    if not (st.startswith("IDENTIK") or st == "DIPERBAIKI-KE-ASLI"):
        p = os.path.join(ROOT, m["lokasi"])
        if os.path.exists(p):
            os.remove(p)
print(f"dibuang karena tak terverifikasi: {before - len(mods)}")

mods.sort(key=lambda m: m["nama"].lower())
json.dump(mods, open(os.path.join(HERE, "mods_root.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("MOD FINAL (100% byte asli upstream):", len(mods))
