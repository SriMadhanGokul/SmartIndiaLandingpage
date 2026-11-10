// Shared WebGL core: one fixed canvas behind the page, a camera framed to the page's design frame, and a
// colour+depth capture target that the glass type refracts and depth-tests against.
//
// The page is composed on a design frame of 868 design px tall, scaled by `u` and centred in the viewport. On
// desktop `u` fits the whole 1920 wide frame; in the phone layout it fits a 560 wide slice of it, so the same 3D
// keyframes (measured around the frame's centre) stay on screen in portrait. The camera's FOV is derived from the
// same frame, so one design pixel is the same size in the DOM and in 3D at every viewport size.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const REF_W = 1920, REF_H = 868;
const LITE_W = 560;
const lite = document.documentElement.classList.contains('lite');
export const canvas = document.getElementById('gl');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.debug.checkShaderErrors = !!import.meta.env.DEV;   // reading the logs would wait for each shader to finish

export const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);
camera.position.set(0, 0, 14);
const TAN = Math.tan(THREE.MathUtils.degToRad(15));

// w/h: viewport (CSS px); u: design-px → CSS-px scale; ox/oy: offset of the centred design frame; fh: frame height
export const view = { w: 1, h: 1, dpr: 1, u: 1, ox: 0, oy: 0, fh: REF_H, lite };
export const PX = z => view.fh / (2 * (14 - z) * TAN);                    // CSS px per world unit at depth z
export const toWorld = (sx, sy, z) => [(sx - view.w / 2) / PX(z), (view.h / 2 - sy) / PX(z), z];
export const ref = (x, y) => [view.ox + x * view.u, view.oy + y * view.u];   // design px (centred frame) → viewport px

export const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
const floatRT = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
export const sceneRT = new THREE.WebGLRenderTarget(1, 1, { type: floatRT ? THREE.HalfFloatType : THREE.UnsignedByteType, depthTexture: new THREE.DepthTexture(1, 1) });
const resizeHooks = [];
export const onResize = fn => resizeHooks.push(fn);

let quality = 1;
function applySize() {
  view.dpr = Math.min(devicePixelRatio || 1, 1.5) * quality;
  renderer.setPixelRatio(view.dpr);
  renderer.setSize(view.w, view.h, false);
  const bw = Math.round(view.w * view.dpr), bh = Math.round(view.h * view.dpr);
  sceneRT.setSize(bw, bh);
  sceneRT.depthTexture.image.width = bw; sceneRT.depthTexture.image.height = bh;
  for (const fn of resizeHooks) fn(bw, bh);
}

export function resize() {
  view.w = innerWidth;
  view.h = lite && window.__vh ? window.__vh() : innerHeight;   // phones: the tallest viewport, so a sliding URL bar changes nothing
  view.u = Math.min(view.w / (lite ? LITE_W : REF_W), view.h / REF_H);
  view.ox = (view.w - REF_W * view.u) / 2; view.oy = (view.h - REF_H * view.u) / 2; view.fh = REF_H * view.u;
  camera.aspect = view.w / view.h;
  camera.fov = 2 * THREE.MathUtils.radToDeg(Math.atan(TAN * view.h / view.fh));
  camera.updateProjectionMatrix();
  applySize();
}

// Calls fn after real size changes. On phones the URL bar sliding away fires resize too: that one is ignored.
export function autoResize(fn) {
  let w = innerWidth, timer = 0;
  const run = () => { resize(); fn?.(); };
  addEventListener('resize', () => {
    if (!lite) return run();
    if (innerWidth === w) return;
    w = innerWidth;
    clearTimeout(timer);
    timer = setTimeout(() => { window.__frameVars(); run(); }, 120);
  });
}

// Phones vary widely. If frames stay slow the render resolution steps down (remembered for this visit);
// the static layout is the last resort. The time limits ignore short hitches.
const LEVELS = [1, .78, .6], last = LEVELS.length - 1;
let level = 0, ema = 16, lastFrame = 0, slowSince = 0;
if (lite) { try { level = Math.min(last, +sessionStorage.getItem('si-q') || 0); quality = LEVELS[level]; } catch { /* starts at full resolution */ } }
// Call it with the frame's time after drawing, or with 0 on a frame that drew nothing.
export function governor(now) {
  if (!lite) return;
  const dt = lastFrame && now ? Math.min(now - lastFrame, 1000) : 16;
  lastFrame = now;
  if (!now) { slowSince = 0; return; }
  ema += (dt - ema) * .06;                // the average shrugs off one long frame, such as a scene being built
  if (ema < (level < last ? 38 : 75)) { slowSince = 0; return; }
  slowSince ||= now;
  if (now - slowSince < (level < last ? 1500 : 5000)) return;
  if (level === last) { giveUp3D(); return; }
  quality = LEVELS[++level];
  try { sessionStorage.setItem('si-q', String(level)); } catch { /* it would simply step down again */ }
  applySize();
  slowSince = 0; ema = 24;
}
export function giveUp3D() {
  try { sessionStorage.setItem('si-no3d', '1'); location.reload(); } catch { /* the choice can't be remembered, so don't reload forever */ }
}
// A lost context is often just a backgrounded tab, and three.js restores it. Fall back only if it stays lost in view.
if (lite) {
  const check = () => setTimeout(() => { if (!document.hidden && renderer.getContext().isContextLost()) giveUp3D(); }, 3000);
  canvas.addEventListener('webglcontextlost', check);
  document.addEventListener('visibilitychange', () => { lastFrame = 0; check(); });
}

// Full-screen background quad drawn in clip space (ignores the camera).
export function backdrop(fragment, uniforms) {
  const m = new THREE.ShaderMaterial({
    uniforms, depthWrite: false, depthTest: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*2.,0.9999,1.);}',
    fragmentShader: `varying vec2 vUv;${fragment}`,
  });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
  q.frustumCulled = false; q.renderOrder = -100;
  return q;
}

// Copies the captured scene to the screen, so phones shade the 3D scene once instead of twice.
const blit = new THREE.Scene();
blit.add(backdrop(`uniform sampler2D uT;void main(){gl_FragColor=vec4(texture2D(uT,vUv).rgb,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`, { uT: { value: sceneRT.texture } }));

// Compiles shaders without holding up the page. A scene drawn into the capture target needs its own variant of each
// shader (no tone mapping), and asking for it here saves compiling it mid-draw.
export function compileScenes({ screen = [], captured = [] }) {
  const job = s => renderer.compileAsync(s, camera).catch(() => {});
  const jobs = [blit, ...screen].map(job);
  renderer.setRenderTarget(sceneRT);
  jobs.push(...captured.map(job));
  renderer.setRenderTarget(null);
  return Promise.all(jobs);
}
// Sends textures to the GPU one per frame, so the first draw of a scene doesn't stall.
export async function uploadTextures(scenes, extra = []) {
  const all = new Set(extra);
  for (const s of scenes) s.traverse(o => { if (o.material?.map) all.add(o.material.map); if (o.material?.bumpMap) all.add(o.material.bumpMap); });
  for (const t of all) { renderer.initTexture(t); await new Promise(requestAnimationFrame); }
}

// Render `scene` into the capture target and to the screen, then draw overlay scenes on top.
export function renderLayers(scene, overlays = []) {
  renderer.autoClear = true;
  renderer.setRenderTarget(sceneRT);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.render(lite ? blit : scene, camera);
  renderer.autoClear = false;
  for (const o of overlays) if (o.visible !== false) renderer.render(o, camera);
  renderer.autoClear = true;
}

export function clear() {
  renderer.setRenderTarget(null); renderer.setClearColor(0x040508, 1); renderer.clear();
}
