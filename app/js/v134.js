
/* v134 · (1) Relatório da semana no Painel (gestor/estoque): janela no app + "Salvar em PDF" pela impressão do navegador (folha branca)
   e resumo semanal em texto pelo mesmo envio do "Relatório por e-mail" (FormSubmit), só no aparelho do gestor, 1× por semana (marcador; dá para desligar)
   (2) Fornecedores no Painel: notas, % com divergência, tempo médio até conferir e valor (auxiliar não vê valores); ordenável; toque abre as notas do fornecedor. */
(function(){'use strict';var D=document,W=window;
function aux(){return !!(W.isAux&&W.isAux())}
function role(){return authSession&&authSession.payload?authSession.payload.role:''}
function two(n){return ('0'+n).slice(-2)}
function br(k){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(k||''));return m?m[3]+'/'+m[2]+'/'+m[1]:''}
function brS(k){return br(k).slice(0,5)}
function brTime(ms){var d=new Date(ms);return isNaN(d)?'':two(d.getDate())+'/'+two(d.getMonth()+1)+'/'+d.getFullYear()+' '+two(d.getHours())+':'+two(d.getMinutes())}
function addDays(k,n){var d=new Date(k+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
function mondayOf(k){var d=new Date((k||iso())+'T12:00:00'),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return iso(d)}
function money(v){return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function num(v){return Number(v).toLocaleString('pt-BR')}
function pl(n,a,b){return n+' '+(n===1?a:b)}
function ever(n,st){return n.status===st||(Array.isArray(n.hist)&&n.hist.some(function(h){return Array.isArray(h)&&new RegExp('→ '+st+'$').test(String(h[2]||''))}))}
function dateOfMs(ms){var d=new Date(ms);return isNaN(d)?'':iso(d)}
function store(){return authSession&&authSession.payload?String(authSession.payload.store||'Estoque 99'):'Estoque 99'}
var ST=['Pendente','Em conferência','Em divergência','Conferido'];

/* ===================== tempo até conferir ===================== */
function startMs(n){var d=String(n.date||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return NaN;if(/^\d{2}:\d{2}$/.test(n.arrivalTime||''))return new Date(d+'T'+n.arrivalTime+':00').getTime();
  var h=Array.isArray(n.hist)&&n.hist[0];if(h&&dateOfMs(h[0])===d)return h[0];return new Date(d+'T00:00:00').getTime()}
function doneMs(n){if(n.status!=='Conferido')return NaN;var t=NaN;(Array.isArray(n.hist)?n.hist:[]).forEach(function(h){if(Array.isArray(h)&&/→ Conferido$/.test(String(h[2]||''))&&!(t<=h[0]))t=h[0]});
  if(isNaN(t))(state.confs||[]).forEach(function(c){if(c.nf===n.id&&c.status==='finalizada'&&c.end){var e=Date.parse(c.end);if(!isNaN(e)&&!(t>=e))t=e}});return t}
function hoursToCheck(n){var a=startMs(n),b=doneMs(n);return isNaN(a)||isNaN(b)||b<a?NaN:(b-a)/3600000}
function fmtHours(h){if(h==null||isNaN(h))return '—';if(h<1)return 'menos de 1 h';if(h<48)return Math.round(h)+' h';var d=Math.round(h/24*10)/10;return String(d).replace('.',',')+' dias'}

/* ===================== (2) fornecedores ===================== */
function supName(s){return normalText(s).replace(/[^a-z0-9 ]+/g,' ').replace(/\b(ltda|me|epp|sa|s a|eireli|cia)\b/g,' ').replace(/\s+/g,' ').trim()}
function cnpjOf(n){var c=String(n.cnpj||'').replace(/\D/g,'');return c.length===14?c:''}
function fmtCnpj(c){return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,'$1.$2.$3/$4-$5')}
function groups(list){var byName={};list.forEach(function(n){var c=cnpjOf(n),s=supName(n.supplier);if(c&&s&&!byName[s])byName[s]=c});
  var g={};list.slice().sort(function(a,b){return String(a.date||'').localeCompare(String(b.date||''))}).forEach(function(n){var c=cnpjOf(n),s=supName(n.supplier),k=c?'c:'+c:s&&byName[s]?'c:'+byName[s]:s?'n:'+s:'n:';
    var x=g[k]||(g[k]={key:k,cnpj:k.indexOf('c:')===0?k.slice(2):'',label:'',nfs:[],div:0,hrs:[],val:0,hasVal:0});x.nfs.push(n);if(String(n.supplier||'').trim())x.label=String(n.supplier).trim().slice(0,120);
    if(ever(n,'Em divergência'))x.div++;var h=hoursToCheck(n);if(!isNaN(h))x.hrs.push(h);if(/^\d{1,13}(\.\d{1,2})?$/.test(String(n.totalValue||''))){x.val+=Number(n.totalValue);x.hasVal++}});
  return Object.keys(g).map(function(k){var x=g[k];x.n=x.nfs.length;x.pdiv=x.n?x.div/x.n*100:0;x.avg=x.hrs.length?x.hrs.reduce(function(a,b){return a+b},0)/x.hrs.length:NaN;if(!x.label)x.label=x.cnpj?'CNPJ '+fmtCnpj(x.cnpj):'Sem fornecedor';return x})}
function painelDays(){var v=14;try{v=+localStorage.getItem('lojasg.estoque99.painel-days')||14}catch(e){}return [7,14,30].indexOf(v)>=0?v:14}
var sortBy='n',sortDir=-1,last=[];
function supRows(){var n=painelDays(),today=iso(),first=addDays(today,-(n-1));return groups((state.nfs||[]).filter(function(x){return x.date&&x.date>=first&&x.date<=today}))}
function sorted(list){var k=sortBy,d=sortDir;return list.slice().sort(function(a,b){var va=k==='name'?normalText(a.label):k==='div'?a.pdiv:k==='avg'?a.avg:k==='val'?(a.hasVal?a.val:NaN):a.n,vb=k==='name'?normalText(b.label):k==='div'?b.pdiv:k==='avg'?b.avg:k==='val'?(b.hasVal?b.val:NaN):b.n;
  var na=typeof va==='number'&&isNaN(va),nb=typeof vb==='number'&&isNaN(vb);if(na||nb)return na&&nb?0:na?1:-1;if(va<vb)return -d;if(va>vb)return d;return b.n-a.n||normalText(a.label).localeCompare(normalText(b.label))})}
function supCard(){var days=painelDays(),list=sorted(supRows()),showVal=!aux();last=list;
  var cols=[['name','Fornecedor'],['n','Notas'],['div','Com diverg.'],['avg','Até conferir']].concat(showVal?[['val','Valor']]:[]);
  var head='<tr>'+cols.map(function(c){var s=sortBy===c[0]?(sortDir>0?'ascending':'descending'):'none';return '<th scope="col" aria-sort="'+s+'"><button type="button" onclick="e99Sup.sort(\''+c[0]+'\')" aria-label="Ordenar por '+esc(c[1])+'">'+esc(c[1])+(sortBy===c[0]?(sortDir>0?' ↑':' ↓'):'')+'</button></th>'}).join('')+'</tr>';
  var body=list.slice(0,50).map(function(x,i){return '<tr><td><button type="button" onclick="e99Sup.open('+i+')" aria-label="Ver as notas de '+esc(x.label)+'">'+esc(x.label)+(x.cnpj&&x.label.indexOf('CNPJ')!==0?'<small>CNPJ '+esc(fmtCnpj(x.cnpj))+'</small>':'')+'</button></td><td>'+x.n+'</td><td>'+(x.n?Math.round(x.pdiv)+'%':'—')+'</td><td>'+esc(fmtHours(x.avg))+'</td>'+(showVal?'<td>'+(x.hasVal?esc(money(x.val)):'—')+'</td>':'')+'</tr>'}).join('');
  return '<section class="pn-card pn-sup" id="pn-sup"><h2>Fornecedores</h2><p class="pn-sub">Notas que chegaram nos últimos '+days+' dias. Toque no fornecedor para ver as notas.</p>'
    +(list.length?'<label class="pn-sup-sort">Ordenar por<select onchange="e99Sup.sort(this.value,true)">'+cols.map(function(c){return '<option value="'+c[0]+'"'+(sortBy===c[0]?' selected':'')+'>'+esc(c[0]==='name'?'Fornecedor (A–Z)':c[0]==='n'?'Mais notas':c[0]==='div'?'Mais divergência':c[0]==='avg'?'Mais tempo até conferir':'Maior valor')+'</option>'}).join('')+'</select></label><div class="tablewrap"><table><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div><p class="small" style="margin:0">“Com diverg.” conta as notas que ficaram em divergência. “Até conferir” é a média da chegada até a nota ficar Conferido.'+(list.length>50?' Mostrando os 50 primeiros de '+list.length+'.':'')+'</p>':'<p class="pn-empty">Nenhuma nota no período.</p>')+'</section>'}
W.e99Sup={rows:function(){return sorted(supRows())},hours:hoursToCheck,
  sort:function(k,exact){if(['name','n','div','avg','val'].indexOf(k)<0)return;if(sortBy===k&&!exact)sortDir=-sortDir;else{sortBy=k;sortDir=k==='name'?1:-1}var el=D.getElementById('pn-sup');if(el){el.outerHTML=supCard();try{if(typeof mobileTableLabels==='function')mobileTableLabels()}catch(e){}var b=exact?D.querySelector('#pn-sup .pn-sup-sort select'):D.querySelector('#pn-sup th[aria-sort]:not([aria-sort=none]) button');if(b)b.focus()}},
  open:function(i){var x=last[i];if(!x)return;nfStatusFilter='';nfQuery=x.cnpj||(x.label==='Sem fornecedor'?'':x.label);go('nfs')}};

/* ===================== (1) relatório da semana ===================== */
function weekData(mon){mon=mondayOf(mon);var end=addDays(mon,6),today=iso(),inW=function(k){return k&&k>=mon&&k<=end};
  var nfs=(state.nfs||[]).filter(function(n){return inW(n.date)}),byStatus=ST.map(function(s){return nfs.filter(function(n){return n.status===s}).length});
  var withVal=nfs.filter(function(n){return /^\d{1,13}(\.\d{1,2})?$/.test(String(n.totalValue||''))}),val=withVal.reduce(function(a,n){return a+Number(n.totalValue)},0);
  var div=nfs.filter(function(n){return ever(n,'Em divergência')}).map(function(n){return {number:String(n.number||''),supplier:String(n.supplier||''),date:n.date,status:n.status,notes:String(n.notes||'').slice(0,160)}});
  var confs=(state.confs||[]).filter(function(c){return c.status==='finalizada'&&c.end&&inW(dateOfMs(Date.parse(c.end)))}).map(function(c){var nf=c.nf?(state.nfs||[]).find(function(n){return n.id===c.nf}):null,r='Sem nota associada',miss=0,over=0,extra=0;
    if(nf){var x=null;try{x=W.e99Conf&&W.e99Conf.compare?W.e99Conf.compare(nf):null}catch(e){}var xm=x&&x.xml;
      if(xm){miss=xm.miss.length;over=xm.over.length;extra=xm.extra.length+xm.pack.length;r=xm.ok?'Tudo confere':[miss?'Faltou '+pl(miss,'item','itens'):'',over?'Sobrou '+pl(over,'item','itens'):'',xm.extra.length?pl(xm.extra.length,'código','códigos')+' fora da nota':'',xm.pack.length?'Código da embalagem: confira à mão':''].filter(Boolean).join(' · ')}
      else if(x&&x.want!=null)r=x.ok?'Volumes conferem ('+x.total+')':'Volumes: lidos '+x.total+' de '+x.want;else r='Sem itens do XML'}
    return {n:String(c.n||''),end:c.end,total:c.total|0,nf:nf?String(nf.number||''):'',supplier:nf?String(nf.supplier||''):'',result:r,bad:!!(miss||over||extra)}});
  var acts=[];(state.plans||[]).filter(function(p){return inW(p.date)}).forEach(function(p){(p.activities||[]).forEach(function(a){acts.push({p:p,a:a})})});
  var late=acts.filter(function(x){return !x.a.done&&(x.p.date<today||actLate(x.p,x.a))}).map(function(x){return {title:String(x.a.title||''),owner:String(x.a.owner||'A definir'),date:x.p.date,plan:String(x.p.title||'')}});
  var cor=(state.corridors||[]).filter(function(c){return !String(c.owner||'').trim()}).map(function(c){return {number:String(c.number||''),sector:String(c.sector||'')}});
  return {mon:mon,end:end,store:store(),nfs:nfs.length,byStatus:byStatus,val:val,withVal:withVal.length,div:div,confs:confs,acts:acts.length,done:acts.filter(function(x){return x.a.done}).length,late:late,cor:cor,at:Date.now()}}
function label(d){return brS(d.mon)+' a '+br(d.end)}
function tbl(head,rows){return '<table><thead><tr>'+head.map(function(h){return '<th scope="col">'+esc(h)+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+esc(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table>'}
function none(t){return '<p class="wk-none">'+esc(t)+'</p>'}
function kv(list){return '<div class="wk-kv">'+list.map(function(k){return '<div><span>'+esc(k[0])+'</span><b>'+esc(k[1])+'</b></div>'}).join('')+'</div>'}
function bodyHtml(d){var h='<div class="wk-rep">';
  h+='<h3>Notas recebidas</h3>'+kv([['Total',num(d.nfs)]].concat(ST.map(function(s,i){return [s,num(d.byStatus[i])]})).concat(d.withVal?[['Valor total',money(d.val)]]:[]));
  if(d.withVal&&d.withVal<d.nfs)h+='<p class="wk-meta">Valor de '+d.withVal+' de '+d.nfs+' notas (as outras não têm valor do XML).</p>';
  h+='<h3>Divergências ('+d.div.length+')</h3>'+(d.div.length?tbl(['NF','Fornecedor','Chegada','Status agora','Observações'],d.div.map(function(x){return [x.number,x.supplier||'—',br(x.date),x.status,x.notes||'—']})):none('Nenhuma nota com divergência na semana.'));
  var bad=d.confs.filter(function(c){return c.bad}).length;
  h+='<h3>Conferências por câmera ('+d.confs.length+')</h3>'+(d.confs.length?kv([['Finalizadas',num(d.confs.length)],['Leituras',num(d.confs.reduce(function(a,c){return a+c.total},0))],['Com falta ou sobra',num(bad)]])+tbl(['Conferência','Finalizada','Leituras','Nota','Resultado'],d.confs.map(function(c){return [c.n,brTime(Date.parse(c.end)),String(c.total),c.nf?'NF '+c.nf+(c.supplier?' · '+c.supplier:''):'—',c.result]})):none('Nenhuma conferência por câmera finalizada na semana.'));
  h+='<h3>Plano de ação</h3>'+(d.acts?kv([['Feitas',d.done+' de '+d.acts],['Concluído',Math.round(d.done/d.acts*100)+'%'],['Atrasadas',num(d.late.length)]]):none('Nenhum plano na semana.'));
  if(d.late.length)h+=tbl(['Atividade atrasada','Responsável','Dia','Plano'],d.late.slice(0,40).map(function(x){return [x.title,x.owner,br(x.date),x.plan]}))+(d.late.length>40?'<p class="wk-meta">Mais '+(d.late.length-40)+' atrasadas no app.</p>':'');
  h+='<h3>Corredores sem responsável ('+d.cor.length+')</h3>'+(d.cor.length?tbl(['Corredor','Setor'],d.cor.map(function(c){return [c.number,c.sector||'—']})):none((state.corridors||[]).length?'Todos têm responsável.':'Nenhum corredor cadastrado.'));
  return h+'<p class="wk-meta">Gerado em '+esc(brTime(d.at))+' · '+esc(d.store)+'</p></div>'}
function printHtml(d){return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório da semana '+esc(label(d))+'</title><style>'
  +'body{font:13px -apple-system,Segoe UI,system-ui,sans-serif;color:#111;background:#fff;margin:28px}h1{font-size:19px;margin:0 0 2px}h3{font-size:14px;margin:18px 0 6px}.sub{color:#555;margin:0 0 8px}'
  +'.wk-kv{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0}.wk-kv div{border:1px solid #ddd;border-radius:8px;padding:6px 10px;min-width:110px}.wk-kv span{display:block;font-size:11px;color:#555}.wk-kv b{font-size:16px}'
  +'table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#555}.wk-none,.wk-meta{color:#555}'
  +'@media print{body{margin:12mm}h3{break-after:avoid}tr{break-inside:avoid}}</style></head><body><h1>Relatório da semana</h1><p class="sub">'+esc(d.store)+' · '+esc(label(d))+' (segunda a domingo)</p>'+bodyHtml(d)+'</body></html>'}
function weeks(){var cur=mondayOf(iso()),out=[];for(var i=0;i<9;i++)out.push(addDays(cur,-7*i));return out}
var wkMon='';
function open(mon){if(!authSession||aux())return;wkMon=mondayOf(mon||addDays(mondayOf(iso()),-7));var d=D.getElementById('wk-dlg');if(!d){d=D.createElement('dialog');d.id='wk-dlg';d.setAttribute('aria-labelledby','wk-title');D.body.appendChild(d)}
  var data=weekData(wkMon),g=role()==='gestor',p=pref();
  d.innerHTML='<div class="wk-top"><h2 id="wk-title">Relatório da semana</h2><label>Semana (segunda a domingo)<select onchange="e99Week.open(this.value)">'+weeks().map(function(m,i){return '<option value="'+m+'"'+(m===wkMon?' selected':'')+'>'+esc(brS(m)+' a '+br(addDays(m,6)))+(i===0?' (esta semana)':i===1?' (semana passada)':'')+'</option>'}).join('')+'</select></label></div>'
   +'<div class="wk-body" id="wk-body">'+bodyHtml(data)+'</div>'
   +'<div class="wk-foot">'+(g?'<label class="wk-pref"><input type="checkbox" '+(p.off?'':'checked ')+'onchange="e99Week.pref(this.checked)"> Enviar o resumo por e-mail toda segunda</label>':'')+'<button type="button" onclick="this.closest(\'dialog\').close()">Fechar</button><button type="button" onclick="e99Week.share()" aria-haspopup="dialog">Compartilhar</button><button type="button" class="primary" onclick="e99Week.pdf()">Salvar em PDF</button></div>';
  if(!d.open){try{d.showModal()}catch(e){d.setAttribute('open','')}}var s=d.querySelector('select');if(s&&!mon)s.focus()}
function pdf(){if(!authSession||aux())return;var html=printHtml(weekData(wkMon||addDays(mondayOf(iso()),-7))),w=null;try{w=W.open('','_blank')}catch(e){}
  if(w){w.document.open();w.document.write(html);w.document.close();setTimeout(function(){try{w.focus();w.print()}catch(e){}},300);notify('Na janela de impressão, escolha "Salvar como PDF".');return}
  var f=D.createElement('iframe');f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;width:0;height:0;border:0;right:0;bottom:0';D.body.appendChild(f);var fd=f.contentDocument;fd.open();fd.write(html);fd.close();
  setTimeout(function(){try{f.contentWindow.focus();f.contentWindow.print()}catch(e){notify('Não deu para imprimir aqui.')}setTimeout(function(){f.remove()},60000)},300);notify('Na janela de impressão, escolha "Salvar como PDF".')}

/* ===================== resumo semanal por e-mail (mesmo envio do "Relatório por e-mail") ===================== */
function pk(){return 'lojasg.estoque99.week-mail:'+authSession.storeKey}
function pref(){var v={};try{v=JSON.parse(localStorage.getItem(pk())||'{}')||{}}catch(e){}return {off:v.off===true,sent:typeof v.sent==='string'?v.sent:'',at:Number(v.at)||0,status:typeof v.status==='string'?v.status.slice(0,200):'',retryAt:Number(v.retryAt)||0}}
function setPref(p){try{localStorage.setItem(pk(),JSON.stringify(p))}catch(e){}}
function mailCfg(){var c={};try{c=JSON.parse(localStorage.getItem('lojasg.estoque99.email-reports:'+authSession.storeKey)||'{}')||{}}catch(e){}return c}
function okMail(v){return /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-z]{2,}$/i.test(String(v||''))}
function fields(d){var f={};f['Loja']=d.store;f['Semana']=label(d)+' (segunda a domingo)';
  f['Notas recebidas']=d.nfs+(d.nfs?' — '+ST.map(function(s,i){return s+' '+d.byStatus[i]}).join(' · '):'');
  if(d.withVal)f['Valor das notas']=money(d.val)+(d.withVal<d.nfs?' ('+d.withVal+' de '+d.nfs+' notas com valor)':'');
  f['Divergências']=d.div.length?d.div.slice(0,15).map(function(x){return 'NF '+x.number+(x.supplier?' · '+x.supplier:'')+' · '+x.status+(x.notes?' · '+x.notes:'')}).join('\n')+(d.div.length>15?'\n+ '+(d.div.length-15)+' no app':''):'Nenhuma';
  f['Conferências por câmera']=d.confs.length?d.confs.length+' finalizadas · '+d.confs.reduce(function(a,c){return a+c.total},0)+' leituras · '+d.confs.filter(function(c){return c.bad}).length+' com falta ou sobra':'Nenhuma';
  f['Plano de ação']=d.acts?d.done+' de '+d.acts+' atividades feitas · '+d.late.length+' atrasadas':'Nenhum plano';
  if(d.late.length)f['Atrasadas']=d.late.slice(0,15).map(function(x){return x.title+' · '+x.owner+' · '+br(x.date)}).join('\n')+(d.late.length>15?'\n+ '+(d.late.length-15)+' no app':'');
  f['Corredores sem responsável']=d.cor.length?d.cor.slice(0,20).map(function(c){return c.number+(c.sector?' · '+c.sector:'')}).join('\n'):'Nenhum';
  f['Mais detalhes']='Abra o Stok → Painel → Relatório da semana para salvar em PDF.';
  f._subject=('Estoque 99 · Resumo da semana '+label(d)+' · '+d.store).slice(0,200);f._template='table';f._captcha='false';
  /* v144: o mesmo texto formatado das mensagens vem primeiro no corpo (campos de antes continuam) */
  if(W.e99Msg){try{f=Object.assign({'Mensagem':e99Msg.text(payload(d),{plain:true})},f)}catch(e){}}return f}
/* v144: resumo da semana para WhatsApp/Outlook (e99Msg) */
function payload(d){var sec=[];
  sec.push({title:'Notas recebidas ('+d.nfs+')',lines:d.nfs?ST.map(function(s,i){return s+': '+d.byStatus[i]}).concat(d.withVal?['Valor: '+money(d.val)+(d.withVal<d.nfs?' ('+d.withVal+' de '+d.nfs+' notas com valor)':'')]:[]):['Nenhuma nota na semana']});
  sec.push({title:'Divergências ('+d.div.length+')',lines:d.div.length?d.div.slice(0,15).map(function(x){return {b:'NF '+x.number,t:[x.supplier,x.status].filter(Boolean).join(' · '),sub:x.notes?[x.notes]:[]}}).concat(d.div.length>15?['+ '+(d.div.length-15)+' no app']:[]):['Nenhuma']});
  sec.push({title:'Conferências por câmera',lines:d.confs.length?[d.confs.length+' finalizadas · '+d.confs.reduce(function(a,c){return a+c.total},0)+' leituras · '+d.confs.filter(function(c){return c.bad}).length+' com falta ou sobra']:['Nenhuma']});
  sec.push({title:'Plano de ação',lines:(d.acts?[d.done+' de '+d.acts+' atividades feitas · '+d.late.length+' atrasadas']:['Nenhum plano']).concat(d.late.slice(0,15).map(function(x){return {b:x.title,t:x.owner+' · '+br(x.date)}}))});
  sec.push({title:'Corredores sem responsável ('+d.cor.length+')',lines:d.cor.length?d.cor.slice(0,20).map(function(c){return c.number+(c.sector?' · '+c.sector:'')}):['Nenhum']});
  return {title:'Resumo da semana',subtitle:d.store+' · '+label(d),file:'resumo-semana-'+(wkMon||''),subject:'Resumo da semana '+label(d)+' · '+d.store,sections:sec,note:'Detalhes no Stok → Painel → Relatório da semana.'}}
function shareWeek(){if(!authSession||aux()||!W.e99Msg)return;e99Msg.preview(payload(weekData(wkMon||addDays(mondayOf(iso()),-7))),{heading:'Enviar resumo da semana'})}
var busy=false;
function local(){return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)||location.protocol==='file:'}
function due(){if(!authSession||role()!=='gestor')return null;var p=pref(),c=mailCfg(),cur=mondayOf(iso());if(p.off||p.sent===cur||Date.now()<p.retryAt)return null;if(c.enabled!==true||!okMail(c.to))return null;
  if(local()){try{if(localStorage.getItem('e99-test-weekmail')!=='1')return null}catch(e){return null}}return {cur:cur,c:c}}
async function send(){var x=due();if(!x||busy||navigator.onLine===false)return false;busy=true;var s=authSession;
  try{var d=weekData(addDays(x.cur,-7)),f=fields(d),cc=String(x.c.cc||'').split(/[,;\s]+/).filter(okMail).slice(0,5);if(cc.length)f._cc=cc.join(',');
    var r=await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(x.c.to),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(f)}),j={};try{j=await r.json()}catch(e){}
    if(authSession!==s)return false;var p=pref();
    if(r.ok&&(j.success===true||j.success==='true')){p.sent=x.cur;p.at=Date.now();p.retryAt=0;p.status='Resumo da semana '+label(d)+' enviado em '+brTime(Date.now())+'.';setPref(p);return true}
    p.retryAt=Date.now()+(/activat|confirm/i.test(String(j.message||''))?30:10)*60000;p.status='Resumo da semana não enviado ('+String(j.message||('erro '+r.status)).slice(0,80)+'). Nova tentativa em instantes.';setPref(p);return false}
  catch(e){if(authSession===s){var q=pref();q.retryAt=Date.now()+5*60000;q.status='Sem conexão para enviar o resumo da semana. Nova tentativa em 5 min.';setPref(q)}return false}
  finally{busy=false}}
async function tick(){if(!due())return;if(navigator.locks&&navigator.locks.request)await navigator.locks.request('estoque99-weekmail:'+authSession.storeKey,{ifAvailable:true},function(l){return l?send():null});else await send()}
W.e99Week={open:open,pdf:pdf,data:weekData,html:printHtml,fields:fields,payload:payload,share:shareWeek,tick:tick,due:function(){return !!due()},monday:mondayOf,
  pref:function(on){if(!authSession)return;var p=pref();p.off=!on;setPref(p);notify(on?'Resumo da semana por e-mail ligado (toda segunda).':'Resumo da semana por e-mail desligado.');if(on)tick()},get:function(){return authSession?pref():null}};
/* opção no "Relatório por e-mail" (Alertas) */
var ep=W.emailPanelHTML;if(typeof ep==='function')W.emailPanelHTML=function(){var h=ep.apply(this,arguments);if(!h||!authSession||role()!=='gestor')return h;var p=pref(),c=mailCfg();
  var box='<label class="wk-pref" id="wk-mail-pref"><input type="checkbox" '+(p.off?'':'checked ')+'onchange="e99Week.pref(this.checked)"> Resumo da semana toda segunda (notas, divergências, conferências, plano e corredores)</label><p class="small" id="wk-mail-status">'+esc(p.off?'Resumo semanal desligado.':c.enabled===true?(p.status||'O próximo sai na primeira abertura de segunda em diante.'):'Ative o envio automático acima para receber o resumo da semana.')+'</p>';
  var i=h.lastIndexOf('<p class="small">Envia com o site aberto');return i>0?h.slice(0,i)+box+h.slice(i):h.replace(/<\/div>$/,box+'</div>')};
/* Painel: botão do relatório e cartão dos fornecedores */
var rp=W.extraPages&&W.extraPages.reports;if(typeof rp==='function')W.extraPages.reports=function(){var h=rp.apply(this,arguments);try{
  var btn=aux()?'':'<div class="pn-actions"><button type="button" class="primary" id="wk-open" onclick="e99Week.open()">'+(W.e99Icon?e99Icon('reports'):'')+'Relatório da semana</button></div>';
  var i=h.indexOf('<div class="pn-kpis">');if(i>0&&btn)h=h.slice(0,i)+btn+h.slice(i);h+=supCard()}catch(e){}return h};
setInterval(function(){if(!D.hidden)tick()},60000);
D.addEventListener('visibilitychange',function(){if(!D.hidden)tick()});
W.addEventListener('online',function(){tick()});
var en=authEnter;authEnter=function(){var r=en.apply(this,arguments);setTimeout(tick,3000);return r};
})();
