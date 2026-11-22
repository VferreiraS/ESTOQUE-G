/* v158 (pedido do dono): "Quero que o relatório seja enviado para todas as contas que sejam criadas no app."
   O "Relatório por e-mail" (Alertas) e o resumo semanal (v134) continuam indo para o destino configurado (padrão stok99.app@gmail.com + cópia)
   e agora vão também para o e-mail de cada conta do app:
   - de onde vem cada e-mail: (1) a própria conta do gestor (authSession.payload.email, cifrado na conta);
     (2) as contas que o gestor criou por link de acesso (aux-invites:, guardado no estado cifrado da conta desde a v111), com o papel do link;
     o papel é conferido com membros/ da nuvem (e99CloudMembers, pelo inviteId): se a nuvem diz auxiliar, vale auxiliar.
     membros/, perfis_* e state.team não guardam e-mail, por isso não entram. Conta criada depois entra sozinha (a lista é lida a cada envio).
   - um envio por destinatário (uma requisição FormSubmit por e-mail, sem _cc), intervalo curto entre envios, até 30 por rodada;
     falha em um não impede os outros. Duplicados (e os iguais ao destino/cópia) e e-mails inválidos ficam de fora.
   - gestor/estoque recebem o relatório completo; auxiliar recebe a versão sem valores e sem o que ele não vê no app (Painel: valores,
     conferências por câmera, corredores), regra da v134. Texto organizado pelo e99Msg (v144/v153).
   - quando: mesmo gatilho de hoje (relatório automático ativado, nos horários; resumo semanal de segunda); só o aparelho do gestor envia;
     marcador por conta e rodada (lojasg.estoque99.rep-sent:<conta>:<rodada>) impede repetir.
   - localhost: só envia com a chave de teste (e99-test-allmail = 1); o teste intercepta o FormSubmit. */
(function(){'use strict';var W=window,D=document;
var DEFAULT_TO='stok99.app@gmail.com',DEFAULT_CC='99.estoque@lojasg.com.br',WINDOW_MS=4*3600000,LIMIT=30,MK='lojasg.estoque99.rep-sent:';
function role(){return authSession&&authSession.payload?authSession.payload.role:''}
function norm(m){return String(m==null?'':m).replace(/\s+/g,'').toLowerCase()}
function okMail(v){return /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]{1,190}\.[a-z]{2,}$/i.test(String(v||''))}
function ccList(v){return String(v||'').split(/[,;\s]+/).map(norm).filter(Boolean)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}
function rj(k,d){try{var v=JSON.parse(ls(k)||'null');return v&&typeof v==='object'?v:d}catch(e){return d}}
function local(){return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)||location.protocol==='file:'}
function allowed(){return !local()||ls('e99-test-allmail')==='1'}
function gap(){return local()?120:1500}
function two(n){return ('0'+n).slice(-2)}
function brTime(ms){var d=new Date(ms);return two(d.getDate())+'/'+two(d.getMonth()+1)+'/'+d.getFullYear()+' '+two(d.getHours())+':'+two(d.getMinutes())}
function mailCfg(){var c=rj('lojasg.estoque99.email-reports:'+authSession.storeKey,{});return {enabled:c.enabled===true,to:okMail(c.to)?norm(c.to):DEFAULT_TO,cc:typeof c.cc==='string'?ccList(c.cc).filter(okMail):[DEFAULT_CC],times:Array.isArray(c.times)?c.times.filter(function(t){return /^([01]\d|2[0-3]):[0-5]\d$/.test(t)}).slice(0,4):['08:00','18:00']}}
function pk(){return 'lojasg.estoque99.allmail:'+authSession.storeKey}
function pref(){var v=rj(pk(),{});return {off:v.off===true,status:typeof v.status==='string'?v.status.slice(0,300):'',retry:v.retry&&typeof v.retry==='object'?v.retry:{}}}
function setPref(p){ls(pk(),JSON.stringify(p))}
function mask(m){m=norm(m);var i=m.indexOf('@');return i<1?'***':m.charAt(0)+'***'+m.slice(i)}

/* ===== destinatários ===== */
function invites(){var l=rj('lojasg.estoque99.aux-invites:'+authSession.storeKey,[]);return Array.isArray(l)?l:[]}
function cloudRole(x){try{var ms=W.e99CloudMembers?W.e99CloudMembers():[];for(var i=0;i<ms.length;i++){var m=ms[i];if(m&&((x.inviteId&&m.inviteId===x.inviteId)||(x.login&&authLoginName(String(m.login||''))===authLoginName(String(x.login||'')))))return String(m.role||'')}}catch(e){}return ''}
function recipients(){var out=[],seen={},info={dup:0,bad:0,skip:0};if(!authSession||!authSession.payload)return {list:out,info:info};
  var c=mailCfg(),main={};[c.to].concat(c.cc).forEach(function(m){main[norm(m)]=1});
  function add(email,id,name,papel,src){var m=norm(email);if(!m)return;if(!okMail(m)||m.length>120){info.bad++;return}if(seen[m]){info.dup++;return}seen[m]=1;if(main[m]){info.skip++;return}
    out.push({email:m,id:authLoginName(String(id||m)).replace(/[^a-z0-9._ -]/g,'').slice(0,60)||m,name:String(name||'').slice(0,40),papel:papel,src:src})}
  var me=authSession.payload,r=role();add(me.email,authSession.record.login,'Você',r==='auxiliar'?'auxiliar':r==='gestor'?'gestor':'estoque','sua conta');
  invites().forEach(function(x){if(!x||x.revoked||!x.email)return;var p=x.papel==='estoque'?'estoque':'auxiliar',cr=cloudRole(x);if(cr==='auxiliar')p='auxiliar';add(x.email,x.login||x.name,x.name||x.login,p,'link de acesso')});
  return {list:out,info:info}}

/* ===== conteúdo por papel ===== */
function auxDaily(f){var g={};Object.keys(f).forEach(function(k){var v=String(f[k]);if(/valor|R\$/i.test(k)||/R\$\s*\d/.test(v))return;g[k]=f[k]});return g}
function weekAux(d){var x=Object.assign({},d,{withVal:0,val:0,confs:[],cor:[]}),f=W.e99Week.fields(x);
  ['Valor das notas','Conferências por câmera','Corredores sem responsável','Mais detalhes'].forEach(function(k){delete f[k]});
  if(W.e99Msg){try{var p=W.e99Week.payload(x);p.sections=p.sections.filter(function(s){return !/^(Conferências|Corredores)/.test(s.title)});p.note='Detalhes no Stok.';f['Mensagem']=W.e99Msg.text(p,{plain:true})}catch(e){}}
  Object.keys(f).forEach(function(k){if(/R\$\s*\d/.test(String(f[k])))delete f[k]});return f}
function builder(kind,label){var cache={};return function(papel){var a=papel==='auxiliar'?'aux':'full';if(cache[a])return cache[a];var f;
  if(kind==='semana'){var d=W.e99Week.data(addDaysK(W.e99Week.monday(iso()),-7));f=a==='aux'?weekAux(d):W.e99Week.fields(d)}
  else{f=W.emailReportFields(label);if(a==='aux')f=auxDaily(f)}
  delete f._cc;return cache[a]=f}}
function addDaysK(k,n){var d=new Date(k+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}

/* ===== envio ===== */
async function post(to,fields){var r=await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(to),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(fields)}),j={};try{j=await r.json()}catch(e){}
  return {ok:r.ok&&(j.success===true||j.success==='true'),activation:/activat|confirm/i.test(String(j.message||'')),msg:String(j.message||'')}}
function mkKey(id,round){return MK+id+':'+round}
function marked(id,round){return !!ls(mkKey(id,round))}
function clean(){try{var cut=iso(new Date(Date.now()-9*86400000)),rm=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(MK)===0){var m=/(\d{4}-\d{2}-\d{2})/.exec(k.slice(MK.length));if(m&&m[1]<cut)rm.push(k)}}rm.forEach(function(k){ls(k,null)})}catch(e){}}
var busy=false;
async function fanout(kind,label,round){if(!authSession||role()!=='gestor'||busy)return null;if(!allowed())return null;busy=true;var s=authSession,res={sent:0,fail:0,act:0,total:0};
  try{var list=recipients().list.filter(function(r){return !round||!marked(r.id,round)}).slice(0,LIMIT),build=builder(kind,label);res.total=list.length;
    for(var i=0;i<list.length;i++){if(authSession!==s)break;if(i)await new Promise(function(r){setTimeout(r,gap())});var r=list[i];
      try{var x=await post(r.email,build(r.papel));if(x.ok){res.sent++;if(round)ls(mkKey(r.id,round),String(Date.now()))}else if(x.activation){res.act++;if(round)ls(mkKey(r.id,round),'a')}else res.fail++}catch(e){res.fail++}}
    if(authSession===s){var p=pref();p.status=(kind==='semana'?'Resumo da semana':'Relatório')+' para as contas em '+brTime(Date.now())+': '+res.sent+' enviado(s)'+(res.act?', '+res.act+' aguardando a ativação do e-mail':'')+(res.fail?', '+res.fail+' falharam (nova tentativa em 10 min)':'')+'.';
      if(round){if(res.fail)p.retry[round]=Date.now()+10*60000;else delete p.retry[round]}setPref(p);clean()}
    return res}
  finally{busy=false;if(typeof page!=='undefined'&&page==='alerts'&&typeof render==='function'&&!(typeof modal!=='undefined'&&modal.open)&&!(D.activeElement&&D.activeElement.closest&&D.activeElement.closest('#email-panel form')))try{render()}catch(e){}}}
function dueDaily(){var c=mailCfg();if(!c.enabled)return null;var now=Date.now(),d=new Date(now),today=iso(),p=pref();
  for(var i=0;i<c.times.length;i++){var t=c.times[i],at=new Date(d.getFullYear(),d.getMonth(),d.getDate(),+t.slice(0,2),+t.slice(3,5),0,0).getTime();
    if(now>=at&&now-at<WINDOW_MS){var round=today+' '+t;if((p.retry[round]||0)>now)continue;return {round:round,label:'das '+t.replace(':00','h').replace(':','h')}}}return null}
function dueWeek(){var c=mailCfg();if(!c.enabled||!W.e99Week)return null;var wp=W.e99Week.get();if(!wp||wp.off)return null;var round='sem-'+W.e99Week.monday(iso()),p=pref();if((p.retry[round]||0)>Date.now())return null;return {round:round}}
async function run(){if(!authSession||role()!=='gestor'||!allowed()||navigator.onLine===false)return;var p=pref();if(p.off)return;
  var dd=dueDaily();if(dd&&W.emailReportFields)await fanout('dia',dd.label,dd.round);
  var dw=dueWeek();if(dw&&W.e99Week)await fanout('semana','',dw.round)}
async function tick(){if(!authSession||role()!=='gestor'||busy)return;if(navigator.locks&&navigator.locks.request)await navigator.locks.request('estoque99-allmail:'+authSession.storeKey,{ifAvailable:true},function(l){return l?run():null});else await run()}

/* ===== tela: Alertas → Relatório por e-mail ===== */
function boxHtml(){var p=pref(),R=recipients(),l=R.list,c=mailCfg();
  var items=l.map(function(r){return '<li><span class="e99all-mail">'+esc(mask(r.email))+'</span> · '+esc(r.name||r.id)+' · '+(r.papel==='auxiliar'?'auxiliar (sem valores)':r.papel==='gestor'?'gestor (completo)':'estoque (completo)')+'</li>'}).join('');
  return '<div class="e99all" id="e99all"><label class="wk-pref" id="e99all-pref"><input type="checkbox" '+(p.off?'':'checked ')+'onchange="e99AllMail.pref(this.checked)"> Enviar também para todas as contas do app</label>'
   +'<p class="small" style="margin:0">Cada conta recebe o seu e-mail, separado (ninguém vê o endereço dos outros). Auxiliar recebe sem valores. Além do destino padrão ('+esc(mask(c.to))+(c.cc.length?' + cópia':'')+').</p>'
   +(l.length?'<ul class="e99all-list" id="e99all-list" aria-label="Contas que vão receber">'+items+'</ul>':'<p class="small" id="e99all-list">Nenhuma conta com e-mail ainda. Contas criadas por link de acesso (com e-mail) entram aqui sozinhas.</p>')
   +'<p class="small e99all-warn"><b>Atenção:</b> no primeiro envio, cada pessoa recebe um e-mail de ativação do serviço de envio e precisa clicar em “Activate Form” para começar a receber.</p>'
   +'<div class="toolbar"><button type="button" id="e99all-send" onclick="e99AllMail.sendNow()"'+(l.length?'':' disabled')+'>Enviar agora para todas</button></div>'
   +'<p class="small email-status" id="e99all-status" role="status">'+esc(p.off?'Envio para as contas desligado.':p.status||(c.enabled?'As contas recebem nos mesmos horários do envio automático.':'Ative o envio automático acima para as contas receberem nos horários.'))+'</p></div>'}
var ep=W.emailPanelHTML;if(typeof ep==='function')W.emailPanelHTML=function(){var h=ep.apply(this,arguments);if(!h||!authSession||role()!=='gestor')return h;var box=boxHtml();
  var i=h.lastIndexOf('<p class="small">Envia com o site aberto');return i>0?h.slice(0,i)+box+h.slice(i):h.replace(/<\/div>$/,box+'</div>')};

W.e99AllMail={recipients:function(){return authSession?recipients():{list:[],info:{}}},mask:mask,tick:tick,get:function(){return authSession?pref():null},
  pref:function(on){if(!authSession)return;var p=pref();p.off=!on;setPref(p);notify(on?'Relatório também para todas as contas do app: ligado.':'Relatório para as contas do app: desligado.');var s=D.getElementById('e99all-status');if(s)s.textContent=on?'Ligado.':'Envio para as contas desligado.';if(on)tick()},
  sendNow:async function(){if(!authSession||role()!=='gestor'){notify('Só o gestor envia o relatório para as contas.');return null}var n=recipients().list.length;if(!n){notify('Nenhuma conta com e-mail para enviar.');return null}
    if(!allowed()){notify('Em teste local o envio de verdade fica desligado.');return null}
    if(!confirm('Enviar o relatório agora para '+n+' conta'+(n===1?'':'s')+' do app? Cada uma recebe um e-mail separado.'))return null;
    if(busy){notify('Já há um envio em andamento.');return null}notify('Enviando para '+n+' conta'+(n===1?'':'s')+'…');var r=await fanout('agora','de agora',null);
    if(r)notify('Enviados: '+r.sent+(r.act?' · aguardando confirmar: '+r.act:'')+' · falharam: '+r.fail+'.');return r}};
setInterval(function(){if(!D.hidden)tick()},30000);
D.addEventListener('visibilitychange',function(){if(!D.hidden)tick()});
W.addEventListener('online',function(){tick()});
var en=authEnter;authEnter=function(){var r=en.apply(this,arguments);setTimeout(tick,4000);return r};
})();
