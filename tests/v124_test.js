/* v124: "a senha está certa, mas diz que está errada". PC 1440×900 e iPhone 13.
   - erro diz qual conta deste aparelho foi testada + dica; "Mostrar" (já existia) continua;
   - mesma senha com espaço no fim ou acentos em outra forma Unicode (NFD) abre;
   - e-mail em 2 contas do aparelho: entra na conta que a senha abre; senha que abre as 2 pede o login; errada cita as 2;
   - erro do navegador que não é de senha não vira "Senha incorreta";
   - nenhuma conta é regravada por tentativa errada;
   - campo de login escondido nos formulários de troca de senha (gerenciador de senhas atualiza);
   - botão da abertura (v141: "Entrar"): destrava o áudio e toca o som uma vez; some; barra termina. */
const L=require('./lib.js');const {ok,until}=L;const U='http://localhost:8000/index.html?ntfy='+L.N;
const IOS=()=>{const O=window.AudioContext,G=Object.getOwnPropertyDescriptor(BaseAudioContext.prototype,'state').get;
 class F extends O{constructor(o){super(o);this.__s=1}get state(){return this.__s?'suspended':G.call(this)}
  resume(){const a=navigator.userActivation&&navigator.userActivation.isActive;return new Promise(r=>setTimeout(()=>{if(a)this.__s=0;super.resume().then(r,r)},300))}}
 window.AudioContext=F;window.webkitAudioContext=F};
async function ready(p){await p.waitForSelector('#auth-form input[name=password]');await until(p,()=>!!(window.e99Boot&&e99Boot.done()),null,8000)}
async function tryLogin(p,l,pw){await ready(p);await p.fill('#auth-form input[name=login]',l);await p.fill('#auth-form input[name=password]',pw);await p.click('#auth-form button[type=submit]');
 await until(p,()=>!!authSession||!!authError,null,15000);await p.waitForTimeout(300);return p.evaluate(()=>({ok:!!authSession,login:authSession&&authSession.record.login,err:authError}))}
async function out(p){await p.evaluate(async()=>{if(!authSession)return;dirty=false;document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});await authLogout()});await p.reload()}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
for(const [nome,opt] of [['PC',{viewport:{width:1440,height:900}}],['iPhone',L.devices['iPhone 13']]]){
 const ctx=await b.newContext(opt);await ctx.addInitScript(()=>{try{localStorage.setItem('lojasg.estoque99.remember-pref','off')}catch(e){}});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(nome+' '+e.message));p.on('dialog',d=>d.accept());
 await p.goto(U);await p.waitForTimeout(2000);
 const a='a'+nome.toLowerCase()+T,c='c'+nome.toLowerCase()+T,d='d'+nome.toLowerCase()+T,mail='dono'+nome.toLowerCase()+T+'@teste.com';
 await p.evaluate(async([a,c,d,mail])=>{
   const mk=async(l,pw,em)=>{const s=await authCreate(l,'Loja',pw,authEmpty(),'estoque',em);authSaveNewAccount(s);localStorage.setItem('lojasg.estoque99.cloud-email:'+s.storeKey,em);e99MailIdx.set(em,s.record.login)};
   await mk(a,'ação2026x',mail);await mk(c,'outra2026y',mail);await mk(d,'igual2026z','x'+mail)},[a,c,d,mail]);
 await p.reload();
 /* mensagem com o login + dica + nada regravado */
 const before=await p.evaluate(async(a)=>localStorage.getItem(await authStorageKey(a)),a);
 let r=await tryLogin(p,a,'errada2026');
 ok(!r.ok&&new RegExp('^Senha incorreta para a conta @'+a+' neste aparelho').test(r.err),nome+': erro diz qual conta deste aparelho ('+r.err+')');
 ok(await p.evaluate(()=>!!document.querySelector('#auth-screen .e99-pw-hint')),nome+': dica "a senha vale por aparelho" aparece');
 ok(await p.evaluate(async([a,s])=>localStorage.getItem(await authStorageKey(a))===s,[a,before]),nome+': tentativa errada não regrava a conta');
 /* Mostrar senha */
 await p.fill('#auth-form input[name=password]','abc123');await p.click('#auth-form .pw-toggle');
 ok(await p.evaluate(()=>{const i=document.querySelector('#auth-form input[name=password]');return i.type==='text'}),nome+': "Mostrar" deixa ver a senha digitada');
 await p.click('#auth-form .pw-toggle');ok(await p.evaluate(()=>document.querySelector('#auth-form input[name=password]').type==='password'),nome+': "Esconder" volta a esconder');
 /* espaço no fim e acentos em NFD */
 r=await tryLogin(p,a,'ação2026x ');ok(r.ok&&r.login===a,nome+': senha com espaço no fim abre');await out(p);
 r=await tryLogin(p,a,'ação2026x'.normalize('NFD'));ok(r.ok&&r.login===a,nome+': senha com acento em outra forma (NFD) abre');await out(p);
 /* e-mail em 2 contas */
 r=await tryLogin(p,mail,'outra2026y');ok(r.ok&&r.login===c,nome+': e-mail de 2 contas entra na conta que a senha abre (@'+(r.login||'-')+')');await out(p);
 r=await tryLogin(p,mail,'ação2026x');ok(r.ok&&r.login===a,nome+': e a outra conta do mesmo e-mail também ('+(r.login||r.err)+')');await out(p);
 r=await tryLogin(p,mail,'nenhuma2026');ok(!r.ok&&r.err.indexOf('@'+a)>=0&&r.err.indexOf('@'+c)>=0&&/^Senha incorreta/.test(r.err),nome+': senha errada cita as contas do e-mail');
 await p.evaluate(async([a,c,mail])=>{/* as duas com a mesma senha: pede o login */for(const l of [a,c]){const raw=localStorage.getItem(await authStorageKey(l));window['__r'+l]=raw}},[a,c,mail]);
 /* erro do navegador que não é de senha */
 await p.reload();await ready(p);
 await p.evaluate(()=>{window.__kb=authKeyBits;authKeyBits=async function(){throw new DOMException('teste','NotSupportedError')}});
 r=await tryLogin(p,d,'igual2026z');ok(!r.ok&&!/incorret/i.test(r.err)&&/conferir a senha neste navegador/.test(r.err),nome+': erro do navegador não vira "Senha incorreta" (mensagem própria)');
 await p.evaluate(()=>{authKeyBits=window.__kb;authError=''});
 r=await tryLogin(p,d,'igual2026z');ok(r.ok&&r.login===d,nome+': login normal funciona');
 /* campo de login escondido no "Trocar senha" */
 await p.evaluate(()=>go('account'));await p.waitForTimeout(600);
 ok(await p.evaluate((d)=>{const u=document.querySelector('form[onsubmit="authChangePassword(event)"] input[name=username]');return !!u&&u.value===d&&u.autocomplete==='username'&&u.offsetWidth<=1},d),nome+': Trocar senha tem o login escondido para o gerenciador de senhas');
 await out(p);await ctx.close()}
/* mesma senha em 2 contas do mesmo e-mail: pede o login */
{const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();p.on('dialog',d=>d.accept());await p.goto(U);await p.waitForTimeout(1500);
 const m='mesma'+T+'@teste.com',x='mx'+T,y='my'+T;
 await p.evaluate(async([x,y,m])=>{for(const l of [x,y]){const s=await authCreate(l,'Loja','mesma2026q',authEmpty(),'estoque',m);authSaveNewAccount(s);e99MailIdx.set(m,s.record.login)}},[x,y,m]);await p.reload();
 const r=await tryLogin(p,m,'mesma2026q');ok(!r.ok&&/mais de uma conta/.test(r.err)&&r.err.indexOf('@'+x)>=0,'PC: senha que abre 2 contas do e-mail pede o login');
 const r2=await tryLogin(p,y,'mesma2026q');ok(r2.ok&&r2.login===y,'PC: com o login entra');await ctx.close()}
/* v141: o "Toque para abrir" virou o botão "Entrar" (a abertura espera o toque; ver tests/v141_test.js) */
const GATE=()=>{try{sessionStorage.removeItem('e99-intro');localStorage.setItem('e99-test-gate','1');localStorage.removeItem('e99-test-autointro')}catch(e){}};
for(const [nome,opt,ios] of [['iPhone',L.devices['iPhone 13'],true],['iPhone menos movimento',{...L.devices['iPhone 13'],reducedMotion:'reduce'},true]]){
 const ctx=await b.newContext(opt);if(ios)await ctx.addInitScript(IOS);await ctx.addInitScript(GATE);
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(nome+' '+e.message));await p.goto(U);
 ok(await until(p,()=>!!document.querySelector('#stok-intro #si-enter'),null,3000),nome+': abertura mostra "Entrar"');
 const box=await p.evaluate(()=>{const b=document.getElementById('si-enter').getBoundingClientRect(),bar=document.getElementById('e99-boot');const br=bar?bar.getBoundingClientRect():{bottom:0};return {top:b.top,bottom:b.bottom,h:innerHeight,bar:br.bottom,text:document.getElementById('si-enter').textContent}});
 ok(box.top>box.bar&&box.bottom<=box.h&&box.text==='Entrar',nome+': botão embaixo, sem cobrir a barra de carregamento');
 await p.waitForTimeout(2200);await p.tap('#si-enter');
 ok(await until(p,()=>window.__e99LoginSounds===1,null,4000),nome+': tocar destrava o áudio e toca o som de abertura');
 ok(await until(p,()=>!document.getElementById('stok-intro'),null,1500),nome+': depois do toque a abertura some');
 ok(await until(p,()=>!!window.__e99Boot&&!document.body.classList.contains('e99-booting'),null,6000),nome+': barra termina e formulário liberado');
 await p.tap('#auth-form input[name=login]');await p.waitForTimeout(800);ok(await p.evaluate(()=>window.__e99LoginSounds===1),nome+': som não repete no toque seguinte');
 await ctx.close()}
ok(!errs.length,'sem erros de página '+errs.slice(0,3).join(' | '));
await b.close()})();
