/* Siglo23 Spencer · M10 · prueba de composición HTML/CSS Paged Media.
   Esta herramienta es complementaria y NO sobrescribe los datos de M09. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const stateKey='siglo23-spencer-maquetacion-v1';
const profileKey='siglo23-spencer-preprensa-v1';
const formats={a5:[148,210],trade:[152.4,228.6],compact:[139.7,215.9],large:[170,240]};
const originalIds=['original-preface','original-new-toryism','original-coming-slavery','original-sins-legislators','original-great-superstition','original-postscript'];
const titleDefaults={
 half:'Portadilla',title:'Portada interior',legal:'Créditos editoriales',toc:'Índice general',
 prologue:'Prólogo editorial',context:'Contexto complementario',biography:'Herbert Spencer: el hombre que quiso ponerle límites al poder',
 study:'Comprender a Herbert Spencer',afterword:'El individuo contra el Estado, otra vez',
 bibliography:'Fuentes y bibliografía','index-onomastic':'Índice onomástico','index-analytic':'Índice analítico','index-works':'Índice de obras'
};
let saved={};try{saved=JSON.parse(localStorage.getItem(stateKey)||'{}')}catch(e){}
let book=null,indices=null,doc='',style='',flow=null,cssUrl=null,isWorking=false;
const fallbackSections=[
 ['half','Portadilla'],['title','Portada interior'],['legal','Créditos y derechos'],['toc','Índice general'],
 ['biography',titleDefaults.biography],['study',titleDefaults.study],
 ['original-preface','PREFACE'],['original-new-toryism','THE NEW TORYISM'],['original-coming-slavery','THE COMING SLAVERY'],
 ['original-sins-legislators','THE SINS OF LEGISLATORS'],['original-great-superstition','THE GREAT POLITICAL SUPERSTITION'],
 ['original-postscript','POSTSCRIPT'],['afterword',titleDefaults.afterword],['bibliography',titleDefaults.bibliography],
 ['index-onomastic',titleDefaults['index-onomastic']],['index-analytic',titleDefaults['index-analytic']],
 ['index-works',titleDefaults['index-works']],['colophon','Colofón']
].map(x=>({id:x[0],name:x[1],enabled:true,recto:true}));
const config={
 trim:saved.trim||'a5',width:148,height:210,
 inner:Number(saved.marginInner??22),outer:Number(saved.marginOuter??17),
 top:Number(saved.marginTop??21),bottom:Number(saved.marginBottom??21),
 bleed:Number(saved.bleed??3),fontSize:Number(saved.fontPt??10.5),leading:Number(saved.leading??1.44)
};
if(formats[config.trim]){config.width=formats[config.trim][0];config.height=formats[config.trim][1]}
else{config.width=Number(saved.customW??148);config.height=Number(saved.customH??210)}
let profile={};
try{profile=JSON.parse(localStorage.getItem(profileKey)||'{}')}catch(e){}
if(profile&&profile.schema===1&&profile.config){
 for(const id of ['trim','width','height','inner','outer','top','bottom','bleed','fontSize','leading']){
  if(id==='trim'){if(profile.config.trim in formats||profile.config.trim==='custom')config.trim=profile.config.trim}
  else if(Number.isFinite(Number(profile.config[id])))config[id]=Number(profile.config[id]);
 }
}
function setFields(){
 for(const id of ['trim','width','height','inner','outer','top','bottom','bleed','fontSize','leading'])$(id).value=config[id];
 if(profile?.schema===1){
  for(const id of ['figures','indices','opening'])if(typeof profile[id]==='boolean')$(id).checked=profile[id];
 }
}
function persist(){
 const configData=readFields();
 try{localStorage.setItem(profileKey,JSON.stringify({schema:1,updated:new Date().toISOString(),config:configData,
 figures:$('figures').checked,indices:$('indices').checked,opening:$('opening').checked}))}catch(e){}
}
function readFields(){
 for(const id of ['width','height','inner','outer','top','bottom','bleed','fontSize','leading']){
  config[id]=Number($(id).value);
 }
 config.trim=$('trim').value;
 return config;
}
function num(value){return Number(value).toLocaleString('es-AR')}
function sourceText(section){
 const local=saved.texts&&saved.texts[section];
 if(typeof local==='string'&&local.trim())return local;
 if(book&&section.startsWith('original-'))return (book.chapters.find(x=>x.id===section)||{}).text||'';
 return '';
}
function check(ok,msg,type){return '<li class="'+(ok?'ok':type||'bad')+'">'+(ok?'✓ ':'! ')+esc(msg)+'</li>'}
function validate(){
 const c=readFields();
 const issues=[];
 if(Object.values(c).some(x=>typeof x==='number'&&!Number.isFinite(x)))issues.push('Hay valores numéricos inválidos.');
 if(c.width<90||c.width>300||c.height<120||c.height>350)issues.push('El formato solicitado está fuera del intervalo permitido.');
 if([c.inner,c.outer,c.top,c.bottom,c.bleed].some(x=>x<0))issues.push('Márgenes y sangrado no pueden ser negativos.');
 if(c.width-c.inner-c.outer<35||c.height-c.top-c.bottom<60)issues.push('Caja de texto demasiado pequeña para un libro.');
 if(c.fontSize<7||c.fontSize>20||c.leading<1||c.leading>2.4)issues.push('Cuerpo tipográfico o interlínea fuera de rango.');
 const originalWords=book?.chapters?.reduce((n,x)=>n+(x.text.match(/\S+/g)||[]).length,0)||0;
 let items=[];
 items.push(check(Boolean(book&&book.chapters?.length===6),'Original inglés de 1884, seis partes'+(book?', '+num(originalWords)+' palabras':'')));
 items.push(check(Boolean(indices&&indices.sections),'Índices y concordancias cargados; foliación todavía provisional', 'warn'));
 items.push(check(Boolean(window.S23BookAssets?.figures),'Metadatos de las cuatro láminas presentes; DPI y derechos pendientes de verificar', 'warn'));
 const localCount=Object.keys(saved.texts||{}).filter(k=>saved.texts[k]?.trim()).length;
 items.push(check(localCount>0,'Plan de Spencer guardado en este navegador'+(localCount?' ('+localCount+' textos conservados)':' (se usarán las fuentes del repositorio)'),'warn'));
 items.push(check(c.bleed>=3,'Sangrado declarado '+c.bleed+' mm; guías y fondo a sangre no sustituyen cajas PDF Trim/Bleed','warn'));
 items.push(check(c.inner>=12&&c.outer>=10&&c.top>=10&&c.bottom>=10,'Márgenes y medianil mínimos orientativos; verificar encuadernación','warn'));
 items.push(check(false,'Salida Paged.js / impresión de navegador: NO certificada PDF/X-4, ICC, fuentes incrustadas ni imposición','warn'));
 if(issues.length)items=issues.map(x=>check(false,x)).concat(items);
 $('checks').innerHTML=items.join('');
 return issues;
}
const titleFor=id=>(saved.sections||[]).find(x=>x.id===id)?.name||fallbackSections.find(x=>x.id===id)?.name||titleDefaults[id]||id;
function paras(raw,markdown){
 const lines=String(raw||'').replace(/\r\n/g,'\n').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
 return lines.map((v,i)=>{
  if(markdown && /^#{1,5}\s/.test(v)){const level=Math.min(4,(v.match(/^#+/)||['#'])[0].length+1);return '<h'+level+'>'+esc(v.replace(/^#{1,5}\s+/,''))+'</h'+level+'>'}
  if(markdown && /^[-*]\s/m.test(v) && v.split('\n').every(l=>/^[-*]\s/.test(l))){return '<ul>'+v.split('\n').map(l=>'<li>'+esc(l.replace(/^[-*]\s+/,''))+'</li>').join('')+'</ul>'}
  return '<p>'+esc(v).replace(/\n/g,'<span class="soft-break"> </span>')+'</p>';
 }).join('');
}
function sectionBlock(id,name,body,recto,klass){
 return '<section class="book-section '+(klass||'')+(recto?' recto':'')+'" id="'+esc(id)+'"><h1>'+esc(name)+'</h1>'+body+'</section>';
}
function figureParts(after){
 if(!$('figures').checked)return '';
 const arts=window.S23BookAssets?.figures||[];
 return arts.filter(x=>x.after===after).map(a=>{
  const src=/^https:\/\//.test(a.src)?esc(a.src):'';
  if(!src)return '';
  const figcaption=esc(a.creator+' · '+a.title+' ('+a.year+'). '+a.credit);
  if(a.pages===2){
   return '<div class="spread-leaf left" aria-label="'+figcaption+'" style="background-image:url(&quot;'+src+'&quot;)"></div>'
    +'<div class="spread-leaf right" aria-label="'+figcaption+'" style="background-image:url(&quot;'+src+'&quot;)"></div>';
  }
  return '<figure class="plate recto"><img src="'+src+'" alt="'+esc(a.title)+'"><figcaption>'+figcaption+'</figcaption></figure>';
 }).join('');
}
function indiceEntries(id){
 const all=indices?.sections?.[id]||[];
 return all.map(x=>{
  const loc=(x.occ||[]).map(o=>titleFor(o.s).replace(/^THE /,'').toLocaleLowerCase('es').slice(0,48)).filter((a,i,arr)=>arr.indexOf(a)===i).slice(0,4);
  return '<div class="index-entry"><h3>'+esc(x.name)+'</h3>'+(x.dates?'<em>'+esc(x.dates)+'</em>':'')
   +(x.author?'<em>'+esc(x.author)+'</em>':'')+(x.desc?'<p>'+esc(x.desc)+'</p>':'')
   +(loc.length?'<small>Ensayos de referencia: '+esc(loc.join(' · '))+'. Folios por cerrar.</small>':'')+'</div>';
 }).join('');
}
function frontMatter(id){
 const title=esc(saved.title||'El individuo contra el Estado'),author=esc(saved.author||'Herbert Spencer'),imprint=esc(saved.imprint||'SIGLO23');
 if(id==='half')return '<section class="front front-half recto" id="half"><p class="small">'+imprint+' / CLÁSICOS</p><h1>'+title+'</h1></section>';
 if(id==='title')return '<section class="front recto" id="title"><p class="small">'+imprint+'</p><h1>'+title+'</h1><h2>'+author+'</h2><p>Edición crítica e ilustrada · Material de preproducción</p></section>';
 if(id==='legal')return '<section class="book-section legal" id="legal"><h1>Créditos y derechos</h1><p>Herbert Spencer, The Man versus the State, Williams & Norgate, 1884.</p><p>Transcripción y aparato editorial en revisión. No utilizar esta prueba como arte final ni atribuir licencias de imágenes sin verificación territorial.</p></section>';
 if(id==='colophon')return '<section class="front recto" id="colophon"><p class="small">SIGLO23</p><h1>Colofón</h1><p>Prueba editorial generada con Paged.js 0.4.3. Pendiente de corrección y certificación de imprenta.</p></section>';
 return '';
}
function tableContents(sections){
 return sections.filter(s=>s.enabled!==false&&s.id!=='plates'&&s.id!=='toc'&&s.id!=='half'&&s.id!=='title'&&s.id!=='legal'&&s.id!=='colophon')
 .filter(s=>!(['prologue','context'].includes(s.id)&&!sourceText(s.id)))
 .map(s=>'<li><a href="#'+esc(s.id)+'">'+esc(s.name||titleFor(s.id))+'</a></li>').join('');
}
function bookHTML(){
 const sections=Array.isArray(saved.sections)&&saved.sections.length?saved.sections:fallbackSections;
 const originalMap=new Map((book?.chapters||[]).map(x=>[x.id,x]));
 let output='';
 for(const s of sections){
  if(s.enabled===false)continue;
  const id=s.id;
  if(['half','title','legal','colophon'].includes(id)){output+=frontMatter(id);if(id==='title')output+=figureParts('title');continue}
  if(id==='plates')continue;
  if(id==='toc'){output+=sectionBlock(id,s.name||'Índice general','<ol class="contents">'+tableContents(sections)+'</ol>',true,'toc');continue}
  if(id==='bibliography'){
   const entries=window.S23BookAssets?.bibliography||[];
   const content=entries.map(group=>'<h2>'+esc(group.heading)+'</h2><ul>'+group.entries.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>').join('');
   output+=sectionBlock(id,s.name||titleDefaults.bibliography,content,s.recto,'bibliography');continue;
  }
  if(id.startsWith('index-')){
   if(!$('indices').checked)continue;
   output+=sectionBlock(id,s.name||titleFor(id),'<p class="editor-note">Concordancias preliminares. Las referencias de página se generarán al cierre editorial.</p><div class="index-columns">'+indiceEntries(id)+'</div>',true,'indices');
   continue;
  }
  const raw=sourceText(id);
  if(!raw.trim())continue;
  const chapter=originalMap.get(id),essay=originalIds.slice(1,5).includes(id);
  const name=chapter?.title||s.name||titleFor(id);
  if(essay&&$('opening').checked){
   const note=typeof(saved.chapterNotes||{})[id]==='string'?saved.chapterNotes[id]:(window.S23ChapterNotes?.entries?.[id]?.body||'');
   output+='<section class="opening-left" aria-label="Notas de apertura"><p class="eyebrow">LECTURA CRÍTICA · SIGLO23</p><h2>'+esc(name)+'</h2>'+paras(note,true)+'</section>'
    +'<section class="opening-right"><p class="eyebrow">HERBERT SPENCER · 1884</p><h1>'+esc(name)+'</h1><div class="rule"></div></section>';
  }
  output+=sectionBlock(id,name,paras(raw,!chapter),!essay&&s.recto,'reading '+(essay&&$('opening').checked?'essay-after-opening':''));
  output+=figureParts(id);
 }
 return output;
}
function makeCSS(){
 const c=config,px=v=>Math.max(0,Number(v))+'mm',w=px(c.width),h=px(c.height);
 const font=saved.font&&saved.font.startsWith('Montserrat')?'Montserrat,Arial,sans-serif':'Georgia,Times New Roman,serif';
 const heading=saved.headingFont&&saved.headingFont.startsWith('Montserrat')?'Montserrat,Arial,sans-serif':'Georgia,Times New Roman,serif';
 return '@page{size:'+w+' '+h+';margin:'+px(c.top)+' '+px(c.outer)+' '+px(c.bottom)+' '+px(c.inner)+';@bottom-center{content:counter(page);font:8pt Georgia;color:#777}}'
 +'@page :left{margin-left:'+px(c.outer)+';margin-right:'+px(c.inner)+';@bottom-left{content:counter(page);font:8pt Georgia;color:#777}@bottom-center{content:none}}'
 +'@page :right{margin-left:'+px(c.inner)+';margin-right:'+px(c.outer)+';@bottom-right{content:counter(page);font:8pt Georgia;color:#777}@bottom-center{content:none}}'
 +'@page :blank{@bottom-left{content:none}@bottom-right{content:none}@bottom-center{content:none}}'
 +'@page :first{@bottom-center{content:none}}'
 +'*{box-sizing:border-box}.pagedjs_page{color:#292822;background:#fff;font-family:'+font+'}.book-section,.front,.opening-left,.opening-right{color:#292822}'
 +'.book-section{break-before:page;page-break-before:always}.book-section.recto,.front.recto,.plate.recto{break-before:right}'
 +'.book-section h1{font:normal 21pt/1.22 '+heading+';margin:12mm 0 7mm;text-align:center;break-after:avoid}'
 +'.book-section h2{font:normal 14pt/1.3 '+heading+';margin:6mm 0 2mm;break-after:avoid}'
 +'.book-section h3{font:bold 10pt/1.3 '+heading+';margin:2mm 0 1mm;break-after:avoid}'
 +'.reading p{font:'+esc(saved.fontStyle==='italic'?'italic ':'')+Number(saved.fontWeight||400)+' '+c.fontSize+'pt/'+c.leading+' '+font+';margin:0 0 '+px(saved.paraGap??1.3)+';text-align:justify;hyphens:auto;orphans:3;widows:3;overflow-wrap:break-word;text-indent:'+px(saved.indent??4)+'}'
 +'.reading p:first-of-type{text-indent:0}.reading h2,.reading h3{margin-top:7mm}'
 +'.front{break-before:page;min-height:'+(c.height-c.top-c.bottom-4)+'mm;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center}'
 +'.front h1{font:normal 31pt/1.2 '+heading+';max-width:90%;margin:14mm auto}.front h2{font:normal 16pt Georgia}.front .small{letter-spacing:.3em;font-size:9pt}'
 +'.legal{font:9pt/1.6 Georgia}.toc .contents{list-style:none;margin:5mm 0;padding:0}.toc li{padding:3mm 0;border-bottom:1px dotted #bababa;break-inside:avoid}'
 +'.toc a{text-decoration:none;color:inherit}.toc a::after{content:leader(".") target-counter(attr(href),page);float:right}'
 +'.opening-left,.opening-right{break-after:page;min-height:'+(c.height-c.top-c.bottom-10)+'mm;display:flex;flex-direction:column;justify-content:center;text-align:center}'
 +'.opening-left{break-before:left}.opening-right{break-before:page}.opening-left h2{font:normal 22pt Georgia}.opening-left p{font:10pt/1.55 Georgia;text-align:left}'
 +'.opening-right h1{font:normal 31pt/1.15 '+heading+'}.eyebrow{font:7pt Montserrat,Arial;letter-spacing:.22em}.rule{width:20mm;height:1px;background:#b49769;margin:12mm auto}'
 +'.essay-after-opening{break-before:right}.plate{break-before:page;break-after:page;text-align:center;min-height:'+(c.height-c.top-c.bottom-5)+'mm;display:flex;flex-direction:column;justify-content:center;align-items:center;break-inside:avoid}'
 +'.plate img{display:block;max-width:100%;max-height:'+(c.height-c.top-c.bottom-36)+'mm;object-fit:contain}.plate figcaption{font:8pt/1.4 Georgia;margin:3mm 0}'
 +'.spread-leaf{break-before:page;break-after:page;min-height:'+(c.height-c.top-c.bottom-3)+'mm;background-size:200% 100%;background-repeat:no-repeat;background-position:left center}'
 +'.spread-leaf.left{break-before:left}.spread-leaf.right{background-position:right center}'
 +'.bibliography{font:9pt/1.55 Georgia}.bibliography li{margin:2mm 0;break-inside:avoid}'
 +'.indices{font:9pt/1.4 Georgia}.index-columns{column-count:2;column-gap:7mm}.index-entry{break-inside:avoid;margin:0 0 4mm}.index-entry h3{font-size:9pt;margin:0}.index-entry em{display:block;font-size:8pt}.index-entry p{margin:1mm 0}.index-entry small{display:block;color:#666;font-size:7pt}.editor-note{font:italic 9pt Georgia;margin-bottom:8mm}'
 +'.soft-break{white-space:normal}img{max-width:100%}';
}
/* Parejas de lectura: 1 en recto; 2-3, 4-5, etc. Los blancos de pantalla
   NO se agregan al PDF ni modifican la secuencia de páginas compuestas. */
function arrangeFacingPages(){
 const host=$('rendered');
 const pagesRoot=host.querySelector('.pagedjs_pages');
 if(!pagesRoot)throw Error('Paged.js no devolvió un contenedor de páginas');
 const interiors=Array.from(pagesRoot.children).filter(x=>x.classList.contains('pagedjs_page'));
 if(!interiors.length)throw Error('No hay páginas compuestas para armar pliegos');
 const designer=window.S23PageDesigner;
 if(!designer?.createCover)throw Error('Falta el editor de tapa y contratapa');
 const front=designer.createCover('front',config,saved);
 const insideFront=designer.createCover('inside-front',config,saved);
 const insideBack=designer.createCover('inside-back',config,saved);
 const back=designer.createCover('back',config,saved);
 const pad=interiors.length%2?designer.createCover('pad',config,saved):null;
 const sheets=[front,insideFront,...interiors,...(pad?[pad]:[]),insideBack,back];
 const first=sheets[0];
 const box=first.getBoundingClientRect();
 pagesRoot.style.setProperty('--s23-leaf-w',Math.max(1,box.width)+'px');
 pagesRoot.style.setProperty('--s23-leaf-h',Math.max(1,box.height)+'px');
 const all=new Map();
 function getSpread(index){
  if(all.has(index))return all.get(index);
  const spread=document.createElement('section');
  spread.className='s23-spread';
  spread.dataset.spread=String(index+1);
  const heading=document.createElement('div');
  heading.className='s23-spread-caption';
  const open=document.createElement('div');
  open.className='s23-spread-pages';
  const slots={};
  for(const side of ['left','right']){
   const slot=document.createElement('div');
   slot.className='s23-spread-slot s23-spread-'+side;
   slot.dataset.side=side;
   open.append(slot);slots[side]=slot;
  }
  spread.append(heading,open);
  const result={spread,heading,slots};
  all.set(index,result);
  return result;
 }
 sheets.forEach((leaf,i)=>{
  const number=i+1;
  const numberPair=Math.floor(number/2);
  const item=getSpread(numberPair);
  const side=number%2===0?'left':'right';
  leaf.dataset.s23Folio=String(number);
  const kind=i===0?'front':i===1?'inside-front':
   i<2+interiors.length?'interior':
   pad&&i===2+interiors.length?'pad':
   i===sheets.length-2?'inside-back':'back';
  leaf.dataset.s23Kind=kind;
  leaf.dataset.s23Key=kind==='interior'?'interior:'+(i-1):kind==='front'?'cover:front':
   kind==='inside-front'?'cover:inside-front':kind==='back'?'cover:back':
   kind==='inside-back'?'cover:inside-back':'cover:pad';
  item.slots[side].append(leaf);
 });
 const fragment=document.createDocumentFragment();
 for(const [index,item] of [...all.entries()].sort((a,b)=>a[0]-b[0])){
  const left=item.slots.left,right=item.slots.right;
  const hasLeft=!!left.querySelector('.pagedjs_page');
  const hasRight=!!right.querySelector('.pagedjs_page');
  for(const [slot,exists] of [[left,hasLeft],[right,hasRight]]){
   if(!exists){
    slot.classList.add('s23-visual-blank');
    const filler=document.createElement('div');
    filler.className='s23-blank-leaf';
    filler.setAttribute('aria-hidden','true');
    slot.append(filler);
   }
  }
  const even=index*2,odd=even+1;
  item.heading.textContent=index===0?'Pliego 1 · página 1 a la derecha':
   hasLeft&&hasRight?'Pliego '+(index+1)+' · páginas '+even+'–'+odd:
   'Pliego '+(index+1)+' · página '+even+' a la izquierda';
  item.spread.setAttribute('aria-label',item.heading.textContent);
  fragment.append(item.spread);
 }
 pagesRoot.replaceChildren(fragment);
 return {folios:sheets.length,pliegos:all.size};
}
function interiorsCount(){return $('rendered').querySelectorAll('[data-s23-kind="interior"]').length}
function updateZoom(){
 const pct=Number($('zoom').value);
 $('zoomLabel').textContent=pct+'%';
 $('rendered').style.zoom=(pct/100);
}
function saveFile(name,data,type){const blob=new Blob([data],{type:type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
function stateStatus(msg){$('progress').textContent=msg;$('report').textContent=msg}
async function compose(){
 if(isWorking)return;
 const invalid=validate();if(invalid.length){stateStatus('Corregí los controles señalados.');return}
 if(!book){stateStatus('No se encontró el original; no es posible componer una prueba confiable.');return}
 if(!window.Paged||!window.Paged.Previewer){stateStatus('No se cargó Paged.js. Revisá la conexión con el CDN o el bloqueo de scripts.');return}
 isWorking=true;$('compose').disabled=true;$('print').disabled=true;$('export').disabled=true;
 stateStatus('Componiendo texto y creando páginas…');
 try{
  doc=bookHTML();style=makeCSS();
  if(cssUrl)URL.revokeObjectURL(cssUrl);
  cssUrl=URL.createObjectURL(new Blob([style],{type:'text/css'}));
  $('manuscript').innerHTML=doc;
  $('rendered').replaceChildren();
  await document.fonts.ready;
  const paginator=new window.Paged.Previewer();
  flow=await paginator.preview($('manuscript'),[cssUrl],$('rendered'));
  const facing=arrangeFacingPages();
  const pages=facing.folios;
  try{await window.S23PageDesigner.mount($('rendered'),config)}catch(error){
   console.error('Capas de página no disponibles:',error);
   stateStatus('El libro se paginó, pero no se pudieron cargar las capas: '+error.message);
  }
  const pics=$('rendered').querySelectorAll('img');
  let missing=0;for(const im of pics)if(!im.complete||!im.naturalWidth)missing++;
  stateStatus(num(pages)+' caras visibles ('+num(interiorsCount())+' interiores, tapa y contratapa) en '+num(facing.pliegos)+' pliegos enfrentados. '+(missing?missing+' imagen(es) no cargadas.':'Imágenes a verificar en preimpresión.')+' Folios e índices sujetos a revisión.');
  $('print').disabled=false;$('export').disabled=false;updateZoom();
 }catch(err){stateStatus('Falló la composición: '+(err?.message||String(err)));console.error(err)}
 finally{isWorking=false;$('compose').disabled=false}
}
async function load(){
 setFields();
 try{
  const [a,b]=await Promise.all([
   fetch('./original-ingles-1884.json',{cache:'no-store'}),
   fetch('./indices-editoriales.json',{cache:'no-store'})
  ]);
  if(!a.ok)throw Error('No se pudo cargar original-ingles-1884.json (HTTP '+a.status+')');
  book=await a.json();
  if(!Array.isArray(book.chapters)||book.chapters.length!==6)throw Error('Original incompleto');
  const words=book.chapters.reduce((n,x)=>n+(x.text.match(/\S+/g)||[]).length,0);
  if(words!==book.words_total)throw Error('El recuento de la transcripción no coincide');
  if(b.ok)indices=await b.json();
  const extras=[
   ['biography','./textos/biografia-herbert-spencer-2026.md'],
   ['study','./textos/estudio-introductorio-2026.md'],
   ['afterword','./textos/epilogo-2026.md']
  ];
  const results=await Promise.allSettled(extras.map(async entry=>{
   const response=await fetch(entry[1]);if(!response.ok)throw Error(entry[0]+': HTTP '+response.status);
   return [entry[0],await response.text()];
  }));
  if(!saved.texts)saved.texts={};
  results.forEach((r,i)=>{if(r.status==='fulfilled'&&!saved.texts[r.value[0]])saved.texts[r.value[0]]=r.value[1]});
  $('sourceState').textContent='Fuente: 1884 · '+num(words)+' palabras · '+extras.filter((x,i)=>results[i].status==='fulfilled').length+' de 3 anexos disponibles.';
 }catch(err){$('sourceState').textContent='Fuente no disponible: '+err.message}
 validate();
}
$('trim').addEventListener('change',()=>{
 const t=$('trim').value;if(formats[t]){ $('width').value=formats[t][0];$('height').value=formats[t][1]};persist()
});
$('compose').addEventListener('click',()=>{persist();compose()});
$('print').addEventListener('click',()=>{if(flow){updateZoom();window.print()}});
$('export').addEventListener('click',()=>{if(!flow)return;
 const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Spencer · fuente paginable de prueba</title><style>'+style+'</style></head><body>'+doc+'</body></html>';
 saveFile('spencer-interior-fuente-paginable.html',html,'text/html;charset=utf-8');
});
$('zoom').addEventListener('input',updateZoom);
for(const id of ['width','height','inner','outer','top','bottom','bleed','fontSize','leading'])$(id).addEventListener('change',()=>{
 if((id==='width'||id==='height') && formats[$('trim').value] &&
  (Number($('width').value)!==formats[$('trim').value][0]||Number($('height').value)!==formats[$('trim').value][1]))$('trim').value='custom';
 persist();validate();
});
for(const id of ['figures','indices','opening'])$(id).addEventListener('change',()=>{persist();validate()});
$('saveProfile').addEventListener('click',()=>{
 persist();const data=localStorage.getItem(profileKey);
 if(data)saveFile('siglo23-spencer-perfil-preprensa.json',data,'application/json');
});
$('importProfile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>100000)throw Error('Archivo de perfil demasiado grande');
 const p=JSON.parse(await file.text());if(p.schema!==1||!p.config||!('width'in p.config))throw Error('No es un perfil de preprensa');
 profile=p;for(const k of Object.keys(config)){if(k==='trim')config[k]=p.config[k]||'custom';else if(Number.isFinite(Number(p.config[k])))config[k]=Number(p.config[k]);}
 setFields();persist();validate();stateStatus('Perfil importado. Volvé a componer para aplicar los cambios.');
 }catch(err){stateStatus('Perfil rechazado: '+err.message)}finally{e.target.value=''}
});
load();
})();