
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
  const wordList=source.match(/\S+/g)||[];
  cached={source,words:wordList};tokens.set(section,cached);
 }
 const words=cached.words,n=words.length,lo=Math.floor(n*offset/totalPages),hi=Math.floor(n*(offset+1)/totalPages);
 return {html:words.slice(lo,hi).join(' '),start:lo+1,end:hi,count:n,filename:section};
}
function infoFor(page,plan){
 const item=entryFor(page,plan);
 if(!item)return {page,blank:true,title:'Guarda / fuera del volumen',text:'',isReal:false,section:'',idx:0};
 if(item.blank)return {page,blank:true,title:item.name,text:'',isReal:false,section:'',idx:page-item.start};
 const index=page-item.start;
 const segment=chunkFor(item.id,index,item.pages);
 return {page,blank:false,title:item.name,section:item.id,index,segment,isReal:!!segment,text:segment?.html||'',totalInSection:item.pages};
}
function snippet(info,limit=180){return info.isReal?info.text.slice(0,limit):(info.blank?'':('Sección: '+info.title+'. Texto todavía no importado.'));}
function cardFor(i,plan,config){
 const item=infoFor(i,plan);
 const isOpening=!!(item.index===0&&!item.blank),isPlate=item.section==='plates',isTitle=['half','title'].includes(item.section);
 const isBlank=item.blank;
 const body=isBlank?'':(isPlate?'<div class="thumb-figure">Ilustración<br>pendiente</div>':(isTitle?'<h4>'+esc(config.title)+'</h4>':'<div class="thumb-reading'+(item.isReal?'':' demo')+'">'+esc(snippet(item,600))+'</div>'));
 const page='<div class="thumb-page'+(isBlank?' blank':'')+'"><span class="thumb-running">'+esc(item.title)+'</span>'+(isOpening&&!isTitle?'<h4>'+esc(item.title)+'</h4>':'')+body+'<span class="thumb-number">'+i+'</span></div>';
 const subtitle=item.isReal?'Texto importado · '+formatNum(item.segment?.start)+'–'+formatNum(item.segment?.end)+' palabras':(isBlank?'Blanco intencional':'Texto pendiente de importar');
 return '<button type="button" class="thumb-card'+(isBlank?' blank':'')+(item.isReal?' real':'')+'" data-page="'+i+'" aria-current="'+String(i===selected)+'" aria-label="Abrir página '+i+', '+esc(item.title)+'"><span class="thumb-meta">PÁGINA '+i+'</span>'+page+'<span class="thumb-sub" title="'+esc(item.title)+'">'+esc(item.title)+'</span><span class="thumb-state">'+esc(subtitle)+'</span></button>';
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
function pageContent(info){
 const state=api.getState();
 if(info.blank)return '<div class="frontmatter"><span class="edition" style="color:#a2aaa0">'+esc(info.title)+'</span></div>';
 if(info.isReal){
  const wordsInfo='Palabras '+formatNum(info.segment.start)+'–'+formatNum(info.segment.end)+' de '+formatNum(info.segment.count);
  return '<div class="section-continuation">'+esc(info.title)+(info.index===0?' · INICIO':'')+'</div>'
  +'<div class="text-body actual-text" lang="es"><p>'+esc(info.text)+'</p></div>'
  +'<div class="content-note" style="margin-top:4mm">'+wordsInfo+' · Distribución estimativa</div>';
 }
 if(info.section==='plates')return '<div class="figure">ILUSTRACIÓN HISTÓRICA<br><br>Sin imagen cargada</div><p class="figcaption">'+esc(info.title)+' — material no incorporado todavía.</p>';
 const looksLikeFront=['half','title','legal'].includes(info.section);
 return '<div class="frontmatter"><span class="publisher">'+esc(state.imprint)+'</span><span class="booktitle" style="font-size:22pt">'+esc(info.title)+'</span><div class="rule"></div><span class="edition">'+(looksLikeFront?'Página preliminar de muestra':'Texto pendiente de importar')+'</span></div>';
}
function renderedPage(page,side){
 const {state,plan}=data(),info=infoFor(page,plan);
 const marginGuide=state.showGuides?'<div class="guides"></div><div class="bleed-guide"></div>':'';
 if(page<1||page>plan.total)return '<div class="mock-page '+side+'"><div class="content"><span class="blank-name">Sin página</span></div></div>';
 const run=state.showRunning&&!info.blank?'<span class="running">'+esc(side==='verso'?state.author:state.title)+'</span>':'';
 const fol=state.showFolios&&!info.blank?'<span class="folio">'+page+'</span>':'';
 return '<div class="mock-page '+side+'">'+run+'<div class="content">'+pageContent(info)+'</div>'+fol+marginGuide+'</div>';
}
function pairLeft(page){return page%2===0?page:page-1}
function fullTexts(page){
 const {plan}=data(),left=pairLeft(page),right=left+1;
 let out='<section class="full-text-inspector"><h3>Texto completo de estas páginas, según la estimación</h3><p>El contenido debajo no se recorta: podés comprobar qué palabras quedaron asignadas a cada cara del pliego. El corte es aproximado, no tipográficamente exacto.</p><div class="full-text-grid">';
 for(const n of [left,right]){
  const info=infoFor(n,plan);
  out+='<article><strong>Página '+(n<1?'—':n)+' · '+esc(info.title)+'</strong>';
  if(info.segment)out+='<small>Palabras '+formatNum(info.segment.start)+'–'+formatNum(info.segment.end)+' / '+formatNum(info.segment.count)+'</small>';
  out+='<div class="full-text-body">'+esc(info.isReal?info.text:(info.blank?'Página en blanco intencional.':'Todavía no hay texto importado para esta sección.'))+'</div></article>';
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
$('.view-switch').addEventListener('click',e=>{
 const button=e.target.closest('[data-view]');if(!button)return;
 if(button.dataset.view==='overview'||button.dataset.view==='sheet'){
  e.preventDefault();e.stopImmediatePropagation();setMode(button.dataset.view);return;
 }
 if(button.dataset.view==='body'||button.dataset.view==='chapter'){
  const firstOriginal=api.getPlan().items.find(x=>x.id==='original-new-toryism');
  if(firstOriginal){
   e.preventDefault();e.stopImmediatePropagation();
   const target=button.dataset.view==='chapter'?firstOriginal.start:Math.min(firstOriginal.end,firstOriginal.start+3);
   setMode('sheet',target);return;
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
})();
