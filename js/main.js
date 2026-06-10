(function () {
  'use strict';

  const TARGET = new Date('2026-06-11T18:00:00.000Z');
  let target = TARGET;
  const params = new URLSearchParams(window.location.search);
  if (params.has('demo')) target = new Date(Date.now() + 15000);

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  const canvas = document.getElementById('canvas');
  const labels = document.querySelectorAll('.labels span');

  let ctx, W, H;
  let particles = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  // ── Countdown ──

  function getRemaining() {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    };
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function flip(el) {
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
  }

  function tick() {
    const t = getRemaining();
    const d = pad(t.days), h = pad(t.hours), m = pad(t.mins), s = pad(t.secs);

    if (daysEl.textContent !== d) { daysEl.textContent = d; flip(daysEl); }
    if (hoursEl.textContent !== h) { hoursEl.textContent = h; flip(hoursEl); }
    if (minsEl.textContent !== m) { minsEl.textContent = m; flip(minsEl); }
    if (secsEl.textContent !== s) { secsEl.textContent = s; flip(secsEl); }
  }

  // ── Motes (floating dust particles) ──

  const COUNT = 45;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.3, 1.2),
        alpha: rand(0.02, 0.08),
        vx: rand(-0.02, 0.02),
        vy: rand(-0.03, -0.01),
        speed: rand(0.1, 0.3),
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    const now = Date.now() * 0.001;

    for (const p of particles) {
      p.x += Math.sin(now * p.speed + p.y * 0.01) * 0.08;
      p.y += p.vy;

      if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      const pulse = 0.7 + 0.3 * Math.sin(now * p.speed * 2 + p.x * 0.01);
      const a = p.alpha * pulse;

      // glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grad.addColorStop(0, `rgba(255,255,255,${a * 0.15})`);
      grad.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    }
  }

  // ── Init ──

  function init() {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', () => { resize(); initParticles(); });

    initParticles();
    tick();
    setInterval(tick, 1000);

    (function loop() {
      drawParticles();
      requestAnimationFrame(loop);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
