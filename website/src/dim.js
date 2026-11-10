// "Design in motion": the two sliding headline words and the ring of cards that settles into a grid. Scrubbed by
// the story timeline (vt, 67.95–76) and shared by the desktop stage and the phone layout.
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { clamp, eio, kf, seg } from './lib/util.js';
import { Clock, S, letterIn, letters } from './ui.js';

const D2R = Math.PI / 180, RING_R = 1500;

export function makeDim({ dim, dimA, dimB, dimS, dimLine, dimArc, cards, grid, fade = true }) {
  const AL = letters(dimA, 'Design in'), BL = letters(dimB, 'motion'), clock = new Clock(1.2);
  const ring = new Matrix4(), card = new Matrix4(), tr = new Matrix4(), sc = new Matrix4(), cp = new Vector3(), cq = new Quaternion(), ce = new Euler(),
    p = new Vector3(), q = new Quaternion(), s = new Vector3(), gp = new Vector3(), id = new Quaternion(), one = new Vector3(1, 1, 1);
  const RK = [68.1, 68.4, 69.0, 69.5, 70.5, 72.0, 73.3];

  return {
    update(vt, T, dt) {
      const uu = vt - 68.1;
      if (fade) S(dim, 'opacity', seg(vt, 67.95, 68.1).toFixed(3));
      const lt = clock.step(vt >= 67.96, dt);
      letterIn(AL, lt, .05, .35, .4); letterIn(BL, lt, .1, .35, .4);
      S(dimA, 'transform', `translateX(${kf(vt, [[67.95, 60], [68.4, 168], [69.0, 466], [72, 1365], [74, 1965]], x => x).toFixed(1)}px)`);
      S(dimB, 'transform', `translateX(${kf(vt, [[67.95, 1290], [68.4, 1200], [69.0, 912], [72, 45], [74, -535]], x => x).toFixed(1)}px)`);
      const tx = (1 - seg(vt, 73, 74.2)).toFixed(3);
      S(dimA, 'opacity', tx); S(dimB, 'opacity', tx); S(dimS, 'opacity', tx);
      if (dimLine) S(dimLine, 'opacity', seg(vt, 74.4, 75.2).toFixed(3));
      dimArc.setAttribute('d', `M ${(200 + uu * 20).toFixed(1)} 80 C 700 ${(-20 + uu * 8).toFixed(1)}, 1400 200, ${(1800 - uu * 30).toFixed(1)} ${(120 + uu * 6).toFixed(1)}`);
      const rk = v => kf(vt, RK.map((k, i) => [k, v[i]]));
      const RX = rk([-20, -20, -20, -20, -16, -26, -40]), RZ = rk([-28, -28, -26, -24, -10, -30, -30]);
      cp.set(rk([-400, -350, -220, -100, -50, 0, -120]), rk([260, 230, 170, 120, -470, -720, -1430]), rk([-3400, -3200, -2900, -2700, -1500, -1000, -3300]));
      ring.compose(cp, cq.setFromEuler(ce.set(RX * D2R, 0, RZ * D2R)), one);
      const headA = (-35 + seg(vt, 68.15, 69.4) * 125) * D2R, spin = uu * 1.1 + T * .035;   // keeps turning slowly while idle
      cards.forEach((e, i) => {
        let a = i / cards.length * Math.PI * 2 + spin; a = Math.atan2(Math.sin(a), Math.cos(a));
        const rev = vt > 69.4 ? 1 : clamp((headA - a) / .35);
        card.makeRotationY(a).multiply(tr.makeTranslation(0, 70 * Math.sin(a * 2 + uu * .9), RING_R)).premultiply(ring);
        if (rev < 1) card.multiply(sc.makeScale(.6 + .4 * rev, .6 + .4 * rev, 1));
        let op;
        if (i < grid.length) {
          const st = eio(seg(vt, 73.4 + i * .12, 74.6 + i * .12));
          card.decompose(p, q, s); p.lerp(gp.set(grid[i][0], grid[i][1], 0), st); q.slerp(id, st); s.lerp(one, st); card.compose(p, q, s);
          op = Math.max(rev, st);
        } else op = (1 - seg(vt, 73.4, 74.4)) * rev;
        S(e, 'visibility', op > 0 ? 'visible' : 'hidden'); S(e, 'opacity', op.toFixed(3));
        if (op > 0) S(e, 'transform', `matrix3d(${card.elements.map(v => v.toFixed(4)).join(',')})`);
      });
    },
  };
}
