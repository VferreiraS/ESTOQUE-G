
/* v111: índice e-mail → login sem o e-mail em claro (SHA-256 síncrono, só para isto) */
(function(){
var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function sha256hex(str){var b=new TextEncoder().encode(str),l=b.length,n=((l+9+63)>>6)<<6,m=new Uint8Array(n);m.set(b);m[l]=0x80;var bits=l*8;m[n-4]=bits>>>24;m[n-3]=(bits>>>16)&255;m[n-2]=(bits>>>8)&255;m[n-1]=bits&255;
  var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],W=new Array(64);
  for(var o=0;o<n;o+=64){for(var t=0;t<16;t++)W[t]=(m[o+4*t]<<24)|(m[o+4*t+1]<<16)|(m[o+4*t+2]<<8)|m[o+4*t+3];
    for(t=16;t<64;t++){var x=W[t-15],y=W[t-2];var s0=((x>>>7)|(x<<25))^((x>>>18)|(x<<14))^(x>>>3),s1=((y>>>17)|(y<<15))^((y>>>19)|(y<<13))^(y>>>10);W[t]=(W[t-16]+s0+W[t-7]+s1)|0}
    var a=H[0],c=H[1],d=H[2],e=H[3],f=H[4],g=H[5],h=H[6],k=H[7];
    for(t=0;t<64;t++){var S1=((f>>>6)|(f<<26))^((f>>>11)|(f<<21))^((f>>>25)|(f<<7)),ch=(f&g)^(~f&h),T1=(k+S1+ch+K[t]+W[t])|0,S0=((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10)),mj=(a&c)^(a&d)^(c&d),T2=(S0+mj)|0;k=h;h=g;g=f;f=(e+T1)|0;e=d;d=c;c=a;a=(T1+T2)|0}
    H[0]=(H[0]+a)|0;H[1]=(H[1]+c)|0;H[2]=(H[2]+d)|0;H[3]=(H[3]+e)|0;H[4]=(H[4]+f)|0;H[5]=(H[5]+g)|0;H[6]=(H[6]+h)|0;H[7]=(H[7]+k)|0}
  return H.map(function(v){return ('00000000'+(v>>>0).toString(16)).slice(-8)}).join('')}
var OLD='lojasg.estoque99.cloud-logins',NEW='lojasg.estoque99.cloud-logins2';
function h(m){return sha256hex('e99-mail|'+String(m||'').trim().toLowerCase()).slice(0,32)}
function rd(){try{var o=JSON.parse(localStorage.getItem(NEW)||'{}');return o&&typeof o==='object'?o:{}}catch(x){return {}}}
function wr(o){try{localStorage.setItem(NEW,JSON.stringify(o));return true}catch(x){return false}}
/* migração: copia o índice antigo (e-mail em claro) para o novo e só então apaga o antigo */
try{var old=localStorage.getItem(OLD);if(old){var o=JSON.parse(old)||{},n=rd();Object.keys(o).forEach(function(m){if(typeof o[m]==='string'&&!n[h(m)])n[h(m)]=o[m]});if(wr(n)&&localStorage.getItem(NEW))localStorage.removeItem(OLD)}}catch(x){}
window.e99MailIdx={get:function(m){return rd()[h(m)]||''},set:function(m,login){var o=rd();if(o[h(m)]!==login){o[h(m)]=login;wr(o)}},del:function(m){var o=rd();delete o[h(m)];wr(o)},hash:h,sha256hex:sha256hex};
})();
(function(){
'use strict';
/* v111 (pedido do dono): dados pessoais do aparelho cifrados com a conta.
   - members: e aux-invites: (por conta; agent-brief: da IA saiu na v121) deixam o localStorage em claro e passam a morar dentro do estado cifrado da
     conta (state.sealed, AES-GCM com a senha, como o resto). O app continua lendo/gravando pelo localStorage de sempre: este bloco
     intercepta só essas chaves da conta aberta. Dado antigo em claro é levado para dentro da conta na primeira leitura e só é
     apagado do localStorage depois que a conta foi gravada com ele (nada se perde).
   - cloud-logins (e-mail → login, usado para entrar pelo e-mail antes de abrir a conta) vira um índice mínimo: SHA-256 do e-mail → login.
     O login já fica visível no registro da conta; o e-mail não fica mais em claro.
   - Fotos e perfis (IndexedDB estoque99-profiles) são cifrados com uma chave aleatória guardada no estado cifrado (state.sealKey);
     os registros antigos em claro são cifrados quando são lidos. */
var LS=window.localStorage,SP=Storage.prototype,G=SP.getItem,S=SP.setItem,R=SP.removeItem;
var PRE=['lojasg.estoque99.members:','lojasg.estoque99.aux-invites:'];
var cur='',vault=null,moved={},timer=0;
function sess(){try{return authSession}catch(x){return null}}
function vk(k){var s=sess();if(!s||!s.storeKey)return '';for(var i=0;i<PRE.length;i++){var p=PRE[i];if(k.indexOf(p)===0){var rest=k.slice(p.length);if(rest===s.storeKey||rest.indexOf(s.storeKey+':')===0)return p.slice('lojasg.estoque99.'.length)+rest.slice(s.storeKey.length)}}return ''}
function full(v){var s=sess();var i=v.indexOf(':');return 'lojasg.estoque99.'+v.slice(0,i+1)+s.storeKey+v.slice(i+1)}
function V(){var s=sess();if(!s||typeof state!=='object'||!state)return null;if(cur!==s.storeKey||!vault){cur=s.storeKey;moved={};vault=state.sealed&&typeof state.sealed==='object'?state.sealed:{}}
  if(state.sealed!==vault)state.sealed=vault;return vault}
function persist(now){clearTimeout(timer);timer=setTimeout(flush,now?0:800)}
function flush(){var s=sess();if(!s||cur!==s.storeKey)return;V();var mv=moved,keys=Object.keys(mv);
  Promise.resolve(authPersist(JSON.stringify(state))).then(function(){if(sess()!==s)return;keys.forEach(function(k){/* só apaga o antigo em claro se ele não mudou desde que foi copiado */if(mv[k]===G.call(LS,k))R.call(LS,k);delete moved[k]})}).catch(function(x){try{console.warn('Stok dados cifrados:',x&&x.message||x)}catch(y){}})}
SP.getItem=function(k){if(this===LS){k=String(k);var v=vk(k);if(v){var o=V();if(o){if(Object.prototype.hasOwnProperty.call(o,v))return o[v];var raw=G.call(LS,k);if(raw!=null){o[v]=raw;moved[k]=raw;persist()}return raw}}}return G.apply(this,arguments)};
SP.setItem=function(k,val){if(this===LS){k=String(k);var v=vk(k);if(v){var o=V();if(o){o[v]=String(val);if(G.call(LS,k)!=null)moved[k]=moved[k]||G.call(LS,k);persist(/aux-invites/.test(k));return}}}return S.apply(this,arguments)};
SP.removeItem=function(k){if(this===LS){k=String(k);var v=vk(k);if(v){var o=V();if(o){delete o[v];R.call(LS,k);persist();return}}}return R.apply(this,arguments)};
/* para quem precisa listar (testes e limpeza): as chaves cifradas da conta aberta, no mesmo formato do localStorage */
window.e99SealedKeys=function(){var o=V();return o?Object.keys(o).map(full):[]};
/* migra tudo o que estiver em claro assim que a conta abre */
function sweep(){var s=sess();if(!s)return;var o=V();if(!o)return;var n=0;for(var i=0;i<LS.length;i++){var k=LS.key(i);if(k&&vk(k)){var raw=G.call(LS,k);if(raw==null)continue;if(!Object.prototype.hasOwnProperty.call(o,vk(k)))o[vk(k)]=raw;moved[k]=raw;n++}}if(n)persist(true)}
var en=authEnter;authEnter=function(){var r=en.apply(this,arguments);try{V();sweep();keyFor='';setTimeout(ensureKey,50)}catch(x){}return r};
var lo=authLogout;authLogout=async function(){var r=await lo.apply(this,arguments);if(!sess()){clearTimeout(timer);cur='';vault=null;moved={};keyFor='';keyP=null}return r};
var ap=authPersist;authPersist=function(snap){try{var o=V();if(o&&Object.keys(o).length&&typeof snap==='string'&&snap.indexOf('"sealed":')<0){var j=JSON.parse(snap);j.sealed=o;snap=JSON.stringify(j)}}catch(x){}return ap.call(this,snap)};
window.addEventListener('pagehide',function(){if(timer){clearTimeout(timer);timer=0;flush()}});

/* ---------- chave das fotos/perfis (state.sealKey) ---------- */
var keyP=null,keyFor='';
function b64(b){return authB64(b)}function un64(s){return authUn64(s)}
async function ensureKey(){var s=sess();if(!s||typeof state!=='object')return null;if(!state.sealKey){var k=b64(crypto.getRandomValues(new Uint8Array(32)));state.sealKey=k;try{await authPersist(JSON.stringify(state))}catch(x){if(state.sealKey===k)state.sealKey='';return null}}
  if(keyP&&keyFor===state.sealKey)return keyP;keyFor=state.sealKey;keyP=crypto.subtle.importKey('raw',un64(state.sealKey),'AES-GCM',false,['encrypt','decrypt']);return keyP}
function ready(){var s=sess();return !!(s&&typeof state==='object'&&state&&state.sealKey&&keyP&&keyFor===state.sealKey)}
function aad(tag){var s=sess();return authBytes('e99seal|'+(s?authLoginName(s.record.login):'')+'|'+tag)}
window.e99Seal={ready:ready,ensure:ensureKey,
  isSealed:function(v){return !!(v&&typeof v==='object'&&v.__e99s===1&&typeof v.iv==='string'&&typeof v.c==='string')},
  seal:async function(obj,tag){var key=await ensureKey();if(!key)throw Error('sem chave');var iv=crypto.getRandomValues(new Uint8Array(12));var ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:aad(tag)},key,authBytes(JSON.stringify(obj)));return {__e99s:1,iv:b64(iv),c:b64(new Uint8Array(ct))}},
  open:async function(v,tag){try{var key=await ensureKey();if(!key)return null;var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(v.iv),additionalData:aad(tag)},key,un64(v.c));return JSON.parse(new TextDecoder().decode(pt))}catch(x){return null}}};
if(sess())setTimeout(function(){try{V();sweep()}catch(x){}ensureKey()},300);
})();
