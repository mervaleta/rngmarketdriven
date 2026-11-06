/* M05 - Índices paginados con altura DOM y material real. */
(function(){'use strict';
const api=()=>window.S23Layout,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const ids=['index-onomastic','index-analytic','index-works'];
const names={'index-onomastic':'Índice onomástico','index-analytic':'Índice analítico y temático','index-works':'Índice de obras citadas'};
const lookup={'original-preface':'Prefacio','original-new-toryism':'I','original-coming-slavery':'II','original-sins-legislators':'III','original-great-superstition':'IV','original-postscript':'Posdata'};
let source=null;const cache=new Map(),active=new Map();
function refs(entry,plan){
 const labels=new Set();
 for(const o of entry.occ||[]){
  const sec=plan?.items?.find(x=>x.id===o.s),count=(api()?.getSectionText(o.s)?.match(/\S+/g)||[]).length;
  const page=sec&&count?sec.start+Math.min(sec.pages-1,Math.floor(o.w/count*sec.pages)):null;
  labels.add(page===null?(lookup[o.s]||o.s):'p. '+page);
 }
 const r=[...labels];return r.slice(0,10).join(' · ')+(r.length>10?' · +'+(r.length-10):'');
}
function html(entry,id,plan,illustrate){
 const image=illustrate&&id==='index-onomastic'?source.portraits.find(p=>p.name===entry.name):null;
 const extra=id==='index-onomastic'?entry.dates:id==='index-works'?[entry.author,entry.year].filter(Boolean).join(' · '):entry.category;
 return '<article class="editor-index-entry">'+(image?'<a class="editor-index-portrait" target="_blank" rel="noopener noreferrer" href="'+esc(image.source)+'"><img src="'+esc(image.src)+'" alt="Retrato histórico de '+esc(entry.name)+'" loading="lazy" referrerpolicy="no-referrer"></a>':'')+
 '<div class="editor-index-copy"><h4>'+esc(entry.name)+'</h4><i>'+esc(extra||'')+'</i><p>'+esc(entry.desc)+'</p><small>Referencias: '+esc(refs(entry,plan)||'pendientes')+'</small></div></article>';
}
function split(id,state,geometry){
 if(!source?.sections?.[id])return [];
 const key=JSON.stringify([id,geometry.width,geometry.height,state.font,state.fontPt,state.leading,state.indexPortraits]);
 if(cache.has(key)){active.set(id,cache.get(key));return cache.get(key)}
 const box=document.createElement('div');box.className='editor-index-page editor-index-measuring';box.style.width=geometry.width+'mm';
 box.style.setProperty('--idx-family',state.font);box.style.setProperty('--idx-size',Math.max(7.2,state.fontPt*.81)+'pt');
 box.style.setProperty('--idx-leading',Math.max(1.25,state.leading));document.body.appendChild(box);
 const max=Math.max(48,geometry.height-16),mm=96/25.4,out=[];let entries=[],used=0;
 try{
  for(const e of source.sections[id]){
   box.innerHTML=html(e,id,null,state.indexPortraits!==false);
   const height=Math.max(7,box.firstElementChild.getBoundingClientRect().height/mm+2.7);
   if(entries.length&&used+height>max){out.push(entries);entries=[];used=0}
   entries.push(e);used+=height;
  }
  if(entries.length)out.push(entries);
 }finally{box.remove()}
 cache.set(key,out);active.set(id,out);return out;
}
const page=(id,n)=>active.get(id)?.[n]||[];
window.S23Indices={
 ready:id=>!!source?.sections?.[id],
 measure:(id,state,g)=>split(id,state,g).length,
 plain:(id,n)=>page(id,n).map(e=>e.name+'\n'+e.desc).join('\n\n'),
 render:(id,n,plan)=>{
  const state=api()?.getState()||{};
  return '<div class="editor-index-page" style="--idx-family:'+esc(state.font||'Georgia,serif')+';--idx-size:'+Math.max(7.2,(state.fontPt||10.5)*.81)+'pt;--idx-leading:'+Math.max(1.25,state.leading||1.4)+'"><div class="editor-index-heading"><span>HERBERT SPENCER · SIGLO23</span><h2>'+esc(names[id])+'</h2></div>'+page(id,n).map(e=>html(e,id,plan,state.indexPortraits!==false)).join('')+'</div>';
 },
 set:data=>{if(!data?.sections||ids.some(id=>!Array.isArray(data.sections[id])))throw Error('Índices incompletos');source=data;cache.clear();active.clear();api()?.refreshFromIndices?.();},
 counts:()=>Object.fromEntries(ids.map(id=>[id,source?.sections?.[id]?.length||0]))
};
})();
