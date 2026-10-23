import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root=path.join(process.env.USERPROFILE,'Documents','KHS_RNE_2026','MultiTeamCinema_20261023','site');
const {chromium}=createRequire(import.meta.url)(path.join(process.env.USERPROFILE,'Documents','Pohang-RnE-Studio','node_modules','playwright'));
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 let url=new URL(req.url,'http://localhost:4455').pathname;
 let rel=decodeURIComponent(url);
 if(rel.endsWith('/'))rel+='index.html';
 const file=path.resolve(root,'.'+rel);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
await new Promise(ok=>server.listen(4455,'127.0.0.1',ok));
let browser;
try{
 browser=await chromium.launch({headless:true,channel:'chrome',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:4455/',{waitUntil:'networkidle',timeout:60000});
 assert.equal(await page.locator('.card').count(),4);
 const urls=await page.locator('.card nav a:first-child').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')));
 assert.ok(urls.every(u=>u.startsWith('./v2/')));
 await page.close();
 const results=[];
 for(const [team,count,questions] of [['shin',18,32],['cha',19,30],['hu',19,30],['seung',18,24]]){
  const p=await browser.newPage({viewport:{width:1600,height:900}});
  const bad=[],errors=[];
  p.on('response',r=>{if(r.status()>=400)bad.push({status:r.status(),url:r.url().slice(0,170)})});
  p.on('pageerror',e=>errors.push(String(e)));
  const res=await p.goto('http://127.0.0.1:4455/v2/'+team+'/',{waitUntil:'networkidle',timeout:65000});
  assert.equal(res.status(),200,team);
  await p.locator('#intro').waitFor({timeout:10000});
  assert.equal(await p.locator('#intro img').evaluate(e=>e.naturalWidth>0),true,team+'logo');
  await p.locator('#enter-silent').click();
  await p.locator('.slide-frame').waitFor({timeout:20000});
  assert.equal(await p.evaluate(()=>window.RNEV2.slides),count);
  const details=await p.request.get('http://127.0.0.1:4455/v2/'+team+'/script.html');assert.equal(details.status(),200);
  const doc=await p.request.get('http://127.0.0.1:4455/v2/docs/'+team+'_7min_RNE_script.docx');assert.equal(doc.status(),200,team+' docx');
  const docbytes=(await doc.body()).length;assert.ok(docbytes>40000,team+' docx bytes');
  await p.evaluate(()=>window.RNEV2.go(window.RNEV2.data.slides.findIndex(s=>s.kind==='portrait'&&s.portraits?.length)));
  await p.waitForTimeout(500);
  assert.equal(await p.locator('.portrait-pictures img').evaluate(e=>e.complete&&e.naturalWidth>0),true,team+' portrait load');
  if(team==='hu'){
   await p.evaluate(()=>window.RNEV2.go(5));
   await p.waitForTimeout(1100);
   const els=await p.locator('.flow-steps .step-item').count();assert.equal(els,4,'hu flow steps');
   const a=await p.locator('.flow-steps .step-item').first().boundingBox();
   const b=await p.locator('.flow-steps .step-item').last().boundingBox();
   assert.ok(Math.abs(a.y-b.y)<15,'single-line flow');
  }
  results.push({team,status:res.status(),slides:count,questions,script:true,docxBytes:docbytes,portrait:true,httpErrors:bad,errors});
  assert.deepEqual(bad,[],team+' broken assets');
  assert.deepEqual(errors,[],team+' runtime');
  await p.close();
 }
 console.log('STAGED_SITE_OK='+JSON.stringify(results));
}catch(err){console.error('STAGED_SITE_FAIL='+String(err?.stack||err));process.exitCode=1}
finally{await browser?.close();await new Promise(ok=>server.close(ok));}
