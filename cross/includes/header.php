<?php
function studioBase(): string {
    $script=str_replace('\\','/',(string)($_SERVER['SCRIPT_NAME']??'/index.php'));
    $dir=rtrim(dirname($script),'/');
    $depth=defined('STUDIO_SECTION_DEPTH')?(int)STUDIO_SECTION_DEPTH:((defined('STUDIO_SECTION_ENTRY')&&STUDIO_SECTION_ENTRY)?1:0);
    for($i=0;$i<$depth;$i++)$dir=rtrim(dirname($dir?:'/'),'/');
    return ($dir==='.'?'':$dir).'/';
}
function studioEsc($x): string{return htmlspecialchars((string)$x,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function studioCurrentMember(): ?array {
    if(isset($GLOBALS['me'])&&is_array($GLOBALS['me']))return $GLOBALS['me'];
    if(!isset($_COOKIE['studio_beta_sid']))return null;
    try{
        $private=dirname(__DIR__).'/private';
        if(!is_file($private.'/config.php')||!is_file($private.'/.htaccess')||!is_dir($private.'/sessions'))return null;
        $cfg=require $private.'/config.php';
        if(!is_array($cfg)||($cfg['storage_verified']??false)!==true||!is_string($cfg['setup_key']??null)||strlen($cfg['setup_key'])<32)return null;
        $path=$private.'/studio-'.hash_hmac('sha256','studio-db-v1',$cfg['setup_key']).'.sqlite3';if(!is_file($path))return null;
        if(session_status()!==PHP_SESSION_ACTIVE){
            if(headers_sent())return null;
            session_name('studio_beta_sid');ini_set('session.use_strict_mode','1');session_save_path($private.'/sessions');
            session_set_cookie_params(['lifetime'=>0,'path'=>studioBase(),'secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
            if(!@session_start(['read_and_close'=>true]))return null;
        }
        $uid=(int)($_SESSION['uid']??0);if(!$uid)return null;
        $pdo=new PDO('sqlite:'.$path,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);$pdo->exec('PRAGMA query_only=ON');
        $st=$pdo->prepare('SELECT id,display_name,role,avatar IS NOT NULL AS has_avatar FROM studio_users WHERE id=? AND active=1');$st->execute([$uid]);return $st->fetch()?:null;
    }catch(Throwable $e){return null;}
}
function studioHeaderGame(?array $member): array {
 if(!$member)return ['coins'=>100,'quizDone'=>false,'packDone'=>false];
 try{$private=dirname(__DIR__).'/private';$cfg=require $private.'/config.php';$path=$private.'/studio-'.hash_hmac('sha256','studio-db-v1',$cfg['setup_key']).'.sqlite3';if(!is_file($path))throw new RuntimeException('storage');$pdo=new PDO('sqlite:'.$path,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);$pdo->exec('PRAGMA query_only=ON');$uid=(int)$member['id'];$day=(new DateTimeImmutable('now',new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');$q=$pdo->prepare('SELECT credits FROM studio_game_wallet WHERE user_id=?');$q->execute([$uid]);$coins=$q->fetchColumn();$q=$pdo->prepare('SELECT position FROM studio_quiz_attempts WHERE user_id=? AND day=?');$q->execute([$uid,$day]);$done=(int)$q->fetchColumn()>=7;$q=$pdo->prepare('SELECT 1 FROM studio_game_packs WHERE user_id=? AND day=?');$q->execute([$uid,$day]);return ['coins'=>$coins===false?100:(int)$coins,'quizDone'=>$done,'packDone'=>(bool)$q->fetchColumn()];}catch(Throwable $e){return ['coins'=>100,'quizDone'=>false,'packDone'=>false];}
}
function studioArt(string $name,string $class=''): string{
    $known=['quiz','album','ranking','pluma','perfiles','guias','shopping','recursos','minijuegos'];
    if(!in_array($name,$known,true))return '';
    return '<img class="studio-art '.studioEsc($class).'" src="'.studioEsc(studioBase()).'assets/art/'.studioEsc($name).'.svg" alt="" aria-hidden="true" decoding="async">';
}
function studioHeader(string $active='',string $extra='',bool $anonymous=false): string {
    $base=studioBase();$member=$anonymous?null:studioCurrentMember();$game=$anonymous?['coins'=>100,'quizDone'=>false,'packDone'=>false]:studioHeaderGame($member);
    $active=['muro'=>'pluma','foro'=>'pluma','relatos'=>'pluma','glosario'=>'recursos'][$active]??$active;
    $tabs=['ranking'=>['ranking/','Ranking'],'album'=>['album/','Mi álbum'],'pluma'=>['index.php?seccion=pluma-libre','Pluma Libre'],'chat'=>['chat/index.php','Chat'],'perfiles'=>['perfiles/','Perfiles'],'guias'=>['guias/','Guías'],'ropero'=>['ropero/index.php','Ropero'],'shopping'=>['shopping/','Shopping'],'recursos'=>['recursos/','Recursos'],'minijuegos'=>['minijuegos/','Minijuegos']];
    if($anonymous){
        $out='<header class="studio-header"><div class="studio-top"><a class="studio-brand" href="'.studioEsc($base).'" aria-label="Studio, volver a inicio">studio<span>✦</span></a><div class="studio-extra"><span>Encuesta sin cuenta</span></div></div><nav class="studio-nav" aria-label="Navegación principal">';
        foreach($tabs as $key=>$item){if($key==='ranking'&&!$member)continue;$out.='<a href="'.studioEsc($base.$item[0]).'">'.studioEsc($item[1]).'</a>';}
        return $out.'</nav></header>';
    }
    $account=$base.($member?'perfiles/?v=profile&id='.(int)$member['id']:'cuenta/');
    $avatar=$member&&!empty($member['has_avatar'])?'<img src="'.studioEsc($base).'perfiles/?v=avatar&amp;id='.(int)$member['id'].'" alt="">':'<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20v-1a7 7 0 0 1 14 0v1"/></svg>';
    $out='<header class="studio-header" data-member="'.($member?'1':'0').'" data-quiz-done="'.($game['quizDone']?'1':'0').'" data-pack-done="'.($game['packDone']?'1':'0').'"><div class="studio-top"><a class="studio-brand" href="'.studioEsc($base).'" aria-label="Studio, volver a inicio">studio<span>✦</span></a><span class="studio-version">PREVIEW 1.0</span><div class="studio-extra"><a class="studio-wallet" href="'.studioEsc($base).'album/" aria-label="Créditos de juego"><span aria-hidden="true">◈</span><strong id="headerCoins">'.(int)$game['coins'].'</strong><span class="wallet-label">créditos</span></a>';
    $out.='<details class="studio-notifications"><summary class="studio-circle" aria-label="Notificaciones"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><span id="studio-notif-dot" class="studio-notif-dot" hidden></span></summary><div class="studio-notif-panel"><strong>Notificaciones</strong><p class="studio-notif-meta">Recordatorios del desafío y del álbum.</p><a id="studio-notif-quiz" href="'.studioEsc($base).'">Desafío diario</a><a id="studio-notif-pack" href="'.studioEsc($base).'album/">Sobre del día</a><p id="studio-notif-empty" class="studio-notif-meta" hidden>Estás al día.</p></div></details>';
    $out.='<a class="studio-circle studio-avatar" href="'.studioEsc($account).'" aria-label="'.studioEsc($member?'Mi perfil':'Mi cuenta: ingresar o registrarse').'" title="'.studioEsc($member?$member['display_name']:'Mi cuenta').'">'.$avatar.'</a>';
    $out.=$extra.'</div></div><nav class="studio-nav" aria-label="Navegación principal">';
    foreach($tabs as $key=>$item)$out.='<a href="'.studioEsc($base.$item[0]).'"'.($active===$key?' aria-current="page"':'').'>'.studioEsc($item[1]).'</a>';
    return $out.'</nav></header><script defer src="'.studioEsc($base).'assets/header.js"></script>';
}
function studioPlumaTabs(string $active=''): string {
    $base=studioBase();$out='<div class="studio-pluma-tabs" aria-label="Secciones de Pluma Libre">';
    foreach(['pluma'=>['index.php?seccion=pluma-libre','Portada'],'wall'=>['muro/index.php','Muro'],'forum'=>['foro/index.php','Foro'],'stories'=>['relatos/index.php','Relatos']] as $k=>$item)$out.='<a href="'.studioEsc($base.$item[0]).'"'.($active===$k?' aria-current="page"':'').'>'.studioEsc($item[1]).'</a>';
    return $out.'</div>';
}
