const L=require('./lib.js');const {ok,until}=L;const {spawn}=require('child_process');const path=require('path');
const P='gen-lang-client-0167474823',AU='http://127.0.0.1:9099';
async function verifyAll(){const r=await (await fetch(`${AU}/emulator/v1/projects/${P}/oobCodes`)).json();for(const c of (r.oobCodes||[]))if(c.requestType==='VERIFY_EMAIL')await fetch(c.oobLink.replace(/^https?:\/\/[^/]+/,AU))}
(async()=>{const s1=spawn('node',[path.join(__dirname,'fake_llm.js'),'20142']);await new Promise(r=>setTimeout(r,700));
 await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});await fetch(`${AU}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
 const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();
 [A,B].forEach(p=>{p.on('pageerror',e=>{if(!/teste-erro-stok/.test(e.message))errs.push(e.message)});p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(A,'ap'+Date.now()),'gestor team');
 await A.evaluate(()=>{const y=new Date();y.setDate(y.getDate()-1);state.plans.push({id:'p2',title:'Plano de ontem',date:y.toISOString().slice(0,10),activities:[{id:'a9',title:'Etiquetar o 07',owner:'Ana',notes:'',photos:[]}]});return save()});
 const link=await L.makeInvite(A,'Ana');await L.auxAccept(B,link,null,'4321');ok(await until(B,()=>!!(window.e99Team&&e99Team.get()&&window.e99Cloud&&e99Cloud.user()),null,30000),'aux na equipe e na nuvem');
 await verifyAll();await B.evaluate(()=>e99Cloud.after(true));await A.evaluate(()=>e99Cloud.after(true));
 ok(await until(A,()=>{const a=state.team.find(t=>t.id==='ana');return !!(a&&a.login)},null,40000),'Ana ligada à conta');
 // agente local de IA
 await A.evaluate(()=>go('account'));await A.waitForSelector('#ag-cfg form');await A.evaluate(()=>document.querySelector('.ag-adv').open=true);await A.check('#ag-cfg input[name=local_on]');await A.fill('#ag-cfg input[name=local_url]','http://localhost:20142');await A.click('.ag-adv form button.primary');await A.waitForTimeout(500);
 // erro num aparelho
 await B.evaluate(()=>{setTimeout(()=>{throw new Error('teste-erro-stok')},10)});await B.waitForTimeout(5000);
 await A.evaluate(()=>(document.getElementById('view').innerHTML=window.extraPages.agentes()));await A.waitForTimeout(500);ok(/Piloto automático/.test(await A.textContent('#view')),'tela Agentes');
 await A.click('text=Rodar agora');ok(await until(A,()=>(document.getElementById('view').innerHTML=window.extraPages.agentes())&&/Bom dia:/.test(document.getElementById('view').innerText),null,40000),'piloto rodou (log)');
 await A.evaluate(()=>go('chat'));ok(await until(A,()=>[...document.querySelectorAll('#chat-list .chat-msg.mine')].some(m=>/🤖/.test(m.innerText)),null,10000),'bom dia no chat da equipe');
 const lg=await (await fetch(L.N+'/_log')).json();ok(lg.some(x=>/^e99p-/.test(x.topic)&&/Bom dia/i.test(decodeURIComponent(x.message||'')+'')||/^e99p-/.test(x.topic)),'aviso pessoal no celular (ntfy)');
 const q=await (await fetch(`http://127.0.0.1:8080/v1/projects/${P}/databases/(default)/documents/correio`,{headers:{Authorization:'Bearer owner'}})).json();ok((q.documents||[]).length>=1&&!/^Olá, Ana!/.test(q.documents[0].fields.texto.stringValue),'e-mail personalizado (agente) na fila do robô');
 ok(await until(A,()=>(document.getElementById('view').innerHTML=window.extraPages.agentes())&&/teste-erro-stok|erro/.test(document.getElementById('view').innerText)&&/Agente Local|texto pronto/.test(document.getElementById('view').innerText),null,15000),'diagnóstico com o erro do aparelho');
 ok(await A.evaluate(()=>/atrasada|sem responsável|convite|Nada pendente/.test(document.getElementById('view').innerText)),'pontos de atenção dos dados');
 const ll=await (await fetch('http://localhost:20142/_log')).json();ok(ll.length>=3,'agente de IA escreveu as mensagens ('+ll.length+' pedidos)');
 await A.screenshot({path:require('os').tmpdir()+'/stok-agentes.png'});
 console.log('errors',errs);await b.close();s1.kill()})();
