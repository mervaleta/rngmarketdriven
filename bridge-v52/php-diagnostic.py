#!/usr/bin/env python3
import urllib.request,urllib.error,json,time,pathlib
url="https://siglo23.santoroydonoso.com/__s23_recover_probe_b0f6fd84236a9b0914efb70b.php?t=hsNVP6Eo4gLORn6phaeFlvPMRWkIModQxgs5KBhW5fs"
result=None
for n in range(10):
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Siglo23TemporaryBackupAudit/1.0","Cache-Control":"no-cache"})
  with urllib.request.urlopen(req,timeout=18) as response:
   raw=response.read(200000)
  result=json.loads(raw.decode("utf8"))
  print("Backup found:",result.get("backup_found"),"PHP count:",result.get("php_count"),"execlist:",result.get("archive_list_exit"),flush=True)
  break
 except Exception as e:
  print("Not yet reachable",n,type(e).__name__,str(e).split(":")[0],flush=True)
  time.sleep(6)
if result is None:raise SystemExit(1)
pathlib.Path(__file__).with_name("php-diagnostic-result.json").write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding="utf8")
