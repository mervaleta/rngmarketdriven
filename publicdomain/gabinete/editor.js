
(function(){
"use strict";
var KEY="siglo23-gabinete-editor-v6",LEGACY_KEY="siglo23-gabinete-editor-v5";
var state={doc:null,candidates:[],view:"grid",active:0,loaded:false,opts:{w:270,h:340,fontSize:11.75,leading:1.48,inner:24,outer:23,top:27,bottom:25,thumb:150,fit:"contain",font:"Georgia,serif"}};
var $=function(s){return document.querySelector(s)};
var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(k){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]})};
var nl=function(s){return String(s||"").split(/\n\s*\n/).filter(Boolean).map(function(x){return "<p>"+esc(x).replace(/\n/g,"<br>")+"</p>"}).join("")};
var pxpermm=96/25.4;
function toast(msg){var el=$("#toast");el.textContent=msg;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){el.hidden=true},3000)}
function imgById(id){return (state.doc.images||[]).find(function(i){return i.id===id})||null}
function imgTag(im,cls,alt,loading){
 if(!im)return "";
 var local=String(im.url||"").indexOf("./imagenes/")===0;
 var fallback=local&&im.source_url?' data-fallback-src="'+esc(im.source_url)+'"':"";
 return '<img class="'+(cls||"")+'" src="'+esc(im.url)+'" alt="'+esc(alt||im.title)+'" loading="'+(loading||"lazy")+'" referrerpolicy="no-referrer"'+fallback+'>';
}
document.addEventListener("error",function(ev){
 var el=ev.target;if(!el||el.tagName!=="IMG")return;
 if(el.dataset.fallbackSrc&&!el.dataset.fallbackUsed){el.dataset.fallbackUsed="1";el.src=el.dataset.fallbackSrc;}
 else{el.classList.add("missing-archive-image");el.title="La reproducción todavía no está disponible";}
},true);
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify({doc:state.doc,opts:state.opts,active:state.active}));$("#saveStatus").textContent="Guardado local · "+new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}catch(e){$("#saveStatus").textContent="Almacenamiento lleno: exportá un respaldo JSON";}}
function syncVars(){
 var o=state.opts;
 [["--w",o.w+"mm"],["--h",o.h+"mm"],["--pt",o.fontSize+"pt"],["--leading",o.leading],["--margin-in",o.inner+"mm"],["--margin-out",o.outer+"mm"],["--margin-top",o.top+"mm"],["--margin-bottom",o.bottom+"mm"],["--fit",o.fit],["--fbody",o.font]].forEach(function(x){document.documentElement.style.setProperty(x[0],x[1])});
 var photos=(state.doc.images||[]).filter(function(i){return i.kind!=="drawing"}).length; var limited=(state.doc.images||[]).filter(function(i){return i.quality==="bajo"}).length;
 var localCount=state.doc.images.filter(function(i){return String(i.url||"").startsWith("./imagenes/")}).length;
 var masterCount=state.doc.images.filter(function(i){return !!i.local_master_url}).length;
 var visualPages=state.doc.pages.filter(function(p){return (p.image&&imgById(p.image))||(Array.isArray(p.images)&&p.images.some(imgById))}).length;
 var uses=new Map();state.doc.pages.forEach(function(p){if(["cover","chapter"].includes(p.kind))return;[...(p.image?[p.image]:[]),...(p.images||[])].forEach(function(id){uses.set(id,(uses.get(id)||0)+1)})});
 var repeats=[...uses.values()].filter(function(x){return x>1}).length;
 $("#totalPages").textContent=state.doc.pages.length+" páginas · "+photos+" fotografías distintas · "+visualPages+" páginas ilustradas · "+(repeats?"ATENCIÓN: "+repeats+" duplicadas interiores":"0 duplicadas interiores")+" · "+localCount+"/"+photos+" web locales · "+masterCount+" másteres · "+limited+" de baja resolución";
 $("#printCss").textContent="@media print{@page{size:"+o.w+"mm "+o.h+"mm;margin:0}}";
}
function pageHtml(pg,idx){
 var im=imgById(pg.image),t=esc(pg.title),section=esc(pg.section),body=nl(pg.body),css="page-actual kind-"+esc(pg.kind)+" "+(idx%2?"verso":"recto");
 var outer='<article class="'+css+'" data-page="'+idx+'">';
 if(pg.kind==="blank"){ /* Página física deliberadamente vacía: retiración, dedicatorias o ajuste a recto. */
 }else if(pg.kind==="reserved"){
  outer+='<div class="page-inner reserved-inner"><span class="kicker">'+section+'</span><h2>'+t+'</h2></div>';
 }else if(pg.kind==="credits"){
  outer+='<div class="page-inner credits-inner"><span class="kicker">'+section+'</span><h2>'+t+'</h2><div class="body-text">'+body+'</div></div>';
 }else if(pg.kind==="cover"){
  outer+='<div class="cover-hero">'+imgTag(im,"",pg.title,"eager")+'</div><div class="cover-copy"><div class="imprint">SIGLO 23 · ARCHIVOS DE LA MIRADA</div><div><h2>'+t+'</h2><div class="cover-sub">'+esc(pg.body)+'</div></div><div class="era">'+esc(pg.sub||"1840–1900")+'</div></div>';
 }else if(pg.kind==="chapter"){
  outer+='<div class="chapter-photo">'+imgTag(im,"",pg.title)+'</div><div class="chapter-content"><span class="chapter-id">'+section+'</span><h2>'+t+'</h2><p>'+esc(pg.body)+'</p></div><div class="chapter-bottom">'+esc(pg.sub||"")+'</div>';
 }else if(pg.kind==="image"){
  outer+='<div class="plate">'+imgTag(im,"","Documento de archivo: "+pg.title)+'</div><div class="plate-info plate-context"><div class="plate-head"><strong>'+t+'</strong><span>'+esc(pg.caption||"")+'</span></div><p class="plate-fact">'+esc(pg.body||(im&&im.context)||"")+'</p><div class="plate-source">'+esc(im?im.museum+" · "+im.accession:"")+' · '+esc(pg.asset_kind||"")+'</div></div>';
 }else if(pg.kind==="fact"||pg.kind==="timeline"){
  outer+='<div class="running">'+section+'</div><div class="page-inner context-inner '+(pg.kind==="timeline"?"timeline-inner":"")+'"><span class="kicker">'+section+'</span><div class="context-date">'+esc(pg.fact_date||"")+'</div><h2>'+t+'</h2><div class="context-highlight">'+esc(pg.factline||"")+'</div><div class="context-rule"></div><div class="context-body">'+body+'</div>'+(pg.source_url?'<div class="context-foot"><a href="'+esc(pg.source_url)+'" target="_blank" rel="noopener">Fuente documental ↗</a></div>':"")+'</div>';
 }else if(pg.kind==="diptych"||pg.kind==="mosaic"){
  var arr=(Array.isArray(pg.images)?pg.images:[]).map(imgById).filter(Boolean);
  outer+='<div class="page-inner gallery-inner"><span class="kicker">'+section+'</span><h2>'+t+'</h2><div class="gallery-photo-grid '+(pg.kind==="diptych"?"diptych-layout":"mosaic-layout")+'">';
  arr.forEach(function(ph,i){outer+='<figure>'+imgTag(ph,"",ph.title)+'<figcaption><b>'+String(i+1).padStart(2,"0")+'</b> '+esc(ph.artist)+' · '+esc(ph.year)+'<small>'+esc(ph.accession)+'</small></figcaption></figure>';});
  outer+='</div><div class="gallery-note">'+esc(pg.body||"")+'</div></div>';
 }else if(pg.kind==="photoessay"||(pg.kind==="analysis"&&im)){
  outer+='<div class="running">'+section+'</div><div class="page-inner pictorial-inner"><span class="kicker">'+section+'</span><h2>'+t+'</h2><div class="pictorial-hero">'+imgTag(im,"",pg.title)+'</div><div class="pictorial-credit">'+esc(im.artist)+' · '+esc(im.year)+' · '+esc(im.accession)+'</div><div class="pictorial-prose">'+body+'</div></div>';
 }else if(pg.kind==="title"){
  outer+='<div class="page-inner"><span class="kicker">Editorial Siglo23 / Estudios visuales</span><h2>'+t+'</h2><div class="decor"></div><div class="body-text">'+body+'</div><span class="big-number">1840—1900</span></div>';
 }else if(pg.kind==="contents"){
  var lines=String(pg.body||"").split("|");
  outer+='<div class="running">'+section+'</div><div class="page-inner"><span class="kicker">Estructura del volumen</span><h2>'+t+'</h2>'+lines.map(function(x,i){return '<div class="toc-row"><span>'+esc(x)+'</span><em>'+(i+1).toString().padStart(2,"0")+'</em></div>'}).join("")+'</div>';
 }else if(pg.kind==="sources"){
  outer+='<div class="running">'+section+'</div><div class="page-inner"><span class="kicker">Archivo / método</span><h2>'+t+'</h2><div class="body-text">'+body+'</div></div>';
 }else{
  outer+='<div class="running">'+section+'</div><div class="page-inner"><span class="kicker">'+section+'</span>';
  if(pg.kind==="analysis"&&im)outer+=imgTag(im,"analysis-thumb","Detalle de "+pg.title);
  outer+='<h2>'+t+'</h2>';
  if(pg.sub)outer+='<p class="deck">'+esc(pg.sub)+'</p>';
  outer+='<div class="body-text">'+body+'</div></div>';
 }
 if(idx>0&&!["image","chapter","blank","credits","reserved"].includes(pg.kind))outer+='<div class="folio">'+(idx+1)+'</div>';
 outer+='</article>';return outer;
}
function placePg(pg,idx,scale,extraClass){
 var w=state.opts.w*pxpermm*scale,h=state.opts.h*pxpermm*scale;
 return '<div class="'+(extraClass||"scaledPage")+'" data-index="'+idx+'" style="width:'+w.toFixed(2)+'px;height:'+h.toFixed(2)+'px"><div style="transform:scale('+scale+');transform-origin:top left;width:'+(state.opts.w*pxpermm).toFixed(1)+'px;height:'+(state.opts.h*pxpermm).toFixed(1)+'px">'+pageHtml(pg,idx)+'</div></div>';
}
function grid(){
 var st=$("#stage"),markup='<div class="stage-title"><span>Libro completo · pliegos físicos</span><span>La tapa es el recto 1: queda sola a la derecha</span></div><div class="book-grid">';
 var w=state.opts.thumb,h=state.opts.h*pxpermm*w/(state.opts.w*pxpermm),scale=w/(state.opts.w*pxpermm);
 function thumbnail(idx){
  var pg=state.doc.pages[idx];
  return '<button type="button" class="thumb '+(idx===state.active?"selected":"")+'" data-open="'+idx+'">'+
      '<div class="thumb-canvas" style="width:'+w+'px;height:'+h.toFixed(1)+'px">'+placePg(pg,idx,scale,"thumb-inner")+'</div>'+
      '<div class="thumb-desc"><span class="thumb-n">'+String(idx+1).padStart(2,"0")+'</span>'+esc(pg.title)+'</div></button>';
 }
 markup+='<section class="mini-spread"><div class="mini-spread-pages"><div class="ghost-thumb" style="width:'+w+'px;height:'+h.toFixed(1)+'px"></div>'+thumbnail(0)+'</div><div class="mini-spread-caption">Tapa · folio 1 impar (derecha)</div></section>';
 for(var first=1;first<state.doc.pages.length;first+=2){
  var left=thumbnail(first);
  var right=first+1<state.doc.pages.length?thumbnail(first+1):'<div class="ghost-thumb" style="width:'+w+'px;height:'+h.toFixed(1)+'px"></div>';
  markup+='<section class="mini-spread"><div class="mini-spread-pages">'+left+right+'</div><div class="mini-spread-caption">Pliego · '+String(first+1).padStart(2,"0")+' (verso) / '+String(first+2).padStart(2,"0")+' (recto)</div></section>';
 }
 markup+='</div>';st.innerHTML=markup;
}
function spread(){
 var stage=$("#stage"),active=state.active,first=active===0?-1:1+2*Math.floor((active-1)/2),second=active===0?0:first+1;
 var space=Math.max(380,stage.clientWidth-65),maxScale=Math.min(.78,(space-15)/(2*state.opts.w*pxpermm));
 var mark='<div class="stage-title"><span>Pliego · '+(first<0?"—":" "+String(first+1).padStart(2,"0"))+' / '+String(second+1).padStart(2,"0")+'</span><span>Recto impar a la derecha · verso par a la izquierda</span></div><div class="spreadstage"><div class="spread">';
 if(first<0){
  mark+='<div class="scaledPage no-facing-page" style="width:'+(state.opts.w*pxpermm*maxScale)+'px;height:'+(state.opts.h*pxpermm*maxScale)+'px"></div>';
 }else if(state.doc.pages[first])mark+=placePg(state.doc.pages[first],first,maxScale,"scaledPage "+(active===first?"active":"")).replace('data-index="'+first+'"','data-open="'+first+'"');
 if(state.doc.pages[second])mark+=placePg(state.doc.pages[second],second,maxScale,"scaledPage "+(active===second?"active":"")).replace('data-index="'+second+'"','data-open="'+second+'"');
 mark+='</div><div class="spreadHelp">Páginas enfrentadas según la encuadernación: tapa en página 1 (recto), retiración en 2 y dedicatorias en 3. Clic en cualquier página para editar.</div></div>';
 stage.innerHTML=mark;
}
function assets(){
 var mark='<div class="stage-title"><span>Banco visual · '+state.doc.images.length+' fotografías registradas</span><span>Preselección; calidad variable y revisión final pendiente</span></div><div class="asset-grid">';
 state.doc.images.forEach(function(im,i){
  var quality=im.quality==="bajo"?"Resolución baja · maqueta únicamente":im.quality==="medio"?"Resolución intermedia · cotejar tamaño":im.quality==="alto"?"Resolución alta declarada · sin preprensa":"Resolución para impresión no comprobada";
  var qualityClass=im.quality==="bajo"?"visual-warning":"visual-status";
  var local=String(im.url||"").startsWith("./imagenes/");
  var hosted=local?"COPIA WEB EN EL PROYECTO":"DESCARGA PENDIENTE; ENLACE EXTERNO";
  var master=im.local_master_url?'<a href="'+esc(im.local_master_url)+'" target="_blank" rel="noopener">Máster propio ↗</a>':"";
  mark+='<article class="asset-card">'+imgTag(im,"","Fotografía histórica "+im.title)+'<div class="details"><div class="eyebrow">ARCHIVO '+String(i+1).padStart(2,"0")+' · '+esc(im.year)+'</div><h3>'+esc(im.title)+'</h3><p>'+esc(im.artist)+'<br>'+esc(im.process)+' · '+esc(im.accession)+'<br>'+esc(im.w)+' × '+esc(im.h)+' px · '+esc(im.license)+'</p><div class="'+qualityClass+'">'+esc(quality)+'</div><div class="asset-host-status">'+esc(hosted)+'</div><p>'+esc(im.review_status||"Original no aprobado para impresión comercial")+'</p><div class="detail-buttons"><a href="'+esc(im.museumUrl)+'" target="_blank" rel="noopener">Ficha de referencia ↗</a><a href="'+esc(im.commons)+'" target="_blank" rel="noopener">Archivo y derechos ↗</a><a href="'+esc(im.url)+'" target="_blank" rel="noopener">Abrir reproducción ↗</a>'+master+'</div></div></article>';
 });
 $("#stage").innerHTML=mark+'</div>';
}
function curation(){
 var arr=state.candidates||[];
 var mk='<div class="stage-title"><span>Curaduría artística · '+arr.length+' obras pendientes</span><span>Belloc, Asser y Nadar ya están incorporadas como láminas</span></div>';
 mk+='<div class="context-view"><div class="eyebrow">EXCLUSIVAMENTE FOTOGRAFÍA DE DESNUDO ARTÍSTICO / SENSUAL</div><h2>El próximo salón de imágenes</h2><p>Estas candidatas todavía necesitan máster descargado, control de reproducción y documentación editorial de las personas representadas. Las tres obras incorporadas ya pueden verse en los pliegos, aunque todavía no están aprobadas para imprenta. No se cuentan dentro de las fotos integradas.</p></div>';
 mk+='<div class="asset-grid">';
 arr.forEach(function(c){
   mk+='<article class="asset-card candidate-card"><div class="details"><div class="eyebrow">'+esc(c.year)+' · '+esc(c.priority)+' prioridad</div><h3>'+esc(c.title)+'</h3><p><strong>'+esc(c.artist)+'</strong><br>'+esc(c.museum)+' · '+esc(c.accession)+'</p><p>'+esc(c.why_selected)+'</p><div class="candidate-status">En investigación · original no incorporado</div><p class="hint warn">'+esc(c.person_age_review||"")+'</p><div class="detail-buttons"><a href="'+esc(c.museum_url)+'" target="_blank" rel="noopener">Ficha en museo ↗</a></div></div></article>';
 });
 mk+='</div>';
 $("#stage").innerHTML=mk;
}
function context(){
 var arr=state.doc.pages.filter(function(p){return ["essay","analysis","fact","timeline"].includes(p.kind)});
 var mark='<div class="context-view"><div class="eyebrow">DOSSIER CRÍTICO</div><h2>El relato detrás de las fotografías</h2><p>El libro no presenta el desnudo académico y la fotografía erótica como categorías idénticas. Investiga la belleza de las fotografías de desnudo, su composición, sus circuitos de circulación y la controversia entre arte, sensualidad y censura.</p>';
 arr.forEach(function(p,i){mark+='<h2 style="font-size:28px;margin-top:25px">'+esc(p.title)+'</h2>'+nl(p.body)});
 mark+='<div class="note">Las interpretaciones no sustituyen las fuentes. Las atribuciones fotográficas, el contexto de las técnicas y las declaraciones de derechos deben cotejarse antes de una edición comercial.</div></div>';
 $("#stage").innerHTML=mark;
}
function sourceInfo(){
 var p=state.doc.pages[state.active],im=imgById(p.image);
 $("#selectionLabel").textContent=String(state.active+1).padStart(2,"0")+" / "+state.doc.pages.length;
 $("#editTitle").value=p.title||"";
 $("#editSection").value=p.section||"";
 $("#editBody").value=p.body||"";
 $("#editSub").value=p.sub||"";
 $("#editCaption").value=p.caption||"";
 $("#editKind").value=p.kind||"essay";
 $("#editImage").innerHTML='<option value="">Sin imagen</option>'+state.doc.images.map(function(i){return '<option value="'+esc(i.id)+'">'+esc(i.artist+" · "+i.title)+'</option>'}).join("");
 $("#editImage").value=p.image||"";
 $("#editImages").value=Array.isArray(p.images)?p.images.join(", "):"";
 $("#editFactDate").value=p.fact_date||"";
 $("#editFactline").value=p.factline||"";
 $("#editFactSource").value=p.source_url||"";
 $("#imageInfo").innerHTML=im?'<div class="meta-card">'+imgTag(im,"","Imagen "+im.title)+'</div><strong>'+esc(im.title)+'</strong><p>'+esc(im.artist)+' · '+esc(im.year)+'</p><p>'+esc(im.museum)+' · '+esc(im.accession)+'</p><p>'+esc(im.w)+' × '+esc(im.h)+' px · '+esc(im.license)+'</p><a target="_blank" rel="noopener" href="'+esc(im.museumUrl)+'">Ficha museística ↗</a><a target="_blank" rel="noopener" href="'+esc(im.commons)+'">Ficha de archivo abierto ↗</a><a target="_blank" rel="noopener" href="'+esc(im.url)+'">Abrir imagen original ↗</a>':'<p class="hint">Esta página no tiene imagen asignada.</p>';
 if(!im&&Array.isArray(p.images)&&p.images.length)$("#imageInfo").innerHTML='<div class="meta-card"><strong>'+p.images.length+' fotografías en esta página</strong><p>'+p.images.map(function(id){var x=imgById(id);return esc(x?x.artist+" · "+x.title:id)}).join("<br>")+'</p></div>';
 if(im&&im.review_approved===false){
  $("#imageInfo").innerHTML+='<div class="'+(im.quality==="bajo"?"visual-warning":"visual-status")+'">'+esc(im.print_warning||"Ficha pendiente de control editorial antes de impresión")+'<br>'+esc(im.review_status||"")+'</div>';
 }
 if(im)$("#imageInfo").innerHTML+='<div class="asset-host-status">'+(String(im.url||"").startsWith("./imagenes/")?"Archivo web propio":"Reproducción pendiente de descargar")+(im.local_master_url?" · máster original disponible":"")+'</div>';
 $("#editImageUrl").value=im?im.url:"";$("#editImageUrl").disabled=!im;
}
function render(){
 if(!state.loaded)return;
 syncVars();document.querySelectorAll("[data-view]").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.view===state.view?"true":"false")});
 $("#prev").disabled=state.active<=0;$("#next").disabled=state.active>=state.doc.pages.length-1;
 if(state.view==="grid")grid();else if(state.view==="spread")spread();else if(state.view==="assets")assets();else if(state.view==="curation")curation();else context();
 sourceInfo();updateWarnings();
}
function updateWarnings(){
 var o=state.opts;$("#formatDisplay").textContent=o.w+" × "+o.h+" mm · "+o.fontSize+" pt";
 $("#marginWarn").textContent=(o.inner+o.outer>=o.w-25||o.top+o.bottom>=o.h-35)?"Márgenes excesivos: la caja de texto puede desaparecer.":"La vista es orientativa; no resuelve partición tipográfica ni PDF/X.";
}
function applyControls(){
 var o=state.opts,ids={w:"sizeW",h:"sizeH",fontSize:"fontSize",leading:"leading",inner:"mInner",outer:"mOuter",top:"mTop",bottom:"mBottom",thumb:"thumb",fit:"fit",font:"bodyFont"};
 Object.keys(ids).forEach(function(k){var el=$("#"+ids[k]);if(el)el.value=o[k]});
}
function setInput(id,value){
 var o=state.opts,n=Number(value);
 var numberIds={sizeW:"w",sizeH:"h",fontSize:"fontSize",leading:"leading",mInner:"inner",mOuter:"outer",mTop:"top",mBottom:"bottom",thumb:"thumb"};
 if(Object.hasOwn(numberIds,id)){
  if(!isFinite(n)||n<0)return;var k=numberIds[id];o[k]=n;
 }else if(id==="fit")o.fit=value;else if(id==="bodyFont")o.font=value;
 else return;
 render();saveLocal();
}
function exportProject(){
 var out={...state.doc,editor_settings:state.opts,active_page:state.active,exported_at:new Date().toISOString()};
 var blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob);
 var a=document.createElement("a");a.href=url;a.download="gabinete-siglo23-proyecto-v"+state.doc.version+".json";a.click();setTimeout(function(){URL.revokeObjectURL(url)},1200);toast("Respaldo JSON descargado");
}
function doPrint(){
 if(!state.loaded)return;
 $("#printRoot").innerHTML=state.doc.pages.map(function(pg,i){return '<section class="print-sheet">'+pageHtml(pg,i)+'</section>'}).join("");
 toast("Prueba de impresión — activar fondos gráficos y formato de página en el diálogo.");
 setTimeout(function(){window.print()},150);
}
function onFieldChange(ev){
 var field=ev.target.dataset.field;if(!field)return;
 var pg=state.doc.pages[state.active];
 var otherUses=new Set();
 state.doc.pages.forEach(function(p){if(p.id===pg.id||["cover","chapter"].includes(p.kind))return;[...(p.image?[p.image]:[]),...(p.images||[])].forEach(function(id){otherUses.add(id)})});
 if(field==="imageUrl"){var im=imgById(pg.image);if(im)im.url=ev.target.value.trim();}
 else if(field==="image"){
   var next=ev.target.value||null;
   if(next&&!["cover","chapter"].includes(pg.kind)&&otherUses.has(next)){toast("Esta imagen ya aparece dentro del libro. Solo puede repetirse en tapa o apertura de capítulo.");render();return;}
   pg.image=next;
 }
 else if(field==="images"){
   var ids=[...new Set(ev.target.value.split(",").map(function(x){return x.trim()}).filter(function(id){return !!imgById(id)}))].slice(0,4);
   if(!["cover","chapter"].includes(pg.kind)&&(ids.some(function(id){return otherUses.has(id)||(pg.image&&pg.image===id)}))){toast("Una o más imágenes ya se usaron en el interior. Solo tapa y capítulos pueden repetir.");render();return;}
   pg.images=ids;
 }
 else if(field==="kind"){
   pg.kind=ev.target.value;
   if(!["cover","chapter"].includes(pg.kind)&&((pg.image&&otherUses.has(pg.image))||(pg.images||[]).some(function(id){return otherUses.has(id)}))){pg.image=null;pg.images=[];toast("Al convertir esta página se liberaron las imágenes duplicadas.")}
 }else pg[field]=ev.target.value;
 normalizeFolio();saveLocal();render();
}
function navigate(delta){
 var i=Math.max(0,Math.min(state.doc.pages.length-1,state.active+delta));if(i!==state.active){state.active=i;state.view="spread";render();}
}
function normalizeFolio(){
 var chosen=state.doc.pages[state.active],chosenId=chosen?chosen.id:null,out=[];
 function blank(id){return {id:id,kind:"blank",section:"Guarda",title:"Blanco de ajuste a página impar",body:"",image:null,caption:"",sub:"",auto_recto:true,physical_role:"ajuste_recto"};}
 state.doc.pages.forEach(function(pg){
  if(pg.auto_recto)return;
  if(pg.kind==="chapter"&&out.length%2===1)out.push(blank("auto_recto_"+pg.id));
  out.push(pg);
 });
 if(out.length%2!==0)out.push({...blank("auto_cierre"),title:"Blanco de cierre"});
 state.doc.pages=out;
 if(chosenId){var idx=out.findIndex(function(p){return p.id===chosenId});state.active=idx>=0?idx:Math.max(0,Math.min(state.active,out.length-1))}
 else state.active=0;
}
function modifyPage(kind){
 var pg=state.doc.pages[state.active];if(!pg)return;
 if(kind==="add"){var item={id:"personal-"+Date.now(),kind:"essay",section:"Nueva sección",title:"Página nueva",body:"Escribí aquí el texto original de Editorial Siglo23.",image:null,caption:"",sub:""};state.doc.pages.splice(state.active+1,0,item);state.active++;}
 else if(kind==="copy"){var clone=JSON.parse(JSON.stringify(pg));clone.id="copia-"+Date.now();clone.title+=" (copia)";if(!["cover","chapter"].includes(clone.kind)){clone.image=null;clone.images=[];if(clone.kind==="image")clone.kind="fact";toast("Duplicaste el texto, pero no la imagen: una sola aparición por fotografía en el interior.");}state.doc.pages.splice(state.active+1,0,clone);state.active++;}
 else if(kind==="delete"){if(state.doc.pages.length<2||!confirm("¿Eliminar esta página del proyecto local?"))return;state.doc.pages.splice(state.active,1);state.active=Math.min(state.active,state.doc.pages.length-1);}
 else if(kind==="up"&&state.active>0){var a=state.active;[state.doc.pages[a-1],state.doc.pages[a]]=[state.doc.pages[a],state.doc.pages[a-1]];state.active--;}
 else if(kind==="down"&&state.active<state.doc.pages.length-1){var a=state.active;[state.doc.pages[a+1],state.doc.pages[a]]=[state.doc.pages[a],state.doc.pages[a+1]];state.active++;}
 normalizeFolio();state.view="spread";saveLocal();render();
}
function initHandlers(){
 $("#stage").addEventListener("click",function(e){var node=e.target.closest("[data-open]");if(node){state.active=Number(node.dataset.open);state.view="spread";render();}});
 document.querySelectorAll("[data-view]").forEach(function(b){b.addEventListener("click",function(){state.view=b.dataset.view;render()})});
 $("#prev").addEventListener("click",function(){navigate(-1)});$("#next").addEventListener("click",function(){navigate(1)});
 ["sizeW","sizeH","fontSize","leading","mInner","mOuter","mTop","mBottom","thumb","fit","bodyFont"].forEach(function(id){$("#"+id).addEventListener("change",function(e){setInput(id,e.target.value)})});
 document.querySelectorAll("[data-field]").forEach(function(el){el.addEventListener("change",onFieldChange)});
 document.querySelectorAll("[data-op]").forEach(function(el){el.addEventListener("click",function(){modifyPage(el.dataset.op)})});
 $("#downloadJSON").addEventListener("click",exportProject);
 $("#importJSON").addEventListener("click",function(){$("#fileInput").click()});
 $("#fileInput").addEventListener("change",async function(e){
  var file=e.target.files[0];if(!file)return;
  try{var d=JSON.parse(await file.text());if(!d||!Array.isArray(d.pages)||!Array.isArray(d.images)||d.pages.length>400)throw Error("Estructura no reconocida");
   state.doc=d;if(d.editor_settings)state.opts={...state.opts,...d.editor_settings};state.active=0;state.view="grid";applyControls();saveLocal();render();toast("Proyecto importado correctamente.");
  }catch(err){alert("No se pudo importar: "+err.message)}e.target.value="";
 });
 $("#resetProject").addEventListener("click",function(){if(confirm("¿Restablecer la edición base? Esto eliminará los cambios del navegador. Exportá antes tu respaldo.")){localStorage.removeItem(KEY);location.reload()}});
 $("#printProof").addEventListener("click",doPrint);
 window.addEventListener("resize",function(){if(state.loaded&&state.view==="spread")render()});
 document.addEventListener("keydown",function(e){if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;if(e.key==="ArrowRight")navigate(1);if(e.key==="ArrowLeft")navigate(-1)});
}
async function boot(){
 initHandlers();
 try{
  var r=await fetch("./libro.json",{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);
  var d=await r.json();state.doc=d;
  try{var cr=await fetch("./seleccion-erotica-lujo.json",{cache:"no-store"});if(cr.ok){var cd=await cr.json();state.candidates=cd.unintegrated_candidates||[]}}catch(e){state.candidates=[]}
  try{
   var saved=JSON.parse(localStorage.getItem(KEY)||"null");
   if(saved&&saved.doc&&Array.isArray(saved.doc.pages)){
     if(saved.doc.version===d.version){state.doc=saved.doc;state.opts={...state.opts,...saved.opts};state.active=Math.min(saved.active||0,state.doc.pages.length-1);}
     else{localStorage.setItem(KEY+"-respaldo-anterior",JSON.stringify(saved));localStorage.removeItem(KEY);$("#saveStatus").textContent="Edición nueva: conservamos un respaldo de la versión anterior en el navegador";}
   }else if(localStorage.getItem(LEGACY_KEY)){
     $("#saveStatus").textContent="Edición nueva. Los cambios previos se conservaron en el navegador con la clave anterior.";
   }
  }catch(e){}
  normalizeFolio();state.loaded=true;applyControls();render();toast("Edición cargada. Tapa impar a la derecha; pliegos emparejados y aperturas de capítulo en recto.");
 }catch(err){$("#stage").innerHTML='<div class="emptyview"><h2>No se pudo cargar libro.json</h2><p>'+esc(err.message)+'</p><p>Publicá este archivo junto con index.html, editor.css y editor.js en el mismo directorio.</p></div>';$("#saveStatus").textContent="Error de carga";}
}
boot();
})();
