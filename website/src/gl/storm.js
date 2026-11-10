// Storm around the stone: billowing cloud layers (behind AND in front of the stone/text, like the
// reference's veiling smoke), lightning flashes timed from the reference's brightness spikes, and
// branching electric bolts + sparks on the strongest strikes.
import * as THREE from 'three';
import { fbm, clamp, rnd, reseed } from '../lib/util.js';

// [start, duration, strength] — measured luminance spikes of the reference's storm (51–67s)
export const FLASHES = [[51.72, .12, .8], [52.48, .1, .5], [53.46, .17, .9], [54.52, .08, .45], [55.56, .13, .6], [55.9, .16, 1],
  [56.22, .22, .85], [57.06, .17, 1], [57.62, .1, .5], [59.82, .09, .7], [60.17, .2, 1], [61.43, .27, 1], [62.17, .33, .9],
  [63.47, .15, .8], [64.5, .07, .45], [65.57, .1, .5], [65.9, .17, 1], [66.2, .13, .7]];

export function flashAt(t) {
  let f = 0;
  for (const [t0, d, s] of FLASHES) {
    const u = (t - t0) / d;
    if (u < 0 || u > 1.6) continue;
    const env = u < .08 ? u / .08 : Math.pow(Math.max(0, 1 - (u - .08) / 1.5), 1.6);
    const flick = .62 + .38 * Math.sin(u * 37 + t0 * 13) * Math.sin(u * 19 + t0);
    f = Math.max(f, s * env * flick);
  }
  return f;
}

function* cloudTexture(sd, S) {
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), im = g.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
    const u = x / S, v = y / S, r = Math.hypot(u - .5, v - .5) * 2;
    const warp = fbm(u * 2.2 + sd, v * 2.2, sd, 2);
    const big = fbm(u * 2.6 + warp * .45 + sd * 2, v * 2.6 + warp * .45, sd * .5, 3) * .5 + .5;
    const nz = big * .75 + (fbm(u * 9 + sd, v * 9, sd + 3, 4) * .5 + .5) * .25;   // billowy lumps + fine wisps
    const d = Math.pow(clamp((nz - .42) * 2.6), 1.3) * clamp(1 - r * r * 1.1);
    const shade = .45 + .55 * clamp(.8 - v * .75 + (nz - .5) * 1.6);   // lit tops, darker bellies
    const i = (y * S + x) * 4;
    im.data[i] = im.data[i + 1] = im.data[i + 2] = shade * 255; im.data[i + 3] = d * 255;
    }
    yield;
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function boltGeometry(x0, y0, len, sd) {
  reseed(sd);
  const segs = [];
  const walk = (x, y, ang, L, depth) => {
    const pts = [[x, y]];
    const steps = Math.round(L / .22);
    for (let i = 0; i < steps; i++) {
      ang += (rnd() - .5) * .9;
      x += Math.sin(ang) * .22; y -= Math.cos(ang) * .22;
      pts.push([x, y]);
      if (depth < 2 && rnd() < .14) walk(x, y, ang + (rnd() < .5 ? -1 : 1) * (.5 + rnd() * .6), L * (.25 + rnd() * .3), depth + 1);
    }
    segs.push({ pts, w: depth ? .018 : .034 });
  };
  walk(x0, y0, (rnd() - .5) * .5, len, 0);
  const ribbon = scale => {
    const P = [], I = [];
    for (const { pts, w } of segs) {
      const b = P.length / 3;
      pts.forEach(([x, y], i) => {
        const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
        let nx = -(by - ay), ny = bx - ax; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
        const ww = w * scale * (1 - i / pts.length * .6);
        P.push(x + nx * ww, y + ny * ww, 0, x - nx * ww, y - ny * ww, 0);
        if (i) { const k = b + i * 2; I.push(k - 2, k - 1, k, k - 1, k + 1, k); }
      });
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I);
    return g;
  };
  const tips = segs.map(s => s.pts[s.pts.length - 1]);
  return { core: ribbon(1), glow: ribbon(9), tips };
}

export function* stormSteps(backScene, frontScene, { tex = 384, nBack = 24, nFront = 8, spread = 1 } = {}) {
  reseed(301);
  const texs = [yield* cloudTexture(1.3, tex), yield* cloudTexture(4.7, tex), yield* cloudTexture(9.1, tex)];
  const mkCloud = (scene, z, s, op, i) => {
    const m = new THREE.SpriteMaterial({ map: texs[i % 3], transparent: true, depthWrite: false, opacity: op });
    const sp = new THREE.Sprite(m);
    sp.userData = { x: (rnd() - .5) * 34 * spread, y: (rnd() - .5) * 15, z, s, op, vx: (rnd() - .35) * .55, rot: rnd() * 6.28, vr: (rnd() - .5) * .05, ph: rnd() * 6.28 };
    scene.add(sp);
    return sp;
  };
  const back = [], front = [];
  for (let i = 0; i < nBack; i++) back.push(mkCloud(backScene, -16 + rnd() * 9, 9 + rnd() * 10, .38 + rnd() * .4, i));
  for (let i = 0; i < nFront; i++) front.push(mkCloud(frontScene, 7 + rnd() * 3.5, 4.5 + rnd() * 5, .14 + rnd() * .2, i + 1));

  // bolts tied to the strongest strikes
  const bolts = [];
  for (const [k, [t0, d, s]] of FLASHES.entries()) {
    if (s < .85) continue;
    yield;
    const side = k % 2 ? 1 : -1, x0 = side * (7 + rnd() * 6) * spread, y0 = 5.5 + rnd() * 2;
    const { core, glow, tips } = boltGeometry(x0, y0, 7 + rnd() * 5, 500 + k * 17);
    const cm = new THREE.MeshBasicMaterial({ color: 0xe8f0ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const gm = new THREE.MeshBasicMaterial({ color: 0x7f9cff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .12, toneMapped: false });
    const grp = new THREE.Group(); grp.add(new THREE.Mesh(glow, gm), new THREE.Mesh(core, cm));
    const sparks = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(tips.length * 18), 3)),
      new THREE.PointsMaterial({ color: 0xdfe8ff, size: .05, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    grp.add(sparks);
    grp.position.z = -13; grp.renderOrder = -50;
    grp.traverse(o => { o.frustumCulled = false; o.renderOrder = -50; });
    backScene.add(grp);
    bolts.push({ grp, t0, d, cm, gm, sparks, tips });
  }

  return {
    update(t, { on, flash, darkness, drift = t }) {   // drift: continuous clock for cloud motion (t may loop)
      const cl = .12 + .08 * darkness + flash * 1.25;
      const upd = (sp, extra) => {
        const u = sp.userData, dt = drift - 50;
        const wrap = 38 * spread; let x = u.x + u.vx * dt; x = ((x + wrap / 2) % wrap + wrap) % wrap - wrap / 2;
        const s = u.s * (1 + .06 * Math.sin(drift * .4 + u.ph));
        sp.position.set(x, u.y + Math.sin(drift * .23 + u.ph) * .3, u.z);
        sp.scale.set(s, s * .72, 1);
        sp.material.rotation = u.rot + u.vr * dt;
        sp.material.opacity = u.op * on;
        sp.material.color.setScalar(cl * extra);
        sp.visible = on > .001;
      };
      back.forEach(sp => upd(sp, 1));
      front.forEach(sp => upd(sp, 1.25));
      for (const b of bolts) {
        const u = (t - b.t0) / b.d, vis = on > .5 && u >= 0 && u < 1;
        b.grp.visible = vis;
        if (!vis) continue;
        const fl = (u < .5 ? 1 : 1 - (u - .5) * 2) * (.55 + .45 * Math.sin(u * 47));
        b.cm.opacity = fl; b.gm.opacity = .14 * fl; b.sparks.material.opacity = fl;
        const P = b.sparks.geometry.attributes.position;
        reseed(Math.floor(t * 60));
        b.tips.forEach(([x, y], i) => { for (let k = 0; k < 6; k++) P.setXYZ(i * 6 + k, x + (rnd() - .5) * .5 * u, y + (rnd() - .5) * .5 * u, 0); });
        P.needsUpdate = true;
      }
    },
  };
}
