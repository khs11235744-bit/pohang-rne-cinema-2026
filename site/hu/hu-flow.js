/* HU / casefile money and evidence flow - an explanatory graphic, never evasion guidance */
(()=>{'use strict';
const story=[{t:'범죄수익',d:'가상의 문제 상황'},{t:'가명 지갑 주소',d:'주소 자체가 실명은 아님'},{t:'공개 거래기록',d:'자금 이동의 흔적'},{t:'적법한 신원 요청',d:'법적 권한·국제협력'}];
const sel='#deck .slide.s8 .scene';
let built=false,prior=false;
function create(){
 const host=document.querySelector(sel);
 if(!host||!window.d3)return false;
 if(built)return true;built=true;
 const d3=window.d3;
 const svg=d3.select(host).append('svg').attr('class','hu-money-diagram').attr('viewBox','0 0 1220 245')
 .attr('role','img').attr('aria-label','돈의 흐름 개념: 불법 수익, 가명 지갑 주소, 공개 거래기록, 적법한 신원 요청');
 svg.append('text').attr('class','hu-money-label').attr('x',25).attr('y',26).text('CASE STUDY / FLOW OF FUNDS AND EVIDENCE');
 const y=67,left=17,gap=294;
 const nodes=svg.selectAll('g.money-node').data(story).enter().append('g').attr('class','money-node').attr('transform',(d,i)=>'translate('+(left+i*gap)+','+y+')');
 nodes.append('rect').attr('width',275).attr('height',132).attr('rx',16);
 nodes.append('text').attr('class','hu-money-index').attr('x',22).attr('y',29).text((d,i)=>String(i+1).padStart(2,'0'));
 nodes.append('text').attr('class','hu-money-title').attr('x',22).attr('y',74).text(d=>d.t);
 nodes.append('text').attr('class','hu-money-detail').attr('x',22).attr('y',111).text(d=>d.d);
 const links=[0,1,2].map(i=>({x1:left+i*gap+274,x2:left+(i+1)*gap,y:y+68}));
 const paths=svg.selectAll('path.money-link').data(links).enter().append('path').attr('class','money-link')
 .attr('d',d=>'M'+d.x1+','+d.y+' L'+d.x2+','+d.y);
 paths.each(function(){let len=this.getTotalLength();d3.select(this).attr('stroke-dasharray',len).attr('stroke-dashoffset',len)});
 svg.selectAll('circle.money-token').data(links).enter().append('circle').attr('class','money-token').attr('r',9).attr('cx',d=>d.x1).attr('cy',d=>d.y).attr('opacity',0);
 svg.append('text').attr('class','hu-money-foot').attr('x',17).attr('y',229).text('공개 거래기록과 사업자의 실제 신원자료는 서로 다르며, 개인정보 확인에는 적법한 요청이 필요합니다.');
 return true;
}
function play(){
 if(!create()||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const d3=window.d3,svg=d3.select(sel+' svg.hu-money-diagram');
 svg.selectAll('.money-node').interrupt().attr('opacity',0).transition().delay((d,i)=>i*520).duration(490).ease(d3.easeCubicOut).attr('opacity',1);
 const paths=svg.selectAll('.money-link');
 paths.interrupt().each(function(){d3.select(this).attr('stroke-dashoffset',this.getTotalLength())});
 paths.transition().delay((d,i)=>650+i*770).duration(740).ease(d3.easeCubicOut).attr('stroke-dashoffset',0);
 svg.selectAll('.money-token').interrupt().attr('opacity',0).attr('cx',d=>d.x1)
 .transition().delay((d,i)=>650+i*770).duration(720).attr('opacity',1).attr('cx',d=>d.x2)
 .transition().duration(260).attr('opacity',0);
}
const timer=setInterval(()=>{const cur=!!document.querySelector('#deck .slide.s8.active');if(cur&&!prior)play();prior=cur},190);
window.addEventListener('beforeunload',()=>clearInterval(timer),{once:true});
})();
