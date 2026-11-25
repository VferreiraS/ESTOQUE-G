/* v166 · nome StoK no lugar de "Lojas G" (pedido do dono). PC 1440×900 e iPhone 13.
   - abertura (com o botão "Entrar"), tela de entrar, aviso de privacidade e todas as telas principais: nenhum "Lojas G" no DOM
     (texto, title, aria-label, alt, placeholder, meta e o HTML inteiro) e nenhum "Stok" com k minúsculo no texto e nos atributos;
     o nome aparece como "StoK" (abertura, tela de entrar, menu, Início);
   - <title>, meta description, Open Graph, apple-mobile-web-app-title e manifest (name, short_name, description) com StoK;
   - mensagens: texto do WhatsApp (rodapé "StoK · Estoque 99"), HTML do Outlook, banner (textos desenhados), folha impressa,
     folha de compartilhar, .eml do plano, link de convite, e-mail de conta nova, relatório e resumo semanal: sem Lojas G e sem "Stok";
   - Privacidade, Termos e robo.html com StoK e sem Lojas G (o e-mail 99.estoque@lojasg.com.br continua);
   - chaves técnicas continuam: conta em lojasg.estoque99.account.v1.*, dados em lojasg.estoque99.*; a conta criada abre de novo
     com os dados depois de recarregar; 0 erro de JS. */
const L=require('./lib.js');const {ok,until}=L;
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html';
const LG=/lojas[\s ·._-]+g(?![a-z0-9])/i,SK=/Stok/;
/* aparelho novo de verdade: abertura com "Entrar", aviso de privacidade e e-mail de conta nova ligados */
const GATE=()=>{try{sessionStorage.removeItem('e99-intro');localStorage.setItem('e99-test-gate','1');localStorage.removeItem('e99-test-autointro');
  localStorage.setItem('e99-test-note','1');localStorage.removeItem('e99-no-cookie-note');localStorage.setItem('lojasg.estoque99.stats','test')}catch(e){}};
/* varre o DOM: textos (menos script/style), atributos lidos pelo usuário ou pelo leitor de tela, <title> e, para "Lojas G", o HTML inteiro */
const SCAN=()=>{const LG=/lojas[\s ·._-]+g(?![a-z0-9])/i,SK=/Stok/,bad={lg:[],sk:[]};
  const push=(k,w,v)=>{if(bad[k].length<8)bad[k].push(w+': '+String(v).replace(/\s+/g,' ').trim().slice(0,90))};
  const tag=e=>e.nodeName.toLowerCase()+(e.id?'#'+e.id:'');
  const tw=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let n;
  while((n=tw.nextNode())){const pe=n.parentElement;if(!pe||pe.closest('script,style,noscript,template'))continue;const v=n.nodeValue;if(LG.test(v))push('lg',tag(pe),v);if(SK.test(v))push('sk',tag(pe),v)}
  const ATT=['title','aria-label','alt','placeholder','aria-description','aria-roledescription','data-t','value','content','label'];
  document.querySelectorAll('*').forEach(e=>{if(e.closest('script,style'))return;for(const a of ATT){const v=e.getAttribute(a);if(v==null)continue;
    if(a==='value'&&!/^(button|submit|reset)$/i.test(e.type||''))continue;if(a==='content'&&e.nodeName!=='META')continue;
    if(LG.test(v))push('lg',tag(e)+'['+a+']',v);if(SK.test(v))push('sk',tag(e)+'['+a+']',v)}});
  const html=document.documentElement.outerHTML,m=html.match(new RegExp('.{0,40}'+LG.source+'.{0,40}','i'));if(m)push('lg','html',m[0]);
  if(SK.test(document.title))push('sk','title',document.title);return bad};
const NAME=()=>{const t=s=>{const e=document.querySelector(s);return e?e.textContent.trim():null},m=s=>{const e=document.querySelector(s);return e?e.getAttribute('content'):null};
  return {title:document.title,desc:m('meta[name="description"]')||'',og:m('meta[property="og:title"]'),site:m('meta[property="og:site_name"]'),apple:m('meta[name="apple-mobile-web-app-title"]'),
    splash:t('.entry-splash strong'),aside:t('aside .brand strong'),asideSmall:t('aside .brand small')}};
const fmt=s=>(s.lg.length?' → Lojas G: '+s.lg.slice(0,3).join(' | '):'')+(s.sk.length?' → Stok: '+s.sk.slice(0,3).join(' | '):'');
const CAP=()=>{window.__ph=[];window.open=function(){return {document:{open(){},write(h){window.__ph.push(h)},close(){}},focus(){},print(){window.__printed=(window.__printed||0)+1}}}};
const PAY={title:'Plano de ação',subtitle:'Loja 166 · terça',sections:[{title:'Atividades (0 de 1 feitas)',lines:[{b:'1. Repor arroz no 07',sub:['Responsável: Ana','Orientações: Corredor 07']}]}]};
const wait=async(fn,ms=10000)=>{const t=Date.now();while(Date.now()-t<ms){if(fn())return true;await new Promise(r=>setTimeout(r,250))}return false};
/* arquivos publicados e scripts do Google: nenhum "Lojas G" em lugar nenhum (o nome do PDF "…_LojasG" num comentário e o e-mail @lojasg ficam) */
{const fs=require('fs'),path=require('path'),R=path.join(__dirname,'..'),bad=[];
 const files=['index.html','robo.html','sw.js','manifest.webmanifest','privacidade.html','termos.html','README.md','apps-script/relatorio-email.gs','apps-script/planilha.gs','push/sw-push.js','push/worker.js','push/client.js']
   .concat(fs.readdirSync(path.join(R,'app/js')).map(f=>'app/js/'+f),fs.readdirSync(path.join(R,'app/css')).map(f=>'app/css/'+f));
 for(const f of files){const t=fs.readFileSync(path.join(R,f),'utf8');const m=t.match(new RegExp('.{0,30}'+LG.source+'.{0,30}','i'));if(m)bad.push(f+': '+m[0])}
 ok(!bad.length,'arquivos do app sem "Lojas G" ('+files.length+' arquivos)'+(bad.length?' → '+bad.slice(0,4).join(' | '):''));
 const gs=fs.readFileSync(path.join(R,'apps-script/relatorio-email.gs'),'utf8'),pl=fs.readFileSync(path.join(R,'apps-script/planilha.gs'),'utf8');
 ok(/name: 'StoK · Estoque 99'/.test(gs)&&/Enviado automaticamente pelo StoK\./.test(gs)&&/'StoK: planilha ligada\.'/.test(pl)&&!SK.test(gs.replace(/^\s*(\/\/|\*).*$/mg,''))&&!SK.test(pl.replace(/^\s*(\/\/|\*).*$/mg,'')),'Apps Script: remetente, rodapé e resposta com StoK')}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 for(const [dev,opt] of [['PC',{viewport:{width:1440,height:900}}],['iPhone',L.devices['iPhone 13']]]){const mob=dev==='iPhone';
  const watch=(p,tag)=>{p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('dialog',d=>d.accept())};
  const tap=(p,s)=>mob?p.tap(s):p.click(s);
  /* ===== 1) aparelho novo: abertura com "Entrar", tela de entrar, manifest, conta nova e chaves lojasg.estoque99.* ===== */
  const c1=await b.newContext(opt);await c1.addInitScript(GATE);const p=await c1.newPage();watch(p,dev);
  const posts=[];await c1.route('https://abacus.jasoncameron.dev/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"value":7}'}));
  await c1.route('https://formsubmit.co/**',async r=>{try{posts.push(JSON.parse(r.request().postData()||'{}'))}catch(e){}await r.fulfill({status:200,contentType:'application/json',body:'{"success":"true"}'})});
  await p.goto(U);
  ok(await until(p,()=>!!document.querySelector('#stok-intro #si-enter'),null,8000),dev+': abertura com o botão "Entrar"');
  const ab=await p.evaluate(()=>{const i=document.getElementById('stok-intro'),q=s=>(i.querySelector(s)||{}).textContent;return {word:q('.si-word'),tag:q('.si-tag'),sub:q('.si-sub'),label:i.getAttribute('aria-label')||''}});
  ok(ab.word==='StoK'&&ab.tag==='Tudo no lugar.'&&ab.sub==='ESTOQUE 99',dev+': abertura mostra "StoK", "Tudo no lugar." e "ESTOQUE 99" ('+[ab.word,ab.tag,ab.sub].join(' | ')+')');
  ok(/^StoK, Estoque 99\. /.test(ab.label)&&!LG.test(ab.label),dev+': rótulo da abertura para o leitor de tela ('+ab.label+')');
  let s=await p.evaluate(SCAN);ok(!s.lg.length&&!s.sk.length,dev+': abertura sem "Lojas G" e sem "Stok"'+fmt(s));
  const nm=await p.evaluate(NAME);
  ok(nm.title==='StoK · Estoque 99'&&nm.og==='StoK · Estoque 99'&&nm.site==='StoK · Estoque 99'&&nm.apple==='StoK'&&/^StoK, o app de estoque: /.test(nm.desc),dev+': <title>, Open Graph e descrição com StoK ('+nm.title+' / '+nm.desc.slice(0,28)+'…)');
  ok(nm.splash==='StoK'&&nm.aside==='StoK'&&!/lojas/i.test(nm.asideSmall||''),dev+': nome do menu = StoK ('+nm.aside+' · '+nm.asideSmall+')');
  await tap(p,'#si-enter');
  ok(await until(p,()=>!document.getElementById('stok-intro')&&!!document.querySelector('#auth-screen .brand strong'),null,8000),dev+': "Entrar" abre a tela de entrar');
  const au=await p.evaluate(()=>({strong:document.querySelector('#auth-screen .brand strong').textContent,small:document.querySelector('#auth-screen .brand small').textContent}));
  ok(au.strong==='StoK'&&/^Estoque 99$/i.test(au.small.trim()),dev+': tela de entrar com "StoK" e "Estoque 99" ('+au.strong+' · '+au.small.trim()+')');
  const note=await until(p,()=>{const n=document.getElementById('storage-note');return !!n&&/o StoK não usa cookies/.test(n.textContent)},null,9000);
  ok(note,dev+': aviso de privacidade diz "o StoK não usa cookies"');
  s=await p.evaluate(SCAN);ok(!s.lg.length&&!s.sk.length,dev+': tela de entrar e aviso sem "Lojas G" e sem "Stok"'+fmt(s));
  if(note)await p.evaluate(()=>{const n=document.querySelector('#storage-note button');if(n)n.click()});
  const mf=await p.evaluate(async()=>{const l=document.querySelector('link[rel=manifest]');return (await fetch(l?l.getAttribute('href'):'manifest.webmanifest',{cache:'no-store'})).json()});
  ok(mf.name==='StoK · Estoque 99'&&mf.short_name==='StoK'&&/StoK/.test(mf.description)&&![mf.name,mf.short_name,mf.description].some(x=>LG.test(x)||SK.test(x)),dev+': manifest com StoK ('+mf.name+' / '+mf.short_name+' / '+mf.description.slice(-40)+')');
  /* conta nova (no aparelho) + dados */
  const lg='nome'+dev.toLowerCase()+T;await L.signup(p,lg,'Loja 166');
  ok(await until(p,()=>typeof authSession!=='undefined'&&!!authSession,null,15000),dev+': conta criada');
  await p.evaluate(()=>{state.nfs=[{id:'n166',number:'16601',supplier:'Fornecedor 166',date:iso(),status:'Pendente',owner:'',notes:'',volumes:2}];
    state.plans=[{id:'p166',title:'Plano v166',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'',notes:'',photos:[]}]}];return save()});
  ok(await wait(()=>posts.some(x=>x.Mensagem)),dev+': e-mail de conta nova enviado (FormSubmit falso)');
  const nc=posts.find(x=>x.Mensagem)||{},ncs=JSON.stringify(nc);
  ok(/Nova conta no StoK/.test(nc.Mensagem||'')&&/StoK · Estoque 99\s*$/.test(nc.Mensagem||'')&&!LG.test(ncs)&&!SK.test(ncs),dev+': e-mail de conta nova "Nova conta no StoK" com rodapé StoK, sem Lojas G');
  const K=await p.evaluate(()=>{const ks=Object.keys(localStorage);return {prefix:AUTH_PREFIX,key:authSession.storeKey,has:!!localStorage.getItem(authSession.storeKey),
    n:ks.filter(k=>k.indexOf('lojasg.estoque99.')===0).length,novo:ks.filter(k=>/^stok/i.test(k)&&k!=='stok-reset')}});
  ok(K.prefix==='lojasg.estoque99.account.v1.'&&K.key.indexOf(K.prefix)===0&&K.has&&K.n>=2&&!K.novo.length,dev+': conta e dados continuam nas chaves lojasg.estoque99.* ('+K.n+' chaves; conta em '+K.key.slice(0,28)+'…)');
  /* recarregar: a mesma conta abre com os dados (chaves de antes) */
  await p.goto(U);ok(await until(p,()=>!!document.querySelector('#stok-intro #si-enter'),null,8000),dev+': abertura de novo ao recarregar');
  await tap(p,'#si-enter');await until(p,()=>!document.getElementById('stok-intro'),null,8000);
  if(!(await p.evaluate(()=>typeof authSession!=='undefined'&&!!authSession)))await L.login(p,lg);
  ok(await until(p,()=>typeof authSession!=='undefined'&&!!authSession&&(state.nfs||[]).some(n=>n.number==='16601')&&(state.plans||[]).some(x=>x.title==='Plano v166'),null,15000),dev+': conta criada antes abre de novo com os dados');
  await c1.close();

  /* ===== 2) gestor com equipe: telas principais, mensagens, convite, relatório e resumo semanal ===== */
  const c2=await b.newContext(opt);const A=await c2.newPage();watch(A,dev+'-gestor');
  const posts2=[];await c2.route('https://formsubmit.co/**',async r=>{try{posts2.push({to:decodeURIComponent(r.request().url().split('/ajax/')[1]||''),f:JSON.parse(r.request().postData()||'{}')})}catch(e){}await r.fulfill({status:200,contentType:'application/json',body:'{"success":"true"}'})});
  ok(await L.gestorWithTeam(A,'g166'+dev.toLowerCase()+T),dev+': gestor com equipe (nuvem do emulador)');
  await A.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
  await A.evaluate(()=>{authSession.payload.role='gestor';const o=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(/^mailto:/.test(this.href)){window.__mailto=this.href;return}return o.call(this)}});
  const pages=['home','reports','nfs','plans','corridors','team','chat','alerts','agenda','data','account','admin','mobile-menu'];
  const bl=[],bs=[],seen=[];
  for(const pg of pages){const went=await A.evaluate(pg=>{try{const m=document.getElementById('modal');if(m&&m.open)m.close()}catch(e){}try{go(pg);window.scrollTo(0,0);return true}catch(e){return false}},pg);if(!went)continue;
    await A.waitForTimeout(pg==='chat'?1500:800);const r=await A.evaluate(SCAN);seen.push(pg);r.lg.forEach(x=>bl.push(pg+' → '+x));r.sk.forEach(x=>bs.push(pg+' → '+x))}
  ok(seen.length>=10&&!bl.length,dev+': nenhuma tela principal com "Lojas G" ('+seen.join(', ')+')'+(bl.length?' → '+bl.slice(0,5).join(' | '):''));
  ok(!bs.length,dev+': nenhuma tela principal com "Stok" de k minúsculo'+(bs.length?' → '+bs.slice(0,5).join(' | '):''));
  await A.evaluate(()=>go('home'));await A.waitForTimeout(800);
  const hm=await A.evaluate(()=>({pill:document.querySelector('.hero-pill')?document.querySelector('.hero-pill').textContent:null,aside:(document.querySelector('aside .brand strong')||{}).textContent,small:(document.querySelector('aside .brand small')||{}).textContent||''}));
  ok((hm.pill===null||hm.pill==='StoK')&&hm.aside==='StoK'&&!/lojas/i.test(hm.small),dev+': Início e menu com "StoK" (etiqueta '+JSON.stringify(hm.pill)+', menu "'+hm.aside+' · '+hm.small+'")');
  /* mensagens geradas pelo e99Msg */
  const M=await A.evaluate(async(P)=>{const t=e99Msg.text(P),h=e99Msg.html(P),ph=e99Msg.printHtml(P),pt=e99Msg.printTextHtml('','linha 1\nlinha 2'),d0=e99Msg.text({});
    const C=CanvasRenderingContext2D.prototype,f0=C.fillText,drawn=[];C.fillText=function(x){drawn.push(String(x));return f0.apply(this,arguments)};let blob=null;try{blob=await e99Msg.banner(P)}catch(e){}finally{C.fillText=f0}
    return {t,h,ph,pt,d0,drawn,blob:!!blob}},PAY);
  const lines=M.t.split('\n');
  ok(lines[lines.length-2]==='──────────'&&lines[lines.length-1]==='StoK · Estoque 99'&&!LG.test(M.t)&&!SK.test(M.t),dev+': texto do WhatsApp termina em "StoK · Estoque 99", sem Lojas G');
  ok(M.d0.split('\n')[0].replace(/\*/g,'')==='StoK'&&!SK.test(M.d0),dev+': mensagem sem título usa "StoK"');
  ok(M.h.indexOf('StoK · Estoque 99')>=0&&!LG.test(M.h)&&!SK.test(M.h),dev+': HTML do Outlook com "StoK · Estoque 99", sem Lojas G');
  ok(M.blob&&M.drawn.indexOf('STOK · ESTOQUE 99')>=0&&!M.drawn.some(x=>LG.test(x)||SK.test(x)),dev+': banner do WhatsApp desenha "STOK · ESTOQUE 99", sem Lojas G ('+M.drawn.slice(0,2).join(' | ')+')');
  ok(M.ph.indexOf('StoK · Estoque 99')>=0&&/<title>StoK<\/title>/.test(M.pt)&&![M.ph,M.pt].some(x=>LG.test(x)||SK.test(x)),dev+': folha impressa com "StoK · Estoque 99" (título padrão "StoK"), sem Lojas G');
  await A.evaluate(CAP);await A.evaluate(P=>e99Msg.print(P),PAY);await A.waitForTimeout(300);
  let ph=await A.evaluate(()=>window.__ph[window.__ph.length-1]||'');
  ok(/StoK · Estoque 99 · impresso em/.test(ph)&&!LG.test(ph)&&!SK.test(ph),dev+': Imprimir gera a folha com o rodapé "StoK · Estoque 99"');
  if(!mob){await A.evaluate(()=>go('plans'));await A.waitForTimeout(600);const bt=await A.$('.plan-card button:has-text("Imprimir")');
    if(bt){await bt.click();await A.waitForTimeout(500);ph=await A.evaluate(()=>window.__ph[window.__ph.length-1]||'');ok(/Repor arroz no 07/.test(ph)&&/StoK · Estoque 99/.test(ph)&&!LG.test(ph)&&!SK.test(ph),dev+': botão Imprimir do plano: folha com StoK, sem Lojas G')}
    else ok(false,dev+': botão Imprimir do plano encontrado')}
  await A.evaluate(P=>e99Msg.preview(P),PAY);await A.waitForTimeout(700);
  const pv=await A.evaluate(()=>{const d=document.getElementById('e99-msg');if(!d)return {open:false,all:''};const hrefs=[...d.querySelectorAll('a[href]')].map(a=>{try{return decodeURIComponent(a.getAttribute('href'))}catch(e){return a.getAttribute('href')}}).join(' ');return {open:d.open,all:d.textContent+' '+hrefs}});
  s=await A.evaluate(SCAN);
  ok(pv.open&&/StoK · Estoque 99/.test(pv.all)&&!LG.test(pv.all)&&!SK.test(pv.all)&&!s.lg.length&&!s.sk.length,dev+': folha de compartilhar (WhatsApp, Outlook, e-mail) com StoK, sem Lojas G'+fmt(s));
  await A.evaluate(()=>{try{e99Msg.close()}catch(e){}try{const d=document.getElementById('e99-msg');if(d&&d.open)d.close()}catch(e){}});
  /* .eml do plano */
  const eml=await A.evaluate(()=>{const s=planEml(state.plans[0]),dec=b=>new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s+/g,'')),c=>c.charCodeAt(0)));const out=[];
    const sj=/Subject: =\?UTF-8\?B\?([^?]+)\?=/.exec(s);if(sj)out.push(dec(sj[1]));const re=/Content-Type: text\/(?:plain|html)[^\r\n]*\r\nContent-Transfer-Encoding: base64\r\n\r\n([A-Za-z0-9+\/=\r\n]+?)\r\n--/g;let m;while((m=re.exec(s)))out.push(dec(m[1]));return out});
  ok(eml.length>=3&&!eml.some(x=>LG.test(x)||SK.test(x))&&eml.some(x=>/Repor arroz no 07/.test(x)),dev+': e-mail .eml do plano sem Lojas G ('+eml.length+' partes lidas)');
  /* relatório por e-mail e resumo semanal */
  await A.evaluate(()=>{const d=new Date(),t=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    localStorage.setItem('lojasg.estoque99.email-reports:'+authSession.storeKey,JSON.stringify({enabled:true,to:'stok99.app@gmail.com',cc:'99.estoque@lojasg.com.br',times:[t]}))});
  posts2.length=0;await A.evaluate(async()=>{await emailReportTick()});await A.waitForTimeout(1500);
  const rep=posts2.find(x=>/Relatório/.test(x.f._subject||''));const rs=JSON.stringify(rep?rep.f:{});
  ok(!!rep&&/StoK · Estoque 99/.test(rep.f.Mensagem||'')&&!LG.test(rs)&&!SK.test(rs),dev+': e-mail do relatório com rodapé "StoK · Estoque 99", sem Lojas G'+(rep?'':' (nenhum envio)'));
  const wk=await A.evaluate(()=>{const d=e99Week.data();return {f:e99Week.fields(d),t:e99Msg.text(e99Week.payload(d),{plain:true}),h:e99Week.html(d)}});const ws=JSON.stringify(wk.f)+wk.t+wk.h;
  ok(/Abra o StoK → Painel/.test(wk.f['Mais detalhes']||'')&&/Detalhes no StoK → Painel/.test(wk.t)&&!LG.test(ws)&&!SK.test(ws),dev+': resumo semanal (e-mail, texto e folha) com StoK, sem Lojas G');
  if(!mob){const link=await L.makeInvite(A,'Bia','');const inv=await A.evaluate(()=>window.__inv||'');
    ok(!!link&&/^Seu link de acesso ao StoK · Estoque 99 \(/.test(inv)&&!LG.test(inv)&&!SK.test(inv),dev+': convite (link de acesso) com "StoK · Estoque 99", sem Lojas G')}
  /* Privacidade, Termos e robo.html */
  const robo=await A.evaluate(async()=>(await fetch('robo.html',{cache:'no-store'})).text());
  ok(/<title>StoK · Estoque 99<\/title>/.test(robo)&&/Abrindo o StoK/.test(robo)&&!LG.test(robo)&&!SK.test(robo),dev+': robo.html com StoK, sem Lojas G');
  for(const pg of ['privacidade.html','termos.html']){await A.goto(BASE+'/'+pg);await A.waitForTimeout(600);const r=await A.evaluate(SCAN);const ti=await A.title();
    const tx=await A.evaluate(()=>document.body.textContent);
    ok(!r.lg.length&&!r.sk.length&&/· StoK$/.test(ti)&&/StoK — Estoque 99/.test(tx)&&/99\.estoque@lojasg\.com\.br/.test(tx),dev+': '+pg+' com StoK e sem Lojas G; e-mail de contato mantido ('+ti+')'+fmt(r))}
  await c2.close()}
 ok(!errs.length,'0 erro de JS'+(errs.length?' → '+errs.slice(0,4).join(' | '):''));
 await b.close();
})().catch(e=>{console.log('FAIL erro: '+(e&&e.stack||e));process.exit(1)});
