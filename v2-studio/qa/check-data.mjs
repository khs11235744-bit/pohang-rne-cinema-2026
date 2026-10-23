import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const expected={shin:18,cha:19,hu:19,seung:18};
const expectedQ={shin:32,cha:30,hu:30,seung:24};
const issues=[];
const results=[];
for(const [team,count] of Object.entries(expected)){
 const file=path.join(root,'data',team+'.json');
 const data=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(data.slides.length,count,team+' slide count');
 assert.equal(data.slides.reduce((a,s)=>a+s.duration,0),420,team+' duration');
 assert.equal(data.questions.length,expectedQ[team],team+' Q&A');
 assert.ok(data.students.length>=2,team+' students');
 assert.ok(data.sources.length>=3,team+' sources');
 assert.ok(data.slides.every(s=>s.title&&s.claim&&s.notes&&s.source&&s.duration),team+' complete fields');
 assert.equal(new Set(data.slides.map(s=>s.id)).size,count,team+' unique ids');
 const surveyIndex=data.slides.findIndex(s=>s.kind==='method');
 const portraits=data.slides.flatMap(s=>s.portraits||[]);
 assert.ok(surveyIndex>=9,team+' survey method after case and theory');
 assert.ok(portraits.length>=2,team+' historical scholars photos');
 for(const [i,s] of data.slides.entries()){
  if(/실제 확인하지|입증|확정/.test(s.claim) && !/(아니|못|않|한계|구별)/.test(s.claim))issues.push(team+' ambiguous causality slide '+(i+1));
 }
 const scripts=path.join(root,team,'script.html');
 assert.ok(fs.statSync(scripts).size>5000,team+' printable script');
 const notesTotal=data.slides.reduce((n,s)=>n+s.notes.length,0);
 results.push({team,slides:count,totalSeconds:420,questions:data.questions.length,notesCharacters:notesTotal,methodSlide:surveyIndex+1,portraits});
}
console.log('QUALITY_GATES='+JSON.stringify({verified:results,editorialFollowUps:issues}));
if(issues.length)process.exitCode=2;
