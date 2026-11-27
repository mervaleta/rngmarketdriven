<?php
declare(strict_types=1);
define('STUDIO_SECTION_DEPTH',2);
require dirname(__DIR__,2).'/includes/header.php';
header('Cache-Control: private, no-store');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');
$base=studioBase();$masthead=studioHeader('minijuegos');
?><!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Style Lab · Studio</title><link rel="stylesheet" href="<?=studioEsc($base)?>assets/shared.css"><style>
*{box-sizing:border-box}body{margin:0;background:#f8f0f6;color:#492b47;font:14px/1.5 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:18px 14px 40px}a{color:#95366d}h1{font:700 34px Georgia,serif;margin:5px 0}h2{font:700 21px Georgia,serif;margin:0 0 6px}p{margin:6px 0}.muted{color:#75596f;font-size:12px}.lab{display:grid;grid-template-columns:minmax(220px, .8fr) minmax(0,1.4fr);gap:12px;align-items:start}.panel{background:#fffbfd;border:1px solid #e9cddd;border-radius:16px;padding:14px}.stage{background:radial-gradient(ellipse at 50% 40%,#fff,#f0d9ea);border-radius:12px;text-align:center;overflow:hidden}.stage svg{width:100%;height:clamp(260px,46vh,420px);display:block}.controls{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}.btn,button,select,input{font:inherit}button,select,input[type=text]{border:1px solid #cfaec7;border-radius:8px;background:white;color:#492b47;padding:8px;max-width:100%}button{cursor:pointer}button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #a13c78;outline-offset:2px}button[aria-pressed=true]{background:#f1d8e8;border-color:#a13c78;font-weight:700}.primary{background:#96386f;color:white;border-color:#96386f;font-weight:700}.mode{width:100%;margin:6px 0}.tabs{display:flex;gap:5px;flex-wrap:wrap;margin:10px 0}.choices{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:6px}.choices button{min-height:65px;text-align:left;font-size:12px}.choices svg{height:28px;width:32px;display:block}.swatches{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.swatches button{width:33px;height:33px;padding:0;border:2px solid #8b7385}.swatches button[aria-pressed=true]{outline:2px solid #96386f;outline-offset:2px}.status{min-height:2.6em}.saved{display:flex;flex-wrap:wrap;gap:6px}.saved>div{display:flex;gap:4px}.saved button{font-size:12px}.duel{display:grid;grid-template-columns:1fr 1fr;gap:8px}.duel svg{height:200px;width:100%}.duel [hidden],[hidden]{display:none!important}@media(max-width:650px){.lab{grid-template-columns:1fr}.stage svg{height:285px}.panel{padding:10px}.choices{grid-template-columns:repeat(3,minmax(0,1fr))}}
</style></head><body><?=$masthead?><main><a href="<?=studioEsc($base)?>minijuegos/">← Todos los minijuegos</a><h1>Style Lab</h1><p>Tu estilo, tus reglas. Creá conjuntos sobre un avatar adulto y combiná prendas sin etiquetas de género.</p><div class="lab"><section class="panel"><div class="stage" id="stage"></div><div class="controls"><button id="random">Sorprendeme</button><button id="clear">Reiniciar</button><button id="download">Exportar SVG</button></div><label for="name">Nombre del look</label><div class="controls"><input type="text" id="name" maxlength="45" placeholder="Mi look"><button id="save">Guardar look</button></div><p class="muted">Guardado en este navegador, no en tu cuenta. En equipos compartidos, borrá tus looks cuando termines.</p><div id="saved" class="saved"></div></section><section class="panel"><label for="mode">Modalidad</label><select id="mode" class="mode"></select><h2 id="modeTitle"></h2><p id="brief"></p><div class="controls"><button id="next">Otra consigna</button><button class="primary" id="evaluate">Evaluar look</button><button id="duel" hidden>Fijar look A</button></div><div id="comparison" hidden></div><p id="status" class="status" role="status"></p><div class="tabs" id="tabs" role="group" aria-label="Categorías"></div><h2 id="category"></h2><div class="choices" id="choices"></div><div id="colorControls"><p class="muted">Color de la pieza seleccionada</p><div class="swatches" id="swatches"></div><label for="custom">Color personalizado</label> <input id="custom" type="color" value="#b55e91"></div><p class="muted" id="collection"></p><p class="muted">Práctica libre: sin créditos ni XP oficiales. Las consignas puntúan coincidencias de estilo, nunca el cuerpo o la identidad.</p><a href="<?=studioEsc($base)?>ropero/index.php">Explorar el ropero</a> · <a href="<?=studioEsc($base)?>recursos/looks/index.php">Looks completos</a></section></div></main><script>
'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const palette=['#292331','#f8eae5','#b55e91','#c73755','#664ba7','#355b92','#538576','#d7a852','#a55d37','#9ba4b2','#8d5442','#e5b59c'];
const catalog={
 body:[['Recto','straight'],['Curvas suaves','soft'],['Hombros amplios','wide']],
 skin:[['Clara','#f4cfb2'],['Media','#cf9678'],['Oliva','#b7835d'],['Oscura','#79503c'],['Profunda','#4b3029']],
 hair:[['Corto','short'],['Bob','bob'],['Largo','long'],['Recogido','bun'],['Rapado','none']],
 top:[['Remera','tee','casual'],['Blusa','blouse','elegante'],['Corsé','corset','glam'],['Suéter','sweater','invierno'],['Camisa','shirt','formal'],['Top deportivo','sport','deportivo']],
 bottom:[['Jeans','jeans','casual'],['Falda corta','mini','urbano'],['Falda midi','midi','elegante'],['Pantalón sastrero','trousers','formal'],['Short','shorts','verano'],['Falda larga','maxi','glam']],
 dress:[['Sin vestido','none'],['Vestido recto','shift','casual'],['Vestido de gala','gown','glam'],['Vestido cruzado','wrap','elegante'],['Vestido corto','party','fiesta']],
 outer:[['Sin abrigo','none'],['Blazer','blazer','formal'],['Campera','jacket','urbano'],['Tapado','coat','invierno'],['Cárdigan','cardigan','casual']],
 socks:[['Sin medias','none'],['Pantimedias','tights','elegante'],['Medias altas','knee','urbano'],['Medias cortas','ankle','deportivo']],
 shoes:[['Zapatillas','sneakers','deportivo'],['Stilettos','heels','glam'],['Botas','boots','invierno'],['Ballerinas','flats','elegante'],['Sandalias','sandals','verano']],
 bag:[['Sin bolso','none'],['Mini bag','mini','fiesta'],['Tote','tote','casual'],['Clutch','clutch','glam'],['Cartera','purse','formal']],
 jewelry:[['Sin joyas','none'],['Aros','earrings','glam'],['Collar','necklace','elegante'],['Choker','choker','urbano']],
 makeup:[['Natural','none'],['Labial','lip','glam'],['Delineado','eye','fiesta'],['Completo','full','elegante']]
};
const labels={body:'Cuerpo',skin:'Piel',hair:'Pelo',top:'Partes de arriba',bottom:'Partes de abajo',dress:'Vestidos',outer:'Abrigos',socks:'Medias',shoes:'Calzado',bag:'Carteras',jewelry:'Joyas',makeup:'Maquillaje'};
const modes={
 free:['Probador virtual','Combiná lo que quieras. Sin consigna ni puntuación.',[]],
 daily:['Look del día','Consigna rotativa según el día del dispositivo.',['casual','elegante','urbano','formal','glam','deportivo','verano','invierno']],
 runway:['Pasarela','Armá un conjunto de pasarela para la temática.',['glam','fiesta','elegante','formal']],
 duel:['Duelo de estilos','Creá dos looks y compará su coincidencia con la misma consigna.',['urbano','glam','casual','elegante']],
 collector:['Coleccionista','Descubrí prendas al elegirlas; completá tu colección local.',[]],
 world:['Moda por el mundo','Inspiración por ocasiones y clima, no reglas culturales.',['verano','formal','invierno','urbano']],
 makeover:['Cambio de look','Probá cabello, maquillaje y un nuevo conjunto.',[]],
 redcarpet:['Alfombra roja','Prepará un look para una gala.',['glam','elegante','fiesta']],
 influencer:['Influencer Studio','Creá un look para una sesión de fotos.',['urbano','casual','fiesta']],
 atelier:['Atelier de color','Personalizá los colores de cada pieza. Usá el selector de color libre.',[]],
 avatar:['Avatar libre','Elegí cuerpo, piel, cabello y cualquier prenda.',[]],
 paper:['Muñeca de papel','Vestí la figura ilustrada en capas 2D.',[]]
};
const defaults=()=>({body:['straight','#292331'],skin:['#cf9678','#cf9678'],hair:['bob','#49313c'],top:['tee','#f8eae5'],bottom:['jeans','#355b92'],dress:['none','#b55e91'],outer:['none','#664ba7'],socks:['none','#292331'],shoes:['sneakers','#f8eae5'],bag:['none','#a55d37'],jewelry:['none','#d7a852'],makeup:['none','#c73755']});
let look=defaults(),active='top',mode='free',round=0,first=null;
function load(k,fallback){try{return JSON.parse(localStorage.getItem(k))??fallback}catch(e){return fallback}}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
let saved=load('studio-style-looks-v1',[]),seen=load('studio-style-seen-v1',[]);
if(!Array.isArray(saved))saved=[];if(!Array.isArray(seen))seen=[];
function safeLook(v){const d=defaults();for(const k of Object.keys(d)){const p=v?.[k];if(Array.isArray(p)&&catalog[k].some(i=>i[1]===p[0])&&/^#[0-9a-f]{6}$/i.test(p[1]))d[k]=[p[0],p[1]]}return d}
function svg(v){v=safeLook(v);const skin=v.skin[0],w=v.body[0]==='wide'?10:v.body[0]==='soft'?5:0, waist=v.body[0]==='soft'?7:0;const c=k=>v[k][1],is=(k,x)=>v[k][0]===x;const path=(d,fill,stroke='#49313c',sw=1.3)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linejoin="round"/>';const ellipse=(x,y,rx,ry,fill)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'"/>';const rect=(x,y,a,b,fill,r=3)=>'<rect x="'+x+'" y="'+y+'" width="'+a+'" height="'+b+'" rx="'+r+'" fill="'+fill+'"/>';let out='<svg xmlns="'+NS+'" viewBox="0 0 240 420" role="img" aria-label="Avatar con el outfit elegido">'+ellipse(120,403,69,8,'#dfc9db');
if(is('hair','long'))out+=path('M91 51 Q82 11 120 10 Q160 10 152 58 L165 155 Q120 178 75 155Z',c('hair'));
if(is('hair','bun'))out+=ellipse(120,13,18,15,c('hair'));
out+=path('M110 72 L110 91 L'+(89-w)+' 98 Q76 105 72 128 L60 207 Q58 222 66 222 Q74 223 77 211 L91 149 L'+(96+waist)+' 171 Q87 195 92 232 L99 307 L100 377 L115 377 L120 253 L125 377 L140 377 L142 307 L148 232 Q153 195 '+(144-waist)+' 171 L149 149 L163 211 Q166 223 174 222 Q182 222 180 207 L168 128 Q164 105 '+(151+w)+' 98 L130 91 L130 72Z',skin);
out+=ellipse(120,51,29,35,skin)+ellipse(91,53,4,7,skin)+ellipse(149,53,4,7,skin);
if(!is('hair','none'))out+=path(is('hair','short')?'M91 52 Q80 12 117 12 Q156 10 151 52 L141 37 L113 31 L99 45Z':is('hair','bob')?'M88 55 Q82 10 120 10 Q158 10 154 55 L157 91 L143 83 L146 39 Q117 48 102 30 L94 57 L98 83 L84 91Z':'M89 50 Q81 10 120 10 Q156 10 152 53 L143 36 Q120 39 103 29 L95 52Z',c('hair'));
out+=ellipse(109,52,2.8,2,'#34252d')+ellipse(131,52,2.8,2,'#34252d')+path('M117 60 Q120 62 123 60','none','#936e60',1)+path('M113 68 Q120 72 127 68','none',is('makeup','lip')||is('makeup','full')?c('makeup'):'#9f625d',2);
if(is('makeup','eye')||is('makeup','full'))out+=path('M104 49 L111 48 M129 48 L136 49','none',c('makeup'),2.6);
if(!is('socks','none')){const y=is('socks','tights')?202:is('socks','knee')?303:355;out+=path('M93 '+y+' L119 '+y+' L115 380 L100 380Z M121 '+y+' L147 '+y+' L140 380 L125 380Z',c('socks'),'none');}
const topShape='M'+(89-w)+' 98 L108 92 Q120 111 132 92 L'+(151+w)+' 98 L163 129 L148 136 L143 163 L97 163 L92 136 L77 129Z';
if(is('dress','none')){
const t=v.top[0];out+=path(t==='corset'||t==='sport'?'M96 108 L109 100 Q120 115 131 100 L144 108 L141 162 L99 162Z':t==='sweater'?'M'+(89-w)+' 98 L109 92 Q120 103 131 92 L'+(151+w)+' 98 L176 199 L162 204 L146 143 L144 170 L96 170 L94 143 L78 204 L64 199Z':topShape,c('top'));
if(t==='shirt'||t==='blouse')out+=path('M109 94 L120 108 L131 94 M120 108 L120 161','none','#fff5ef',1.8);
const b=v.bottom[0];if(['mini','midi','maxi'].includes(b)){const y=b==='mini'?237:b==='midi'?300:369;out+=path('M97 161 L143 161 Q148 181 161 '+y+' L79 '+y+' Q92 181 97 161Z',c('bottom'));}else{const y=b==='shorts'?237:367;out+=path('M97 161 L143 161 Q153 192 148 233 L143 '+y+' L123 '+y+' L120 243 L117 '+y+' L97 '+y+' L92 233 Q87 192 97 161Z',c('bottom'));out+=path('M97 173 L143 173 M120 174 L120 215','none','#49313c',1);}
}else{const d=v.dress[0],y=d==='gown'?389:d==='party'?236:d==='wrap'?293:265;out+=path('M'+(91-w)+' 100 L108 92 Q120 111 132 92 L'+(149+w)+' 100 L146 144 L143 169 Q150 192 '+(d==='gown'?182:160)+' '+y+' L'+(d==='gown'?58:80)+' '+y+' Q90 192 97 169 L94 144Z',c('dress'));if(d==='wrap')out+=path('M108 95 L143 165 L91 255 M97 165 L143 165','none','#fff3ed',1.5);}
if(!is('outer','none')){const y=is('outer','coat')?275:is('outer','cardigan')?220:182;out+=path('M'+(89-w)+' 98 L109 91 L106 137 L111 '+y+' L89 '+y+' L92 145 L78 207 L64 202 L77 120Z M'+(151+w)+' 98 L131 91 L134 137 L129 '+y+' L151 '+y+' L148 145 L162 207 L176 202 L163 120Z',c('outer'));if(is('outer','blazer'))out+=path('M109 94 L96 122 L107 136 M131 94 L144 122 L133 136','none','#fff6ef',1.4);}
const sh=v.shoes[0];out+=path(sh==='boots'?'M99 321 L117 321 L116 385 L91 394 L87 384 L100 374Z M123 321 L141 321 L140 374 L153 384 L149 394 L124 385Z':sh==='heels'?'M100 373 L115 373 L116 395 L111 395 L108 385 L96 394 L87 391 L88 385Z M125 373 L140 373 L152 385 L153 391 L144 394 L132 385 L129 395 L124 395Z':'M100 373 L115 373 L117 393 L88 393 Q83 387 90 383Z M125 373 L140 373 L150 383 Q157 387 152 393 L123 393Z',c('shoes'));
if(sh==='sandals')out+=path('M94 383 L114 377 M146 383 L126 377','none','#b88b73',3);
if(is('jewelry','earrings'))out+=ellipse(90,63,3,5,c('jewelry'))+ellipse(150,63,3,5,c('jewelry'));
if(is('jewelry','necklace')||is('jewelry','choker'))out+=path(is('jewelry','choker')?'M110 84 L130 84':'M107 94 Q120 118 133 94','none',c('jewelry'),3);
if(!is('bag','none')){const big=is('bag','tote');out+=path('M165 221 Q180 186 195 221','none',c('bag'),4)+rect(160,218,big?43:34,big?48:30,c('bag'),5)+rect(172,227,10,3,'#d7a852',1);}
return out+'</svg>'}
function status(s){$('status').textContent=s}
function selected(k){return catalog[k].find(i=>i[1]===look[k][0])}
function track(){for(const k of Object.keys(catalog)){if(['body','skin'].includes(k)||look[k][0]==='none')continue;const id=k+':'+look[k][0];if(!seen.includes(id))seen.push(id)}store('studio-style-seen-v1',seen)}
const total=Object.keys(catalog).filter(k=>!['body','skin'].includes(k)).reduce((n,k)=>n+catalog[k].filter(i=>i[1]!=='none').length,0);
function render(){ $('stage').innerHTML=svg(look);$('category').textContent=labels[active];$('tabs').replaceChildren();for(const k of Object.keys(labels)){const b=document.createElement('button');b.textContent=labels[k];b.setAttribute('aria-pressed',String(active===k));b.onclick=()=>{active=k;render()};$('tabs').append(b)}$('choices').replaceChildren();
for(const item of catalog[active]){const b=document.createElement('button');b.textContent=item[0];b.setAttribute('aria-pressed',String(look[active][0]===item[1]));b.onclick=()=>{look[active][0]=item[1];if(active==='skin')look.skin[1]=item[1];if(['top','bottom'].includes(active))look.dress[0]='none';track();render();status('Seleccionaste '+item[0]+'.')};$('choices').append(b)}
$('colorControls').hidden=['body','skin'].includes(active);$('swatches').replaceChildren();for(const hex of palette){const b=document.createElement('button');b.style.background=hex;b.setAttribute('aria-label','Color '+hex);b.setAttribute('aria-pressed',String(look[active][1]===hex));b.onclick=()=>{look[active][1]=hex;render()};$('swatches').append(b)}$('custom').value=look[active][1];$('collection').textContent='Colección local: '+seen.filter(id=>Object.keys(catalog).some(k=>catalog[k].some(i=>i[1]!=='none'&&k+':'+i[1]===id))).length+' / '+total+' piezas descubiertas.'}
function theme(){const list=modes[mode][2];if(!list.length)return '';const day=Math.floor(Date.now()/86400000);return list[((mode==='daily'?day:0)+round)%list.length]}
function showMode(){const m=modes[mode];$('modeTitle').textContent=m[0];$('brief').textContent=m[1]+(theme()?' Tema: '+theme()+'.':'');$('next').hidden=!m[2].length||mode==='daily';$('evaluate').hidden=!m[2].length;$('duel').hidden=mode!=='duel';$('duel').textContent=first?'Comparar con A':'Fijar look A';$('comparison').hidden=true;status('')}
function score(v){let k=['outer','socks','shoes','bag','jewelry',...(v.dress[0]==='none'?['top','bottom']:['dress'])].filter(k=>v[k][0]!=='none');let hits=k.filter(k=>catalog[k].find(i=>i[1]===v[k][0])?.[2]===theme());return {hits:hits.length,all:k.length}}
function result(v){const s=score(v);return s.hits+' de '+s.all+' piezas coinciden con la consigna '+theme()+'.'}
function savedList(){const el=$('saved');el.replaceChildren();saved.forEach((r,i)=>{if(!r||typeof r.name!=='string')return;const row=document.createElement('div'),b=document.createElement('button'),del=document.createElement('button');b.textContent=r.name;b.onclick=()=>{look=safeLook(r.look);$('name').value=r.name;render();status('Look recuperado.')};del.textContent='×';del.setAttribute('aria-label','Borrar '+r.name);del.onclick=()=>{const next=saved.filter((_,n)=>n!==i);if(store('studio-style-looks-v1',next)){saved=next;savedList();status('Look borrado.')}else status('No se pudo borrar el almacenamiento local.')};row.append(b,del);el.append(row)})}
for(const [id,m] of Object.entries(modes)){const op=document.createElement('option');op.value=id;op.textContent=m[0];$('mode').append(op)}
const requested=new URLSearchParams(location.search).get('mode');if(Object.hasOwn(modes,requested)){mode=requested;$('mode').value=mode}
$('mode').onchange=()=>{mode=$('mode').value;round=0;first=null;showMode()};
$('next').onclick=()=>{round++;first=null;showMode()};
$('evaluate').onclick=()=>status(result(look));
$('duel').onclick=()=>{if(!first){first=safeLook(look);$('duel').textContent='Comparar con A';status('Look A fijado. Creá el look B.');return}const a=score(first),b=score(look),el=$('comparison');el.hidden=false;el.className='duel';el.innerHTML='<div><strong>Look A</strong>'+svg(first)+'</div><div><strong>Look B</strong>'+svg(look)+'</div>';status('A: '+a.hits+' / '+a.all+' · B: '+b.hits+' / '+b.all+' · '+(a.hits===b.hits?'Empate':a.hits>b.hits?'Gana A':'Gana B')+' por coincidencias de consigna.');first=null;$('duel').textContent='Fijar look A'};
$('custom').oninput=()=>{look[active][1]=$('custom').value;$('stage').innerHTML=svg(look)};
$('custom').onchange=render;
$('random').onclick=()=>{for(const k of Object.keys(catalog)){if(['body','skin'].includes(k))continue;const list=catalog[k];look[k]=[list[Math.floor(Math.random()*list.length)][1],palette[Math.floor(Math.random()*palette.length)]]}track();render();status('Nuevo look aleatorio.')};
$('clear').onclick=()=>{look=defaults();render();status('Avatar reiniciado.')};
$('save').onclick=()=>{if(saved.length>=20){status('Llegaste al límite de 20 looks. Borrá uno para seguir.');return}const entry={name:$('name').value.trim().slice(0,45)||'Look '+(saved.length+1),look:safeLook(look)};const next=[...saved,entry];if(store('studio-style-looks-v1',next)){saved=next;savedList();status('Look guardado en este navegador.')}else status('No se pudo guardar: el almacenamiento local no está disponible.')};
$('download').onclick=()=>{const u=URL.createObjectURL(new Blob([svg(look)],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=u;a.download='studio-look.svg';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
track();render();showMode();savedList();
</script></body></html>