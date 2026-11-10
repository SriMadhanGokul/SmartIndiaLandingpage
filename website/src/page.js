// Inner page entry: smooth scroll, reveals, slat wipes between sections, 3D hero, accordions and the contact form.
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';
import { initChrome } from './chrome.js';
import { CONTACT } from './content.js';
import { clamp, eout, seg } from './lib/util.js';
import { markArt } from './mark.js';
import { $, $$, S } from './ui.js';

const root = document.documentElement;
const lite = root.classList.contains('lite'), gl = root.classList.contains('gl');   // chosen by the head script
try { sessionStorage.setItem('si-seen', '1'); } catch { /* private mode */ }

const lenis = new Lenis({ lerp: .1, smoothWheel: true, syncTouch: false });
const chrome = initChrome({ lenis });

/* ---------- hero title: letters blur in, words stay whole when the line wraps ---------- */
const title = $('[data-split]');
if (title) {
  const text = title.textContent;
  title.setAttribute('aria-label', text);
  title.textContent = '';
  text.split(' ').forEach((w, i, all) => {
    const word = document.createElement('span');
    word.className = 'w'; word.setAttribute('aria-hidden', 'true');
    for (const ch of w) {
      const s = document.createElement('span');
      s.textContent = ch; s.style.transitionDelay = `${(Math.random() * .75).toFixed(2)}s`;
      word.appendChild(s);
    }
    title.appendChild(word);
    if (i < all.length - 1) title.appendChild(document.createTextNode(' '));
  });
  title.classList.add('lsplit');
}
for (const art of $$('.ph-art')) if (!gl) art.innerHTML = markArt();

/* ---------- reveals ---------- */
const countUp = el => {
  const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
  const step = now => {
    const p = eout(seg((now - t0) / 1000, 0, 1.6));
    el.textContent = `${Math.round(to * p)}${suf}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  io.unobserve(e.target);
  for (const n of e.target.querySelectorAll('[data-count]')) countUp(n);
}), { rootMargin: '0px 0px -7% 0px', threshold: .08 });
const startReveals = () => {
  title?.classList.add('on');
  for (const e of $$('.rv, .pc')) io.observe(e);
};

/* ---------- FAQ: one answer open at a time, on browsers without <details name> ---------- */
for (const d of $$('details[name]')) {
  d.addEventListener('toggle', () => {
    if (d.open) for (const o of $$(`details[name="${d.getAttribute('name')}"]`)) if (o !== d) o.open = false;
  });
}

/* ---------- forms: this static site has no server yet, so they hand the message to the visitor's email app ---------- */
const flash = (btn, text) => {
  const labels = $$('[data-t] > i', btn), was = labels[0]?.textContent;
  labels.forEach(i => { i.textContent = text; });
  setTimeout(() => labels.forEach(i => { i.textContent = was; }), 1800);
};
async function copy(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement('textarea');
    t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
  }
  flash(btn, 'Copied');
}
for (const b of $$('[data-copy]')) b.addEventListener('click', () => copy(b.dataset.copy, b));

// day picker: no past dates, and the studio is closed on Sundays (Mon – Sat hours)
for (const day of $$('input[type=date]')) {
  const now = new Date();
  day.min = new Date(now - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const check = () => day.setCustomValidity(day.value && new Date(`${day.value}T12:00`).getDay() === 0 ? 'We are closed on Sundays. Please choose Monday to Saturday.' : '');
  day.addEventListener('input', check);
  check();
}

for (const form of $$('form[data-mail]')) {
  const panel = $('.sent', form);
  let message = '';
  const label = el => el.closest('label')?.querySelector('span')?.textContent.replace(/\s*\(optional\)$/, '') || el.name;
  form.addEventListener('submit', e => {
    e.preventDefault();
    panel.hidden = true;
    if (!form.reportValidity()) return;
    const fields = [...form.elements].filter(el => el.name && el.value.trim());
    const subject = form.elements.subject?.value.trim() || form.dataset.subject;
    const rows = fields.filter(el => !['message', 'subject'].includes(el.name)).map(el => `${label(el)}: ${el.value.trim()}`);
    const note = form.elements.message?.value.trim();
    message = [...rows, ...(note ? ['', note] : [])].join('\n');
    const q = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    $('[data-gmail]', panel).href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    panel.hidden = false;
    lenis.scrollTo(panel, { offset: -Math.round(innerHeight * .35) });
    location.href = `mailto:${CONTACT.email}?${q}`;
  });
  form.addEventListener('reset', () => { panel.hidden = true; });
  $('[data-copy-message]', panel).addEventListener('click', e => copy(message, e.currentTarget));
}

/* ---------- custom scrollbar (full layout) ---------- */
const sbar = $('#sbar'), thumb = $('#sthumb');
let drag = null;
if (!lite) {
  thumb.addEventListener('pointerdown', e => { drag = { y: e.clientY, s: lenis.scroll }; thumb.setPointerCapture(e.pointerId); sbar.classList.add('drag'); });
  thumb.addEventListener('pointermove', e => { if (drag) lenis.scrollTo(drag.s + (e.clientY - drag.y) / (innerHeight - 140) * lenis.limit, { immediate: true }); });
  const end = () => { drag = null; sbar.classList.remove('drag'); };
  thumb.addEventListener('pointerup', end); thumb.addEventListener('pointercancel', end);
  S(sbar, 'opacity', '1');
}

/* ---------- per-frame: slat wipes, header colour, scrollbar, 3D hero ---------- */
const wipes = !gl ? [] : $$('.wipeb').map(el => ({ el, slats: $$('.slt i', el), from: el.dataset.from, to: el.dataset.to }));
const themed = [...$$('.pg > [data-theme]'), $('#footer')];
const hero = $('.ph');
let hero3d = null, navLight = null;

function frame(now) {
  lenis.raf(now);
  const y = lenis.scroll, H = innerHeight;
  for (const w of wipes) {
    const r = w.el.getBoundingClientRect();
    if (r.bottom < -40 || r.top > H + 40) continue;
    const p = clamp(-r.top / Math.max(1, r.height - H));
    // measured from the reference: the bottom slat starts first, each fills upward from its own lower edge
    w.slats.forEach((s, k) => {
      const x = seg(p, (4 - k) * .1, (4 - k) * .1 + .55);
      S(s, 'transform', `scaleY(${(1 - Math.pow(1 - x, 1.4)).toFixed(4)})`);
    });
    w.el.dataset.theme = p > .78 ? w.to : w.from;
  }
  let light = false;
  for (const s of themed) {
    const r = s.getBoundingClientRect();
    if (r.top <= 44 && r.bottom > 44) { light = s.dataset.theme !== 'dark'; break; }
  }
  if (light !== navLight) { navLight = light; chrome.nav.classList.toggle('lt', light); sbar.classList.toggle('lt', light); }
  if (!lite) S(thumb, 'transform', `translateY(${(10 + clamp(y / Math.max(1, lenis.limit)) * (H - 140)).toFixed(1)}px)`);
  hero3d?.frame(now, y, hero ? hero.offsetHeight : H);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Open the page as soon as the type is ready (never wait long for it); the 3D fades in behind when it is ready.
await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]);
chrome.reveal();
startReveals();
if (gl && hero) {
  try {
    hero3d = await (await import('./hero3d.js')).startHero3D();
  } catch (err) {    // the browser refused WebGL after all: show the flat mark instead
    console.error(err);
    root.classList.remove('gl');
    for (const art of $$('.ph-art')) art.innerHTML = markArt();
  }
}

let rt = 0;
addEventListener('resize', () => {
  window.__frameVars();
  clearTimeout(rt);
  rt = setTimeout(() => { if (window.__wantsLite() !== lite) location.reload(); }, 400);
});
