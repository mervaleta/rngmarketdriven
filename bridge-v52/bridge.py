import base64
import hashlib
import json
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
matched=[]
mismatch=[]
errors=[]
for rel, expected in files.items():
    url=SITE+"/"+quote(rel,safe="/")
    data=None
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 Siglo23 backup bridge", "Accept-Encoding":"identity"}),timeout=25) as r:
                data=r.read(2_000_000)
                assert r.read(1)==b"", "oversize"
            break
        except Exception as e:
            if i==2:
                errors.append({"file":rel,"error":str(e)})
                print("DOWNLOAD ERROR",rel,str(e),flush=True)
            else:
                time.sleep(2)
    if data is None:
        continue
    digest=hashlib.sha256(data).hexdigest()
    if digest!=expected:
        mismatch.append({"file":rel,"expected":expected,"download_sha256":digest,"bytes":len(data)})
        live=ROOT/"b64"/"live"/(rel+".b64")
        live.parent.mkdir(parents=True,exist_ok=True)
        live.write_text(base64.b64encode(data).decode("ascii"),encoding="ascii")
        print("MISMATCH_LIVE_COPY",rel,len(data),digest,flush=True)
        continue
    path=ROOT/"b64"/(rel+".b64")
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(base64.b64encode(data).decode("ascii"),encoding="ascii")
    matched.append(rel)
    print("VERIFIED",rel,len(data),flush=True)
report={"matched":matched,"mismatched":mismatch,"errors":errors}
(ROOT/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
print("REPORT",len(matched),"matched",len(mismatch),"mismatched",len(errors),"errors",flush=True)
