
(function(){
'use strict';
/* Contas criadas em qualquer aparelho: contador anônimo (Abacus) + e-mail ao responsável (FormSubmit). */
var NS='vferreiras-estoque99',OWNER='stok99.app@gmail.com',SINCE='19/10/2026',QUEUE='lojasg.estoque99.signup-queue';
var COUNTER='https://abacus.jasoncameron.dev';
function enabled(){var local=location.hostname==='localhost'||location.hostname==='127.0.0.1'||location.protocol==='file:';var flag='';try{flag=localStorage.getItem('lojasg.estoque99.stats')||''}catch(e){}if(flag==='off')return false;return !local||flag==='test'}
function monthKey(){var d=new Date();return 'contas-'+d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)}
function device(){var ua=navigator.userAgent||'';var os=/iP(hone|ad|od)/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)?'iPhone/iPad':/Android/i.test(ua)?'Android':/Windows/i.test(ua)?'Windows':/Mac OS/i.test(ua)?'Mac':/Linux/i.test(ua)?'Linux':'Outro';
  var br=/Edg\//.test(ua)?'Edge':/OPR\//.test(ua)?'Opera':/SamsungBrowser/.test(ua)?'Samsung Internet':/Firefox|FxiOS/.test(ua)?'Firefox':/CriOS|Chrome\//.test(ua)?'Chrome':/Safari/.test(ua)?'Safari':'outro navegador';
  var app=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;return os+' · '+br+(app?' (app instalado)':'')}
function readQueue(){try{var q=JSON.parse(localStorage.getItem(QUEUE)||'[]');return Array.isArray(q)?q.slice(0,20):[]}catch(e){return []}}
function writeQueue(q){try{if(q.length)localStorage.setItem(QUEUE,JSON.stringify(q));else localStorage.removeItem(QUEUE)}catch(e){}}
async function hit(key){var r=await fetch(COUNTER+'/hit/'+NS+'/'+key);if(!r.ok)throw Error('contador '+r.status);return (await r.json()).value}
async function send(item){
  if(!item.counted){var total=await hit('contas-criadas');try{await hit(item.month)}catch(e){}item.counted=true;item.total=total;writeQueue(readQueue().map(function(x){return x.id===item.id?item:x}))}
  var fields={'Estoque':item.store,'Login':item.login,'Tipo de conta':item.role,'Criada em':item.when,'Aparelho':item.device,
    _subject:'Estoque 99 · Nova conta: '+item.store,_template:'table',_captcha:'false'};fields['Total de contas (desde '+SINCE+')']=String(item.total||'?');
  /* v144: o mesmo texto formatado das mensagens vem primeiro no corpo (campos de antes continuam) */
  if(window.e99Msg){try{fields=Object.assign({'Mensagem':e99Msg.text({title:'Nova conta no Stok',subtitle:item.store,when:item.when,sections:[{title:'Conta',lines:['Login: '+item.login,'Tipo: '+item.role,'Aparelho: '+item.device,'Total de contas: '+String(item.total||'?')]}]},{plain:true})},fields)}catch(e){}}
  var r=await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(OWNER),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(fields)});
  if(!r.ok)throw Error('email '+r.status)}
var flushing=false;
async function flush(){if(flushing||!enabled()||navigator.onLine===false)return;flushing=true;try{var q=readQueue();for(var i=0;i<q.length;i++){try{await send(q[i]);q=readQueue().filter(function(x){return x.id!==q[i].id});writeQueue(q);i--}catch(e){break}}}finally{flushing=false}}
function pad(n){return ('0'+n).slice(-2)}
window.reportNewAccount=function(session){if(!enabled()||!session||!session.payload)return;var d=new Date();
  var item={id:Date.now()+'-'+Math.random().toString(36).slice(2,8),store:String(session.payload.store||'').slice(0,80),login:String(session.record&&session.record.login||'').slice(0,80),role:session.payload.role==='gestor'?'Site Gestor':'Estoque',
    when:pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes()),device:device(),month:monthKey(),counted:false};
  writeQueue(readQueue().concat([item]));flush()};
var saveBefore=authSaveNewAccount;
authSaveNewAccount=function(session){var r=saveBefore.apply(this,arguments);try{window.reportNewAccount(session)}catch(e){}return r};
/* Painel com o total (Minha conta e Administração). */
var cache=null;
async function load(){if(!enabled())return null;try{var g=async function(k){var r=await fetch(COUNTER+'/get/'+NS+'/'+k);if(r.status===404)return 0;if(!r.ok)throw Error(r.status);return (await r.json()).value};var t=await g('contas-criadas'),m=await g(monthKey());cache={total:t,month:m,at:Date.now()};return cache}catch(e){return null}}
function panelHTML(){var t=cache?cache.total:'…',m=cache?cache.month:'…';return '<div class="panel help" id="stats-panel"><h2>Contas criadas no site</h2><div class="stats-row"><div><b id="stats-total">'+t+'</b><span>no total, em todos os aparelhos</span></div><div><b id="stats-month">'+m+'</b><span>neste mês</span></div></div><p class="small">Contagem desde '+SINCE+'. A cada conta nova, o responsável pelo site recebe um e-mail com o estoque, o login e o aparelho.</p></div>'}
function refreshPanel(){var age=cache?Date.now()-cache.at:1e9;if(age<60000)return;load().then(function(c){var a=document.getElementById('stats-total'),b=document.getElementById('stats-month');if(a)a.textContent=c?c.total:'—';if(b)b.textContent=c?c.month:'—'})}
var accBefore=renderAccount;renderAccount=function(){setTimeout(refreshPanel,0);return accBefore.apply(this,arguments)+(enabled()?'<div class="grid2">'+panelHTML()+'</div>':'')};
var admBefore=renderAdmin;renderAdmin=function(){var h=admBefore.apply(this,arguments);if(!authSession||authSession.payload.role!=='gestor'||!enabled())return h;setTimeout(refreshPanel,0);return h+panelHTML()};
/* Aviso na tela de criar conta. */
var renderBefore=renderAuth;renderAuth=function(){renderBefore.apply(this,arguments);if(!enabled()||authMode!=='signup'||authPending||authRecoveryShow)return;var form=document.getElementById('auth-form');if(!form||form.querySelector('.signup-notice'))return;var p=document.createElement('p');p.className='signup-notice';p.textContent='Ao criar a conta, o nome do estoque, o login e o tipo de aparelho são enviados ao responsável pelo site. A senha e os cadastros não saem deste aparelho.';form.querySelector('.fields').appendChild(p)};
window.addEventListener('online',flush);setTimeout(flush,4000);
})();
