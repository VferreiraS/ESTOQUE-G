const http=require('http');let seq=0;const topics={};const files={};const subs={};const log=[];
const H={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PUT,OPTIONS'};
http.createServer((req,res)=>{const u=new URL(req.url,'http://x');const parts=u.pathname.split('/').filter(Boolean);
 if(req.method==='OPTIONS'){res.writeHead(204,H);return res.end()}
 if(u.pathname==='/_log'){res.writeHead(200,{...H,'content-type':'application/json'});return res.end(JSON.stringify(log))}
 if(u.pathname==='/_block'){global.block=u.searchParams.get('s')|0;res.writeHead(200,H);return res.end('ok')}
 if(parts[0]==='file'){const f=files[parts[1]];if(!f){res.writeHead(404,H);return res.end()}res.writeHead(200,{...H,'content-type':'application/octet-stream'});return res.end(f)}
 const topic=parts[0];
 if(parts[1]==='sse'&&req.method==='GET'){res.writeHead(200,{...H,'content-type':'text/event-stream','cache-control':'no-cache'});res.write('event: open\ndata: {"event":"open"}\n\n');
  const since=u.searchParams.get('since')||'';let list=topics[topic]||[];if(/^\d+$/.test(since))list=list.filter(m=>m.time>=+since);else if(since==='none')list=[];
  list.forEach(m=>res.write('data: '+JSON.stringify(m)+'\n\n'));(subs[topic]=subs[topic]||new Set()).add(res);res.on('close',()=>subs[topic].delete(res));return}
 if(req.method==='POST'||req.method==='PUT'){if(global.block){res.writeHead(global.block,H);return res.end('{"error":"limit"}')}const ch=[];req.on('data',c=>ch.push(c));req.on('end',()=>{const body=Buffer.concat(ch);const m={id:'m'+(++seq),time:Math.floor(Date.now()/1000),event:'message',topic};
   if(req.method==='PUT'&&req.headers['x-filename']){const fid='f'+seq;files[fid]=body;m.message=req.headers['x-message']||'';m.attachment={name:req.headers['x-filename'],size:body.length,url:'http://localhost:'+PORT+'/file/'+fid}}else m.message=body.toString();
   log.push({method:req.method,topic,message:m.message,bytes:body.length,first:[...body.slice(0,3)]});(topics[topic]=topics[topic]||[]).push(m);(subs[topic]||[]).forEach(r=>r.write('data: '+JSON.stringify(m)+'\n\n'));res.writeHead(200,{...H,'content-type':'application/json'});res.end(JSON.stringify(m))});return}
 res.writeHead(404,H);res.end()}).listen(PORT=+process.argv[2]||20130);
