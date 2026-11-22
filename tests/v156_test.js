/* v156: imprimir textos (folha branca, sem botões) e avisos de todas as alterações da equipe (cápsula, sino/Alertas, aba pisca no PC).
   PC 1440×900 gestor + iPhone 13 auxiliar, pela nuvem do emulador. */
const L=require('./lib.js');const {ok,until}=L;
const HID=()=>{window.__hid=false;Object.defineProperty(Document.prototype,'hidden',{configurable:true,get:()=>window.__hid});
  Object.defineProperty(Document.prototype,'visibilityState',{configurable:true,get:()=>window.__hid?'hidden':'visible'});
  window.__setHidden=v=>{window.__hid=v;document.dispatchEvent(new Event('visibilitychange'))}};
const CAP=()=>{window.__ph=[];window.open=function(){return {document:{open(){},write(h){window.__ph.push(h)},close(){}},focus(){},print(){window.__printed=(window.__printed||0)+1}}}};
function checkPrint(h,must){const bad=[];if(!h)return ['sem html'];if(/<button|<script|onclick=/i.test(h))bad.push('tem botão/script');if(!/background:#fff/.test(h))bad.push('fundo não branco');
  if(/#0a0a0c|#121215|#0B0B0D/i.test(h))bad.push('fundo escuro');(must||[]).forEach(m=>{if(h.indexOf(m)<0)bad.push('falta '+m)});return bad}
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const cA=await b.newContext({viewport:{width:1440,height:900}});await cA.addInitScript(HID);const A=await cA.newPage();
 A.on('pageerror',e=>errs.push('PC '+e.message));A.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon/i.test(m.text()))errs.push('PC console '+m.text())});A.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(A,'pa'+T),'PC: gestor com equipe');
 const link=await L.makeInvite(A,'Bia','');
 const cB=await b.newContext(L.devices['iPhone 13']);await cB.addInitScript(HID);const B=await cB.newPage();
 B.on('pageerror',e=>errs.push('iPhone '+e.message));B.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon/i.test(m.text()))errs.push('iPhone console '+m.text())});B.on('dialog',d=>d.accept());
 await L.auxAccept(B,link,'','Senha1234x');
 ok(await until(B,()=>typeof authSession!=='undefined'&&!!authSession&&!!window.e99Alt&&syncStatus().ready,null,40000),'iPhone: auxiliar entrou e sincronizou');
 ok(await until(B,()=>(state.plans||[]).some(p=>p.id==='p1'),null,30000),'iPhone: recebeu o plano do gestor');

 /* ===== A) imprimir ===== */
 await A.evaluate(CAP);
 await A.evaluate(()=>{state.plans[0].activities[0].notes='Corredor 07\nPrateleira de cima';state.plans[0].activities[0].demanda='Quebras';return save()});
 await A.evaluate(()=>go('plans'));await A.waitForTimeout(600);
 await A.click('.plan-card button:has-text("Imprimir")');await A.waitForTimeout(500);
 let h=await A.evaluate(()=>window.__ph[window.__ph.length-1]);
 let bad=checkPrint(h,['Plano de ação','1. Repor arroz no 07','<b>Responsável:</b> Ana','<b>Orientações:</b> Corredor 07\nPrateleira de cima','<b>Demanda:</b> Quebras','Stok · Lojas G · Estoque 99']);
 ok(!bad.length&&await A.evaluate(()=>window.__printed>=1),'PC: Imprimir no cartão do plano gera folha branca organizada'+(bad.length?' — '+bad.join(', '):''));
 /* folha de compartilhamento */
 await A.evaluate(()=>copyPlan('p1'));await A.waitForTimeout(500);
 ok(await A.isVisible('#e99m-print'),'PC: botão Imprimir na folha de compartilhamento');
 await A.click('#e99m-print');await A.waitForTimeout(400);h=await A.evaluate(()=>window.__ph[window.__ph.length-1]);bad=checkPrint(h,['1. Repor arroz no 07']);
 ok(!bad.length,'PC: Imprimir da folha gera o mesmo conteúdo'+(bad.length?' — '+bad.join(', '):''));
 await A.evaluate(()=>e99Msg.close());
 /* texto com HTML é escapado */
 h=await A.evaluate(()=>e99Msg.printHtml({title:'<img src=x onerror=alert(1)>',sections:[{title:'S',lines:[{b:'<b>x</b>',sub:['Nota: <script>a()</script>']}]}]}));
 ok(!/<img src=x|<script>a/.test(h)&&/&lt;script&gt;/.test(h),'PC: texto de usuário escapado na impressão');
 /* plano do dia */
 await A.evaluate(()=>{planFilter=state.plans[0].date;render()});await A.waitForTimeout(300);
 ok(await A.isVisible('#plan-print-day'),'PC: botão "Imprimir o dia" com data filtrada');
 await A.click('#plan-print-day');await A.waitForTimeout(300);h=await A.evaluate(()=>window.__ph[window.__ph.length-1]);bad=checkPrint(h,['Plano de terça','Repor arroz']);
 ok(!bad.length,'PC: imprimir o dia'+(bad.length?' — '+bad.join(', '):''));
 await A.evaluate(()=>{planFilter='';render()});
 /* caixa "Copiar plano" (texto pronto) */
 h=await A.evaluate(()=>{document.getElementById('share-text').value='Linha 1\nLinha *2*';document.getElementById('share-print').click();return window.__ph[window.__ph.length-1]});
 ok(/<pre class="txt">Linha 1\nLinha 2<\/pre>/.test(h)&&!/<button/.test(h),'PC: Imprimir na caixa de texto para copiar');
 /* reserva em iframe quando a janela é bloqueada */
 const fr=await A.evaluate(async()=>{window.open=()=>null;e99Msg.print(e99Msg.planPayload(planById('p1')));const f=document.querySelector('iframe.e99-print-frame');const t=f&&f.contentDocument.body.innerText;f&&f.remove();return t||''});
 ok(/Repor arroz no 07/.test(fr),'PC: reserva em iframe imprime o mesmo texto');
 await A.evaluate(CAP);
 /* iPhone auxiliar imprime */
 await B.evaluate(CAP);await B.evaluate(()=>go('plans'));await B.waitForTimeout(600);
 await B.click('.plan-card button:has-text("Imprimir")');await B.waitForTimeout(400);h=await B.evaluate(()=>window.__ph[window.__ph.length-1]);bad=checkPrint(h,['Repor arroz no 07']);
 ok(!bad.length,'iPhone: auxiliar imprime o plano'+(bad.length?' — '+bad.join(', '):''));

 /* ===== B) avisos de alterações ===== */
 await A.evaluate(()=>go('home'));await B.evaluate(()=>go('home'));await A.waitForTimeout(1500);
 const orig=await A.evaluate(()=>document.title);
 ok(await A.evaluate(()=>e99Alt.list().length===0),'PC: carga inicial não gerou aviso');
 await A.evaluate(()=>__setHidden(true));
 await B.evaluate(async()=>{state.nfs.push({id:'nb1',number:'843114',supplier:'Forn B',date:iso(),status:'Pendente',owner:'',notes:'',volumes:2});await save()});
 ok(await until(A,()=>e99Alt.list().some(e=>/criou a NF 843114/.test(e.text)),null,30000),'PC: NF nova do auxiliar entra nas alterações');
 const pill=await A.evaluate(()=>{const p=document.querySelector('#e99-alt .e99-alt-pill');return p?{t:p.textContent,r:document.getElementById('e99-alt').getAttribute('role')}:null});
 ok(pill&&/Bia criou a NF 843114/.test(pill.t)&&pill.r==='status','PC: cápsula no topo "'+(pill&&pill.t)+'"');
 ok(await until(A,()=>e99TitleState().on&&e99TitleState().alts>=1,null,5000),'PC: aba pisca com a alteração');
 {const seen=new Set();for(let i=0;i<6;i++){seen.add(await A.evaluate(()=>document.title));await A.waitForTimeout(350)}
  ok([...seen].some(t=>/^\(\d+\) Nova(s)? altera(ção|ções) · Stok$/.test(t))&&seen.has(orig),'PC: título alterna "'+[...seen].join(' | ')+'"')}
 await A.evaluate(()=>__setHidden(false));await A.waitForTimeout(800);ok(await A.evaluate(o=>!e99TitleState().on&&document.title===o,orig),'PC: ao voltar o foco o título volta');
 /* toque abre a tela */
 await A.evaluate(()=>{const p=document.querySelector('#e99-alt .e99-alt-pill');if(p)p.click()});await A.waitForTimeout(500);
 ok(await A.evaluate(()=>page==='nfs'),'PC: tocar no aviso abre Notas fiscais');
 /* some em ~5 s */
 await B.evaluate(async()=>{state.nfs.find(n=>n.id==='nb1').notes='obs';await save()});
 ok(await until(A,()=>!!document.querySelector('#e99-alt .e99-alt-pill'),null,30000),'PC: alteração da NF mostra aviso');
 await A.waitForTimeout(6500);ok(await A.evaluate(()=>!document.querySelector('#e99-alt .e99-alt-pill')),'PC: aviso some sozinho');
 /* agrupa várias do mesmo tipo */
 await B.evaluate(async()=>{for(let i=0;i<3;i++)state.nfs.push({id:'nbg'+i,number:'90'+i,supplier:'G',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1});await save()});
 ok(await until(A,()=>/3 alterações em notas fiscais/.test(e99Alt.current()),null,30000),'PC: agrupa "'+await A.evaluate(()=>e99Alt.current())+'"');
 /* sino/Alertas */
 await A.evaluate(()=>go('alerts'));await A.waitForTimeout(500);
 const lst=await A.evaluate(()=>{const p=document.getElementById('alt-recent');return p?p.innerText:''});
 ok(/Alterações recentes/.test(lst)&&/Bia/.test(lst)&&/criou a NF 843114/.test(lst)&&/\d\d\/\d\d\/\d{4} \d\d:\d\d/.test(lst),'PC: "Alterações recentes" nos Alertas');
 /* nome com HTML é escapado */
 ok(await A.evaluate(()=>{e99OnTeamChange([{op:{c:'nfs',i:'zz',t:1,b:'<img src=x onerror=window.__x=1>',u:'outro',x:{id:'zz',number:'<b>1</b>'}},prev:null}]);return !document.querySelector('#alt-recent img')&&!document.querySelector('#e99-alt img')&&!window.__x}),'PC: dados de outra pessoa escapados');
 /* a própria alteração não avisa (e chega no iPhone como aviso, sem piscar) */
 const before=await A.evaluate(()=>e99Alt.list().length);
 await B.evaluate(()=>__setHidden(true));const bt=await B.evaluate(()=>document.title);
 await A.evaluate(async()=>{state.plans[0].activities.push({id:'a2',title:'Separar caixas',owner:'Bia',notes:'',photos:[]});await save()});
 ok(await until(B,()=>e99Alt.list().some(e=>/criou a atividade “Separar caixas”/.test(e.text)),null,30000),'iPhone: alteração do gestor entra nas alterações');
 ok(await B.evaluate(t=>document.title===t&&!e99TitleState().on,bt),'iPhone: aba não pisca');
 await A.waitForTimeout(2000);ok(await A.evaluate(n=>e99Alt.list().length===n,before),'PC: a própria alteração não avisa');
 await B.evaluate(()=>__setHidden(false));
 /* preferência desliga */
 await A.evaluate(()=>go('account'));await A.waitForTimeout(600);
 ok(await A.isVisible('#pref-alt-btn'),'PC: preferência "Avisar alterações da equipe" em Preferências');
 await A.click('#pref-alt-btn');await A.waitForTimeout(300);
 ok(await A.evaluate(()=>!e99Alt.on()&&localStorage.getItem('lojasg.estoque99.team-alt')==='off'),'PC: preferência desligada');
 await A.evaluate(()=>{go('home');__setHidden(true)});await A.waitForTimeout(6000);
 const n0=await A.evaluate(()=>e99Alt.list().length);
 await B.evaluate(async()=>{state.nfs.push({id:'nb2',number:'555',supplier:'X',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1});await save()});
 await until(A,n=>e99Alt.list().length>n,n0,30000);
 ok(await A.evaluate(()=>!document.querySelector('#e99-alt .e99-alt-pill')&&!e99TitleState().on),'PC: com a preferência desligada não mostra aviso nem pisca');
 await A.evaluate(()=>{__setHidden(false);e99Alt.set(true)});
 ok(!errs.length,'0 erro de console'+(errs.length?': '+errs.join(' | '):''));
 await b.close();console.log('fim')})().catch(e=>{console.log('FAIL erro',e);process.exit(1)});
