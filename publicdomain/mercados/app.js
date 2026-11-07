(() => {
"use strict";
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LIB = "siglo23-mercados-v0.1.0";
let works=[], chapters=[], extras=[], pages=[], pageIndex=0, view="spread", selected={}, notes={}, currentSection="libro", metRequested=false;
const store = () => {try{localStorage.setItem(LIB,JSON.stringify({selected,notes,view,pageIndex}))}catch(e){}};
try{const s=JSON.parse(localStorage.getItem(LIB)||"{}");selected=s.selected||{};notes=s.notes||{};view=s.view||"spread";pageIndex=Number(s.pageIndex)||0;}catch(e){}
const archives=[
["Harvard Baker Library","Kress Graphic Materials · más de mil obras de economía y dinero","https://www.library.hbs.edu/special-collections-and-archives/collections/highlights/kress-graphic-materials"],
["Harvard · Coin and Conscience","Ensayo y exposiciones de dinero, crédito, sátira y poder","https://www.library.hbs.edu/hc/cc/vanityvirtue.html"],
["Harvard · South Sea Bubble","Colecciones documentales y gráficas de la crisis de 1720","https://www.library.hbs.edu/special-collections-and-archives/exhibits/ssb"],
["Rijksmuseum","Grabados neerlandeses, tulipomanía y el espejo de 1720","https://www.rijksmuseum.nl/en/collection/object/Titelprent-voor-het-Tafereel-der-Dwaasheid-1720--478ad94b1f51540705f363154b5cce71"],
["The Metropolitan Museum","Arte europeo, Hogarth y grabados sobre la avaricia","https://www.metmuseum.org/art/collection/search/396205"],
["National Gallery of Art","Daumier y colecciones de litografía francesa Open Access","https://www.nga.gov/artworks/196950-une-panique-la-bourse"],
["Library of Congress","Puck, monopolios, política industrial y caricatura","https://www.loc.gov/item/2001695241/"],
["Universidad de Tokio","Ishimoto Collection · xilografías japonesas de 1855","https://da.dl.itc.u-tokyo.ac.jp/portal/en/assets/7ee7c078-65aa-49e6-9425-e310c278d3b1"],
["Biblioteca Nacional Argentina","El Mosquito · hemeroteca 1863–1893","https://hemerotecadigital.bn.gob.ar/collection/001186398/mosquito"],
["DBNL · Biblioteca neerlandesa","Texto y descargas del Het Groote Tafereel de 1720","https://www.dbnl.org/titels/titel.php?id=_taf002tafe01"],
["NYPL Digital Collections","Versiones e imágenes del libro satírico de 1720","https://old-digitalcollections.nypl.org/collections/het-groote-tafereel-der-dwaasheid"]
];
const lanes=[
["Brasil","Examinar O Malho, Revista Illustrada y caricaturas de crédito y modernización; localizar piezas e identificar autorías.","https://bndigital.bn.gov.br/"],
["México","Revisar fondos sobre Porfiriato, revolución, bancos, deuda y sátira en prensa ilustrada; registrar láminas individuales.","https://hndm.iib.unam.mx/"],
["China","Explorar cultura gráfica de finales de Qing, Shanghái republicano y las publicaciones manhua dedicadas al comercio.","https://www.loc.gov/collections/"],
["India","Relevar prensa satírica colonial y anticolonial: comercio, impuestos y representación del poder económico.","https://www.bl.uk/"],
["Mundo otomano y árabe","Estudiar revistas ilustradas de comienzos del siglo XX sobre impuestos, acreedores y corrupción.","https://www.loc.gov/"],
["Rusia y Europa oriental","Identificar láminas de Krokodil y otras revistas entre guerras, con especial atención a propaganda y derechos.","https://guides.loc.gov/russian-collections/digital-resources/onsite-only"],
["África","Investigar caricatura anticolonial, minería, precios e instituciones financieras en archivos nacionales.","https://www.britishmuseum.org/collection"],
["Siglo XX y digital","Documentar inflación, el crack de 1929, crisis de deuda y memes financieros sin reproducir imágenes protegidas sin licencia.","https://www.library.hbs.edu/special-collections-and-archives/exhibits"]
];
const milestones=[
["1558–1570","El dinero es personaje","Los cofres y las bolsas luchan: la gráfica de Amberes crea metáforas materiales de la avaricia.","Europa · 2 fichas"],
["1637–1640","La euforia de los tulipanes","El gorro del bufón y los monos especuladores construyen una psicología popular de las burbujas.","Países Bajos · 2 fichas"],
["1720–1722","La primera gran sátira bursátil internacional","El Tafereel y Hogarth enfrentan la crisis de acciones en Francia, Países Bajos y Gran Bretaña.","Europa · 4 fichas"],
["1845–1856","La bolsa de Daumier","La litografía describe el pánico y la asimetría de ganancias y pérdidas mediante rostros y gestos.","Francia · 4 fichas"],
["1855","El pez gato y los oficios","Japón representa a los perjudicados y beneficiarios de un terremoto en estampas policromas.","Japón · 2 fichas"],
["1889–1904","Monopolios y crisis transatlántica","El pulpo de Standard Oil y las caricaturas argentinas trasladan los conflictos financieros al debate público.","Estados Unidos y Argentina · 3 fichas"],
["1910–2026","La imagen entra en la era de masas","Se proyecta ampliar hacia propaganda, inflación, nuevos continentes, crisis recientes y humor digital.","Investigación abierta · fichas pendientes"]
];
const editorialIntro=[
"¿Cómo se ve una burbuja? ¿Qué forma tiene el dinero cuando asusta? ¿Cómo se convierte una operación económica en una broma compartida? La historia del arte ofrece respuestas que rara vez aparecen en la historia convencional de las finanzas. En un grabado, el valor de un papel puede convertirse en viento; un monopolio, en un animal; el inversor, en un mono; el pánico, en un tumulto.",
"Este libro propone leer las imágenes como fuentes de la experiencia económica. No pretende demostrar que la sátira haya sido siempre exacta ni que la víctima de una caricatura mereciera su condena. Su atención se dirige al acto cultural por el cual una sociedad expresa visualmente sus temores sobre la riqueza, la desigualdad, el privilegio, la deuda y el deseo de enriquecerse.",
"La edición parte de obras de dominio público o con acceso institucional documentado. El propósito es producir un gran libro físico de arte, con láminas generosas y textos que ayuden a mirar. Las imágenes aún no disponibles en calidad de imprenta permanecen explícitamente señaladas como pendientes. La curaduría se ampliará a todas las regiones que puedan documentarse rigurosamente."
];
function allWorks(){return [...works,...extras.map(ex=>({id:ex.id,titulo:ex.title_es||ex.title,original:ex.title,autor:ex.artist||"Grabador por verificar",anio:"1720",fecha:1720,pais:"Países Bajos",region:"Europa",capitulo:3,tema:["burbujas","acciones","1720","grabado"],tecnica:"Grabado histórico",coleccion:ex.source_type||"Wikimedia Commons / archivos originales",fuente:ex.source_catalog||ex.source,estado:"Registro histórico en revisión",derechos:ex.rights_review||"Verificar ficha e imagen",texto:"Una estampa del gran archivo satírico de 1720. El título histórico y los detalles iconográficos se cotejarán con la institución custodiante antes de cerrar la edición.",lectura:"Una imagen de la crítica visual de la especulación financiera neerlandesa.",_local:"./"+ex.image,imagen:ex.remote_url||"./"+ex.image}))]}
function imageMarkup(w,cls="art-image",small=false){
 const title=esc(w.titulo);
 return '<div class="'+cls+'" data-work="'+esc(w.id)+'"><div class="art-placeholder"><div class="large-dingbat">✦</div><strong>Archivo visual · '+esc(w.anio)+'</strong><span>Imagen de la obra: por confirmar o descargar. Ver ficha institucional.</span></div><img data-image="'+esc(w.id)+'" alt="'+title+' — '+esc(w.autor)+'" loading="'+(small?"lazy":"eager")+'"></div>';
}
function getImg(w){return w._local || w.imagen || "";}
function imageSetup(scope=document){
 scope.querySelectorAll("img[data-image]").forEach(img=>{
   const w=allWorks().find(x=>x.id===img.dataset.image);if(!w)return;
   // Try our own local copy before external sources.
   const local=w._local || "./imagenes/"+w.id+".jpg";
   const fallback=getImg(w);
   if(img.dataset.bound==="1")return;img.dataset.bound="1";
   let state=0;
   img.addEventListener("load",()=>img.classList.add("loaded"));
   img.addEventListener("error",()=>{
     img.classList.remove("loaded");
     if(state===0 && fallback){state=1;img.src=fallback;}else{state=2;img.removeAttribute("src");}
   });
   img.src=local;
 });
}
function makePage(p){
 const w=p.work, c=p.chapter;
 const meta='<div class="pagemeta"><span>EL HUMOR DE LOS MERCADOS</span><span>EDITORIAL SIGLO23</span></div>';
 const foot='<div class="page-footer">'+String(p.number).padStart(2,"0")+'</div>';
 let inner="",extra="";
 switch(p.type){
  case "cover":
    extra="page-cover";inner='<span class="issue">EDICIÓN DE INVESTIGACIÓN · 2026</span><div class="cover-ornament">❧</div><h2>El humor <em>de los mercados</em></h2><div class="cover-note">Una historia visual de las finanzas, la sátira y la imaginación económica</div><span class="cover-mark">SIGLO23 · HISTORIA ILUSTRADA</span>';break;
  case "half":
    inner=meta+'<div class="page-divider"></div><h2>El mercado<br><em>como espectáculo</em></h2><p class="page-lead">Ensayo visual, catálogo crítico y laboratorio de una edición de lujo.</p><div class="page-divider"></div><p class="page-prose">De los grabados del siglo XVI al humor económico contemporáneo. Selección documentada, maquetación en desarrollo.</p>'+foot;break;
  case "editorial":
    inner=meta+'<div class="essay-note">PRESENTACIÓN</div><h2>Antes de entrar<br>al mercado</h2><div class="page-prose">'+editorialIntro.map(t=>'<p>'+esc(t)+'</p>').join("")+'</div>'+foot;break;
  case "toc":
    inner=meta+'<h2>Índice</h2><div class="page-contents">'+chapters.map(ch=>'<div class="toc-row"><small>'+esc(ch.n)+'</small><span>'+esc(ch.titulo)+'</span></div>').join("")+'</div><p class="page-prose">Epílogo · Fuentes · Índices y derechos</p>'+foot;break;
  case "opener":
    extra="page-opener";inner='<span class="eyebrow">PARTE '+esc(c.n)+' · '+esc(c.periodo)+'</span><div class="roman">'+esc(c.n)+'</div><div><h2>'+esc(c.titulo)+'</h2><div class="page-divider"></div><div class="desc">'+esc(c.entradilla)+'</div></div><small>EL HUMOR DE LOS MERCADOS · SIGLO23</small>';break;
  case "essay":
    inner=meta+'<div class="essay-note">CAPÍTULO '+esc(c.n)+' · '+esc(c.eje)+'</div><h2>'+esc(p.part===0?c.titulo:"Una imagen de su tiempo")+'</h2><div class="page-prose">'+p.paragraphs.map(t=>'<p>'+esc(t)+'</p>').join("")+'</div>'+foot;break;
  case "plate":
    extra="page-plate";inner=meta+imageMarkup(w)+'<h3>'+esc(w.titulo)+'</h3><div class="plate-sub">'+esc(w.autor)+' · '+esc(w.pais)+' · '+esc(w.anio)+'</div><div class="plate-foot">LÁMINA '+esc(w.id.replace("M",""))+' · '+esc(w.tecnica)+'</div>'+foot;break;
  case "extra":
    extra="page-plate";inner=meta+imageMarkup(allWorks().find(w=>w.id===p.extra.id))+'<h3>'+esc(p.extra.title_es||p.extra.title)+'</h3><div class="plate-sub">ESTAMPA HISTÓRICA · 1720 · ATRIBUCIÓN INDIVIDUAL EN REVISIÓN</div><div class="plate-foot"><a href="'+esc(p.extra.source_catalog)+'" target="_blank" rel="noopener">Ver registro original de Wikimedia Commons ↗</a></div>'+foot;break;
  case "commentary":
    extra="page-commentary";inner=meta+'<div class="signature">LECTURA DE LA LÁMINA · '+esc(w.id)+'</div><h3>'+esc(w.titulo)+'</h3><p class="page-quote">'+esc(w.lectura)+'</p><div class="page-prose"><p>'+esc(w.texto)+'</p><p>'+esc("Contexto: "+w.pais+" · "+w.anio+". Técnica: "+w.tecnica+". La fuente institucional enlazada permite continuar la investigación iconográfica.")+'</p></div><div class="record"><strong>PROCEDENCIA</strong><div>'+esc(w.coleccion)+'</div><div>Estado: '+esc(w.estado)+'. Derechos: '+esc(w.derechos)+'</div><a href="'+esc(w.fuente)+'" target="_blank" rel="noopener">Consultar ficha original ↗</a></div>'+foot;break;
  case "closing":
    inner=meta+'<div class="essay-note">POSFACIO</div><h2>La economía<br>que nos mira</h2><p class="page-lead">Cada época dibuja el mercado que teme, que admira o que desea entender.</p><div class="page-prose"><p>Cuando la razón económica parece exigir cifras, un artista presenta un animal, un teatro o una máscara. La imagen no reemplaza al dato: le devuelve algo que la cifra rara vez registra, su dimensión humana. Al comparar regiones y siglos, la recurrencia de ciertas figuras no prueba que la historia se repita, pero sí que los mercados vuelven a producir emociones y preguntas reconocibles.</p><p>El volumen seguirá creciendo a medida que se incorporen obras con atribución, documentación y condiciones de reproducción suficientes. El resultado buscado no es un repertorio anecdótico de chistes sobre dinero, sino una historia de las formas en que las sociedades se representaron a sí mismas frente a la riqueza.</p></div>'+foot;break;
  case "blank":
    inner=meta+'<div style="flex:1;display:grid;place-items:center;color:#a59c8d;font-family:var(--serif);font-size:22px;font-style:italic">El humor de los mercados</div>'+foot;break;
  case "colophon":
    inner=meta+'<h2>Nota para la<br>edición impresa</h2><div class="page-prose"><p>Esta maqueta documenta una selección inicial de obras y ensayos, no un original definitivo de imprenta. Las imágenes sin máster disponible están marcadas como tales; no deben sustituirse por ilustraciones inventadas. Los títulos y fichas deberán contrastarse con cada institución custodiante.</p><p>Formato en estudio: 270 × 340 mm · impresión de alta calidad · tapa dura · cuerpo en tipografía de lectura clásica y señalización Montserrat · fotografías o grabados reproducidos con amplia respiración tipográfica.</p><p>Índices previstos: autores, artistas, lugares, episodios económicos, técnicas y colecciones. Fuentes de la investigación: Met, Rijksmuseum, Harvard Baker Library, NGA, Library of Congress, Universidad de Tokio, Biblioteca Nacional argentina, NYPL y DBNL.</p><p>Versión de preproducción: 0.1.0 · 7 de noviembre de 2026.</p></div>'+foot;break;
 }
 return '<article class="paper '+extra+'" data-page="'+p.number+'" aria-label="Página '+p.number+'"><div class="page-inner">'+inner+'</div></article>';
}
function buildPages(){
 pages=[];const add=(type,extra={})=>pages.push({type,...extra,number:pages.length+1});
 add("cover");add("half");add("editorial");add("toc");
 chapters.forEach(ch=>{
   add("opener",{chapter:ch});
   add("essay",{chapter:ch,paragraphs:ch.texto.slice(0,2),part:0});
   add("essay",{chapter:ch,paragraphs:ch.texto.slice(2),part:1});
   works.filter(w=>w.capitulo===chapters.indexOf(ch)+1).forEach(w=>{add("plate",{chapter:ch,work:w});add("commentary",{chapter:ch,work:w})});
   if(ch.n==="III") extras.forEach(ex=>add("extra",{chapter:ch,extra:ex}));
 });
 add("closing");add("colophon");
 while(pages.length%4!==0)add("blank");
 pageIndex=Math.max(0,Math.min(pageIndex,pages.length-1));
}
function stage(){
 $$(".segmented button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
 const el=$("#bookStage");el.innerHTML="";
 if(view==="grid"){
   const grid=document.createElement("div");grid.className="book-grid";
   pages.forEach((p,i)=>{const btn=document.createElement("button");btn.className="page-mini"+(pageIndex===i?" active":"");btn.innerHTML=makePage(p)+'<span class="mini-index">'+String(i+1).padStart(2,"0")+'</span>';btn.addEventListener("click",()=>{pageIndex=i-(i%2);view="spread";stage();store();$("#bookStage").scrollIntoView({behavior:"smooth",block:"start"})});grid.appendChild(btn)});
   el.appendChild(grid);
 }else if(view==="read"){
  const reader=document.createElement("div");reader.className="read-view";
  chapters.forEach(ch=>{
    const d=document.createElement("div");d.className="read-item";d.id="chapter-read-"+ch.n;
    d.innerHTML='<span class="eyebrow">'+esc(ch.n)+' · '+esc(ch.periodo)+'</span><h2>'+esc(ch.titulo)+'</h2><p><em>'+esc(ch.entradilla)+'</em></p>'+ch.texto.map(p=>'<p>'+esc(p)+'</p>').join("");
    reader.appendChild(d);
    works.filter(w=>w.capitulo===chapters.indexOf(ch)+1).forEach(w=>{
     const d2=document.createElement("div");d2.className="read-item";d2.innerHTML=imageMarkup(w)+"<h3>"+esc(w.titulo)+"</h3><span class='eyebrow'>"+esc(w.autor)+" · "+esc(w.anio)+"</span><p>"+esc(w.texto)+"</p><p class='read-source'><a href='"+esc(w.fuente)+"' target='_blank' rel='noopener'>Ficha institucional ↗</a></p>";reader.appendChild(d2)
    })
  });el.appendChild(reader);
 }else{
  pageIndex=pageIndex-(pageIndex%2);
  const spread=document.createElement("div");spread.className="spread";pages.slice(pageIndex,pageIndex+2).forEach(p=>spread.insertAdjacentHTML("beforeend",makePage(p)));el.appendChild(spread);
 }
 imageSetup(el);
 $("#pageCounter").textContent=pages.length+" páginas proyectadas · "+works.length+" obras en inventario";
 const ch=pages[pageIndex]?.chapter;$("#currentChapter").textContent=ch?ch.n+" · "+ch.titulo:"Apertura y aparato editorial";
 $("#rangeLabel").textContent=view==="spread"?(pageIndex+1)+"–"+Math.min(pageIndex+2,pages.length):view==="grid"?"Todos los folios":"Lectura";
 $("#prevPage").disabled=view!=="spread"||pageIndex<=0;$("#nextPage").disabled=view!=="spread"||pageIndex>=pages.length-2;
 $$(".chapter-list button").forEach(b=>b.classList.toggle("active",ch?.n===b.dataset.chapter));
 store();
}
function renderChapters(){
 $("#chapterList").innerHTML=chapters.map((c,i)=>'<button data-chapter="'+esc(c.n)+'"><span class="chapter-no">'+esc(c.n)+'</span><span><strong>'+esc(c.titulo)+'</strong><small>'+esc(c.periodo)+'</small></span></button>').join("");
 $$(".chapter-list button").forEach(b=>b.addEventListener("click",()=>{
  const i=pages.findIndex(p=>p.type==="opener"&&p.chapter?.n===b.dataset.chapter);pageIndex=Math.floor(i/2)*2;view="spread";stage();$("#bookStage").scrollIntoView({behavior:"smooth",block:"start"});
 }));
 $("#filterChapter").insertAdjacentHTML("beforeend",chapters.map((c,i)=>'<option value="'+(i+1)+'">'+esc(c.n)+" · "+esc(c.titulo)+'</option>').join(""));
}
function archive(){
 let list=allWorks().filter(w=>{
  const term=($("#searchWork").value||"").trim().toLowerCase();
  const hay=[w.titulo,w.original,w.autor,w.pais,w.texto,...w.tema].join(" ").toLowerCase();
  return (!term||hay.includes(term))&&(!$("#filterRegion").value||w.region===$("#filterRegion").value)&&(!$("#filterChapter").value||String(w.capitulo)===$("#filterChapter").value);
 });
 const sort=$("#sortWorks").value;
 list.sort((a,b)=>sort==="fecha"?(a.fecha-b.fecha):sort==="pais"?a.pais.localeCompare(b.pais,"es"):a.autor.localeCompare(b.autor,"es"));
 $("#countWorks").textContent=list.length+" obras";
 $("#workGrid").innerHTML=list.map(w=>'<article class="work-card">'+imageMarkup(w,"work-thumb",true)+'<div class="work-info"><div class="work-dateline"><span>'+esc(w.pais)+'</span><span>'+esc(w.anio)+'</span></div><h3>'+esc(w.titulo)+'</h3><div class="author">'+esc(w.autor)+'</div><p>'+esc(w.lectura)+'</p><div class="work-buttons"><button type="button" data-detail="'+esc(w.id)+'">Ver ficha</button><button type="button" class="'+(selected[w.id]?"saved":"")+'" data-select="'+esc(w.id)+'">'+(selected[w.id]?"✓ Seleccionada":"+ Seleccionar")+'</button><a href="'+esc(w.fuente)+'" target="_blank" rel="noopener">Fuente ↗</a></div></div></article>').join("");
 imageSetup($("#workGrid"));
 $$("[data-detail]").forEach(btn=>btn.addEventListener("click",()=>openDetail(btn.dataset.detail)));
 $$("[data-select]").forEach(btn=>btn.addEventListener("click",()=>{const id=btn.dataset.select;selected[id]=!selected[id];store();archive()}));
}
function openDetail(id){
 const w=allWorks().find(x=>x.id===id);if(!w)return;
 $("#lightboxContent").innerHTML='<div class="eyebrow">FICHA '+esc(w.id)+' · '+esc(w.anio)+'</div><h2>'+esc(w.titulo)+'</h2><div class="lightbox-image">'+imageMarkup(w)+'</div><div class="metadata"><div><small>Original</small><strong>'+esc(w.original)+'</strong></div><div><small>Artista / técnica</small><strong>'+esc(w.autor)+' · '+esc(w.tecnica)+'</strong></div><div><small>País y período</small><strong>'+esc(w.pais)+' · '+esc(w.anio)+'</strong></div><div><small>Colección</small><strong>'+esc(w.coleccion)+'</strong></div></div><p>'+esc(w.texto)+'</p><p><strong>Lectura editorial:</strong> '+esc(w.lectura)+'</p><p><strong>Derechos / procedencia:</strong> '+esc(w.derechos)+'</p><a class="source-action" href="'+esc(w.fuente)+'" target="_blank" rel="noopener">Ver registro del museo o biblioteca ↗</a><label for="workNote" class="eyebrow">NOTAS DEL EDITOR</label><textarea id="workNote" placeholder="Observaciones, traducciones, comprobaciones y ajustes de página…">'+esc(notes[w.id]||"")+'</textarea><button class="save" data-save-note="'+esc(w.id)+'">Guardar nota en este navegador</button>';
 $("#lightbox").hidden=false;document.body.style.overflow="hidden";imageSetup($("#lightbox"));
 $$("[data-save-note]").forEach(b=>b.addEventListener("click",()=>{notes[b.dataset.saveNote]=$("#workNote").value;store();b.textContent="✓ Nota guardada"}));
}
function closeDetail(){ $("#lightbox").hidden=true;document.body.style.overflow=""; }
function renderTimeline(){
 $("#timeline").innerHTML=milestones.map(m=>'<article class="timeline-item"><div class="date">'+esc(m[0])+'</div><div><h3>'+esc(m[1])+'</h3><p>'+esc(m[2])+'</p><small>'+esc(m[3])+'</small></div></article>').join("");
 $("#researchLanes").innerHTML=lanes.map(l=>'<article class="lane"><h4>'+esc(l[0])+'</h4><p>'+esc(l[1])+'</p><a href="'+esc(l[2])+'" target="_blank" rel="noopener">Abrir archivo para investigación ↗</a></article>').join("");
 $("#sourcesList").innerHTML=archives.map(a=>'<a href="'+esc(a[2])+'" target="_blank" rel="noopener">'+esc(a[0])+' ↗<small>'+esc(a[1])+'</small></a>').join("");
}
function openSection(id){
 currentSection=id;
 $$(".topnav .tab").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
 $$(".section").forEach(x=>x.classList.toggle("active",x.id==="section-"+id));
 if(id==="archivo")archive();if(id==="libro")stage();window.scrollTo({top:0,behavior:"smooth"});
}
function exportState(){
 const payload={proyecto:"Siglo23 · El humor de los mercados",version:"0.1.0",fecha:new Date().toISOString(),obras:works,laminas:extras,capitulos:chapters,seleccionadas:Object.keys(selected).filter(k=>selected[k]),notas:notes,maqueta:{paginas:pages.length,formato_mm:"270x340",sangrado_mm:3}};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="siglo23-mercados-edicion-0.1.0.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
async function queryMet(){
 if(metRequested)return;metRequested=true;
 await Promise.all(works.filter(w=>w.met&&!w.imagen).map(async w=>{
  try{const r=await fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+w.met);if(!r.ok)return;const d=await r.json();if(d.isPublicDomain&&d.primaryImageSmall){w.imagen=d.primaryImageSmall;$$("img[data-image='"+w.id+"']").forEach(img=>{if(!img.classList.contains("loaded"))img.src=w.imagen});}}catch(e){}
 }));
}
function preparePrint(){
 const container=$("#printRoot");container.innerHTML=pages.map(makePage).join("");imageSetup(container);
 // Let the browser request illustration images, print dialog remains user controlled.
 window.setTimeout(()=>window.print(),450);
}
function bind(){
 $$(".topnav .tab").forEach(b=>b.addEventListener("click",()=>openSection(b.dataset.section)));
 $$("[data-jump]").forEach(b=>b.addEventListener("click",()=>openSection(b.dataset.jump)));
 $("#startReading").addEventListener("click",()=>{$("#section-libro").scrollIntoView({behavior:"smooth"})});
 $$(".segmented button").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;stage()}));
 $("#prevPage").addEventListener("click",()=>{pageIndex=Math.max(0,pageIndex-2);stage()});
 $("#nextPage").addEventListener("click",()=>{pageIndex=Math.min(Math.max(0,pages.length-2),pageIndex+2);stage()});
 $("#topBook").addEventListener("click",()=>{pageIndex=0;view="spread";stage()});
 ["searchWork","filterRegion","filterChapter","sortWorks"].forEach(id=>$("#"+id).addEventListener(id==="searchWork"?"input":"change",archive));
 $("#export").addEventListener("click",exportState);
 $("#print").addEventListener("click",preparePrint);
 $("#closeLightbox").addEventListener("click",closeDetail);
 $$("#lightbox [data-close]").forEach(x=>x.addEventListener("click",closeDetail));
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDetail();if($("#lightbox").hidden&&currentSection==="libro"&&view==="spread"){if(e.key==="ArrowRight"&&pageIndex<pages.length-2){pageIndex+=2;stage()}if(e.key==="ArrowLeft"&&pageIndex>0){pageIndex-=2;stage()}}});
}
async function init(){
 try{
 const [wr,cr,lr]=await Promise.all([fetch("./obras.json?v=0.1.0"),fetch("./capitulos.json?v=0.1.0"),fetch("./laminas.json?v=0.1.0").catch(()=>null)]);if(!wr.ok||!cr.ok)throw new Error("Faltan archivos JSON");
 works=(await wr.json()).obras;chapters=(await cr.json()).capitulos;extras=lr&&lr.ok?(await lr.json()).laminas:[];
 buildPages();renderChapters();renderTimeline();bind();stage();
 $("#statsTop").textContent=works.length+" obras · "+chapters.length+" capítulos · "+extras.length+" estampas de archivo";
 $("#archiveStats").textContent=(works.length+extras.length)+" piezas en inventario · "+extras.length+" estampas de 1720 añadidas";
 // Keep the selected view when returning from another section.
 archive();queryMet();
 }catch(e){$("#bookStage").innerHTML='<div class="loading"><strong>No se cargó el archivo editorial.</strong><p>Comprobar que index.html, app.js, capitulos.json y obras.json estén en el mismo directorio.</p></div>';$("#statsTop").textContent="Archivo no disponible";console.error(e);}
}
init();
})();