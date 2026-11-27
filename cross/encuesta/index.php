<?php
declare(strict_types=1);
define('STUDIO_SECTION_ENTRY',true);
require dirname(__DIR__).'/includes/header.php';
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
function e($x):string{return studioEsc($x);}
function surveyMonth():string{return (new DateTimeImmutable('now',new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m');}
$base=studioBase();$url=$base.'encuesta/index.php';$month=surveyMonth();$data=json_decode((string)file_get_contents(dirname(__DIR__).'/includes/survey.json'),true);
if(!is_array($data)||empty($data['questions'])||!preg_match('/^\d+$/D',(string)$data['revision'])){http_response_code(503);exit('Encuesta no disponible.');}
$revision=(string)$data['revision'];$questions=$data['questions'];$allowed=[];foreach($questions as $q)$allowed[$q['id']]=array_column($q['options'],'id');
$db=null;$token='';$error='';$result=[];$available=false;$eligible=false;$voted=false;$marks=[];$dashboard=isset($_GET['resultados'])&&$_GET['resultados']==='1';$member=$dashboard?null:studioCurrentMember();
try{
 $private=dirname(__DIR__).'/private';
 if(!is_file($private.'/config.php')||!is_file($private.'/.htaccess')||!is_writable($private))throw new RuntimeException('storage');
 $cfg=require $private.'/config.php';if(!is_array($cfg)||($cfg['storage_verified']??false)!==true||!is_string($cfg['setup_key']??null)||strlen($cfg['setup_key'])<32)throw new RuntimeException('storage');
 if(empty($_SERVER['HTTPS'])||$_SERVER['HTTPS']==='off')throw new RuntimeException('https');
 umask(0077);
 $path=$private.'/survey-'.hash_hmac('sha256','studio-survey-v1',$cfg['setup_key']).'.sqlite3';
 $db=new PDO('sqlite:'.$path,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);@chmod($path,0600);
 $db->exec('PRAGMA busy_timeout=5000');$db->exec('PRAGMA journal_mode=DELETE');
 // Aggregates and independent participation marks; never store a ballot or responses associated with a mark.
 $db->exec('CREATE TABLE IF NOT EXISTS survey_counts(month TEXT NOT NULL,revision TEXT NOT NULL,question TEXT NOT NULL,choice TEXT NOT NULL,n INTEGER NOT NULL DEFAULT 0 CHECK(n>=0),PRIMARY KEY(month,revision,question,choice))');
 $db->exec('CREATE TABLE IF NOT EXISTS survey_participation(revision TEXT NOT NULL,mark TEXT NOT NULL,PRIMARY KEY(revision,mark))');
 $db->exec('CREATE TABLE IF NOT EXISTS survey_verified_totals(month TEXT NOT NULL,revision TEXT NOT NULL,n INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(month,revision))');
 $available=true;
 if($member&&!empty($_SESSION['csrf'])){
  $accountPath=$private.'/studio-'.hash_hmac('sha256','studio-db-v1',$cfg['setup_key']).'.sqlite3';
  if(is_file($accountPath)){
   $accounts=new PDO('sqlite:'.$accountPath,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);$accounts->exec('PRAGMA query_only=ON');
   $st=$accounts->prepare('SELECT e.email_key FROM studio_user_emails e JOIN studio_users u ON u.id=e.user_id WHERE u.id=? AND u.active=1 AND u.id NOT IN(SELECT user_id FROM studio_demo_bots)');$st->execute([(int)$member['id']]);$emailKey=$st->fetchColumn();
   if(is_string($emailKey)&&$emailKey!==''){
    $marks=[hash_hmac('sha256','survey-user-v2:'.$member['id'],$cfg['setup_key']),hash_hmac('sha256','survey-email-v2:'.$emailKey,$cfg['setup_key'])];
    $eligible=true;$token=$_SESSION['csrf'];$st=$db->prepare('SELECT 1 FROM survey_participation WHERE revision=? AND mark IN (?,?) LIMIT 1');$st->execute([$revision,...$marks]);$voted=(bool)$st->fetchColumn();
   }
  }
 }
}catch(Throwable $ex){$available=false;}
if(($_SERVER['REQUEST_METHOD']??'GET')==='POST'){
 if(!$available){http_response_code(503);$error='La encuesta todavía no está habilitada.';}
 elseif(!$eligible||$dashboard){http_response_code(403);$error='Iniciá sesión con un correo verificado para participar.';}
 else try{
  // Require the authenticated account's session CSRF token and reject cross-site requests.
  $site=$_SERVER['HTTP_SEC_FETCH_SITE']??'';if($site==='cross-site'||$site==='same-site')throw new DomainException('Abrí la encuesta desde Studio.');
  $origin=$_SERVER['HTTP_ORIGIN']??'';$host=$_SERVER['HTTP_HOST']??'';
  if($origin!==''&&strcasecmp($origin,'https://'.$host)!==0)throw new DomainException('Origen no autorizado.');
  if(!isset($_POST['token'])||!is_string($_POST['token'])||!hash_equals($token,$_POST['token']))throw new DomainException('El formulario venció. Volvé a abrir la encuesta.');
  if(($_POST['adult']??'')!=='yes'||($_POST['consent']??'')!=='yes')throw new DomainException('Confirmá que sos mayor de 18 años y que aceptás sumar tus respuestas a los totales anónimos.');
  $answers=$_POST['answers']??[];if(!is_array($answers)||count($answers)>count($allowed))throw new DomainException('Revisá las respuestas.');
  $selected=[];foreach($answers as $id=>$choice){if(!isset($allowed[$id])||!is_string($choice))throw new DomainException('Respuesta inválida.');if($choice==='')continue;if(!in_array($choice,$allowed[$id],true))throw new DomainException('Respuesta inválida.');$selected[$id]=$choice;}
  if(!$selected)throw new DomainException('Elegí al menos una respuesta. Podés omitir las demás.');
  $db->exec('BEGIN IMMEDIATE');try{
   $check=$db->prepare('SELECT 1 FROM survey_participation WHERE revision=? AND mark IN (?,?) LIMIT 1');$check->execute([$revision,...$marks]);if($check->fetchColumn())throw new DomainException('Ya participaste en esta edición.');
   $mark=$db->prepare('INSERT INTO survey_participation(revision,mark) VALUES(?,?)');foreach($marks as $m)$mark->execute([$revision,$m]);
   $db->prepare('INSERT INTO survey_verified_totals(month,revision,n) VALUES(?,?,1) ON CONFLICT(month,revision) DO UPDATE SET n=n+1')->execute([$month,$revision]);
   $st=$db->prepare('INSERT INTO survey_counts(month,revision,question,choice,n) VALUES(?,?,?,?,1) ON CONFLICT(month,revision,question,choice) DO UPDATE SET n=n+1');
   foreach($selected as $id=>$choice)$st->execute([$month,$revision,$id,$choice]);
   $db->exec('COMMIT');
  }catch(Throwable $ex){$db->exec('ROLLBACK');throw $ex;}
  header('Location: '.$url.'?enviada=1',true,303);exit;
 }catch(DomainException $ex){http_response_code(400);$error=$ex->getMessage();}catch(Throwable $ex){http_response_code(503);$error='No se pudieron sumar las respuestas. Intentá nuevamente.';}
}
$closed=(new DateTimeImmutable($month.'-01',new DateTimeZone('America/Argentina/Buenos_Aires')))->modify('-1 month')->format('Y-m');
if($available)try{
 $st=$db->prepare('SELECT question,choice,SUM(n) AS n FROM survey_counts WHERE month<=? AND revision=? GROUP BY question,choice');$st->execute([$closed,$revision]);
 foreach($st->fetchAll() as $r)$result[$r['question']][$r['choice']]=(int)$r['n'];
}catch(Throwable $ex){$result=[];}
$sent=$eligible&&$voted&&isset($_GET['enviada'])&&$_GET['enviada']==='1';
$participations=0;if($available)try{$st=$db->prepare('SELECT COALESCE(SUM(n),0) FROM survey_verified_totals WHERE month<=? AND revision=?');$st->execute([$closed,$revision]);$participations=(int)$st->fetchColumn();}catch(Throwable $e){}
$masthead=$dashboard?studioHeader('','',true):studioHeader();
?><!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Encuesta permanente del mundillo cross · Studio</title><link rel="stylesheet" href="<?=e($base)?>assets/shared.css"><style>
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top right,#f2d8ee,transparent 55%),#fff5fa;color:#492b47;font:15px/1.6 system-ui,sans-serif}main{max-width:900px;margin:auto;padding:24px 16px 45px}h1{font:700 clamp(29px,5vw,42px)/1.15 Georgia,serif;margin:8px 0 12px}h2{font-size:22px;margin:4px 0 12px}p{margin:8px 0}a{color:#96386f}.eyebrow{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#a13c78}.card,fieldset{border:1px solid #efd5e4;border-radius:17px;background:#fffbfd;padding:18px;margin:15px 0;min-width:0}.notice{background:#f5e6f1}.success{background:#e7f3eb;color:#276144}.error{background:#fbe0ec;color:#842c53}legend{font-weight:750;padding:0 6px}label.option{display:flex;gap:10px;align-items:flex-start;padding:9px 10px;margin:5px 0;border:1px solid #eedce6;border-radius:10px;cursor:pointer}label.option:has(input:checked){background:#f4e0ef;border-color:#b86c9e}input[type=radio],input[type=checkbox]{accent-color:#a13c78;flex-shrink:0;margin-top:5px}.option input:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #c479aa;outline-offset:3px}.small{font-size:13px;color:#806478}.btn{display:inline-block;text-decoration:none;border:0;border-radius:12px;padding:11px 20px;background:#a13c78;color:white;font:inherit;font-weight:750;cursor:pointer}.btn.alt{background:#f2dfed;color:#873363}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.chart-row{margin:12px 0}.chart-label{display:flex;justify-content:space-between;gap:12px;font-size:14px}.bar{height:10px;border-radius:99px;background:#f0e4ee;overflow:hidden}.bar i{display:block;height:100%;background:#b86fa6;border-radius:99px}.footer{font-size:12px;color:#806478;margin-top:20px}@media(max-width:600px){fieldset,.card{padding:14px}}
</style></head><body><?=$masthead?><main><div class="studio-section-hero"><div><div class="eyebrow">Studio · Observatorio de hábitos</div><h1>Encuesta permanente del mundillo cross</h1><p>¿Qué usamos, qué nos gusta y qué nos gustaría aprender? Ayudanos a conocer los hábitos de la comunidad y a elegir qué mejorar en Studio.</p><p class="small">12 preguntas · 2 a 3 minutos · Una vez por cuenta verificada</p></div><?=studioArt('recursos')?></div>
<div class="actions"><a class="btn<?=$dashboard?' alt':''?>" href="<?=e($url)?>">Participar</a><a class="btn<?=$dashboard?'':' alt'?>" href="<?=e($url)?>?resultados=1">Dashboard público</a></div>
<?php if(!$dashboard):?><div class="card notice"><h2>Participación voluntaria y respuestas anónimas</h2><p>Para evitar votos repetidos, se requiere una cuenta con correo verificado. Guardamos marcas criptográficas de participación separadas de los contadores de respuestas; no guardamos un formulario individual ni relacionamos sus opciones con tu perfil. Una participación por edición, incluso si cambiás de correo o volvés a crear una cuenta con el mismo correo.</p><p class="small">No pedimos información identificatoria en el cuestionario. Podés omitir cualquier pregunta. El hosting puede conservar registros técnicos; no hay anonimato absoluto frente a quien administra el servidor. Las marcas solo sirven para impedir duplicados y se conservan durante la edición, incluso si eliminás tu cuenta. Las respuestas agregadas no se pueden retirar individualmente. No damos premios por participar.</p></div>
<?php if($error):?><div class="card error" role="alert"><?=e($error)?></div><?php endif?>
<?php if($sent&&$available):?><div class="card success" role="status"><h2>Gracias por participar</h2><p>Tus respuestas ya forman parte de los totales agregados.</p><a class="btn alt" href="<?=e($base)?>">Volver a Studio</a></div>
<?php elseif($voted):?><div class="card success"><h2>Ya participaste</h2><p>Tu participación ya fue registrada para esta edición.</p><a class="btn alt" href="<?=e($url)?>?resultados=1">Ver resultados</a></div><?php elseif(!$available):?><div class="card"><h2>Encuesta en preparación</h2><p>Falta activar el almacenamiento privado.</p></div><?php elseif(!$eligible):?><div class="card"><h2>Participá con tu cuenta verificada</h2><p>Ingresá o vinculá tu correo desde tu perfil. Los resultados siguen siendo públicos.</p><a class="btn" href="<?=e($base)?>cuenta/?v=login">Ingresar</a> <a class="btn alt" href="<?=e($base)?>cuenta/?v=register">Crear cuenta</a></div><?php endif?>
<?php if($available&&$eligible&&!$voted):?><form method="post" action="<?=e($url)?>" autocomplete="off"><input type="hidden" name="token" value="<?=e($token)?>"><?php foreach($questions as $i=>$q):?><fieldset <?=$available?'':'disabled'?>><legend><?=($i+1)?>. <?=e($q['label'])?></legend><?php foreach($q['options'] as $o):?><label class="option"><input type="radio" name="answers[<?=e($q['id'])?>]" value="<?=e($o['id'])?>"> <span><?=e($o['label'])?></span></label><?php endforeach?><label class="option"><input type="radio" name="answers[<?=e($q['id'])?>]" value="" checked> <span>Prefiero no responder</span></label></fieldset><?php endforeach?>
<?php if($available):?><div class="card"><label class="option"><input type="checkbox" name="adult" value="yes" required> Tengo 18 años o más.</label><label class="option"><input type="checkbox" name="consent" value="yes" required> Acepto que mis respuestas se sumen a las estadísticas agregadas, según la información anterior.</label><button class="btn" type="submit">Enviar respuestas</button></div><?php endif?></form><?php endif?><?php endif?>
<?php if($dashboard):?><section id="resultados" class="card"><div class="eyebrow">Resultados acumulados · hasta <?=$closed?></div><h2>Qué nos cuenta la comunidad</h2><p>Dashboard público de todas las participaciones verificadas de esta edición hasta el último mes cerrado. Se actualiza mensualmente para evitar revelar cambios individuales. Mínimo 20 respuestas por pregunta; opciones pequeñas agrupadas. No representa a toda la comunidad.</p><?php if($participations>=20):?><div class="card"><strong style="font-size:28px;color:#a13c78"><?=$participations?></strong><p>Participaciones verificadas acumuladas</p></div><?php endif?><p class="small">Las respuestas de la versión anterior, sin control de duplicados, se conservan aparte y no se mezclan con esta serie.</p>
<?php $published=0;foreach($questions as $q):
 $counts=$result[$q['id']]??[];$total=0;$small=0;$rows=[];
 foreach($q['options'] as $o){$n=$counts[$o['id']]??0;$total+=$n;if($n>=5)$rows[]=[$o['label'],$n];else $small+=$n;}
 if($total<20||($small>0&&$small<5))continue;
 if($small>=5)$rows[]=['Otras opciones agrupadas',$small];$published++;
?><fieldset><legend><?=e($q['label'])?></legend><?php foreach($rows as [$label,$n]):$pct=(int)round(100*$n/$total);?><div class="chart-row"><div class="chart-label"><span><?=e($label)?></span><strong><?=$pct?>%</strong></div><div class="bar" aria-hidden="true"><i style="width:<?=$pct?>%"></i></div></div><?php endforeach?><p class="small">Base: <?=$total?> respuestas válidas.</p></fieldset><?php endforeach?>
<?php if(!$published):?><p class="small">Todavía no hay suficientes respuestas publicables acumuladas hasta el último mes cerrado.</p><?php endif?></section><?php endif?><p class="footer">Studio · Encuesta exploratoria y no representativa. Sin publicidad, premios ni rastreadores propios en esta página.</p></main></body></html>
