
(function(){
'use strict';
/* Relatório automático por e-mail (FormSubmit). Só roda com o site aberto e a conta aberta. */
var DEFAULT_TO='stok99.app@gmail.com',DEFAULT_CC='99.estoque@lojasg.com.br',DEFAULT_TIMES=['08:00','18:00'],WINDOW_MS=4*3600000;
function ccList(v){return String(v||'').split(/[,;\s]+/).map(function(x){return x.trim()}).filter(Boolean)}
var sending=false;
function cfgKey(){return 'lojasg.estoque99.email-reports:'+authSession.storeKey}
function sentKey(){return 'lojasg.estoque99.email-sent:'+authSession.storeKey}
function readJSON(k,def){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'?v:def}catch(e){return def}}
function writeJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function validEmail(v){return /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-z]{2,}$/i.test(String(v||''))}
function validTime(v){return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v||''))}
function getCfg(){var c=readJSON(cfgKey(),{});return {enabled:c.enabled===true,to:validEmail(c.to)?c.to:DEFAULT_TO,cc:typeof c.cc==='string'?ccList(c.cc).filter(validEmail).slice(0,5).join(', '):DEFAULT_CC,times:Array.isArray(c.times)?c.times.filter(validTime).slice(0,4):DEFAULT_TIMES.slice(),status:typeof c.status==='string'?c.status.slice(0,300):'',retryAt:Number(c.retryAt)||0,lastSent:Number(c.lastSent)||0}}
function setCfg(c){writeJSON(cfgKey(),c)}
function pad(n){return ('0'+n).slice(-2)}
function br(d){return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes())}
function buildFields(label){
 var today=iso(),store=authSession.payload.store,f={};
 var nfs=state.nfs.filter(function(n){return n.status!=='Conferido'}).sort(function(a,b){return (a.date||'').localeCompare(b.date||'')});
 var div=nfs.filter(function(n){return n.status==='Em divergência'});
 var acts=[];(state.plans||[]).filter(function(p){return p.date===today}).forEach(function(p){p.activities.forEach(function(a){acts.push({p:p,a:a})})});var pend=acts.filter(function(x){return !x.a.done}),doneA=acts.length-pend.length;
 f['Loja']=store;f['Gerado em']=br(new Date());
 f['Resumo']=nfs.length+' NFs a conferir · '+div.length+' em divergência · plano de hoje: '+doneA+' de '+acts.length+' atividades feitas';
 var used=0,LIMIT=80;
 function add(name,value){if(used>=LIMIT)return;var k=name,i=2;while(f[k]!==undefined)k=name+' ('+(i++)+')';f[k]=value;used++}
 nfs.forEach(function(n){add('NF '+n.number,(n.supplier||'—')+' · '+n.status+' · chegada '+date(n.date)+' · '+(n.volumes||0)+' vol.'+(n.status==='Em divergência'&&n.notes?' · '+n.notes:''))});
 pend.forEach(function(x){add('A fazer: '+x.a.title,(x.a.owner||'A definir')+' · '+x.p.title+(x.a.time?' · até '+x.a.time+(typeof actLate==='function'&&actLate(x.p,x.a)?' · ATRASADA':''):''))});
 var total=nfs.length+pend.length;
 if(total>used)f['Mais']=(total-used)+' itens não cabem no e-mail. Veja no site.';
 if(!total)f['Situação']='Nada pendente. Tudo em dia.';
 f._subject='Estoque 99 · Relatório '+label+' · '+store+' · '+date(today);f._template='table';f._captcha='false';
 /* v144: o mesmo texto formatado das mensagens (sem as marcas do WhatsApp) vem primeiro no corpo; os campos de antes continuam */
 if(window.e99Msg){try{var msg={title:'Relatório '+label,subtitle:store,sections:[{title:'Resumo',lines:[f['Resumo']]},
   {title:'Notas a conferir ('+nfs.length+')',lines:nfs.slice(0,40).map(function(n){return {b:'NF '+n.number,t:(n.supplier||'—')+' · '+n.status,sub:['Chegada '+date(n.date)+' · '+(n.volumes||0)+' vol.'+(n.status==='Em divergência'&&n.notes?' · '+n.notes:'')]}})},
   {title:'A fazer hoje ('+pend.length+')',lines:pend.slice(0,40).map(function(x){return {b:x.a.title,t:(x.a.owner||'A definir')+(x.a.time?' · até '+x.a.time+(typeof actLate==='function'&&actLate(x.p,x.a)?' · ATRASADA':''):''),sub:[x.p.title]}})}],
   note:total>80?'Há mais itens no Stok.':''};f=Object.assign({'Mensagem':e99Msg.text(msg,{plain:true})},f)}catch(e){}}
 return f}
async function post(to,fields){var r=await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(to),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(fields)});var data={};try{data=await r.json()}catch(e){}var ok=r.ok&&(data.success===true||data.success==='true');var msg=String(data.message||'');return {ok:ok,activation:/activat|confirm/i.test(msg),message:msg,status:r.status}}
async function sendNow(label,slotId){
 if(!authSession||sending)return false;sending=true;var c=getCfg();
 try{var fields=buildFields(label);if(c.cc)fields._cc=ccList(c.cc).filter(validEmail).join(',');var res=await post(c.to,fields);c=getCfg();
  if(res.ok){c.status='Último envio: '+br(new Date())+'.';c.lastSent=Date.now();c.retryAt=0;if(slotId){var sent=readJSON(sentKey(),{});sent[slotId]=Date.now();var cut=Date.now()-8*86400000;Object.keys(sent).forEach(function(k){if(sent[k]<cut)delete sent[k]});writeJSON(sentKey(),sent)}setCfg(c);return true}
  if(res.activation){c.status='Falta confirmar: abra o e-mail do FormSubmit em '+c.to+' e clique em “Activate Form”.';c.retryAt=Date.now()+30*60000}
  else{c.status='Não foi possível enviar ('+(res.message||('erro '+res.status))+'). Nova tentativa em 10 min.';c.retryAt=Date.now()+10*60000}
  setCfg(c);return false}
 catch(e){c=getCfg();c.status='Sem conexão para enviar. Nova tentativa em 5 min.';c.retryAt=Date.now()+5*60000;setCfg(c);return false}
 finally{sending=false;if(page==='alerts'&&typeof render==='function'&&!(typeof modal!=='undefined'&&modal.open))render()}}
function dueSlot(c,now){var d=new Date(now),today=iso();for(var i=0;i<c.times.length;i++){var t=c.times[i],h=+t.slice(0,2),m=+t.slice(3,5);var at=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m,0,0).getTime();if(now>=at&&now-at<WINDOW_MS){var id=today+' '+t,sent=readJSON(sentKey(),{});if(!sent[id])return {id:id,label:'das '+t.replace(':00','h').replace(':','h')}}}return null}
async function tick(){if(!authSession||sending)return;var c=getCfg();if(!c.enabled||Date.now()<c.retryAt)return;var slot=dueSlot(c,Date.now());if(!slot)return;
 var run=function(){var s2=dueSlot(getCfg(),Date.now());return s2?sendNow(s2.label,s2.id):false};
 if(navigator.locks&&navigator.locks.request)await navigator.locks.request('estoque99-email:'+authSession.storeKey,{ifAvailable:true},function(lock){return lock?run():null});else await run()}
window.emailReportTick=tick;
window.emailReportSave=function(ev){ev.preventDefault();if(!authSession)return;var v=readForm(ev.target);var to=String(v.to||'').trim();if(!validEmail(to)){notify('Confira o e-mail.');return}var cc=ccList(v.cc);if(cc.some(function(x){return !validEmail(x)})){notify('Confira os e-mails em Cópia para.');return}if(cc.length>5){notify('Use no máximo 5 e-mails em Cópia para.');return}var times=[v.t1,v.t2].filter(validTime);if(!times.length){notify('Escolha pelo menos um horário.');return}var c=getCfg();c.cc=cc.join(', ');var first=!c.enabled||c.to!==to;c.enabled=true;c.to=to;c.times=times;c.retryAt=0;if(first&&!c.lastSent)c.status='Ativado. No primeiro envio chega um e-mail do FormSubmit para confirmar.';setCfg(c);notify('Relatório automático ativado: '+times.join(' e ')+'.');render();tick()};
window.emailReportDisable=function(){if(!authSession)return;var c=getCfg();c.enabled=false;c.status='Desativado.';setCfg(c);notify('Relatório automático desativado.');render()};
window.emailReportTest=function(){if(!authSession)return;notify('Enviando relatório…');sendNow('de teste',null).then(function(ok){var c=getCfg();notify(ok?'Relatório enviado para '+c.to+(c.cc?' e '+c.cc:'')+'.':c.status)})};
window.emailPanelHTML=function(){if(!authSession)return '';var c=getCfg(),t=c.times.concat(['',''])
 ;return '<div class="panel help" id="email-panel"><h2>Relatório por e-mail</h2><form onsubmit="emailReportSave(event)"><div class="fields"><label>Enviar para<input type="email" name="to" required maxlength="200" autocomplete="email" value="'+esc(c.to)+'"></label><label>Cópia para<input type="text" name="cc" maxlength="400" autocomplete="off" spellcheck="false" placeholder="outro@email.com, mais@email.com" value="'+esc(c.cc)+'"></label><div class="pair"><label>Horário 1<input type="time" name="t1" value="'+esc(t[0]||'')+'"></label><label>Horário 2<input type="time" name="t2" value="'+esc(t[1]||'')+'"></label></div><button class="primary">'+(c.enabled?'Salvar':'Ativar envio automático')+'</button></div></form><p class="small email-status">'+(c.enabled?'Ativo: '+esc(c.times.join(' e '))+'. ':'Desativado. ')+esc(c.status)+'</p><div class="toolbar"><button type="button" onclick="emailReportTest()">Enviar teste agora</button>'+(c.enabled?'<button type="button" onclick="emailReportDisable()">Desativar</button>':'')+'</div><p class="small">Envia com o site aberto, mesmo minimizado.</p></div>'};
var alertsBefore=renderAlertsPage;
renderAlertsPage=function(){var html=alertsBefore.apply(this,arguments);return html+'<div class="grid2">'+window.emailPanelHTML()+(typeof isPhoneLayout==='function'&&!isPhoneLayout()?'<div class="panel help"><h2>Avisos com o site fechado</h2><p>Instale o app (ícone de instalar na barra do Chrome ou Edge) e ative “Iniciar ao fazer login” em chrome://apps ou edge://apps. Com “Manter conectado”, os avisos e e-mails seguem sem você abrir o site.</p></div>':'')+'</div>'};
setInterval(function(){if(!document.hidden)tick()},30000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)tick()});
window.addEventListener('online',tick);
var enterBefore=authEnter;authEnter=function(){var r=enterBefore.apply(this,arguments);setTimeout(tick,1500);return r};
})();
