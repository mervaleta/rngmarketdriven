// Verificación E2E de Spencer M10 con Chromium + Puppeteer.
// Prueba una sola sección para evitar un libro completo en cada ejecución.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const url=process.env.S23_PREPRENSA_URL||'https://rngmarketdriven.com/publicdomain/spencer/maquetacion/preprensa.html';
const browser=await puppeteer.launch({
 headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
});
const errors=[];
try{
 const page=await browser.newPage();
 page.setDefaultTimeout(45000);
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text().slice(0,200))});
 page.on('response',resp=>{if(resp.status()>=400)errors.push('HTTP '+resp.status()+' '+resp.url().slice(0,220))});
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
 await page.evaluate(()=>{
  localStorage.setItem('siglo23-spencer-maquetacion-v1',JSON.stringify({
   title:'El individuo contra el Estado',author:'Herbert Spencer',
   sections:[
    {id:'original-preface',name:'Preface',enabled:true,recto:true},
    {id:'colophon',name:'Colofón',enabled:true,recto:true}
   ],texts:{}
  }));
  localStorage.setItem('siglo23-spencer-preprensa-v1',JSON.stringify({
   schema:1,config:{trim:'a5',width:148,height:210,inner:22,outer:17,top:21,bottom:21,bleed:3,fontSize:10.5,leading:1.4},
   figures:false,indices:false,opening:false
  }));
 });
 await page.reload({waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.querySelector('#sourceState')?.textContent.includes('Fuente: 1884'),{timeout:45000});
 await page.waitForFunction(()=>window.Paged&&typeof window.Paged.Previewer==='function',{timeout:45000});
 await page.click('#compose');
 await page.waitForFunction(()=>{
  const s=document.querySelector('#progress')?.textContent||'';
  return /caras visibles|Falló la composición|No se cargó Paged.js|No se encontró el original/.test(s);
 },{timeout:90000});
 const result=await page.evaluate(()=>{
  const spreads=[...document.querySelectorAll('#rendered .s23-spread')];
  const bySpread=spreads.map(s=>({
   left:[...s.querySelectorAll('.s23-spread-left .pagedjs_page')].map(x=>Number(x.dataset.s23Folio)),
   right:[...s.querySelectorAll('.s23-spread-right .pagedjs_page')].map(x=>Number(x.dataset.s23Folio)),
   blanks:s.querySelectorAll('.s23-blank-leaf').length,
   // Páginas físicamente unidas, sin espacio visible entre ellas.
   adjacent:!s.querySelector('.s23-spread-left .pagedjs_page')||!s.querySelector('.s23-spread-right .pagedjs_page')
    ?true:(()=>{
      const left=s.querySelector('.s23-spread-left .pagedjs_page').getBoundingClientRect();
      const right=s.querySelector('.s23-spread-right .pagedjs_page').getBoundingClientRect();
      return Math.abs(left.right-right.left)<3&&Math.abs(left.top-right.top)<3;
    })()
  }));
  return {
   status:document.querySelector('#progress')?.textContent||'',
   pages:document.querySelectorAll('#rendered .pagedjs_page').length,
   spreads:bySpread,
   hasSource:document.querySelector('#manuscript')?.textContent.includes('Westminster Review'),
   printEnabled:!document.querySelector('#print')?.disabled
  };
 });
 console.log('RESULTADO E2E',JSON.stringify(result));
 if(errors.length)console.log('LOG NAVEGADOR',errors.slice(0,6));
 assert.match(result.status,/caras visibles/);
 assert.ok(result.pages>=1&&result.pages<20,'La muestra no produjo un paginado razonable');
 assert.equal(result.hasSource,true);
 assert.equal(result.printEnabled,true);
 assert.equal(result.spreads.length,Math.ceil((result.pages+1)/2),'La cantidad de pliegos no coincide');
 assert.deepEqual(result.spreads[0].left,[],'Primera hoja incorrectamente ubicada a la izquierda');
 assert.deepEqual(result.spreads[0].right,[1],'El folio 1 debe ser recto a la derecha');
 assert.equal(result.spreads[0].blanks,1,'La guarda visual no debe representar una hoja impresa');
 if(result.pages>=3){
  assert.deepEqual(result.spreads[1].left,[2],'El folio 2 debe quedar a la izquierda');
  assert.deepEqual(result.spreads[1].right,[3],'El folio 3 debe quedar a la derecha');
 }
 assert.ok(result.spreads.every(s=>s.adjacent),'Las dos páginas de un pliego deben estar juntas');
 const cover=await page.evaluate(()=>{
  const all=[...document.querySelectorAll('#rendered .pagedjs_page')];
  return {first:all[0]?.dataset.s23Key,last:all[all.length-1]?.dataset.s23Key,
   toolbar:document.querySelectorAll('.s23-page-toolbar').length,
   layers:document.querySelectorAll('#rendered .s23-cover-page .s23-custom-text').length,
   firstFlowHidden:all[0]?.classList.contains('s23-flow-hidden')
  };
 });
 assert.equal(cover.first,'cover:front','La tapa debe ser la página visual 1');
 assert.equal(cover.last,'cover:back','La contratapa debe ser la página final');
 assert.equal(cover.toolbar,result.pages,'Cada página debe tener botón propio de edición');
 assert.ok(cover.layers>=6,'Tapa y contratapa deben incluir cajas editables de texto');
 assert.equal(cover.firstFlowHidden,true,'La portada debe usar sus cajas editables');
 await page.click('[data-page-key="cover:front"] .s23-edit-toggle');
 await page.waitForFunction(()=>!document.querySelector('#pageLayerInspector').hidden);
 const otherEditing=await page.evaluate(()=>document.querySelectorAll('.s23-edit-mode').length);
 assert.equal(otherEditing,1,'Solo se edita una página por vez');
 await page.click('#pageAddBox');
 const newBox=await page.evaluate(()=>[...document.querySelectorAll('[data-s23-key="cover:front"] .s23-custom-text')].at(-1)?.dataset.boxId);
 assert.ok(newBox,'La herramienta no creó la caja');
 await page.click('#pageBoxText');
 await page.$eval('#pageBoxText',(el)=>{el.value='Prueba de texto sobre fondo';el.dispatchEvent(new Event('input',{bubbles:true}))});
 const boxSelector='[data-s23-key="cover:front"] .s23-custom-text[data-box-id="'+newBox+'"]';
 const before=await page.$eval(boxSelector,el=>parseFloat(el.style.width));
 await page.evaluate(()=>{
  window.__s23Pointer={downs:0,moves:0,targets:[]};
  document.addEventListener('pointerdown',e=>{window.__s23Pointer.downs++;window.__s23Pointer.targets.push('down '+e.target.className)},{capture:true});
  document.addEventListener('pointermove',e=>{window.__s23Pointer.moves++},{capture:true});
 });
 const handle=await page.$(boxSelector+' .s23-resize-e');
 await handle.scrollIntoView();
 const rect=await handle.boundingBox();
 assert.ok(rect,'Falta el control lateral para redimensionar');
 await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
 await page.mouse.down();
 await page.mouse.move(rect.x+rect.width/2+26,rect.y+rect.height/2,{steps:8});
 await page.mouse.up();
 const after=await page.$eval(boxSelector,el=>parseFloat(el.style.width));
 const pointer=await page.evaluate(()=>window.__s23Pointer);
 console.log('DIAGNÓSTICO ARRASTRE',JSON.stringify({before,after,pointer}));
 assert.ok(after>before,'El marco no se pudo agrandar desde el lateral');
 // Imagen de 1200 x 1600 creada localmente, sin depender de archivos externos.
 await page.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#8e6274';ctx.fillRect(0,0,1200,1600);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  const file=new File([blob],'tapa.png',{type:'image/png'});
  const input=document.querySelector('[data-page-key="cover:front"] input[type=file]');
  const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;
  input.dispatchEvent(new Event('change',{bubbles:true}));
 });
 await page.waitForFunction(()=>{
  const leaf=document.querySelector('[data-s23-key="cover:front"]');
  return leaf?.classList.contains('s23-has-background');
 },{timeout:30000});
 await new Promise(resolve=>setTimeout(resolve,700));
 await page.click('#pageLayerClose');
 await page.click('#compose');
 await page.waitForFunction(()=>document.querySelector('#progress')?.textContent.includes('caras visibles'),{timeout:90000});
 const persisted=await page.evaluate(()=>{
  const front=document.querySelector('[data-s23-key="cover:front"]');
  const custom=[...front.querySelectorAll('.s23-custom-text')].find(el=>el.textContent.includes('Prueba de texto sobre fondo'));
  return {hasImage:front.classList.contains('s23-has-background'),
   custom:!!custom,width:custom?parseFloat(custom.style.width):0,selected:document.querySelectorAll('.s23-edit-mode').length,
   pages:document.querySelectorAll('#rendered .pagedjs_page').length,status:document.querySelector('#progress')?.textContent};
 });
 assert.ok(persisted.hasImage,'La imagen no se recuperó de IndexedDB');
 assert.ok(persisted.custom&&persisted.width>before,'El texto redimensionado no se conservó');
 assert.equal(persisted.selected,0,'La edición debe empezar desactivada después de recomponer');
 console.log('CAPAS Y TAPAS',JSON.stringify({cover,persisted}));
 await page.screenshot({path:'spencer-pliegos-e2e.png',fullPage:true});
 await page.emulateMediaType('print');
 const printView=await page.evaluate(()=>({
  spread: getComputedStyle(document.querySelector('#rendered .s23-spread')).display,
  paired: getComputedStyle(document.querySelector('#rendered .s23-spread-pages')).display,
  blank: getComputedStyle(document.querySelector('#rendered .s23-blank-leaf')).display,
  leaves:document.querySelectorAll('#rendered .pagedjs_page').length
 }));
 console.log('CONTROL IMPRESIÓN',JSON.stringify({printView,firstPages:result.pages,recomposedPages:persisted.pages}));
 assert.equal(printView.spread,'contents','Las cubiertas de pliego no deben afectar la impresión');
 assert.equal(printView.paired,'contents');
 assert.equal(printView.blank,'none','El blanco de visualización no se imprime');
 assert.equal(printView.leaves,persisted.pages,'Imprimir debe preservar todos los folios de la composición actual');

 console.log('OK E2E Spencer M10: '+result.pages+' páginas en '+result.spreads.length+' pliegos enfrentados, sin hojas visuales en impresión');
}finally{await browser.close()}
