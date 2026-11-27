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
 let packRequests=0, rateLimitInjected=false;
 await page.setRequestInterception(true);
 page.on('request',req=>{
  if(req.url().includes('/assets-pack.php?')){
   packRequests++;
   if(!rateLimitInjected){rateLimitInjected=true;return req.respond({status:429,headers:{'Retry-After':'2'},body:'Rate limit test'});}
  }
  return req.continue();
 });
 await page.goto(process.env.STUDIO_TEST_URL,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>window.avatarEditor||window.studioBootError,{timeout:60000});
 const state=await page.evaluate(()=>({error:window.studioBootError,ready:!!window.avatarEditor,loading:document.getElementById('loading')?.textContent}));
 console.log('STARTUP',JSON.stringify(state));
 assert.equal(state.ready,true,state.error||'Editor failed to start');
 assert.equal(rateLimitInjected,true,'Asset pack endpoint must be used');
 assert.ok(packRequests>=2,'429 request must be retried');
 console.log('PACK REQUESTS',packRequests);
 const info=await page.evaluate(async()=>{
  const api=window.avatarEditor,initial=structuredClone(api.recipe);
  const a=structuredClone(initial);a.outfit=null;a.top='toigo_fisherman_sweater';a.bottom='toigo_long_full_skirt';
  const b=structuredClone(initial);b.body.weight=.8;b.body.gender=.9;
  const changes=await Promise.all([api.applyRecipe(a),api.applyRecipe(b),api.reset()]);
  const report=api.inspect();
  const same=JSON.stringify(api.recipe)===JSON.stringify(initial);
  const before=api.avatar.children.find(x=>x.isMesh).geometry.attributes.position.array.slice();
  const slider=document.getElementById('weight');slider.value='.9';slider.dispatchEvent(new Event('input',{bubbles:true}));
  const after=api.avatar.children.find(x=>x.isMesh).geometry.attributes.position.array.slice();
  const changed=before.some((x,i)=>x!==after[i]);
  await api.reset();
  return {changes,report,same,changed,final:api.inspect()};
 });
 console.log('REGRESSION',JSON.stringify(info));
 assert.equal(info.same,true);
 assert.equal(info.changed,true);
 assert.equal(info.report.meshes,info.report.slots.length+1);
 assert.equal(info.final.meshes,info.final.slots.length+1);
 const random=await page.evaluate(async()=>{
   const api=window.avatarEditor, snapshot=()=>structuredClone(api.recipe),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
   let a=snapshot();await api.randomize('body');let b=snapshot();
   const body=!eq(a.body,b.body)&&!eq(a.face,b.face)&&eq(a.outfit,b.outfit)&&eq(a.hair,b.hair);
   await api.randomize('colors');let c=snapshot();
   const colors=!eq(b.skin,c.skin)&&b.eyes!==c.eyes&&b.hair.color!==c.hair.color&&!eq(b.makeup,c.makeup)&&!eq(b.clothColors,c.clothColors)&&eq(b.body,c.body);
   await api.randomize('look');let d=snapshot();
   const look=!eq([c.outfit,c.top,c.bottom,c.shoes],[d.outfit,d.top,d.bottom,d.shoes])&&c.hair.style!==d.hair.style&&eq(c.body,d.body);
   const meshMatch=api.inspect().meshes===api.inspect().slots.length+1;
   const exclusive=!!d.outfit?(!d.top&&!d.bottom):!!(d.top&&d.bottom);
   await api.randomize('all');let e=snapshot();
   const all=!eq(d.body,e.body)&&!eq(d.face,e.face)&&!eq(d.clothColors,e.clothColors);
   return {body,colors,look,meshMatch,exclusive,all,slots:api.inspect()};
 });
 console.log('RANDOMIZE',JSON.stringify(random));
 for(const k of ['body','colors','look','meshMatch','exclusive','all'])assert.equal(random[k],true,k);
 await page.screenshot({path:'style-lab-smoke.png'});
}finally{await browser.close()}
