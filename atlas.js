(() => {
  'use strict';
  const svg = document.getElementById('atlas-graph');
  const slider = document.getElementById('atlas-lift');
  const detail = document.getElementById('atlas-readout');
  if (!svg || !slider || !detail) return;
  const english = () => !document.documentElement.lang.startsWith('zh');
  const words = (en, zh) => english() ? en : zh;
  const branches = [
    {id:'misuse',name:['Abuse','滥用'],color:'#f79566',angle:-.72, leaves:[['Impersonation','身份冒充'],['Mass distribution','规模化传播']],about:['Synthetic identity can make an impostor more convincing, while automation lets the same tactic reach more people. Treat identity checks and distribution limits as separate safeguards.','合成身份让冒充更像真的，自动化让同一招触达更多人。确认身份和限制批量传播，是两道不同的防线。']},
    {id:'reliability',name:['Reliability','可靠性'],color:'#f3c974',angle:.86,leaves:[['False evidence','伪造引文'],['Wrong actions','错误执行']],about:['A fluent answer can cite nonexistent evidence; an agent can also carry out the wrong action. Grounding checks and approval before consequential actions solve different problems.','回答可能编出不存在的引文，智能体也可能直接执行错误操作。核查原文和为重要操作设置确认，缺一不可。']},
    {id:'infrastructure',name:['Infrastructure','基础设施'],color:'#80c8cd',angle:2.42,leaves:[['Peak load','电网峰值'],['Compute concentration','算力集中']],about:['A new data centre increases demand where it is built; annual electricity use alone can hide the stress of peak load. Concentrated compute supply creates a separate dependency.','一个数据中心会把需求加在具体地区。年耗电量可能掩盖高峰时段的压力；算力供给集中则带来另一类依赖。']},
    {id:'governance',name:['Governance','治理'],color:'#c1a6ea',angle:3.99,leaves:[['Access & authority','权限边界'],['Accountability','责任归属']],about:['The party responsible for an AI outcome may not control how the system runs. Identify who can change permissions, stop a deployment and review what happened.','要对 AI 结果负责的人，不一定有权改系统。先明确谁能收紧权限、叫停部署、复核当时发生了什么。']}
  ];
  const ns='http://www.w3.org/2000/svg';
  const panelButtons=[...document.querySelectorAll('button[data-risk]')];
  let width=680,height=420,yaw=.32,pitch=.19,selected='misuse',pointer=null,news=null;
  const initial=65, clamp=(v, lo, hi)=>Math.max(lo,Math.min(hi,v));
  const L=(a)=>words(...a);
  const scene=document.createElementNS(ns,'g');svg.append(scene);
  function add(tag,attrs={},label) {
    const el=document.createElementNS(ns,tag);
    for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));
    if(label)el.textContent=label;
    scene.append(el);return el;
  }
  function polar(angle,r,y){return [Math.cos(angle)*r,y,Math.sin(angle)*r];}
  function draw() {
    scene.replaceChildren();
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    svg.dataset.yaw=yaw.toFixed(3);svg.dataset.lift=slider.value;
    const lift=Number(slider.value)/100, narrow=width<510;
    const scale=Math.min(width/(narrow?530:620),height/430);
    const focus=width*.5, horizon=height*(narrow?.53:.52), sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
    const project=([x,y,z])=>{
      const u=x*cy-z*sy, v=x*sy+z*cy, plane=y*cp-v*sp, depth=y*sp+v*cp, s=scale*640/(640+depth);
      return [focus+u*s,horizon-plane*s,depth,s];
    };
    function edge(a,b,attrs) {add('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],...attrs});}
    const orbit = (r,y) => Array.from({length:41},(_,i)=>project(polar(i*Math.PI/20,r,y)).slice(0,2).join(',')).join(' ');
    for(const r of [78,149,222])add('polyline',{points:orbit(r,-88),'class':'atlas-orbit'});
    for(let i=0;i<8;i++)edge(project([0,-88,0]),project(polar(i*Math.PI/4,222,-88)),{class:'atlas-orbit'});
    const core=project([0,-31,0]), positions=[];
    for(const b of branches){
      const active=b.id===selected, vec=polar(b.angle,135, -24+lift*91), parent=project(vec), foot=project([vec[0],-88,vec[2]]);
      edge(foot,parent,{class:'atlas-stem',stroke:b.color,'stroke-opacity':active?.66:.29});
      add('circle',{cx:foot[0],cy:foot[1],r:3.1,fill:b.color,opacity:active?.84:.37});
      edge(core,parent,{stroke:b.color,'stroke-width':active?2.4:1.35,'stroke-opacity':active?.92:.47});
      positions.push({p:parent,b,level:1,text:L(b.name)});
      b.leaves.forEach((item,i)=>{
        const leaf=project(polar(b.angle+(i===0?-.34:.34),225, 7+lift*(i===0?134:110)));
        edge(parent,leaf,{stroke:b.color,'stroke-width':active?1.45:.9,'stroke-opacity':active?.75:.27});
        positions.push({p:leaf,b,level:2,text:L(item)});
      });
    }
    positions.push({p:core,b:{id:'',color:'#ffebc0'},level:0,text:words('AI system','AI 系统')});
    positions.sort((a,b)=>b.p[2]-a.p[2]);
    for(const {p,b,level,text} of positions){
      const [x,y,,s]=p, active=b.id===selected;
      if(level<2 || active) add('circle',{cx:x,cy:y,r:level===0?23:level===1?17:9,fill:b.color,opacity:active?.14:.075});
      const size=level===0?11:level===1?8:Math.max(3.5,s*4.8);
      add('circle',{cx:x,cy:y,r:size,fill:level<2?'#231512':b.color,stroke:b.color,'stroke-width':level===0?2.7:active?2:1.2,'data-atlas-node':b.id,opacity:level<2||active?1:.58});
      if(level<2 || active || (!narrow && s>.93)) {
        const xx=clamp(x,52,width-52), yy=clamp(y+(level===0?27:level===1?23:-10),15,height-16);
        add('text',{x:xx,y:yy,'text-anchor':'middle',class:`atlas-node-label atlas-level-${level}`,fill:level===2?b.color:'#fff1dc','data-atlas-node':b.id},text);
      }
    }
  }
  function select(id) {
    const b=branches.find(v=>v.id===id);if(!b)return;
    selected=id;
    panelButtons.forEach(p=>p.setAttribute('aria-pressed',String(p.dataset.risk===id)));
    const h=document.createElement('h3'),p=document.createElement('p'),a=document.createElement('a');
    h.textContent=L(b.name);p.textContent=L(b.about);
    a.textContent=words('Read related reports','查看相关报道');a.href='#news';
    a.addEventListener('click',()=>document.querySelector(`button[data-filter="${b.id}"]`)?.click());
    detail.replaceChildren(h,p,a);draw();
  }
  panelButtons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.risk)));
  function resize(){
    const r=svg.getBoundingClientRect();
    if(r.width>0&&r.height>0){width=Math.round(r.width);height=Math.round(r.height);draw();}
  }
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(svg);
  else addEventListener('resize',resize,{passive:true});
  svg.addEventListener('pointerdown',e=>{
    if(pointer || e.button!==0)return;
    pointer={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,node:e.target.closest('[data-atlas-node]')?.getAttribute('data-atlas-node')};
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
    if(!pointer.moved&&Math.abs(dx)+Math.abs(dy)<5)return;
    pointer.moved=true;pointer.x=e.clientX;pointer.y=e.clientY;
    yaw+=dx*.012;pitch=clamp(pitch-dy*.008,-.62,.71);draw();
  });
  function end(e,selectNode) {
    if(!pointer||pointer.id!==e.pointerId)return;
    const p=pointer;pointer=null;
    if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
    if(selectNode&&!p.moved&&p.node)select(p.node);
  }
  svg.addEventListener('pointerup',e=>end(e,true));svg.addEventListener('pointercancel',e=>end(e,false));
  svg.addEventListener('lostpointercapture',e=>{if(pointer?.id===e.pointerId)pointer=null;});
  svg.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft')yaw-=.14;
    else if(e.key==='ArrowRight')yaw+=.14;
    else if(e.key==='ArrowUp')pitch=clamp(pitch+.10,-.62,.71);
    else if(e.key==='ArrowDown')pitch=clamp(pitch-.10,-.62,.71);
    else return;
    e.preventDefault();draw();
  });
  slider.addEventListener('input',draw);
  document.getElementById('atlas-reset').addEventListener('click',()=>{yaw=.32;pitch=.19;slider.value=initial;draw();});
  function plotArchive(){
    if(!news)return;
    const total=news.length, donut=document.getElementById('atlas-donut'),list=document.getElementById('atlas-counts');
    document.getElementById('atlas-total').textContent=String(total);
    const legend=[], slices=[];
    let x=0;
    for(const b of branches){
      const n=news.filter(e=>e.topic===b.id).length,end=x+(total?n/total*100:0);
      if(n)slices.push(`${b.color} ${x}% ${end}%`);x=end;
      const row=document.createElement('li'),dot=document.createElement('i'),label=document.createElement('span'),number=document.createElement('b');
      dot.style.background=b.color;label.textContent=L(b.name);number.textContent=String(n);
      row.append(dot,label,number);legend.push(row);
    }
    if(slices.length)donut.style.backgroundImage=`conic-gradient(${slices.join(',')})`;
    list.replaceChildren(...legend);
  }
  function localize(){
    document.getElementById('atlas-description').textContent=words('AI risks: a three-dimensional map','AI 风险三维图谱');
    select(selected);plotArchive();
  }
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('scalinglow:archive',e=>{news=e.detail;plotArchive();});
  localize();resize();
})();
