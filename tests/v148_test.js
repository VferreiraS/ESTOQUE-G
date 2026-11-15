/* v148: Chat da equipe e sincronização só pela nuvem da loja (Firebase). O serviço antigo de mensagens fica BLOQUEADO em todos os
   aparelhos (e nenhum pedido pode sair para ele). PC 1440×900 (gestor verificado) + iPhone 13 (estoque) + iPhone 13 (auxiliar), emulador. */
const L=require('./lib');const {ok,until}=L;
const URL0='http://localhost:8000/index.html';const OLD='nt'+'fy.sh';
const STRICT=()=>{try{localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup');localStorage.setItem('e99-test-strong','1')}catch(e){}};
const admin=L.fsAdmin;
(async()=>{const b=await L.chromium.launch();const errs=[],old=[];
 async function dev(nome,opts){const c=await b.newContext(opts);await c.addInitScript(STRICT);await c.route(u=>u.hostname===OLD||u.hostname.endsWith('.'+OLD),r=>{old.push(nome+' '+r.request().url());r.abort()});const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|ERR_FAILED|firestore|Firebase|identitytoolkit|WebChannel|permission/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return {c,P}}
 const G=await dev('PC',{viewport:{width:1440,height:900}});const A=G.P;
 await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(500);await A.click('#auth-owner');await A.waitForTimeout(300);
 await A.fill('#auth-screen input[name=store]','Lojas G');await A.fill('#auth-screen input[name=email]',L.mail('vferreiras'));await A.fill('#auth-screen input[name=login]','vferreiras');await A.fill('#auth-screen input[name=password]','abc12345');await A.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await until(A,()=>!!(e99Cloud.user()&&e99Cloud.user().email),null,40000),'PC: gestor entrou com a nuvem ligada');
 const guid=await A.evaluate(()=>e99Cloud.user().uid);await admin('/verificados/'+guid,{fields:{tipo:{stringValue:'s'}}});
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 await A.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'ana'}];
  state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3}];
  state.plans=[{id:'p1',title:'Plano de terça',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana',notes:'',photos:[]}]}];await save()});
 ok(await until(A,()=>{const s=e99Loja.status();return s.status==='ok'&&s.seeded&&s.pend===0},null,40000),'PC: dados da loja na nuvem');
 ok(await A.evaluate(()=>!(('nt'+'fy') in e99Team)&&typeof e99SyncSend==='undefined'&&typeof e99SyncPeek==='undefined'&&typeof e99AlertPing==='undefined'&&typeof e99NetLimit==='undefined'&&typeof EventSource!=='undefined'),'App: não há mais transporte antigo (envio, espiar canal, avisos por app externo, limite)');
 async function link(nome,login,papel){await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);await A.evaluate(()=>e99OpenAccCreate());await A.waitForTimeout(500);
  await A.fill('#aux-box input[name=name]',nome);await A.fill('#aux-box input[name=login]',login);await A.selectOption('#aux-box select[name=papel]',papel);
  await A.evaluate(()=>{window.__inv='';navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
  const m=(await A.evaluate(()=>window.__inv||'')).match(/(http\S+#auxiliar=[A-Za-z0-9_-]+\.[0-9A-Z]{10})/);return m&&m[1]}
 const lE=await link('Bia','bia.estoque','estoque'),lX=await link('Caio','caio.aux','auxiliar'),lZ=await link('Zeca','zeca.aux','auxiliar');ok(!!lE&&!!lX&&!!lZ,'PC: links de acesso gerados');
 async function activate(nome,lk,pw){const D=await dev(nome,L.devices['iPhone 13']);const B=D.P;await B.goto('about:blank');await B.goto(L.inviteUrl(lk));await B.waitForSelector('#aux-form input[name=password]',{timeout:25000}).catch(()=>{});
  await B.fill('#aux-form input[name=email]',L.mail(nome));await B.fill('#aux-form input[name=password]',pw);await B.fill('#aux-form input[name=confirmation]',pw);await L.terms(B,'#aux-form');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
  await B.fill('#recovery-last4',(await B.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await B.click('#recovery-enter');await B.waitForTimeout(2500);await B.addStyleTag({content:'#alert-popup{display:none!important}'});return D}
 const E=await activate('iPhone estoque',lE,'bia12345x');const P=E.P;
 const X=await activate('iPhone auxiliar',lX,'caio1234x');const Q=X.P;
 ok(await until(P,()=>state.nfs.some(n=>n.id==='n1')&&state.plans.some(p=>p.id==='p1')&&state.corridors.some(c=>c.id==='c7'),null,60000),'iPhone estoque: recebe NFs, plano e corredor pela nuvem');
 ok(await until(Q,()=>state.nfs.some(n=>n.id==='n1')&&state.plans.some(p=>p.id==='p1'),null,60000),'iPhone auxiliar: recebe os dados pela nuvem');
 ok(await until(A,()=>{const p=e99Loja.status().papeis;return Object.values(p).includes('estoque')&&Object.values(p).includes('auxiliar')},null,90000),'PC: gestor confirmou os papéis das duas contas');

 /* ---------- chat da equipe pela nuvem ---------- */
 const openChat=async p=>{await p.evaluate(()=>{go('chat')});await p.waitForTimeout(600);await p.evaluate(()=>{if(!document.getElementById('chat-list')&&window.e99Cv)e99Cv.open('geral')});await p.waitForSelector('#chat-text',{timeout:15000})};
 const texts=p=>p.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].map(x=>x.innerText));
 const has=(p,t,ms)=>until(p,t=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].some(x=>x.innerText===t),t,ms||30000);
 const gone=(p,t,ms)=>until(p,t=>!!document.getElementById('chat-list')&&![...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].some(x=>x.innerText===t),t,ms||30000);
 const send=async(p,t)=>{await p.fill('#chat-text',t);await p.click('#chat-send')};
 for(const p of [A,P,Q])await openChat(p);
 ok(await until(A,()=>/Conectado/.test(document.getElementById('chat-status').textContent),null,20000)&&await until(Q,()=>/Conectado/.test(document.getElementById('chat-status').textContent),null,20000),'Chat: PC e auxiliar mostram "Conectado" (nuvem)');
 await send(A,'Bom dia, equipe');ok(await has(A,'Bom dia, equipe')&&await has(P,'Bom dia, equipe')&&await has(Q,'Bom dia, equipe'),'Chat: mensagem do gestor chega no estoque e no auxiliar');
 await send(P,'Bia na área');ok(await has(A,'Bia na área')&&await has(Q,'Bia na área'),'Chat: mensagem do estoque chega no PC e no auxiliar');
 await send(Q,'Caio chegou');await send(Q,'mensagem errada do Caio');ok(await has(A,'Caio chegou')&&await has(P,'Caio chegou')&&await has(A,'mensagem errada do Caio')&&await has(P,'mensagem errada do Caio'),'Chat: mensagens do auxiliar chegam no PC e no estoque');
 await A.waitForTimeout(1500);ok((await texts(A)).filter(x=>x==='Bom dia, equipe').length===1&&(await texts(P)).filter(x=>x==='Bia na área').length===1,'Chat: o eco da nuvem não duplica a própria mensagem');
 /* foto */
 const sentPhoto=await A.evaluate(async()=>{const c=document.createElement('canvas');c.width=320;c.height=240;const x=c.getContext('2d');for(let i=0;i<60;i++){x.fillStyle='hsl('+(i*37%360)+',80%,50%)';x.fillRect((i*53)%320,(i*29)%240,90,70)}return chatSend('foto do corredor 07',c.toDataURL('image/jpeg',.9))});
 const imgOk=p=>until(p,()=>{const m=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].find(x=>/foto do corredor 07/.test(x.innerText));const i=m&&m.querySelector('img');return !!(i&&i.complete&&i.naturalWidth===320)},null,40000);
 ok(sentPhoto&&await imgOk(P)&&await imgOk(Q),'Chat: foto enviada pelo PC abre inteira (320 px) no estoque e no auxiliar');
 /* foto grande: vai em vários pedaços */
 const big=await P.evaluate(async()=>{const c=document.createElement('canvas');c.width=1400;c.height=1100;const x=c.getContext('2d'),d=x.createImageData(1400,1100);crypto.getRandomValues(new Uint8Array(65536)).forEach((v,i)=>{for(let k=i;k<d.data.length;k+=65536)d.data[k]=v});for(let k=3;k<d.data.length;k+=4)d.data[k]=255;x.putImageData(d,0,0);const u=c.toDataURL('image/jpeg',.95);return {ok:await chatSend('foto grande',u),len:u.length}});
 ok(big.ok&&big.len>900000&&await until(A,()=>{const m=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].find(x=>/foto grande/.test(x.innerText));const i=m&&m.querySelector('img');return !!(i&&i.complete&&i.naturalWidth===1400)},null,60000),'Chat: foto grande ('+Math.round(big.len/1024)+' KB) vai em pedaços e abre no PC');
 /* apagar para todos */
 const idOf=(p,t)=>p.evaluate(t=>{const m=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].find(x=>{const c=x.querySelector('.chat-txt');return c&&c.innerText===t});return m?m.getAttribute('data-id'):''},t);
 ok(await Q.evaluate(async id=>await chatDeleteAll(id),await idOf(Q,'mensagem errada do Caio'))&&await gone(A,'mensagem errada do Caio')&&await gone(P,'mensagem errada do Caio')&&await gone(Q,'mensagem errada do Caio'),'Chat: auxiliar apaga a própria mensagem para todos (PC e estoque deixam de ver)');
 ok(await Q.evaluate(async id=>!(await e99CanDelAll(id)),await idOf(Q,'Bom dia, equipe')),'Chat: auxiliar não pode apagar a mensagem do gestor');
 const forj=await Q.evaluate(async ref=>{const c=e99Loja.conn();const id='zz'+Date.now().toString(36);try{await c.L().collection('dados').doc('eq_m~'+ref).set({c:'eq',at:Date.now(),st:c.FS.FieldValue.serverTimestamp(),by:c.uid,cuid:c.uid,del:true,v:1,d:''});return 'gravou'}catch(e){return e.code}},await idOf(Q,'Bom dia, equipe'));
 ok(forj==='permission-denied','Chat: auxiliar esvaziar a mensagem do gestor direto na nuvem é recusado ('+forj+')');
 ok(await A.evaluate(async id=>await chatDeleteAll(id),await idOf(A,'Bia na área'))&&await gone(P,'Bia na área')&&await gone(Q,'Bia na área')&&await gone(A,'Bia na área'),'Chat: gestor apaga a mensagem de outra pessoa para todos');
 ok((await texts(P)).includes('Bom dia, equipe')&&(await texts(Q)).includes('Caio chegou'),'Chat: as outras mensagens continuam');
 /* não enviada + tentar de novo (nuvem fora) */
 await P.evaluate(()=>{window.__c=e99Loja.conn;e99Loja.conn=()=>null});await send(P,'sai depois');
 ok(await until(P,()=>{const f=document.querySelector('#chat-list .chat-msg.failed');return !!(f&&/Não enviada/.test(f.innerText)&&f.querySelector('.chat-retry'))},null,10000),'Chat: sem a nuvem a mensagem fica "Não enviada" com Tentar de novo');
 await P.evaluate(()=>{e99Loja.conn=window.__c});await P.click('#chat-list .chat-msg.failed .chat-retry');
 ok(await has(A,'sai depois')&&await until(P,()=>!document.querySelector('#chat-list .chat-msg.failed'),null,10000)&&(await texts(P)).filter(x=>x==='sai depois').length===1,'Chat: Tentar de novo envia uma vez só e chega no PC');
 /* nada em claro na nuvem */
 const loja=await A.evaluate(()=>e99Loja.status().loja);let raw=[],tok='';do{const r=await admin('/lojas/'+loja+'/dados?pageSize=300'+(tok?'&pageToken='+tok:''));raw=raw.concat(r.documents||[]);tok=r.nextPageToken||''}while(tok);
 const eq=raw.filter(d=>/\/eq_/.test(d.name)),txt=JSON.stringify(raw);
 ok(eq.some(d=>/\/eq_m~/.test(d.name))&&eq.filter(d=>/\/eq_a~/.test(d.name)).length>=3&&!/Bom dia|Caio chegou|corredor 07|sai depois|48213|Laticínios|Thomaz/.test(txt)&&eq.every(d=>{const s=d.fields.d.stringValue;return s===''||/^(E99:|E99D:|S99:)?[A-Za-z0-9+/=]+$/.test(s)}),'Nuvem: chat e anexos só cifrados ('+eq.length+' documentos eq)');

 /* ---------- NF, plano, demanda e responsável pela nuvem ---------- */
 await P.evaluate(async()=>{state.nfs.push({id:'ne1',number:'70001',supplier:'Bebidas Sul',date:iso(),status:'Pendente',owner:'',notes:'',volumes:4});await save()});
 ok(await until(A,()=>state.nfs.some(n=>n.id==='ne1'),null,40000)&&await until(Q,()=>state.nfs.some(n=>n.id==='ne1'),null,40000),'Sync: NF criada no estoque chega no PC e no auxiliar');
 await Q.evaluate(async()=>{state.plans.push({id:'px1',title:'Plano do Caio',date:iso(),activities:[{id:'ax1',title:'Separar quebras',owner:'Caio',notes:'',photos:[],demanda:'Quebras'}]});await save()});
 ok(await until(A,()=>state.plans.some(p=>p.id==='px1'&&p.activities[0].demanda==='Quebras'),null,40000)&&await until(P,()=>state.plans.some(p=>p.id==='px1'),null,40000),'Sync: plano com demanda criado pelo auxiliar chega no PC e no estoque');
 await A.evaluate(()=>{go('home')});await A.waitForTimeout(500);await A.evaluate(()=>e99DemResp(1,'Thomaz'));
 const dr=p=>until(p,()=>(state.dresp||[]).some(d=>d.id==='d2'&&d.resp==='Thomaz'),null,40000);
 ok(await dr(P)&&await dr(Q),'Sync: responsável da demanda "Quebras" (dresp) chega no estoque e no auxiliar pela nuvem');
 await P.evaluate(()=>{go('home')});await P.waitForTimeout(500);await P.evaluate(()=>e99DemResp(2,'Bia'));
 ok(await until(A,()=>(state.dresp||[]).some(d=>d.id==='d3'&&d.resp==='Bia'),null,40000),'Sync: estoque também define responsável de demanda (papel confirmado)');
 const auxD=await Q.evaluate(async()=>{const c=e99Loja.conn();try{await c.L().collection('dados').doc('dresp_d4').set({c:'dresp',at:Date.now(),st:c.FS.FieldValue.serverTimestamp(),by:c.uid,cuid:c.uid,del:false,v:1,d:await c.seal('dresp_d4',{x:{id:'d4',resp:'Caio'},b:'Caio'})});return 'gravou'}catch(e){return e.code}});
 ok(auxD==='permission-denied'&&await A.evaluate(()=>!(state.dresp||[]).some(d=>d.id==='d4')),'Sync: auxiliar não grava responsável de demanda na nuvem ('+auxD+')');
 await A.evaluate(async()=>{const n=state.nfs.find(x=>x.id==='ne1');n.status='Conferido';await save()});
 ok(await until(P,()=>state.nfs.some(n=>n.id==='ne1'&&n.status==='Conferido'),null,40000),'Sync: mudança de status no PC chega no estoque');
 await A.evaluate(async()=>{state.nfs=state.nfs.filter(n=>n.id!=='n1');await save()});
 ok(await until(Q,()=>!state.nfs.some(n=>n.id==='n1'),null,40000),'Sync: exclusão feita pelo gestor chega no auxiliar');

 /* ---------- perfil só pela nuvem ---------- */
 await P.evaluate(()=>openProfile('me'));await P.waitForSelector('#pf-form',{timeout:10000});await P.fill('#pf-name','Bia Souza');await P.fill('#pf-cargo','Conferente');await P.click('#pf-form button[type=submit]');
 ok(await until(A,()=>{const p=e99Perfil({login:'bia.estoque'});return !!(p&&p.name==='Bia Souza'&&p.cargo==='Conferente'&&p.uid)},null,60000),'Perfil: o perfil do estoque aparece no PC (perfis_{uid})');
 await A.evaluate(()=>go('team'));ok(await until(A,()=>/Bia Souza/.test(document.getElementById('view').textContent),null,20000),'Perfil: aparece na aba Equipe do gestor');

 /* ---------- link de acesso de uso único pela nuvem ---------- */
 ok(await until(A,()=>Object.values(syncMembers()).filter(m=>m&&m.inviteId).length>=2,null,40000),'PC: gestor vê as duas contas ativadas (membros da nuvem)');
 const C=(await dev('Outro aparelho',{viewport:{width:1440,height:900}})).P;await C.goto(lE);
 ok(await until(C,()=>{const e=document.getElementById('inv-used');return !!(e&&/ativado em outro aparelho/.test(e.textContent))},null,30000)&&await C.evaluate(()=>!authAccounts().length&&!document.querySelector('#aux-form input[name=password]')),'Link: já ativado em outro aparelho não cria segunda conta');
 await A.evaluate(()=>{go('chat')});await A.waitForTimeout(600);await A.evaluate(()=>{if(!document.getElementById('aux-box')&&window.e99Cv)e99Cv.open('geral')});await A.waitForTimeout(600);
 const iz=await A.evaluate(()=>JSON.parse(localStorage.getItem('lojasg.estoque99.aux-invites:'+authSession.storeKey)).findIndex(x=>x.login==='zeca.aux'));await A.evaluate(i=>auxForget(i),iz);
 const zid=await A.evaluate(()=>JSON.parse(localStorage.getItem('lojasg.estoque99.invite-revoked:'+authSession.storeKey))[0]);
 ok(await until(A,async id=>{const c=e99Loja.conn();return (await c.L().collection('dados').doc('eq_u~'+id).get()).exists},zid,30000),'Link: cancelamento do gestor gravado na nuvem');
 await C.goto('about:blank');await C.goto(lZ);
 ok(await until(C,()=>{const e=document.getElementById('inv-used');return !!(e&&/cancelado pelo gestor/.test(e.textContent))},null,30000)&&await C.evaluate(()=>!authAccounts().length),'Link: cancelado pelo gestor não ativa em aparelho novo');

 /* ---------- rede e textos ---------- */
 const nl=await A.evaluate(()=>e99NetList());ok(nl.length===3&&nl.every(x=>/googleapis|gstatic/.test(x.name)),'Rede: o teste de conexão só confere os serviços da nuvem ('+nl.length+')');
 await A.evaluate(()=>go('alerts'));await A.waitForTimeout(600);const al=await A.evaluate(()=>document.getElementById('view').innerText);
 await A.evaluate(()=>go('data'));await A.waitForTimeout(600);const dt=await A.evaluate(()=>document.getElementById('view').innerText);
 ok(!new RegExp(OLD.split('.')[0],'i').test(al+dt)&&!/Avisos com o app fechado/.test(al),'Telas: Alertas e Dados não citam mais o app de avisos antigo');
 ok(old.length===0,'Nenhum pedido saiu para o serviço antigo ('+old.length+')'+(old.length?' '+old.slice(0,2).join(' '):''));
 ok(errs.length===0,'0 erro de página/console'+(errs.length?' '+errs.slice(0,3).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro do teste: '+(e&&e.stack||e));process.exit(1)});
