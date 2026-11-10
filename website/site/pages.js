// Every inner page of the site. Each route renders to real, static HTML at build time.
import { ABOUT, BLOG, BRAND, CONTACT, CTA, FACTS, FAQ, HERO, ICON, INDUSTRIES, PLANS, POINTS, PROJECTS, RATINGS, SERVICES, STEPS, TAGLINE, TEAM, TESTIMONIALS, VALUES, SEO } from '../src/data.js';
import { esc, roll, shell } from './layout.js';

/* ---------- shared pieces ---------- */
const btn = (href, label, cls = '') => `<a class="btn roll ${cls}" href="${href}">${roll(label)}<b>→</b></a>`;
const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const plain = s => s.replace(/<br>/g, ' ');

const crumbs = (L, items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([t, p], i) => (i === items.length - 1
  ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${L(p)}">${esc(t)}</a><i aria-hidden="true">/</i>`)).join('')}</nav>`;

const hero = (L, { kick, title, sub, trail, extra = '', float = '' }) => `<section class="ph" data-theme="dark">
  ${float}
  <div class="ph-art" aria-hidden="true"></div>
  <div class="ph-body">
    <div class="cap ph-kick"><span class="ic">✦</span> ${esc(kick)}</div>
    <h1 class="t1 ph-t" data-split>${esc(title)}</h1>
    ${sub ? `<p class="tx ph-sub rv">${esc(sub)}</p>` : ''}
    ${extra}
  </div>
  <div class="ph-foot cap">
    <div class="heroDot" aria-hidden="true"><i></i></div>
    <div class="ph-hold">Scroll to <span class="ic">✸</span> explore</div>
    ${crumbs(L, trail)}
  </div>
</section>`;

const sec = (theme, inner, cls = '') => `<section class="sec ${theme} ${cls}" data-theme="${theme === 'dark' ? 'dark' : 'light'}">${inner}</section>`;

// Marquee band that five slats wipe over, as on the homepage. `from`/`to` are the section colours either side.
const wipe = (words, { from = 'dark', to = 'light' } = {}) => {
  const half = words.map(w => `<span>${esc(w)}</span><i>+</i>`).join('');
  return `<div class="wipeb from-${from} to-${to}" data-from="${from}" data-to="${to}" data-theme="${from}" aria-hidden="true"><div class="wipe-in">
    <div class="mqt"><div class="mqt-in">${half}${half}${half}${half}</div></div>
    <div class="slt"><i></i><i></i><i></i><i></i><i></i></div>
  </div></div>`;
};

const hrPlus = () => '<div class="hrp rv" aria-hidden="true"><i>+</i></div>';

const projectHref = (L, p) => L(`projects/${p.slug}/`);
const pcard = (L, p, i = 0) => `<article class="pc" style="--d:${(i % 2) * .14}s">
  <a class="wimg${p.img ? '' : ' type'}" href="${projectHref(L, p)}" aria-label="${esc(p.name)}">${p.img ? `<img src="/media/${p.img}" alt="${esc(p.name)} project" loading="lazy">` : ''}<div class="wfr"></div>${p.overlay ? `<b aria-hidden="true">${esc(p.overlay)}</b>` : ''}</a>
  <div class="pc-row"><div class="pc-tx"><h3 class="t4">${esc(p.name)}</h3><p class="sm">${esc(p.text)}</p></div>${btn(projectHref(L, p), 'Explore project')}</div>
</article>`;

const quote = t => `<figure class="tq rv"><blockquote class="t3">“${esc(t.quote)}”</blockquote><figcaption><span class="t-av" aria-hidden="true">${initials(t.name)}</span><span class="sm"><b>${esc(t.name)}</b><br><span class="dimt">${esc(t.role)}</span></span></figcaption></figure>`;

const process = () => sec('dark', `<div class="g2">
  <div class="cap rv">Our process</div>
  <div>
    <h2 class="t2 rv">How we work</h2>
    <p class="tx sub rv">Shaping the Future Through Step-by-Step Innovation</p>
    <ol class="steps">${STEPS.map(([t, d], i) => `<li class="step rv"><span class="cap">Step ${String(i + 1).padStart(2, '0')}</span><h3 class="t3">${esc(t)}</h3><p class="sm">${esc(d)}</p></li>`).join('')}</ol>
  </div>
</div>`);

const faqList = (items, name = 'faq') => `<div class="qas">${items.map(([q, a], i) => `<details class="qa rv" name="${name}"${i === 0 ? ' open' : ''}><summary><span class="t4">${esc(q)}</span><i aria-hidden="true">+</i></summary><p class="tx">${esc(a)}</p></details>`).join('')}</div>`;

/* ---------- pages ---------- */
const about = L => hero(L, {
  kick: 'Who we are',
  title: 'A Creative Digital Agency Focused on Real Results',
  sub: 'From startups to established companies, we create high-impact digital solutions that attract, engage, and convert customers.',
  trail: [['Home', ''], ['About']],
}) + sec('dark', `<div class="g2">
  <div class="cap rv">At SMARTINDIA</div>
  <div>
    <p class="t2 rv">We build digital experiences that grow your business.</p>
    ${hrPlus()}
    <div class="ab-grid">
      <ul class="cap points rv">${POINTS.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      <div class="ab-tx">
        <p class="tx rv">${esc(ABOUT.mission)}</p>
        <div class="box2 pbox rv"><div class="cap13">${HERO.est}</div><div class="cap13">${HERO.years}</div></div>
        ${btn(L('services/'), 'Our services', 'rv')}
      </div>
      <img class="ab-img rv" src="/media/about-1-2.webp" alt="The SMARTINDIA.DIGITAL team at work" loading="lazy">
    </div>
  </div>
</div>`) + wipe(['INNOVATE', 'IMPACT', 'INSPIRE']) + sec('light', `<div class="center">
  <h2 class="t2 rv">Key facts</h2>
  <p class="sm kf-sub rv">A snapshot of our<br>experience and impact.</p>
</div>
<div class="stats">${FACTS.map(f => `<div class="stat rv"><div class="cap">${esc(f.label)}</div><div class="stat-n" data-count="${f.value}" data-suffix="${f.suffix}">${f.value}${f.suffix}</div><p class="sm">${esc(plain(f.text))}</p></div>`).join('')}</div>
${hrPlus()}
<div class="split">
  <h2 class="t2 rv">Here’s Why Brands Trust Our Expertise</h2>
  <div class="vrows">${VALUES.map(([t, d]) => `<div class="vrow rv"><h3 class="t4">${esc(t)}</h3><p class="sm">${esc(d)}</p></div>`).join('')}</div>
</div>
<div class="inds rv"><div class="cap">We work across diverse industries</div><ul class="t4">${INDUSTRIES.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`) + process() + sec('white', `<div class="split">
  <div><div class="cap rv">Our team</div><h2 class="t2 rv tm-t">Meet Our Experienced Team People</h2>${btn(L('team/'), 'Meet the team', 'rv')}</div>
  <div class="vrows">${TEAM.map(([n, r]) => `<div class="vrow rv"><h3 class="t4">${esc(n)}</h3><p class="sm">${esc(r)}</p></div>`).join('')}</div>
</div>`);

const services = L => hero(L, {
  kick: 'Our services',
  title: 'Helping You Succeed Through Creative & Digital Services',
  sub: TAGLINE,
  trail: [['Home', ''], ['Services']],
}) + sec('dark', `<div class="srows">${SERVICES.map((s, i) => `<a class="srow rv" href="${L(`services/${s.slug}/`)}">
  <span class="cap">${String(i + 1).padStart(2, '0')}</span>
  <h2 class="t2">${esc(s.title)}</h2>
  <p class="sm">${esc(s.short)}</p>
  <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">${ICON[s.icon]}</svg>
  <span class="btn roll">${roll('View details')}<b>→</b></span>
</a>`).join('')}</div>`) + wipe(['MOBILE APPS', 'WEB APPS', 'WEBSITES', 'DESIGN']) + sec('light', `<div class="split">
  <h2 class="t2 rv">Do you offer custom website or app development?</h2>
  <div>
    <p class="t3 rv">Yes, we specialize in building custom, scalable solutions from scratch using modern technologies like Laravel, React, and Flutter.</p>
    <div class="btn-row rv">${btn(L('projects/'), 'View our projects')}${btn(L(CTA.discuss), 'Let’s talk')}</div>
  </div>
</div>
<div class="inds rv"><div class="cap">We work across diverse industries</div><ul class="t4">${INDUSTRIES.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`) + process();

const service = (L, s, i) => {
  const next = SERVICES[(i + 1) % SERVICES.length];
  const rel = s.related.map(slug => PROJECTS.find(p => p.slug === slug));
  const voice = s.slug === 'app-development' ? TESTIMONIALS.find(t => t.name === 'Rajesh Kumar') : s.slug === 'graphic-designing' ? TESTIMONIALS.find(t => t.name === 'Michael Chen') : null;
  return hero(L, {
    kick: 'Our services', title: s.title, sub: s.short,
    trail: [['Home', ''], ['Services', 'services/'], [s.title]],
  }) + sec('light', `<div class="sd">
    <aside class="sd-side">
      <nav class="sd-nav rv" aria-label="Services">${SERVICES.map(o => `<a class="t4" href="${L(`services/${o.slug}/`)}"${o.slug === s.slug ? ' aria-current="page"' : ''}><span>${esc(o.title)}</span><b>→</b></a>`).join('')}</nav>
      <div class="sd-help rv">
        <h2 class="t4">Contact with us for any advice</h2>
        <p class="sm">Need help? Talk to an expert</p>
        <a class="t4 sd-tel" href="tel:${CONTACT.tel}">${CONTACT.phone}</a>
        ${btn(L(CTA.discuss), 'Discuss your project')}
      </div>
    </aside>
    <div class="sd-main">
      <img class="sd-img rv" src="/media/service-details.webp" alt="" loading="lazy">
      <h2 class="t3 rv">${esc(s.overviewTitle)}</h2>
      ${s.overview.map(p => `<p class="tx rv">${esc(p)}</p>`).join('')}
      <h2 class="t3 rv">${esc(s.listTitle)}</h2>
      <p class="tx rv">${esc(s.listIntro)}</p>
      <ul class="plus-list">${s.list.map(l => `<li class="tx rv">${esc(l)}</li>`).join('')}</ul>
      ${voice ? quote(voice) : ''}
    </div>
  </div>
  ${rel.length ? `${hrPlus()}<div class="cap rel-t rv">Related work</div><div class="pgrid">${rel.map((p, k) => pcard(L, p, k)).join('')}</div>` : ''}`) + nextLink(L(`services/${next.slug}/`), 'Next service', next.title);
};

const nextLink = (href, label, title) => `<a class="nextp" href="${href}" data-theme="dark"><span class="cap">${esc(label)}</span><span class="t2">${esc(title)}</span><b class="t2" aria-hidden="true">→</b></a>`;

const webProjects = PROJECTS.filter(p => p.group === 'web');
const mobileProjects = PROJECTS.filter(p => p.group === 'mobile');
const floatThumbs = () => `<div class="ph-float" aria-hidden="true">${PROJECTS.filter(p => p.img).slice(0, 6).map((p, i) => `<img class="fl${i}" src="/media/${p.img}" alt="">`).join('')}</div>`;

const projects = L => hero(L, {
  kick: 'Portfolio',
  title: 'Our Projects & Clients',
  sub: 'Websites, online stores and mobile applications we have built for our clients.',
  trail: [['Home', ''], ['Portfolio']],
  float: floatThumbs(),
}) + sec('dark', `<div class="cap grp-t rv">Web Development</div><div class="pgrid">${webProjects.map((p, i) => pcard(L, p, i)).join('')}</div>`) + wipe(['MOBILE', 'WEB', 'DESIGN', 'DELIVER'], { to: 'white' }) + sec('white', `<div class="cap grp-t rv">Mobile Applications</div>
<div class="pgrid">${mobileProjects.map((p, i) => pcard(L, p, i)).join('')}${quote(TESTIMONIALS.find(t => t.name === 'Rajesh Kumar'))}</div>`);

const project = (L, p, i) => {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const voice = p.quoteOf ? TESTIMONIALS.find(t => t.name === p.quoteOf) : null;
  const facts = [['Client', p.client], ['Duration', p.duration], ['Platform', p.platform]].filter(([, v]) => v);
  return hero(L, {
    kick: p.platform, title: p.name, sub: p.text,
    trail: [['Home', ''], ['Portfolio', 'projects/'], [p.name]],
    extra: p.url ? `<div class="ph-cta rv"><a class="btn roll" href="${p.url}" target="_blank" rel="noopener">${roll('Launch project')}<b>↗</b></a></div>` : '',
  }) + sec('dark', `<div class="info">${facts.map(([k, v]) => `<div class="info-c rv"><div class="cap dim">${k}</div><div class="t4">${esc(v)}</div></div>`).join('')}${p.logo ? `<div class="info-c rv info-logo"><img src="/media/${p.logo}" alt="${esc(p.name)} logo" loading="lazy"></div>` : ''}</div>
  <div class="wimg big rv${p.img ? '' : ' type'}">${p.img ? `<img src="/media/${p.img}" alt="${esc(p.name)}" loading="lazy">` : ''}<div class="wfr"></div>${p.overlay ? `<b aria-hidden="true">${esc(p.overlay)}</b>` : ''}</div>
  ${voice ? quote(voice) : ''}`) + sec('white', `<div class="cta center">
    <h2 class="t2 rv">Ready to build your own success story?</h2>
    <p class="tx rv">Let’s discuss how we can transform your vision into a world-class digital product.</p>
    ${btn(L(CTA.discuss), 'Start your project', 'rv')}
  </div>`) + nextLink(projectHref(L, next), 'Next project', next.name);
};

const team = L => hero(L, {
  kick: 'Our team', title: 'Our Expert Team', sub: 'Meet Our Experienced Team People',
  trail: [['Home', ''], ['Team']],
}) + sec('dark', `<div class="trows">${TEAM.map(([n, r]) => `<div class="trow rv"><span class="t-av" aria-hidden="true">${initials(n)}</span><h2 class="t2">${esc(n)}</h2><p class="cap">${esc(r)}</p></div>`).join('')}</div>
${hrPlus()}
<div class="center tm-cta"><p class="t3 rv">Want to work with us?</p><div class="btn-row rv">${btn(L(CTA.discuss), 'Let’s talk')}${btn(L('about/'), 'About us')}</div></div>`);

const pricing = L => hero(L, {
  kick: 'Pricing', title: 'Pricing',
  sub: 'We offer both project-based pricing and monthly retainer plans, depending on the service.',
  trail: [['Home', ''], ['Pricing']],
}) + sec('light', `<div class="plans">${PLANS.map(p => `<article class="plan rv">
    <div class="cap">${esc(p.name)}</div>
    <h2 class="t3">${esc(p.title)}</h2>
    <p class="sm">${esc(p.text)}</p>
    <ul class="plus-list">${p.points.map(x => `<li class="sm">${esc(x)}</li>`).join('')}</ul>
    ${btn(L(CTA.discuss), 'Get started')}
  </article>`).join('')}</div>
  ${hrPlus()}
  <div class="center tm-cta"><p class="t3 rv">Our goal is to provide high-quality results with a clear ROI for your business.</p><div class="btn-row rv">${btn(L(CTA.discuss), 'Ask for a quote')}${btn(L('faq/'), 'Read the FAQ')}</div></div>`);

const testimonials = L => hero(L, {
  kick: 'Testimonial', title: 'What Clients Say About Us',
  sub: 'Our customers consistently rate us 4.8/5.',
  trail: [['Home', ''], ['Testimonials']],
}) + sec('light', `<div class="tqs">${TESTIMONIALS.map(quote).join('')}</div>
${hrPlus()}
<div class="rates">${RATINGS.map(([n, s, c]) => `<div class="rate rv"><div class="cap">${esc(n)}</div><div class="t2">${esc(s)}</div><div class="sm">${esc(c)}</div></div>`).join('')}</div>`);

const faq = L => hero(L, {
  kick: 'Faqs', title: 'Have Questions in Your Mind? Get the Answers Now',
  trail: [['Home', ''], ['FAQ']],
}) + sec('light', `<div class="split">
  <div><h2 class="t2 rv">Questions</h2><p class="sm rv kf-sub">Still need help? Talk to an expert.</p>${btn(L(CTA.discuss), 'Contact us', 'rv')}</div>
  ${faqList(FAQ)}
</div>`);

const postHref = (L, b) => L(`blogs/${b.slug}/`);
const blogs = L => hero(L, {
  kick: 'News', title: 'Latest News',
  sub: 'Thoughts from our team on building mobile and web applications.',
  trail: [['Home', ''], ['Blogs']],
}) + sec('white', `<div class="bgrid">${BLOG.map(b => `<article class="bcard rv">
    <a class="bimg" href="${postHref(L, b)}" aria-label="${esc(b.title)}"><img src="/media/${b.img}" alt="" loading="lazy"></a>
    <div class="bbody">
      <div class="cap"><span>${esc(b.date)}</span> · <span>${esc(b.category)}</span></div>
      <h2 class="t3"><a href="${postHref(L, b)}">${esc(b.title)}</a></h2>
      <p class="tx">${esc(b.excerpt)}</p>
      ${btn(postHref(L, b), 'Read more')}
    </div>
  </article>`).join('')}</div>`);

const post = (L, b) => hero(L, {
  kick: b.category, title: b.title,
  trail: [['Home', ''], ['Blogs', 'blogs/'], ['Details']],
}) + sec('white', `<article class="article">
    <div class="cap art-meta rv"><span>${esc(b.date)}</span> · <span>By ${esc(b.author)}</span></div>
    <img class="art-img rv" src="/media/${b.img}" alt="" loading="lazy">
    ${b.body.map(([t, x]) => (t === 'h3' ? `<h2 class="t3 rv">${esc(x)}</h2>` : `<p class="tx rv">${esc(x)}</p>`)).join('')}
    <div class="btn-row rv">${btn(L(CTA.discuss), 'Discuss your project')}${btn(L('blogs/'), 'All news')}</div>
  </article>`);

// This static site has no server, so a form hands its message to the visitor's email app. Not everyone has one
// set up, so the panel always offers another way to send it.
const sentPanel = () => `<div class="sent wide" hidden tabindex="-1">
    <h3 class="t4">Almost there: your message is ready</h3>
    <p class="sm">Your email app should have opened with everything filled in. Press send there and it reaches our team.</p>
    <p class="sm">If it didn’t open, use one of these:</p>
    <div class="btn-row">
      <a class="btn roll" data-gmail href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=${CONTACT.email}" target="_blank" rel="noopener">${roll('Send with Gmail')}<b>↗</b></a>
      <button class="btn roll" type="button" data-copy-message>${roll('Copy message')}<b>⧉</b></button>
    </div>
    <p class="sm">Or reach us directly: <a class="ulink" href="mailto:${CONTACT.email}">${CONTACT.email}</a> · <a class="ulink" href="tel:${CONTACT.tel}">${CONTACT.phone}</a></p>
  </div>`;

const field = (label, control, cls = '') => `<label class="fld ${cls}"><span class="fld-l">${label}</span>${control}</label>`;

const bookCall = L => hero(L, {
  kick: 'Free call', title: 'Book a free call',
  sub: 'Talk to our team about your project. Call us now, or tell us when suits you and we will call you.',
  trail: [['Home', ''], ['Contact', 'contact/'], ['Book a free call']],
  extra: `<div class="btn-row ph-cta rv"><a class="btn roll" href="tel:${CONTACT.tel}">${roll(`Call ${CONTACT.phone}`)}<b>→</b></a>${btn(L(CTA.call), 'Request a call')}</div>`,
}) + sec('dark', `<div class="bk" id="request">
  <div class="bk-side">
    <div class="cap rv">Call us now</div>
    <a class="t2 bk-tel rv" href="tel:${CONTACT.tel}">${CONTACT.phone}</a>
    <p class="sm rv">${esc(CONTACT.hours)}<br>${esc(CONTACT.city)}</p>
    <button class="btn roll rv" type="button" data-copy="${CONTACT.phone}">${roll('Copy number')}<b>⧉</b></button>
  </div>
  <form class="cform bk-form rv" id="bkform" data-mail data-subject="Free call request" novalidate>
    <h2 class="t3 wide">Or tell us when to call you</h2>
    ${field('Name', '<input name="name" type="text" placeholder="Enter Name" autocomplete="name" required>')}
    ${field('Phone', '<input name="phone" type="tel" placeholder="Enter Phone" autocomplete="tel" required pattern="[0-9+\\(\\)\\s\\-]{7,}" title="Please enter a phone number we can call">')}
    ${field('Email (optional)', '<input name="email" type="email" placeholder="Enter Email" autocomplete="email">')}
    ${field('What is it about?', `<select name="topic"><option value="">Select a service</option>${SERVICES.map(s => `<option>${esc(s.title)}</option>`).join('')}<option>Something else</option></select>`)}
    ${field('Preferred day', '<input name="day" type="date">')}
    ${field('Preferred time', '<select name="time"><option value="">Any time</option><option>Morning (8:00 – 12:00)</option><option>Afternoon (12:00 – 4:00)</option><option>Evening (4:00 – 6:30)</option></select>')}
    ${field('Anything we should know? (optional)', '<textarea name="message" rows="3" placeholder="Enter Message"></textarea>', 'wide')}
    <div class="cform-foot wide"><button class="btn roll bk-go" type="submit">${roll('Request my call')}<b>→</b></button></div>
    ${sentPanel()}
  </form>
</div>`) + sec('light', `<div class="split">
  <div><h2 class="t2 rv">Questions</h2><p class="sm rv kf-sub">Common things people ask before a first call.</p>${btn(L('faq/'), 'All questions', 'rv')}</div>
  ${faqList([FAQ[1], FAQ[4], FAQ[5]], 'bfaq')}
</div>`);

const contact = L => hero(L, {
  kick: 'Need any help?', title: 'Get in touch with us',
  sub: 'Tell us about your project. Our team will be happy to help.',
  trail: [['Home', ''], ['Contact']],
}) + sec('dark', `<div class="center" id="discuss"><div class="cap rv">Send us email</div><h2 class="t2 rv cf-t">Feel free to write</h2></div>
<form class="cform rv" id="cform" data-mail data-subject="Website enquiry" novalidate>
  <label class="fld"><span class="vh">Name</span><input name="name" type="text" placeholder="Enter Name" autocomplete="name" required></label>
  <label class="fld"><span class="vh">Email</span><input name="email" type="email" placeholder="Enter Email" autocomplete="email" required></label>
  <label class="fld"><span class="vh">Subject</span><input name="subject" type="text" placeholder="Enter Subject"></label>
  <label class="fld"><span class="vh">Phone</span><input name="phone" type="tel" placeholder="Enter Phone" autocomplete="tel"></label>
  <label class="fld wide"><span class="vh">Message</span><textarea name="message" rows="5" placeholder="Enter Message" required></textarea></label>
  <div class="cform-foot wide">
    <button class="btn roll" type="submit">${roll('Send message')}<b>→</b></button>
    <button class="btn roll" type="reset">${roll('Reset')}<b>×</b></button>
  </div>
  ${sentPanel()}
</form>
<div class="cf-or cap rv">or</div>
<a class="cf-call rv" href="${L(CTA.call)}"><span class="btnm">${roll('Book a free call')}</span></a>
<p class="sm center cf-mail rv">Prefer email? <a class="ulink" href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>`) + sec('light', `<div class="ct-grid">
  <div class="rv"><h2 class="t2">Location</h2><p class="sm">${esc(BRAND)}<br>${esc(CONTACT.city)}<br>${esc(CONTACT.hours)}</p></div>
  <div class="ct-cols">
    <div class="rv"><div class="cap dim">Have any question?</div><a class="t3" href="tel:${CONTACT.tel}">${CONTACT.phone}</a></div>
    <div class="rv"><div class="cap dim">Write email</div><a class="t3" href="mailto:${CONTACT.email}">${CONTACT.email}</a></div>
  </div>
</div>
${hrPlus()}
<div class="split">
  <div><h2 class="t2 rv">Questions</h2><p class="sm rv kf-sub">Common things people ask before we begin.</p>${btn(L('faq/'), 'All questions', 'rv')}</div>
  ${faqList(FAQ.slice(1, 5), 'cfaq')}
</div>`);

const notFound = L => `<section class="ph ph-404" data-theme="dark">
  <div class="ph-art" aria-hidden="true"></div>
  <div class="ph-body">
    <div class="cap ph-kick"><span class="ic">✦</span> Error 404</div>
    <h1 class="t1 ph-t" data-split>This page could not be found</h1>
    <div class="btn-row ph-cta">${btn(L(''), 'Back to home')}${btn(L('contact/'), 'Contact us')}</div>
  </div>
</section>`;

/* ---------- route table ---------- */
export const routes = {
  'about/': { ...SEO['about/'], active: 'about/', id: 'about', body: about },
  'services/': { ...SEO['services/'], active: 'services/', id: 'services', body: services },
  'projects/': { ...SEO['projects/'], active: 'projects/', id: 'projects', body: projects },
  'team/': { ...SEO['team/'], active: 'team/', id: 'team', body: team },
  'pricing/': { ...SEO['pricing/'], active: 'pricing/', id: 'pricing', body: pricing },
  'testimonials/': { ...SEO['testimonials/'], active: 'testimonials/', id: 'testimonials', body: testimonials },
  'faq/': { ...SEO['faq/'], active: 'faq/', id: 'faq', body: faq },
  'blogs/': { ...SEO['blogs/'], active: 'blogs/', id: 'blogs', body: blogs },
  'book-a-call/': { ...SEO['book-a-call/'], active: 'contact/', id: 'book', body: bookCall },
  'contact/': { ...SEO['contact/'], active: 'contact/', id: 'contact', body: contact },
};
SERVICES.forEach((s, i) => {
  routes[`services/${s.slug}/`] = { ...SEO.services[s.slug], active: 'services/', id: 'service', body: L => service(L, s, i) };
});
PROJECTS.forEach((p, i) => {
  routes[`projects/${p.slug}/`] = { ...SEO.project(p), active: 'projects/', id: 'project', body: L => project(L, p, i) };
});
BLOG.forEach(b => {
  routes[`blogs/${b.slug}/`] = { title: b.seoTitle || b.title, active: 'blogs/', id: 'post', desc: b.excerpt, body: L => post(L, b) };
});
export const NOT_FOUND = { title: 'Page not found', active: '', id: 'notfound', desc: 'This page could not be found.', body: notFound };

export const renderRoute = (route, base) => {
  const r = route === '404' ? NOT_FOUND : routes[route];
  const L = p => `${base}${p}`;
  return shell({ base, title: r.title, desc: r.desc, path: route === '404' ? '' : route, index: route !== '404', active: r.active, id: r.id, body: r.body(L) });
};
