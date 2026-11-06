(()=>{'use strict';
const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
const chapters={'original-preface':'Prefacio','original-new-toryism':'El nuevo toryismo','original-coming-slavery':'La esclavitud venidera','original-sins-legislators':'Los pecados de los legisladores','original-great-superstition':'La gran superstición política','original-postscript':'Posdata'};
const localKey='siglo23-spencer-active-plan-v1';
let entries=[],plan=null,activeTerm='',activeGroup='',activeChapter='',expanded=false;
function updatePlan(){try{const j=JSON.parse(localStorage.getItem(localKey)||'null');const chaptersNeeded=Object.keys(chapters);plan=j&&Array.isArray(j.items)&&j.wordCounts&&chaptersNeeded.every(k=>j.items.some(i=>i.id===k&&i.pages>0)&&Number(j.wordCounts[k])>0)?j:null;}catch{plan=null}
 $('#pageStatus').innerHTML=plan?'<b>Foliación provisional vinculada a tu maqueta.</b> En este navegador se detectó un plan de '+Number(plan.total).toLocaleString('es-AR')+' páginas. Cada número de página es orientativo: se recalcula al modificar la maquetación. <a href="../maquetacion/">Abrir la maqueta</a>.':'<b>Referencias sin folio fijo.</b> Consultá en qué ensayo se encuentra cada mención. Para generar las páginas provisionales, abrí primero <a href="../maquetacion/">Maquetación</a> en este navegador y regresá al índice. No inventamos números de página.';}
function folio(o){if(!plan)return null;const sec=plan.items.find(x=>x.id===o.section);const n=Number(plan.wordCounts[o.section]);if(!sec||!n||!sec.pages||o.wordIndex>=n)return null;return sec.start+Math.min(sec.pages-1,Math.floor(o.wordIndex*sec.pages/n));}
function positions(e){const output=[],dedupe=new Set();for(const o of e.occurrences||[]){const p=folio(o),key=o.section+'|'+p+'|'+!!o.inNote;if(dedupe.has(key))continue;dedupe.add(key);output.push({...o,page:p});}return output;}
function entryHtml(e){
 const places=positions(e);const title=e.name||'';const desc=e.description||'';const extra=e.author?'<p class="original"><b>Autor:</b> '+esc(e.author)+(e.year?' · '+esc(e.year):'')+'</p>':'';
 const placeHtml=places.map(p=>{
  const text=esc(chapters[p.section]||p.section);
  if(p.page===null)return '<span class="chapter">'+text+(p.inNote?' · nota':'')+'</span>';
  return '<a class="folio'+(p.inNote?' note':'')+'" title="'+text+'" href="../maquetacion/?page='+p.page+'" target="_blank" rel="noopener noreferrer">p. '+p.page+(p.inNote?' · nota':'')+' ↗</a>';
 }).join(' ');
 return '<details class="person" id="'+esc(e.id)+'"'+(expanded?' open':'')+'><summary><span><span class="name">'+esc(title)+'</span><span class="dates">'+esc(e.year||e.category||'')+'</span><span class="meta"><span class="category">'+esc(e.category||'')+'</span><span class="status">'+e.mentions+' coincidencia'+(e.mentions===1?'':'s')+'</span></span></span></summary><div class="entry">'+extra+'<p>'+esc(desc)+'</p><div class="original">Formas localizadas: <em>'+esc((e.aliases||e.variants||[]).join(' · '))+'</em></div><div class="mentioned">Ensayos y '+(plan?'folios provisionales':'localización')+'</div><div class="folios">'+placeHtml+'</div><p class="paper-note">'+esc(e.review||'Pendiente de revisión editorial y cotejo de notas.')+'</p></div></details>';
}
function filtered(){return entries.filter(e=>(!activeGroup||e.category===activeGroup)&&(!activeChapter||(e.occurrences||[]).some(x=>x.section===activeChapter))&&(!activeTerm||normalize([e.name,e.description,e.category,e.author,e.year,...e.aliases||[],...e.keywords||[]].join(' ')).includes(activeTerm))).sort((a,b)=>a.name.localeCompare(b.name,'es'));}
function render(){
 const data=filtered();$('#shown').textContent=data.length+' de '+entries.length+' entradas';
 if(!data.length){$('#results').innerHTML='<div class="empty">No se encontraron entradas para estos filtros.</div>';return}
 let last='',html='';for(const e of data){const letter=normalize(e.name).charAt(0).toUpperCase();if(letter!==last){html+='<h2 class="letter-heading">'+esc(letter)+'</h2>';last=letter}html+=entryHtml(e)}$('#results').innerHTML=html;
}
function csv(){const headings=['Entrada','Tipo','Autor','Año','Descripción','Variantes','Secciones','Folios provisionales','Menciones'];const data=[headings];
 for(const e of filtered()){const pp=positions(e);data.push([e.name,e.category,e.author||'',e.year||'',e.description,(e.aliases||e.variants||[]).join('; '),[...new Set(pp.map(o=>chapters[o.section]||o.section))].join('; '),[...new Set(pp.filter(x=>x.page!==null).map(x=>x.page))].sort((a,b)=>a-b).join('; '),e.mentions]);}
 const csv='\uFEFF'+data.map(row=>row.map(s=>'"'+String(s??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='spencer-'+location.pathname.split('/').filter(Boolean).pop()+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
$('#search').addEventListener('input',e=>{activeTerm=normalize(e.target.value.trim());render()});
$('#group').addEventListener('change',e=>{activeGroup=e.target.value;render()});
$('#confidence').addEventListener('change',e=>{activeChapter=e.target.value;render()});
$('#allEntries').addEventListener('click',()=>{$('#search').value='';$('#group').value='';$('#confidence').value='';activeTerm=activeGroup=activeChapter='';render()});
$('#expandAll').addEventListener('click',()=>{expanded=!expanded;document.querySelectorAll('#results details.person').forEach(x=>x.open=expanded);$('#expandAll').textContent=expanded?'Contraer entradas':'Expandir entradas'});
$('#downloadCSV').addEventListener('click',csv);
$('#printIndex').addEventListener('click',()=>{document.querySelectorAll('#results details.person').forEach(x=>x.open=true);window.print()});
window.addEventListener('focus',()=>{const prev=JSON.stringify(plan);updatePlan();if(JSON.stringify(plan)!==prev)render()});
window.addEventListener('storage',e=>{if(e.key===localKey){updatePlan();render()}});
updatePlan();
fetch('./entradas.json',{cache:'no-store'}).then(x=>{if(!x.ok)throw Error('HTTP '+x.status);return x.json()}).then(data=>{
 entries=Array.isArray(data.entries)?data.entries:[];if(!entries.length)throw Error('No hay entradas');
 $('#countPeople').textContent=entries.length.toLocaleString('es-AR');$('#countMentions').textContent=entries.reduce((n,e)=>n+(e.occurrences||[]).length,0).toLocaleString('es-AR');
 $('#countNotes').textContent=entries.reduce((n,e)=>n+e.occurrences.filter(o=>o.inNote).length,0).toLocaleString('es-AR');
 $('#countPending').textContent=entries.length.toLocaleString('es-AR');
 const groups=[...new Set(entries.map(e=>e.category||'Sin clasificar'))].sort((a,b)=>a.localeCompare(b,'es'));
 $('#group').innerHTML='<option value="">Todos los grupos</option>'+groups.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
 $('#confidence').innerHTML='<option value="">Todos los ensayos</option>'+Object.entries(chapters).map(([k,v])=>'<option value="'+k+'">'+esc(v)+'</option>').join('');
 render();
}).catch(e=>{$('#results').innerHTML='<div class="empty">No se pudieron cargar los datos del índice: '+esc(e.message)+'. Confirmar que entradas.json esté publicado.</div>'});
})();