import { existsSync } from 'node:fs';
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

/**
 * Client build: index.html + admin/index.html. SSR build (`vite build --ssr src/entry-server.tsx`):
 * a Node bundle used only at build time by scripts/prerender.mjs, which also writes sitemap.xml,
 * robots.txt and llms.txt from src/config/site.ts (the single canonical-origin constant).
 */
const config = (isSsrBuild: boolean): UserConfig => ({
  plugins: [react(), adminSpaFallback()],
  define: {
    // CV links render only once the PDF is actually in public/, so the site never links to a 404.
    __CV_AVAILABLE__: JSON.stringify(existsSync(fileURLToPath(new URL('./public/Nishan-Bharati-CV.pdf', import.meta.url)))),
  },
  build: {
    rollupOptions: {
      input: isSsrBuild
        ? undefined
        : {
            main: fileURLToPath(new URL('./index.html', import.meta.url)),
            admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)),
          },
      output: isSsrBuild
        ? undefined
        : {
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

export default defineConfig(({ mode, isSsrBuild }) => {
  assertPublicSupabaseKey(mode);
  return config(Boolean(isSsrBuild));
});
