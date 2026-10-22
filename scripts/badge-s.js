<script id="badge-s-js">
(function(){
'use strict';
/* Selo verificado: S vermelho (logo) com efeito vivo — v79 */

var VB_S = '<svg class="vbadge vbadge-s" viewBox="0 0 40 40" role="img" aria-label="Verificado Stok">'
  + '<defs>'
  + '<linearGradient id="stok-s-g" x1="0" y1="0" x2="1" y2="1">'
  + '<stop offset="0%" stop-color="#ff6a48"/><stop offset="55%" stop-color="#e01810"/><stop offset="100%" stop-color="#a80c08"/>'
  + '</linearGradient>'
  + '<filter id="stok-s-glow" x="-40%" y="-40%" width="180%" height="180%">'
  + '<feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/>'
  + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>'
  + '</filter>'
  + '</defs>'
  + '<circle cx="20" cy="20" r="18.5" fill="url(#stok-s-g)" filter="url(#stok-s-glow)"/>'
  + '<circle cx="20" cy="20" r="18.5" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>'
  + '<text x="20" y="26.5" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-weight="800" font-size="22" fill="#fff" letter-spacing="-1">S</text>'
  + '</svg>';

function patchBadge(){
  try{
    if(typeof VB !== 'undefined'){ VB = VB_S; }
    window.VB = VB_S;
  }catch(e){}
  try{
    var _isV = typeof isV === 'function' ? isV : null;
    window.isV = function(r){
      if(!r) return false;
      try{
        if(_isV && _isV(r)) return true;
      }catch(e){}
      try{
        var login = '';
        if(r.me && authSession && authSession.record) login = authSession.record.login;
        else if(r.login) login = r.login;
        login = typeof authLoginName === 'function' ? authLoginName(login) : String(login||'').toLowerCase();
        if(login === 'vferreiras') return true;
        if(r.me && authSession && authSession.payload && authSession.payload.role === 'gestor' && login === 'vferreiras') return true;
      }catch(e){}
      return false;
    };
    if(typeof vb === 'function'){
      window.vb = function(r){ return window.isV(r) ? VB_S : ''; };
    }
  }catch(e){}
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchBadge);
else patchBadge();
setTimeout(patchBadge, 0);
setTimeout(patchBadge, 500);
})();
</script>
<style id="badge-s-css">
.vbadge.vbadge-s{
  display:inline-block;
  width:1em;height:1em;
  min-width:16px;min-height:16px;
  margin-left:.28em;
  vertical-align:-.12em;
  flex:none;
  animation: vb-pop 4s ease-in-out infinite, vb-s-glow 2.4s ease-in-out infinite;
  filter: drop-shadow(0 0 3px rgba(233,24,16,.55));
}
@keyframes vb-s-glow{
  0%,100%{ filter: drop-shadow(0 0 2px rgba(255,60,40,.45)) drop-shadow(0 0 6px rgba(217,20,11,.25)); }
  50%{ filter: drop-shadow(0 0 5px rgba(255,106,72,.9)) drop-shadow(0 0 12px rgba(233,24,16,.45)); }
}
body.fx-user-off .vbadge.vbadge-s{ animation: none; filter: none; }
</style>
