#!/usr/bin/env python3
"""Recupera originales del Metropolitan Museum Open Access, sin pedir imágenes a Commons.

Solo actúa sobre objetos identificados por ID del Met con isPublicDomain=true.
Conserva el archivo original de alta resolución si entra en límite de GitHub.
"""
import hashlib
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

root=Path(__file__).resolve().parents[1]
book_path=root/"libro.json"
vers_path=root/"version.json"
web=root/"imagenes"/"web"
masters=root/"imagenes"/"maestros"
masters.mkdir(parents=True,exist_ok=True)
web.mkdir(parents=True,exist_ok=True)
book=json.loads(book_path.read_text(encoding="utf8"))
status={"source":"The Metropolitan Museum of Art Open Access API",
        "scope":"Solo obras de dominio público y objetos identificados",
        "saved_masters":[],"updated_web":[],"failed":[]}
headers={"User-Agent":"EditorialSiglo23/1.0 (historical book production; open access images)"}
for im in book["images"]:
    match=re.search(r"metmuseum\.org/art/collection/search/(\d+)", im.get("museumUrl",""))
    if not match:
        continue
    ident=im["id"]
    try:
        api="https://collectionapi.metmuseum.org/public/collection/v1/objects/"+match.group(1)
        with urllib.request.urlopen(urllib.request.Request(api,headers=headers),timeout=20) as r:
            meta=json.load(r)
        if not meta.get("isPublicDomain"):
            raise ValueError("Objeto no marcado como Public Domain en la API del Met")
        remote=meta.get("primaryImage")
        if not remote:
            raise ValueError("API del Met sin URL de original")
        parsed=urllib.parse.urlparse(remote)
        if parsed.scheme!="https" or parsed.hostname!="images.metmuseum.org":
            raise ValueError("Original fuera del CDN esperado del Met")
        with urllib.request.urlopen(urllib.request.Request(remote,headers=headers),timeout=35) as r:
            data=r.read(28_000_001)
        if len(data)>28_000_000:
            raise ValueError("Original supera límite de importación")
        with Image.open(io.BytesIO(data)) as check:
            check.verify()
        photo=Image.open(io.BytesIO(data));photo.load()
        if min(photo.size)<1200:
            raise ValueError("Original insuficiente para gran formato")
        if len(data)<=18_000_000:
            ext=(".jpg" if photo.format=="JPEG" else
                 ".tif" if photo.format=="TIFF" else
                 ".png" if photo.format=="PNG" else None)
            if ext:
                dest=masters/(ident+ext)
                dest.write_bytes(data)
                im["local_master_url"]="./imagenes/maestros/"+dest.name
                im["master_sha256"]=hashlib.sha256(data).hexdigest()
                im["master_width"],im["master_height"]=photo.size
                im["print_master_status"]="ORIGINAL MET DESCARGADO; revisión de imprenta pendiente"
                status["saved_masters"].append({"id":ident,"bytes":len(data),
                         "width":photo.width,"height":photo.height,
                         "file":str(dest.relative_to(root))})
        im["source_url"]=im.get("source_url") or remote
        photo=ImageOps.exif_transpose(photo)
        if photo.mode!="RGB": photo=photo.convert("RGB")
        photo.thumbnail((2400,2400),Image.Resampling.LANCZOS)
        dest=web/(ident+".jpg")
        photo.save(dest,"JPEG",quality=89,optimize=True,subsampling=0,progressive=True)
        im["url"]="./imagenes/web/"+dest.name
        im["web_sha256"]=hashlib.sha256(dest.read_bytes()).hexdigest()
        im["local_web_available"]=True
        status["updated_web"].append({"id":ident,"width":photo.width,"height":photo.height})
        print("MET OK",ident,"original",im.get("master_width"),"x",im.get("master_height"),flush=True)
    except Exception as exc:
        status["failed"].append({"id":ident,"reason":str(exc)[:210]})
        print("MET FAIL",ident,str(exc)[:150],flush=True)
    time.sleep(0.4)
(root/"imagenes"/"maestros"/"manifest.json").write_text(
    json.dumps(status,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
book_path.write_text(json.dumps(book,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
if vers_path.exists():
    v=json.loads(vers_path.read_text(encoding="utf8"))
    v["metOriginalsDownloaded"]=len(status["saved_masters"])
    v["metHighQualityWebImages"]=len(status["updated_web"])
    vers_path.write_text(json.dumps(v,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("MET RESUMEN",len(status["saved_masters"]),"originales,",len(status["updated_web"]),"web grandes,",len(status["failed"]),"fallos")
