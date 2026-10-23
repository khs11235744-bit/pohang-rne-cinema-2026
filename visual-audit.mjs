import {createRequire} from 'node:module';import path from 'node:path';import fs from 'node:fs';import http from 'node:http';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.USERPROFILE,'Documents','Pohang-RnE-Studio','node_modules','playwright'));
const dir=path.resolve(process.cwd(),'site'),output=path.resolve(process.cwd(),'qa');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.wasm':'application/wasm','.svg':'image/svg+xml'};
const srv=http.createServer((q,s)=>{const u=new URL(q.url,'http://localhost:4292');let rel=decodeURIComponent(u.pathname);if(rel.endsWith('/'))rel+='index.html';const file=path.resolve(dir,'.'+rel);if(!file.startsWith(dir+path.sep)||!fs.existsSync(file)){s.writeHead(404).end();return;}s.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(s)});
await new Promise(r=>srv.listen(4292,'127.0.0.1',r));
let browser;
try{
browser=await chromium.launch({headless:true,channel:'chrome'});
for(const t of ['shin','cha','hu','seung']){
const p=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});await p.goto('http://127.0.0.1:4292/'+t+'/?preview=1',{waitUntil:'domcontentloaded'});await p.waitForTimeout(1250);
const snap=async label=>{await p.screenshot({path:path.join(output,t+'-'+label+'.jpg'),type:'jpeg',quality:87});};
await snap('cover');
if(t==='hu'){for(const idx of [1,2,3,5,6,7,11]){await p.evaluate(idx=>window.go(idx),idx);await p.waitForTimeout(idx===3?1800:720);await snap('slide-'+(idx+1))}}
else if(t==='shin'){for(const idx of [8,10]){await p.evaluate(idx=>window.rneDeck.slide(idx),idx);await p.waitForTimeout(720);await snap('slide-'+(idx+1))}}
else if(t==='cha'){for(const idx of [8,11]){await p.evaluate(idx=>window.jumpTo(idx),idx);await p.waitForTimeout(820);await snap('slide-'+(idx+1))}}
else{for(let i=0;i<9;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(125);if(i===7)await snap('slide-9')};await p.waitForTimeout(600);await snap('slide-10')}
await p.close();
}
console.log('SCREENSHOTS_CREATED');
}catch(e){console.error('SCREENSHOT_FAILURE',e);process.exitCode=1}finally{await browser?.close();await new Promise(done=>srv.close(done))}
