
(function(){
'use strict';
/* v112: tema do aparelho (lojasg.estoque99.ui-theme = lilas | violeta | cinza; padrão lilas). (v122: o gráfico do Início saiu.) */
var D=document,K='lojasg.estoque99.ui-theme',LIST=[['lilas','Lilás','#E7B8EF','#0B090D'],['violeta','Violeta + Lima','#C6FF34','#000000'],['cinza','Cinza + Lima','#C7FF2E','#0A0A0A']];
function cur(){var t='';try{t=localStorage.getItem(K)||''}catch(x){}return LIST.some(function(l){return l[0]===t})?t:'lilas'}
function apply(t){D.documentElement.setAttribute('data-e99-theme',t);var bg=(LIST.filter(function(l){return l[0]===t})[0]||LIST[0])[3];var m=D.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',bg)}
window.e99Theme={get:cur,list:function(){return LIST.map(function(l){return l[0]})},set:function(t){if(!LIST.some(function(l){return l[0]===t}))return;try{localStorage.setItem(K,t)}catch(x){}apply(t);
  try{if(typeof render==='function'&&typeof authSession!=='undefined'&&authSession)render()}catch(x){}row(true);try{notify('Tema: '+LIST.filter(function(l){return l[0]===t})[0][1]+'.')}catch(x){}}};
apply(cur());
function row(force){var pp=D.getElementById('prefs-panel');if(!pp)return;var old=D.getElementById('pref-theme-row');if(old&&!force)return;if(old)old.remove();var t=cur(),r=D.createElement('div');r.className='pref-row';r.id='pref-theme-row';
  r.innerHTML='<span><b>Aparência</b><span class="small">Tema escuro deste aparelho.</span></span><div id="pref-theme" role="group" aria-label="Tema">'+LIST.map(function(l){return '<button type="button" data-theme="'+l[0]+'" aria-pressed="'+(l[0]===t)+'" onclick="e99Theme.set(\''+l[0]+'\')"><span class="sw" aria-hidden="true" style="background:'+l[2]+'"></span>'+l[1]+'</button>'}).join('')+'</div>';
  var h=pp.querySelector('h2');if(h&&h.nextSibling)pp.insertBefore(r,h.nextElementSibling&&h.nextElementSibling.classList.contains('small')?h.nextElementSibling.nextSibling:h.nextSibling);else pp.appendChild(r)}
var r0=render;render=function(){var r=r0.apply(this,arguments);try{row(false)}catch(x){}return r};
if(typeof window.e99PrefsRefresh==='function'){var pr=window.e99PrefsRefresh;window.e99PrefsRefresh=function(){var r=pr.apply(this,arguments);setTimeout(function(){row(false)},90);return r}}
setInterval(function(){if(!D.hidden)try{row(false)}catch(x){}},1500);
})();
