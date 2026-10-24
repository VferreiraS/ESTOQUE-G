/* Mede fluidez: tempo até a tela de entrar, troca de páginas, tarefas longas e saltos de layout (CPU 4x mais lenta, iPhone 13). */
const {chromium,devices,N,signup}=require('./lib');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});
 await ctx.addInitScript(()=>{window.__lt=[];window.__cls=0;try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(e.duration)}).observe({type:'longtask',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput){window.__cls+=e.value;(window.__clsSrc=window.__clsSrc||[]).push(e.value.toFixed(3)+' '+(e.sources||[]).map(s=>s.node?((s.node.parentElement&&(s.node.parentElement.id||s.node.parentElement.className)||'')+'>'+(s.node.id||s.node.className||s.node.nodeName)):'?').join(','))}}).observe({type:'layout-shift',buffered:true})}catch(e){}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const R={};const t0=Date.now();const BASE=process.env.BASE||'http://localhost:8000';await p.goto(BASE+'/index.html?ntfy='+N);
 await p.waitForSelector('#auth-form input[name=login]',{state:'visible'});
 await p.waitForFunction(()=>{const b=document.querySelector('#auth-form input[name=login]');if(!b)return false;const r=b.getBoundingClientRect();const el=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return el&&(el===b||b.contains(el))});
 R.loginUsable=Date.now()-t0;
 R.nav=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];const f=performance.getEntriesByName('first-contentful-paint')[0];return{dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),fcp:f?Math.round(f.startTime):null}});
 await p.waitForTimeout(3000);
 R.framesLogin=await p.evaluate(()=>new Promise(res=>{const ts=[];const t0=performance.now();function f(t){ts.push(t);if(t-t0<4000)requestAnimationFrame(f);else{const d=ts.slice(1).map((x,i)=>x-ts[i]);res({fps:Math.round(d.length/((ts[ts.length-1]-ts[0])/1000)),slow:d.filter(x=>x>34).length,p95:Math.round(d.sort((a,b)=>a-b)[Math.floor(d.length*.95)])})}}requestAnimationFrame(f)}));
 R.bootLT=await p.evaluate(()=>({n:__lt.length,sum:Math.round(__lt.reduce((a,b)=>a+b,0)),max:Math.round(Math.max(0,...__lt))}));
 R.bootCLS=+(await p.evaluate(()=>__cls)).toFixed(4);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 await signup(p,'perf'+Date.now().toString(36).slice(-4));
 await p.evaluate(async()=>{for(let i=0;i<40;i++){state.corridors.push({id:'c'+i,number:String(i).padStart(2,'0'),sector:'Setor '+i,owner:''});state.nfs.push({id:'n'+i,number:String(40000+i),supplier:'Fornecedor '+i,date:iso(),status:'Pendente',owner:'',notes:'',volumes:2})}state.team.push({id:'ana',name:'Ana',role:'Repositora'});await save()});
 await p.evaluate(()=>go('home'));await p.waitForTimeout(1500);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const pages=['home','chat','account','corridors','nfs','team','plans','agenda','data','home'];R.pages={};
 for(const pg of pages){const ms=[];for(let i=0;i<3;i++){ms.push(await p.evaluate(pg=>new Promise(res=>{const t=performance.now();go(pg);requestAnimationFrame(()=>setTimeout(()=>res(performance.now()-t),0))}),pg));await p.waitForTimeout(400)}R.pages[pg]=Math.round(ms.reduce((a,b)=>a+b)/ms.length)}
 R.pageAvg=Math.round(Object.values(R.pages).reduce((a,b)=>a+b)/pages.length);
 for(const pg of ['home','chat']){await p.evaluate(pg=>{go(pg);__lt.length=0;__cls=0;window.__clsSrc=[]},pg);await p.waitForTimeout(10000);R['idle_'+pg]=await p.evaluate(()=>({lt:__lt.length,ltSum:Math.round(__lt.reduce((a,b)=>a+b,0)),cls:+__cls.toFixed(4),src:(window.__clsSrc||[]).slice(0,5)}))}
 /* mutações do DOM em 10 s parado na página do chat */
 R.chatMut=await p.evaluate(()=>new Promise(res=>{let n=0;const o=new MutationObserver(l=>n+=l.length);o.observe(document.getElementById('view'),{subtree:true,childList:true,characterData:true,attributes:true});setTimeout(()=>{o.disconnect();res(n)},10000)}));
 R.homeMut=await p.evaluate(()=>new Promise(res=>{go('home');let n=0;setTimeout(()=>{const o=new MutationObserver(l=>n+=l.length);o.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});setTimeout(()=>{o.disconnect();res(n)},10000)},300)}));
 /* quadros por segundo e quadros lentos (>34 ms): parado no Início e rolando a lista de NFs */
 const fps=async(act)=>p.evaluate(act=>new Promise(res=>{const ts=[];let t0=performance.now();function f(t){ts.push(t);if(t-t0<4000)requestAnimationFrame(f);else{const d=ts.slice(1).map((x,i)=>x-ts[i]);res({fps:Math.round(d.length/((ts[ts.length-1]-ts[0])/1000)),slow:d.filter(x=>x>34).length,p95:Math.round(d.sort((a,b)=>a-b)[Math.floor(d.length*.95)])})}}
   if(act==='scroll'){let y=0,dir=1;(function s(){if(performance.now()-t0>4000)return;y+=dir*40;if(y>document.documentElement.scrollHeight-innerHeight||y<0)dir=-dir;scrollTo(0,y);requestAnimationFrame(s)})()}requestAnimationFrame(f)}),act);
 await p.evaluate(()=>go('home'));await p.waitForTimeout(1500);R.framesHome=await fps('idle');
 await p.evaluate(()=>go('nfs'));await p.waitForTimeout(1500);R.framesScrollNfs=await fps('scroll');
 await p.evaluate(()=>go('corridors'));await p.waitForTimeout(1500);R.framesScrollCor=await fps('scroll');
 R.errors=errs;console.log(JSON.stringify(R,null,1));await b.close()})().catch(e=>{console.error('Error',e);process.exit(1)});
