/**
 * `npm run seo:check`: static SEO gate for the prerendered build (run after `npm run build`).
 * Exits 1 on any error so it can block CI. Checks every public page in dist/ for:
 *   title, meta description, canonical, robots, exactly one <h1>, alt text, absolute og:image,
 *   valid JSON-LD (parse, @context, required properties, resolvable @id references), FAQ schema that
 *   matches visible FAQ text, internal links and #anchors that resolve, plus sitemap.xml and robots.txt.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1];
const metaContent = (html, key, by = 'name') => {
  const tag = html.match(new RegExp(`<meta[^>]*${by}="${key}"[^>]*>`, 'i'))?.[0];
  return tag ? decode(attr(tag, 'content') ?? '') : undefined;
};

const allFiles = await walk(dist);
const rel = (f) => path.relative(dist, f).split(path.sep).join('/');
const fileSet = new Set(allFiles.map(rel));
const pages = allFiles.filter((f) => f.endsWith('.html') && !rel(f).startsWith('admin/') && rel(f) !== '_spa.html' && !/^google[0-9a-f]+\.html$/.test(rel(f)));

const robotsTxt = await fs.readFile(path.join(dist, 'robots.txt'), 'utf8').catch(() => '');
const siteUrl = robotsTxt.match(/^Sitemap:\s*(https?:\/\/[^/\s]+)/m)?.[1];
if (!siteUrl) err('robots.txt', 'missing "Sitemap:" line with an absolute URL');

/** URL path a dist file is served at (clean URLs). */
const servedPath = (file) => {
  const r = rel(file);
  if (r === 'index.html') return '/';
  if (r === '404.html') return null;
  return `/${r.replace(/\.html$/, '')}`;
};

/** Does an internal path resolve to a served file? */
const resolves = (p) => {
  if (p === '/') return fileSet.has('index.html');
  const clean = p.replace(/^\//, '');
  return fileSet.has(clean) || fileSet.has(`${clean}.html`) || fileSet.has(`${clean}/index.html`);
};

const homeHtml = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const homeIds = new Set([...homeHtml.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

const REQUIRED = {
  Person: ['name', 'url'],
  Organization: ['name', 'url'],
  WebSite: ['name', 'url'],
  ProfilePage: ['mainEntity'],
  BlogPosting: ['headline', 'author', 'datePublished', 'image'],
  Blog: ['name', 'url'],
  BreadcrumbList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  ItemList: ['itemListElement'],
};

const indexable = new Set();

for (const file of pages) {
  const name = rel(file);
  const html = await fs.readFile(file, 'utf8');
  const body = html.slice(html.indexOf('<body'));

  // --- head basics
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => decode(m[1]).trim());
  if (titles.length !== 1 || !titles[0]) err(name, `expected exactly one non-empty <title>, found ${titles.length}`);
  else if (titles[0].length < 30 || titles[0].length > 65) warn(name, `title is ${titles[0].length} chars (aim for 50-60): "${titles[0]}"`);

  const description = metaContent(html, 'description');
  if (!description) err(name, 'missing meta description');
  else if (description.length < 70 || description.length > 170) warn(name, `meta description is ${description.length} chars (aim for 140-160)`);

  const robots = metaContent(html, 'robots') ?? '';
  const noindex = /noindex/i.test(robots);
  const canonicalTag = html.match(/<link[^>]*rel="canonical"[^>]*>/i)?.[0];
  const canonical = canonicalTag && attr(canonicalTag, 'href');
  const expectedPath = servedPath(file);

  if (!noindex) {
    if (!canonical) err(name, 'indexable page without <link rel="canonical">');
    else {
      if (!/^https:\/\//.test(canonical)) err(name, `canonical must be an absolute https URL: ${canonical}`);
      if (siteUrl && expectedPath) {
        const expected = expectedPath === '/' ? `${siteUrl}/` : `${siteUrl}${expectedPath}`;
        if (decodeURIComponent(canonical) !== decodeURIComponent(expected)) err(name, `canonical ${canonical} does not match served URL ${expected}`);
      }
      indexable.add(decodeURIComponent(canonical));
    }
  }

  const ogImage = metaContent(html, 'og:image', 'property');
  if (!ogImage || !/^https?:\/\//.test(ogImage)) err(name, `og:image must be absolute (got ${ogImage ?? 'none'})`);
  if (!metaContent(html, 'og:title', 'property')) err(name, 'missing og:title');
  if (!metaContent(html, 'twitter:card')) err(name, 'missing twitter:card');
  if (!/<html[^>]*\slang="[a-z-]+"/i.test(html)) err(name, 'missing <html lang>');

  // --- body
  const h1s = body.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) err(name, `expected exactly one <h1>, found ${h1s.length}`);

  for (const img of body.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\salt="/.test(img)) err(name, `<img> without alt: ${img.slice(0, 90)}`);
  }

  for (const m of body.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = decode(m[1]);
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const [p, hash] = href.split('#');
    const target = p || '/';
    if (!resolves(target)) err(name, `broken internal link: ${href}`);
    if (hash && target === '/' && !homeIds.has(hash)) err(name, `link to missing anchor: ${href}`);
  }

  // --- JSON-LD
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!noindex && blocks.length === 0) err(name, 'indexable page without JSON-LD');
  for (const raw of blocks) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      err(name, `JSON-LD does not parse: ${e.message}`);
      continue;
    }
    if (data['@context'] !== 'https://schema.org') err(name, 'JSON-LD @context must be "https://schema.org"');
    if (raw.includes('undefined') || raw.includes('"null"')) err(name, 'JSON-LD contains "undefined"/"null" text');

    const nodes = data['@graph'] ?? [data];
    const ids = new Set(nodes.map((n) => n['@id']).filter(Boolean));
    const refs = new Set();
    const collectRefs = (v) => {
      if (Array.isArray(v)) v.forEach(collectRefs);
      else if (v && typeof v === 'object') {
        const keys = Object.keys(v);
        if (keys.length === 1 && keys[0] === '@id') refs.add(v['@id']);
        else Object.values(v).forEach(collectRefs);
      }
    };
    nodes.forEach((n) => Object.entries(n).forEach(([k, v]) => k !== '@id' && collectRefs(v)));

    for (const node of nodes) {
      const type = node['@type'];
      for (const prop of REQUIRED[type] ?? []) {
        const v = node[prop];
        if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) err(name, `${type} is missing required "${prop}"`);
      }
      if (type === 'FAQPage') {
        for (const q of node.mainEntity ?? []) {
          if (q['@type'] !== 'Question' || !q.name || !q.acceptedAnswer?.text) err(name, 'FAQPage Question needs name and acceptedAnswer.text');
          if (!decode(body).includes(q.name)) err(name, `FAQ schema question not visible on page: "${q.name}"`);
          if (q.acceptedAnswer?.text && !decode(body).includes(q.acceptedAnswer.text)) err(name, `FAQ schema answer not visible on page for "${q.name}"`);
        }
      }
      if (type === 'BreadcrumbList') {
        (node.itemListElement ?? []).forEach((item, i) => {
          if (item.position !== i + 1) err(name, 'BreadcrumbList positions must be 1..n');
          if (!/^https:\/\//.test(item.item ?? '')) err(name, `BreadcrumbList item must be an absolute URL: ${item.item}`);
        });
      }
    }
    for (const ref of refs) {
      // ORG_ID lives on navyaedtech.com but is defined in our graph; any ref must be defined in this graph.
      if (!ids.has(ref)) err(name, `JSON-LD @id reference not defined in this page's graph: ${ref}`);
    }
  }
}

// --- sitemap
const sitemap = await fs.readFile(path.join(dist, 'sitemap.xml'), 'utf8').catch(() => '');
if (!sitemap.includes('<urlset')) err('sitemap.xml', 'missing or invalid');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURIComponent(m[1]));
for (const loc of locs) {
  if (siteUrl && !loc.startsWith(siteUrl)) err('sitemap.xml', `URL on a different origin: ${loc}`);
  const p = loc.slice(siteUrl?.length ?? 0) || '/';
  if (!resolves(p)) err('sitemap.xml', `URL has no matching page: ${loc}`);
  if (!indexable.has(loc)) err('sitemap.xml', `URL is not an indexable canonical page: ${loc}`);
}
for (const canonical of indexable) if (!locs.includes(canonical)) err('sitemap.xml', `indexable page missing from sitemap: ${canonical}`);
if (!/^lastmod/m.test(sitemap) && !sitemap.includes('<lastmod>')) warn('sitemap.xml', 'no <lastmod> values');

// --- robots
if (/^Disallow:\s*\/\s*$/m.test(robotsTxt)) err('robots.txt', 'contains "Disallow: /" (blocks the whole site)');
for (const f of ['llms.txt', 'site.webmanifest', 'favicon.svg', '404.html']) if (!fileSet.has(f)) err(f, 'missing from dist/');

// --- report
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\nseo:check: ${pages.length} pages, ${locs.length} sitemap URLs, ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
