// Timeline + noise helpers shared by every scene module. Everything is a pure function of time,
// so any frame can be rendered on its own.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const eout = x => 1 - Math.pow(1 - x, 3);
export const ein = x => x * x * x;
export const bump = (t, a, b, r = .35) => Math.min(eio(seg(t, a, a + (b - a) * r)), 1 - eio(seg(t, b - (b - a) * r, b)));

export function kf(t, keys, ease = eio) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i], [b, vb] = keys[i + 1];
    if (t <= b) return lerp(va, vb, ease(seg(t, a, b)));
  }
  return keys[keys.length - 1][1];
}

// Monotone cubic (Fritsch–Butland) through measured points: smooth, never overshoots, rests at the ends.
export function curve(keys) {
  const n = keys.length, d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 2 / (1 / d[i - 1] + 1 / d[i]);
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0;
    while (t > keys[i + 1][0]) i++;
    const [x0, y0] = keys[i], [x1, y1] = keys[i + 1], h = x1 - x0, u = (t - x0) / h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * h * m[i + 1];
  };
}

let seed = 11;
export const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const reseed = s => { seed = s; };

const P = new Uint8Array(512);
{
  const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
}
const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
export function vnoise(x, y, z) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z), h = (a, b, c) => P[P[P[X + a] + Y + b] + Z + c] / 255;
  return lerp(lerp(lerp(h(0, 0, 0), h(1, 0, 0), u), lerp(h(0, 1, 0), h(1, 1, 0), u), v),
    lerp(lerp(h(0, 0, 1), h(1, 0, 1), u), lerp(h(0, 1, 1), h(1, 1, 1), u), v), w) * 2 - 1;
}
export const fbm = (x, y, z, o = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f, z * f); a *= .5; f *= 2.03; } return s; };

export function inPoly(x, y, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}
export function edgeDist(x, y, P) {
  let d = 1e9;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [ax, ay] = P[j], [bx, by] = P[i], dx = bx - ax, dy = by - ay;
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy));
    d = Math.min(d, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return d;
}
// arc-length fraction of the closest point on a polyline
export function pathParam(x, y, path) {
  let best = 1e9, bestS = 0, acc = 0, total = 0;
  for (let i = 0; i < path.length - 1; i++) total += Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay] = path[i], [bx, by] = path[i + 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / (L * L)), d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
    if (d < best) { best = d; bestS = acc + t * L; }
    acc += L;
  }
  return bestS / total;
}

// Heavy set-up is written as generators that yield often: run one straight through, or a little per frame so the
// page never blocks.
export const runSync = gen => { let r = gen.next(); while (!r.done) r = gen.next(); return r.value; };
export async function runSliced(gen, budget = 7) {
  let t = performance.now(), r = gen.next();
  while (!r.done) {
    if (performance.now() - t > budget) { await new Promise(requestAnimationFrame); t = performance.now(); }
    r = gen.next();
  }
  return r.value;
}
