const slider = document.getElementById('compute');
const multiplier = document.getElementById('multiplier');
const bill = document.getElementById('bill');
const score = document.getElementById('score');
const point = document.getElementById('point');
const curve = document.getElementById('curve');
// Fictional saturation curve; horizontal position is logarithmic compute.
function benchmark(t) { return 6 + 81 * (1 - Math.exp(-5 * t)); }
const points = Array.from({ length: 101 }, (_, i) => {
  const t = i / 100;
  return `${i === 0 ? 'M' : 'L'}${48 + 626 * t},${275 - benchmark(t) * 2.4}`;
});
curve.setAttribute('d', points.join(' '));
function update() {
  const t = Number(slider.value) / 100;
  const compute = 10 ** (3 * t);
  multiplier.textContent = `${Math.round(compute).toLocaleString('en-US')}×`;
  bill.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(compute * 1000);
  score.textContent = benchmark(t).toFixed(1);
  point.setAttribute('cx', 48 + 626 * t);
  point.setAttribute('cy', 275 - benchmark(t) * 2.4);
  slider.setAttribute('aria-valuetext', `${Math.round(compute)} times compute`);
}
slider.addEventListener('input', update);
update();
