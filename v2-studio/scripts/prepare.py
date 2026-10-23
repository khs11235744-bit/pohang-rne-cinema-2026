# -*- coding: utf-8 -*-
"""Prepare four truthful, self-contained 18-19 slide, 420-second research talks."""
from pathlib import Path
import json, re, html, math
from decimal import Decimal
home=Path.home()/'Documents'/'KHS_RNE_2026'
hub=home/'MultiTeamCinema_20261023'
root=hub/'v2-studio'
TEAM_IDS=['shin','cha','hu','seung']
meta={
'shin':('신진욱팀','평등과 형평, 서로의 사정을 고려하는 합의','18장'),
'cha':('차민혁팀','언어 사용의 맥락과 신조어의 문화적 역할','19장'),
'hu':('허준완팀','국제수사·전자증거·적법절차의 관계','19장'),
'seung':('신승연팀','집단행동·사회적 신호·규범 형성','18장')
}
def load_legacy(file,prefix):
 s=Path(file).read_text(encoding='utf-8')
 k=s.index(prefix)+len(prefix)
 return json.JSONDecoder().raw_decode(s[k:].strip())[0]
qa={
'shin':load_legacy(home/'ShinJinwook_20261022'/'fairness-cinema-web'/'data.js','window.RNE_STORY = ')['questions'],
'cha':json.loads((hub/'site'/'cha'/'qa.json').read_text(encoding='utf-8')),
'hu':load_legacy(hub/'site'/'hu'/'index.html','const APP=')['qas'],
'seung':load_legacy(hub/'seung-source'/'data.js','window.SEUNG_RNE = ')['questions']
}
def question(q):
 if isinstance(q,list):return {'group':str(q[0]),'question':str(q[1]),'answer':str(q[2])}
 return {'group':str(q.get('category',q.get('section',q.get('group','연구')))),'question':str(q.get('question',q.get('q',''))),'answer':str(q.get('answer',q.get('a','')))}
def durations(slides,total=420):
 # 14s base + note length weights; keep 7min exact, no fabricated actual speaking pace.
 raw=[len(s['notes']) for s in slides]
 weights=[max(1.4,(n/160)**.72) for n in raw]
 out=[14]*len(slides)
 budget=total-14*len(slides)
 fractions=[budget*w/sum(weights) for w in weights]
 out=[out[i]+math.floor(fractions[i]) for i in range(len(slides))]
 rem=total-sum(out)
 order=sorted(range(len(slides)),key=lambda i:fractions[i]-math.floor(fractions[i]),reverse=True)
 for i in order[:rem]:out[i]+=1
 # Keep final within 20-28s where possible; maintain precise total.
 if out[-1]>25:
  spare=out[-1]-25;out[-1]=25
  for i in sorted(range(len(slides)-1),key=lambda j:raw[j],reverse=True):
   room=max(0,35-out[i]);give=min(room,spare);out[i]+=give;spare-=give
   if spare==0:break
 assert sum(out)==total
 assert all(13<=x<=37 for x in out),out
 return out
def E(s):return html.escape(str(s),quote=True)
reports=[]
for team in TEAM_IDS:
 p=root/'data'/f'{team}.json'
 d=json.loads(p.read_text(encoding='utf-8'))
 out=durations(d['slides'])
 for i,(s,t) in enumerate(zip(d['slides'],out)):
  s['duration']=t
  s['num']=i+1
  s['speakerOne']='대표 발표자'
  s['speakerTwo']='발표자 1' if i<math.ceil(len(out)/2) else '발표자 2'
 d['duration']=420
 d['questions']=[question(x) for x in qa[team]]
 # Metadata used to differentiate source statements from suggested philosophical interpretations.
 d['researchStatus']='학생의 인식조사이며 조사 결과와 이론적 해석을 구분'
 d['rubric']={'researchContent':40,'sourceIntegrity':25,'presentationOrganization':20,'visualCommunication':15}
 d['reviewGoal']='95/100을 목표로 검수 중. 실제 심사위원 점수가 아님.'
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 assert len(d['slides'])>=18
 assert all(s.get('source') and s.get('claim') and s.get('notes') for s in d['slides'])
 assert len(d['questions'])>=20
 assert not any(x in json.dumps(d['slides'],ensure_ascii=False) for x in ['10월 16일','10월 15일','10월 22일'])
 dest=root/team
 dest.mkdir(exist_ok=True)
 head='<h1>'+E(d['teamName'])+' — 7분 발표 대본</h1><p><b>'+E(d['project'])+'</b></p><p>연구 참여: '+E(' · '.join(d['students']))+'</p><p>총 '+str(len(d['slides']))+'장 / '+str(sum(out))+'초. 1인 또는 2인 역할 배정 가능. 말하기 속도는 학생 리허설로 확인해야 합니다.</p>'
 chapters=[]
 md=['# '+d['teamName']+' — 7분 발표 대본','', '**연구 주제:** '+d['project'],'**연구 학생:** '+', '.join(d['students']),'**구성:** '+str(len(out))+'장 · 420초','']
 for i,s in enumerate(d['slides']):
  sec=f'{s["duration"]}초'
  person='1인: 대표 발표자 / 2인: '+s['speakerTwo']
  chapters.append('<article><h2>'+str(i+1).zfill(2)+'장 · '+E(s['title'])+' <small>['+sec+']</small></h2><p class="speaker">'+E(person)+'</p><blockquote>'+E(s['notes'])+'</blockquote><p class="source">근거: '+E(s.get('source',''))+'</p><p class="lesson"><b>이 장면의 주장:</b> '+E(s['claim'])+'</p></article>')
  md.extend(['## '+str(i+1).zfill(2)+'장 · '+s['title']+' ('+sec+')','**발표자:** '+person,'**화면 핵심:** '+s['claim'],'',s['notes'],'','*근거: '+s.get('source','')+'*',''])
 qa_items=''.join('<details><summary><b>'+str(i+1).zfill(2)+'</b> '+E(q['question'])+'</summary><p><small>'+E(q['group'])+'</small></p><p>'+E(q['answer'])+'</p></details>' for i,q in enumerate(d['questions']))
 h='''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'''+E(d['teamName'])+''' 7분 발표 대본</title><style>
 *{box-sizing:border-box}body{margin:0;font-family:"Malgun Gothic","Noto Sans KR",sans-serif;background:#f6f5f0;color:#183244;font-size:15px;line-height:1.68}
 main{width:min(960px,calc(100% - 34px));margin:35px auto 85px;background:white;padding:50px 53px;border:1px solid #d7e1de;box-shadow:0 15px 40px #0001}
 h1{font-size:38px;line-height:1.3;letter-spacing:-.05em;margin:8px 0 14px}h2{font-size:22px;line-height:1.35;letter-spacing:-.035em;margin:0 0 9px;color:#0d685e}
 h2 small{color:#986c42;font-size:15px}article{border-top:2px solid #b3d6d0;padding:22px 0 18px;page-break-inside:avoid}
 .speaker{font-size:13px;font-weight:850;color:#517884;margin:0 0 11px}blockquote{background:#f2f6f5;border-left:4px solid #167b72;padding:18px 20px;margin:0;color:#203c45;font-size:17px;line-height:1.78}
 .source{font-size:12px;color:#65858a;margin:11px 0}.lesson{color:#3c5d67;font-size:13px}
 details{border-bottom:1px solid #cee0dc;padding:13px 0}summary{cursor:pointer;font-weight:900;font-size:16px}details p{margin:10px 0 8px;padding-left:10px}
 header{margin-bottom:30px}header a{color:#116c60;text-decoration:none;font-weight:900}
 .toc{background:#e9f4f0;border-radius:11px;padding:18px;margin:25px 0;color:#174e4b}
 @media print{body{background:white}main{width:100%;margin:0;padding:20px;box-shadow:none;border:0}h1{font-size:27px}h2{font-size:17px}blockquote{font-size:13px;padding:10px 13px}article{padding:14px 0;page-break-inside:avoid}.toc{display:none}header a{display:none}}
 </style></head><body><main><header><a href="./">← 발표 화면으로 돌아가기</a>'''+head+'''</header><div class="toc">발표자 화면에서 1인·2인 설정을 선택할 수 있습니다. 대본을 실제로 읽어 보고 학생의 말하기 속도에 맞춰 조절해 주세요. 연구기간은 본편에서는 생략하지만 원자료에 남겨 둡니다.</div><h2>슬라이드별 발표 대본</h2>'''+''.join(chapters)+'''<h2>심사위원 예상 질문 / 모범답안 '''+str(len(d['questions']))+'''문항</h2>'''+qa_items+'''<p>이 문서는 최종 연구심사를 대체하지 않습니다. 출처·유효표본·인과관계의 한계를 함께 검토하세요.</p></main></body></html>'''
 h=h.replace('<h2>슬라이드별 발표 대본</h2>', '<p><a href="../docs/'+team+'_7min_RNE_script.docx" download>Word 발표 대본 다운로드 ↓</a> · <a href="javascript:window.print()">현재 자료 인쇄</a></p><h2>슬라이드별 발표 대본</h2>')
 (dest/'script.html').write_text(h,encoding='utf-8')
 (root/'docs'/f'{team}_7분_발표대본.md').write_text('\n'.join(md),encoding='utf-8')
 reports.append({'team':team,'slides':len(d['slides']),'seconds':sum(out),'range':(min(out),max(out)),'questions':len(d['questions']),'notes_chars':sum(len(s['notes']) for s in d['slides'])})
print('ALL_TEAMS_READY',json.dumps(reports,ensure_ascii=False))
