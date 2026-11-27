<?php
// Shared editorial directory and detail view. No user measurements or UGC in this catalog.
require_once __DIR__.'/header.php';
require_once __DIR__.'/glossary-images.php';
require_once __DIR__.'/encyclopedia-referrals.php';
function encE($v): string{return studioEsc($v);}
function encData(string $name): array {
 $p=__DIR__.'/'.($name==='wardrobe'?'wardrobe.json':'glossary.json');$data=json_decode((string)file_get_contents($p),true);
 if(!is_array($data)){http_response_code(503);exit('Catálogo temporalmente no disponible.');}return $data;
}
function encUrl(string $mode,string $slug=''): string{return studioBase().($mode==='wardrobe'?'ropero/':'glosario/').'index.php'.($slug!==''?'?f='.rawurlencode($slug):'');}
function encName(array $r): string{return $r['name']??$r['term'];}
function encSketch(array $r): string {
 $g=$r['group']??'';$id=$r['slug']??'';
 $shapes=[
 'faldas'=>'<path d="M64 21h52l-5 15 31 68H38l31-68Z" fill="#e7b6cf"/><path d="M69 36h42M73 39l-15 64m24-64-6 64m22-64 7 64m6-64 13 64" fill="none"/>',
 'vestidos'=>'<path d="M67 16l13-4 10 16 10-16 13 4 7 21-14 8-5-8-2 23 33 48H48l33-48-2-23-5 8-14-8Z" fill="#d5b8e5"/><path d="M81 60h18m-12 2-14 44m21-44 13 44" fill="none"/>',
 'tops'=>'<path d="M68 20l12-7q10 13 20 0l12 7 27 15-15 30-18-9v51H74V56l-18 9-15-30Z" fill="#f2c1d4"/><path d="M80 13q10 23 20 0M90 38v69" fill="none"/>',
 'pantalones'=>'<path d="M58 15h64l7 95H99l-9-64-9 64H51Z" fill="#cfb6e5"/><path d="M57 30h66M90 30v16m-18-15-11 19m47-19 11 19" fill="none"/>',
 'abrigos'=>'<path d="M68 15l22 9 22-9 24 20-13 70h-18l-3-58v65H78V47l-3 58H57L44 35Z" fill="#d9c1e8"/><path d="M68 15l12 34 10-25 10 25 12-34M90 49v63m-13-37h-13m39 0h13" fill="none"/>',
 'interior'=>'<path d="M50 39q18-17 40 4 22-21 40-4l-5 21q-17 12-35 0-18 12-35 0Z" fill="#edb9d0"/><path d="M58 38 65 18m57 20-7-20M49 78h82l-15 17-15 15H79L64 95Z" fill="#f4d4e0"/>',
 'medias'=>'<path d="M61 13h58l-6 98h-16l-7-66-7 66H67Z" fill="#dcc4e7"/><path d="M62 24h56m-53 15 49 18M66 58l48-19M67 78l44 20M67 99l45-21" fill="none" opacity=".45"/>',
 'calzado'=>'<path d="M42 72q15-4 29-26l15 8q18 19 44 24l15 5q10 7 0 15H72l-12-5-5 17H44l2-30Z" fill="#dfb2cf"/><path d="M58 91h88" fill="none"/>',
 'accesorios'=>'<path d="M47 48h86l10 58H37Z" fill="#f0c8d7"/><path d="M68 48V34q0-21 22-21t22 21v14" fill="none" stroke-width="5"/><rect x="78" y="67" width="24" height="16" rx="5" fill="#f8e8bf"/>'
 ];
 if(in_array($id,['stiletto','kitten-heel','zapato-de-salon','slingback','peep-toe'],true))$shapes['calzado']='<path d="M38 72q14-3 35-31l18 9q17 23 45 29l9 4q8 7 0 12H81l-21-14-9 28H45l2-30Z" fill="#d68bb3"/><path d="M48 79l-1 29" stroke-width="3" fill="none"/>';
 if(in_array($id,['bota','botin','bota-alta','bota-texana'],true))$shapes['calzado']='<path d="M65 12h55l-7 55q5 16 30 20l7 8q5 9-5 10H63l-1-8h-8V72Z" fill="#bfa2d9"/><path d="M65 25h53m-6-12-6 53M67 97h82" fill="none"/>';
 if(strpos($id,'sandalia')===0)$shapes['calzado']='<path d="M30 88q22 3 49-16l17-15q24 29 54 30v13H30Z" fill="#f3cfb9"/><path d="M68 81 52 49m11 32 25-27m25 19 15-17m-4 21-18-12" fill="none" stroke-width="6"/>';
 if(in_array($id,['tanga','bombacha','culotte-interior','bombacha-tiro-alto'],true))$shapes['interior']='<path d="M33 33h114l-17 30-29 36H79L50 63Z" fill="#e5afd0"/><path d="M35 44h110" fill="none"/>';
 if(in_array($id,['corpiño','corpino','bralette','corpino-push-up','corpino-sin-breteles','bustier'],true))$shapes['interior']='<path d="M31 48q31-32 59 0 28-32 59 0l-7 33q-25 15-52-4-27 19-52 4Z" fill="#e5afd0"/><path d="M39 42 53 17m88 25-14-25M34 73h112" fill="none"/>';
 $drawing=$shapes[$g]??'<path d="M51 24h78v84H51Z" fill="#e8c9e2"/><path d="M61 40h57m-57 12h45m-45 12h57m-57 12h37" fill="none"/><text x="90" y="99" fill="#8d4d79" stroke="none" font-size="19" text-anchor="middle" font-family="Georgia">Aa</text>';
 return '<svg class="enc-sketch" viewBox="0 0 180 125" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="0" y="0" width="180" height="125" rx="15" fill="#f8e8f1"/><circle cx="145" cy="27" r="19" fill="#fff" opacity=".65"/><circle cx="27" cy="100" r="18" fill="#eadcf5"/><g stroke="#8d4d79" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">'.$drawing.'</g></svg>';
}
$mode=$encyclopediaMode??'glossary';$wardrobe=$mode==='wardrobe';$data=encData($mode);$other=encData($wardrobe?'glossary':'wardrobe');
$map=[];foreach($data as $r)$map[$r['slug']]=$r;$otherMap=[];foreach($other as $r)$otherMap[$r['slug']]=$r;
$slug=isset($_GET['f'])&&is_string($_GET['f'])?$_GET['f']:'';$item=$slug!==''?($map[$slug]??null):null;
if($slug!==''&&!$item)http_response_code(404);
$base=studioBase();$masthead=studioHeader($wardrobe?'ropero':'recursos');
$title=$item?encName($item):($wardrobe?'Ropero enciclopédico':'Glosario cross');
$description=$item?$item['definition']:($wardrobe?'Un guardarropa ilustrado de prendas, calzado y accesorios: familias, subtipos, materiales y consejos de talle.':'Diccionario de términos y expresiones de la comunidad, moda y maquillaje.');
header('Content-Type: text/html; charset=UTF-8');header('Cache-Control: private, no-store');header('X-Robots-Tag: noindex, nofollow, noarchive');header('Referrer-Policy: no-referrer');header('X-Content-Type-Options: nosniff');
usort($data,fn($a,$b)=>strnatcasecmp($a['slug'],$b['slug']));$categories=array_values(array_unique(array_column($data,'category')));sort($categories,SORT_STRING);
function encCard(array $r,string $mode): string {
 $name=encName($r);$isWard=$mode==='wardrobe';$thumb='';
 if(!$isWard&&isset(studioGlossaryImages()[$r['slug']][0])){
  [$file,$author,$code,$caption]=studioGlossaryImages()[$r['slug']][0];[$license]=studioGlossaryLicense($code);
  $src=studioBase().'glosario/image.php?f='.rawurlencode($r['slug']).'&i=0&thumb=1';
  $thumb='<span class="enc-card-thumb"><img src="'.encE($src).'" alt="'.encE($caption).'" width="88" height="88" loading="lazy" decoding="async"><span class="enc-card-credit">'.encE($author.' · '.$license.' · miniatura').'</span></span>';
 }
 $search=implode(' ',array_merge([$name,$r['category'],$r['definition']],$r['aliases']??[],[$r['materials']??'']));
 return '<article class="enc-card" data-name="'.encE($name).'" data-category="'.encE($r['category']).'" data-kind="'.encE($r['kind']??'Término').'" data-search="'.encE($search).'"><a class="enc-card-link" href="'.encE(encUrl($mode,$r['slug'])).'">'.($isWard?encSketch($r):'').'<div class="enc-card-content">'.$thumb.'<span class="enc-tag">'.encE($r['category']).'</span><h2>'.encE($name).'</h2><p>'.encE($r['definition']).'</p>'.($isWard?'<span class="enc-kind">'.encE($r['kind']).'</span>':'').'<span class="enc-cta">Ver ficha →</span></div></a></article>';
}
function encLinks(array $items,string $mode): string{$out='<div class="enc-related">';foreach($items as $r)$out.='<a href="'.encE(encUrl($mode,$r['slug'])).'">'.encE(encName($r)).' →</a>';return $out.'</div>';}
?><!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="<?=encE($description)?>"><title><?=encE($title)?> · Studio</title><link rel="stylesheet" href="<?=encE($base)?>assets/shared.css"><link rel="stylesheet" href="<?=encE($base)?>assets/encyclopedia.css?v=20261127-3"></head><body><?=$masthead?><main class="enc-main">
<?php if($slug!==''&&!$item):?><div class="enc-detail"><h1>Ficha no encontrada</h1><p>El término no está disponible.</p><a class="enc-btn" href="<?=encE(encUrl($mode))?>">Volver al catálogo</a></div>
<?php elseif($item):?>
<nav class="enc-crumb" aria-label="Ruta de navegación"><a href="<?=encE($base)?>">Studio</a> / <a href="<?=encE(encUrl($mode))?>"><?=$wardrobe?'Ropero':'Glosario'?></a> / <?=encE($title)?></nav>
<?php $gallery=$wardrobe?'':studioGlossaryGallery($slug,$base);?><div class="enc-detail"><div class="enc-detail-hero<?=(!$wardrobe&&!$gallery)?' enc-detail-hero-plain':''?>"><div><div class="enc-eyebrow"><?=$wardrobe?'Ropero · Enciclopedia':'Glosario · Diccionario'?></div><span class="enc-tag"><?=encE($item['category'])?></span><h1><?=encE($title)?></h1><p class="enc-lead"><?=encE($item['definition'])?></p><?php if(!empty($item['aliases'])):?><p class="enc-muted">También: <?=encE(implode(' · ',$item['aliases']))?></p><?php endif?></div><?= $wardrobe?encSketch($item):$gallery?></div>
<?php if($wardrobe):?><div class="enc-detail-grid"><section><h2>Cómo reconocerla</h2><p><?=encE($item['features'])?></p></section><section><h2>Ejemplo de uso</h2><p><?=encE($item['example'])?></p></section><section><h2>Materiales habituales de la familia</h2><p><?=encE($item['materials'])?></p><p class="enc-muted">La composición real depende de la etiqueta del producto.</p></section><section><h2>Cómo elegir el talle</h2><p><?=encE($item['fit'])?></p><a href="<?=encE($base)?>recursos/talles/index.php">Comparar con mis medidas →</a></section></div>
<?php
$children=array_values(array_filter($data,fn($r)=>($r['parent']??null)===$slug));
$related=array_values(array_filter($data,fn($r)=>$r['category']===$item['category']&&$r['slug']!==$slug&&($r['parent']??null)!==$slug));
$terms=array_values(array_filter($other,fn($r)=>in_array($slug,$r['wardrobe']??[],true)));
if(!empty($item['parent'])&&isset($map[$item['parent']])):?><section class="enc-sub"><h2>Familia de prenda</h2><?=encLinks([$map[$item['parent']]],'wardrobe')?></section><?php endif?>
<?php if($children):?><section class="enc-sub"><h2>Subtipos y variantes</h2><?=encLinks($children,'wardrobe')?></section><?php endif?>
<?php if($terms):?><section class="enc-sub"><h2>En el glosario</h2><?=encLinks($terms,'glossary')?></section><?php endif?>
<?=encBuy($item,'wardrobe',$base)?>
<?php if($related):?><section class="enc-sub"><h2>Más en <?=encE($item['category'])?></h2><?=encLinks(array_slice($related,0,14),'wardrobe')?></section><?php endif?>
<?php else:
$linked=[];foreach($item['wardrobe']??[] as $id)if(isset($otherMap[$id]))$linked[]=$otherMap[$id];
$related=array_values(array_filter($data,fn($r)=>$r['category']===$item['category']&&$r['slug']!==$slug));
?><section class="enc-sub"><h2>Contexto de uso</h2><p><?=encE(['Identidad y expresión'=>'Las palabras de identidad y expresión tienen significados personales; respetá cómo se nombra cada persona.','Jerga comunitaria'=>'El uso de estas expresiones varía entre comunidades y situaciones. No son requisitos para pertenecer ni etiquetas que deban imponerse.','Privacidad'=>'La privacidad y el consentimiento son centrales: cada persona decide qué comparte.'][$item['category']]??'Este término pertenece al vocabulario de estilo y presentación personal. Consultá las fichas relacionadas para distinguir técnicas, materiales y modelos.')?></p></section><?php if($linked):?><section class="enc-sub"><h2>Prendas y accesorios relacionados</h2><?=encLinks($linked,'wardrobe')?></section><?php endif?><?=encBuy($item,'glossary',$base)?><section class="enc-sub"><h2>Términos relacionados</h2><?=encLinks(array_slice($related,0,12),'glossary')?></section><?php endif?>
<p class="enc-muted">Ficha editorial inicial · ampliable. <?=$wardrobe?'Dibujo esquemático de la familia de prendas, no fotografía de un producto.':''?></p></div>
<?php else:?><div class="studio-section-hero<?=$wardrobe?'':' enc-glossary-hero'?>"><div><div class="enc-eyebrow">Studio · <?=$wardrobe?'Biblioteca de moda':'Recursos'?></div><h1><?=encE($title)?></h1><p><?=encE($description)?></p><p><strong><?=count($data)?></strong> fichas · <?=count($categories)?> categorías</p><a href="<?=encE(encUrl($wardrobe?'glossary':'wardrobe'))?>"><?=$wardrobe?'Ver glosario cross →':'Explorar el ropero →'?></a></div><?=studioArt($wardrobe?'guias':'recursos')?></div>
<div class="enc-filter"><div><label for="enc-search">Buscar nombre, sinónimo o material</label><input id="enc-search" type="search" placeholder="<?=$wardrobe?'Ej.: pollera, nylon, stiletto':'Ej.: en femme, passing, corsé'?>"></div><div><label for="enc-category">Tipo de <?=$wardrobe?'prenda':'término'?></label><select id="enc-category"><option value="">Todas las categorías</option><?php foreach($categories as $cat):?><option value="<?=encE($cat)?>"><?=encE($cat)?></option><?php endforeach?></select></div><?php if($wardrobe):?><div><label for="enc-kind">Nivel</label><select id="enc-kind"><option value="">Todos</option><option>Familia</option><option>Subtipo</option><option>Modelo</option></select></div><?php endif?><div><label for="enc-sort">Ordenar</label><select id="enc-sort"><option value="az">A–Z</option><option value="za">Z–A</option><option value="category">Por categoría</option></select></div></div>
<div class="enc-tools"><p id="enc-total" aria-live="polite"><?=count($data)?> fichas</p><button type="button" id="enc-clear">Limpiar filtros</button></div><div class="enc-grid" id="enc-grid"><?php foreach($data as $row)echo encCard($row,$mode);?></div><p id="enc-empty" hidden>No encontramos fichas para esos filtros.</p><?php endif?>
<footer class="enc-footer"><a href="<?=encE($base)?>recursos/">Recursos</a> · <a href="<?=encE(encUrl('glossary'))?>">Glosario</a> · <a href="<?=encE(encUrl('wardrobe'))?>">Ropero</a> · <a href="<?=encE($base)?>shopping/">Shopping</a><p>Studio · Biblioteca editorial en desarrollo. Las fichas siguen sin indexar durante la beta.</p></footer></main><script defer src="<?=encE($base)?>assets/encyclopedia.js"></script></body></html>
