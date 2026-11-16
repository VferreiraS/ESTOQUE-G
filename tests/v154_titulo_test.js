/* v154: no computador a aba pisca (título + ícone com bolinha vermelha) quando chega mensagem nova no chat com a aba em segundo plano.
   Alerta/prazo/NF nova não pisca. Para ao voltar o foco e restaura título e ícone. iPhone não pisca. */
const L=require('./lib.js');const {ok,until}=L;
const HID=()=>{window.__hid=false;Object.defineProperty(Document.prototype,'hidden',{configurable:true,get:()=>window.__hid});
  Object.defineProperty(Document.prototype,'visibilityState',{configurable:true,get:()=>window.__hid?'hidden':'visible'});
  window.__setHidden=v=>{window.__hid=v;document.dispatchEvent(new Event('visibilitychange'))}};
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const cA=await b.newContext({viewport:{width:1440,height:900}});await cA.addInitScript(HID);const A=await cA.newPage();
 A.on('pageerror',e=>errs.push('PC '+e.message));A.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon/i.test(m.text()))errs.push('PC console '+m.text())});A.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(A,'tt'+T),'PC: gestor com equipe');
 const link=await L.makeInvite(A,'Bia','');
 const cB=await b.newContext(L.devices['iPhone 13']);await cB.addInitScript(HID);const B=await cB.newPage();B.on('pageerror',e=>errs.push('iPhone '+e.message));B.on('dialog',d=>d.accept());
 await L.auxAccept(B,link,'','Senha1234x');
 ok(await until(B,()=>typeof authSession!=='undefined'&&!!authSession&&!!window.e99TitleAlert),'iPhone: auxiliar entrou');
 await A.evaluate(()=>go('home'));await A.waitForTimeout(800);
 const orig=await A.evaluate(()=>({t:document.title,i:document.querySelector('link[rel~="icon"]').getAttribute('href')}));
 /* alerta e NF nova não piscam */
 await A.evaluate(()=>__setHidden(true));
 await A.evaluate(async()=>{try{showSiteNotification('Prazos','x','estoque99-prazos','alerts')}catch(e){}try{emitDesktop('Prazos','x')}catch(e){}state.nfs.push({id:'n9',number:'777',supplier:'X',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1});await save()});
 await A.waitForTimeout(2500);
 ok(await A.evaluate(o=>document.title===o&&!e99TitleState().on,orig.t),'PC: alerta/prazo/NF nova não pisca');
 /* mensagem nova com a aba oculta pisca */
 await B.evaluate(()=>{go('chat');if(!document.getElementById('chat-text')&&window.e99Cv)e99Cv.open('geral')});await B.waitForTimeout(800);
 await B.evaluate(()=>chatSend('Oi do iPhone v154'));
 ok(await until(A,()=>e99TitleState().on,null,30000),'PC: mensagem nova com a aba oculta liga o aviso');
 await until(A,()=>e99TitleState().red,null,5000);
 const seen=new Set(),icons=new Set();for(let i=0;i<8;i++){const s=await A.evaluate(()=>({t:document.title,i:document.querySelector('link[rel~="icon"]').getAttribute('href')}));seen.add(s.t);icons.add(s.i.slice(0,40));await A.waitForTimeout(350)}
 ok(seen.size===2&&seen.has(orig.t)&&[...seen].some(t=>/^\(\d+\) Nova(s)? mensage(m|ns) · Stok$/.test(t)),'PC: título alterna entre 2 valores ('+[...seen].join(' | ')+')');
 ok(icons.size===2&&[...icons].some(x=>x.startsWith('data:image/png')),'PC: ícone alterna com a versão de bolinha vermelha ('+[...icons].join(' | ')+')');
 await A.waitForTimeout(4500);ok(await A.evaluate(()=>e99TitleState().on&&[0,1,2].length&&true),'PC: segue piscando após o ciclo do ícone da v123');
 {const ic=new Set();for(let i=0;i<6;i++){ic.add((await A.evaluate(()=>document.querySelector('link[rel~="icon"]').getAttribute('href'))).slice(0,30));await A.waitForTimeout(350)}ok(ic.size===2,'PC: ícone continua alternando depois de 4 s (v123 não sobrescreve)')}
 ok(await A.evaluate(()=>{const s=e99TitleState();return s.n>=1&&s.timer}),'PC: contador de mensagens e timer ativo');
 /* cor da bolinha */
 ok(await A.evaluate(async()=>{let u='';for(let i=0;i<10&&!u.startsWith('data:image/png');i++){u=document.querySelector('link[rel~="icon"]').getAttribute('href');if(!u.startsWith('data:image/png'))await new Promise(r=>setTimeout(r,300))}
   const im=new Image();await new Promise(r=>{im.onload=r;im.src=u});const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(23,9,1,1).data;return d[0]===255&&d[1]===42&&d[2]===31}),'PC: bolinha #FF2A1F');
 /* volta o foco: para e restaura */
 await A.evaluate(()=>__setHidden(false));await A.waitForTimeout(1500);
 ok(await A.evaluate(o=>{const s=e99TitleState();return !s.on&&!s.timer&&document.title===o.t&&!document.querySelector('link[rel~="icon"]').getAttribute('href').startsWith('data:image/png')},orig),'PC: ao voltar o foco para e restaura título e ícone');
 /* iPhone não pisca */
 const bt=await B.evaluate(()=>document.title);await B.evaluate(()=>{go('home');__setHidden(true)});
 await A.evaluate(()=>chatSend('Oi do PC v154'));await B.waitForTimeout(5000);
 ok(await B.evaluate(t=>document.title===t&&!e99TitleState().on&&e99TitleAlert(1)===false,bt),'iPhone: título não pisca');
 ok(!errs.length,'0 erro de console'+(errs.length?': '+errs.join(' | '):''));
 await b.close();console.log('fim')})().catch(e=>{console.log('FAIL erro',e);process.exit(1)});
