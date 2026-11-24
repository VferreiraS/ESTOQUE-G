/* v164 · ícones de um só conjunto: grade 24 px, traço 1,75, pontas arredondadas (o mesmo desenho do v86/v128).
   Mantém a API e99Icon(nome, classe) e acrescenta os ícones que faltavam; troca os símbolos de texto usados como ícone
   na interface (✕ × ✖ ✓ ✔ ✅) por SVG do conjunto. Não mexe em texto digitado (mensagens, campos), nas reações do chat,
   no logo (Prateleira) nem no S da abertura. */
(function(){
'use strict';
var base=window.e99Icon;
var EXTRA={
 close:'<path d="M6 6l12 12M18 6 6 18"/>',
 check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.8 2.8L16 9.6"/>',
 'chevron-left':'<path d="m15 5-7 7 7 7"/>',
 'chevron-right':'<path d="m9 5 7 7-7 7"/>',
 'chevron-down':'<path d="m5 9 7 7 7-7"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
 send:'<path d="M21 3 10 14"/><path d="M21 3 14.5 21l-4.5-7-7-4.5z"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-9 9"/>',
 clip:'<path d="m20 11.5-7.8 7.8a5 5 0 0 1-7.1-7.1l8.2-8.2a3.4 3.4 0 0 1 4.8 4.8l-8.2 8.2a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/>',
 warn:'<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/>',
 pin:'<path d="M9 3h6l-1 6 3 3H7l3-3z"/><path d="M12 15v6"/>',
 'user-plus':'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M19 8v6M16 11h6"/>',
 filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'
};
function ic(n,cls){if(EXTRA[n])return '<svg class="ic'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+EXTRA[n]+'</svg>';return typeof base==='function'?base(n,cls):''}
ic.names=function(){return Object.keys(EXTRA)};
window.e99Icon=ic;

/* símbolo de texto usado como ícone → SVG */
var ONLY=/^\s*(✕|×|✖|✖️|✓|✔|✔️|✅)\s*$/,LEAD=/^\s*(✓|✔️?|✅)\s+/,ANY=/[✕×✖✓✔✅]/;
var MAP={'✕':'close','×':'close','✖':'close','✖️':'close','✓':'check','✔':'check','✔️':'check','✅':'check-circle'};
var SKIP='input,textarea,select,[contenteditable],.chat-msg .txt,.chat-msg .body,.chat-text,.reacts,.e99-react,#stok-intro,.logo,.lic-text,pre,code,script,style,.cf-count';
function frag(h){var t=document.createElement('template');t.innerHTML=h;return t.content}
function fixEl(el){if(!el||el.nodeType!==1||el.__p164)return;if(el.closest&&el.closest(SKIP))return;
  /* elemento cujo texto inteiro é o símbolo (botão de fechar, marcador) */
  if(el.children.length===0||(el.children.length===1&&el.firstElementChild.nodeName==='SPAN'&&el.firstElementChild.children.length===0)){
    var m=(el.textContent||'').match(ONLY);if(m&&/^(BUTTON|SPAN|I|B|A|DIV|SUMMARY|LABEL)$/.test(el.nodeName)){var name=MAP[m[1]]||MAP[m[1].replace(/️/g,'')];if(!name)return;el.__p164=1;
      if(name==='close'&&el.nodeName==='BUTTON'&&!el.getAttribute('aria-label'))el.setAttribute('aria-label','Fechar');
      el.textContent='';el.appendChild(frag(ic(name)));el.classList.add('p-icon-only');return}}
  /* "✓ Enviada", "✓ Conferido": símbolo no começo do texto */
  for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===3){var v=n.nodeValue;if(!v.trim())continue;var k=v.match(LEAD);if(k){var nm=MAP[k[1]]||MAP[k[1].replace(/️/g,'')]||'check';n.nodeValue=v.slice(k[0].length);el.insertBefore(frag(ic(nm,'ic-lead')),n);el.__p164=1}break}if(n.nodeType===1)break}}
function scan(root){if(!root||root.nodeType!==1)return;if(!ANY.test(root.textContent||''))return;fixEl(root);
  var all=root.querySelectorAll('button,span,i,b,small,div,summary,label,a,td,li,p');for(var i=0;i<all.length;i++){var e=all[i];if(e.__p164)continue;var t=e.firstChild&&e.firstChild.nodeType===3?e.firstChild.nodeValue:e.textContent;if(t&&ANY.test(t))fixEl(e)}}
var q=[],busy=false;
function flush(){busy=false;var list=q;q=[];for(var i=0;i<list.length;i++){try{var x=list[i];if(x.nodeType===3)x=x.parentNode;if(x&&x.isConnected)scan(x)}catch(e){}}}
try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++){var n=a[j];if(n.nodeType===1||(n.nodeType===3&&ANY.test(n.nodeValue)))q.push(n)}}
  if(q.length&&!busy){busy=true;(window.queueMicrotask||setTimeout)(flush)}}).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
if(document.body)scan(document.body);
window.e99Icons164={scan:scan};
})();
