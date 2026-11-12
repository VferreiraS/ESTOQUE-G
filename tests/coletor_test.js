/* v142: conferência de volumes com coletor de dados (leitor Eyoyo no modo teclado HID: digita o código e manda Enter).
   PC 1440×900 gestor + iPhone 13 auxiliar (equipe pelo ntfy falso). O coletor é simulado com page.keyboard.type(código,{delay:5}) + Enter:
   conta, repete, inválido não conta, sem Enter (tempo) conta, digitação lenta ignorada, desfazer, volume à mão não é capturado,
   pausar/continuar a interrompida no modo coletor, finalizar → relatório "Coletor" + .xlsx, auxiliar às cegas, sem câmera nem ZXing, 0 erro. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs');
const SHOT=process.env.SHOT||'';
function dv(s){let sum=0;for(let i=0;i<s.length;i++){const d=+s[s.length-1-i];sum+=i%2===0?d*3:d}return String((10-sum%10)%10)}
const EAN='789100031550'+dv('789100031550'),BAD=EAN.slice(0,12)+((+EAN[12]+1)%10),ITF='1789100031550'+dv('1789100031550'),EAN2='789650000120'+dv('789650000120');
const SPY=()=>{window.__gum=0;try{const md=navigator.mediaDevices;if(md&&md.getUserMedia){const g=md.getUserMedia.bind(md);md.getUserMedia=c=>{window.__gum++;return g(c)}}}catch(e){}};
const count=p=>p.evaluate(()=>{const c=document.getElementById('cf-count');return c?+c.textContent:-1});
const total=p=>p.evaluate(()=>e99Conf.state()?e99Conf.state().total:-1);
async function scan(p,code,opt){await p.keyboard.type(code,{delay:5});if(!opt||opt.enter!==false)await p.keyboard.press('Enter');await p.waitForTimeout(350)}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 const watch=(p,tag)=>{p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|ERR_|ntfy|firebase|firestore|googleapis|status of 4\d\d/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept(d.defaultValue()))};
 const cA=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});await cA.addInitScript(SPY);const A=await cA.newPage();watch(A,'PC');
 const cB=await b.newContext(L.devices['iPhone 13']);await cB.addInitScript(SPY);const B=await cB.newPage();watch(B,'iPhone');
 ok(await L.gestorWithTeam(A,'colg'+T),'PC: gestor com equipe');
 await A.evaluate(async()=>{state.nfs[0].volumes=437;state.nfs[0].declaredVolumes=437;await save();go('nfs')});await A.waitForTimeout(500);
 ok(await A.isVisible('#conf-go-kbd')&&/Conferir com coletor/.test(await A.textContent('#conf-go-kbd')),'PC: botão "Conferir com coletor" junto da câmera');
 ok(await A.evaluate(()=>{const r=document.getElementById('conf-go-kbd').getBoundingClientRect();return r.height>=44}),'PC: botão do coletor com ≥44 px');
 await A.click('#conf-go-kbd');await A.waitForSelector('#cf-count');await A.waitForTimeout(400);
 ok(await A.evaluate(()=>!!document.getElementById('cf-kbdinfo')&&!document.getElementById('cf-video')&&/modo teclado \(HID\)/.test(document.getElementById('cf-kbdinfo').textContent)&&document.getElementById('cf-next').hidden),'PC: tela do coletor sem vídeo, com a dica do modo teclado');
 ok(await A.evaluate(()=>e99Conf.state().src==='coletor'&&e99Conf.state().status==='ativa'),'PC: conferência marcada como coletor');
 await scan(A,EAN);ok(await A.evaluate(()=>{const a=document.getElementById('cf-ask');return a&&!a.hidden&&/da CAIXA/.test(a.textContent)}),'PC: 1ª leitura do código pergunta se é da caixa');
 await scan(A,EAN);ok(await total(A)===0,'PC: com a pergunta aberta o coletor não conta');
 await A.click('#cf-yes');ok(await until(A,()=>e99Conf.state().total===1,null,3000),'PC: respondeu "sim" → conta 1');
 await scan(A,EAN);ok(await total(A)===2&&await count(A)===2,'PC: mesmo código de novo conta de novo (2)');
 await scan(A,BAD);ok(await total(A)===2&&/não aceito/.test(await A.textContent('#cf-msg')),'PC: código com dígito errado não conta e avisa');
 await scan(A,EAN,{enter:false});await A.waitForTimeout(300);ok(await total(A)===3,'PC: coletor sem Enter (pausa de 80 ms) conta (3)');
 await scan(A,ITF);ok(await total(A)===4,'PC: ITF-14 conta direto (4)');
 await A.keyboard.type(EAN,{delay:150});await A.keyboard.press('Enter');await A.waitForTimeout(500);ok(await total(A)===4,'PC: digitação lenta é ignorada');
 await A.click('#cf-undo');ok(await until(A,()=>e99Conf.state().total===3,null,3000),'PC: desfazer tira 1 (3)');
 await A.click('#cf-manual');await A.waitForSelector('#cf-mcode',{state:'visible'});await A.focus('#cf-mcode');await A.keyboard.type('CX'+T.slice(-4).toUpperCase(),{delay:5});await A.keyboard.press('Enter');
 ok(await until(A,()=>e99Conf.state().total===4,null,3000)&&await A.evaluate(()=>{const s=e99Conf.current();return s.reads.filter(r=>r.st==='v'&&r.m==='h').length===1}),'PC: volume à mão soma 1 e o coletor não captura o campo');
 await A.waitForTimeout(300);ok(await total(A)===4,'PC: nada contado a mais depois do volume à mão');
 ok(await A.evaluate(()=>window.__gum===0&&!window.ZXing&&!performance.getEntriesByType('resource').some(r=>/zxing/i.test(r.name))),'PC: não pediu câmera nem carregou o ZXing');
 /* pausar, fechar e continuar a interrompida: volta no modo coletor */
 await A.click('#cf-x');await A.waitForTimeout(800);ok(await until(A,()=>!!document.querySelector('[data-conf-res]')&&/coletor/.test(document.querySelector('.conf-banner').textContent),null,4000),'PC: conferência interrompida aparece com "(coletor)"');
 await A.click('[data-conf-res]');await A.waitForSelector('#cf-kbdinfo');ok(await until(A,()=>e99Conf.state()&&e99Conf.state().status==='ativa'&&e99Conf.state().src==='coletor',null,4000),'PC: "Continuar" reabre no modo coletor');
 await scan(A,EAN);ok(await total(A)===5,'PC: depois de continuar o coletor conta (5)');
 await A.click('#cf-finish');ok(await until(A,()=>!!document.querySelector('#conf-dlg .cf-rep'),null,4000),'PC: finalizar abre o relatório');
 ok(await A.evaluate(()=>{const t=document.querySelector('#conf-dlg .cf-rep').textContent;return /Pelo coletor/.test(t)&&/coletor/.test(document.querySelector('#conf-dlg .cf-hist').textContent)}),'PC: relatório mostra "Pelo coletor"');
 const cid=await A.evaluate(()=>document.getElementById('cf-xlsx').dataset.id);
 ok(await A.evaluate(i=>/Coletor/.test(e99Conf.csv(i))&&/"Leituras pelo coletor";"4"/.test(e99Conf.csv(i)),cid),'PC: CSV com método "Coletor"');
 const [dl]=await Promise.all([A.waitForEvent('download',{timeout:8000}).catch(()=>null),A.click('#cf-xlsx')]);let xok=false;if(dl){const f=await dl.path();const buf=fs.readFileSync(f);xok=buf.slice(0,2).toString()==='PK'&&buf.toString('latin1').indexOf('Coletor')>=0}ok(xok,'PC: Excel (.xlsx) com "Coletor"');
 ok(await A.evaluate(i=>{const c=state.confs.find(x=>x.id===i);return c&&c.src==='coletor'&&c.status==='finalizada'&&c.total===5},cid),'PC: state.confs guarda src coletor');
 ok(await A.evaluate(i=>validateConfs([{...state.confs.find(x=>x.id===i)}])[0].src==='coletor'&&!('src' in validateConfs([{...state.confs.find(x=>x.id===i),src:'x'}])[0]),cid),'validação aceita src coletor e descarta outros valores');
 await A.selectOption('#cf-assoc-sel','n1');await A.click('#cf-assoc-go');ok(await until(A,()=>!!document.getElementById('cf-cmp'),null,4000),'PC: associar a NF e comparar funciona igual');
 await A.click('#cf-close');await A.waitForTimeout(400);
 /* iPhone auxiliar: às cegas */
 const link=await L.makeInvite(A,'Ana');await L.auxAccept(B,link,null,'4321');
 ok(await until(B,()=>(state.nfs||[]).some(n=>n.number==='48213'),null,30000),'iPhone auxiliar recebeu as NFs');
 await B.evaluate(()=>go('nfs'));await B.waitForTimeout(600);ok(await B.isVisible('#conf-go-kbd'),'iPhone auxiliar: vê "Conferir com coletor"');
 await B.tap('#conf-go-kbd');await B.waitForSelector('#cf-count');await B.waitForTimeout(400);
 await scan(B,EAN2);await B.tap('#cf-yes');ok(await until(B,()=>e99Conf.state().total===1,null,3000),'iPhone auxiliar: coletor conta');
 await scan(B,EAN2);ok(await total(B)===2,'iPhone auxiliar: repete conta (2)');
 ok(await B.evaluate(()=>{const t=document.getElementById('conf-dlg').textContent;return !/437/.test(t)&&!/48213/.test(t)&&document.body.classList.contains('conf-on')&&document.activeElement&&!/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)}),'iPhone auxiliar: às cegas (sem volumes/NF) e sem campo focado (teclado virtual fechado)');
 ok(await B.evaluate(()=>[...document.querySelectorAll('#conf-dlg button')].filter(x=>x.offsetParent).every(x=>{const r=x.getBoundingClientRect();return r.height>=44||r.width>=44&&r.height>=32})),'iPhone: botões da tela com ≥44 px');
 if(SHOT)await B.screenshot({path:SHOT});
 await B.tap('#cf-finish');ok(await until(B,()=>!!document.querySelector('#conf-dlg .cf-rep'),null,4000),'iPhone auxiliar: finaliza');
 ok(await B.evaluate(()=>!document.getElementById('cf-assoc-sel')&&/Pelo coletor/.test(document.querySelector('#conf-dlg .cf-rep').textContent)),'iPhone auxiliar: relatório sem associar NF, com "Pelo coletor"');
 ok(await B.evaluate(()=>window.__gum===0),'iPhone: não pediu câmera');
 ok(await until(A,()=>(state.confs||[]).some(c=>c.src==='coletor'&&c.role==='auxiliar'&&c.total===2&&c.status==='finalizada'),null,30000),'gestor recebe pela equipe a conferência do coletor do auxiliar');
 ok(!errs.length,'sem erros de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})();
