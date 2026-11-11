
(function(){
'use strict';
/* P22: logo depois de entrar, o aviso "Atenção aos prazos" aparece compacto (título + botão), sem ocupar a tela */
var enteredAt=0;if(typeof authEnter==='function'){var aE=authEnter;authEnter=function(){enteredAt=Date.now();return aE.apply(this,arguments)}}
function compact(){var b=document.getElementById('alert-popup');if(!b)return;if(b.classList.contains('hidden')){b.__open=false;return}if(b.__open||b.__v90===b.innerHTML.length)return;b.__v90=b.innerHTML.length;
  if(Date.now()-enteredAt>15000){b.classList.remove('compact');return}
  if(b.querySelector('.alert-more'))return;var n=(b.querySelector('.small')||{}).textContent||'';b.classList.add('compact');var m=document.createElement('button');m.type='button';m.className='alert-more';m.textContent='Ver pendências'+(/^\d+/.test(n)?' ('+n.match(/^\d+/)[0]+')':'');m.onclick=function(){b.__open=true;b.classList.remove('compact');m.remove()};b.appendChild(m)}
var box=document.getElementById('alert-popup');if(box&&window.MutationObserver)new MutationObserver(compact).observe(box,{childList:true,attributes:true,attributeFilter:['class']});
})();
