// HTML builders shared by the desktop stage and the lite layout, plus the testimonial switcher.
import { CLIENTS, CTA, FACTS, ICON, MEDIA, SERVICE_CARDS, TESTIMONIALS, WORK, href } from './content.js';
import { $, $$, words, initRoll } from './ui.js';

const star = c => `<svg width="22" height="18" viewBox="0 0 22 18" aria-hidden="true"><path d="M11 1 L13.5 7 L20 7.3 L15 11.4 L16.8 17.5 L11 14 L5.2 17.5 L7 11.4 L2 7.3 L8.5 7 Z" fill="none" stroke="${c}" stroke-width="1.2"/></svg>`;

// Key-fact cards (design px inside a 372×458 card). Desktop positions them at left 370/766/1160.
export function factCardsHTML(desktop) {
  return FACTS.map((f, i) => {
    const pos = desktop ? ` style="left:${[370, 766, 1160][i]}px"` : '';
    if (i === 0) return `<div class="kcard k0"${pos}><img src="${MEDIA}${f.img}" alt="" style="inset:0;width:100%;height:100%" loading="lazy"><div class="sh"></div>
      <div class="a cap" style="left:20px;top:22px">${f.label}</div><div class="a" style="left:20px;bottom:72px">${star('#d8d8d8')}</div>
      <p class="a p17" style="left:20px;bottom:22px;width:190px">${f.text}</p><div class="a odo" style="right:20px;bottom:18px"></div></div>`;
    if (i === 1) return `<div class="kcard k1"${pos}>
      <div class="a cap" style="left:0;width:100%;top:22px;text-align:center">${f.label}</div>
      <div class="disc"><div class="odo"></div></div>
      <p class="a p17" style="left:0;width:100%;bottom:22px;text-align:center">${f.text}</p></div>`;
    return `<div class="kcard k2"${pos}><div class="a cap" style="right:20px;top:22px">${f.label}</div>
      <img src="${MEDIA}${f.img}" alt="" style="left:30px;top:62px;width:312px;height:270px;filter:grayscale(.15)" loading="lazy">
      <p class="a p17" style="left:20px;bottom:22px;color:rgba(216,216,216,.6)">${f.text}</p><div class="a odo" style="right:20px;bottom:18px"></div></div>`;
  }).join('');
}

export function workCardHTML(w, left) {
  return `<article class="wcard"${left != null ? ` style="left:${left}px"` : ''}>
    <a class="wimg" href="${w.url}" aria-label="${w.title}"><img src="${MEDIA}${w.img}" alt="${w.title}" loading="lazy"><div class="wfr"></div><b aria-hidden="true">${w.overlay}</b></a>
    <h3 class="h34" style="margin-top:42px">${w.title}</h3><p class="p17" style="width:300px;margin-top:16px">${w.text}</p>
    <a class="a btn roll" href="${w.url}" style="right:0;top:640px;width:180px"><span data-t="Explore project"></span><b>→</b></a></article>`;
}

// Horizontal "Selected work" track (design px; the reference's panel/card rhythm).
export function workTrackHTML() {
  const all = href('projects/');
  return `<div class="wpanel" style="left:0;width:952px;background:linear-gradient(90deg,#f1f1f1,#e5e5e5);border-right:1px solid rgba(0,0,0,.08)"></div>
    <h2 class="a h89 center" id="wkTitle" style="left:0;width:952px;top:380px;font-weight:500;color:#434343" aria-label="Selected work and explorations"><div></div><div></div></h2>
    <div class="a row" style="left:0;width:952px;top:578px;justify-content:center;color:#434343"><a class="btn roll" href="${all}" style="width:190px"><span data-t="View all projects"></span><b>→</b></a></div>`
    + WORK.map((w, k) => workCardHTML(w, 1027 + k * 952)).join('')
    + [952, 1904, 2856, 3735].map(x => `<div class="wline" style="left:${x}px"></div>`).join('')
    + `<div class="wpanel" style="left:3810px;width:950px;background:linear-gradient(90deg,#f3f3f3,#e4e4e4)"></div>
    <p class="a h34 center" style="left:4067px;width:435px;top:392px;color:#434343">Discover our complete collection of digital experiences, brands, and platforms.</p>
    <div class="a row" style="left:3810px;width:950px;top:542px;justify-content:center;color:#434343"><a class="btn roll" href="${all}" style="width:190px"><span data-t="View all projects"></span><b>→</b></a></div>`;
}

export const labHTML = ([h, p, ic, url]) => `<a class="lab" href="${url}"><h3>${h}</h3><svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.3" aria-hidden="true">${ICON[ic]}</svg><p class="p17">${p}</p></a>`;
export const labsHTML = () => SERVICE_CARDS.map(labHTML).join('');

// Ribbon / grid cards: photos from the client's library plus typographic studies.
const TYPE_CARDS = {
  '2026': `<div style="padding:18px;height:100%;background:#f4f4f2;color:#111"><div style="font-family:'Martian Mono';font-size:9px">SMARTINDIA — NEW WORK</div><div style="font-size:120px;font-weight:600;letter-spacing:-.06em;line-height:1;margin-top:60px">2026</div></div>`,
  'SMART®': `<div style="padding:20px;height:100%;background:linear-gradient(135deg,#2a1b14,#4a2a1c);color:#fff"><div style="font-size:76px;font-weight:800;letter-spacing:-.06em;margin-top:70px">SMART.</div><div style="font-family:'Martian Mono';font-size:9px;margin-top:6px">BRANDS THAT DEFINE GROWTH</div></div>`,
  'DESIGN': `<div style="padding:20px;height:100%;background:linear-gradient(135deg,#e8a4c9,#c45d9a);color:#fff"><div style="font-size:52px;font-weight:700;letter-spacing:-.06em;line-height:.9;margin-top:60px">DESIGN.<br>DEVELOP.<br>DELIVER.</div></div>`,
  'APPS': `<div style="padding:20px;height:100%;background:#eef1ea;color:#1d2a1a"><div style="font-family:'Martian Mono';font-size:9px">MOBILE &amp; WEB APPLICATIONS</div><div style="font-size:64px;font-weight:700;letter-spacing:-.06em;line-height:.9;margin-top:56px">Apps<br>first.</div></div>`,
  'CONVERT': `<div style="padding:20px;height:100%;background:linear-gradient(135deg,#14213d,#2b3f73);color:#fff"><div style="font-family:'Martian Mono';font-size:9px">WEB &amp; APP STUDIO</div><div style="font-size:54px;font-weight:600;letter-spacing:-.06em;line-height:.92;margin-top:58px">Built to<br>convert.</div></div>`,
  'TIRUPUR': `<div style="padding:20px;height:100%;background:#ff6b1e;color:#111"><div style="font-family:'Martian Mono';font-size:9px">SMARTINDIA.DIGITAL</div><div style="font-size:58px;font-weight:800;letter-spacing:-.06em;line-height:.9;margin-top:60px">Made in<br>Tirupur.</div></div>`,
};
export function ribbonCard(r) {
  const d = document.createElement('div');
  if (r.startsWith('T:')) { d.className = 'rc'; d.innerHTML = TYPE_CARDS[r.slice(2)] || ''; }
  else { d.className = r.startsWith('object') ? 'rc png' : 'rc'; d.innerHTML = `<img src="${MEDIA}${r}" alt="" loading="lazy">`; }
  return d;
}

export const clientStyle = name => (CLIENTS.find(c => c[0].toLowerCase() === name.toLowerCase()) || [, ''])[1];
const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

// Testimonials: client logos (active one in focus), client list, quote, author, prev/next.
export function mountTestimonials(root, desktop) {
  const P = (s) => desktop ? ` a" style="${s}` : '';
  root.innerHTML = `
    <div class="t-logos${P('left:0;width:1920px;top:560px')}" aria-hidden="true">${TESTIMONIALS.map(t => `<span style="${clientStyle(t.client)}">${t.client}</span>`).join('')}</div>
    ${desktop ? '<div class="a t-xl" style="left:674px;top:686px;width:556px"></div><div class="a t-xx" style="left:944px;top:674px" aria-hidden="true">×</div>' : ''}
    <h2 class="cap${P('left:38px;top:774px')}">Client voices</h2>
    <ul class="t-list${P('left:192px;top:774px')}">${TESTIMONIALS.map((t, i) => `<li><button type="button" data-i="${i}">${t.client}</button></li>`).join('')}</ul>
    <div class="t-body${P('left:964px;top:774px;width:749px')}">
      <blockquote class="h34 t-q" aria-live="polite"></blockquote>
      <div class="t-who"><span class="t-av" aria-hidden="true"></span><p class="p17"><b class="t-n"></b><br><span class="t-r"></span></p></div>
      <a class="btn roll" href="${href(CTA.discuss)}"><span data-t="Become a client"></span><b>→</b></a>
    </div>
    <div class="t-arrows${P('left:190px;top:1022px')}"><button type="button" aria-label="Previous testimonial">←</button><button type="button" aria-label="Next testimonial">→</button></div>
    ${desktop ? '<div class="a hr dkhr" style="left:38px;top:1242px;width:1844px"></div><div class="a plus dk" style="left:946px;top:1231px">+</div>' : ''}`;
  initRoll(root);
  const q = $('.t-q', root), logos = $$('.t-logos span', root), btns = $$('.t-list button', root);
  let cur = 0, timer = 0;
  const apply = i => {
    const t = TESTIMONIALS[i];
    words(q, `“${t.quote}”`).forEach(s => { s.style.transitionDelay = `${(Math.random() * .28).toFixed(2)}s`; });
    $('.t-av', root).innerHTML = t.photo ? `<img src="${MEDIA}${t.photo}" alt="">` : initials(t.name);
    $('.t-n', root).textContent = t.name; $('.t-r', root).textContent = t.role;
    logos.forEach((l, k) => l.classList.toggle('on', k === i));
    btns.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
  };
  const set = (i, instant) => {
    i = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
    if (i === cur && !instant) return;
    cur = i;
    if (instant) { apply(i); return; }
    clearTimeout(timer);
    q.classList.add('out');
    timer = setTimeout(() => { apply(i); void q.offsetWidth; q.classList.remove('out'); }, 520);
  };
  btns.forEach(b => b.addEventListener('click', () => set(+b.dataset.i)));
  const [prev, next] = $$('.t-arrows button', root);
  prev.addEventListener('click', () => set(cur - 1));
  next.addEventListener('click', () => set(cur + 1));
  set(0, true);
  return { set };
}
