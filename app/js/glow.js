
(function(){'use strict';
/* última palavra do título em vermelho e etiqueta em pílula acima do título do Início */
function decorate(root){if(!root)return;root.querySelectorAll('.hero h1, .auth-card h1').forEach(function(h){if(h.querySelector('.accent-word'))return;var w=h.lastChild;if(!w||w.nodeType!==3)return;var t=w.textContent,m=t.match(/(\S+)\s*$/);if(!m)return;w.textContent=t.slice(0,m.index);var sp=document.createElement('span');sp.className='accent-word';sp.textContent=m[1];sp.setAttribute('data-t',m[1]);h.appendChild(sp)});
  var hh=root.querySelector('.hero-home h1');if(hh&&!hh.parentNode.querySelector('.hero-pill')){var pl=document.createElement('span');pl.className='hero-pill';pl.innerHTML='<i></i>Stok · Lojas G';hh.parentNode.insertBefore(pl,hh)}}
var r0=render;render=function(){var r=r0.apply(this,arguments);try{decorate(document.getElementById('view'))}catch(e){}return r};
var a0=renderAuth;renderAuth=function(){var r=a0.apply(this,arguments);try{decorate(document.getElementById('auth-screen'))}catch(e){}return r};
try{decorate(document.getElementById('view'));decorate(document.getElementById('auth-screen'))}catch(e){}
})();
