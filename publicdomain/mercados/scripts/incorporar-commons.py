#!/usr/bin/env python3
"""Descarga curada de 22 estampas de 1720 desde Wikimedia Commons.
No atribuirlas sin cotejar. Las copias web se guardan en /imagenes, no en hotlinks.
Wikimedia Commons incluye obras del Rijksmuseum y la Biblioteca de Ámsterdam.
"""
import io, json, os, re, sys, time
from pathlib import Path
from urllib.parse import quote
import requests
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parent.parent
ASSETS=ROOT/"imagenes"; ASSETS.mkdir(parents=True,exist_ok=True)
REQ=requests.Session()
REQ.headers.update({"User-Agent":"EditorialSiglo23-Mercados/0.2 (https://github.com/mervaleta/rngmarketdriven; public-domain research)"})
CATEGORY=[
 "Category:Het_groote_tafereel_der_dwaasheid_(1720)",
 "Category:Het_Groote_Tafereel_der_Dwaasheid,_1720"
]
# Careful not to choose different reproductions of the same title.
CURATION=[
 ("Titelpagina van Het Groote Tafereel", "El gran espejo de la locura: portada"),
 ("Anatomie van de Windhandel", "Anatomía del negocio del viento"),
 ("Actionisten onderweg naar Vianen", "Los accionistas camino de Vianen"),
 ("Apollo oordeelt over de Actionisten", "Apolo juzga a los accionistas"),
 ("April-kaart of kaartspel van Momus", "Las cartas de Momos y el juego de la especulación"),
 ("Bal, of de Wereld in Maskerade", "El mundo como baile de máscaras"),
 ("Bombario door de Dood weggeleid", "La muerte conduce al especulador Bombario"),
 ("Bronwater als geneesmiddel", "Un remedio para los accionistas enfermos"),
 ("De Actiesfinx springt", "La esfinge de las acciones"),
 ("De Actionisten in het dolhuis", "Accionistas en el manicomio"),
 ("De brandklok geluid door", "La gran campana de la alarma bursátil"),
 ("De keisnijder van 1720", "El cirujano de la locura especulativa"),
 ("De kermiskraam van de actiehandelaars", "El puesto de feria de los comerciantes de acciones"),
 ("De kladpapieren wereld in brand", "El papel sin valor se convierte en cenizas"),
 ("De grote vergaderplaats van de windverkopers", "La gran asamblea de los vendedores de viento"),
 ("De Inbeelding schildert", "La Imaginación pinta la Mississippi"),
 ("De lachende Aesopus", "Esopo se ríe de los monos accionistas"),
 ("De Lachende Law", "Law ríe mientras llora el accionista"),
 ("De opkomst maar nog geen val", "El ascenso de John Law"),
 ("De oprechte en de geldzuchtige koopman", "El comerciante honrado y el comerciante codicioso"),
 ("De stervende bubbelheer John Law", "El agonizante señor de las burbujas"),
 ("De tolpoort te Vianen", "La aduana de los accionistas")
]
def call(params, attempts=3):
  for k in range(attempts):
    try:
      r=REQ.get("https://commons.wikimedia.org/w/api.php",params=params,timeout=35)
      r.raise_for_status()
      d=r.json()
      if "error" in d:raise RuntimeError(str(d["error"])[:250])
      return d
    except Exception as e:
      if k==attempts-1:raise
      time.sleep(2*(k+1))
def candidates():
  result={}
  for c in CATEGORY:
    cont={}
    while True:
      params={"action":"query","format":"json","generator":"categorymembers",
              "gcmtitle":c,"gcmnamespace":"6","gcmtype":"file","gcmlimit":"500",
              "prop":"imageinfo","iiprop":"url|extmetadata|size","iiurlwidth":"2000"}
      params.update(cont)
      data=call(params)
      for value in data.get("query",{}).get("pages",{}).values():
        title=value.get("title","")
        if title.lower().endswith((".jpg",".jpeg",".png",".tif",".tiff")):
          result[title]=value
      cont=data.get("continue",{})
      if not cont:break
    print("COMMONS_CATEGORY",c,"UNIQUES",len(result),flush=True)
  return list(result.values())
def rights(info):
  meta=info.get("extmetadata",{}) or {}
  s=str(meta.get("LicenseShortName",{}).get("value",""))
  if not s: s=str(meta.get("License",{}).get("value",""))
  return re.sub("<[^>]*>","",s)[:120]
def choose(all_candidates,prefix,used):
  matching=[r for r in all_candidates if r["title"].lower().startswith("file:"+prefix.lower()) and r["title"] not in used]
  matching.sort(key=lambda x: (
      0 if "RP-P-OB" in x["title"] else 1,
      0 if "BI-B-FM" in x["title"] else 1,
      len(x["title"])))
  return matching[0] if matching else None
def save(raw,path):
  im=Image.open(io.BytesIO(raw));im=ImageOps.exif_transpose(im)
  if im.mode!="RGB":im=im.convert("RGB")
  im.thumbnail((2000,2000),Image.Resampling.LANCZOS)
  im.save(path,"JPEG",quality=86,optimize=True,subsampling=0)
  return [im.width,im.height]
manifest_path=ASSETS/"manifest.json"
manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {"version":"0.1.0","images":[],"tafereel":[],"errors":[]}
manifest["tafereel"]=[]
laminas=[]
used=set()
try:all_candidates=candidates()
except Exception as e:
  print("COMMONS_API_ERROR",str(e)[:300],flush=True)
  all_candidates=[]
for i,(prefix,spanish) in enumerate(CURATION,1):
  row=choose(all_candidates,prefix,used)
  if not row:
    manifest["errors"].append(f"Commons faltante: {prefix}")
    continue
  used.add(row["title"])
  info=row.get("imageinfo",[{}])[0]
  license_label=rights(info)
  if not any(x in license_label.lower() for x in ("public domain","pd-old","pd-art","cc0")):
    manifest["errors"].append(f"Licencia por revisar: {row['title']} / {license_label}")
    continue
  url=info.get("thumburl") or info.get("url")
  if not url:
    manifest["errors"].append(f"Sin URL: {row['title']}")
    continue
  name=f"tafereel-lamina-{i:03}.jpg"
  try:
    if (ASSETS/name).exists(): 
      with Image.open(ASSETS/name) as im: wh=[im.width,im.height]
    else:
      r=REQ.get(url,timeout=70)
      r.raise_for_status()
      wh=save(r.content,ASSETS/name)
    page_url="https://commons.wikimedia.org/wiki/"+quote(row["title"].replace(" ","_"),safe=":(),")
    record={"id":f"T{i:03}","image":"imagenes/"+name,
      "title":row["title"].removeprefix("File:").rsplit(".",1)[0],
      "title_es":spanish,
      "year":1720,"artist":"Autor individual por contrastar","region":"Europa","country":"Países Bajos",
      "source":page_url,
      "source_catalog":page_url,
      "source_type":"Wikimedia Commons / Rijksmuseum y otras colecciones",
      "original_url":info.get("url"),"download_url":url,
      "license":license_label,"dimensions":wh,
      "rights_review":"Obra histórica y licencia declarada en Commons; verificar ficha original, versión y uso editorial",
      "identification":"Título inicial según ficha de Wikimedia, requiere cotejo iconográfico"}
    laminas.append(record)
    manifest["tafereel"].append({"id":record["id"],"web":"./"+record["image"],"source":page_url,"dimensions":wh,"license":license_label})
    print("TAFEREEL_OK",record["id"],row["title"][:65],wh,license_label,flush=True)
    time.sleep(0.45)
  except Exception as e:
    manifest["errors"].append(f"Descarga {prefix}: {str(e)[:125]}")
    print("WARN",str(e)[:150],flush=True)
(ROOT/"laminas.json").write_text(json.dumps({"version":"0.2.0","origen":"Wikimedia Commons","laminas":laminas},ensure_ascii=False,indent=2)+"\n")
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
print("RESULTADO",len(laminas),"láminas 1720 documentadas",flush=True)
