/* Editorial Siglo23 · Spencer M07 · carga automática de manuscritos. */
(async function(){
 const status=document.getElementById('editorialTextStatus'),api=window.S23Layout;
 if(!api){if(status)status.textContent='Maquetador no disponible';return;}
 const entries=[{id:'study',url:'./textos/estudio-introductorio-2026.md'},{id:'afterword',url:'./textos/epilogo-2026.md'}];
 try{
  const docs=await Promise.all(entries.map(async it=>{const res=await fetch(it.url,{cache:'no-store'});if(!res.ok)throw Error(it.url+' · HTTP '+res.status);const text=await res.text();if(text.length<10000)throw Error('Manuscrito incompleto: '+it.id);return {...it,text}}));
  for(const d of docs)if(!api.getSectionText(d.id).trim())api.putSectionText(d.id,d.text);
  const plainWords=content=>(content.replace(/^#{1,6}\s+/gm,'').replace(/\*/g,'').match(/\S+/g)||[]).length;
  const n=entries.reduce((s,d)=>s+plainWords(api.getSectionText(d.id)),0);
  if(status)status.textContent='M07 · '+n.toLocaleString('es-AR')+' palabras editoriales en estudio + epílogo; biografía pendiente. Se conservan los textos editados localmente.';
 }catch(err){console.error(err);if(status)status.textContent='No se cargaron ambos manuscritos: '+err.message;}
})();
