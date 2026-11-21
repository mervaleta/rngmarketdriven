import base64
import hashlib
import json
import subprocess
import time
import urllib.request
from pathlib import Path
from urllib.parse import quote

ROOT=Path(__file__).resolve().parent
DATA=json.loads((ROOT/"manifest.json").read_text())
SITE=DATA["source_site"]
assert SITE=="https://siglo23.santoroydonoso.com"
files=DATA["files"]
assert len(files)==26
for rel, expected in files.items():
    url=SITE+"/"+quote(rel,safe="/")
    data=None
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 Siglo23 backup bridge", "Accept-Encoding":"identity"}),timeout=30) as r:
                data=r.read(2_000_000)
                assert r.read(1)==b"", "oversize"
            break
        except Exception as e:
            print("Fetch error",rel,i,repr(e),flush=True)
            if i==3:raise
            time.sleep(3)
    digest=hashlib.sha256(data).hexdigest()
    if digest!=expected:
        raise ValueError(f"SHA mismatch on {rel}: {digest}, expected {expected}")
    path=ROOT/"b64"/(rel+".b64")
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(base64.b64encode(data).decode("ascii"),encoding="ascii")
    print("Verified",rel,len(data),flush=True)
print("All public assets verified against user's ZIP SHA256")
