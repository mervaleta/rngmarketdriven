
/* Siglo23 M02 — libro completo: miniaturas, página a página y manuscritos por sección. */
(function(){
'use strict';
const api=window.S23Layout;
if(!api){console.warn('Siglo23: falta el motor principal de maquetación');return;}
const $=s=>document.querySelector(s);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mode='overview',selected=1,thumbSize=96,searchTerm='',tokens=new Map(),sourceNotice='';
const formatNum=n=>Number(n||0).toLocaleString('es-AR');
const data=()=>({state:api.getState(),plan:api.getPlan()});
function entryFor(page,plan){
 if(page<1||page>plan.total)return null;
 return plan.items.find(x=>page>=x.start&&page<=x.end)||null;
}
function chunkFor(section,offset,totalPages){
 const source=api.getSectionText(section);
 if(!source||!source.trim())return null;
 let cached=tokens.get(section);
 if(!cached||cached.source!==source){
  const paragraphs=source.trim().split(/\n\s*\n/).filter(Boolean);
  const wordList=[],breaks=new Set();
  for(const paragraph of paragraphs){
   const ws=paragraph.match(/\S+/g)||[];
   if(ws.length){breaks.add(wordList.length);wordList.push(...ws)}
  }
  cached={source,words:wordList,breaks};tokens.set(section,cached);
 }
 const words=cached.words,n=words.length,lo=Math.floor(n*offset/totalPages),hi=Math.floor(n*(offset+1)/totalPages);
 const fragments=[],chunk=[];
 for(let i=lo;i<hi;i++){
  if(i>lo&&cached.breaks.has(i)){fragments.push(chunk.splice(0).join(' '))}
  chunk.push(words[i]);
 }
 if(chunk.length)fragments.push(chunk.join(' '));
 return {html:fragments.join('\n\n'),start:lo+1,end:hi,count:n,filename:section};
}
function infoFor(page,plan){
 const item=entryFor(page,plan);
 if(!item)return {page,blank:true,title:'Fuera del volumen',text:'',isReal:false,section:'',index:0};
 if(item.blank)return {page,blank:true,title:item.name,text:'',isReal:false,section:'',index:page-item.start};
 const index=page-item.start;
 if(item.opening)return {page,blank:false,opening:true,openingSide:index===0?'verso':'recto',openingKind:item.openingKind,chapterTitle:item.chapterTitle,ordinal:item.ordinal,title:item.name,section:item.id,index,isReal:false,text:'',totalInSection:2};
 if(['index-onomastic','index-analytic','index-works'].includes(item.id)&&window.S23Indices?.ready(item.id))return {page,blank:false,title:item.name,section:item.id,index,idx:true,isReal:true,text:window.S23Indices.plain(item.id,index)};
 if(item.figure){
  const figure=window.S23BookAssets?.figures?.find(x=>x.id===item.figureId);
  return {page,blank:false,figure:true,figureMeta:figure,figureSide:index===0?'left':'right',title:item.name,section:'plates',index,text:figure?.credit||'',totalInSection:item.pages,isReal:false};
 }
 const segment=chunkFor(item.id,index,item.pages);
 return {page,blank:false,title:item.name,section:item.id,index,segment,isReal:!!segment,text:segment?.html||'',totalInSection:item.pages};
}
function snippet(info,limit=180){return info.isReal?info.text.slice(0,limit):(info.blank?'':('Sección: '+info.title+'. Texto todavía no importado.'));}
function cardFor(i,plan,config){
 const info=infoFor(i,plan),isBlank=info.blank,isPlate=info.section==='plates',isTitle=['half','title'].includes(info.section);
 let body='';
 if(info.figure){const a=info.figureMeta;body=a?'<div class="thumb-figure"><img src="'+esc(a.src)+'" alt="'+esc(a.title)+'" loading="lazy" style="width:100%;height:70%;object-fit:contain"><small>'+esc(a.title)+'</small></div>':'<div class="thumb-figure">Ilustración pendiente</div>';}
 else if(info.idx)body='<div class="thumb-index"><strong>'+esc(info.title)+'</strong><span>'+esc(info.text.slice(0,170))+'</span></div>';
 else if(info.opening){
  const roman=info.openingKind==='notes'?'§':['I','II','III','IV'][info.ordinal-1]||String(info.ordinal||'');
  body='<div class="thumb-opening"><span>'+(info.openingKind==='notes'?'APARATO CRÍTICO':'SPENCER · 1884')+'</span><strong>'+esc(info.openingSide==='verso'?roman:info.chapterTitle)+'</strong><i></i></div>';
 }else if(!isBlank){
  body=isPlate?'<div class="thumb-figure">Ilustración<br>pendiente</div>':(isTitle?'<h4>'+esc(config.title)+'</h4>':'<div class="thumb-reading'+(info.isReal?'':' demo')+'">'+esc(snippet(info,600))+'</div>');
 }
 const openingClass=info.opening?' opening '+(info.openingSide==='verso'?' opening-left':' opening-right'):'';
 const thumb='<div class="thumb-page'+(isBlank?' blank':'')+openingClass+'"><span class="thumb-running">'+esc(info.opening?'APERTURA EDITORIAL':info.title)+'</span>'+(info.index===0&&!isBlank&&!isTitle&&!info.opening?'<h4>'+esc(info.title)+'</h4>':'')+body+'<span class="thumb-number">'+i+'</span></div>';
 const subtitle=info.figure?'Ilustración '+(info.figureMeta?.type==='spread'?'· pliego doble':'· lámina simple'):info.idx?'Índice real · entradas paginadas':info.opening?'Pliego de apertura · '+(info.openingSide==='verso'?'izquierda':'derecha'):(info.isReal?'Texto importado · '+formatNum(info.segment?.start)+'–'+formatNum(info.segment?.end)+' palabras':(isBlank?'Blanco de composición':'Texto pendiente de importar'));
 return '<button type="button" class="thumb-card'+(isBlank?' blank':'')+(info.isReal?' real':'')+(info.opening?' opener':'')+'" data-page="'+i+'" aria-current="'+String(i===selected)+'" aria-label="Abrir página '+i+', '+esc(info.title)+'"><span class="thumb-meta">PÁGINA '+i+'</span>'+thumb+'<span class="thumb-sub" title="'+esc(info.title)+'">'+esc(info.title)+'</span><span class="thumb-state">'+esc(subtitle)+'</span></button>';
}
function paintGrid(){
 const {state,plan}=data(),root=$('#fullGrid');
 root.style.setProperty('--thumb-width',thumbSize+'px');
 root.style.setProperty('--thumb-ratio',plan.w+' / '+plan.h);
 root.style.setProperty('--body-font',state.font);
 root.style.setProperty('--body-weight',state.fontWeight||400);
 root.style.setProperty('--body-style',state.fontStyle||'normal');
 root.style.setProperty('--heading-font',state.headingFont||'Georgia,serif');
 root.style.setProperty('--heading-weight',state.headingWeight||400);
 root.style.setProperty('--heading-style',state.headingStyle||'normal');
 const term=searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
 const matches=[];
 for(let n=1;n<=plan.total;n++){
  const info=infoFor(n,plan);
  if(term){
   const text=(String(n)+' '+info.title+' '+(info.text||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
   if(!text.includes(term))continue;
  }
  matches.push(n);
 }
 root.innerHTML=matches.map(n=>cardFor(n,plan,state)).join('');
 $('#gridCount').textContent=formatNum(matches.length)+' de '+formatNum(plan.total)+' páginas';
 $('#thumbZoomValue').textContent=thumbSize+' px';
}
function openingPage(info){
 const isNotes=info.openingKind==='notes';
 const roman=isNotes?'§':['I','II','III','IV'][info.ordinal-1]||String(info.ordinal);
 if(info.openingSide==='verso')return '<div class="literary-verso"><span class="literary-top">SIGLO23 · CLÁSICOS DEL PENSAMIENTO</span><div class="literary-emblem">'+roman+'</div><span class="literary-hairline"></span><span class="literary-bottom">'+(isNotes?'FUENTES · VARIANTES · CONTEXTO':'LOS ENSAYOS DE 1884')+'</span></div>';
 return '<div class="literary-recto"><span class="literary-top">HERBERT SPENCER · 1884</span><div class="literary-title-block"><span class="literary-kicker">'+(isNotes?'APARATO CRÍTICO':'ENSAYO '+roman)+'</span><span class="literary-line"></span><h2>'+esc(info.chapterTitle)+'</h2><div class="literary-ornament">✧</div><p>'+(isNotes?'Referencias, variantes y comentarios de la edición':'The Man versus the State')+'</p></div><span class="literary-bottom">EDICIÓN SIGLO23 · MAQUETA DE ESTUDIO</span></div>';
}
function figurePage(info){
 const a=info.figureMeta;
 if(!a)return '<div class="figure">Imagen no disponible</div>';
 const isSingle=a.type==='single';
 const caption='<div class="s23-art-caption"><b>'+esc(a.creator)+' · '+esc(a.title)+' ('+esc(a.year)+')</b><span>'+esc(a.credit)+'</span></div>';
 return '<div class="s23-plate-page '+(isSingle?'single':info.figureSide)+'"><div class="s23-art-frame"><img src="'+esc(a.src)+'" alt="'+esc(a.title)+'" loading="lazy"></div>'+(isSingle||info.figureSide==='right'?caption:'')+'</div>';
}
function bibliographyPage(info){
 const item=window.S23BookAssets?.bibliography?.[info.index];
 if(!item)return '<div class="s23-bib-page">Fuentes pendientes de revisión</div>';
 return '<div class="s23-bib-page"><span class="chapter-kicker">SIGLO23 · REFERENCIAS</span><h2>'+esc(item.heading)+'</h2><div class="chapter-rule"></div><ol>'+item.entries.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><p class="s23-bib-note">Documentación preliminar. Verificar fuentes, derechos y datos editoriales antes de cerrar la edición.</p></div>';
}
function pageContent(info){
 const state=api.getState();
 if(info.opening)return openingPage(info);
 if(info.idx)return window.S23Indices.render(info.section,info.index,api.getPlan());
 if(info.figure)return figurePage(info);
 if(info.section==='bibliography')return bibliographyPage(info);
 if(info.blank)return '<div class="frontmatter"><span class="edition" style="color:#a2aaa0">'+esc(info.title)+'</span></div>';
 if(info.isReal){
  const first=info.index===0&&/^original-(new-toryism|coming-slavery|sins-legislators|great-superstition)$/.test(info.section);
  const lead=first?'<div class="literary-reading-label">HERBERT SPENCER <span>◆</span> 1884</div>':'';
  return lead+'<div class="text-body actual-text'+(first?' chapter-first':'')+'" lang="'+(info.section.startsWith('original-')?'en':'es')+'">'+info.text.split(/\n\n+/).filter(Boolean).map(p=>'<p>'+esc(p)+'</p>').join('')+'</div>';
 }
 if(info.section==='plates')return '<div class="figure">ILUSTRACIÓN HISTÓRICA<br><br>Sin imagen cargada</div><p class="figcaption">'+esc(info.title)+' — material no incorporado todavía.</p>';
 const front=['half','title','legal'].includes(info.section);
 return '<div class="frontmatter"><span class="publisher">'+esc(state.imprint)+'</span><span class="booktitle" style="font-size:22pt">'+esc(info.title)+'</span><div class="rule"></div><span class="edition">'+(front?'Página preliminar de muestra':'Texto pendiente de importar')+'</span></div>';
}
function renderedPage(page,side){
 const {state,plan}=data(),info=infoFor(page,plan);
 const marginGuide=state.showGuides?'<div class="guides"></div><div class="bleed-guide"></div>':'';
 if(page<1||page>plan.total)return '<div class="mock-page '+side+'"><div class="content"><span class="blank-name">Sin página</span></div></div>';
 const run=state.showRunning&&!info.blank&&!info.opening&&!info.figure?'<span class="running">'+esc(side==='verso'?state.author:state.title)+'</span>':'';
 const fol=state.showFolios&&!info.blank&&!info.opening&&!info.figure?'<span class="folio">'+page+'</span>':'';
 return '<div class="mock-page '+side+(info.opening?' opening-leaf '+(info.openingSide==='verso'?'opening-verso':'opening-recto'):'')+'">'+run+'<div class="content">'+pageContent(info)+'</div>'+fol+marginGuide+'</div>';
}
function pairLeft(page){return page%2===0?page:page-1}
function fullTexts(page){
 const {plan}=data(),left=pairLeft(page),right=left+1;
 let out='<section class="full-text-inspector"><h3>Texto completo de estas páginas, según la estimación</h3><p>El contenido debajo no se recorta: podés comprobar qué palabras quedaron asignadas a cada cara del pliego. El corte es aproximado, no tipográficamente exacto.</p><div class="full-text-grid">';
 for(const n of [left,right]){
  const info=infoFor(n,plan);
  out+='<article><strong>Página '+(n<1?'—':n)+' · '+esc(info.title)+'</strong>';
  if(info.idx)out+='<small>Fichas completas del archivo · folios orientativos</small>';
   if(info.figure)out+='<small>Imagen histórica: '+esc(info.figureMeta?.creator)+' · '+esc(info.figureMeta?.year)+'</small>';
   if(info.section==='bibliography')out+='<small>Referencia bibliográfica: página '+(info.index+1)+' de 2</small>';
   if(info.segment)out+='<small>Palabras '+formatNum(info.segment.start)+'–'+formatNum(info.segment.end)+' / '+formatNum(info.segment.count)+'</small>';
  out+='<div class="full-text-body">'+esc(info.isReal?info.text:(info.blank?'Blanco intencional de composición.':info.opening?'Pliego de apertura tipográfica, sin texto del original.':'Todavía no hay texto importado para esta sección.'))+'</div></article>';
 }
 return out+'</div></section>';
}
function paintSpread(){
 const {state,plan}=data();
 selected=Math.min(plan.total,Math.max(1,selected));
 const left=pairLeft(selected),right=left+1,isValid=plan.total>0;
 $('#jumpPage').value=selected;$('#jumpPage').max=plan.total;
 $('#prevSpread').disabled=left<=0;$('#nextSpread').disabled=right>=plan.total;
 $('#viewName').textContent='Pliego '+(left<1?'guarda':left)+'–'+right;
 $('#previewMode').textContent='Pliego seleccionado · '+formatNum(selected)+' / '+formatNum(plan.total);
 const currentVars=api.getVars(),actualW=(2*plan.w)*96/25.4+13;
 const zoom=state.zoom||.62,host=$('#previewHost');
 host.style.width=Math.ceil(actualW*zoom)+'px';host.style.height=Math.ceil(plan.h*96/25.4*zoom)+'px';
 host.innerHTML=isValid?'<div id="liveSpread" class="spread interior-spread" style="'+esc(currentVars)+';transform:scale('+zoom+')">'+renderedPage(left,'verso')+renderedPage(right,'recto')+'</div>':'<p>No hay páginas disponibles.</p>';
 let extra=$('#fullTextExcerpt');
 if(!extra){extra=document.createElement('div');extra.id='fullTextExcerpt';host.insertAdjacentElement('afterend',extra)}
 extra.innerHTML=fullTexts(selected);
 $('#metricSize').textContent=Number(plan.w).toLocaleString('es-AR')+' × '+Number(plan.h).toLocaleString('es-AR')+' mm';
 $('#guideKey').hidden=false;
}
function setMode(value,page){
 if(value==='sheet'&&Number.isFinite(page))selected=Math.max(1,Math.trunc(page));
 mode=value;
 const grid=value==='overview',sheet=value==='sheet',custom=grid||sheet;
 $('#overviewToolbar').hidden=!grid;
 $('#spreadToolbar').hidden=!sheet;
 $('#previewArea').hidden=false;
 $('#previewArea').classList.toggle('grid-active',grid);
 $('#fullGrid').hidden=!grid;
 $('#singlePageLabels').hidden=grid;
 $('#sceneNav').hidden=custom;
 $('#previewHost').hidden=grid;
 $('#guideKey').hidden=grid;
 $('#stageHint').hidden=grid;
 const excerpt=$('#fullTextExcerpt');if(excerpt)excerpt.hidden=!sheet;
 $('.view-switch [data-view="overview"]').setAttribute('aria-pressed',String(grid));
 $('.view-switch [data-view="sheet"]').setAttribute('aria-pressed',String(sheet));
 if(grid){$('#viewName').textContent='Libro completo';paintGrid()}
 if(sheet){paintSpread();$('#previewArea').scrollTop=0}
 if(!custom){$('#previewArea').classList.remove('grid-active');$('#fullGrid').hidden=true;$('#previewHost').hidden=false;}
}
function sectionDropdown(){
 const el=$('#importSection'),current=el.value;
 const options=api.getState().sections.filter(x=>!x.id.startsWith('__'));
 el.innerHTML=options.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+(api.getSectionText(x.id)?' · TEXTO CARGADO':'')+'</option>').join('');
 el.value=options.some(x=>x.id===current)?current:'text';
 if(!el.value&&options.length)el.value=options[0].id;
 statusText();
}
function statusText(note=''){
 const id=$('#importSection').value,raw=api.getSectionText(id);
 const n=(raw.match(/\S+/g)||[]).length;
 $('#manuscriptStatus').textContent=(raw?('Texto cargado: '+formatNum(n)+' palabras en '+id+'.'):('Sin texto de la sección '+id+'.'))+(note?' '+note:'');
}
function refresh(){
 if(!api.getPlan())return;
 sectionDropdown();
 const invalid=api.getPlan().invalid;
 $('#geometryWarning').hidden=!invalid;
 $('#geometryWarning').textContent=invalid?'Los márgenes ocupan prácticamente toda la página: no hay suficiente espacio para calcular el texto. Reducí los márgenes o ampliá el formato.':'';
 if(mode==='overview'){$('#viewName').textContent='Libro completo';paintGrid()};
 if(mode==='sheet')paintSpread();
}
$('#fullGrid').addEventListener('click',e=>{
 const btn=e.target.closest('[data-page]');if(!btn)return;
 const num=Number(btn.dataset.page);if(!Number.isFinite(num))return;
 setMode('sheet',num);
});
$('#backGrid').addEventListener('click',()=>setMode('overview'));
$('#prevSpread').addEventListener('click',()=>setMode('sheet',Math.max(1,pairLeft(selected)-1)));
$('#nextSpread').addEventListener('click',()=>setMode('sheet',Math.min(api.getPlan().total,pairLeft(selected)+2)));
$('#jumpButton').addEventListener('click',()=>setMode('sheet',Number($('#jumpPage').value)||1));
$('#jumpPage').addEventListener('keydown',e=>{if(e.key==='Enter')setMode('sheet',Number($('#jumpPage').value)||1)});
$('#showAllPages').addEventListener('click',()=>{$('#gridSearch').value='';searchTerm='';paintGrid()});
$('#gridSearch').addEventListener('input',e=>{searchTerm=e.target.value.trim();paintGrid()});
$('#thumbZoom').addEventListener('input',e=>{thumbSize=Number(e.target.value)||96;paintGrid()});
$('#importSection').addEventListener('change',()=>{statusText();$('#manuscriptPaste').value=''});
$('#manuscriptFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(file.size>4000000){statusText('Archivo demasiado grande (máximo 4 MB).');e.target.value='';return}
 if(!/\.(txt|md)$/i.test(file.name)){statusText('Por ahora se admiten TXT y MD; DOCX y PDF necesitan conversión.');e.target.value='';return}
 try{
  const id=$('#importSection').value;
  const raw=await file.text();
  api.putSectionText(id,raw);
  $('#manuscriptPaste').value='';
  statusText('Archivo '+file.name+' importado en el navegador.');
  refresh();
 }catch(err){statusText('Error: '+err.message)}
 finally{e.target.value=''}
});
$('#applyManuscript').addEventListener('click',()=>{
 const raw=$('#manuscriptPaste').value;
 if(!raw.trim()){statusText('Pegá texto antes de aplicar.');return}
 const id=$('#importSection').value;
 try{api.putSectionText(id,raw);statusText('Texto pegado y aplicado.');refresh()}
 catch(err){statusText('Error: '+err.message)}
});
$('#removeManuscript').addEventListener('click',()=>{
 const id=$('#importSection').value;
 if(!api.getSectionText(id))return;
 if(!confirm('¿Quitar el texto de la sección '+id+'? Se perderá la vista real de sus páginas.'))return;
 api.putSectionText(id,'');$('#manuscriptPaste').value='';refresh();
});
document.querySelectorAll('[data-index-jump]').forEach(b=>b.addEventListener('click',()=>{const section=api.getPlan().items.find(x=>x.id===b.dataset.indexJump);if(section)setMode('sheet',section.start);}));
$('.view-switch').addEventListener('click',e=>{
 const button=e.target.closest('[data-view]');if(!button)return;
 if(button.dataset.view==='overview'||button.dataset.view==='sheet'){
  e.preventDefault();e.stopImmediatePropagation();setMode(button.dataset.view);return;
 }
 if(['body','chapter','plates','bibliography'].includes(button.dataset.view)){
  const sections=api.getPlan().items;
  const first=sections.find(x=>x.id==='original-new-toryism');
  const opener=sections.find(x=>x.id==='opening-original-new-toryism');
  const art=sections.find(x=>x.figure);
  const bibliography=sections.find(x=>x.id==='bibliography');
  const target=button.dataset.view==='plates'?art?.start:button.dataset.view==='bibliography'?bibliography?.start:button.dataset.view==='chapter'?(opener?.start||first?.start):first?.start+2;
  if(Number.isFinite(target)){
   e.preventDefault();e.stopImmediatePropagation();setMode('sheet',target);return;
  }
 }
 mode='legacy';
 $('#overviewToolbar').hidden=true;$('#spreadToolbar').hidden=true;
 $('#previewArea').classList.remove('grid-active');
 $('#fullGrid').hidden=true;$('#sceneNav').hidden=false;
 $('#guideKey').hidden=false;$('#previewHost').hidden=false;
 const excerpt=$('#fullTextExcerpt');if(excerpt)excerpt.hidden=true;
},true);
$('#printProof').addEventListener('click',e=>{
 if(mode==='legacy')return;
 e.preventDefault();e.stopImmediatePropagation();
 if(mode==='overview'){statusText('Seleccioná una página para abrir un pliego antes de imprimir.');return}
 const win=window.open('','_blank');
 if(!win){statusText('Permití las ventanas emergentes para imprimir.');return}
 const p=api.getPlan(),css=new URL('editor.css',location.href).href;
 const size=p.w+'mm '+p.h+'mm';
 const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Siglo23 - pliego de prueba</title><link rel="stylesheet" href="'+esc(css)+'"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"><style>@page{size:'+size+';margin:0}html,body{margin:0;background:white}.spread{transform:none!important;display:block!important;filter:none!important}.mock-page{break-after:page;page-break-after:always;box-shadow:none!important}.guides,.bleed-guide{display:none!important}</style></head><body>'+$('#previewHost').innerHTML+'<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},500)})<\/script></body></html>';
 win.document.open();win.document.write(html);win.document.close();
},true);
window.addEventListener('siglo23:layout-change',()=>{if(mode!=='legacy')refresh()});
window.addEventListener('keydown',e=>{
 if(mode==='sheet'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'&&e.target.tagName!=='SELECT'){
  if(e.key==='ArrowLeft'){e.preventDefault();$('#prevSpread').click()}
  if(e.key==='ArrowRight'){e.preventDefault();$('#nextSpread').click()}
  if(e.key==='Escape'){e.preventDefault();setMode('overview')}
 }
});
sectionDropdown();
setMode('overview');
const pageParam=Number(new URLSearchParams(location.search).get('page'));
if(Number.isFinite(pageParam)&&pageParam>=1){
 const openLink=()=>{
  const p=api.getPlan();
  if(p&&p.mainWords>0&&p.total>=pageParam){
   setMode('sheet',Math.trunc(pageParam));
   window.removeEventListener('siglo23:layout-change',openLink);
  }
 };
 window.addEventListener('siglo23:layout-change',openLink);
 openLink();
}
})();
