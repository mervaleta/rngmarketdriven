(()=>{'use strict';
const $=id=>document.getElementById(id),key='studio-cross-preview-v01';
function update(){
 const h=document.querySelector('.studio-header[data-member]');if(!h)return;
 const signed=h.dataset.member==='1';let s={};if(!signed)try{s=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){}
 const now=new Date(),local=[now.getFullYear(),now.getMonth()+1,now.getDate()].join('-');
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const day=['year','month','day'].map(t=>parts.find(p=>p.type===t)?.value).join('-');
 const credits=$('headerCoins');if(credits&&!signed)credits.textContent=Number.isFinite(s.coins)?s.coins:100;
 const quiz=signed?h.dataset.quizDone!=='1':s.wordDaily?.date!==day||s.wordDaily?.results?.length!==7;
 const pack=signed?h.dataset.packDone!=='1':s.daily!==local;
 const invites=signed?Math.max(0,Number(h.dataset.invites)||0):0,count=Number(quiz)+Number(pack)+invites;
 const dot=$('studio-notif-dot');if(dot){dot.hidden=count===0;dot.textContent=count>9?'9+':String(count);dot.parentElement.setAttribute('aria-label','Notificaciones ('+count+' pendientes)')}
 for(const [id,visible] of [['studio-notif-quiz',quiz],['studio-notif-pack',pack],['studio-notif-invites',invites>0],['studio-notif-empty',count===0]]){const el=$(id);if(el)el.hidden=!visible;}
 const number=$('studio-notif-invite-count');if(number)number.textContent=String(invites);
}
update();window.addEventListener('storage',update);window.addEventListener('pageshow',update);
document.addEventListener('studio-progress',e=>{const h=document.querySelector('.studio-header[data-member]');if(h?.dataset.member==='1'&&e.detail){h.dataset.quizDone=e.detail.quizDone?'1':'0';h.dataset.packDone=e.detail.packDone?'1':'0';const c=$('headerCoins');if(c&&Number.isFinite(e.detail.coins))c.textContent=e.detail.coins}update()});
})();
