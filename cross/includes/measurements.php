<?php
// Optional, private measurements. Never join these records into public profiles.
function studioMeasureFields(): array {
 return ['bust'=>['Pecho / busto',50,200],'waist'=>['Cintura',40,200],'hip'=>['Cadera',50,220],'foot'=>['Largo del pie',18,36],'foot_width'=>['Ancho del pie',5,17],'shoulder'=>['Ancho de hombros',20,75],'underbust'=>['Contorno bajo busto',45,190],'height'=>['Altura',100,230],'inseam'=>['Entrepierna',35,120]];
}
function studioMeasureKey(array $cfg): string{return hash_hkdf('sha256',$cfg['setup_key'],32,'studio-private-measurements-v1');}
function studioMeasureEncode(array $values,array $cfg,int $uid): string {
 if(!function_exists('openssl_encrypt'))throw new RuntimeException('Cifrado no disponible');
 $iv=random_bytes(12);$tag='';$plain=json_encode($values,JSON_THROW_ON_ERROR);
 $cipher=openssl_encrypt($plain,'aes-256-gcm',studioMeasureKey($cfg),OPENSSL_RAW_DATA,$iv,$tag,'studio-measures:'.$uid,16);
 if($cipher===false||strlen($tag)!==16)throw new RuntimeException('Cifrado no disponible');
 return base64_encode($iv.$tag.$cipher);
}
function studioMeasureDecode(string $encoded,array $cfg,int $uid): array {
 $raw=base64_decode($encoded,true);if($raw===false||strlen($raw)<29||!function_exists('openssl_decrypt'))throw new RuntimeException('Medidas no disponibles');
 $plain=openssl_decrypt(substr($raw,28),'aes-256-gcm',studioMeasureKey($cfg),OPENSSL_RAW_DATA,substr($raw,0,12),substr($raw,12,16),'studio-measures:'.$uid);
 if($plain===false)throw new RuntimeException('Medidas no disponibles');
 $values=json_decode($plain,true,512,JSON_THROW_ON_ERROR);if(!is_array($values))throw new RuntimeException('Medidas no disponibles');return $values;
}
function studioReadMeasures(PDO $pdo,array $cfg,int $uid): array {
 $s=$pdo->prepare('SELECT sealed FROM studio_measurements WHERE user_id=?');$s->execute([$uid]);$v=$s->fetchColumn();return $v===false?[]:studioMeasureDecode($v,$cfg,$uid);
}
function studioOwnMeasures(): array {
 $member=studioCurrentMember();if(!$member)return [];
 try{$private=dirname(__DIR__).'/private';$cfg=require $private.'/config.php';$file=$private.'/studio-'.hash_hmac('sha256','studio-db-v1',$cfg['setup_key']).'.sqlite3';if(!is_file($file))return [];$pdo=new PDO('sqlite:'.$file,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);$pdo->exec('PRAGMA query_only=ON');return studioReadMeasures($pdo,$cfg,(int)$member['id']);}catch(Throwable $e){return [];}
}
function studioMeasureCard(): string {
 global $db,$cfg,$me;
 try{$values=studioReadMeasures($db,$cfg,(int)$me['id']);}catch(Throwable $e){return card('<h2>Mis medidas</h2><p>No se pudieron leer tus medidas. Podés eliminarlas y volver a guardarlas.</p>'.form('measure_clear','','Eliminar medidas'));}
 $fields='<div class="grid">';
 foreach(studioMeasureFields() as $k=>[$label,$min,$max])$fields.=input($k,$label.' (cm)',$values[$k]??'','number','min="'.$min.'" max="'.$max.'" step="0.1" autocomplete="off"');
 $fields.='</div>'.check('measure_consent','Quiero guardar estas medidas para recibir sugerencias de talles.',!empty($values));
 return '<div id="mis-medidas">'.card('<div class="eyebrow">Solo vos</div><h2>Mi ficha de medidas</h2><p>Opcional y separada de tu perfil visible. Guardamos estos datos cifrados para recomendar talles según el comercio. No se publican ni se incluyen en enlaces de compra. Podés editarlos o eliminarlos cuando quieras.</p>'.form('measure_save',$fields,'Guardar mis medidas').'<p><a class="btn alt" href="'.h(studioBase()).'recursos/talles/index.php">Comparar mis talles</a></p>'.form('measure_clear','','Eliminar todas mis medidas')).'</div>';
}
function studioMeasureAction(string $a): bool {
 global $db,$cfg,$me;
 if(!in_array($a,['measure_save','measure_clear'],true))return false;needUser();$uid=(int)$me['id'];
 if($a==='measure_clear'){q('DELETE FROM studio_measurements WHERE user_id=?',[$uid]);flash('Medidas eliminadas.');go('profile',$uid);}
 if(p('measure_consent')!=='yes')err('Confirmá que querés guardar las medidas privadas.');
 $values=[];foreach(studioMeasureFields() as $k=>[$label,$min,$max]){$v=trim(p($k));if($v==='')continue;if(!preg_match('/^[0-9]{1,3}(?:[.,][0-9]{1,2})?$/D',$v))err('Revisá la medida: '.$label);$n=(float)str_replace(',','.',$v);if($n<$min||$n>$max)err('Revisá la medida: '.$label);$values[$k]=round($n,1);}
 if(!$values)err('Ingresá al menos una medida o elegí eliminar.');
 $sealed=studioMeasureEncode($values,$cfg,$uid);q('INSERT INTO studio_measurements(user_id,sealed,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET sealed=excluded.sealed,updated_at=CURRENT_TIMESTAMP',[$uid,$sealed]);
 flash('Medidas privadas guardadas.');go('profile',$uid);return true;
}
