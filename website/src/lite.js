// Phone and tablet layout. With WebGL it tells the same 3D story as the desktop stage, composed for portrait
// (mobile3d.js). For reduced motion or no WebGL it is a plain stacked page with light reveals.
import { ABOUT, CLIENTS, CTA, FACTS, HERO, MARQUEE, RIBBON, SERVICES_WORDS, WORK, href } from './content.js';
import { markArt } from './mark.js';
import { $, $$, S, words, odometer, initRoll } from './ui.js';
import { factCardsHTML, workCardHTML, labsHTML, ribbonCard, mountTestimonials } from './blocks.js';
import { clamp, seg, eout } from './lib/util.js';

const letterRow = w => [...w].map(ch => `<span>${ch === '&' ? '&amp;' : ch}</span>`).join('');
const FIVE = '<i></i><i></i><i></i><i></i><i></i>';

// The band the S flies through, then five slats close over it.
const marquee3D = () => `<div class="wipeb to-light" id="mMq" data-theme="dark" aria-label="Design. Develop. Deliver."><div class="wipe-in">
    <div class="mqt"><div class="mqt-in" id="mMqRow" aria-hidden="true">${[0, 1].map(() => MARQUEE.map(w => `${letterRow(w)}<i>+</i>`).join('')).join('')}</div></div>
    <div class="slt">${FIVE}</div>
  </div></div>`;
const marquee2D = () => {
  const half = MARQUEE.map(w => `<span>${w}</span><i aria-hidden="true">+</i>`).join('');
  return `<div class="l-mq" aria-label="Design. Develop. Deliver." data-theme="dark"><div class="l-mq-in" aria-hidden="true">${half}${half}${half}${half}</div></div>`;
};

const services3D = () => `<div class="m-wrap" id="mSvc" data-theme="light"><section class="m-stage" id="mSvcIn" aria-label="Our services">
    <div class="cap center m-lbl">Our services</div>
    <h2 class="m-words" id="mWords" aria-label="Design. Mobile and web application development.">${SERVICES_WORDS.map(w => `<div>${letterRow(w)}</div>`).join('')}</h2>
    <div class="cap center m-b1"><span id="b1a">✦ Designed with intent. Built to grow.</span><span id="b1b">✦ Different services. One standard of craft.</span></div>
    <a class="btn roll m-vs" href="${href('services/')}"><span data-t="View services"></span><b>→</b></a>
    <div class="m-labs">${labsHTML()}</div>
    <div class="slt m-slt c-white">${FIVE}</div>
  </section></div>`;
const services2D = () => `<section class="l-sec l-svc" aria-label="Our services" data-theme="dark">
    <div class="cap center rv">Our services</div>
    <h2 class="l-svwords rv">${SERVICES_WORDS.join('<br>').replace(/&/g, '&amp;')}</h2>
    <div class="l-labs">${labsHTML()}</div>
    <a class="btn roll rv" href="${href('services/')}"><span data-t="View services"></span><b>→</b></a>
  </section>`;

const dim3D = () => `<div class="m-wrap" id="mDim" data-theme="light"><section class="m-stage" id="dim" aria-label="Design in motion">
    <p class="p17 center m-dimtop">Concepts, applications and interface designs crafted for our clients.</p>
    <div class="fr c">
      <svg class="a" width="1920" height="868" style="left:0;top:0" aria-hidden="true"><path id="dimArc" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1.2"/></svg>
      <h2 class="a dimT" id="dimA" style="top:286px" aria-label="Design in motion"></h2>
      <div class="a dimT" id="dimB" style="top:462px" aria-hidden="true"></div>
      <div class="a center" id="dimS" style="left:791px;top:417px;width:340px">Exploring ideas through<br>daily design practice.</div>
      <div class="a" id="rib"><div id="ribIn"></div></div>
    </div>
    <a class="btn roll m-vs" href="${href('projects/')}"><span data-t="View portfolio"></span><b>→</b></a>
    <div class="slt m-slt c-dark">${FIVE}</div>
  </section></div>`;
const dim2D = () => `<section class="l-sec l-dim" aria-label="Design in motion" data-theme="light">
    <h2 class="rv">Design<br>in motion</h2>
    <p class="cap rv" style="margin-top:22px">Exploring ideas through<br>daily design practice.</p>
    <div class="l-grid" id="lGrid"></div>
    <p class="p17 rv">Concepts, applications and interface designs crafted for our clients.</p>
    <a class="btn roll rv" href="${href('projects/')}"><span data-t="View portfolio"></span><b>→</b></a>
  </section>`;

export async function start({ lenis, chrome, clock, loader, reduce, takeOver }) {
  const gl = document.documentElement.classList.contains('gl');
  const L = $('#lite');
  $('#stageWrap')?.remove();     // the desktop stage is not used here (the phone stages reuse some of its ids)
  L.innerHTML = `
  <section class="l-sec l-hero" aria-label="Introduction" data-theme="dark">
    ${gl ? '<div class="m-flare" id="mFlare"></div>' : `<div class="l-mark">${markArt()}</div>`}
    <h1 class="l-h1${gl ? ' rv' : ''}" aria-label="Designed to grow your business"><span aria-hidden="true">${HERO.line1}<br>${HERO.fixed}<span class="l-word" id="lWord"></span></span></h1>
    <div class="l-btns rv"><a class="btn roll" href="${href(CTA.discuss)}"><span data-t="Discuss your project"></span><b>→</b></a><a class="btn roll" href="${href(CTA.call)}"><span data-t="Book a free call"></span><b>→</b></a></div>
    <div class="l-meta rv">
      <div class="box2"><div class="c1"><span class="cap13">${HERO.est}</span></div><div class="cap13">${HERO.years}</div></div>
      <p class="p18">${HERO.blurb}</p>
    </div>
    <div class="cap l-hold rv">${HERO.hold}<br>${HERO.dare}</div>
    ${gl ? '<div class="heroDot l-dot rv" aria-hidden="true"><i></i></div>' : ''}
  </section>
  <section class="l-sec l-about" aria-label="About" data-theme="dark">
    <div class="cap rv">About</div>
    <p class="h89 l-big" id="lAbout"></p>
    <div class="l-cols">
      <div class="cap lh17 rv">${ABOUT.left}</div>
      <div class="rv"><p class="p18">${ABOUT.mission}</p><a class="btn roll" href="${href('about/')}"><span data-t="More about us"></span><b>→</b></a></div>
    </div>
    <div class="cap lh17 l-focus rv">${ABOUT.focus}</div>
  </section>
  ${gl ? marquee3D() : marquee2D()}
  <section class="l-sec l-light" aria-label="Key facts" data-theme="light">
    <h2 class="h89 rv">Key facts</h2>
    <p class="p17 rv">A snapshot of our<br>experience and impact.</p>
    <div class="l-cards">${factCardsHTML(false)}</div>
    <div class="cap rv" style="margin-top:64px;color:#272727">Our clients</div>
    <div class="l-partners rv">${CLIENTS.map(c => `<span style="${c[1]}">${c[0]}</span>`).join('')}</div>
  </section>
  <section class="l-sec l-work" aria-label="Selected work" data-theme="light">
    <h2 class="h89 rv">Selected work<br>&amp; explorations</h2>
    <a class="btn roll rv" href="${href('projects/')}"><span data-t="View all projects"></span><b>→</b></a>
    <div class="l-wtrack">${WORK.map(w => workCardHTML(w)).join('')}</div>
    <div class="l-disc center"><p class="h34 rv">Discover our complete collection of digital experiences, brands, and platforms.</p><a class="btn roll rv" href="${href('projects/')}"><span data-t="View all projects"></span><b>→</b></a></div>
  </section>
  ${gl ? services3D() : services2D()}
  <section class="l-sec l-testi" aria-label="Client testimonials" id="lTesti" data-theme="light"></section>
  ${gl ? dim3D() : dim2D()}`;

  L.classList.add('built');
  mountTestimonials($('#lTesti'), false);
  let ribCards = [];
  if (gl) ribCards = RIBBON.map(r => $('#ribIn').appendChild(ribbonCard(r)));
  else {
    const grid = $('#lGrid');
    RIBBON.slice(0, 6).forEach(r => { const c = ribbonCard(r); c.classList.add('rv'); grid.appendChild(c); });
    // typographic cards are designed at 380×260: scale them to the grid cell
    new ResizeObserver(() => { const c = grid.firstElementChild; if (c) grid.style.setProperty('--k', (c.clientWidth / 380).toFixed(4)); }).observe(grid);
  }
  $$('.l-cards .kcard, .l-labs .lab, .l-wtrack .wcard, #lTesti > *').forEach(e => e.classList.add('rv'));
  initRoll(L);

  /* hero word cycle: letters blur out, the next word blurs in */
  const wordEl = $('#lWord');
  let wi = 0;
  const setWord = w => { wordEl.innerHTML = [...w].map(ch => `<span style="transition-delay:${(Math.random() * .3).toFixed(2)}s">${ch}</span>`).join(''); };
  setWord(HERO.words[0]);
  if (!reduce) setInterval(() => {
    wordEl.classList.add('out');
    setTimeout(() => { wi = (wi + 1) % HERO.words.length; setWord(HERO.words[wi]); void wordEl.offsetWidth; wordEl.classList.remove('out'); }, 620);
  }, 3400);

  /* about: words light up as the paragraph scrolls through the viewport */
  const aboutEl = $('#lAbout'), aboutWords = words(aboutEl, ABOUT.text);

  /* odometers count when their card is revealed */
  const odos = $$('.l-cards .odo').map((e, i) => ({ ...odometer(e, FACTS[i].value, FACTS[i].suffix), card: e.closest('.kcard'), t0: null }));

  /* key facts on phones: a swipeable row that moves on by itself until the visitor takes over */
  const row = $('.l-cards');
  if (gl && row.scrollWidth > row.clientWidth + 8) {
    const cards = [...row.children];
    let i = 0, held = false;
    for (const ev of ['pointerdown', 'touchstart', 'wheel']) row.addEventListener(ev, () => { held = true; }, { passive: true, once: true });
    setInterval(() => {
      const r = row.getBoundingClientRect();
      if (held || document.hidden || r.bottom < 0 || r.top > innerHeight) return;
      i = (i + 1) % cards.length;
      row.scrollTo({ left: cards[i].offsetLeft - (row.clientWidth - cards[i].offsetWidth) / 2, behavior: 'smooth' });
    }, 3600);
  }

  /* reveals start once the loader has opened */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  const startReveals = () => $$('.rv', L).forEach(e => io.observe(e));

  /* the 3D story; built while the loader plays (it holds before opening until this is ready) */
  let m3d = null;
  if (gl) {
    try {
      const { startMobile3D } = await import('./mobile3d.js');
      m3d = await startMobile3D({ mqSpans: $$('#mMqRow > span'), svSpans: $$('#mWords span'), perRep: MARQUEE.join('').length, ribCards });
    } catch (err) {     // the browser refused WebGL after all: reload into the layout without 3D
      console.error(err);
      try { sessionStorage.setItem('si-no3d', '1'); location.reload(); return; } catch { /* the choice can't be remembered, so don't reload forever */ }
    }
  }

  /* header colour follows the section under it */
  const themed = [...$$('[data-theme]', L), $('#footer')];
  let navLt = null;

  takeOver();
  clock.ready = true;
  let revealed = false, first = true;
  if (!gl) { loader.skip(); startReveals(); revealed = true; }

  const frame = now => {
    lenis.raf(now);
    const dt = Math.min(.1, clock.tick(now)), T = clock.T;
    if (!revealed && loader.frame(T)) { revealed = true; chrome.lock(false); startReveals(); }
    m3d?.frame(now, T, dt, lenis.scroll);
    if (first) { first = false; chrome.reveal(); }
    const H = innerHeight;
    // about colour reveal
    const r = aboutEl.getBoundingClientRect();
    if (r.bottom > 0 && r.top < H) {
      const p = clamp((H * .85 - r.top) / (r.height + H * .25)), n = aboutWords.length;
      aboutWords.forEach((w, i) => { const q = clamp(p * n * 1.15 - i); S(w, 'color', `rgba(216,216,216,${(.1 + .9 * q).toFixed(3)})`); });
    }
    // odometers
    for (const o of odos) {
      if (o.t0 == null) { if (o.card.classList.contains('in')) o.t0 = T; else continue; }
      const lt = T - o.t0;
      o.cols.forEach((c, j) => S(c, 'transform', `translateY(${(-(10 + o.ds[j]) * eout(seg(lt, .3 + j * .12, 1.8 + j * .12)) * 46.875).toFixed(2)}px)`));
    }
    // header
    let lt = false;
    for (const s of themed) { const b = s.getBoundingClientRect(); if (b.top <= 44 && b.bottom > 44) { lt = s.dataset.theme !== 'dark'; break; } }
    if (lt !== navLt) { navLt = lt; chrome.nav.classList.toggle('lt', lt); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
