
(function(){
'use strict';
/* v121: a IA saiu do app (agentes, piloto automático). Fica só o registro de erros dos aparelhos na nuvem
   (lojas/{id}/erros), usado pelo robô diário para achar e corrigir problemas. Sem IA. */
function T(){try{return window.e99Team&&window.e99Team.get()}catch(x){return null}}
var errQ=[];function capture(msg,where){msg=String(msg||'').slice(0,300);if(!msg||/ResizeObserver|Script error\.?$/.test(msg))return;errQ.push({msg:msg,onde:String(where||'').slice(0,200),pagina:String(typeof page!=='undefined'?page:'').slice(0,40)});setTimeout(flushErr,3000)}
window.addEventListener('error',function(ev){capture(ev.message,(ev.filename||'').split('/').pop()+':'+(ev.lineno||0))});
window.addEventListener('unhandledrejection',function(ev){var r=ev.reason;capture(r&&r.message?r.message:String(r),'promessa')});
async function flushErr(){if(!errQ.length||!window.e99Cloud||!window.e99Cloud.user())return;var c,sid;try{c=await window.e99Cloud.load();sid=await window.e99Cloud.sid()}catch(x){return}if(!sid)return;var q=errQ.splice(0,10),ver=String(window.SITE_VERSION||'').slice(0,10);
  for(var i=0;i<q.length;i++){var x=q[i];var h=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ver+'|'+x.msg)));var id=Array.from(h).map(function(b){return b.toString(16).padStart(2,'0')}).join('').slice(0,24);
    var k='lojasg.estoque99.err-n:'+id,n=(+localStorage.getItem(k)||0)+1;try{localStorage.setItem(k,String(n))}catch(y){}
    try{await c.db.collection('lojas').doc(sid).collection('erros').doc(id).set({msg:x.msg,onde:x.onde,pagina:x.pagina,ver:ver,por:(T()&&T().name||'').slice(0,40),n:Math.min(n,1000000),at:Date.now()})}catch(y){}}}
})();
