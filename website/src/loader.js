// Intro loader (0–5.05 s, real time), measured from the reference: crosses spread to the corners, the frame
// draws, the S mark draws and fills with a striped glitch, the box blows up to full screen and darkens.
import { lerp, seg, eio, curve, rnd, reseed } from './lib/util.js';
import { MARK, LOADER_LABELS } from './content.js';
import { $, $$, S } from './ui.js';

const LD_W = curve([[4.05, 260], [4.25, 504], [4.4, 620], [4.5, 1100], [4.62, 1500], [4.75, 1920]]);
const LD_H = curve([[4.05, 260], [4.25, 348], [4.4, 390], [4.5, 600], [4.62, 760], [4.75, 868]]);
const LD_G = curve([[4.0, 214], [4.25, 170], [4.5, 68], [4.75, 4]]);
export const LOADER_END = 5.05;
const HOLD_AT = 3.85;   // the fully drawn mark, just before the box opens: the loader waits here until the page is ready

// Intro clock. It advances with capped steps, so a long pause on the main thread holds the animation instead of making
// it jump, while a phone drawing only 8 frames a second still plays it at full speed. It holds before the reveal until
// `ready` is set.
export function makeClock(start = 0) {
  const c = {
    T: start, ready: start >= LOADER_END, last: performance.now(),
    tick(now) {
      const raw = Math.max(0, now - c.last) / 1000;
      c.last = now;
      c.T += Math.min(raw, .12);
      if (!c.ready) c.T = Math.min(c.T, HOLD_AT);
      return raw;
    },
  };
  return c;
}

export function makeLoader() {
  const s = 56, o = 130, d = p => 'M' + p.map(([x, y]) => `${(o + x * s).toFixed(1)} ${(o - y * s).toFixed(1)}`).join(' L') + ' Z';
  $('#ldMark').innerHTML = `<svg width="260" height="260" viewBox="0 0 260 260"><defs>
    <pattern id="stp" width="260" height="7" patternUnits="userSpaceOnUse"><rect width="260" height="3.4" fill="#fff"/></pattern>
    ${MARK.map((_, i) => `<mask id="m${i}"><rect id="mr${i}" x="0" y="0" width="260" height="0" fill="url(#stp)"/><rect id="ms${i}" x="0" y="0" width="260" height="0" fill="#fff"/></mask>`).join('')}</defs>
    ${MARK.map((p, i) => `<path class="ldO" d="${d(p)}" fill="none" stroke="#9a9a9a" stroke-width="1" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
      <path class="ldF" d="${d(p)}" fill="#3d3d3d" mask="url(#m${i})"/>`).join('')}</svg>`;
  $('#ldLbl').innerHTML = LOADER_LABELS.join(' &nbsp;·&nbsp; ');
  const box = $('#ldBox'), frame = $('#ldFrame'), faint = $('#ldFaint'), top = $('#ldTop'), right = $('#ldRight'), tick = $('#ldTick'),
    mark = $('#ldMark'), fillEl = $('#ldFill'), lbl = $('#ldLbl'), num = $('#ldNum'), xs = [0, 1, 2, 3].map(i => $('#x' + i)),
    outl = $$('.ldO'), fills = $$('.ldF'), mr = [0, 1, 2].map(i => $('#mr' + i)), ms = [0, 1, 2].map(i => $('#ms' + i)), root = $('#loader');
  let gone = false;

  return {
    // T: seconds since start. Returns true once finished.
    frame(T) {
      if (gone) return true;
      if (T >= LOADER_END) { root.classList.add('gone'); gone = true; return true; }
      const W = innerWidth, H = innerHeight, k = Math.max(Math.min(W / 1920, H / 868), Math.min(W, H) / 860);
      const spread = eio(seg(T, .55, 1.35)), grow = eio(seg(T, 1.2, 1.8)), e2 = seg(T, 4.05, 4.75);
      const w = T < 4.05 ? lerp(196, 260, grow) * k : lerp(260 * k, W, (LD_W(T) - 260) / 1660);
      const h = T < 4.05 ? w : lerp(260 * k, H, (LD_H(T) - 260) / 608);
      const cx = W / 2, cy = H / 2 + lerp(-34, 0, e2) * k;
      S(box, 'transform', `translate(${cx - w / 2}px,${cy - h / 2}px)`); S(box, 'width', `${w}px`); S(box, 'height', `${h}px`);
      frame.setAttribute('width', w); frame.setAttribute('height', h); faint.setAttribute('width', w); faint.setAttribute('height', h);
      S(faint, 'opacity', String(seg(T, 1.2, 1.6) * (1 - seg(T, 3.95, 4.1))));
      top.setAttribute('d', `M0 0 H${w}`); right.setAttribute('d', `M${w} 0 V${h}`); tick.setAttribute('d', `M0 ${h - 24 * k} V${h}`);
      top.setAttribute('stroke-dashoffset', 1 - eio(seg(T, 2.0, 2.3))); right.setAttribute('stroke-dashoffset', 1 - eio(seg(T, 2.3, 2.5)));
      const fo = 1 - seg(T, 3.95, 4.1);
      S(top, 'opacity', String(fo)); S(right, 'opacity', String(fo)); tick.setAttribute('opacity', seg(T, 2.8, 2.9) * fo);
      // crosses: cluster at the centre, spread to the corners, flip + → × → +
      const rot = 45 * (eio(seg(T, 2.4, 2.6)) - eio(seg(T, 3.4, 3.6)));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy], i) => {
        const off = lerp((i % 2 ? 86 : -86) * k, sx * (w / 2 + 14 * k), spread), oy = lerp((-3 + sy * 3) * k, sy * (h / 2 + 14 * k), spread);
        S(xs[i], 'transform', `translate(${cx + off}px,${cy + oy}px) rotate(${rot}deg)`);
        S(xs[i], 'opacity', String(seg(T, .25, .5) * (1 - seg(T, 4.6, 4.9))));
      });
      // the mark: outline draws, then a striped glitch fill per piece, then it breaks apart as the box opens
      outl.forEach((p, i) => { p.setAttribute('stroke-dashoffset', 1 - eio(seg(T, 1.3 + i * .18, 2.0 + i * .18))); S(p, 'opacity', String(1 - seg(T, 2.9, 3.2))); });
      [[2.25, 2.75], [2.6, 3.0], [2.35, 2.85]].forEach(([a, b], i) => { mr[i].setAttribute('height', 260 * seg(T, a, b)); ms[i].setAttribute('height', 260 * seg(T, b - .05, b + .15)); });
      const ex = eio(seg(T, 4.15, 4.9));
      S(mark, 'transform', `translate(${w / 2 - 130 * k}px,${h / 2 - 130 * k}px) scale(${k})`);
      S(mark, 'opacity', String(1 - seg(T, 4.55, 4.9)));
      fills.forEach((p, i) => { const dd = [[-1, 1], [0, 0], [1, -1]][i]; p.setAttribute('transform', `translate(${dd[0] * ex * 34},${-dd[1] * ex * 34}) rotate(${(i - 1) * ex * 14} 130 130)`); });
      const g = Math.round(LD_G(T));
      S(fillEl, 'opacity', String(seg(T, 3.9, 4.05))); S(fillEl, 'background', `rgb(${g},${g},${g})`);
      S(lbl, 'top', `${H / 2 + 137 * k}px`); S(lbl, 'opacity', String(seg(T, 1.9, 2.3) * (1 - seg(T, 3.95, 4.15))));
      S(num, 'top', `${H - 88 * k}px`); S(num, 'opacity', String(seg(T, .6, 1) * (1 - seg(T, 3.95, 4.15))));
      reseed(Math.floor(T * 30));
      const n = Math.round(eio(seg(T, .6, 3.6)) * 100);
      num.textContent = T < 3.6 ? String(Math.min(999, n + Math.floor(rnd() * 9))).padStart(3, '0') : '100';
      return false;
    },
    skip() { root.classList.add('gone'); gone = true; },
  };
}
