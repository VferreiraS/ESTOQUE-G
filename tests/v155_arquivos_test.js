/* v155: arquivos no chat (equipe e conversas privadas). PC 1440×900 gestor + iPhone 13 auxiliar, emulador.
   Envia PDF, baixa e confere os bytes; bloqueia .exe/.html; passa do limite (2 MB); apaga com anexo; 0 erro de console. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs');
const URL0='http://localhost:8000/index.html';
const STRICT=()=>{try{localStorage.setItem('e99-test-chatlist','1');localStorage.removeItem('e99-test-chatgeral');localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup');localStorage.setItem('e99-test-strong','1')}catch(e){}};
const admin=L.fsAdmin;
const PDF=Buffer.concat([Buffer.from('%PDF-1.4\n% Stok teste <b>x</b>\n'),Buffer.from(Array.from({length:3000},(_,i)=>(i*31+7)&255)),Buffer.from('\n%%EOF\n')]);
const XLS=Buffer.from(Array.from({length:1500*1024},(_,i)=>(i*131+i%251)&255));/* 1,5 MB: vai em 2+ pedaços nas conversas */
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(Object.assign({acceptDownloads:true},opts));await c.addInitScript(STRICT);const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|ERR_FAILED|firestore|Firebase|identitytoolkit|WebChannel|permission/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return {c,P}}
 const A=(await dev('PC',{viewport:{width:1440,height:900}})).P;
 await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(500);await A.click('#auth-owner');await A.waitForTimeout(300);
 await A.fill('#auth-screen input[name=store]','Lojas G');await A.fill('#auth-screen input[name=email]',L.mail('vferreiras'));await A.fill('#auth-screen input[name=login]','vferreiras');await A.fill('#auth-screen input[name=password]','abc12345');await A.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await until(A,()=>!!(e99Cloud.user()&&e99Cloud.user().email),null,40000),'PC: gestor com nuvem');
 const guid=await A.evaluate(()=>e99Cloud.user().uid);await admin('/verificados/'+guid,{fields:{tipo:{stringValue:'s'}}});
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.evaluate(()=>e99Cv.open('geral'));await A.waitForTimeout(500);await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 ok(await until(A,()=>!!e99Loja.ctx()&&e99Cv.state().started&&!!e99Cv.state().pk,null,40000),'PC: nuvem e conversas ligadas');
 await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);await A.evaluate(()=>e99OpenAccCreate());await A.waitForTimeout(500);
 await A.fill('#aux-box input[name=name]','Caio');await A.fill('#aux-box input[name=login]','caio.x');await A.selectOption('#aux-box select[name=papel]','auxiliar');
 await A.evaluate(()=>{window.__inv='';navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
 const lk=((await A.evaluate(()=>window.__inv||'')).match(/(http\S+#auxiliar=[A-Za-z0-9_-]+\.[0-9A-Z]{10})/)||[])[1];ok(!!lk,'PC: link do auxiliar');
 const Q=(await dev('iPhone',L.devices['iPhone 13'])).P;await Q.goto('about:blank');await Q.goto(L.inviteUrl(lk));await Q.waitForSelector('#aux-form input[name=password]',{timeout:20000}).catch(()=>{});
 await Q.fill('#aux-form input[name=email]',L.mail('caio'));await Q.fill('#aux-form input[name=password]','senha1234x');await Q.fill('#aux-form input[name=confirmation]','senha1234x');await L.terms(Q,'#aux-form');await Q.click('#aux-form button[type=submit]');await Q.waitForTimeout(3000);
 await Q.fill('#recovery-last4',(await Q.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await Q.click('#recovery-enter');await Q.waitForTimeout(2500);await Q.addStyleTag({content:'#alert-popup{display:none!important}'});
 await Q.evaluate(async()=>{state.perfil={name:'Caio',cargo:'',bio:'',photo:'',at:Date.now()};await save()});
 ok(await until(Q,()=>!!window.e99Cv&&e99Cv.state().started&&!!e99Cv.state().pk,null,60000),'iPhone auxiliar: conversas ligadas');
 const openGeral=async p=>{await p.evaluate(()=>{go('chat');e99Cv.open('geral')});await p.waitForSelector('#chat-text',{timeout:15000})};
 await openGeral(A);await openGeral(Q);
 ok(await until(Q,()=>/Conectado/.test(document.getElementById('chat-status').textContent),null,30000),'iPhone: chat da equipe conectado');
 /* ---------- chat da equipe ---------- */
 ok(await A.evaluate(()=>{document.querySelector('#chat-form .chat-plus').click();const b=document.querySelector('.chat-clip');return !!b&&/arquivo/i.test(b.getAttribute('aria-label'))&&b.getBoundingClientRect().height>=44}),'PC: botão de anexo (clipe) com rótulo e 44 px');
 ok(await Q.evaluate(()=>{const p=document.querySelector('#chat-form .chat-plus');if(p.getAttribute('aria-expanded')!=='true')p.click();const b=document.querySelector('.chat-clip');const r=b&&b.getBoundingClientRect();return !!r&&r.height>=44&&r.width>=44}),'iPhone: botão de anexo com 44 px');
 await A.fill('#chat-text','segue o relatório');
 await A.setInputFiles('#chat-file-in',{name:'relatorio <b>semana</b>.pdf',mimeType:'application/pdf',buffer:PDF});
 const card=(p,t)=>until(p,t=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-file')].some(c=>c.querySelector('b').textContent===t&&!!c.querySelector('.cf-dl')),t,40000);
 const NM='relatorio _b_semana__b_.pdf';
 ok(await card(A,NM)&&await card(Q,NM),'Equipe: PDF aparece no PC e no iPhone com nome, tipo e Baixar');
 ok(await until(Q,()=>!document.querySelector('#chat-list .chat-file b *')&&[...document.querySelectorAll('#chat-list .chat-txt')].some(x=>x.innerText==='segue o relatório')&&![...document.querySelectorAll('#chat-list .chat-txt')].some(x=>/Atualize o Stok/.test(x.innerText)),null,15000),'Equipe: nome escapado, legenda junto, aviso para aparelho antigo escondido');
 ok(await until(Q,()=>{const c=[...document.querySelectorAll('#chat-list .chat-file')].pop();if(!c)return false;return /PDF · /.test(c.innerText)&&!!c.querySelector('svg')&&!c.closest('.chat-msg').querySelector('iframe,embed,object')},null,15000),'Equipe: ícone e tipo PDF, sem abrir o conteúdo na página');
 const dl=async(p,sel)=>{const [d]=await Promise.all([p.waitForEvent('download',{timeout:20000}),p.click(sel)]);return {name:d.suggestedFilename(),buf:fs.readFileSync(await d.path())}};
 const d1=await dl(Q,'#chat-list .chat-msg[data-id] .chat-file .cf-dl');
 ok(d1.name===NM&&Buffer.compare(d1.buf,PDF)===0,'Equipe: iPhone baixa e os bytes são iguais ('+d1.buf.length+' B, '+d1.name+')');
 const lj=await A.evaluate(()=>e99Loja.status().loja);let raw=JSON.stringify(await admin('/lojas/'+lj+'/dados?pageSize=300'));
 ok(raw.includes('eq_a~')&&!/relat|semana|PDF-1/.test(raw),'Nuvem: anexo e nome só cifrados');
 /* bloqueios e limite */
 const before=await A.evaluate(()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length);
 for(const n of ['setup.exe','pagina.html','x.HTM','logo.svg','a.bat','s.js','app.apk']){await A.setInputFiles('#chat-file-in',{name:n,mimeType:'application/octet-stream',buffer:Buffer.from('MZ teste')});await A.waitForTimeout(150)}
 ok(await A.evaluate(()=>/não envia este tipo/.test(document.getElementById('toast').textContent)),'Equipe: tipo bloqueado avisa claro');
 await A.setInputFiles('#chat-file-in',{name:'grande.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(2*1024*1024+10,1)});await A.waitForTimeout(300);
 ok(await A.evaluate(()=>/limite do chat é 2 MB/.test(document.getElementById('toast').textContent)),'Equipe: acima de 2 MB avisa o limite');
 await A.waitForTimeout(1500);ok(await A.evaluate(n=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length===n&&!document.querySelector('#chat-list .chat-msg.pending,#chat-list .chat-msg.failed'),before),'Equipe: nada bloqueado foi enviado');
 ok(await A.evaluate(()=>e99Arq.blocked('x.exe')&&e99Arq.blocked('x.html')&&e99Arq.blocked('x.svg ')&&!e99Arq.blocked('nota.xml')&&!e99Arq.blocked('planilha.xlsx')),'Regra de bloqueio (exe/html/svg sim; xml/xlsx não)');
 /* falha de rede: Não enviada + Tentar de novo */
 await A.evaluate(()=>{window.__realConn=e99Loja.conn;e99Loja.conn=()=>null});
 await A.setInputFiles('#chat-file-in',{name:'notas.csv',mimeType:'text/csv',buffer:Buffer.from('a;b\n1;2\n')});
 ok(await until(A,()=>{const f=document.querySelector('#chat-list .chat-msg.failed');return !!f&&/notas\.csv/.test(f.innerText)&&!!f.querySelector('.chat-retry')},null,20000),'Equipe: sem nuvem fica "Não enviada" com Tentar de novo');
 await A.evaluate(()=>{e99Loja.conn=window.__realConn});await A.click('#chat-list .chat-msg.failed .chat-retry');
 ok(await card(Q,'notas.csv'),'Equipe: Tentar de novo envia o arquivo');
 /* apagar para todos com anexo */
 const fid=await A.evaluate(()=>{const c=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].find(m=>{const b=m.querySelector('.chat-file b');return b&&b.textContent==='notas.csv'});return c.getAttribute('data-id')});
 ok(await A.evaluate(id=>chatDeleteAll(id),fid)&&await until(Q,id=>!document.querySelector('#chat-list .chat-msg[data-id="'+id+'"]'),fid,30000),'Equipe: apagar para todos tira a mensagem com arquivo');
 await A.waitForTimeout(1500);raw=await admin('/lojas/'+lj+'/dados?pageSize=300');
 const parts=(raw.documents||[]).filter(d=>d.name.includes('eq_a~'+fid+'~'));ok(parts.length>0&&parts.every(d=>d.fields.del.booleanValue===true&&d.fields.d.stringValue===''),'Equipe: pedaços do anexo apagados na nuvem ('+parts.length+')');
 /* apagar deste aparelho */
 const pid=await Q.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].find(m=>m.querySelector('.chat-file')).getAttribute('data-id'));
 await Q.evaluate(id=>chatDelete(id),pid);ok(await until(Q,id=>!document.querySelector('#chat-list .chat-msg[data-id="'+id+'"]'),pid,10000),'Equipe: apagar deste aparelho tira a mensagem com arquivo');
 /* ---------- conversa privada ---------- */
 const uc=await Q.evaluate(()=>e99Loja.ctx().uid);
 ok(await until(A,u=>{const r=e99Social.S()['perfis_'+u];return !!(r&&r.x&&r.x.pk)},uc,40000),'Conversa: chave pública do auxiliar');
 await A.evaluate(u=>e99Cv.dmTo(u),uc);await A.waitForSelector('.cv-compose');
 ok(await A.evaluate(()=>{document.querySelector('.cv-compose .chat-plus').click();const b=document.querySelector('.cv-clip');return !!b&&b.getBoundingClientRect().height>=44}),'Conversa: botão de anexo 44 px');
 await A.setInputFiles('.cv-compose input[type=file]:not([accept])',{name:'Planilha estoque.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:XLS});
 ok(await until(A,()=>/Planilha estoque\.xlsx/.test(document.getElementById('cv-fprev').innerText),null,5000),'Conversa: arquivo escolhido aparece antes de enviar');
 await A.click('.cv-compose button.primary');
 ok(await until(A,()=>e99Cv.msgs().some(m=>m.f&&m.f.n==='Planilha estoque.xlsx'&&!m.st&&m.f.k>=2),null,40000),'Conversa: enviada em pedaços (1,5 MB)');
 await Q.evaluate(()=>go('chat'));ok(await until(Q,()=>e99Cv.state().convs.some(c=>/Arquivo/.test(c.last||'')||c.unread>0),null,30000),'Conversa: aparece na lista do iPhone');
 const cvid=await A.evaluate(()=>e99Cv.state().sub);await Q.evaluate(c=>e99Cv.open(c),cvid);
 ok(await until(Q,()=>{const c=document.querySelector('.cv-b .chat-file');return !!c&&/Planilha · 1,5 MB/.test(c.innerText)&&!!c.querySelector('.cf-dl')},null,30000),'Conversa: iPhone vê o cartão (Planilha · 1,5 MB · Baixar)');
 const d2=await dl(Q,'.cv-b .chat-file .cf-dl');ok(d2.name==='Planilha estoque.xlsx'&&Buffer.compare(d2.buf,XLS)===0,'Conversa: bytes baixados iguais ('+d2.buf.length+' B)');
 raw=JSON.stringify(await admin('/lojas/'+lj+'/dados?pageSize=300'));ok(/~k0m/.test(raw)&&!/Planilha/.test(raw),'Nuvem: pedaços da conversa cifrados');
 await Q.setInputFiles('.cv-compose input[type=file]:not([accept])',{name:'virus.exe',mimeType:'application/x-msdownload',buffer:Buffer.from('MZ')});
 ok(await Q.evaluate(()=>/não envia este tipo/.test(document.getElementById('toast').textContent)&&!document.getElementById('cv-fprev').innerText),'Conversa: .exe bloqueado');
 /* apagar para todos na conversa */
 const mid=await A.evaluate(()=>e99Cv.msgs().find(m=>m.f).id);await A.evaluate(id=>e99Cv.menu(id),mid);await A.waitForTimeout(300);await A.evaluate(()=>e99Cv.delAll());
 ok(await until(Q,id=>e99Cv.msgs().some(m=>m.id===id&&m.del),mid,30000),'Conversa: apagar para todos');
 await A.waitForTimeout(1500);raw=await admin('/lojas/'+lj+'/dados?pageSize=300');
 const ck=(raw.documents||[]).filter(d=>d.name.includes('~k')&&d.name.includes(mid));ok(ck.length>=2&&ck.every(d=>d.fields.d.stringValue==='E2F:'),'Conversa: pedaços apagados na nuvem ('+ck.length+')');
 ok(await Q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'iPhone: sem rolagem lateral');
 ok(!errs.length,'sem erro de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
