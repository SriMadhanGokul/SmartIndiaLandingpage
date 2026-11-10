// Desktop experience. The whole story (hero → about → marquee → key facts → work → services/stone →
// testimonials → design in motion) lives in one pinned viewport, and the scroll position is mapped to
// "video time" vt — the timeline of the approved motion design. Where content moves (the about page, the light
// page, the horizontal work track) the map is the inverse of the measured motion curve, so content tracks the
// wheel 1:1; set pieces (slats, the stone, carving, the ribbon) get a fixed scroll length each.
// Real time drives the loader, the hero intro and idle loop, the fire, the storm and the trigger animations.
import { clamp, lerp, seg, eio, eout, bump, curve, reseed } from './lib/util.js';
import { HERO, ABOUT, MARQUEE, FACTS, CLIENTS, SERVICES_WORDS, RIBBON } from './content.js';
import { view, resize as glResize, compileScenes, renderLayers, clear, canvas } from './gl/core.js';
import { GlassText } from './gl/glass.js';
import { makeLogo } from './gl/logo.js';
import { makeServices, makeWordFx, lightning } from './gl/services.js';
import { $, $$, S, show, letters, letterIn, odometer, setMask, blinds, Clock, initRoll, words } from './ui.js';
import { factCardsHTML, workTrackHTML, labsHTML, ribbonCard, mountTestimonials } from './blocks.js';
import { makeDim } from './dim.js';

/* ---------- timelines (design px / seconds, measured from the reference) ---------- */
const HOLD = 18.85, END = 76;
const BL1 = { S: [30.38, 29.62, 29.0, 28.68, 28.45], D: [3.6, 3.8, 3.2, 2.6, 1.95], P: [1.3, 1.3, 1.3, 1.4, 1.4] };
const BL2 = { S: [67.34, 67.21, 67.14, 67.01, 66.886], D: [.55, .55, .55, .55, .55], P: [1.4, 1.4, 1.4, 1.4, 1.4] };
const DARK = curve([[18.85, 0], [19.5, 300], [20.0, 380], [21, 500], [22.25, 690], [23, 760], [23.75, 850], [24.25, 950], [25, 1060], [26, 1180], [26.6, 1290], [27, 1430], [27.5, 1640], [28, 1728]]);
const LIGHT = curve([[30.4, -1146], [33.0, -412], [35.3, -80], [38.6, 768], [40.4, 1116]]);
const WORK_X = curve([[40.4, 0], [40.8, -60], [41.0, -169], [41.2, -269], [41.6, -365], [42.0, -597], [42.4, -763], [42.8, -907], [43.2, -1079],
  [44.0, -1339], [44.5, -1747], [44.8, -2115], [45.4, -2423], [46.5, -2875], [47.9, -3810]]);
// gently damped spring (≈2–3% overshoot, no bounce), normalised so spring(1) === 1
const spring = p => (1 - Math.exp(-5.5 * p) * Math.cos(5 * p)) / (1 - Math.exp(-5.5) * Math.cos(5));
const RIB_GRID = [[-385, -143], [1, -143], [386, -143], [-385, 138], [1, 136], [448, 176]];

const nextFrame = () => new Promise(r => requestAnimationFrame(r));

export async function start({ lenis, chrome, clock, loader, seen, takeOver }) {
  const root = document.documentElement;
  const el = Object.fromEntries(['dark', 'light', 'svc', 'svText', 'trans', 'dim', 'darkPage', 'lightPage', 'trPage', 'wtrack', 'mq', 'flare',
    'svWrap', 'b1a', 'b1b', 'dimA', 'dimB', 'dimS', 'dimLine', 'dimArc', 'stageWrap', 'sbar', 'sthumb'].map(id => [id, $('#' + id)]));
  const navMark = $('#navMark');
  $('#lite').remove();      // the phone layout's markup isn't used here

  /* ---------- DOM: hero, about, marquee ---------- */
  reseed(11);
  const hl1 = letters($('#hl1'), HERO.line1), hlFix = letters($('#hlFix'), HERO.fixed);
  const wordSpans = HERO.words.map(w => { const sp = document.createElement('span'); $('#wordBox').appendChild(sp); return letters(sp, w); });
  $('#heroEst').innerHTML = HERO.est; $('#heroYears').innerHTML = HERO.years; $('#heroBlurb').innerHTML = HERO.blurb;
  $('#heroHold').innerHTML = HERO.hold; $('#heroDare').innerHTML = HERO.dare;
  const aboutWords = words($('#aboutTxt'), ABOUT.text);
  $('#aboutLeft').innerHTML = ABOUT.left; $('#aboutMission').innerHTML = ABOUT.mission; $('#aboutFocus').innerHTML = ABOUT.focus;
  const mqSpans = [];
  for (let r = 0; r < 3; r++) for (const w of MARQUEE) {
    for (const ch of w) { const s = document.createElement('span'); s.textContent = ch; el.mq.appendChild(s); mqSpans.push(s); }
    const i = document.createElement('i'); i.textContent = '+'; i.setAttribute('aria-hidden', 'true'); el.mq.appendChild(i);
  }
  const perRep = MARQUEE.join('').length;

  /* ---------- DOM: key facts, clients, selected work ---------- */
  const kfTitle = letters($('#kfTitle'), 'Key facts');
  $('#kwrap').innerHTML = factCardsHTML(true);
  const cards = $$('#kwrap .kcard');
  const odos = $$('#kwrap .odo').map((e, i) => ({ ...odometer(e, FACTS[i].value, FACTS[i].suffix), at: 33.3 + i * .3, clock: new Clock(3) }));
  $('#partners').innerHTML = CLIENTS.map(c => `<span style="${c[1]}">${c[0]}</span>`).join('<span class="sep" aria-hidden="true"></span>');
  el.wtrack.innerHTML = workTrackHTML();
  const wcards = $$('#wtrack .wcard');
  const [wk1, wk2] = $$('#wkTitle > div');
  const wkLetters = [...letters(wk1, 'Selected work'), ...letters(wk2, '& explorations')];

  /* ---------- DOM: services ---------- */
  const svSpans = [];
  for (const w of SERVICES_WORDS) {
    const line = document.createElement('div'); line.className = 'sv';
    for (const ch of w) { const s = document.createElement('span'); s.textContent = ch; line.appendChild(s); svSpans.push(s); }
    el.svWrap.appendChild(line);
  }
  $('#labs').innerHTML = labsHTML();
  const labEls = $$('#labs .lab');

  /* ---------- DOM: testimonials, design in motion ---------- */
  mountTestimonials($('#trFr'), true);
  const ribEls = RIBBON.map(r => $('#ribIn').appendChild(ribbonCard(r)));
  const dimScene = makeDim({ dim: el.dim, dimA: el.dimA, dimB: el.dimB, dimS: el.dimS, dimLine: el.dimLine, dimArc: el.dimArc, cards: ribEls, grid: RIB_GRID });
  initRoll();
  const inEls = $$('[data-in]').map(e => ({ e, a: +e.dataset.in, clock: new Clock(.8) }));
  const kfClock = new Clock(2), wkClock = new Clock(2);

  /* ---------- layout + scroll map ---------- */
  let MAP = [], TOTAL = 0, mqRep = 2000, limit = 1;
  function setVars() {
    const st = root.style;
    st.setProperty('--u', view.u.toFixed(5)); st.setProperty('--nu', Math.max(view.u, .62).toFixed(4));
    st.setProperty('--ox', `${view.ox.toFixed(2)}px`); st.setProperty('--oyc', `${view.oy.toFixed(2)}px`);
    st.setProperty('--oyb', `${(view.h - 868 * view.u).toFixed(2)}px`);
  }
  function buildMap() {
    const u = view.u, H = view.h;
    // [vt at end, scroll length (CSS px), motion curve, curve value at start, at end]
    const seq = [
      [28, H / 2 + 1294 * u, DARK, 0, 1728],    // about scrolls 1:1 until the marquee is centred
      [30.4, 650 * u],                          // the S flies through the glass marquee, slats begin
      [40.4, 2262 * u, LIGHT, -1146, 1116],     // key facts + clients scroll 1:1
      [47.9, 3810 * u, WORK_X, 0, -3810],       // selected work, horizontal 1:1
      [49.3, 1920 * u],                         // services panel wipes in from the right
      [51.6, 800 * u],                          // …turns to night, the storm wakes
      [61.6, 2600 * u],                         // the stone falls through the words
      [66.45, 1500 * u],                        // the S is carved, service cards drift by
      [67.89, 650 * u],                         // slats into testimonials
      [67.95, 940 * u],                         // testimonials scroll 1:1
      [END, 2600 * u],                          // design in motion
    ];
    MAP = []; let v = HOLD, y = 0;
    for (const [v1, len, f, d0, d1] of seq) { MAP.push({ v0: v, v1, y0: y, len, f, d0, d1 }); v = v1; y += len; }
    TOTAL = y;
    S(el.stageWrap, 'height', `${Math.round(TOTAL + view.h)}px`);
  }
  const inv = (f, a, b, target, inc) => { for (let i = 0; i < 36; i++) { const m = (a + b) / 2; if ((f(m) < target) === inc) a = m; else b = m; } return (a + b) / 2; };
  const vtAt = y => {
    if (y <= 0) return HOLD;
    for (const s of MAP) if (y < s.y0 + s.len) {
      const p = (y - s.y0) / s.len;
      return s.f ? inv(s.f, s.v0, s.v1, lerp(s.d0, s.d1, p), s.d1 > s.d0) : lerp(s.v0, s.v1, p);
    }
    return END;
  };
  const yAt = vt => {
    if (vt <= HOLD) return 0;
    for (const s of MAP) if (vt <= s.v1) return s.y0 + clamp(s.f ? (s.f(vt) - s.d0) / (s.d1 - s.d0) : (vt - s.v0) / (s.v1 - s.v0)) * s.len;
    return TOTAL;
  };
  const darkPx = vt => DARK(vt) / 1728 * MAP[0].len;
  const measure = () => {
    mqRep = mqSpans[perRep].offsetLeft - mqSpans[0].offsetLeft;
    glassMq.measure(); glassWords.measure();
    lenis.resize(); limit = Math.max(1, lenis.limit);
  };

  glResize(); setVars(); buildMap();

  /* ---------- WebGL ---------- */
  // built in small steps between frames so the loader (already playing) keeps moving
  await nextFrame();
  const logo = makeLogo();
  await nextFrame();
  const svc = makeServices();
  await nextFrame();
  const glassMq = new GlassText(mqSpans, { family: 'Familjen Grotesk', refr: .022, frost: 8, ghost: .55, body: .34 });
  const glassWords = new GlassText(svSpans, { family: 'Familjen Grotesk', refr: .026, frost: 9, ghost: .6, body: .36 });
  measure();

  let curVt = HOLD;
  const wordFx = makeWordFx(svSpans, () => curVt);

  // compile shaders and upload textures behind the loader so the first scroll never stutters
  await compileScenes({ screen: [logo.scene, ...svc.scenes, glassMq.scene, glassWords.scene], captured: [logo.scene, svc.scenes[0]] });
  await nextFrame();
  glassMq.layout(view.u); glassMq.update(0, {}); logo.update(9, HOLD, 0); renderLayers(logo.scene, [glassMq.scene]);
  await nextFrame();
  glassWords.layout(view.u); glassWords.update(0, {}); svc.render(56, 0, { on: 1, flash: .5, overlays: [glassWords.scene] });
  clear();

  /* ---------- per-frame render: a function of vt (scroll), T (real seconds since start) ---------- */
  let glOn = true, lightNav = null;
  function render(vt, T, dt, y) {
    curVt = vt;
    const u = view.u, W = view.w, H = view.h;
    const B1 = blinds(vt, BL1, H), B2 = blinds(vt, BL2, H), past = y > TOTAL + H;
    const showDark = !B1.done && !past, showLight = B1.any && vt < 49.4 && !past, showSvc = vt > 47.9 && !B2.done && !past,
      showTrans = B2.any && vt < 68.1 && !past, showDim = vt > 67.95 && !past;
    show(el.dark, showDark);
    // a masked layer still catches clicks in its see-through slats, so it only takes them once fully in
    show(el.light, showLight); setMask(el.light, B1.done ? 'none' : B1.mask); S(el.light, 'pointerEvents', B1.done ? 'auto' : 'none');
    show(el.svc, showSvc); show(el.svText, showSvc);
    show(el.trans, showTrans); setMask(el.trans, B2.done ? 'none' : B2.mask); S(el.trans, 'pointerEvents', B2.done ? 'auto' : 'none');
    show(el.dim, showDim);

    // reveal-on-enter: hero items follow the intro clock; the rest trigger on scroll and play in real time
    for (const d of inEls) {
      const p = d.a < HOLD ? eout(seg(T, d.a, d.a + .8)) : eout(d.clock.step(vt >= d.a, dt) / .8);
      S(d.e, 'opacity', p.toFixed(3));
      S(d.e, 'transform', p < 1 ? `translateY(${((1 - p) * 24).toFixed(2)}px)` : 'none');
      S(d.e, 'filter', p < .999 ? `blur(${((1 - p) * 6).toFixed(2)}px)` : 'none');
    }

    /* dark page */
    const dS = darkPx(vt);
    if (showDark) {
      S(el.darkPage, 'transform', `translate3d(0,${(-dS).toFixed(2)}px,0)`);
      letterIn(hl1, T, 7.25); letterIn(hlFix, T, 7.4);
      wordSpans.forEach((arr, k) => { const lt = T - 7.25 - k * 3.4; letterIn(arr, lt < 0 ? -1 : lt % 13.6, 0, .6, .5, 2.9); });
      const rv = seg(vt, 19.8, 23.6), n = aboutWords.length;
      aboutWords.forEach((w, i) => S(w, 'color', `rgba(216,216,216,${(.1 + .9 * clamp(rv * n * 1.12 - i)).toFixed(3)})`));
      S(el.mq, 'transform', `translate3d(${(-((60 + 52 * T + .35 * dS / u) % mqRep)).toFixed(2)}px,0,0)`);
      const fl = bump(T, 5.6, 7.75, .3);
      S(el.flare, 'opacity', fl.toFixed(3));
      S(el.flare, 'transform', `translateX(${(-270 * seg(T, 5.6, 7.75)).toFixed(1)}px)`);
    }

    /* light page */
    if (showLight) {
      S(el.lightPage, 'transform', `translate3d(0,${(-LIGHT(vt) * u).toFixed(2)}px,0)`);
      letterIn(kfTitle, kfClock.step(vt >= 31.85, dt), 0, .7, .5);
      cards.forEach((c, i) => {
        const p = eio(seg(vt, 32.6 + i * .45, 35.0 + i * .45)), fin = [[0, 0], [0, 0], [-14, 4]][i];
        S(c, 'opacity', seg(vt, 32.5 + i * .45, 33.3 + i * .45).toFixed(3));
        S(c, 'transform', `translateY(${((1 - p) * 40).toFixed(2)}px) rotateX(${lerp(74, fin[1], p).toFixed(2)}deg) rotateY(${lerp(i === 0 ? -10 : i === 2 ? 10 : 0, fin[0], p).toFixed(2)}deg) rotateZ(${lerp(i === 0 ? -3 : i === 2 ? 3 : 0, 0, p).toFixed(2)}deg)`);
      });
      for (const o of odos) {
        const lt = o.clock.step(vt >= o.at, dt);
        o.cols.forEach((c, j) => S(c, 'transform', `translateY(${(-(10 + o.ds[j]) * eout(seg(lt, j * .12, j * .12 + 1.5)) * 46.875).toFixed(2)}px)`));
      }
      letterIn(wkLetters, wkClock.step(vt >= 39.0, dt), 0, .8, .55);
      const hx = WORK_X(vt);
      S(el.wtrack, 'transform', `translate3d(${hx.toFixed(2)}px,0,0)`);
      // card entrance follows each card's own screen position: rise from below, then spring from 0.8 to 1
      wcards.forEach((c, k) => {
        const x = 1027 + k * 952 + hx + (k === 0 ? (1 - eio(seg(vt, 38.2, 40.6))) * 900 : 0);
        const rise = x > 1810 ? 1 : Math.exp(-(1810 - x) / 280), s = lerp(.8, 1, spring(clamp((1320 - x) / 470)));
        S(c, 'transform', `translateY(${(rise * 500).toFixed(2)}px) scale(${s.toFixed(4)})`);
      });
    }

    /* services */
    if (showSvc) {
      const pl = (W * (1 - seg(vt, 47.9, 49.3))).toFixed(1);
      S(el.svc, 'clipPath', `inset(0 0 0 ${pl}px)`); S(el.svText, 'clipPath', `inset(0 0 0 ${pl}px)`);
      const gv = Math.round(lerp(255, 200, seg(vt, 49.9, 50.6)));
      S(el.svc, 'background', `rgba(${gv},${gv},${gv},${(1 - seg(vt, 50.5, 51.3)).toFixed(3)})`);
      const tc = Math.round(lerp(17, 200, seg(vt, 50.95, 51.2)));
      S(el.svWrap, 'color', `rgba(${tc},${tc},${tc},${(1 - seg(vt, 51.15, 51.5)).toFixed(3)})`);
      S(el.svc, 'color', tc > 120 ? '#d8d8d8' : '#111');
      const sw = seg(vt, 51.6, 52.4);
      S(el.b1a, 'opacity', (1 - sw).toFixed(3)); S(el.b1a, 'filter', `blur(${(sw * 6).toFixed(2)}px)`);
      S(el.b1b, 'opacity', sw.toFixed(3)); S(el.b1b, 'filter', `blur(${((1 - sw) * 6).toFixed(2)}px)`);
      // two lanes beside the stone: left lane rises, right lane descends; the cards share the same stretch of scroll
      labEls.forEach((e, i) => {
        const lane = i % 2, p = (vt - (62.4 + i * 2.5 / (labEls.length - 1))) / 2.5;
        const x = lane ? 1590 : 330, yy = lane ? lerp(150, 700, p) : lerp(700, 150, p);
        const on = p <= 0 || p >= 1 ? 0 : Math.min(eout(seg(p, 0, .16)), 1 - eout(seg(p, .84, 1))) * (1 - seg(vt, 66.0, 66.45));
        S(e, 'visibility', on > 0 ? 'visible' : 'hidden');
        if (on > 0) S(e, 'transform', `translate3d(${x - 230}px,${(yy - 125).toFixed(1)}px,0) rotateX(${((lane ? -1 : 1) * (p - .5) * 10).toFixed(2)}deg)`);
        S(e, 'opacity', on.toFixed(3));
      });
    }

    /* testimonials */
    if (showTrans) S(el.trPage, 'transform', `translate3d(0,${(-940 * seg(vt, 67.89, 67.95) * u).toFixed(2)}px,0)`);

    /* design in motion */
    if (showDim) dimScene.update(vt, T, dt);

    /* header: dark text over light sections; the 3D S leaves the header mark during the intro */
    const footTop = TOTAL + H - y, slat = H / 5 * .75;
    const lt = footTop > 60 && ((B1.top > slat && vt < 50.6) || B2.top > slat);
    if (lt !== lightNav) { lightNav = lt; chrome.nav.classList.toggle('lt', lt); el.sbar.classList.toggle('lt', lt); }
    S(chrome.nav, 'visibility', T > 5.2 ? 'visible' : 'hidden'); S(chrome.nav, 'opacity', seg(T, 5.25, 5.7).toFixed(3));
    if (navMark) S(navMark, 'opacity', (1 - bump(T, 5.4, 7.0, .2)).toFixed(3));
    S(el.sbar, 'opacity', T > 5.3 ? '1' : '0');
    S(el.sthumb, 'transform', `translateY(${(10 + clamp(y / limit) * (H - 140)).toFixed(1)}px)`);

    /* WebGL */
    let drew = false;
    if (showDark && T > 5.3) {
      logo.update(T, vt, dS);
      const mqTop = H + 1205 * u - dS, mqOn = mqTop < H && mqTop > -170 * u;
      glassMq.scene.visible = mqOn;
      if (mqOn) { glassMq.layout(u); glassMq.update(T, { opacity: 1 }); }
      renderLayers(logo.scene, [glassMq.scene]); drew = true;
    } else if (showSvc && vt > 50.2) {
      const on = seg(vt, 50.4, 51.4), flash = on > .5 ? lightning(T) : 0;
      glassWords.layout(u); glassWords.update(T, { opacity: seg(vt, 51.15, 51.5), flash, fx: wordFx });
      svc.render(vt, T, { on, flash, overlays: [glassWords.scene] }); drew = true;
    }
    if (!drew && glOn) clear();
    glOn = drew;
    S(canvas, 'visibility', drew ? 'visible' : 'hidden');
  }

  /* ---------- custom scrollbar (the native one is hidden, as on the reference) ---------- */
  let drag = null;
  el.sthumb.addEventListener('pointerdown', e => { drag = { y: e.clientY, s: lenis.scroll }; el.sthumb.setPointerCapture(e.pointerId); el.sbar.classList.add('drag'); });
  el.sthumb.addEventListener('pointermove', e => { if (drag) lenis.scrollTo(drag.s + (e.clientY - drag.y) / (view.h - 140) * limit, { immediate: true }); });
  const endDrag = () => { drag = null; el.sbar.classList.remove('drag'); };
  el.sthumb.addEventListener('pointerup', endDrag); el.sthumb.addEventListener('pointercancel', endDrag);

  /* ---------- resize: keep the same moment of the story on screen ---------- */
  let lastVt = HOLD, rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const vt = lastVt;
      glResize(); setVars(); buildMap(); measure();
      if (vt > HOLD) lenis.scrollTo(yAt(vt), { immediate: true, force: true });
    }, 100);
  });

  // dev-only hook for automated checks: __site.go(vt) jumps to a moment of the story
  if (import.meta.env.DEV) window.__site = { lenis, yAt, vtAt, go: vt => lenis.scrollTo(yAt(vt), { immediate: true, force: true }), get vt() { return lastVt; } };

  /* ---------- run ---------- */
  takeOver();
  clock.ready = true;
  let locked = !seen, first = true;
  const frame = now => {
    const dt = Math.min(.1, clock.tick(now)), T = clock.T;
    lenis.raf(now);
    if (locked && T > 6.6) { locked = false; chrome.lock(false); }
    loader.frame(T);
    const y = lenis.scroll;
    lastVt = vtAt(y);
    render(lastVt, T, dt, y);
    if (first) { first = false; chrome.reveal(); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
