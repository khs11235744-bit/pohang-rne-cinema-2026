import {animate as anim,stagger} from 'animejs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags=a=>(a||[]).map(v=>'<span>'+esc(v)+'</span>').join('');
const photos={rawls:'존 롤스',habermas:'위르겐 하버마스',wittgenstein:'루트비히 비트겐슈타인',saussure:'페르디낭 드 소쉬르',hobbes:'토머스 홉스',kant:'임마누엘 칸트',bandura:'앨버트 반두라',durkheim:'에밀 뒤르켐'};
function chain(items,mod){return '<div class="step-chain '+(mod||'')+'">'+(items||[]).map((s,i)=>'<div class="step-item"><b>'+String(i+1).padStart(2,'0')+'</b><strong>'+esc(s)+'</strong></div>').join('<div class="step-arrow">→</div>')+'</div>'}
function bars(items){return '<div class="bar-chart">'+(items||[]).map((x,i)=>'<div class="bar-item"><div class="bar-label">'+esc(x[0])+'</div><div class="bar-track"><span class="bar-fill" data-bar="'+Number(x[1])+'" style="--delay:'+(i*100)+'ms"></span></div><strong>'+Number(x[1]).toFixed(Number.isInteger(x[1])?0:1)+'%</strong></div>').join('')+'</div>'}
export function visual(slide,team){
 const k=slide.kind;
 if(k==='cover')return '<div class="visual-cover"><span class="cover-symbol">'+({shin:'≠',cha:'新',hu:'⚖',seung:'↗'}[team])+'</span><div class="cover-tags">'+tags(slide.tags)+'</div></div>';
 if(k==='receipt')return '<div class="receipt-paper"><div class="receipt-heading">THE FAIR BILL <small>SCENARIO #01</small></div><div class="receipt-line"><span>친구 A</span><b>6,000원</b></div><div class="receipt-line"><span>친구 B</span><b>15,000원</b></div><div class="receipt-total"><span>합계</span><b>21,000원</b></div><div class="receipt-actions"><button data-receipt="equal" aria-pressed="true">1/N</button><button data-receipt="spent" aria-pressed="false">각자 소비액</button></div><div class="receipt-result" id="receipt-result">10,500원 / 10,500원</div><p>버튼을 눌러 부담액을 비교해 보세요.</p></div>';
 if(k==='portrait')return '<div class="portrait-stage">'+((slide.portraits||[]).length?'<div class="portrait-pictures">'+slide.portraits.map(id=>'<figure><img src="../assets/portraits/'+esc(id)+'.jpg" alt="'+esc(photos[id]||id)+'의 초상 사진" loading="eager"><figcaption>'+esc(photos[id]||id)+'</figcaption></figure>').join('')+'</div>':'<div class="concept-lines"><strong>다수의 압력</strong><div class="line-shapes"><i></i><i></i><i></i><i></i></div><small>애쉬의 선 길이 판단 실험을 재구성한 도식</small></div>')+'<div class="portrait-explain"><b>KEY CONCEPT</b><strong>'+esc(slide.idea)+'</strong><small>'+esc(slide.source)+'</small></div></div>';
 if(k==='stat')return '<div class="visual-stats">'+(slide.metrics||[]).map(v=>'<div class="stat-card"><strong>'+esc(v[0])+'</strong><b>'+esc(v[1])+'</b><small>'+esc(v[2]||'')+'</small></div>').join('')+'<div id="stat-deco"></div></div>';
 if(k==='bars')return bars(slide.bars);
 if(k==='compare')return '<div class="compare">'+(slide.compare||[]).map((v,i)=>'<article><small>0'+(i+1)+'</small><h3>'+esc(v[0])+'</h3><strong>'+esc(v[1])+'</strong><p>'+esc(v[2])+'</p></article>').join('')+'</div>';
 if(k==='triad')return '<div class="triad">'+(slide.triad||[]).map((v,i)=>'<article><span class="glyph">'+['Ⅰ','Ⅱ','Ⅲ'][i%3]+'</span><h3>'+esc(v[0])+'</h3><p>'+esc(v[1])+'</p></article>').join('')+'</div>';
 if(k==='process'||k==='model'||k==='scenario')return '<div class="process-visual">'+chain(slide.steps)+'<div class="visual-note">개념 설명 및 제안 모형 · 실제 효과를 실험으로 증명한 결과는 아닙니다.</div></div>';
 if(k==='timeline')return '<div class="timeline">'+(slide.timeline||[]).map((v,i)=>'<article><b>0'+(i+1)+'</b><h3>'+esc(v[0])+'</h3><p>'+esc(v[1])+'</p></article>').join('')+'</div>';
 if(k==='case'){
  if(team==='cha')return '<div class="cha-case-story"><div class="cha-explain">새로운 생활방식의 언어</div><div class="cha-word-pair"><span>혼자 밥을 먹다</span><strong>혼밥</strong></div><div class="cha-process-pills"><span>경험</span><span>표현</span><span>공유</span></div><p>신어의 필요를 설명하는 사례. 사전 표제어의 검증은 뒤 장면에서 분리해 설명합니다.</p></div>';
  if(team==='shin')return '<div class="shin-dilemma"><div class="shin-dilemma-title">만약 친구의 사정이 어렵다면?</div><div class="shin-choices"><article><span>01</span><strong>똑같이 부담</strong><p>평등한 금액</p></article><article><span>02</span><strong>사정을 고려</strong><p>필요에 따른 분담</p></article><article><span>03</span><strong>함께 협의</strong><p>자유로운 합의</p></article></div><div class="shin-dilemma-note">배려는 ‘다른 사람의 추가 부담’을 강요할 면허가 아닙니다.</div></div>';
  if(team==='seung')return '<div class="seung-asch-demo"><div class="seung-line-note">애쉬의 선 길이 판단 실험 · 원실험을 단순화한 재구성</div><div class="seung-lines"><div class="seung-reference"><small>기준선</small><i></i><b>?</b></div><div class="seung-answer-options"><div><small>A</small><i></i></div><div><small>B</small><i></i></div><div><small>C</small><i></i></div></div></div><p>다수가 같은 답을 말해도 자신의 관찰과 비교해 판단해야 합니다.</p></div>';
  return '<div class="case-file"><div class="case-label">CASE FILE / EVIDENCE</div><h3>'+esc(slide.claim)+'</h3><div class="case-facts">'+(slide.caseFacts||[['조사 대상','실제 사건']]).map(v=>'<p><small>'+esc(v[0])+'</small><strong>'+esc(v[1])+'</strong></p>').join('')+'</div><div class="case-warning">실제 사건과 가상 사례는 구분하여 설명합니다.</div></div>';
 }

 if(k==='method')return '<div class="method">'+(slide.stats||[]).map(v=>'<div class="method-stat"><b>'+esc(v[1])+'</b><span>'+esc(v[0])+'</span></div>').join('')+'</div>';
 if(k==='wordcloud')return '<div class="wordcloud">'+(slide.words||[]).map((v,i)=>'<span class="word" data-i="'+i+'">'+esc(v)+'</span>').join('')+'</div>';
 if(k==='question'||k==='choice')return '<div class="questions"><span>청중에게 묻습니다</span><div class="question-choices">'+(slide.choices||['동의한다','다른 관점이 필요하다']).map((v,i)=>'<button class="question-choice" data-choice="'+i+'">'+String(i+1).padStart(2,'0')+'. '+esc(v)+'</button>').join('')+'</div><p class="question-feedback" id="choice-feedback">이 선택은 연구 결과를 수집하는 설문이 아닌 설명용 질문입니다.</p></div>';
 if(k==='map')return '<div class="network-visual" id="network-visual"><div class="network-title">JURISDICTION / EVIDENCE</div>'+chain(slide.nodes,'network-steps')+'</div>';
 if(k==='flow')return '<div class="flow-visual" id="flow-visual"><div class="flow-title">TRANSACTION RECORD / LAWFUL VERIFICATION</div><div class="flow-token" aria-hidden="true">₿</div>'+chain(slide.nodes,'flow-steps')+'<p>※ 실제 범죄 절차가 아닌 증거 흐름을 보여주는 개념적 시각화입니다.</p></div>';
 if(k==='queue')return '<div class="queue-demo"><div id="pixi-queue"><div class="pixi-fallback"><b>①</b><b>②</b><b>③</b><b>④</b><b>⑤</b><b>?</b></div></div><div class="queue-choices">'+(slide.choices||[]).map((v,i)=>'<button data-queue="'+i+'">'+esc(v)+'</button>').join('')+'</div><p class="queue-feedback" id="queue-feedback">선택하면 늦게 온 학생의 위치가 달라집니다.</p></div>';
 if(k==='limit'||k==='limits')return '<div class="limitations">'+(slide.limits||[]).map((v,i)=>'<div><b>0'+(i+1)+'</b><strong>'+esc(v)+'</strong></div>').join('')+'</div>';
 if(k==='closing')return '<div class="ending"><div class="ending-kicker">OUR RESEARCH · THE ANSWER</div><strong class="ending-claim">'+esc(slide.claim)+'</strong><div class="ending-steps">'+tags(slide.closing)+'</div><div class="ending-thanks">경청해 주셔서 감사합니다.</div></div>';
 return '<div class="fallback-visual"><h3>'+esc(slide.claim)+'</h3></div>';
}
let pixiObj=null,chart=null;
export async function activate(slide,team){
 const el=document.querySelector('.slide-frame');if(!el)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const bars=[...el.querySelectorAll('.bar-fill')];requestAnimationFrame(()=>bars.forEach(x=>x.style.width=x.dataset.bar+'%'));
 if(team==='cha'&&!reduced){try{const items=[...el.querySelectorAll('.word')];if(items.length)anim(items,{opacity:[0,1],translateY:[25,0],scale:[.6,1],delay:stagger(130),duration:780,ease:'out(3)'})}catch{}}
 if(team==='shin'&&slide.kind==='stat'&&slide.metrics?.length){try{const v=parseFloat(slide.metrics[0][0]);if(v>=0&&v<=100){const e=document.querySelector('#stat-deco');if(e){const {init}=await import('echarts');if(chart)chart.dispose();chart=init(e);chart.setOption({animationDuration:1200,series:[{type:'pie',radius:['67%','86%'],silent:true,label:{show:false},data:[{value:v,itemStyle:{color:'#1b8069'}},{value:100-v,itemStyle:{color:'#e2d5be'}}]}]});}}}catch(e){console.warn('ECharts decoration unavailable',e)}}
 if(team==='hu'&&(slide.kind==='map'||slide.kind==='flow')&&!reduced){try{const d3=await import('d3');d3.selectAll('.slide-frame .step-item').style('opacity',1).transition().duration(450).delay((d,i)=>i*110).style('box-shadow','0 0 16px #d99d6877')}catch(e){console.warn('D3 animation unavailable',e)}}
 if(team==='seung'&&slide.kind==='queue')await initQueue();
}
export function attachInteractions(){
 document.querySelectorAll('[data-receipt]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-receipt]').forEach(x=>x.setAttribute('aria-pressed',String(b===x)));
  const x=document.querySelector('#receipt-result');if(x)x.textContent=b.dataset.receipt==='spent'?'6,000원 / 15,000원':'10,500원 / 10,500원';
 }));
 document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-choice]').forEach(x=>x.classList.toggle('selected',b===x));
  document.querySelector('#choice-feedback').textContent='선택한 판단: '+b.textContent.trim()+' · 연구 결과가 아닌 가상 상황에 대한 토론입니다.';
 }));
 document.querySelectorAll('[data-queue]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-queue]').forEach(x=>x.classList.toggle('selected',b===x));
  const notes=['친구라도 먼저 기다린 사람에게 불공정할 수 있습니다.','양해를 구할 때는 자유로운 동의 여부를 확인해야 합니다.','일관된 규칙은 명확하지만 예외 상황도 검토해야 합니다.'];
  document.querySelector('#queue-feedback').textContent=notes[Number(b.dataset.queue)]||notes[0];
  if(pixiObj?.joiner){const person=pixiObj.joiner,old=person.x,target=[270,410,700][Number(b.dataset.queue)],start=performance.now(),y0=person.y,y1=Number(b.dataset.queue)===2?260:165;function frame(t){const k=Math.min(1,(t-start)/750),ease=1-Math.pow(1-k,3);person.x=old+(target-old)*ease;person.y=y0+(y1-y0)*ease;if(k<1)requestAnimationFrame(frame)}requestAnimationFrame(frame)}
 }));
}
async function initQueue(){
 const host=document.querySelector('#pixi-queue');if(!host)return;
 const {Application,Graphics,Text}=await import('pixi.js');
 try{
  const app=new Application();await app.init({width:760,height:340,backgroundAlpha:0,antialias:true,preference:'webgl'});
  if(!document.contains(host)){app.destroy();return}
  host.querySelector('.pixi-fallback')?.remove();host.appendChild(app.canvas);
  const g=new Graphics().roundRect(16,25,140,98,15).fill(0x0c897c).stroke({width:3,color:0x143d4b});app.stage.addChild(g);
  const title=new Text({text:'급식 배식대',style:{fontFamily:'Malgun Gothic',fontSize:20,fontWeight:'bold',fill:'#ffffff'}});title.x=22;title.y=63;app.stage.addChild(title);
  const lane=new Graphics().roundRect(190,140,540,60,25).fill({color:0xffffff,alpha:.5});app.stage.addChild(lane);
  const cols=[0x61bba8,0xf0bc77,0x92b6de,0xb5d19a,0xe8a48a];
  function actor(x,c,label){const sprite=new Graphics().roundRect(-28,-2,56,68,15).fill(c).stroke({width:3,color:0x1b4e52}).circle(0,-28,25).fill(0xffe0b5).stroke({width:3,color:0x1b4e52});sprite.x=x;sprite.y=165;app.stage.addChild(sprite);const n=new Text({text:String(label),style:{fontSize:17,fill:'#173a42',fontWeight:'bold'}});n.x=x-6;n.y=204;app.stage.addChild(n);return sprite}
  for(let i=0;i<5;i++)actor(240+i*92,cols[i],i+1);
  const joiner=actor(700,0xee8265,'?');joiner.y=260;
  pixiObj={app,joiner};
 }catch(e){console.warn('PixiJS queue fallback',e)}
}
