(function(){
'use strict';
/* v147 (pedido do dono): "o app não deixa criar contas duplicadas no mesmo e-mail".
   - Mesmo aparelho: criar/ativar conta (Primeiro acesso, link do gestor, Trazer da nuvem, recuperar pelo e-mail), salvar o e-mail
     (tela obrigatória da v105) e ligar o e-mail à nuvem recusam e-mail que já é de OUTRA conta deste aparelho.
     A mesma conta (mesmo login) pode salvar de novo o próprio e-mail e ser trazida/recuperada.
   - Onde se procura: índice e-mail → login (e99MailIdx + mail-multi da v124, só hash do e-mail) e cloud-email:<conta>.
     O e-mail cifrado (payload.email) só é lido da conta aberta: ao entrar ele vai para o índice (hash), e a conta nova também.
   - Gestor, ao criar o link de acesso: recusa e-mail de conta deste aparelho e de outro link da lista dele (aux-invites).
     Entre aparelhos não há lista de e-mails da equipe (membros/ não guarda e-mail e usuarios/ só o dono lê): quem barra lá é a
     nuvem (Firebase Auth tem um usuário por e-mail; outra conta com o mesmo e-mail não liga à nuvem).
   - Contas antigas já duplicadas não são apagadas; só não se criam novas. */
var W=window,P='lojasg.estoque99.cloud-email:';
function norm(m){return String(m==null?'':m).replace(/\s+/g,'').toLowerCase()}
function ls(k){try{return localStorage.getItem(k)}catch(x){return null}}
function loginOf(storeKey){try{var r=JSON.parse(ls(storeKey)||'null');return r&&typeof r.login==='string'?r.login:''}catch(x){return ''}}
/* login de OUTRA conta deste aparelho que usa este e-mail ('' = livre) */
async function owner(m,self){m=norm(m);if(!m||m.indexOf('@')<0)return '';var me=self?authLoginName(self):'',meKey=me?await authStorageKey(me):'';
  var cand=[];try{var ix=W.e99MailIdx;if(ix){var a=typeof ix.all==='function'?ix.all(m):[ix.get(m)];(a||[]).forEach(function(l){if(l&&cand.indexOf(authLoginName(l))<0)cand.push(authLoginName(l))})}}catch(x){}
  for(var i=0;i<cand.length;i++){if(cand[i]===me)continue;var k=await authStorageKey(cand[i]);if(k===meKey||!ls(k))continue;
    /* índice antigo: se a conta trocou o e-mail da nuvem, ela não usa mais este */
    var ce=ls(P+k);if(ce&&norm(ce)!==m&&!ls('lojasg.estoque99.pc-account:'+k)&&!/@pc\.stok-e99\.app$/.test(norm(ce)))continue;return loginOf(k)||cand[i]}
  try{for(var j=0;j<localStorage.length;j++){var key=localStorage.key(j);if(!key||key.indexOf(P)!==0)continue;if(norm(localStorage.getItem(key))!==m)continue;
    var sk=key.slice(P.length);if(sk===meKey)continue;var lg=loginOf(sk);if(lg&&authLoginName(lg)!==me)return lg}}catch(x){}
  return ''}
function msg(l){return 'Este e-mail já está em uso pela conta @'+l+'.'}
W.e99EmailNorm=norm;
W.e99EmailOwner=owner;
W.e99EmailInUse=msg;
W.e99EmailCheck=async function(m,self){var o=await owner(m,self);if(o)throw Error(msg(o))};
/* criar conta: todo caminho passa por authCreate (o "Trazer da nuvem" com backup também confere no cpGo) */
var ac=authCreate;authCreate=async function(login,store,password,data,role,email){if(typeof email==='string'&&norm(email))await W.e99EmailCheck(email,login);
  var s=await ac.apply(this,arguments);try{if(s&&s.payload&&s.payload.email&&W.e99MailIdx)W.e99MailIdx.set(norm(s.payload.email),s.record.login)}catch(x){}return s};
/* ao entrar: o e-mail da conta (também o da conta do PC, que não tem cloud-email) entra no índice para as próximas conferências */
var en=authEnter;authEnter=function(){var r=en.apply(this,arguments);try{var s=authSession,m=s&&s.payload?norm(s.payload.email):'';
  if(m&&m.indexOf('@')>0&&W.e99MailIdx){var all=typeof W.e99MailIdx.all==='function'?W.e99MailIdx.all(m):[];if(all.indexOf(authLoginName(s.record.login))<0)W.e99MailIdx.set(m,s.record.login)}}catch(x){}return r};
/* gestor: e-mail do link de acesso */
W.e99InviteEmailOwner=async function(m,list){m=norm(m);if(!m)return '';var o=await owner(m,'');if(o)return o;
  var l=Array.isArray(list)?list:[];for(var i=0;i<l.length;i++){var x=l[i];if(x&&!x.revoked&&norm(x.email)===m)return String(x.login||x.name||'')}return ''};
})();
