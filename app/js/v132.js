
/* v132 · (1) conferir a nota pelo XML (itens com EAN na NF; comparação no relatório da conferência, no conf-js)
   (2) busca geral (topo; Ctrl+K ou "/" no PC) · (3) histórico da nota (quem, quando, o quê; até 30 por nota; vai junto com a NF pelo sync)
   (4) planos que se repetem toda semana (id determinístico; só gestor/estoque configuram) · (5) cabeçalho fixo das NFs no PC · (6) Início com o que pede ação hoje */
(function(){'use strict';var D=document,W=window;
function aux(){return !!(W.isAux&&W.isAux())}
function me(){try{var t=W.e99Team&&W.e99Team.get();if(t&&t.name)return String(t.name).slice(0,60)}catch(x){}return authSession?String(authSession.record.login).slice(0,60):''}
function two(n){return ('0'+n).slice(-2)}
function brDate(d){d=String(d||'');var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(d);return m?m[3]+'/'+m[2]+'/'+m[1]:d}
function brTime(ms){var d=new Date(ms);return isNaN(d)?'':two(d.getDate())+'/'+two(d.getMonth()+1)+'/'+d.getFullYear()+' '+two(d.getHours())+':'+two(d.getMinutes())}
W.e99BrDate=brDate;
var WD=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];

/* ================= (3) histórico da nota ================= */
var HMAX=30;
function cleanHist(h){if(!Array.isArray(h))return null;var out=[];h.slice(-200).forEach(function(e){if(Array.isArray(e)&&Number.isSafeInteger(e[0])&&e[0]>0&&typeof e[1]==='string'&&typeof e[2]==='string'&&e[2].trim())out.push([e[0],e[1].slice(0,60),e[2].slice(0,160)])});return out.slice(-HMAX)}
var vx=nfValidateExtras;nfValidateExtras=function(n){var r=vx.apply(this,arguments);if(n&&typeof n==='object'&&'hist' in n){var h=cleanHist(n.hist);if(h&&h.length)n.hist=h;else delete n.hist}return r};
function h32(str){var h=0x811c9dc5;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function fields(n){return {number:String(n.number||''),supplier:String(n.supplier||''),status:String(n.status||''),volumes:Number(n.volumes)||0,owner:String(n.owner||''),notes:String(n.notes||''),date:String(n.date||''),arrivalTime:String(n.arrivalTime||''),accessKey:String(n.accessKey||''),items:Array.isArray(n.items)?n.items.length:0}}
var snap=new Map();
var snapFor=null;function takeSnap(){snapFor=authSession;snap=new Map();(state.nfs||[]).forEach(function(n){if(n&&n.id)snap.set(n.id,{f:fields(n),h:Array.isArray(n.hist)?n.hist.slice():null})})}
var LBL={number:'número',supplier:'fornecedor',notes:'observações',date:'data de chegada',arrivalTime:'hora de chegada',accessKey:'chave de acesso'};
function nameOf(id){try{return owner(id)}catch(x){return id||'A definir'}}
function diffText(a,b){var parts=[],other=[];if(a.status!==b.status)parts.push('Status: '+(a.status||'—')+' → '+b.status);if(a.volumes!==b.volumes)parts.push('Volumes: '+a.volumes+' → '+b.volumes);if(a.owner!==b.owner)parts.push('Conferido por: '+nameOf(a.owner)+' → '+nameOf(b.owner));
  if(a.items!==b.items)parts.push(b.items?'Importou '+(b.items===1?'1 item':b.items+' itens')+' do XML':'Tirou os itens do XML');
  Object.keys(LBL).forEach(function(k){if(a[k]!==b[k])other.push(LBL[k])});if(other.length)parts.push('Editou '+other.join(', '));return parts.join('; ').slice(0,160)}
function synced(n){try{var m=state.sync&&state.sync.meta&&state.sync.meta.nfs&&state.sync.meta.nfs[n.id];return !!(m&&!m[2]&&m[3]&&m[3]===h32(JSON.stringify(n)))}catch(x){return false}}
function record(){if(!authSession||!Array.isArray(state.nfs))return;if(snapFor!==authSession){takeSnap();return}var now=Date.now(),who=me(),fresh=state.nfs.filter(function(n){return n&&n.id&&!snap.has(n.id)}).length;
  state.nfs.forEach(function(n){if(!n||!n.id)return;var s=snap.get(n.id),f=fields(n);
    if(!s){if(synced(n)||fresh>5)return;var h=cleanHist(n.hist)||[];if(!h.length){h.push([now,String(n.cby||who).slice(0,60),'Criou a nota'+(n.xmlKey?' pelo XML':'')]);n.hist=h}return}
    if(!Array.isArray(n.hist)&&s.h&&s.h.length)n.hist=s.h.slice();
    if(synced(n))return;if(JSON.stringify(n.hist||null)!==JSON.stringify(s.h||null)&&Array.isArray(n.hist)&&n.hist.length>(s.h?s.h.length:0))return;
    var t=diffText(s.f,f);if(!t)return;var h2=cleanHist(n.hist)||[];h2.push([now,who,t]);n.hist=h2.slice(-HMAX)});
  takeSnap()}
var sv=save;save=async function(){try{record()}catch(x){}return sv.apply(this,arguments)};
W.e99NfHist=function(id){var n=(state.nfs||[]).find(function(x){return x.id===id});return n&&Array.isArray(n.hist)?n.hist.slice():[]};
function histHtml(n){var h=Array.isArray(n.hist)?n.hist:[];return '<details class="e99-hist" id="e99-hist"><summary>Histórico ('+h.length+')</summary>'+(h.length?'<ol>'+h.slice().reverse().map(function(e){return '<li>'+esc(e[2])+'<small>'+esc(brTime(e[0]))+' · '+esc(e[1]||'—')+'</small></li>'}).join('')+'</ol>':'<p class="small">Ainda sem registros. As próximas mudanças aparecem aqui.</p>')+'</details>'}
var oe=openEditor;openEditor=function(kind,id){var r=oe.apply(this,arguments);try{if(kind==='nf'&&id&&editing&&editing.id===id){var n=(state.nfs||[]).find(function(x){return x.id===id}),f=D.getElementById('fields');if(n&&f&&!f.querySelector('#e99-hist')){var w=D.createElement('div');w.innerHTML=histHtml(n);var del=f.querySelector(':scope > button.danger');if(del)f.insertBefore(w.firstChild,del);else f.appendChild(w.firstChild)}}}catch(x){}return r};

/* ================= (4) planos que se repetem toda semana ================= */
function wdOf(d){var x=new Date(d+'T12:00:00');return isNaN(x)?0:x.getDay()}
function repOk(r){return r&&typeof r==='object'&&Number.isInteger(r.d)&&r.d>=0&&r.d<=6}
var vp=validatePlans;validatePlans=function(plans){if(Array.isArray(plans))plans.forEach(function(p){if(!p||typeof p!=='object')return;if('rep' in p){if(repOk(p.rep))p.rep={d:p.rep.d};else delete p.rep}if('repOf' in p&&!safePlanId(p.repOf))delete p.repOf});return vp.apply(this,arguments)};
function sidOf(p){return p.repOf||p.id}
W.e99RepSet=function(on){if(!planDraft||aux())return;if(on)planDraft.rep={d:wdOf(planDraft.date)};else delete planDraft.rep;planDraftDirty=true;var s=D.getElementById('e99-rep-d');if(s){s.disabled=!on;if(on)s.value=String(planDraft.rep.d)}};
W.e99RepDay=function(v){if(!planDraft||aux()||!planDraft.rep)return;var d=+v;if(d>=0&&d<=6){planDraft.rep={d:d};planDraftDirty=true}};
function repHtml(){var p=planDraft;if(!p||aux())return '';var on=repOk(p.rep),d=on?p.rep.d:wdOf(p.date);
  return '<div class="e99-rep"><label class="e99-check"><input type="checkbox" id="e99-rep-on"'+(on?' checked':'')+' onchange="e99RepSet(this.checked)">Repetir toda semana</label><label>Dia da semana<select id="e99-rep-d" onchange="e99RepDay(this.value)"'+(on?'':' disabled')+'>'+WD.map(function(n,i){return '<option value="'+i+'"'+(i===d?' selected':'')+'>'+n+'</option>'}).join('')+'</select></label><p class="small" style="margin:0">O app cria sozinho o plano da próxima semana, com as mesmas atividades (sem fotos e sem marcar feito). Desmarque para parar.</p></div>'}
var rpe=renderPlanEditor;renderPlanEditor=function(){var h=rpe.apply(this,arguments);try{var x=repHtml();if(x){var i=h.indexOf('<p class="small">Até 5 fotos');if(i>0)h=h.slice(0,i)+x+h.slice(i)}}catch(e){}return h};
var spv=savePlan;savePlan=async function(ev){try{if(planDraft&&authSession){var old=planById(planDraft.id);
    if(aux()){if(old&&repOk(old.rep))planDraft.rep={d:old.rep.d};else delete planDraft.rep;if(old&&old.repOf)planDraft.repOf=old.repOf}
    else{var sid=sidOf(old||planDraft),on=repOk(planDraft.rep);(state.plans||[]).forEach(function(p){if(p.id!==planDraft.id&&sidOf(p)===sid){if(on)p.rep={d:planDraft.rep.d};else delete p.rep}})}}}catch(x){}
  var r=await spv.apply(this,arguments);try{if(!planDraft)runRep()}catch(x){}return r};
function addDays(d,n){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return iso(x)}
function genRep(){if(!authSession||aux()||!Array.isArray(state.plans))return [];var today=iso(),lim=addDays(today,7),series={},out=[],skip=skips();
  state.plans.forEach(function(p){if(p&&p.id){var k=sidOf(p);(series[k]=series[k]||[]).push(p)}});
  Object.keys(series).forEach(function(sid){var l=series[sid].slice().sort(function(a,b){return a.date.localeCompare(b.date)}),last=l[l.length-1];if(!repOk(last.rep))return;
    var c=addDays(last.date,1);while(wdOf(c)!==last.rep.d)c=addDays(c,1);if(c<today){c=today;while(wdOf(c)!==last.rep.d)c=addDays(c,1)}
    if(c>lim||l.some(function(p){return p.date===c}))return;var id=(sid+'-w'+c.replace(/-/g,'')).slice(0,100);if(!safePlanId(id)||skip.indexOf(id)>=0||state.plans.some(function(p){return p.id===id})||out.some(function(p){return p.id===id}))return;
    var np={id:id,title:last.title,date:c,repOf:sid,rep:{d:last.rep.d},activities:last.activities.map(function(a){var n={id:a.id,title:a.title,owner:a.owner||'',notes:a.notes||'',photos:[]};if(a.time)n.time=a.time;if(a.demanda)n.demanda=a.demanda;return n})};
    ['cby','cdev','clogin'].forEach(function(k){if(last[k])np[k]=last[k]});out.push(np)});return out}
function skipKey(){return 'lojasg.estoque99.rep-skip:'+(authSession?authSession.storeKey:'')}
function skips(){try{var a=JSON.parse(localStorage.getItem(skipKey())||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
var dp=deletePlan;deletePlan=async function(id){var p=planById(id),was=!!p;var r=await dp.apply(this,arguments);try{if(was&&p.repOf&&!planById(id)){var a=skips();if(a.indexOf(id)<0)a.push(id);localStorage.setItem(skipKey(),JSON.stringify(a.slice(-200)))}}catch(e){}return r};
var repBusy=false;async function runRep(){if(repBusy)return 0;var add=genRep();if(!add.length)return 0;var next=(state.plans||[]).concat(add);if(next.length>500)return 0;try{validatePlans(JSON.parse(JSON.stringify(next)))}catch(e){return 0}
  repBusy=true;try{state.plans=next;await save();if(page==='plans'||page==='home')render()}finally{repBusy=false}return add.length}
W.e99RepRun=runRep;
var repT=0;function repTick(){if(!authSession||aux()||planDraft)return;var n=Date.now();if(n-repT<60000)return;repT=n;setTimeout(function(){runRep().catch(function(){})},50)}
function repDeco(){if(page!=='plans'||planDraft)return;var seen={};D.querySelectorAll('#view .plan-card [onclick*="Plan(\'"]').forEach(function(b){var m=/Plan\('([^']+)'/.exec(b.getAttribute('onclick')||'');if(!m||seen[m[1]])return;seen[m[1]]=1;var p=planById(m[1]),card=b.closest('.plan-card'),pill=card&&card.querySelector('.pill');if(!p||!repOk(p.rep)||!pill||card.querySelector('.e99-rep-pill'))return;var s=D.createElement('span');s.className='pill e99-rep-pill';s.textContent='Repete '+(p.rep.d===0?'todo domingo':p.rep.d===6?'todo sábado':'toda '+WD[p.rep.d]+'-feira');pill.after(s)})}

/* ================= (6) Início: o que pede ação hoje ================= */
stats=function(){var a=aux(),acts=todayActs(),todo=acts.filter(function(x){return !x.a.done}).length,al=[];try{al=collectAlerts()}catch(x){}
  var late=al.filter(function(x){return x.kind==='act'}).length,nfLate=al.filter(function(x){return x.kind==='nf'}).length,div=(state.nfs||[]).filter(function(n){return n.status==='Em divergência'}).length;
  var cards=[[todo,'Para fazer hoje',todo?'atividades do plano de hoje':acts.length?'Tudo feito hoje':'Nenhum plano para hoje',"planFilter=iso();go('plans')",'Ver plano de hoje'],
    [late,'Atrasadas',late?'passaram do horário ou ficaram de ontem':'Nenhuma atividade atrasada',a?"go('plans')":"go('alerts')",'Ver prazos'],
    [nfLate,'Notas paradas',nfLate?'esperando conferência além do prazo':'Nenhuma nota fora do prazo',"nfStatusFilter='';go('nfs')",'Conferir notas'],
    [div,'Divergências a resolver',div?'notas com falta, sobra ou avaria':'Nenhuma divergência aberta',"nfStatusFilter='Em divergência';go('nfs')",'Resolver']];
  return '<div class="stats e99-todo" aria-label="O que pede ação hoje">'+cards.map(function(c){return '<div class="stat e99-go'+(c[0]?'':' e99-zero')+'" role="button" tabindex="0" data-go="'+esc(c[3])+'" aria-label="'+esc(c[1]+': '+c[0]+'. '+c[2])+'"><strong>'+c[0]+'</strong><span>'+esc(c[1])+'</span><small class="small">'+esc(c[2])+'</small>'+(c[0]?'<span class="e99-go-l" aria-hidden="true">'+esc(c[4])+' →</span>':'')+'</div>'}).join('')+'</div>'};
var GO={"planFilter=iso();go('plans')":function(){planFilter=iso();go('plans')},"go('plans')":function(){go('plans')},"go('alerts')":function(){go('alerts')},"nfStatusFilter='';go('nfs')":function(){nfStatusFilter='';go('nfs')},"nfStatusFilter='Em divergência';go('nfs')":function(){nfStatusFilter='Em divergência';go('nfs')}};
function goCard(el){var f=GO[el.getAttribute('data-go')];if(f)f()}
D.addEventListener('click',function(e){var c=e.target&&e.target.closest&&e.target.closest('#view .stats>.stat.e99-go');if(c)goCard(c)});
D.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.matches&&e.target.matches('#view .stats>.stat.e99-go')){e.preventDefault();goCard(e.target)}});

/* ================= (2) busca geral ================= */
var IC='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
function nt(v){return normalText(v)}
function dig(v){return String(v||'').replace(/\D/g,'')}
function hit(q,qd,parts,digits){var t=nt(parts.join(' '));if(q.split(' ').every(function(w){return t.indexOf(w)>=0}))return true;return qd.length>=3&&digits.some(function(x){return dig(x).indexOf(qd)>=0})}
function find(raw){var q=nt(raw),qd=dig(raw),out={nfs:[],plans:[],corr:[],team:[]};if(!q||!authSession)return out;var a=aux();
  (state.nfs||[]).forEach(function(n){if(hit(q,qd,[n.number,n.supplier,n.cnpj,n.accessKey,n.status,'nf '+n.number],[n.number,n.cnpj,n.accessKey]))out.nfs.push(n)});
  out.nfs.sort(function(x,y){return (y.date||'').localeCompare(x.date||'')});
  (state.plans||[]).forEach(function(p){var acts=(p.activities||[]).filter(function(x){return hit(q,'',[x.title,x.owner,x.notes],[])});if(acts.length||hit(q,'',[p.title,brDate(p.date)],[]))out.plans.push({p:p,acts:acts})});
  out.plans.sort(function(x,y){return y.p.date.localeCompare(x.p.date)});
  if(!a){(state.corridors||[]).forEach(function(c){if(hit(q,'',['corredor '+c.number,c.sector,c.products||'',nameOf(c.owner)],[]))out.corr.push(c)});
    (state.team||[]).forEach(function(t){if(hit(q,'',[t.name,t.role],[]))out.team.push(t)})}
  return out}
W.e99Find=function(q){var r=find(q);return {nfs:r.nfs.map(function(n){return n.id}),plans:r.plans.map(function(x){return x.p.id}),corridors:r.corr.map(function(c){return c.id}),team:r.team.map(function(t){return t.id})}};
var dlg=null,LIM=8;
function ensure(){if(dlg)return dlg;dlg=D.createElement('dialog');dlg.id='e99-search';dlg.setAttribute('aria-label','Busca geral');
  dlg.innerHTML='<div class="sx-top">'+IC.replace('<svg','<svg width="20" height="20"')+'<input id="e99-sx-q" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" aria-label="Buscar notas, planos, corredores e pessoas" placeholder="Nota, fornecedor, CNPJ, plano, pessoa…"><button type="button" id="e99-sx-x" aria-label="Fechar busca">Fechar</button></div><div class="sx-res" id="e99-sx-res" role="region" aria-live="polite"></div>';
  D.body.appendChild(dlg);var T=0;D.getElementById('e99-sx-q').addEventListener('input',function(){clearTimeout(T);T=setTimeout(paint,120)});
  D.getElementById('e99-sx-q').addEventListener('keydown',function(e){if(e.key==='Enter'){var b=dlg.querySelector('.sx-it');if(b){e.preventDefault();b.click()}}});
  D.getElementById('e99-sx-x').addEventListener('click',close);dlg.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}});dlg.addEventListener('click',function(e){if(e.target===dlg){close();return}var b=e.target.closest&&e.target.closest('.sx-it');if(b)pick(b.getAttribute('data-k'),b.getAttribute('data-id'),b.getAttribute('data-a'))});return dlg}
function group(title,rows,total,more){return rows.length?'<div class="sx-g">'+esc(title)+' ('+total+')</div>'+rows.join('')+(total>rows.length?'<p class="small" style="margin:4px 2px">e mais '+(total-rows.length)+'. '+esc(more)+'</p>':''):''}
function item(k,id,title,sub,a){return '<button type="button" class="sx-it" data-k="'+k+'" data-id="'+esc(id)+'"'+(a?' data-a="'+esc(a)+'"':'')+'><b>'+esc(title)+'</b><small>'+esc(sub)+'</small></button>'}
function paint(){var box=D.getElementById('e99-sx-res'),q=D.getElementById('e99-sx-q').value;if(!nt(q)){box.innerHTML='<p class="sx-empty">Digite para buscar notas (número, fornecedor, CNPJ ou chave), planos e atividades'+(aux()?'':', corredores e pessoas da equipe')+'.</p>';return}
  var r=find(q),h=group('Notas fiscais',r.nfs.slice(0,LIM).map(function(n){return item('nf',n.id,'NF '+n.number+(n.supplier?' · '+n.supplier:''),n.status+' · chegada '+brDate(n.date)+(n.cnpj?' · CNPJ '+n.cnpj:''))}),r.nfs.length,'Refine a busca.')
   +group('Planos e atividades',r.plans.slice(0,LIM).map(function(x){var a=x.acts[0];return item('plan',x.p.id,a?a.title:x.p.title,(a?x.p.title+' · ':'')+brDate(x.p.date)+(a&&a.owner?' · '+a.owner:''),a?a.id:'')}),r.plans.length,'Refine a busca.')
   +group('Corredores',r.corr.slice(0,LIM).map(function(c){return item('corridor',c.id,'Corredor '+c.number+' · '+c.sector,'Responsável: '+nameOf(c.owner))}),r.corr.length,'Refine a busca.')
   +group('Equipe',r.team.slice(0,LIM).map(function(t){return item('person',t.id,t.name,t.role||'')}),r.team.length,'Refine a busca.');
  box.innerHTML=h||'<p class="sx-empty">Nada encontrado para “'+esc(q.trim())+'”.</p>'}
function close(){if(dlg&&dlg.open)dlg.close()}
function flash(sel){setTimeout(function(){var el=D.querySelector(sel);if(!el)return;el.scrollIntoView({block:'center'});el.classList.add('e99-flash');setTimeout(function(){el.classList.remove('e99-flash')},2200)},120)}
function pick(k,id,a){close();if(k==='nf'){var n=(state.nfs||[]).find(function(x){return x.id===id});if(!n)return;nfStatusFilter='';go('nfs');if(aux()&&!(W.e99Mine&&W.e99Mine(n))){nfQuery=String(n.number);refreshNFs();var s=D.querySelector('#view input[name="nf-busca"]');if(s)s.value=nfQuery;try{nfToggle(id,true)}catch(x){}flash('#nf-results tbody tr');return}try{nfReveal(id)}catch(x){}openEditor('nf',id)}
  else if(k==='plan'){var p=planById(id);if(!p)return;planFilter=p.date;go('plans');flash('#view .plan-card [onclick*="\''+id.replace(/[^a-zA-Z0-9_-]/g,'')+'\'"]')}
  else if(k==='corridor'&&!aux()){go('corridors');openEditor('corridor',id)}else if(k==='person'&&!aux()){go('team');openEditor('person',id)}}
function open(){if(!authSession)return;ensure();if(!dlg.open)dlg.showModal();var i=D.getElementById('e99-sx-q');i.focus();i.select();paint()}
W.e99Search={open:open,close:close};
function addBtn(){var tb=D.querySelector('header .toolbar');if(!tb||tb.querySelector('.e99-search-btn'))return;var b=D.createElement('button');b.type='button';b.className='e99-search-btn';b.setAttribute('aria-label','Buscar (Ctrl+K)');b.setAttribute('aria-keyshortcuts','Control+K /');b.innerHTML=IC+'<span class="lbl">Buscar</span><kbd>Ctrl K</kbd>';b.addEventListener('click',open);tb.insertBefore(b,tb.firstChild)}
D.addEventListener('keydown',function(e){if(!authSession||e.defaultPrevented)return;var k=String(e.key||'').toLowerCase();
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&k==='k'){e.preventDefault();open();return}
  if(k==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){var t=e.target,ed=t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));if(ed||(typeof modal!=='undefined'&&modal.open)||D.querySelector('dialog[open]'))return;e.preventDefault();open()}});

/* ================= (5) cabeçalho fixo da tabela de NFs no PC ================= */
function headH(){var h=D.querySelector('header');if(!h)return 0;var cs=getComputedStyle(h);if(cs.position!=='sticky'&&cs.position!=='fixed')return 0;var r=h.getBoundingClientRect();return Math.max(0,Math.round(r.bottom))}
function sticky(){try{var r=D.getElementById('nf-results'),pn=r&&r.closest('.panel');if(pn)pn.classList.add('e99-nfpanel');D.documentElement.classList.add('e99-sticky');D.documentElement.style.setProperty('--e99-head',headH()+'px')}catch(x){}}

/* ================= ganchos ================= */
var rb=render;render=function(){var r=rb.apply(this,arguments);try{if(authSession){takeSnap();addBtn();repDeco();if(page==='nfs')sticky();if(page==='home'||page==='plans')repTick()}}catch(x){}return r};
addBtn();
})();
