/* v103: excluir/cancelar onde faltava — NF (na lista), corredor e pessoa (no cartão), conferência por câmera (finalizada e interrompida),
   mensagem do chat (neste aparelho). Auxiliar não vê Excluir; a exclusão vai para a equipe pelo sync. PC e celular. */
const L=require('./lib.js');const {ok,until}=L;
const NO_CAM=()=>{try{navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('negado','NotAllowedError'))}catch(e){}};
async function oneConf(p,manual){await p.evaluate(()=>go('nfs'));await p.waitForTimeout(300);await p.click('#conf-go');await until(p,()=>!!document.getElementById('cf-manual'),null,8000);
 for(let i=0;i<manual;i++){await p.click('#cf-manual');await p.fill('#cf-mcode','');await p.click('#cf-manual-form button[type=submit]');await p.waitForTimeout(250)}return p.evaluate(()=>e99Conf.state().id)}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['celular',L.devices['iPhone 13']]]){
  const c=await b.newContext(opts);await c.addInitScript(NO_CAM);const P=await c.newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept(d.defaultValue()));
  ok(await L.gestorWithTeam(P,'del'+nome+T),nome+': conta com equipe');
  await P.evaluate(async()=>{state.team.push({id:'bia',name:'Bia',role:'Conferente'});state.corridors.push({id:'c8',number:'08',sector:'Bebidas',owner:'bia'});state.nfs.push({id:'n2',number:'777',supplier:'Fornecedor X',date:iso(),status:'Pendente',owner:'bia',notes:'',volumes:2});await save()});
  /* NF */
  await P.evaluate(()=>go('nfs'));await P.waitForTimeout(500);
  ok(await P.evaluate(()=>document.querySelectorAll('#view .nf-actions .e99-del').length===state.nfs.length),nome+': cada NF da lista tem Excluir');
  await P.evaluate(()=>{[...document.querySelectorAll('#view tr')].find(r=>/NF 777/.test(r.innerText)).querySelector('.e99-del').click()});
  ok(await until(P,()=>!state.nfs.some(n=>n.id==='n2')&&!/NF 777/.test(document.getElementById('view').innerText)),nome+': exclui a NF pela lista (com confirmação)');
  /* corredor */
  await P.evaluate(()=>go('corridors'));await P.waitForTimeout(400);
  await P.evaluate(()=>{[...document.querySelectorAll('#view .corridor-card')].find(r=>/corredor 08/i.test(r.innerText)).querySelector('.e99-del').click()});
  ok(await until(P,()=>!state.corridors.some(x=>x.id==='c8')),nome+': exclui corredor pelo cartão');
  /* pessoa */
  await P.evaluate(()=>go('team'));await P.waitForTimeout(400);
  await P.evaluate(()=>{[...document.querySelectorAll('#view .cards .card')].find(r=>/Bia/.test(r.querySelector('h3').textContent)).querySelector('.e99-del').click()});
  ok(await until(P,()=>!state.team.some(x=>x.id==='bia')),nome+': exclui pessoa da equipe pelo cartão');
  ok(await until(P,()=>syncStatus().pending===0,null,30000),nome+': exclusões enviadas para a equipe');
  /* conferências: finalizada e interrompida */
  const id1=await oneConf(P,2);await P.click('#cf-finish');await until(P,()=>/Relatório/.test(document.getElementById('cf-title').textContent),null,5000);
  await P.evaluate(()=>{const d=document.getElementById('conf-dlg');if(d.open)d.close();document.body.classList.remove('conf-on')});await P.evaluate(()=>go('nfs'));await P.waitForTimeout(500);
  ok(await P.evaluate(i=>!!document.querySelector('#view [data-conf-del="'+i+'"]'),id1),nome+': conferência finalizada tem Excluir na lista');
  await P.evaluate(i=>{document.querySelector('#view .conf-hist').open=true;document.querySelector('#view [data-conf-del="'+i+'"]').click()},id1);
  ok(await until(P,i=>{const c=state.confs.find(x=>x.id===i);return c&&c.status==='cancelada'&&!c.reads.length&&!document.querySelector('[data-conf-del="'+i+'"]')},id1),nome+': exclui conferência finalizada (fica só o marcador, some da lista)');
  ok(await P.evaluate(i=>e99Conf.idbReads(i).then(r=>r.length===0),id1),nome+': leituras apagadas do aparelho');
  const id2=await oneConf(P,1);await P.click('#cf-x');await until(P,()=>!document.getElementById('conf-dlg').open);await P.evaluate(()=>render());await P.waitForTimeout(800);
  ok(await until(P,i=>!!document.querySelector('.conf-banner [data-conf-del="'+i+'"]'),id2,8000),nome+': conferência interrompida tem Excluir no aviso');
  await P.evaluate(i=>document.querySelector('.conf-banner [data-conf-del="'+i+'"]').click(),id2);
  ok(await until(P,i=>!document.querySelector('.conf-banner')&&(state.confs.find(x=>x.id===i)||{status:'cancelada'}).status==='cancelada',id2,8000),nome+': exclui conferência interrompida');
  /* chat */
  await P.evaluate(()=>go('chat'));await P.waitForTimeout(500);await P.fill('#chat-text','apagar esta');await P.press('#chat-text','Enter');
  ok(await until(P,()=>[...document.querySelectorAll('#chat-list .chat-msg')].some(m=>/apagar esta/.test(m.innerText))),nome+': mensagem enviada');
  await P.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg')].find(m=>/apagar esta/.test(m.innerText)).querySelector('.chat-del-btn').click());
  ok(await until(P,()=>![...document.querySelectorAll('#chat-list .chat-msg')].some(m=>/apagar esta/.test(m.innerText))),nome+': apaga mensagem do chat');
  await P.reload();await P.waitForTimeout(1500);await L.login(P,'del'+nome+T);await P.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await P.evaluate(()=>go('chat'));await P.waitForTimeout(4000);
  ok(await P.evaluate(()=>![...document.querySelectorAll('#chat-list .chat-msg')].some(m=>/apagar esta/.test(m.innerText))),nome+': mensagem apagada não volta (ntfy reenviando)');
  if(nome==='celular'){const r=await P.evaluate(()=>{const x=document.querySelector('#chat-list .chat-del-btn');return x?x.getBoundingClientRect().height:44});ok(r>=44||r===0,'celular: botão de apagar com toque ≥44 px')}
  /* auxiliar não vê Excluir */
  if(nome==='PC'){const lk=await L.makeInvite(P,'Aux Del');const X=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();X.on('dialog',d=>d.accept());await L.auxAccept(X,lk,null,'3690');
   await until(X,()=>state.nfs.length>0,null,60000);await X.evaluate(()=>go('nfs'));await X.waitForTimeout(500);ok(await X.evaluate(()=>!document.querySelector('#view .e99-del')),'auxiliar não vê Excluir nas NFs')}
  await c.close()}
 console.log('errors',errs);await b.close()})();
