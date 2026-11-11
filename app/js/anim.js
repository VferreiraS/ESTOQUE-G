
(function(){
'use strict';
var last=null;
function off(){return document.body.classList.contains('fx-user-off')}
var rr=render;render=function(){var r=rr.apply(this,arguments);try{var v=document.getElementById('view');if(!v)return r;
  var items=v.querySelectorAll('.panel,.card,.stat,.plan-card,.pn-card');items.forEach(function(el,i){el.style.setProperty('--fx-delay',((i*1.3)%7).toFixed(1)+'s')});
  var cur=typeof page!=='undefined'?page:'';if(cur!==last){last=cur;if(!off()){var blocks=v.querySelectorAll('.hero,.stat,.panel,.card,.plan-card');
    /* troca de tela macia e curta: no máximo 200 ms por bloco, 10 blocos, 18 ms entre eles; com "menos movimento" no aparelho, só esmaece */
    var kf=window.__osReduce?[{opacity:0},{opacity:1}]:(window.e99EntryKF||[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}]),dur=Math.min(200,Math.round((window.e99EntryMs||380)*.5)),gap=Math.min(18,window.e99EntryGap||18);
    for(var j=0;j<blocks.length&&j<10;j++){if(typeof blocks[j].animate==='function')blocks[j].animate(kf,{duration:dur,delay:j*gap,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'})}}}
  var ac=document.querySelector('.alert-count');if(ac)ac.classList.toggle('has',+ac.textContent>0)}catch(x){}return r};
})();
