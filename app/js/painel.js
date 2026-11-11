
(function(){
'use strict';
window.extraPages=window.extraPages||{};
var KEY='lojasg.estoque99.painel-days',WD=['dom','seg','ter','qua','qui','sex','sáb'];
function days(){var v=14;try{v=+localStorage.getItem(KEY)||14}catch(e){}return [7,14,30].indexOf(v)>=0?v:14}
window.painelDays=function(n){try{localStorage.setItem(KEY,String(n))}catch(e){}render()};
function e(s){return esc(String(s==null?'':s))}
function range(n){var out=[],t=new Date();t.setHours(12,0,0,0);for(var i=n-1;i>=0;i--){var d=new Date(t);d.setDate(t.getDate()-i);out.push(d)}return out}
function shortDay(d,n){var dd=String(d.getDate()).padStart(2,'0');return n<=7?WD[d.getDay()]:n<=14?dd+'/'+String(d.getMonth()+1).padStart(2,'0'):dd}
function pct(v,max){return max>0?Math.max(v>0?2:0,Math.round(v/max*1000)/10):0}
function niceMax(v){if(v<=4)return Math.max(1,v);var p=Math.pow(10,Math.floor(Math.log10(v))),f=v/p;return (f<=2?2:f<=5?5:10)*p}
function legend(series,counts){return '<div class="pn-legend">'+series.map(function(s,i){return '<span><i class="'+s.cls+'" aria-hidden="true"></i>'+e(s.label)+(counts?' <b>'+counts[i]+'</b>':'')+'</span>'}).join('')+'</div>'}
function table(head,rows){return '<details class="pn-table"><summary>Ver como tabela</summary><div class="tablewrap"><table><thead><tr>'+head.map(function(h){return '<th>'+e(h)+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+e(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div></details>'}
function card(title,sub,body,id){return '<section class="pn-card" id="'+id+'"><h2>'+e(title)+'</h2>'+(sub?'<p class="pn-sub">'+e(sub)+'</p>':'')+body+'</section>'}
function tipLine(){return '<p class="pn-tip" aria-live="polite"></p>'}
/* barras horizontais, empilhadas quando há várias séries */
function hbars(rows,series){var max=Math.max.apply(null,rows.map(function(r){return r.values.reduce(function(a,b){return a+b},0)}).concat([0]));
  return rows.map(function(r){var tot=r.values.reduce(function(a,b){return a+b},0);return '<div class="pn-hrow"><span title="'+e(r.label)+'">'+e(r.label)+'</span><span class="pn-track">'+r.values.map(function(v,i){return v?'<i class="'+series[i].cls+'" style="width:'+pct(v,max)+'%" data-tip="'+e(r.label+' · '+series[i].label+': '+v)+'"></i>':''}).join('')+'</span><b>'+tot+'</b></div>'}).join('')}
/* colunas verticais: agrupadas (lado a lado) ou empilhadas */
function cols(list,series,stacked){var n=list.length,max=niceMax(Math.max.apply(null,list.map(function(c){return stacked?c.values.reduce(function(a,b){return a+b},0):Math.max.apply(null,c.values)}).concat([0])));var every=n<=8?1:n<=14?2:5;
  var plot='<div class="pn-plot" style="--n:'+n+';--g:'+(n>14?'2px':'6px')+'"><span class="pn-ymax">'+max+'</span>'+list.map(function(c){var marks=c.values.map(function(v,i){if(stacked&&!v)return '';return '<i class="'+series[i].cls+'" style="height:'+pct(v,max)+'%" data-tip="'+e(c.tip+' · '+series[i].label+': '+v)+'"></i>'}).join('');return '<div class="pn-col">'+(stacked?'<span class="pn-stack">'+marks+'</span>':marks)+'</div>'}).join('')+'</div>';
  var lab='<div class="pn-xlab" style="--n:'+n+';--g:'+(n>14?'2px':'6px')+'" aria-hidden="true">'+list.map(function(c,i){return '<span>'+((n-1-i)%every===0?e(c.label):'')+'</span>'}).join('')+'</div>';
  return plot+lab}
function empty(){return '<p class="pn-empty">Sem dados no período.</p>'}

function renderReports(){var n=days(),dlist=range(n),keys=dlist.map(function(d){return iso(d)}),first=keys[0],today=iso(),inP=function(k){return k&&k>=first&&k<=today};
  var nfs=state.nfs||[],plans=(state.plans||[]).filter(function(p){return inP(p.date)});
  var acts=[];plans.forEach(function(p){p.activities.forEach(function(a){acts.push({p:p,a:a})})});var doneN=acts.filter(function(x){return x.a.done}).length;
  var todayActs=[];(state.plans||[]).filter(function(p){return p.date===today}).forEach(function(p){p.activities.forEach(function(a){todayActs.push(a)})});var todayDone=todayActs.filter(function(a){return a.done}).length;
  var div=nfs.filter(function(x){return x.status==='Em divergência'}).length,wait=nfs.filter(function(x){return x.status!=='Conferido'}).length;
  var kpis=[['Atividades de hoje',todayDone+'/'+todayActs.length,todayActs.length?'feitas no plano de hoje':'nenhum plano para hoje'],['Atividades no período',acts.length?Math.round(doneN/acts.length*100)+'%':'—',acts.length?doneN+' de '+acts.length+' feitas':'sem planos no período'],['NFs aguardando',wait,'ainda não conferidas'],['NFs em divergência',div,'de '+nfs.length+' notas cadastradas']];
  var html=hero('Painel','')+'<div class="pn-head"><p class="small" style="margin:0">Como andam o plano de ação e o recebimento de notas.</p><div class="pn-period" role="group" aria-label="Período dos gráficos">'+[7,14,30].map(function(v){return '<button type="button" aria-pressed="'+(v===n)+'" onclick="painelDays('+v+')">'+v+' dias</button>'}).join('')+'</div></div>';
  html+='<div class="pn-kpis">'+kpis.map(function(k){return '<div class="pn-kpi"><span>'+e(k[0])+'</span><strong>'+e(k[1])+'</strong><small>'+e(k[2])+'</small></div>'}).join('')+'</div><div class="pn-grid">';
  /* 1. atividades por responsável */
  var SA=[{label:'Feitas',cls:'pn-s1'},{label:'A fazer',cls:'pn-s3'}],SO=[{label:'Feitas',cls:'pn-s1'},{label:'Atrasadas',cls:'pn-h1'},{label:'A fazer',cls:'pn-s3'}];var by={};acts.forEach(function(x){var k=String(x.a.owner||'A definir').trim()||'A definir';var key=normalText(k);if(!by[key])by[key]={label:k,values:[0,0,0]};by[key].values[x.a.done?0:actLate(x.p,x.a)?1:2]++});
  var arow=Object.keys(by).map(function(k){return by[k]}).sort(function(a,b){return (b.values[0]+b.values[1]+b.values[2])-(a.values[0]+a.values[1]+a.values[2])}).slice(0,10);
  html+=card('Atividades por responsável','Planos dos últimos '+n+' dias.',arow.length?legend(SO)+hbars(arow,SO)+tipLine()+table(['Responsável','Feitas','Atrasadas','A fazer'],arow.map(function(r){return [r.label].concat(r.values)})):empty(),'pn-acts-owner');
  /* 2. atividades por dia */
  var ad=dlist.map(function(d,i){var k=keys[i],l=[];(state.plans||[]).filter(function(p){return p.date===k}).forEach(function(p){p.activities.forEach(function(a){l.push(a)})});var dn=l.filter(function(a){return a.done}).length;return {label:shortDay(d,n),tip:d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'}),values:[dn,l.length-dn]}});
  html+=card('Atividades por dia','Feitas e a fazer, pela data do plano.',acts.length?legend(SA)+cols(ad,SA,true)+tipLine()+table(['Dia','Feitas','A fazer'],ad.map(function(c){return [c.tip,c.values[0],c.values[1]]})):empty(),'pn-acts-day');
  /* 3. notas fiscais */
  var S4=[{label:'Em divergência',cls:'pn-h2'},{label:'Outras',cls:'pn-s2'}];
  var nd=dlist.map(function(d,i){var k=keys[i],day=nfs.filter(function(x){return x.date===k});var dv=day.filter(function(x){return x.status==='Em divergência'}).length;return {label:shortDay(d,n),tip:d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'}),values:[dv,day.length-dv]}});
  var nTot=nd.reduce(function(a,c){return a+c.values[0]+c.values[1]},0);
  html+=card('Notas fiscais por dia','Recebidas nos últimos '+n+' dias.',nTot?legend(S4)+cols(nd,S4,true)+tipLine()+table(['Dia','Em divergência','Outras'],nd.map(function(c){return [c.tip,c.values[0],c.values[1]]})):empty(),'pn-nfs');
  /* 4. status das notas */
  var ST=['Pendente','Em conferência','Em divergência','Conferido'],SC=['pn-s1','pn-s2','pn-h2','pn-s3'],cnt=ST.map(function(s){return nfs.filter(function(x){return x.status===s}).length});
  html+=card('Notas fiscais por status','Todas as notas cadastradas, agora.',nfs.length?'<div class="pn-track" style="height:22px">'+ST.map(function(s,i){return cnt[i]?'<i class="'+SC[i]+'" style="width:'+pct(cnt[i],nfs.length)+'%" data-tip="'+e(s+': '+cnt[i])+'"></i>':''}).join('')+'</div>'+legend(ST.map(function(s,i){return {label:s,cls:SC[i]}}),cnt)+tipLine():'<p class="pn-empty">Nenhuma nota cadastrada.</p>','pn-nf-status');
  return html+'</div>'}
window.extraPages.reports=renderReports;
/* dica ao tocar/passar o mouse */
function showTip(t){var c=t.closest('.pn-card');if(!c)return;var p=c.querySelector('.pn-tip');c.querySelectorAll('[data-tip].on').forEach(function(x){x.classList.remove('on')});t.classList.add('on');if(p)p.textContent=t.getAttribute('data-tip')}
document.addEventListener('pointerover',function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('.pn-card [data-tip]');if(t&&ev.pointerType==='mouse')showTip(t)});
document.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('.pn-card [data-tip]');if(t)showTip(t)});
/* menu: Painel logo depois de Visão geral */
if(typeof labels==='object'&&!labels.reports){labels.reports='Painel';icons.reports='▥';var ks=Object.keys(labels),pos=ks.indexOf('home');ks.slice(pos+1).filter(function(k){return k!=='reports'}).forEach(function(k){var v=labels[k];delete labels[k];labels[k]=v})}
/* atalho no início */
var before=render;render=function(){var r=before.apply(this,arguments);if(authSession&&page==='home'&&!(window.isAux&&isAux())){var st=document.querySelector('#view .stats');if(st&&!document.querySelector('#view .pn-homelink')){var d=document.createElement('div');d.className='pn-homelink';d.innerHTML='<button type="button" onclick="go(\'reports\')">'+(window.e99Icon?e99Icon('reports'):'')+'Ver painel com gráficos →</button>';st.after(d)}}return r};
})();
