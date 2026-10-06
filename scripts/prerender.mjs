/**
 * Build-time static site generation (SSG).
 *
 * Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx` (server bundle in
 * dist-ssr/). For every public route it renders the React app to HTML and writes a static file with
 * that page's own <head> (title, description, canonical, Open Graph, JSON-LD), so crawlers, AI bots
 * and social previews get full content without running JavaScript. The browser then hydrates it.
 *
 * Output (served with clean URLs; see vercel.json / public/_redirects):
 *   dist/index.html            /
 *   dist/blog.html             /blog
 *   dist/blog/<slug>.html      /blog/<slug>   (every published post at build time)
 *   dist/404.html              any unknown URL (served with HTTP 404 by Vercel and Netlify)
 *   dist/_spa.html             empty shell for /blog/<slug> published after the last build
 *   dist/sitemap.xml, robots.txt, llms.txt, llms-full.txt, humans.txt, .well-known/security.txt
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = process.cwd();
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const server = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const { render, shellHead, siteContent: site } = server;
const SITE_URL = site.PROFILE.siteUrl;

const today = new Date().toISOString().slice(0, 10);
/** Last content change: date of the latest git commit, falling back to the build date. */
const lastUpdated = (() => {
  try {
    return execSync('git log -1 --format=%cs', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || today;
  } catch {
    return today;
  }
})();

// ---------------------------------------------------------------------------------------------
// Data (Supabase REST with the public anon key; RLS only exposes published rows)
// ---------------------------------------------------------------------------------------------
const env = loadEnv('production', root, 'VITE_');
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

async function supabase(query) {
  const headers = { apikey: supabaseKey };
  if (supabaseKey.startsWith('eyJ')) headers.Authorization = `Bearer ${supabaseKey}`;
  const res = await fetch(`${supabaseUrl}/rest/v1/${query}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${query.split('?')[0]}`);
  return res.json();
}

let projects = site.FALLBACK_PROJECTS;
let posts = [];
const fullPosts = [];

if (supabaseUrl && supabaseKey) {
  try {
    const rows = await supabase(
      'projects?select=id,name,category,description,live_url,images&is_published=eq.true&order=sort_order.asc,created_at.asc',
    );
    const complete = rows.filter((p) => p.images?.tall?.src && p.images?.colTop?.src && p.images?.colBottom?.src);
    projects = complete.map(({ id, ...rest }) => ({ key: id, ...rest }));
  } catch (error) {
    console.warn(`prerender: projects unavailable (${error.message}); using built-in list`);
  }
  try {
    const now = encodeURIComponent(new Date().toISOString());
    posts = await supabase(
      `posts?select=id,title,slug,excerpt,cover_image_url,tags,published_at,reading_minutes&status=eq.published&published_at=lte.${now}&order=published_at.desc`,
    );
    for (const p of posts) {
      const [full] = await supabase(`posts?select=*&slug=eq.${encodeURIComponent(p.slug)}&status=eq.published&limit=1`);
      if (full) fullPosts.push(full);
    }
  } catch (error) {
    console.warn(`prerender: blog posts unavailable (${error.message}); blog pages render without posts`);
  }
} else {
  console.warn('prerender: Supabase not configured; using built-in projects and no blog posts');
}

// ---------------------------------------------------------------------------------------------
// HTML assembly
// ---------------------------------------------------------------------------------------------
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const assets = await fs.readdir(path.join(dist, 'assets'));
const heroFont = assets.find((f) => /^kanit-latin-900-normal-.*\.woff2$/.test(f));
const fontPreload = heroFont ? `<link rel="preload" href="/assets/${heroFont}" as="font" type="font/woff2" crossorigin />` : '';
const portraitPreload = `<link rel="preload" as="image" href="${site.hero.src}" imagesrcset="${site.hero.srcset}" imagesizes="${site.hero.sizes}" fetchpriority="high" />`;

/** JSON inside <script type="application/json">: escape "<" so content can't close the tag. */
const serializeData = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

function page({ head, html = '', data, preloads = [] }) {
  const dataScript = data
    ? `<script type="application/json" id="__INITIAL_DATA__">${serializeData(data)}</script>\n  `
    : '';
  return template
    .replace('<!--app-head-->', [head, fontPreload, ...preloads].filter(Boolean).join('\n    '))
    .replace('<!--app-html-->', html)
    .replace('</body>', `${dataScript}</body>`);
}

async function write(relPath, contents) {
  const file = path.join(dist, relPath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents, 'utf8');
}

async function renderRoute(url, kind, data, outFile, preloads) {
  const { html, head } = await render(url, kind, data);
  await write(outFile, page({ head, html, data, preloads }));
  return outFile;
}

const written = [];
written.push(await renderRoute('/', 'home', { projects, posts, lastUpdated }, 'index.html', [portraitPreload]));
written.push(await renderRoute('/blog', 'blog', { posts, lastUpdated }, 'blog.html'));
for (const post of fullPosts) {
  written.push(await renderRoute(`/blog/${post.slug}`, 'post', { post, posts, lastUpdated }, `blog/${post.slug}.html`));
}
written.push(await renderRoute('/404', 'notFound', { lastUpdated }, '404.html'));
// Fallback shell for posts published after this build (until the next deploy re-runs the prerender).
await write('_spa.html', page({ head: shellHead() }));
written.push('_spa.html');

// ---------------------------------------------------------------------------------------------
// sitemap.xml
// ---------------------------------------------------------------------------------------------
const day = (iso) => (iso ? iso.slice(0, 10) : lastUpdated);
const newestPost = fullPosts.map((p) => day(p.updated_at)).sort().at(-1);
const urls = [
  { loc: `${SITE_URL}/`, lastmod: lastUpdated },
  { loc: `${SITE_URL}/blog`, lastmod: newestPost && newestPost > lastUpdated ? newestPost : lastUpdated },
  ...fullPosts.map((p) => ({ loc: `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`, lastmod: day(p.updated_at || p.published_at) })),
];
await write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
    .join('\n')}\n</urlset>\n`,
);

// ---------------------------------------------------------------------------------------------
// robots.txt: search + answer bots and (per Nishan's decision, 2026-10-06) AI training crawlers allowed
// ---------------------------------------------------------------------------------------------
const AI_BOTS = [
  ['Search engines', ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Applebot']],
  ['AI search and answer engines (citations)', ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User']],
  ['AI model training (allowed by choice)', ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']],
];
const robots = [
  `# robots.txt for ${SITE_URL}`,
  '# Everything public is crawlable; only the admin panel is private.',
  '',
  ...AI_BOTS.flatMap(([label, bots]) => [`# ${label}`, ...bots.map((b) => `User-agent: ${b}`), 'Allow: /', 'Disallow: /admin', '']),
  '# Everyone else',
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  '',
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');
await write('robots.txt', robots);

// ---------------------------------------------------------------------------------------------
// llms.txt / llms-full.txt (https://llmstxt.org). Low-cost, unproven effect; kept in sync with content.
// ---------------------------------------------------------------------------------------------
const P = site.PROFILE;
const postUrl = (p) => `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`;
const llms = [
  `# ${P.fullName}`,
  '',
  `> ${site.WHO_IS}`,
  '',
  `${P.fullName} (${P.role}, ${P.company.name}) is based in ${P.location}. Contact: ${P.email}, ${P.phone}. This site is the canonical source for facts about ${P.fullName}; content last updated ${lastUpdated}.`,
  '',
  '## Pages',
  `- [Profile and portfolio](${SITE_URL}/): About, experience, education, skills, services, projects, FAQ and contact for ${P.fullName}.`,
  `- [Blog](${SITE_URL}/blog): ${site.BLOG_DESCRIPTION}`,
  '',
  ...(fullPosts.length ? ['## Articles', ...fullPosts.map((p) => `- [${p.title}](${postUrl(p)}): ${p.excerpt}`), ''] : []),
  '## Profiles',
  ...site.SOCIAL_LINKS.map((s) => `- [${s.label}](${s.href})`),
  `- [${P.company.name}](${P.company.href}): company website (${P.company.description})`,
  '',
  '## Optional',
  `- [Full profile in plain text](${SITE_URL}/llms-full.txt): experience, education, skills, services, projects and FAQ in one file.`,
  '',
].join('\n');
await write('llms.txt', llms);

const llmsFull = [
  `# ${P.fullName}: ${P.jobTitle}`,
  '',
  `> ${site.WHO_IS}`,
  '',
  `Last updated: ${lastUpdated}. Canonical URL: ${SITE_URL}/`,
  '',
  '## Key facts',
  `- Name: ${P.fullName}`,
  `- Role: ${P.role}`,
  `- Company: ${P.company.name} (${P.company.href}), ${P.company.description}`,
  `- Location: ${P.location}`,
  `- Email: ${P.email}`,
  `- Phone: ${P.phone}`,
  `- Profiles: ${site.SOCIAL_LINKS.map((s) => s.href).join(', ')}`,
  '',
  `## About (first-person bio from ${SITE_URL})`,
  site.ABOUT_TEXT,
  '',
  '## Experience',
  ...site.EXPERIENCE.flatMap((e) => [
    `### ${e.role}, ${e.organization}${e.period ? ` (${e.period})` : ''}${e.current ? ' [current]' : ''}`,
    `${e.type}. ${e.description}`,
    `Focus: ${e.highlights.join(', ')}.`,
    '',
  ]),
  '## Education',
  ...site.EDUCATION.map((e) => `- ${e.qualification} (${e.level}), ${e.institution}, ${e.field}${e.period ? `, ${e.period}` : ''}`),
  '',
  '## Skills',
  ...site.SKILL_GROUPS.map((g) => `- ${g.title}: ${g.skills.join(', ')}`),
  '',
  '## Services',
  ...site.SERVICES.map((s) => `- ${s.name}: ${s.description}`),
  '',
  '## Selected projects',
  ...projects.map((p) => `- ${p.name} (${p.category})${p.live_url ? `: ${p.live_url}` : ''}. ${p.description}`),
  '',
  '## Frequently asked questions',
  ...site.FAQS.flatMap((f) => [`### ${f.question}`, f.answer, '']),
  ...(fullPosts.length
    ? ['## Articles', ...fullPosts.map((p) => `- ${p.title} (${day(p.published_at)}): ${postUrl(p)}. ${p.excerpt}`), '']
    : []),
  ...(site.MENTIONS.length
    ? ['## Press and mentions', ...site.MENTIONS.map((m) => `- ${m.title}, ${m.publisher} (${m.date}): ${m.url}`), '']
    : []),
].join('\n');
await write('llms-full.txt', llmsFull);

// ---------------------------------------------------------------------------------------------
// humans.txt and security.txt
// ---------------------------------------------------------------------------------------------
await write(
  'humans.txt',
  `/* TEAM */\n  Developer: ${P.fullName}\n  Role: ${P.role}\n  Company: ${P.company.name} (${P.company.href})\n  Contact: ${P.email}\n  Location: ${P.location}\n\n/* SITE */\n  Last update: ${lastUpdated}\n  Language: English\n  Standards: HTML5, CSS3, JSON-LD (schema.org)\n  Components: React, Vite, TypeScript, Tailwind CSS, Framer Motion, Supabase\n`,
);
const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
await write(
  '.well-known/security.txt',
  `Contact: mailto:${P.email}\nExpires: ${expires}\nPreferred-Languages: en\nCanonical: ${SITE_URL}/.well-known/security.txt\n`,
);

await fs.rm(ssrDir, { recursive: true, force: true });
console.log(`prerender: wrote ${written.length} pages (${fullPosts.length} posts) + sitemap.xml (${urls.length} URLs), robots.txt, llms.txt, llms-full.txt, humans.txt, security.txt`);
