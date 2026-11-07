#!/usr/bin/env python3
"""Importación reproducible de fotografías de la maqueta a recursos LOCALES.

No certifica derechos, edad adulta ni calidad de impresión. Mantiene la URL
externa para las obras cuya descarga no se pudo comprobar.
"""
from __future__ import annotations
import hashlib
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
BOOK = ROOT / "libro.json"
VERS = ROOT / "version.json"
OUT = ROOT / "imagenes"
WEB = OUT / "web"
MASTER = OUT / "maestros"
WEB.mkdir(parents=True, exist_ok=True)
MASTER.mkdir(parents=True, exist_ok=True)
HOSTS = {"upload.wikimedia.org", "thumb.wikimedia.org",
         "commons.wikimedia.org", "www.clevelandart.org",
         "piction.clevelandart.org", "collectionapi.metmuseum.org"}
MAX_DOWNLOAD = 34 * 1024 * 1024
MAX_MASTER = 14 * 1024 * 1024
LIMIT = int(os.getenv("GABINETE_MAX_IMAGES", "90"))
USER_AGENT = "EditorialSiglo23/1.1 (historical-public-domain-book-research; github-actions)"
book = json.loads(BOOK.read_text(encoding="utf8"))
manifest = {"generated_utc": datetime.now(timezone.utc).isoformat(),
            "project": "El gabinete prohibido",
            "warning": "La descarga no acredita derechos, identidad, edad adulta ni calidad de imprenta.",
            "files": [], "failures": []}

def safe_url(url):
    host = urllib.parse.urlparse(url).hostname
    if host not in HOSTS or not url.startswith("https://"):
        raise ValueError("Host no autorizado: " + str(host))
    return url

def candidate_urls(im):
    initial = im.get("source_url") or im.get("url", "")
    out = [initial] if initial.startswith("https://") else []
    commons = im.get("commons", "")
    if "/wiki/File:" in commons:
        filename = urllib.parse.unquote(commons.split("/wiki/File:", 1)[1])
        out.append("https://commons.wikimedia.org/wiki/Special:FilePath/" +
                   urllib.parse.quote(filename, safe="()_,-."))
    # Para Belloc, probar el TIFF original si el JPEG falla.
    if im.get("master_url") and "/wiki/File:" in im["master_url"]:
        filename = urllib.parse.unquote(im["master_url"].split("/wiki/File:", 1)[1])
        out.append("https://commons.wikimedia.org/wiki/Special:FilePath/" +
                   urllib.parse.quote(filename, safe="()_,-."))
    seen = set()
    return [x for x in out if not (x in seen or seen.add(x))]

def load_binary(url):
    safe_url(url)
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "image/avif,image/webp,image/jpeg,image/png,image/tiff,*/*;q=0.5"})
    with urllib.request.urlopen(req, timeout=32) as response:
        safe_url(response.geturl())
        mime = response.headers.get("Content-Type", "").lower()
        size = response.headers.get("Content-Length")
        if size and int(size) > MAX_DOWNLOAD:
            raise ValueError("Archivo demasiado grande")
        data = response.read(MAX_DOWNLOAD + 1)
        if len(data) > MAX_DOWNLOAD:
            raise ValueError("Descarga excede límite de tamaño")
        if len(data) < 512:
            raise ValueError("Imagen demasiado pequeña o vacía")
        if "text/html" in mime:
            raise ValueError("Enlace devuelve HTML, no fotografía")
        return data, response.geturl()

def valid_image(data):
    with Image.open(io.BytesIO(data)) as check:
        check.verify()
    image = Image.open(io.BytesIO(data))
    if image.width < 200 or image.height < 200:
        raise ValueError("Dimensiones insuficientes (<200 px)")
    image.load()
    return image

def save_image(im):
    ident = im["id"]
    output = WEB / (ident + ".jpg")
    source = im.get("source_url") or im.get("url")
    if output.exists() and output.stat().st_size > 3500:
        with Image.open(output) as existing:
            existing.verify()
        im.setdefault("source_url", source)
        im["url"] = "./imagenes/web/" + ident + ".jpg"
        return {"id": ident, "status": "reutilizado", "web": im["url"],
                "bytes": output.stat().st_size}
    reasons = []
    for url in candidate_urls(im):
        try:
            data, final = load_binary(url)
            image = valid_image(data)
            # Guardamos el original digital cuando es manejable por GitHub.
            if len(data) <= MAX_MASTER and min(image.size) >= 1400:
                ext = {"JPEG": ".jpg", "PNG": ".png", "TIFF": ".tif",
                       "WEBP": ".webp"}.get(image.format)
                if ext:
                    target = MASTER / (ident + ext)
                    if not target.exists():
                        target.write_bytes(data)
                    im["local_master_url"] = "./imagenes/maestros/" + target.name
            image = ImageOps.exif_transpose(image)
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            elif image.mode == "L":
                image = image.convert("RGB")
            image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
            image.save(output, "JPEG", quality=88, optimize=True, progressive=True,
                       subsampling=0)
            digest = hashlib.sha256(output.read_bytes()).hexdigest()
            im["source_url"] = source
            im["url"] = "./imagenes/web/" + ident + ".jpg"
            im["web_sha256"] = digest
            im["local_web_available"] = True
            im["download_status"] = "guardado_localmente_en_repositorio"
            # La ubicación de una imagen local no equivale a aprobación de derechos.
            return {"id": ident, "status": "descargado", "web": im["url"],
                    "source": final, "width": image.width, "height": image.height,
                    "bytes": output.stat().st_size, "sha256": digest,
                    "master": im.get("local_master_url"), "quality": im.get("quality")}
        except (OSError, ValueError, urllib.error.URLError,
                UnidentifiedImageError, TimeoutError) as error:
            reasons.append(str(error)[:170])
            continue
    return {"id": ident, "status": "error", "reasons": reasons[:3]}

count = 0
for index, im in enumerate(book.get("images", [])):
    if count >= LIMIT:
        break
    result = save_image(im)
    if result["status"] == "error":
        manifest["failures"].append(result)
        print("FALLO", im["id"], result["reasons"], flush=True)
    else:
        manifest["files"].append(result)
        count += 1
        print("OK", im["id"], result.get("bytes"), flush=True)
    time.sleep(0.25)

manifest["downloaded_count"] = len(manifest["files"])
manifest["failures_count"] = len(manifest["failures"])
manifest["book_images_total"] = len(book["images"])
manifest["hosted_only_if_deployed"] = True

(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) +
                                   "\n", encoding="utf8")
BOOK.write_text(json.dumps(book, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
if VERS.exists():
    vers = json.loads(VERS.read_text(encoding="utf8"))
    vers["localImageFiles"] = len(manifest["files"])
    vers["imageDownloadFailures"] = len(manifest["failures"])
    vers["imageAssetManifest"] = "./imagenes/manifest.json"
    vers["assetStatus"] = "Archivos guardados en GitHub; publicación en Hostinger debe verificarse"
    VERS.write_text(json.dumps(vers, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
print("RESUMEN", len(manifest["files"]), "descargadas,", len(manifest["failures"]), "fallidas")
if not manifest["files"]:
    sys.exit("No se pudo descargar ninguna foto: verificar conectividad y fuentes")
