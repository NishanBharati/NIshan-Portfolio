/**
 * GitHub Pages post-build step. Run after `npm run build`; only the Pages deploy workflow uses it.
 *
 * GitHub Pages has no rewrites (vercel.json / public/_redirects are ignored), so this:
 *   - writes dist/CNAME (custom domain, from src/config/site.ts via the prerendered robots.txt) and .nojekyll
 *   - makes dist/404.html, which Pages serves for every unknown URL, act as the fallback:
 *       /admin/<route>  -> stashes the path, loads /admin/, which restores it before the router starts
 *       /blog/<slug>    -> clears the prerendered 404 markup so the app client-renders the post
 *                          (posts published after the last build, until the next deploy prerenders them)
 *   - copies blog.html to blog/index.html in case Pages resolves /blog to the blog/ directory
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const read = (file) => fs.readFile(path.join(dist, file), 'utf8');
const write = (file, data) => fs.writeFile(path.join(dist, file), data);

const robots = await read('robots.txt');
const sitemapLine = robots.match(/^Sitemap:\s*(\S+)/m);
if (!sitemapLine) throw new Error('gh-pages: no Sitemap line in dist/robots.txt; cannot derive the domain');
const host = new URL(sitemapLine[1]).host;

await write('CNAME', `${host}\n`);
await write('.nojekyll', '');

const notFoundFallback = `<script>(function(){var p=location.pathname;
if(/^\\/admin\\//.test(p)){try{sessionStorage.setItem('ghp-admin',p+location.search+location.hash)}catch(e){}location.replace('/admin/');return}
if(/^\\/blog\\/[^/]+\\/?$/.test(p)){var r=document.getElementById('root');if(r)r.innerHTML=''}})();</script>`;
const notFound = await read('404.html');
if (!notFound.includes('</body>')) throw new Error('gh-pages: dist/404.html has no </body>');
await write('404.html', notFound.replace('</body>', `${notFoundFallback}\n</body>`));

const adminRestore = `<script>(function(){try{var p=sessionStorage.getItem('ghp-admin');if(p){sessionStorage.removeItem('ghp-admin');history.replaceState(null,'',p)}}catch(e){}})();</script>`;
const admin = await read('admin/index.html');
if (!admin.includes('</head>')) throw new Error('gh-pages: dist/admin/index.html has no </head>');
await write('admin/index.html', admin.replace('</head>', `${adminRestore}\n</head>`));

await fs.mkdir(path.join(dist, 'blog'), { recursive: true });
await fs.copyFile(path.join(dist, 'blog.html'), path.join(dist, 'blog', 'index.html'));

console.log(`gh-pages: CNAME=${host}, 404 fallback for /admin/* and /blog/*, blog/index.html`);
