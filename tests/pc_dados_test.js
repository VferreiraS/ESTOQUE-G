/* v100: "Na conta do PC não aparecem os dados das outras contas". Dados ficam no aparelho que os criou; o PC recebe pela equipe.
   Confere: PC sem equipe explica e mostra o caminho; mesmo login trazido da nuvem recebe os dados do iPhone; convite com o iPhone
   fechado mostra "Aguardando" e os dados chegam quando o iPhone abre. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs');
const HAS=(n)=>!!document.getElementById('local-note')&&new RegExp(n).test(document.getElementById('local-note').textContent);
(async()=>{const b=await L.chromium.launch();const errs=[];const pc=async()=>{const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());return p};
 // 1) conta nova no PC, sem equipe
 const W=await pc();await W.goto('http://localhost:8000/index.html?ntfy='+L.N);await W.waitForTimeout(1500);await L.signup(W,'pcsozinho'+Date.now());await W.evaluate(()=>go('home'));await W.waitForTimeout(600);
 ok(await W.evaluate(HAS,'Dados só neste aparelho'),'PC sem equipe: Início explica que os dados ficam no aparelho');
 ok(await W.evaluate(()=>/Convidar/.test(document.getElementById('local-note').textContent)&&/mesmo login e e-mail/.test(document.getElementById('local-note').textContent)),'mostra o caminho (convite ou mesmo login)');
 await W.click('#local-note button:not(.primary)');await W.evaluate(()=>render());await W.waitForTimeout(300);ok(await W.evaluate(()=>!document.getElementById('local-note')),'"Entendi" esconde o aviso');
 ok(/id="acc-local-note"/.test(fs.readFileSync(__dirname+'/../index.html','utf8')),'Administração diz que lista só as contas deste aparelho');
 // 2) iPhone com dados → PC com o mesmo login (trazido da nuvem)
 const I=await (await b.newContext(L.devices['iPhone 13'])).newPage();I.on('pageerror',e=>errs.push(e.message));I.on('dialog',d=>d.accept());const gl='ipc'+Date.now();
 ok(await L.gestorWithTeam(I,gl),'iPhone: gestor com NF, plano, equipe e corredor');ok(await until(I,()=>!!(window.e99Cloud&&e99Cloud.user()),null,20000),'iPhone na nuvem');
 const email=await I.evaluate(()=>e99Cloud.user().email);await I.evaluate(()=>e99Cloud.after(true));await I.waitForTimeout(1500);
 const P=await pc();await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);await L.login(P,gl,'1234');
 ok(await until(P,()=>!!document.querySelector('#cloud-pull[open]'),null,8000),'PC: mesmo login abre "Trazer da nuvem"');
 await P.fill('#cloud-pull input[name=email]',email);await P.click('#cloud-pull button.primary');ok(await until(P,()=>!!authSession,null,20000),'PC: conta trazida');
 ok(await until(P,()=>state.nfs.some(n=>n.number==='48213')&&state.plans.some(p=>p.id==='p1')&&state.corridors.some(c=>c.id==='c7')&&state.team.some(t=>t.id==='ana'),null,30000),'PC: NF, plano, corredor e equipe do iPhone chegam');
 await P.evaluate(()=>go('home'));await P.waitForTimeout(600);ok(await P.evaluate(()=>!document.getElementById('local-note')),'PC sincronizado: sem aviso');
 // 3) convite no PC com o iPhone fechado → aguardando; iPhone abre → dados chegam
 const link=await L.makeInvite(I,'Computador');const ictx=I.context();await I.close();
 const X=await pc();await L.auxAccept(X,link,null,'3690');ok(await until(X,()=>!!(window.e99Team&&e99Team.get())),'PC: entra por convite');
 await X.evaluate(()=>go('home'));await X.waitForTimeout(800);ok(await until(X,HAS,'Aguardando os dados da equipe',8000),'iPhone fechado: Início mostra "Aguardando os dados da equipe"');
 const I2=await ictx.newPage();I2.on('dialog',d=>d.accept());await I2.goto('http://localhost:8000/index.html?ntfy='+L.N);await I2.waitForTimeout(2000);await L.login(I2,gl,'1234');
 ok(await until(X,()=>state.nfs.some(n=>n.number==='48213')&&state.sync.ready,null,40000),'iPhone abre: dados chegam ao PC');
 await X.evaluate(()=>go('home'));await X.waitForTimeout(600);ok(await X.evaluate(()=>!document.getElementById('local-note')),'aviso some depois que os dados chegam');
 console.log('errors',errs);await b.close()})();
