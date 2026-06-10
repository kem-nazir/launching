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
  const tagline = document.getElementById('tagline');

  let mx = -9999, my = -9999;
  let mouseInside = false;
  let ctx, W, H;

  const NEON = [
    { r: 0, g: 247, b: 255 },
    { r: 255, g: 0, b: 255 },
    { r: 255, g: 0, b: 85 },
    { r: 0, g: 255, b: 136 },
    { r: 255, g: 170, b: 0 },
  ];

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Countdown ──

  function getRemaining() {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      total: diff,
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

  // ── Particles ──

  const PARTICLE_COUNT = 180;
  const CONN_DIST = 110;
  const TRAIL_LEN = 6;
  let particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = pick(NEON);
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.6, 0.6),
        vy: rand(-0.6, 0.6),
        size: rand(1.2, 3.5),
        alpha: rand(0.2, 0.7),
        color: c,
        trail: [],
      });
    }
  }

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1, 5);
      const c = pick(NEON);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(1, 3),
        alpha: rand(0.4, 1),
        color: c,
        life: 120,
        maxLife: 120,
      });
    }
  }

  function burstRandom() {
    const x = rand(W * 0.1, W * 0.9);
    const y = rand(H * 0.1, H * 0.9);
    spawnBurst(x, y, randInt(20, 50));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Mouse repulsion
      if (mouseInside) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 2;
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Speed cap
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 3) { p.vx = (p.vx / spd) * 3; p.vy = (p.vy / spd) * 3; }

      // Wrap
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;

      // Life
      if (p.life !== undefined) {
        p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
      }

      // Store trail
      if (p.life === undefined && p.trail) {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LEN) p.trail.shift();
      }
    }

    // Draw trails
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.life !== undefined || !p.trail) continue;
      const tr = p.trail;
      if (tr.length < 2) continue;
      for (let j = 1; j < tr.length; j++) {
        const alpha = (j / tr.length) * p.alpha * 0.3;
        ctx.beginPath();
        ctx.moveTo(tr[j - 1].x, tr[j - 1].y);
        ctx.lineTo(tr[j].x, tr[j].y);
        ctx.strokeStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`;
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();
      }
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const lifeAlpha = p.life !== undefined ? (p.life / p.maxLife) : 1;
      const a = p.alpha * lifeAlpha;

      // Glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
      grad.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.3})`);
      grad.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
      ctx.fill();

      // Bright center
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a * 0.6})`;
      ctx.fill();
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONN_DIST) {
          const alpha = (1 - dist / CONN_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 247, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  let burstInterval;

  function startBursts() {
    burstInterval = setInterval(burstRandom, randInt(2000, 5000));
  }

  // ── Glitch ──

  let glitchOverlay;

  function createGlitchOverlay() {
    glitchOverlay = document.createElement('div');
    glitchOverlay.className = 'glitch-overlay';
    document.body.appendChild(glitchOverlay);
  }

  function triggerGlitch() {
    if (!glitchOverlay) return;

    // Screen flash
    glitchOverlay.style.opacity = '0';
    glitchOverlay.style.backgroundColor = 'transparent';
    void glitchOverlay.offsetWidth;
    glitchOverlay.style.backgroundColor = `rgba(0,247,255,0.05)`;
    glitchOverlay.style.opacity = '1';
    setTimeout(() => {
      glitchOverlay.style.opacity = '0';
      glitchOverlay.style.backgroundColor = 'transparent';
    }, 80);

    // Tagline glitch
    if (tagline) {
      const orig = tagline.textContent;
      const chars = '!@#$%^&*<>?/|\\~';
      const glitched = orig.split('').map(c =>
        Math.random() < 0.4 ? chars[randInt(0, chars.length - 1)] : c
      ).join('');
      tagline.textContent = glitched;
      tagline.style.color = pick(['#00f7ff', '#ff00ff', '#ff0055']);
      setTimeout(() => {
        tagline.textContent = orig;
        tagline.style.color = '';
      }, 120);
    }

    // Burst
    spawnBurst(W / 2 + rand(-200, 200), H / 2 + rand(-200, 200), randInt(30, 60));

    // Shake
    document.body.style.transform = `translate(${rand(-3, 3)}px, ${rand(-2, 2)}px)`;
    setTimeout(() => { document.body.style.transform = ''; }, 80);
  }

  function startGlitch() {
    setInterval(() => {
      if (Math.random() < 0.3) triggerGlitch();
    }, randInt(3000, 8000));
  }

  // ── Mouse ──

  function initMouse() {
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      mouseInside = true;
    });
    document.addEventListener('mouseleave', () => {
      mouseInside = false;
    });
    document.addEventListener('click', e => {
      spawnBurst(e.clientX, e.clientY, randInt(30, 60));
      triggerGlitch();
    });
    document.addEventListener('touchmove', e => {
      const t = e.touches[0];
      mx = t.clientX;
      my = t.clientY;
      mouseInside = true;
    }, { passive: true });
    document.addEventListener('touchend', () => {
      mouseInside = false;
    });
  }

  // ── Init ──

  function init() {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    initParticles();
    initMouse();
    createGlitchOverlay();

    tick();
    setInterval(tick, 1000);

    // Animate
    (function loop() {
      drawParticles();
      requestAnimationFrame(loop);
    })();

    startBursts();
    startGlitch();

    // Initial burst
    setTimeout(() => burstRandom(), 500);
    setTimeout(() => burstRandom(), 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
