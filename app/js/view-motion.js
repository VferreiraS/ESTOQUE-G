
(function(){
 // Presentation only: no task data is changed. Content stays visible if effects fail.
 var root=document.getElementById('view');if(!root||typeof root.querySelectorAll!=='function')return;
 var observer=null,animations=[],framePending=false;
 var preference=typeof window.matchMedia==='function'?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
 function motionAllowed(){return !(preference&&preference.matches)}
 function cancelAnimations(){animations.forEach(function(a){try{a.cancel()}catch(e){}});animations=[]}
 function updateControl(){document.body.classList.toggle('fx-off',!motionAllowed())}
 function reveal(element,delay){if(typeof element.animate!=='function'||!motionAllowed())return;try{if(element.getAnimations&&element.getAnimations().length)return;var a=element.animate([{opacity:.25,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,delay:delay,easing:'cubic-bezier(.22,1,.36,1)'});animations.push(a);a.onfinish=function(){var i=animations.indexOf(a);if(i>=0)animations.splice(i,1)}}catch(e){}}
 function updateScroll(){framePending=false;var doc=document.documentElement,height=Math.max(0,doc.scrollHeight-window.innerHeight),y=Math.max(0,window.pageYOffset||doc.scrollTop||0),bar=document.getElementById('scroll-progress'),top=document.getElementById('back-top');if(bar)bar.style.transform='scaleX('+(height?Math.min(1,y/height):0)+')';if(top)top.classList.toggle('hidden',y<320);document.body.classList.toggle('is-scrolled',y>12)}
 function scheduleScroll(){if(framePending)return;framePending=true;if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(updateScroll);else updateScroll()}
 var revealPage=null;
 /* a cada render: sem leitura de layout na hora (a barra de rolagem atualiza no próximo quadro) e sem piscar os blocos quando a tela só se atualiza (sincronização); a entrada só roda ao trocar de tela */
 window.refreshVisualEffects=function(){var cur=typeof page!=='undefined'?page:'';var same=cur===revealPage;revealPage=cur;updateControl();scheduleScroll();if(observer){observer.disconnect();observer=null}if(same)return;cancelAnimations();if(!motionAllowed())return;var nodes=root.querySelectorAll('.hero,.stat,.cards>.card,.grid2>.card,.panel');if(typeof window.IntersectionObserver==='function'){try{observer=new window.IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){reveal(entry.target,0);observer.unobserve(entry.target)}})},{threshold:.05});Array.prototype.forEach.call(nodes,function(node){observer.observe(node)})}catch(e){observer=null}}else Array.prototype.forEach.call(nodes,function(node,i){if(node.getBoundingClientRect().top<window.innerHeight)reveal(node,Math.min(i,3)*40)})};
 window.scrollToSiteTop=function(){try{window.scrollTo({top:0,behavior:motionAllowed()?'smooth':'auto'})}catch(e){window.scrollTo(0,0)}};
 window.addEventListener('scroll',scheduleScroll,{passive:true});window.addEventListener('resize',scheduleScroll,{passive:true});window.addEventListener('beforeprint',cancelAnimations);
 if(preference){if(typeof preference.addEventListener==='function')preference.addEventListener('change',window.refreshVisualEffects);else if(typeof preference.addListener==='function')preference.addListener(window.refreshVisualEffects)}
 window.refreshVisualEffects();
})();
