/* v147: o app não deixa criar contas duplicadas no mesmo e-mail (PC gestor 1440×900 + iPhone 13).
   Em cada caminho, um e-mail que já é de OUTRA conta do aparelho é recusado (também com maiúsculas e espaços):
   criar conta pela tela, authCreate direto, tela obrigatória de e-mail (v105), ligar o e-mail à nuvem, link de acesso do gestor
   (e-mail de conta do aparelho do gestor e de outro link), ativação do link, "Trazer da nuvem" e recuperar pelo e-mail.
   A mesma conta pode salvar de novo o próprio e-mail e trazer a própria conta da nuvem. */
const L=require('./lib.js');const {ok,until}=L;const URL0='http://localhost:8000/index.html?ntfy='+L.N;
const PRJ='gen-lang-client-0167474823',AU='http://127.0.0.1:9099';
const IN_USE=/Este e-mail já está em uso pela conta @/;
const weird=m=>'  '+m.toUpperCase()+'  ';
async function seed(p,login,email,pc){return p.evaluate(async([l,m,pc])=>{const s=await authCreate(l,'Loja '+l,'senha1234',authEmpty(),'estoque',m||undefined);authSaveNewAccount(s);
  if(pc)localStorage.setItem('lojasg.estoque99.pc-account:'+s.storeKey,'1');else if(m)localStorage.setItem('lojasg.estoque99.cloud-email:'+s.storeKey,m);return s.storeKey},[login,email||'',!!pc])}
const has=(p,l)=>p.evaluate(async l=>!!localStorage.getItem(await authStorageKey(l)),l);
const out=p=>p.evaluate(async()=>{window.confirm=()=>true;await authLogout()}).then(()=>p.waitForTimeout(900));
async function openSignup(p){await p.evaluate(()=>{localStorage.setItem('e99-test-signup','1');authSetMode('login')});await p.waitForTimeout(300);await p.waitForSelector('#auth-create',{timeout:10000}).catch(()=>{});await p.click('#auth-create')}
async function trySignup(p,l,email){await openSignup(p);await p.fill('#auth-screen input[name=store]','Loja '+l);await p.fill('#auth-screen input[name=login]',l);await p.fill('#auth-screen input[name=email]',email);
 await p.fill('#auth-screen input[name=password]','senha1234');await p.fill('#auth-screen input[name=confirmation]','senha1234');await L.terms(p,'#auth-form');
 await p.evaluate(()=>{document.getElementById('auth-form').noValidate=true});await p.click('#auth-form button[type=submit]');await p.waitForTimeout(1800)}
async function linkTry(p,email){return p.evaluate(async m=>{const f=document.createElement('form');f.innerHTML='<input name="email"><input name="password" type="password"><input name="lgpdok" type="checkbox" checked>';f.elements.email.value=m;f.elements.password.value='senha1234';
  await e99CloudLink({preventDefault(){},target:f});await new Promise(r=>setTimeout(r,300));const d=document.getElementById('cloud-link');return d?d.textContent:''},email)}
async function resetPw(email,np){const r=await (await fetch(`${AU}/emulator/v1/projects/${PRJ}/oobCodes`)).json();const c=(r.oobCodes||[]).filter(x=>x.requestType==='PASSWORD_RESET'&&x.email===email).pop();if(!c)return false;
 const q=await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=x`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({oobCode:c.oobCode,newPassword:np})});return q.ok}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 const dev=async(nome,opts)=>{const p=await (await b.newContext(opts)).newPage();p.on('pageerror',e=>errs.push(nome+' '+e.message));p.on('dialog',d=>d.accept());return p};
 /* ================= (A) mesmo aparelho, PC e iPhone ================= */
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['iPhone',L.devices['iPhone 13']]]){
  const P=await dev(nome,opts);await P.goto(URL0);await until(P,()=>!!window.__e99Boot,null,8000);await P.waitForTimeout(400);
  const la='ana'+nome.toLowerCase()+T,ma=L.mail(la),lp='pc'+nome.toLowerCase()+T,mp=L.mail(lp);
  await seed(P,la,ma);await seed(P,lp,mp,true);
  /* conta do PC antiga: índice apagado (só o e-mail cifrado sabe); ao entrar ele volta para o índice */
  await P.evaluate(()=>{localStorage.removeItem('lojasg.estoque99.cloud-logins2');localStorage.removeItem('lojasg.estoque99.mail-multi')});
  ok(await P.evaluate(async m=>!(await e99EmailOwner(m,'')),mp),nome+': antes de entrar, a conta do PC antiga ainda não está no índice');
  await L.login(P,lp,'senha1234');ok(await P.evaluate(()=>!!authSession),nome+': conta do PC entra');await out(P);
  ok(await P.evaluate(async([m,l])=>authLoginName(await e99EmailOwner(m,''))===l,[mp,lp]),nome+': ao entrar, o e-mail da conta do PC volta ao índice (só hash)');
  ok(await P.evaluate(m=>!JSON.stringify(localStorage).includes(m),mp),nome+': e-mail da conta do PC não fica em claro no aparelho');
  /* 1) criar conta pela tela */
  const lx='dup'+nome.toLowerCase()+T;await trySignup(P,lx,weird(ma));
  const e1=await P.textContent('#auth-screen .auth-error');ok(IN_USE.test(e1)&&e1.includes('@'+la)&&!(await P.$('.recovery-code')),nome+': criar conta com e-mail de outra conta (MAIÚSCULAS e espaços) é recusado: "'+e1.trim()+'"');
  ok(!(await has(P,lx)),nome+': nenhuma conta gravada');
  await P.evaluate(()=>authSetMode('login'));await trySignup(P,lx,mp.toUpperCase());ok(IN_USE.test(await P.textContent('#auth-screen .auth-error'))&&!(await has(P,lx)),nome+': e-mail da conta do PC também é recusado');
  await P.evaluate(()=>authSetMode('login'));const mx=L.mail(lx);await trySignup(P,lx,mx);ok(!!(await P.$('.recovery-code')),nome+': com e-mail livre cria normal');
  await P.fill('#recovery-last4',(await P.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await P.click('#recovery-enter');await P.waitForTimeout(1500);await out(P);
  /* 2) authCreate direto (todo caminho de criar passa por ele) */
  ok(await P.evaluate(async m=>{try{await authCreate('outra.'+Date.now(),'Loja','senha1234',authEmpty(),'estoque',m);return false}catch(e){return /já está em uso pela conta @/.test(e.message)}},weird(mx)),nome+': authCreate recusa o e-mail da conta recém-criada');
  ok(await P.evaluate(async([m,l])=>{try{await e99EmailCheck(m,l);return true}catch(e){return false}},[mx,lx]),nome+': a mesma conta pode usar o próprio e-mail');
  /* 3) tela obrigatória de e-mail (v105) */
  const lc='antiga'+nome.toLowerCase()+T,mc=L.mail(lc);await seed(P,lc,'');await L.login(P,lc,'senha1234');
  ok(await until(P,()=>{const d=document.getElementById('email-gate');return !!(d&&d.open)},null,6000),nome+': conta sem e-mail vê a tela obrigatória');
  await P.evaluate(()=>{document.querySelector('#email-gate form').noValidate=true});
  await P.fill('#email-gate input[name=email]',weird(ma));await P.click('#email-gate button.primary');await P.waitForTimeout(600);
  const e3=await P.textContent('#email-gate .eg-err');ok(IN_USE.test(e3)&&e3.includes('@'+la)&&await P.evaluate(()=>!authSession.payload.email),nome+': tela de e-mail recusa e-mail de outra conta: "'+e3.trim()+'"');
  await P.fill('#email-gate input[name=email]',' '+mc.toUpperCase()+' ');await P.click('#email-gate button.primary');await P.waitForTimeout(1500);
  ok(await P.evaluate(m=>authSession.payload.email===m&&localStorage.getItem('lojasg.estoque99.cloud-email:'+authSession.storeKey)===m,mc),nome+': e-mail livre salvo (normalizado)');
  /* 4) ligar o e-mail à nuvem */
  const t4=await linkTry(P,weird(ma));ok(IN_USE.test(t4),nome+': ligar à nuvem o e-mail de outra conta é recusado');
  const t5=await linkTry(P,mc);ok(!IN_USE.test(t5),nome+': a própria conta salva de novo o próprio e-mail (sem recusa)');
  ok(await until(P,m=>!!(e99Cloud.user()&&e99Cloud.user().email===m),mc,40000),nome+': e o e-mail próprio liga à nuvem');
  await P.evaluate(()=>{const d=document.getElementById('cloud-link');if(d&&d.open)d.close()});await out(P);
  /* 5) recarregar e conferir de novo (índice persistido) */
  await P.reload();await P.waitForTimeout(1500);await P.evaluate(()=>authSetMode('login'));await trySignup(P,'outro'+nome.toLowerCase()+T,weird(mc));
  ok(IN_USE.test(await P.textContent('#auth-screen .auth-error')),nome+': depois de recarregar continua recusando');
  ok(await has(P,la)&&await has(P,lp)&&await has(P,lc)&&await has(P,lx),nome+': nenhuma conta antiga foi apagada');
  await P.close();
 }
 /* ================= (B) gestor cria links + ativação no iPhone ================= */
 const G=await dev('G',{viewport:{width:1440,height:900}});ok(await L.gestorWithTeam(G,'gv147'+T),'gestor com equipe');
 const gm=await G.evaluate(()=>authSession.payload.email);const nInv=()=>G.evaluate(()=>JSON.parse(localStorage.getItem('lojasg.estoque99.aux-invites:'+authSession.storeKey)||'[]').length);
 await G.evaluate(()=>{window.__nt=[];const n=window.notify;window.notify=function(t){window.__nt.push(String(t));return n.apply(this,arguments)};go('chat')});await G.waitForTimeout(500);
 const inv=async(name,email)=>{await G.evaluate(()=>{navigator.share=t=>{window.__inv=t.text;return Promise.resolve()};const a=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(/^mailto:/.test(this.href)){window.__mailto=this.href;return}return a.call(this)}});
  const box=await G.$('#aux-box');if(box&&!(await box.evaluate(x=>x.open)))await G.click('#aux-box summary');await G.fill('#aux-box input[name=name]',name);await G.fill('#aux-box input[name=email]',email);
  await G.evaluate(()=>{document.querySelector('#aux-box form').noValidate=true;window.__nt=[]});await G.click('#aux-box button.primary');await G.waitForTimeout(2000);return G.evaluate(()=>window.__nt.join(' | '))};
 const n0=await nInv();const r1=await inv('Bia',weird(gm));ok(IN_USE.test(r1)&&(await nInv())===n0,'PC gestor: link com o e-mail da conta do gestor é recusado: "'+r1+'"');
 const mbia=L.mail('bia'+T);const r2=await inv('Bia',mbia);ok(!IN_USE.test(r2)&&(await nInv())===n0+1,'PC gestor: link com e-mail livre é criado');
 const r3=await inv('Caio',weird(mbia));ok(IN_USE.test(r3)&&r3.includes('@bia')&&(await nInv())===n0+1,'PC gestor: 2º link com o mesmo e-mail (MAIÚSCULAS/espaços) é recusado: "'+r3+'"');
 const it=await G.evaluate(()=>JSON.parse(localStorage.getItem('lojasg.estoque99.aux-invites:'+authSession.storeKey))[0]);const link=it.link;
 const B=await dev('B',L.devices['iPhone 13']);await B.goto(URL0);await B.waitForTimeout(1500);const ly='yara'+T,my=L.mail(ly);await seed(B,ly,my);
 await B.goto('about:blank');await B.goto(L.inviteUrl(link));await B.waitForTimeout(2500);if(await B.$('#aux-form input[name=pin]')){await B.fill('#aux-form input[name=pin]',it.key);await B.click('#aux-form button[type=submit]')}
 await B.waitForSelector('#aux-form input[name=password]',{timeout:15000}).catch(()=>{});ok(await B.inputValue('#aux-form input[name=email]')===mbia,'iPhone: link abre com o e-mail do convite');
 const act=async m=>{await B.fill('#aux-form input[name=email]',m);await B.fill('#aux-form input[name=password]','bia12345x');await B.fill('#aux-form input[name=confirmation]','bia12345x');await L.terms(B,'#aux-form');
  await B.evaluate(()=>{document.getElementById('aux-form').noValidate=true});await B.click('#aux-form button[type=submit]');await B.waitForTimeout(2200)};
 await act(weird(my));const eB=await B.evaluate(()=>{const e=document.querySelector('#auth-screen .auth-error');return e?e.textContent:''});
 ok(IN_USE.test(eB)&&eB.includes('@'+ly)&&!(await B.$('.recovery-code'))&&!(await has(B,'bia')),'iPhone: ativar com o e-mail de outra conta do aparelho é recusado: "'+eB.trim()+'"');
 await act(mbia);ok(!!(await B.$('.recovery-code'))||await B.evaluate(()=>!!authSession),'iPhone: ativar com o e-mail do convite funciona');
 /* ================= (C) nuvem: Trazer da nuvem e recuperar pelo e-mail ================= */
 const D1=await dev('D1',{viewport:{width:1440,height:900}});await D1.goto(URL0);await D1.waitForTimeout(1500);const ld='dora'+T;await L.signup(D1,ld);
 ok(await until(D1,()=>!!(window.e99Cloud&&e99Cloud.user()),null,40000),'PC: conta Dora ligada à nuvem');const md=await D1.evaluate(()=>e99Cloud.user().email);await out(D1);await D1.close();
 /* aparelho com uma conta antiga já duplicada (Eva usa o e-mail da Dora) */
 const dup=async p=>{await p.goto(URL0);await until(p,()=>!!window.__e99Boot,null,8000);await p.waitForTimeout(400);const k=await seed(p,'eva'+T,'');await p.evaluate(([k,m])=>{localStorage.setItem('lojasg.estoque99.cloud-email:'+k,m)},[k,md]);return k};
 const C=await dev('C',L.devices['iPhone 13']);const kE=await dup(C);
 await C.fill('#auth-form input[name=login]',ld);await C.fill('#auth-form input[name=password]','1234');await C.click('#auth-form button[type=submit]');
 await C.waitForSelector('#cloud-pull input[name=email]',{timeout:15000}).catch(()=>{});await C.fill('#cloud-pull input[name=email]',weird(md));await C.click('#cloud-pull button.primary');
 ok(await until(C,()=>/já está em uso pela conta @/.test((document.getElementById('cloud-pull')||{}).textContent||''),null,30000)&&!(await has(C,ld)),'iPhone: "Trazer da nuvem" recusa quando o e-mail já é de outra conta do aparelho');
 ok(await C.evaluate(()=>!authSession),'iPhone: não entrou em conta nenhuma');
 /* sem a conta duplicada: traz a própria conta */
 await C.evaluate(k=>{localStorage.removeItem(k);localStorage.removeItem('lojasg.estoque99.cloud-email:'+k);const d=document.getElementById('cloud-pull');if(d&&d.open)d.close()},kE);
 await C.reload();await C.waitForTimeout(1500);await C.fill('#auth-form input[name=login]',ld);await C.fill('#auth-form input[name=password]','1234');await C.click('#auth-form button[type=submit]');
 await C.waitForSelector('#cloud-pull input[name=email]',{timeout:15000}).catch(()=>{});await C.fill('#cloud-pull input[name=email]',md);await C.click('#cloud-pull button.primary');
 ok(await until(C,l=>!!authSession&&authLoginName(authSession.record.login)===l,ld,60000),'iPhone: "Trazer da nuvem" da própria conta funciona');
 ok(await C.evaluate(async m=>!(await e99EmailOwner(m,authSession.record.login)),md),'iPhone: a conta trazida pode usar o próprio e-mail');await C.close();
 /* recuperar pelo e-mail num aparelho com a conta duplicada */
 const R=await dev('R',{viewport:{width:1440,height:900}});const kR=await dup(R);
 await R.click('#auth-forgot');await R.click('#mr-link');await R.fill('#mail-rec input[name=email]',weird(md));await R.click('#mail-rec button.primary');await R.waitForSelector('#mail-rec input[name=cloud]');
 ok(await resetPw(md,'nuvem-147x'),'link de redefinição chegou ao e-mail');
 await R.fill('#mail-rec input[name=cloud]','nuvem-147x');await R.fill('#mail-rec input[name=password]','nova12345x');await R.fill('#mail-rec input[name=confirmation]','nova12345x');await R.click('#mail-rec button.primary');
 ok(await until(R,()=>/já está em uso pela conta @/.test((document.getElementById('mail-rec')||{}).textContent||''),null,30000)&&!(await has(R,ld))&&await R.evaluate(k=>!!localStorage.getItem(k),kR),'PC: recuperar pelo e-mail recusa (nada criado, conta antiga intacta)');
 console.log('errors',errs);await b.close()})();
