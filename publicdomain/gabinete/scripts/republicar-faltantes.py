#!/usr/bin/env python3
"""Re-publica solo JPG que el chequeo público marcó como 404 en Hostinger."""
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageOps
root=Path(__file__).resolve().parents[1]
web=root/"imagenes"/"web"
book_path=root/"libro.json"
manifest_path=root/"imagenes"/"manifest.json"
ids=[
"breitner_jordan_7","breitner_jordan_1","breitner_jordan_2",
"breitner_jordan_3","eakins_bill_1889","canellas_mirror","canellas_gate",
"sambourne_pettigrew_4b","sambourne_maude_1","sambourne_maude_costume",
"frank_eugene_adam","frank_eugene_cloud"]
book=json.loads(book_path.read_text(encoding="utf8"))
manifest=json.loads(manifest_path.read_text(encoding="utf8"))
photos={x["id"]:x for x in book["images"]}
entries={x["id"]:x for x in manifest["files"]}
log=[]
for ident in ids:
    target=web/(ident+".jpg")
    if not target.exists():raise FileNotFoundError(str(target))
    with Image.open(target) as original:
        original.load()
        rgb=ImageOps.exif_transpose(original).convert("RGB")
    rgb.save(target,"JPEG",quality=85,optimize=True,progressive=True,subsampling=0)
    digest=hashlib.sha256(target.read_bytes()).hexdigest()
    photos[ident]["web_sha256"]=digest
    photos[ident]["url"]="./imagenes/web/"+ident+".jpg?v=1.1.1"
    entries[ident]["bytes"]=target.stat().st_size
    entries[ident]["sha256"]=digest
    entries[ident]["web"]=photos[ident]["url"]
    log.append({"id":ident,"bytes":target.stat().st_size,"sha256":digest})
    print("REPUBLICAR",ident,target.stat().st_size,flush=True)
manifest["republication_attempt"]="1.1.1"
manifest["republication_reasons"]="Doce rutas con respuesta 404 en control de Hostinger"
manifest["republication_images"]=log
book_path.write_text(json.dumps(book,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
