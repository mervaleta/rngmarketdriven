#!/usr/bin/env python3
"""Siglo23 / El humor de los mercados — recopilar solamente imágenes de archivos verificables.
Este script NO declara licencias comerciales universales ni valida resolución de imprenta.
Se ejecuta con GitHub Actions en el repositorio y conserva los archivos web localmente.
"""
from __future__ import annotations
import hashlib, io, json, os, re, sys, time
from pathlib import Path
from urllib.parse import urlparse
import requests
import fitz
from PIL import Image, ImageOps

BASE=Path(__file__).resolve().parent.parent
IMAGES=BASE/"imagenes"
IMAGES.mkdir(parents=True,exist_ok=True)
SESSION=requests.Session()
SESSION.headers.update({"User-Agent":"EditorialSiglo23/0.1 (archivo historico con referencia de origen)"})
WORKS=json.loads((BASE/"obras.json").read_text(encoding="utf-8"))["obras"]
MANIFEST={"version":"0.1.0","fecha":"2026-11-07","images":[],"tafereel":[],"errors":[]}
PDF="https://www.dbnl.org/tekst/_taf002tafe01_01/_taf002tafe01_01.pdf"

def get(url, timeout=55, max_bytes=42000000):
    resp=SESSION.get(url,timeout=timeout)
    resp.raise_for_status()
    if len(resp.content)>max_bytes: raise ValueError("Archivo supera limite de descarga")
    return resp.content

def save_jpeg(raw, path, maxwidth=1900):
    im=Image.open(io.BytesIO(raw))
    im=ImageOps.exif_transpose(im)
    if im.mode!="RGB": im=im.convert("RGB")
    if max(im.size)>maxwidth: im.thumbnail((maxwidth,maxwidth), Image.Resampling.LANCZOS)
    im.save(path,"JPEG",quality=88,optimize=True,subsampling=0)
    return im.size

def add_file(w,raw,origin,source_rights):
    dest=IMAGES/(w["id"]+".jpg")
    size=save_jpeg(raw,dest)
    MANIFEST["images"].append({"id":w["id"],"path":dest.name,"bytes":dest.stat().st_size,"dimensions":list(size),"url_origen":origin,"uso":source_rights})
    print("OK",w["id"],size,dest.stat().st_size,flush=True)

for w in WORKS:
    try:
        if w.get("met"):
            raw_meta=get("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+str(w["met"]),max_bytes=250000)
            doc=json.loads(raw_meta)
            if not doc.get("isPublicDomain"): raise ValueError("Met API no confirma dominio publico")
            img=doc.get("primaryImage")
            if not img: raise ValueError("Met API sin imagen primaria")
            add_file(w,get(img,max_bytes=27000000),img,"Met Open Access / objeto de dominio publico")
        elif w["id"] in {"M015","M017"} and w.get("imagen"):
            add_file(w,get(w["imagen"],max_bytes=17000000),w["imagen"],"LOC: no known restrictions; verificar masters")
    except Exception as exc:
        err=f"{w['id']}: {str(exc)[:180]}";print("WARN",err,flush=True);MANIFEST["errors"].append(err)

# La edición histórica descargada de DBNL permite extraer estampas para la fase de identificación.
# Cada archivo se presenta como una imagen sin título atribuido hasta contrastar la plancha.
try:
    pdf=get(PDF,timeout=140,max_bytes=30000000)
    doc=fitz.open(stream=pdf,filetype="pdf")
    candidates=[]
    used=set()
    for pno,page in enumerate(doc):
        for x in page.get_images(full=True):
            xref=x[0]
            if xref in used:continue
            used.add(xref)
            try:
                raw=doc.extract_image(xref)["image"]
                im=Image.open(io.BytesIO(raw))
                w,h=im.size
                ratio=w/h
                # Print reproductions of plates generally exceed these dimensions.
                if w>=600 and h>=450 and 0.48<=ratio<=3.2:
                    candidates.append((pno+1,w*h,xref,raw))
            except Exception:continue
    candidates.sort(key=lambda a:(a[0],-a[1]))
    print("DBNL_PDF_PAGES",len(doc),"ILLUSTRATION_CANDIDATES",len(candidates),flush=True)
    # Choose a manageable set, keeping the sequence in the historical edition.
    picked=candidates[:30]
    for j,(page_no,area,xref,raw) in enumerate(picked,1):
        filename=f"tafereel-lamina-{j:03}.jpg"
        size=save_jpeg(raw,IMAGES/filename,maxwidth=2000)
        MANIFEST["tafereel"].append({
            "id":f"T{j:03}","image":"imagenes/"+filename,"pdf_page":page_no,
            "title":"Estampa del Tafereel · identificación pendiente",
            "source":PDF,"source_catalog":"https://www.dbnl.org/titels/titel.php?id=_taf002tafe01",
            "dimensions":list(size),"rights_review":"Obra historica 1720; verificar requisitos de uso de imagen digital DBNL",
        })
        print("TAFEREEL",j,page_no,size,flush=True)
except Exception as exc:
    err="DBNL PDF: "+str(exc)[:250];print("WARN",err,flush=True);MANIFEST["errors"].append(err)
(BASE/"imagenes"/"manifest.json").write_text(json.dumps(MANIFEST,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
(BASE/"laminas.json").write_text(json.dumps({"version":"0.1.0","laminas":MANIFEST["tafereel"]},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("FINAL",len(MANIFEST["images"]),"fichas ilustradas",len(MANIFEST["tafereel"]),"estampas sin catalogar",flush=True)
