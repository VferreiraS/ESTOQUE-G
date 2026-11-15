/* v147: UM perfil por pessoa. Editar uma vez -> o mesmo nome, foto e cargo no chat da equipe, na conversa privada, na Equipe,
   no mural e na página da pessoa, nos dois aparelhos (PC gestor + iPhone 13 auxiliar, emulador). Só existe uma página "Ver perfil". */
const L=require('./lib.js');const path=require('path');const {ok,until}=L;
const URL0='http://localhost:8000/index.html';const PROJ='gen-lang-client-0167474823';
const FSU='http://127.0.0.1:8080/v1/projects/'+PROJ+'/databases/(default)/documents';
const STRICT=()=>{try{localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup');localStorage.setItem('e99-test-strong','1');localStorage.setItem('e99-test-chatlist','1')}catch(e){}};
async function admin(p,body){const r=await fetch(FSU+p,{method:body?'PATCH':'GET',headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return r.json()}
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(opts);await c.addInitScript(STRICT);const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|ERR_FAILED|EventSource|firestore|Firebase|identitytoolkit|WebChannel|permission/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return P}
 const A=await dev('PC',{viewport:{width:1440,height:900}});
 await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(500);await A.click('#auth-owner');await A.waitForTimeout(300);
 await A.fill('#auth-screen input[name=store]','Lojas G');await A.fill('#auth-screen input[name=email]',L.mail('vferreiras'));await A.fill('#auth-screen input[name=login]','vferreiras');await A.fill('#auth-screen input[name=password]','abc12345');await A.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await until(A,()=>!!(e99Cloud.user()&&e99Cloud.user().email),null,40000),'PC: gestor com nuvem');
 const guid=await A.evaluate(()=>e99Cloud.user().uid);await admin('/verificados/'+guid,{fields:{tipo:{stringValue:'s'}}});
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.evaluate(()=>{if(window.e99Cv)e99Cv.open('geral')});await A.waitForTimeout(400);
 await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 ok(await until(A,()=>!!e99Loja.ctx()&&e99Social.state().started,null,40000),'PC: nuvem da loja ligada');
 /* link do auxiliar */
 await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);await A.evaluate(()=>e99OpenAccCreate());await A.waitForTimeout(500);
 await A.fill('#aux-box input[name=name]','Caio');await A.fill('#aux-box input[name=login]','caio.aux');await A.selectOption('#aux-box select[name=papel]','auxiliar');
 await A.evaluate(()=>{window.__inv='';navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
 const lk=((await A.evaluate(()=>window.__inv||'')).match(/(http\S+#auxiliar=[A-Za-z0-9_-]+\.[0-9A-Z]{10})/)||[])[1];ok(!!lk,'PC: link do auxiliar');
 const Q=await dev('iPhone',L.devices['iPhone 13']);await Q.goto('about:blank');await Q.goto(L.inviteUrl(lk));await Q.waitForSelector('#aux-form input[name=password]',{timeout:20000}).catch(()=>{});
 await Q.fill('#aux-form input[name=email]',L.mail('caio'));await Q.fill('#aux-form input[name=password]','caio1234x');await Q.fill('#aux-form input[name=confirmation]','caio1234x');await L.terms(Q,'#aux-form');await Q.click('#aux-form button[type=submit]');await Q.waitForTimeout(3000);
 await Q.fill('#recovery-last4',(await Q.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await Q.click('#recovery-enter');await Q.waitForTimeout(2500);await Q.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await until(Q,()=>!!window.e99Loja&&!!e99Loja.ctx()&&e99Social.state().started&&!!e99Cv.state().pk,null,60000),'iPhone auxiliar: nuvem e conversas ligadas');
 const quid=await Q.evaluate(()=>e99Loja.ctx().uid);
 /* ---- o gestor edita o perfil UMA vez ---- */
 const NOME='Vitor Hugo <b>x</b>';
 await A.evaluate(()=>go('profile'));await A.waitForTimeout(500);await A.setInputFiles('#pf-photo-in',path.join(__dirname,'face.jpg'));await A.waitForTimeout(1500);
 await A.fill('#pf-name',NOME);await A.fill('#pf-cargo','Gestor do estoque');await A.fill('#pf-bio','Dono da loja');await A.click('#pf-form button[type=submit]');await A.waitForTimeout(1500);
 const foto=await A.evaluate(()=>state.perfil.photo);ok(/^data:image\/jpeg/.test(foto),'PC: perfil salvo com foto');
 ok(await A.evaluate(()=>!document.getElementById('pf-view')&&!!document.getElementById('pf-see')),'PC: tela Perfil é só o editor (sem a 2ª tela de ver perfil)');
 const same=(P,ref,n,c,f)=>until(P,a=>{const p=e99Perfil(a[0]);return !!p&&p.name===a[1]&&p.cargo===a[2]&&p.photo===a[3]},[ref,n,c,f],40000);
 ok(await same(Q,{uid:guid},NOME,'Gestor do estoque',foto),'iPhone: e99Perfil(uid) = perfil editado (nuvem)');
 ok(await same(Q,{name:'Vitor'},NOME,'Gestor do estoque',foto),'iPhone: e99Perfil(nome do chat) = o mesmo perfil');
 ok(await same(Q,{login:'vferreiras'},NOME,'Gestor do estoque',foto),'iPhone: e99Perfil(login) = o mesmo perfil');
 ok(await Q.evaluate(u=>{const a=e99Perfil({uid:u}),b=e99Perfil({name:'Vitor'});return a.ref===b.ref&&a.ref==='u:'+u&&e99PerfilAll().filter(p=>p.login==='vferreiras').length===1},guid),'iPhone: uma entrada só para a pessoa (mesma referência)');
 ok(await until(A,u=>{const S=e99Social.S()['perfis_'+u];return !!(S&&S.x&&S.x.pk&&S.x.pat>0)},guid,20000),'PC: perfil na nuvem com a hora da edição e a chave pública intacta');
 /* chat da equipe */
 await Q.evaluate(()=>{go('chat');e99Cv.open('geral')});await Q.waitForTimeout(500);await A.evaluate(()=>{go('chat');e99Cv.open('geral')});await A.waitForTimeout(500);
 await A.fill('#chat-text','Oi equipe');await A.evaluate(()=>document.querySelector('#chat-text').closest('form').requestSubmit());
 const chip=n=>{const c=[...document.querySelectorAll('#view .chat-msg button.prof-chip')].find(x=>x.getAttribute('data-name')===n[0]);return !!c&&!!c.querySelector('img.av')&&c.querySelector('span:last-child').textContent===n[1]&&!c.querySelector('b')};
 ok(await until(Q,chip,['Vitor',NOME],30000),'iPhone: chat da equipe mostra o nome e a foto do perfil (escapado)');
 await Q.evaluate(()=>{[...document.querySelectorAll('#view .chat-msg button.prof-chip')].find(x=>x.getAttribute('data-name')==='Vitor').click()});await Q.waitForTimeout(700);
 const pag=a=>{const s=document.getElementById('sc-prof');if(page!=='pessoa'||!s)return false;const t=s.textContent,i=s.querySelector('img.sc-pav');return s.querySelector('h2').textContent===a[0]&&!s.querySelector('h2 *')&&t.includes(a[1])&&!!i===a[2]&&!document.getElementById('pf-view')&&!document.getElementById('pf-form')};
 ok(await Q.evaluate(pag,[NOME,'Gestor do estoque',true]),'iPhone: tocar no nome do chat abre a página única do perfil');
 const ref1=await Q.evaluate(()=>document.getElementById('sc-prof').getAttribute('data-ref'));
 /* mural + Equipe */
 await A.evaluate(()=>go('team'));await A.waitForTimeout(600);await A.fill('#sc-mural .sc-new textarea','Bom dia');await A.click('#sc-mural .sc-new button.primary');
 await Q.evaluate(()=>go('team'));
 ok(await until(Q,n=>{const p=document.querySelector('.sc-post header .sc-who');return !!p&&p.querySelector('b').textContent===n&&!!p.querySelector('img.sc-av')},NOME,30000),'iPhone: mural mostra o mesmo nome e foto');
 ok(await Q.evaluate(n=>{const b=[...document.querySelectorAll('#sc-people-panel .sc-who')].filter(x=>x.querySelector('b').textContent===n);return b.length===1&&!!b[0].querySelector('img.sc-av')},NOME),'iPhone: Equipe (Pessoas) com o mesmo nome e foto, uma vez só');
 await Q.click('.sc-post header .sc-who');await Q.waitForTimeout(600);
 ok(await Q.evaluate(pag,[NOME,'Gestor do estoque',true])&&await Q.evaluate(r=>document.getElementById('sc-prof').getAttribute('data-ref')===r,ref1),'iPhone: mural abre a MESMA página do perfil');
 await Q.evaluate(()=>go('team'));await Q.waitForTimeout(400);await Q.click('#sc-people-panel .sc-who');await Q.waitForTimeout(600);
 ok(await Q.evaluate(pag,[NOME,'Gestor do estoque',true])&&await Q.evaluate(r=>document.getElementById('sc-prof').getAttribute('data-ref')===r,ref1),'iPhone: Equipe abre a MESMA página do perfil');
 await Q.evaluate(u=>openProfile('u:'+u),guid);await Q.waitForTimeout(500);ok(await Q.evaluate(()=>page==='pessoa'&&!document.getElementById('pf-form')),'iPhone: openProfile de outra pessoa = a mesma página (não há outra tela)');
 /* conversa privada */
 ok(await Q.evaluate(()=>[...document.querySelectorAll('#sc-prof button')].some(b=>/^Mensagem$/.test(b.textContent))),'iPhone: página do perfil tem Mensagem');
 await Q.evaluate(u=>e99Cv.dmTo(u),guid);await Q.waitForTimeout(800);
 ok(await Q.evaluate(n=>{const h=document.querySelector('.cv-head');return !!h&&h.querySelector('.cv-mid b').textContent===n&&!!h.querySelector('.cv-who img.cv-av')},NOME),'iPhone: conversa privada com o mesmo nome e foto');
 await Q.fill('.cv-compose textarea','Oi Vitor');await Q.click('.cv-compose button.primary');ok(await until(Q,()=>e99Cv.msgs().some(m=>/Oi Vitor/.test(m.t)&&!m.st),null,20000),'iPhone: mensagem privada enviada (chave pública ok)');
 await Q.click('.cv-head .cv-who');await Q.waitForTimeout(600);ok(await Q.evaluate(pag,[NOME,'Gestor do estoque',true]),'iPhone: conversa privada abre a MESMA página do perfil');
 /* ---- o auxiliar edita o perfil dele; o gestor vê igual em tudo ---- */
 await Q.evaluate(()=>openProfile('me'));await Q.waitForTimeout(500);ok(await Q.evaluate(()=>page==='profile'&&!!document.getElementById('pf-form')),'iPhone: o meu perfil abre o editor');
 await Q.setInputFiles('#pf-photo-in',path.join(__dirname,'face.jpg'));await Q.waitForTimeout(1500);await Q.fill('#pf-name','Caio Lima');await Q.fill('#pf-cargo','Auxiliar de estoque');await Q.click('#pf-form button[type=submit]');await Q.waitForTimeout(1500);
 const foto2=await Q.evaluate(()=>state.perfil.photo);
 ok(await same(A,{uid:quid},'Caio Lima','Auxiliar de estoque',foto2)&&await same(A,{name:'Caio'},'Caio Lima','Auxiliar de estoque',foto2)&&await same(A,{login:'caio.aux'},'Caio Lima','Auxiliar de estoque',foto2),'PC: perfil do auxiliar igual por uid, nome do chat e login');
 ok(await until(A,()=>{const c=e99Cv.state().convs||[];return c.length>0},null,20000),'PC: conversa privada chegou');
 await A.evaluate(()=>{localStorage.removeItem('e99-test-chatgeral');go('chat');e99Cv.list()});
 ok(await until(A,()=>{const i=document.querySelector('.cv-item[data-cv]');return !!i&&i.querySelector('.cv-mid b').textContent==='Caio Lima'&&!!i.querySelector('img.cv-av')},null,20000),'PC: lista de conversas com o nome e a foto do perfil');
 await Q.evaluate(()=>{go('chat');e99Cv.open('geral')});await Q.waitForTimeout(500);await Q.fill('#chat-text','Bom dia, sou eu');await Q.evaluate(()=>document.querySelector('#chat-text').closest('form').requestSubmit());
 await A.evaluate(()=>e99Cv.open('geral'));ok(await until(A,chip,['Caio','Caio Lima'],30000),'PC: chat da equipe mostra o nome e a foto do perfil do auxiliar');
 await A.evaluate(()=>go('team'));await A.waitForTimeout(800);
 ok(await A.evaluate(()=>{const c=[...document.querySelectorAll('#view .cards .card')].filter(x=>/Caio/.test(x.querySelector('h3')?x.querySelector('h3').textContent:''));return c.length===1&&!!c[0].querySelector('.avatar img')&&!!c[0].querySelector('.e99-prof-open')}),'PC: cartão da Equipe com a foto do perfil e "Ver perfil", uma vez só');
 await A.evaluate(()=>{[...document.querySelectorAll('#view .cards .card')].find(x=>/Caio/.test(x.querySelector('h3').textContent)).querySelector('.e99-prof-open').click()});await A.waitForTimeout(600);
 ok(await A.evaluate(pag,['Caio Lima','Auxiliar de estoque',true])&&await A.evaluate(u=>document.getElementById('sc-prof').getAttribute('data-ref')==='u:'+u,quid),'PC: "Ver perfil" da Equipe abre a página única');
 /* capa: mora no mesmo perfil e chega igual */
 await A.evaluate(()=>e99Pessoa('me'));await A.waitForTimeout(500);
 await A.evaluate(async()=>{const c=document.createElement('canvas');c.width=1200;c.height=400;const g=c.getContext('2d');g.fillStyle='#284';g.fillRect(0,0,1200,400);const bl=await new Promise(r=>c.toBlob(r,'image/png'));const dt=new DataTransfer();dt.items.add(new File([bl],'c.png',{type:'image/png'}));const i=document.querySelector('#sc-prof input[type=file]');i.files=dt.files;await e99SocCover(i)});
 ok(await until(A,()=>!!(state.perfil&&state.perfil.cover)&&!!document.querySelector('#sc-prof .sc-cover.img'),null,15000),'PC: capa gravada no perfil (dentro da conta)');
 const capa=await A.evaluate(()=>state.perfil.cover);
 ok(await until(Q,a=>{const p=e99Perfil({name:'Vitor'});return !!p&&p.cover===a[0]&&p.name===a[1]&&p.photo===a[2]},[capa,NOME,foto],30000),'iPhone: capa chega junto, nome e foto continuam os mesmos');
 /* v148: perfil só pela nuvem (perfis_{uid}). Gravar o perfil de outra pessoa é recusado; perfil não dá papel. */
 const forj=await Q.evaluate(async()=>{const r0=authSession.payload.role;const g=e99Perfil({name:'Vitor'});const c=e99Loja.conn();if(!c||!g||!g.uid)return 'sem-ref';const id='perfis_'+g.uid;
   try{await c.L().collection('dados').doc(id).set({c:'perfis',at:Date.now(),st:c.FS.FieldValue.serverTimestamp(),by:c.uid,cuid:c.uid,del:false,v:1,d:await c.seal(id,{name:'Invasor',papel:'gestor'})});return 'gravou'}catch(e){return (authSession.payload.role===r0&&r0==='auxiliar'&&!labels.admin?'':'papel-mudou ')+e.code}});
 ok(forj==='permission-denied','iPhone: gravar o perfil de outra pessoa na nuvem é recusado e não muda papel ('+forj+')');
 console.log(errs.length?'FAIL erros: '+errs.slice(0,5).join(' | '):'PASS sem erro de página/console');
 await b.close()})().catch(e=>{console.log('FAIL Error '+(e&&e.stack||e));process.exit(1)});
