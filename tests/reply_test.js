const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const cb=await b.newContext(L.devices['iPhone 13']);const B=await cb.newPage();
 [A,B].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(A,'rp'+T),'gestor team');const link=await L.makeInvite(A,'Ana');await L.auxAccept(B,link,null,'4321');
 ok(await until(B,()=>!!(window.e99Team&&e99Team.get()),null,20000),'aux na equipe');
 await A.evaluate(()=>{go('chat');return chatSend('Alguém repôs o corredor 07?')});
 await B.evaluate(()=>go('chat'));ok(await until(B,()=>/corredor 07\?/.test(document.getElementById('chat-list').innerText),null,20000),'aux recebe');
 // celular: arrastar para a direita
 await B.locator('#chat-list .chat-msg').filter({hasText:'corredor 07?'}).evaluate((el)=>{el.scrollIntoView();const r=el.getBoundingClientRect(),x=r.left+20,y=r.top+r.height/2;const t=(cx)=>new Touch({identifier:1,target:el,clientX:cx,clientY:y});
   el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[t(x)]}));for(let i=1;i<=8;i++)el.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,touches:[t(x+i*10)]}));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[]}))});
 ok(await B.evaluate(()=>!document.getElementById('chat-reply').hidden&&/Respondendo a/.test(document.getElementById('chat-reply').innerText)),'arrastar abre "Respondendo a"');
 await B.fill('#chat-text','Sim, já repus!');await B.locator('.chat-wrap').screenshot({path:__dirname+'/../reply_bar.png'});await B.click('#chat-send');await B.waitForTimeout(2000);
 ok(await B.evaluate(()=>document.getElementById('chat-reply').hidden),'barra some depois de enviar');
 ok(await until(A,()=>{const q=[...document.querySelectorAll('#chat-list .chat-quote')];return q.some(x=>/corredor 07/.test(x.innerText)&&/Você/.test(x.innerText))},null,20000),'gestor vê a citação');
 // PC: botão de responder e tocar na citação leva à mensagem
 await A.hover('#chat-list .chat-msg:has-text("Sim, já repus")');await A.click('#chat-list .chat-msg:has-text("Sim, já repus") .chat-re-btn');
 ok(await A.evaluate(()=>/Respondendo a/.test(document.getElementById('chat-reply').innerText)),'botão ↩ no PC');
 await A.click('#chat-reply button');ok(await A.evaluate(()=>document.getElementById('chat-reply').hidden),'cancelar resposta');
 await A.click('#chat-list .chat-quote');await A.waitForTimeout(400);ok(await A.evaluate(()=>!!document.querySelector('#chat-list .chat-msg.flash')),'tocar na citação destaca a original');
 ok(await B.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'sem rolagem lateral no iPhone');
 await B.evaluate(()=>{document.getElementById('chat-list').scrollTop=1e6});await B.waitForTimeout(500);await B.locator('#chat-list').screenshot({path:__dirname+'/../reply_iphone.png'});
 console.log('errors',errs);await b.close()})();
