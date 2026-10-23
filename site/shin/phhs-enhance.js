/* PHHS R&E / 2026 shared identity and real scholar-image layer.
   Always keeps presentation themes independent. No tracking or external media requests. */
(()=>{'use strict';
const config={
 shin:{label:'신진욱팀 · 수두라',members:['이재진','이승민','김선환','신진욱','이채운'],teacher:'권형석'},
 cha:{label:'차민혁팀',members:['차민혁','이준규','권태윤','김도윤','변찬영'],teacher:'권형석'},
 hu:{label:'허준완팀',members:['김주찬','허준완'],teacher:'한민혁'},
 seung:{label:'신승연팀',members:['신승연','이시훈','김민기','김현우'],teacher:'권형석'}
};
const id=window.PHHS_TEAM_ID||(location.pathname.match(/\/(shin|cha|hu|seung)\//)||[])[1]||'shin';
const info=config[id];if(!info)return;
const asset='./brand/pohang-school-symbol.png';
const create=(tag,cls,body)=>{let e=document.createElement(tag);e.className=cls;if(body)e.innerHTML=body;return e};
const safe=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const roster='<strong>'+safe(info.label)+'</strong><div>연구 참여 · '+info.members.map(safe).join(' · ')+'</div><small>지도교사 '+safe(info.teacher)+' · 포항고등학교 인문사회 R&E</small>';
function brand(parent){
 if(!parent||parent.querySelector(':scope > .phhs-brand-mark'))return;
 const e=create('div','phhs-brand-mark','<img alt="포항고 상징 도안 · 高와 갈매기" src="'+asset+'"><span>포항고등학교</span>');
 parent.appendChild(e);
}
function rosterOn(parent){
 if(!parent||parent.querySelector('.phhs-cover-roster'))return;
 parent.appendChild(create('div','phhs-cover-roster',roster));
}
function thanksOn(parent){
 if(!parent||parent.querySelector('.phhs-end-thanks'))return;
 parent.appendChild(create('div','phhs-end-thanks','<span>THANK YOU</span><strong>경청해 주셔서 감사합니다.</strong>'));
}
function portrait(card,id,name){
 if(!card||card.querySelector('.phhs-scholar-img'))return;
 const e=create('figure','phhs-scholar-img','<img src="./portraits/'+id+'.jpg" loading="lazy" alt="'+safe(name)+'의 실제 사진 또는 초상화"><figcaption>'+safe(name)+'</figcaption>');
 card.appendChild(e);
}
function aschDiagram(card){
 if(!card||card.querySelector('.phhs-asch-diagram'))return;
 card.appendChild(create('div','phhs-asch-diagram','<svg viewBox="0 0 100 80" aria-label="동조 실험의 세 선 비교를 단순화한 개념 도식" role="img"><path d="M10 6v47M36 9v29M60 6v47M84 5v68" fill="none" stroke="#1c6d65" stroke-width="6" stroke-linecap="round"/></svg><small>애쉬 동조 연구<br>개념 도식</small>'));
}
function forShin(){
 const scenes=[...document.querySelectorAll('.reveal .slides > section.scene')];if(!scenes.length){const m=document.querySelector('.mobile-app .m-top');if(m)brand(m);return;}
 scenes.forEach(brand);
 rosterOn(scenes[0]);thanksOn(scenes[scenes.length-1]);
 const cards=scenes[8]?.querySelectorAll('.theory-card')||[];
 if(cards[1])portrait(cards[1],'rawls','존 롤스');
 if(cards[2])portrait(cards[2],'habermas','위르겐 하버마스');
}
function forSeung(){
 const scenes=[...document.querySelectorAll('#canvas-stage > section.slide')];if(!scenes.length){const m=document.querySelector('.mobile-shell > header');if(m)brand(m);return;}
 scenes.forEach(brand);
 rosterOn(scenes[0]);thanksOn(scenes[scenes.length-1]);
 const cards=scenes[7]?.querySelectorAll('.scholar')||[];
 if(cards[0])aschDiagram(cards[0]);
 if(cards[1])portrait(cards[1],'bandura','앨버트 반두라');
 if(cards[2])portrait(cards[2],'durkheim','에밀 뒤르켐');
 const gate=document.querySelector('#intro-curtain');
 if(gate&&!gate.querySelector('.phhs-gate-logo'))gate.prepend(create('img','phhs-gate-logo',''));
 const logo=gate?.querySelector('.phhs-gate-logo');if(logo){logo.src=asset;logo.alt='포항고 상징';}
}
function forHu(){
 const scenes=[...document.querySelectorAll('#deck > section.slide')];if(!scenes.length)return;
 scenes.forEach(brand);
 const first=scenes.find(s=>s.classList.contains('s1'));
 const last=scenes.find(s=>s.classList.contains('s12'));
 rosterOn(first);thanksOn(last);
 const cards=scenes.find(s=>s.classList.contains('s10'))?.querySelectorAll('.scholar-card')||[];
 if(cards[0])portrait(cards[0],'hobbes','토머스 홉스');
 if(cards[1])portrait(cards[1],'kant','임마누엘 칸트');
 if(cards[2])portrait(cards[2],'rawls','존 롤스');
}
function forCha(){
 const stage=document.querySelector('#stage');
 const content=document.querySelector('#slide');
 if(!stage||!content)return;
 brand(stage);
 const title=content.innerText||'';
 if(title.includes('사라지는 유행')||title.includes('세대가 남기는 언어')||title.includes('신조어,')||title.includes('신조어는')){
  if(!content.querySelector('.phhs-cover-roster'))rosterOn(content);
 }
 const ctx=content.querySelector('.scene.context,.context,.scene--context');
 if(ctx&&!ctx.querySelector('.phhs-language-scholars')){
  const panel=create('div','phhs-language-scholars',
   '<div class="phhs-language-item"><img src="./portraits/wittgenstein.jpg" alt="비트겐슈타인 실제 사진"><span><b>비트겐슈타인</b><small>말의 의미와 사용</small></span></div>'+
   '<div class="phhs-language-item"><img src="./portraits/saussure.jpg" alt="소쉬르 실제 사진"><span><b>소쉬르</b><small>언어와 사회적 약속</small></span></div>');
  ctx.appendChild(panel);
 }
 if(content.querySelector('.scene.final,.final,.conclusion') || /FINAL TAKEAWAY|없애야 할 말|이해해야 할 말|결론/.test(title)){
  thanksOn(content);
 }
}
function update(){
 if(id==='shin')forShin();
 if(id==='cha')forCha();
 if(id==='hu')forHu();
 if(id==='seung')forSeung();
 const gate=document.querySelector('#cine-gate');
 if(gate&&!gate.querySelector('.phhs-gate-logo')){
  const img=create('img','phhs-gate-logo','');
  img.src=asset;img.alt='포항고등학교 상징';gate.appendChild(img);
 }
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update()})}
function boot(){
 update();
 let root=id==='cha'?document.querySelector('#slide'):id==='hu'?document.querySelector('#deck'):id==='shin'?document.querySelector('.reveal'):document.querySelector('#canvas-stage');
 if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:id==='cha'});
 // Fixed interval only for frameworks rendering scene roots after this script loaded.
 let retry=0;
 const t=setInterval(()=>{update();retry++;if(retry>=14)clearInterval(t)},600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
