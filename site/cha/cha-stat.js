/* Cha Minhyuk team / 30 verified questions from the existing teacher DOCX */
(async()=>{'use strict';
 const path='./qa.json';
 let questions=[];
 try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error('Q&A static data unavailable');questions=await r.json();}
 catch(e){console.warn('차민혁팀 질의응답 파일 로딩 실패',e);return}
 if(!Array.isArray(questions)||questions.length<20)return;
 let i=0,answer=false;
 const key='khs-cha-rne-qa-2026';
 const root=document.createElement('div');root.id='cine-cha-qa';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','차민혁팀 연구심사 질문 연습');
 root.innerHTML='<div class="cine-cha-qbox"><div class="cine-cha-qtop"><div><small>STUDENT R&E / STAT QUESTION BANK</small><h2>차민혁팀 · 예상 질문 30개</h2></div><button id="cine-cha-close">닫기 ×</button></div><p id="cine-cha-category"></p><h3 id="cine-cha-question"></h3><p id="cine-cha-answer" hidden></p><div class="cine-cha-qbuttons"><button id="cine-cha-prev">← 이전</button><button id="cine-cha-toggle">모범답안 보기</button><button id="cine-cha-next">다음 →</button><label>내 연습 평가 <select id="cine-cha-score"><option value="">미평가</option><option value="1">1/5</option><option value="2">2/5</option><option value="3">3/5</option><option value="4">4/5</option><option value="5">5/5</option></select></label></div><small id="cine-cha-summary"></small></div>';
 document.body.append(root);
 const openBtn=document.createElement('button');openBtn.id='cine-cha-qopen';openBtn.textContent='STAT 30';openBtn.title='차민혁팀 예상 질문 30개 (Q)';document.body.append(openBtn);
 const $=s=>root.querySelector(s);
 const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
 const draw=()=>{
  const q=questions[i],scores=read(),count=Object.keys(scores).length;
  $('#cine-cha-category').textContent=String(i+1).padStart(2,'0')+' / '+questions.length+' · '+q.section;
  $('#cine-cha-question').textContent=q.question;$('#cine-cha-answer').textContent=q.answer;$('#cine-cha-answer').hidden=!answer;
  $('#cine-cha-toggle').textContent=answer?'모범답안 가리기':'모범답안 보기';
  $('#cine-cha-score').value=scores[q.number]??'';
  const avg=count?(Object.values(scores).reduce((a,b)=>a+Number(b),0)/count).toFixed(2):'—';
  $('#cine-cha-summary').textContent='자체 연습 평가 '+count+'/'+questions.length+' · 평균 '+avg+'/5점 · 실제 심사 점수와 별개';
 };
 const show=()=>{root.classList.add('open');answer=false;draw();$('#cine-cha-toggle').focus()};
 const hide=()=>root.classList.remove('open');
 $('#cine-cha-close').addEventListener('click',hide);
 openBtn.addEventListener('click',show);
 root.addEventListener('click',e=>{if(e.target===root)hide()});
 $('#cine-cha-prev').addEventListener('click',()=>{i=(i-1+questions.length)%questions.length;answer=false;draw()});
 $('#cine-cha-next').addEventListener('click',()=>{i=(i+1)%questions.length;answer=false;draw()});
 $('#cine-cha-toggle').addEventListener('click',()=>{answer=!answer;draw()});
 $('#cine-cha-score').addEventListener('change',e=>{const scores=read();const id=questions[i].number;if(e.target.value)scores[id]=Number(e.target.value);else delete scores[id];localStorage.setItem(key,JSON.stringify(scores));draw()});
 window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&root.classList.contains('open')){hide();e.stopImmediatePropagation();return}
  if(e.key.toLowerCase()==='q'&&!['TEXTAREA','INPUT','SELECT'].includes(e.target?.tagName)){e.preventDefault();e.stopImmediatePropagation();root.classList.contains('open')?hide():show()}
 },true);
 draw();
})();
