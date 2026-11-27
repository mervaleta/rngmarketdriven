<?php
// Private email identification layered onto existing Studio users.
// Store keyed email digests only; SMTP recipient is used transiently.
function studioEmailSchema(PDO $db): void{
 $db->exec("CREATE TABLE IF NOT EXISTS studio_user_emails(user_id INTEGER PRIMARY KEY,email_key TEXT NOT NULL UNIQUE,verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)");
}
function studioEmailValue(string $email): string{
 $email=strtolower(trim($email));
 if(strlen($email)>249||!filter_var($email,FILTER_VALIDATE_EMAIL))err('Ingresá un correo válido.');
 return $email;
}
function studioEmailKey(string $email): string{
 global $cfg;return hash_hmac('sha256','studio-email-v1:'.$email,$cfg['setup_key']);
}
function studioMailReady(): bool{
 global $cfg;$m=$cfg['smtp']??null;
 return is_array($m)&&is_string($m['host']??null)&&$m['host']!==''&&is_string($m['username']??null)&&filter_var($m['username'],FILTER_VALIDATE_EMAIL)!==false&&is_string($m['password']??null)&&$m['password']!==''&&in_array((int)($m['port']??0),[465,587],true)&&is_file(__DIR__.'/vendor/PHPMailer/src/PHPMailer.php');
}
function studioMailCode(string $to,string $code): void{
 global $cfg;
 if(!studioMailReady())err('El envío de correos todavía no está configurado.');
 $dir=__DIR__.'/vendor/PHPMailer/src/';
 require_once $dir.'Exception.php';require_once $dir.'SMTP.php';require_once $dir.'PHPMailer.php';
 $m=$cfg['smtp'];$mail=new \PHPMailer\PHPMailer\PHPMailer(true);
 $mail->isSMTP();$mail->Host=$m['host'];$mail->SMTPAuth=true;$mail->Username=$m['username'];$mail->Password=$m['password'];$mail->Port=(int)$m['port'];$mail->SMTPSecure=$mail->Port===465?\PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS:\PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
 $mail->Timeout=12;$mail->SMTPDebug=0;$mail->CharSet='UTF-8';
 $mail->setFrom($m['username'],'Studio');$mail->addAddress($to);$mail->Subject='Código de acceso · Studio';
 $mail->Body="Tu código de verificación es: ".$code."\n\nVence en 15 minutos. Ingresalo en la página donde lo solicitaste. No lo compartas.\nSi no solicitaste este código, ignorá este mensaje.";
 try{$mail->send();}catch(Throwable $e){err('No se pudo enviar el código. Probá más tarde.');}
}
function studioEmailFields(): string{
 return input('email','Correo electrónico (privado)','','email','required maxlength="249" autocomplete="email"');
}
function studioEmailStart(string $mode): void{
 global $me,$open,$cfg;
 if(!studioMailReady())err('El servicio de correo todavía no está habilitado.');
 if($mode==='register'&&(!$open||$me))err('El registro no está disponible.');
 if($mode==='attach'){needUser();rate('attach-password:'.$me['id'],6,900);if(!empty($me['is_bot']))err('No disponible.');$u=one('SELECT password_hash FROM studio_users WHERE id=?',[$me['id']]);if(!$u||!password_verify(p('current'),$u['password_hash']))err('Contraseña actual incorrecta.');}
 rate('email-ip:'.ip(),6,3600);
 $email=studioEmailValue(p('email'));$key=studioEmailKey($email);rate('email-address:'.$key,4,3600);rate('email-global',150,3600);
 $pending=['mode'=>$mode,'email_key'=>$key,'uid'=>$mode==='attach'?(int)$me['id']:0,'expires'=>time()+900,'tries'=>0];
 if($mode==='register'){
  if(p('adult')!=='yes')err('La comunidad es para mayores de 18 años.');
  $pending['username']=username(p('username'));$pending['display_name']=clean(p('display_name'),60,true);$pending['password_hash']=passwordHash(p('password'));
 }
 $code=(string)random_int(10000000,99999999);$nonce=bin2hex(random_bytes(24));
 $pending['nonce']=$nonce;$pending['code_hash']=hash_hmac('sha256',$nonce.':'.$code,$cfg['setup_key']);
 // Do not create an account before email ownership is confirmed.
 studioMailCode($email,$code);$_SESSION['studio_email_pending']=$pending;
 flash('Te enviamos un código. Revisá también correo no deseado.');go('verify_email');
}
function studioEmailConfirm(): void{
 global $db,$me,$open,$cfg;
 $p=$_SESSION['studio_email_pending']??null;
 if(!is_array($p)||($p['expires']??0)<time()||($p['tries']??0)>=5){unset($_SESSION['studio_email_pending']);err('Código vencido. Solicitá otro.');}
 if(($p['mode']==='register'&&(!$open||$me))||($p['mode']==='attach'&&(!$me||(int)$me['id']!==$p['uid']))){unset($_SESSION['studio_email_pending']);err('La operación ya no está disponible.');}
 rate('verify-ip:'.ip(),25,600);$_SESSION['studio_email_pending']['tries']++;
 $code=trim(p('code'));if(!preg_match('/^[0-9]{8}$/D',$code)||!hash_equals($p['code_hash'],hash_hmac('sha256',$p['nonce'].':'.$code,$cfg['setup_key'])))err('Código incorrecto o vencido.');
 unset($_SESSION['studio_email_pending']);
 $db->exec('BEGIN IMMEDIATE');
 try{
  $existing=one('SELECT user_id FROM studio_user_emails WHERE email_key=?',[$p['email_key']]);
  if($existing&&($p['mode']!=='attach'||(int)$existing['user_id']!==$p['uid']))err('Ese correo ya está asociado a una cuenta. Ingresá con ella.');
  if($p['mode']==='register'){
   if(one('SELECT id FROM studio_users WHERE username=?',[$p['username']]))err('El alias no está disponible. Volvé a registrarte.');
   q("INSERT INTO studio_users(username,display_name,password_hash,role) VALUES(?,?,?,'member')",[$p['username'],$p['display_name'],$p['password_hash']]);$uid=(int)$db->lastInsertId();
   q('INSERT INTO studio_user_emails(user_id,email_key) VALUES(?,?)',[$uid,$p['email_key']]);
  }else{
   $uid=(int)$me['id'];q('INSERT INTO studio_user_emails(user_id,email_key) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET email_key=excluded.email_key,verified_at=CURRENT_TIMESTAMP',[$uid,$p['email_key']]);
  }
  $db->exec('COMMIT');
 }catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}
 if($p['mode']==='register')logIn(['id'=>$uid]);flash('Correo verificado. Tu perfil sigue siendo privado por defecto.');go('profile',$uid);
}
function studioEmailAccountCard(): string{
 global $me;
 $verified=(bool)one('SELECT 1 FROM studio_user_emails WHERE user_id=?',[$me['id']]);
 return card('<h2>Correo privado</h2><p>'.($verified?'Tu correo está verificado. Podés ingresar con él o con tu alias.':'Todavía no vinculaste un correo. Podés seguir ingresando con tu alias.').'</p><p>El correo no se muestra en tu perfil ni se usa para comunicaciones comerciales. Solo se conserva una huella criptográfica para localizar la cuenta.</p>'.(studioMailReady()?form('email_attach',studioEmailFields().input('current','Contraseña actual','','password','required autocomplete="current-password"'),$verified?'Cambiar correo':'Vincular correo'):'<p>La vinculación estará disponible cuando se configure el envío de correo.</p>'));
}
