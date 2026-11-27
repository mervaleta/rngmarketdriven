<?php
// Local registration only. No email transport, verification or password recovery.
function studioEmailSchema(PDO $db): void{
 $db->exec("CREATE TABLE IF NOT EXISTS studio_user_emails(user_id INTEGER PRIMARY KEY,email_key TEXT NOT NULL UNIQUE,verified_at TEXT NOT NULL DEFAULT '',FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)");
}
function studioEmailValue(string $email): string{
 $email=strtolower(trim($email));if(strlen($email)>249||!filter_var($email,FILTER_VALIDATE_EMAIL))err('Ingresá un correo válido.');return $email;
}
function studioEmailKey(string $email): string{
 global $cfg;return hash_hmac('sha256','studio-email-v1:'.$email,$cfg['setup_key']);
}
function studioEmailFields(): string{
 return input('email','Correo electrónico (privado)','','email','required maxlength="249" autocomplete="email"');
}
function studioLocalRegister(): void{
 global $db,$me,$open;
 if(!$open||$me)err('El registro no está disponible.');
 if(p('adult')!=='yes')err('La comunidad es para mayores de 18 años.');
 rate('register-ip:'.ip(),6,3600);
 $key=studioEmailKey(studioEmailValue(p('email')));rate('register-email:'.$key,4,3600);
 $alias=username(p('username'));$name=clean(p('display_name'),60,true);$hash=passwordHash(p('password'));
 $db->exec('BEGIN IMMEDIATE');
 try{
  if(one('SELECT user_id FROM studio_user_emails WHERE email_key=?',[$key]))err('No se pudo crear la cuenta con esos datos. Probá ingresar.');
  if(one('SELECT id FROM studio_users WHERE username=?',[$alias]))err('El alias no está disponible.');
  q("INSERT INTO studio_users(username,display_name,password_hash,role) VALUES(?,?,?,'member')",[$alias,$name,$hash]);$uid=(int)$db->lastInsertId();
  q("INSERT INTO studio_user_emails(user_id,email_key,verified_at) VALUES(?,?,'')",[$uid,$key]);
  $db->exec('COMMIT');
 }catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}
 unset($_SESSION['studio_email_pending']);logIn(['id'=>$uid]);flash('Cuenta creada. No enviamos correos. Tu ficha es privada por defecto.');go('profile',$uid);
}
function studioEmailAccountCard(): string{
 global $me;
 $r=one('SELECT verified_at FROM studio_user_emails WHERE user_id=?',[$me['id']]);
 return card('<h2>Correo privado</h2><p>'.($r?'Podés ingresar con tu correo o alias.':'Esta cuenta conserva el ingreso por alias.').'</p><p>No enviamos correos ni verificamos direcciones durante esta beta. El correo no se muestra en el perfil. La recuperación y el cambio de contraseña están suspendidos.</p>');
}
