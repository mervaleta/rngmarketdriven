<?php
require_once __DIR__.'/encyclopedia-catalog.php';
// Editorial media catalog: manually reviewed images with documented free licenses.
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
function studioGlossaryVersionedPath(array $item): ?string {
 $path=$item[4]['local']??null;
 return is_string($path)&&preg_match('~^assets/glossary/(?:clothing-dataset/[a-f0-9-]{36}|commons/[a-f0-9]{32})\\.jpg$~D',$path)?$path:null;
}
function studioGlossaryLocal(array $item): ?string {
 $path=studioGlossaryVersionedPath($item);
 if($path===null){$candidate='assets/glossary/commons/'.md5(str_replace(' ','_',$item[0])).'.jpg';if(is_file(dirname(__DIR__).'/'.$candidate))$path=$candidate;}
 return is_string($path)&&preg_match('~^assets/glossary/(?:clothing-dataset/[a-f0-9-]{36}|commons/[a-f0-9]{32})\.jpg$~D',$path)&&is_file(dirname(__DIR__).'/'.$path)?$path:null;
}
function studioGlossaryImageUrl(array $item,string $slug,int $i,string $base,bool $thumb=false): string {
 $local=studioGlossaryLocal($item);
 if($local!==null)return $base.$local;
 return $base.'glosario/image.php?f='.rawurlencode($slug).'&i='.$i.($thumb?'&thumb=1':'');
}
function studioGlossaryImageSource(array $item): string {
 $url=$item[4]['source']??null;
 if(studioGlossaryLocal($item)!==null&&is_string($url)&&strpos($url,'https://github.com/alexeygrigorev/clothing-dataset/blob/')===0)return $url;
 return studioGlossarySource($item[0]);
}
function studioGlossaryImageCredit(array $item): string {
 $local=studioGlossaryLocal($item);return $local!==null&&strpos($local,'assets/glossary/clothing-dataset/')===0?$item[1]:$item[1].' · Wikimedia Commons';
}
function studioGlossaryGallery(string $slug,string $base): string {
 $slug=studioEncyclopediaImageKey($slug);$items=studioGlossaryImages()[$slug]??[];if(!$items)return '';
 $out='<section class="enc-media" aria-label="Referencias visuales"><h2>Referencias visuales</h2><div class="enc-media-grid'.(count($items)===1?' enc-media-single':'').'">';
 foreach($items as $i=>$item){
  [$file,$author,$code,$caption]=$item;[$license,$licenseUrl]=studioGlossaryLicense($code);
  $source=studioGlossaryImageSource($item);
  $image=studioGlossaryImageUrl($item,$slug,$i,$base);
  $out.='<figure><a class="enc-media-image" href="'.encE($image).'" target="_blank" rel="noopener noreferrer" aria-label="'.encE('Ampliar: '.$caption).'"><img src="'.encE($image).'" alt="'.encE($caption).'" loading="lazy" decoding="async"></a><figcaption><strong>'.encE($caption).'</strong><span><a href="'.encE($source).'" rel="noopener noreferrer" target="_blank">'.encE(studioGlossaryImageCredit($item)).'</a> · <a href="'.encE($licenseUrl).'" target="_blank" rel="noopener noreferrer">'.encE($license).'</a></span></figcaption></figure>';
 }
 return $out.'</div></section>';
}
