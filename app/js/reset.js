
(function(){
'use strict';
/* Apagar tudo neste aparelho: contas, equipe, dados, perfis e chats. Mantém só preferências visuais e de som.
   Pede para digitar APAGAR. Não sai da equipe nos outros aparelhos: cada aparelho precisa apagar o seu. */
var KEEP={'lojasg.estoque99.season':1,'lojasg.estoque99.sound':1,'lojasg.estoque99.install-hint':1,'lojasg.estoque99.device':1};
var DBS=['estoque99-local','estoque99-profiles','estoque99-perfis','estoque99-chat','estoque99-chat-out','estoque99-photos','estoque99-conf'];
function dropDb(n){return new Promise(function(res){try{var r=indexedDB.deleteDatabase(n);r.onsuccess=r.onerror=r.onblocked=function(){res()}}catch(x){res()}})}
function sweep(){var rm=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('lojasg.estoque99.')===0&&!KEEP[k])rm.push(k);if(k&&k.indexOf('estoque99')===0)rm.push(k)}
  rm.forEach(function(k){try{localStorage.removeItem(k)}catch(x){}})}
window.resetDevice=async function(){
  var inp=document.getElementById('reset-confirm');var typed=inp?String(inp.value||'').trim():'';
  if(typed!=='APAGAR'){notify('Para confirmar, digite APAGAR exatamente.');return}
  if(!window.confirm('Apagar todas as contas, a equipe, os dados e os perfis deste aparelho? Não tem volta.'))return;
  try{
    sweep();
    var ss=[];for(var j=0;j<sessionStorage.length;j++){var q=sessionStorage.key(j);if(q&&q.indexOf('e99-')===0)ss.push(q)}ss.forEach(function(q){try{sessionStorage.removeItem(q)}catch(x){}});
    try{sessionStorage.removeItem('e99-updated')}catch(x){}
  }catch(x){}
  /* espera os bancos e o cache de arquivos serem apagados (no máximo 3 s) antes de abrir o site de novo */
  var cachesDone=('caches' in window)?caches.keys().then(function(ks){/* v89: só os caches do Stok; outros sites do mesmo domínio (github.io) ficam */return Promise.all(ks.filter(function(k){return k.indexOf('estoque99-')===0}).map(function(k){return caches.delete(k)}))}).catch(function(){}):Promise.resolve();
  await Promise.race([Promise.all(DBS.map(dropDb).concat([cachesDone])),new Promise(function(r){setTimeout(r,3000)})]);
  try{notify('Aparelho limpo. Abrindo o site de novo…')}catch(x){}
  /* a sincronização ainda aberta pode ter gravado algo durante a espera: limpa de novo logo antes de recarregar */
  setTimeout(function(){sweep();location.replace('./')},400);
};
var rrReset=render;render=function(){var r=rrReset.apply(this,arguments);try{if(page!=='data')return r;var view=document.getElementById('view');if(!view||view.querySelector('.reset-panel'))return r;
  var p=document.createElement('div');p.className='panel help reset-panel';p.style.borderColor='#ff2a1f';
  p.innerHTML='<h2>Apagar tudo neste aparelho</h2><p class="small" style="margin:0">Apaga todas as contas, a equipe, planos, NFs, corredores, pessoas e perfis <b>deste aparelho</b>. Depois o site abre como novo. Nada é apagado nos outros aparelhos, e o computador e o celular precisam ser limpos cada um.</p>'
   +'<label style="display:grid;gap:6px;margin-top:8px">Digite APAGAR para confirmar<input id="reset-confirm" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="APAGAR"></label>'
   +'<div style="margin-top:8px"><button type="button" class="danger" onclick="resetDevice()">Apagar tudo neste aparelho</button></div>';
  view.appendChild(p)}catch(x){}return r};
/* versão à vista, mesmo sem entrar na conta: rodapé do login e Dados e ajuda */
function ver(){var m=document.querySelector('meta[name="estoque99-version"]');return m?m.content:''}
var raVer=renderAuth;renderAuth=function(){var r=raVer.apply(this,arguments);try{var box=document.getElementById('auth-screen');if(box&&!box.querySelector('.site-version')){var v=document.createElement('p');v.className='small site-version';v.style.cssText='text-align:center;margin:8px 0 0';v.textContent='Versão '+ver();var card=box.querySelector('.auth-card');(card||box).appendChild(v)}}catch(x){}return r};
var rrVer=render;render=function(){var r=rrVer.apply(this,arguments);try{var bc=document.getElementById('breadcrumb');if(bc&&/ \/ undefined$/.test(bc.textContent))bc.textContent=bc.textContent.replace(/undefined$/,page==='admin'?'Administração':'');if(page==='data'){var view=document.getElementById('view');if(view&&!view.querySelector('.site-version')){var v=document.createElement('p');v.className='small site-version';v.textContent='Versão do site neste aparelho: '+ver()+'.';var h=view.querySelector('.hero');if(h&&h.nextSibling)view.insertBefore(v,h.nextSibling);else view.appendChild(v)}}}catch(x){}return r};
try{if(document.getElementById('auth-screen')&&!document.getElementById('auth-screen').hidden&&!window.authSession)renderAuth()}catch(x){}
})();
