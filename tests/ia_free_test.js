/* IA grátis (v85): Google Gemini no ia.gs, Workers AI no Worker e o assistente no navegador. Sem chamadas reais a provedores. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs'),vm=require('vm'),path=require('path'),url=require('url');
function gas(props,reply){const calls=[];const sb={PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]||null})},UrlFetchApp:{fetch:(u,o)=>{calls.push({u,o});return {getResponseCode:()=>200,getContentText:()=>JSON.stringify(reply(u))}}},ContentService:{createTextOutput:t=>({setMimeType:()=>t}),MimeType:{JSON:1}}};
  vm.createContext(sb);vm.runInContext(fs.readFileSync('apps-script/ia.gs','utf8'),sb);return {calls,post:b=>JSON.parse(sb.doPost({postData:{contents:JSON.stringify(b)}}))}}
const msg=[{role:'user',content:'oi'}];
async function shot(A,sel,file){await A.addStyleTag({content:'#toast,.firebase-emulator-warning{display:none!important}'});await A.evaluate(s=>{document.querySelector('.ag-cf').open=true;document.querySelector(s).scrollIntoView({block:'center'})},sel);await A.waitForTimeout(700);await A.screenshot({path:file})}
(async()=>{
 // ---------- ia.gs ----------
 const rep=u=>/ollama\.com/.test(u)?{message:{content:'OK ollama'}}:{choices:[{message:{content:/googleapis/.test(u)?'OK gemini':'OK nvidia'}}]};
 let g=gas({SENHA:'s',GEMINI_API_KEY:'gm-teste'},rep);let r=g.post({senha:'s',model:'gemini-3.8-flash',messages:msg});let c=g.calls[0];
 ok(r.text==='OK gemini'&&c.u==='https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'&&c.o.headers.Authorization==='Bearer gm-teste'&&JSON.parse(c.o.payload).model==='gemini-3.8-flash'&&JSON.parse(c.o.payload).messages[0].content==='oi','ia.gs chama o Gemini (URL, Bearer, modelo)');
 g=gas({SENHA:'s',GEMINI_API_KEY:'gm-teste'},rep);r=g.post({senha:'s',model:'gemma4:31b',messages:msg});ok(r.text==='OK gemini'&&JSON.parse(g.calls[0].o.payload).model==='gemini-3.8-flash','ia.gs usa o Gemini quando só há GEMINI_API_KEY');
 g=gas({SENHA:'s',OLLAMA_API_KEY:'ol-teste'},rep);r=g.post({senha:'s',model:'gemini-3.8-flash',messages:msg});ok(/falta GEMINI_API_KEY/.test(r.erro)&&!g.calls.length,'ia.gs explica a falta de GEMINI_API_KEY');
 g=gas({SENHA:'s',OLLAMA_API_KEY:'ol-teste',GEMINI_API_KEY:'gm-teste'},rep);r=g.post({senha:'s',model:'gemma4:31b',messages:msg});ok(r.text==='OK ollama'&&/ollama\.com\/api\/chat/.test(g.calls[0].u)&&g.calls[0].o.headers.Authorization==='Bearer ol-teste','Ollama continua funcionando');
 g=gas({SENHA:'s',NVIDIA_API_KEY:'nv-teste',GEMINI_API_KEY:'gm-teste'},rep);r=g.post({senha:'s',model:'nvidia/nemotron-3-ultra-550b-a55b',messages:msg});ok(r.text==='OK nvidia'&&/integrate\.api\.nvidia\.com/.test(g.calls[0].u)&&g.calls[0].o.headers.Authorization==='Bearer nv-teste','NVIDIA continua funcionando');
 g=gas({SENHA:'s',GEMINI_API_KEY:'gm-teste'},rep);r=g.post({senha:'x',model:'gemini-3.8-flash',messages:msg});ok(r.erro==='senha incorreta'&&!g.calls.length,'ia.gs: senha errada não chama ninguém');
 // ---------- Worker ----------
 const W=(await import(url.pathToFileURL(path.resolve('cloudflare/ia-worker.js')).href)).default;let up=null;global.fetch=async(u,o)=>{up={u,o};return new Response(JSON.stringify({choices:[{message:{content:'oi nvidia'}}]}),{status:200})};
 let ai=null;const AI={run:async(m,i)=>{ai={m,i};return {response:'oi workers ai'}}};
 const mk=(a,model,o)=>new Request('https://w.workers.dev/',{method:'POST',headers:{Origin:o||'https://vferreiras.github.io',Authorization:a,'Content-Type':'application/json'},body:JSON.stringify({model,messages:msg,max_tokens:20})});
 let res=await W.fetch(mk('Bearer x','@cf/meta/llama-3.3-70b-instruct-fp8-fast'),{SENHA:'x',AI});let j=await res.json();
 ok(res.status===200&&j.choices[0].message.content==='oi workers ai'&&ai.m==='@cf/meta/llama-3.3-70b-instruct-fp8-fast'&&ai.i.messages[0].content==='oi'&&ai.i.max_tokens===20&&!up,'Worker: Workers AI sem chave, formato OpenAI');
 ai=null;res=await W.fetch(mk('Bearer x','nvidia/nemotron-3-ultra-550b-a55b'),{SENHA:'x',AI});j=await res.json();ok(j.choices[0].message.content==='oi workers ai'&&ai&&ai.m==='@cf/meta/llama-3.3-70b-instruct-fp8-fast','Worker: sem NVIDIA_API_KEY usa Workers AI');
 ai=null;up=null;res=await W.fetch(mk('Bearer x','nvidia/nemotron-3-ultra-550b-a55b'),{SENHA:'x',AI,NVIDIA_API_KEY:'nv-teste'});j=await res.json();ok(j.choices[0].message.content==='oi nvidia'&&up.o.headers.Authorization==='Bearer nv-teste'&&JSON.parse(up.o.body).model==='nvidia/nemotron-3-ultra-550b-a55b'&&!ai,'Worker: NVIDIA com chave');
 ai=null;res=await W.fetch(mk('Bearer errada','@cf/meta/llama-3.3-70b-instruct-fp8-fast'),{SENHA:'x',AI});j=await res.json();ok(res.status===401&&j.error.message==='senha incorreta'&&!ai,'Worker: senha errada → 401');
 res=await W.fetch(mk('Bearer x','@cf/x'),{SENHA:'x'});j=await res.json();ok(res.status===500&&/binding AI/.test(j.error.message),'Worker: explica a falta do binding AI');
 res=await W.fetch(new Request('https://w.workers.dev/',{method:'OPTIONS',headers:{Origin:'https://gen-lang-client-0167474823-295e1.web.app'}}),{SENHA:'x',AI});
 ok(res.status===204&&res.headers.get('access-control-allow-origin')==='https://gen-lang-client-0167474823-295e1.web.app'&&/Authorization/.test(res.headers.get('access-control-allow-headers')),'Worker: CORS (preflight)');
 res=await W.fetch(mk('Bearer x','@cf/x','https://malicioso.example'),{SENHA:'x',AI});ok(res.headers.get('access-control-allow-origin')==='https://vferreiras.github.io','Worker: CORS não libera outra origem');
 ok(/"ai"\s*:\s*\{\s*"binding"\s*:\s*"AI"\s*\}/.test(fs.readFileSync('cloudflare/wrangler.jsonc','utf8'))&&!/NVIDIA_API_KEY=/.test(fs.readFileSync('cloudflare/.dev.vars.example','utf8')),'wrangler com binding AI; só SENHA obrigatória');
 // ---------- navegador ----------
 const b=await L.chromium.launch();const errs=[];const ctx=await b.newContext(L.devices['iPhone 13']);let got=null,cfGot=null;
 await ctx.route('https://script.google.com/macros/s/GEM/exec',async rt=>{got=JSON.parse(rt.request().postData()||'{}');await rt.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(got.senha==='g-senha'?{text:'OK'}:{erro:'senha incorreta'})})});
 await ctx.route('https://stok-ia.teste.workers.dev/**',async rt=>{if(rt.request().method()==='OPTIONS')return rt.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'POST'}});cfGot={auth:rt.request().headers()['authorization'],body:JSON.parse(rt.request().postData()||'{}')};await rt.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({choices:[{message:{content:'OK'}}]})})});
 await ctx.route(/googleapis\.com|nvidia\.com|ollama\.com/,rt=>rt.abort());
 const A=await ctx.newPage();A.on('pageerror',e=>errs.push(e.message));await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(1200);await L.signup(A,'ia'+Date.now());
 await A.evaluate(()=>go('account'));await A.waitForSelector('.ag-wiz select[name=ia]');
 ok(!!(await A.$('a[href="https://aistudio.google.com/apikey"]'))&&/GEMINI_API_KEY/.test(await A.textContent('.ag-wiz')),'link do AI Studio e instrução GEMINI_API_KEY');
 ok(await A.evaluate(()=>[...document.querySelectorAll('.ag-wiz:not(.ag-cf) select[name=ia] option')].some(o=>o.value==='gemini'&&/Google Gemini \(grátis\)/.test(o.textContent))),'opção Google Gemini (grátis)');
 await A.fill('.ag-wiz:not(.ag-cf) input[name=url]','https://script.google.com/macros/s/GEM/exec');await A.fill('.ag-wiz:not(.ag-cf) input[name=senha]','g-senha');await A.selectOption('.ag-wiz:not(.ag-cf) select[name=ia]','gemini');
 await A.click('.ag-wiz:not(.ag-cf) button.primary:has-text("Ligar")');ok(await until(A,()=>/Tudo certo/.test(document.getElementById('toast').textContent),null,8000),'Gemini: Tudo certo!');
 ok(got&&got.model==='gemini-3.8-flash'&&!('GEMINI_API_KEY' in got),'manda o modelo do Gemini (sem chave) ao Apps Script');
 ok(await until(A,()=>/Google Gemini/.test((document.querySelector('.ag-wiz .ap-ok')||{}).textContent||'')&&document.querySelector('.ag-wiz:not(.ag-cf) select[name=ia]').value==='gemini',null,5000),'mostra IA ligada pelo Google Gemini');
 if(process.env.SHOT)await shot(A,'.ag-wiz:not(.ag-cf) select[name=ia]',process.env.SHOT);
 await A.evaluate(()=>document.querySelector('.ag-cf').open=true);
 ok(await A.evaluate(()=>{const s=document.querySelector('.ag-cf select[name=ia]');return s&&s.value==='workers'&&/Workers AI \(grátis, sem chave\)/.test(s.options[0].textContent)&&/NVIDIA \(com chave\)/.test(s.options[1].textContent)}),'Cloudflare: Workers AI é o padrão, NVIDIA é a alternativa');
 await A.fill('.ag-cf input[name=url]','https://stok-ia.teste.workers.dev');await A.fill('.ag-cf input[name=senha]','cf-senha');await A.click('.ag-cf button.primary:has-text("Ligar")');
 ok(await until(A,()=>/Tudo certo/.test(document.getElementById('toast').textContent),null,8000),'Workers AI: Tudo certo!');
 ok(cfGot&&cfGot.auth==='Bearer cf-senha'&&cfGot.body.model==='@cf/meta/llama-3.3-70b-instruct-fp8-fast','manda o modelo do Workers AI ao Worker');
 ok(await until(A,()=>/Workers AI/.test((document.querySelector('.ag-cf .ap-ok')||{}).textContent||''),null,5000),'mostra IA ligada pela Cloudflare Workers AI');
 if(process.env.SHOT){await shot(A,'.ag-cf form',process.env.SHOT.replace(/\.png$/,'-cf.png'))}
 console.log('errors',errs);await b.close()})();
