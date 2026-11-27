#!/usr/bin/env python3
"""Prepare and optionally publish only the Studio encyclopedia; never touch private/."""
import concurrent.futures, ftplib, hashlib, io, json, os, pathlib, re, shutil, ssl, subprocess, time, urllib.parse, urllib.request
ROOT=pathlib.Path("cross")
OUT=pathlib.Path("studio-release/cross")
RECOVERY=pathlib.Path("studio-image-recovery")
FILES=[
 "includes/.htaccess","includes/encyclopedia-catalog.php","includes/encyclopedia-referrals.php",
 "includes/glossary-images.php","includes/glossary-referrals.json","includes/glossary.json",
 "includes/glossary-images.json","includes/glossary-history.json","includes/encyclopedia-history.php","includes/header.php","includes/encyclopedia.php",
 "assets/encyclopedia.css","assets/encyclopedia.js","assets/encyclopedia-gallery.js","glosario/image.php","glosario/index.php",
 "ropero/index.php","servicios/index.php","includes/looks.json","recursos/looks/index.php","includes/portal.html",
]
def valid_asset(data, rel):
    return 0<len(data)<=12*1024*1024 and data.startswith(b"\x89PNG\r\n\x1a\n" if rel.endswith(".png") else b"\xff\xd8\xff")
def recover_asset(rel, allow_live=False):
    # Only known editorial paths, never arbitrary URLs or private files.
    if not re.fullmatch(r"assets/glossary/(?:commons/[a-f0-9]{32}\.jpg|clothing-dataset/[a-f0-9-]{36}\.jpg|history/(?:met-[0-9]+\.jpg|us[0-9]+a-[0-9]+\.png))",rel):
        raise ValueError("Invalid recovery path")
    for source in [ROOT/rel,*sorted(RECOVERY.glob("*/cross/"+rel),reverse=True)]:
        if source.is_file():
            data=source.read_bytes()
            if valid_asset(data,rel):
                dst=OUT/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data)
                return True
    if allow_live:
        try:
            url="https://rngmarketdriven.com/cross/"+rel
            req=urllib.request.Request(url,headers={"User-Agent":"StudioImageRecovery/1.0"})
            with urllib.request.urlopen(req,timeout=12) as response:
                if urllib.parse.urlsplit(response.geturl()).hostname!="rngmarketdriven.com":return False
                data=response.read(12*1024*1024+1)
            if valid_asset(data,rel):
                dst=OUT/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data)
                print("Recovered existing public image:",rel,flush=True)
                return True
        except Exception:pass
    return False
def set_local(item,rel):
    if len(item)>4:item[4]["local"]=rel
    else:item.append({"local":rel})
def build():
    for rel in FILES:
        target=OUT/rel
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(ROOT/rel,target)
    manifest=json.loads((OUT/"includes/glossary-images.json").read_text())
    items=[item for group in manifest.values() for item in group]
    def prepare(item):
        name=item[0].replace(" ","_")
        digest=hashlib.md5(name.encode()).hexdigest()
        existing=item[4].get("local","") if len(item)>4 else ""
        if existing.startswith("assets/glossary/clothing-dataset/"):
            if not recover_asset(existing,allow_live=True):raise ValueError("Missing versioned dataset photo")
            return True,item[0]
        rel="assets/glossary/commons/"+digest+".jpg"
        dst=OUT/rel
        if recover_asset(rel,allow_live=True):
            set_local(item,rel)
            return True,item[0]
        if len(item)>4:item[4].pop("local",None)
        try:
            url=f"https://upload.wikimedia.org/wikipedia/commons/{digest[0]}/{digest[:2]}/{urllib.parse.quote(name,safe='')}"
            req=urllib.request.Request(url,headers={"User-Agent":"StudioGlossary/1.0 (https://rngmarketdriven.com/cross/glosario/)"})
            with urllib.request.urlopen(req,timeout=20) as response:
                data=response.read(8*1024*1024+1)
            if not data.startswith(b"\xff\xd8\xff") or len(data)>8*1024*1024: raise ValueError("Not a bounded JPEG")
            dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data)
            set_local(item,rel)
            return True,item[0]
        except Exception as exc:
            return False,item[0]+": "+type(exc).__name__
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        results=list(pool.map(prepare,items))
    (OUT/"includes/glossary-images.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    failures=[msg for ok,msg in results if not ok]
    report={"references":len(items),"local_images":len(items)-len(failures),"remote_fallbacks":failures}
    (OUT.parent/"image-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    historical=json.loads((OUT/"includes/glossary-history.json").read_text())
    assets={m["path"]:m for events in historical.values() for event in events for m in event.get("images",[])}
    def fetch_history(m):
        rel=m["path"]
        if not re.fullmatch(r"assets/glossary/history/(?:met-[0-9]+\.jpg|us[0-9]+a-[0-9]+\.png)",rel):raise ValueError("Unsafe history path")
        if recover_asset(rel):return True,rel
        url=m["url"]
        if urllib.parse.urlsplit(url).hostname not in ("collectionapi.metmuseum.org","patentimages.storage.googleapis.com"):raise ValueError("Unknown source")
        try:
            if m.get("met_object_id"):
                with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"StudioGlossary/1.0 (https://rngmarketdriven.com/cross/glosario/)"}),timeout=20) as response:
                    obj=json.load(response)
                if obj.get("objectID")!=m["met_object_id"] or not obj.get("isPublicDomain"):
                    raise ValueError("Met image not confirmed CC0")
                url=obj.get("primaryImageSmall") or obj.get("primaryImage")
                if not url or urllib.parse.urlsplit(url).scheme!="https" or urllib.parse.urlsplit(url).hostname not in ("images.metmuseum.org","collectionapi.metmuseum.org"):
                    raise ValueError("No approved Met image")
            req=urllib.request.Request(url,headers={"User-Agent":"StudioGlossary/1.0 (https://rngmarketdriven.com/cross/glosario/)"})
            with urllib.request.urlopen(req,timeout=25) as response:
                data=response.read(12*1024*1024+1)
            if len(data)>12*1024*1024 or not data.startswith(b"\x89PNG\r\n\x1a\n" if rel.endswith(".png") else b"\xff\xd8\xff"):raise ValueError("Unexpected image format")
            dst=OUT/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data)
            return True,rel
        except Exception as exc:return False,rel+": "+type(exc).__name__
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        hist_results=list(pool.map(fetch_history,assets.values()))
    report["historical_references"]=len(assets)
    report["historical_local"]=sum(ok for ok,_ in hist_results)
    report["historical_failures"]=[msg for ok,msg in hist_results if not ok]
    (OUT.parent/"image-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(report,ensure_ascii=False))
    for f in OUT.rglob("*.php"):subprocess.run(["php","-l",str(f)],check=True)
def deploy():
    host=os.environ.get("STUDIO_FTP_HOST","");user=os.environ.get("STUDIO_FTP_USER","");password=os.environ.get("STUDIO_FTP_PASSWORD","")
    if not all([host,user,password]):
        raise SystemExit("No configured FTPS credentials. Release artifact is ready; publish via hPanel or configure STUDIO_FTP_* secrets.")
    remote=os.environ.get("STUDIO_FTP_ROOT") or "public_html/cross"
    if not remote.rstrip("/").endswith("/cross"):raise SystemExit("FTP root must point to the existing cross directory")
    context=ssl.create_default_context()
    with ftplib.FTP_TLS(context=context,timeout=30) as ftp:
        ftp.connect(host,int(os.environ.get("STUDIO_FTP_PORT") or "21"));ftp.login(user,password);ftp.prot_p()
        ftp.cwd(remote);root=ftp.pwd()
        # Abort on wrong target: require existing Studio entry and protection.
        for rel in ("index.php","includes/.htaccess","private/.htaccess"):
            ftp.voidcmd("TYPE I")
            if not ftp.size(rel):raise SystemExit("Existing Studio structure not confirmed")
        def store(path):
            rel=path.relative_to(OUT).as_posix()
            if rel.startswith("private/"):raise ValueError("Private path")
            parts=rel.split("/");ftp.cwd(root)
            for part in parts[:-1]:
                try:ftp.cwd(part)
                except ftplib.error_perm:ftp.mkd(part);ftp.cwd(part)
            name=parts[-1];tmp="."+name+".studio-upload-"+os.environ.get("GITHUB_RUN_ID","manual")
            with path.open("rb") as f:ftp.storbinary("STOR "+tmp,f)
            ftp.rename(tmp,name)
            print("Published",rel,flush=True)
        # Assets and dependencies first, then catalogs and public entry points.
        files=[p for p in OUT.rglob("*") if p.is_file()]
        def order(p):
            rel=p.relative_to(OUT).as_posix()
            if rel.startswith("assets/"):return 0
            if rel in ("includes/encyclopedia-catalog.php","includes/glossary-images.php","includes/encyclopedia-referrals.php","includes/encyclopedia-history.php","includes/.htaccess"):return 1
            if rel.endswith(".json"):return 2
            if rel=="includes/encyclopedia.php":return 4
            return 3
        for path in sorted(files,key=lambda p:(order(p),str(p))):store(path)
def verify():
    base="https://rngmarketdriven.com/cross/"
    def read(rel):
        req=urllib.request.Request(base+rel+("&" if "?" in rel else "?")+"studio_check="+str(time.time_ns()),headers={"Cache-Control":"no-cache","User-Agent":"StudioReleaseCheck/1.0"})
        with urllib.request.urlopen(req,timeout=25) as res:return res.read(),res.headers.get_content_type()
    for rel,needle in [("glosario/index.php","Glosario cross"),("ropero/index.php","Ropero"),("servicios/index.php","Servicios"),("glosario/index.php?f=culotte","¿A cuál te referís?"),("glosario/index.php?f=vestido","Clothing Dataset"),("recursos/looks/index.php","Looks completos"),("recursos/looks/index.php?f=oficina-clasica","Oficina clásica"),("recursos/looks/index.php","look-preview-grid"),("glosario/index.php?f=corpino","enc-fiche-tabs")]:
        for attempt in range(8):
            try:
                data,_=read(rel)
                if needle.encode() in data:break
            except Exception:pass
            if attempt<7:time.sleep(8)
        else:raise ValueError("Live content not confirmed: "+rel)
    manifest=json.loads((OUT/"includes/glossary-images.json").read_text())
    failures=[]
    for slug,items in manifest.items():
        for i,item in enumerate(items):
            rel=item[4].get("local") if len(item)>4 else None
            if not rel:continue # external references are separately reported by the build
            try:
                data,ctype=read(rel)
                if ctype!="image/jpeg" or not data.startswith(b"\xff\xd8\xff"):raise ValueError("Not JPEG")
                if len(item)>4 and item[4].get("local") and data!=(OUT/rel).read_bytes():raise ValueError("Different bytes")
            except Exception as e:failures.append((slug,i,type(e).__name__))
    for p in (OUT/"assets/glossary/history").glob("*"):
        rel=p.relative_to(OUT).as_posix()
        try:
            data,ctype=read(rel)
            if data!=p.read_bytes():raise ValueError("Different historical image bytes")
        except Exception as e:failures.append((rel,type(e).__name__))
    print("Image failures:",json.dumps(failures))
    if failures:raise SystemExit("Some live images failed verification")
if __name__=="__main__":
    import sys
    {"build":build,"deploy":deploy,"verify":verify}[sys.argv[1]]()
