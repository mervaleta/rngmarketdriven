import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();
 await page.setViewport({width:1150,height:800});
 page.on('pageerror',e=>console.error('PAGE ERROR',e.stack));
 page.on('console',m=>{if(['error','warn'].includes(m.type()))console.log(m.type(),m.text())});
 page.on('requestfailed',r=>console.error('REQUEST FAILED',r.url(),r.failure()));
 page.on('response',r=>{if(r.status()>=400)console.error('HTTP',r.status(),r.url())});
 await page.goto(process.env.STUDIO_TEST_URL,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>window.avatarEditor||window.studioBootError,{timeout:60000});
 const state=await page.evaluate(()=>({error:window.studioBootError,ready:!!window.avatarEditor,loading:document.getElementById('loading')?.textContent}));
 console.log('STARTUP',JSON.stringify(state));
 assert.equal(state.ready,true,state.error||'Editor failed to start');
 const info=await page.evaluate(async()=>{
  const api=window.avatarEditor,initial=structuredClone(api.recipe);
  const a=structuredClone(initial);a.outfit=null;a.top='toigo_fisherman_sweater';a.bottom='toigo_long_full_skirt';
  const b=structuredClone(initial);b.body.weight=.8;b.body.gender=.9;
  const changes=await Promise.all([api.applyRecipe(a),api.applyRecipe(b),api.reset()]);
  const report=api.inspect();
  const same=JSON.stringify(api.recipe)===JSON.stringify(initial);
  const before=api.avatar.children.find(x=>x.isMesh).geometry.attributes.position.array.slice(0,200);
  const slider=document.getElementById('weight');slider.value='.9';slider.dispatchEvent(new Event('input',{bubbles:true}));
  const after=api.avatar.children.find(x=>x.isMesh).geometry.attributes.position.array.slice(0,200);
  const changed=before.some((x,i)=>x!==after[i]);
  await api.reset();
  return {changes,report,same,changed,final:api.inspect()};
 });
 console.log('REGRESSION',JSON.stringify(info));
 assert.equal(info.same,true);
 assert.equal(info.changed,true);
 assert.equal(info.report.meshes,info.report.slots.length+1);
 assert.equal(info.final.meshes,info.final.slots.length+1);
 await page.screenshot({path:'style-lab-smoke.png'});
}finally{await browser.close()}
