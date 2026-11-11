
(function(){
'use strict';
/* Planilha no Google: depois de cada gravação, o app manda uma cópia dos dados (sem fotos) para um Apps Script
   ligado à planilha do usuário. O endereço e a senha da planilha ficam cifrados com a chave da conta.
   Só gestor e conta do estoque enviam; o auxiliar não. Os dados chegam na planilha sem cifra. */
var cfg=null,timer=0,lastSent=0,lastErr='',sending=false;
var WAIT=20000,MIN_GAP=120000;
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function key(){return 'lojasg.estoque99.sheets:'+authSession.storeKey}
function aad(){return authBytes('sheets|'+authLoginName(authSession.record.login))}
async function load(){cfg=null;lastSent=0;if(!authSession)return;var raw=localStorage.getItem(key());if(!raw)return;try{var o=JSON.parse(raw);var p=await crypto.subtle.decrypt({name:'AES-GCM',iv:authUn64(o.iv),additionalData:aad()},authSession.key,authUn64(o.cipher));cfg=JSON.parse(new TextDecoder().decode(p));lastSent=+cfg.lastSent||0}catch(x){cfg=null}}
async function store(c){if(!c){localStorage.removeItem(key());cfg=null;return}var iv=crypto.getRandomValues(new Uint8Array(12));var ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:aad()},authSession.key,authBytes(JSON.stringify(c))));localStorage.setItem(key(),JSON.stringify({iv:authB64(iv),cipher:authB64(ct)}));cfg=c}
function okUrl(u){u=String(u||'').trim();if(/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/.test(u))return true;return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&/^http:\/\/(localhost|127\.0\.0\.1):\d+\//.test(u)}
function canSend(){return !!(authSession&&cfg&&cfg.url&&cfg.token&&authSession.payload.role!=='auxiliar')}
function nm(id){if(!id)return '';if(id==='todos')return 'TODOS';var p=(state.team||[]).find(function(x){return x.id===id});return p?p.name:''}
function payload(){var today=new Date().toISOString();
  var equipe=(state.team||[]).map(function(p){return [p.name||'',p.role||'']});
  var corredores=(state.corridors||[]).map(function(c){return [c.number||'',c.sector||'',nm(c.owner)||'A definir']});
  var nfs=(state.nfs||[]).map(function(n){return [n.number||'',n.supplier||'',n.date||'',n.arrivalTime||'',Number(n.volumes)||0,nm(n.owner)||'A definir',n.status||'',n.notes||'',(n.items||[]).length]});
  var planos=[],atividades=[];(state.plans||[]).slice().sort(function(a,b){return String(b.date).localeCompare(String(a.date))}).forEach(function(p){var acts=p.activities||[];planos.push([p.date||'',p.title||'',acts.length,acts.filter(function(a){return a.done}).length]);
    acts.forEach(function(a){atividades.push([p.date||'',p.title||'',a.title||'',a.owner||'',a.time||'',a.done?'Sim':'Não',a.doneBy||'',a.doneAt?new Date(a.doneAt).toLocaleString('pt-BR'):'',a.notes||''])})});
  return {v:1,token:cfg.token,loja:authSession.payload.store||'',conta:authSession.record.login,aparelho:(typeof deviceName==='function'?deviceName():''),versao:(document.querySelector('meta[name="estoque99-version"]')||{}).content||'',enviadoEm:today,
    abas:{Equipe:{cab:['Nome','Cargo'],linhas:equipe},Corredores:{cab:['Corredor','Setor','Responsável'],linhas:corredores},NFs:{cab:['NF','Fornecedor','Data','Chegada','Volumes','Responsável','Status','Observações','Itens'],linhas:nfs},
      Planos:{cab:['Data','Plano','Atividades','Feitas'],linhas:planos},Atividades:{cab:['Data','Plano','Atividade','Responsável','Até','Feita','Feita por','Quando','Observações'],linhas:atividades}}}}
async function send(manual){if(!canSend()||sending)return false;if(!navigator.onLine){lastErr='Sem internet. Envio quando a conexão voltar.';paint();return false}sending=true;
  try{await fetch(cfg.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload())});lastSent=Date.now();lastErr='';cfg.lastSent=lastSent;await store(cfg);if(manual)notify('Planilha atualizada no Google.')}
  catch(x){lastErr='Não foi possível enviar para a planilha. Tento de novo depois.';if(manual)notify(lastErr);schedule(60000)}
  finally{sending=false;paint()}return !lastErr}
function schedule(ms){if(!canSend())return;clearTimeout(timer);var gap=Math.max(0,lastSent+MIN_GAP-Date.now());timer=setTimeout(function(){send(false)},Math.max(ms==null?WAIT:ms,gap))}
window.e99SheetsSendNow=function(){clearTimeout(timer);return send(true)};
var saveSheets=save;save=async function(){var r=await saveSheets.apply(this,arguments);try{schedule()}catch(x){}return r};
addEventListener('online',function(){if(canSend()&&lastErr)schedule(3000)});
function when(t){return t?new Date(t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'nunca'}
function panelHTML(){var on=!!(cfg&&cfg.url);
  return '<h2>Planilha no Google</h2>'
   +(authSession.payload.role==='auxiliar'?'<p class="small">Só o gestor e a conta do estoque enviam dados para a planilha.</p>':
    '<p class="small" style="margin:0">'+(on?'<b>Ligada.</b> Último envio: '+e(when(lastSent))+'.':'Desligada.')+' A cada mudança (no máximo a cada 2 minutos), o app manda uma cópia de planos, atividades, NFs, corredores e equipe (sem fotos) para a sua planilha. <b>Os dados ficam na planilha sem cifra.</b></p>'
   +(lastErr?'<p class="small" role="alert" style="margin:6px 0 0;color:#ff8a7a">'+e(lastErr)+'</p>':'')
   +(on?'':'<p class="small" style="margin:6px 0 0">Para ligar: crie uma planilha no Google, abra Extensões → Apps Script, cole o código de <b>apps-script/planilha.gs</b> (no GitHub do projeto), troque a senha, implante como app da Web e cole aqui o endereço e a senha.</p>')+'<form onsubmit="sheetsSave(event)" class="fields" style="margin-top:8px"><label>Endereço do app da Web (Apps Script)<input name="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec" value="'+e(cfg&&cfg.url||'')+'"></label>'
   +'<label>Senha da planilha<input name="token" autocomplete="off" spellcheck="false" placeholder="a mesma senha que você pôs no script" value="'+e(cfg&&cfg.token||'')+'"></label>'
   +'<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="primary" type="submit">Salvar e enviar agora</button>'+(on?'<button type="button" onclick="e99SheetsSendNow()">Enviar agora</button><button type="button" onclick="sheetsOff()">Desligar</button>':'')+'</div></form>')}
function paint(){var p=document.querySelector('#view .sheets-panel');if(p)p.innerHTML=panelHTML()}
window.sheetsSave=async function(ev){ev.preventDefault();var v=readForm(ev.target),u=String(v.url||'').trim(),t=String(v.token||'').trim();
  if(!okUrl(u)){notify('O endereço precisa ser o do app da Web do Apps Script, terminando em /exec.');return}if(t.length<8){notify('Cole a mesma senha que você colocou no Apps Script (8 caracteres ou mais).');return}
  await store({url:u,token:t,lastSent:lastSent});notify('Planilha ligada. Enviando agora…');await send(true);paint()};
window.sheetsOff=async function(){if(!confirm('Desligar o envio para a planilha do Google? A planilha continua no seu Drive.'))return;await store(null);lastSent=0;lastErr='';paint();notify('Envio para a planilha desligado.')};
var rr=render;render=function(){var r=rr.apply(this,arguments);try{if(page==='data'&&authSession){var view=document.getElementById('view');if(view&&!view.querySelector('.sheets-panel')){var d=document.createElement('div');d.className='panel help sheets-panel';d.innerHTML=panelHTML();var reset=view.querySelector('.reset-panel');if(reset)view.insertBefore(d,reset);else view.appendChild(d)}}}catch(x){}return r};
var enter0=authEnter;authEnter=function(){var r=enter0.apply(this,arguments);load().then(function(){if(canSend()&&Date.now()-lastSent>6*3600000)schedule(8000)});return r};
var out0=authLogout;authLogout=async function(){clearTimeout(timer);var r=await out0.apply(this,arguments);if(!authSession){cfg=null;lastSent=0}return r};
if(typeof authSession!=='undefined'&&authSession)load();
})();
