/* v95: "Colar planejamento da semana" no Plano — lê a mensagem do WhatsApp e cria um plano por dia */
const L=require('./lib.js');const {ok}=L;const fs=require('fs');const path=require('path');
const MSG=fs.readFileSync(path.join(__dirname,'fixtures','planejamento-27-10.txt'),'utf8');
const WANT=[['2026-10-27','Mutirão: Aramados, paredão de cestos e lixeiras'],['2026-10-28','Mutirão: Potes plásticos avulsos e conjuntos'],['2026-10-29','Mutirão: Marinex e potes de vidro'],
 ['2026-10-30','Mutirão: Cutelaria ganchos, talheres avulsos e ferramentas no gancho'],['2026-10-31','Organização e finalização da loja, com validação de todas as ofertas vigentes, garantindo destaque, posicionamento e precificação correta']];
const isOpen=()=>{const d=document.getElementById('colar-dlg');return !!(d&&d.open)};
async function openDlg(p){await p.evaluate(()=>{go('plans');scrollTo(0,0)});await p.waitForTimeout(300);await p.click('#view .more-actions summary');await p.click('#view .more-actions button[onclick="colarPlanoOpen()"]');await p.waitForTimeout(200)}
async function paste(p,text,start){await p.fill('#cp-text',text);await p.fill('#cp-start',start);await p.dispatchEvent('#cp-start','change');await p.waitForTimeout(500)}
(async()=>{const b=await L.chromium.launch();const errs=[];
 const c=await b.newContext({...L.devices['iPhone 13']});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8000/index.html?ntfy='+L.N);await p.waitForSelector('#auth-form input[name=login]');await p.waitForTimeout(800);
 const login='colar'+Date.now().toString(36);await L.signup(p,login);
 await p.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];state.plans=[{id:'p0',title:'Plano antigo',date:'2026-10-27',activities:[{id:'a0',title:'Repor arroz',owner:'Ana',notes:'',photos:[]}]}];await save();go('plans')});
 await p.waitForTimeout(400);

 /* 1. leitura da mensagem real */
 const r=await p.evaluate(t=>e99ColarParse(t,'2026-10-27'),MSG);
 ok(r.days.length===5&&r.days.every((d,i)=>d.date===WANT[i][0]&&d.title===WANT[i][1]),'leitor: 5 dias de 27 a 31/10 com os títulos certos ('+r.days.map(d=>d.title).join(' | ')+')');
 ok(!/\p{Extended_Pictographic}|[*_~]/u.test(r.days.map(d=>d.title).join(' ')),'leitor: títulos sem emoji nem asterisco');
 ok(r.general.length>0&&r.general.length<=3000&&/Monitoramento estará acompanhando/.test(r.general)&&!/Mutirão no setor|POTES PLÁSTICOS|NOSSA MISSÃO/.test(r.general)&&!/\p{Extended_Pictographic}|\*/u.test(r.general),'leitor: o resto da mensagem vira orientação geral (sem os dias, sem emoji, até 3000)');
 ok(/iniciarmos a segunda-feira focados/.test(r.general),'leitor: "segunda-feira" no meio de uma frase não vira dia');
 const fm=await p.evaluate(()=>e99ColarParse('**SEGUNDA**\nMutirão de limpeza\n\nTerça-feira (28/10) – Repor *CAFÉ* no corredor 7\n\nQUARTA Inventário de bazar\n\nquinta-feira: conferir validade\n\nSegunda-feira vamos começar cedo\n\n🟢 *SÁBADO:* **ABASTECER CD**','2026-10-26'));
 ok(fm.days.map(d=>d.date+' '+d.title).join('|')==='2026-10-26 Mutirão: Limpeza|2026-10-27 Repor café no corredor 7|2026-10-28 Inventário de bazar|2026-10-29 Conferir validade|2026-10-31 Abastecer CD'&&/vamos começar cedo/.test(fm.general),'leitor: aceita **SEGUNDA**, "Terça-feira (28/10) –", QUARTA, "quinta-feira:" e SÁBADO com emoji');
 ok(await p.evaluate(()=>e99ColarParse('SEGUNDA: x\n\n'+'palavra '.repeat(800),'2026-10-26').general.length<=3000),'leitor: orientação geral cortada em 3000');

 /* 2. botão, janela e prévia */
 ok(!!await p.$('#view .more-actions button[onclick="colarPlanoOpen()"]'),'botão "Colar planejamento da semana" em "Mais ações" do Plano');
 await openDlg(p);ok(await p.evaluate(isOpen),'janela abre');
 const def=await p.inputValue('#cp-start');ok(await p.evaluate(v=>{const d=new Date(v+'T12:00:00'),t=new Date();t.setHours(12,0,0,0);return d.getDay()===1&&d>t&&(d-t)<=7*864e5},def),'padrão: a próxima segunda-feira ('+def+')');
 ok(await p.$eval('#cp-owner',s=>s.value==='TODOS'&&[...s.options].some(o=>o.value==='Ana')),'responsável padrão TODOS (dá para escolher alguém da Equipe)');
 ok(await p.isChecked('#cp-incl'),'"Incluir as orientações gerais na descrição" vem marcada');
 await paste(p,MSG,'2026-10-27');
 const pv=await p.$$eval('#colar-dlg .cp-row',rs=>rs.map(x=>x.querySelector('.cp-date').value+' '+x.querySelector('.cp-t').value));
 ok(pv.length===5&&pv.every((x,i)=>x===WANT[i][0]+' '+WANT[i][1]),'prévia: uma linha por dia com data e atividade');
 ok(await p.$eval('#cp-warn',w=>!w.hidden&&/terça/.test(w.textContent)),'avisa quando a data escolhida não é segunda');
 await p.uncheck('#colar-dlg .cp-row:nth-child(5) .cp-on');ok(/Criar 4 dias/.test(await p.textContent('#cp-save')),'desmarcar um dia tira ele da conta');
 await p.check('#colar-dlg .cp-row:nth-child(5) .cp-on');ok(/Criar 5 dias no Plano/.test(await p.textContent('#cp-save')),'marcar de novo volta para 5');

 /* 3. salvar */
 await p.click('#cp-save');await p.waitForTimeout(1500);
 const toast=await p.textContent('#toast');ok(/5 dias criados no Plano/.test(toast),'mensagem "5 dias criados no Plano" ('+toast+')');
 const pl=await p.evaluate(()=>state.plans.filter(x=>x.title==='Planejamento da semana').map(x=>({d:x.date,a:x.activities.map(a=>({t:a.title,o:a.owner,n:a.notes}))})).sort((a,b)=>a.d.localeCompare(b.d)));
 ok(pl.length===5&&pl.every((x,i)=>x.d===WANT[i][0]&&x.a.length===1&&x.a[0].t===WANT[i][1]&&x.a[0].o==='TODOS'),'cria 5 planos (27, 28, 29, 30 e 31/10), uma atividade cada, responsável TODOS');
 ok(pl.every(x=>x.a[0].n.length<=3000&&/Monitoramento estará acompanhando/.test(x.a[0].n)),'orientações gerais vão na descrição (até 3000)');
 ok(await p.evaluate(()=>state.plans.length===6&&state.plans.find(x=>x.id==='p0').activities.length===1),'nada criado para o texto que não é dia; plano antigo intacto');
 ok(await p.evaluate(()=>{try{validatePlans(state.plans);return true}catch(e){return false}}),'planos passam no validatePlans');
 ok(await p.evaluate(()=>{const d=document.getElementById('colar-dlg');return !d.open&&page==='plans'&&document.querySelectorAll('#view .plan-card').length===6}),'janela fecha e o Plano mostra os dias');

 /* 4. colar duas vezes não duplica */
 await openDlg(p);await paste(p,MSG,'2026-10-27');await p.click('#cp-save');await p.waitForTimeout(1000);
 ok(/Nada novo/.test(await p.textContent('#toast'))&&await p.evaluate(()=>state.plans.length===6&&state.plans.every(x=>x.activities.length===1)),'colar de novo não duplica e avisa ('+await p.textContent('#toast')+')');
 await p.evaluate(()=>colarPlanoClose());

 /* 5. texto colado nunca vira HTML */
 await openDlg(p);await paste(p,'SEGUNDA: <img src=x onerror="window.__xss=1"> teste\n\n<b>oi</b><script>window.__xss=2</script>','2026-10-26');
 ok(await p.evaluate(()=>!window.__xss&&!document.querySelector('#colar-dlg img,#colar-dlg b script')&&/<img/.test(document.querySelector('#colar-dlg .cp-t').value)),'texto colado aparece como texto (sem HTML)');
 await p.evaluate(()=>colarPlanoClose());

 /* 6. ficou gravado: sai, entra de novo e os planos continuam */
 await p.goto('http://localhost:8000/index.html?ntfy='+L.N);await p.waitForSelector('#auth-form input[name=login]');await p.waitForTimeout(800);await L.login(p,login);
 ok(await p.evaluate(()=>state.plans.filter(x=>x.title==='Planejamento da semana').length===5),'planos gravados (continuam depois de entrar de novo)');

 /* 7. auxiliar não vê o botão */
 await p.evaluate(()=>{authSession.payload.role='auxiliar';go('plans')});await p.waitForTimeout(400);
 ok(await p.evaluate(()=>!document.querySelector('#view button[onclick="colarPlanoOpen()"]')),'auxiliar não vê o botão');
 await p.evaluate(()=>colarPlanoOpen());ok(!await p.evaluate(isOpen),'auxiliar não abre a janela');

 console.log('errors',errs);await b.close()})();
