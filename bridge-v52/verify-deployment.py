#!/usr/bin/env python3
"""HTTP GET-only smoke test for Siglo23 after GitHub main deployment; outputs public verification JSON."""
import json,datetime,time,urllib.request,urllib.error
from html.parser import HTMLParser
from pathlib import Path
ORIGIN="https://siglo23.santoroydonoso.com"
MARK="97ce25864cbeec407e9f31e6bffab9194f335801"
CHECKS=[
 ("/editorial/","editorial",["Mesa editorial","Finanzas para Aliens","La sátira de los mercados","v0.7"]),
 ("/editorial/nuevos/","proyectos",["Ella y los años","El ángel","proyectos.js"]),
 ("/editorial/nuevos/proyectos.js","datos_proyectos",["Finanzas para Aliens","Economía para Aliens","Real Estate para Aliens","Ella y los años","El ángel"]),
 ("/editorial/archivo/mercados/","satira",["La sátira","Historia ilustrada de burbujas, fraudes y otros delirios financieros"]),
 ("/","home",["El humor de los mercados","El Club"]),
 ("/index.html","home_html",["El humor de los mercados"]),
 ("/index.php","home_php",[]),
 ("/libros/","libros",["El humor de los mercados"]),
 ("/comunidad.php","club",[]),
 ("/contacto.php","contacto",[]),
 ("/cuenta.php?modo=ingresar","cuenta",[])
]
results=[]
for route,name,markers in CHECKS:
 url=ORIGIN+route+("&" if "?" in route else "?")+"audit="+MARK[:10]
 entry={"name":name,"route":route,"url":url}
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Siglo23Verification/2026-11-21","Cache-Control":"no-cache","Accept-Encoding":"identity"})
  with urllib.request.urlopen(req,timeout=22) as resp:
   raw=resp.read(300_000);body=raw.decode("utf8","replace");code=resp.status
   entry.update({"http":code,"final_url":resp.url,"bytes_read":len(raw),"title":__import__("re").search(r"<title[^>]*>(.*?)</title>",body,__import__("re").I|__import__("re").S).group(1) if __import__("re").search(r"<title[^>]*>(.*?)</title>",body,__import__("re").I|__import__("re").S) else None,"markers":{term:(term in body) for term in markers}})
   entry["ok"]=code==200 and all(entry["markers"].values())
 except urllib.error.HTTPError as e:entry.update({"http":e.code,"ok":False,"error":str(e),"error_page":e.read(1500).decode("utf8","replace")})
 except Exception as e:entry.update({"http":None,"ok":False,"error":str(e)})
 results.append(entry)
 print(name,entry["http"],entry["ok"],entry.get("markers",""),flush=True)
doc={"checked_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"commit":MARK,"site":ORIGIN,"results":results,"all_passed":all(x["ok"] for x in results)}
p=Path(__file__).resolve().parent/"public-deploy-check.json"
p.write_text(json.dumps(doc,indent=2,ensure_ascii=False))
print("VERIFIED",doc["all_passed"],flush=True)
if not doc["all_passed"]:raise SystemExit(1)
