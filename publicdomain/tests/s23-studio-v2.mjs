/* Siglo23 Studio Kit v2: prueba real sin credenciales ni manuscritos externos. */
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const project=process.env.S23_PROJECT||'camoati';
const url=process.env.S23_URL||'http://127.0.0.1:8765/maquetacion/index.html';
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'Chrome no encontrado');
const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try{
 const page=await browser.newPage();page.setDefaultTimeout(65000);
 page.on('pageerror',error=>errors.push(String(error)));
 await page.setViewport({width:1530,height:900});
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>window.S23StudioKit?.version==='2.0',{timeout:45000});
 assert.equal(await page.evaluate(()=>window.S23StudioKit.project),project);
 const bar=await page.evaluate(()=>[...document.querySelectorAll('.s23-common [data-s23]')].map(x=>x.dataset.s23));
 for(const x of ['grid','spread','front','back','audit','report','save','load','pdf'])assert.ok(bar.includes(x),x);
 const theme=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
 const expected={spencer:'rgb(23, 45, 73)',gabinete:'rgb(74, 32, 58)',siglotimicos:'rgb(52, 39, 71)',voyager:'rgb(21, 46, 84)',camoati:'rgb(72, 49, 31)'};
 assert.equal(theme,expected[project],'Fondo del proyecto incorrecto');
 let output={project,theme,tools:bar.length};
 if(project==='camoati'){
  await page.waitForFunction(()=>document.querySelector('#loadStatus')?.textContent.includes('96 escenas'),{timeout:55000});
  await page.waitForFunction(()=>document.querySelectorAll('#pages .page').length>60,{timeout:55000});
  const longText=Array.from({length:65},(_,i)=>'Relato número '+(i+1)+'. La casa, el mercado, las cartas y los testigos se encuentran en un mismo recuerdo que ahora debe entrar completo en el libro.').join('\n\n');
  const before=await page.$eval('#totalPages',el=>Number(el.textContent));
  await page.evaluate(text=>{document.querySelector('#customText').value=text;document.getElementById('applyText').click()},longText);
  await page.waitForFunction(()=>window.S23CamoatiFlow&&window.S23CamoatiFlow.continuedScenes>=1,{timeout:80000});
  const result=await page.evaluate((text)=>{
   const pages=[...document.querySelectorAll('#pages .page')];
   const scene=document.querySelector('#editScene').value;
   const story=pages.filter(x=>x.dataset.blockId==='scene-'+scene&&x.dataset.type==='text');
   const rendered=story.map(el=>el.querySelector('.story')?.textContent||'').join(' ');
   const norm=s=>String(s).replace(/\s+/g,' ').trim();
   return {
    count:pages.length, first:pages[0]?.dataset.type,last:pages.at(-1)?.dataset.type,
    flow:window.S23CamoatiFlow,stories:story.length,fullText:norm(rendered)===norm(text),
    broken:story.filter(x=>{const box=x.querySelector('.page-inner'),t=x.querySelector('.story');return box&&t&&(box.scrollHeight>box.clientHeight+3||t.scrollHeight>t.clientHeight+3)}).length
   };
  },longText);
  output={...output,before,...result};
  assert.ok(result.count>before,'No se agregaron páginas de continuación');
  assert.ok(result.stories>1,'El relato quedó en una sola hoja');
  assert.equal(result.first,'front-cover');
  assert.equal(result.last,'back-cover');
  assert.equal(result.fullText,true,'Se perdieron palabras al repartir el relato');
  assert.equal(result.broken,0,'Quedó texto desbordado después del reflujo');
 }else if(project==='gabinete'){
  await page.waitForFunction(()=>document.querySelector('#totalPages')?.textContent.includes('148 páginas'),{timeout:45000});
  const info=await page.evaluate(async()=>{
   const res=await fetch('./libro.json');const d=await res.json();
   return {count:d.pages.length,first:d.pages[0]?.kind,last:d.pages.at(-1)?.kind,lastRole:d.pages.at(-1)?.role};
  });
  output={...output,...info};
  assert.equal(info.count,148);assert.equal(info.first,'cover');assert.equal(info.last,'cover');assert.equal(info.lastRole,'back');
 }else if(project==='siglotimicos'||project==='voyager'){
  await page.waitForFunction(()=>document.querySelectorAll('#fullGrid .spread-grid-item').length>3,{timeout:65000});
  const info=await page.evaluate(()=>({
   covers:[...document.querySelectorAll('#fullGrid [data-exterior]')].map(x=>x.dataset.exterior),
   bookSpreads:document.querySelectorAll('#fullGrid .spread-grid-item').length,
   hasPrint:!!document.querySelector('#printWholeBook')
  }));
  output={...output,...info};
  assert.deepEqual(info.covers,['front','back']);assert.ok(info.bookSpreads>3);
 }else if(project==='spencer'){
  await page.waitForFunction(()=>document.querySelector('#fullGrid')?.children.length>5,{timeout:45000});
  output={...output,grid:await page.$eval('#fullGrid',el=>el.children.length)};
 }
 await page.click('.s23-common [data-s23="audit"]');
 assert.ok(await page.$eval('.s23-audit',el=>!el.hidden),'La auditoría no abre');
 if(errors.length)console.log('ERRORES JS',JSON.stringify(errors.slice(0,5)));
 console.log('RESULTADO',JSON.stringify(output));
 await page.screenshot({path:'s23-studio-'+project+'.png'});
 console.log('OK',project,'herramientas y adaptador editorial');
}finally{await browser.close()}
