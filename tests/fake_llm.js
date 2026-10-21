/* IA falsa compatível com OpenAI (Ollama/OmniRoute) para os testes. Uso: node tests/fake_llm.js 20140 [chave] */
const http=require('http');const PORT=+process.argv[2]||20140,KEY=process.argv[3]||'';const log=[];
const H={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,OPTIONS'};
http.createServer((q,r)=>{if(q.method==='OPTIONS'){r.writeHead(204,H);return r.end()}
 if(q.url==='/_log'){r.writeHead(200,{...H,'content-type':'application/json'});return r.end(JSON.stringify(log))}
 if(q.url==='/v1/chat/completions'&&q.method==='POST'){if(KEY&&q.headers.authorization!=='Bearer '+KEY){r.writeHead(401,H);return r.end('{}')}let b='';q.on('data',c=>b+=c);q.on('end',()=>{const j=JSON.parse(b);const u=j.messages[j.messages.length-1].content;log.push({model:j.model,u:u.slice(0,80)});
   let t='OK';if(/tema de animação/.test(u))t='{"entrada":"girar","brilho":5,"pulso":2.5,"matiz":30,"saturacao":1.3,"anel":2,"ms":500}';else if(/Sugira/.test(u))t='Conferir validade do corredor 07 | Ana\nRepor arroz | TODOS\nOrganizar o depósito | Ana';else if(/Reescreva/.test(u))t='Pessoal, por favor confiram o corredor 09 hoje. Obrigado!';else if(/resumo do dia/i.test(u))t='• 1 NF atrasada (porta '+PORT+')\n• Ana deve repor o corredor 07';else if(/Resuma a conversa/.test(u))t='• Ana vai conferir o 09';else if(/alertas/.test(u))t='1. Conferir NF 48213 — Ana';else if(/NFs/.test(u))t='• NF 48213 atrasada';
   r.writeHead(200,{...H,'content-type':'application/json'});r.end(JSON.stringify({choices:[{message:{role:'assistant',content:t}}]}))});return}
 r.writeHead(404,H);r.end()}).listen(PORT);
