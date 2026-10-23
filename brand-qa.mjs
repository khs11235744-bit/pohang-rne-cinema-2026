import http from 'node:http';import path from 'node:path';import fs from 'node:fs';import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.USERPROFILE,'Documents','Pohang-RnE-Studio','node_modules','playwright'));
const root=path.resolve(process.cwd(),'site');
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.wasm':'application/wasm','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');let name=decodeURIComponent(u.pathname);if(name.endsWith('/'))name+='index.html';const f=path.resolve(root,'.'+name);if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return}if(!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end();return}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res)});
await new Promise(done=>server.listen(4285,'127.0.0.1',done));
let browser;const report={};
try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
 for(const [team,rootSelector,coverSelector,lastSelector,portraitSelector] of [
 ['shin','.reveal .slides > section.scene','.reveal .slides > section.scene:first-child','.reveal .slides > section.scene:last-child','.theory-card .phhs-scholar-img img'],
 ['cha','#stage','#slide','#slide','.phhs-language-scholars img'],
 ['hu','#deck > section.slide','#deck > .s1','#deck > .s12','.scholar-card .phhs-scholar-img img'],
 ['seung','#canvas-stage > section.slide','#canvas-stage > section.slide:first-child','#canvas-stage > section.slide:last-child','.scholar .phhs-scholar-img img']]){
 const pg=await browser.newPage({viewport:{width:1600,height:900}});
 const errors=[];pg.on('pageerror',e=>errors.push(String(e)));
 await pg.goto('http://127.0.0.1:4285/'+team+'/?preview=1',{waitUntil:'networkidle',timeout:45000});await pg.waitForTimeout(1900);
 const loaded=await pg.locator('.phhs-brand-mark img').evaluateAll(ims=>ims.map(i=>({url:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})));
 assert.ok(loaded.length>=1,team+' school emblem absent');
 assert.ok(loaded.every(i=>i.loaded),team+' mark broken');
 const covers=await pg.locator('.phhs-cover-roster').count();
 let thanks=await pg.locator('.phhs-end-thanks').count(); if(team==='cha'){await pg.evaluate(()=>window.jumpTo(8));await pg.waitForTimeout(700)}
 await pg.locator(portraitSelector).evaluateAll(async imgs=>{await Promise.all(imgs.map(async img=>{img.loading='eager';if(!img.complete)await new Promise(done=>{img.onload=done;img.onerror=done;setTimeout(done,3000)})}))});
 const portraits=await pg.locator(portraitSelector).evaluateAll(ims=>ims.map(i=>({loaded:i.complete&&i.naturalWidth>0,alt:i.alt})));
 if(team==='cha'){assert.ok(covers>=1,'Cha cover roster missing');await pg.evaluate(()=>window.jumpTo(11));await pg.waitForTimeout(850);thanks=await pg.locator('.phhs-end-thanks').count();assert.ok(thanks>=1,'Cha thanks missing');}
 else{assert.ok(covers>=1,team+' cover roster missing');assert.ok(thanks>=1,team+' closing thanks missing');}
 assert.ok(portraits.length>=2,team+' scholar pictures missing');
 assert.ok(portraits.every(x=>x.loaded),team+' scholars broken');
 report[team]={brandCount:loaded.length,cover: covers,thanks,portraits,errors};
 if(errors.length)throw Error(team+' errors:'+errors.join(','));
 if(team==='hu'){
 await pg.evaluate(()=>window.go?.(3));await pg.waitForTimeout(2600);
 report[team].flow=await pg.locator('svg.hu-money-diagram').count();
 }
 await pg.close();
 }
 console.log('BRAND_VISUAL_QA_OK='+JSON.stringify(report));
}catch(err){report.error=String(err);console.error('BRAND_VISUAL_QA_FAIL='+JSON.stringify(report));process.exitCode=1}
finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/brand-visual-report.json',JSON.stringify(report,null,2))}
