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

  document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button[data-lang]');
    const labels = document.querySelectorAll('[data-en-label][data-zh-label]');
    const filters = document.querySelectorAll('button[data-filter]');
    const status = document.getElementById('news-status');
    const list = document.getElementById('news-list');
    const readout = bindLab();
    let entries = [], state = 'loading', topic = 'all';
    const tr = (en, zh) => language === 'zh' ? zh : en;
    const kinds = {report:'报告', proposal:'提案', research:'研究', company:'企业披露'};
    const factList = document.getElementById('factcheck-list');
    let factEntries = [], factState = 'loading';
    const verdicts = {scope:['Scope check','限定范围'], unsupported:['Not established','证据未到'], verified:['Verified with context','确认及补充']};
    function factNode(parent, tag, value = '', cls = '') {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      el.textContent = value;
      parent.append(el);
      return el;
    }
    function renderFacts() {
      if (!factList) return;
      const open = new Set([...factList.querySelectorAll('details[open]')].map(el => el.parentElement.id));
      factList.replaceChildren();
      if (factState !== 'ready') {
        factNode(factList, 'p', factState === 'loading' ? tr('Loading evidence…','正在加载证据…') : tr('Evidence desk is temporarily unavailable.','暂时无法读取拆条档案。')).setAttribute('role','status');
        return;
      }
      for (const e of factEntries) {
        const card = factNode(factList,'article','','fact-card');
        card.id = 'case-' + e.id;
        const meta = factNode(card,'div','','fact-meta');
        factNode(meta,'time',e.date).dateTime = e.date;
        factNode(meta,'span',tr(...verdicts[e.verdict]),'fact-verdict');
        if (typeof e.metric === 'string' && e.metric) factNode(card,'div',e.metric,'fact-metric');
        factNode(card,'h3',e.title[language]);
        factNode(card,'p',tr('The headline: ','标题怎么说：') + e.claim[language],'fact-claim');
        factNode(card,'p',e.evidence[language],'fact-evidence');
        const details = factNode(card,'details');
        details.open = open.has(card.id) || location.hash === '#' + card.id;
        factNode(details,'summary',tr('Read our take & sources','展开解读与信源'));
        factNode(details,'p',e.takeaway[language]);
        const links = factNode(details,'div','','sources');
        for (const source of [e.coverage,...e.sources]) {
          factNode(links,'a',source.label[language]).href = source.url;
        }
        factNode(links,'a',tr('Link to this case','本条链接')).href = '#' + card.id;
      }
    }
    async function loadFacts() {
      if (!factList) return;
      try {
        const r = await fetch('./factchecks.json',{mode:'same-origin',cache:'no-cache'});
        if (!r.ok) throw Error();
        const data = await r.json();
        if (data.schemaVersion !== 1 || !Array.isArray(data.entries)) throw Error();
        const pair = p => p && ['en','zh'].every(k => typeof p[k] === 'string' && p[k].trim());
        const link = l => {
          try {
            const u = new URL(l.url);
            return pair(l.label) && u.protocol === 'https:' && !u.username && !u.password;
          } catch { return false; }
        };
        const seen = new Set();
        factEntries = data.entries.filter(e => {
          if (!e || typeof e.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(e.id) || seen.has(e.id) ||
              !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !Object.hasOwn(verdicts,e.verdict) ||
              ![e.title,e.claim,e.evidence,e.takeaway].every(pair) || !link(e.coverage) ||
              !Array.isArray(e.sources) || !e.sources.length || !e.sources.every(link)) return false;
          seen.add(e.id);
          return true;
        }).sort((a,b) => b.date.localeCompare(a.date));
        factState = factEntries.length ? 'ready' : 'error';
      } catch { factState = 'error'; }
      renderFacts();
      if (location.hash.startsWith('#case-')) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    }
    window.addEventListener('hashchange', () => {
      if (location.hash.startsWith('#case-')) {
        const detail = document.getElementById(location.hash.slice(1))?.querySelector('details');
        if (detail) detail.open = true;
      }
    });
    function render() {
      list.replaceChildren();
      const visible = entries.filter(e => topic === 'all' || e.topic === topic);
      filters.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === topic)));
      status.textContent = state === 'loading' ? tr('Loading news…','正在加载简讯…') : state === 'error' ? tr('No readable news data available.','无法读取有效新闻数据。') : !visible.length ? tr('No entries for this topic.','本主题暂无简讯。') : tr(`${visible.length} entries`, `共 ${visible.length} 篇`);
      function node(parent, tag, text, cls) {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        el.textContent = text; parent.append(el); return el;
      }
      for (const e of visible) {
        const article = node(list,'article','','note');
        const meta = node(article,'div','','dateline');
        node(meta,'time',e.date).dateTime = e.date;
        node(meta,'span',tr(e.kind,kinds[e.kind]));
        const body = node(article,'div','');
        node(body,'h3',e.title[language]);
        node(body,'p',e.summary[language]);
        node(body,'p',tr('Our reading: ','编辑解读：') + e.takeaway[language],'watch');
        node(node(body,'div','','sources'),'a',e.source.label[language]).href = e.source.url;
      }
    }
    async function load() {
      try {
        const response = await fetch('./news.json', {mode:'same-origin', cache:'no-cache'});
        if (!response.ok) throw Error();
        const data = await response.json(), seen = new Set();
        if (data.schemaVersion !== 1 || !Array.isArray(data.entries)) throw Error();
        const text = v => typeof v === 'string' && v.trim();
        const pair = v => v && text(v.en) && text(v.zh);
        entries = data.entries.filter(e => {
          if (!e || !text(e.id) || seen.has(e.id.trim()) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !['misuse','reliability','governance','infrastructure'].includes(e.topic) || !Object.hasOwn(kinds,e.kind) || ![e.title,e.summary,e.takeaway,e.source?.label].every(pair)) return false;
          try {
            const url = new URL(e.source.url);
            if (url.protocol !== 'https:' || url.username || url.password || new Date(e.date).toISOString().slice(0,10) !== e.date) return false;
          } catch { return false; }
          seen.add(e.id.trim()); return true;
        }).sort((a,b) => b.date.localeCompare(a.date));
        state = entries.length ? 'ready' : 'error';
      } catch { state = 'error'; }
      render();
    }

    const deadline = Date.parse(document.getElementById('checkpoint').dateTime);
    const clock = document.getElementById('clock');
    const digits = clock.querySelectorAll('strong');
    let timer;
    function tick() {
      const n = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      [Math.floor(n/86400), Math.floor(n/3600)%24, Math.floor(n/60)%60, n%60].forEach((v,i) => {
        const value = String(v).padStart(2,'0');
        if (digits[i].textContent !== value) digits[i].textContent = value;
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
      renderFacts();
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
    loadFacts();
  }, { once: true });
})();
