import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type Connect, type Plugin, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The admin panel is a separate entry (admin/index.html) so AdminLTE/Bootstrap CSS never
 * mixes with the public site's Tailwind CSS. This sends every /admin/* route to that entry
 * in `vite dev` and `vite preview` (production hosts use vercel.json / public/_redirects).
 */
const adminFallback: Connect.NextHandleFunction = (req, _res, next) => {
  if (req.url && /^\/admin(\/[^.?]*)?(\?.*)?$/.test(req.url)) {
    req.url = '/admin/index.html';
  }
  next();
};

const adminSpaFallback = (): Plugin => ({
  name: 'admin-spa-fallback',
  configureServer(server) {
    server.middlewares.use(adminFallback);
  },
  configurePreviewServer(server) {
    server.middlewares.use(adminFallback);
  },
});

/** Canonical origin; keep in sync with PROFILE.siteUrl, index.html and public/robots.txt. */
const SITE_URL = 'https://nishanbharati.com.np';

/**
 * Writes sitemap.xml at build time: the static pages plus every published blog post, read
 * through Supabase's public REST API with the anon key (RLS only exposes published posts).
 * If Supabase isn't configured or reachable, the static pages are still listed.
 */
const sitemap = (mode: string): Plugin => ({
  name: 'sitemap',
  apply: 'build',
  async generateBundle() {
    const today = new Date().toISOString().slice(0, 10);
    const entries: { loc: string; lastmod: string; priority: string }[] = [
      { loc: '/', lastmod: today, priority: '1.0' },
      { loc: '/blog', lastmod: today, priority: '0.8' },
    ];

    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        const headers: Record<string, string> = { apikey: key };
        if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
        const res = await fetch(
          `${url}/rest/v1/posts?select=slug,updated_at&status=eq.published&order=published_at.desc`,
          { headers },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const posts = (await res.json()) as { slug: string; updated_at: string }[];
        for (const post of posts) {
          entries.push({ loc: `/blog/${encodeURIComponent(post.slug)}`, lastmod: post.updated_at.slice(0, 10), priority: '0.6' });
        }
      } catch (error) {
        this.warn(`sitemap: could not load blog posts from Supabase (${String(error)}); listing static pages only`);
      }
    }

    const body = entries
      .map(
        (e) =>
          `  <url>\n    <loc>${SITE_URL}${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <priority>${e.priority}</priority>\n  </url>`,
      )
      .join('\n');
    this.emitFile({
      type: 'asset',
      fileName: 'sitemap.xml',
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    });
  },
});

/**
 * VITE_* values are inlined into the public JavaScript bundle. Refuse to run if a Supabase
 * secret / service_role key was put there by mistake: it would bypass every RLS policy.
 */
function assertPublicSupabaseKey(mode: string) {
  const key = loadEnv(mode, process.cwd(), 'VITE_').VITE_SUPABASE_ANON_KEY ?? '';
  let isServiceRoleJwt = false;
  if (key.startsWith('eyJ')) {
    try {
      isServiceRoleJwt = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'service_role';
    } catch {
      /* not a decodable JWT: leave it to Supabase to reject */
    }
  }
  if (key.startsWith('sb_secret_') || isServiceRoleJwt) {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY contains a Supabase SECRET key. Use the anon / publishable key instead ' +
        '(Supabase Dashboard -> Project Settings -> API Keys), and rotate the secret key.',
    );
  }
}

const config = (mode: string): UserConfig => ({
  plugins: [react(), adminSpaFallback(), sitemap(mode)],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)),
      },
      output: {
        // Long-lived vendor chunks; the Markdown stack only loads on article pages and in the admin.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/](react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)[\\/]/.test(id)) return 'react';
          if (id.includes('@supabase')) return 'supabase';
          if (/[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
          if (
            /[\\/](react-markdown|remark-[^\\/]+|mdast-[^\\/]+|micromark[^\\/]*|unified|unist-[^\\/]+|hast-[^\\/]+|vfile[^\\/]*|devlop|bail|trough|is-plain-obj|zwitch|longest-streak|markdown-table|ccount|escape-string-regexp|trim-lines|html-url-attributes|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities[^\\/]*|estree-util-[^\\/]+|style-to-[^\\/]+|inline-style-parser)[\\/]/.test(
              id,
            )
          ) {
            return 'markdown';
          }
          return undefined;
        },
      },
    },
  },
});

export default defineConfig(({ mode }) => {
  assertPublicSupabaseKey(mode);
  return config(mode);
});
