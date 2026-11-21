#!/usr/bin/env python3
"""Backup read-only de paginas y recursos PUBLICOS de Siglo23.
No autentica, no lee PHP fuente, secretos, ni modifica Hostinger.
"""
from datetime import datetime,timezone
from hashlib import sha256
from html.parser import HTMLParser
from urllib.parse import urljoin,urlparse,unquote
from urllib.request import Request,urlopen
from pathlib import Path
import base64,json,time,re

ORIGIN="https://siglo23.santoroydonoso.com"
ROOT=Path(__file__).resolve().parent
OUT=ROOT/"public-capture"
ROOTS=["/","/libros/","/editorial/"]
MAX_BYTES=4_500_000
MAX_ASSETS=45

class Links(HTMLParser):
 def __init__(self):
  super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=="img" and a.get("src"):self.links.append(a["src"])
  if tag=="script" and a.get("src"):self.links.append(a["src"])
  if tag=="link" and a.get("rel") in ("stylesheet","icon","preload") and a.get("href"):self.links.append(a["href"])

def fetch(path):
 url=urljoin(ORIGIN+"/",path)
 if urlparse(url).netloc!=urlparse(ORIGIN).netloc:raise ValueError("outside origin")
 req=Request(url,headers={"User-Agent":"Siglo23PublicReadOnlyBackup/1.0","Accept-Encoding":"identity","Cache-Control":"no-cache"})
 with urlopen(req,timeout=35) as response:
  if urlparse(response.url).netloc!=urlparse(ORIGIN).netloc:raise ValueError("redirect outside origin")
  raw=response.read(MAX_BYTES+1)
  if len(raw)>MAX_BYTES:raise ValueError("too large")
  if response.status!=200:raise ValueError("HTTP "+str(response.status))
  return raw,response.headers.get("Content-Type","")

def save(path,raw,typ):
 name=path.split("?")[0].lstrip("/")
 if not name or name.endswith("/"):name+="index.html"
 name=unquote(name)
 if ".." in Path(name).parts or name.startswith("/"):raise ValueError("traversal")
 target=OUT/"files"/name
 target.parent.mkdir(parents=True,exist_ok=True)
 target.write_bytes(raw)
 return {"url":ORIGIN+path,"path":name,"sha256":sha256(raw).hexdigest(),"bytes":len(raw),"content_type":typ}

OUT.mkdir(parents=True,exist_ok=True)
report={"timestamp_utc":datetime.now(timezone.utc).isoformat(),"origin":ORIGIN,"scope":"Public HTTP GET only; NOT a full Hostinger server or PHP source backup","files":[],"errors":[]}
linked=[]
for path in ROOTS:
 try:
  raw,typ=fetch(path)
  if "text/html" not in typ.lower() and b"<html" not in raw.lower():raise ValueError("not HTML")
  report["files"].append(save(path,raw,typ))
  parser=Links();parser.feed(raw.decode("utf8","replace"))
  for url in parser.links:
   absurl=urljoin(ORIGIN+path,url)
   if urlparse(absurl).netloc!=urlparse(ORIGIN).netloc:continue
   route=urlparse(absurl).path
   if not route or route.endswith("/") or route.endswith(".php"):continue
   if not any(route.lower().endswith(ext) for ext in (".css",".js",".png",".jpg",".jpeg",".webp",".svg",".ico",".woff",".woff2",".ttf")):continue
   linked.append(route)
  print("BACKED_UP_PAGE",path,len(raw),flush=True)
 except Exception as e:
  report["errors"].append({"path":path,"reason":str(e)})
  print("ERROR_PAGE",path,str(e),flush=True)

for path in list(dict.fromkeys(linked))[:MAX_ASSETS]:
 try:
  raw,typ=fetch(path)
  report["files"].append(save(path,raw,typ))
  print("BACKED_UP_ASSET",path,len(raw),flush=True)
 except Exception as e:
  report["errors"].append({"path":path,"reason":str(e)})
  print("ERROR_ASSET",path,str(e),flush=True)
report["found_root"]=any(x["url"]==ORIGIN+"/" for x in report["files"])
(OUT/"manifest.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf8")
print("RESULT",len(report["files"]),"downloaded",len(report["errors"]),"errors",flush=True)
if not report["found_root"]:raise SystemExit("Homepage not saved; snapshot incomplete")
