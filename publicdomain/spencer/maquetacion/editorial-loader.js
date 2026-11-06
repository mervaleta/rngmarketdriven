/* Editorial Siglo23 · Spencer M09 · carga automática de estudio, biografía y epílogo. */
(async function(){
 const status=document.getElementById('editorialTextStatus'),api=window.S23Layout;
 if(!api){if(status)status.textContent='Maquetador no disponible';return;}
 const entries=[{id:'biography',url:'./textos/biografia-herbert-spencer-2026.md',minLength:10000},{id:'study',url:'./textos/estudio-introductorio-2026.md',minLength:10000},{id:'afterword',url:'./textos/epilogo-2026.md',minLength:10000}];
 try{
  const docs=await Promise.all(entries.map(async it=>{const res=await fetch(it.url,{cache:'no-store'});if(!res.ok)throw Error(it.url+' · HTTP '+res.status);const text=await res.text();if(text.length<it.minLength)throw Error('Manuscrito incompleto: '+it.id);return {...it,text}}));
  const hash=x=>{let h=2166136261;for(let i=0;i<x.length;i++){h^=x.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0');};
  for(const d of docs){const prev=api.getSectionText(d.id);if(!prev.trim()||(d.id==='study'&&hash(prev)==='323b7331'))api.putSectionText(d.id,d.text);}
  const plainWords=content=>(content.replace(/^#{1,6}\s+/gm,'').replace(/\*/g,'').match(/\S+/g)||[]).length;
  const n=entries.reduce((s,d)=>s+plainWords(api.getSectionText(d.id)),0);
  if(status)status.textContent='M09 · '+n.toLocaleString('es-AR')+' palabras editoriales en biografía + estudio + epílogo. Se conservan los textos editados localmente.';
 }catch(err){console.error(err);if(status)status.textContent='No se cargaron los manuscritos editoriales: '+err.message;}
})();
