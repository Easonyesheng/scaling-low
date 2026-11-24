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
    const target = () => Number(slider.value) / 100;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let displayed = target();
    let frame = 0;

    function readout() {
      const t = target();
      const compute = 10 ** (3 * t);
      const times = Math.round(compute).toLocaleString(language);
      multiplier.textContent = `${times}×`;
      score.textContent = benchmark(t).toFixed(1);
      bill.textContent = money[language].format(1000 * compute);
      slider.setAttribute('aria-valuetext', language === 'zh' ? `${times} 倍算力` : `${times} times compute`);
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
    slider.addEventListener('input', () => { readout(); move(); });
    return readout;
  }

  // A shared perspective scene behind the whole issue. Geometry is decorative;
  // nothing in this animation represents measured market or model data.
  function bindWorld() {
    const canvas = document.getElementById('world-scene');
    const pause = document.getElementById('signal-pause');
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!ctx) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    const depth = Array.from({length: 29}, (_, i) => i * 41 + 45);
    const fract = n => n - Math.floor(n);
    const random = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
    const smooth = (v, target) => v + (target - v) * .07;
    const dust = Array.from({length: 104}, (_, i) => ({
      x: (random(i*11)*2-1)*740, y: random(i*11+1)*310 - 38,
      z: random(i*11+5)*1100 + 140, a: random(i*11+7), r: random(i*11+9)
    }));
    const blocks = Array.from({length: 22}, (_,i) => ({
      x: (i % 2 ? 1 : -1) * (165 + random(i+63)*495),
      y: random(i+172)*195 - 30, z: 132 + random(i+404)*980,
      r: 7 + random(i+721)*38, a: random(i+963)*6.28
    })).sort((a,b) => b.z-a.z);
    let w=1,h=1,dpr=1,focal=1,frame=0,last=0,elapsed=0;
    let sx=0,sy=0,px=0,py=0,journey=0,section=0;
    const isStill = () => reduce.matches || pause?.checked || document.hidden;
    function dimensions() {
      w=canvas.clientWidth; h=canvas.clientHeight;
      if (!w || !h) return;
      dpr=Math.min(devicePixelRatio||1, w<680 ? 1.15 : 1.6);
      canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
      focal=Math.max(w*.69,h*.54);
      draw();
    }
    function scroll() {
      const distance=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      section=Math.max(0,Math.min(1,scrollY/distance));
    }
    function draw() {
      if (!w || !h) return;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,w,h);
      const t=elapsed, phase=journey;
      const mobile=w<680, yaw=sx*.082+Math.sin(phase*6.3)*.13;
      const cx=w*(mobile?.56:.61)+sx*34, cy=h*(.45+phase*.095)+sy*16;
      const fog=Math.sin(phase*Math.PI);
      const cos=Math.cos(yaw),sin=Math.sin(yaw);
      function proj(x,y,z) {
        const u=x*cos+(z-460)*sin, v=z*cos-x*sin;
        if (v<44) return null;
        const s=focal/v;
        return [cx+u*s,cy-y*s,s];
      }
      function path(points, fill, stroke, line=1, closed=false) {
        if (points.some(p=>!p)) return;
        ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
        for (let i=1;i<points.length;i++) ctx.lineTo(points[i][0],points[i][1]);
        if(closed)ctx.closePath();
        if(fill){ctx.fillStyle=fill;ctx.fill();}
        if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}
      }
      const halo=ctx.createRadialGradient(cx+h*.035,cy,3,cx,cy,h*.66);
      halo.addColorStop(0,'rgba(182,59,34,.28)');
      halo.addColorStop(.26,'rgba(117,32,38,.32)');
      halo.addColorStop(.57,'rgba(95,60,46,.20)');
      halo.addColorStop(1,'rgba(28,17,13,0)');
      ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
      const sun=proj(88,50,1150);
      if(sun){
        const r=Math.min(w*.48,h*.45) * (1.1+fog*.17);
        const sunG=ctx.createRadialGradient(sun[0],sun[1],r*.53,sun[0],sun[1],r);
        sunG.addColorStop(0,'rgba(10,7,12,.8)');
        sunG.addColorStop(.65,'rgba(17,9,15,.94)');
        sunG.addColorStop(.84,'rgba(110,35,31,.52)');
        sunG.addColorStop(.94,'rgba(244,104,64,.23)');
        sunG.addColorStop(1,'rgba(239,90,43,0)');
        ctx.fillStyle=sunG;ctx.beginPath();ctx.arc(sun[0],sun[1],r,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(sun[0],sun[1],r*.94,r*.93,phase*.2,-.46,3.8);ctx.strokeStyle='rgba(250,133,91,.34)';ctx.lineWidth=1;ctx.stroke();
      }
      const fault = z => Math.sin(z*.0085 + phase*3 + t*.09)*39 + Math.sin(z*.024 + phase)*17;
      const floor = (z,i) => -95 + Math.sin(z*.014+i*.83)*18 + Math.sin(z*.029-i*.51)*10;
      const width = z => 33+ Math.sin(z*.019 + phase*3)*13 + fog*17;
      const drift=(t*104+phase*147)%41;
      function terrain(z,i,side) {
        const open=width(z), f=fault(z);
        return proj(f + side*(open+i**1.42*31),floor(z,i)+(i===0?7:Math.min(42,i*i*2)),z);
      }
      for(let j=depth.length-2;j>=0;j--){
        const a=depth[j]+drift,b=depth[j+1]+drift;
        for(const side of [-1,1]){
          for(let i=0;i<(mobile?5:8);i++){
            const q=[terrain(a,i,side),terrain(b,i,side),terrain(b,i+1,side),terrain(a,i+1,side)];
            const haze=.35+Math.min(.52,j*.024);
            const red=i===0?(j%3===0?'rgba(112,47,43,.68)':'rgba(66,33,45,.58)'):(i+j)%3===0?'rgba(37,28,24,.64)':'rgba(24,20,18,.56)';
            path(q,red,i===0?'rgba(231,97,76,.33)':`rgba(143,105,84,${(.18-haze*.12).toFixed(3)})`,.65,true);
          }
        }
        const hot0=proj(fault(a),floor(a,0)-11,a), hot1=proj(fault(b),floor(b,0)-11,b);
        const warm=.3+(.5+.5*Math.sin(j*.89-t*2))*.48;
        path([hot0,hot1],null,`rgba(245,68,36,${warm*.25})`,Math.max(2,13-j*.47));
        path([hot0,hot1],null,`rgba(255,139,82,${warm})`,Math.max(.65,2.4-j*.075));
      }
      // Heat haze rolls across the horizon instead of washing out the text.
      for(let k=0;k<(mobile?2:4);k++){
        const x=(.17+k*.24)*w + Math.sin(t*.13+k*1.7)*w*.07;
        const y=cy+h*(.035+k*.037), r=h*(.13+k*.015);
        const haze=ctx.createRadialGradient(x,y,r*.14,x,y,r);
        haze.addColorStop(0,k%2?'rgba(88,42,26,.16)':'rgba(141,57,28,.15)');
        haze.addColorStop(1,'rgba(36,19,13,0)');
        ctx.fillStyle=haze;ctx.fillRect(x-r,y-r,r*2,r*2);
      }
      for(let i=0;i<blocks.length;i++){
        if(mobile && i%2)continue;
        const b=blocks[i],a=b.a+t*.28+phase,rx=Math.cos(a)*b.r,rz=Math.sin(a)*b.r;
        const zz=b.z + Math.sin(t*.37+b.a)*27,yy=b.y+Math.sin(t*.7+b.a)*11;
        const top=proj(b.x+rx*.18,yy+b.r*.85,zz+rz*.2);
        const left=proj(b.x-rx,yy-b.r*.54,zz-rz);
        const right=proj(b.x+rx,yy-b.r*.30,zz+rz);
        const base=proj(b.x-rz*.67,yy-b.r*.82,zz+rx*.67);
        path([top,left,right],'rgba(24,19,34,.76)','rgba(178,92,106,.31)',.9,true);
        path([left,base,right],'rgba(84,33,42,.63)','rgba(191,82,65,.30)',.7,true);
      }
      for(let i=0;i<dust.length;i++){
        if(mobile&&i%2)continue;
        const d=dust[i],z=d.z+Math.cos(t*.23+d.a*12)*29;
        const p=proj(d.x+Math.sin(t*.61+d.a*13)*18,d.y+Math.sin(t*.5+d.r*9)*24,z);
        if(!p||p[0]<0||p[0]>w||p[1]<0||p[1]>h)continue;
        const q=(.24+d.a*.59)*(.68+.32*Math.sin(t*1.8+d.r*60));
        const size=Math.min(2.65,.7+p[2]*d.r*.75);
        ctx.fillStyle=i%5===0?`rgba(173,190,255,${q})`:`rgba(254,135,84,${q})`;
        ctx.fillRect(p[0],p[1],size,size);
      }
    }
    function loop(now) {
      frame=0;
      if(isStill()){last=0;return;}
      const elapsedMs=now-last;
      if(!last || elapsedMs>(w<680?32:21)) {
        if(last) elapsed+=Math.min(elapsedMs,70)/1000;
        last=now;
        sx=smooth(sx,px); sy=smooth(sy,py); journey=smooth(journey,section);
        draw();
      }
      frame=requestAnimationFrame(loop);
    }
    function state() {
      const still=isStill();
      canvas.dataset.motion=still?'static':'running';
      if(still) { if(frame)cancelAnimationFrame(frame);frame=0;last=0;draw(); }
      else if(!frame)frame=requestAnimationFrame(loop);
    }
    addEventListener('resize',dimensions,{passive:true});
    addEventListener('scroll',scroll,{passive:true});
    addEventListener('pointermove',e=>{
      if(!fine.matches||e.pointerType==='touch')return;
      px=(e.clientX/w-.5)*2;py=(e.clientY/h-.5)*2;
    },{passive:true});
    pause?.addEventListener('change',state);
    reduce.addEventListener('change',state);
    document.addEventListener('visibilitychange',state);
    scroll(); journey=section; dimensions(); root.classList.add('world-ready'); state();
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
    function revealHash() {
      const id = location.hash.slice(1);
      if (!/^(case|news)-[a-z0-9-]+$/.test(id)) return;
      let card = document.getElementById(id);
      if (!card && topic !== 'all') {
        topic = 'all';
        render();
        card = document.getElementById(id);
      }
      if (card) {
        const details = card.querySelector('details');
        if (details) details.open = true;
        card.scrollIntoView();
      }
    }
    window.addEventListener('hashchange', revealHash);
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
      render();
      revealHash();
    }

    const deadline = Date.parse(document.getElementById('checkpoint').dateTime);
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
      if (!n) {
        clearInterval(timer);
        document.removeEventListener('visibilitychange', resumeClock);
        document.getElementById('passed').hidden = false;
      }
    }
    function resumeClock() { if (!document.hidden) tick(); }
    timer = setInterval(tick,1000);
    document.addEventListener('visibilitychange',resumeClock);
    tick();
    function applyLanguage() {
      root.lang = language === 'zh' ? 'zh-Hans' : 'en';
      document.title = language === 'zh'
        ? 'Scaling Low | AI 风险与叙事核查'
        : 'Scaling Low | AI risk and claim checks';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
      labels.forEach(element => element.setAttribute('aria-label', element.getAttribute(`data-${language}-label`)));
      render();
      readout();
    }

    buttons.forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.lang;
      if (next !== 'zh' && next !== 'en') return;
      language = next;
      applyLanguage();
      try { localStorage.setItem(storageKey, language); } catch { /* Optional preference. */ }
    }));
    filters.forEach(button => button.addEventListener('click', () => { topic = button.dataset.filter; render(); }));
    applyLanguage();
    load();
  }, { once: true });
})();
