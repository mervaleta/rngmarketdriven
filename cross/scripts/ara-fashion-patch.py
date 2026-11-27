#!/usr/bin/env python3
"""Cross Ara fashion fork: apply a reviewed patch to a pinned upstream checkout."""
from pathlib import Path
import sys, re, shutil

ROOT=Path(sys.argv[1])
PIN="025894503533e59fcaa4dd32e37f0c86f824618c"
def edit(path, fn):
    f=ROOT/path
    s=f.read_text()
    t=fn(s)
    if t==s: raise RuntimeError("No change: "+path)
    f.write_text(t)
def rep(s,a,b):
    if a not in s: raise RuntimeError("Missing upstream anchor: "+a[:120])
    return s.replace(a,b,1)
def quick(s):
    s=rep(s,"export const STYLES: Style[] = [","const originalStyles: Style[] = [")
    s=rep(s,"export const styleById = new Map(STYLES.map((s) => [s.id, s]));",'''// Expose both cuts of each outfit to every adult body. The body is never a wardrobe selector.
export const STYLES: Style[] = originalStyles.flatMap(s => {
  if (s.man && s.woman && s.man !== s.woman) return [
    {...s, id: s.id + '--man', label: s.label + ' · corte A', man: s.man, woman: s.man},
    {...s, id: s.id + '--woman', label: s.label + ' · corte B', man: s.woman, woman: s.woman},
  ];
  const look = s.man ?? s.woman!;
  return [{...s, man: look, woman: look}];
});
export const styleById = new Map(STYLES.map((s) => [s.id, s]));
export function styleThumb(s: Style, g: Gender): string {
  const [id, variant] = s.id.split('--');
  const original = originalStyles.find(x=>x.id===id)!;
  const side = variant || (original[g] ? g : g === 'man' ? 'woman' : 'man');
  return `quick-thumbs/${id}-${side}.png`;
}''')
    a=s.index("  const style = styleById.get(styleOf(p)")
    b=s.index("  return { patch, notes };",a)
    s=s[:a]+"  // Keep hair, accessories, shoes and clothes exactly as chosen.\n  void p; void chosen;\n"+s[b:]
    s=rep(s,"const isExtra = (id: string) => GLASSES", "const isExtra = (id: string) => id.startsWith('cross_tights_') || GLASSES")
    s=rep(s,"  { id: 'teen', label: 'Teen', years: 16 },\n","")
    return s
edit("src/app/ui/quick-data.ts",quick)
def quick_ui(s):
    s=rep(s,"`quick-thumbs/${s.id}-${s[g] ? g : g === 'man' ? 'woman' : 'man'}.png`","Q.styleThumb(s, g)")
    s=rep(s,"const names = Object.keys(PRESETS);","const names = Object.keys(PRESETS).filter(n => (PRESETS[n].age ?? DEFAULT_PARAMS.age) >= yearsToAge(18));")
    s=rep(s,"pickOne(Q.SURPRISE_HAIR[g])","pickOne([...new Set([...Q.SURPRISE_HAIR.man,...Q.SURPRISE_HAIR.woman])])")
    return s
edit("src/app/ui/quick-build.ts",quick_ui)
edit("src/app/ui/sidebar.ts",lambda s:rep(s,"12, 90, 1, (v) => `${v.toFixed(0)} y`","18, 90, 1, (v) => `${v.toFixed(0)} y`"))
def params(s):
    s=rep(s,"const outfits = ids(cat.outfits, female ? 'female' : 'male');","const outfits = ids(cat.outfits);")
    s=rep(s,"hair: pick(r, female ? FEMALE_HAIR : MALE_HAIR),","hair: pick(r, [...new Set([...FEMALE_HAIR, ...MALE_HAIR])]),")
    s=rep(s,"shoes: pick(r, cat.shoes).id,","shoes: r() < 0.35 ? 'heels' : pick(r, cat.shoes).id,")
    s=rep(s,"out.age = num(src.age, yearsToAge(12), 1, base.age);","out.age = num(src.age, yearsToAge(18), 1, Math.max(yearsToAge(18), base.age));")
    return s
edit("src/core/params.ts",params)
def store(s):
    s=rep(s,"import { DEFAULT_PARAMS, type HumanParams }","import { DEFAULT_PARAMS, yearsToAge, type HumanParams }")
    s=rep(s,"  params: HumanParams = loadSaved() ?? { ...DEFAULT_PARAMS, name: 'Athletic man' };","  private adultParams: HumanParams = loadSaved() ?? { ...DEFAULT_PARAMS, name: 'Adult model' };\n  get params(): HumanParams { return this.adultParams; }\n  set params(p: HumanParams) { this.adultParams = {...p, age: Math.max(yearsToAge(18), Number.isFinite(p.age) ? p.age : DEFAULT_PARAMS.age)}; }\n  constructor(){this.params=this.adultParams;}")
    return s
edit("src/app/ui/store.ts",store)
# The catalog uses a conforming body shell, not an externally downloaded garment.
edit("src/core/garments/catalog.ts",lambda s:rep(s,"export const GARMENTS: GarmentDef[] = [",'''const CROSS_TIGHTS: GarmentDef[] = [
  {id:'cross_tights_20',label:'Pantymedias 20 DEN · transparentes',opacity:0.36},
  {id:'cross_tights_60',label:'Pantymedias 60 DEN · semiopacas',opacity:0.72},
  {id:'cross_tights_opaque',label:'Pantymedias · opacas',opacity:1},
].map(({id,label,opacity}):GarmentDef=>({
  id,label,slot:'acc',patterns:['solid'],color:'#29252a',color2:'#29252a',
  build:(g,st)=>shellPart(g,{
    covers:v=>isTrunk(v)&&v.tt<0.22 || v.region===REGION.upperleg || v.region===REGION.lowerleg || v.region===REGION.foot,
    offset:cm(0.12),tile:0.18,relax:0
  },{name:label,color:st.color,roughness:0.78,metalness:0,alpha:opacity===1?'opaque':'blend',opacity,doubleSided:false},opacity===1),
}));
export const GARMENTS: GarmentDef[] = [
  ...CROSS_TIGHTS,'''))
def layer(s):
    s=rep(s,"  for (const id of [d.bottom, d.top, d.jacket, ...d.accessories]) dress(id);","  const tights = d.accessories.filter(id=>id.startsWith('cross_tights_')).slice(-1);\n  for (const id of [...tights,d.bottom,d.top,d.jacket,...d.accessories.filter(id=>!id.startsWith('cross_tights_'))]) dress(id);")
    return s
edit("src/core/garments/index.ts",layer)
edit("src/app/ui/sidebar-clothing.ts",lambda s:rep(s,"store.set({ accessories: has ? store.params.accessories.filter((a) => a !== g.id) : [...store.params.accessories, g.id] });","store.set({ accessories: has ? store.params.accessories.filter((a) => a !== g.id) : [...store.params.accessories.filter(a=>!g.id.startsWith('cross_tights_')||!a.startsWith('cross_tights_')), g.id] });\n      store.emit('sync');"))
# Keep the experimental builder local; don't advertise unrelated upstream apps.
edit("app/index.html",lambda s:rep(rep(s,"<title>3D Character Creator | Ara 3D Gen</title>","<title>Cross · Ara 3D Fashion Lab</title>"),"</head>",'<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><style>#studio-btn,#character-assist-btn,#share-btn,.hdr-docs{display:none!important}</style></head>'))
# Optional MakeHuman compatible garments must be reviewed before import.
# build-assets reads this directory recursively by garment id; copy only explicit approved entries.
if len(sys.argv)>2:
    import json
    packs=Path(sys.argv[2])
    manifest=packs/"manifest.json"
    if manifest.exists():
        config=json.loads(manifest.read_text())
        for item in config.get("garments",[]):
            ident=item["id"]
            if not re.fullmatch(r"cross_[a-z0-9_]+",ident): raise ValueError("Invalid garment id")
            if item["license"]!="CC0-1.0": raise ValueError("Only reviewed CC0 garments accepted")
            if not item.get("source"): raise ValueError("Source required")
            src=packs/ident
            if not src.is_dir() or not list(src.glob("*.mhclo")): raise ValueError("Missing MakeHuman garment")
            for f in src.rglob("*"):
                if f.is_symlink(): raise ValueError("Symlinks not accepted")
            # The upstream system-pack path is resolved during asset setup; see workflow.
            dest=Path(sys.argv[3])/ident
            shutil.copytree(src,dest)
print("Cross wardrobe patch applied")
