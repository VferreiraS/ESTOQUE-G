/* v175 · relatório diário enviado pelo próprio app (pedido do dono).
   Ao abrir o app (entrar numa conta), no máximo UMA vez por dia neste aparelho, o relatório do dia
   (o mesmo de "Relatório por e-mail", window.emailReportFields, v158) vai para o e-mail de cada conta cadastrada neste aparelho.
   - checagem "uma vez por dia": chave lojasg.estoque99.daily-app-report = data de hoje (AAAA-MM-DD), lida/gravada com try/catch
     em feito()/marcar() abaixo; só é gravada depois de pelo menos 1 envio ok (se falhar tudo, tenta de novo na próxima abertura).
   - destinatários: o e-mail da conta aberta (authSession.payload.email ou cloud-email) e os e-mails em claro das outras contas
     deste aparelho (lojasg.estoque99.cloud-email:<conta>). Sem e-mail = não envia. Duplicados e inválidos saem.
   - conteúdo: a conta aberta recebe o relatório do seu papel; as outras contas recebem a versão sem valores (como o auxiliar, v134),
     porque o papel delas não é conhecido sem abrir a conta.
   - sem nuvem: só FormSubmit (o mesmo serviço do relatório por e-mail); nada é gravado no Firebase.
   - não repete o que a v158 já mandou hoje para a mesma conta (marcador rep-sent de hoje).
   - localhost: só roda com a chave de teste e99-test-dailymail = 1 (o teste intercepta o FormSubmit). */
(function(){'use strict';var W=window,D=document;
var KEY='lojasg.estoque99.daily-app-report',EM='lojasg.estoque99.cloud-email:',MK='lojasg.estoque99.rep-sent:',busy=false;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null}
function hoje(){try{return iso()}catch(e){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}}
/* ===== checagem "uma vez por dia" ===== */
function feito(){return ls(KEY)===hoje()}
function marcar(){ls(KEY,hoje())}
function local(){return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)||location.protocol==='file:'}
function allowed(){return !local()||ls('e99-test-dailymail')==='1'}
function okMail(v){return /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]{1,190}\.[a-z]{2,}$/i.test(String(v||''))&&String(v).length<=120}
function norm(m){return String(m==null?'':m).replace(/\s+/g,'').toLowerCase()}
function role(){try{return authSession.payload.role||''}catch(e){return ''}}
function jaV158(id){try{var p=MK+id+':'+hoje();for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(p)===0)return true}}catch(e){}return false}
function destinos(){var out=[],seen={};if(!authSession)return out;var sk=authSession.storeKey,lg=String(authSession.record&&authSession.record.login||'');
  function add(m,own,id){m=norm(m);if(!m||seen[m]||!okMail(m))return;seen[m]=1;out.push({email:m,own:own,id:id})}
  add(authSession.payload&&authSession.payload.email,true,lg);add(ls(EM+sk),true,lg);
  try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(EM)===0&&k.slice(EM.length)!==sk)add(localStorage.getItem(k),false,k.slice(EM.length))}}catch(e){}
  return out}
function semValores(f){var g={};Object.keys(f).forEach(function(k){var v=String(f[k]);if(/valor|R\$/i.test(k)||/R\$\s*\d/.test(v))return;g[k]=f[k]});return g}
async function post(to,fields){var r=await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(to),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(fields)}),j={};try{j=await r.json()}catch(e){}
  return r.ok&&(j.success===true||j.success==='true')}
async function run(force){if(busy||!authSession||!allowed()||!W.emailReportFields)return null;if(!force&&feito())return null;if(navigator.onLine===false)return null;
  var l=destinos();if(!l.length)return {sent:0,total:0};busy=true;var s=authSession,res={sent:0,fail:0,total:l.length};
  try{var full=W.emailReportFields('do dia'),aux=semValores(full),meu=role()==='auxiliar'?aux:full;
    for(var i=0;i<l.length&&i<30;i++){if(authSession!==s)break;var d=l[i];if(d.own&&jaV158(d.id))continue;if(i)await new Promise(function(r){setTimeout(r,local()?100:1500)});
      try{if(await post(d.email,d.own?meu:aux))res.sent++;else res.fail++}catch(e){res.fail++}}
    if(res.sent||(!res.fail&&authSession===s))marcar();return res}
  finally{busy=false}}
function later(){setTimeout(function(){try{run(false)}catch(e){}},6000)}
if(typeof authEnter==='function'){var ae=authEnter;authEnter=function(){var r=ae.apply(this,arguments);later();return r}}
D.addEventListener('visibilitychange',function(){if(!D.hidden&&authSession&&!feito())later()});
W.e99DailyMail={run:run,feito:feito,destinos:destinos,key:KEY};
})();
