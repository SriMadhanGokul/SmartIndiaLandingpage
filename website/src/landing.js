// Landing page: smooth in-page scrolling, section spy, and the enquiry form.
// The form posts to the Laravel route /contact/store when this site is served
// from that app (a CSRF token is read from /contact/). Otherwise it uses the
// same mailto handoff as the rest of the site.
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';
import { initChrome } from './chrome.js';
import { CONTACT, ENQUIRY_URL } from './content.js';
import { markSVG } from './data.js';
import { clamp, eout, seg } from './lib/util.js';
import { $, $$, S } from './ui.js';

const root = document.documentElement;
const lite = root.classList.contains('lite');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BASE = import.meta.env.BASE_URL;

const lenis = new Lenis({ lerp: reduce ? 1 : .1, smoothWheel: !reduce, syncTouch: false });
const chrome = initChrome({ lenis });

$('#navMark').innerHTML = markSVG(26, 'currentColor');
const heroMark = $('#heroMark');
if (heroMark) heroMark.innerHTML = markSVG(320, 'currentColor');

/* ---------- rotating hero word ---------- */
const word = $('#word');
const words = ['business.', 'brand.', 'reach.', 'impact.'];
if (word && !reduce) {
  let i = 0;
  setInterval(() => {
    word.classList.add('out');
    setTimeout(() => {
      i = (i + 1) % words.length;
      word.textContent = words[i];
      word.classList.remove('out');
    }, 320);
  }, 2600);
}

/* ---------- reveals and counters ---------- */
const countUp = el => {
  const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
  const step = now => {
    const p = eout(seg((now - t0) / 1000, 0, 1.4));
    el.textContent = `${Math.round(to * p)}${suf}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    io.unobserve(e.target);
    for (const n of e.target.querySelectorAll('[data-count]')) countUp(n);
  }
}, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
for (const el of $$('.rv')) io.observe(el);
for (const n of $$('[data-count]')) {
  if (n.closest('.rv')) continue;
  const watch = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    countUp(n);
    watch.disconnect();
  }, { threshold: .4 });
  watch.observe(n);
}

/* ---------- feature rows: tap to keep the detail open ---------- */
for (const row of $$('.feat')) {
  row.addEventListener('click', () => {
    const open = row.getAttribute('aria-expanded') === 'true';
    row.setAttribute('aria-expanded', String(!open));
  });
}

/* ---------- package pick flows into the enquiry form ---------- */
const form = $('#cform');
const serviceSel = form?.elements.service;
const packageSel = form?.elements.package;
const subjectEl = form?.elements.subject;

const filterPackages = () => {
  const service = serviceSel.value;
  for (const group of packageSel.querySelectorAll('optgroup')) {
    const on = group.label === service;
    group.hidden = !on;
    for (const opt of group.querySelectorAll('option')) opt.disabled = !on;
  }
  if (packageSel.selectedOptions[0]?.disabled) {
    const first = [...packageSel.options].find(o => o.value && !o.disabled);
    if (first) first.selected = true;
  }
};
const pick = (service, pack) => {
  if (!form) return;
  if (service && [...serviceSel.options].some(o => o.value === service)) serviceSel.value = service;
  filterPackages();
  if (pack) {
    const opt = [...packageSel.options].find(o => o.value === pack && !o.disabled);
    if (opt) opt.selected = true;
  }
  if (subjectEl && !subjectEl.dataset.touched) {
    subjectEl.value = [packageSel.value, serviceSel.value].filter(Boolean).join(' — ');
  }
  for (const card of $$('.plan')) {
    const on = card.dataset.service === serviceSel.value && card.dataset.package === packageSel.value;
    card.classList.toggle('is-picked', on);
  }
};
subjectEl?.addEventListener('input', () => { subjectEl.dataset.touched = '1'; });
serviceSel?.addEventListener('change', () => pick(serviceSel.value, packageSel.value));
packageSel?.addEventListener('change', () => pick(serviceSel.value, packageSel.value));
if (serviceSel) {
  filterPackages();
  for (const card of $$('.plan')) {
    card.classList.toggle('is-picked', card.dataset.service === serviceSel.value && card.dataset.package === packageSel.value);
  }
}

document.addEventListener('click', e => {
  const a = e.target.closest?.('[data-service]');
  if (!a) return;
  pick(a.dataset.service, a.dataset.package || '');
}, true);

/* ---------- section spy ---------- */
const spyLinks = $$('#landLinks a, #menuLinks a[href*="#"]');
const sections = ['web', 'mobile', 'pricing', 'why', 'process', 'enquire'].map(id => document.getElementById(id)).filter(Boolean);
const spy = () => {
  const line = innerHeight * .28;
  let current = '';
  for (const sec of sections) if (sec.getBoundingClientRect().top <= line) current = sec.id;
  for (const a of spyLinks) {
    const on = current && a.hash === `#${current}`;
    if (on) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
};

/* ---------- header colour + scrollbar ---------- */
const sbar = $('#sbar'), thumb = $('#sthumb');
let drag = null;
if (!lite && thumb) {
  thumb.addEventListener('pointerdown', e => { drag = { y: e.clientY, s: lenis.scroll }; thumb.setPointerCapture(e.pointerId); sbar.classList.add('drag'); });
  thumb.addEventListener('pointermove', e => { if (drag) lenis.scrollTo(drag.s + (e.clientY - drag.y) / (innerHeight - 140) * lenis.limit, { immediate: true }); });
  const end = () => { drag = null; sbar.classList.remove('drag'); };
  thumb.addEventListener('pointerup', end);
  thumb.addEventListener('pointercancel', end);
  S(sbar, 'opacity', '1');
}
const themed = [...$$('[data-theme]'), $('#footer')].filter(Boolean);
let navLight = null;

function frame(now) {
  lenis.raf(now);
  spy();
  let light = false;
  for (const s of themed) {
    const r = s.getBoundingClientRect();
    if (r.top <= 48 && r.bottom > 48) { light = s.dataset.theme !== 'dark'; break; }
  }
  if (light !== navLight) { navLight = light; chrome.nav.classList.toggle('lt', light); sbar?.classList.toggle('lt', light); }
  if (!lite && thumb) S(thumb, 'transform', `translateY(${(10 + clamp(lenis.scroll / Math.max(1, lenis.limit)) * (innerHeight - 140)).toFixed(1)}px)`);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- enquiry: same-origin Laravel route, then the email handoff ---------- */
const panelMail = $('#sentMail');
const panelOk = $('#sentOk');
const err = $('#formErr');

function messageBody() {
  const note = form.elements.message.value.trim();
  const lines = [
    note,
    '',
    `Service: ${serviceSel.value}`,
    `Package: ${packageSel.value}`,
  ];
  return lines.join('\n').trim();
}

async function csrfToken() {
  const pageUrl = new URL('contact/', location.origin + BASE);
  const res = await fetch(pageUrl, { credentials: 'same-origin', headers: { Accept: 'text/html' } });
  if (!res.ok) return '';
  const html = await res.text();
  return html.match(/name="_token"\s+value="([^"]+)"/)?.[1]
    || html.match(/csrf-token"\s+content="([^"]+)"/)?.[1]
    || '';
}

async function postEnquiry(fields) {
  const token = await csrfToken();
  if (!token) return null;
  const body = new URLSearchParams();
  body.set('_token', token);
  for (const [k, v] of Object.entries(fields)) if (v) body.set(k, v);
  const res = await fetch(new URL(ENQUIRY_URL.replace(/^\//, ''), location.origin + BASE), {
    method: 'POST',
    credentials: 'same-origin',
    redirect: 'follow',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': token,
    },
    body,
  });
  if (res.status === 422) {
    const data = await res.json().catch(() => ({}));
    const first = data.errors && Object.values(data.errors).flat()[0];
    const error = new Error(first || 'Please check the form and try again.');
    error.validation = true;
    throw error;
  }
  if (!res.ok) return null;
  const type = res.headers.get('content-type') || '';
  if (type.includes('text/html')) {
    const html = await res.text();
    if (/could not be found|page not found/i.test(html)) return null;
  }
  return true;
}

function showMail(subject, message) {
  panelOk.hidden = true;
  const gmail = $('[data-gmail]', panelMail);
  gmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  panelMail.hidden = false;
  panelMail.dataset.message = message;
  lenis.scrollTo(panelMail, { offset: -Math.round(innerHeight * .2) });
  location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    panelMail.hidden = true;
    panelOk.hidden = true;
    err.hidden = true;
    if (!form.reportValidity()) return;
    const subject = subjectEl.value.trim() || `${serviceSel.value} — ${packageSel.value}`;
    const message = messageBody();
    const fields = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      subject,
      message,
    };
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    try {
      const sent = await postEnquiry(fields);
      if (sent) {
        panelMail.hidden = true;
        panelOk.hidden = false;
        form.reset();
        subjectEl.dataset.touched = '';
        lenis.scrollTo(panelOk, { offset: -Math.round(innerHeight * .2) });
      } else {
        showMail(subject, message);
      }
    } catch (error) {
      if (error.validation) {
        err.textContent = error.message;
        err.hidden = false;
      } else {
        showMail(subject, message);
      }
    } finally {
      btn.disabled = false;
    }
  });
  form.addEventListener('reset', () => {
    panelMail.hidden = true;
    panelOk.hidden = true;
    err.hidden = true;
    for (const card of $$('.plan')) card.classList.remove('is-picked');
  });
  $('[data-copy-message]', panelMail)?.addEventListener('click', async ev => {
    const text = panelMail.dataset.message || '';
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    const node = ev.currentTarget.querySelector('[data-t] i');
    if (!node) return;
    const was = node.textContent;
    $$('[data-t] i', ev.currentTarget).forEach(i => { i.textContent = 'Copied'; });
    setTimeout(() => $$('[data-t] i', ev.currentTarget).forEach(i => { i.textContent = was; }), 1600);
  });
}

await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]);
chrome.reveal();

let rt = 0;
addEventListener('resize', () => {
  window.__frameVars?.();
  clearTimeout(rt);
  rt = setTimeout(() => { if (window.__wantsLite?.() !== lite) location.reload(); }, 400);
});
