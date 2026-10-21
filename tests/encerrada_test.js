const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const G=await (await b.newContext()).newPage();G.on('pageerror',e=>errs.push(e.message));G.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(G,'enc'+Date.now()),'gestor com equipe');
 ok(await until(G,()=>!!(window.e99Cloud&&e99Cloud.user()),null,30000),'gestor na nuvem');
 const sid=await G.evaluate(()=>e99Cloud.sid());ok(!!sid,'loja na nuvem');
 const r=await fetch('http://localhost:8080/v1/projects/gen-lang-client-0167474823/databases/(default)/documents/encerradas?documentId='+sid,{method:'POST',headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:JSON.stringify({fields:{at:{integerValue:String(Date.now())}}})});ok(r.ok,'admin encerra o chat');
 await G.evaluate(()=>e99Cloud.after(false));
 ok(await until(G,()=>!(window.e99Team&&e99Team.get()),null,15000),'aparelho sai do chat encerrado');
 console.log('errors',errs);await b.close()})();
