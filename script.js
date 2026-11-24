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
        if (check) {
          const strip = node(body,'div','','fact-meta check-meta');
          node(strip,'span',tr(...verdicts[check.verdict]),'fact-verdict');
          if (nonEmpty(check.metric)) node(strip,'span',check.metric,'fact-metric');
        }
        node(body,'h3',e.title[language]);
        if (check) node(body,'p',tr('The headline: ','标题怎么说：') + check.claim[language],'fact-claim');
        node(body,'p',e.summary[language],check ? 'fact-evidence' : '');
        if (check) {
          const details = node(body,'details');
          details.open = openEntries.has(article.id) || location.hash === '#' + article.id;
          details.addEventListener('toggle', () => details.open ? openEntries.add(article.id) : openEntries.delete(article.id));
          node(details,'summary',tr('Read our take & sources','展开解读与信源'));
          node(details,'p',e.takeaway[language],'watch');
          const links = node(details,'div','','sources');
          for (const source of [check.coverage,e.source,...check.otherSources]) node(links,'a',source.label[language]).href = source.url;
          node(links,'a',tr('Link to this item','本条链接')).href = '#' + article.id;
        } else {
          node(body,'p',tr('Our reading: ','编辑解读：') + e.takeaway[language],'watch');
          node(node(body,'div','','sources'),'a',e.source.label[language]).href = e.source.url;
        }
      }
    }
    function revealHash() {
      const id = location.hash.slice(1);
      if (!id.startsWith('case-')) return;
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
