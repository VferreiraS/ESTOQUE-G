/* v143: demandas do estoque. PC 1440×900 gestor + iPhone 13 auxiliar (equipe pelo ntfy falso).
   Campo "Demanda" no editor do plano (Sem demanda + 7 fixas, na ordem), etiqueta na lista, atividade sem demanda igual,
   valor fora da lista descartado sem derrubar o plano (também no validatePlans da v142), cartão "Demandas do estoque" no Início, 0 erro. */
const L=require('./lib.js');const {ok,until}=L;const {execSync}=require('child_process');const vm=require('vm');
const SHOTS=process.env.SHOTS||'';
const DEM=['Organização do Estoque (em geral)','Quebras','Leves danos','Vencimentos','Separação de mercadorias','Organização dos papelões','Receber e conferir mercadorias'];
async function newAct(p,title,dem,tap){await p.evaluate(()=>{openPlan()});await p.waitForSelector('#plan-editor .e99-dem-sel');
 const opts=await p.$$eval('#plan-editor .e99-dem-sel option',o=>o.map(x=>[x.value,x.textContent]));
 await p.fill('#plan-editor .plan-edit-item textarea',title);if(dem)await p.selectOption('#plan-editor .e99-dem-sel',dem);
 if(tap)await p.tap('#plan-editor button[type=submit]');else await p.click('#plan-editor button[type=submit]');await p.waitForTimeout(800);return opts}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 const watch=(p,tag)=>{p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|ERR_|ntfy|firebase|firestore|googleapis|status of 4\d\d/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())};
 const A=await b.newPage({viewport:{width:1440,height:900}});watch(A,'PC');
 const B=await b.newPage(L.devices['iPhone 13']);watch(B,'iPhone');
 ok(await L.gestorWithTeam(A,'demg'+T),'PC: gestor com equipe');
 /* compatibilidade: o validatePlans da v142 aceita (ignora) o campo novo */
 const old=execSync('git show 121e3dd:app/js/core.js',{cwd:__dirname+'/..',maxBuffer:1<<26}).toString().match(/function validatePlans\(plans\)\{.*\}\n/)[0];
 const ctx={safePlanId:id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(id),validDate:d=>/^\d{4}-\d{2}-\d{2}$/.test(d)};vm.createContext(ctx);vm.runInContext(old,ctx);
 let oldOk=false;try{const r=ctx.validatePlans([{id:'p9',title:'X',date:'2026-11-13',activities:[{id:'a9',title:'Y',owner:'TODOS',notes:'',photos:[],demanda:'Quebras'}]}]);oldOk=r[0].activities[0].demanda==='Quebras'}catch(e){}
 ok(oldOk,'v142: validatePlans antigo aceita atividade com demanda (não derruba o plano)');
 /* editor: 8 opções na ordem */
 await A.evaluate(()=>go('plans'));await A.waitForTimeout(400);
 const opts=await newAct(A,'Separar quebras do corredor 07','Quebras');
 ok(opts.length===8&&opts[0][0]===''&&opts[0][1]==='Sem demanda'&&opts.slice(1).every((o,i)=>o[0]===DEM[i]&&o[1]===DEM[i]),'PC: select "Demanda" com Sem demanda + as 7 na ordem');
 ok(await A.evaluate(()=>{const a=state.plans.flatMap(p=>p.activities).find(x=>x.title==='Separar quebras do corredor 07');return a&&a.demanda==='Quebras'}),'PC: atividade salva com demanda "Quebras"');
 ok(await A.evaluate(()=>[...document.querySelectorAll('.plan-activities li')].some(li=>/Separar quebras/.test(li.textContent)&&li.querySelector('.act-dem')&&li.querySelector('.act-dem').textContent==='Quebras')),'PC: lista do Plano mostra a etiqueta da demanda');
 ok(await A.evaluate(()=>{const li=[...document.querySelectorAll('.plan-activities li')].find(l=>/Repor arroz no 07/.test(l.textContent));return li&&!li.querySelector('.act-dem')&&!('demanda' in state.plans.find(p=>p.id==='p1').activities[0])}),'PC: atividade antiga sem demanda fica igual (sem etiqueta)');
 await newAct(A,'Atividade sem demanda '+T,'');
 ok(await A.evaluate(t=>{const a=state.plans.flatMap(p=>p.activities).find(x=>x.title===t);return a&&!('demanda' in a)},'Atividade sem demanda '+T),'PC: "Sem demanda" não grava o campo');
 /* editar: trocar a demanda */
 await A.evaluate(()=>{const p=state.plans.find(p=>p.activities.some(a=>a.title==='Separar quebras do corredor 07'));openPlan(p.id)});await A.waitForSelector('#plan-editor .e99-dem-sel');
 ok(await A.inputValue('#plan-editor .e99-dem-sel')==='Quebras','PC: editar atividade mostra a demanda escolhida');
 await A.selectOption('#plan-editor .e99-dem-sel','Leves danos');await A.click('#plan-editor button[type=submit]');await A.waitForTimeout(800);
 ok(await A.evaluate(()=>state.plans.flatMap(p=>p.activities).find(x=>x.title==='Separar quebras do corredor 07').demanda==='Leves danos'),'PC: editar troca a demanda');
 /* validação: valor fora da lista é descartado, plano fica */
 ok(await A.evaluate(()=>{const ps=[{id:'px',title:'P',date:iso(),activities:[{id:'ax',title:'T',owner:'TODOS',notes:'',photos:[],demanda:'<img src=x onerror=alert(1)>'},{id:'ay',title:'U',owner:'TODOS',notes:'',photos:[],demanda:'Vencimentos'},{id:'az',title:'V',owner:'TODOS',notes:'',photos:[],demanda:42}]}];const r=validatePlans(ps);return r.length===1&&!('demanda' in r[0].activities[0])&&r[0].activities[1].demanda==='Vencimentos'&&!('demanda' in r[0].activities[2])}),'validatePlans descarta demanda fora da lista e mantém o plano');
 ok(await A.evaluate(async()=>{const before=state.plans.length;const ops=[{c:'plans',i:'pnet1',t:Date.now(),b:'x',x:{id:'pnet1',title:'Da rede',date:iso(),activities:[{id:'an1',title:'Rede',owner:'TODOS',notes:'',photos:[],demanda:'Inventada'}]}}];try{await e99SyncCore.applyOps(ops,false,'Ana')}catch(e){}const p=state.plans.find(p=>p.id==='pnet1');return state.plans.length>=before&&(!p||!('demanda' in p.activities[0]))}),'sync: demanda inventada vinda da rede não entra e não derruba nada');
 /* Início: cartão */
 await A.evaluate(()=>go('home'));await A.waitForTimeout(500);
 ok(await A.evaluate(d=>{const c=document.querySelector('.e99-demandas');if(!c)return false;const li=[...c.querySelectorAll('.e99-dem-name')].map(x=>x.textContent);return /Demandas do estoque/.test(c.querySelector('h2').textContent)&&li.length===7&&li.every((t,i)=>t===d[i])&&!c.querySelector('button,a,[onclick]')},DEM),'PC: Início com o cartão "Demandas do estoque" (7 linhas, na ordem, sem botão/toque)');
 ok(await A.evaluate(()=>{const ins=[...document.querySelectorAll('.e99-demandas input[list=dem-owners]')];const dl=document.getElementById('dem-owners');return ins.length===7&&ins.every(i=>i.value===''&&i.placeholder==='Sem responsável'&&i.getBoundingClientRect().height>=44)&&dl&&[...dl.options].some(o=>o.value==='Ana')}),'PC gestor: campo Responsável em cada demanda (vazio = Sem responsável) com sugestões da Equipe');
 await A.fill('.e99-demandas li:nth-child(3) input','Thomaz');await A.press('.e99-demandas li:nth-child(3) input','Tab');await A.waitForTimeout(700);
 await A.fill('.e99-demandas li:nth-child(4) input','  <b>Ana</b>  ');await A.press('.e99-demandas li:nth-child(4) input','Tab');await A.waitForTimeout(700);
 ok(await A.evaluate(()=>{const g=id=>(state.dresp.find(x=>x.id===id)||{}).resp;return g('d3')==='Thomaz'&&g('d4')==='bAna/b'&&document.querySelector('.e99-demandas li:nth-child(3) input').value==='Thomaz'}),'PC gestor: responsável salvo (Leves danos = Thomaz) e sem HTML');
 await A.fill('.e99-demandas li:nth-child(4) input','Ana');await A.press('.e99-demandas li:nth-child(4) input','Tab');await A.waitForTimeout(700);
 ok(await A.evaluate(()=>validateDresp([{id:'d1',resp:'<i>x</i>'},{id:'d9',resp:'Z'},{id:'d2',resp:5},{id:'d1',resp:'dup'},{id:'d3',resp:'a'.repeat(90)}]).map(x=>x.id+'='+x.resp.length).join(',')==='d1=4,d3=60'),'validateDresp: só d1…d7, texto sem HTML, até 60');
 await A.evaluate(()=>go('plans'));await A.waitForTimeout(400);
 ok(await A.evaluate(()=>[...document.querySelectorAll('.plan-activities li')].some(li=>/Separar quebras/.test(li.textContent)&&li.querySelector('.act-dem').textContent==='Leves danos · Thomaz')),'PC: etiqueta da atividade mostra a demanda e o responsável');
 await A.evaluate(()=>go('home'));await A.waitForTimeout(400);
 /* iPhone auxiliar */
 const link=await L.makeInvite(A,'Ana');await L.auxAccept(B,link,null,'4321');
 await B.evaluate(()=>go('home'));await B.waitForTimeout(600);
 ok(await B.evaluate(d=>{const c=document.querySelector('.e99-demandas');return !!c&&[...c.querySelectorAll('.e99-dem-name')].map(x=>x.textContent).join('|')===d.join('|')&&document.documentElement.scrollWidth<=window.innerWidth},DEM),'iPhone auxiliar: cartão do Início com as 7, sem rolagem lateral');
 ok(await until(B,()=>{const t=[...document.querySelectorAll('.e99-demandas li')].map(x=>x.textContent);return /Responsável: Thomaz/.test(t[2]||'')&&/Responsável: Ana/.test(t[3]||'')&&/Sem responsável/.test(t[0]||'')},null,30000),'iPhone auxiliar: recebe os responsáveis pela equipe (Thomaz, Ana, Sem responsável)');
 ok(await B.evaluate(async()=>{const n=document.querySelectorAll('.e99-demandas input,.e99-demandas select,.e99-demandas textarea').length;await e99DemResp(0,'Hack');return n===0&&!(state.dresp||[]).some(x=>x.resp==='Hack')}),'iPhone auxiliar: só vê, sem campo para alterar');
 await A.evaluate(()=>go('home'));await A.waitForTimeout(300);await A.fill('.e99-demandas li:nth-child(4) input','Bruno');await A.press('.e99-demandas li:nth-child(4) input','Tab');
 ok(await until(B,()=>{render();return /Responsável: Bruno/.test(document.querySelectorAll('.e99-demandas li')[3].textContent)},null,30000),'mudança do gestor chega ao auxiliar (Vencimentos = Bruno)');
 if(SHOTS){await B.evaluate(()=>document.querySelector('.e99-demandas').scrollIntoView({block:'center'}));await B.waitForTimeout(300);await B.screenshot({path:SHOTS+'/iphone-inicio-demandas.png'})}
 await B.evaluate(()=>go('plans'));await B.waitForTimeout(400);
 const o2=await newAct(B,'Conferir validade dos iogurtes','Vencimentos',true);
 ok(o2.length===8&&o2.slice(1).every((o,i)=>o[1]===DEM[i]),'iPhone auxiliar: escolhe a demanda (8 opções na ordem)');
 ok(await B.evaluate(()=>[...document.querySelectorAll('.plan-activities li')].some(li=>/iogurtes/.test(li.textContent)&&li.querySelector('.act-dem')&&li.querySelector('.act-dem').textContent==='Vencimentos · Bruno')),'iPhone auxiliar: etiqueta "Vencimentos · Bruno" na lista');
 ok(await B.evaluate(()=>{const p=state.plans.find(p=>p.activities.some(a=>/iogurtes/.test(a.title)));openPlan(p.id);const s=document.querySelector('#plan-editor .e99-dem-sel');const r=s&&s.getBoundingClientRect();planCancel();return r&&r.height>=44}),'iPhone: campo Demanda com ≥44 px');
 if(SHOTS){await B.evaluate(()=>{go('plans');const li=[...document.querySelectorAll('.plan-activities li')].find(l=>/iogurtes/.test(l.textContent));li&&li.scrollIntoView({block:'center'})});await B.waitForTimeout(300);await B.screenshot({path:SHOTS+'/iphone-plano-demanda.png'})}
 ok(await until(A,()=>(state.plans||[]).some(p=>p.activities.some(a=>/iogurtes/.test(a.title)&&a.demanda==='Vencimentos')),null,30000),'gestor recebe pela equipe a atividade do auxiliar com a demanda');
 ok(!errs.length,'sem erros de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})();
