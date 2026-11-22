/* v158: relatório enviado para todas as contas do app. PC 1440×900, gestor com equipe e 3 contas criadas por link (uma auxiliar).
   FormSubmit falso (Playwright): 1 requisição por conta + destino padrão, auxiliar sem valores, duplicados/inválidos ignorados,
   marcador impede repetir, conta nova entra na lista, e-mails mascarados na tela, 0 erro de console. */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const T=Date.now().toString(36);const errs=[];
 const ctx=await b.newContext({viewport:{width:1440,height:900}});const A=await ctx.newPage();
 A.on('pageerror',e=>errs.push('PC '+e.message));A.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push('PC console '+m.text())});A.on('dialog',d=>d.accept());
 const posts=[];await A.route('https://formsubmit.co/**',async r=>{const to=decodeURIComponent(r.request().url().split('/ajax/')[1]||'');posts.push({to,f:JSON.parse(r.request().postData()||'{}')});await r.fulfill({status:200,contentType:'application/json',body:'{"success":"true"}'})});
 ok(await L.gestorWithTeam(A,'g158'+T),'PC: gestor com equipe');
 await A.evaluate(()=>{authSession.payload.role='gestor';const o=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(/^mailto:/.test(this.href)){window.__mailto=(window.__mailto||0)+1;return}return o.call(this)};navigator.share=()=>Promise.resolve()});
 const E={ana:'ana.'+T+'@teste.com',bia:'bia.'+T+'@teste.com',caio:'caio.'+T+'@teste.com',duda:'duda.'+T+'@teste.com'};
 async function invite(name,email,papel){await A.evaluate(()=>{go('chat')});await A.waitForTimeout(500);await A.evaluate(()=>{const d=document.getElementById('aux-box');if(d)d.open=true});
   await A.fill('#aux-box input[name=name]',name);await A.fill('#aux-box input[name=email]',email);await A.selectOption('#aux-box select[name=papel]',papel);await A.click('#aux-box button.primary');await A.waitForTimeout(1500)}
 await invite('Ana',E.ana,'auxiliar');await invite('Bia',E.bia,'estoque');await invite('Caio',E.caio,'estoque');
 const inv=await A.evaluate(()=>JSON.parse(localStorage.getItem('lojasg.estoque99.aux-invites:'+authSession.storeKey)||'[]').map(x=>x.email+'|'+x.papel));
 ok(inv.length===3,'3 contas criadas por link ('+inv.join(', ')+')');
 /* duplicado (mesmo e-mail com outra caixa/espaços) e inválido entram na lista à força: devem ser ignorados */
 await A.evaluate(E=>{const k='lojasg.estoque99.aux-invites:'+authSession.storeKey,l=JSON.parse(localStorage.getItem(k));l.push({name:'Ana 2',login:'ana2',papel:'estoque',at:Date.now(),inviteId:'dupX',email:' '+E.ana.toUpperCase()+' ',link:''});l.push({name:'Ruim',login:'ruim',papel:'estoque',at:Date.now(),inviteId:'badX',email:'nao-e-email@',link:''});l.push({name:'Ruim2',login:'ruim2',papel:'estoque',at:Date.now(),inviteId:'badY',email:'a@b.c,x@y.com',link:''});localStorage.setItem(k,JSON.stringify(l))},E);
 const own=await A.evaluate(()=>authSession.payload.email);
 const R=await A.evaluate(()=>e99AllMail.recipients());
 const got=R.list.map(r=>r.email+'|'+r.papel).sort().join(', ');
 ok(R.list.length===4&&R.list.some(r=>r.email===E.ana&&r.papel==='auxiliar')&&R.list.some(r=>r.email===E.bia&&r.papel==='estoque')&&R.list.some(r=>r.email===own&&r.papel==='gestor'),'destinatários = sua conta + 3 contas dos links, com o papel ('+got+')');
 ok(R.info.dup===1&&R.info.bad===2,'duplicado e inválidos ignorados ('+JSON.stringify(R.info)+')');
 /* dados com valor (o auxiliar não pode ver) */
 await A.evaluate(()=>{const mon=e99Week.monday(iso()),d=n=>{const x=new Date(mon+'T12:00:00');x.setDate(x.getDate()+n);return iso(x)};
   state.nfs=[{id:'v1',number:'7001',supplier:'Laticínios Sul',date:d(-6),status:'Em divergência',owner:'',notes:'Faltou caixa',volumes:2,totalValue:'1234.56'},{id:'v2',number:'7002',supplier:'Outro',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1,totalValue:'99.90'}];
   state.corridors=[{id:'c1',number:'11',sector:'Limpeza',owner:''}];return save()});
 /* relatório do dia: automático ativado agora, resumo semanal desligado por enquanto */
 await A.evaluate(()=>{localStorage.setItem('e99-test-allmail','1');e99Week.pref(false);const d=new Date(),t=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
   localStorage.setItem('lojasg.estoque99.email-reports:'+authSession.storeKey,JSON.stringify({enabled:true,to:'stok99.app@gmail.com',cc:'99.estoque@lojasg.com.br',times:[t]}))});
 posts.length=0;await A.evaluate(async()=>{await emailReportTick();await e99AllMail.tick()});await A.waitForTimeout(1500);
 const main=posts.filter(p=>p.to==='stok99.app@gmail.com'),acc=posts.filter(p=>p.to!=='stok99.app@gmail.com');
 ok(main.length===1&&main[0].f._cc==='99.estoque@lojasg.com.br','destino padrão continua (1 envio com a cópia)');
 ok(acc.length===4&&new Set(acc.map(p=>p.to)).size===4&&acc.every(p=>!p.f._cc),'1 requisição por conta, sem _cc ('+acc.map(p=>p.to).join(', ')+')');
 ok(acc.every(p=>/Relatório/.test(p.f._subject||'')&&/7001/.test(JSON.stringify(p.f))),'cada conta recebe o relatório do dia');
 const mk=await A.evaluate(()=>Object.keys(localStorage).filter(k=>k.indexOf('lojasg.estoque99.rep-sent:')===0));
 ok(mk.length===4,'marcador por conta gravado ('+mk.length+')');
 posts.length=0;await A.evaluate(async()=>{await e99AllMail.tick()});await A.waitForTimeout(800);
 ok(posts.length===0,'marcador impede repetir na mesma rodada');
 /* conta nova entra sozinha */
 await invite('Duda',E.duda,'auxiliar');
 ok(await A.evaluate(E=>e99AllMail.recipients().list.some(r=>r.email===E.duda&&r.papel==='auxiliar'),E),'conta nova (Duda) entra na lista sem configurar');
 posts.length=0;await A.evaluate(async()=>{await e99AllMail.tick()});await A.waitForTimeout(800);
 ok(posts.length===1&&posts[0].to===E.duda,'na mesma rodada só a conta nova recebe ('+posts.map(p=>p.to).join(', ')+')');
 /* resumo semanal: auxiliar sem valores, estoque com valores */
 posts.length=0;await A.evaluate(async()=>{e99Week.pref(true);await e99AllMail.tick()});await A.waitForTimeout(1500);
 const wk=posts.filter(p=>/Resumo da semana/.test(p.f._subject||''));
 const wa=wk.find(p=>p.to===E.ana),wb=wk.find(p=>p.to===E.bia),wg=wk.find(p=>p.to===own);
 ok(wk.length===5&&wa&&wb&&wg,'resumo semanal: 1 por conta ('+wk.map(p=>p.to).join(', ')+')');
 const sa=JSON.stringify(wa&&wa.f||{}),sb=JSON.stringify(wb&&wb.f||{});
 ok(wa&&!/R\$|1\.234,56|Valor/.test(sa)&&!/Corredores|Conferências/.test(sa)&&/7001/.test(sa),'auxiliar recebe sem valores, sem conferências e corredores');
 ok(wb&&/R\$\s*1\.234,56/.test(sb)&&/Corredores/.test(sb),'estoque recebe o resumo completo (com valores)');
 ok(wa&&typeof wa.f['Mensagem']==='string'&&/Resumo da semana/.test(wa.f['Mensagem']),'texto organizado pelo e99Msg');
 /* tela: Alertas → Relatório por e-mail */
 await A.evaluate(()=>go('alerts'));await A.waitForTimeout(600);
 const ui=await A.evaluate(()=>{const p=document.getElementById('email-panel');const c=document.querySelector('#e99all-pref input');return {txt:p?p.innerText:'',checked:c&&c.checked,items:[...document.querySelectorAll('#e99all-list li')].map(l=>l.textContent),btn:!!document.getElementById('e99all-send')}});
 ok(ui.checked&&/Enviar também para todas as contas do app/.test(ui.txt),'opção "Enviar também para todas as contas do app" ligada por padrão');
 ok(ui.items.length===5&&ui.items.some(t=>t.indexOf('a***@teste.com')===0)&&!Object.values(E).some(m=>ui.txt.indexOf(m)>=0)&&ui.txt.indexOf(own)<0,'lista com e-mails mascarados ('+ui.items.slice(0,2).join(' | ')+')');
 ok(/Activate Form/.test(ui.txt)&&ui.btn,'aviso de confirmar o FormSubmit e botão "Enviar agora para todas"');
 let conf='';A.removeAllListeners('dialog');A.on('dialog',d=>{conf=d.message();d.accept()});
 posts.length=0;await A.click('#e99all-send');await until(A,()=>/^Relatório para as contas/.test((document.getElementById('e99all-status')||{}).textContent||''),null,15000);await A.waitForTimeout(300);
 ok(/5 contas/.test(conf)&&posts.length===5,'"Enviar agora": confirmação com o número de contas e 5 envios ('+conf+')');
 const st=await A.evaluate(()=>document.getElementById('e99all-status').textContent);ok(/5 enviado/.test(st),'resultado na tela ('+st+')');
 /* falha em um não impede os outros */
 await A.unroute('https://formsubmit.co/**');posts.length=0;
 await A.route('https://formsubmit.co/**',async r=>{const to=decodeURIComponent(r.request().url().split('/ajax/')[1]||'');posts.push({to});if(to===E.bia)await r.fulfill({status:500,contentType:'application/json',body:'{"success":"false","message":"erro"}'});else await r.fulfill({status:200,contentType:'application/json',body:'{"success":"true"}'})});
 const res=await A.evaluate(async()=>{window.confirm=()=>true;return e99AllMail.sendNow()});
 ok(res&&res.sent===4&&res.fail===1&&posts.length===5,'falha em um não impede os outros ('+JSON.stringify(res)+')');
 /* desligar */
 await A.evaluate(()=>e99AllMail.pref(false));await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.indexOf('lojasg.estoque99.rep-sent:')===0)localStorage.removeItem(k)});
 posts.length=0;await A.evaluate(async()=>{await e99AllMail.tick()});await A.waitForTimeout(600);ok(posts.filter(p=>p.to!=='stok99.app@gmail.com').length===0,'desligado: não envia para as contas');
 ok(await A.evaluate(()=>document.documentElement.scrollWidth<=1440),'PC sem rolagem lateral');
 ok(errs.length===0,'0 erro de console');console.log('errors',JSON.stringify(errs));await b.close()})().catch(e=>{console.log('FAIL erro do teste: '+e.message);process.exit(1)});
