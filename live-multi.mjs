import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.USERPROFILE,'Documents','Pohang-RnE-Studio','node_modules','playwright'));
const url='https://pohang-rne-cinema-2026.khs11235744.workers.dev';
let browser;
const result={base:url,checked_at:new Date().toISOString(),routes:{}};
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 for(const [route,team,selector,expected] of [['/','hub','.card',3],['/shin/','shin','.reveal .slides>section.scene',11],['/cha/','cha','#slide',1],['/hu/','hu','#deck .slide',12]]){
  const pg=await browser.newPage({viewport:{width:1600,height:900}});
  const errors=[],bad=[];
  pg.on('pageerror',e=>errors.push(String(e)));
  pg.on('response',r=>{if(r.status()>=400)bad.push({code:r.status(),url:r.url().slice(0,180)})});
  const response=await pg.goto(url+route,{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response.status(),200,route+' HTTP 200');
  await pg.locator(selector).first().waitFor({timeout:30000});
  const count=await pg.locator(selector).count();
  assert.equal(count,expected,route+' count');
  if(team!=='hub'){
   await pg.locator('#cine-gate').waitFor({timeout:12000});
   const heading=await pg.locator('.cine-gate__team').innerText();assert.ok(heading.includes({'shin':'신진욱','cha':'차민혁','hu':'허준완'}[team]));
   await pg.locator('#cine-start-silent').click();
   await pg.waitForTimeout(1200);
   assert.equal(await pg.locator('#cine-gate').count(),0,'gate removed');
   const v=await pg.locator('#cine-audio').innerText();assert.match(v,/꺼짐/);
   await pg.keyboard.press('q');
   if(team==='shin'){await pg.locator('#qa-root.visible').waitFor({timeout:12000});await pg.keyboard.press('Escape')}
   if(team==='cha'){await pg.locator('#cine-cha-qa.open').waitFor({timeout:12000});assert.match(await pg.locator('#cine-cha-category').innerText(),/30/);await pg.keyboard.press('Escape')}
   if(team==='hu'){await pg.locator('#qaPanel.on').waitFor({timeout:12000});await pg.keyboard.press('Escape')}
  }
  await pg.waitForTimeout(500);
  result.routes[route]={team,code:response.status(),count,errors,bad};
  if(errors.length||bad.length)throw new Error(route+' browser errors '+JSON.stringify({errors,bad}));
  await pg.close();
 }
 console.log('LIVE_MULTITEAM_OK='+JSON.stringify(result));
}catch(e){result.failure=String(e?.stack||e);console.error('LIVE_MULTITEAM_FAIL='+result.failure);process.exitCode=1}
finally{
 fs.mkdirSync('qa',{recursive:true});
 fs.writeFileSync('qa/deployed-live.json',JSON.stringify(result,null,2),'utf8');
 await browser?.close();
}
