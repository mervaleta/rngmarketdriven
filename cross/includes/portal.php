<?php
require_once __DIR__.'/header.php';
$view = $studioView ?? 'home';
$active = ['home'=>'inicio','arcade'=>'arcade','album'=>'album','ranking'=>'ranking','shopping'=>'shopping','guias'=>'guias','recursos'=>'recursos','minijuegos'=>'minijuegos','relatos'=>'relatos'][$view] ?? 'inicio';
header('Cache-Control: private, no-store');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');
$html=file_get_contents(__DIR__.'/portal.html');
if($html===false){http_response_code(500);exit('Plantilla no disponible.');}
$base=studioBase();$member=studioCurrentMember();$memberMode=$member!==null&&!empty($_SESSION['csrf']);
$gameConfig=$memberMode?['url'=>$base.'community.php?v=game_api','csrf'=>$_SESSION['csrf']]:null;
$html=str_replace('<!--STUDIO_HEADER-->',studioHeader($active),$html);
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
    $demoRanks=$pdo->query("SELECT u.display_name,b.xp,1 FROM studio_demo_bots b JOIN studio_users u ON u.id=b.user_id WHERE u.active=1 AND u.visible=1 ORDER BY b.xp DESC LIMIT 30")->fetchAll();
    if($memberMode){try{$st=$pdo->prepare("SELECT u.display_name,w.xp,0 FROM studio_game_wallet w JOIN studio_users u ON u.id=w.user_id WHERE u.active=1 AND u.visible=1 AND u.id<>? AND u.id NOT IN(SELECT user_id FROM studio_demo_bots) AND NOT EXISTS(SELECT 1 FROM studio_blocks b WHERE (b.blocker_id=? AND b.blocked_id=u.id) OR (b.blocked_id=? AND b.blocker_id=u.id)) ORDER BY w.xp DESC LIMIT 100");$st->execute([$member['id'],$member['id'],$member['id']]);$demoRanks=array_merge($demoRanks,$st->fetchAll());}catch(Throwable $e){} }
   }
  }
 }
}catch(Throwable $e){$demoRanks=[];}
$html=str_replace('<!--STUDIO_RANKS-->',json_encode($demoRanks,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT),$html);

$wordBank=json_decode((string)file_get_contents(__DIR__.'/word-bank.json'),true);
$edition=(new DateTimeImmutable('now',new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');
$html=str_replace('<!--STUDIO_WORD_BANK-->',json_encode($view==='home'&&!$memberMode&&is_array($wordBank)?$wordBank:[],JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT),$html);
$html=str_replace('<!--STUDIO_EDITION-->',json_encode($edition),$html);
$html=preg_replace_callback('/<!--ART:([a-z]+)-->/u',fn($m)=>studioArt($m[1]),$html);
$html=str_replace('<!--STUDIO_PLUMA_TABS-->',studioPlumaTabs('stories'),$html);
$html=str_replace('<!--STUDIO_GAME_CONFIG-->',json_encode($gameConfig,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT),$html);
$gameJs=file_get_contents(__DIR__.'/member-game.js');
$html=str_replace('<!--STUDIO_MEMBER_GAME_JS-->',$gameJs===false?'':$gameJs,$html);
echo $html;
