<?php
require_once __DIR__.'/header.php';
require_once __DIR__.'/encyclopedia-catalog.php';
require_once __DIR__.'/glossary-images.php';
require_once __DIR__.'/encyclopedia-referrals.php';
function encE($v): string{return studioEsc($v);}
function encUrl(string $mode='glossary',string $slug=''): string {
 return studioBase().($slug!==''?'glosario/index.php?f='.rawurlencode($slug):(['wardrobe'=>'ropero/','services'=>'servicios/','glossary'=>'glosario/'][$mode]??'glosario/').'index.php');
}
function encName(array $r): string{return $r['name']??$r['term'];}
function encIn(array $r,string $view): bool{return in_array($view,$r['views']??[],true);}
function encCategory(array $r,string $mode): string{return $mode==='services'?($r['service_category']??$r['category']):$r['category'];}
function encViews(string $active): string {
 $out='<nav class="enc-views" aria-label="Vistas del glosario">';
 foreach(['glossary'=>'Glosario completo','wardrobe'=>'Ropero','services'=>'Servicios'] as $key=>$label)$out.='<a href="'.encE(encUrl($key)).'"'.($key===$active?' aria-current="page"':'').'>'.encE($label).'</a>';
 return $out.'</nav>';
}
function encCard(array $r,string $mode): string {
 $name=encName($r);$category=encCategory($r,$mode);$thumb='';$key=studioEncyclopediaImageKey($r['slug']);
 if(empty($r['disambiguation'])&&isset(studioGlossaryImages()[$key][0])){
  [$file,$author,$code,$caption]=studioGlossaryImages()[$key][0];[$license]=studioGlossaryLicense($code);
  $src=studioBase().'glosario/image.php?f='.rawurlencode($key).'&i=0&thumb=1';
  $thumb='<span class="enc-card-thumb"><img src="'.encE($src).'" alt="'.encE($caption).'" width="88" height="88" loading="lazy" decoding="async"><span class="enc-card-credit">'.encE($author.' · '.$license.' · miniatura').'</span></span>';
 }
 $search=implode(' ',array_merge([$name,$category,$r['category'],$r['definition'],$r['glossary_definition']??''],$r['aliases']??[],[$r['materials']??'']));
 return '<article class="enc-card" data-name="'.encE($name).'" data-category="'.encE($category).'" data-kind="'.encE($r['kind']??'Término').'" data-search="'.encE($search).'"><a class="enc-card-link" href="'.encE(encUrl('glossary',$r['slug'])).'"><div class="enc-card-content">'.$thumb.'<span class="enc-tag">'.encE($category).'</span><h2>'.encE($name).'</h2><p>'.encE($r['definition']).'</p>'.(isset($r['kind'])?'<span class="enc-kind">'.encE($r['kind']).'</span>':'').'<span class="enc-cta">'.(!empty($r['disambiguation'])?'Elegir significado →':'Ver ficha →').'</span></div></a></article>';
}
function encLinks(array $items): string {
 $out='<div class="enc-related">';foreach($items as $r)$out.='<a href="'.encE(encUrl('glossary',$r['slug'])).'">'.encE(encName($r)).' →</a>';return $out.'</div>';
}
$mode=$encyclopediaMode??'glossary';if(!in_array($mode,['glossary','wardrobe','services'],true))$mode='glossary';
$all=studioEncyclopediaCatalog();if(!$all){http_response_code(503);exit('Catálogo temporalmente no disponible.');}
$slug=isset($_GET['f'])&&is_string($_GET['f'])?$_GET['f']:'';
$item=$slug!==''?studioEncyclopediaEntry($slug):null;
// Existing detail links in all views and former synonyms resolve to one URL.
if($item&&($mode!=='glossary'||$slug!==$item['slug'])){header('Location: '.encUrl('glossary',$item['slug']),true,301);exit;}
if($slug!==''&&!$item)http_response_code(404);
$data=$mode==='glossary'?$all:array_values(array_filter($all,fn($r)=>encIn($r,$mode)));
usort($data,fn($a,$b)=>strnatcasecmp(encName($a),encName($b)));
$categories=array_values(array_unique(array_map(fn($r)=>encCategory($r,$mode),$data)));sort($categories,SORT_STRING);
$base=studioBase();$masthead=studioHeader($mode==='wardrobe'?'ropero':($mode==='services'?'servicios':'recursos'));
$titles=['glossary'=>'Glosario cross','wardrobe'=>'Ropero','services'=>'Servicios'];
$descriptions=['glossary'=>'Biblioteca común de prendas, accesorios, objetos, maquillaje, servicios y vocabulario de la comunidad.','wardrobe'=>'Explorá las prendas, el calzado y los accesorios del glosario, agrupados por familia.','services'=>'Explorá servicios y técnicas de uñas, depilación, peluquería, maquillaje, estilismo y confección. Todas las fichas pertenecen al glosario.'];
$title=$item?encName($item):$titles[$mode];$description=$item?$item['definition']:$descriptions[$mode];
header('Content-Type: text/html; charset=UTF-8');header('Cache-Control: private, no-store');header('X-Robots-Tag: noindex, nofollow, noarchive');header('Referrer-Policy: no-referrer');header('X-Content-Type-Options: nosniff');
?><!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="<?=encE($description)?>"><title><?=encE($title)?> · Studio</title><link rel="stylesheet" href="<?=encE($base)?>assets/shared.css"><link rel="stylesheet" href="<?=encE($base)?>assets/encyclopedia.css?v=20261127-5"></head><body><?=$masthead?><main class="enc-main">
<?=encViews($mode)?>
<?php if($slug!==''&&!$item):?><div class="enc-detail"><h1>Ficha no encontrada</h1><p>El término no está disponible.</p><a class="enc-btn" href="<?=encE(encUrl($mode))?>">Volver al catálogo</a></div>
<?php elseif($item):
$isDisambiguation=!empty($item['disambiguation']);$disambiguationHub=$isDisambiguation?$item:(!empty($item['disambiguation_parent'])?studioEncyclopediaEntry($item['disambiguation_parent']):null);
$alternatives=[];foreach($disambiguationHub['disambiguation']??[] as $id){if($id!==$item['slug']&&($option=studioEncyclopediaEntry($id)))$alternatives[$option['slug']]=$option;}
$gallery=$isDisambiguation?'':studioGlossaryGallery($item['slug'],$base);$isWard=encIn($item,'wardrobe');$isService=encIn($item,'services');
$children=array_values(array_filter($all,fn($r)=>($r['parent']??null)===$slug||($r['service_parent']??null)===$slug));
$parents=[];foreach(['parent','service_parent'] as $k){if(!empty($item[$k])&&($p=studioEncyclopediaEntry($item[$k])))$parents[$p['slug']]=$p;}
$explicit=[];foreach($item['related']??[] as $id)if($r=studioEncyclopediaEntry($id))$explicit[$r['slug']]=$r;
foreach($all as $r)if($r['slug']!==$slug&&in_array($slug,$r['related']??[],true))$explicit[$r['slug']]=$r;
foreach(array_merge($children,array_values($parents),array_values($alternatives)) as $r)unset($explicit[$r['slug']]);
if($disambiguationHub)unset($explicit[$disambiguationHub['slug']]);
$related=array_values(array_filter($all,fn($r)=>$r['slug']!==$slug&&$r['category']===$item['category']&&!isset($explicit[$r['slug']])&&!isset($parents[$r['slug']])&&!isset($alternatives[$r['slug']])&&(!$disambiguationHub||$r['slug']!==$disambiguationHub['slug'])&&($r['parent']??null)!==$slug&&($r['service_parent']??null)!==$slug));
?>
<nav class="enc-crumb" aria-label="Ruta de navegación"><a href="<?=encE($base)?>">Studio</a> / <a href="<?=encE(encUrl())?>">Glosario</a> / <?=encE($title)?></nav>
<div class="enc-detail"><div class="enc-detail-hero<?=!$gallery?' enc-detail-hero-plain':''?>"><div><div class="enc-eyebrow">Glosario · <?=$isDisambiguation?'Desambiguación':'Ficha única'?></div><span class="enc-tag"><?=encE($item['category'])?></span> <?php if($isWard):?><a class="enc-kind" href="<?=encE(encUrl('wardrobe'))?>">Ropero</a><?php endif?> <?php if($isService):?><a class="enc-kind" href="<?=encE(encUrl('services'))?>">Servicios</a><?php endif?><h1><?=encE($title)?></h1><p class="enc-lead"><?=encE($item['definition'])?></p><?php if(!empty($item['aliases'])):?><p class="enc-muted">También: <?=encE(implode(' · ',$item['aliases']))?></p><?php endif?></div><?=$gallery?></div>
<?php if($alternatives):?><section class="enc-ambiguity" aria-labelledby="enc-ambiguity-title"><h2 id="enc-ambiguity-title"><?=$isDisambiguation?'¿A cuál te referís?':'Otros significados y tipos'?></h2><?php if(!$isDisambiguation):?><p class="enc-muted">El mismo nombre puede referirse a otra prenda, producto o técnica. <a href="<?=encE(encUrl('glossary',$disambiguationHub['slug']))?>">Ver desambiguación →</a></p><?php endif?><div class="enc-ambiguity-grid"><?php foreach($alternatives as $option)echo encCard($option,'glossary');?></div></section><?php endif?>
<?php if($isWard):?><div class="enc-detail-grid"><?php foreach(['features'=>'Cómo reconocerla','example'=>'Ejemplo de uso','materials'=>'Materiales habituales','fit'=>'Cómo elegir el talle'] as $field=>$label):if(empty($item[$field]))continue;?><section><h2><?=encE($label)?></h2><p><?=encE($item[$field])?></p><?php if($field==='fit'):?><a href="<?=encE($base)?>recursos/talles/index.php">Comparar con mis medidas →</a><?php elseif($field==='materials'):?><p class="enc-muted">La composición real depende de la etiqueta del producto.</p><?php endif?></section><?php endforeach?></div>
<?php elseif(!$isDisambiguation):?><section class="enc-sub"><h2>Contexto de uso</h2><p><?=encE(['Identidad y expresión'=>'Respetá cómo se nombra cada persona; estos términos no determinan sus preferencias de estilo.','Jerga comunitaria'=>'El uso varía entre comunidades y situaciones; no son requisitos para pertenecer.','Privacidad'=>'Cada persona decide qué comparte. La privacidad y el consentimiento son centrales.'][$item['category']]??($isService?'Consultá el alcance, los cuidados y las condiciones con el proveedor antes de contratar.':'Consultá las fichas relacionadas para distinguir técnicas, materiales y modelos.'))?></p></section><?php endif?>
<?php if($parents):?><section class="enc-sub"><h2>Familia o servicio principal</h2><?=encLinks(array_values($parents))?></section><?php endif?>
<?php if($children):?><section class="enc-sub"><h2>Subtipos y variantes</h2><?=encLinks($children)?></section><?php endif?>
<?php if($explicit):?><section class="enc-sub"><h2>Fichas relacionadas</h2><?=encLinks(array_values($explicit))?></section><?php endif?>
<?php if(!$isDisambiguation):?><?=encBuy($item,'glossary',$base)?><?php endif?>
<?php if(!$isDisambiguation&&$related):?><section class="enc-sub"><h2>Más en <?=encE($item['category'])?></h2><?=encLinks(array_slice($related,0,14))?></section><?php endif?>
<p class="enc-muted">Ficha editorial · Biblioteca común de Studio.</p></div>
<?php else:?><div class="studio-section-hero enc-glossary-hero"><div><div class="enc-eyebrow">Studio · Biblioteca</div><h1><?=encE($title)?></h1><p><?=encE($description)?></p><p><strong><?=count($data)?></strong> fichas · <?=count($categories)?> categorías</p></div><?=studioArt($mode==='wardrobe'?'guias':'recursos')?></div>
<div class="enc-filter"><div><label for="enc-search">Buscar nombre, sinónimo o material</label><input id="enc-search" type="search" placeholder="<?=encE($mode==='services'?'Ej.: manicura, depilación, peluquería':'Ej.: pollera, nylon, ballerina')?>"></div><div><label for="enc-category">Categoría</label><select id="enc-category"><option value="">Todas las categorías</option><?php foreach($categories as $cat):?><option value="<?=encE($cat)?>"><?=encE($cat)?></option><?php endforeach?></select></div><?php if($mode==='wardrobe'):?><div><label for="enc-kind">Nivel</label><select id="enc-kind"><option value="">Todos</option><option>Familia</option><option>Subtipo</option><option>Modelo</option></select></div><?php endif?><div><label for="enc-sort">Ordenar</label><select id="enc-sort"><option value="az">A–Z</option><option value="za">Z–A</option><option value="category">Por categoría</option></select></div></div>
<div class="enc-tools"><p id="enc-total" aria-live="polite"><?=count($data)?> fichas</p><button type="button" id="enc-clear">Limpiar filtros</button></div><div class="enc-grid" id="enc-grid"><?php foreach($data as $r)echo encCard($r,$mode);?></div><p id="enc-empty" hidden>No encontramos fichas para esos filtros.</p><?php endif?>
<footer class="enc-footer"><a href="<?=encE($base)?>recursos/">Recursos</a> · <a href="<?=encE(encUrl())?>">Glosario</a> · <a href="<?=encE(encUrl('wardrobe'))?>">Ropero</a> · <a href="<?=encE(encUrl('services'))?>">Servicios</a> · <a href="<?=encE($base)?>shopping/">Shopping</a><p>Studio · Biblioteca editorial en desarrollo.</p></footer></main><script defer src="<?=encE($base)?>assets/encyclopedia.js"></script></body></html>
