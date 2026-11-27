<?php
require_once __DIR__.'/header.php';
$view = $studioView ?? 'home';
$active = ['home'=>'inicio','arcade'=>'arcade','album'=>'album','ranking'=>'ranking','shopping'=>'shopping','guias'=>'guias','recursos'=>'recursos','minijuegos'=>'minijuegos','relatos'=>'relatos'][$view] ?? 'inicio';
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');
$html=file_get_contents(__DIR__.'/portal.html');
if($html===false){http_response_code(500);exit('Plantilla no disponible.');}
$base=studioBase();
$html=str_replace('<!--STUDIO_HEADER-->',studioHeader($active,'<span class="balance">◈ <span id="headerCoins">100</span> monedas</span>'),$html);
$html=str_replace('<!--STUDIO_STYLE-->','<link rel="stylesheet" href="'.studioEsc($base).'assets/shared.css">',$html);
$html=str_replace('<!--STUDIO_INITIAL-->',json_encode($view,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT),$html);
$html=str_replace('<!--STUDIO_BASE-->',json_encode($base,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT),$html);
echo $html;
