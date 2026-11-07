/* Siglo23 · Diseñador por página M11.
   Capas e imágenes guardadas en IndexedDB del navegador, nunca en GitHub.
   Los cambios visuales no alteran el manuscrito original ni el motor Paged.js. */
(function(){
'use strict';
const DB='s23-spencer-capas-m11',VERSION=1;
let dbPromise=null,active=null,selected=null,saveTimer=null;
const pages=new Map(),assetURLs=new Map();
const $=id=>document.getElementById(id);
const allowed=/^image\/(jpeg|png|webp|avif|gif)$/;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function openDB(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(Error('IndexedDB no disponible'));return}
  const req=indexedDB.open(DB,VERSION);
  req.onupgradeneeded=()=>{
   const db=req.result;
   if(!db.objectStoreNames.contains('pages'))db.createObjectStore('pages');
   if(!db.objectStoreNames.contains('images'))db.createObjectStore('images');
  };
  req.onerror=()=>reject(req.error||Error('No se pudo abrir IndexedDB'));
  req.onsuccess=()=>resolve(req.result);
 });
 return dbPromise;
}
async function get(store,key){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const req=db.transaction(store,'readonly').objectStore(store).get(key);
  req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
 });
}
async function set(store,key,val){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,'readwrite');
  tx.objectStore(store).put(val,key);tx.oncomplete=()=>resolve();
  tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });
}
async function del(store,key){
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,'readwrite');
  tx.objectStore(store).delete(key);tx.oncomplete=()=>resolve();
  tx.onerror=()=>reject(tx.error);
 });
}
function notice(text,isError){
 const el=$('pageLayerStatus');
 if(el){el.textContent=text;el.classList.toggle('alert',!!isError)}
}
function seed(key){
 const model={boxes:[],flowHidden:false,fit:'cover',meta:null};
 if(key==='cover:front'){
  model.flowHidden=true;
  model.boxes=[
   {id:'front-imprint',x:15,y:11,w:70,h:9,font:11,text:'SIGLO23 · CLÁSICOS'},
   {id:'front-title',x:12,y:31,w:76,h:24,font:28,text:'El individuo contra el Estado'},
   {id:'front-author',x:19,y:66,w:62,h:10,font:15,text:'Herbert Spencer'},
   {id:'front-edition',x:15,y:83,w:70,h:8,font:9,text:'EDICIÓN CRÍTICA E ILUSTRADA'}
  ];
 }else if(key==='cover:back'){
  model.flowHidden=true;
  model.boxes=[
   {id:'back-title',x:12,y:16,w:76,h:14,font:25,text:'El individuo contra el Estado'},
   {id:'back-copy',x:13,y:42,w:74,h:30,font:12,text:'Texto de contratapa pendiente. Seleccioná la caja para redactarlo y ajustá su tamaño desde los laterales.'},
   {id:'back-imprint',x:22,y:84,w:56,h:9,font:10,text:'SIGLO23'}
  ];
 }
 return model;
}
function scheduleSave(item){
 if(saveTimer)clearTimeout(saveTimer);
 const key=item.key;saveTimer=setTimeout(async()=>{
  try{await set('pages',key,item.model);notice('Composición de '+item.label+' guardada en este navegador.')}
  catch(err){notice('No se pudo guardar la composición: '+err.message,true)}
 },250);
}
async function imageSize(blob){
 const url=URL.createObjectURL(blob);
 try{
  const img=new Image();img.src=url;
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('No se pudo leer la imagen'))});
  return [img.naturalWidth,img.naturalHeight];
 }finally{URL.revokeObjectURL(url)}
}
function fitPx(img,p){
 const w=Number(p.dataset.widthMm||148),h=Number(p.dataset.heightMm||210);
 const size=Math.min(img.width/(w/25.4),img.height/(h/25.4));
 return Math.round(size);
}
function imageInfo(item){
 const m=item.model.meta;if(!m)return 'Sin imagen de fondo';
 const dpi=fitPx(m,item.page);
 return m.name+' · '+m.width+'×'+m.height+' px · ~'+dpi+' ppp '+(dpi<200?'(resolución baja para imprenta)':dpi<300?'(revisar calidad)':'(dimensión suficiente; revisar perfil ICC)');
}
async function assignImage(item,file){
 if(!file||!allowed.test(file.type)||file.size>80*1024*1024)throw Error('Imagen inválida. Usá JPG, PNG, WebP o AVIF (máximo 80 MB).');
 const [width,height]=await imageSize(file);
 if(width<20||height<20)throw Error('Imagen demasiado pequeña.');
 const old=assetURLs.get(item.key);
 if(old)URL.revokeObjectURL(old);
 const blob=new Blob([file],{type:file.type});
 await set('images',item.key,blob);
 const url=URL.createObjectURL(blob);assetURLs.set(item.key,url);
 item.model.meta={name:file.name,width,height,bytes:file.size,type:file.type,loadedAt:new Date().toISOString()};
 applyBackground(item,url);scheduleSave(item);
 notice('Fondo de '+item.label+': '+imageInfo(item)+'. Original guardado en IndexedDB.');
}
function applyBackground(item,url){
 let layer=item.page.querySelector(':scope > .s23-background');
 if(!layer){layer=document.createElement('div');layer.className='s23-background';layer.setAttribute('aria-hidden','true');item.page.prepend(layer)}
 layer.style.backgroundImage=url?'url("'+url.replace(/["\\]/g,'')+'")':'none';
 layer.style.backgroundSize=item.model.fit||'cover';
 item.page.classList.toggle('s23-has-background',!!url);
}
function boxHTML(box){
 const el=document.createElement('div');
 el.className='s23-custom-text';
 el.dataset.boxId=box.id;
 el.style.left=box.x+'%';el.style.top=box.y+'%';el.style.width=box.w+'%';el.style.height=box.h+'%';
 el.style.fontSize=(box.font||12)+'pt';
 const body=document.createElement('div');body.className='s23-custom-text-body';body.textContent=box.text||'';
 const grip=document.createElement('button');grip.type='button';grip.className='s23-box-grip';grip.textContent='Mover caja';grip.setAttribute('aria-label','Arrastrar caja de texto');
 el.append(body,grip);
 for(const side of ['n','e','s','w','ne','nw','se','sw']){
  const h=document.createElement('span');h.className='s23-resize s23-resize-'+side;h.dataset.resize=side;h.setAttribute('aria-hidden','true');el.append(h);
 }
 return el;
}
function applyBox(box,element){
 for(const [style,v] of Object.entries({left:box.x,top:box.y,width:box.w,height:box.h}))element.style[style]=v+'%';
}
function boxFrom(item,id){return item.model.boxes.find(x=>x.id===id)}
function deselect(){
 if(selected?.el)selected.el.classList.remove('s23-selected');
 selected=null;
 const inspector=$('pageBoxInspector');if(inspector)inspector.hidden=true;
}
function selectBox(item,id){
 const el=item.page.querySelector('.s23-custom-text[data-box-id="'+id+'"]');
 const data=boxFrom(item,id);
 if(!el||!data)return;
 deselect();selected={item,id,el};el.classList.add('s23-selected');
 const inspector=$('pageBoxInspector');
 inspector.hidden=false;
 $('pageBoxText').value=data.text||'';
 $('pageBoxSize').value=data.font||12;
 $('pageBoxCoords').textContent=Math.round(data.x)+'%, '+Math.round(data.y)+'% · '+Math.round(data.w)+' × '+Math.round(data.h)+'%';
}
function checkOverflow(item){
 let overflowing=0;
 for(const el of item.page.querySelectorAll(':scope > .s23-custom-text')){
  const content=el.querySelector('.s23-custom-text-body');
  const hasOverflow=!!content&&(content.scrollHeight>el.clientHeight+3 || content.scrollWidth>el.clientWidth+3);
  el.classList.toggle('s23-text-overflow',hasOverflow);
  if(hasOverflow)overflowing++;
 }
 if(overflowing&&active?.key===item.key)notice(overflowing+' caja(s) desbordan la página. Agrandá el marco desde los puntos laterales o reducí la tipografía.',true);
}
function redraw(item){
 item.page.querySelectorAll(':scope > .s23-custom-text').forEach(el=>el.remove());
 const mainArea=item.page.querySelector('.pagedjs_area');
 item.page.classList.toggle('s23-flow-hidden',!!item.model.flowHidden);
 if(mainArea)mainArea.classList.toggle('s23-original-hidden',!!item.model.flowHidden);
 for(const box of item.model.boxes){item.page.append(boxHTML(box))}
 checkOverflow(item);
 if(active?.key===item.key&&selected){const saved=selected.id;selectBox(item,saved)}
}
function addBox(item,text){
 const box={id:'bx-'+Math.random().toString(36).slice(2,10),x:12,y:12,w:76,h:25,font:12,text:text||'Escribí acá el texto de esta página.'};
 item.model.boxes.push(box);redraw(item);scheduleSave(item);selectBox(item,box.id);
}
function editItem(item){
 if(active===item){closeEditor();return}
 closeEditor();
 active=item;item.page.classList.add('s23-edit-mode');
 item.slot.classList.add('s23-slot-editing');
 item.toolbar.querySelector('.s23-edit-toggle').textContent='Terminar edición';
 $('pageLayerInspector').hidden=false;
 $('pageLayerSelection').textContent=item.label;
 $('pageLayerImageInfo').textContent=imageInfo(item);
 $('pageLayerFit').value=item.model.fit||'cover';
 $('pageLayerHideFlow').checked=!!item.model.flowHidden;
 notice('Editando '+item.label+'. Usá los puntos laterales para redimensionar las cajas y el encabezado para moverlas.');
}
function closeEditor(){
 if(!active)return;
 deselect();
 active.page.classList.remove('s23-edit-mode');
 active.slot.classList.remove('s23-slot-editing');
 active.toolbar.querySelector('.s23-edit-toggle').textContent='Editar página';
 active=null;
 $('pageLayerInspector').hidden=true;
}
function bindPointer(item){
 item.page.addEventListener('click',ev=>{
  if(active!==item)return;
  const box=ev.target.closest('.s23-custom-text');
  if(box)selectBox(item,box.dataset.boxId);
 });
 item.page.addEventListener('pointerdown',ev=>{
  if(active!==item)return;
  const target=ev.target;
  const resize=target.closest('.s23-resize');
  const grip=target.closest('.s23-box-grip');
  if(!resize&&!grip)return;
  const el=target.closest('.s23-custom-text');if(!el)return;
  const data=boxFrom(item,el.dataset.boxId);if(!data)return;
  ev.preventDefault();
  selectBox(item,data.id);
  const original={x:data.x,y:data.y,w:data.w,h:data.h};
  const rect=item.page.getBoundingClientRect(),x=ev.clientX,y=ev.clientY;
  const mode=resize?.dataset.resize||'move';
  function onMove(e){
   const dx=(e.clientX-x)/Math.max(1,rect.width)*100,dy=(e.clientY-y)/Math.max(1,rect.height)*100;
   let nx=original.x,ny=original.y,nw=original.w,nh=original.h;
   if(mode==='move'){nx=clamp(original.x+dx,0,100-original.w);ny=clamp(original.y+dy,0,100-original.h)}
   else{
    if(mode.includes('e'))nw=clamp(original.w+dx,8,100-original.x);
    if(mode.includes('s'))nh=clamp(original.h+dy,5,100-original.y);
    if(mode.includes('w')){nx=clamp(original.x+dx,0,original.x+original.w-8);nw=original.w+(original.x-nx)}
    if(mode.includes('n')){ny=clamp(original.y+dy,0,original.y+original.h-5);nh=original.h+(original.y-ny)}
   }
   Object.assign(data,{x:nx,y:ny,w:nw,h:nh});applyBox(data,el);
   $('pageBoxCoords').textContent=Math.round(data.x)+'%, '+Math.round(data.y)+'% · '+Math.round(data.w)+' × '+Math.round(data.h)+'%';
  }
  const finish=()=>{window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);checkOverflow(item);scheduleSave(item)};
  window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',finish,{once:true});window.addEventListener('pointercancel',finish,{once:true});
 });
}
function buildToolbar(item){
 const bar=document.createElement('div');bar.className='s23-page-toolbar';bar.dataset.pageKey=item.key;
 const badge=document.createElement('span');badge.textContent=item.label;badge.className='s23-page-badge';
 const button=document.createElement('button');button.className='s23-edit-toggle';button.type='button';button.textContent='Editar página';
 button.addEventListener('click',()=>editItem(item));
 const image=document.createElement('button');image.type='button';image.className='s23-upload-toggle';image.textContent='Cargar fondo';
 const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp,image/avif';input.hidden=true;
 input.addEventListener('change',async()=>{
  const file=input.files?.[0];if(!file)return;
  try{await assignImage(item,file)}catch(err){notice(err.message,true)}
  finally{input.value=''}
  if(active===item)$('pageLayerImageInfo').textContent=imageInfo(item);
 });
 image.addEventListener('click',()=>input.click());
 bar.append(badge,button,image,input);
 item.slot.prepend(bar);
 item.toolbar=bar;
}
function createCover(kind,config,heading){
 const e=document.createElement('div');
 e.className='pagedjs_page s23-cover-page s23-'+kind;
 e.style.width=config.width+'mm';e.style.height=config.height+'mm';
 const content=document.createElement('div');content.className='s23-cover-content';
 if(kind==='front'){
  content.innerHTML='<span class="s23-cover-imprint">SIGLO23 · CLÁSICOS</span><div class="s23-cover-title">'+escape(heading.title||'El individuo contra el Estado')+'</div><div class="s23-cover-author">'+escape(heading.author||'Herbert Spencer')+'</div><span class="s23-cover-bottom">EDICIÓN CRÍTICA E ILUSTRADA</span>';
 }else if(kind==='back'){
  content.innerHTML='<span class="s23-cover-imprint">SIGLO23</span><div class="s23-cover-back-title">'+escape(heading.title||'El individuo contra el Estado')+'</div><p class="s23-cover-back-description">Contratapa editable. Podés colocar la ilustración final como fondo y agregar cajas de texto.</p>';
 }else{
  content.innerHTML='<span class="s23-cover-plain">'+(kind==='inside-front'?'INTERIOR DE TAPA':'INTERIOR DE CONTRATAPA')+'</span>';
 }
 e.append(content);
 return e;
}
async function mount(host,settings){
 closeEditor();
 for(const old of assetURLs.values())URL.revokeObjectURL(old);
 assetURLs.clear();pages.clear();
 const root=host.querySelector('.pagedjs_pages');
 if(!root)throw Error('Falta la grilla Paged.js');
 for(const leaf of root.querySelectorAll('.pagedjs_page')){
  const key=leaf.dataset.s23Key;
  if(!key)continue;
  const slot=leaf.closest('.s23-spread-slot');
  const num=Number(leaf.dataset.s23Folio);
  const kind=leaf.dataset.s23Kind||'interior';
  leaf.dataset.widthMm=settings.width;leaf.dataset.heightMm=settings.height;
  let label=kind==='front'?'TAPA · P. 1':kind==='back'?'CONTRATAPA · P. '+num:
   kind==='inside-front'?'INTERIOR TAPA · P. '+num:kind==='inside-back'?'INTERIOR CONTRATAPA · P. '+num:
   kind==='pad'?'BLANCO EDITORIAL · P. '+num:'INTERIOR · P. '+num;
  const item={key,label,page:leaf,slot,model:(await get('pages',key))||seed(key),toolbar:null};
  pages.set(key,item);
  buildToolbar(item);bindPointer(item);
  const image=await get('images',key);
  if(image){const url=URL.createObjectURL(image);assetURLs.set(key,url);applyBackground(item,url)}
  else applyBackground(item,'');
  redraw(item);
 }
 notice(pages.size+' páginas disponibles. Las imágenes se guardan localmente en este navegador; exportá un respaldo antes de cambiar de equipo.');
}
async function batch(files){
 if(!pages.size){notice('Primero componé el libro para asignar los fondos.',true);return}
 let applied=0,unmatched=[],failed=[];
 for(const file of files){
  const name=file.name.toLocaleLowerCase('es');
  let key='';
  if(/(contratapa|back[-_ ]?cover|cover[-_ ]?back)/.test(name))key='cover:back';
  else if(/(tapa|front[-_ ]?cover|cover[-_ ]?front|portada)/.test(name))key='cover:front';
  else {
   const m=name.match(/(?:^|[-_ ])(?:pag(?:ina)?|page|p)[-_ ]?0*(\d{1,5})(?=[-_. ]|$)/);
   if(m){
    const folio=Number(m[1]);
    for(const p of pages.values())if(Number(p.page.dataset.s23Folio)===folio){key=p.key;break}
   }
  }
  if(!key||!pages.has(key)){unmatched.push(file.name);continue}
  try{await assignImage(pages.get(key),file);applied++}catch(err){failed.push(file.name+': '+err.message)}
 }
 notice('Lote: '+applied+' imágenes asignadas. '+unmatched.length+' sin coincidencia'+(failed.length?'; '+failed.length+' rechazadas':'')+'. '+(unmatched.length?'Nombrá p001.jpg, p002.jpg, tapa.jpg o contratapa.jpg.':'')+(failed.length?' '+failed.join('; '):''),!!failed.length);
}
async function exportBackup(){
 const data={schema:1,project:'Siglo23 Spencer',exportedAt:new Date().toISOString(),pages:{}};
 const sizeLimit=120*1024*1024;let total=0;
 for(const [key,item] of pages){
  const info=JSON.parse(JSON.stringify(item.model));
  const img=await get('images',key);
  if(img){
   total+=img.size;
   if(total>sizeLimit){notice('Respaldo demasiado grande para JSON: exportá originales por separado. Las composiciones siguen guardadas.',true);return}
   const arr=new Uint8Array(await img.arrayBuffer());
   let str='';const chunk=0x8000;
   for(let i=0;i<arr.length;i+=chunk)str+=String.fromCharCode(...arr.subarray(i,i+chunk));
   info.imageData='data:'+img.type+';base64,'+btoa(str);
  }
  data.pages[key]=info;
 }
 const content=JSON.stringify(data);
 const blob=new Blob([content],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='spencer-capas-e-imagenes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
 notice('Respaldo de '+pages.size+' páginas y originales de imagen exportado.');
}
async function importBackup(file){
 if(!file||file.size>190*1024*1024)throw Error('Respaldo demasiado grande');
 const obj=JSON.parse(await file.text());
 if(obj.schema!==1||obj.project!=='Siglo23 Spencer'||!obj.pages||typeof obj.pages!=='object')throw Error('Respaldo no compatible con Spencer');
 let count=0;
 for(const [key,info] of Object.entries(obj.pages)){
  if(!pages.has(key)||!info||!Array.isArray(info.boxes))continue;
  const item=pages.get(key);let imageData=info.imageData;delete info.imageData;
  if(imageData){
   const m=imageData.match(/^data:(image\/(?:jpeg|png|webp|avif));base64,(.+)$/s);
   if(!m)throw Error('Formato de imagen no admitido en el respaldo');
   const binary=atob(m[2]),raw=new Uint8Array(binary.length);
   for(let i=0;i<binary.length;i++)raw[i]=binary.charCodeAt(i);
   const blob=new Blob([raw],{type:m[1]});
   await set('images',key,blob);
   const previous=assetURLs.get(key);if(previous)URL.revokeObjectURL(previous);
   const url=URL.createObjectURL(blob);assetURLs.set(key,url);applyBackground(item,url);
  }
  const boxes=info.boxes.filter(b=>typeof b.text==='string'&&Number.isFinite(Number(b.x))&&Number.isFinite(Number(b.w))).slice(0,70).map(b=>({
   id:String(b.id||'bx-'+Math.random().toString(36).slice(2,9)),x:clamp(Number(b.x),0,94),y:clamp(Number(b.y)||0,0,95),
   w:clamp(Number(b.w),6,100),h:clamp(Number(b.h)||20,5,100),font:clamp(Number(b.font)||12,6,72),text:b.text.slice(0,30000)
  }));
  item.model={boxes,flowHidden:!!info.flowHidden,fit:info.fit==='contain'?'contain':'cover',meta:info.meta||null};
  await set('pages',key,item.model);redraw(item);applyBackground(item,assetURLs.get(key)||'');
  count++;
 }
 notice('Importadas '+count+' composiciones con sus imágenes. Revisá el encuadre y el orden de páginas.');
}
function bindControls(){
 $('pageAddBox').addEventListener('click',()=>{if(active)addBox(active)});
 $('pageTakeText').addEventListener('click',()=>{
  if(!active)return;
  const area=active.page.querySelector('.pagedjs_page_content');
  const text=(area?.innerText||'').trim();
  if(!text){notice('Esta página no tiene texto paginado para convertir.',true);return}
  if(!window.confirm('¿Convertir el texto paginado en una caja independiente? Queda editable, pero no se redistribuirá automáticamente al cambiar el diseño general.'))return;
  active.model.flowHidden=true;redraw(active);$('pageLayerHideFlow').checked=true;addBox(active,text);
 });
 $('pageRemoveBg').addEventListener('click',async()=>{
  if(!active)return;
  await del('images',active.key);
  const url=assetURLs.get(active.key);if(url)URL.revokeObjectURL(url);assetURLs.delete(active.key);
  active.model.meta=null;applyBackground(active,'');scheduleSave(active);$('pageLayerImageInfo').textContent='Sin fondo';notice('Fondo retirado de '+active.label);
 });
 $('pageLayerFit').addEventListener('change',()=>{
  if(!active)return;active.model.fit=$('pageLayerFit').value;
  applyBackground(active,assetURLs.get(active.key)||'');scheduleSave(active);
 });
 $('pageLayerHideFlow').addEventListener('change',()=>{
  if(!active)return;active.model.flowHidden=$('pageLayerHideFlow').checked;redraw(active);scheduleSave(active);
 });
 $('pageBoxText').addEventListener('input',()=>{
  if(!selected)return;
  const data=boxFrom(selected.item,selected.id);if(!data)return;
  data.text=$('pageBoxText').value.slice(0,30000);
  selected.el.querySelector('.s23-custom-text-body').textContent=data.text;
  checkOverflow(selected.item);scheduleSave(selected.item);
 });
 $('pageBoxSize').addEventListener('input',()=>{
  if(!selected)return;
  const data=boxFrom(selected.item,selected.id);if(!data)return;
  data.font=clamp(Number($('pageBoxSize').value)||12,6,72);
  selected.el.style.fontSize=data.font+'pt';checkOverflow(selected.item);scheduleSave(selected.item);
 });
 $('pageDeleteBox').addEventListener('click',()=>{
  if(!selected)return;
  const item=selected.item,id=selected.id;
  item.model.boxes=item.model.boxes.filter(x=>x.id!==id);deselect();redraw(item);scheduleSave(item);
 });
 $('pageLayerClose').addEventListener('click',closeEditor);
 $('pageBatchImages').addEventListener('change',async e=>{
  if(e.target.files?.length)await batch([...e.target.files]);
  e.target.value='';
 });
 $('pageExportLayers').addEventListener('click',()=>exportBackup().catch(err=>notice(err.message,true)));
 $('pageImportLayers').addEventListener('change',async e=>{
  try{if(e.target.files?.[0])await importBackup(e.target.files[0])}catch(err){notice('No se pudo importar: '+err.message,true)}finally{e.target.value=''}
 });
}
document.addEventListener('DOMContentLoaded',bindControls);
window.S23PageDesigner={mount,createCover,getPage:key=>pages.get(key),assignImage,batch,closeEditor};
})();