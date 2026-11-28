#!/usr/bin/env python3
"""Verify the existing public deployment against the versioned Ara engine."""
import hashlib
import pathlib
import time
import urllib.request

ROOT = pathlib.Path("cross/minijuegos/ara-fashion/engine")
BASE = "https://rngmarketdriven.com/cross/minijuegos/ara-fashion/"
def read(path):
    req = urllib.request.Request(BASE + path + "?studio_verify=" + str(time.time_ns()), headers={"User-Agent":"StudioAraVerification/1.0","Cache-Control":"no-cache"})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read()
def verify():
    for rel in ("BUILD.txt", "app/index.html"):
        local = ROOT / rel
        if not local.is_file():
            raise RuntimeError("Engine not versioned: " + rel)
        if read("engine/" + rel) != local.read_bytes():
            raise RuntimeError("Public engine differs: " + rel)
    page = read("index.php").decode("utf-8", errors="replace")
    if "engine/app/" not in page or "Versión experimental pendiente de publicación" in page:
        raise RuntimeError("Public wrapper has no installed engine")
    assets = sorted(p for p in (ROOT / "assets").rglob("*") if p.is_file() and p.suffix in (".js", ".json", ".bin", ".gz"))
    if not assets:
        raise RuntimeError("No versioned engine assets")
    # Sample the smallest and largest assets; catch partial uploads or server error pages.
    for p in (min(assets, key=lambda p:p.stat().st_size), max(assets, key=lambda p:p.stat().st_size)):
        rel = p.relative_to(ROOT).as_posix()
        if hashlib.sha256(read("engine/" + rel)).digest() != hashlib.sha256(p.read_bytes()).digest():
            raise RuntimeError("Public asset differs: " + rel)
    print("Ara wrapper and versioned engine verified on Hostinger.")
for attempt in range(8):
    try:
        verify()
        break
    except Exception as e:
        print("Verification attempt", attempt + 1, str(e), flush=True)
        if attempt == 7:
            raise
        time.sleep(15)
