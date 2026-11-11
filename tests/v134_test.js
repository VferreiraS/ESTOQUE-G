/* v134: (1) Relatório da semana no Painel (janela + "Salvar em PDF" pela impressão; resumo semanal por e-mail 1× por semana, com marcador e opção de desligar)
   (2) Fornecedores no Painel (CNPJ ou nome, % com divergência, tempo até conferir, valor; ordenável; toque abre as notas). PC 1440×900 (gestor) + iPhone 13 (auxiliar); 0 erro de console. */
const L=require('./lib.js');const {ok,until,signup}=L;const fs=require('fs'),path=require('path');
const BASE=process.env.BASE||'http://localhost:8000';const U=BASE+'/index.html?ntfy='+L.N,SHOTS=process.env.SHOTS||'';
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
/* semana passada (segunda) e dias dela, no fuso do navegador */
const SEED=()=>{const mon=e99Week.monday(iso()),d=n=>{const x=new Date(mon+'T12:00:00');x.setDate(x.getDate()+n);return iso(x)};const pm=d(-7),pw=n=>d(-7+n);
  const ms=(k,h)=>new Date(k+'T'+h+':00').getTime();
  state.team=[{id:'ana',name:'Ana Souza',role:'Repositora'}];
  state.corridors=[{id:'c7',number:'07',sector:'Mercearia doce',owner:'ana'},{id:'c9',number:'09',sector:'Bebidas <b>frias</b>',owner:''}];
  state.nfs=[
   {id:'n1',number:'1001',supplier:'Laticínios Serra LTDA',cnpj:'12345678000190',date:pw(0),arrivalTime:'08:00',status:'Conferido',owner:'ana',notes:'',volumes:3,totalValue:'1500.50',hist:[[ms(pw(0),'08:05'),'Vitor','Criou a nota'],[ms(pw(0),'14:00'),'Vitor','Status: Pendente → Conferido']]},
   {id:'n2',number:'1002',supplier:'Laticinios Serra',cnpj:'',date:pw(1),arrivalTime:'09:00',status:'Em divergência',owner:'ana',notes:'Faltou 1 caixa <script>',volumes:2,totalValue:'499.50'},
   {id:'n3',number:'2001',supplier:'Bebidas Norte',cnpj:'98765432000110',date:pw(2),arrivalTime:'10:00',status:'Conferido',owner:'ana',notes:'',volumes:5,hist:[[ms(pw(2),'10:00'),'Vitor','Criou a nota'],[ms(pw(2),'11:00'),'Vitor','Status: Pendente → Em divergência'],[ms(pw(4),'10:00'),'Vitor','Status: Em divergência → Conferido']],
    items:[{code:'1',ean:'7891000315507',description:'Refri 2L',unit:'UN',quantity:'2.0000'}]},
   {id:'n4',number:'3001',supplier:'Hortifruti <i>Sol</i>',cnpj:'',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1},
   {id:'n5',number:'9999',supplier:'Antigo',cnpj:'',date:d(-60),status:'Conferido',owner:'',notes:'',volumes:1}];
  state.confs=[{id:'cf-test-1',n:'CF-0001',by:'Vitor',login:'x',role:'gestor',dev:'abcdef12',start:new Date(ms(pw(4),'09:00')).toISOString(),end:new Date(ms(pw(4),'09:30')).toISOString(),status:'finalizada',mode:'toque',rule:{codes:{}},reads:[[1,1,'7891000315507','','c','v']],fixes:[],total:1,nf:'n3',assocBy:'Vitor',assocAt:new Date(ms(pw(4),'09:40')).toISOString(),note:''}];
  state.plans=[{id:'p1',title:'Plano da segunda',date:pw(0),activities:[{id:'a1',title:'Repor arroz',owner:'Ana Souza',notes:'',photos:[],done:true},{id:'a2',title:'Limpar <b>07</b>',owner:'Ana Souza',notes:'',photos:[],done:false}]}];
  return {pm}};
(async()=>{const b=await L.chromium.launch();const errs=[];
/* ================= PC · gestor ================= */
{const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();watch(p,'PC',errs);
 const posts=[];await p.route('https://formsubmit.co/**',async r=>{posts.push(JSON.parse(r.request().postData()||'{}'));await r.fulfill({status:200,contentType:'application/json',body:'{"success":"true"}'})});
 await p.goto(U);await p.waitForTimeout(2000);await signup(p,'gestor'+Date.now().toString(36));await p.waitForTimeout(800);
 await p.evaluate(()=>{authSession.payload.role='gestor'});
 const seed=await p.evaluate(async seed=>{const r=(0,eval)('('+seed+')')();await save();go('reports');return r},SEED.toString());await p.waitForTimeout(500);
 /* (2) fornecedores */
 ok(await p.$('#wk-open'),'gestor: botão "Relatório da semana" no Painel');
 const sup=await p.evaluate(()=>[...document.querySelectorAll('#pn-sup tbody tr')].map(tr=>[...tr.children].map(td=>td.textContent.trim())));
 const heads=await p.evaluate(()=>[...document.querySelectorAll('#pn-sup thead th')].map(t=>t.textContent.replace(/[↑↓]/g,'').trim()));
 ok(heads.join('|')==='Fornecedor|Notas|Com diverg.|Até conferir|Valor','gestor: colunas Fornecedor, Notas, Com diverg., Até conferir, Valor ('+heads.join(', ')+')');
 const lat=sup.find(r=>/Latic[ií]nios Serra/.test(r[0]));
 ok(lat&&lat[1]==='2'&&lat[2]==='50%'&&lat[3]==='6 h'&&/2\.000,00/.test(lat[4])&&/CNPJ 12\.345\.678\/0001-90/.test(lat[0]),'mesma empresa com e sem CNPJ vira um fornecedor: 2 notas, 50% com divergência, 6 h até conferir, R$ 2.000,00 ('+JSON.stringify(lat)+')');
 const beb=sup.find(r=>/Bebidas Norte/.test(r[0]));ok(beb&&beb[2]==='100%'&&beb[3]==='2 dias'&&beb[4]==='—','divergência que já foi resolvida conta; 48 h = "2 dias"; sem valor = "—" ('+JSON.stringify(beb)+')');
 ok(!sup.some(r=>/Antigo/.test(r[0])),'nota fora do período do filtro não entra');
 ok(await p.evaluate(()=>{const t=document.querySelector('#pn-sup tbody');return t&&!t.querySelector('i,script')&&/Hortifruti <i>Sol<\/i>/.test(t.textContent)}),'nome do fornecedor passa por esc() (sem HTML injetado)');
 await p.click('#pn-sup th:nth-child(3) button');await p.waitForTimeout(200);
 const s1=await p.evaluate(()=>({sort:document.querySelector('#pn-sup th:nth-child(3)').getAttribute('aria-sort'),first:document.querySelector('#pn-sup tbody tr td').textContent}));
 ok(s1.sort==='descending'&&/Bebidas Norte/.test(s1.first),'ordenar por "Com diverg." (maior primeiro, aria-sort) ('+JSON.stringify(s1)+')');
 await p.click('#pn-sup th:nth-child(3) button');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.querySelector('#pn-sup th:nth-child(3)').getAttribute('aria-sort')==='ascending'&&/Hortifruti/.test(document.querySelector('#pn-sup tbody tr td').textContent)),'tocar de novo inverte a ordem');
 await p.evaluate(()=>{const b=[...document.querySelectorAll('#pn-sup tbody td:first-child button')].find(x=>/Latic[ií]nios/.test(x.textContent));b.click()});await p.waitForTimeout(500);
 const nl=await p.evaluate(()=>({page,q:nfQuery,rows:[...document.querySelectorAll('#nf-results tbody tr')].filter(r=>r.getClientRects().length).length,inp:(document.querySelector('#view input[name="nf-busca"]')||{}).value}));
 ok(nl.page==='nfs'&&nl.q==='12345678000190'&&nl.inp===nl.q&&nl.rows>=1,'toque no fornecedor abre a lista de notas filtrada pelo CNPJ ('+JSON.stringify(nl)+')');
 await p.evaluate(()=>{nfQuery='';go('reports')});await p.waitForTimeout(300);
 /* (1) relatório da semana */
 await p.click('#wk-open');await p.waitForTimeout(500);
 const wk=await p.evaluate(()=>{const d=document.getElementById('wk-dlg');return {open:d&&d.open,sel:d.querySelector('select').value,txt:d.querySelector('#wk-body').innerText,bg:getComputedStyle(d).backgroundColor}});
 ok(wk.open&&wk.sel===seed.pm,'abre na semana passada (segunda '+seed.pm+')');
 ok(/Notas recebidas/.test(wk.txt)&&/Total\s*3/.test(wk.txt)&&/Valor total\s*R\$\s*2\.000,00/.test(wk.txt),'notas da semana: total 3 e valor R$ 2.000,00');
 ok(/Divergências \(2\)/.test(wk.txt)&&/1002/.test(wk.txt)&&/2001/.test(wk.txt)&&/Faltou 1 caixa <script>/.test(wk.txt),'divergências listadas (as 2 notas), texto escapado');
 ok(/Conferências por câmera \(1\)/.test(wk.txt)&&/Faltou 1 item/.test(wk.txt),'conferência por câmera com a falta da v132 (lido 1 de 2)');
 ok(/1 de 2/.test(wk.txt)&&/Atrasadas\s*1/.test(wk.txt)&&/Limpar <b>07<\/b>/.test(wk.txt),'plano: 1 de 2 feitas, 1 atrasada');
 ok(/Corredores sem responsável \(1\)/.test(wk.txt)&&/Bebidas <b>frias<\/b>/.test(wk.txt),'corredores sem responsável');
 const rgb=wk.bg.match(/\d+/g).map(Number);ok(rgb[0]<80&&rgb[1]<80&&rgb[2]<80,'janela do relatório no app continua escura ('+wk.bg+')');
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'v134-relatorio-semana-pc.png')})}
 const ph=await p.evaluate(()=>{let out='';window.open=()=>({document:{open(){},write(h){out+=h},close(){}},focus(){},print(){window.__printed=1}});e99Week.pdf();return out});
 await p.waitForTimeout(500);
 ok(/background:#fff/.test(ph)&&/Relatório da semana/.test(ph)&&!/<script>/.test(ph)&&!/<b>frias/.test(ph)&&await p.evaluate(()=>window.__printed===1),'"Salvar em PDF": folha branca, sem HTML injetado, abre a impressão');
 /* outra semana no seletor */
 await p.selectOption('#wk-dlg select',await p.evaluate(()=>e99Week.monday(iso())));await p.waitForTimeout(300);
 ok(await p.evaluate(()=>/Total\s*1/.test(document.getElementById('wk-body').innerText)),'trocar para esta semana recalcula (1 nota)');
 await p.evaluate(()=>document.getElementById('wk-dlg').close());
 /* resumo semanal por e-mail */
 await p.evaluate(()=>{localStorage.setItem('e99-test-weekmail','1')});
 ok(!(await p.evaluate(()=>e99Week.due())),'sem o "Relatório por e-mail" ativado, o resumo semanal não sai');
 await p.evaluate(()=>{localStorage.setItem('lojasg.estoque99.email-reports:'+authSession.storeKey,JSON.stringify({enabled:true,to:'gestor@teste.com',cc:'copia@teste.com',times:['08:00']}))});
 await p.evaluate(()=>e99Week.tick());await p.waitForTimeout(800);
 ok(posts.length===1&&/Resumo da semana/.test(posts[0]._subject)&&/^\d{2}\/\d{2} a \d{2}\/\d{2}\/\d{4}/.test(posts[0]['Semana'])&&/1002/.test(posts[0]['Divergências'])&&posts[0]._cc==='copia@teste.com','resumo semanal enviado pelo mesmo envio do relatório (assunto, semana, divergências, cópia) ('+JSON.stringify(posts[0]&&posts[0]._subject)+')');
 const mk=await p.evaluate(()=>e99Week.get());ok(mk.sent===(await p.evaluate(()=>e99Week.monday(iso()))),'marcador da semana gravado');
 await p.evaluate(()=>e99Week.tick());await p.waitForTimeout(600);ok(posts.length===1,'na mesma semana não repete');
 await p.evaluate(()=>{const k='lojasg.estoque99.week-mail:'+authSession.storeKey,v=JSON.parse(localStorage.getItem(k));v.sent='2000-01-03';localStorage.setItem(k,JSON.stringify(v));e99Week.pref(false)});
 ok(!(await p.evaluate(()=>e99Week.due())),'desligado na preferência, não envia');
 await p.evaluate(()=>go('alerts'));await p.waitForTimeout(400);
 ok(await p.evaluate(()=>{const c=document.querySelector('#wk-mail-pref input');return c&&!c.checked}),'opção "Resumo da semana toda segunda" no Relatório por e-mail (Alertas), desmarcada');
 await p.evaluate(()=>{localStorage.setItem('lojasg.estoque99.email-reports:'+authSession.storeKey,JSON.stringify({enabled:false}));e99Week.pref(true)});
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=1440),'PC sem rolagem lateral');
 await ctx.close()}
/* ================= iPhone 13 · auxiliar ================= */
{const ctx=await b.newContext({...L.devices['iPhone 13']});const p=await ctx.newPage();watch(p,'iPhone',errs);
 await p.goto(U);await p.waitForTimeout(2000);await signup(p,'aux'+Date.now().toString(36));await p.waitForTimeout(800);
 await p.evaluate(async seed=>{(0,eval)('('+seed+')')();await save();authSession.payload.role='auxiliar';go('reports');render()},SEED.toString());await p.waitForTimeout(600);
 ok(await p.evaluate(()=>page==='reports'&&!!document.getElementById('pn-sup')),'auxiliar abre o Painel e vê Fornecedores');
 ok(!(await p.$('#wk-open')),'auxiliar não vê "Relatório da semana"');
 const h=await p.evaluate(()=>[...document.querySelectorAll('#pn-sup thead th')].map(t=>t.textContent.replace(/[↑↓]/g,'').trim()).join('|'));
 ok(h==='Fornecedor|Notas|Com diverg.|Até conferir'&&!(await p.evaluate(()=>/R\$/.test(document.getElementById('pn-sup').textContent))),'auxiliar não vê valores ('+h+')');
 await p.evaluate(()=>e99Week.open());await p.waitForTimeout(200);ok(!(await p.evaluate(()=>{const d=document.getElementById('wk-dlg');return d&&d.open})),'auxiliar não abre o relatório da semana');
 const lay=await p.evaluate(()=>{const s=document.getElementById('pn-sup');s.scrollIntoView();const bs=[...s.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getBoundingClientRect().height);return {doc:document.documentElement.scrollWidth,w:s.getBoundingClientRect().width,minH:Math.min(...bs)}});
 ok(lay.doc<=390&&lay.w<=390&&lay.minH>=44,'iPhone: cartão Fornecedores cabe na tela, toques ≥44 px ('+JSON.stringify(lay)+')');
 ok(await p.evaluate(()=>{const s=document.querySelector('#pn-sup .pn-sup-sort');return s&&getComputedStyle(s).display!=='none'}),'iPhone: "Ordenar por" aparece (a tabela vira cartões)');
 await p.selectOption('#pn-sup .pn-sup-sort select','div');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>/Bebidas Norte/.test(document.querySelector('#pn-sup tbody tr td').textContent)&&document.querySelector('#pn-sup table').classList.contains('mobile-cards')),'iPhone: ordenar por "Mais divergência" põe Bebidas Norte primeiro e mantém os cartões');
 if(SHOTS){await p.waitForTimeout(300);await p.screenshot({path:path.join(SHOTS,'v134-fornecedores-iphone.png')})}
 await p.evaluate(()=>{const b=[...document.querySelectorAll('#pn-sup tbody td:first-child button')].find(x=>/Bebidas/.test(x.textContent));b.click()});await p.waitForTimeout(500);
 ok(await p.evaluate(()=>page==='nfs'&&nfQuery==='98765432000110'),'auxiliar: toque no fornecedor abre as notas dele');
 await ctx.close()}
ok(errs.length===0,'0 erro de console');console.log('errors',JSON.stringify(errs));await b.close()})().catch(e=>{console.log('FAIL erro do teste: '+e.message);process.exit(1)});
