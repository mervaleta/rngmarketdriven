(()=>{'use strict';
const $=s=>document.querySelector(s),$all=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
const kind=document.body.dataset.indexKind;
const config={
 place:{url:'lugares.json',unit:'lugares',label:'Lugar',group:'type',sub:'context',title:'Índice toponímico',notices:'Los países actuales y los nombres históricos se distinguen; algunas menciones aparecen solo en títulos y notas bibliográficas.'},
 theme:{url:'temas.json',unit:'conceptos',label:'Tema',group:'group',sub:'description',title:'Índice analítico',notices:'Selección inicial asistida por palabras clave: las referencias necesitan lectura y curaduría humana antes de publicar.'},
 work:{url:'obras.json',unit:'obras',label:'Obra citada',group:'type',sub:'description',title:'Índice de obras citadas',notices:'Títulos normalizados frente a citas abreviadas. Algunos datos editoriales y autorías deben contrastarse con catálogos.'}
};
const opts=config[kind];
if(!opts){$('#results').innerHTML='Índice no configurado.';return}
const storageKey='siglo23-spencer-active-plan-v1';
const headings={
 'original-preface':'Preface · 1884',
 'original-new-toryism':'The New Toryism',
 'original-coming-slavery':'The Coming Slavery',
 'original-sins-legislators':'The Sins of Legislators',
 'original-great-superstition':'The Great Political Superstition',
 'original-postscript':'Postscript'
};
const originalCounts={'original-preface':287,'original-new-toryism':6855,'original-coming-slavery':10639,'original-sins-legislators':14038,'original-great-superstition':11977,'original-postscript':1996};
let entries=[],plan=null,expanded=false;
function getPlan(){
 try{
  const s=localStorage.getItem(storageKey);
  const d=JSON.parse(s);
  if(d&&Array.isArray(d.items)&&d.wordCounts&&Object.keys(originalCounts).every(k=>d.items.some(x=>x.id===k&&x.pages>0)))return d;
 }catch{}
 return null;
}
function refFor(occ){
 const dest='../maquetacion/?section='+encodeURIComponent(occ.section)+'&word='+encodeURIComponent(occ.wordIndex);
 if(!plan)return {page:null,url:dest,reason:'Sin folio cerrado'};
 const item=plan.items.find(x=>x.id===occ.section);
 if(!item||!item.pages)return{page:null,url:dest,reason:'Sección sin páginas'};
 if(Number(plan.wordCounts[occ.section])!==originalCounts[occ.section])return {page:null,url:dest,reason:'Texto de base alterado'};
 const n=originalCounts[occ.section];
 const rel=Math.min(item.pages-1,Math.max(0,Math.ceil((occ.wordIndex+1)*item.pages/n)-1));
 return {page:item.start+rel,url:dest,reason:''};
}
function label(e){return kind==='place'?e.name:kind==='work'?e.title:e.name}
function desc(e){return e[opts.sub]||''}
function className(e){return e[opts.group]||'Sin clasificar'}
function letter(e){return norm(label(e)).charAt(0).toUpperCase()||'#'}
function filtered(){
 const q=norm($('#search').value.trim()),g=$('#group').value,note=$('#confidence').value;
 return entries.filter(e=>{
  if(g&&className(e)!==g)return false;
  if(note==='notes'&&!e.occurrences.some(o=>o.inNote))return false;
  if(note==='text'&&!e.occurrences.some(o=>!o.inNote))return false;
  if(q){
   const hay=norm([label(e),className(e),desc(e),e.author||'',e.year||'',...(e.aliases||[]),...(e.keywords||[]),...e.occurrences.slice(0,15).map(x=>x.context||'')].join(' '));
   if(!hay.includes(q))return false;
  }
  return true;
 }).sort((a,b)=>label(a).localeCompare(label(b),'es',{sensitivity:'base'}));
}
function card(e){
 const r=e.occurrences||[],papers=[],seen=new Set();
 for(const o of r){
  const f=refFor(o),key=(f.page??'-')+'|'+o.section+'|'+!!o.inNote;
  if(seen.has(key))continue;seen.add(key);papers.push({...f,occ:o});
 }
 const folios=papers.map(ref=>'<a href="'+esc(ref.url)+'" class="folio'+(ref.occ.inNote?' note':'')+'" title="'+esc(headings[ref.occ.section])+'; palabra '+(ref.occ.wordIndex+1)+'" rel="noopener" target="_blank">'
   +(ref.page===null?esc((headings[ref.occ.section]||'Original').replace(/^The /,'').slice(0,16))+' · palabra '+(ref.occ.wordIndex+1):'p. '+ref.page)+(ref.occ.inNote?' · nota':'')+' ↗</a>').join('');
 const aliases=(e.aliases||e.keywords||[]).map(esc).join('; ');
 const examples=r.filter(x=>x.context).slice(0,3).map(x=>'<div class="quote-context"><span>'+esc(headings[x.section]||x.section)+(x.inNote?' · nota':'')+': </span>'+esc(x.context)+'</div>').join('');
 const meta=kind==='work'?(e.author+' · '+e.year):kind==='place'?(e.original||''):('Término temático');
 const caveat=(kind==='theme'?'Marcación automática preliminar: comprobar pasajes.':kind==='work'?'Comprobar edición, título y fecha en catálogo original.':(!r.some(x=>!x.inNote)?'Mención en notas o bibliografía.':'Referencia a un lugar del texto.'));
 return '<details class="person" id="'+esc(e.id)+'"'+(expanded?' open':'')+'><summary><span style="min-width:0"><span class="name">'+esc(label(e))+'</span><span class="dates">'+esc(meta)+'</span><span class="meta"><span class="category">'+esc(className(e))+'</span><span class="status">'+r.length+' '+(kind==='theme'?'pasajes seleccionados':'menciones localizadas')+'</span></span></span></summary>'
  +'<div class="entry"><p>'+esc(desc(e))+'</p><div class="original">'+(kind==='theme'?'Expresiones rastreadas':'Forma en el original')+': <em>'+aliases+'</em></div>'
  +'<div class="mentioned">Referencias al texto de la maqueta</div><div class="folios">'+folios+'</div>'
  +(examples?'<div class="chapters">'+examples+'</div>':'')
  +'<p class="paper-note">'+caveat+'</p></div></details>';
}
function show(){
 const items=filtered();$('#shown').textContent=items.length+' de '+entries.length+' '+opts.unit;
 if(!items.length){$('#results').innerHTML='<div class="empty">No se encontraron coincidencias con los filtros.</div>';return}
 let out='',initial='';
 for(const e of items){const ch=letter(e);if(ch!==initial){out+='<h2 class="letter-heading">'+esc(ch)+'</h2>';initial=ch}out+=card(e)}
 $('#results').innerHTML=out;
}
function stats(){
 $('#countPeople').textContent=entries.length.toLocaleString('es-AR');
 $('#countMentions').textContent=entries.reduce((n,x)=>n+(x.occurrences?.length||0),0).toLocaleString('es-AR');
 $('#countNotes').textContent=entries.reduce((n,x)=>n+(x.occurrences||[]).filter(o=>o.inNote).length,0).toLocaleString('es-AR');
 $('#countPending').textContent=kind==='theme'?entries.length:entries.filter(e=>kind==='place'?!e.occurrences.some(o=>!o.inNote):!e.author||/por comprobar|no confirmado|no verificado/i.test(e.author)).length;
}
function status(){
 plan=getPlan();
 if(!plan)$('#pageStatus').innerHTML='<strong>Sin foliación de una maqueta abierta:</strong> las referencias muestran el ensayo y la posición de palabra, y abrirán directamente el pliego correcto. Entrá a <a href="../maquetacion/">Maquetación</a> para generar números de página adaptados a tu formato.';
 else $('#pageStatus').innerHTML='<strong>Vinculado a tu Maquetación:</strong> '+Number(plan.total).toLocaleString('es-AR')+' páginas interiores. Los folios se recalculan con los tamaños actuales. Si modificaste el inglés original, la referencia se abre por posición de palabra para evitar números falsos.';
}
function csv(){
 const header=['Entrada','Tipo','Descripción','Autor','Fecha','Forma original / palabras clave','Ensayos','Páginas del plan','Cantidad de menciones','Menciones en notas'];
 const rows=[header,...filtered().map(e=>[label(e),className(e),desc(e),e.author||'',e.year||'',(e.aliases||e.keywords||[]).join('; '),[...new Set(e.occurrences.map(x=>headings[x.section]||x.section))].join('; '),[...new Set(e.occurrences.map(o=>refFor(o).page).filter(x=>x!==null))].sort((a,b)=>a-b).join('; '),e.occurrences.length,e.occurrences.filter(o=>o.inNote).length])];
 const csv='\uFEFF'+rows.map(row=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
 a.href=blob;a.download='siglo23-spencer-indice-'+kind+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(blob),2500);
}
$('#search').addEventListener('input',show);
$('#group').addEventListener('change',show);$('#confidence').addEventListener('change',show);
$('#allEntries').addEventListener('click',()=>{$('#search').value='';$('#group').value='';$('#confidence').value='';show()});
$('#expandAll').addEventListener('click',()=>{expanded=!expanded;show();$('#expandAll').textContent=expanded?'Contraer fichas':'Expandir fichas'});
$('#downloadCSV').addEventListener('click',csv);
$('#printIndex').addEventListener('click',()=>{expanded=true;show();window.print()});
window.addEventListener('focus',()=>{const old=JSON.stringify(plan);plan=getPlan();if(old!==JSON.stringify(plan)){status();show()}});
window.addEventListener('storage',e=>{if(e.key===storageKey){status();show()}});
status();
fetch('./'+opts.url,{cache:'no-store'}).then(x=>{if(!x.ok)throw Error('HTTP '+x.status);return x.json()}).then(d=>{
 entries=(d.entries||[]).filter(x=>x.include&&x.occurrences?.length);
 const groups=[...new Set(entries.map(className))].sort((a,b)=>a.localeCompare(b,'es'));
 $('#group').innerHTML='<option value="">Todos los grupos</option>'+groups.map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join('');
 stats();show();
}).catch(e=>{$('#results').innerHTML='<div class="empty">No se pudo cargar el índice: '+esc(e.message)+'. Verificá que el JSON esté publicado en esta carpeta.</div>';$('#shown').textContent='Error al cargar'});
})();
