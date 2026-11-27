<?php
// Server-authoritative member game, isolated from the guest browser demo.
function studioGameSchema(PDO $db): void{
 $ddl=[
 "CREATE TABLE IF NOT EXISTS studio_game_wallet(user_id INTEGER PRIMARY KEY,credits INTEGER NOT NULL DEFAULT 100 CHECK(credits>=0),xp INTEGER NOT NULL DEFAULT 0 CHECK(xp>=0),FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_game_stickers(user_id INTEGER NOT NULL,sticker INTEGER NOT NULL CHECK(sticker BETWEEN 0 AND 11),PRIMARY KEY(user_id,sticker),FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_game_packs(user_id INTEGER NOT NULL,day TEXT NOT NULL,PRIMARY KEY(user_id,day),FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_quiz_editions(day TEXT PRIMARY KEY,bank TEXT NOT NULL,closes_at INTEGER NOT NULL)",
 "CREATE TABLE IF NOT EXISTS studio_quiz_attempts(user_id INTEGER NOT NULL,day TEXT NOT NULL,position INTEGER NOT NULL DEFAULT 0,deadline INTEGER NOT NULL,PRIMARY KEY(user_id,day),FOREIGN KEY(user_id) REFERENCES studio_users(id) ON DELETE CASCADE,FOREIGN KEY(day) REFERENCES studio_quiz_editions(day))",
 "CREATE TABLE IF NOT EXISTS studio_quiz_answers(user_id INTEGER NOT NULL,day TEXT NOT NULL,position INTEGER NOT NULL,answer_group INTEGER NULL,reason TEXT NOT NULL,PRIMARY KEY(user_id,day,position),FOREIGN KEY(user_id,day) REFERENCES studio_quiz_attempts(user_id,day) ON DELETE CASCADE)",
 "CREATE TABLE IF NOT EXISTS studio_quiz_final(day TEXT PRIMARY KEY,finalized_at INTEGER NOT NULL,FOREIGN KEY(day) REFERENCES studio_quiz_editions(day))",
 "CREATE TABLE IF NOT EXISTS studio_quiz_scores(user_id INTEGER NOT NULL,day TEXT NOT NULL,score INTEGER NOT NULL,PRIMARY KEY(user_id,day),FOREIGN KEY(user_id,day) REFERENCES studio_quiz_attempts(user_id,day) ON DELETE CASCADE)",
 "CREATE INDEX IF NOT EXISTS studio_quiz_answer_counts ON studio_quiz_answers(day,position,answer_group)"
 ];foreach($ddl as $sql)$db->exec($sql);
}
function studioDay(): string{return (new DateTimeImmutable('now',new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');}
function studioQuizBank(string $day): array{
 $e=one('SELECT bank,closes_at FROM studio_quiz_editions WHERE day=?',[$day]);if(!$e)return [];
 return json_decode($e['bank'],true,512,JSON_THROW_ON_ERROR);
}
function studioQuizEdition(string $day): array{
 $existing=studioQuizBank($day);if($existing)return $existing;
 $bank=json_decode((string)file_get_contents(__DIR__.'/word-bank.json'),true,512,JSON_THROW_ON_ERROR);if(count($bank)<7)throw new RuntimeException('Catálogo insuficiente');
 // Deterministic ordering equivalent for all members; snapshot preserves edits.
 usort($bank,fn($a,$b)=>strcmp(hash('sha256',$day.':'.$a['id']),hash('sha256',$day.':'.$b['id'])));
 $bank=array_slice($bank,0,7);$close=(new DateTimeImmutable($day.' 00:00:00',new DateTimeZone('America/Argentina/Buenos_Aires')))->modify('+1 day')->getTimestamp();
 q('INSERT OR IGNORE INTO studio_quiz_editions(day,bank,closes_at) VALUES(?,?,?)',[$day,json_encode($bank,JSON_THROW_ON_ERROR),$close]);return studioQuizBank($day);
}
function studioQuizNorm(string $v): string{
 $v=strtr(trim($v),['Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u','Ü'=>'u','Ñ'=>'n','á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n','à'=>'a','è'=>'e','ì'=>'i','ò'=>'o','ù'=>'u','â'=>'a','ê'=>'e','î'=>'i','ô'=>'o','û'=>'u','ä'=>'a','ë'=>'e','ï'=>'i','ö'=>'o','À'=>'a','È'=>'e','Ì'=>'i','Ò'=>'o','Ù'=>'u','Â'=>'a','Ê'=>'e','Î'=>'i','Ô'=>'o','Û'=>'u','Ä'=>'a','Ë'=>'e','Ï'=>'i','Ö'=>'o']);
 $v=preg_replace('/\p{M}+/u','',$v)??'';return trim(preg_replace('/[^a-z0-9]+/',' ',strtolower($v))??'');
}
function studioGameWallet(int $uid): array{
 $r=one('SELECT credits,xp FROM studio_game_wallet WHERE user_id=?',[$uid]);return $r?['coins'=>(int)$r['credits'],'xp'=>(int)$r['xp']]:['coins'=>100,'xp'=>0];
}
function studioWalletEnsure(int $uid): void{q('INSERT OR IGNORE INTO studio_game_wallet(user_id) VALUES(?)',[$uid]);}
function studioQuizAdvance(int $uid,string $day): ?array{
 $a=one('SELECT * FROM studio_quiz_attempts WHERE user_id=? AND day=?',[$uid,$day]);if(!$a)return null;
 $now=time();$pos=(int)$a['position'];$deadline=(int)$a['deadline'];
 while($pos<7&&$now>=$deadline){q("INSERT OR IGNORE INTO studio_quiz_answers(user_id,day,position,reason) VALUES(?,?,?,'time')",[$uid,$day,$pos]);$pos++;$deadline+=30;}
 if($pos!==(int)$a['position'])q('UPDATE studio_quiz_attempts SET position=?,deadline=? WHERE user_id=? AND day=?',[$pos,$deadline,$uid,$day]);
 $a['position']=$pos;$a['deadline']=$deadline;return $a;
}
function studioQuizFinalize(): void{
 $now=time();
 foreach(rows("SELECT day FROM studio_quiz_editions WHERE closes_at<=? AND day NOT IN(SELECT day FROM studio_quiz_final) ORDER BY day LIMIT 10",[$now]) as $e){
  $day=$e['day'];
  // Only completed seven-answer attempts count. Suspended and demo accounts excluded.
  q("INSERT OR IGNORE INTO studio_quiz_scores(user_id,day,score)
  SELECT a.user_id,a.day,COALESCE(SUM(CASE WHEN a.answer_group IS NULL THEN 0 WHEN (SELECT COUNT(*) FROM studio_quiz_answers z JOIN studio_quiz_attempts za ON za.user_id=z.user_id AND za.day=z.day JOIN studio_users zu ON zu.id=z.user_id WHERE z.day=a.day AND z.position=a.position AND z.answer_group IS NOT NULL AND za.position=7 AND zu.active=1 AND z.user_id NOT IN(SELECT user_id FROM studio_demo_bots))<20 THEN 10 ELSE MAX(1,CAST(ROUND(100.0/(SELECT COUNT(*) FROM studio_quiz_answers z JOIN studio_quiz_attempts za ON za.user_id=z.user_id AND za.day=z.day JOIN studio_users zu ON zu.id=z.user_id WHERE z.day=a.day AND z.position=a.position AND z.answer_group=a.answer_group AND za.position=7 AND zu.active=1 AND z.user_id NOT IN(SELECT user_id FROM studio_demo_bots))) AS INTEGER)) END),0)
  FROM studio_quiz_answers a JOIN studio_quiz_attempts t ON t.user_id=a.user_id AND t.day=a.day JOIN studio_users u ON u.id=a.user_id WHERE a.day=? AND t.position=7 AND u.active=1 AND a.user_id NOT IN(SELECT user_id FROM studio_demo_bots) GROUP BY a.user_id,a.day",[$day]);
  q('INSERT OR IGNORE INTO studio_quiz_final(day,finalized_at) VALUES(?,?)',[$day,$now]);
 }
}
function studioGameState(int $uid,string $day): array{
 $wallet=studioGameWallet($uid);$owned=array_map('intval',array_column(rows('SELECT sticker FROM studio_game_stickers WHERE user_id=? ORDER BY sticker',[$uid]),'sticker'));
 $a=studioQuizAdvance($uid,$day);$run=null;
 if($a){$bank=studioQuizBank($day);$pos=(int)$a['position'];$results=[];
 foreach(rows('SELECT position,answer_group,reason FROM studio_quiz_answers WHERE user_id=? AND day=? ORDER BY position',[$uid,$day]) as $r){$q=$bank[(int)$r['position']];$ok=$r['answer_group']!==null;$row=['ok'=>$ok,'reason'=>$r['reason']];if($pos>=7)$row+=['prompt'=>$q['prompt'],'answer'=>$ok?$q['answers'][(int)$r['answer_group']][0]:'','examples'=>array_map(fn($g)=>$g[0],array_slice($q['answers'],0,6))];$results[]=$row;}
 $run=['date'=>$day,'position'=>$pos,'deadline'=>(int)$a['deadline']*1000,'results'=>$results,'prompt'=>$pos<7?$bank[$pos]['prompt']:null];
 }
 $previous=one('SELECT day,score FROM studio_quiz_scores WHERE user_id=? ORDER BY day DESC LIMIT 1',[$uid]);
 return $wallet+['owned'=>$owned,'daily'=>one('SELECT 1 FROM studio_game_packs WHERE user_id=? AND day=?',[$uid,$day])?$day:'','wordDaily'=>$run,'date'=>$day,'serverNow'=>time()*1000,'lastScore'=>$previous];
}
function studioGameApi(): void{
 global $db,$me;if(!$me||!empty($me['is_bot']))studioJson(['error'=>'Iniciá sesión'],401);
 if($_SERVER['REQUEST_METHOD']!=='POST')studioJson(['error'=>'Método no permitido'],405);
 if(!hash_equals($_SESSION['csrf'],p('csrf')))studioJson(['error'=>'Sesión vencida. Recargá la página.'],403);
 $uid=(int)$me['id'];$day=studioDay();$action=p('action');$draw=null;
 try{
 rate('game:'.$uid,120,60);$db->exec('BEGIN IMMEDIATE');
 try{
 studioWalletEnsure($uid);studioQuizFinalize();
 if($action==='quiz_start'){
  $bank=studioQuizEdition($day);$close=(int)one('SELECT closes_at FROM studio_quiz_editions WHERE day=?',[$day])['closes_at'];
  if($close-time()<210&&!one('SELECT 1 FROM studio_quiz_attempts WHERE user_id=? AND day=?',[$uid,$day]))err('La edición cierra en unos minutos. Volvé después de medianoche.');
  q('INSERT OR IGNORE INTO studio_quiz_attempts(user_id,day,deadline) VALUES(?,?,?)',[$uid,$day,time()+30]);
 }elseif($action==='quiz_answer'){
  $a=studioQuizAdvance($uid,$day);if(!$a)err('Primero iniciá el desafío.');
  $pos=(int)$a['position'];$requested=(int)p('position');
  if(p('day')===$day&&$requested===$pos&&$pos<7){
   $bank=studioQuizBank($day);$g=null;$reason='skip';
   if(p('skip')!=='yes'){$raw=clean(p('answer'),100,true);$norm=studioQuizNorm($raw);$reason='answer';if($norm!=='')foreach($bank[$pos]['answers'] as $i=>$aliases){foreach($aliases as $alias)if(studioQuizNorm($alias)===$norm){$g=$i;break 2;}}}
   if(time()>=(int)$a['deadline']){$g=null;$reason='time';}
   q('INSERT INTO studio_quiz_answers(user_id,day,position,answer_group,reason) VALUES(?,?,?,?,?)',[$uid,$day,$pos,$g,$reason]);
   q('UPDATE studio_quiz_attempts SET position=?,deadline=? WHERE user_id=? AND day=?',[$pos+1,time()+30,$uid,$day]);if($g!==null)q('UPDATE studio_game_wallet SET credits=credits+10,xp=xp+5 WHERE user_id=?',[$uid]);
  }
 }elseif($action==='pack'){
  $free=p('free')==='yes';if($free){if(one('SELECT 1 FROM studio_game_packs WHERE user_id=? AND day=?',[$uid,$day]))err('Ya abriste el sobre diario.');q('INSERT INTO studio_game_packs(user_id,day) VALUES(?,?)',[$uid,$day]);}
  else{if(studioGameWallet($uid)['coins']<30)err('No tenés suficientes créditos.');q('UPDATE studio_game_wallet SET credits=credits-30 WHERE user_id=?',[$uid]);}
  $weights=[12,12,5,12,12,12,12,5,12,2,5,2];$pick=random_int(1,array_sum($weights));$i=0;while($pick>$weights[$i]){$pick-=$weights[$i];$i++;}
  $duplicate=(bool)one('SELECT 1 FROM studio_game_stickers WHERE user_id=? AND sticker=?',[$uid,$i]);if($duplicate)q('UPDATE studio_game_wallet SET credits=credits+12 WHERE user_id=?',[$uid]);else{q('INSERT INTO studio_game_stickers(user_id,sticker) VALUES(?,?)',[$uid,$i]);q('UPDATE studio_game_wallet SET xp=xp+10 WHERE user_id=?',[$uid]);}
  $draw=['sticker'=>$i,'duplicate'=>$duplicate];
 }elseif($action!=='state')err('Acción desconocida.');
 $state=studioGameState($uid,$day);$db->exec('COMMIT');
 }catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}
 studioJson(['state'=>$state,'draw'=>$draw]);
 }catch(DomainException $e){studioJson(['error'=>$e->getMessage()],400);}catch(Throwable $e){studioJson(['error'=>'No se pudo actualizar el juego.'],503);}
}
