#!/usr/bin/env python3
"""Reconstitute missing PHP and other files from original private backup; preserve existing content."""
import urllib.request,urllib.error,json,time
url="https://siglo23.santoroydonoso.com/__s23_recover_probe_b0f6fd84236a9b0914efb70b.php?t=hsNVP6Eo4gLORn6phaeFlvPMRWkIModQxgs5KBhW5fs&mode=repairhome&r=SXFZKILA262q0BljZ9mpaUztNWvTio9U4Wy_hA"
for attempt in range(14):
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Siglo23RestoreMissingOnly/1.0","Cache-Control":"no-cache"})
  with urllib.request.urlopen(req,timeout=170) as resp:
   result=json.loads(resp.read(20000).decode("utf-8"))
  x=result.get("restore_result") or {}
  print("Restored",x.get("files_restored"),"files; preserved",x.get("existing_preserved"),"; php restored",len(x.get("php_restored",[])),"; errors",x.get("errors"),"; home fix",x.get("home_fix_applied"),flush=True)
  if x.get("complete") and not x.get("errors") and x.get("home_fix_applied"):
   break
  raise ValueError("Restoration incomplete: "+str(x)[:450])
 except urllib.error.HTTPError as exc:
  if exc.code==404 and attempt>6:
   print("Restore endpoint no longer available, possibly already completed.",flush=True)
   break
  print("Waiting for temporary recovery route",exc.code,flush=True)
 except Exception as exc:
  print("Waiting for recoverability",type(exc).__name__,str(exc).split("\n")[0][:250],flush=True)
 time.sleep(6)
else:raise SystemExit("PHP recovery not verified")
