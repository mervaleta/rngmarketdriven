<?php
declare(strict_types=1);
// Public, immutable model resources only; never serves application or account files.
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
$raw=$_GET['files']??'';
if(!is_string($raw)||strlen($raw)>4096){http_response_code(400);exit;}
$names=array_values(array_unique(explode(',',$raw)));
if(count($names)<1||count($names)>24){http_response_code(400);exit;}
$root=realpath(__DIR__.'/assets');
if($root===false){http_response_code(503);exit;}
$entries=[];$paths=[];$total=0;
foreach($names as $name){
 if(!preg_match('~^(?:[a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*\.(?:json|gz|jpg|jpeg|png|webp)$~D',$name)){http_response_code(400);exit;}
 $p=realpath($root.'/'.$name);
 if($p===false||!str_starts_with($p,$root.DIRECTORY_SEPARATOR)||!is_file($p)){
  $entries[]=['name'=>$name,'size'=>0,'status'=>404];continue;
 }
 $size=filesize($p);
 if($size===false||$size>8*1024*1024||$total+$size>16*1024*1024){http_response_code(413);exit;}
 $total+=$size;$paths[]=$p;
 $entries[]=['name'=>$name,'size'=>$size,'status'=>200,'type'=>match(strtolower(pathinfo($name,PATHINFO_EXTENSION))){'json'=>'application/json','jpg','jpeg'=>'image/jpeg','png'=>'image/png','webp'=>'image/webp',default=>'application/octet-stream'}];
}
$manifest=json_encode($entries,JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
header('Content-Type: application/octet-stream');
header('Cache-Control: public, max-age=86400');
header('Content-Length: '.(4+strlen($manifest)+$total));
echo pack('N',strlen($manifest)),$manifest;
foreach($paths as $p)readfile($p);
