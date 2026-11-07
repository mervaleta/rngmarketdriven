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
  return /páginas compuestas|Falló la composición|No se cargó Paged.js|No se encontró el original/.test(s);
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
 assert.match(result.status,/páginas compuestas/);
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
 await page.screenshot({path:'spencer-pliegos-e2e.png',fullPage:true});
 await page.emulateMediaType('print');
 const printView=await page.evaluate(()=>({
  spread: getComputedStyle(document.querySelector('#rendered .s23-spread')).display,
  paired: getComputedStyle(document.querySelector('#rendered .s23-spread-pages')).display,
  blank: getComputedStyle(document.querySelector('#rendered .s23-blank-leaf')).display,
  leaves:document.querySelectorAll('#rendered .pagedjs_page').length
 }));
 assert.equal(printView.spread,'contents','Las cubiertas de pliego no deben afectar la impresión');
 assert.equal(printView.paired,'contents');
 assert.equal(printView.blank,'none','El blanco de visualización no se imprime');
 assert.equal(printView.leaves,result.pages,'Imprimir debe preservar todos los folios');
 console.log('CONTROL IMPRESIÓN',JSON.stringify(printView));
 console.log('OK E2E Spencer M10: '+result.pages+' páginas en '+result.spreads.length+' pliegos enfrentados, sin hojas visuales en impresión');
}finally{await browser.close()}
