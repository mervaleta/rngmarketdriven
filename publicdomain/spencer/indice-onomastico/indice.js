(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
const localKey='siglo23-spencer-active-plan-v1';
const chapterNames={
 'original-preface':'Preface',
 'original-new-toryism':'The New Toryism',
 'original-coming-slavery':'The Coming Slavery',
 'original-sins-legislators':'The Sins of Legislators',
 'original-great-superstition':'The Great Political Superstition',
 'original-postscript':'Postscript'
};
const counts={
 'original-preface':287,
 'original-new-toryism':6855,
 'original-coming-slavery':10639,
 'original-sins-legislators':14038,
 'original-great-superstition':11977,
 'original-postscript':1996
};
const referenceItems=[
 ['original-preface',49,2],['original-new-toryism',51,29],
 ['original-coming-slavery',81,45],['original-sins-legislators',127,59],
 ['original-great-superstition',187,51],['original-postscript',239,9]
].map(([id,start,pages])=>({id,start,pages,end:start+pages-1}));
let people=[],activePlan=null,hasUserPlan=false;
function nameSort(name){
 const s=name.split(',')[0].trim();
 if(/^Ana\b|^Enrique\b|^Eduardo\b|^Luis\b|^Keops\b|^Lactancio\b/i.test(s))return s;
 if(/^Frank Fairman/.test(s))return 'Fairman, Frank';
 if(/^Reverendo Jeston/.test(s))return 'Jeston';
 if(/^Margaret/.test(s))return 'Margaret';
 if(/^C\. Forrest/.test(s))return 'Forrest';
 if(/^C\. Gatliff/.test(s))return 'Gatliff';
 if(/^A\. N\. Cummings/.test(s))return 'Cummings';
 if(/^B\. F\. Hartshorne/.test(s))return 'Hartshorne';
 if(/^G\. A\. Thompson/.test(s))return 'Thompson GA';
 if(/^Fox Maule/.test(s))return 'Maule-Ramsay';
 if(/^Henry George Grey/.test(s))return 'Grey';
 if(/^Henry John Temple/.test(s))return 'Temple';
 if(/^Anthony Ashley-Cooper/.test(s))return 'Ashley-Cooper';
 if(/^George William Fox Kinnaird/.test(s))return 'Kinnaird';
 const parts=s.split(/\s+/);
 return parts[parts.length-1]||s;
}
function planRead(){
 try{
  const raw=localStorage.getItem(localKey),d=raw?JSON.parse(raw):null;
  if(d&&Array.isArray(d.items)&&d.items.length&&d.wordCounts&&typeof d.wordCounts==='object'){
   const all=Object.keys(counts).every(k=>d.items.some(x=>x.id===k&&x.pages>0));
   if(all){activePlan=d;hasUserPlan=true;return}
  }
 }catch{}
 activePlan={items:referenceItems,wordCounts:counts,wordsPerPage:0,version:'A5-baseline'};hasUserPlan=false;
}
function locationFor(occ){
 const chapter=(activePlan.items||[]).find(x=>x.id===occ.section);
 if(!chapter)return {page:null,reason:'Sección ausente del plan'};
 const n=Number(activePlan.wordCounts?.[occ.section]);
 const expected=Number(counts[occ.section]);
 if(!Number.isFinite(n)||n<=0||n!==expected)return {page:null,reason:'Texto de la sección modificado o sin cargar'};
 const offset=Math.min(chapter.pages-1,Math.max(0,Math.ceil((occ.wordIndex+1)*chapter.pages/n)-1));
 return {page:chapter.start+offset,reason:''};
}
function entryLocations(person){
 const result=[];
 for(const occ of person.occurrences){
  const loc=locationFor(occ);
  result.push({...occ,...loc});
 }
 return result;
}
function renderPerson(p){
 const refs=entryLocations(p);
 const folioSet=new Set(),folios=[];
 for(const r of refs){
  if(!Number.isFinite(r.page))continue;
  const key=r.page+'-'+r.inNote;
  if(folioSet.has(key))continue;
  folioSet.add(key);
  folios.push(r);
 }
 const pageMarkup=folios.map(r=>'<a class="folio'+(r.inNote?' note':'')+'" target="_blank" rel="noopener noreferrer" href="../maquetacion/?page='+r.page+'" title="Abrir pliego correspondiente (estimativo)">'+r.page+(r.inNote?' · nota':'')+' ↗</a>').join('');
 const positions=[...new Set(refs.map(r=>r.section))];
 const chapters=positions.map(id=>{
  const matches=refs.filter(r=>r.section===id);
  const formatted=matches.map(r=>r.page==null?'sin folio':('p. '+r.page+(r.inNote?' (nota)':''))).join(', ');
  return '<span class="chapter"><strong>'+esc(chapterNames[id]||id)+'</strong> — '+esc(formatted)+'</span>';
 }).join('');
 const marks=p.confidence==='alta'?'Identidad localizada':'Identificación '+(p.confidence==='pendiente'?'pendiente':'provisional');
 return '<details class="person" data-id="'+esc(p.id)+'" id="'+esc(p.id)+'"><summary><span style="min-width:0"><span class="name">'+esc(p.name)+'</span><span class="dates">'+esc(p.dates)+'</span>'
 +'<span class="meta"><span class="category">'+esc(p.group)+'</span><span class="status">'+esc(marks)+' · '+p.mentions+' mención'+(p.mentions!==1?'es':'')+'</span></span></span></summary>'
 +'<div class="entry"><p>'+esc(p.bio)+'</p><div class="original">En el original: <em>'+p.aliases.map(esc).join('; ')+'</em></div>'
 +'<div class="mentioned">Páginas de la maqueta</div><div class="folios">'+(pageMarkup||'<span class="small">Sección no incluida o texto cambiado; sin folio fiable.</span>')+'</div>'
 +'<div class="chapters">'+chapters+'</div>'
 +(p.confidence!=='alta'?'<p class="paper-note">Identificación preliminar: revisar fuentes antes de cerrar las galeradas.</p>':'')
 +'</div></details>';
}
function stats(){
 $('#countPeople').textContent=people.length.toLocaleString('es-AR');
 $('#countMentions').textContent=people.reduce((n,x)=>n+x.occurrences.length,0).toLocaleString('es-AR');
 $('#countNotes').textContent=people.reduce((n,x)=>n+x.occurrences.filter(y=>y.inNote).length,0).toLocaleString('es-AR');
 $('#countPending').textContent=people.filter(x=>x.confidence!=='alta').length.toLocaleString('es-AR');
}
function filters(){
 const query=norm($('#search').value.trim()),group=$('#group').value,confidence=$('#confidence').value;
 return people.filter(p=>
 (!group||p.group===group)&&(!confidence||p.confidence===confidence)&&
 (!query||norm([p.name,p.dates,p.group,p.bio,...p.aliases,...p.occurrences.map(x=>chapterNames[x.section]||x.section)].join(' ')).includes(query)));
}
function show(){
 const rows=filters().sort((a,b)=>nameSort(a.name).localeCompare(nameSort(b.name),'es',{sensitivity:'base'})||a.name.localeCompare(b.name,'es'));
 $('#shown').textContent=rows.length+' de '+people.length+' personas';
 if(!rows.length){$('#results').innerHTML='<div class="empty">No hay entradas que coincidan con los filtros.</div>';return}
 let html='',initial='';
 for(const row of rows){
  const letter=norm(nameSort(row.name)).charAt(0).toUpperCase();
  if(letter!==initial){html+='<h2 class="letter-heading">'+esc(letter)+'</h2>';initial=letter}
  html+=renderPerson(row);
 }
 $('#results').innerHTML=html;
}
function status(){
 const d=activePlan;
 if(hasUserPlan){
  const affected=Object.keys(counts).filter(k=>d.wordCounts[k]!==counts[k]);
  $('#pageStatus').innerHTML='<strong>Referencias vinculadas a tu maqueta.</strong> '+d.total+' páginas interiores, recalculadas según las medidas usadas en Maquetación.'+(affected.length?'<br><strong>Atención:</strong> cambiaron '+affected.length+' secciones del original y sus referencias quedan temporalmente sin folio.':'')+' <a href="../maquetacion/">Modificar maqueta ↗</a>';
 }else $('#pageStatus').innerHTML='<strong>Foliación de referencia.</strong> Se muestra el reparto orientativo A5 de la transcripción inglesa de 1884. Abrí <a href="../maquetacion/">Maquetación</a> para guardar una paginación personalizada; las referencias se actualizarán automáticamente cuando regreses.';
}
function csv(){
 const out=[['Nombre normalizado','Fechas','Grupo','Biografía','Identificación','Variantes originales','Ensayos','Folios maqueta','Menciones','Menciones en notas']];
 for(const p of filters().sort((a,b)=>nameSort(a.name).localeCompare(nameSort(b.name),'es'))){
  const loc=entryLocations(p);
  out.push([p.name,p.dates,p.group,p.bio,p.confidence,p.aliases.join('; '),[...new Set(loc.map(x=>chapterNames[x.section]||x.section))].join('; '),[...new Set(loc.filter(x=>x.page!=null).map(x=>x.page))].sort((a,b)=>a-b).join('; '),loc.length,loc.filter(x=>x.inNote).length]);
 }
 const data='\uFEFF'+out.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));
 const el=document.createElement('a');el.href=url;el.download='spencer-indice-onomastico-preliminar.csv';document.body.append(el);el.click();el.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
$('#search').addEventListener('input',show);
$('#group').addEventListener('change',show);
$('#confidence').addEventListener('change',show);
$('#allEntries').addEventListener('click',()=>{$('#search').value='';$('#group').value='';$('#confidence').value='';show()});
$('#expandAll').addEventListener('click',()=>{const els=[...document.querySelectorAll('details.person')],anyClosed=els.some(x=>!x.open);els.forEach(x=>x.open=anyClosed);$('#expandAll').textContent=anyClosed?'Contraer biografías':'Expandir biografías'});
$('#downloadCSV').addEventListener('click',csv);
$('#printIndex').addEventListener('click',()=>{document.querySelectorAll('details.person').forEach(x=>x.open=true);window.print()});
window.addEventListener('storage',event=>{if(event.key===localKey){planRead();status();show()}});
window.addEventListener('focus',()=>{const old=JSON.stringify(activePlan);planRead();if(old!==JSON.stringify(activePlan)){status();show()}});
planRead();status();
fetch('./personas.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 people=(Array.isArray(data.entries)?data.entries:[]).filter(x=>x.include&&x.occurrences?.length);
 if(!people.length)throw Error('Índice sin entradas');
 const groups=[...new Set(people.map(x=>x.group))].sort((a,b)=>a.localeCompare(b,'es'));
 $('#group').innerHTML='<option value="">Todos los grupos</option>'+groups.map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join('');
 stats();show();
}).catch(e=>{$('#results').innerHTML='<p class="empty">No se pudo cargar el catálogo onomástico: '+esc(e.message)+'. Verificar que personas.json esté publicado junto a esta página.</p>';$('#shown').textContent='Error al cargar índice'});
})();
