/* HU / D3 evidence atlas — observable node network, no external map or personal location. */
(()=>{'use strict';
 const started=()=>document.querySelector('#deck .slide.s7.active')!==null;
 let initialized=false;
 function create(){
  if(initialized||!window.d3)return;
  const root=document.querySelector('#deck .slide.s7 .scene');
  if(!root)return; initialized=true;
  const svg=window.d3.select(root).append('svg').attr('class','evidence-atlas').attr('viewBox','0 0 780 420')
   .attr('role','img').attr('aria-label','비트코인 거래·증거 보존·국제공조를 보여주는 데이터 기반 추상 네트워크');
  const nodes=[{x:80,y:210,t:'KR'},{x:232,y:118,t:'CHAIN'},{x:350,y:255,t:'EVIDENCE'},{x:505,y:95,t:'LAW'},{x:660,y:235,t:'COOP'}];
  const connections=[[0,1],[1,2],[2,3],[3,4],[1,4]].map(([a,b])=>({source:nodes[a],target:nodes[b]}));
  const links=svg.selectAll('.evidence-link').data(connections).enter().append('path')
   .attr('class','evidence-link').attr('d',d=>'M'+d.source.x+','+d.source.y+' Q'+((d.source.x+d.target.x)/2)+','+(Math.min(d.source.y,d.target.y)-80)+' '+d.target.x+','+d.target.y);
  links.each(function(){const length=this.getTotalLength();window.d3.select(this).attr('stroke-dasharray',length).attr('stroke-dashoffset',length)});
  svg.selectAll('.evidence-node').data(nodes).enter().append('circle').attr('class','evidence-node')
    .attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',8);
  svg.selectAll('.evidence-node-label').data(nodes).enter().append('text').attr('class','evidence-node-label')
   .attr('x',d=>d.x+13).attr('y',d=>d.y-14).text(d=>d.t);
 }
 function animate(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!started())return;
  create();
  const svg=window.d3?.select('#deck .slide.s7 .evidence-atlas');if(!svg)return;
  svg.selectAll('.evidence-link').interrupt().transition().delay((d,i)=>i*140).duration(1200)
    .ease(window.d3.easeCubicOut).attr('stroke-dashoffset',0);
  svg.selectAll('.evidence-node').interrupt().attr('opacity',0).transition().delay((d,i)=>i*145).duration(540).attr('opacity',1);
 }
 document.addEventListener('DOMContentLoaded',create,{once:true});
 let previous=false;
 const id=setInterval(()=>{const on=started();if(on&&!previous)animate();previous=on;},230);
 window.addEventListener('beforeunload',()=>clearInterval(id),{once:true});
})();
