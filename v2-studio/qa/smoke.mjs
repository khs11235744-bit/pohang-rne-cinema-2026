import {preview} from 'vite';
import {createRequire} from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(path.join(process.env.USERPROFILE,'Documents','Pohang-RnE-Studio','node_modules','playwright'));
const root=process.cwd(),out=path.join(root,'qa','screens');
fs.mkdirSync(out,{recursive:true});
const server=await preview({preview:{host:'127.0.0.1',port:4399,strictPort:true}});
let browser,results=[];
try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
 const teams=[['shin',18,32],['cha',19,30],['hu',19,30],['seung',18,24]];
 for(const [team,expected,expectedQ] of teams){
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1,acceptDownloads:false});
  const errors=[],consoleErrors=[],badRequests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400)badRequests.push({code:r.status(),url:r.url().slice(0,150)})});
  const response=await page.goto('http://127.0.0.1:4399/'+team+'/',{waitUntil:'networkidle',timeout:70000});
  assert.equal(response.status(),200,'HTTP 200 '+team);
  await page.locator('#intro').waitFor();
  assert.ok((await page.locator('#intro .intro-roster span').count())>=2,'roster '+team);
  const image=await page.locator('#intro-school img').count();
  await page.locator('#enter-silent').click();
  await page.locator('.slide-frame').waitFor();
  assert.equal(await page.evaluate(()=>window.RNEV2.slides),expected,'slide count '+team);
  await page.waitForTimeout(300);
  await page.screenshot({path:path.join(out,team+'-cover.jpg'),type:'jpeg',quality:82});
  const indices=await page.evaluate(()=>{const d=window.RNEV2.data;return{portrait:d.slides.findIndex(s=>s.kind==='portrait'),case:d.slides.findIndex(s=>s.kind==='case'),method:d.slides.findIndex(s=>s.kind==='method'),bars:d.slides.findIndex(s=>s.kind==='bars'),flow:d.slides.findIndex(s=>s.kind==='flow'),queue:d.slides.findIndex(s=>s.kind==='queue')}});
  for(const key of ['portrait','case','method','bars','flow','queue']){
   const idx=indices[key];if(idx<0)continue;
   await page.evaluate(i=>window.RNEV2.go(i),idx);await page.waitForTimeout(key==='queue'?1400:450);
   await page.screenshot({path:path.join(out,team+'-'+key+'.jpg'),type:'jpeg',quality:76});
  }
  const overflow=await page.evaluate(()=>{
   let box=document.querySelector('.frame-main'),copy=document.querySelector('.copy'),visual=document.querySelector('.visual'),foot=document.querySelector('.frame-foot');
   let a=box.getBoundingClientRect(),b=copy.getBoundingClientRect(),v=visual.getBoundingClientRect(),f=foot.getBoundingClientRect();
   return{main:{x:a.x,y:a.y,w:a.width,h:a.height},copyBottom:b.bottom,visualBottom:v.bottom,footTop:f.top,within:b.bottom<f.top+8&&v.bottom<f.top+8};
  });
  await page.evaluate(i=>window.RNEV2.go(i),expected-1);await page.waitForTimeout(280);
  assert.match(await page.locator('.ending-thanks').innerText(),/감사합니다/);
  await page.screenshot({path:path.join(out,team+'-end.jpg'),type:'jpeg',quality:83});
  await page.keyboard.press('n');await page.locator('#script-popup:not([hidden])').waitFor();
  assert.equal(await page.locator('.script-item').count(),expected);
  await page.locator('#script-popup [data-close]').click();
  await page.keyboard.press('q');await page.locator('#qa-popup:not([hidden])').waitFor();
  const qCount=await page.evaluate(()=>window.RNEV2.data.questions.length);
  assert.equal(qCount,expectedQ);await page.locator('#qa-reveal').click();
  assert.equal(await page.locator('#qa-answer').isVisible(),true);await page.locator('#qa-popup [data-close]').click();
  const scriptR=await page.request.get('http://127.0.0.1:4399/'+team+'/script.html');
  assert.equal(scriptR.status(),200,'printable script '+team);
  assert.ok((await scriptR.text()).includes('7분 발표 대본'));
  const popupP=page.waitForEvent('popup',{timeout:12000});
  await page.locator('#tools-speaker').click();
  const popup=await popupP;
  await popup.locator('#speaker-script').waitFor({timeout:20000});
  const note=await popup.locator('#speaker-script').innerText();
  assert.ok(note.length>60,'presenter script '+team);
  await popup.locator('#p-prev').click();
  await page.waitForTimeout(500);
  const synced=await page.evaluate(()=>window.RNEV2.current());
  assert.equal(synced,expected-2,'presenter sync '+team);
  await popup.close();
  await page.close();
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push('mobile: '+e));
  await mobile.goto('http://127.0.0.1:4399/'+team+'/?demo=1',{waitUntil:'domcontentloaded',timeout:60000});
  await mobile.locator('.slide-frame').waitFor();
  await mobile.screenshot({path:path.join(out,team+'-mobile.jpg'),type:'jpeg',quality:78});
  const mob=await mobile.evaluate(()=>{
   const r=document.querySelector('.slide-frame').getBoundingClientRect();
   return{w:r.width,h:r.height,scrollW:document.querySelector('.slide-frame').scrollWidth,scrollH:document.querySelector('.slide-frame').scrollHeight};
  });
  await mobile.close();
  results.push({team,status:200,slides:expected,questions:expectedQ,portrait:indices.portrait+1,method:indices.method+1,ending:true,presenterSync:true,geometry:overflow,mobile:mob,errors,consoleErrors,badRequests});
  console.log('TEAM_QA '+team+' '+JSON.stringify(results.at(-1)));
  if(errors.length||badRequests.length)throw Error('Browser runtime errors '+team);
 }
 const hub=await browser.newPage({viewport:{width:1440,height:900}});
 await hub.goto('http://127.0.0.1:4399/',{waitUntil:'domcontentloaded'});
 assert.equal(await hub.locator('.card').count(),4);
 await hub.screenshot({path:path.join(out,'hub.jpg'),type:'jpeg',quality:80});
 await hub.close();
 fs.writeFileSync(path.join(root,'qa','browser-report.json'),JSON.stringify({passed:true,teams:results},null,2),'utf8');
 console.log('ALL_QA_PASSED');
}catch(e){
 console.error('BROWSER_QA_FAILED '+String(e?.stack||e));
 fs.writeFileSync(path.join(root,'qa','browser-report.json'),JSON.stringify({passed:false,teams:results,failure:String(e?.stack||e)},null,2),'utf8');process.exitCode=1;
}finally{await browser?.close();await new Promise(r=>server.httpServer.close(r));}
