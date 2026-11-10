// The 3D story on phones, following the reference's phone site: the fire-lit S behind the hero and About, the S flying
// through a glass marquee, the storm with the stone falling through the glass words, the S carved into it with service
// cards drifting past, and the ring of cards settling into a grid. Same scenes as desktop, composed for portrait.
import { autoResize, canvas, clear, compileScenes, giveUp3D, governor, PX, renderLayers, resize, uploadTextures, view } from './gl/core.js';
import { GlassText } from './gl/glass.js';
import { makeLogo } from './gl/logo.js';
import { buildServices, lightning, makeWordFx } from './gl/services.js';
import { makeDim } from './dim.js';
import { bump, clamp, eio, eout, kf, lerp, seg } from './lib/util.js';
import { $, $$, S } from './ui.js';

const nextFrame = () => new Promise(r => requestAnimationFrame(r));
const MARK_H = 2.4;   // height of the S in 3D units at scale 1
// scroll progress through the services stage → story time
const SVC_KEYS = [[0, 49.7], [.1, 51.6], [.52, 61.6], [.6, 63.3], [.88, 67.2], [1, 67.2]];
// bottom slat first, each filling upward from its own lower edge
const slats = (els, p, start, step, dur) => els.forEach((s, k) => {
  const x = seg(p, start + (4 - k) * step, start + (4 - k) * step + dur);
  S(s, 'transform', `scaleY(${(1 - Math.pow(1 - x, 1.4)).toFixed(4)})`);
});
// the six cards of the final grid, two columns by three rows
const GRID = [[-198, -206], [198, -206], [-198, 70], [198, 70], [-198, 346], [198, 346]];

export async function startMobile3D({ mqSpans, svSpans, perRep, ribCards }) {
  const mq = $('#mMq'), mqRow = $('#mMqRow'), mqSlats = $$('.slt i', mq), flare = $('#mFlare'), navMark = $('#navMark');
  const svcWrap = $('#mSvc'), stage = $('#mSvcIn'), words = $('#mWords'), b1a = $('#b1a'), b1b = $('#b1b'),
    labEls = $$('.lab', stage), svcSlats = $$('.m-slt i', stage);
  const dimWrap = $('#mDim'), dimSlats = $$('.m-slt i', dimWrap), ribIn = $('#ribIn'), nav = $('#nav');

  resize();
  await nextFrame();
  const logo = makeLogo({ shardCount: 18 });
  await nextFrame();
  const glassMq = new GlassText(mqSpans, { family: 'Familjen Grotesk', atlasPx: 200, refr: .022, frost: 8, ghost: .55, body: .34 });
  const dimScene = makeDim({ dim: $('#dim'), dimA: $('#dimA'), dimB: $('#dimB'), dimS: $('#dimS'), dimArc: $('#dimArc'), cards: ribCards, grid: GRID, fade: false });

  let mqRep = 1000, labH = [], glassWords = null;
  const measure = () => {
    mqRep = mqSpans[perRep].offsetLeft - mqSpans[0].offsetLeft;
    glassMq.measure(); glassWords?.measure();
    labH = labEls.map(e => e.offsetHeight);
  };
  measure();
  autoResize(measure);

  // the hero's scenes get ready behind the loader
  await compileScenes({ screen: [glassMq.scene], captured: [logo.scene] });
  await uploadTextures([], [glassMq.shared.uMask.value, glassMq.shared.uBlur.value]);
  glassMq.layout(1); glassMq.update(0, {}); logo.update(9, 18.85, 0); renderLayers(logo.scene, [glassMq.scene]);
  clear();

  // The storm is built after that, a little per frame while the visitor reads the hero. The services stage holds on
  // its white panel if they get there first.
  let svc = null, curVt = 49.7, wordFx = null, stormStarted = false;
  const buildStorm = async () => {
    const built = await buildServices();
    await nextFrame();
    const words = new GlassText(svSpans, { family: 'Familjen Grotesk', atlasPx: 200, refr: .026, frost: 9, ghost: .6, body: .36 });
    wordFx = makeWordFx(svSpans, () => curVt);
    await nextFrame();
    await compileScenes({ screen: [built.scenes[1], words.scene], captured: [built.scenes[0]] });
    await uploadTextures(built.scenes, [words.shared.uMask.value, words.shared.uBlur.value]);
    glassWords = words; svc = built;
  };

  let glOn = true;
  return {
    frame(now, T, dt, y) {
      const H = view.h;
      let drew = false;
      if (!stormStarted && (T > 8.6 || y > 40)) { stormStarted = true; buildStorm().catch(err => { console.error(err); giveUp3D(); }); }

      /* ---------- the S: hero → About → through the glass marquee ---------- */
      const rm = mq.getBoundingClientRect();
      const pinned = clamp(-rm.top / Math.max(1, rm.height - H));
      const vtS = pinned > 0 ? lerp(28, 31.5, pinned) : lerp(18.85, 28, clamp(y / Math.max(1, y + rm.top)));
      S(navMark, 'opacity', (1 - bump(T, 5.4, 7.0, .2)).toFixed(3));
      if (rm.bottom > 0) {
        slats(mqSlats, pinned, .2, .1, .4);
        mq.dataset.theme = pinned > .78 ? 'light' : 'dark';
        S(mqRow, 'transform', `translate3d(${(-((40 + 30 * T + .25 * y) % mqRep)).toFixed(2)}px,0,0)`);
        const fl = bump(T, 5.6, 7.75, .3);
        S(flare, 'opacity', fl.toFixed(3));
        if (fl > 0) S(flare, 'transform', `translateX(${(-20 * seg(T, 5.6, 7.75)).toFixed(1)}vw)`);
        if (T > 5.3 && pinned < .998) {
          logo.update(T, vtS, y, { x: 960, y: 500, s: 1.55, xk: .5, from: { x: 960, y: (40 - view.oy) / view.u, s: 36 / (MARK_H * PX(-1)) } });
          const mqOn = rm.top < H;
          if (mqOn) { glassMq.layout(1); glassMq.update(T, { opacity: 1 }); }
          renderLayers(logo.scene, mqOn ? [glassMq.scene] : []);
          drew = true;
        }
      }

      /* ---------- services: white panel → night and storm → the stone → carving → cards drift over it ---------- */
      const rs = svcWrap.getBoundingClientRect();
      if (rs.top < H && rs.bottom > 0) {
        const p = clamp(-rs.top / Math.max(1, rs.height - H)), vt = svc ? kf(p, SVC_KEYS, x => x) : Math.min(kf(p, SVC_KEYS, x => x), 50.2);
        curVt = vt;
        const gv = Math.round(lerp(255, 200, seg(vt, 49.9, 50.6)));
        S(stage, 'background', `rgba(${gv},${gv},${gv},${(1 - seg(vt, 50.5, 51.3)).toFixed(3)})`);
        const tc = Math.round(lerp(17, 200, seg(vt, 50.95, 51.2)));
        S(words, 'color', `rgba(${tc},${tc},${tc},${(1 - seg(vt, 51.15, 51.5)).toFixed(3)})`);
        S(stage, 'color', tc > 120 ? '#d8d8d8' : '#111');
        const sw = seg(vt, 51.6, 52.4);
        S(b1a, 'opacity', (1 - sw).toFixed(3)); S(b1a, 'filter', `blur(${(sw * 6).toFixed(2)}px)`);
        S(b1b, 'opacity', sw.toFixed(3)); S(b1b, 'filter', `blur(${((1 - sw) * 6).toFixed(2)}px)`);
        labEls.forEach((e, i) => {
          const q = (vt - (63.3 + i * .72)) / 1.7;
          const on = q <= 0 || q >= 1 ? 0 : Math.min(eout(seg(q, 0, .12)), 1 - eout(seg(q, .88, 1)));
          S(e, 'visibility', on > 0 ? 'visible' : 'hidden');
          if (on > 0) S(e, 'transform', `translate3d(0,${lerp(H * .95, H * .05 - labH[i], q).toFixed(1)}px,0) rotateX(${((q - .5) * -10).toFixed(2)}deg)`);
          S(e, 'opacity', on.toFixed(3));
        });
        slats(svcSlats, p, .88, .022, .03);
        svcWrap.dataset.theme = p > .975 || vt < 50.6 ? 'light' : 'dark';
        if (svc && vt > 50.2 && p < .998) {
          const on = seg(vt, 50.4, 51.4), flash = on > .5 ? lightning(T) : 0;
          glassWords.layout(1);
          glassWords.update(T, { opacity: seg(vt, 51.15, 51.5), flash, fx: wordFx });
          svc.render(vt, T, { on, flash, overlays: [glassWords.scene] });
          drew = true;
        }
      }

      /* ---------- design in motion ---------- */
      const rd = dimWrap.getBoundingClientRect();
      if (rd.top < H && rd.bottom > 0) {
        const p = clamp(-rd.top / Math.max(1, rd.height - H)), vt = lerp(67.95, 76, seg(p, 0, .86));
        dimScene.update(vt, T, dt);
        // the ring runs large, off both edges of the screen; the cards shrink to fit two columns as they settle
        const k = lerp(.95, .62, eio(seg(vt, 72.6, 74.4))).toFixed(4);
        S(ribIn, 'transform', `scale3d(${k},${k},${k})`);
        slats(dimSlats, p, .86, .024, .032);
        dimWrap.dataset.theme = p > .975 ? 'dark' : 'light';
      }

      // the pinned stages run edge to edge under the header, so its soft backing is dropped there
      const under = r => r.top <= 44 && r.bottom > 44;
      nav.classList.toggle('bare', (under(rs) && rs.bottom > H * .3) || (under(rd) && rd.bottom > H * .3));

      governor(drew && (svc || !stormStarted) ? now : 0);    // frames are slower while the storm is being built: that doesn't count
      if (!drew && glOn) clear();
      glOn = drew;
      S(canvas, 'visibility', drew ? 'visible' : 'hidden');
    },
  };
}
