import {D,esc} from './scenes.js';
const KEY='khs-seung-2026-v99';
const PERCENT=(a,b)=>Math.round(a/b*1000)/10;
function content(s){
 const stats=D.survey.scales;
 switch(s.kind){
 case 'hero':return '<div class="mobile-hero-visual"><span>①</span><span>②</span><span>?</span></div><p class="m-desc">급식 줄에서 일어나는 아주 평범한 행동이 사회규범에 관한 질문이 됩니다.</p>';
 case 'queue':return '<div class="mobile-choices"><button data-q="allow">친구니까 합류해도 된다</button><button data-q="ask">먼저 기다린 사람에게 물어본다</button><button data-q="deny">마지막에 줄을 선다</button></div><div id="mobile-feedback" class="m-desc">이 화면은 토론을 위한 가상 상황입니다. 선택을 해 보세요.</div>';
 case 'method':return '<div class="mobile-stat"><b>99건</b><span>자발적 동의 응답</span></div><div class="mobile-three"><b>1학년 63건</b><b>2학년 16건</b><b>3학년 20건</b></div><p class="m-desc">문항별로 0은 유효하지 않은 값으로 제외했습니다. 중복 가능성 3쌍은 확인이 필요합니다.</p>';
 case 'contrast':return '<div class="mobile-double"><div><b>55.9%</b><span>친구가 판단에 영향</span><small>52/93건</small></div><div><b>33.7%</b><span>다수가 새치기하면 모방</span><small>28/83건</small></div></div><p class="m-desc">다른 질문을 비교한 결과이며 인과적 행동 효과는 아닙니다.</p>';
 case 'repeat':return '<div class="mobile-double"><div><b>43.8%</b><span>반복 위반 수용</span><small>39/89건</small></div><div><b>53.1%</b><span>다수 행동의 판단 영향</span><small>51/96건</small></div></div>';
 case 'silence':return '<div class="mobile-stat"><b>53.5%</b><span>새치기를 봐도 그냥 넘긴다 · 53/99건</span></div><p class="m-desc">상황에 따라 다르다는 응답은 32건, 직접 말한다는 응답은 7건입니다. 침묵이 곧 동의는 아닙니다.</p>';
 case 'rules':return '<div class="mobile-bars">'+D.survey.categories.why.map(a=>'<div><span>'+esc(a[0])+'</span><div class="track"><i style="width:'+(a[1]/99*100)+'%"></i></div><strong>'+a[1]+'건</strong></div>').join('')+'</div>';
 case 'theory':return '<div class="mobile-theories"><article><b>애쉬 · 동조</b><p>다수 의견이 판단에 영향을 줄 수 있다.</p></article><article><b>반두라 · 관찰학습</b><p>타인의 행동·결과에서 학습할 수 있다.</p></article><article><b>뒤르켐 · 사회적 사실</b><p>사회규범이 개인 행동을 제약한다.</p></article></div>';
 case 'policy':return '<div class="mobile-double"><div><b>59.6%</b><span>벌점의 감소 효과 기대</span><small>56/94건</small></div><div><b>60.8%</b><span>감시의 감소 효과 기대</span><small>59/97건</small></div></div><p class="m-desc">실제 정책 효과를 검증한 결과가 아닙니다.</p>';
 case 'finale':return '<div class="mobile-final">OUR<br>RULES</div><p class="m-desc">다수가 하는 행동이 곧 정당한 규칙은 아닙니다. 공정성을 이해하고 지키는 문화가 중요합니다.</p><p class="m-desc">‘미디어와 사회 인식의 변화’는 온라인 사회적 신호를 비교하는 후속 탐구로 연결합니다.</p>';
 }
 return '';
}
export function startMobile(){
 const q=new URLSearchParams(location.search);let index=0,speakers=localStorage.getItem(KEY+'-speakers')==='2'?2:1;
 const app=document.querySelector('#app');
 app.innerHTML='<div class="mobile-shell"><header><div><small>2026 PHHS / R&E FIELDNOTES</small><strong>신승연팀 · SCHOOL LIFE LAB</strong></div><span id="m-count">01/10</span></header><section id="m-gate"><h1>다른 사람이 하면<br><em>나도 괜찮을까?</em></h1><p>급식 줄의 집단행동과 규범을 연구하다</p><div class="m-select"><button id="m-one">1명 발표</button><button id="m-two">2명 발표</button></div><button id="m-start">발표 보기 ▶</button></section><main id="m-main" hidden><div id="m-kicker"></div><h2 id="m-title"></h2><p id="m-lead"></p><section id="m-content"></section><div id="m-source">출처: 신승연팀 응답 99건 · 문항별 유효N 상이</div></main><nav id="m-nav" hidden><button id="m-prev">◀</button><button id="m-next">다음 장면 ▶</button><button id="m-qa">Q&A</button><button id="m-ref">출처</button></nav><div id="m-overlay" hidden></div></div>';
 const $=x=>document.querySelector(x);
 const show=()=>{
  const s=D.slides[index];
  $('#m-count').textContent=String(index+1).padStart(2,'0')+'/10';
  $('#m-kicker').textContent=s.kicker+' · '+(speakers===1?'대표 발표자':index<5?'발표자 1':'발표자 2');
  $('#m-title').textContent=s.title;$('#m-lead').textContent=s.lead;$('#m-content').innerHTML=content(s);
  $('#m-main').scrollTop=0;$('#m-prev').disabled=index===0;$('#m-next').disabled=index===9;
  $('#m-content').querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{
   const texts={allow:'친구라는 이유로 허용해도 먼저 기다린 사람의 공정성이 침해될 수 있습니다.',ask:'이해당사자의 의견을 확인하되, 누군가에게 불이익이 생기는지도 고려해야 합니다.',deny:'일관성 있는 규칙입니다. 다만 잠시 자리를 비운 상황과 새치기는 다르게 판단할 수 있습니다.'};
   $('#mobile-feedback').textContent=texts[b.dataset.q];
  }));
 };
 const move=d=>{index=Math.min(9,Math.max(0,index+d));show()};
 const open=(kind)=>{
  const layer=$('#m-overlay');layer.hidden=false;layer.innerHTML='<div class="m-modal"><button id="m-close">닫기 ×</button><div>'+ (kind==='ref'?'<h3>연구자료와 출처</h3>'+D.sources.map(x=>'<div class="m-ref"><b>'+esc(x.label)+'</b><p>'+esc(x.description)+'</p>'+(x.url?'<a href="'+esc(x.url)+'" target="_blank">원문 보기 ↗</a>':'')+'</div>').join(''):'<h3>STAT 예상 질문 24개</h3>'+D.questions.map((x,i)=>'<details><summary>'+(i+1)+'. '+esc(x[1])+'</summary><p>'+esc(x[2])+'</p></details>').join('')) +'</div></div>';
  $('#m-close').addEventListener('click',()=>layer.hidden=true);
 };
 function choose(n){speakers=n;localStorage.setItem(KEY+'-speakers',String(n));$('#m-one').classList.toggle('selected',n===1);$('#m-two').classList.toggle('selected',n===2)}
 $('#m-one').addEventListener('click',()=>choose(1));$('#m-two').addEventListener('click',()=>choose(2));choose(speakers);
 $('#m-start').addEventListener('click',()=>{$('#m-gate').hidden=true;$('#m-main').hidden=false;$('#m-nav').hidden=false;show()});
 $('#m-prev').addEventListener('click',()=>move(-1));$('#m-next').addEventListener('click',()=>move(1));
 $('#m-qa').addEventListener('click',()=>open('qa'));$('#m-ref').addEventListener('click',()=>open('ref'));
 let touch=0;
 $('#m-main').addEventListener('touchstart',e=>touch=e.touches[0].clientX,{passive:true});
 $('#m-main').addEventListener('touchend',e=>{const v=e.changedTouches[0].clientX-touch;if(Math.abs(v)>85)move(v<0?1:-1)},{passive:true});
 if(q.has('preview')||q.has('audience'))$('#m-start').click();
}
