# -*- coding: utf-8 -*-
import pathlib,json,html,re
root=pathlib.Path.home()/'Documents'/'KHS_RNE_2026'/'MultiTeamCinema_20261023'/'site'/'cha'
qpath=root/'qa.json'
questions=json.loads(qpath.read_text(encoding='utf-8'))
for q in questions:
 if q['number']==6:
  q['answer']='포항고 학생의 연구 참여 동의 응답 102건을 잠정 분석했습니다. 동일 인적사항의 반복 제출 가능성을 점검하고 있으며, 단일 학교 조사이므로 전국 청소년에게 일반화할 수 없습니다.'
 if q['number']==22:
  q['question']='‘혼밥’ 사례를 사전과 어떻게 연결했습니까?'
  q['answer']='혼자 식사하는 생활문화를 표현한 ‘혼밥’을 국립국어원 우리말샘과 같은 개방형 사전의 신어 사례로 설명했습니다. 우리말샘 수록이 곧 표준국어대사전의 등재나 표준어 인정이라는 뜻은 아닙니다. 실제 사용과 의미의 관계를 비트겐슈타인의 언어게임 관점에서 검토했습니다.'
qpath.write_text(json.dumps(questions,ensure_ascii=False,indent=2),encoding='utf-8')
mobile=root/'mobile.html'
s=mobile.read_text(encoding='utf-8')
s=s.replace('2026.10.16–21 동의 응답 기준.','포항고 학생 동의 응답 기준.')
s=s.replace('‘막내온탑’의 변화','‘혼밥’이 보여주는 언어의 변화')
s=s.replace('임자원(2026)은 2006~2024년 자료를 분석하여 팬덤의 표현이 더 넓은 사회 영역에서 쓰이게 되는 과정을 보여 줍니다.','혼자 식사하는 생활문화의 변화를 담은 새말 ‘혼밥’을 살펴봅니다. 우리말샘과 표준국어대사전의 차이를 구분합니다.')
s=s.replace('https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART003321511','https://opendict.korean.go.kr/')
s=s.replace('DOCX 대본 다운로드','업데이트된 대본·해답 보기').replace('./ChaMinhyuk_SOLO_7min_Script_QA.docx','./cha-rehearsal.html')
mobile.write_text(s,encoding='utf-8')
sources=root/'sources.html'
s=sources.read_text(encoding='utf-8')
s=s.replace('./ChaMinhyuk_SOLO_7min_Script_QA.docx','./cha-rehearsal.html')
s=s.replace('1인 발표 대본·심사 대비 자료 DOCX 받기','최신 1인·2인 발표 대본과 예상 질문·답변 보기')
sources.write_text(s,encoding='utf-8')
notes_js=(root/'speaker_notes.js').read_text(encoding='utf-8')
prefix='window.CHA_NOTES='
if not notes_js.startswith(prefix):raise ValueError('Speaker notes JS unexpected structure')
notes,_=json.JSONDecoder().raw_decode(notes_js[len(prefix):].strip())
def E(x):return html.escape(str(x),quote=True)
note_html=''.join(f'<section class="note"><h3>{i+1:02d}장 · 발표 대본</h3><p>{E(n)}</p></section>' for i,n in enumerate(notes))
qa_html=''.join(f'<details><summary><b>{q["number"]:02d}</b> {E(q["question"])}</summary><p>{E(q["answer"])}</p></details>' for q in questions)
doc='''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>차민혁팀 · 최신 발표 대본과 STAT 해답</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{background:radial-gradient(circle at 80% 15%,#401459,transparent 50%),#140a25;color:#f8eefb;font:17px/1.65 "Malgun Gothic",sans-serif;margin:0}main{width:min(950px,calc(100% - 34px));margin:45px auto 90px}a{color:#f3e77a}h1{font-size:clamp(30px,5vw,54px);letter-spacing:-.05em;line-height:1.25}h2{color:#fbe873;border-bottom:1px solid #f7de774e;padding-bottom:15px}h3{color:#ff80c3;font-size:22px}.lede{color:#d2bfdf;line-height:1.8}.note,details{margin:14px 0;background:#1f1337;border:1px solid #e97fd15e;border-radius:15px;padding:19px 25px}.note p,details p{margin:9px 0;color:#e3dbe9}summary{cursor:pointer;font-weight:800}summary b{color:#f3e77a;padding-right:9px}.meta{font-size:13px;color:#ddb1dc;text-transform:uppercase;letter-spacing:.1em}.pill{display:inline-block;border:1px solid #ed78cb;padding:7px 15px;border-radius:999px;color:#ffc2e5}</style></head>
<body><main><a href="./">← 차민혁팀 발표로 돌아가기</a><div class="meta">2026 POHANG HIGH SCHOOL / LANGUAGE IN SOCIETY</div><h1>차민혁팀<br><span style="color:#f6eb78">최신 발표 대본 · STAT 예상 질문</span></h1><p class="lede">신조어의 긍정적 기능과 정착·소멸 인식을 조사한 고등학생 연구 발표. 잠정 동의 응답 102건 기준이며 중복 가능성에 대한 추가 확인이 필요합니다. 설문 기간은 발표 화면에서 생략하고 원자료에 보존합니다.</p><span class="pill">연구 결과와 선행 자료를 구분</span><h2>장면별 대본</h2>'''+note_html+'''<h2>심사위원 예상 질문 30개 · 모범답안</h2>'''+qa_html+'''<p><a href="./sources.html">연구 근거와 자료 출처 확인 ↗</a></p></main></body></html>'''
(root/'cha-rehearsal.html').write_text(doc,encoding='utf-8')
print('CHA_FULL_CLEANUP',{'q':len(questions),'notes':len(notes),'old_qa':sum('막내온탑' in json.dumps(q,ensure_ascii=False) for q in questions),'old_mobile':'막내온탑' in s,'html_bytes':len(doc)})
