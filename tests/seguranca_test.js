/* v89: segurança — reação do chat (S1), papel de gestor na nuvem e Administração (S3/S4/P18), freio de exclusões pelo ntfy (S5),
   regras da fila de erros, correio e perfil (S7/S8/S13) e contraste do botão principal (P4). */
const L=require('./lib.js');const {ok,until}=L;
const P='gen-lang-client-0167474823',AU='http://127.0.0.1:9099',FS='http://127.0.0.1:8080',DOCS=`${FS}/v1/projects/${P}/databases/(default)/documents`;
const j=async(u,o={})=>{const r=await fetch(u,o);const t=await r.text();try{return {s:r.status,b:JSON.parse(t)}}catch(e){return {s:r.status,b:t}}};
async function user(email){const r=await j(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'senha-123456',returnSecureToken:true})});return {uid:r.b.localId,tok:r.b.idToken}}
function F(o){const f={};for(const k in o){const v=o[k];f[k]=typeof v==='number'?{integerValue:String(v)}:typeof v==='boolean'?{booleanValue:v}:typeof v==='object'?{mapValue:{fields:F(v)}}:{stringValue:String(v)}}return f}
const put=(path,data,tok)=>j(`${DOCS}/${path}`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+(tok||'owner')},body:JSON.stringify({fields:F(data)})});
const lum=c=>{const a=c.match(/\d+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]};
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 /* ---------- regras da nuvem ---------- */
 const loja='a'.repeat(31)+'1',u1=await user('s1.'+T+'@teste.com'),u2=await user('s2.'+T+'@teste.com');
 ok((await put(`lojas/${loja}/reacoes/m1_${u1.uid}`,{msg:'m1',uid:u1.uid,emoji:"');eval(title)//",nome:'x',at:T},u1.tok)).s===403,'regra: reação com texto livre é recusada');
 ok((await put(`lojas/${loja}/reacoes/m1_${u1.uid}`,{msg:'m1',uid:u1.uid,emoji:'👍',nome:'x',at:T},u1.tok)).s===200,'regra: reação da lista fixa é aceita');
 ok((await put(`lojas/${loja}/erros/abcdefgh1`,{msg:'oi',onde:'',pagina:'',ver:'89',por:'',n:1,at:Date.now()+30*864e5},u1.tok)).s===403,'regra: erro com data no futuro é recusado');
 ok((await put(`lojas/${loja}/erros/abcdefgh2`,{msg:'x'.repeat(301),onde:'',pagina:'',ver:'89',por:'',n:1,at:Date.now()},u1.tok)).s===403,'regra: erro com texto gigante é recusado');
 ok((await put(`lojas/${loja}/erros/abcdefgh3`,{msg:'erro real',onde:'',pagina:'',ver:'89',por:'',n:1,at:Date.now()},u1.tok)).s===200,'regra: erro normal é aceito');
 ok((await put(`usuarios/${u1.uid}`,{email:'s1.'+T+'@teste.com',login:'s1',role:'gestor',criado:T,visto:T,verificado:false},u1.tok)).s===403,'regra: ninguém se cria como gestor');
 ok((await put(`usuarios/${u1.uid}`,{email:'s1.'+T+'@teste.com',login:'s1',role:'estoque',criado:T,visto:T,verificado:false},u1.tok)).s===200,'regra: conta estoque continua gravando');
 ok((await put(`usuarios/${u1.uid}`,{email:'s1.'+T+'@teste.com',login:'s1',role:'gestor',criado:T,visto:T,verificado:false},u1.tok)).s===403,'regra: estoque não vira gestor');
 ok((await put(`lojas/${loja}/perfis/${u1.uid}`,{login:'leonardo69',role:'estoque',at:Date.now()+400*864e5,p:{user:'leo',name:'Leo'}},u1.tok)).s===403,'regra: perfil com data no futuro é recusado');
 ok((await put(`lojas/${loja}/perfis/${u1.uid}`,{login:'s1',role:'estoque',at:Date.now(),p:{user:'sss1',name:'S1'}},u1.tok)).s===200,'regra: perfil normal é aceito');
 /* correio: precisa de e-mail confirmado, membros da loja e id loja_para_dia */
 const v=await user('s3.'+T+'@teste.com');
 await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:update?key=x`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({localId:v.uid,emailVerified:true})});
 const vt=(await j(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'s3.'+T+'@teste.com',password:'senha-123456',returnSecureToken:true})})).b.idToken;
 const day='20261024',mail=(para,texto)=>({de:v.uid,para,assunto:'Resumo',texto,tipo:'resumo',loja,criado:Date.now()});
 ok((await put(`correio/${loja}_${u2.uid}_${day}`,mail(u2.uid,'oi'),vt)).s===403,'regra: correio para quem não é da loja é recusado');
 await put(`lojas/${loja}/membros/${v.uid}`,{login:'v',role:'estoque',criado:T,visto:T,verificado:true});await put(`lojas/${loja}/membros/${u2.uid}`,{login:'u2',role:'auxiliar',criado:T,visto:T,verificado:false});
 ok((await put(`correio/${loja}_${u2.uid}_${day}`,mail(u2.uid,'x'.repeat(5000)),vt)).s===403,'regra: correio com texto gigante é recusado');
 ok((await put(`correio/qualquer-id`,mail(u2.uid,'oi'),vt)).s===403,'regra: correio com id livre é recusado');
 ok((await put(`correio/${loja}_${u2.uid}_${day}`,mail(u2.uid,'Resumo do dia'),vt)).s===200,'regra: resumo para colega da loja é aceito');

 /* ---------- S1: reação maliciosa vinda da nuvem não executa nada ---------- */
 const A=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(A,'sg'+T),'gestor com equipe');
 ok(await until(A,()=>!!(window.e99Cloud&&e99Cloud.user()),null,30000),'gestor na nuvem');
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(1200);await A.fill('#chat-text','mensagem de teste');await A.click('#chat-send');
 ok(await until(A,()=>!!document.querySelector('#chat-list .chat-msg[data-id]'),null,15000),'mensagem no chat');
 const [sid,mid,myUid]=await A.evaluate(async()=>[await e99Cloud.sid(),[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].pop().getAttribute('data-id'),e99Cloud.user().uid]);
 await put(`lojas/${sid}/reacoes/${mid}_evil1`,{msg:mid,uid:'evil1',emoji:"');window.__pwn=1;//",nome:"');window.__pwn=1;//",at:Date.now()});
 await put(`lojas/${sid}/reacoes/${mid}_evil2`,{msg:mid,uid:'evil2',emoji:'👍',nome:'<img src=x onerror="window.__pwn=2">',at:Date.now()});
 ok(await until(A,()=>/👍 1/.test((document.querySelector('#chat-list .chat-msg .reacts')||{}).textContent||''),null,20000),'reação válida aparece');
 ok(await A.evaluate(()=>!document.querySelector('#chat-list .reacts [onclick]')&&!/__pwn/.test(document.getElementById('chat-list').innerHTML.replace(/title="[^"]*"/g,''))),'reação inválida não aparece e nenhum onclick vem da rede');
 await A.click('#chat-list .reacts button');await A.waitForTimeout(1500);ok(await A.evaluate(()=>!window.__pwn),'tocar na reação não executa código');

 /* ---------- S4/P18: Administração só para gestor ---------- */
 const n0=await A.evaluate(()=>authAccounts().length);
 await A.evaluate(()=>{authSession.payload.role='estoque';window.confirm=()=>true;authDeleteAllOtherAccounts();go('admin')});await A.waitForTimeout(500);
 ok(await A.evaluate(n=>authAccounts().length===n,n0),'conta estoque não apaga as outras contas');
 ok(await A.evaluate(()=>/Só o gestor/.test(document.getElementById('view').innerText)&&!document.querySelector('#view button.danger')&&!/Redefinir senha/.test(document.getElementById('view').innerText)),'tela Administração bloqueada para conta comum');
 await A.evaluate(()=>{authSession.payload.role='auxiliar';go('admin')});await A.waitForTimeout(400);ok(await A.evaluate(()=>!document.querySelector('#view button.danger')),'auxiliar não vê botões de apagar');
 await A.evaluate(()=>{authSession.payload.role='estoque';go('home')});

 /* ---------- S5: alguém da equipe tenta apagar as NFs de todos pelo ntfy ---------- */
 await A.evaluate(async()=>{for(let i=2;i<=7;i++)state.nfs.push({id:'n'+i,number:'5000'+i,supplier:'Forn '+i,date:iso(),status:'Pendente',owner:'',notes:'',volumes:1});await save()});
 ok(await until(A,()=>syncStatus().pending===0,null,30000),'NFs enviadas para a equipe');
 const code=await A.evaluate(()=>e99Team.get().code);
 const X=await (await b.newContext(L.devices['iPhone 13'])).newPage();X.on('pageerror',e=>errs.push(e.message));X.on('dialog',d=>d.accept());
 await X.goto('http://localhost:8000/index.html?ntfy='+L.N);await X.waitForTimeout(1500);await L.signup(X,'sx'+T);await X.evaluate(()=>go('chat'));
 await X.fill('#view form[onsubmit="chatJoin(event)"] input[name=code]',code);await X.fill('#view form[onsubmit="chatJoin(event)"] input[name=name]','Intruso');await X.click('#view form[onsubmit="chatJoin(event)"] button');
 ok(await until(X,()=>state.nfs.length>=7&&syncStatus().ready,null,90000),'intruso recebeu as NFs');
 await X.evaluate(async()=>{authSession.payload.role='gestor';state.nfs=[];await save()});
 ok(await until(X,()=>syncStatus().pending===0,null,30000),'intruso mandou as exclusões');
 await A.waitForTimeout(6000);ok(await A.evaluate(()=>state.nfs.length>=7),'gestor não perdeu as NFs (exclusão em massa barrada)');
 /* exclusão do próprio item continua valendo */
 await X.evaluate(async()=>{state.nfs=[{id:'nx',number:'777',supplier:'Meu',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1}];await save()});
 ok(await until(A,()=>state.nfs.some(n=>n.id==='nx'),null,40000),'NF nova do colega chega');
 await X.evaluate(async()=>{state.nfs=[];await save()});ok(await until(A,()=>!state.nfs.some(n=>n.id==='nx'),null,40000),'colega apaga a própria NF');

 /* ---------- P4: contraste do botão principal ---------- */
 const P2=await (await b.newContext(L.devices['iPhone 13'])).newPage();await P2.goto('http://localhost:8000/index.html');await P2.waitForTimeout(2500);
 const bg=await P2.evaluate(()=>{const x=document.querySelector('#auth-form button[type=submit]');return getComputedStyle(x).backgroundColor+'|'+getComputedStyle(x).color});const [c1,c2]=bg.split('|');const L1=lum(c1),L2=lum(c2);const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
 ok(ratio>=4.5,'botão Entrar com contraste '+ratio.toFixed(2)+':1 ('+c1+')');
 console.log('errors',errs);await b.close()})();
