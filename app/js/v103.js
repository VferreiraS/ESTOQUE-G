
(function(){
'use strict';
/* v103 (pedido do dono): excluir sem precisar abrir o editor. Usa o mesmo removeRecord (confirmação, limpa responsáveis, sync).
   Auxiliar não vê (o sync não aceita exclusão de auxiliar pelo ntfy). */
window.e99Del=async function(kind,id){if(!authSession||(window.isAux&&isAux())){notify('Só o gestor ou o estoque pode excluir.');return}if(['nf','corridor','person'].indexOf(kind)<0)return;
  var list=state[{nf:'nfs',corridor:'corridors',person:'team'}[kind]]||[];if(!list.some(function(x){return x.id===id}))return;editing={kind:kind,id:id};try{await removeRecord()}finally{editing=null}};
function btn(kind,id,label){var b=document.createElement('button');b.type='button';b.className='danger e99-del';b.textContent='Excluir';b.setAttribute('aria-label','Excluir '+label);b.addEventListener('click',function(ev){ev.stopPropagation();e99Del(kind,id)});return b}
function idFrom(el,kind){var m=String(el.getAttribute('onclick')||'').match(new RegExp("openEditor\\('"+kind+"','([^']+)'\\)"));return m?m[1]:''}
function deco(){if(!authSession||(window.isAux&&isAux()))return;var v=document.getElementById('view');if(!v)return;
  if(page==='nfs')v.querySelectorAll('button.nf-open').forEach(function(o){if(o.parentNode.querySelector('.e99-del'))return;var id=idFrom(o,'nf');if(id)o.insertAdjacentElement('afterend',btn('nf',id,'NF'))});
  if(page==='corridors')v.querySelectorAll('.corridor-card .cardtop > button[onclick^="openEditor(\'corridor\'"]').forEach(function(o){if(o.parentNode.querySelector('.e99-del'))return;var id=idFrom(o,'corridor');if(id)o.insertAdjacentElement('afterend',btn('corridor',id,'corredor'))});
  if(page==='team')v.querySelectorAll('.cards .card .cardtop > button[onclick^="openEditor(\'person\'"]').forEach(function(o){if(o.parentNode.querySelector('.e99-del'))return;var id=idFrom(o,'person');if(id)o.insertAdjacentElement('afterend',btn('person',id,'pessoa'))})}
var r0=render;render=function(){var r=r0.apply(this,arguments);try{deco()}catch(x){}return r};
var mo=new MutationObserver(function(){if(authSession&&page==='nfs')try{deco()}catch(x){}});function watch(){var v=document.getElementById('view');if(v)mo.observe(v,{childList:true,subtree:true});else setTimeout(watch,500)}watch();
})();
