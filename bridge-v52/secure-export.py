#!/usr/bin/env python3
"""Download encrypted, RSA-wrapped server backup. Never saves plaintext to GitHub."""
import os,urllib.request,time,hashlib,pathlib
url="https://siglo23.santoroydonoso.com/__s23_secure_export_d1fc7cfc3d0a2cf67e31584d.php?t=pkml6Dq-RX9bbo0ILqdqxMTA1V0tk1E9wYAr3gZxKPw"
dst=pathlib.Path("/tmp/siglo23-private-backup.encrypted")
for attempt in range(12):
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Siglo23EncryptedBackupTransfer/1.0","Cache-Control":"no-cache"})
  h=hashlib.sha256();n=0
  with urllib.request.urlopen(req,timeout=180) as resp, dst.open("wb") as out:
   if resp.headers.get("Content-Type","").split(";")[0]!="application/octet-stream":raise ValueError("Unexpected media type")
   while True:
    chunk=resp.read(1048576)
    if not chunk:break
    h.update(chunk);out.write(chunk);n+=len(chunk)
  with dst.open("rb") as f:magic=f.read(7)
  if magic!=b"S23ENC1" or n<80000000:raise ValueError("Encrypted transfer was incomplete")
  print("Ciphertext downloaded:",n,"bytes, sha256",h.hexdigest(),flush=True)
  break
 except Exception as exc:
  print("Encrypted backup not ready:",attempt,type(exc).__name__,str(exc).split("\n")[0][:150],flush=True)
  if dst.exists():dst.unlink()
  time.sleep(8)
else:raise SystemExit("Encrypted backup could not be exported")
