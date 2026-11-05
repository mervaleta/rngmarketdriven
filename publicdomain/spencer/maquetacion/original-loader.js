/* Siglo23 · Original inglés de Herbert Spencer (1884). */
(()=>{
'use strict';
const api=window.S23Layout;
const status=document.getElementById('originalTextStatus');
const box=document.getElementById('originalEvidence');
const input=document.getElementById('words');
if(!api){if(status)status.textContent='No se pudo inicializar el editor.';return}
const source=new URL('original-ingles-1884.json',document.querySelector('script[src*="original-loader.js"]').src).href;
if(status)status.textContent='Cargando el original inglés de 1884…';
fetch(source,{cache:'no-store'}).then(resp=>{
 if(!resp.ok)throw new Error('HTTP '+resp.status);
 return resp.json();
}).then(book=>{
 const expected=['original-preface','original-new-toryism','original-coming-slavery','original-sins-legislators','original-great-superstition','original-postscript'];
 if(!Array.isArray(book.chapters)||book.chapters.length!==6||book.chapters.some((x,i)=>x.id!==expected[i]))throw new Error('Faltan partes del original');
 const words=book.chapters.reduce((sum,x)=>sum+(x.text.match(/\S+/g)||[]).length,0);
 if(words!==book.words_total||words<40000||words>50000)throw new Error('El archivo no supera la validación del recuento de palabras');
 const result=api.loadOriginalBook(book.chapters,book);
 if(input){input.readOnly=true;input.title='Recuento automático del texto inglés cargado'}
 if(status)status.textContent='Original inglés cargado: '+result.words.toLocaleString('es-AR')+' palabras en '+result.sections+' partes. Los demás apartados continúan con estimaciones.';
 if(box){box.hidden=false;box.innerHTML='<strong>Texto original: '+words.toLocaleString('es-AR')+' palabras</strong><br>Edición de referencia: Williams & Norgate, 1884. Prefacio, cuatro ensayos y posdata. Texto base de precomposición: cotejo con facsímil todavía pendiente. <a href="'+book.source_transcription+'" target="_blank" rel="noopener noreferrer">Fuente de la transcripción ↗</a> · <a href="'+book.source_original_check+'" target="_blank" rel="noopener noreferrer">Facsímil histórico ↗</a>'}
 const grid=document.getElementById('fullGrid');
 const refresh=document.getElementById('showAllPages');
 if(refresh&&grid&&grid.offsetParent!==null){/* La actualización ya está vinculada a render mediante el evento del editor. */}
}).catch(err=>{
 if(status)status.textContent='No se pudo cargar el texto original ('+err.message+'). Revisar que original-ingles-1884.json esté publicado junto a la maqueta.';
 if(box){box.hidden=false;box.textContent='El recuento real no está disponible hasta cargar el archivo fuente. No usar la hipótesis anterior de 90.000 palabras.'}
});
})();
