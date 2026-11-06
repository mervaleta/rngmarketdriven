(()=>{
'use strict';
const get=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const link=title=>'https://standardebooks.org/ebooks?query='+encodeURIComponent(title.trim());
const state={books:[],sort:'priority',visited:{},matches:{}};
try{state.visited=JSON.parse(localStorage.getItem('siglo23-standardebooks-busquedas-v1')||'{}')}catch{}
function save(){try{localStorage.setItem('siglo23-standardebooks-busquedas-v1',JSON.stringify(state.visited))}catch{}}
function seedCard(x){
const published=x.status==='publicado_descargable';
return '<article class="card"><span class="tag'+(published?'':' wait')+'">'+(published?'EDICIÓN DESCARGABLE':'EDICIÓN AÚN NO PRODUCIDA')+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.author)+' · '+esc(x.year)+' · '+esc(x.usage)+'</p><div class="actions"><a href="'+esc(x.url)+'" rel="noopener noreferrer" target="_blank">'+(published?'Abrir descarga individual':'Ver proyecto pendiente')+' ↗</a>'+(x.source_git?'<a href="'+esc(x.source_git)+'" rel="noopener noreferrer" target="_blank">Fuente Git ↗</a>':'')+'</div></article>';
}
function drawSeeds(data){
get('sample').innerHTML=data.ejemplos.map(seedCard).join('');
get('verifiedCount').textContent=data.resumen.verificados;
get('publishedCount').textContent=data.resumen.descargables;
}
function escapeCsv(s){s=String(s??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
function chosenQuery(w){const a=String(w.title_original||'').trim(),b=String(w.title_es||'').trim(),language=String(w.language||'').toLowerCase();return (language.includes('ingl')&&a?a:(a&&/[A-Za-z]/.test(a)?a:b||a)||String(w.author||'')).trim()}
function render(){
const q=norm(get('lookup').value),priority=get('priority').value,show=get('reviewFilter').value,matchFilter=get('matchFilter').value;
const filtered=state.books.filter(w=>{
if(priority&&w.priority!==priority)return false;
const match=state.matches[w.id];if(matchFilter==='sin_cruce'&&match)return false;if(matchFilter&&matchFilter!=='sin_cruce'&&match?.estado!==matchFilter)return false;
const v=state.visited[w.id]?.status||'sin_verificar';if(show&&v!==show)return false;
return !q||norm([w.author,w.title_original,w.title_es,w.genre,w.market,w.id].join(' ')).includes(q);
});
filtered.sort((a,b)=>{const rank=x=>x.priority==='Muy alta'?0:x.priority==='Alta'?1:x.priority==='Media'?2:3;return rank(a)-rank(b)||String(a.author).localeCompare(String(b.author),'es')});
const display=filtered.slice(0,72);
get('count').textContent=filtered.length+' coincidencias de '+state.books.length+' registros; mostrando '+display.length;
get('catalogList').innerHTML=display.length?display.map(w=>{
const label=chosenQuery(w),st=state.visited[w.id]?.status||'sin_verificar',url=link(label),m=state.matches[w.id];
const availability=m?'<span class="tag'+(m.estado==='descargable'?'':' wait')+'">'+(m.estado==='descargable'?'EPUB individual confirmado':m.estado==='en_antologia'?'Incluido en antología':'Edición pendiente de producir')+'</span>':'';
const sourceLinks=m?'<div class="actions"><a target="_blank" rel="noopener noreferrer" href="'+esc(m.url_ficha)+'">'+(m.estado==='descargable'?'Abrir edición y descargar ↗':m.estado==='en_antologia'?'Abrir antología ↗':'Ver ficha pendiente ↗')+'</a>'+(m.url_github?'<a target="_blank" rel="noopener noreferrer" href="'+esc(m.url_github)+'">Ver código fuente GitHub ↗</a>':'')+'</div>':'';
return '<article class="card"><span class="tag">'+esc(w.priority||'Prioridad por definir')+'</span>'+availability+'<h3>'+esc(w.title_original||w.title_es||'Sin título')+'</h3><p>'+esc(w.title_es&&w.title_es!==w.title_original?'Título alternativo: '+w.title_es+' · ':'')+esc(w.author||'Autor no indicado')+'</p><p class="meta">'+esc(w.market||'')+' · '+esc(w.language||'')+' · '+esc(w.id||'')+'</p>'+sourceLinks+'<div class="actions"><a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">Buscar título en Standard Ebooks ↗</a><a target="_blank" rel="noopener noreferrer" href="'+esc(link(w.author||''))+'">Buscar autor ↗</a></div><div class="actions"><label class="meta">Resultado revisado <select class="status-select" data-id="'+esc(w.id)+'"><option value="sin_verificar"'+(st==='sin_verificar'?' selected':'')+'>Sin verificar</option><option value="descargable"'+(st==='descargable'?' selected':'')+'>Descargable (verificado por editor)</option><option value="pendiente"'+(st==='pendiente'?' selected':'')+'>Ficha / aún no producido</option><option value="sin_resultado"'+(st==='sin_resultado'?' selected':'')+'>Sin resultado</option></select></label></div></article>';
}).join(''):'<div class="empty">No hay coincidencias con estos filtros.</div>';
}
async function load(){
try{
const [samples,catalog,cruces]=await Promise.all([fetch('./datos/verificados.json').then(r=>{if(!r.ok)throw Error('Muestra HTTP '+r.status);return r.json()}),fetch('../../catalogo-global.json').then(r=>{if(!r.ok)throw Error('Catálogo HTTP '+r.status);return r.json()}),fetch('./datos/cruces.json').then(r=>{if(!r.ok)throw Error('Cruces HTTP '+r.status);return r.json()})]);
drawSeeds(samples);state.books=Array.isArray(catalog.works)?catalog.works:[];state.matches=Object.fromEntries(cruces.cruces.map(x=>[x.id,x]));get('verifiedCount').textContent=cruces.resumen.total;get('publishedCount').textContent=cruces.resumen.descargables;get('catalogCount').textContent=state.books.length;get('libraryStatus').textContent='Base de Siglo23 cargada: '+state.books.length+' obras. Cruces documentados: '+cruces.resumen.total+'.';
render();
}catch(e){get('libraryStatus').textContent='No se pudo cargar el catálogo: '+e.message+'. Verificá que los JSON estén publicados en el mismo servidor.'}
}
get('searchExternal').addEventListener('submit',e=>{e.preventDefault();const q=get('titleQuery').value.trim();if(q)window.open(link(q),'_blank','noopener,noreferrer')});
for(const id of ['lookup','priority','reviewFilter','matchFilter'])get(id).addEventListener(id==='lookup'?'input':'change',render);
get('catalogList').addEventListener('change',e=>{if(!e.target.matches('select[data-id]'))return;state.visited[e.target.dataset.id]={status:e.target.value,updated:new Date().toISOString().slice(0,10)};save()});
get('exportReview').addEventListener('click',()=>{
const keys=['id','title_original','title_es','author','status','last_review'];const data=state.books.filter(x=>state.visited[x.id]);const rows=[keys.join(','),...data.map(x=>[x.id,x.title_original,x.title_es,x.author,state.visited[x.id].status,state.visited[x.id].updated].map(escapeCsv).join(','))].join('\r\n');
const blob=new Blob(['\ufeff'+rows],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='siglo23-standardebooks-revision.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
});
load();
})();
