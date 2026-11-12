
(function(){
'use strict';
/* LGPD: links para a Política de privacidade e os Termos de uso, aceite ao criar conta ou vincular e-mail
   (data guardada só neste aparelho) e aviso único sobre o armazenamento local. Não usa cookies nem rastreamento. */
var PRIV='./privacidade.html',TERMS='./termos.html',OK='lojasg.estoque99.lgpd-ok:',NOTE='e99-no-cookie-note';
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function put(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function link(href,text){return '<a href="'+href+'" target="_blank" rel="noopener">'+text+'</a>'}
var LINKS=link(PRIV,'Política de privacidade')+' · '+link(TERMS,'Termos de uso');
var agreed={};/* aceite lembrado só no mesmo formulário (sobrevive a um redesenho); cada formulário novo começa desmarcado */
function formKey(form){return form.id==='auth-form'?'signup':form.id==='aux-form'?'aux':form.closest&&form.closest('#cloud-link')?'cloud':(form.id||'outro')}
function accepted(storeKey){var v=get(OK+storeKey);if(!v)return null;try{return JSON.parse(v)}catch(e){return {em:v}}}
function record(storeKey){if(!storeKey||accepted(storeKey))return;put(OK+storeKey,JSON.stringify({em:new Date().toISOString(),versao:String(window.SITE_VERSION||(document.querySelector('meta[name="estoque99-version"]')||{}).content||'')}))}
window.e99LgpdAccepted=accepted;
function addBox(form,ref){if(!form||form.querySelector('input[name=lgpdok]'))return;var key=formKey(form),lab=document.createElement('label');lab.className='lgpd-check';
  lab.innerHTML='<input type="checkbox" name="lgpdok" required'+(agreed[key]?' checked':'')+'><span>Li e aceito a '+link(PRIV,'Política de privacidade')+' e os '+link(TERMS,'Termos de uso')+'.</span>';
  var inp=lab.querySelector('input');function tip(){try{inp.setCustomValidity(inp.checked?'':'Marque esta caixa para aceitar a Política de privacidade e os Termos de uso.')}catch(e){}}tip();inp.addEventListener('change',function(){agreed[key]=inp.checked;tip()});
  ref=ref||form.querySelector('button[type=submit],button.primary');if(ref&&ref.parentNode)ref.parentNode.insertBefore(lab,ref);else form.appendChild(lab)}
function boxOk(form){var b=form&&form.querySelector('input[name=lgpdok]');return !b||b.checked}
var MSG='Para continuar, marque “Li e aceito a Política de privacidade e os Termos de uso”.';
function mySession(){try{return authSession}catch(e){return null}}
function sync(){try{
  var box=document.getElementById('auth-screen');
  if(box&&!box.hidden){
    var f=document.getElementById('auth-form');
    if(f&&authMode==='signup'&&!authPending&&!authRecoveryShow)addBox(f);
    var a=document.getElementById('aux-form');
    if(a&&a.querySelector('input[name=password]'))addBox(a);
    if(!box.querySelector('.legal-links')){var p=document.createElement('p');p.className='legal-links';p.innerHTML=LINKS;var c=box.querySelector('.copyright');if(c)box.insertBefore(p,c);else box.appendChild(p)}
  }
  var s=mySession(),d=document.getElementById('cloud-link');
  if(!(box&&!box.hidden&&authMode==='signup'&&!authPending&&!authRecoveryShow))delete agreed.signup;
  if(!document.querySelector('#aux-form input[name=password]'))delete agreed.aux;
  if(!(d&&d.open))delete agreed.cloud;
  if(noteOn&&!get(NOTE)){if(!document.getElementById('storage-note'))makeNote();placeNote()}
  if(d&&s&&!accepted(s.storeKey)){var cf=d.querySelector('form');if(cf)addBox(cf,cf.querySelector('button.primary'))}
  var view=document.getElementById('view');
  if(s&&view&&typeof page==='string'){
    if(page==='account'&&!document.getElementById('legal-panel')){var acc=accepted(s.storeKey),w=document.createElement('div');w.className='grid2';
      w.innerHTML='<div class="panel help" id="legal-panel"><h2>Privacidade e termos</h2><p>Veja como o Stok trata os seus dados e as regras de uso.</p><p>'+LINKS+'</p><p class="small">'+(acc&&acc.em?'Aceite registrado neste aparelho em '+new Date(acc.em).toLocaleDateString('pt-BR')+'.':'Este aparelho ainda não tem o registro do seu aceite.')+' O Stok não usa cookies de rastreamento nem anúncios.</p></div>';
      view.appendChild(w)}
  }
}catch(e){}}
/* aceite obrigatório antes de criar a conta */
var subBefore=authSubmit;
authSubmit=async function(ev){var signup=authMode==='signup'&&!authPending&&!authRecoveryShow,form=ev&&ev.target;
  if(signup&&form&&!boxOk(form)){ev.preventDefault();authError=MSG;renderAuth();return}
  var r=await subBefore.apply(this,arguments);if(signup&&authRecoveryShow&&authRecoveryShow.session)record(authRecoveryShow.session.storeKey);return r};
if(typeof window.auxCreate==='function'){var auxBefore=window.auxCreate;
  window.auxCreate=async function(ev){var form=ev&&ev.target;if(form&&!boxOk(form)){ev.preventDefault();var b=form.querySelector('input[name=lgpdok]');if(b){b.focus();b.reportValidity&&b.reportValidity()}notify(MSG);return}
    var r=await auxBefore.apply(this,arguments);if(authRecoveryShow&&authRecoveryShow.session)record(authRecoveryShow.session.storeKey);return r}}
if(typeof window.e99CloudLink==='function'){var linkBefore=window.e99CloudLink;
  window.e99CloudLink=async function(ev){var form=ev&&ev.target,had=!!(form&&form.querySelector('input[name=lgpdok]'));if(form&&!boxOk(form)){ev.preventDefault();notify(MSG);return}
    var s=mySession();if(had&&s)record(s.storeKey);return linkBefore.apply(this,arguments)}}
/* aviso único sobre armazenamento (não bloqueia nada) */
var noteOn=false;
function closeNote(){noteOn=false;var n=document.getElementById('storage-note');if(n)n.remove();put(NOTE,new Date().toISOString())}
/* tela de entrar (body.locked): o aviso vai para dentro da área do login, embaixo do cartão; depois de entrar, volta a ser fixo no canto */
function placeNote(){var n=document.getElementById('storage-note');if(!n)return;var box=document.getElementById('auth-screen');
  if(document.body.classList.contains('locked')&&box&&!box.hidden){if(n.parentNode!==box){var ref=box.querySelector('.legal-links')||box.querySelector('.copyright');box.insertBefore(n,ref||null)}}
  else if(n.parentNode!==document.body)document.body.appendChild(n)}
function showNote(tries){if(get(NOTE)||document.getElementById('storage-note'))return;
  if(window.e99IntroHeld&&window.e99IntroHeld()){setTimeout(function(){showNote(tries||0)},800);return}
  if(document.getElementById('stok-gate')||document.getElementById('stok-intro')){if((tries||0)<30)setTimeout(function(){showNote((tries||0)+1)},800);return}
  noteOn=true;makeNote();placeNote()}
function makeNote(){
  var n=document.createElement('section');n.id='storage-note';n.setAttribute('role','region');n.setAttribute('aria-label','Aviso sobre dados guardados no aparelho');
  n.innerHTML='<p><b>Privacidade:</b> o Stok não usa cookies de rastreamento nem anúncios. Ele guarda neste aparelho só o necessário para funcionar (contas protegidas por senha, preferências e dados do estoque). Nuvem, chat e avisos usam serviços externos, explicados na '+link(PRIV,'Política de privacidade')+'.</p><div class="sn-actions"><button type="button">Entendi</button></div>';
  n.querySelector('button').addEventListener('click',closeNote);document.body.appendChild(n);return n}
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(document.querySelector('dialog[open]'))return;
  var n=document.getElementById('storage-note');if(n){closeNote();return}
  var ap=document.getElementById('alert-popup');if(ap&&!ap.classList.contains('hidden')&&typeof closeAlertPopup==='function')closeAlertPopup(60)});
if(window.MutationObserver)new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});
sync();setTimeout(showNote,1500);
})();
