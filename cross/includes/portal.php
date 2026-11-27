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
// The public demo ranking exposes only seeded bot aliases and scores, never member data.
$demoRanks=[];
try {
 $private=dirname(__DIR__).'/private';$configPath=$private.'/config.php';
 if(is_file($configPath)&&is_file($private.'/.htaccess')){
  $cfg=require $configPath;
  if(is_array($cfg)&&($cfg['storage_verified']??false)===true&&is_string($cfg['setup_key']??null)&&strlen($cfg['setup_key'])>=32){
   $dbPath=$private.'/studio-'.hash_hmac('sha256','studio-db-v1',$cfg['setup_key']).'.sqlite3';
   if(is_file($dbPath)){
    $pdo=new PDO('sqlite:'.$dbPath,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_NUM]);
    $pdo->exec('PRAGMA query_only=ON');
    $demoRanks=$pdo->query("SELECT u.display_name,b.xp FROM studio_demo_bots b JOIN studio_users u ON u.id=b.user_id WHERE u.active=1 AND u.visible=1 ORDER BY b.xp DESC LIMIT 30")->fetchAll();
   }
  }
 }
}catch(Throwable $e){$demoRanks=[];}
$html=str_replace('<!--STUDIO_RANKS-->',json_encode($demoRanks,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT),$html);

echo $html;
