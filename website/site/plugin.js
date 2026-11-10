// Vite plugin that turns the route table into real pages: dist/about/index.html, dist/services/…, and so on.
// In dev it serves them through Vite's HTML pipeline, so they behave exactly like files on disk.
import path from 'node:path';
import { renderRoute, routes } from './pages.js';
import { HERO } from '../src/data.js';
import { HOME_META, footer, head, header, menu } from './layout.js';

const slash = p => p.replace(/\\/g, '/');

// Rollup inputs for the build: the homepage file plus one virtual HTML file per route.
export function pageInputs(root) {
  const input = { index: slash(path.resolve(root, 'index.html')), 404: slash(path.resolve(root, '404.html')) };
  for (const r of Object.keys(routes)) input[r.replace(/\W+/g, '-').replace(/-$/, '')] = slash(path.resolve(root, `${r}index.html`));
  return input;
}

export function sitePages(root) {
  let base = '/';
  const byFile = new Map();
  for (const r of Object.keys(routes)) byFile.set(slash(path.resolve(root, `${r}index.html`)), r);
  byFile.set(slash(path.resolve(root, '404.html')), '404');

  // The homepage keeps its own file; shared chrome and site links are filled in here.
  const fillHome = html => html
    .replace('<!--site:head-->', head({ ...HOME_META }))
    .replace('<!--site:header-->', header(base))
    .replace('<!--site:menu-->', menu(base, ''))
    .replace('<!--site:footer-->', footer(base))
    .replace('<!--site:h1-->', `${HERO.line1}<br>${HERO.fixed}<span class="l-word">${HERO.words[0]}</span>`)
    .replace(/"~\//g, `"${base}`);

  return {
    name: 'smartindia-pages',
    enforce: 'pre',
    configResolved(c) { base = c.base; },
    resolveId(id) {
      const f = slash(id);
      if (byFile.has(f)) return f;
      return null;
    },
    load(id) {
      const f = slash(id).split('?')[0];
      if (byFile.has(f)) return renderRoute(byFile.get(f), base);
      return null;
    },
    transformIndexHtml: {
      order: 'pre',
      handler: html => (html.includes('<!--site:') ? fillHome(html) : html),
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = (req.url || '/').split('?')[0];
          const key = url.replace(/^\//, '');
          if (url !== '/' && !url.endsWith('/') && routes[`${key}/`]) {
            res.statusCode = 301; res.setHeader('Location', `${url}/`); res.end();
            return;
          }
          if (!routes[key]) { next(); return; }
          const html = await server.transformIndexHtml(url, renderRoute(key, base), req.originalUrl);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (e) { next(e); }
      });
    },
  };
}
