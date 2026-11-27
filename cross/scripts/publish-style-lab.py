#!/usr/bin/env python3
"""Build a pinned, self-hosted MakeHuman avatar editor for Cross. No runtime CDN."""
import pathlib, shutil, subprocess, sys, tempfile, json
PIN="1435345c66da752e0e7a3b6cbae2c09bb1766c98"
ROOT=pathlib.Path("cross")
OUT=pathlib.Path("studio-release/cross")
TARGET=OUT/"minijuegos/style-lab/engine"
def replace(s,old,new):
    if old not in s: raise ValueError("Upstream changed: "+old[:80])
    return s.replace(old,new)
def build():
    with tempfile.TemporaryDirectory() as td:
        src=pathlib.Path(td)/"src"
        subprocess.run(["git","init","-q",str(src)],check=True)
        subprocess.run(["git","-C",str(src),"fetch","--depth=1","https://github.com/ffunch/vrm-avatar-maker.git",PIN],check=True)
        subprocess.run(["git","-C",str(src),"checkout","--detach","FETCH_HEAD"],check=True)
        assert subprocess.check_output(["git","-C",str(src),"rev-parse","HEAD"],text=True).strip()==PIN
        for folder in ("editor","assets","lib","vendor"):
            shutil.copytree(src/"web"/folder,TARGET/folder,dirs_exist_ok=True,ignore=shutil.ignore_patterns("mediapipe-tasks-vision-*"))
        for f in ("LICENSE","ASSETS.md"): shutil.copy2(src/f,TARGET/f)
    html=TARGET/"editor/index.html"; s=html.read_text()
    s=replace(s,'lang="en"','lang="es-AR"')
    s=replace(s,'min="0.1875" max="1"','min="0.35" max="1"')
    for a,b in {"VRM Avatar Maker":"Studio · Probador 3D","Start from a ready-made avatar":"Modelos iniciales","<summary>Body</summary>":"<summary>Cuerpo</summary>","Female – Male":"Femenino – Masculino","<summary>Skin and eyes</summary>":"<summary>Piel y ojos</summary>","<summary>Hair</summary>":"<summary>Cabello y pelucas</summary>","<summary>Face shape</summary>":"<summary>Rostro</summary>","<summary>Beard, glasses, eyebrows</summary>":"<summary>Barba, anteojos y cejas</summary>","<summary>Hat</summary>":"<summary>Sombreros</summary>","<summary>Makeup</summary>":"<summary>Maquillaje</summary>","<summary>Clothes</summary>":"<summary>Ropa y calzado</summary>","<summary>Expressions</summary>":"<summary>Expresiones</summary>","Surprise me":"Sorprendeme","Download VRM":"Exportar VRM","Open VRM…":"Abrir VRM…","Loading…":"Cargando modelo 3D…",">Face</button>":">Rostro</button>",">Body</button>":">Cuerpo entero</button>",">Preview</button>":">Animar</button>"}.items(): s=s.replace(a,b)
    s=s.replace('href="/favicon.ico"','href="../icon.svg"').replace('href="/icon.svg"','href="../icon.svg"').replace('href="/apple-touch-icon.png"','href="../icon.svg"')
    s=s.replace('</head>',"""<style>
:root{--bg:#f6eaf2;--panel:#fff8fc;--line:#e5cbdb;--fg:#43293d;--muted:#775d72;--accent:#b96b9c}
#app{flex-direction:row-reverse}#side{border-right:0;border-left:1px solid var(--line);width:min(43%,380px)}
.tile,button.plain,#bar input[type=text],#expr-row select{background:#f2e1ec;color:var(--fg)}.tile img{background:#e7d3e1}
#photo,#share,#fixlink,#panel-fixlink,#send,#open{display:none!important}
#quick{display:block}#camera button{background:#fff9;color:#43293d}#bar{padding:8px}#view canvas{touch-action:none}
@media(max-width:650px){#app{flex-direction:column-reverse}#view{flex:none;height:44vh;min-height:260px}#side{width:100%;flex:1;border:0}#panel{min-height:100px}}
</style></head>""")
    maintained_html=ROOT/"minijuegos/style-lab/engine/editor/index.html"
    if maintained_html.is_file(): s=maintained_html.read_text()
    html.write_text(s)
    js=TARGET/"editor/editor.js";s=js.read_text()
    s=replace(s,'gender: 1, age: 0.5','gender: 0.35, age: 0.5')
    s=replace(s,'style: "short02", color: "#3a281d"','style: "bob01", color: "#3a281d"')
    s=replace(s,'outfit: "male_casualsuit04", top: null, bottom: null, shoes: "shoes02"','outfit: "female_elegantsuit01", top: null, bottom: null, shoes: "shoes05"')
    s=replace(s,'scene.background = new THREE.Color(0x26282b);','scene.background = new THREE.Color(0xf0e0ec);')
    s=replace(s,'scene.add(new THREE.GridHelper(4, 8, 0x555555, 0x3a3a3a));','const floor = new THREE.Mesh(new THREE.CircleGeometry(1.2,64),new THREE.MeshStandardMaterial({color:0xe2cedd,roughness:0.85})); floor.rotation.x=-Math.PI/2;floor.position.y=-0.01;scene.add(floor);')
    s=replace(s,'renderer.setPixelRatio(devicePixelRatio);','renderer.setPixelRatio(Math.min(devicePixelRatio,2));')
    s=replace(s,'let preview = null, previewing = false, previewSeated = true','let preview = null, previewing = false, previewSeated = false')
    s=replace(s,'recipe = merged;','merged.body.age = Math.max(0.35, Number(merged.body.age)||0.5);\n  recipe = merged;')
    s=replace(s,'startHandoff();','// Cross uses only the local editor, no external handoff.')
    s=replace(s,'const linked = await recipeFromLink(location.hash).catch(() => null);','const linked = null;')
    s=replace(s,'const presets = await loadPresets();','const presets = (await loadPresets()).filter(p => Number(p.recipe?.body?.age ?? 0.5) >= 0.35);')
    s=replace(s,'window.avatarEditor = { exportVRM,','window.avatarEditor = { capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL("image/png");}, exportVRM,')
    # The checked-in editor is the authoritative Studio fork; keep fixes on every rebuild.
    maintained=ROOT/"minijuegos/style-lab/engine/editor/editor.js"
    if maintained.is_file(): s=maintained.read_text()
    js.write_text(s)
    # Keep the local network timeout and fitting fixes in the shared library.
    maintained_core=ROOT/"minijuegos/style-lab/engine/lib/avatar-core.js"
    if maintained_core.is_file(): shutil.copy2(maintained_core,TARGET/"lib/avatar-core.js")
    shutil.copy2(ROOT/"minijuegos/style-lab/engine/assets-pack.php",TARGET/"assets-pack.php")
    subprocess.run(["php","-l",str(TARGET/"assets-pack.php")],check=True)
    (TARGET/"icon.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#a13c78"/><path fill="white" d="M16 3 19 13 29 16 19 19 16 29 13 19 3 16 13 13Z"/></svg>')
    # .gz files contain raw gzip bytes for explicit browser decompression.
    (TARGET/".htaccess").write_text("Options -Indexes\n<IfModule mod_mime.c>\nAddType application/octet-stream .gz\nRemoveEncoding .gz\nAddType text/javascript .mjs .js\n</IfModule>\n<IfModule mod_headers.c>\nHeader always set X-Robots-Tag \"noindex, nofollow\"\nHeader always set Referrer-Policy \"no-referrer\"\n</IfModule>\n")
    for rel in ["minijuegos/style-lab/index.php","includes/portal.html"]:
        dst=OUT/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/rel,dst)
    subprocess.run(["php","-l",str(OUT/"minijuegos/style-lab/index.php")],check=True)
    subprocess.run(["node","--input-type=module","--check"],input=js.read_bytes(),check=True)
    print("Pinned editor assets:",sum(1 for p in TARGET.rglob("*") if p.is_file()),flush=True)
if __name__=="__main__":
    if sys.argv[1]=="build":build()
    elif sys.argv[1]=="deploy":
        # Reuse the project's scoped, atomic FTPS uploader, never touches private/.
        import importlib.util
        spec=importlib.util.spec_from_file_location("publish",ROOT/"scripts/publish-encyclopedia.py");mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
        mod.deploy()
