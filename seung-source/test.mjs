import {preview} from 'vite';
import {createRequire} from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.USERPROFILE,'Documents','Pohang-RnE-Studio','node_modules','playwright'));
const server=await preview({preview:{port:4262,strictPort:true,host:'127.0.0.1'}});
const base='http://127.0.0.1:4262/';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
const dir=path.join(process.cwd(),'qa');
fs.mkdirSync(dir,{recursive:true});
const report={screens:[],errors:[],consoleErrors:[],pixi:false};
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});
 await page.goto(base,{waitUntil:'networkidle',timeout:60000});
 await page.locator('#intro-curtain').waitFor();
 assert.equal(await page.locator('#select-one.selected').count(),1);
 await page.screenshot({path:path.join(dir,'seung-intro.jpg'),type:'jpeg',quality:80});report.screens.push('seung-intro.jpg');
 await page.locator('#select-two').click();
 await page.locator('#start-show').click();
 await page.locator('.slide.active').waitFor();
 assert.equal(await page.locator('.slide').count(),10);
 for(const index of [0,1,3,4,5,6,7,8,9]){
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(index===1?1200:550);
  const step=await page.locator('.slide.active').getAttribute('data-step');
  if(step==='1'){
   await page.waitForTimeout(2100);
   report.pixi=(await page.locator('#queue-stage canvas').count())>0;
   await page.locator('[data-queue=ask]').click();
   assert.match(await page.locator('#queue-feedback').innerText(),/동의|양해/);
  }
  if(['0','1','3','7','9'].includes(step)){
   const filename='seung-slide-'+String(Number(step)+1).padStart(2,'0')+'.jpg';
   await page.screenshot({path:path.join(dir,filename),type:'jpeg',quality:83});report.screens.push(filename);
  }
 }
 await page.keyboard.press('q');await page.locator('#qa.open').waitFor({timeout:5000});
 assert.match(await page.locator('#qa-step').innerText(),/24/);
 await page.locator('#qa-show').click();assert.equal(await page.locator('#qa-answer').isVisible(),true);
 await page.locator('#qa-grade').selectOption('5');
 await page.locator('[data-close]').first().click();
 const p=page.waitForEvent('popup',{timeout:9000});
 await page.keyboard.press('p');
 const popup=await p;
 await popup.locator('#speaker-note').waitFor({timeout:9000});
 assert.ok((await popup.locator('#speaker-note').innerText()).length>100);
 await popup.locator('#speaker-prev').click();
 await page.waitForTimeout(550);
 report.speakerSynced=(await page.locator('.slide.active').getAttribute('data-step'))==='8';
 await popup.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 await mobile.goto(base+'?preview=1',{waitUntil:'domcontentloaded',timeout:60000});
 await mobile.locator('#m-main').waitFor();
 await mobile.screenshot({path:path.join(dir,'seung-mobile.jpg'),type:'jpeg',quality:80});report.screens.push('seung-mobile.jpg');
 await mobile.close();
 report.slides=10;report.duration=420;report.questions=24;report.passed=report.errors.length===0&&report.speakerSynced;
 fs.writeFileSync(path.join(dir,'seung-qa.json'),JSON.stringify(report,null,2),'utf8');
 console.log('SEUNG_QA='+JSON.stringify(report));
 if(!report.passed)process.exitCode=2;
}catch(e){
 report.passed=false;report.failure=String(e?.stack||e);
 fs.writeFileSync(path.join(dir,'seung-qa.json'),JSON.stringify(report,null,2),'utf8');
 console.error('SEUNG_FAILED='+JSON.stringify(report));process.exitCode=1;
}finally{
 await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));
}
