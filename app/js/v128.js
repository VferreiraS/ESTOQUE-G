
/* v128 · acabamento: ícones SVG no lugar de emoji/símbolo, plural certo ("1 dia", "2 dias") e pequenos ajustes de texto.
   Só mexe em texto e ícone; não muda dados, login, sincronização nem criptografia. */
(function(){
  /* ícone de fechar no mesmo conjunto (traço) */
  var base=window.e99Icon;
  var EXTRA={close:'<path d="M6 6l12 12M18 6 6 18"/>',warn:'<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/>'};
  if(typeof base==='function'){window.e99Icon=function(n,cls){if(EXTRA[n])return '<svg class="ic'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+EXTRA[n]+'</svg>';return base(n,cls)}}
  /* plural: "3 dia(s)" → "3 dias"; "1 pendência(s)" → "1 pendência" */
  function pl(t){if(typeof t!=='string'||t.indexOf('(s)')<0)return t;var n=null;
    return t.replace(/(\d[\d.]*)|([.;:·—!?\n()])|([A-Za-zÀ-ÿ]+)\(s\)/g,function(m,num,p,w){if(num){n=parseInt(num.replace(/\./g,''),10);return m}if(p){if(p!=='('&&p!==')')n=null;return m}if(n===null||isNaN(n))return m;return n===1?w:w+'s'})}
  window.e99Plural=pl;
  function fixNode(root){try{if(!root)return;if(root.nodeType===3){var v=root.nodeValue,pa=root.parentNode;if(pa&&pa.closest&&pa.closest('.lic-text,[lang^=en]'))return;if(v&&v.indexOf('(s)')>=0){var f=pl(v);if(f!==v)root.nodeValue=f}return}
    if(root.nodeType!==1||!root.textContent||root.textContent.indexOf('(s)')<0)return;
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),x;while((x=w.nextNode())){if(x.nodeValue.indexOf('(s)')>=0&&!(x.parentNode&&(/^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/.test(x.parentNode.nodeName)||(x.parentNode.closest&&x.parentNode.closest('.lic-text,[lang^=en]'))))){var g=pl(x.nodeValue);if(g!==x.nodeValue)x.nodeValue=g}}}catch(e){}}
  var queue=[],sched=false;function flush(){sched=false;var q=queue;queue=[];for(var i=0;i<q.length;i++)fixNode(q[i])}
  try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==='characterData')queue.push(m.target);else for(var j=0;j<m.addedNodes.length;j++)queue.push(m.addedNodes[j])}if(!sched&&queue.length){sched=true;(window.queueMicrotask||setTimeout)(flush)}}).observe(document.documentElement,{childList:true,subtree:true,characterData:true})}catch(e){}
  if(document.body)fixNode(document.body);
  /* janelas do navegador (confirmar/avisar) com o mesmo plural */
  try{var c0=window.confirm,a0=window.alert;window.confirm=function(m){return c0.call(window,pl(String(m==null?'':m)))};window.alert=function(m){return a0.call(window,pl(String(m==null?'':m)))}}catch(e){}
  /* "Sair da conta" do menu do celular com ícone, como os outros itens */
  function emptyCorr(v){try{if(typeof page==='undefined'||page!=='corridors'||!state||(state.corridors||[]).length)return;var c=v.querySelector('h2.vh+.cards');if(!c||c.children.length)return;var aux=typeof window.isAux==='function'&&window.isAux();
    c.insertAdjacentHTML('afterend','<div class="panel e99-empty"><div class="empty"><h3>Nenhum corredor cadastrado.</h3><p>Cadastre os corredores para organizar o estoque e dar um responsável a cada setor.</p>'+(aux?'':'<button type="button" onclick="openEditor(\'corridor\')">Adicionar corredor</button>')+'</div></div>')}catch(e){}}
  function deco(){try{var v=document.getElementById('view');if(!v)return;emptyCorr(v);v.querySelectorAll('.mobile-options button[onclick="authLogout()"]').forEach(function(b){if(b.querySelector('svg.ic')||!window.e99Icon)return;b.insertAdjacentHTML('afterbegin',e99Icon('out'))})}catch(e){}}
  if(typeof render==='function'){var r0=render;render=function(){var r=r0.apply(this,arguments);deco();return r}}
  deco();
})();
