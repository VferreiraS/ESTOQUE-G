
(function(){
'use strict';
/* Botão "Mostrar/Ocultar" senha nos campos de senha da tela de acesso. */
function addPasswordToggles(){
  var box=document.getElementById('auth-screen');if(!box)return;
  box.querySelectorAll('label').forEach(function(label){
    var input=label.querySelector('input[type=password]');
    if(!input||label.querySelector('.pw-toggle'))return;
    var btn=document.createElement('button');
    btn.type='button';btn.className='pw-toggle';btn.textContent='Mostrar';
    btn.setAttribute('aria-label','Mostrar senha');btn.setAttribute('aria-pressed','false');
    btn.addEventListener('click',function(){
      var show=input.type==='password';
      input.type=show?'text':'password';
      btn.textContent=show?'Ocultar':'Mostrar';
      btn.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha');
      btn.setAttribute('aria-pressed',String(show));
    });
    label.appendChild(btn);
  });
}
var box=document.getElementById('auth-screen');
if(box&&window.MutationObserver){new MutationObserver(addPasswordToggles).observe(box,{childList:true,subtree:true});}
addPasswordToggles();
})();
