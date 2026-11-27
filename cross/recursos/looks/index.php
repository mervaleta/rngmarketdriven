<?php
declare(strict_types=1);
define('STUDIO_SECTION_ENTRY',true);
define('STUDIO_SECTION_DEPTH',2);
require_once dirname(__DIR__,2).'/includes/header.php';
require_once dirname(__DIR__,2).'/includes/encyclopedia-catalog.php';
require_once dirname(__DIR__,2).'/includes/glossary-images.php';
require_once dirname(__DIR__,2).'/includes/encyclopedia-history.php';
function encE($v): string{return studioEsc($v);}
$base=studioBase();$raw=@file_get_contents(dirname(__DIR__,2).'/includes/looks.json');$looks=is_string($raw)?json_decode($raw,true):null;
if(!is_array($looks)){http_response_code(503);exit('Looks temporalmente no disponibles.');}
$slug=isset($_GET['f'])&&is_string($_GET['f'])?$_GET['f']:'';$selected=null;foreach($looks as $l)if($l['slug']===$slug)$selected=$l;
if($slug!==''&&!$selected)http_response_code(404);
$cats=array_values(array_unique(array_column($looks,'category')));sort($cats,SORT_STRING);
$title=$selected?$selected['name']:'Looks completos';
header('Content-Type: text/html; charset=UTF-8');header('Cache-Control: private, no-store');header('X-Robots-Tag: noindex, nofollow, noarchive');header('Referrer-Policy: no-referrer');header('X-Content-Type-Options: nosniff');
function lookUrl(string $base,string $id): string{return $base.'recursos/looks/index.php?f='.rawurlencode($id);}
function lookPreview(string $base,string $id): string {
 $r=studioEncyclopediaEntry($id);if(!$r)return '';$name=$r['name']??$r['term'];$key=studioEncyclopediaImageKey($id);$m=studioGlossaryImages()[$key][0]??null;
 $h=$m?null:encHistoricalThumb($id,$base);
 $src=$m?studioGlossaryImageUrl($m,$key,0,$base,true):($h['src']??'');
 $credit=$m?studioGlossaryImageCredit($m).' · '.studioGlossaryLicense($m[2])[0]:($h['credit']??'');
 return '<span class="look-preview-piece" title="'.encE($credit?:$name).'">'.($src!==''?'<img src="'.encE($src).'" alt="'.encE($m?$m[3]:$h['caption']).'" width="68" height="68" loading="lazy" decoding="async">':'<span class="look-preview-missing">Sin foto</span>').'<span>'.encE($name).'</span>'.($h?'<small>Histórica</small>':'').'</span>';
}
function lookPiece(string $base,string $id): string {
 $r=studioEncyclopediaEntry($id);if(!$r)return '';$key=studioEncyclopediaImageKey($id);$m=studioGlossaryImages()[$key][0]??null;
 $image=$m?'<img src="'.encE(studioGlossaryImageUrl($m,$key,0,$base,true)).'" alt="'.encE($m[3]).'" loading="lazy" decoding="async">':'';
 $credit=$m?'<small>'.encE(studioGlossaryImageCredit($m).' · '.studioGlossaryLicense($m[2])[0]).'</small>':'';
 return '<a class="look-piece" href="'.encE($base.'glosario/index.php?f='.rawurlencode($r['slug'])).'">'.$image.'<span><strong>'.encE($r['name']??$r['term']).'</strong><small>'.encE($r['category']).'</small>'.$credit.'</span></a>';
}
?><!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title><?=encE($title)?> · Studio</title><link rel="stylesheet" href="<?=encE($base)?>assets/shared.css"><link rel="stylesheet" href="<?=encE($base)?>assets/encyclopedia.css?v=20261127-8"></head><body><?=studioHeader('recursos')?><main class="enc-main">
<nav class="enc-views" aria-label="Biblioteca de estilo"><a href="<?=encE($base)?>recursos/">Recursos</a><a href="<?=encE($base)?>glosario/">Glosario</a><a href="<?=encE($base)?>ropero/">Ropero</a><a href="<?=encE($base)?>servicios/">Servicios</a><a href="<?=encE($base)?>recursos/looks/" aria-current="page">Looks completos</a></nav>
<?php if($slug!==''&&!$selected):?><h1>Look no encontrado</h1><a href="<?=encE($base)?>recursos/looks/">Volver a los looks</a>
<?php elseif($selected):?><nav class="enc-crumb"><a href="<?=encE($base)?>recursos/looks/">Looks completos</a> / <?=encE($title)?></nav><article class="enc-detail"><span class="enc-tag"><?=encE($selected['category'])?></span> <span class="enc-kind"><?=encE($selected['season'])?></span><h1><?=encE($title)?></h1><p class="enc-lead"><?=encE($selected['description'])?></p><p><strong>Paleta:</strong> <?=encE($selected['palette'])?></p><section class="enc-sub"><h2>Prendas y complementos del look</h2><div class="look-pieces"><?php foreach($selected['items'] as $id)echo lookPiece($base,$id);?></div></section><section class="enc-sub"><h2>Cómo adaptarlo</h2><p><?=encE($selected['tip'])?></p><p class="enc-muted">Combinación editorial orientativa; cada pieza enlaza a su ficha única, con referencias, talles y proveedores si están disponibles. No representa una oferta comercial ni exige usar todas las piezas.</p></section><a href="<?=encE($base)?>recursos/looks/">Ver otros looks →</a></article>
<?php else:?><div class="studio-section-hero enc-glossary-hero"><div><div class="enc-eyebrow">Recursos · Estilo</div><h1>Looks completos</h1><p>Ideas para combinar prendas, lencería, medias, calzado, accesorios y belleza. Elegí por ocasión o estética y adaptá cada conjunto a tus preferencias.</p><p><strong><?=count($looks)?></strong> conjuntos editoriales</p></div><?=studioArt('guias')?></div><div class="enc-filter"><div><label for="enc-search">Buscar un look</label><input id="enc-search" type="search" placeholder="Ej.: oficina, invierno, satén"></div><div><label for="enc-category">Ocasión o estilo</label><select id="enc-category"><option value="">Todos</option><?php foreach($cats as $c):?><option><?=encE($c)?></option><?php endforeach?></select></div><div><label for="enc-sort">Ordenar</label><select id="enc-sort"><option value="az">A–Z</option><option value="za">Z–A</option><option value="category">Por categoría</option></select></div></div><div class="enc-tools"><p id="enc-total" aria-live="polite"><?=count($looks)?> looks</p><button id="enc-clear" type="button">Limpiar filtros</button></div><div class="enc-grid" id="enc-grid"><?php foreach($looks as $l):$names=[];foreach($l['items'] as $id){$r=studioEncyclopediaEntry($id);if($r)$names[]=$r['name']??$r['term'];}?><article class="enc-card" data-name="<?=encE($l['name'])?>" data-category="<?=encE($l['category'])?>" data-search="<?=encE(implode(' ',array_merge([$l['name'],$l['category'],$l['season'],$l['palette'],$l['description']],$names)))?>"><a class="enc-card-link" href="<?=encE(lookUrl($base,$l['slug']))?>"><div class="enc-card-content"><span class="enc-tag"><?=encE($l['category'])?></span> <span class="enc-kind"><?=encE($l['season'])?></span><h2><?=encE($l['name'])?></h2><p><?=encE($l['description'])?></p><div class="look-preview-grid" aria-label="Piezas del conjunto"><?php foreach($l['items'] as $id)echo lookPreview($base,$id);?></div><span class="enc-cta">Ver <?=count($names)?> piezas →</span></div></a></article><?php endforeach?></div><p id="enc-empty" hidden>No hay looks para esos filtros.</p><?php endif?><footer class="enc-footer">Studio · Looks editoriales, no productos de una tienda.</footer></main><script defer src="<?=encE($base)?>assets/encyclopedia.js"></script></body></html>
