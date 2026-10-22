<script id="fix-admin-badge-js">
(function(){
'use strict';
/* v80: Administração sempre no menu do gestor + selo S da logo (vermelho, vivo) */

var VB_S = '<svg class="vbadge vbadge-s" viewBox="0 0 100 100" role="img" aria-label="Verificado Stok">'
  + '<defs>'
  + '<linearGradient id="stokSg" x1="0" y1="0" x2="1" y2="1">'
  + '<stop offset="0" stop-color="#ff6a48"/><stop offset="1" stop-color="#d9140b"/>'
  + '</linearGradient>'
  + '<filter id="stokGlow" x="-50%" y="-50%" width="200%" height="200%">'
  + '<feGaussianBlur stdDeviation="2.5" result="b"/>'
  + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>'
  + '</filter>'
  + '</defs>'
  + '<circle cx="50" cy="50" r="48" fill="#1a0505" opacity=".35"/>'
  + '<circle cx="50" cy="50" r="46" fill="url(#stokSg)" filter="url(#stokGlow)"/>'
  + '<circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2"/>'
  + '<path fill="#fff" transform="translate(8,6) scale(0.84)" d="M42 14h30.5a7.5 7.5 0 0 1 0 15H42a3.5 3.5 0 0 0 0 7H58a21 21 0 0 1 0 42H27.5a7.5 7.5 0 0 1 0-15H58a6 6 0 0 0 0-12H42a18.5 18.5 0 0 1 0-37z"/>'
  + '</svg>';

function ensureAdminNav(){
  try{
    if(!authSession || !authSession.payload) return;
    if(authSession.payload.role !== 'gestor') {
      try{ delete labels.admin; delete icons.admin; }catch(e){}
      return;
    }
    labels.admin = 'Administração';
    icons.admin = '⚙';
    try{
      if(typeof FULL === 'object' && FULL && FULL.labels){
        FULL.labels.admin = 'Administração';
        if(FULL.icons) FULL.icons.admin = '⚙';
      }
    }catch(e){}
  }catch(e){}
}

function patchApplyRole(){
  if(typeof applyRole !== 'function') return;
  if(applyRole.__stokPatched) return;
  var orig = applyRole;
  window.applyRole = function(){
    var r = orig.apply(this, arguments);
    ensureAdminNav();
    try{
      if(authSession && document.getElementById('nav')){
        var nav = document.getElementById('nav');
        if(nav && labels && icons){
          nav.innerHTML = Object.keys(labels).map(function(p){
            return '<button class="'+(page===p?'active':'')+'" aria-current="'+(page===p?'page':'false')+'" onclick="go(\''+p+'\')"><span aria-hidden="true">'+(icons[p]||'')+'</span>'+labels[p]+'</button>';
          }).join('');
        }
      }
    }catch(e){}
    return r;
  };
  window.applyRole.__stokPatched = true;
}

function patchBadge(){
  try{ VB = VB_S; window.VB = VB_S; }catch(e){ window.VB = VB_S; }
  var _isV = typeof isV === 'function' ? isV : function(){ return false; };
  window.isV = function(r){
    if(!r) return false;
    try{ if(_isV(r)) return true; }catch(e){}
    try{
      var login = '';
      if(r.me && authSession && authSession.record) login = authSession.record.login;
      else if(r.login) login = r.login;
      login = typeof authLoginName === 'function' ? authLoginName(String(login||'')) : String(login||'').toLowerCase();
      if(login === 'vferreiras') return true;
      if(r.me && authSession && authSession.payload && authSession.payload.role === 'gestor') return true;
    }catch(e){}
    return false;
  };
  window.vb = function(r){ return window.isV(r) ? VB_S : ''; };
}

function patchAuthEnter(){
  if(typeof authEnter !== 'function' || authEnter.__stokAdm) return;
  var orig = authEnter;
  window.authEnter = function(session){
    var r = orig.apply(this, arguments);
    ensureAdminNav();
    patchApplyRole();
    setTimeout(function(){ ensureAdminNav(); try{ if(typeof render==='function') render(); }catch(e){} }, 100);
    return r;
  };
  window.authEnter.__stokAdm = true;
}

function boot(){
  patchBadge();
  patchApplyRole();
  patchAuthEnter();
  ensureAdminNav();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
setTimeout(boot, 300);
setTimeout(boot, 1200);
})();
</script>
<style id="fix-admin-badge-css">
.vbadge.vbadge-s{
  display:inline-block !important;
  width:1.15em !important;
  height:1.15em !important;
  min-width:18px !important;
  min-height:18px !important;
  margin-left:.3em !important;
  vertical-align:-.18em !important;
  flex:none !important;
  animation: vb-pop 3.5s ease-in-out infinite, vb-s-pulse 2s ease-in-out infinite !important;
  filter: drop-shadow(0 0 4px rgba(255,60,40,.7)) !important;
}
@keyframes vb-s-pulse{
  0%,100%{ filter: drop-shadow(0 0 2px rgba(255,50,30,.5)) drop-shadow(0 0 8px rgba(217,20,11,.35)); transform: scale(1); }
  50%{ filter: drop-shadow(0 0 6px rgba(255,106,72,1)) drop-shadow(0 0 14px rgba(233,24,16,.55)); transform: scale(1.08); }
}
body.fx-user-off .vbadge.vbadge-s{ animation: none !important; filter: none !important; }
</style>
