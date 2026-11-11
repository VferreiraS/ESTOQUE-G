
(function(){
'use strict';
/* v73 · tela de entrar sem poluição: Login, Senha, Manter conectado, Entrar, "Esqueci a senha" e "Criar conta".
   As formas de recuperar (e-mail, código) e "Importar conta protegida" ficam numa folha. Nenhuma função saiu. */
function ver(){var m=document.querySelector('meta[name="estoque99-version"]');return m?m.content:''}
function closeSheet(){var d=document.getElementById('auth-sheet');if(d&&d.open)try{d.close()}catch(e){d.removeAttribute('open')}}
window.authSheetOpen=function(){var d=document.getElementById('auth-sheet');if(!d)return;if(typeof d.showModal==='function')try{d.showModal();return}catch(e){}d.setAttribute('open','')};
function opt(btn,title,sub){btn.className='as-opt';btn.innerHTML='<span>'+title+'</span><small>'+sub+'</small>'}
function tidy(){try{
  var box=document.getElementById('auth-screen');if(!box||box.hidden)return;
  var li=document.querySelector('#auth-form input[name=login]');
  if(li&&authMode==='login'&&!authPending&&li.getAttribute('placeholder')!=='Login, @usuário ou e-mail')li.setAttribute('placeholder','Login, @usuário ou e-mail');
  var h=document.getElementById('login-hint');if(h)h.remove();
  var f=document.getElementById('auth-form');
  if(f&&authMode==='login'&&!authPending&&!authRecoveryShow&&!document.getElementById('auth-links')){
    var links=document.createElement('div');links.id='auth-links';links.className='auth-links';
    links.innerHTML='<button type="button" class="auth-link" id="auth-forgot" onclick="authSheetOpen()" aria-haspopup="dialog">Esqueci a senha</button><button type="button" class="auth-link" id="auth-create" onclick="authSetMode(\'signup\')">Criar conta</button>';
    var d=document.createElement('dialog');d.id='auth-sheet';d.setAttribute('aria-labelledby','as-title');
    d.innerHTML='<div class="as"><h2 id="as-title">Recuperar acesso</h2><p class="small" style="margin:0 0 4px">Escolha como prefere voltar a entrar.</p><div class="as-slot"></div><button type="button" class="as-opt" id="as-code" onclick="authSetMode(\'recover\')"><span>Com o código de recuperação</span><small>O código que o Stok mostrou ao criar a conta</small></button><details><summary>Mais opções</summary><button type="button" class="as-opt" id="as-import" onclick="document.getElementById(\'auth-import\').click()"><span>Importar conta protegida</span><small>Arquivo exportado em Minha conta, com a senha dela</small></button></details><button type="button" class="as-close" onclick="this.closest(\'dialog\').close()">Fechar</button></div>';
    /* fecha a folha antes de abrir a próxima janela (fase de captura roda antes do clique do botão) */
    d.addEventListener('click',function(ev){if(ev.target===d){closeSheet();return}if(ev.target.closest&&ev.target.closest('.as-opt'))closeSheet()},true);
    var acts=box.querySelector('.auth-actions');
    f.after(links);(links.parentNode).insertBefore(d,links.nextSibling);
    if(acts)acts.classList.add('al-hide')}
  var sheet=document.getElementById('auth-sheet');
  if(sheet){var slot=sheet.querySelector('.as-slot');
    var mr=document.getElementById('mr-link');if(mr&&!sheet.contains(mr)){opt(mr,'Pelo e-mail','Recebe um link para criar uma senha nova');slot.appendChild(mr)}}
  var ll=box.querySelector('.legal-links');
  if(ll&&!ll.getAttribute('data-tidy')){ll.setAttribute('data-tidy','1');var a=ll.querySelectorAll('a');
    if(a[0]){a[0].textContent='Privacidade';a[0].setAttribute('aria-label','Política de privacidade')}if(a[1]){a[1].textContent='Termos';a[1].setAttribute('aria-label','Termos de uso')}
    ll.insertBefore(document.createTextNode('Versão '+ver()+' · '),ll.firstChild)}
}catch(e){}}
var rA=renderAuth;renderAuth=function(){var r=rA.apply(this,arguments);tidy();return r};
var box=document.getElementById('auth-screen');if(box&&window.MutationObserver)new MutationObserver(tidy).observe(box,{childList:true});
tidy();

/* Licenças: em Dados e ajuda (e pelo link "Licenças" no rodapé), nunca na tela de entrar */
function licHTML(){var el=document.getElementById('zxing-license'),t=el?el.textContent:'';
  var paras=t.replace(/\r/g,'').split(/\n[ \t]*\n/).map(function(p){return p.split('\n').map(function(l){return l.trim()}).join(' ').replace(/[ \t]+/g,' ').trim()}).filter(Boolean);
  return paras.map(function(p){return '<p>'+esc(p)+'</p>'}).join('')}
function panel(){var d=document.createElement('div');d.className='panel help';d.id='lic-panel';
  d.innerHTML='<h2>Licenças</h2><p>O leitor de código de barras usa a biblioteca ZXing 0.21.3 (© ZXing authors), licença Apache 2.0, de uso livre. O texto completo está abaixo e em <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener">apache.org/licenses/LICENSE-2.0</a>.</p><ul class="small" id="lic-list"><li><b>zxing-wasm 3.1.5</b> (© 2023 Ze-Zheng Wu), licença MIT — leitor principal da conferência por câmera; inclui <b>zxing-cpp</b> (© ZXing authors), licença Apache 2.0. Arquivos e licenças em <code>vendor/zxing-wasm/</code>.</li><li><b>Tesseract.js</b> e <b>tesseract.js-core</b>, licença Apache 2.0 — leitura de print de NFs, com o idioma português (<code>vendor/tesseract/</code>).</li><li><b>Fuse.js</b> (Apache 2.0) e <b>flatpickr</b> (MIT) — busca aproximada e calendário.</li><li>O XML da NF-e é lido pelo próprio navegador e o Excel (.xlsx) é gerado pelo app, sem biblioteca externa. Nada é baixado de outros sites.</li></ul><details class="lic-full"><summary>Ver texto completo (inglês)</summary><div class="lic-text">'+licHTML()+'</div></details>';return d}
var rr=render;render=function(){var r=rr.apply(this,arguments);try{if(authSession&&page==='data'){var v=document.getElementById('view');if(v&&!document.getElementById('lic-panel'))v.appendChild(panel())}}catch(e){}return r};
window.openLicenses=function(){go('data');setTimeout(function(){var p=document.getElementById('lic-panel');if(!p)return;var d=p.querySelector('details');if(d)d.open=true;p.scrollIntoView({block:'start'})},60)};
var fl=document.querySelector('footer .legal-links');if(fl&&!fl.querySelector('.lic-link')){fl.insertAdjacentHTML('beforeend',' · <a href="#" class="lic-link" onclick="openLicenses();return false">Licenças</a>')}
})();
