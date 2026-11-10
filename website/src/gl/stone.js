// The services stone: ONE thick, rough slab (as in the reference). Seen edge-on while it tumbles it reads
// as a boulder; facing the camera it is the square tablet the S mark is chiselled into, stroke by stroke.
import * as THREE from 'three';
import { fbm, vnoise, clamp, rnd, reseed, inPoly, edgeDist, pathParam } from '../lib/util.js';
import { MARK, MARK_PATHS } from '../content.js';

const SW = 2.4, SH = 2.35, SD = .95, ROUND = .07;
const MARK_SCALE = .72;   // mark units -> stone units on the front face

function* stoneMaps(S) {
  reseed(77);
  const hgt = new Float32Array(S * S), alb = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
    const u = x / S, v = y / S, i = y * S + x;
    const g = fbm(u * 9, v * 9, 3.1, 5), p = fbm(u * 2.2 + 5, v * 2.2, 7.7, 3), f = fbm(u * 30, v * 30, 1.7, 2), gr = vnoise(u * 160, v * 160, 2.2);
    const edge = Math.max(Math.abs(2 * u - 1), Math.abs(2 * v - 1));
    hgt[i] = .5 + .2 * g + .1 * p + .09 * f + .05 * gr;
    alb[i] = .36 + .15 * p + .11 * g + .08 * f + .06 * gr + .14 * Math.pow(clamp((edge - .72) / .28), 2);
    }
    yield;
  }
  for (let k = 0; k < 230; k++) {             // sparse pock-marks: dark bowls with lighter rims
    if (!(k & 15)) yield;
    const cx = rnd() * S, cy = rnd() * S, r = (1.5 + Math.pow(rnd(), 3) * 10) * S / 1024, r2 = r * 1.5;
    for (let y = Math.max(0, Math.floor(cy - r2)); y < Math.min(S, cy + r2); y++)
      for (let x = Math.max(0, Math.floor(cx - r2)); x < Math.min(S, cx + r2); x++) {
        const d = Math.hypot(x - cx, y - cy) / r, i = y * S + x;
        if (d < 1) { hgt[i] -= (1 - d * d) * .24 * Math.min(1, r / 6); alb[i] *= .58 + .42 * d; }
        else if (d < 1.5) { const rim = 1 - Math.abs(d - 1.2) / .3; if (rim > 0) { hgt[i] += rim * .07; alb[i] *= 1 + .14 * rim; } }
      }
  }
  const mk = (arr, tint) => {
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'), im = g.createImageData(S, S);
    for (let i = 0; i < S * S; i++) { const v = clamp(arr[i]) * 255; im.data[i * 4] = v * tint[0]; im.data[i * 4 + 1] = v * tint[1]; im.data[i * 4 + 2] = v * tint[2]; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0);
    return new THREE.CanvasTexture(c);
  };
  const albedo = mk(alb, [1, 1, 1]); albedo.colorSpace = THREE.SRGBColorSpace;
  yield;
  return { albedo, bump: mk(hgt, [1, 1, 1]) };
}

export function* stoneSteps({ tex = 1024, seg = [120, 122, 44] } = {}) {
  const { albedo, bump } = yield* stoneMaps(tex);
  yield;
  const geo = new THREE.BoxGeometry(SW, SH, SD, ...seg);
  const pos = geo.attributes.position, n = pos.count;
  const ix = SW / 2 - ROUND, iy = SH / 2 - ROUND, iz = SD / 2 - ROUND;
  const base = new Float32Array(n * 3), col = new Float32Array(n * 3).fill(1);
  // position-only displacement (rounded box + chipped edges) so the duplicated edge vertices of the box faces stay welded
  for (let i = 0; i < n; i++) {
    if (!(i & 127)) yield;
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const qx = clamp(x, -ix, ix), qy = clamp(y, -iy, iy), qz = clamp(z, -iz, iz);
    let dx = x - qx, dy = y - qy, dz = z - qz;
    const dl = Math.hypot(dx, dy, dz) || 1; dx /= dl; dy /= dl; dz /= dl;
    const e = [Math.abs(x) / (SW / 2), Math.abs(y) / (SH / 2), Math.abs(z) / (SD / 2)].sort((a, b) => b - a);
    const edgeW = Math.pow(e[1], 9);
    const chip = Math.max(0, fbm(x * 3.1 + 11, y * 3.1, z * 3.1, 4) + .05);
    const inward = .03 * fbm(x * 1.6 + 3, y * 1.6, z * 1.6, 4) + .018 * fbm(x * 5, y * 5, z * 5, 3) + .008 * fbm(x * 13, y * 13, z * 13, 2) + edgeW * (.012 + .34 * Math.pow(chip, 1.4));
    const r = ROUND - inward;
    base[i * 3] = qx + dx * r; base[i * 3 + 1] = qy + dy * r; base[i * 3 + 2] = qz + dz * r;
  }
  pos.array.set(base);
  // weathered, lighter sides (they read as a pale boulder while the slab tumbles edge-on)
  { const nA = geo.attributes.normal; for (let i = 0; i < n; i++) col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = Math.abs(nA.getZ(i)) < .5 ? 1.7 : .92; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // planar UVs per face at one texel density, so pits are not stretched on the thin sides
  {
    const nAttr = geo.attributes.normal, uv = geo.attributes.uv;
    for (let i = 0; i < n; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2], ax = Math.abs(nAttr.getX(i)), ay = Math.abs(nAttr.getY(i));
      if (ax > .5) uv.setXY(i, z / SW + .5, y / SW + .5);
      else if (ay > .5) uv.setXY(i, x / SW + .5, z / SW + .5);
      else uv.setXY(i, x / SW + .5, y / SW + .5);
    }
  }

  // weld groups: every vertex index that shares a position, so normals can be averaged across face borders
  yield;
  const groups = new Map();
  for (let i = 0; i < n; i++) {
    if (!(i & 1023)) yield;
    const k = `${base[i * 3].toFixed(4)},${base[i * 3 + 1].toFixed(4)},${base[i * 3 + 2].toFixed(4)}`;
    (groups.get(k) || groups.set(k, []).get(k)).push(i);
  }
  const welded = [...groups.values()].filter(g => g.length > 1);
  const nrm = () => {
    geo.computeVertexNormals();
    const N = geo.attributes.normal;
    for (const g of welded) {
      let sx = 0, sy = 0, sz = 0;
      for (const i of g) { sx += N.getX(i); sy += N.getY(i); sz += N.getZ(i); }
      const l = Math.hypot(sx, sy, sz) || 1;
      for (const i of g) N.setXYZ(i, sx / l, sy / l, sz / l);
    }
    N.needsUpdate = true;
  };
  yield;
  nrm();
  yield;

  // front-face vertices inside the mark (with a noisy, chiselled outline)
  const carve = [];
  const front = SD / 2 - .002;
  for (let i = 0; i < n; i++) {
    if (!(i & 255)) yield;
    if (base[i * 3 + 2] < front - ROUND * .5) continue;
    const x0 = base[i * 3], y0 = base[i * 3 + 1];
    if (Math.abs(x0) > SW / 2 - ROUND * 1.2 || Math.abs(y0) > SH / 2 - ROUND * 1.2) continue;
    const mx = x0 / MARK_SCALE, my = y0 / MARK_SCALE;
    for (let k = 0; k < 3; k++) {
      const ed = edgeDist(mx, my, MARK[k]), inside = inPoly(mx, my, MARK[k]);
      const sd = (inside ? -ed : ed) + .03 * vnoise(mx * 16, my * 16, k * 3.7) + .012 * vnoise(mx * 40, my * 40, k);
      if (sd < 0) { carve.push({ i, k, s: pathParam(mx, my, MARK_PATHS[k]), ed: clamp(-sd / .075), j: vnoise(i * .37, 0, 0) }); break; }
    }
  }
  const baseCol = new Float32Array(col);
  let lastKey = '';
  const setCarve = prog => {                                      // prog: 0..1 per piece (chisel tip position)
    const key = prog.map(p => p.toFixed(3)).join();
    if (key === lastKey) return;
    lastKey = key;
    for (const c of carve) {
      const amt = clamp((prog[c.k] - c.s) * 14);
      const d = .17 * amt * (.3 + .7 * Math.sqrt(c.ed)) * (1 + .25 * c.j);
      pos.array[c.i * 3 + 2] = base[c.i * 3 + 2] - d;
      const dk = 1 - amt * (.25 + .5 * Math.sqrt(c.ed));
      col[c.i * 3] = baseCol[c.i * 3] * dk; col[c.i * 3 + 1] = baseCol[c.i * 3 + 1] * dk; col[c.i * 3 + 2] = baseCol[c.i * 3 + 2] * dk;
    }
    pos.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    nrm();
  };

  const mat = new THREE.MeshStandardMaterial({ map: albedo, bumpMap: bump, bumpScale: 7, roughness: .93, metalness: 0, vertexColors: true, color: 0xcfcfcf });
  const mesh = new THREE.Mesh(geo, mat);
  return { mesh, setCarve, size: [SW, SH, SD] };
}
