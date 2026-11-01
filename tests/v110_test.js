/* v110: senha mais forte (contas novas: 8+ caracteres com letras e números; senha da nuvem PBKDF2 com sal da conta).
   Conta antiga (4 a 8 números) continua entrando, inclusive na nuvem; ao entrar o app pede a troca ("Agora não" nos primeiros 30 dias,
   depois obrigatória). A troca recifra a conta e atualiza a senha da nuvem. PC 1440×900 + iPhone 13. */
const L=require('./lib.js');const {ok,until}=L;
const STRONG=()=>{localStorage.setItem('e99-test-strong','1');localStorage.removeItem('e99-test-weak-pw')};
const dlgOpen=p=>p.evaluate(()=>{const d=document.getElementById('pw-upgrade');return !!(d&&d.open)});
const waitDlg=p=>until(p,()=>{const d=document.getElementById('pw-upgrade');return !!(d&&d.open)},null,8000);
async function page(b,opts){const c=await b.newContext(opts);await c.addInitScript(STRONG);const p=await c.newPage();p.on('dialog',d=>d.accept());await p.goto('http://localhost:8000/index.html?ntfy='+L.N);await p.waitForTimeout(1500);return p}
async function fillSignup(p,l,email,pw){await p.click('#auth-create');await p.fill('#auth-screen input[name=store]','Loja '+l);await p.fill('#auth-screen input[name=login]',l);await p.fill('#auth-screen input[name=email]',email);
 await p.fill('#auth-screen input[name=password]',pw);await p.fill('#auth-screen input[name=confirmation]',pw);const cb=await p.$('#auth-screen input[name=remember]');if(cb&&await cb.isChecked())await cb.uncheck();await L.terms(p,'#auth-form')}
async function enterRecovery(p){await p.fill('#recovery-last4',(await p.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await p.click('#recovery-enter');await p.waitForTimeout(2000)}
const cloudUser=p=>p.evaluate(()=>{try{const u=firebase.app().auth().currentUser;return u?u.email:''}catch(e){return ''}});
async function cloudTry(p,email,pass){return p.evaluate(async([m,pw])=>{try{const a=firebase.app().auth();await a.signOut();await a.signInWithEmailAndPassword(m,pw);return true}catch(e){return false}},[email,pass])}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['celular',L.devices['iPhone 13']]]){
  const P=await page(b,opts);P.on('pageerror',e=>errs.push(nome+' '+e.message));
  /* 1) conta nova: senha fraca é recusada */
  const l1='forte'+nome+T,m1=L.mail(l1);
  await fillSignup(P,l1,m1,'1234');await P.evaluate(()=>{const f=document.getElementById('auth-form');if(f)f.noValidate=true});await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1500);
  ok(!(await P.$('.recovery-code'))&&/8 caracteres/.test(await P.textContent('#auth-screen .auth-error')),nome+': conta nova com senha só de números é recusada');
  ok(await P.evaluate(()=>{const i=document.querySelector('#auth-screen input[name=password]');return i&&!i.getAttribute('inputmode')&&!i.getAttribute('pattern')}),nome+': campo de senha aceita letras (sem teclado só de números)');
  await P.reload();await P.waitForTimeout(1500);await fillSignup(P,l1,m1,'abcdefghij');await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1500);
  ok(!(await P.$('.recovery-code')),nome+': senha sem números é recusada');
  await P.reload();await P.waitForTimeout(1500);await fillSignup(P,l1,m1,'Est9');await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1500);
  ok(!(await P.$('.recovery-code')),nome+': senha curta é recusada');
  const pw1='estoque'+nome.length+'x2026';
  await P.reload();await P.waitForTimeout(1500);await fillSignup(P,l1,m1,pw1);await P.click('#auth-form button[type=submit]');await P.waitForTimeout(2500);
  ok(!!(await P.$('.recovery-code')),nome+': senha forte cria a conta');await enterRecovery(P);
  ok(await P.evaluate(()=>!!authSession),nome+': entra com a conta nova');ok(!(await dlgOpen(P)),nome+': conta nova não vê o pedido de troca');
  ok(await P.evaluate(([l,pw])=>authCloudDerive(l,pw).then(d=>d.startsWith('Stk2#')&&d.length===45),[l1,pw1]),nome+': senha da nuvem nova é PBKDF2 (Stk2#)');
  ok(await until(P,m=>{try{const u=firebase.app().auth().currentUser;return !!u&&u.email===m}catch(e){return false}},m1,20000),nome+': conta nova liga na nuvem com a senha forte');
  const d2=await P.evaluate(([l,pw])=>authCloudDerive(l,pw),[l1,pw1]);ok(await cloudTry(P,m1,d2),nome+': nuvem aceita a senha derivada PBKDF2');
  ok(await P.evaluate(([l,pw])=>Promise.all([authCloudDerive(l,pw),authCloudDerive(l+'z',pw)]).then(a=>a[0]!==a[1]),[l1,pw1]),nome+': sal por conta (mesma senha, contas diferentes → senhas da nuvem diferentes)');
  await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  /* 2) conta antiga (senha 1234) continua entrando, inclusive na nuvem, e recebe o pedido de troca */
  const l2='antiga'+nome+T,m2=L.mail(l2);
  const k2=await P.evaluate(async([l,m])=>{const s=await authCreate(l,'Loja '+l,'1234',authEmpty(),'estoque',m);authSaveNewAccount(s);localStorage.setItem('lojasg.estoque99.cloud-email:'+s.storeKey,m);return s.storeKey},[l2,m2]);
  await L.login(P,l2,'1234');ok(await P.evaluate(()=>!!authSession),nome+': conta antiga com 1234 entra');
  ok(await until(P,m=>{try{const u=firebase.app().auth().currentUser;return !!u&&u.email===m}catch(e){return false}},m2,20000),nome+': conta antiga liga na nuvem com a senha antiga');
  const d1=await P.evaluate(l=>authCloudDerive(l,'1234'),l2);ok(d1.startsWith('Stk#')&&d1.length===44,nome+': senha antiga da nuvem continua a fórmula antiga (nada mudou na nuvem)');
  ok(await waitDlg(P),nome+': aparece o pedido para trocar a senha');
  ok(!!(await P.$('#pw-upgrade .pu-later')),nome+': nos primeiros 30 dias tem "Agora não"');
  await P.click('#pw-upgrade .pu-later');await P.waitForTimeout(500);ok(!(await dlgOpen(P)),nome+': "Agora não" fecha');
  await P.waitForTimeout(4000);ok(!(await dlgOpen(P)),nome+': não volta na mesma sessão');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);await L.login(P,l2,'1234');ok(await waitDlg(P),nome+': volta a pedir no próximo login');
  /* 3) troca pelo pedido */
  await P.fill('#pw-upgrade input[name=current]','9999');await P.fill('#pw-upgrade input[name=password]','novasenha77');await P.fill('#pw-upgrade input[name=confirmation]','novasenha77');await P.click('#pw-upgrade button.primary');await P.waitForTimeout(1500);
  ok(/incorreta/.test(await P.textContent('#pw-upgrade .pu-err'))&&await dlgOpen(P),nome+': senha atual errada é recusada');
  await P.fill('#pw-upgrade input[name=current]','1234');await P.fill('#pw-upgrade input[name=password]','12345678');await P.fill('#pw-upgrade input[name=confirmation]','12345678');await P.click('#pw-upgrade button.primary');await P.waitForTimeout(800);
  ok(/8 caracteres/.test(await P.textContent('#pw-upgrade .pu-err')),nome+': nova senha fraca é recusada');
  const pw2='novasenha77';await P.fill('#pw-upgrade input[name=current]','1234');await P.fill('#pw-upgrade input[name=password]',pw2);await P.fill('#pw-upgrade input[name=confirmation]',pw2);await P.click('#pw-upgrade button.primary');
  ok(await until(P,()=>{const d=document.getElementById('pw-upgrade');return !(d&&d.open)},null,15000),nome+': troca feita, o pedido fecha');
  ok(await until(P,()=>page==='account'&&!!document.querySelector('.recovery-code'),null,8000),nome+': mostra o novo código de recuperação em Minha conta');
  const d3=await P.evaluate(([l,pw])=>authCloudDerive(l,pw),[l2,pw2]);
  ok(await until(P,async([m,d])=>{try{const a=firebase.app().auth();if(!a.currentUser)return false;const c=firebase.auth.EmailAuthProvider.credential(m,d);await a.currentUser.reauthenticateWithCredential(c);return true}catch(e){return false}},[m2,d3],20000),nome+': senha da nuvem foi trocada para a nova (PBKDF2)');
  ok(!(await cloudTry(P,m2,d1)),nome+': a senha antiga da nuvem não vale mais');
  await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});authShownCode=null;window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  await L.login(P,l2,'1234');ok(await P.evaluate(()=>!authSession),nome+': senha antiga do app não entra mais');
  await P.reload();await P.waitForTimeout(1500);await L.login(P,l2,pw2);ok(await P.evaluate(()=>!!authSession),nome+': entra com a senha nova');await P.waitForTimeout(3500);ok(!(await dlgOpen(P)),nome+': sem pedido de troca depois de trocar');
  await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  /* 4) depois de 30 dias: obrigatória */
  const l4='prazo'+nome+T;await P.evaluate(async([l,m])=>{const s=await authCreate(l,'Loja '+l,'5678',authEmpty(),'estoque',m);authSaveNewAccount(s);localStorage.setItem('lojasg.estoque99.pc-account:'+s.storeKey,'1');localStorage.setItem('lojasg.estoque99.pw-upgrade:'+s.storeKey,String(Date.now()-31*86400000))},[l4,L.mail(l4)]);
  await L.login(P,l4,'5678');ok(await waitDlg(P),nome+': depois do prazo o pedido aparece');
  ok(!(await P.$('#pw-upgrade .pu-later'))&&/obrigatória/.test(await P.textContent('#pw-upgrade')),nome+': depois do prazo não tem "Agora não" (obrigatória, com aviso)');
  await P.keyboard.press('Escape');await P.waitForTimeout(300);await P.keyboard.press('Escape');await P.waitForTimeout(400);ok(await dlgOpen(P),nome+': Esc não fecha quando é obrigatória');
  await P.click('#pw-upgrade .pu-out');ok(await until(P,()=>!authSession,null,5000),nome+': dá para sair da conta');
  await P.close();
 }
 console.log('errors',errs);await b.close()})();
