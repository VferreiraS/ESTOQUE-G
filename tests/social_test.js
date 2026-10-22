const L=require('./lib.js');const {ok,until}=L;const crypto=require('crypto');
const P='gen-lang-client-0167474823',AU='http://127.0.0.1:9099',VUID='TConyCsDQfPWBZ2MuGhVQTy7Mmz1';
const derive=(login,pw)=>'Stk#'+crypto.createHash('sha256').update('e99-cloud|'+login+'|'+pw).digest('hex').slice(0,40);
const j=async(u,o={})=>{const r=await fetch(u,o);try{return await r.json()}catch(e){return {}}};
async function verifyAll(){const r=await j(`${AU}/emulator/v1/projects/${P}/oobCodes`);for(const c of (r.oobCodes||[]))if(c.requestType==='VERIFY_EMAIL')await fetch(c.oobLink.replace(/^https?:\/\/[^/]+/,AU))}
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});await fetch(`${AU}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
 // a conta do gestor do teste usa o uid do Vitor, para conferir o selo
 const gl='sg'+T,gEmail='vitor.'+T+'@teste.com';
 await fetch(`${AU}/identitytoolkit.googleapis.com/v1/projects/${P}/accounts:batchCreate`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({users:[{localId:VUID,email:gEmail,rawPassword:derive(gl,'1234')}]})});
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();
 [A,B].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(2000);
 await A.click('text=Criar conta de outro estoque');await A.fill('#auth-screen input[name=store]','Loja '+gl);await A.fill('#auth-screen input[name=login]',gl);await A.fill('#auth-screen input[name=email]',gEmail);await A.fill('#auth-screen input[name=password]','1234');await A.fill('#auth-screen input[name=confirmation]','1234');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 await A.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'ana'},{id:'c9',number:'09',sector:'Bazar',owner:''},{id:'c10',number:'10',sector:'Limpeza',owner:''}];state.plans=[{id:'p1',title:'Plano de terça',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana',notes:'',photos:[]}]}];await save();go('chat')});
 await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 ok(await until(A,()=>syncStatus().ready&&syncStatus().connected),'gestor team');
 ok(await until(A,(u)=>!!(window.e99Cloud&&e99Cloud.user()&&e99Cloud.user().uid===u),VUID,20000),'gestor entrou com o uid do Vitor');
 const link=await L.makeInvite(A,'Ana');await L.auxAccept(B,link,null,'4321');
 ok(await until(B,()=>!!(window.e99Team&&e99Team.get()&&window.e99Cloud&&e99Cloud.user()),null,30000),'aux na equipe e na nuvem');
 await verifyAll();await B.evaluate(()=>e99Cloud.after(true));await A.evaluate(()=>e99Cloud.after(true));
 // contas confirmadas -> Equipe e corredores
 ok(await until(A,()=>{const a=state.team.find(t=>t.id==='ana');return !!(a&&a.login)},null,40000),'Ana (Equipe) ligada à conta confirmada');
 ok(await until(A,()=>state.corridors.filter(c=>c.owner==='ana').length===3,null,10000),'corredores sem responsável foram para a Ana');
 await A.evaluate(()=>{openProfile('me')});await A.waitForTimeout(800);
 ok(await A.evaluate(()=>!!document.querySelector('#view .prof-head h1 .vbadge')),'selo verificado no meu perfil');
 const names=await A.evaluate(()=>[...document.querySelectorAll('.prof-people button b')].map(b=>b.textContent));ok(names.filter(n=>/^Ana/.test(n)).length===1,'Ana aparece uma vez só em Pessoas ('+names.join(', ')+')');
 // B vê o selo do gestor e não tem selo
 await B.evaluate(()=>go('profile'));ok(await until(B,()=>{const l=[...document.querySelectorAll('.prof-people button')];return l.some(x=>/Vitor/.test(x.innerText)&&x.querySelector('.vbadge'))&&!document.querySelector('.prof-head h1 .vbadge')},null,30000),'aux vê o selo só no Vitor');
 // digitando
 await A.evaluate(()=>go('chat'));await B.evaluate(()=>go('chat'));await B.waitForTimeout(1500);await B.type('#chat-text','oi',{delay:80});
 ok(await until(A,()=>/digitando/.test((document.getElementById('chat-typing')||{}).textContent||''),null,15000),'gestor vê "Ana está digitando…"');await B.fill('#chat-text','');
 // menção com aviso pessoal
 await A.fill('#chat-text','@An');ok(await until(A,()=>!document.getElementById('mention-box').hidden,null,5000),'sugestões de @menção');await A.click('#mention-box button');
 await A.type('#chat-text','pode conferir o 09?');await A.click('#chat-send');
 ok(await until(B,()=>!!document.querySelector('#chat-list .chat-msg.mentioned .mention'),null,20000),'aux vê a menção destacada');
 const lg=await (await fetch(L.N+'/_log')).json();ok(lg.some(x=>/^e99p-/.test(x.topic)&&/marcou você|conferir/.test(decodeURIComponent(x.message||''))),'aviso pessoal enviado (app fechado)');
 // reação e visto
 await B.evaluate(()=>{const m=[...document.querySelectorAll('#chat-list .chat-msg')].pop();return e99React(m.getAttribute('data-id'),'❤️',true)});
 ok(await until(A,()=>/❤️ 1/.test(([...document.querySelectorAll('#chat-list .chat-msg.mine')].pop().querySelector('.reacts')||{}).textContent||''),null,15000),'gestor vê a reação ❤️');
 ok(await until(A,()=>/Visto por/.test(([...document.querySelectorAll('#chat-list .chat-msg.mine')].pop().querySelector('.seen-by')||{}).textContent||''),null,20000),'✓✓ Visto por');
 // fixar pelo menu (botão direito no PC)
 await A.click('#chat-list .chat-msg.mine >> nth=-1',{button:'right'});await A.click('#msg-menu [data-a=pin]');
 ok(await until(B,()=>{const p=document.getElementById('chat-pin');return p&&!p.hidden&&/conferir/.test(p.innerText)},null,15000),'mensagem fixada aparece para a equipe');
 // encaminhar atividade
 await A.evaluate(()=>e99Forward('act','p1','a1'));await A.waitForTimeout(600);ok(/📌 Atividade para @Ana: Repor arroz/.test(await A.inputValue('#chat-text')),'encaminhar atividade no chat');
 // avisos com app fechado na tela Conta
 await A.evaluate(()=>go('account'));ok(await until(A,()=>/e99p-[0-9a-f]{24}/.test((document.getElementById('push-topics')||{}).innerText||''),null,8000),'canais do ntfy na tela Conta');
 await A.evaluate(()=>go('corridors'));await A.waitForTimeout(500);ok(await A.evaluate(()=>!!document.querySelector('.cor-dist button:not([disabled])')),'botão distribuir corredores');
 ok(await B.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'sem rolagem lateral no iPhone');
 await B.evaluate(()=>go('chat'));await B.waitForTimeout(800);await B.locator('.chat-wrap').screenshot({path:require('os').tmpdir()+'/stok-social-iphone.png'});
 await A.evaluate(()=>openProfile('me'));await A.waitForTimeout(900);await A.screenshot({path:require('os').tmpdir()+'/stok-social-prof.png'});
 console.log('errors',errs);await b.close()})();
