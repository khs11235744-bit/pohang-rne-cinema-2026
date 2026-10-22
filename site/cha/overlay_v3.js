(function(){
'use strict';
var notes=window.CHA_NOTES||[],people=window.CHA_SPEAKERS||[],presenter=null,active=null,booted=false;
function start(){
 if(booted)return;
 var stage=document.getElementById('stage'),slide=document.getElementById('slide');
 if(!stage||!slide){setTimeout(start,120);return}
 booted=true;
 var layer=document.createElement('div');layer.id='sourceFX';stage.insertBefore(layer,slide);
 function currentIndex(){return Math.max(0,(parseInt(document.getElementById('current').textContent,10)||1)-1)}
 function notify(){
  if(!presenter||presenter.closed)return;
  var i=currentIndex();
  presenter.postMessage({kind:'cha-research-update',index:i,notes:notes[i]||'',name:people[i]?.name||'',seconds:people[i]?.seconds||0,total:12},'*')
 }
 function onScene(){
  var scene=slide.querySelector('.scene');if(!scene)return;
  if(active){try{active.stop()}catch(e){}active=null}
  layer.replaceChildren();
  if(scene.classList.contains('bar-scene')){
   var v=document.createElement('video');
   v.className='vizzuvideo';v.src='./media/PHHS_Vizzu_Q13_to_Q14.mp4';
   v.autoplay=true;v.muted=true;v.playsInline=true;v.preload='auto';v.loop=false;
   v.setAttribute('aria-label','Q13 접촉 경로와 Q14 사용 동기의 서로 다른 응답 분포를 차례로 보여주는 모션 차트');
   scene.appendChild(v);v.play().catch(function(){});
  }
  var fx=scene.classList.contains('hero')?'particle-burst':scene.classList.contains('words')?'word-cascade':scene.classList.contains('research-model')?'knowledge-graph':null;
  if(fx && window.HPX && typeof window.HPX[fx]==='function'){try{active=window.HPX[fx](layer)}catch(e){console.warn('효과 사용 불가',e)}}
  if(window.decryptEl){
   var el=scene.querySelector('.hero .mega .accent')||scene.querySelector('.final .mega .accent');
   if(el){el.dataset.text=el.textContent;window.decryptEl(el)}
  }
  window.CHA_V3_STATUS={effect:fx,index:currentIndex(),video:!!scene.querySelector('.vizzuvideo')};
  notify();
 }
 var queued=false;
 new MutationObserver(function(){if(!queued){queued=true;requestAnimationFrame(function(){queued=false;onScene()})}}).observe(slide,{childList:true});
 document.addEventListener('keydown',function(e){
  if(e.key.toLowerCase()==='s'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){
   e.preventDefault();e.stopImmediatePropagation();
   if(!presenter||presenter.closed)presenter=window.open('./presenter.html','CHA_RNE_PRESENTER','width=1280,height=880');
   if(presenter)setTimeout(notify,320);
  }
 },true);
 window.addEventListener('message',function(e){if(e.data?.kind==='cha-research-ready')notify()});
 onScene();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();