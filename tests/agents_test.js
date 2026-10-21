const L=require('./lib.js');const {ok,until}=L;const {spawn}=require('child_process');const path=require('path');
(async()=>{const s1=spawn('node',[path.join(__dirname,'fake_llm.js'),'20140']),s2=spawn('node',[path.join(__dirname,'fake_llm.js'),'20141','segredo-teste']);await new Promise(r=>setTimeout(r,800));
 const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(A,'ag'+Date.now()),'gestor team');
 await A.evaluate(()=>go('account'));await A.waitForSelector('#ag-cfg form');
 await A.check('#ag-cfg input[name=local_on]');await A.fill('#ag-cfg input[name=local_url]','http://localhost:20140');await A.fill('#ag-cfg input[name=local_model]','llama3.2');
 await A.check('#ag-cfg input[name=cloud_on]');await A.fill('#ag-cfg input[name=cloud_url]','http://localhost:20141/v1');await A.fill('#ag-cfg input[name=cloud_model]','gpt-4o-mini');await A.fill('#ag-cfg input[name=cloud_key]','segredo-teste');
 await A.click('#ag-cfg button.primary');await A.waitForTimeout(800);
 ok(await A.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.agents:'));return !!k&&!/segredo-teste|20141/.test(localStorage.getItem(k))}),'configuração salva cifrada (chave não aparece)');
 await A.click('text=Testar Nuvem');ok(await until(A,()=>/Agente Nuvem respondeu: OK/.test(document.getElementById('toast').textContent),null,8000),'teste da Nuvem (com chave)');
 // Início: resumo do dia pelo Agente Local
 await A.evaluate(()=>go('home'));ok(await until(A,()=>/porta 20140/.test((document.getElementById('ag-brief-out')||{}).textContent||''),null,10000),'resumo do dia pelo Agente Local');
 // Local fora do ar -> Nuvem assume
 await A.evaluate(async()=>{go('account')});await A.waitForSelector('#ag-cfg form');await A.fill('#ag-cfg input[name=local_url]','http://localhost:20199');await A.click('#ag-cfg button.primary');await A.waitForTimeout(500);
 await A.evaluate(()=>{go('home')});await A.waitForSelector('#ag-brief button');await A.click('#ag-brief button');ok(await until(A,()=>/porta 20141/.test(document.getElementById('ag-brief-out').textContent)&&/Agente Nuvem/.test(document.getElementById('ag-brief-out').textContent),null,10000),'Local fora do ar: a Nuvem assume');
 // Plano: sugerir atividades
 await A.evaluate(()=>{go('plans');openPlan()});await A.waitForSelector('#ag-plan-btn');await A.click('#ag-plan-btn');
 ok(await until(A,()=>planDraft&&planDraft.activities.some(a=>/validade do corredor 07/.test(a.title)&&a.owner==='Ana')&&planDraft.activities.some(a=>a.title==='Repor arroz'&&a.owner==='TODOS'),null,10000),'plano: atividades sugeridas com responsável');
 await A.evaluate(()=>{planDraft=null;go('alerts')});await A.waitForSelector('.ag-alerts');await A.click('.ag-alerts');ok(await until(A,()=>/Conferir NF 48213/.test((document.getElementById('ag-body')||{}).textContent||''),null,10000),'alertas: o que fazer primeiro');
 await A.evaluate(()=>document.getElementById('ag-dialog').close());
 await A.evaluate(()=>go('nfs'));await A.waitForSelector('.ag-nfs');await A.click('.ag-nfs');ok(await until(A,()=>/48213/.test((document.getElementById('ag-body')||{}).textContent||''),null,10000),'NFs: análise');await A.evaluate(()=>document.getElementById('ag-dialog').close());
 // Chat: melhorar texto e resumir
 await A.evaluate(()=>go('chat'));await A.waitForSelector('.ag-chat');await A.fill('#chat-text','gente confere o 09 hj');await A.click('.ag-chat');
 ok(await until(A,()=>/Pessoal, por favor confiram o corredor 09/.test(document.getElementById('chat-text').value),null,10000),'chat: ✨ melhora o texto');
 await A.click('#chat-send');await A.waitForTimeout(1200);await A.click('.ag-sum');ok(await until(A,()=>/Ana vai conferir/.test((document.getElementById('ag-body')||{}).textContent||''),null,10000),'chat: resumir conversa');
 const lg=await (await fetch('http://localhost:20141/_log')).json();ok(lg.every(x=>x.model==='gpt-4o-mini'),'Nuvem usa o modelo configurado');
 await A.evaluate(()=>document.getElementById('ag-dialog').close());await A.evaluate(()=>go('home'));await A.waitForTimeout(600);await A.screenshot({path:require('os').tmpdir()+'/stok-agents-home.png'});
 console.log('errors',errs);await b.close();s1.kill();s2.kill()})();
