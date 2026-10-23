import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root=path.resolve(process.cwd(),'site');
const out=path.resolve(process.cwd(),'qa');
fs.mkdirSync(out,{recursive:true});
const {chromium}=createRequire(import.meta.url)(path.join(process.env.USERPROFILE,'Documents','Pohang-RnE-Studio','node_modules','playwright'));
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.webp':'image/webp','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost:4193');
 let rel=decodeURIComponent(url.pathname);
 if(rel.endsWith('/'))rel+='index.html';
 const p=path.resolve(root,'.'+rel);
 if(!(p===root||p.startsWith(root+path.sep))){res.writeHead(403).end();return}
 if(!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404).end();return}
 res.writeHead(200,{'Content-Type':types[path.extname(p).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
 fs.createReadStream(p).pipe(res);
});
await new Promise(r=>server.listen(4193,'127.0.0.1',r));
let browser;
const report={};
try{
 browser=await chromium.launch({headless:true,channel:'chrome'});
 for(const [team,max,marker] of [['shin',11,'.reveal .slides>section.scene'],['cha',12,'#slide'],['hu',12,'#deck .slide']]){
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  const errors=[],bad=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))bad.push({code:r.status(),url:r.url().slice(0,130)})});
  const response=await page.goto('http://127.0.0.1:4193/'+team+'/?preview=1',{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response.status(),200);
  await page.waitForTimeout(team==='cha'?2000:900);
  let slides=team==='cha'?(await page.evaluate(()=>typeof window.jumpTo==='function'?12:0)):await page.locator(marker).count();
  assert.equal(slides,max,team+' slide count');
  const occluded=await page.evaluate(team=>{
    const el=team==='shin'?document.querySelector('#chrome'):team==='hu'?document.querySelector('#topui .toolrow'):document.querySelector('.controls');
    return el?getComputedStyle(el).display:'notfound';
  },team);
  assert.equal(occluded,'none',team+' bottom/control hidden');
  await page.screenshot({path:path.join(out,team+'-start.jpg'),type:'jpeg',quality:77});
  if(team==='shin'){await page.evaluate(()=>window.rneDeck.slide(10));await page.waitForTimeout(950);}
  if(team==='hu'){await page.evaluate(()=>document.querySelectorAll('#deck .slide')[11].classList.contains('active') ? true : (window.go?.(11),true));await page.waitForTimeout(950);}
  if(team==='cha'){await page.evaluate(()=>window.jumpTo(11));await page.waitForTimeout(950);}
  await page.screenshot({path:path.join(out,team+'-final.jpg'),type:'jpeg',quality:77});
  if(team==='cha'){
   await page.locator('#cine-cha-qopen').waitFor({timeout:15000});
   await page.keyboard.press('q');await page.locator('#cine-cha-qa.open').waitFor({timeout:5000});
   const n=await page.locator('#cine-cha-category').innerText();assert.match(n,/30/,'Cha 30 questions');
   await page.locator('#cine-cha-toggle').click();assert.ok(await page.locator('#cine-cha-answer').isVisible(),'Cha answer visible');
   await page.keyboard.press('Escape');
  }
  if(team==='hu'){
   await page.keyboard.press('q');await page.waitForTimeout(220);
   assert.ok(await page.locator('#qaPanel.on').count()>=1,'Hu 30 question panel');
   await page.keyboard.press('Escape');
  }
  const sound=await page.locator('#cine-audio').innerText();
  assert.match(sound,/꺼짐/);
  report[team]={slides,controlsHidden:occluded,audio: sound,errors,bad,scriptCount:await page.locator('script').count()};
  if(errors.length||bad.length)throw new Error(team+' errors '+JSON.stringify({errors,bad}));
  await page.close();
 }
 const seung=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1,args:['--enable-unsafe-swiftshader']});
 const seungErrors=[],seungBad=[];
 seung.on('pageerror',e=>seungErrors.push(String(e)));
 seung.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))seungBad.push({status:r.status(),url:r.url()})});
 const seungR=await seung.goto('http://127.0.0.1:4193/seung/?preview=1',{waitUntil:'networkidle',timeout:60000});
 assert.equal(seungR.status(),200);
 await seung.locator('.slide.active').waitFor({timeout:15000});
 assert.equal(await seung.locator('.slide').count(),10);
 await seung.keyboard.press('ArrowRight');
 await seung.waitForTimeout(2400);
 const pCanvas=await seung.locator('#queue-stage canvas').count();
 assert.ok(pCanvas>0,'PixiJS cafeteria animation canvas');
 await seung.locator('[data-queue=ask]').click();
 await seung.screenshot({path:path.join(out,'seung-queue.jpg'),type:'jpeg',quality:80});
 await seung.keyboard.press('q');
 await seung.locator('#qa.open').waitFor({timeout:10000});
 assert.match(await seung.locator('#qa-step').innerText(),/24/);
 await seung.keyboard.press('Escape');
 report.seung={slides:10,pixiCanvas:pCanvas,questions:24,errors:seungErrors,bad:seungBad};
 if(seungErrors.length||seungBad.length)throw new Error('Seung browser errors '+JSON.stringify(report.seung));
 await seung.close();
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:4193/',{waitUntil:'domcontentloaded'});
 const cards=await page.locator('.card').count();assert.equal(cards,4);
 await page.screenshot({path:path.join(out,'hub.jpg'),type:'jpeg',quality:82});
 report.hub={cards,links:await page.locator('.card a').count()};
 await page.close();
 const gate=await browser.newPage({viewport:{width:1280,height:800}});
 await gate.goto('http://127.0.0.1:4193/shin/',{waitUntil:'domcontentloaded'});
 await gate.locator('#cine-gate').waitFor();
 await gate.locator('#cine-two').click();await gate.locator('#cine-start-sound').click();
 await gate.waitForTimeout(900);
 assert.equal(await gate.locator('#cine-gate').count(),0);
 const audio=await gate.locator('#cine-audio').innerText();
 report.gate={speakers:await gate.evaluate(()=>window.KHSRNECinema.getSpeakers()),audio};
 await gate.close();
 console.log('MULTI_QA_OK='+JSON.stringify(report));
 fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify(report,null,2),'utf-8');
}catch(e){console.error('MULTI_QA_FAILED='+String(e?.stack||e));fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify({report,error:String(e?.stack||e)},null,2));process.exitCode=1}finally{await browser?.close();await new Promise(r=>server.close(r));}
