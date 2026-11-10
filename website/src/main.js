// Homepage entry: start the loader on the very first frame, wait for the fonts (the glass type rasterises glyphs),
// start smooth scrolling, then hand over to the desktop stage or the lite layout.
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';
import { initChrome } from './chrome.js';
import { LOADER_END, makeClock, makeLoader } from './loader.js';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

const root = document.documentElement;
const lite = root.classList.contains('lite'), gl = root.classList.contains('gl');   // chosen by the head script
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// The intro plays once per visit, while the 3D gets ready. Coming back goes straight to the hero, and without 3D
// there is nothing to get ready, so that layout has no loader at all.
const seen = root.classList.contains('seen'), intro = gl && !seen;
try { sessionStorage.setItem('si-seen', '1'); } catch { /* private mode: the intro simply plays again */ }

const clock = makeClock(intro ? 0 : LOADER_END);
const loader = makeLoader();
let handedOver = false;
if (intro) {
  const pre = now => { if (handedOver) return; clock.tick(now); loader.frame(clock.T); requestAnimationFrame(pre); };
  requestAnimationFrame(pre);
}

const lenis = new Lenis({ lerp: .1, smoothWheel: true, syncTouch: false });
const chrome = initChrome({ lenis });
chrome.lock(intro);

// The glass type rasterises glyphs, so the 3D layouts wait for the fonts. The flat layout just lets them swap in.
const fonts = ['400 150px "Familjen Grotesk"', '500 100px "Familjen Grotesk"', '400 20px "Martian Mono"', '400 20px Inter', '500 20px Inter'];
if (gl) await Promise.race([
  document.fonts.ready.then(() => Promise.all(fonts.map(f => document.fonts.load(f)))),
  new Promise(r => setTimeout(r, 4000)),
]);

// Let the loader get moving before the heavy 3D setup starts; it holds before its reveal until the page is ready.
if (intro) await new Promise(r => { const wait = () => (clock.T > 1.1 ? r() : requestAnimationFrame(wait)); wait(); });
const page = lite ? await import('./lite.js') : await import('./desktop.js');
await page.start({ lenis, chrome, clock, loader, seen, reduce: reduce.matches, takeOver() { handedOver = true; } });

// Crossing the layout threshold (e.g. resizing a desktop window to phone width) reloads into the other layout.
let rt = 0;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (window.__wantsLite() !== lite) location.reload(); }, 400); });
reduce.addEventListener?.('change', () => location.reload());
