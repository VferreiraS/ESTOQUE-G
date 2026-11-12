/* v137: Equipe como rede social — mural, curtidas, comentários, status de 24 h e perfil. PC 1440×900 gestor + iPhone 13 auxiliar, emulador. */
const L=require('./lib.js');const {ok,until}=L;
const URL0='http://localhost:8000/index.html?ntfy='+L.N;const PROJ='gen-lang-client-0167474823';
const FSU='http://127.0.0.1:8080/v1/projects/'+PROJ+'/databases/(default)/documents';
const SHOTS=process.env.SHOTS||'';
const STRICT=()=>{try{localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup');localStorage.setItem('e99-test-strong','1')}catch(e){}};
async function admin(path,body){const r=await fetch(FSU+path,{method:body?'PATCH':'GET',headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return r.json()}
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(opts);await c.addInitScript(STRICT);await c.route(u=>u.host==='localhost:20130',r=>r.abort());const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|ERR_FAILED|ntfy|EventSource|firestore|Firebase|identitytoolkit|WebChannel|permission/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return {c,P}}
 const G=await dev('PC',{viewport:{width:1440,height:900}});const A=G.P;
 await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(500);await A.click('#auth-owner');await A.waitForTimeout(300);
 await A.fill('#auth-screen input[name=store]','Lojas G');await A.fill('#auth-screen input[name=email]',L.mail('vferreiras'));await A.fill('#auth-screen input[name=login]','vferreiras');await A.fill('#auth-screen input[name=password]','abc12345');await A.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await until(A,()=>!!(e99Cloud.user()&&e99Cloud.user().email),null,40000),'PC: gestor com nuvem');
 const guid=await A.evaluate(()=>e99Cloud.user().uid);await admin('/verificados/'+guid,{fields:{tipo:{stringValue:'s'}}});
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 await A.evaluate(async()=>{state.perfil={name:'Vitor',cargo:'Gestor',bio:'Dono da loja',photo:'',at:Date.now()};state.nfs=[{id:'n1',number:'1',supplier:'X',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1,hist:[[Date.now(),'Vitor','Criou a nota'],[Date.now(),'Vitor','Status: Pendente → Conferido']]}];await save()});
 ok(await until(A,()=>!!e99Loja.ctx()&&e99Social.state().started,null,40000),'PC: mural ligado à nuvem');
 await A.evaluate(()=>go('team'));await A.waitForTimeout(500);ok(await A.evaluate(()=>!!document.querySelector('#sc-mural .sc-stories')&&!!document.querySelector('#sc-mural .sc-new')),'PC: Equipe mostra status e mural no topo');
 await A.fill('#sc-mural .sc-new textarea','Bom dia, equipe! <b>x</b>');await A.click('#sc-mural .sc-new button.primary');
 ok(await until(A,()=>e99Social.state().posts===1&&!!document.querySelector('.sc-post'),null,15000),'PC: publicou no mural');
 ok(await A.evaluate(()=>!document.querySelector('.sc-post .sc-text b')&&/<b>x<\/b>/.test(document.querySelector('.sc-post .sc-text').textContent)),'PC: texto escapado (sem HTML)');
 const lj=await A.evaluate(()=>e99Loja.status().loja);const raw=JSON.stringify(await admin('/lojas/'+lj+'/dados'));ok(!raw.includes('Bom dia'),'Nuvem: publicação só cifrada');
 /* link do auxiliar */
 await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);await A.evaluate(()=>e99OpenAccCreate());await A.waitForTimeout(500);
 await A.fill('#aux-box input[name=name]','Caio');await A.fill('#aux-box input[name=login]','caio.aux');await A.selectOption('#aux-box select[name=papel]','auxiliar');
 await A.evaluate(()=>{window.__inv='';navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
 const lk=((await A.evaluate(()=>window.__inv||'')).match(/(http\S+#auxiliar=[A-Za-z0-9_-]+\.[0-9A-Z]{10})/)||[])[1];ok(!!lk,'PC: link do auxiliar');
 const X=await dev('iPhone',L.devices['iPhone 13']);const Q=X.P;await Q.goto('about:blank');await Q.goto(L.inviteUrl(lk));await Q.waitForSelector('#aux-form input[name=password]',{timeout:20000}).catch(()=>{});
 await Q.fill('#aux-form input[name=email]',L.mail('caio'));await Q.fill('#aux-form input[name=password]','caio1234x');await Q.fill('#aux-form input[name=confirmation]','caio1234x');await L.terms(Q,'#aux-form');await Q.click('#aux-form button[type=submit]');await Q.waitForTimeout(3000);
 await Q.fill('#recovery-last4',(await Q.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await Q.click('#recovery-enter');await Q.waitForTimeout(2500);await Q.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await until(Q,()=>!!window.e99Social&&e99Social.state().posts===1,null,60000),'iPhone auxiliar: vê a publicação do gestor');
 await A.evaluate(()=>go('team'));await Q.evaluate(()=>go('team'));await Q.waitForTimeout(600);ok(await Q.evaluate(()=>page==='team'&&!!document.querySelector('.sc-post')),'iPhone auxiliar: abre Equipe com o mural');
 await Q.click('.sc-post .sc-like');ok(await until(A,()=>/1 curtida/.test((document.querySelector('.sc-post .sc-count')||{}).textContent||''),null,20000),'PC: curtida do auxiliar chegou (contador)');
 await Q.fill('.sc-post .sc-cform input','Bom dia!');await Q.click('.sc-post .sc-cform button');ok(await until(A,()=>/Bom dia!/.test((document.querySelector('.sc-cmts')||{}).textContent||''),null,20000),'PC: comentário do auxiliar chegou');
 await Q.click('.sc-post .sc-like');ok(await until(A,()=>/0 curtidas/.test((document.querySelector('.sc-post .sc-count')||{}).textContent||''),null,20000),'PC: descurtir chegou');
 ok(await Q.evaluate(()=>![...document.querySelectorAll('.sc-post header .sc-link')].some(b=>/Apagar/.test(b.textContent))),'iPhone auxiliar: não apaga publicação alheia');
 /* auxiliar publica com foto; gestor modera */
 await Q.evaluate(async()=>{const c=document.createElement('canvas');c.width=1600;c.height=1200;const g=c.getContext('2d');g.fillStyle='#4a8';g.fillRect(0,0,1600,1200);const bl=await new Promise(r=>c.toBlob(r,'image/png'));const dt=new DataTransfer();dt.items.add(new File([bl],'a.png',{type:'image/png'}));const i=document.querySelector('#sc-mural .sc-new input[type=file]');i.files=dt.files;await e99SocPhoto(i)});
 await Q.waitForTimeout(400);await Q.fill('#sc-mural .sc-new textarea','Foto do corredor');await Q.click('#sc-mural .sc-new button.primary');
 ok(await until(A,()=>e99Social.state().posts===2&&!!document.querySelector('.sc-post .sc-img'),null,20000),'PC: publicação com foto do auxiliar chegou');
 ok(await A.evaluate(()=>{const i=document.querySelector('.sc-post .sc-img');return i.src.startsWith('blob:')}),'PC: foto mostrada por blob:');
 if(SHOTS)await Q.screenshot({path:SHOTS+'/mural-iphone.png'});
 await A.evaluate(()=>{const k=Object.keys(e99Social.S()).find(k=>{const r=e99Social.S()[k];return r.c==='posts'&&!r.like&&r.x&&r.x.t==='Foto do corredor'});return e99SocDel(k)});
 ok(await until(Q,()=>e99Social.state().posts===1,null,20000),'gestor moderou: publicação do auxiliar some para todos');
 /* story */
 await Q.evaluate(async()=>{e99StNew();document.querySelector('#st-new textarea').value='Chegou carga!';document.querySelector('#st-new button.primary').click()});
 ok(await until(A,()=>e99Social.state().stories===1&&!!document.querySelector('.sc-story.new'),null,20000),'PC: status do auxiliar aparece como não visto');
 await A.click('.sc-story.new');ok(await A.evaluate(()=>!!document.querySelector('#st-view .st-bars i.on')&&/Chegou carga/.test(document.querySelector('#st-view').textContent)),'PC: status em tela cheia com barra');
 await A.evaluate(()=>e99StClose());await A.waitForTimeout(400);ok(await A.evaluate(()=>!document.querySelector('.sc-story.new')),'PC: status marcado como visto');
 await A.evaluate(()=>{const o=Date.now;Date.now=()=>o()+25*3600e3;go('team')});await A.waitForTimeout(400);
 ok(await A.evaluate(()=>e99Social.state().stories===0&&document.querySelectorAll('.sc-story').length===1),'PC: status some depois de 24 h (relógio simulado)');
 /* perfil */
 await A.evaluate(()=>e99Pessoa(e99Loja.ctx().uid));await A.waitForTimeout(600);
 ok(await A.evaluate(()=>{const t=document.querySelector('#sc-prof').textContent;return /Vitor/.test(t)&&/@vferreiras/.test(t)&&/Dono da loja/.test(t)&&!!document.querySelector('.sc-cover')&&/notas criadas/.test(t)}),'PC: perfil com capa, nome, @login, sobre e conquistas');
 ok(await A.evaluate(()=>[...document.querySelectorAll('.sc-feats b')].map(b=>b.textContent).join(',')==='1,1,0'),'PC: conquistas calculadas (1 criada, 1 conferida)');
 ok(await until(Q,()=>{const S=e99Social.S();return Object.keys(S).some(k=>k.startsWith('perfis_')&&S[k].x&&S[k].x.name==='Vitor')},null,20000),'iPhone: recebeu o perfil do gestor');
 await Q.evaluate(()=>{const S=e99Social.S(),k=Object.keys(S).find(k=>k.startsWith('perfis_')&&S[k].x.name==='Vitor');e99Pessoa(S[k].cuid)});await Q.waitForTimeout(600);
 ok(await Q.evaluate(()=>page==='pessoa'&&/Vitor/.test(document.querySelector('#sc-prof').textContent)&&document.querySelectorAll('#view .sc-post').length===1&&document.documentElement.scrollWidth<=innerWidth+1),'iPhone: perfil do gestor com publicações, sem rolagem lateral');
 if(SHOTS){await A.evaluate(()=>{Date.now=Date.now;e99Pessoa(e99Loja.ctx().uid)});await A.waitForTimeout(500);await A.screenshot({path:SHOTS+'/perfil-pc.png'})}
 const small=await Q.evaluate(()=>{go('team');return [...document.querySelectorAll('#sc-mural button')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height<43.5).map(b=>b.textContent.trim()).slice(0,5)});
 ok(!small.length,'iPhone: toques ≥44 px no mural'+(small.length?': '+small.join('|'):''));
 ok(!errs.length,'sem erro de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
