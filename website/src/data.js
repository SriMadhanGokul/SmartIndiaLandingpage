// All SMARTINDIA.DIGITAL copy and facts, shared by the homepage scripts (browser) and the page templates (build).
// Plain data only: no browser or build APIs, so both sides can import it. Paths are relative to the site root.
//
// Content rule: SEO and marketing (social media marketing, Meta & Google ads) are not offered here. Real client
// quotes are never reworded to fit; a quote about those services is left out instead.

// The S mark: three beams forming a squared "S" (top L, middle bar, bottom L), in mark units (~±1.2).
export const MARK = [
  [[-1, 1.2], [1.1, 1.2], [.9, .86], [-.66, .86], [-.66, .22], [-1, .02]],
  [[-.58, .17], [.76, .17], [.58, -.17], [-.76, -.17]],
  [[1, -1.2], [-1.1, -1.2], [-.9, -.86], [.66, -.86], [.66, -.22], [1, -.02]],
];
// Chisel paths used to draw each piece onto the stone (centre lines, in drawing order).
export const MARK_PATHS = [
  [[1.0, 1.03], [-.83, 1.03], [-.83, .1]],
  [[-.76, 0], [.76, 0]],
  [[-1.0, -1.03], [.83, -1.03], [.83, -.1]],
];
export const markSVG = (size, fill) => {
  const s = size / 2.6, o = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">${MARK.map(p => `<path d="M${p.map(([x, y]) => `${(o + x * s).toFixed(1)} ${(o - y * s).toFixed(1)}`).join(' L')} Z" fill="${fill}"/>`).join('')}</svg>`;
};

export const BRAND = 'SMARTINDIA.DIGITAL';
export const TAGLINE = 'Mobile and web applications and brands built for reach, growth and impact.';
export const CONTACT = {
  email: 'info@smartindia.ai', phone: '+91 99949 00470', tel: '+919994900470',
  city: 'Tirupur, Tamil Nadu, India', hours: 'Mon – Sat 8:00 – 6:30',
};
// Laravel enquiry route on the live site (contact form posts name, email, subject, phone, message).
export const ENQUIRY_URL = '/contact/store';
// The two main calls to action land directly on their forms.
export const CTA = { discuss: 'contact/#discuss', call: 'book-a-call/#request' };
export const NAV = [
  ['Home', ''], ['About', 'about/'], ['Services', 'services/'], ['Portfolio', 'projects/'], ['Team', 'team/'],
  ['Pricing', 'pricing/'], ['Testimonials', 'testimonials/'], ['FAQ', 'faq/'], ['Blogs', 'blogs/'], ['Contact', 'contact/'],
];
// The client's existing site has no social URLs yet ("#"); fill these in when available.
export const SOCIAL = [['Instagram', '#'], ['Facebook', '#'], ['LinkedIn', '#'], ['Twitter', '#']];

/* ---------- homepage ---------- */
export const HERO = {
  line1: 'Designed to',
  fixed: 'grow your ',
  words: ['business.', 'brand.', 'reach.', 'impact.'],
  est: 'Est. Tirupur',
  years: '15+ years in<br>digital service.',
  blurb: TAGLINE,
  hold: 'Scroll to <span class="ic">✸</span> explore',
  dare: 'Dare <span class="ic">⚡</span> to grow your brand.',
};
export const ABOUT = {
  text: 'SMARTINDIA.DIGITAL is a creative digital agency crafting high-impact brand experiences through strategy, design, and technology.',
  left: 'Creativity meets strategy.<br>Design. Develop. Deliver.<br>Built to grow.',
  mission: 'Our mission is to help startups and established brands grow, with mobile and web applications that attract, engage and convert.',
  focus: 'Tailored solutions.<br>Seamless execution.',
};
export const MARQUEE = ['DESIGN', 'DEVELOP', 'DELIVER'];
export const LOADER_LABELS = ['Inspire', 'Innovate', 'Impact'];
export const FACTS = [
  { label: 'Satisfied clients', text: 'Clients returning to us<br>again and again.', value: 92, suffix: '%', img: 'about-1-1.webp' },
  { label: 'Happy customers', text: '4.8/5 average rating from<br>5k+ customer reviews.', value: 300, suffix: '+' },
  { label: 'Years in digital service', text: 'Different skills.<br>One standard.', value: 15, suffix: '+', img: 'choose-us-1-1.webp' },
];
export const CLIENTS = [
  ['FashionNova', 'font-family:Georgia,serif;font-style:italic;font-weight:700'],
  ['TechSolutions', 'font-weight:700;letter-spacing:-.04em'],
  ['GreenGrocer', 'font-weight:500;letter-spacing:.06em;font-size:.9em'],
  ['CHEN REAL ESTATE', 'font-weight:400;letter-spacing:.2em;font-size:.62em'],
  ['Capterra ★ 4.8', 'font-weight:600'],
];
export const SERVICES_WORDS = ['DESIGN', 'MOBILE & WEB', 'APPLICATION', 'DEVELOPMENT'];
export const RIBBON = ['about-1-1.webp', 'T:2026', 'project1-1.webp', 'video-1-1.webp', 'object.webp', 'T:SMART®', 'choose-us-1-1.webp', 'project1-3.webp', 'aihero.webp', 'T:DESIGN', 'contact-1-1.webp', 'object3.webp',
  'project1-2.webp', 'news-1-1.webp', 'object2.webp', 'about-1-2.webp', 'T:APPS', 'service-bg-1-1.webp', 'T:CONVERT', 'team-bg-1-1.webp', 'T:TIRUPUR', 'choose-us-1-1.webp', 'object2.webp', 'contact-1-1.webp'];
export const FOOTER = {
  kicker: 'Let’s build what inspires.',
  heading: 'Ready to build something bold?',
};

/* ---------- services (copy from the client's service pages, plus Web Application Development) ---------- */
export const ICON = {
  squares: '<rect x="4" y="4" width="72" height="72"/><rect x="14" y="14" width="52" height="52"/><rect x="24" y="24" width="32" height="32"/><rect x="34" y="34" width="12" height="12"/>',
  phone: '<rect x="20" y="4" width="40" height="72" rx="8"/><rect x="27" y="12" width="26" height="52" rx="3"/><circle cx="40" cy="69" r="2.5"/>',
  webapp: '<rect x="4" y="12" width="72" height="56" rx="4"/><line x1="4" y1="26" x2="76" y2="26"/><circle cx="12" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="M31 38 L22 47 L31 56"/><path d="M49 38 L58 47 L49 56"/><line x1="44" y1="35" x2="36" y2="59"/>',
  spiral: '<path d="M40 40 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 1 1 12 12 a18 18 0 1 1 -18 -18 a24 24 0 1 1 24 24 a30 30 0 1 1 -30 -30"/>',
};
export const SERVICES = [
  {
    slug: 'app-development', title: 'Mobile Application Development', titleBr: 'Mobile Application<br>Development', icon: 'phone',
    short: 'Powerful and intuitive mobile applications for iOS and Android with seamless user journeys.',
    overviewTitle: 'Mobile Application Development Overview',
    overview: [
      'In a mobile-first world, having a robust application is essential for business growth and customer engagement. SMARTINDIA.DIGITAL specializes in developing intuitive, high-performance mobile apps for both iOS and Android platforms. Our goal is to create seamless digital experiences that provide real value to your users.',
      'From initial concept and UI/UX design to development, testing, and App Store deployment, we handle the entire lifecycle of your application. We focus on performance, security, and scalability to ensure your app can handle growth and provide a consistent experience as your user base expands.',
    ],
    listTitle: 'Our App Solutions',
    listIntro: 'We build apps that are tailored to your specific business requirements, whether you need a consumer-facing product or an internal enterprise tool.',
    list: ['iOS & Android Native Development', 'Cross-Platform Solutions (Flutter, React Native)', 'UI/UX Design for Mobile', 'API Integration & Backend Development'],
    related: ['techsolutions-mobile-app'],
  },
  {
    slug: 'web-application-development', title: 'Web Application Development', titleBr: 'Web Application<br>Development', icon: 'webapp',
    short: 'Custom, scalable web applications built from scratch with modern technologies like Laravel and React.',
    overviewTitle: 'Web Application Development Overview',
    overview: [
      'Your web application should work as hard as your business does. At SMARTINDIA.DIGITAL, we specialize in building custom, scalable solutions from scratch using modern technologies like Laravel and React to ensure high performance and unique branding.',
      'From initial concept and UI/UX design to development, testing, and deployment, we handle the entire lifecycle of your application. Our development process is collaborative, ensuring your vision is brought to life with precision and care, and we focus on performance, security, and scalability so it can grow with your business.',
    ],
    listTitle: 'Our Web Application Solutions',
    listIntro: 'We build web applications tailored to your specific business requirements, from initial design to final deployment and maintenance.',
    list: ['Custom Web Applications (Laravel, React)', 'E-commerce Solutions (Shopify, WooCommerce)', 'API Integration & Backend Development', 'Long-Term Support & Maintenance'],
    related: ['theera-books', 'tejaswini-kerala-ayurvedam'],
  },
  {
    slug: 'web-development', title: 'Website Development', titleBr: 'Website<br>Development', icon: 'squares',
    short: 'Custom, responsive, high-performance websites tailored to your business.',
    overviewTitle: 'Website Development Overview',
    overview: [
      'Your website is the digital storefront of your business. At SMARTINDIA.DIGITAL, we build high-performance, secure, and scalable websites that not only look stunning but are also optimized for user experience and conversions. From simple landing pages to complex e-commerce platforms, we deliver solutions that grow with your business.',
      'We use the latest technologies and frameworks to ensure your site is fast, responsive across all devices, and easy to manage. Our development process is collaborative, ensuring your vision is brought to life with precision and care.',
    ],
    listTitle: 'Our Development Capabilities',
    listIntro: 'We specialize in a wide range of web technologies and offer comprehensive services from initial design to final deployment and maintenance.',
    list: ['Custom Corporate Websites', 'E-commerce Solutions (Shopify, WooCommerce)', 'CMS Development (WordPress, Custom)', 'Web Application Development'],
    related: ['svs-future-power', 'upgrade-educational-consultancy'],
  },
  {
    slug: 'graphic-designing', title: 'Graphic Designing', titleBr: 'Graphic<br>Designing', icon: 'spiral',
    short: 'Logos, posters and visual identities that capture your brand’s essence.',
    overviewTitle: 'Graphic Designing Overview',
    overview: [
      'Visual identity is a powerful way to communicate your brand’s personality and values. At SMARTINDIA.DIGITAL, we create stunning graphics that capture attention and leave a lasting impression. Whether you need a professional logo, eye-catching posters, or digital visuals, our designs are crafted to make your brand stand out.',
      'We combine creativity with strategic thinking to ensure that every visual element aligns with your brand goals. Our designers work closely with you to understand your vision and translate it into compelling designs that resonate with your target audience across all platforms.',
    ],
    listTitle: 'Our Design Solutions',
    listIntro: 'We offer a full suite of graphic design services to cover all your branding needs.',
    list: ['Professional Logo Design & Branding', 'Posters & Post Graphics', 'Print Media (Flyers, Brochures, Business Cards)', 'Custom Illustrations & Infographics'],
    related: [],
  },
];

/* ---------- portfolio ---------- */
// The six web projects, clients, durations and links come from the client's portfolio. Their one-line descriptions
// are written from each client site's own title. The mobile project comes from Rajesh Kumar's testimonial.
export const PROJECTS = [
  { slug: 'svs-future-power', name: 'SVS Future Power', client: 'Selvaraj Vinoth', duration: '2 days', platform: 'Dynamic Website', group: 'web', url: 'https://svsfuturepower.in/', img: 'projects/svs-future-power.webp', logo: 'logos/svs-future-power.webp', overlay: 'Go solar.', text: 'A dynamic website for a solar energy company.' },
  { slug: 'paakhi-jewels', name: 'Paakhi Jewels', client: 'Bhavik Vyas', duration: '4 days', platform: 'E-Commerce', group: 'web', url: 'https://paakhijewels.com/', overlay: 'Paakhi Jewels.', text: 'An e-commerce store for a jewellery brand.' },
  { slug: 'tara-naturals', name: 'Tara Naturals', client: 'Arunkumar', duration: '2 days', platform: 'Dynamic Website', group: 'web', url: 'https://taranaturals.in/', img: 'projects/tara-naturals.webp', logo: 'logos/tara-naturals.webp', text: 'A dynamic website for a premium cosmetics brand.' },
  { slug: 'theera-books', name: 'Theera Books', client: 'Jayaganesh', duration: '4 days', platform: 'E-Commerce', group: 'web', url: 'https://theerabooks.com/', img: 'projects/theera-books.webp', logo: 'logos/theera-books.webp', overlay: 'Shop smarter.', text: 'An e-commerce store for an online bookstore.' },
  { slug: 'tejaswini-kerala-ayurvedam', name: 'Tejaswini Kerala Ayurvedam', client: 'Deepam Batta', duration: '4 days', platform: 'E-Commerce', group: 'web', url: 'https://tejasviniayurveda.com/', img: 'projects/tejaswini-kerala-ayurvedam.webp', logo: 'logos/tejaswini-kerala-ayurvedam.webp', overlay: 'Natural care.', text: 'An e-commerce store for an Ayurveda health care centre.' },
  { slug: 'upgrade-educational-consultancy', name: 'Upgrade Educational Consultancy', client: 'Mansii', duration: '2 days', platform: 'Dynamic Website', group: 'web', url: 'https://upgradeeducationalconsultancy.in/', img: 'projects/upgrade-educational-consultancy.webp', logo: 'logos/upgrade-educational-consultancy.webp', overlay: 'Learn anywhere.', text: 'A dynamic website for a distance and offline education partner.' },
  { slug: 'techsolutions-mobile-app', name: 'TechSolutions Mobile App', client: 'TechSolutions', platform: 'Mobile Application', group: 'mobile', img: 'project1-3.webp', overlay: 'Mobile first.', text: 'A seamless, user-friendly mobile app that earned amazing feedback from its customers.', quoteOf: 'Rajesh Kumar' },
];
export const HOME_WORK = ['theera-books', 'svs-future-power', 'techsolutions-mobile-app'];

/* ---------- people, voices, answers ---------- */
export const TEAM = [
  ['Tamil Maniyammai A.M', 'CEO & Founder'], ['Sangeeth Kumar', 'CEO & Founder'], ['Veena Virwani', 'Human Resources'],
  ['Raki', 'Sales Manager'], ['Vegi Kumar', 'Lead Developer'],
];
// Testimonials from the client's site, in the clients' own words. Avatars show initials; add `photo: 'file.webp'`
// (in public/media) once the client supplies a real photo of that person.
export const TESTIMONIALS = [
  { client: 'FashionNova', name: 'Sarah Johnson', role: 'CEO, FashionNova', quote: 'SMARTINDIA.DIGITAL transformed our online presence completely. Our sales increased by 40% within the first three months of launching the new website.' },
  { client: 'TechSolutions', name: 'Rajesh Kumar', role: 'Founder, TechSolutions', quote: 'The mobile app they developed for us is seamless and user-friendly. We’ve received amazing feedback from our customers. Highly recommend their app development services for anyone looking for quality work.' },
  { client: 'Chen Real Estate', name: 'Michael Chen', role: 'Owner, Chen Real Estate', quote: 'The branding and graphic design work provided by the team perfectly captured the luxury feel we wanted for our property listings. Professional, creative, and fast delivery.' },
];
export const RATINGS = [['Capterra', '4.8/5', '102 Reviews'], ['Google', '4.8/5', '102 Reviews']];
export const FAQ = [
  ['What services does your digital agency offer?', 'We offer a full suite of digital services including Mobile Application Development, Web Application Development, Website Development, and Graphic Design.'],
  ['How do you approach a new project?', 'Our approach starts with a discovery phase to understand your goals, followed by strategy development, design/wireframing, development, and finally, rigorous testing before launch.'],
  ['What industries do you specialize in?', 'We work across diverse industries including E-commerce, Real Estate, Healthcare, Education, and Tech Startups. Our strategies are tailored to the specific needs of each sector.'],
  ['Do you offer custom website or app development?', 'Yes, we specialize in building custom, scalable solutions from scratch using modern technologies like Laravel, React, and Flutter to ensure high performance and unique branding.'],
  ['What is your pricing model or cost structure?', 'We offer both project-based pricing and monthly retainer plans, depending on the service. Our goal is to provide high-quality results with a clear ROI for your business.'],
  ['Can you help with ongoing support and maintenance?', 'Absolutely. We provide long-term support and maintenance packages to keep your website or app updated, secure, and performing at its best after the initial launch.'],
];
export const STEPS = [
  ['Discovery', 'A discovery phase to understand your goals.'],
  ['Strategy', 'Strategy development tailored to the specific needs of your sector.'],
  ['Design', 'Design and wireframing, shaped around your users.'],
  ['Development', 'Custom, scalable builds using modern technologies like Laravel, React, and Flutter.'],
  ['Launch', 'Rigorous testing before launch, then long-term support and maintenance.'],
];
export const VALUES = [
  ['Long-Term Support', 'We provide long-term support and maintenance packages to keep your website or app updated, secure, and performing at its best after the initial launch.'],
  ['Fast Project Turnaround', 'Recent client websites in our portfolio were delivered in 2 to 4 days.'],
  ['User-Centered Design', 'Intuitive applications and interfaces that provide seamless user journeys.'],
  ['Brand Identity Creation', 'Creative logos, posters, and visual identities that capture your brand’s essence and stand out.'],
];
export const POINTS = ['Creativity Meets Strategy', 'Design. Develop. Deliver', 'Innovative Development', 'Unleashing Digital Power'];
export const INDUSTRIES = ['E-commerce', 'Real Estate', 'Healthcare', 'Education', 'Tech Startups'];
// No prices: the only plan on the old pricing page was an SEO package. Engagement models come from the FAQ.
export const PLANS = [
  { name: 'Project-based', title: 'Project-based pricing', text: 'One clear build: a mobile application, a web application, a website or a design project.', points: SERVICES.map(s => s.title) },
  { name: 'Monthly', title: 'Monthly retainer plans', text: 'Ongoing work with our team, month by month, depending on the service.', points: ['New features and improvements', 'Design support', 'One team that knows your product'] },
  { name: 'Support', title: 'Support & maintenance', text: 'Long-term packages that keep your website or app updated, secure, and performing at its best after launch.', points: ['Updates', 'Security', 'Performance'] },
];
export const BLOG = [
  {
    slug: 'future-of-mobile-and-web-application-development',
    title: 'The Future of Mobile and Web Application Development',
    seoTitle: 'The Future of Mobile & Web Applications',
    date: '25 Apr', author: 'Admin', category: 'Digital Agency', img: 'news-1-1.webp',
    excerpt: 'Mobile and web application development is evolving rapidly with AI and personalized experiences leading the way.',
    body: [
      ['p', 'Mobile and web application development is evolving rapidly with AI and personalized experiences leading the way.'],
      ['p', 'In a mobile-first world, having a robust application is essential for business growth and customer engagement. The tools keep changing, but the goal stays the same: seamless digital experiences that provide real value to your users.'],
      ['h3', 'What matters most'],
      ['p', 'Your website is the digital storefront of your business, and the applications behind it have to keep up. Performance, security, and scalability decide whether an application can handle growth and provide a consistent experience as its user base expands.'],
      ['h3', 'How we approach it'],
      ['p', 'We build custom, scalable solutions from scratch using modern technologies like Laravel, React, and Flutter. Every project starts with a discovery phase to understand your goals, followed by strategy development, design and wireframing, development, and rigorous testing before launch.'],
      ['p', 'After launch, long-term support and maintenance keep your website or app updated, secure, and performing at its best.'],
    ],
  },
];

/* ---------- search listings ----------
   Titles: the brand is added after them on inner pages, so keep them to 39 characters (60 with the brand).
   Descriptions: keep them to 160 characters, with the words people search for near the start. */
export const SEO = {
  home: {
    title: `${BRAND} – Web & Mobile Application Studio`,
    desc: `${BRAND} designs and builds web applications and mobile applications from Tirupur. Compare packages, what is included, and send a project enquiry.`,
  },
  'about/': { title: 'About Our Digital Agency in Tirupur', desc: `${BRAND} is a creative digital agency in Tirupur. We design and build mobile apps, web applications and websites that help businesses grow.` },
  'services/': { title: 'Web & Mobile App Development Services', desc: `Mobile app development, web application development, website development and graphic designing services in Tirupur from ${BRAND}.` },
  'projects/': { title: 'Web & App Development Projects', desc: `See the websites, online stores and mobile apps ${BRAND} has built for clients: web and mobile app development from our Tirupur studio.` },
  'team/': { title: 'Our Team of Developers & Designers', desc: `Meet the team at ${BRAND}, the Tirupur digital agency behind custom mobile apps, web applications and websites.` },
  'pricing/': { title: 'Web & App Development Pricing', desc: `Web and mobile app development pricing from ${BRAND} in Tirupur: project-based quotes, monthly retainers, and support and maintenance plans.` },
  'testimonials/': { title: 'Client Testimonials', desc: `Read what clients say about working with ${BRAND}, a Tirupur digital agency for website, web application and mobile app development.` },
  'faq/': { title: 'Web & App Development FAQs', desc: `Answers to common questions about web and mobile app development at ${BRAND}: our services, process, pricing and ongoing support.` },
  'blogs/': { title: 'Web & Mobile App Development News', desc: `News and ideas from the ${BRAND} team on web application development, mobile app development and building digital products.` },
  'book-a-call/': { title: 'Book a Free Project Call', desc: `Book a free call with ${BRAND} about your website, web application or mobile app project. Call ${CONTACT.phone} or choose a time.` },
  'contact/': { title: 'Contact Our Tirupur Digital Agency', desc: `Contact ${BRAND}, a web and mobile app development company in Tirupur. Call ${CONTACT.phone} or email ${CONTACT.email}.` },
  services: {
    'app-development': { title: 'Mobile App Development in Tirupur', desc: `Mobile app development in Tirupur: ${BRAND} builds intuitive iOS and Android applications with seamless user journeys for your business.` },
    'web-application-development': { title: 'Web Application Development in Tirupur', desc: `Custom web application development in Tirupur: scalable web apps built from scratch with modern technologies like Laravel and React.` },
    'web-development': { title: 'Website Development in Tirupur', desc: `Website development in Tirupur: custom, responsive, high-performance websites tailored to your business, designed and built by ${BRAND}.` },
    'graphic-designing': { title: 'Graphic Designing in Tirupur', desc: `Graphic designing in Tirupur: logos, posters and visual identities that capture your brand’s essence, created by the ${BRAND} team.` },
  },
  project: p => ({ title: `${p.name} Project`, desc: `${p.text} Built by ${BRAND}, a web and mobile app company in Tirupur.` }),
};
