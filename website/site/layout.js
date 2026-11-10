// Shared page chrome: <head>, header, menu overlay and footer. Rendered at build time for every page.
import { BRAND, CONTACT, CTA, FOOTER, NAV, SEO, SOCIAL, TAGLINE, markSVG } from '../src/data.js';

export const esc = s => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Hover text-roll: two stacked copies of a label (see [data-t] in styles.css).
export const roll = t => `<span data-t="${esc(t)}"><i>${esc(t)}</i><i aria-hidden="true">${esc(t)}</i></span>`;

// Runs before first paint: chooses the layout, sets the frame scale, and notes an in-site page change.
// main.js and page.js read the result from the <html> classes and window.__wantsLite.
// 3D needs WebGL2 and a real graphics chip: on a software renderer it would crawl, so those get the flat layout.
// That check creates a WebGL context, so its answer is kept for the rest of the visit.
const BOOT = `(function(d,w){var r=d.documentElement,rm=matchMedia('(prefers-reduced-motion: reduce)'),hw=false,no3d=false;
var k=null;try{k=sessionStorage.getItem('si-hw');no3d=!!sessionStorage.getItem('si-no3d')}catch(e){}
if(k)hw=k==='1';else{try{var x=d.createElement('canvas').getContext('webgl2');if(x){var i=x.getExtension('WEBGL_debug_renderer_info');hw=!/swiftshader|llvmpipe|softpipe|software|basic render/i.test(i?x.getParameter(i.UNMASKED_RENDERER_WEBGL):'');var l=x.getExtension('WEBGL_lose_context');if(l)l.loseContext()}}catch(e){}
try{sessionStorage.setItem('si-hw',hw?'1':'0')}catch(e){}}
w.__wantsLite=function(){return rm.matches||!hw||no3d||innerWidth<1100||innerWidth/innerHeight<1.2};
w.__vh=function(){var p=d.createElement('div');p.style.cssText='position:fixed;top:0;width:0;height:100lvh;visibility:hidden';r.appendChild(p);var h=p.offsetHeight;r.removeChild(p);return h||innerHeight};
w.__frameVars=function(){var l=w.__wantsLite(),W=innerWidth,H=l?w.__vh():innerHeight,u=Math.min(W/(l?560:1920),H/868),s=r.style;s.setProperty('--u',u.toFixed(5));s.setProperty('--nu',l?'.78':Math.max(u,.62).toFixed(4));s.setProperty('--ox',((W-1920*u)/2).toFixed(2)+'px');s.setProperty('--oyc',((H-868*u)/2).toFixed(2)+'px');s.setProperty('--oyb',(H-868*u).toFixed(2)+'px')};
var c=' js '+(w.__wantsLite()?'lite':'full');try{if(sessionStorage.getItem('si-wipe'))c+=' wiped';if(sessionStorage.getItem('si-seen'))c+=' seen'}catch(e){}if(hw&&!rm.matches&&!no3d)c+=' gl';r.className+=c;w.__frameVars()})(document,window)`;

export const SITE_URL = 'https://smartindia.digital/';

export const head = ({ title, desc, path = '', index = true, styles = [] }) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${index ? `<link rel="canonical" href="${SITE_URL}${path}">` : '<meta name="robots" content="noindex">'}
<meta name="google-site-verification" content="Xm2TRckxXp8vL-KfetKLU4Iz2xRRGbkHqQT7nrhVl5Q">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}${path}">
<meta name="theme-color" content="#040508">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/node_modules/@fontsource/familjen-grotesk/files/familjen-grotesk-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>${BOOT}</script>
<link rel="stylesheet" href="/src/styles.css">
${styles.map(s => `<link rel="stylesheet" href="${s}">`).join('\n')}`;

export const HOME_META = SEO.home;

export const header = base => `<div id="wipe" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
<header id="nav">
  <a id="navLogo" href="${base}" aria-label="${BRAND} home"><span id="navMark" style="display:flex">${markSVG(26, 'currentColor')}</span><span>SMARTINDIA</span></a>
  <div id="navRight">
    <button id="navSnd" type="button" aria-label="Play ambient sound" aria-pressed="false">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 5h2.5L8 2v10L4.5 9H2z" fill="currentColor"/><path class="off" d="M10 4l3 6M13 4l-3 6" stroke="currentColor" stroke-width="1.1"/><path class="on" d="M10 4.5q2 2.5 0 5M11.5 3q3.4 4 0 8" stroke="currentColor" stroke-width="1.1" fill="none"/></svg>
    </button>
    <a id="navTalk" class="pill roll" href="${base}${CTA.discuss}">${roll('Let\'s talk')}</a>
    <button id="navMenu" class="pill roll" type="button" aria-expanded="false" aria-controls="menu"><span data-t="Menu" id="navMenuT"><i>Menu</i><i aria-hidden="true">Menu</i></span><i aria-hidden="true"></i></button>
  </div>
</header>`;

const socialLinks = SOCIAL.map(([n, h]) => `<a class="roll" href="${h}"${h === '#' ? ' data-soon' : ' target="_blank" rel="noopener"'}>${roll(n)}</a>`).join('');

export const menu = (base, active = '') => `<div id="menu" aria-hidden="true" role="dialog" aria-label="Site menu">
  <div class="slats"><i></i><i></i><i></i><i></i><i></i></div>
  <nav aria-label="Main"><ol id="menuLinks">${NAV.map(([t, p], i) => `<li style="--i:${i}"><a class="roll" href="${base}${p}"${p === active ? ' aria-current="page"' : ''}><small>${String(i + 1).padStart(2, '0')}</small>${roll(t)}</a></li>`).join('')}</ol></nav>
  <div id="menuSide">
    <div class="cap dim">Business enquiry</div>
    <a class="menuBig roll" href="mailto:${CONTACT.email}">${roll(CONTACT.email)}</a>
    <a class="menuBig roll" href="tel:${CONTACT.tel}">${roll(CONTACT.phone)}</a>
    <div class="cap dim gapT">Studio</div>
    <p class="p17">${CONTACT.city}<br>${CONTACT.hours}</p>
    <div class="cap dim gapT">Social</div>
    <div id="menuSocial">${socialLinks}</div>
  </div>
</div>`;

export const footer = base => `<footer id="footer" data-theme="dark">
  <canvas id="lines" aria-hidden="true"></canvas>
  <div class="ffr">
    <div class="fk cap">${FOOTER.kicker}</div>
    <div class="fclock cap" id="clock" aria-label="Local time in Tirupur"></div>
    <h2 class="fHead">${FOOTER.heading}</h2>
    <div class="fcta">
      <a class="btn roll" href="${base}${CTA.discuss}">${roll('Discuss your project')}<b>→</b></a>
      <a class="btn roll" href="${base}${CTA.call}">${roll('Book a free call')}<b>→</b></a>
    </div>
    <div class="finfo">
      <div class="cap dim">Business enquiry</div>
      <p class="p17">E. <a class="roll" href="mailto:${CONTACT.email}">${roll(CONTACT.email)}</a></p>
      <p class="p17">P. <a class="roll" href="tel:${CONTACT.tel}">${roll(CONTACT.phone)}</a></p>
    </div>
    <div class="fsoc"><div class="cap dim">Social</div><div id="fSocial">${socialLinks}</div></div>
    <div class="fbot"><span class="cap dim">© ${new Date().getFullYear()} ${BRAND}</span><span class="cap dim">${CONTACT.city}</span></div>
    <svg id="wordmark" viewBox="0 0 1924 491" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="wmGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d8d8"/><stop offset=".72" stop-color="#d8d8d8" stop-opacity=".55"/><stop offset="1" stop-color="#d8d8d8" stop-opacity=".12"/></linearGradient></defs><text x="962" y="452" text-anchor="middle" textLength="1910" lengthAdjust="spacingAndGlyphs">SMARTINDIA</text></svg>
  </div>
</footer>
<div id="sbar" aria-hidden="true"><i id="sthumb"></i></div>`;

// A complete inner page.
export const shell = ({ base, title, desc, path, index, active, id, body }) => `<!doctype html>
<html lang="en">
<head>
${head({ title: `${title} – ${BRAND}`, desc: desc || TAGLINE, path, index, styles: ['/src/pages.css'] })}
</head>
<body class="inner" data-page="${id}">
<canvas id="gl" aria-hidden="true"></canvas>
${header(base)}
${menu(base, active)}
<main class="pg">
${body}
</main>
${footer(base)}
<script type="module" src="/src/page.js"></script>
</body>
</html>
`;
