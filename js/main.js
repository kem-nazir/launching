(function () {
  'use strict';

  const TARGET_DATE = new Date('2026-06-11T18:00:00.000Z');
  const REDIRECT_URL = '/';
  const REDIRECT_DELAY = 5000;
  const CLICK_THRESHOLD = 5;

  let countdownTarget = TARGET_DATE;

  const params = new URLSearchParams(window.location.search);
  if (params.has('demo')) {
    countdownTarget = new Date(Date.now() + 10000);
  }

  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');
  const clockTimeEl = document.getElementById('clock-time');
  const logo = document.getElementById('logo-wrapper');
  const toast = document.getElementById('toast');
  const revealOverlay = document.getElementById('reveal-overlay');
  const form = document.getElementById('notify-form');
  const emailInput = document.getElementById('email');
  const formMessage = document.getElementById('form-message');
  const jdaysNumber = document.getElementById('jdays-number');
  const canvas = document.getElementById('particle-canvas');
  const heroInner = document.querySelector('.hero-inner');

  let clickCount = 0;
  let countdownFinished = false;
  let audioCtx = null;

  function getTimeRemaining() {
    var now = Date.now();
    var diff = Math.max(0, countdownTarget.getTime() - now);
    return {
      total: diff,
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateJdays() {
    var t = getTimeRemaining();
    var prev = jdaysNumber.textContent;
    jdaysNumber.textContent = t.days;
    if (prev !== jdaysNumber.textContent && prev !== '--') {
      jdaysNumber.classList.remove('bump');
      void jdaysNumber.offsetWidth;
      jdaysNumber.classList.add('bump');
    }
  }

  function updateCountdown() {
    var t = getTimeRemaining();
    var prevDays = daysEl.textContent;
    var prevHours = hoursEl.textContent;
    var prevMins = minutesEl.textContent;
    var prevSecs = secondsEl.textContent;

    daysEl.textContent = pad(t.days);
    hoursEl.textContent = pad(t.hours);
    minutesEl.textContent = pad(t.minutes);
    secondsEl.textContent = pad(t.seconds);

    if (daysEl.textContent !== prevDays) animateFlip(daysEl);
    if (hoursEl.textContent !== prevHours) animateFlip(hoursEl);
    if (minutesEl.textContent !== prevMins) animateFlip(minutesEl);
    if (secondsEl.textContent !== prevSecs) animateFlip(secondsEl);

    updateJdays();

    if (t.total > 0 && t.total <= 86400000 && !countdownFinished) {
      playTick();
    }

    if (t.total <= 0 && !countdownFinished) {
      countdownFinished = true;
      triggerReveal();
    }
  }

  function animateFlip(el) {
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
  }

  function updateClock() {
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    var gmt2 = new Date(utc + 2 * 3600000);
    clockTimeEl.textContent = pad(gmt2.getHours()) + ':' + pad(gmt2.getMinutes()) + ':' + pad(gmt2.getSeconds());
  }

  function playTick() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    try {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (_) {}
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(function () { toast.classList.remove('visible'); }, 4000);
  }

  function initEasterEgg() {
    logo.addEventListener('click', function () {
      clickCount++;
      if (clickCount >= CLICK_THRESHOLD) {
        clickCount = 0;
        showToast("Merci d'\u00eatre aussi curieux. Rendez-vous le 11 juin.");
      }
    });

    logo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        logo.click();
      }
    });
  }

  function initParallax() {
    document.addEventListener('mousemove', function (e) {
      if (!heroInner || countdownFinished) return;
      var x = (e.clientX / window.innerWidth - 0.5) * 4;
      var y = (e.clientY / window.innerHeight - 0.5) * 4;
      heroInner.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    });
  }

  function initParticles() {
    var ctx = canvas.getContext('2d');
    var w, h;
    var particles = [];
    var COUNT = 60;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    var fireColors = [
      { r: 178, g: 34, b: 34 },
      { r: 212, g: 56, b: 13 },
      { r: 201, g: 168, b: 108 },
      { r: 230, g: 126, b: 34 },
    ];

    for (var i = 0; i < COUNT; i++) {
      var c = fireColors[Math.floor(Math.random() * fireColors.length)];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.08,
        color: c,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color.r + ', ' + p.color.g + ', ' + p.color.b + ', ' + p.alpha + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    draw();
  }

  function initObserver() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function initForm() {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      formMessage.className = 'form-message';

      if (!email) {
        formMessage.textContent = 'Veuillez entrer une adresse email.';
        formMessage.classList.add('error');
        emailInput.classList.add('error');
        return;
      }

      if (!isValidEmail(email)) {
        formMessage.textContent = 'Adresse email invalide.';
        formMessage.classList.add('error');
        emailInput.classList.add('error');
        return;
      }

      emailInput.classList.remove('error');

      var formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Erreur serveur');
          formMessage.textContent = 'Merci ! Vous serez inform\u00e9(e) du lancement.';
          formMessage.classList.add('success');
          emailInput.value = '';
        })
        .catch(function () {
          formMessage.textContent = 'Merci ! Votre email a bien \u00e9t\u00e9 enregistr\u00e9.';
          formMessage.classList.add('success');
          emailInput.value = '';
        });
    });

    emailInput.addEventListener('input', function () {
      emailInput.classList.remove('error');
      formMessage.className = 'form-message';
    });
  }

  function triggerReveal() {
    revealOverlay.classList.add('active');
    revealOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(function () {
      window.location.href = REDIRECT_URL;
    }, REDIRECT_DELAY);
  }

  function init() {
    initParticles();
    initObserver();
    initEasterEgg();
    initParallax();
    initForm();

    updateCountdown();
    updateClock();
    setInterval(updateCountdown, 1000);
    setInterval(updateClock, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
