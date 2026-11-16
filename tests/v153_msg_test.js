/* v153: plano de ação organizado no WhatsApp e no Outlook (e99Msg). iPhone 13 gestor.
   Plano de 6 atividades (como o print do dono, com Responsável e Demanda): título e subtítulo em linhas próprias,
   uma linha por campo, linha em branco entre atividades, "*" do usuário limpo, quebras do próprio texto mantidas,
   HTML do Outlook com um bloco por atividade e rótulos em negrito, texto simples igual, mailto com CRLF, folha legível
   (print 2x com SHOTS=pasta), 0 erro de console. */
const L=require('./lib.js');const {ok}=L;
const U='http://localhost:8000/index.html';const SH=process.env.SHOTS||'';
(async()=>{const b=await L.chromium.launch();const errs=[];
 const c=await b.newContext(Object.assign({},L.devices['iPhone 13'],{deviceScaleFactor:2}));const P=await c.newPage();
 P.on('pageerror',e=>errs.push(e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push('console: '+m.text())});P.on('dialog',d=>d.accept());
 await P.goto(U);await P.waitForTimeout(2500);await L.signup(P,'vferreiras','Lojas G');await P.waitForTimeout(800);
 await P.evaluate(async()=>{authSession.payload.role='gestor';
  state.team=[{id:'t',name:'TODOS',role:''},{id:'l',name:'Luiz',role:''}];
  state.dresp=[{id:'d5',resp:'Luiz'}];
  const A=(t,h,o,d,n)=>({id:'a'+Math.random().toString(36).slice(2,8),title:t,time:h,owner:o,demanda:d,notes:n,photos:[],done:false});
  state.plans=[{id:'p153',title:'Planejando',date:'2026-11-16',activities:[
   A('ARRASTÃO NATAL','10:30','TODOS','Separação de mercadorias','Separar *tudo* do Natal\nLevar para o corredor 3'),
   A('Organizar papelões','11:00','Luiz','Organização dos papelões','Amarrar e levar para a doca'),
   A('Conferir quebras','12:00','TODOS','Quebras','Registrar no caderno'),
   A('Vencimentos do mês','14:00','Luiz','Vencimentos','Separar os que vencem até dia 30'),
   A('Receber carreta','15:00','TODOS','Receber e conferir mercadorias','Conferir volumes pela câmera'),
   A('Leves danos','16:00','Luiz','Leves danos','')]}];
  await save()});

 /* 1) texto do WhatsApp */
 const t=await P.evaluate(()=>e99Msg.text(e99Msg.planPayload(state.plans[0])));const L1=t.split('\n');
 ok(L1[0]==='*Plano de ação*','linha 1: *Plano de ação* ('+L1[0]+')');
 ok(/^_16\/11\/2026 · Planejando · .+ · gerado em \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}_$/.test(L1[1]),'linha 2: data · plano · loja · gerado em ('+L1[1]+')');
 ok(L1[2]===''&&L1[3]==='*Atividades (0 de 6 feitas)*','linha em branco e "Atividades (0 de 6 feitas)"');
 const i1=L1.indexOf('*1. ARRASTÃO NATAL* — até 10:30');
 ok(i1>0&&L1[i1+1]==='Responsável: TODOS'&&L1[i1+2]==='Demanda: Separação de mercadorias (responsável: Luiz)'&&L1[i1+3]==='Orientações: Separar tudo do Natal'&&L1[i1+4]==='Levar para o corredor 3'&&L1[i1+5]==='','atividade 1: uma linha por campo, quebra do usuário mantida, linha em branco depois');
 const heads=L1.map((l,i)=>[l,i]).filter(x=>/^\*\d\. /.test(x[0]));
 ok(heads.length===6&&heads.slice(1).every(x=>L1[x[1]-1]===''),'6 atividades, cada uma depois de uma linha em branco');
 ok(L1.filter(l=>/^Responsável: /.test(l)).length===6&&L1.filter(l=>/^Demanda: /.test(l)).length===6,'Responsável e Demanda em linhas próprias nas 6');
 ok(!/\*tudo\*/.test(t)&&!/ {2,}/.test(t)&&!/^• /m.test(t),'"*" do usuário limpo, sem espaços repetidos, sem "•" nas atividades');
 ok(L1[L1.length-2]==='──────────'&&L1[L1.length-1]==='Stok · Lojas G · Estoque 99','rodapé depois do separador');
 ok(t.length>600&&/Leves danos/.test(t),'conteúdo inteiro, sem corte');

 /* 2) Outlook: HTML e texto simples */
 const h=await P.evaluate(()=>e99Msg.html(e99Msg.planPayload(state.plans[0])));
 ok((h.match(/<b style="color:#ffffff">Responsável:<\/b>/g)||[]).length===6&&(h.match(/<b style="color:#ffffff">Demanda:<\/b>/g)||[]).length===6,'HTML: rótulos Responsável/Demanda em negrito, um por atividade');
 ok(/Separar tudo do Natal<br>Levar para o corredor 3/.test(h)&&!/<img/.test(h)&&(h.match(/<tr><td valign="top"/g)||[]).length===6,'HTML: um bloco por atividade, quebra do usuário vira <br>, sem imagem');
 const x=await P.evaluate(()=>e99Msg.html({title:'t',sections:[{lines:[{b:'a',sub:['Orientações: <img src=x onerror=alert(1)>']}]}]}));
 ok(!/<img/.test(x)&&/&lt;img/.test(x),'HTML escapa o texto do usuário');

 /* 3) folha no iPhone */
 await P.evaluate(()=>{go('plans');scrollTo(0,0)});await P.waitForTimeout(500);
 await P.evaluate(()=>copyPlan('p153'));await P.waitForTimeout(400);
 const pre=await P.evaluate(()=>{const e=document.getElementById('e99m-text');return {txt:e.textContent,ws:getComputedStyle(e).whiteSpace,h:e.getBoundingClientRect().height,lh:parseFloat(getComputedStyle(e).lineHeight)||18}});
 ok(pre.txt===t.replace(/gerado em \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}/,m=>pre.txt.match(/gerado em \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}/)[0])&&/pre/.test(pre.ws),'folha mostra o mesmo texto, com as quebras (white-space '+pre.ws+')');
 const mail=await P.getAttribute('#e99m-mail','href');const body=decodeURIComponent(mail.split('body=')[1]);
 ok(/\r\nResponsável: TODOS\r\nDemanda: /.test(body)&&!/\*/.test(body),'"Abrir no e-mail": corpo com quebras CRLF e sem marcas');
 const plain=await P.evaluate(async()=>{let got=null;const o=navigator.clipboard&&navigator.clipboard.write;if(!o||!window.ClipboardItem)return null;navigator.clipboard.write=async it=>{got=await (await it[0].getType('text/plain')).text()};await e99Msg.outlook();navigator.clipboard.write=o;return got});
 ok(plain===null||(/\nResponsável: TODOS\nDemanda: Separação de mercadorias \(responsável: Luiz\)\n/.test(plain)&&!/\*/.test(plain)),'Outlook text/plain com as mesmas quebras');
 const sw=await P.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);ok(sw,'sem rolagem lateral');
 if(SH){await P.evaluate(()=>{const e=document.getElementById('e99m-text');e.style.maxHeight='none'});await P.waitForTimeout(200);await P.screenshot({path:SH+'/v153-iphone-folha.png',fullPage:false});
  await P.locator('#e99m-text').screenshot({path:SH+'/v153-iphone-texto.png'})}
 ok(errs.length===0,'0 erro de console'+(errs.length?' '+errs.join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro '+e.stack);process.exit(1)});
