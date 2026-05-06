gsap.registerPlugin(ScrollTrigger);

function _preventScroll(e) { e.preventDefault(); }
function _preventKeys(e) { if ([32,33,34,35,36,37,38,39,40].includes(e.keyCode)) e.preventDefault(); }
function lockScroll()   { window.addEventListener('wheel', _preventScroll, { passive: false }); window.addEventListener('touchmove', _preventScroll, { passive: false }); window.addEventListener('keydown', _preventKeys); }
function unlockScroll() { window.removeEventListener('wheel', _preventScroll); window.removeEventListener('touchmove', _preventScroll); window.removeEventListener('keydown', _preventKeys); }
lockScroll();

/* ── Set perspective so rotationX has visible depth ── */
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
   1. ENTRY SEQUENCE (triggered after loader exits)
───────────────────────────────────────────────────── */
function startIntro() {
  loaderEl.style.display = 'none';
  intro.play();
}

const intro = gsap.timeline({ paused: true, onComplete: unlockScroll });

/* Curtain exits */
intro.to('#page-transition', {
  scaleY: 0,
  transformOrigin: 'top center',
  duration: 0.9,
  ease: 'power4.inOut',
}, 0);

/* Split line grows from its midpoint outward */
intro.to('.split-line', {
  scaleY: 1,
  duration: 1.1,
  ease: 'expo.out',
}, 0.4);

/* Both panels animate simultaneously — selecting separately
   prevents GSAP from chaining dark→light sequentially */
const flipIn = {
  rotationX: 90,
  opacity: 0,
  transformOrigin: 'bottom center',
  duration: 0.85,
  stagger: 0.06,
  ease: 'power4.out',
};
intro.from('.panel-dark  .letter', flipIn, 0.3);
intro.from('.panel-light .letter', flipIn, 0.3);

/* Supporting elements */
intro.to('.hero-tag',     { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.7);
intro.to('.hero-tagline', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.8);
intro.to('.panel-statue', { opacity: 0.75, y: 0, duration: 1.2, ease: 'power3.out' }, 0.9);
intro.to('.scroll-hint',  { opacity: 1, duration: 0.5 }, 1.1);
intro.to('.scroll-bar',   { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 1.2);


/* ─────────────────────────────────────────────────────
   2. PINNED SCROLL — two-phase timeline
───────────────────────────────────────────────────── */
const pinTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: '+=220%',       // hero stays pinned for 220vh of scroll
    pin: true,
    scrub: 1.5,
    anticipatePin: 1,
  },
});

/* ── PHASE 1 (0 → 1): White panel floods left ──────── */
/* clip-path inset reduces from 50% left to 0% left = full screen white */
pinTl.to('.panel-light', {
  clipPath: 'inset(0 0 0 0%)',
  ease: 'power2.inOut',
  duration: 1,
}, 0);

/* Split line, tags, tagline exit during flood */
pinTl.to('.split-line',    { opacity: 0, duration: 0.35 }, 0.05);
pinTl.to('.hero-tag',      { opacity: 0, duration: 0.35 }, 0.05);
pinTl.to('.hero-tagline',  { opacity: 0, y: -18, duration: 0.4 }, 0.1);
pinTl.to('.scroll-hint',   { opacity: 0, duration: 0.3 }, 0.05);

/* ── PHASE 2 (1.1 → 3): Letters scatter & dissolve ── */
/*
 * Each letter-wrap is moved independently via GSAP transform
 * so overflow:hidden on the wrap stays correct (the wrap itself moves).
 * The N (index 2) scales to 9× — fills the viewport as a ghost letterform
 * before fading, creating a dramatic "brand explosion" moment.
 */
const wraps = gsap.utils.toArray('.panel-light .letter-wrap');

const exitPaths = [
  { x: '-40vw', y: '-48vh', rotation: -24, scale: 2.8 },  // H → top-left
  { x: '-16vw', y: '-60vh', rotation:  16, scale: 2.2 },  // O → top
  { x:    '0',  y:    '0',  rotation:   0, scale: 9.0 },  // N → fills screen
  { x:  '18vw', y: '-54vh', rotation: -20, scale: 2.4 },  // O → top-right
  { x:  '42vw', y: '-44vh', rotation:  22, scale: 2.8 },  // R → right
];

wraps.forEach((wrap, i) => {
  const p = exitPaths[i];
  pinTl.to(wrap, {
    x:        p.x,
    y:        p.y,
    rotation: p.rotation,
    scale:    p.scale,
    opacity:  0,
    duration: 0.75,
    ease:     'power3.in',
  }, 1.15 + i * 0.10);  // staggered start: each letter exits 0.1s after previous
});


/* ─────────────────────────────────────────────────────
   3. GALLERY — scroll crossfade + translation
───────────────────────────────────────────────────── */
document.querySelectorAll('.gallery-item .swapper').forEach((swapper) => {
  const box        = swapper.closest('.image-box');
  const controller = box.querySelector('.controller');
  const imgs       = swapper.querySelectorAll('img');
  const markers    = swapper.querySelectorAll('.g-progress > div div');

  gsap.to(swapper, {
    y: controller.offsetHeight - swapper.offsetHeight,
    ease: 'none',
    scrollTrigger: { trigger: box, scrub: true, start: 'top center', end: 'bottom center' },
  });

  gsap.to(imgs, {
    opacity: (i) => (i === 0 ? 1 : 0),
    ease: 'none',
    scrollTrigger: { trigger: box, scrub: true, start: 'top center-=25%', end: 'bottom center+=25%' },
  });

  markers.forEach((m, i) => {
    gsap.to(m, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: box, scrub: true,
        start: i === 0 ? 'center center+=50%' : 'center center',
        end:   i === 0 ? 'center center'       : 'center center-=50%',
      },
    });
  });
});


/* ─────────────────────────────────────────────────────
   4. NEXT SECTION — text reveal → venetian bars exit
───────────────────────────────────────────────────── */
const barsContainer = document.getElementById('blind-bars');
for (let i = 0; i < 100; i++) {
  const bar = document.createElement('div');
  bar.className = 'blind-bar';
  barsContainer.appendChild(bar);
}

/* ── Typewriter (time-based) + venetian bars (scrub-reversible) ── */
const twEl    = document.getElementById('console-text');
const twCur   = document.getElementById('console-underscore');
const twWords = ['Where captured light becomes art', 'A fine art photography studio'];
let twIvals   = [];

function startTypewriter() {
  let visible = true, letterCount = 1, x = 1, waiting = false, wordIdx = 0;
  const typing = setInterval(function() {
    const word = twWords[wordIdx % twWords.length];
    if (letterCount === 0 && !waiting) {
      waiting = true;
      twEl.innerHTML = '';
      setTimeout(function() { wordIdx++; x = 1; letterCount += x; waiting = false; }, 400);
    } else if (letterCount === word.length + 1 && !waiting) {
      waiting = true;
      setTimeout(function() { x = -1; letterCount += x; waiting = false; }, 900);
    } else if (!waiting) {
      twEl.innerHTML = word.substring(0, letterCount);
      letterCount += x;
    }
  }, 55);
  const blinking = setInterval(function() {
    visible = !visible;
    twCur.className = visible ? 'console-underscore' : 'console-underscore hidden';
  }, 400);
  twIvals = [typing, blinking];
}

function stopTypewriter() {
  twIvals.forEach(clearInterval);
  twIvals = [];
  twEl.innerHTML = '';
  twCur.className = 'console-underscore';
}

gsap.timeline({
  scrollTrigger: {
    trigger: '.next-section',
    start: 'top top',
    end: '+=280%',
    pin: true,
    scrub: 1.5,
    anticipatePin: 1,
    onEnter:     () => startTypewriter(),
    onLeaveBack: () => {
      stopTypewriter();
      gsap.set('.blind-bar',    { xPercent: 0, rotation: 0 });
      gsap.set('#console-wrap', { opacity: 1 });
    },
  },
})
.to('#console-wrap', { opacity: 0, duration: 0.12 }, 0.55)
.to('.blind-bar', { force3D: true, xPercent: 100, ease: 'power2.inOut', stagger: { amount: 1 }, duration: 1 }, 0.6)
.to('.blind-bar', { rotation: 45, ease: 'power1.out', duration: 1 }, 0.6)
.to('.blind-bar', { rotation: 0,  ease: 'power1.in',  duration: 1 }, 1.6);


/* ─────────────────────────────────────────────────────
   5. TAGLINE WORD HOVER
───────────────────────────────────────────────────── */
const darkWords  = [...document.querySelectorAll('.panel-dark  .tw')];
const lightWords = [...document.querySelectorAll('.panel-light .tw')];
const goldColor  = 'rgba(200,169,110,0.95)';

darkWords.forEach((dw, i) => {
  const lw = lightWords[i];

  const enter = () => {
    gsap.to([dw, lw], { y: -5, color: goldColor, duration: 0.3, ease: 'power2.out' });
  };
  const leave = () => {
    gsap.to(dw, { y: 0, color: 'rgba(240,237,232,0.35)', duration: 0.55, ease: 'power3.out' });
    gsap.to(lw, { y: 0, color: 'rgba(8,8,8,0.35)',       duration: 0.55, ease: 'power3.out' });
  };

  dw.addEventListener('mouseenter', enter);
  dw.addEventListener('mouseleave', leave);
  lw.addEventListener('mouseenter', enter);
  lw.addEventListener('mouseleave', leave);
});


