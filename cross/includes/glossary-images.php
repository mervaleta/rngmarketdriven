<?php
require_once __DIR__.'/encyclopedia-catalog.php';
// Editorial media catalog: only manually reviewed Commons files and free licenses.
function studioGlossaryImages(): array {
 static $data=null;
 if($data===null){$data=json_decode((string)file_get_contents(__DIR__.'/glossary-images.json'),true);if(!is_array($data))$data=[];}
 return $data;
}
function studioGlossarySource(string $file): string {
 return 'https://commons.wikimedia.org/wiki/File:'.rawurlencode(str_replace(' ','_',$file));
}
function studioGlossaryOriginal(string $file): string {
 $name=str_replace(' ','_',$file);$hash=md5($name);
 return 'https://upload.wikimedia.org/wikipedia/commons/'.$hash[0].'/'.substr($hash,0,2).'/'.rawurlencode($name);
}
function studioGlossaryLicense(string $code): array {
 if($code==='cc0')return ['CC0 1.0','https://creativecommons.org/publicdomain/zero/1.0/'];
 if($code==='pd')return ['Dominio público','https://commons.wikimedia.org/wiki/Commons:Public_domain'];
 return ['CC '.strtoupper(str_replace('/',' ',$code)),'https://creativecommons.org/licenses/'.$code.'/'];
}
function studioGlossaryGallery(string $slug,string $base): string {
 $slug=studioEncyclopediaImageKey($slug);$items=studioGlossaryImages()[$slug]??[];if(!$items)return '';
 $out='<section class="enc-media" aria-label="Referencias visuales"><h2>Referencias visuales</h2><div class="enc-media-grid'.(count($items)===1?' enc-media-single':'').'">';
 foreach($items as $i=>$item){
  [$file,$author,$code,$caption]=$item;[$license,$licenseUrl]=studioGlossaryLicense($code);
  $source=studioGlossarySource($file);
  $image=$base.'glosario/image.php?f='.rawurlencode($slug).'&i='.$i;
  $out.='<figure><a class="enc-media-image" href="'.encE($image).'" target="_blank" rel="noopener noreferrer" aria-label="'.encE('Ampliar: '.$caption).'"><img src="'.encE($image).'" alt="'.encE($caption).'" loading="lazy" decoding="async"></a><figcaption><strong>'.encE($caption).'</strong><span><a href="'.encE($source).'" rel="noopener noreferrer" target="_blank">'.encE($author).' · Wikimedia Commons</a> · <a href="'.encE($licenseUrl).'" target="_blank" rel="noopener noreferrer">'.encE($license).'</a></span></figcaption></figure>';
 }
 return $out.'</div></section>';
}
