<?php
declare(strict_types=1);
// Serve only approved editorial assets from the same origin, never arbitrary URLs.
require dirname(__DIR__).'/includes/glossary-images.php';
header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');header('X-Robots-Tag: noindex, nofollow');
$slug=$_GET['f']??'';$idx=$_GET['i']??'0';
if(!is_string($slug)||!is_string($idx)||!preg_match('/^[0-9]{1,2}$/D',$idx)){http_response_code(404);exit;}
$item=studioGlossaryImages()[$slug][(int)$idx]??null;
if(!$item){http_response_code(404);exit;}
$thumb=($_GET['thumb']??'')==='1';
$url=studioGlossaryOriginal($item[0]);
$dir=sys_get_temp_dir().'/studio-glossary-'.substr(hash('sha256',__DIR__),0,16);
if(!is_dir($dir)&&!@mkdir($dir,0700,true)&&!is_dir($dir)){http_response_code(503);exit;}
$path=$dir.'/'.hash('sha256',$url).'.jpg';
function studioSendGlossaryImage(string $path,bool $thumb=false): void {
 if($thumb){
  $small=$path.'.thumb240.jpg';
  if(!is_file($small)&&function_exists('imagecreatefromjpeg')&&function_exists('imagecreatetruecolor')){
   $size=@getimagesize($path);
   if($size&&$size[0]>0&&$size[1]>0&&$size[0]*$size[1]<=6000000&&max($size[0],$size[1])>240){
    $source=@imagecreatefromjpeg($path);
    if($source){$scale=240/max($size[0],$size[1]);$w=max(1,(int)round($size[0]*$scale));$h=max(1,(int)round($size[1]*$scale));$dest=imagecreatetruecolor($w,$h);
     if($dest){imagecopyresampled($dest,$source,0,0,0,0,$w,$h,$size[0],$size[1]);$tmp=@tempnam(dirname($path),'thumb-');if($tmp!==false){if(imagejpeg($dest,$tmp,84))@rename($tmp,$small);if(is_file($tmp))@unlink($tmp);}imagedestroy($dest);}imagedestroy($source);
    }
   }
  }
  if(is_file($small))$path=$small;
 }
 header('Content-Type: image/jpeg');header('Cache-Control: public, max-age=604800');header('Content-Length: '.filesize($path));readfile($path);exit;
}
if(is_file($path))studioSendGlossaryImage($path,$thumb);
$lock=@fopen($path.'.lock','c');
if(!$lock||!flock($lock,LOCK_EX)){http_response_code(503);exit;}
if(is_file($path))studioSendGlossaryImage($path,$thumb);
$failed=$path.'.fail';
if(is_file($failed)&&filemtime($failed)>time()-600){header('Retry-After: 600');http_response_code(503);exit;}
if(!function_exists('curl_init')){http_response_code(503);exit;}
$body='';$limit=8*1024*1024;
$ch=curl_init($url);
curl_setopt_array($ch,[CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>4,CURLOPT_TIMEOUT=>15,CURLOPT_USERAGENT=>'StudioGlossary/1.0 (https://rngmarketdriven.com/cross/glosario/)',CURLOPT_WRITEFUNCTION=>function($handle,string $chunk)use(&$body,$limit){if(strlen($body)+strlen($chunk)>$limit)return 0;$body.=$chunk;return strlen($chunk);}]);
$ok=curl_exec($ch);$status=curl_getinfo($ch,CURLINFO_HTTP_CODE);curl_close($ch);
$info=$ok&&$status===200?@getimagesizefromstring($body):false;
if(!$info||$info[2]!==IMAGETYPE_JPEG){@touch($failed);header('Retry-After: 600');http_response_code(503);exit;}
if(!file_put_contents($path.'.tmp',$body,LOCK_EX)||!rename($path.'.tmp',$path)){@unlink($path.'.tmp');http_response_code(503);exit;}
@unlink($failed);studioSendGlossaryImage($path,$thumb);
