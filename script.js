(() => {
  'use strict';

  const root = document.documentElement;
  const storageKey = 'scaling-low-lang';
  let language = 'en';
  try {
    if (localStorage.getItem(storageKey) === 'zh') language = 'zh';
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
    const stories = document.querySelectorAll('article[data-topic]');
    const status = document.getElementById('filter-status');
    const readout = bindLab();
    let lastCount = null;

    function updateStatus() {
      if (!status || lastCount === null) return;
      status.textContent = language === 'zh' ? `显示 ${lastCount} 篇报道。`
        : `Showing ${lastCount} ${lastCount === 1 ? 'story' : 'stories'}.`;
    }

    function filter(topic, announce) {
      let count = 0;
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === topic)));
      stories.forEach(story => {
        story.hidden = topic !== 'all' && !story.dataset.topic.split(/[\s,]+/).includes(topic);
        if (!story.hidden) count++;
      });
      if (announce) { lastCount = count; updateStatus(); }
    }

    function applyLanguage() {
      root.lang = language === 'zh' ? 'zh-Hans' : 'en';
      document.title = language === 'zh'
        ? 'Scaling Low — AI 风险观察台 | 2026年11月20日'
        : 'Scaling Low — AI Risk Desk | 20 November 2026';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
      labels.forEach(element => element.setAttribute('aria-label', element.getAttribute(`data-${language}-label`)));
      updateStatus();
      readout();
    }

    buttons.forEach(button => button.addEventListener('click', () => {
      const next = button.dataset.lang;
      if (next !== 'zh' && next !== 'en') return;
      language = next;
      applyLanguage();
      try { localStorage.setItem(storageKey, language); } catch { /* Optional preference. */ }
    }));
    filters.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter, true)));
    filter('all', false);
    applyLanguage();
  }, { once: true });
})();
