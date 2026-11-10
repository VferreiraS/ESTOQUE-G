/* v105: e-mail obrigatório para ter conta e acesso (PC 1440×900 e iPhone 13).
   Criar conta sem e-mail ou com e-mail inválido é recusada; convite de auxiliar exige e-mail; conta antiga sem e-mail entra,
   mas a tela pede o e-mail (v107: com "Agora não" só para a sessão) até ser informado; conta com e-mail entra normal; o e-mail fica cifrado
   dentro da conta; o e-mail não muda o papel. */
const L=require('./lib.js');const {ok,until}=L;
async function seed(p,login,role,email){return p.evaluate(async([l,r,m])=>{const s=await authCreate(l,'Loja '+l,'1234',authEmpty(),r,m||undefined);authSaveNewAccount(s);return s.storeKey},[login,role,email||''])}
const gateOpen=p=>p.evaluate(()=>{const d=document.getElementById('email-gate');return !!(d&&d.open)});
async function fillSignup(p,l,email){await p.click('#auth-create');await fillFields(p,l,email)}
async function fillFields(p,l,email){await p.fill('#auth-screen input[name=store]','Loja '+l);await p.fill('#auth-screen input[name=login]',l);if(email!==null)await p.fill('#auth-screen input[name=email]',email);
 await p.fill('#auth-screen input[name=password]','1234');await p.fill('#auth-screen input[name=confirmation]','1234');const cb=await p.$('#auth-screen input[name=remember]');if(cb&&await cb.isChecked())await cb.uncheck();await L.terms(p,'#auth-form')}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['celular',L.devices['iPhone 13']]]){
  const P=await (await b.newContext(opts)).newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);
  /* 1) criar conta sem e-mail: o navegador barra (mensagem clara) e, mesmo sem a checagem do navegador, o app recusa */
  const l1='semmail'+nome+T;await fillSignup(P,l1,null);
  ok(await P.evaluate(()=>{const i=document.querySelector('#auth-screen input[name=email]');return !!i&&i.required&&!i.closest('label').hidden}),nome+': campo de e-mail obrigatório e visível');
  await P.click('#auth-form button[type=submit]');await P.waitForTimeout(800);
  ok(!(await P.$('.recovery-code')),nome+': sem e-mail não cria (validação do navegador)');
  ok(/Informe seu e-mail/.test(await P.evaluate(()=>document.querySelector('#auth-screen input[name=email]').validationMessage)),nome+': mensagem clara quando falta o e-mail');
  await P.evaluate(()=>{const f=document.getElementById('auth-form');f.noValidate=true});await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1500);
  ok(!(await P.$('.recovery-code'))&&/Informe seu e-mail/.test(await P.textContent('#auth-screen .auth-error')),nome+': sem e-mail o app recusa e explica');
  /* 2) e-mail inválido */
  await fillFields(P,l1,'abc@semponto');await P.evaluate(()=>{const f=document.getElementById('auth-form');if(f)f.noValidate=true});
  await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1500);
  ok(!(await P.$('.recovery-code'))&&/e-mail válido/.test(await P.textContent('#auth-screen .auth-error')),nome+': e-mail inválido é recusado');
  ok(await P.evaluate(async l=>!localStorage.getItem(await authStorageKey(l)),l1),nome+': nenhuma conta foi gravada');
  /* 3) com e-mail: cria, guarda cifrado e entra sem a tela obrigatória */
  await P.reload();await P.waitForTimeout(1500);const l3='commail'+nome+T,m3=L.mail(l3);await fillSignup(P,l3,m3);await P.click('#auth-form button[type=submit]');await P.waitForTimeout(2500);
  ok(!!(await P.$('.recovery-code')),nome+': com e-mail cria a conta');
  await P.fill('#recovery-last4',(await P.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await P.click('#recovery-enter');await P.waitForTimeout(2000);
  ok(await P.evaluate(m=>!!authSession&&authSession.payload.email===m,m3),nome+': e-mail fica na conta');
  ok(await P.evaluate(m=>!localStorage.getItem(authSession.storeKey).includes(m),m3),nome+': e-mail não fica em claro no registro da conta');
  ok(!(await gateOpen(P)),nome+': conta com e-mail não vê a tela obrigatória');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);await L.login(P,l3,'1234');await P.waitForTimeout(1200);
  ok(await P.evaluate(m=>!!authSession&&authSession.payload.email===m,m3)&&!(await gateOpen(P)),nome+': sai e entra de novo normal (e-mail continua cifrado na conta)');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  /* 4) conta antiga sem e-mail: entra, mas a tela obrigatória aparece e não fecha até informar */
  const l4='antiga'+nome+T,m4=L.mail(l4);await seed(P,l4,'estoque');await L.login(P,l4,'1234');
  ok(await until(P,()=>{const d=document.getElementById('email-gate');return !!(d&&d.open)},null,5000),nome+': conta antiga sem e-mail entra e vê a tela de informar o e-mail');
  ok(await P.evaluate(()=>!!authSession),nome+': ninguém fica trancado para fora (a conta abre)');
  ok(!!(await P.$('#email-gate button:has-text("Agora não")')),nome+': tem "Agora não" (v107)');
  await P.keyboard.press('Escape');await P.waitForTimeout(300);await P.keyboard.press('Escape');await P.waitForTimeout(300);ok(await gateOpen(P),nome+': Esc não fecha a tela');
  await P.evaluate(()=>document.getElementById('email-gate').close());ok(await until(P,()=>{const d=document.getElementById('email-gate');return !!(d&&d.open)},null,5000),nome+': se alguém fechar, a tela volta');
  await P.click('#email-gate button.primary');await P.waitForTimeout(300);ok(/Informe seu e-mail/.test(await P.textContent('#email-gate .eg-err'))&&await gateOpen(P),nome+': tela recusa e-mail vazio');
  await P.fill('#email-gate input[name=email]','nada@x');await P.click('#email-gate button.primary');await P.waitForTimeout(300);ok(/e-mail válido/.test(await P.textContent('#email-gate .eg-err'))&&await gateOpen(P),nome+': tela recusa e-mail inválido');
  await P.fill('#email-gate input[name=email]',m3);await P.click('#email-gate button.primary');await P.waitForTimeout(500);ok(/outra conta deste aparelho/.test(await P.textContent('#email-gate .eg-err'))&&await gateOpen(P),nome+': e-mail de outra conta do aparelho é recusado');
  await P.fill('#email-gate input[name=email]',m4.toUpperCase());await P.click('#email-gate button.primary');await P.waitForTimeout(1500);
  ok(!(await gateOpen(P))&&await P.evaluate(m=>authSession.payload.email===m&&localStorage.getItem('lojasg.estoque99.cloud-email:'+authSession.storeKey)===m,m4),nome+': e-mail salvo (na conta e para a nuvem) e a tela fecha');
  ok(await P.evaluate(()=>authSession.payload.role==='estoque'&&!labels.admin),nome+': e-mail não muda o papel (continua estoque, sem Administração)');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  await L.login(P,m4,'1234');await P.waitForTimeout(3500);ok(await P.evaluate(m=>!!authSession&&authSession.payload.email===m,m4)&&!(await gateOpen(P)),nome+': entra de novo (pelo e-mail) sem a tela');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  /* 5) conta antiga que já tinha o e-mail da nuvem: migra sozinha, sem tela */
  const l5='nuvem'+nome+T,m5=L.mail(l5);const k5=await seed(P,l5,'estoque');await P.evaluate(([k,m])=>localStorage.setItem('lojasg.estoque99.cloud-email:'+k,m),[k5,m5]);
  await L.login(P,l5,'1234');await P.waitForTimeout(1500);ok(!(await gateOpen(P))&&await until(P,m=>!!authSession&&authSession.payload.email===m,m5,5000),nome+': conta com e-mail da nuvem migra sem tela');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);await L.login(P,l5,'1234');await P.waitForTimeout(800);
  ok(await P.evaluate(m=>authSession.payload.email===m,m5),nome+': e-mail migrado ficou gravado na conta cifrada');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  /* 6) "Sair da conta" na tela obrigatória */
  const l6='sair'+nome+T;await seed(P,l6,'estoque');await L.login(P,l6,'1234');await until(P,()=>{const d=document.getElementById('email-gate');return !!(d&&d.open)},null,5000);
  await P.click('#email-gate .eg-out');ok(await until(P,()=>!authSession,null,5000),nome+': "Sair da conta" funciona na tela obrigatória');
  ok(!(await gateOpen(P)),nome+': tela some depois de sair');
  await P.close();
 }
 /* 7) convite de auxiliar exige e-mail */
 const G=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();G.on('pageerror',e=>errs.push('G '+e.message));G.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(G,'gv5'+T),'gestor com equipe');
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['celular',L.devices['iPhone 13']]]){
  const link=await L.makeInvite(G,'Aux '+nome);const B=await (await b.newContext(opts)).newPage();B.on('pageerror',e=>errs.push('B '+e.message));B.on('dialog',d=>d.accept());
  await B.goto(L.inviteUrl(link));await B.waitForTimeout(2500);await B.fill('#aux-form input[name=pin]',await G.evaluate(()=>{const k='lojasg.estoque99.aux-invites:'+authSession.storeKey;return JSON.parse(localStorage.getItem(k))[0].key}));
  await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);await B.waitForSelector('#aux-form input[name=password]',{timeout:15000}).catch(()=>{});
  ok(await B.evaluate(()=>{const i=document.querySelector('#aux-form input[name=email]');return !!i&&i.required}),nome+': convite pede e-mail (obrigatório)');
  await B.fill('#aux-form input[name=password]','2468');await B.fill('#aux-form input[name=confirmation]','2468');await L.terms(B,'#aux-form');
  await B.evaluate(()=>{document.querySelector('#aux-form input[name=email]').required=false;document.getElementById('aux-form').noValidate=true});await B.click('#aux-form button[type=submit]');await B.waitForTimeout(2000);
  ok(!(await B.$('.recovery-code'))&&/Informe seu e-mail/.test(await B.textContent('#auth-screen')),nome+': convite sem e-mail é recusado');
  await B.evaluate(()=>{document.getElementById('aux-form').noValidate=true});await B.fill('#aux-form input[name=email]','ruim@');await B.fill('#aux-form input[name=password]','2468');await B.fill('#aux-form input[name=confirmation]','2468');await L.terms(B,'#aux-form');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(2000);
  ok(!(await B.$('.recovery-code'))&&/e-mail válido/.test(await B.textContent('#auth-screen')),nome+': convite com e-mail inválido é recusado');
  const mb=L.mail('aux'+nome);await B.fill('#aux-form input[name=email]',mb);await B.fill('#aux-form input[name=password]','2468');await B.fill('#aux-form input[name=confirmation]','2468');await L.terms(B,'#aux-form');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
  ok(!!(await B.$('.recovery-code')),nome+': convite com e-mail cria a conta');
  await B.fill('#recovery-last4',(await B.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await B.click('#recovery-enter');await B.waitForTimeout(2500);
  ok(await B.evaluate(m=>!!authSession&&authSession.payload.role==='auxiliar'&&authSession.payload.email===m,mb)&&!(await gateOpen(B)),nome+': auxiliar entra com o e-mail na conta e sem a tela obrigatória');
  await B.close();
 }
 console.log('errors',errs);await b.close()})();
