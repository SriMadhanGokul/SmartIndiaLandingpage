// Services scene: storm backdrop, the falling/turning stone (path measured from the reference), impact dust
// and lightning. The stone, burst and carving are scrubbed by scroll ("video time" vt); clouds and lightning
// run on real time so the storm stays alive while the visitor pauses.
import * as THREE from 'three';
import { backdrop, PX, renderLayers, ref, toWorld, view } from './core.js';
import { seg, eio, curve, rnd, reseed, runSliced, runSync } from '../lib/util.js';
import { stoneSteps } from './stone.js';
import { stormSteps, flashAt } from './storm.js';

const KT = [50.85, 51.6, 52.6, 54.6, 56.4, 57.6, 58.4, 59.1, 59.6, 60.6, 61.4];
const K = vals => curve(KT.map((t, i) => [t, vals[i]]));
const STONE = {   // reference screen centre (1920×868), depth, rotation
  x: K([956, 956, 948, 926, 947, 930, 906, 940, 917, 950, 957]),
  y: K([-40, 70, 134, 252, 317, 331, 321, 360, 375, 430, 433]),
  z: K([-18, -18, -13.3, -10.4, -1.2, -.4, .1, 4.0, 4.75, 5.9, 6.25]),
  rx: K([.6, .62, .7, 1.0, 1.36, 1.28, 1.05, .55, .2, .06, .03]),
  ry: K([.75, .78, .85, .45, .12, .08, -.25, -.18, -.1, .02, 0]),
  rz: K([.25, .28, .35, .5, -.48, -.55, .72, .75, .35, .05, .03]),
};
export const LIGHTNING_PERIOD = 16;
export const stormTime = tReal => 51 + (tReal % LIGHTNING_PERIOD);   // loop the measured strike pattern
export const lightning = tReal => flashAt(stormTime(tReal));

// Letters fly apart when the stone hits the words (away from the impact point); a few loom past the camera.
export function makeWordFx(spans, getVt) {
  reseed(404);
  const fly = spans.map(() => { const big = rnd() < .16; return { a: rnd() * 6.283, sp: .6 + rnd() * .9, big, vz: big ? 9 + rnd() * 1.8 : rnd() * 3 - .5, rx: (rnd() - .5) * (big ? 1.6 : 7), ry: (rnd() - .5) * (big ? 1.6 : 7), rz: (rnd() - .5) * 3, d: rnd() * .35 }; });
  return (i, L) => {
    const vt = getVt(), f = fly[i], s = seg(vt, 58.45 + f.d * .5, 61.6 + f.d);
    if (s <= 0) return null;
    const p = 1 - Math.pow(1 - s, 1.7), [ix, iy] = ref(906, 321);
    let dx = L.base.cx - ix, dy = L.base.cy - iy;
    const l = Math.hypot(dx, dy) || 1; dx = dx / l * .75 + Math.cos(f.a) * .25; dy = dy / l * .75 + Math.sin(f.a) * .25;
    const dist = (380 + 700 * f.sp) * view.u * (view.lite ? .42 : 1) * p / PX(0);
    if (f.big) return { dx: dx * dist * .3, dy: -1.0 * p, dz: f.vz * p, rx: f.rx * p, ry: f.ry * p, rz: f.rz * p, op: (1 - seg(vt, 60.9 + f.d, 61.5 + f.d)) * .85 };
    return { dx: dx * dist, dy: -dy * dist - p * p * .6, dz: f.vz * p, rx: f.rx * p, ry: f.ry * p, rz: f.rz * p, op: 1 - seg(vt, 60.6 + f.d, 61.6 + f.d) };
  };
}

function* servicesSteps() {
  const back = new THREE.Scene(), front = new THREE.Scene();
  const bgU = { uFlash: { value: 0 } };
  back.add(backdrop(`uniform float uFlash;
    void main(){vec2 p=vUv-.5;float v=1.-dot(p,p)*1.2;vec3 c=vec3(.0065,.0068,.0075)*v+vec3(.02,.022,.026)*uFlash;
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`, bgU));
  back.add(new THREE.AmbientLight(0xffffff, .12));
  const keyL = new THREE.DirectionalLight(0xffffff, 5.2); keyL.position.set(-5, 7, 6); back.add(keyL);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(6, -2, -4); back.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, .45); fill.position.set(4, -3, 8); back.add(fill);
  const flashL = new THREE.DirectionalLight(0xdfe8ff, 0); flashL.position.set(1, 9, 2); back.add(flashL);

  const stone = yield* stoneSteps(view.lite ? { tex: 512, seg: [84, 86, 22] } : undefined);
  back.add(stone.mesh);

  reseed(91);
  const DN = view.lite ? 500 : 1100, dpos = new Float32Array(DN * 3), dvel = [];
  for (let i = 0; i < DN; i++) { const a = rnd() * 6.283, z = rnd() * 2 - 1, r = Math.sqrt(1 - z * z); dvel.push([r * Math.cos(a) * (1 + rnd() * 3), r * Math.sin(a) * (1 + rnd() * 3), z * (1 + rnd() * 2)]); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dmat = new THREE.PointsMaterial({ color: 0xcfcac2, size: .03, transparent: true, depthWrite: false });
  const dust = new THREE.Points(dg, dmat); dust.frustumCulled = false; back.add(dust);
  yield;

  const storm = yield* stormSteps(back, front, view.lite ? { tex: 256, nBack: 14, nFront: 4, spread: .42 } : undefined);

  return {
    scenes: [back, front],
    render(vt, tReal, { on, flash, overlays }) {
      bgU.uFlash.value = flash;
      storm.update(stormTime(tReal), { on, flash, darkness: 1, drift: 51 + tReal });
      flashL.intensity = flash * 5.5;
      keyL.intensity = 5.2 + flash * 1.5;
      const vis = vt > 50.85;
      stone.mesh.visible = vis;
      if (vis) {
        const z = STONE.z(vt), [px, py] = ref(STONE.x(vt), STONE.y(vt)), [x, y] = toWorld(px, py, z);
        const w = seg(vt, 61.4, 67);
        stone.mesh.position.set(x, y, z);
        stone.mesh.rotation.set(STONE.rx(vt) + .02 * Math.sin(tReal * .5) * w, STONE.ry(vt) + .035 * Math.sin(tReal * .4) * w, STONE.rz(vt) + .015 * Math.sin(tReal * .33) * w);
        stone.setCarve([eio(seg(vt, 62.0, 62.62)), eio(seg(vt, 62.85, 63.25)), eio(seg(vt, 62.55, 63.12))]);
        const dp = seg(vt, 58.3, 61.6);
        dust.visible = dp > 0 && dp < 1; dmat.opacity = (1 - dp) * .85;
        const sz = STONE.z(58.4) + .5, [ix, iy] = ref(906, 321), [sx, sy] = toWorld(ix, iy, sz);
        for (let i = 0; i < DN; i++) { const v = dvel[i]; dpos[i * 3] = sx + v[0] * dp * 2.6; dpos[i * 3 + 1] = sy + v[1] * dp * 2.6 - dp * dp * .9; dpos[i * 3 + 2] = sz + v[2] * dp * 2; }
        dg.attributes.position.needsUpdate = true;
      } else dust.visible = false;
      renderLayers(back, [...overlays, front]);
    },
  };
}

export const makeServices = () => runSync(servicesSteps());     // all at once, behind the desktop loader
export const buildServices = () => runSliced(servicesSteps());  // a little per frame, while a phone shows the hero
