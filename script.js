(() => {
  'use strict';

  const root = document.documentElement;
  const storageKey = 'scaling-low-lang';
  let language = /^zh\b/i.test(navigator.language) ? 'zh' : 'en';
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'zh' || saved === 'en') language = saved;
  } catch { /* The in-page switch still works without storage. */ }

  // This script runs in the head, before either language is painted.
  root.lang = language === 'zh' ? 'zh-Hans' : 'en';
  root.classList.add('js');

  function bindLab() {
    const get = id => document.getElementById(id);
    const slider = get('compute');
    const curve = get('curve');
    const point = get('point');
    const guide = get('guide');
    const multiplier = get('multiplier');
    const score = get('score');
    const bill = get('bill');
    if (!slider || !curve || !point || !guide || !multiplier || !score || !bill) return () => {};

    // The horizontal axis is log-compute; the vertical axis is a fictional score.
    const benchmark = t => 6 + 81 * (1 - Math.exp(-5 * t));
    const x = t => 36 + 462 * t;
    const baseline = 166;
    const y = t => baseline - 1.4 * benchmark(t);
    curve.setAttribute('d', Array.from({ length: 101 }, (_, i) => {
      const t = i / 100;
      return `${i ? 'L' : 'M'}${x(t).toFixed(2)},${y(t).toFixed(3)}`;
    }).join(' '));
    curve.setAttribute('pathLength', '1');
    curve.classList.add('plot-anim');

    const money = Object.fromEntries(['en', 'zh'].map(lang => [lang,
      new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'zh-CN', {
        style: 'currency', currency: 'USD', maximumFractionDigits: 0
      })
    ]));
    const target = () => Number(slider.value) / Number(slider.max);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let displayed = target();
    let frame = 0;
    let reference = 1/3;
    const referenceLine=get('cost-reference'), referencePoint=get('cost-reference-point');
    const pin=get('cost-pin'), reset=get('cost-reset');
    const compare=get('cost-kpis'), explanation=get('cost-readout');
    const price=t=>1000*10**(3*t);
    const T=(en,zh)=>language==='zh'?zh:en;
    const signed=(n,digits=1)=>(Math.abs(n)<.001?'':n>0?'+':'−')+Math.abs(n).toFixed(digits);
    function metric(label,value){
      const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=label;dd.textContent=value;div.append(dt,dd);return div;
    }
    function referenceDraw(){
      const px=x(reference),py=y(reference);
      referenceLine.setAttribute('x1',px);referenceLine.setAttribute('x2',px);
      referencePoint.setAttribute('cx',px);referencePoint.setAttribute('cy',py);
      referenceLine.hidden=false;referencePoint.hidden=false;
      referenceLine.removeAttribute('hidden');referencePoint.removeAttribute('hidden');
    }

    const presets = [...document.querySelectorAll("button[data-compute]")];
    function readout() {
      const t = target();
      presets.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.compute === slider.value)));
      const compute = 10 ** (3 * t);
      const times = Math.round(compute).toLocaleString(language);
      multiplier.textContent = `${times}×`;
      score.textContent = benchmark(t).toFixed(1);
      bill.textContent = money[language].format(1000 * compute);
      slider.setAttribute('aria-valuetext', language === 'zh' ? `${times} 倍算力` : `${times} times compute`);
      referenceDraw();
      const referenceLabel=`${Math.round(10**(3*reference)).toLocaleString(language)}×`;
      const delta=price(t)-price(reference);
      const loadAs=t=>Math.round(10**(3*t)).toLocaleString(language);
      const NEXT= Math.min(1,t+1/3), increase=Math.max(0,benchmark(NEXT)-benchmark(t));
      compare.replaceChildren(
        metric(T('Pinned baseline','已固定基准'),referenceLabel),
        metric(T('Score vs baseline','较基准分差'),signed(benchmark(t)-benchmark(reference))),
        metric(T('Bill vs baseline','较基准账单'),`${Math.abs(delta)<.01?'':delta>0?'+':'−'}${money[language].format(Math.abs(delta))}`)
      );
      explanation.textContent = NEXT===t ? T('At the upper limit of this model.','已到示意模型的上限。') :
        T(`From ${times}× to ${loadAs(NEXT)}×: +${increase.toFixed(1)} points for another ${money[language].format(price(NEXT)-price(t))}.`,
           `从 ${times}× 加到 ${loadAs(NEXT)}×：多得 ${increase.toFixed(1)} 分，多花 ${money[language].format(price(NEXT)-price(t))}。`);
    }

    function draw(t) {
      displayed = t;
      const px = x(t), py = y(t);
      point.setAttribute('cx', px);
      point.setAttribute('cy', py);
      guide.setAttribute('x1', px);
      guide.setAttribute('x2', px);
      guide.setAttribute('y1', py);
      guide.setAttribute('y2', baseline);
    }

    function move() {
      cancelAnimationFrame(frame);
      const from = displayed, to = target();
      if (motion.matches || from === to) {
        draw(to);
        return;
      }
      const start = performance.now();
      function tick(now) {
        const progress = Math.min(1, Math.max(0, (now - start) / 150));
        if (progress === 1 || motion.matches) {
          draw(to);
        } else {
          draw(from + (to - from) * (1 - (1 - progress) ** 3));
          frame = requestAnimationFrame(tick);
        }
      }
      frame = requestAnimationFrame(tick);
    }

    draw(displayed);
    const update = () => { readout(); move(); };
    slider.addEventListener('input', update);
    pin.addEventListener('click',()=>{reference=target();update();});
    reset.addEventListener('click',()=>{reference=1/3;slider.value='20';update();});
    presets.forEach(button => button.addEventListener('click', () => {
      slider.value = button.dataset.compute;
      update();
    }));
    return readout;
  }

  // A shared perspective scene behind the whole issue. Geometry is decorative;
  // nothing in this animation represents measured market or model data.
  function bindWorld() {
    const canvas = document.getElementById('world-scene');
    const pause = document.getElementById('signal-pause');
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!ctx) return;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');
    const fine=matchMedia('(pointer: fine)');
    const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
    const fract=n=>n-Math.floor(n);
    const rand=n=>fract(Math.sin(n*127.1+311.7)*43758.5453);
    const lerp=(a,b,t)=>a+(b-a)*t;
    const ease=t=>t*t*(3-2*t);
    const palettes=[
      {core:[255,168,102], blast:[204,58,35], ion:[222,109,197], matrix:[157,74,62], rock:[48,26,35], deep:[17,11,23]},
      {core:[174,231,255], blast:[42,85,237], ion:[154,119,255], matrix:[73,114,218], rock:[30,35,77], deep:[11,15,44]},
      {core:[177,253,206], blast:[31,161,130], ion:[108,185,250], matrix:[55,151,134], rock:[17,53,51], deep:[8,26,34]},
      {core:[255,212,242], blast:[178,64,209], ion:[219,95,149], matrix:[137,90,212], rock:[52,28,75], deep:[22,11,38]}
    ];
    const shards=Array.from({length:37},(_,i)=>{
      const arm=i%2?1:-1;
      return {
        x:arm*(76+rand(i*19+2)*540),y:44+rand(i*19+3)*315,z:100+rand(i*19+4)*1100,
        size:9+rand(i*19+5)*58,spin:rand(i*19+6)*6.28, arm
      };
    }).sort((a,b)=>b.z-a.z);
    const edges=shards.flatMap((a,i)=>shards
      .map((b,j)=>({j,d:((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2)}))
      .filter(({j,d})=>j>i && shards[j].arm===a.arm && d<405**2).sort((u,v)=>u.d-v.d).slice(0,3).map(({j})=>[i,j]));
    const motes=Array.from({length:112},(_,i)=>({
      a:rand(i*9+1)*Math.PI*2,r:.18+rand(i*9+2),z:100+rand(i*9+3)*1100,b:rand(i*9+4), offset:rand(i*9+5)
    }));
    let w=0,h=0,dpr=1,focal=1,frame=0,last=0,t=0;
    let sx=0,sy=0,px=0,py=0,journey=0,section=0;
    const isStill=()=>reduce.matches||pause?.checked||document.hidden;
    const rgba=(v,a)=>'rgba('+v+','+a+')';
    function dimensions(){
      w=canvas.clientWidth;h=canvas.clientHeight;
      if(!w||!h)return;
      dpr=Math.min(devicePixelRatio||1,w<680?1.15:1.6);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      focal=Math.max(w*.71,h*.56);
      draw();
    }
    function scroll(){
      section=clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1);
    }
    function draw(){
      if(!w||!h)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      const mobile=w<680, phase=journey, cycle=t/14;
      const theme=Math.floor(cycle)%palettes.length,next=(theme+1)%palettes.length;
      const fade=ease(clamp((fract(cycle)-.67)/.33,0,1));
      const hue=(key)=>palettes[theme][key].map((v,i)=>Math.round(lerp(v,palettes[next][key][i],fade))).join(',');
      const ash=hue('deep'),rock=hue('rock'),core=hue('core'),blast=hue('blast'),ion=hue('ion'),matrix=hue('matrix');
      const yaw=sx*(mobile?.085:.18)+Math.sin(phase*4)*.14;
      const pitch=sy*.11,cos=Math.cos(yaw),sin=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
      const cx=w*(mobile?.575:.60)+sx*w*.047,cy=h*(.46+phase*.09)+sy*h*.05;
      const surge=(1+Math.sin(t*.81-.8))*.5;
      function proj(x,y,z){
        const u=x*cos+(z-460)*sin,b=z*cos-x*sin,v=b*cp-y*sp,q=y*cp+(b-510)*sp;
        if(v<53)return null;
        const s=focal/v;
        return [cx+u*s,cy-q*s,s];
      }
      function path(points,fill,stroke,line=1,closed=false){
        if(points.some(p=>!p))return;
        if(points.every(p=>p[0]<-24)||points.every(p=>p[0]>w+24)||points.every(p=>p[1]<-24)||points.every(p=>p[1]>h+24))return;
        ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
        for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
        if(closed)ctx.closePath();
        if(fill){ctx.fillStyle=fill;ctx.fill();}
        if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}
      }
      const star=proj(30,100,960);
      if(star){
        const [x,y]=star,r=Math.max(h*.55,w*.28);
        const glow=ctx.createRadialGradient(x,y,0,x,y,r);
        glow.addColorStop(0,rgba(core,.24+surge*.12));glow.addColorStop(.14,rgba(blast,.43));
        glow.addColorStop(.54,rgba(ion,.16));glow.addColorStop(1,rgba(ash,0));
        ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
        const arcR=Math.min(h*.40,w*.48);
        ctx.beginPath();ctx.ellipse(x,y,arcR,arcR*.77,.24+sx*.1,-.76,3.58);
        ctx.strokeStyle=rgba(ion,.24);ctx.lineWidth=1.2;ctx.stroke();
        ctx.beginPath();ctx.ellipse(x,y,arcR*.81,arcR*.66,-.3+sy*.08,1.6,5.31);
        ctx.strokeStyle=rgba(core,.26);ctx.lineWidth=1;ctx.stroke();
        // One long focal cut through the glowing horizon, not a fullscreen strobe.
        const flare=ctx.createLinearGradient(x-r,y,x+r,y);
        flare.addColorStop(0,rgba(ion,0));flare.addColorStop(.46,rgba(blast,.19));
        flare.addColorStop(.5,rgba(core,.6));flare.addColorStop(.55,rgba(blast,.16));flare.addColorStop(1,rgba(ion,0));
        ctx.fillStyle=flare;ctx.fillRect(0,y+.35,w,1.4);
      }
      const fault=z=>Math.sin(z*.008+phase*2+t*.12)*32+Math.sin(z*.023+phase)*19;
      const elevation=(z,i)=>-110+Math.sin(z*.014+i*.83)*14+Math.sin(z*.027-i*.63)*13;
      const crack=z=>30+Math.sin(z*.019+phase*3)*16+surge*12;
      const drift=(t*77+phase*125)%52;
      const segments=mobile?18:24,sides=mobile?4:6;
      const tileA=rgba(ash,.50),tileB=rgba(rock,.46),tileRim=rgba(blast,.28),line=rgba(matrix,.14),rim=rgba(core,.26);
      const rails=[[],[]];
      for(let j=0;j<=segments;j++){
        const z=70+j*52+drift;
        const sign=j%2===0?1:-1;
        for(let side=0;side<2;side++){
          const row=[];
          for(let i=0;i<=sides;i++){
            const x=fault(z)+(side?1:-1)*(crack(z)+i**1.43*45+sign*i*1.5);
            row.push(proj(x,elevation(z,i)+Math.min(53,i*i*2.6),z));
          }
          rails[side].push(row);
        }
      }
      for(let j=segments-1;j>=0;j--){
        for(let side=0;side<2;side++){
          const a=rails[side][j],b=rails[side][j+1];
          for(let i=0;i<sides;i++)path([a[i],b[i],b[i+1],a[i+1]],i===0?tileRim:(i+j)%3===0?tileB:tileA,i===0?rim:line,.70,true);
        }
        const a=70+j*52+drift,b=a+52;
        const heat=(.5+.5*Math.sin(j*.64-t*2.5));
        const linePoints=[proj(fault(a),elevation(a,0)-15,a),proj(fault(b),elevation(b,0)-15,b)];
        path(linePoints,null,rgba(blast,.18+heat*.24),Math.max(2,19-j*.71));
        path(linePoints,null,rgba(core,.45+heat*.37),Math.max(.7,3.2-j*.1));
      }
      // Expanding shock rings emitted into the world's depth plane.
      for(let k=0;k<(mobile?2:3);k++){
        const pulse=fract(t*.16+k/3),r=36+pulse*523,pts=[];
        for(let i=0;i<=32;i++){
          const a=i/32*Math.PI*2;
          pts.push(proj(22+Math.cos(a)*r,-89+Math.sin(a*3)*r*.04,850+Math.sin(a)*r*.76));
        }
        path(pts,null,rgba(core,(1-pulse)*pulse*.76),1);
      }
      const centers=shards.map((b,i)=>{
        const lift=Math.sin(t*.41+b.spin)*21;
        return mobile&&i%2?null:proj(b.x+Math.sin(t*.29+b.spin)*34,b.y+lift,b.z+Math.cos(t*.31+b.spin)*31);
      });
      for(let i=0;i<edges.length;i++){
        const [a,b]=edges[i];
        path([centers[a],centers[b]],null,rgba(i%4===0?core:matrix,.13+(i%4===0?.16:0)),.77);
      }
      for(let i=0;i<shards.length;i++){
        if(!centers[i])continue;
        const b=shards[i],a=b.spin+t*(i%2?.35:-.24)+phase,r=b.size;
        const x=b.x+Math.sin(t*.29+b.spin)*34,y=b.y+Math.sin(t*.41+b.spin)*21,z=b.z+Math.cos(t*.31+b.spin)*31;
        const dx=Math.cos(a)*r,dz=Math.sin(a)*r;
        const top=proj(x+dz*.15,y+r*.93,z+dx*.17),left=proj(x-dx,y-r*.45,z-dz);
        const right=proj(x+dx,y-r*.28,z+dz),tip=proj(x-dz*.68,y-r*.84,z+dx*.73);
        path([top,left,right],rgba(ash,.66),rgba(ion,i%5===0?.45:.21),.86,true);
        path([left,tip,right],rgba(rock,.72),rgba(core,.19),.7,true);
        const c=centers[i];
        if(i%3===0){ctx.fillStyle=rgba(core,.67);ctx.fillRect(c[0],c[1],2.1,2.1);}
      }
      for(let i=0;i<motes.length;i++){
        if(mobile&&i%2)continue;
        const p=motes[i],travel=fract(t*(.083+p.b*.052)+p.offset);
        const radius=(47+travel*690)*p.r,a=p.a+t*.031;
        const point=proj(Math.cos(a)*radius,80+Math.sin(a)*radius*.53,p.z-travel*65);
        if(!point||point[0]<0||point[0]>w||point[1]<0||point[1]>h)continue;
        const alpha=(.18+p.b*.6)*Math.sin(travel*Math.PI);
        const size=Math.min(2.7,.55+point[2]*p.b*.72);
        ctx.fillStyle=rgba(i%5===0?ion:core,alpha);
        ctx.fillRect(point[0],point[1],size,size);
      }
    }
    function loop(now){
      frame=0;
      if(isStill()){last=0;return;}
      const delta=now-last;
      if(!last||delta>(w<680?32:21)){
        if(last)t+=Math.min(delta,70)/1000;
        last=now;
        sx=lerp(sx,px,.10);sy=lerp(sy,py,.10);journey=lerp(journey,section,.075);
        draw();
      }
      frame=requestAnimationFrame(loop);
    }
    function state(){
      const still=isStill();
      canvas.dataset.motion=still?'static':'running';
      if(still){if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(!document.hidden)draw();}
      else if(!frame)frame=requestAnimationFrame(loop);
    }
    addEventListener('resize',dimensions,{passive:true});
    addEventListener('scroll',scroll,{passive:true});
    addEventListener('pointermove',e=>{
      if(isStill()||!fine.matches||e.pointerType==='touch'||!w||!h)return;
      px=clamp((e.clientX/w-.5)*2,-1,1);py=clamp((e.clientY/h-.5)*2,-1,1);
    },{passive:true});
    addEventListener('pointerout',e=>{if(!e.relatedTarget){px=0;py=0;}},{passive:true});
    pause?.addEventListener('change',state);
    reduce.addEventListener('change',state);
    document.addEventListener('visibilitychange',state);
    scroll();journey=section;dimensions();root.classList.add('world-ready');state();
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindWorld();
    const buttons = document.querySelectorAll('button[data-lang]');
    const labels = document.querySelectorAll('[data-en-label][data-zh-label]');
    const filters = document.querySelectorAll('button[data-filter]');
    const status = document.getElementById('news-status');
    const list = document.getElementById('news-list');
    const readout = bindLab();
    let entries = [], state = 'loading', topic = 'all';
    const tr = (en, zh) => language === 'zh' ? zh : en;
    const kinds = {report:['Report','报告'], proposal:['Proposal','提案'], research:['Research','研究'], company:['Company disclosure','企业披露'], analysis:['Claim check','标题核查']};
    const verdicts = {scope:['Scope check','限定范围'], unsupported:['Not established','证据未到'], verified:['Verified with context','确认及补充']};
    const openEntries = new Set();
    const nonEmpty = v => typeof v === 'string' && v.trim();
    const bilingual = v => v && nonEmpty(v.en) && nonEmpty(v.zh);
    function goodLink(l) {
      try {
        const u = new URL(l.url);
        return bilingual(l.label) && u.protocol === 'https:' && !u.username && !u.password;
      } catch { return false; }
    }
    function node(parent, tag, value = '', cls = '') {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      el.textContent = value;
      parent.append(el);
      return el;
    }
    function render() {
      list.replaceChildren();
      const visible = entries.filter(e => topic === 'all' || (topic === 'checks' ? e.kind === 'analysis' : e.topic === topic));
      filters.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === topic)));
      status.textContent = state === 'loading' ? tr('Loading news…','正在加载情报…') : state === 'error' ? tr('No readable news data available.','无法读取有效新闻数据。') : !visible.length ? tr('No entries for this topic.','本主题暂无情报。') : tr(`${visible.length} entries`, `共 ${visible.length} 篇`);
      for (const e of visible) {
        const check = e.kind === 'analysis' ? e.analysis : null;
        const article = node(list,'article','',check ? 'note is-check' : 'note');
        article.id = (check ? 'case-' : 'news-') + e.id;
        const meta = node(article,'div','','dateline');
        node(meta,'time',e.date).dateTime = e.date;
        node(meta,'span',tr(...kinds[e.kind]),check ? 'feed-type' : '');
        const body = node(article,'div','','note-body');
        node(body,'h3',e.title[language]);
        node(body,'p',e.summary[language],'preview-summary');
        const preview = node(body,'div','','sources preview-source');
        const featuredSource = check ? check.coverage : e.source;
        node(preview,'a',featuredSource.label[language]).href = featuredSource.url;
        const details = node(body,'details','','entry-detail');
        details.open = openEntries.has(article.id) || location.hash === '#' + article.id;
        details.addEventListener('toggle', () => {
          if (!details.isConnected) return;
          if (details.open) openEntries.add(article.id);
          else openEntries.delete(article.id);
        });
        node(details,'summary',tr('Evidence & context','展开证据与解读'));
        const copy = node(details,'div','','detail-copy');
        if (check) {
          const strip = node(copy,'div','','fact-meta check-meta');
          node(strip,'span',tr(...verdicts[check.verdict]),'fact-verdict');
          if (nonEmpty(check.metric)) node(strip,'span',check.metric,'fact-metric');
          node(copy,'p',tr('The original claim: ','原报道主张：') + check.claim[language],'fact-claim');
        }
        node(copy,'p',tr('What the evidence supports: ','证据支持到哪一步：') + e.takeaway[language],'watch');
        const links = node(copy,'div','','sources detail-sources');
        const references = check ? [check.coverage,e.source,...check.otherSources] : [e.source];
        for (const source of references) node(links,'a',source.label[language]).href = source.url;
        node(links,'a',tr('Link to this item','本条链接')).href = '#' + article.id;
      }
    }
    const topics = new Set([...filters].map(button => button.dataset.filter));
    const feed = document.getElementById('news');
    const destination = () => location.hash.slice(1);
    function showTopic(next) {
      if (topics.has(next) && next !== topic) {
        topic = next;
        render();
      }
    }
    function revealHash(move = false) {
      const id = destination();
      if (id === 'news' || id === 'factchecks' || id.startsWith('topic-')) {
        const next = id === 'factchecks' ? 'checks' : id === 'news' ? 'all' : id.slice(6);
        if (!topics.has(next)) return;
        showTopic(next);
        if (move && id.startsWith('topic-')) {
          feed.focus({preventScroll:true});
          feed.scrollIntoView();
        }
        return;
      }
      if (!/^(case|news)-[a-z0-9-]+$/.test(id)) return;
      let card = document.getElementById(id);
      if (!card && topic !== 'all' && entries.some(e => (e.kind === 'analysis' ? 'case-' : 'news-') + e.id === id)) {
        showTopic('all');
        card = document.getElementById(id);
      }
      if (card) {
        const details = card.querySelector('details');
        if (details) details.open = true;
        if (move) card.scrollIntoView();
      }
    }
    window.addEventListener('hashchange', () => revealHash(true));
    document.addEventListener('click', event => {
      const link = event.target.closest?.('a[href^="#topic-"]');
      if (link && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && link.hash === location.hash) revealHash(true);
    });
    async function load() {
      try {
        const response = await fetch('./news.json', {mode:'same-origin', cache:'no-cache'});
        if (!response.ok) throw Error();
        const data = await response.json(), seen = new Set();
        if (data.schemaVersion !== 1 || !Array.isArray(data.entries)) throw Error();
        entries = data.entries.filter(e => {
          if (!e || !nonEmpty(e.id) || !/^[a-z0-9-]+$/.test(e.id) || seen.has(e.id) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !['misuse','reliability','governance','infrastructure'].includes(e.topic) || !Object.hasOwn(kinds,e.kind) || ![e.title,e.summary,e.takeaway].every(bilingual) || !goodLink(e.source)) return false;
          if (e.kind === 'analysis') {
            const a = e.analysis;
            if (!a || !Object.hasOwn(verdicts,a.verdict) || !bilingual(a.claim) || !goodLink(a.coverage) || !Array.isArray(a.otherSources) || !a.otherSources.every(goodLink)) return false;
          }
          try {
            const url = new URL(e.source.url);
            if (url.protocol !== 'https:' || url.username || url.password || new Date(e.date).toISOString().slice(0,10) !== e.date) return false;
          } catch { return false; }
          seen.add(e.id.trim()); return true;
        }).sort((a,b) => b.date.localeCompare(a.date));
        state = entries.length ? 'ready' : 'error';
      } catch { state = 'error'; }
      document.dispatchEvent(new CustomEvent('scalinglow:archive',{detail: {state, entries}}));
      render();
      revealHash(/^(case|news)-/.test(destination()));
    }

    let deadline = Date.parse(document.getElementById('checkpoint').dateTime);
    const clock = document.getElementById('clock');
    const digits = clock.querySelectorAll('strong');
    let timer;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    digits.forEach(digit => digit.addEventListener('animationend', () => digit.classList.remove('digit-tick')));
    function tick() {
      const n = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      [Math.floor(n/86400), Math.floor(n/3600)%24, Math.floor(n/60)%60, n%60].forEach((v,i) => {
        const value = String(v).padStart(2,'0');
        const digit = digits[i];
        if (digit.textContent === value) return;
        digit.textContent = value;
        if (!still.matches) digit.classList.add('digit-tick');
      });
      clock.hidden = false;
      document.getElementById('passed').hidden = n !== 0;
      if (!n && timer) { clearInterval(timer); timer = undefined; }
      if (n && !timer) timer = setInterval(tick,1000);
    }
    function resumeClock() { if (!document.hidden) tick(); }
    document.addEventListener('visibilitychange',resumeClock);
    tick();

    const trackKeys = ['technical','economic'];
    const checkpoint = document.getElementById('checkpoint');
    const timestamp = value => typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value.slice(0,10) + 'T00:00:00Z').toISOString().slice(0,10) === value.slice(0,10);
    const validTracks = tracks => tracks.every(track => track && Number.isInteger(track.weight) &&
      track.weight >= 0 && track.weight <= 100 && timestamp(track.target)) &&
      tracks[0].weight + tracks[1].weight === 100;
    const weightedTarget = tracks =>
      Math.round(tracks.reduce((sum, track) => sum + Date.parse(track.target) * track.weight, 0) / 100);
    const localFormat = (seconds = false) => new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
      year: 'numeric', month: language === 'zh' ? 'numeric' : 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', ...(seconds ? {second:'2-digit'} : {}),
      hourCycle: 'h23', timeZoneName: 'shortOffset'
    });
    function localTime(parent, value, seconds = false) {
      const el = node(parent, 'time', localFormat(seconds).format(new Date(value)));
      el.dateTime = new Date(value).toISOString();
      return el;
    }
    const trackName = key => key === 'technical'
      ? (language === 'zh' ? '技术面' : 'Technical') : (language === 'zh' ? '经济面' : 'Economic');
    let bubble;
    function renderBubbleHistory() {
      const list = document.getElementById('bubble-history-list');
      list.replaceChildren();
      const entries = Array.isArray(bubble.history) ? [...bubble.history] : [];
      if (bubble.revision) entries.push({...bubble.revision, tracks:bubble.tracks});
      for (const revision of entries.filter(r=>r && timestamp(r.changedAt) && bilingual(r.note))
        .sort((a,b)=>Date.parse(b.changedAt)-Date.parse(a.changedAt))) {
        const tracks = trackKeys.map(key=>revision.tracks?.[key]);
        const hasTracks = validTracks(tracks);
        if (!hasTracks && !timestamp(revision.target)) continue;
        const el = node(list, 'li');
        localTime(el, revision.changedAt);
        node(el, 'p', revision.note[language]);
        const target = node(el, 'p', language === 'zh' ? '观察点：' : 'Checkpoint: ');
        localTime(target, hasTracks ? weightedTarget(tracks) : revision.target, true);
        if (hasTracks) for (const [i,key] of trackKeys.entries()) {
          const line = node(el, 'p', `${trackName(key)} ${tracks[i].weight}% · `);
          localTime(line, tracks[i].target, true);
        }
        if (goodLink({url:revision.url,label:revision.note})) {
          node(el, 'a', language === 'zh' ? '对应提交' : 'View commit').href = revision.url;
        }
      }
      document.getElementById('bubble-history').hidden = !list.childElementCount;
    }
    function renderBubble() {
      const zh = language === 'zh';
      const time = value => localFormat().format(new Date(value));
      checkpoint.dateTime = new Date(deadline).toISOString();
      checkpoint.textContent = time(deadline);
      if (!bubble) return;
      const terms = trackKeys.map(key => {
        const track = bubble.tracks[key];
        return `${Date.parse(track.target)} × ${track.weight}`;
      });
      document.getElementById('bubble-formula').textContent =
        `(${terms.join(' + ')}) ÷ 100 → ${new Date(deadline).toISOString()}`;
      document.getElementById('bubble-method').textContent = (bilingual(bubble.method) ? bubble.method[language] : bubble.method);
      document.getElementById('bubble-as-of').textContent =
        (zh ? '数据基准：' : 'As of: ') + time(bubble.asOf);
      const list = document.getElementById('bubble-tracks');
      const sources = document.getElementById('bubble-sources');
      list.replaceChildren();
      sources.replaceChildren();
      for (const key of trackKeys) {
        const track = bubble.tracks[key], weight = track.weight + '%';
        const label = trackName(key);
        document.querySelector(`[data-share="${key}"]`).textContent = weight;
        document.querySelector(`[data-bar="${key}"]`).style.width = weight;
        const item = node(list, 'li');
        node(item, 'strong', `${label} ${weight} · ${time(track.target)}`);
        node(item, 'p', track.summary[language]);
      }
      for (const source of bubble.sources) node(sources, 'a', source.label[language]).href = source.url;
      document.getElementById('bubble-fallback').hidden = true;
      document.getElementById('bubble-details').hidden = false;
      document.getElementById('bubble-mix').hidden = false;
      renderBubbleHistory();
    }
    async function loadBubble() {
      try {
        const response = await fetch('./bubble.json', { cache: 'no-cache' });
        if (!response.ok) return;
        const data = await response.json();
        if (data?.schemaVersion !== 1 || !timestamp(data.asOf) || !(bilingual(data.method) || nonEmpty(data.method)) ||
          !Array.isArray(data.sources) || !data.sources.length || !data.sources.every(goodLink)) return;
        const tracks = trackKeys.map(key => data.tracks?.[key]);
        if (!validTracks(tracks) || !tracks.every(track =>
          Date.parse(track.target) >= Date.parse(data.asOf) && bilingual(track.summary))) return;
        deadline = weightedTarget(tracks);
        bubble = data;
        renderBubble();
        tick();
      } catch { /* Keep the original editorial checkpoint if the feed is unavailable. */ }
    }

    function applyLanguage() {
      root.lang = language === 'zh' ? 'zh-Hans' : 'en';
      document.title = language === 'zh'
        ? 'Scaling Low | AI 风险与叙事核查'
        : 'Scaling Low | AI risk and claim checks';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
      labels.forEach(element => element.setAttribute('aria-label', element.getAttribute(`data-${language}-label`)));
      render();
      readout();
      renderBubble();
    }

    buttons.forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.lang;
      if (next !== 'zh' && next !== 'en') return;
      language = next;
      applyLanguage();
      try { localStorage.setItem(storageKey, language); } catch { /* Optional preference. */ }
    }));
    filters.forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.filter;
      showTopic(next);
      const hash = next === 'all' ? '#news' : '#topic-' + next;
      if (location.hash !== hash) history.pushState(null, '', hash);
    }));
    applyLanguage();
    revealHash(true);
    load();
    loadBubble();
  }, { once: true });
})();
