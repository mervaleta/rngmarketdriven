<?php
// Historical evidence is separate from product photographs and affiliate offers.
function encHistory(string $slug): array {
 static $all=null;if($all===null){$raw=@file_get_contents(__DIR__.'/glossary-history.json');$all=is_string($raw)?json_decode($raw,true):[];if(!is_array($all))$all=[];}
 return $all[$slug]??[];
}
function encHistoryAsset(array $m): ?string {
 $p=$m['path']??null;
 if(!is_string($p)||!preg_match('~^assets/glossary/history/(?:met-[0-9]+\\.jpg|us[0-9]+a-[0-9]+\\.png)$~D',$p)||!is_file(dirname(__DIR__).'/'.$p))return null;
 return $p;
}
function encHistoryRender(string $slug,string $base): string {
 $events=encHistory($slug);if(!$events)return '';
 $out='<section class="enc-sub enc-history"><h2>Historia y documentación</h2><p class="enc-muted">Las fechas documentan piezas conservadas o patentes específicas, no necesariamente la invención ni la primera fabricación de la prenda.</p>';
 foreach($events as $e){
  $out.='<article class="enc-history-event"><div><span class="enc-tag">'.encE($e['kind']).'</span><h3>'.encE($e['date'].' · '.$e['title']).'</h3>';
  if(!empty($e['person']))$out.='<p class="enc-muted">'.encE($e['person']).'</p>';
  $out.='<p>'.encE($e['description']).'</p><p><a href="'.encE($e['source']).'" target="_blank" rel="noopener noreferrer">Consultar documento original'.(!empty($e['number'])?' · '.encE($e['number']):'').' ↗</a></p><p class="enc-muted">'.encE($e['credit']).(!empty($e['license'])?' · '.encE($e['license']):'').'</p></div>';
  $imgs='';foreach($e['images']??[] as $m){$p=encHistoryAsset($m);if($p===null)continue;$url=$base.$p;$imgs.='<figure><a class="enc-media-image" href="'.encE($url).'" target="_blank" rel="noopener noreferrer"><img src="'.encE($url).'" alt="'.encE($m['caption']).'" loading="lazy" decoding="async"></a><figcaption>'.encE($m['caption']).'</figcaption></figure>';}
  if($imgs!=='')$out.='<div class="enc-media-grid enc-history-gallery">'.$imgs.'</div>';
  $out.='</article>';
 }
 return $out.'</section>';
}
