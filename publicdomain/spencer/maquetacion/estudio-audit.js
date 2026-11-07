/* Siglo23 M10 · auditoría de preproducción sin cambiar el plan existente */
(function(){
'use strict';
const panel=document.getElementById('s23AuditResults'),status=document.getElementById('s23AuditStatus');
if(!panel||!window.S23Layout)return;
const api=window.S23Layout;
let last=null,scheduled=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function examine(){
 let st,plan;try{st=api.getState();plan=api.getPlan()}catch(err){status.textContent='No se pudo consultar el plan: '+err.message;return}
 if(!st||!plan)return;
 const tests=[];
 const add=(level,label,description)=>tests.push({level,label,description});
 const ids=['original-preface','original-new-toryism','original-coming-slavery','original-sins-legislators','original-great-superstition','original-postscript'];
 const loaded=ids.filter(id=>typeof(st.texts?.[id])==='string'&&st.texts[id].trim().length>300);
 add(loaded.length===6?'ok':'bad','Texto original',loaded.length+' de 6 secciones del original inglés con texto cargado');
 const mainWords=ids.reduce((a,id)=>a+(String(st.texts?.[id]||'').match(/\S+/g)||[]).length,0);
 add(mainWords>=40000&&mainWords<=50000?'ok':'bad','Recuento documental',mainWords.toLocaleString('es-AR')+' palabras; comparar con fuente y facsímil');
 const editorial=['biography','study','afterword'];
 const edLoaded=editorial.filter(id=>(st.texts?.[id]||'').trim().length>10000);
 add(edLoaded.length===3?'ok':'warn','Aparato editorial',edLoaded.length+' de 3 textos extensos incorporados');
 add(plan.invalid?'bad':'ok','Caja tipográfica',plan.invalid?'El espacio útil es insuficiente para componer':'Caja '+plan.width.toFixed(1)+' × '+plan.height.toFixed(1)+' mm; comprobar encuadernación');
 add(st.bleed>=3?'ok':'warn','Sangrado',st.bleed+' mm configurados como guía; aún no hay cajas BleedBox/TrimBox certificadas');
 const plates=window.S23BookAssets?.figures||[];
 add(plates.length===4?'ok':'warn','Ilustraciones',plates.length+' de 4 fichas; falta controlar ppp efectivos, perfiles ICC, derechos y recortes para imprenta');
 const enabled=st.sections.filter(x=>x.enabled!==false);
 const indices=enabled.filter(x=>x.id.startsWith('index-'));
 add(indices.length===3?'ok':'warn','Índices',indices.length+' de 3 índices activados; sus folios dependen de la paginación definitiva');
 const blankCount=plan.items.filter(x=>x.blank).reduce((v,x)=>v+x.pages,0);
 add('warn','Paginación',plan.total+' páginas estimadas, '+blankCount+' blancos y '+plan.figurePages+' páginas de láminas. No es el total tipográfico definitivo');
 add('warn','Perfiles de impresión','Salida actual por navegador no garantiza PDF/X, CMYK/ICC, fuentes incrustadas ni imposición de cuadernillos');
 const changedImg=(plates.filter(p=>!/^https:\/\//.test(p.src||''))).length;
 if(changedImg)add('bad','Imagen sin fuente','Una o más láminas no tienen URL HTTPS');
 const fatal=tests.filter(x=>x.level==='bad').length;
 const warnings=tests.filter(x=>x.level==='warn').length;
 status.textContent=fatal?fatal+' bloqueos documentales · '+warnings+' advertencias':'Sin bloqueos documentales · '+warnings+' advertencias';
 panel.innerHTML=tests.map(x=>'<li class="audit-'+x.level+'"><strong>'+esc(x.label)+':</strong> '+esc(x.description)+'</li>').join('');
 last={project:'Herbert Spencer',module:'Auditoría Siglo23 M10',date:new Date().toISOString(),planVersion:'M09',counts:{estimatedPages:plan.total,originalWords:mainWords,originalSections:loaded.length,editorialTexts:edLoaded.length,illustrations:plates.length},tests,notice:'Evaluación preventiva; requiere galeradas y control humano de imprenta.'};
}
document.getElementById('s23AuditExport')?.addEventListener('click',()=>{
 examine();if(!last)return;
 const blob=new Blob([JSON.stringify(last,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='siglo23-spencer-auditoria-preprensa.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
});
const refresh=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;examine()})};
window.addEventListener('siglo23:layout-change',refresh);
setTimeout(examine,400);setTimeout(examine,2200);
})();