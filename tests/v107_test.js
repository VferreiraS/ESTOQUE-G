/* v107: "Agora não" na tela de e-mail das contas antigas (PC 1440×900 e iPhone 13).
   Deixa entrar sem e-mail; não reabre sozinha na mesma sessão; volta a pedir ao sair e entrar de novo e ao recarregar a página;
   conta com e-mail continua sem a tela; salvar depois de adiar funciona. */
const L=require('./lib.js');const {ok,until}=L;
async function seed(p,login){return p.evaluate(async l=>{const s=await authCreate(l,'Loja '+l,'1234',authEmpty(),'estoque');authSaveNewAccount(s);return s.storeKey},login)}
const gateOpen=p=>p.evaluate(()=>{const d=document.getElementById('email-gate');return !!(d&&d.open)});
const waitGate=p=>until(p,()=>{const d=document.getElementById('email-gate');return !!(d&&d.open)},null,6000);
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['celular',L.devices['iPhone 13']]]){
  const P=await (await b.newContext(opts)).newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);
  const l='adia'+nome+T,m=L.mail(l);await seed(P,l);await L.login(P,l,'1234');
  ok(await waitGate(P),nome+': conta antiga vê a tela do e-mail');
  const bt=await P.$('#email-gate button.eg-later');ok(!!bt&&/Agora não/.test(await bt.textContent()),nome+': botão "Agora não" existe');
  ok(await P.evaluate(()=>{const b=document.querySelector('#email-gate .eg-later');const r=b.getBoundingClientRect();return r.height>=44}),nome+': botão com toque ≥44 px');
  await bt.click();await P.waitForTimeout(500);
  ok(!(await gateOpen(P))&&await P.evaluate(()=>!!authSession),nome+': "Agora não" fecha e a conta fica aberta');
  await P.waitForTimeout(7000);ok(!(await gateOpen(P)),nome+': não volta sozinha na mesma sessão (passou a checagem de 3 s)');
  await P.evaluate(()=>go('nfs'));await P.waitForTimeout(800);await P.evaluate(()=>go('home'));await P.waitForTimeout(800);ok(!(await gateOpen(P)),nome+': trocar de tela não reabre');
  ok(await P.evaluate(()=>!authSession.payload.email),nome+': nada foi gravado como e-mail');
  /* sair e entrar de novo: pede outra vez */
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);await L.login(P,l,'1234');
  ok(await waitGate(P),nome+': ao entrar de novo pede o e-mail outra vez');
  await P.click('#email-gate .eg-later');await P.waitForTimeout(400);ok(!(await gateOpen(P)),nome+': adia de novo');
  /* recarregar a página: pede outra vez (se a sessão foi lembrada) ou pede no próximo login */
  await P.reload();await P.waitForTimeout(2500);
  if(await P.evaluate(()=>!!authSession))ok(await waitGate(P),nome+': recarregar a página volta a pedir');
  else{await L.login(P,l,'1234');ok(await waitGate(P),nome+': depois de recarregar, no próximo login volta a pedir')}
  /* salvar depois de adiar */
  await P.fill('#email-gate input[name=email]',m);await P.click('#email-gate button.primary');await P.waitForTimeout(1500);
  ok(!(await gateOpen(P))&&await P.evaluate(x=>authSession.payload.email===x,m),nome+': salvar o e-mail funciona');
  await P.waitForTimeout(1500);await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);await L.login(P,l,'1234');await P.waitForTimeout(2000);
  ok(!(await gateOpen(P)),nome+': com e-mail salvo não pede mais');
  await P.close();
 }
 console.log('errors',errs);await b.close()})();
