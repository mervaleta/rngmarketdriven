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
$db=null;$token='';$error='';$result=[];$available=false;
try{
 $private=dirname(__DIR__).'/private';
 if(!is_file($private.'/config.php')||!is_file($private.'/.htaccess')||!is_writable($private))throw new RuntimeException('storage');
 $cfg=require $private.'/config.php';if(!is_array($cfg)||($cfg['storage_verified']??false)!==true||!is_string($cfg['setup_key']??null)||strlen($cfg['setup_key'])<32)throw new RuntimeException('storage');
 if(empty($_SERVER['HTTPS'])||$_SERVER['HTTPS']==='off')throw new RuntimeException('https');
 umask(0077);
 $path=$private.'/survey-'.hash_hmac('sha256','studio-survey-v1',$cfg['setup_key']).'.sqlite3';
 $db=new PDO('sqlite:'.$path,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);@chmod($path,0600);
 $db->exec('PRAGMA busy_timeout=5000');$db->exec('PRAGMA journal_mode=DELETE');
 // Only per-option monthly totals. No submissions table, respondent IDs, IPs, timestamps or account links.
 $db->exec('CREATE TABLE IF NOT EXISTS survey_counts(month TEXT NOT NULL,revision TEXT NOT NULL,question TEXT NOT NULL,choice TEXT NOT NULL,n INTEGER NOT NULL DEFAULT 0 CHECK(n>=0),PRIMARY KEY(month,revision,question,choice))');
 $token=hash_hmac('sha256','studio-survey-form:'.$month.':'.$revision,$cfg['setup_key']);$available=true;
}catch(Throwable $ex){$available=false;}
if(($_SERVER['REQUEST_METHOD']??'GET')==='POST'){
 if(!$available){http_response_code(503);$error='La encuesta todavía no está habilitada.';}
 else try{
  // No individual CSRF cookie or session: shared monthly token and cross-site request rejection.
  $site=$_SERVER['HTTP_SEC_FETCH_SITE']??'';if($site==='cross-site'||$site==='same-site')throw new DomainException('Abrí la encuesta desde Studio.');
  $origin=$_SERVER['HTTP_ORIGIN']??'';$host=$_SERVER['HTTP_HOST']??'';
  if($origin!==''&&strcasecmp($origin,'https://'.$host)!==0)throw new DomainException('Origen no autorizado.');
  if(!isset($_POST['token'])||!is_string($_POST['token'])||!hash_equals($token,$_POST['token']))throw new DomainException('El formulario venció. Volvé a abrir la encuesta.');
  if(($_POST['adult']??'')!=='yes'||($_POST['consent']??'')!=='yes')throw new DomainException('Confirmá que sos mayor de 18 años y que aceptás sumar tus respuestas a los totales anónimos.');
  $answers=$_POST['answers']??[];if(!is_array($answers)||count($answers)>count($allowed))throw new DomainException('Revisá las respuestas.');
  $selected=[];foreach($answers as $id=>$choice){if(!isset($allowed[$id])||!is_string($choice))throw new DomainException('Respuesta inválida.');if($choice==='')continue;if(!in_array($choice,$allowed[$id],true))throw new DomainException('Respuesta inválida.');$selected[$id]=$choice;}
  if(!$selected)throw new DomainException('Elegí al menos una respuesta. Podés omitir las demás.');
  $db->beginTransaction();try{
   $st=$db->prepare('INSERT INTO survey_counts(month,revision,question,choice,n) VALUES(?,?,?,?,1) ON CONFLICT(month,revision,question,choice) DO UPDATE SET n=n+1');
   foreach($selected as $id=>$choice)$st->execute([$month,$revision,$id,$choice]);
   $db->commit();
  }catch(Throwable $ex){if($db->inTransaction())$db->rollBack();throw $ex;}
  header('Location: '.$url.'?enviada=1',true,303);exit;
 }catch(DomainException $ex){http_response_code(400);$error=$ex->getMessage();}catch(Throwable $ex){http_response_code(503);$error='No se pudieron sumar las respuestas. Intentá nuevamente.';}
}
$closed=(new DateTimeImmutable($month.'-01',new DateTimeZone('America/Argentina/Buenos_Aires')))->modify('-1 month')->format('Y-m');
if($available)try{
 $st=$db->prepare('SELECT question,choice,n FROM survey_counts WHERE month=? AND revision=?');$st->execute([$closed,$revision]);
 foreach($st->fetchAll() as $r)$result[$r['question']][$r['choice']]=(int)$r['n'];
}catch(Throwable $ex){$result=[];}
$sent=isset($_GET['enviada'])&&$_GET['enviada']==='1';
$masthead=studioHeader('','',true);
?><!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Encuesta permanente del mundillo cross · Studio</title><link rel="stylesheet" href="<?=e($base)?>assets/shared.css"><style>
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top right,#f2d8ee,transparent 55%),#fff5fa;color:#492b47;font:15px/1.6 system-ui,sans-serif}main{max-width:900px;margin:auto;padding:24px 16px 45px}h1{font:700 clamp(29px,5vw,42px)/1.15 Georgia,serif;margin:8px 0 12px}h2{font-size:22px;margin:4px 0 12px}p{margin:8px 0}a{color:#96386f}.eyebrow{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#a13c78}.card,fieldset{border:1px solid #efd5e4;border-radius:17px;background:#fffbfd;padding:18px;margin:15px 0;min-width:0}.notice{background:#f5e6f1}.success{background:#e7f3eb;color:#276144}.error{background:#fbe0ec;color:#842c53}legend{font-weight:750;padding:0 6px}label.option{display:flex;gap:10px;align-items:flex-start;padding:9px 10px;margin:5px 0;border:1px solid #eedce6;border-radius:10px;cursor:pointer}label.option:has(input:checked){background:#f4e0ef;border-color:#b86c9e}input[type=radio],input[type=checkbox]{accent-color:#a13c78;flex-shrink:0;margin-top:5px}.option input:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #c479aa;outline-offset:3px}.small{font-size:13px;color:#806478}.btn{display:inline-block;text-decoration:none;border:0;border-radius:12px;padding:11px 20px;background:#a13c78;color:white;font:inherit;font-weight:750;cursor:pointer}.btn.alt{background:#f2dfed;color:#873363}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.chart-row{margin:12px 0}.chart-label{display:flex;justify-content:space-between;gap:12px;font-size:14px}.bar{height:10px;border-radius:99px;background:#f0e4ee;overflow:hidden}.bar i{display:block;height:100%;background:#b86fa6;border-radius:99px}.footer{font-size:12px;color:#806478;margin-top:20px}@media(max-width:600px){fieldset,.card{padding:14px}}
</style></head><body><?=$masthead?><main><div class="studio-section-hero"><div><div class="eyebrow">Studio · Observatorio de hábitos</div><h1>Encuesta permanente del mundillo cross</h1><p>¿Qué usamos, qué nos gusta y qué nos gustaría aprender? Ayudanos a conocer los hábitos de la comunidad y a elegir qué mejorar en Studio.</p><p class="small">12 preguntas · 2 a 3 minutos · Sin cuenta</p></div><?=studioArt('recursos')?></div>
<div class="card notice"><h2>Participación voluntaria</h2><p>Podés omitir cualquier pregunta. No pedimos nombre, usuario, correo, ubicación, fotografías ni texto libre. El módulo guarda únicamente contadores por respuesta y mes, sin unir las respuestas de una misma persona ni asociarlas a perfiles.</p><p class="small">El hosting puede conservar registros técnicos, como IP y horario de acceso; no usamos esos registros para la encuesta. No podemos garantizar anonimato absoluto frente al operador del hosting. Una vez sumadas, las respuestas no se pueden individualizar ni retirar por separado. Participá solo si estás de acuerdo. Te pedimos una participación por mes; no hacemos seguimiento individual para comprobarlo.</p><div class="actions"><a class="btn alt" href="#resultados">Ver resultados agregados</a></div></div>
<?php if($error):?><div class="card error" role="alert"><?=e($error)?></div><?php endif?>
<?php if($sent&&$available):?><div class="card success" role="status"><h2>Gracias por participar</h2><p>Si enviaste el formulario correctamente, tus respuestas ya forman parte de los totales del mes.</p><a class="btn alt" href="<?=e($base)?>">Volver a Studio</a></div>
<?php elseif(!$available):?><div class="card"><h2>Encuesta en preparación</h2><p>Las preguntas ya están disponibles para consultar, pero todavía falta activar el almacenamiento privado en el hosting. No se recibirán respuestas hasta entonces.</p></div><?php endif?>
<?php if(!$sent||!$available):?><form method="post" action="<?=e($url)?>" autocomplete="off"><input type="hidden" name="token" value="<?=e($token)?>"><?php foreach($questions as $i=>$q):?><fieldset <?=$available?'':'disabled'?>><legend><?=($i+1)?>. <?=e($q['label'])?></legend><?php foreach($q['options'] as $o):?><label class="option"><input type="radio" name="answers[<?=e($q['id'])?>]" value="<?=e($o['id'])?>"> <span><?=e($o['label'])?></span></label><?php endforeach?><label class="option"><input type="radio" name="answers[<?=e($q['id'])?>]" value="" checked> <span>Prefiero no responder</span></label></fieldset><?php endforeach?>
<?php if($available):?><div class="card"><label class="option"><input type="checkbox" name="adult" value="yes" required> Tengo 18 años o más.</label><label class="option"><input type="checkbox" name="consent" value="yes" required> Acepto que mis respuestas se sumen a las estadísticas agregadas, según la información anterior.</label><button class="btn" type="submit">Enviar respuestas</button></div><?php endif?></form><?php endif?>
<section id="resultados" class="card"><div class="eyebrow">Resultados · <?=$closed?></div><h2>Qué nos cuenta la comunidad</h2><p>Publicamos únicamente el último mes cerrado, con al menos 20 respuestas válidas por pregunta. Las opciones con menos de cinco respuestas se agrupan y se omite toda la pregunta si ese grupo no llega a cinco. Los porcentajes son de respuestas, no de personas únicas. No representan a toda la comunidad crossdresser.</p>
<?php $published=0;foreach($questions as $q):
 $counts=$result[$q['id']]??[];$total=0;$small=0;$rows=[];
 foreach($q['options'] as $o){$n=$counts[$o['id']]??0;$total+=$n;if($n>=5)$rows[]=[$o['label'],$n];else $small+=$n;}
 if($total<20||($small>0&&$small<5))continue;
 if($small>=5)$rows[]=['Otras opciones agrupadas',$small];$published++;
?><fieldset><legend><?=e($q['label'])?></legend><?php foreach($rows as [$label,$n]):$pct=(int)round(100*$n/$total);?><div class="chart-row"><div class="chart-label"><span><?=e($label)?></span><strong><?=$pct?>%</strong></div><div class="bar" aria-hidden="true"><i style="width:<?=$pct?>%"></i></div></div><?php endforeach?><p class="small">Base: <?=$total?> respuestas válidas.</p></fieldset><?php endforeach?>
<?php if(!$published):?><p class="small">Todavía no hay suficientes respuestas publicables del último mes cerrado.</p><?php endif?></section><p class="footer">Studio · Encuesta exploratoria y no representativa. Sin publicidad, premios ni rastreadores propios en esta página.</p></main></body></html>
