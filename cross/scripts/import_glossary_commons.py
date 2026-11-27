"""Import only explicitly selected Commons titles and verify their individual licenses."""
import hashlib, html, io, json, pathlib, re, time, urllib.parse, urllib.request
from PIL import Image, ImageOps
UA="StudioFashionCatalog/1.0 (https://rngmarketdriven.com/cross/glosario/)"
def fetch(url,limit=24*1024*1024):
    for attempt in range(3):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"*/*"})
            with urllib.request.urlopen(req,timeout=22) as r:
                data=r.read(limit+1)
                if len(data)>limit:raise ValueError("Too large")
                return data
        except Exception as e:
            if getattr(e,"code",0) not in (429,500,502,503,504) or attempt==2:raise
            time.sleep(3*(attempt+1))
def clean(value):
    return " ".join(html.unescape(re.sub(r"<[^>]+>"," ",str(value))).split())
def metadata(files):
    params={"action":"query","titles":"|".join("File:"+f for f in files),"prop":"imageinfo","iiprop":"url|extmetadata","iiurlwidth":"800","format":"json","formatversion":"2"}
    data=json.loads(fetch("https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(params)))
    return {p["title"][5:].replace("_"," "):p["imageinfo"][0] for p in data.get("query",{}).get("pages",[]) if p.get("imageinfo")}
def import_selected(root,out,manifest):
    rows=json.loads((root/"includes/glossary-image-candidates.json").read_text())
    seen={(slug,m[0]) for slug,items in manifest.items() for m in items if len(m)>4 and m[4].get("local") and (out/m[4]["local"]).is_file()}
    rows=[r for r in rows if (r["slug"],r["file"]) not in seen]
    files=list(dict.fromkeys(r["file"] for r in rows))
    info={}
    for i in range(0,len(files),18):
        try:info.update(metadata(files[i:i+18]))
        except Exception as exc:print("Commons metadata batch:",type(exc).__name__,flush=True)
        time.sleep(.5)
    success=[];failures=[]
    for row in rows:
        f=row["file"];name=f.replace(" ","_");digest=hashlib.md5(name.encode()).hexdigest()
        rel="assets/glossary/commons/"+digest+".jpg";dst=out/rel
        try:
            meta=info.get(f,{})
            ext=meta.get("extmetadata",{})
            val=lambda key:clean(ext.get(key,{}).get("value",""))
            licurl=val("LicenseUrl").rstrip("/")
            license_match=re.fullmatch(r"https?://creativecommons.org/licenses/(by(?:-sa)?)/([1-4]\.[05])",licurl)
            if "creativecommons.org/publicdomain/zero/1.0" in licurl:license="cc0"
            elif license_match:license=license_match.group(1)+"/"+license_match.group(2)
            elif row["kind"]=="drawing" and not meta:license="cc0" # exact titles in the documented MoMu collection
            else:raise ValueError("No confirmed commercial license")
            author="David Ring / Europeana Fashion / MoMu" if row["kind"]=="drawing" else val("Artist")
            if not author:raise ValueError("No author")
            url=meta.get("thumburl") if f.lower().endswith((".tif",".tiff",".png")) else meta.get("url")
            if not url:
                if not f.lower().endswith((".jpg",".jpeg")):raise ValueError("No compatible thumbnail")
                url=f"https://upload.wikimedia.org/wikipedia/commons/{digest[0]}/{digest[:2]}/{urllib.parse.quote(name,safe='')}"
            if urllib.parse.urlsplit(url).hostname!="upload.wikimedia.org":raise ValueError("Unexpected host")
            if not dst.is_file():
                try:data=fetch(url)
                except Exception:
                    alt=meta.get("thumburl")
                    if not alt or alt==url or urllib.parse.urlsplit(alt).hostname!="upload.wikimedia.org":raise
                    data=fetch(alt)
                with Image.open(io.BytesIO(data)) as im:
                    im=ImageOps.exif_transpose(im);im.thumbnail((1200,1200))
                    if im.mode in ("RGBA","LA"):
                        bg=Image.new("RGB",im.size,"white");bg.paste(im.convert("RGBA"),mask=im.convert("RGBA").getchannel("A"));im=bg
                    else:im=im.convert("RGB")
                    dst.parent.mkdir(parents=True,exist_ok=True);im.save(dst,"JPEG",quality=90,optimize=True)
            item=[f,author[:400],license,row["caption"]+" · versión redimensionada",{"local":rel,"kind":row["kind"]}]
            items=manifest.setdefault(row["slug"],[])
            old=next((i for i,m in enumerate(items) if m[0]==f),None)
            if old is not None:items[old]=item
            elif row["kind"]=="photo":items.insert(0,item)
            else:items.append(item)
            success.append({"slug":row["slug"],"file":f,"kind":row["kind"]})
        except Exception as exc:
            failures.append({"slug":row["slug"],"file":f,"reason":str(exc)[:100]})
        time.sleep(.25)
    return {"added":success,"pending":failures}
