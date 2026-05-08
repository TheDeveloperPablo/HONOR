gsap.registerPlugin(ScrollTrigger);

/* ── Scroll lock (intro only) ──────────────────────────────────── */
function _preventScroll(e) { e.preventDefault(); }
function _preventKeys(e) { if ([32,33,34,35,36,37,38,39,40].includes(e.keyCode)) e.preventDefault(); }
function lockScroll()   { window.addEventListener('wheel', _preventScroll, { passive: false }); window.addEventListener('touchmove', _preventScroll, { passive: false }); window.addEventListener('keydown', _preventKeys); }
function unlockScroll() { window.removeEventListener('wheel', _preventScroll); window.removeEventListener('touchmove', _preventScroll); window.removeEventListener('keydown', _preventKeys); }
lockScroll();

gsap.set('.honor-title', { perspective: 900 });
gsap.set('.panel-statue', { opacity: 0, y: 28 });


/* ─────────────────────────────────────────────────────
   0. LOADER
───────────────────────────────────────────────────── */
const loaderNum  = document.getElementById('loader-num');
const loaderLine = document.getElementById('loader-line');
const loaderEl   = document.getElementById('loader');

const loaderTl = gsap.timeline({ onComplete: startIntro });
loaderTl.to({ val: 0 }, {
  val: 100,
  duration: 1.4,
  ease: 'power2.inOut',
  onUpdate() {
    loaderNum.textContent = Math.round(this.targets()[0].val) + '%';
    gsap.set(loaderLine, { width: Math.round(this.targets()[0].val) + '%' });
  },
});
loaderTl.to('#loader-num', { opacity: 0, y: -20, duration: 0.5, ease: 'power3.in' }, '+=0.2');
loaderTl.to(loaderEl,      { yPercent: -100, duration: 1.0, ease: 'expo.inOut' },    '-=0.1');


/* ─────────────────────────────────────────────────────
   1. ENTRY SEQUENCE — played after loader exits
───────────────────────────────────────────────────── */
let intro = null;   // set by matchMedia before loader completes

function startIntro() {
  loaderEl.style.display = 'none';
  if (intro) intro.play();
}


/* ─────────────────────────────────────────────────────
   SHARED — blind bars + typewriter (device-agnostic)
───────────────────────────────────────────────────── */
const barsContainer = document.getElementById('blind-bars');
for (let i = 0; i < 100; i++) {
  const bar = document.createElement('div');
  bar.className = 'blind-bar';
  barsContainer.appendChild(bar);
}

const twEl    = document.getElementById('console-text');
const twCur   = document.getElementById('console-underscore');
const twWords = ['Where captured light becomes art', 'A fine art photography studio'];
let   twIvals = [];

function startTypewriter() {
  let visible = true, letterCount = 1, x = 1, waiting = false, wordIdx = 0;
  const typing = setInterval(function () {
    const word = twWords[wordIdx % twWords.length];
    if (letterCount === 0 && !waiting) {
      waiting = true; twEl.innerHTML = '';
      setTimeout(function () { wordIdx++; x = 1; letterCount += x; waiting = false; }, 400);
    } else if (letterCount === word.length + 1 && !waiting) {
      waiting = true;
      setTimeout(function () { x = -1; letterCount += x; waiting = false; }, 900);
    } else if (!waiting) {
      twEl.innerHTML = word.substring(0, letterCount); letterCount += x;
    }
  }, 55);
  const blinking = setInterval(function () {
    visible = !visible;
    twCur.className = visible ? 'console-underscore' : 'console-underscore hidden';
  }, 400);
  twIvals = [typing, blinking];
}

function stopTypewriter() {
  twIvals.forEach(clearInterval); twIvals = [];
  twEl.innerHTML = ''; twCur.className = 'console-underscore';
}


/* ══════════════════════════════════════════════════════
   GSAP MATCHMEDIA
══════════════════════════════════════════════════════ */
const mm = gsap.matchMedia();


/* ─────────────────────────────────────────────────────
   DESKTOP  (≥ 851px) — full animations
───────────────────────────────────────────────────── */
mm.add('(min-width: 851px)', () => {

  /* 1. Intro */
  intro = gsap.timeline({ paused: true, onComplete: unlockScroll });
  intro.to('#page-transition', { scaleY: 0, transformOrigin: 'top center', duration: 0.9, ease: 'power4.inOut' }, 0);
  intro.to('.split-line', { scaleY: 1, duration: 1.1, ease: 'expo.out' }, 0.4);
  const flipIn = { rotationX: 90, opacity: 0, transformOrigin: 'bottom center', duration: 0.85, stagger: 0.06, ease: 'power4.out' };
  intro.from('.panel-dark  .letter', flipIn, 0.3);
  intro.from('.panel-light .letter', flipIn, 0.3);
  intro.to('.hero-tag',     { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.7);
  intro.to('.hero-tagline', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.8);
  intro.to('.panel-statue', { opacity: 0.75, y: 0, duration: 1.2, ease: 'power3.out' }, 0.9);
  intro.to('.scroll-hint',  { opacity: 1, duration: 0.5 }, 1.1);
  intro.to('.scroll-bar',   { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 1.2);

  /* 2. Hero pinned scroll — panel flood + letter scatter */
  const pinTl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=220%', pin: true, scrub: 1.5, anticipatePin: 1 },
  });
  pinTl.to('.panel-light',  { clipPath: 'inset(0 0 0 0%)', ease: 'power2.inOut', duration: 1 }, 0);
  pinTl.to('.split-line',   { opacity: 0, duration: 0.35 }, 0.05);
  pinTl.to('.hero-tag',     { opacity: 0, duration: 0.35 }, 0.05);
  pinTl.to('.hero-tagline', { opacity: 0, y: -18, duration: 0.4 }, 0.1);
  pinTl.to('.scroll-hint',  { opacity: 0, duration: 0.3 }, 0.05);
  const exitPaths = [
    { x: '-40vw', y: '-48vh', rotation: -24, scale: 2.8 },
    { x: '-16vw', y: '-60vh', rotation:  16, scale: 2.2 },
    { x:    '0',  y:    '0',  rotation:   0, scale: 9.0 },
    { x:  '18vw', y: '-54vh', rotation: -20, scale: 2.4 },
    { x:  '42vw', y: '-44vh', rotation:  22, scale: 2.8 },
  ];
  gsap.utils.toArray('.panel-light .letter-wrap').forEach((wrap, i) => {
    const p = exitPaths[i];
    pinTl.to(wrap, { x: p.x, y: p.y, rotation: p.rotation, scale: p.scale, opacity: 0, duration: 0.75, ease: 'power3.in' }, 1.15 + i * 0.10);
  });

  /* 3. Gallery — y-translation + crossfade + markers */
  document.querySelectorAll('.gallery-item .swapper').forEach((swapper) => {
    const box        = swapper.closest('.image-box');
    const controller = box.querySelector('.controller');
    const imgs       = swapper.querySelectorAll('img');
    const markers    = swapper.querySelectorAll('.g-progress > div div');
    gsap.to(swapper, { y: controller.offsetHeight - swapper.offsetHeight, ease: 'none', scrollTrigger: { trigger: box, scrub: true, start: 'top center', end: 'bottom center' } });
    gsap.to(imgs, { opacity: (i) => (i === 0 ? 1 : 0), ease: 'none', scrollTrigger: { trigger: box, scrub: true, start: 'top center-=25%', end: 'bottom center+=25%' } });
    markers.forEach((m, i) => {
      gsap.to(m, { height: '100%', ease: 'none', scrollTrigger: { trigger: box, scrub: true, start: i === 0 ? 'center center+=50%' : 'center center', end: i === 0 ? 'center center' : 'center center-=50%' } });
    });
  });

  /* 4. Venetian bars */
  gsap.timeline({
    scrollTrigger: {
      trigger: '.next-section', start: 'top top', end: '+=280%', pin: true, scrub: 1.5, anticipatePin: 1,
      onEnter:     () => { lockScroll(); startTypewriter(unlockScroll); },
      onLeaveBack: () => { stopTypewriter(); unlockScroll(); gsap.set('.blind-bar', { xPercent: 0, rotation: 0 }); gsap.set('#console-wrap', { opacity: 1 }); },
    },
  })
  .to('#console-wrap', { opacity: 0, duration: 0.12 }, 0.55)
  .to('.blind-bar', { force3D: true, xPercent: 100, ease: 'power2.inOut', stagger: { amount: 1 }, duration: 1 }, 0.6)
  .to('.blind-bar', { rotation: 45, ease: 'power1.out', duration: 1 }, 0.6)
  .to('.blind-bar', { rotation: 0,  ease: 'power1.in',  duration: 1 }, 1.6);

  /* 5. Tagline hover */
  const darkWords  = [...document.querySelectorAll('.panel-dark  .tw')];
  const lightWords = [...document.querySelectorAll('.panel-light .tw')];
  const goldColor  = 'rgba(200,169,110,0.95)';
  darkWords.forEach((dw, i) => {
    const lw = lightWords[i];
    const enter = () => { gsap.to([dw, lw], { y: -5, color: goldColor, duration: 0.3, ease: 'power2.out' }); };
    const leave = () => {
      gsap.to(dw, { y: 0, color: 'rgba(240,237,232,0.35)', duration: 0.55, ease: 'power3.out' });
      gsap.to(lw, { y: 0, color: 'rgba(8,8,8,0.35)',       duration: 0.55, ease: 'power3.out' });
    };
    dw.addEventListener('mouseenter', enter); dw.addEventListener('mouseleave', leave);
    lw.addEventListener('mouseenter', enter); lw.addEventListener('mouseleave', leave);
  });

  return () => { intro = null; };
});


/* ─────────────────────────────────────────────────────
   MOBILE  (≤ 850px) — fade / 20px only
───────────────────────────────────────────────────── */
mm.add('(max-width: 850px)', () => {

  /* 1. Intro — simple fade + 20px lift */
  intro = gsap.timeline({ paused: true, onComplete: unlockScroll });
  intro.to('#page-transition', { scaleY: 0, transformOrigin: 'top center', duration: 0.7, ease: 'power4.inOut' }, 0);
  intro.to('.split-line', { scaleY: 1, duration: 0.8, ease: 'expo.out' }, 0.3);
  intro.from('.panel-dark  .letter', { opacity: 0, y: 20, duration: 0.7, stagger: 0.05, ease: 'power3.out' }, 0.35);
  intro.from('.panel-light .letter', { opacity: 0, y: 20, duration: 0.7, stagger: 0.05, ease: 'power3.out' }, 0.35);
  intro.to('.hero-tag',     { opacity: 1, duration: 0.5 }, 0.7);
  intro.to('.hero-tagline', { opacity: 1, y: 0, duration: 0.6 }, 0.8);
  intro.to('.panel-statue', { opacity: 0.6, y: 0, duration: 1.0 }, 0.85);
  intro.to('.scroll-hint',  { opacity: 1, duration: 0.4 }, 1.0);
  intro.to('.scroll-bar',   { scaleX: 1, duration: 0.4 }, 1.1);

  /* 2. Hero pinned scroll — panel flood + letters fade out (no scatter) */
  const pinTl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=220%', pin: true, scrub: 1.5, anticipatePin: 1 },
  });
  pinTl.to('.panel-light',  { clipPath: 'inset(0 0 0 0%)', ease: 'power2.inOut', duration: 1 }, 0);
  pinTl.to('.split-line',   { opacity: 0, duration: 0.35 }, 0.05);
  pinTl.to('.hero-tag',     { opacity: 0, duration: 0.35 }, 0.05);
  pinTl.to('.hero-tagline', { opacity: 0, y: -18, duration: 0.4 }, 0.1);
  pinTl.to('.scroll-hint',  { opacity: 0, duration: 0.3 }, 0.05);
  gsap.utils.toArray('.panel-light .letter-wrap').forEach((wrap, i) => {
    pinTl.to(wrap, { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' }, 1.15 + i * 0.08);
  });

  /* 3. Gallery — crossfade + markers only (no y-translation) */
  document.querySelectorAll('.gallery-item .swapper').forEach((swapper) => {
    const box     = swapper.closest('.image-box');
    const imgs    = swapper.querySelectorAll('img');
    const markers = swapper.querySelectorAll('.g-progress > div div');
    gsap.to(imgs, { opacity: (i) => (i === 0 ? 1 : 0), ease: 'none', scrollTrigger: { trigger: box, scrub: true, start: 'top center-=25%', end: 'bottom center+=25%' } });
    markers.forEach((m, i) => {
      gsap.to(m, { height: '100%', ease: 'none', scrollTrigger: { trigger: box, scrub: true, start: i === 0 ? 'center center+=50%' : 'center center', end: i === 0 ? 'center center' : 'center center-=50%' } });
    });
  });

  /* 4. Venetian bars (same — works great on mobile too) */
  gsap.timeline({
    scrollTrigger: {
      trigger: '.next-section', start: 'top top', end: '+=280%', pin: true, scrub: 1.5, anticipatePin: 1,
      onEnter:     () => { lockScroll(); startTypewriter(unlockScroll); },
      onLeaveBack: () => { stopTypewriter(); unlockScroll(); gsap.set('.blind-bar', { xPercent: 0, rotation: 0 }); gsap.set('#console-wrap', { opacity: 1 }); },
    },
  })
  .to('#console-wrap', { opacity: 0, duration: 0.12 }, 0.55)
  .to('.blind-bar', { force3D: true, xPercent: 100, ease: 'power2.inOut', stagger: { amount: 1 }, duration: 1 }, 0.6)
  .to('.blind-bar', { rotation: 45, ease: 'power1.out', duration: 1 }, 0.6)
  .to('.blind-bar', { rotation: 0,  ease: 'power1.in',  duration: 1 }, 1.6);

  return () => { intro = null; };
});
