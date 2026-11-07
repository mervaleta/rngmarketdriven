/* Siglo23 Studio Kit 2.0: controles comunes, auditoría y temas. Sin alterar manuscritos. */
(function(){
'use strict';
var script=document.currentScript||document.querySelector('script[src*="estudio-comun.js"]');
var project=script&&script.dataset.project||'spencer';
var palettes={
 spencer:['#172d49','#223c58','#f0c78b'],gabinete:['#4a203a','#61344c','#edb5ca'],
 siglotimicos:['#342747','#49395e','#d7bce9'],voyager:['#152e54','#29436a','#a8cdf4'],
 camoati:['#48311f','#61472e','#f0cb8e']
};
var names={spencer:'Herbert Spencer',gabinete:'El gabinete prohibido',siglotimicos:'Siglotímicos',voyager:'Voyager',camoati:'Camoatí'};
var colors=palettes[project]||palettes.spencer;
document.documentElement.dataset.s23Project=project;
var css=document.createElement('style');
css.textContent=':root{--s23-bg:'+colors[0]+';--s23-panel:'+colors[1]+';--s23-accent:'+colors[2]+'}'
+'html[data-s23-project] body{background:var(--s23-bg)!important}'
+'html[data-s23-project] .inspector,html[data-s23-project] .planner,html[data-s23-project] .panel,html[data-s23-project] .controls{background:var(--s23-panel)!important}'
+'html[data-s23-project] .studio,html[data-s23-project] main.stage{background:radial-gradient(ellipse at 30% 10%,var(--s23-panel),var(--s23-bg) 75%)!important}'
+'.s23-common{font:12px/1.45 Montserrat,system-ui,Arial,sans-serif;color:#faf6ef;background:var(--s23-bg);border-block:1px solid var(--s23-accent);padding:10px 18px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;position:relative;z-index:20}'
+'.s23-common strong{color:var(--s23-accent);font-size:11px;letter-spacing:.1em;margin-right:8px}'
+'.s23-common button,.s23-common a{color:#faf6ef;text-decoration:none;font:600 11px/1.2 Montserrat,Arial,sans-serif;display:inline-flex;align-items:center;justify-content:center;border:1px solid #a7acb0;border-radius:5px;padding:9px 11px;min-height:35px;background:transparent;cursor:pointer}'
+'.s23-common button:hover,.s23-common a:hover{background:var(--s23-panel);border-color:var(--s23-accent)}'
+'.s23-common button.s23-key{background:var(--s23-accent);color:#16151a;border-color:var(--s23-accent)}'
+'.s23-common .s23-feedback{color:#f5dbb9;font-size:11px;flex-basis:100%;line-height:1.4}'
+'.s23-audit{flex-basis:100%;background:var(--s23-panel);padding:12px;border:1px solid #8691a0;border-radius:5px}'
+'.s23-audit ul{margin:8px 0;padding-left:20px;max-height:160px;overflow:auto}.s23-audit li{margin-bottom:5px}'
+'.s23-overflow-mark{outline:3px solid #ff8a6a!important;outline-offset:-3px!important}'
+'.s23-cover-dialog{border:1px solid var(--s23-accent);background:var(--s23-bg);color:#f9f3eb;padding:18px;max-width:min(95vw,650px);border-radius:8px}'
+'.s23-cover-dialog::backdrop{background:#0a0e15be}.s23-cover-dialog button{background:var(--s23-accent);border:0;color:#211a1a;padding:8px 12px;cursor:pointer;border-radius:5px}'
+'.s23-cover-proof{min-height:320px;background:linear-gradient(150deg,var(--s23-panel),var(--s23-bg));padding:28px;border:1px solid var(--s23-accent);display:flex;flex-direction:column;align-items:center;justify-content:space-around;text-align:center}'
+'.s23-cover-proof h2{font:normal 30px Georgia,serif}.s23-cover-proof p{font:12px Georgia,serif}'
+'@media print{.s23-common,.s23-cover-dialog{display:none!important}html[data-s23-project] body{background:white!important}}';
document.head.appendChild(css);
var bar=document.createElement('nav');bar.className='s23-common';bar.setAttribute('aria-label','Herramientas editoriales comunes Siglo23');
var home=project==='spencer'?'../../estudio/':project==='gabinete'?'../estudio/':'https://rngmarketdriven.com/siglo23/';
bar.innerHTML='<strong>SIGLO23 · ESTUDIO V2</strong>'
+'<button type="button" data-s23="grid">Libro completo</button>'
+'<button type="button" data-s23="spread">Pliego</button>'
+'<button type="button" data-s23="front">Tapa</button>'
+'<button type="button" data-s23="back">Contratapa</button>'
+'<button type="button" data-s23="audit">Revisar desbordes</button>'
+'<button type="button" data-s23="report">Informe JSON ↓</button>'
+'<button type="button" data-s23="save">Guardar proyecto</button>'
+'<button type="button" data-s23="load">Importar proyecto</button>'
+'<button type="button" class="s23-key" data-s23="pdf">Prueba PDF</button>'
+'<a href="'+home+'">Todos los proyectos</a>'
+'<span class="s23-feedback" role="status">Herramientas comunes activas; el PDF sigue siendo una prueba editorial.</span>'
+'<section class="s23-audit" hidden><h3>Control de composición</h3><p class="s23-audit-text"></p><ul class="s23-audit-list"></ul></section>';
var header=document.querySelector('header');
if(header)header.insertAdjacentElement('afterend',bar);else document.body.prepend(bar);
var status=bar.querySelector('.s23-feedback'),panel=bar.querySelector('.s23-audit');
function feedback(s){status.textContent=s}
function click(selector){var el=document.querySelector(selector);if(el){el.click();return true}return false}
function select(mode){
 return click(mode==='grid'?'[data-view="overview"],[data-view="grid"],.pills [data-view="all"]':
 mode==='spread'?'[data-view="sheet"],[data-view="spread"],.pills [data-view="spread"]':'[data-view="cover"],.pills [data-view="cover"]');
}
function cover(kind){
 if(project==='camoati'&&select('cover')){feedback('Cubiertas de Camoatí: tapa inicial y contratapa final incluidas.');return}
 if(project==='gabinete'&&select('grid')){
  var cards=[].slice.call(document.querySelectorAll('#stage [data-open]'));
  var target=kind==='front'?cards.find(function(x){return x.dataset.open==='0'}):cards[cards.length-1];
  if(target){target.click();feedback('Página '+(kind==='front'?'inicial':'final')+' seleccionada.');return}
 }
 if(select('cover')){feedback('Vista de cubierta completa: tapa, lomo y contratapa.');return}
 var d=document.getElementById('s23-cover-dialog');
 if(!d){d=document.createElement('dialog');d.id='s23-cover-dialog';d.className='s23-cover-dialog';document.body.appendChild(d)}
 d.replaceChildren();
 var close=document.createElement('button');close.type='button';close.textContent='Cerrar';close.addEventListener('click',function(){d.close()});
 var p=document.createElement('div');p.className='s23-cover-proof';
 var h=document.createElement('h2');h.textContent=document.getElementById('bookTitle')?.value||names[project];
 var name=document.createElement('strong');name.textContent=kind==='front'?'TAPA / SIGLO23':'CONTRATAPA / SIGLO23';
 var note=document.createElement('p');note.textContent='Vista auxiliar, no incorporada al PDF ni aprobada para imprenta.';
 p.append(name,h,note);d.append(close,p);d.showModal();
}
function audit(){
 var nodes=[].slice.call(document.querySelectorAll('.story-page .story,.page-actual .body-text,.page-actual .context-body,.mock-page .content,.mock-page .text-body,.page .page-inner')).filter(function(x){return x.getClientRects().length&&x.clientHeight>10});
 document.querySelectorAll('.s23-overflow-mark').forEach(function(x){x.classList.remove('s23-overflow-mark')});
 var problems=[],seen=new Set();
 nodes.forEach(function(el){
  var excess=Math.max(0,el.scrollHeight-el.clientHeight),horizontal=Math.max(0,el.scrollWidth-el.clientWidth);
  if(excess<=3&&horizontal<=3)return;
  var root=el.closest('[data-page],[data-index],.mock-page,.page-actual')||el;
  var page=root.getAttribute('data-page')||root.getAttribute('data-index')||'visible';
  var key=page+'|'+el.className;if(seen.has(key))return;seen.add(key);
  problems.push({page:page,verticalPx:excess,horizontalPx:horizontal,category:String(el.className)});el.classList.add('s23-overflow-mark');
 });
 var imgs=[].slice.call(document.querySelectorAll('.studio img,.stage img,#pages img')).filter(function(im){return im.getClientRects().length&&im.complete&&!im.naturalWidth});
 var report={tool:'Siglo23 Studio Kit v2',project:project,date:new Date().toISOString(),
 scope:'Solo cajas visibles en el momento del control. No certifica imprenta.',checkedBoxes:nodes.length,
 overflow:problems,brokenImages:imgs.map(function(x){return x.currentSrc||x.src}).slice(0,50)};
 panel.hidden=false;panel.querySelector('.s23-audit-text').textContent=nodes.length+' cajas revisadas · '+problems.length+' desbordes posibles · '+imgs.length+' imágenes fallidas.';
 var list=panel.querySelector('ul');list.replaceChildren();
 problems.slice(0,35).forEach(function(p){var li=document.createElement('li');li.textContent='Página '+p.page+': exceso vertical '+Math.round(p.verticalPx)+' px; horizontal '+Math.round(p.horizontalPx)+' px';list.append(li)});
 if(!problems.length){var li=document.createElement('li');li.textContent='Sin desbordes detectados en las cajas visibles. Comprobar el resto de las páginas.';list.append(li)}
 feedback('Auditoría: '+problems.length+' desbordes posibles. No se eliminó texto.');window.S23StudioAudit=report;
 return report;
}
function saveReport(){
 var data=JSON.stringify(audit(),null,2),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
 var a=document.createElement('a');a.href=url;a.download='siglo23-'+project+'-auditoria.json';a.click();setTimeout(function(){URL.revokeObjectURL(url)},2000);
}
bar.addEventListener('click',function(e){
 var btn=e.target.closest('[data-s23]');if(!btn)return;
 switch(btn.dataset.s23){
 case 'grid':if(!select('grid'))feedback('No se encontró la grilla de este proyecto.');break;
 case 'spread':if(!select('spread'))feedback('No se encontró la vista pliego.');break;
 case 'front':cover('front');break;
 case 'back':cover('back');break;
 case 'audit':audit();break;
 case 'report':saveReport();break;
 case 'save':if(!click('#exportPlan,#downloadJSON,#export'))feedback('Usá el botón de guardado del proyecto.');break;
 case 'load':if(!click('#importJSON,#importPlan,#import'))feedback('Usá el importador del proyecto.');break;
 case 'pdf':if(project==='spencer'){location.href='./preprensa.html';feedback('Abrir compositor del libro completo.');break}if(!click('#printWholeBook,#print-top,#printProof'))feedback('Usá la función de impresión del proyecto.');break;
 }
});
window.S23StudioKit={project:project,version:'2.0',audit:audit,openCover:cover};
})();