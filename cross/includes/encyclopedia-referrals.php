<?php
// Central editorial affiliate catalog. No tracking or third-party requests before a click.
function encReferralCatalog(): array {
 static $catalog=null;
 if($catalog===null){$raw=@file_get_contents(__DIR__.'/glossary-referrals.json');$catalog=is_string($raw)?json_decode($raw,true):[];if(!is_array($catalog))$catalog=[];}
 return $catalog;
}
function encOfferLink($url): bool {
 return is_string($url)&&filter_var($url,FILTER_VALIDATE_URL)!==false&&strtolower((string)parse_url($url,PHP_URL_SCHEME))==='https'&&parse_url($url,PHP_URL_HOST)&&parse_url($url,PHP_URL_USER)===null&&parse_url($url,PHP_URL_PASS)===null;
}
function encBuy(array $item,string $mode,string $base): string {
 $ward=in_array('wardrobe',$item['views']??[],true);$entry=encReferralCatalog()[$item['slug']]??[];
 $suggestion=$entry['suggestion']??'';$type=$entry['type']??($ward?'product':'reference');
 $offers=array_merge(is_array($item['offers']??null)?$item['offers']:[],is_array($entry['offers']??null)?$entry['offers']:[]);
 $valid=[];foreach($offers as $offer){if(!is_array($offer)||!encOfferLink($offer['url']??null))continue;$valid[]=$offer;}
 $out='<section class="enc-buy enc-referrals" aria-labelledby="enc-buy-title"><div class="enc-eyebrow">Shopping · Directorio</div><h2 id="enc-buy-title">Dónde conseguirlo</h2>';
 if($suggestion!=='')$out.='<p class="enc-buy-suggestion">'.encE($suggestion).'</p>';
 if($valid){
  $out.='<p class="enc-muted">Algunos enlaces pueden generar una comisión para Studio. Las condiciones, disponibilidad y precios los define cada proveedor.</p><div class="enc-offer-grid">';
  foreach($valid as $offer){
   $label=is_string($offer['label']??null)&&trim($offer['label'])!==''?$offer['label']:'Ver opción';
   $merchant=is_string($offer['merchant']??null)?$offer['merchant']:'';
   $kind=($offer['type']??'')==='service'?'Servicio':'Producto';
   $desc=is_string($offer['description']??null)?$offer['description']:'';
   $out.='<article class="enc-offer"><span class="enc-tag">'.encE($kind).'</span><h3>'.encE($label).'</h3>'.($merchant!==''?'<p class="enc-muted">'.encE($merchant).'</p>':'').($desc!==''?'<p>'.encE($desc).'</p>':'').'<a class="enc-btn" href="'.encE($offer['url']).'" rel="sponsored nofollow noreferrer noopener" target="_blank">'.($kind==='Servicio'?'Consultar servicio':'Ver producto').' ↗</a></article>';
  }
  $out.='</div>';
 }else{
  $out.='<p class="enc-muted">'.($type==='reference'?'Este término no requiere comprar un producto ni contratar un servicio. Si se seleccionan recursos pertinentes, aparecerán aquí.':'Todavía no hay enlaces de compra o servicios seleccionados para esta ficha.').'</p>';
 }
 $out.='<div class="enc-buy-nav"><a href="'.encE($base).'shopping/">Explorar Shopping →</a><a href="'.encE($base).'servicios/">Explorar servicios →</a>';
 if($ward||in_array($item['category']??'',['Moda','Calzado'],true))$out.='<a href="'.encE($base).'recursos/talles/index.php">Guía de talles y comercios →</a>';
 return $out.'</div></section>';
}
