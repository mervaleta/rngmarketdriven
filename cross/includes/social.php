<?php
// Community features: authenticated polling chat, explicit room membership and moderation.
function studioSocialSchema(PDO $db): void {
 $ddl=[
 "CREATE TABLE IF NOT EXISTS studio_chat_rooms(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,visibility TEXT NOT NULL CHECK(visibility IN ('general','private')),owner_id INTEGER NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(owner_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_chat_members(room_id INTEGER NOT NULL,user_id INTEGER NOT NULL,PRIMARY KEY(room_id,user_id),FOREIGN KEY(room_id) REFERENCES studio_chat_rooms(id) ON DELETE CASCADE,FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_chat_invites(room_id INTEGER NOT NULL,user_id INTEGER NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(room_id,user_id),FOREIGN KEY(room_id) REFERENCES studio_chat_rooms(id) ON DELETE CASCADE,FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_chat_messages(id INTEGER PRIMARY KEY AUTOINCREMENT,room_id INTEGER NOT NULL,user_id INTEGER NOT NULL,body TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(room_id) REFERENCES studio_chat_rooms(id) ON DELETE CASCADE,FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE INDEX IF NOT EXISTS studio_chat_room_messages ON studio_chat_messages(room_id,id)",
 "CREATE TABLE IF NOT EXISTS studio_blocks(blocker_id INTEGER NOT NULL,blocked_id INTEGER NOT NULL,PRIMARY KEY(blocker_id,blocked_id),FOREIGN KEY(blocker_id) REFERENCES studio_users(id) ON DELETE CASCADE,FOREIGN KEY(blocked_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_reports(id INTEGER PRIMARY KEY AUTOINCREMENT,reporter_id INTEGER NOT NULL,target_type TEXT NOT NULL CHECK(target_type IN ('post','chat')),target_id INTEGER NOT NULL,reason TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','closed')),created_at TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(reporter_id,target_type,target_id),FOREIGN KEY(reporter_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_post_reviews(post_id INTEGER PRIMARY KEY,status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')),FOREIGN KEY(post_id) REFERENCES studio_posts(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_reactions(post_id INTEGER NOT NULL,user_id INTEGER NOT NULL,PRIMARY KEY(post_id,user_id),FOREIGN KEY(post_id) REFERENCES studio_posts(id) ON DELETE CASCADE,FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE UNIQUE INDEX IF NOT EXISTS studio_general_room ON studio_chat_rooms(visibility) WHERE visibility='general'"
 ];foreach($ddl as $sql)$db->exec($sql);
 $db->exec("INSERT OR IGNORE INTO studio_chat_rooms(title,visibility) VALUES('General','general')");
}
function studioBlocked(int $a,int $b): bool{return (bool)one('SELECT 1 FROM studio_blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?)',[$a,$b,$b,$a]);}
function studioPostVisible(int $id,int $uid): ?array {
 $r=one("SELECT p.*,u.active,COALESCE(r.status,'approved') AS review_status FROM studio_posts p JOIN studio_users u ON u.id=p.user_id LEFT JOIN studio_post_reviews r ON r.post_id=p.id WHERE p.id=?",[$id]);
 if(!$r||!$r['active']||studioBlocked($uid,(int)$r['user_id']))return null;
 if($r['review_status']!=='approved'&&(int)$r['user_id']!==$uid)return null;
 if($r['parent_id']){$parent=one("SELECT p.user_id,u.active,COALESCE(r.status,'approved') AS status FROM studio_posts p JOIN studio_users u ON u.id=p.user_id LEFT JOIN studio_post_reviews r ON r.post_id=p.id WHERE p.id=?",[$r['parent_id']]);if(!$parent||!$parent['active']||$parent['status']!=='approved'||studioBlocked($uid,(int)$parent['user_id']))return null;}
 return $r;
}
function studioPostFilter(): string{
 global $me;$uid=(int)$me['id'];
 return " AND NOT EXISTS(SELECT 1 FROM studio_blocks bl WHERE (bl.blocker_id=$uid AND bl.blocked_id=p.user_id) OR (bl.blocked_id=$uid AND bl.blocker_id=p.user_id)) AND (p.user_id=$uid OR NOT EXISTS(SELECT 1 FROM studio_post_reviews rv WHERE rv.post_id=p.id AND rv.status<>'approved'))";
}
function studioRoom(int $id,int $uid): ?array{
 $room=one('SELECT * FROM studio_chat_rooms WHERE id=?',[$id]);if(!$room)return null;
 if($room['visibility']==='general')return $room;
 if((int)$room['owner_id']!==$uid&&studioBlocked($uid,(int)$room['owner_id']))return null;
 return one('SELECT 1 FROM studio_chat_members WHERE room_id=? AND user_id=?',[$id,$uid])?$room:null;
}
function studioChatUrl(int $id=0): string{return studioBase().'chat/index.php'.($id?'?id='.$id:'');}
function studioChatGo(int $id=0): void{header('Location: '.studioChatUrl($id),true,303);exit;}
function studioJson(array $value,int $status=200): void{http_response_code($status);header('Content-Type: application/json; charset=utf-8');echo json_encode($value,JSON_HEX_TAG|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
function studioChatFeed(): void{
 global $me;
 if(!$me)studioJson(['error'=>'Sesión requerida'],401);
 $id=max(0,(int)g('room'));$uid=(int)$me['id'];if(!studioRoom($id,$uid))studioJson(['error'=>'Sala no disponible'],403);
 $after=max(0,(int)g('after'));
 $sql="SELECT m.id,m.user_id,u.display_name,m.body,m.created_at FROM studio_chat_messages m JOIN studio_users u ON u.id=m.user_id WHERE m.room_id=? AND u.active=1 AND NOT EXISTS(SELECT 1 FROM studio_blocks b WHERE (b.blocker_id=? AND b.blocked_id=m.user_id) OR (b.blocked_id=? AND b.blocker_id=m.user_id))";
 $messages=$after?rows($sql.' AND m.id>? ORDER BY m.id LIMIT 100',[$id,$uid,$uid,$after]):array_reverse(rows($sql.' ORDER BY m.id DESC LIMIT 60',[$id,$uid,$uid]));
 studioJson(['messages'=>$messages,'self'=>$uid]);
}
function studioSocialAction(string $a): void{
 global $db,$me;
 $uid=(int)$me['id'];$roomId=max(0,(int)p('room'));$room=null;
 if(strpos($a,'chat_')===0)rate('chat-action:'.$uid,40,60);
 if($a==='chat_create'){
  $title=clean(p('title'),60,true);if((int)one("SELECT COUNT(*) AS n FROM studio_chat_rooms WHERE owner_id=?",[$uid])['n']>=10)err('Máximo de diez salas propias.');
  $db->exec('BEGIN IMMEDIATE');try{q("INSERT INTO studio_chat_rooms(title,visibility,owner_id) VALUES(?,'private',?)",[$title,$uid]);$id=(int)$db->lastInsertId();q('INSERT INTO studio_chat_members(room_id,user_id) VALUES(?,?)',[$id,$uid]);$db->exec('COMMIT');}catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}studioChatGo($id);
 }
 if($a==='chat_invite'){
  $room=studioRoom($roomId,$uid);if(!$room||$room['visibility']!=='private'||(int)$room['owner_id']!==$uid)err('No autorizado.');
  $target=one("SELECT id FROM studio_users WHERE username=? AND active=1 AND id NOT IN(SELECT user_id FROM studio_demo_bots)",[strtolower(trim(p('alias')))]);
  if(!$target||(int)$target['id']===$uid||studioBlocked($uid,(int)$target['id']))err('No se pudo invitar a ese usuario.');
  if(!one('SELECT 1 FROM studio_chat_members WHERE room_id=? AND user_id=?',[$roomId,$target['id']]))q('INSERT OR IGNORE INTO studio_chat_invites(room_id,user_id) VALUES(?,?)',[$roomId,$target['id']]);
  flash('Invitación enviada.');studioChatGo($roomId);
 }
 if($a==='chat_accept'||$a==='chat_decline'){
  $invite=one("SELECT i.room_id,r.owner_id FROM studio_chat_invites i JOIN studio_chat_rooms r ON r.id=i.room_id WHERE i.room_id=? AND i.user_id=?",[$roomId,$uid]);
  if(!$invite)err('Invitación no disponible.');
  if($a==='chat_accept'&&studioBlocked($uid,(int)$invite['owner_id']))err('Invitación no disponible.');
  $db->exec('BEGIN IMMEDIATE');try{if($a==='chat_accept')q('INSERT OR IGNORE INTO studio_chat_members(room_id,user_id) VALUES(?,?)',[$roomId,$uid]);q('DELETE FROM studio_chat_invites WHERE room_id=? AND user_id=?',[$roomId,$uid]);$db->exec('COMMIT');}catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}studioChatGo($a==='chat_accept'?$roomId:0);
 }
 if(in_array($a,['chat_leave','chat_close','chat_remove','chat_send','chat_report'],true)){
  $room=studioRoom($roomId,$uid);if(!$room)err('Sala no disponible.');
  if($a==='chat_send'){rate('chat-msg:'.$uid,20,60);$body=clean(p('body'),1000,true);q('INSERT INTO studio_chat_messages(room_id,user_id,body) VALUES(?,?,?)',[$roomId,$uid,$body]);if(p('ajax')==='yes')studioJson(['ok'=>true]);studioChatGo($roomId);}
  if($a==='chat_report'){rate('report:'.$uid,10,3600);$id=(int)p('target');if(!one('SELECT id FROM studio_chat_messages WHERE id=? AND room_id=?',[$id,$roomId]))err('Mensaje no disponible.');q("INSERT OR IGNORE INTO studio_reports(reporter_id,target_type,target_id,reason) VALUES(?,'chat',?,?)",[$uid,$id,clean(p('reason'),300,true)]);flash('Denuncia enviada a moderación.');studioChatGo($roomId);}
  if($room['visibility']!=='private')err('Acción no disponible.');
  if($a==='chat_close'){if((int)$room['owner_id']!==$uid)err('No autorizado.');if(p('confirm')!=='yes')err('Confirmá el cierre de la sala.');q('DELETE FROM studio_chat_rooms WHERE id=?',[$roomId]);studioChatGo();}
  if($a==='chat_leave'){if((int)$room['owner_id']===$uid)err('La persona propietaria debe cerrar su sala.');q('DELETE FROM studio_chat_members WHERE room_id=? AND user_id=?',[$roomId,$uid]);studioChatGo();}
  if($a==='chat_remove'){if((int)$room['owner_id']!==$uid)err('No autorizado.');$target=(int)p('target');if($target===$uid)err('No autorizado.');q('DELETE FROM studio_chat_members WHERE room_id=? AND user_id=?',[$roomId,$target]);q('DELETE FROM studio_chat_invites WHERE room_id=? AND user_id=?',[$roomId,$target]);studioChatGo($roomId);}
 }
 if($a==='block'||$a==='unblock'){
  $target=(int)p('target');if($target===$uid||!one('SELECT id FROM studio_users WHERE id=?',[$target]))err('Usuario no disponible.');
  if($a==='block'){q('INSERT OR IGNORE INTO studio_blocks(blocker_id,blocked_id) VALUES(?,?)',[$uid,$target]);q('DELETE FROM studio_chat_invites WHERE (user_id=? AND room_id IN(SELECT id FROM studio_chat_rooms WHERE owner_id=?)) OR (user_id=? AND room_id IN(SELECT id FROM studio_chat_rooms WHERE owner_id=?))',[$uid,$target,$target,$uid]);}else q('DELETE FROM studio_blocks WHERE blocker_id=? AND blocked_id=?',[$uid,$target]);flash($a==='block'?'Usuario bloqueado.':'Usuario desbloqueado.');go('profile',$uid);
 }
 if($a==='react'||$a==='report_post'){
  $target=(int)p('target');$post=studioPostVisible($target,$uid);if(!$post||$post['review_status']!=='approved')err('Publicación no disponible.');
  if($a==='react'){if(one('SELECT 1 FROM studio_reactions WHERE post_id=? AND user_id=?',[$target,$uid]))q('DELETE FROM studio_reactions WHERE post_id=? AND user_id=?',[$target,$uid]);else q('INSERT OR IGNORE INTO studio_reactions(post_id,user_id) VALUES(?,?)',[$target,$uid]);}
  else{rate('report:'.$uid,10,3600);q("INSERT OR IGNORE INTO studio_reports(reporter_id,target_type,target_id,reason) VALUES(?,'post',?,?)",[$uid,$target,clean(p('reason'),300,true)]);flash('Denuncia enviada a moderación.');}
  go($post['kind']==='wall'?'wall':'thread',$post['kind']==='reply'?(int)$post['parent_id']:(int)$post['id']);
 }
 if($a==='review_post'){needAdmin();$target=(int)p('target');$status=p('decision');if(!in_array($status,['approved','rejected'],true))err('Decisión inválida.');q("UPDATE studio_post_reviews SET status=? WHERE post_id=? AND status='pending'",[$status,$target]);go('admin');}
 if($a==='resolve_report'){
  needAdmin();$report=one("SELECT * FROM studio_reports WHERE id=? AND status='pending'",[(int)p('target')]);if(!$report)err('Denuncia no disponible.');
  if(p('decision')==='remove'){$table=$report['target_type']==='chat'?'studio_chat_messages':'studio_posts';q('DELETE FROM '.$table.' WHERE id=?',[$report['target_id']]);}
  q("UPDATE studio_reports SET status='closed' WHERE id=?",[$report['id']]);go('admin');
 }
}
function studioModerationCards(): string{
 $out=card('<h2>Moderación · primeras publicaciones</h2><p>Las primeras tres publicaciones de cada cuenta real requieren revisión.</p>');
 foreach(rows("SELECT p.*,u.display_name FROM studio_post_reviews r JOIN studio_posts p ON p.id=r.post_id JOIN studio_users u ON u.id=p.user_id WHERE r.status='pending' ORDER BY p.id LIMIT 100") as $r)$out.=card('<strong>'.h($r['display_name']).'</strong><p>'.h($r['title']).'</p><div class="body">'.h($r['body']).'</div>'.form('review_post',hidden('target',$r['id']).hidden('decision','approved'),'Aprobar').form('review_post',hidden('target',$r['id']).hidden('decision','rejected'),'Rechazar'));
 $out.=card('<h2>Denuncias pendientes</h2><p>Solo se muestran los mensajes privados denunciados; no se ofrece lectura general de salas privadas desde este panel.</p>');
 foreach(rows("SELECT * FROM studio_reports WHERE status='pending' ORDER BY id LIMIT 100") as $r){$msg=one('SELECT body FROM '.($r['target_type']==='chat'?'studio_chat_messages':'studio_posts').' WHERE id=?',[$r['target_id']]);$out.=card('<span class="pill">'.h($r['target_type']).'</span><p>'.h($r['reason']).'</p><div class="body">'.h($msg['body']??'Contenido eliminado').'</div>'.form('resolve_report',hidden('target',$r['id']).hidden('decision','remove'),'Eliminar contenido').form('resolve_report',hidden('target',$r['id']).hidden('decision','close'),'Cerrar denuncia'));}
 return $out;
}
function studioChatPage(): void{
 global $me;$uid=(int)$me['id'];$id=max(0,(int)g('id'));$general=one("SELECT id FROM studio_chat_rooms WHERE visibility='general'");if(!$id)$id=(int)$general['id'];$room=studioRoom($id,$uid);
 if(!$room){http_response_code(403);page('Chat',card('Sala no disponible. <a href="'.h(studioChatUrl()).'">Volver a General</a>'));}
 $s=hero('Studio Chat','Conversaciones entre miembros. Las salas privadas requieren invitación; no tienen cifrado de extremo a extremo.').'<div class="studio-chat-layout"><aside class="card"><h2>Salas</h2><a class="studio-room" href="'.h(studioChatUrl((int)$general['id'])).'"># General</a>';
 foreach(rows("SELECT r.* FROM studio_chat_rooms r JOIN studio_chat_members m ON m.room_id=r.id WHERE m.user_id=? AND r.visibility='private' ORDER BY r.id",[$uid]) as $r)if(studioRoom((int)$r['id'],$uid))$s.='<a class="studio-room" href="'.h(studioChatUrl((int)$r['id'])).'">🔒 '.h($r['title']).'</a>';
 $s.='<h3>Nueva sala privada</h3>'.form('chat_create',input('title','Nombre','','text','required maxlength="60"'),'Crear');
 foreach(rows("SELECT r.id,r.title,u.display_name FROM studio_chat_invites i JOIN studio_chat_rooms r ON r.id=i.room_id JOIN studio_users u ON u.id=r.owner_id WHERE i.user_id=?",[$uid]) as $i)$s.='<div class="card"><strong>'.h($i['title']).'</strong><p>Invitación de '.h($i['display_name']).'</p>'.form('chat_accept',hidden('room',$i['id']),'Aceptar').form('chat_decline',hidden('room',$i['id']),'Rechazar').'</div>';
 $s.='</aside><section class="card"><h2>'.h($room['title']).'</h2><p class="meta">'.($room['visibility']==='private'?'Sala privada':'Sala general · miembros registrados').'</p><div id="studio-chat-feed" class="studio-chat-feed" data-room="'.$id.'" data-endpoint="'.h(studioChatUrl()).'" aria-live="polite">Cargando mensajes…</div><div id="studio-chat-status" role="status"></div><div id="studio-chat-composer">'.form('chat_send',hidden('room',$id).area('body','Tu mensaje','',1000),'Enviar').'</div><details><summary>Denunciar un mensaje</summary>'.form('chat_report',hidden('room',$id).input('target','Número de mensaje','','number','min="1" required').input('reason','Motivo','','text','required maxlength="300"'),'Denunciar').'</details>';
 if($room['visibility']==='private'){
 if((int)$room['owner_id']===$uid){$s.='<details><summary>Administrar sala</summary>'.form('chat_invite',hidden('room',$id).input('alias','Usuario (alias exacto)','','text','required maxlength="32"'),'Invitar');
 foreach(rows("SELECT u.id,u.display_name FROM studio_chat_members m JOIN studio_users u ON u.id=m.user_id WHERE m.room_id=? AND u.id<>?",[$id,$uid])as $member)$s.='<p>'.h($member['display_name']).'</p>'.form('chat_remove',hidden('room',$id).hidden('target',$member['id']),'Quitar de la sala');
 $s.=form('chat_close',hidden('room',$id).check('confirm','Confirmo eliminar la sala y sus mensajes.'),'Cerrar sala').'</details>';
 }else $s.=form('chat_leave',hidden('room',$id),'Salir de la sala');
 }
 $s.='</section></div><script defer src="'.h(studioBase()).'assets/chat.js"></script>';page('Chat',$s);
}
