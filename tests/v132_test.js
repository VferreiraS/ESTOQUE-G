/* v132: (1) conferência × XML da NF-e; (2) busca geral; (3) histórico da nota; (4) planos que se repetem; (5) cabeçalho fixo das NFs no PC e datas dd/mm/aaaa;
   (6) Início com o que pede ação hoje. PC 1440×900 (gestor) + iPhone 13 (auxiliar); 0 erro de console. */
const L=require('./lib.js');const {ok,until,signup}=L;const fs=require('fs'),path=require('path');
const U='http://localhost:8000/index.html?ntfy='+L.N,FX=path.join(__dirname,'fixtures'),SHOTS=process.env.SHOTS||'';
const A=path.join(FX,'nfe-v131-a.xml');
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
async function pick(p,files){const [ch]=await Promise.all([p.waitForEvent('filechooser',{timeout:5000}),p.evaluate(()=>e99NfXmlPick())]);await ch.setFiles(files)}
const isoD=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
/* texto visível com data no formato aaaa-mm-dd (fora de campos) */
const isoText=p=>p.evaluate(()=>{const out=[];const w=document.createTreeWalker(document.getElementById('view'),NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const e=n.parentElement;if(!e||e.closest('input,textarea,select,script,style,code,[hidden]')||!e.getClientRects().length)continue;if(/\b\d{4}-\d{2}-\d{2}\b/.test(n.textContent))out.push(n.textContent.trim().slice(0,60))}return out});
(async()=>{const b=await L.chromium.launch();const errs=[];
/* ================= PC · gestor ================= */
{const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});const p=await ctx.newPage();watch(p,'PC',errs);
 await p.goto(U);await p.waitForTimeout(2000);await signup(p,'gestor'+Date.now().toString(36));await p.waitForTimeout(800);
 await p.evaluate(async()=>{state.team=[{id:'ana',name:'Ana Souza',role:'Repositora'},{id:'bia',name:'Bia',role:'Conferente'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia doce',owner:'ana'}];
   state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3}];
   state.plans=[{id:'p1',title:'Plano de terça',date:iso(),activities:[{id:'a1',title:'Repor arroz no corredor 07',owner:'Ana Souza',notes:'',photos:[]}]}];await save();go('home')});
 await p.waitForTimeout(500);
 /* (6) Início */
 const home=await p.evaluate(()=>[...document.querySelectorAll('#view .stats>.stat span:not(.e99-go-l)')].map(s=>s.textContent));
 ok(home.join('|')==='Para fazer hoje|Atrasadas|Notas paradas|Divergências a resolver','Início: cartões do que pede ação hoje ('+home.join(', ')+')');
 ok(!(await p.evaluate(()=>/Notas aguardando|Feitas hoje/.test(document.getElementById('view').textContent))),'Início não repete os totais do Painel ("Notas aguardando"/"Feitas hoje")');
 ok(await p.evaluate(()=>document.querySelector('#view .stats>.stat strong').textContent==='1'),'"Para fazer hoje" conta a atividade de hoje (1)');
 /* (3) histórico: importar XML cria a nota com "Criou a nota pelo XML" */
 await p.evaluate(()=>go('nfs'));await p.waitForTimeout(400);
 await pick(p,[A]);await until(p,()=>document.getElementById('modal').open&&document.getElementById('editor').elements.namedItem('number').value==='4521',null,6000);
 await p.click('#editor button[type=submit]');await p.waitForTimeout(800);
 let nf=await p.evaluate(()=>state.nfs.find(n=>n.number==='4521'));
 ok(nf&&nf.items.length===2&&nf.items[0].ean==='7891000315507'&&'eanTrib' in nf.items[0],'XML: itens guardados na NF com EAN (cEAN e cEANTrib)');
 ok(nf&&Array.isArray(nf.hist)&&nf.hist.length===1&&/Criou a nota pelo XML/.test(nf.hist[0][2])&&nf.hist[0][1],'histórico: "Criou a nota pelo XML" com quem e quando ('+JSON.stringify(nf&&nf.hist)+')');
 const id=nf.id;
 await p.evaluate(id=>nfQuickStatus(id,'Em conferência'),id);await p.waitForTimeout(400);
 await p.evaluate(()=>openEditor('nf',state.nfs.find(n=>n.number==='4521').id));await p.waitForTimeout(400);
 await p.fill('#editor input[name=volumes]','6');await p.click('#editor button[type=submit]');await p.waitForTimeout(700);
 nf=await p.evaluate(id=>state.nfs.find(n=>n.id===id),id);
 ok(nf.hist.length===3&&/Status: Pendente → Em conferência/.test(nf.hist[1][2])&&/Volumes: 5 → 6/.test(nf.hist[2][2])&&nf.items.length===2,'histórico: mudança de status e edição de volumes registradas; editar não apaga o histórico ('+nf.hist.map(h=>h[2]).join(' | ')+')');
 await p.evaluate(id=>openEditor('nf',id),id);await p.waitForTimeout(400);
 const hv=await p.evaluate(()=>{const d=document.getElementById('e99-hist');if(!d)return null;d.open=true;return {s:d.querySelector('summary').textContent,li:[...d.querySelectorAll('li')].map(l=>l.textContent)}});
 ok(hv&&hv.s==='Histórico (3)'&&/Volumes: 5 → 6/.test(hv.li[0])&&/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(hv.li[0]),'editor da NF mostra "Histórico (3)", mais recente primeiro, data dd/mm/aaaa hh:mm');
 await p.evaluate(()=>document.getElementById('modal').close());
 const lim=await p.evaluate(async id=>{const n=state.nfs.find(x=>x.id===id);for(let i=0;i<40;i++){n.notes='nota '+i;await save()}const v=validate(JSON.parse(JSON.stringify(Object.assign({},state,{nfs:state.nfs.map(x=>x.id===id?Object.assign({},x,{hist:[...x.hist,['x','<b>',1],[Date.now(),'Eu','<img src=x onerror=alert(1)>']]}):x)}))));const m=v.nfs.find(x=>x.id===id);return {len:n.hist.length,vlen:m.hist.length,last:m.hist[m.hist.length-1][2]}},id);
 ok(lim.len===30&&lim.vlen===30&&/^<img/.test(lim.last),'histórico limitado a 30 entradas; validação descarta entrada malformada');
 await p.evaluate(id=>{const n=state.nfs.find(x=>x.id===id);n.hist[n.hist.length-1]=[Date.now(),'Eu','<img src=x onerror=window.__xss=1>'];openEditor('nf',id);document.getElementById('e99-hist').open=true},id);await p.waitForTimeout(300);
 ok(await p.evaluate(()=>!window.__xss&&!document.querySelector('#e99-hist img')),'histórico passa por esc() (sem HTML)');
 await p.evaluate(()=>document.getElementById('modal').close());
 /* (1) conferência × XML */
 const mk=(cid,codes)=>p.evaluate(({cid,codes,id})=>{const st=new Date(Date.now()-600000).toISOString();const reads=codes.map((c,i)=>[i+1,i*5,c,'ean13','c','v']);state.confs=validateConfs([{id:cid,n:'C-'+cid.slice(-2),by:'Vitor',login:'v',role:'gestor',dev:'abcdef12',start:st,end:new Date().toISOString(),status:'finalizada',mode:'toque',rule:{codes:{}},reads,fixes:[],nf:id}].concat(state.confs||[]))},{cid,codes,id});
 await mk('cf-t1-01',Array(10).fill('7891000315507').concat(['7890000000017']));
 await p.evaluate(()=>confReport('cf-t1-01'));await p.waitForTimeout(500);
 let x=await p.evaluate(()=>{const b=document.getElementById('cf-xml');return b&&{t:b.textContent,miss:[...b.querySelectorAll('table')].map(t=>t.textContent)}});
 ok(x&&/Faltou \(1\)/.test(x.t)&&/Produto teste <um>7891000315507121 ?0/.test(x.t.replace(/\s+/g,''))||(x&&/Faltou \(1\)/.test(x.t)&&/12/.test(x.miss[0])&&/10/.test(x.miss[0])),'relatório × XML: "Faltou" 7891000315507 (nota 12, lidos 10)');
 ok(x&&/Não está na nota \(1\)/.test(x.t)&&/7890000000017/.test(x.t)&&/1 item da nota não tem EAN/.test(x.t)&&!/Sobrou/.test(x.t),'relatório × XML: "Não está na nota" e aviso do item sem EAN; sem "Sobrou"');
 ok(await p.evaluate(()=>!document.querySelector('#cf-xml um, #cf-xml b b')),'descrição do item passa por esc()');
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.evaluate(()=>document.getElementById('cf-xml').scrollIntoView({block:'center'}));await p.waitForTimeout(300);await p.screenshot({path:path.join(SHOTS,'v132-pc-conferencia-xml.png')})}
 await p.click('#cf-close');await p.waitForTimeout(200);
 await p.evaluate(()=>{state.confs=[]});await mk('cf-t2-02',Array(12).fill('7891000315507'));await p.evaluate(()=>confReport('cf-t2-02'));await p.waitForTimeout(400);
 x=await p.evaluate(()=>document.getElementById('cf-xml').textContent);ok(/Tudo confere/.test(x)&&!/Faltou|Sobrou|Não está na nota/.test(x),'relatório × XML: "Tudo confere" quando bate');
 await p.click('#cf-close');await p.waitForTimeout(200);
 /* (2) busca geral */
 await p.evaluate(()=>go('home'));await p.waitForTimeout(300);
 ok(await p.isVisible('header .e99-search-btn'),'topo tem o botão Buscar');
 await p.keyboard.press('Control+k');await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.getElementById('e99-search').open&&document.activeElement.id==='e99-sx-q'),'Ctrl+K abre a busca com o campo em foco');
 const g=async q=>{await p.fill('#e99-sx-q',q);await p.waitForTimeout(250);return p.evaluate(()=>[...document.querySelectorAll('#e99-sx-res .sx-g')].map(x=>x.textContent))};
 ok((await g('4521')).join()==='Notas fiscais (1)','busca pelo número da NF');
 ok((await g('11222333')).join()==='Notas fiscais (1)'&&(await g('distribuidora ficticia')).join()==='Notas fiscais (1)','busca pelo CNPJ e pelo fornecedor (sem acento/maiúscula)');
 ok((await g('mercearia')).join()==='Corredores (1)'&&(await g('ana')).join().includes('Equipe (1)')&&(await g('repor arroz')).join()==='Planos e atividades (1)','busca acha corredores, pessoas e atividades do plano');
 ok(/Nada encontrado/.test(await p.evaluate(async()=>{document.getElementById('e99-sx-q').value='zzqq';document.getElementById('e99-sx-q').dispatchEvent(new Event('input'));await new Promise(r=>setTimeout(r,250));return document.getElementById('e99-sx-res').textContent})),'sem resultado: "Nada encontrado"');
 await g('4521');await p.click('#e99-sx-res .sx-it');await p.waitForTimeout(500);
 ok(await p.evaluate(id=>page==='nfs'&&document.getElementById('modal').open&&editing&&editing.id===id&&!document.getElementById('e99-search').open,id),'tocar no resultado abre a NF');
 await p.evaluate(()=>document.getElementById('modal').close());await p.waitForTimeout(200);
 await p.evaluate(()=>document.body.focus());await p.keyboard.press('/');await p.waitForTimeout(250);ok(await p.evaluate(()=>document.getElementById('e99-search').open),'"/" também abre a busca no PC');
 await p.fill('#e99-sx-q','<img src=x onerror=window.__xss2=1>');await p.waitForTimeout(300);ok(await p.evaluate(()=>!window.__xss2&&!document.querySelector('#e99-sx-res img')),'texto da busca passa por esc()');
 await p.keyboard.press('Escape');await p.waitForTimeout(200);
 /* (4) plano que se repete */
 await p.evaluate(()=>{openPlan()});await p.waitForTimeout(300);
 ok(await p.isVisible('#e99-rep-on'),'editor do plano tem "Repetir toda semana"');
 await p.fill('#plan-editor input[name=title]','Limpeza semanal');await p.fill('#plan-editor textarea','Varrer o corredor 07');await p.check('#e99-rep-on');
 ok(await p.evaluate(()=>!document.getElementById('e99-rep-d').disabled&&+document.getElementById('e99-rep-d').value===new Date().getDay()),'dia da semana vem do dia do plano');
 await p.click('#plan-editor button[type=submit]');await p.waitForTimeout(900);
 let rp=await p.evaluate(()=>{const s=state.plans.find(x=>x.title==='Limpeza semanal'&&!x.repOf);return {sid:s&&s.id,rep:s&&s.rep,list:state.plans.filter(x=>x.repOf===(s&&s.id)).map(x=>({id:x.id,date:x.date,acts:x.activities.length,done:x.activities.some(a=>a.done),ph:x.activities.reduce((n,a)=>n+a.photos.length,0)}))}});
 const nx=isoD(7);
 ok(rp.sid&&rp.rep&&rp.list.length===1&&rp.list[0].date===nx&&rp.list[0].id===rp.sid+'-w'+nx.replace(/-/g,'')&&rp.list[0].acts===1&&!rp.list[0].done&&!rp.list[0].ph,'cria sozinho o plano da próxima semana ('+nx+') com id determinístico, sem fotos e sem marcar feito');
 ok(await p.evaluate(async()=>(await e99RepRun())===0),'rodar de novo não duplica');
 ok(await p.evaluate(async id=>{await deletePlan(id);return (await e99RepRun())===0&&!planById(id)},rp.list[0].id),'excluir a próxima ocorrência não faz o app recriá-la');
 await p.evaluate(async id=>{localStorage.removeItem('lojasg.estoque99.rep-skip:'+authSession.storeKey);await e99RepRun()},rp.list[0].id);
 ok(await p.evaluate(()=>{render();return /Repete toda .*-feira|Repete todo (domingo|sábado)/.test(document.getElementById('view').textContent)}),'lista de planos mostra "Repete toda …"');
 ok((await isoText(p)).length===0,'Plano: nenhuma data aaaa-mm-dd no texto ('+(await isoText(p)).join(' / ')+')');
 await p.evaluate(sid=>openPlan(sid),rp.sid);await p.waitForTimeout(300);await p.uncheck('#e99-rep-on');await p.click('#plan-editor button[type=submit]');await p.waitForTimeout(700);
 rp=await p.evaluate(sid=>{state.plans=state.plans.filter(x=>x.repOf!==sid);return state.plans.filter(x=>x.id===sid||x.repOf===sid).map(x=>!!x.rep)},rp.sid);
 ok(rp.every(v=>!v)&&await p.evaluate(async()=>(await e99RepRun())===0),'desmarcar desliga a série inteira e nada mais é criado');
 ok(await p.evaluate(()=>{const v=validate(JSON.parse(JSON.stringify(Object.assign({},state,{plans:state.plans.concat([{id:'zz',title:'X',date:iso(),rep:{d:9},repOf:'a b',activities:[{id:'q',title:'t',owner:'',notes:'',photos:[]}]}])}))));const z=v.plans.find(x=>x.id==='zz');return z&&!('rep' in z)&&!('repOf' in z)}),'validação descarta repetição inválida');
 /* (6) cartão de divergência leva para as notas filtradas */
 await p.evaluate(async()=>{const n=state.nfs.find(x=>x.number==='48213');n.status='Em divergência';n.notes='Falta 1 caixa';await save();go('home')});await p.waitForTimeout(300);
 await p.click('#view .stats>.stat:nth-child(4)');await p.waitForTimeout(400);
 ok(await p.evaluate(()=>page==='nfs'&&nfStatusFilter==='Em divergência'),'cartão "Divergências a resolver" abre as notas em divergência');
 /* (5) cabeçalho fixo e datas */
 await p.evaluate(async()=>{nfStatusFilter='';for(let i=0;i<40;i++)state.nfs.push({id:'m'+i,number:String(9000+i),supplier:'Fornecedor '+i,date:iso(),status:'Pendente',owner:'',notes:'',volumes:1});await save();go('nfs')});await p.waitForTimeout(500);
 const st=await p.evaluate(async()=>{const th=document.querySelector('#nf-results thead th'),hd=document.querySelector('header');window.scrollTo(0,0);await new Promise(r=>setTimeout(r,100));const t0=th.getBoundingClientRect().top;window.scrollTo(0,1400);await new Promise(r=>setTimeout(r,400));const r=th.getBoundingClientRect(),hb=hd.getBoundingClientRect();const tb=document.querySelector('#nf-results tbody tr').getBoundingClientRect();const pos=getComputedStyle(th).position;window.scrollTo(0,0);return {t0,top:r.top,hb:Math.max(0,hb.bottom),pos,left:r.left,bg:getComputedStyle(th).backgroundColor}});
 ok(st.pos==='sticky'&&Math.abs(st.top-st.hb)<=2&&/^rgb\(/.test(st.bg),'PC: cabeçalho da tabela de NFs fica fixo logo abaixo do topo ao rolar ('+JSON.stringify(st)+')');
 if(SHOTS){await p.evaluate(()=>window.scrollTo(0,1400));await p.waitForTimeout(200);await p.screenshot({path:path.join(SHOTS,'v132-pc-nfs-cabecalho.png')});await p.evaluate(()=>window.scrollTo(0,0))}
 ok((await isoText(p)).length===0,'Notas: nenhuma data aaaa-mm-dd no texto');
 for(const pg of ['home','reports','alerts','corridors','team','data','account']){await p.evaluate(g=>go(g),pg);await p.waitForTimeout(250);const t=await isoText(p);if(t.length)ok(false,'datas aaaa-mm-dd em '+pg+': '+t.join(' / '))}
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=1440),'PC sem rolagem lateral');
 await ctx.close()}
/* ================= iPhone 13 · auxiliar ================= */
{const ctx=await b.newContext({...L.devices['iPhone 13']});const p=await ctx.newPage();watch(p,'iPhone',errs);
 await p.goto(U);await p.waitForTimeout(2000);await signup(p,'aux'+Date.now().toString(36));await p.waitForTimeout(800);
 await p.evaluate(async()=>{state.team=[{id:'ana',name:'Ana Souza',role:'Repositora'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia doce',owner:'ana'}];
   state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3,cby:'Outro',cdev:'zzzzzz99'}];
   state.plans=[{id:'p1',title:'Plano Ana',date:iso(),rep:{d:1},activities:[{id:'a1',title:'Repor arroz Ana',owner:'Ana Souza',notes:'',photos:[]}]}];await save();authSession.payload.role='auxiliar';go('home');render()});
 await p.waitForTimeout(500);
 const sb=await p.evaluate(()=>{const b=document.querySelector('header .e99-search-btn');const r=b&&b.getBoundingClientRect();return r&&{w:r.width,h:r.height,vis:r.width>0}});
 ok(sb&&sb.vis&&sb.h>=44&&sb.w>=44,'iPhone: botão Buscar no topo com toque ≥44 px');
 await p.tap('header .e99-search-btn');await p.waitForTimeout(300);await p.fill('#e99-sx-q','ana');await p.waitForTimeout(300);
 const gr=await p.evaluate(()=>[...document.querySelectorAll('#e99-sx-res .sx-g')].map(x=>x.textContent));
 ok(gr.join()==='Planos e atividades (1)','auxiliar: busca acha o plano, mas não mostra corredores nem pessoas ('+gr.join()+')');
 await p.fill('#e99-sx-q','48213');await p.waitForTimeout(300);
 const lay=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,d:document.getElementById('e99-search').getBoundingClientRect().width}));ok(lay.doc<=390&&lay.d<=390,'iPhone: janela da busca cabe na tela');
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'v132-iphone-busca.png')})}
 await p.tap('#e99-sx-res .sx-it');await p.waitForTimeout(500);
 ok(await p.evaluate(()=>page==='nfs'&&!document.getElementById('modal').open&&nfQuery==='48213'),'auxiliar: NF de outra pessoa abre a lista filtrada (não o editor)');
 await p.evaluate(()=>openPlan());await p.waitForTimeout(300);ok(!(await p.$('#e99-rep-on')),'auxiliar não vê "Repetir toda semana"');
 await p.evaluate(()=>planCancel&&(planDraftDirty=false,planCancel()));
 const r0=await p.evaluate(async()=>{const n=state.plans.length;await e99RepRun();return state.plans.length===n});ok(r0,'aparelho do auxiliar não cria repetições');
 await p.evaluate(async()=>{openEditor('nf');const f=document.getElementById('editor');f.elements.namedItem('number').value='777';f.elements.namedItem('supplier').value='Fornecedor do aux';f.elements.namedItem('volumes').value='2'});await p.click('#editor button[type=submit]');await p.waitForTimeout(700);
 ok(await p.evaluate(()=>{const n=state.nfs.find(x=>x.number==='777');return n&&n.hist&&n.hist.length===1&&/Criou a nota/.test(n.hist[0][2])}),'auxiliar: nota criada já tem o histórico');
 await p.evaluate(()=>go('home'));await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll('#view .stats>.stat.e99-go').length===4&&document.documentElement.scrollWidth<=390),'iPhone: Início com os 4 cartões de ação, sem rolagem lateral');
 ok((await isoText(p)).length===0,'iPhone: Início sem data aaaa-mm-dd');
 await ctx.close()}
console.log('errors',JSON.stringify(errs));ok(!errs.length,'0 erro de console');await b.close()})().catch(e=>{console.log('FAIL exceção '+e.message);process.exit(1)});
