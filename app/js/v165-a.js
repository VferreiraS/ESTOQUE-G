/* v165-a · marca as telas Início, Painel, Alertas, Minha conta e Dados para o CSS app/css/v165-a.css e faz só ajustes de marcação:
   datas legíveis ("ter., 24 nov."), separador de milhar, reticências com title, um primário por tela, estados vazios com ação,
   alertas antes das configurações, zona de perigo no fim dos Dados, esqueleto no "Testando…". Não muda lógica nem dados. */
(function(){'use strict';var D=document,W=window;
var PG={home:1,reports:1,alerts:1,account:1,data:1};
var DOW=['dom.','seg.','ter.','qua.','qui.','sex.','sáb.'],MON=['jan.','fev.','mar.','abr.','maio','jun.','jul.','ago.','set.','out.','nov.','dez.'];
function two(n){return ('0'+n).slice(-2)}
function dia(d){return DOW[d.getDay()]+', '+d.getDate()+' '+MON[d.getMonth()]}
function ic(n){try{return W.e99Icon?W.e99Icon(n):''}catch(e){return ''}}
function q(s,r){return (r||D).querySelector(s)}function qa(s,r){return [].slice.call((r||D).querySelectorAll(s))}
function emptyBox(icon,title,text,label,fn){var d=D.createElement('div');d.className='p165-empty';
  d.innerHTML='<span class="p165-ic" aria-hidden="true">'+ic(icon)+'</span><h3></h3><p></p><button type="button"></button>';
  d.querySelector('h3').textContent=title;d.querySelector('p').textContent=text;var b=d.querySelector('button');b.textContent=label;b.addEventListener('click',fn);return d}
function milhar(els){els.forEach(function(e){var t=e.textContent.trim();if(/^\d{4,}$/.test(t))e.textContent=Number(t).toLocaleString('pt-BR')})}
function trunc(els){els.forEach(function(e){if(!e.title)e.title=e.textContent.trim()})}
function main(sel,v){var m=q(sel,v);if(m)m.classList.add('p165-main')}
function fix(){var v=D.getElementById('view');if(!v||typeof page==='undefined')return;
  if(!PG[page]||typeof authSession==='undefined'||!authSession){v.removeAttribute('data-p165');return}v.setAttribute('data-p165',page);
  milhar(qa('.stat strong,.pn-kpi strong,.pn-sup td,.alert-count',v));
  if(page==='home'){var s=q('.hero-home .subtitle',v);if(s&&!s.dataset.p165){s.dataset.p165=1;s.title=s.textContent;s.textContent=dia(new Date())}
    main('.hero-home .primary',v);trunc(qa('.vd-greet h2,.e99-dem-name',v))}
  if(page==='reports'){main('#wk-open',v);trunc(qa('.pn-sup td:first-child button',v));
    qa('.pn-card .pn-empty',v).forEach(function(p){var c=p.closest('.pn-card'),nf=c&&/nf/.test(c.id);
      p.replaceWith(emptyBox(nf?'reports':'check',nf?'Nenhuma nota no período':'Nenhuma atividade no período',nf?'As notas recebidas aparecem aqui.':'Monte um plano para ver o andamento.',nf?'Ver notas fiscais':'Novo plano',function(){if(nf)go('nfs');else if(W.openPlan)openPlan()}))})}
  if(page==='alerts'){var c=q('.alert-count',v),cen=c&&c.closest('.panel'),first=q('#alt-recent',v)||q('.alert-settings',v);first=first&&first.closest('.panel');
    if(cen&&first&&cen!==first&&cen.compareDocumentPosition(first)&Node.DOCUMENT_POSITION_PRECEDING)first.before(cen);
    main('.alert-settings .primary',v);
    qa('.alert-item',v).forEach(function(a){if(!q('.p165-ic',a)){var i=D.createElement('span');i.className='p165-ic warn';i.setAttribute('aria-hidden','true');i.innerHTML=ic('warn');a.prepend(i)}trunc(qa('b',a))});
    var em=cen&&q('.empty',cen);if(em)em.replaceWith(emptyBox('check','Tudo em dia','Nenhuma pendência dentro dos critérios configurados.','Ajustar avisos',function(){var f=q('.alert-settings select,.alert-settings input',v);if(f){f.scrollIntoView({block:'center'});f.focus()}}));
    altEmpty()}
  if(page==='account'){main('form[onsubmit^="authChangePassword"] .primary',v);
    var lone=qa(':scope>.grid2',v).filter(function(g){return g.children.length===1}),bk=q('#bk-panel',v);
    if(lone.length>1){var g0=lone[0];lone.slice(1).forEach(function(g){if(bk&&q('#legal-panel',g))g0.appendChild(bk);g0.appendChild(g.firstElementChild);g.remove()})}}
  if(page==='data'){main('.grid2 .primary',v);var r=q('.reset-panel',v),l=q('#lic-panel',v);if(r&&l&&r.nextElementSibling!==null&&l.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_PRECEDING)l.after(r);
    qa('.panel p',v).forEach(function(p){var m=/^Última alteração: (\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/.exec(p.textContent);if(m&&!p.dataset.p165){var d=new Date(+m[3],m[2]-1,+m[1],+m[4],+m[5]);p.dataset.p165=1;p.title=p.textContent;p.textContent='Última alteração: '+dia(d)+', '+m[4]+':'+m[5]}})}}
/* "Alterações recentes" vazia: ícone + uma ação (a lista é repintada pelo v156; só troca quando está vazia) */
function altEmpty(){var L=D.getElementById('alt-recent-list');if(!L||L.children.length!==1)return;var p=L.firstElementChild;if(!p.matches('p.small'))return;
  L.replaceChildren(emptyBox('info','Nenhuma alteração da equipe',p.textContent,'Abrir o Chat',function(){go('chat')}))}
var before=render;render=function(){var r=before.apply(this,arguments);try{fix()}catch(e){}return r};
/* esqueleto enquanto testa a rede (Dados → Rede da loja) */
if(typeof W.e99NetTest==='function'){var nt=W.e99NetTest;W.e99NetTest=function(){var p=nt.apply(this,arguments);var b=D.getElementById('net-result');if(b&&/Testando/.test(b.textContent))b.innerHTML='<div class="p165-skel" role="status" aria-label="Testando…"><i></i><i></i><i></i></div>';return p}}
try{fix()}catch(e){}
})();
