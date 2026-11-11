
/* v95: cola a mensagem do WhatsApp com o planejamento da semana e cria um plano por dia.
   Tudo o que vem do texto colado entra na tela por esc() ou .value — nunca innerHTML cru. */
(function(){
var D=document,TITLE='Planejamento da semana',MAX_GEN=3000;
var DAYS=['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo'];
var KEY={segunda:0,terca:1,quarta:2,quinta:3,sexta:4,sabado:5,domingo:6};
var KEEP={CD:1,NF:1,NFS:1,TI:1,PDV:1,CPF:1,CNPJ:1,EPI:1,EPIS:1,SKU:1,TV:1,LED:1,USB:1,RH:1,SAC:1,ADM:1,OK:1,PDF:1,QR:1,G:1};
var EMO;try{EMO=new RegExp('(?:\\p{Extended_Pictographic}|\\p{Regional_Indicator}|[\\u{1F3FB}-\\u{1F3FF}])(?:\\uFE0F|\\u20E3|[\\u{1F3FB}-\\u{1F3FF}])*(?:\\u200D\\p{Extended_Pictographic}\\uFE0F?)*','gu')}catch(x){EMO=/[←-⇿⌀-➿⬀-⯿〰〽㊗㊙]|[\uD83C-\uD83E][\uDC00-\uDFFF]/g}
var BUL=/^\s*(?:✅|✔️?|☑️?|▪️?|🔹|🔸|➡️?|👉|▶️?|•)/;
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function noEmo(s){return String(s).replace(EMO,'').replace(/[️‍⃣]/g,'')}
function strip(s){return noEmo(s).replace(/[*~]+/g,'').replace(/(^|[\s(])_+/g,'$1').replace(/_+(?=[\s).,!?:;]|$)/g,'').replace(/[ \t ]+/g,' ').trim()}
/* mesma posição de cada letra, sem acento e em minúscula (para achar o dia sem perder o índice) */
function fold(s){return s.split('').map(function(c){return c.normalize?c.normalize('NFD').charAt(0):c}).join('').toLowerCase()}
function norm(s){return fold(strip(s)).replace(/[^a-z0-9]+/g,' ').trim()}
function iso2(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function addDays(start,n){var p=String(start||'').split('-');if(p.length!==3)return '';var d=new Date(+p[0],+p[1]-1,+p[2]+n,12);return iso2(d)}
function nextMonday(){var d=new Date();d.setHours(12,0,0,0);var k=(8-d.getDay())%7||7;d.setDate(d.getDate()+k);return iso2(d)}
function cut(s,n){s=String(s||'');if(s.length<=n)return s;var t=s.slice(0,n-1).replace(/\s+\S*$/,'');return (t||s.slice(0,n-1))+'…'}

/* é a linha de um dia? devolve {i, rest} ou null */
function dayHead(raw){var e=noEmo(raw).replace(/^[\s ]+/,'');if(!e)return null;var a=fold(e);
  var m=a.match(/^([*_~\s]*)(segunda|terca|quarta|quinta|sexta|sabado|domingo)(?![a-z0-9])/),idx,wordAt,word;
  if(m){idx=KEY[m[2]];wordAt=m[1].length;word=e.substr(wordAt,m[2].length)}
  else{m=a.match(/^([*_~\s]*)([2-6])\s*(?:a|o|ª|º|°)\s*-?\s*(?=feira)/);if(!m)return null;idx=+m[2]-2;wordAt=m[1].length;word='x'}
  var pos=m[0].length,marks=/[*_~]/.test(m[1]),r;
  r=a.slice(pos).match(/^[*_~]*\s*-?\s*feira(?![a-z0-9])/);if(r)pos+=r[0].length;
  r=a.slice(pos).match(/^([*_~\s]*)\(?\s*(?:dia\s*)?\d{1,2}\s*\/\s*\d{1,2}(?:\s*\/\s*\d{2,4})?\s*\)?/);if(r)pos+=r[0].length;
  r=a.slice(pos).match(/^[*_~\s]*/);if(r){if(/[*_~]/.test(r[0]))marks=true;pos+=r[0].length}
  var sep=false;r=a.slice(pos).match(/^[:\-–—.)]+/);if(r){sep=true;pos+=r[0].length;r=a.slice(pos).match(/^[*_~\s]*/);if(r)pos+=r[0].length}
  var rest=e.slice(pos),upper=word===word.toUpperCase();
  if(!(sep||!strip(rest)||marks||upper))return null;
  return {i:idx,rest:rest}}

/* título em letra normal: "Mutirão no setor de **ARAMADOS...**" → "Mutirão: Aramados..." */
function tidy(s){s=strip(s).replace(/^[\s\-–—•:.,;]+/,'').replace(/[\s.,;:]+$/,'');
  s=s.split(/(\s+)/).map(function(w){if(!/\S/.test(w))return w;var core=w.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g,'');if(core&&core===core.toUpperCase()&&core!==core.toLowerCase()&&!KEEP[core])return w.toLowerCase();return w}).join('');
  var m=s.match(/^mutir[aã]o\s*[:\-–—]?\s*(?:(?:no|nos|na|nas|do|dos|da|das|de|em)\s+)?(?:(?:setor(?:es)?|departamentos?|[áa]reas?|se[çc][ãa]o|se[çc][õo]es|corredor(?:es)?)\s+(?:(?:de|do|da|dos|das)\s+)?)?(.+)$/i);
  if(m&&m[1]&&m[1].trim())s='Mutirão: '+m[1].trim().charAt(0).toUpperCase()+m[1].trim().slice(1);
  s=s.charAt(0).toUpperCase()+s.slice(1);return cut(s,500)}
function genLine(raw){var b=BUL.test(raw),s=strip(raw);return b&&s?'• '+s:s}

/* lê a mensagem: dias (na ordem em que aparecem) + orientações gerais */
function parse(text,start){var L=String(text||'').replace(/\r\n?/g,'\n').split('\n'),days=[],gen=[],cur=null,need=false;
  for(var k=0;k<L.length;k++){var raw=L[k],h=dayHead(raw);
    if(h){for(var j=gen.length-1;j>=0;j--){if(!gen[j])continue;if(/:$/.test(gen[j]))gen.splice(j,1);break}
      cur={i:h.i,src:strip(h.rest),extra:[]};days.push(cur);need=!cur.src;continue}
    var s=strip(raw);
    if(cur){if(!s){if(need)continue;cur=null;gen.push('');continue}if(need){cur.src=s;need=false;continue}cur.extra.push(genLine(raw));continue}
    gen.push(s?genLine(raw):'')}
  var g=gen.join('\n').replace(/\n{3,}/g,'\n\n').trim();
  return {days:days.filter(function(d){return d.src}).map(function(d){var t=tidy(d.src),full=strip(d.src),ex=d.extra.join('\n');if(full.length>500)ex=full+(ex?'\n'+ex:'');
    return {i:d.i,day:DAYS[d.i],date:addDays(start,d.i),title:t,extra:ex,on:true}}),general:cut(g,MAX_GEN)}}
window.e99ColarParse=parse;

function isAuxNow(){return typeof window.isAux==='function'&&window.isAux()}
function logged(){try{return !!authSession}catch(x){return false}}
var M=null,busy=false,timer=0;
function dlg(){var d=D.getElementById('colar-dlg');if(!d){d=D.createElement('dialog');d.id='colar-dlg';d.setAttribute('aria-labelledby','cp-title');D.body.appendChild(d);
    d.addEventListener('input',onInput);d.addEventListener('change',onChange);d.addEventListener('submit',function(ev){ev.preventDefault();window.colarPlanoSave()});
    d.addEventListener('close',function(){M=null})}return d}
function owners(){var seen={TODOS:1},out=['TODOS'];try{(state.team||[]).forEach(function(p){var n=p&&typeof p.name==='string'?p.name.trim().slice(0,200):'';if(n&&!seen[n.toUpperCase()]){seen[n.toUpperCase()]=1;out.push(n)}})}catch(x){}return out}
function fmt(iso){return String(iso||'').split('-').reverse().join('/')}
function weekday(iso){var p=String(iso||'').split('-');if(p.length!==3)return '';return new Date(+p[0],+p[1]-1,+p[2],12).toLocaleDateString('pt-BR',{weekday:'long'})}
function warn(){var w=D.getElementById('cp-warn');if(!w||!M)return;var p=String(M.start).split('-'),bad=p.length===3&&new Date(+p[0],+p[1]-1,+p[2],12).getDay()!==1;
  w.hidden=!bad;w.textContent=bad?'Atenção: '+fmt(M.start)+' é '+weekday(M.start)+'. A SEGUNDA da mensagem vai cair nesse dia.':''}
function count(){return M?M.rows.filter(function(r){return r.on&&r.title.trim()}).length:0}
function foot(){var b=D.getElementById('cp-save');if(!b)return;var n=count();b.disabled=!n||busy;b.textContent=busy?'Criando…':n?'Criar '+n+(n===1?' dia':' dias')+' no Plano':'Criar no Plano'}
function preview(){var box=D.getElementById('cp-prev');if(!box||!M)return;
  if(!M.text.trim()){box.innerHTML='';foot();return}
  if(!M.rows.length){box.innerHTML='<p class="cp-empty small">Não achei os dias na mensagem. Ela precisa ter SEGUNDA, TERÇA, QUARTA, QUINTA, SEXTA, SÁBADO ou DOMINGO no começo da linha (ex.: “SEGUNDA-FEIRA: Mutirão…”).</p>';foot();return}
  var h='<h3>Prévia · '+M.rows.length+(M.rows.length===1?' dia':' dias')+'</h3><p class="small">Confira e ajuste antes de criar. Desmarque o dia que não quiser.</p><ol class="cp-list">';
  M.rows.forEach(function(r,i){h+='<li class="cp-row'+(r.on?'':' off')+'"><div class="cp-head"><input type="checkbox" class="cp-on" data-i="'+i+'"'+(r.on?' checked':'')+' aria-label="Criar '+esc(r.day)+'"><b>'+esc(r.day)+'</b><input type="date" class="cp-date" data-i="'+i+'" value="'+esc(r.date)+'" aria-label="Data de '+esc(r.day)+'"></div>'
    +'<textarea class="cp-t" data-i="'+i+'" maxlength="500" rows="'+Math.max(2,Math.min(5,Math.ceil(r.title.length/40)))+'" aria-label="Atividade de '+esc(r.day)+'">'+esc(r.title)+'</textarea></li>'});
  h+='</ol>';
  if(M.general)h+='<details class="cp-gen"'+(M.incl?'':' hidden')+'><summary>Orientações gerais que vão na descrição ('+M.general.length+' de '+MAX_GEN+' letras)</summary><textarea id="cp-general" maxlength="'+MAX_GEN+'" aria-label="Orientações gerais">'+esc(M.general)+'</textarea></details>';
  box.innerHTML=h;foot()}
function reparse(){if(!M)return;var r=parse(M.text,M.start);M.rows=r.days;M.general=r.general;preview()}
function onInput(ev){var t=ev.target;if(!M||!t)return;
  if(t.id==='cp-text'){M.text=t.value;clearTimeout(timer);timer=setTimeout(reparse,180);return}
  if(t.id==='cp-general'){M.general=t.value.slice(0,MAX_GEN);return}
  if(t.classList&&t.classList.contains('cp-t')){var r=M.rows[+t.dataset.i];if(r){r.title=t.value.slice(0,500);foot()}}}
function onChange(ev){var t=ev.target;if(!M||!t)return;
  if(t.id==='cp-start'){if(validDate(t.value)){M.start=t.value;M.rows.forEach(function(r){r.date=addDays(M.start,r.i)});preview()}warn();return}
  if(t.id==='cp-owner'){M.owner=t.value;return}
  if(t.id==='cp-incl'){M.incl=t.checked;var g=D.querySelector('#colar-dlg details.cp-gen');if(g)g.hidden=!M.incl;return}
  var r=M.rows[+(t.dataset&&t.dataset.i)];if(!r)return;
  if(t.classList.contains('cp-on')){r.on=t.checked;var li=t.closest('.cp-row');if(li)li.classList.toggle('off',!r.on);foot()}
  else if(t.classList.contains('cp-date')){if(validDate(t.value))r.date=t.value}}

window.colarPlanoOpen=function(){if(!logged()||isAuxNow())return;var d=dlg();M={text:'',rows:[],general:'',start:nextMonday(),owner:'TODOS',incl:true};busy=false;
  d.innerHTML='<form novalidate><div class="formhead"><h2 id="cp-title">Colar planejamento da semana</h2><button type="button" aria-label="Fechar" onclick="colarPlanoClose()">✕</button></div>'
   +'<p class="small">Cole a mensagem do WhatsApp com o planejamento. O app acha SEGUNDA, TERÇA, QUARTA… e cria um plano para cada dia.</p>'
   +'<label>Mensagem do planejamento<textarea id="cp-text" maxlength="20000" placeholder="Cole aqui a mensagem inteira"></textarea></label>'
   +'<div class="cp-opts"><label>Semana começando na segunda<input type="date" id="cp-start" required value="'+esc(M.start)+'"></label>'
   +'<label>Responsável<select id="cp-owner">'+owners().map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>'}).join('')+'</select></label></div>'
   +'<p class="small cp-warn" id="cp-warn" role="status" hidden></p>'
   +'<label class="cp-check"><input type="checkbox" id="cp-incl" checked> Incluir as orientações gerais na descrição</label>'
   +'<div id="cp-prev" aria-live="polite"></div>'
   +'<div class="formfoot"><button type="button" onclick="colarPlanoClose()">Cancelar</button><button type="submit" class="primary" id="cp-save" disabled>Criar no Plano</button></div></form>';
  warn();if(!d.open)try{d.showModal()}catch(x){d.setAttribute('open','')}
  setTimeout(function(){var t=D.getElementById('cp-text');if(t)try{t.focus({preventScroll:true})}catch(x){}},60)};
window.colarPlanoClose=function(){var d=D.getElementById('colar-dlg');if(d&&d.open)try{d.close()}catch(x){d.removeAttribute('open')}M=null};

window.colarPlanoSave=async function(){if(!M||busy)return;if(!logged()||isAuxNow()){notify('Só o gestor cria planos.');return}
  clearTimeout(timer);var tx=D.getElementById('cp-text');if(tx&&tx.value!==M.text){M.text=tx.value;reparse()}
  var rows=M.rows.filter(function(r){return r.on&&r.title.trim()&&validDate(r.date)});if(!rows.length){notify('Marque pelo menos um dia com atividade.');return}
  var owner=String(M.owner||'TODOS').trim().slice(0,200)||'TODOS',gen=M.incl?String(M.general||'').trim():'';
  var plans=(state.plans||[]).slice(),added={},skipped=0,full=0;
  rows.forEach(function(r){var t=r.title.trim().slice(0,500),k=norm(t);
    if(plans.some(function(p){return p.date===r.date&&(p.activities||[]).some(function(a){return norm(a.title)===k})})){skipped++;return}
    var act={id:uid(),title:t,owner:owner,notes:cut([r.extra||'',gen].filter(Boolean).join('\n\n'),3000),photos:[]};
    var i=-1;plans.forEach(function(p,j){if(i<0&&p.date===r.date&&p.title===TITLE&&(p.activities||[]).length<100)i=j});
    if(i>=0)plans[i]=Object.assign({},plans[i],{activities:plans[i].activities.concat(act)});
    else{if(plans.length>=500){full++;return}plans.push({id:uid(),title:TITLE,date:r.date,activities:[act]})}
    added[r.date]=1});
  var n=Object.keys(added).length;
  if(!n){notify(full?'Limite de 500 planos atingido. Apague planos antigos.':'Nada novo: '+(skipped===1?'esse dia já estava':'esses dias já estavam')+' no Plano.');return}
  busy=true;foot();
  try{validatePlans(plans);state.plans=plans;await save()}catch(e){busy=false;foot();notify(e&&e.message||'Não deu para salvar.');return}
  busy=false;window.colarPlanoClose();try{planFilter=''}catch(x){}
  if(typeof go==='function')go('plans');else render();
  var msg=n+(n===1?' dia criado':' dias criados')+' no Plano.';
  if(skipped)msg+=' '+skipped+(skipped===1?' já existia e foi pulado.':' já existiam e foram pulados.');
  if(full)msg+=' Limite de 500 planos: '+full+' ficou de fora.';
  if(typeof storageOK!=='undefined'&&!storageOK)msg+=' Ficou só na memória: exporte uma cópia em Minha conta.';
  notify(msg)};

/* botão no topo do Plano (vai para "Mais ações"); auxiliar não vê */
var rp=window.renderPlans;if(typeof rp==='function'){window.renderPlans=function(){var h=rp.apply(this,arguments);
  try{var draft=typeof planDraft!=='undefined'&&planDraft;if(!draft&&logged()&&!isAuxNow()&&typeof h==='string'&&h.indexOf('colarPlanoOpen')<0)
    h=h.replace('onclick="openPlan()">＋ Novo plano</button>','onclick="openPlan()">＋ Novo plano</button><button type="button" onclick="colarPlanoOpen()">📅 Colar planejamento da semana</button>')}catch(x){}return h}}
})();
