if(memberGame){
 let busy=false,clockOffset=0,memberClock=null,ready=false,retryAfter=0;
 const buttons=['daily','daily2','pack','quizStart'];for(const id of buttons)$(id).disabled=true;
 $('quizStart').textContent='Cargando desafío…';
 const intro=$('quizIntro');const note=intro.querySelector('.small');if(note)note.textContent='Una partida diaria por cuenta, validada por el servidor. Rareza definitiva después del cierre; con menos de 20 respuestas válidas se aplican 10 puntos por acierto.';
 function controls(){for(const id of ['daily','daily2'])$(id).disabled=!ready||busy||s.daily===s.date;$('pack').disabled=!ready||busy||s.coins<30;$('quizStart').disabled=!ready||busy;for(const el of $('quizForm').querySelectorAll('button,input'))el.disabled=busy||!ready}
 function memberShow(){
  if(initialView!=='home')return;const run=s.wordDaily,done=!!run&&run.position>=7;
  $('quizIntro').hidden=!!run;$('quizPlay').hidden=!run||done;$('quizDone').hidden=!done;
  $('quizStart').textContent='Empezar desafío';$('quizDate').textContent=dateFormat.format(new Date(s.date+'T00:00:00Z'));
  if(!run)return;
  const dots=$('quizDots');dots.replaceChildren();for(let i=0;i<7;i++){const dot=document.createElement('span');dot.className='quiz-dot'+(i<run.results.length?(run.results[i].ok?' right':' wrong'):(i===run.position?' current':''));dot.textContent=i+1;dots.append(dot)}
  if(done){const wins=run.results.filter(r=>r.ok).length;$('quizScore').textContent=wins+' de 7 correctas';$('quizReward').textContent='Ganaste '+wins*10+' créditos y '+wins*5+' XP. Rareza definitiva al cierre de la edición.';const review=$('quizReview');review.replaceChildren();for(const r of run.results){const item=document.createElement('div');item.className='quiz-review';const title=document.createElement('strong');title.textContent=(r.ok?'✓ ':'✗ ')+r.prompt;const a=document.createElement('p');a.textContent=r.ok?'Respuesta aceptada: '+r.answer:r.reason==='time'?'Tiempo agotado':r.reason==='skip'?'Pasaste la consigna':'Respuesta no incluida en el catálogo';const ex=document.createElement('p');ex.className='small';ex.textContent='Ejemplos: '+r.examples.join(', ');item.append(title,a,ex);review.append(item)}return;}
  $('quizStep').textContent='Consigna '+(run.position+1)+' / 7';$('quizPrompt').textContent=run.prompt;const last=run.results.at(-1);$('quizFeedback').textContent=last?(last.ok?'Correcta · +10 créditos, +5 XP':last.reason==='time'?'Tiempo agotado':last.reason==='skip'?'Consigna pasada':'Respuesta no incluida en el catálogo'):'';
  $('quizAnswer').value='';$('quizAnswer').focus();memberTick();
 }
 async function request(action,extra={}){
  if(busy)return;busy=true;controls();try{
   const data=new URLSearchParams({action,csrf:memberGame.csrf,...extra});
   const r=await fetch(memberGame.url,{method:'POST',body:data,credentials:'same-origin',cache:'no-store'});const result=await r.json();if(!r.ok||!result.state)throw Error(result.error||'No se pudo actualizar la cuenta.');
   const prevPosition=s.wordDaily?.position;const draft=$('quizAnswer').value;s=result.state;clockOffset=s.serverNow-Date.now();ready=true;render();memberShow();if(action==='pack'&&prevPosition===s.wordDaily?.position)$('quizAnswer').value=draft;if(result.draw){const i=result.draw.sticker;reveal(catalog[i][0],result.draw.duplicate?'Fichu repetida':catalog[i][1],result.draw.duplicate?catalog[i][1]+' · +12 créditos':catalog[i][2]+' · +10 XP · Agregada a tu álbum')}
   const retry=$('member-retry');if(retry)retry.hidden=true;if(s.lastScore&&initialView==='home'){let last=document.getElementById('last-official-score');if(!last){last=document.createElement('p');last.id='last-official-score';last.className='small';$('daily-challenge').append(last)}last.textContent='Último resultado cerrado ('+s.lastScore.day+'): '+s.lastScore.score+' puntos de rareza.'}
  }catch(e){retryAfter=Date.now()+2500;toast(e.message||'No se pudo conectar al juego.');if(!ready){const retry=$('member-retry');if(retry)retry.hidden=false;$('quizStart').textContent='Reintentar conexión';$('quizStart').disabled=false;}}finally{busy=false;controls();if(!ready)$('quizStart').disabled=false}
 }
 function memberTick(){if(!ready||!s.wordDaily||s.wordDaily.position>=7)return;const remain=s.wordDaily.deadline-(Date.now()+clockOffset);$('quizClock').textContent=Math.max(0,Math.ceil(remain/1000))+' s';$('quizTimeBar').style.width=Math.max(0,Math.min(100,remain/300))+'%';if(remain<=0&&!busy&&Date.now()>=retryAfter)request('state')}
 $('quizStart').onclick=()=>request(ready?'quiz_start':'state');
 $('quizForm').onsubmit=e=>{e.preventDefault();const answer=$('quizAnswer').value.trim();if(answer&&s.wordDaily)request('quiz_answer',{answer,day:s.date,position:String(s.wordDaily.position)})};
 $('quizSkip').onclick=()=>{if(s.wordDaily)request('quiz_answer',{skip:'yes',day:s.date,position:String(s.wordDaily.position)})};
 $('daily').onclick=()=>request('pack',{free:'yes'});$('daily2').onclick=()=>request('pack',{free:'yes'});$('pack').onclick=()=>request('pack',{free:'no'});
 $('member-retry')?.addEventListener('click',()=>request('state'));request('state');if(initialView==='home'){memberClock=setInterval(memberTick,200);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy)request('state')})}
}
