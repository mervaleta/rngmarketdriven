
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,min,max,d=min)=>{const n=Number(x);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):d};
const f=(n,d=0)=>Number(n||0).toLocaleString('es-AR',{minimumFractionDigits:d,maximumFractionDigits:d});
const KEY='siglo23-spencer-maquetacion-v1';
const seed={
 trim:'a5',customW:148,customH:210,font:"Georgia, 'Times New Roman', serif",fontPt:10.5,leading:1.44, fontWeight:400,fontStyle:'normal',headingFont:"Georgia, 'Times New Roman', serif",headingWeight:400,headingStyle:'normal',texts:{},
 marginInner:22,marginOuter:17,marginTop:21,marginBottom:21,indent:4,paraGap:1.3,bleed:3,caliper:.105,
 words:0,zoom:.62,coverColor:'#24443a',title:'El individuo contra el Estado',
 author:'Herbert Spencer',imprint:'SIGLO23',showGuides:true,showFolios:true,showRunning:true,chapterOpenings:true,openingTextRecto:true,indexPortraits:true,
 sample:'La edición crítica reconstruye el debate intelectual de la Inglaterra victoriana y sitúa los argumentos de Herbert Spencer en su contexto histórico. Las transformaciones del Estado, la sociedad industrial y la libertad individual constituyen el eje de la lectura propuesta.\n\nEste texto es una muestra editorial de composición, no una transcripción de la obra de 1884. Su función consiste en comparar cuerpos tipográficos, interlineados, márgenes y densidades de página.\n\nCada decisión de diseño deberá contrastarse con el texto definitivo, las imágenes autorizadas y las especificaciones técnicas de la imprenta. La paginación final solo podrá cerrarse una vez concluida la corrección de estilo y la composición.',
 sections:[
 ['half','Portadilla',1,true],['title','Portada interior',1,true],['legal','Créditos y derechos',1,false],
 ['toc','Índice general',4,true],['prologue','Prólogo editorial · pendiente','auto',true],['context','Contexto complementario · pendiente','auto',true],['biography','Biografía de Spencer · pendiente','auto',true],['study','Comprender a Herbert Spencer · estudio introductorio','auto',true],
 ['original-preface','Preface · 1884','auto',true],
 ['original-new-toryism','THE NEW TORYISM','auto',true],
 ['original-coming-slavery','THE COMING SLAVERY','auto',true],
 ['original-sins-legislators','THE SINS OF LEGISLATORS','auto',true],
 ['original-great-superstition','THE GREAT POLITICAL SUPERSTITION','auto',true],
 ['original-postscript','POSTSCRIPT','auto',true],
 ['plates','Cuatro ilustraciones históricas',6,false],
 ['afterword','El individuo contra el Estado, otra vez · epílogo 2026','auto',true],['bibliography','Fuentes y bibliografía · doble página',2,false],['index-onomastic','Índice onomástico · biografías','auto',true],['index-analytic','Índice analítico o temático','auto',true],['index-works','Índice de autores y obras citadas','auto',true],['colophon','Colofón',1,true]
 ].map(([id,name,pages,recto])=>({id,name,pages,recto,enabled:true}))
};
const formats={a5:[148,210],trade:[152.4,228.6],compact:[139.7,215.9],large:[170,240]};
const scenes=[
 ['cover','Cubierta completa'],['title','Portadilla y portada'],['legal','Créditos y blancos'],
 ['toc','Índice general'],['chapter','Apertura de capítulo'],['body','Texto corrido'],
 ['plates','Ilustraciones históricas'],['bibliography','Fuentes y bibliografía'],['afterword','Epílogo']
];
const bounds={customW:[90,250],customH:[120,330],fontPt:[7.5,18],leading:[1.05,2],caliper:[.05,.25],words:[0,1000000],zoom:[.35,1.3]};
const fonts=["Montserrat, Arial, sans-serif","Georgia, 'Times New Roman', serif","'Palatino Linotype', Palatino, 'Book Antiqua', serif","Garamond, 'Times New Roman', serif","Baskerville, 'Times New Roman', serif","'Times New Roman', Times, serif"];
function hydrate(raw){
 const s={...seed,...(raw||{})};
 if(!formats[s.trim]&&s.trim!=='custom')s.trim='a5';
 for(const [key,[min,max]] of Object.entries(bounds))s[key]=clamp(s[key],min,max,seed[key]);
 for(const key of ['marginInner','marginOuter','marginTop','marginBottom','indent','paraGap','bleed']) {
  const n=Number(s[key]);s[key]=Number.isFinite(n)?Math.max(0,n):seed[key];
 }
 for(const key of ['fontWeight','headingWeight'])s[key]=clamp(s[key],100,900,400);
 for(const key of ['fontStyle','headingStyle'])s[key]=s[key]==='italic'?'italic':'normal';
 s.texts=(s.texts&&typeof s.texts==='object'&&!Array.isArray(s.texts))?s.texts:{};
 for(const key of Object.keys(s.texts)){
  if(typeof s.texts[key]!=='string')delete s.texts[key];else s.texts[key]=s.texts[key].slice(0,4000000);
 }
 for(const key of ['title','author','imprint','sample'])s[key]=typeof s[key]==='string'?s[key].slice(0,key==='sample'?15000:160):seed[key];
 if(!fonts.includes(s.font))s.font=seed.font;
 if(!fonts.includes(s.headingFont))s.headingFont=seed.headingFont;
 if(!/^#[\da-fA-F]{6}$/.test(s.coverColor))s.coverColor=seed.coverColor;
 for(const key of ['showGuides','showFolios','showRunning','chapterOpenings','openingTextRecto','indexPortraits'])s[key]=s[key]!==false;
 s.sections=(Array.isArray(s.sections)?s.sections:seed.sections).filter(x=>x&&typeof x==='object').slice(0,50).map((x,i)=>({
  id:String(x.id||'custom-'+i).slice(0,80),name:String(x.name||'Sección').slice(0,110),
  pages:(x.id==='text'||x.id==='legacy-text'||(x.id.startsWith('original-')||['index-onomastic','index-analytic','index-works','prologue','context','biography','study','afterword'].includes(x.id)))?'auto':clamp(x.pages,1,1000,1),recto:!!x.recto,enabled:x.enabled!==false
 }));
 const originalGroup=seed.sections.filter(x=>x.id.startsWith('original-'));
 const oldIndex=s.sections.findIndex(x=>x.id==='text');
 if(oldIndex>=0&&s.sections.every(x=>!x.id.startsWith('original-')))s.sections.splice(oldIndex,1,...originalGroup.map(x=>({...x})));
 else if(!s.sections.some(x=>x.id.startsWith('original-'))){
   const at=s.sections.findIndex(x=>x.id==='plates');s.sections.splice(at<0?s.sections.length:at,0,...originalGroup.map(x=>({...x})));
 }
 s.sections=s.sections.filter(x=>x.id!=='text'&&x.id!=='index-toponymic'&&!['notes','chronology','glossary'].includes(x.id));
  // M07 · insertar secciones nuevas sin borrar datos guardados.
  for(const [id,name] of [['biography','Biografía de Spencer · pendiente'],['study','Comprender a Herbert Spencer · estudio introductorio']]){
    if(!s.sections.some(x=>x.id===id)){
      const at=s.sections.findIndex(x=>x.id==='original-preface');
      s.sections.splice(at<0?s.sections.length:at,0,{id,name,pages:'auto',recto:true,enabled:true});
    }
  }
  const ep=s.sections.find(x=>x.id==='afterword');if(ep){ep.name='El individuo contra el Estado, otra vez · epílogo 2026';ep.pages='auto';}

 s.notesOpening=false;
 for(const [id,label,n,recto] of [['plates','Cuatro ilustraciones históricas',6,false],['bibliography','Fuentes y bibliografía · doble página',2,false]]){
  let sec=s.sections.find(x=>x.id===id);
  if(!sec){sec={id,name:label,pages:n,recto,enabled:true};const at=s.sections.findIndex(x=>x.id===(id==='plates'?'afterword':'index-onomastic'));s.sections.splice(at<0?s.sections.length:at,0,sec);}
  sec.name=label;sec.pages=n;sec.recto=recto;
 }
 delete s.texts['index-toponymic'];
 const indices=[
  ['index-onomastic','Índice onomástico · biografías','auto'],
  ['index-analytic','Índice analítico o temático','auto'],
  ['index-works','Índice de autores y obras citadas','auto']
 ];
 for(const [id,name,pages] of indices){
  if(!s.sections.some(x=>x.id===id)){
   const at=s.sections.findIndex(x=>x.id==='colophon');
   s.sections.splice(at<0?s.sections.length:at,0,{id,name,pages,recto:true,enabled:true});
  }
 }
 for(const [id] of indices){const section=s.sections.find(x=>x.id===id);if(section)section.pages='auto';}
 if(typeof s.texts.text==='string'&&s.texts.text.trim()){
  s.texts['legacy-text']=s.texts['legacy-text']||s.texts.text;
  if(!s.sections.some(x=>x.id==='legacy-text'))s.sections.push({id:'legacy-text',name:'Texto de trabajo de M02 conservado',pages:'auto',recto:true,enabled:false});
 }
 for(const x of originalGroup)if(!s.sections.some(k=>k.id===x.id)){
  const after=s.sections.findIndex(k=>k.id.startsWith('original-'));
  s.sections.splice(after<0?s.sections.length:after+1,0,{...x});
 }
 return s;
}
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}}
let state=hydrate(load()),scene='cover',coverFile='',plan=null;
function fmt(){return formats[state.trim]||[state.customW,state.customH]}
function analyze(){
 const [w,h]=fmt(),width=Math.max(0,w-state.marginInner-state.marginOuter);
 const height=Math.max(0,h-state.marginTop-state.marginBottom-(state.showRunning?7:1)-(state.showFolios?7:1));
 const invalid=width<20||height<30;
 let charWidth=state.fontPt*25.4/72*(state.font.startsWith('Montserrat')?.535:.51);
 try{
  const canvas=document.createElement('canvas'),ctx=canvas.getContext?.('2d');
  if(ctx){
   ctx.font=state.fontStyle+' '+state.fontWeight+' '+(state.fontPt*96/72)+'px '+state.font;
   const sample='El individuo contra el Estado y la sociedad: una edición anotada para su lectura crítica, con referencias de época.';
   const measured=ctx.measureText(sample).width/sample.length*(25.4/96);
   if(Number.isFinite(measured)&&measured>0)charWidth=measured;
  }
 }catch{}
 const wordsPage=invalid?0:Math.round(clamp(width/charWidth/6*height/(state.fontPt*25.4/72*state.leading)*.82,1,10000,400));
 let mainPages=0,mainWords=0;const editorialPages={},editorialWords={};
 const autoPages={},items=[];let page=1,rectoBlanks=0,openingPages=0,openingCount=0,figureCount=0,figurePages=0;
 const essayIds=['original-new-toryism','original-coming-slavery','original-sins-legislators','original-great-superstition'];
 function addBlank(name){items.push({name,start:page,end:page,pages:1,blank:true});page++;rectoBlanks++;}
 const figures=window.S23BookAssets?.figures||[];
 const showFigures=state.sections.some(x=>x.id==='plates'&&x.enabled);
 function insertFigures(after){
  if(!showFigures)return;
  for(const art of figures.filter(x=>x.after===after)){
   if(art.pages===2&&page%2!==0)addBlank('Blanco de enlace · pliego ilustrado');
   if(art.pages===1&&art.recto&&page%2===0)addBlank('Blanco de enlace · lámina en recto');
   items.push({id:'figure-'+art.id,name:'Ilustración · '+art.title,figure:true,figureId:art.id,start:page,end:page+art.pages-1,pages:art.pages});
   page+=art.pages;figurePages+=art.pages;figureCount++;
  }
 }
 for(const sec of state.sections.filter(x=>x.enabled)){
  if(sec.id==='plates')continue;
  let pages=sec.pages;
  if(sec.pages==='auto'){
   if(['index-onomastic','index-analytic','index-works'].includes(sec.id)){
    pages=invalid||!window.S23Indices?.ready(sec.id)?0:window.S23Indices.measure(sec.id,state,{width,height});
    autoPages[sec.id]=pages;
   }else{
    const raw=state.texts?.[sec.id]||'';
    const clean=['study','afterword','biography','prologue','context'].includes(sec.id)?raw.replace(/^#{1,6}\s+/gm,'').replace(/\*/g,''):raw;
     const count=(clean.match(/\S+/g)||[]).length;
    pages=invalid||!count?0:Math.ceil((count+(state.chapterOpenings&&essayIds.includes(sec.id)?wordsPage*.2:0))/wordsPage);
    autoPages[sec.id]=pages;if(sec.id.startsWith('original-')){mainPages+=pages;mainWords+=count;}else if(['prologue','context','biography','study','afterword'].includes(sec.id)){editorialPages[sec.id]=pages;editorialWords[sec.id]=count;}
   }
  }
  if(!pages)continue;
  const essayNumber=essayIds.indexOf(sec.id)+1;
  const isChapter=state.chapterOpenings&&essayNumber>0;
  if(isChapter){
   // The left facing page must be even; right title page odd.
   if(page%2!==0)addBlank('Blanco de enlace previo al pliego');
   const name=sec.name;
   items.push({id:'opening-'+sec.id,name:'Apertura · '+name,parentId:sec.id,opening:true,openingKind:'chapter',chapterTitle:name,ordinal:essayNumber,start:page,end:page+1,pages:2});
   page+=2;openingPages+=2;openingCount++;
   if(state.openingTextRecto)addBlank('Blanco tras el pliego · texto al recto');
  }else if(sec.id==='bibliography'){
   if(page%2!==0)addBlank('Blanco de enlace · doble página de fuentes');
  }else if(sec.recto&&page%2===0)addBlank('Blanco de cortesía para recto');
  items.push({id:sec.id,name:sec.name,start:page,end:page+pages-1,pages});
  page+=pages;
  insertFigures(sec.id);
 }
 const pad=(4-(page-1)%4)%4;
 if(pad)items.push({name:'Blancos finales (hipótesis de cuadernillo)',start:page,end:page+pad-1,pages:pad,blank:true});
 const total=page-1+pad,sheets=Math.ceil(total/2),spine=sheets*state.caliper;
 return {w,h,wordsPage,mainPages,mainWords,editorialPages,editorialWords,autoPages,items,total,sheets,spine,blanks:rectoBlanks+pad,rectoBlanks,pad,openingPages,openingCount,figureCount,figurePages,invalid,width,height};
}
function store(){try{localStorage.setItem(KEY,JSON.stringify(state));$('#saveStatus').textContent='Guardado localmente'}catch{$('#saveStatus').textContent='No se pudo guardar en este navegador'}}
function setFields(){
 const map={trim:'trim',customW:'customW',customH:'customH',fontFamily:'font',fontWeight:'fontWeight',fontStyle:'fontStyle',headingFont:'headingFont',headingWeight:'headingWeight',headingStyle:'headingStyle',fontSize:'fontPt',leading:'leading',marginInner:'marginInner',marginOuter:'marginOuter',marginTop:'marginTop',marginBottom:'marginBottom',indent:'indent',paraGap:'paraGap',bleed:'bleed',paperCaliper:'caliper',words:'words',zoom:'zoom',coverColor:'coverColor',bookTitle:'title',authorName:'author',imprint:'imprint',bodySample:'sample'};
 for(const [id,k] of Object.entries(map))$('#'+id).value=state[k];
 for(const k of ['showGuides','showFolios','showRunning','chapterOpenings','openingTextRecto','indexPortraits'])$('#'+k).checked=state[k];
 $('#customDims').hidden=state.trim!=='custom';
}
function vars(p){return Object.entries({
 '--page-width':p.w+'mm','--page-height':p.h+'mm','--body-font':state.font,'--body-weight':state.fontWeight,'--body-style':state.fontStyle,'--heading-font':state.headingFont,'--heading-weight':state.headingWeight,'--heading-style':state.headingStyle,'--body-size':state.fontPt+'pt',
 '--leading':state.leading,'--margin-in':state.marginInner+'mm','--margin-out':state.marginOuter+'mm',
 '--margin-top':state.marginTop+'mm','--margin-bottom':state.marginBottom+'mm','--indent':state.indent+'mm',
 '--para-gap':state.paraGap+'mm','--bleed':state.bleed+'mm','--cover-color':state.coverColor,
 '--spine-width':Math.max(3,p.spine)+'mm','--chapter-ink':state.coverColor
 }).map(([k,v])=>k+':'+v).join(';')}
function sample(n=1){
 const parts=state.sample.trim().split(/\n\s*\n+/).filter(Boolean),src=parts.length?parts:['Texto ficticio de muestra para comparar cuerpo, interlineado y márgenes.'];
 let html='';for(let i=0;i<n;i++)for(const t of src)html+='<p>'+esc(t)+'</p>';return html;
}
function contents(kind){
 const title=esc(state.title),author=esc(state.author),imprint=esc(state.imprint);
 if(kind==='blank')return '<span class="blank-name">Página intencionalmente en blanco</span>';
 if(kind==='half')return '<div class="frontmatter"><span class="booktitle" style="font-size:19pt">'+title+'</span><span class="rule"></span><span class="edition">Edición crítica · maqueta</span></div>';
 if(kind==='title')return '<div class="frontmatter"><span class="publisher">'+imprint+'</span><span class="booktitle">'+title+'</span><span class="byline">'+author+'</span><span class="rule"></span><span class="edition">Edición histórica, anotada e ilustrada</span><div style="height:24mm"></div><span class="publisher">Editorial Siglo23</span></div>';
 if(kind==='legal')return '<div class="frontmatter"><div class="legal"><b>'+title+'</b><p>'+author+'</p><p>Esta página es una simulación de composición editorial y no un libro terminado. Traductores, prólogos, ilustraciones, ISBN, impresión y derechos deben completarse antes de publicar.</p><p>ISBN: por asignar.<br>Edición Siglo23: preproducción.</p></div></div>';
 if(kind==='toc'){
  const sections=(plan?.items||analyze().items).filter(x=>x.id&&!x.blank&&!x.opening);
  return '<span class="chapter-kicker">ÍNDICE DE LA EDICIÓN</span><h2>Contenido</h2><div class="chapter-rule"></div>'
   +sections.map(x=>'<div class="outline-line"><span>'+esc(x.name)+'</span><span>'+x.start+'</span></div>').join('')
   +'<p style="font:8pt Georgia;margin-top:8mm;color:#767a73">Paginación calculada para la maqueta actual. Revisar al cerrar la edición.</p>';
 }
 if(kind==='chapter')return '<span class="chapter-kicker">PARTE III · EL TEXTO ORIGINAL</span><h2>La gran superstición política</h2><div class="chapter-rule"></div><div class="text-body" lang="es">'+sample(5)+'</div>';
 if(kind==='body')return '<div class="text-body" lang="es">'+sample(8)+'</div>';
 if(kind==='figure')return '<div class="figure">LÁMINA HISTÓRICA<br><br>Área para grabado, caricatura o facsímil con permisos comprobados</div><p class="figcaption"><b>Fig. 01.</b> Espacio de prueba para título, fecha, institución de origen y créditos.</p>';
 if(kind==='notes')return '<span class="chapter-kicker">APARATO CRÍTICO</span><h2>Notas al texto</h2><div class="chapter-rule"></div><div class="notes"><p><b>1.</b> La terminología política victoriana exige distinguir el sentido original de su recepción posterior.</p><p><b>2.</b> Las notas deberán vincularse con párrafos y fuentes históricas comprobadas.</p><p><b>3.</b> Las variantes de traducción irán identificadas en un aparato editorial diferenciado.</p><p><b>4.</b> Estas notas son demostrativas, no forman parte del texto validado.</p></div>';
 if(kind==='chronology')return '<span class="chapter-kicker">ATLAS HISTÓRICO</span><h2>Cronología</h2><div class="chapter-rule"></div><div class="timeline"><p><b>1820</b> — Nace Herbert Spencer.</p><p><b>1851</b> — Publicación de <em>Social Statics</em>.</p><p><b>1884</b> — Los ensayos de <em>The Man Versus the State</em>.</p><p><b>1903</b> — Muere Herbert Spencer.</p><p><b>Siglo XXI</b> — Nuevas lecturas de los límites del poder estatal.</p></div><p style="font:9pt Georgia">Cronología ilustrativa para diseño; revisar las fuentes de cada hito.</p>';
 return '<span class="chapter-kicker">LECTURAS DEL SIGLO XXI</span><h2>Epílogo contemporáneo</h2><div class="chapter-rule"></div><div class="text-body" lang="es">'+sample(6)+'</div>';
}
function page(kind,side,num){
 const plain=['half','title','legal','blank'].includes(kind),guides=state.showGuides?'<div class="guides"></div><div class="bleed-guide"></div>':'';
 const running=state.showRunning&&!plain?'<span class="running">'+esc(side==='verso'?state.author:state.title)+'</span>':'';
 const folio=state.showFolios&&!plain?'<span class="folio">'+esc(num)+'</span>':'';
 return '<div class="mock-page '+side+'">'+running+'<div class="content">'+contents(kind)+'</div>'+folio+guides+'</div>';
}
function cover(p){
 const title=esc(state.title),author=esc(state.author),imprint=esc(state.imprint);
 const displayTitle=state.title.trim().toLocaleLowerCase('es')==='el individuo contra el estado'?'El individuo<br><em>contra el Estado</em>':title;
 const artwork=coverFile?' style="background-image:url('+esc(coverFile)+')"':'';
 return '<div class="cover-panel cover-back"><div><span style="font:8pt Georgia;letter-spacing:.17em">UNA COLECCIÓN PARA VOLVER A LEER</span><h3>El pensamiento en su contexto</h3><p>Edición en preparación de los ensayos políticos de Herbert Spencer. El proyecto incorpora contexto histórico, documentos, aparato crítico y una lectura contemporánea diferenciada. Texto de cubierta ficticio para composición.</p></div><div class="barcode">ZONA PARA ISBN Y CÓDIGO DE BARRAS</div></div>'
 +'<div class="cover-spine"><span class="spine-text">'+title+' · '+author+' · '+imprint+'</span></div>'
 +'<div class="cover-panel cover-front'+(coverFile?' has-image':'')+'"><div class="art-window"'+artwork+'></div><div class="cover-emblem">'+imprint+' / CLÁSICOS</div><div class="cover-titles"><span class="small-label">PENSAMIENTO POLÍTICO · 1884</span><h2>'+displayTitle+'</h2><div class="author">'+author+'</div></div><div class="cover-bottom">EDICIÓN CRÍTICA E ILUSTRADA</div></div>'+(state.showGuides?'<div class="trim-guides"></div>':'');
}
function sceneContent(p){
 switch(scene){
 case 'cover':return cover(p);
 case 'title':return page('half','verso','ii')+page('title','recto','iii');
 case 'legal':return page('legal','verso','iv')+page('blank','recto','v');
 case 'toc':return page('toc','verso',6)+page('toc','recto',7);
 case 'chapter':return page('blank','verso',56)+page('chapter','recto',57);
 case 'body':return page('body','verso',112)+page('body','recto',113);
 case 'plates':return page('figure','verso',272)+page('blank','recto',273);
 case 'notes':return page('notes','verso',294)+page('notes','recto',295);
 case 'chronology':return page('chronology','verso',328)+page('chronology','recto',329);
 default:return page('afterword','verso',350)+page('body','recto',351);
 }
}
function renderRows(){
 $('#planRows').innerHTML=state.sections.map((x,i)=>'<div class="section-row" data-index="'+i+'"><input data-col="enabled" type="checkbox" '+(x.enabled?'checked':'')+' aria-label="Incluir '+esc(x.name)+'"><span class="sect-name" title="'+esc(x.name)+'">'+esc(x.name)+(x.pages==='auto'?(x.id.startsWith('index-')?'<small>Entradas reales · medición</small>':state.texts[x.id]?.trim()?'<small>Manuscrito real · cálculo de palabras</small>':'<small>Pendiente · no suma páginas</small>'):'')+'</span><input data-col="pages" aria-label="Número de páginas" type="number" min="1" max="1000" value="'+(x.pages==='auto'?plan.autoPages[x.id]||0:x.pages)+'" '+(x.pages==='auto'||['plates','bibliography'].includes(x.id)?'disabled':'')+'><input data-col="recto" aria-label="Iniciar en página impar" title="Iniciar en recto" type="checkbox" '+(x.recto?'checked':'')+'><button data-remove="'+i+'" aria-label="Eliminar extra" class="del" '+(!x.id.startsWith('custom-')?'disabled':'')+'>×</button></div>').join('');
}
function render(){
 const p=plan=analyze(),isCover=scene==='cover';
 try{
  const counts={};
  for(const x of state.sections.filter(x=>x.id.startsWith('original-')))counts[x.id]=(state.texts[x.id]?.match(/\S+/g)||[]).length;
  localStorage.setItem('siglo23-spencer-active-plan-v1',JSON.stringify({version:'M07',items:p.items,wordCounts:counts,total:p.total,wordsPerPage:p.wordsPage,size:[p.w,p.h],updatedAt:Date.now()}));
 }catch{}
 $('#metricPages').textContent=f(p.total);$('#metricMain').textContent=f(p.mainPages);$('#metricStudy').textContent=f(p.editorialPages.study||0);$('#metricAfterword').textContent=f(p.editorialPages.afterword||0);$('#metricBio').textContent=(p.editorialPages.biography||0)?f(p.editorialPages.biography):'Pendiente';
 $('#metricBlanks').textContent=f(p.blanks);$('#metricFigures').textContent=f(p.figureCount)+' / '+f(p.figurePages);$('#metricOpenings').textContent=f(p.openingPages);$('#metricSpine').textContent=f(p.spine,2)+' mm';
 $('#metricSheets').textContent=f(p.sheets);$('#metricWords').textContent=f(p.wordsPage);
 const indexIds=[['index-onomastic','indexPagesOnomastic'],['index-analytic','indexPagesAnalytic'],['index-works','indexPagesWorks']];
 let totalIndexPages=0;
 for(const [id,target] of indexIds){
  const section=state.sections.find(x=>x.id===id);
  const available=window.S23Indices?.ready(id);
  const count=section?.enabled&&available?(p.autoPages[id]||0):0;
  $('#'+target).textContent=!available?'—':(section?.enabled?f(count):'No incluido');
  totalIndexPages+=count;
 }
 $('#indexPagesTotal').textContent=indexIds.every(([id])=>window.S23Indices?.ready(id))?f(totalIndexPages):'—';
 $('#words').value=p.mainWords;
 $('#words').readOnly=true;
 $('#metricSize').textContent=f(p.w,1)+' × '+f(p.h,1)+' mm';$('#metricBleed').textContent=f(state.bleed,1)+' mm';
 $('#viewName').textContent=scenes.find(x=>x[0]===scene)[1];
 $('#previewMode').textContent=isCover?'Cubierta · contraportada, lomo y frente':'Interior · doble página';
 $('#zoomValue').textContent=Math.round(state.zoom*100)+' %';
 const physicalW=(isCover?2*p.w+Math.max(3,p.spine):2*p.w)*96/25.4+(isCover?0:13);
 const host=$('#previewHost');host.style.width=Math.ceil(physicalW*state.zoom)+'px';
 host.style.height=Math.ceil(p.h*96/25.4*state.zoom)+'px';
 host.innerHTML='<div id="liveSpread" class="spread '+(isCover?'cover-spread':'interior-spread')+'" style="'+esc(vars(p))+';transform:scale('+state.zoom+')">'+sceneContent(p)+'</div>';
 $('#planMap').innerHTML=p.items.map(x=>'<li><span>'+esc(x.name)+'</span><span>'+x.start+(x.end!==x.start?'–'+x.end:'')+'</span></li>').join('');
 $('#productionCaveat').textContent='Original: '+f(p.mainWords)+' palabras; estudio: '+f(p.editorialWords.study||0)+' palabras; epílogo: '+f(p.editorialWords.afterword||0)+' palabras; '+f(p.wordsPage)+' palabras/página aprox.; '+f(p.openingCount)+' pliegos de apertura ('+f(p.openingPages)+' páginas), '+f(p.figureCount)+' ilustraciones ('+f(p.figurePages)+' páginas), '+f(p.rectoBlanks)+' blancos de enlace/recto y '+f(p.pad)+' blancos de cierre. La paginación es una estimación, no arte final.';
  $$('.view-switch [data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===scene)));
 $('#prevView').disabled=scene===scenes[0][0];$('#nextView').disabled=scene===scenes[scenes.length-1][0];
 renderRows();
 if(typeof window!=='undefined'&&window.dispatchEvent)window.dispatchEvent(new Event('siglo23:layout-change'));
}
function changed(){store();render()}
const binds={trim:'trim',customW:'customW',customH:'customH',fontFamily:'font',fontWeight:'fontWeight',fontStyle:'fontStyle',headingFont:'headingFont',headingWeight:'headingWeight',headingStyle:'headingStyle',fontSize:'fontPt',leading:'leading',marginInner:'marginInner',marginOuter:'marginOuter',marginTop:'marginTop',marginBottom:'marginBottom',indent:'indent',paraGap:'paraGap',bleed:'bleed',paperCaliper:'caliper',words:'words',zoom:'zoom',coverColor:'coverColor',bookTitle:'title',authorName:'author',imprint:'imprint',bodySample:'sample'};
for(const [id,k] of Object.entries(binds))$('#'+id).addEventListener(['trim','fontFamily','fontWeight','fontStyle','headingFont','headingWeight','headingStyle','coverColor'].includes(id)?'change':'input',e=>{
 state[k]=['trim','font','fontStyle','headingFont','headingStyle','coverColor','title','author','imprint','sample'].includes(k)?e.target.value:Number(e.target.value);
 state=hydrate(state);
 if(id==='trim')$('#customDims').hidden=state.trim!=='custom';
 changed();
});
for(const k of ['showGuides','showFolios','showRunning','chapterOpenings','openingTextRecto','indexPortraits'])$('#'+k).addEventListener('change',e=>{state[k]=e.target.checked;changed()});
$('#applyEditorialPreset').addEventListener('click',()=>{Object.assign(state,{font:"Georgia, 'Times New Roman', serif",fontPt:10.5,leading:1.44,paraGap:1.3,indent:4,marginInner:24,marginOuter:18,marginTop:23,marginBottom:22,headingFont:"Georgia, 'Times New Roman', serif",headingWeight:400,headingStyle:'normal',chapterOpenings:true,openingTextRecto:true});state=hydrate(state);setFields();changed();$('#saveStatus').textContent='Estilo clásico de lectura aplicado, sin modificar el manuscrito.'});
$('#planRows').addEventListener('change',e=>{
 const row=e.target.closest('[data-index]');if(!row)return;const x=state.sections[+row.dataset.index];if(!x)return;
 if(e.target.dataset.col==='pages'&&x.pages!=='auto'&&!['plates','bibliography'].includes(x.id))x.pages=clamp(e.target.value,1,1000,1);
 if(['enabled','recto'].includes(e.target.dataset.col)&&!(e.target.dataset.col==='recto'&&['plates','bibliography'].includes(x.id)))x[e.target.dataset.col]=e.target.checked;
 changed();
});
$('#planRows').addEventListener('click',e=>{const btn=e.target.closest('[data-remove]');if(!btn)return;const i=+btn.dataset.remove;if(state.sections[i]?.id.startsWith('custom-')){state.sections.splice(i,1);changed()}});
$('#addSection').addEventListener('click',()=>{
 const name=$('#newName').value.trim();if(!name){$('#newName').focus();return}
 state.sections.push({id:'custom-'+Date.now(),name:name.slice(0,110),pages:clamp($('#newPages').value,1,1000,4),recto:$('#newRecto').checked,enabled:true});
 $('#newName').value='';$('#newPages').value=4;changed();
});
$('.view-switch').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b){scene=b.dataset.view;render()}});
$('#prevView').addEventListener('click',()=>{const i=scenes.findIndex(x=>x[0]===scene);scene=scenes[Math.max(0,i-1)][0];render()});
$('#nextView').addEventListener('click',()=>{const i=scenes.findIndex(x=>x[0]===scene);scene=scenes[Math.min(scenes.length-1,i+1)][0];render()});
$('#coverArt').addEventListener('change',e=>{
 const file=e.target.files?.[0];if(coverFile){URL.revokeObjectURL(coverFile);coverFile=''}
 if(file&&file.type.startsWith('image/')&&file.size<8*1024*1024){coverFile=URL.createObjectURL(file);scene='cover';$('#coverStatus').textContent='Imagen de prueba cargada. No se incluye en JSON.'}
 else if(file){$('#coverStatus').textContent='Usá una imagen menor de 8 MB.'}
 render();
});
function download(name,txt,mime){const blob=new Blob([txt],{type:mime}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500)}
$('#exportPlan').addEventListener('click',()=>{download('siglo23-spencer-maquetacion.json',JSON.stringify({project:'Editorial Siglo23 · Spencer',schema:1,exportedAt:new Date().toISOString(),state},null,2),'application/json;charset=utf-8');$('#saveStatus').textContent='Plan JSON exportado (sin imagen local)'});
$('#importPlan').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>1000000)throw Error('Archivo demasiado grande');
  const obj=JSON.parse(await file.text()),data=obj.state||obj;
  if(!data||!Array.isArray(data.sections))throw Error('Formato incompatible');
  state=hydrate(data);setFields();changed();$('#saveStatus').textContent='Plan importado'}
 catch(err){$('#saveStatus').textContent='Error al importar: '+err.message}
 finally{e.target.value=''}
});
$('#resetPlan').addEventListener('click',()=>{if(confirm('¿Restablecer el diseño y reemplazar los cambios guardados?')){state=hydrate(seed);setFields();changed()}});
$('#printProof').addEventListener('click',()=>{
 const win=window.open('','_blank');if(!win){$('#saveStatus').textContent='Permití ventanas emergentes para imprimir';return}
 const p=plan,isCover=scene==='cover',size=(isCover?(2*p.w+Math.max(3,p.spine)):p.w).toFixed(2)+'mm '+p.h.toFixed(2)+'mm';
 const href=new URL('editor.css',location.href).href;
 const rules='<style>@page{size:'+size+';margin:0}html,body{margin:0;background:white}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}.spread{transform:none!important;filter:none!important;gap:0!important;display:'+(isCover?'flex':'block')+'!important}.mock-page{break-after:page;page-break-after:always;box-shadow:none!important}.guides,.bleed-guide,.trim-guides{display:none!important}.proof-note{display:none!important}@media screen{body{padding:18px}.proof-note{display:block;font:13px system-ui;color:#222}}</style>';
 const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Spencer | Prueba de maquetación</title><link rel="stylesheet" href="'+esc(href)+'">'+rules+'</head><body><p class="proof-note">Prueba tipográfica: no es arte final. Imprimir → Guardar como PDF.</p>'+$('#liveSpread').outerHTML+'<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},500)});<\/script></body></html>';
 win.document.open();win.document.write(html);win.document.close();
 $('#saveStatus').textContent='Prueba de impresión abierta. Puede guardarse como PDF.';
});
window.S23Layout={
 refreshFromIndices:()=>render(),
 getState:()=>state,
 getPlan:()=>plan,
 getVars:()=>vars(plan),
 getSectionText:id=>state.texts?.[id]||'',
 loadOriginalBook:(parts,metadata)=>{
   if(!Array.isArray(parts)||parts.length!==6)throw Error('Libro de 1884 incompleto: se esperan seis partes');
   const idSet=new Set(seed.sections.filter(x=>x.id.startsWith('original-')).map(x=>x.id));
   if(parts.some(x=>!idSet.has(x.id)||typeof x.text!=='string'||x.text.length<500))throw Error('Texto original incompleto');
   for(const x of parts){if(!state.texts[x.id]?.trim())state.texts[x.id]=x.text;}
   state.words=state.sections.filter(x=>x.id.startsWith('original-')).reduce((n,x)=>n+(state.texts[x.id]?.match(/\S+/g)||[]).length,0);
   state.originalEdition=metadata?.edition||'1884';
   state.originalSource=metadata?.source_transcription||'';
   store();render();
   return {words:state.words,sections:parts.length};
 },
 putSectionText:(id,text)=>{
  if(!state.sections.some(x=>x.id===id))throw Error('Sección inexistente');
  if(typeof text!=='string')throw Error('Texto inválido');
  state.texts={...state.texts,[id]:text.slice(0,4000000)};
  if(id.startsWith('original-'))state.words=state.sections.filter(x=>x.id.startsWith('original-')).reduce((n,x)=>n+(state.texts[x.id]?.match(/\S+/g)||[]).length,0);
  store();render();
 }
};
setFields();render();
 if(document.fonts?.ready)document.fonts.ready.then(()=>{render();}).catch(()=>{});
})();
