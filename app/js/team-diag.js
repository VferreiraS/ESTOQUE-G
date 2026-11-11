
(function(){
'use strict';
/* Diagnóstico da equipe no Chat: mostra, por aparelho, o que está sendo sincronizado e permite enviar tudo de uma vez. */
function counts(){var s=state.sync||{},meta=s.meta||{},out={team:(state.team||[]).length,corridors:(state.corridors||[]).length,nfs:(state.nfs||[]).length,plans:(state.plans||[]).length,semEnvio:0};
  ['team','corridors','nfs','plans'].forEach(function(c){(state[c]||[]).forEach(function(x){if(x&&x.id&&!(meta[c]&&meta[c][x.id]))out.semEnvio++})});return out}
window.sendAllTeam=async function(){if(!window.e99SyncInfo||!window.e99SyncInfo()){notify('Entre numa equipe com a sincronização ligada.');return}
  if(typeof window.isAux==='function'&&window.isAux()){notify('Só o gestor envia tudo para a equipe.');return}
  notify('Enviando tudo para a equipe…');try{await window.e99SendAll();if(window.e99OnHello)window.e99OnHello();notify('Dados enviados para a equipe. Os outros aparelhos recebem em instantes.')}catch(x){notify('Não foi possível enviar agora. Tente de novo com internet.')}render()};
function panel(){if(!authSession||!window.e99SyncInfo||!window.e99SyncInfo())return '';var c=counts();
  return '<details class="sync-box" id="team-diag"><summary><span>Diagnóstico da equipe</span></summary><div class="sync-body"><p class="small" style="margin:0">Compare com o outro aparelho: os números devem ser iguais.</p>'
   +'<div class="aux-list"><div><span><b>Pessoas</b></span><span>'+c.team+'</span></div><div><span><b>Corredores</b></span><span>'+c.corridors+'</span></div><div><span><b>Notas fiscais</b></span><span>'+c.nfs+'</span></div><div><span><b>Planos</b></span><span>'+c.plans+'</span></div>'
   +'<div><span><b>Itens sem envio</b></span><span>'+c.semEnvio+'</span></div></div>'
   +'<button type="button" class="primary" onclick="sendAllTeam()">Enviar tudo para a equipe agora</button></div></details>'}
var rc=window.renderChat;if(typeof rc==='function')window.renderChat=function(){var h=rc.apply(this,arguments);try{return h+panel()}catch(x){return h}};
})();
