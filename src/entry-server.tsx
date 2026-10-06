import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Writable } from 'node:stream';
import App from './App';
import { setServerInitialData, type InitialData } from './lib/initialData';
import { BLOG_DESCRIPTION, HOME_DESCRIPTION, HOME_TITLE, blogIndexSeo, homeSeo, notFoundSeo, postSeo, renderHeadTags, type Seo } from './lib/seo';
import {
  ABOUT_TEXT,
  EDUCATION,
  EXPERIENCE,
  FALLBACK_PROJECTS,
  FAQS,
  HERO_PORTRAIT,
  HERO_PORTRAIT_SIZES,
  HERO_PORTRAIT_SRCSET,
  MENTIONS,
  PROFILE,
  SERVICES,
  SKILL_GROUPS,
  SOCIAL_LINKS,
  WHO_IS,
} from './data/content';

export { renderHeadTags };

/** Head for the SPA fallback shell (_spa.html): generic, no canonical, still indexable. */
export const shellHead = () => renderHeadTags({ title: HOME_TITLE, description: HOME_DESCRIPTION });

/**
 * Build-time server entry, compiled with `vite build --ssr` and driven by scripts/prerender.mjs.
 * It renders one route to static HTML plus its <head> tags.
 */
export type RouteKind = 'home' | 'blog' | 'post' | 'notFound';

export function seoFor(kind: RouteKind, data: InitialData): Seo {
  switch (kind) {
    case 'home':
      return homeSeo({ projects: data.projects ?? FALLBACK_PROJECTS, lastUpdated: data.lastUpdated });
    case 'blog':
      return blogIndexSeo({ posts: data.posts });
    case 'post':
      return data.post ? postSeo(data.post) : notFoundSeo('Article Not Found');
    default:
      return notFoundSeo();
  }
}

/** Renders the app for `url`, waiting for lazy routes (onAllReady) so the HTML is complete. */
export function render(url: string, kind: RouteKind, data: InitialData): Promise<{ html: string; head: string }> {
  setServerInitialData(data);
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk.toString();
        callback();
      },
      final(callback) {
        resolve({ html, head: renderHeadTags(seoFor(kind, data)) });
        callback();
      },
    });
    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady() {
          pipe(sink);
        },
        onShellError: reject,
        onError(error) {
          reject(error);
        },
      },
    );
  });
}

/** Site facts for llms.txt / llms-full.txt, so those files never drift from the visible content. */
export const siteContent = {
  PROFILE,
  WHO_IS,
  ABOUT_TEXT,
  FAQS,
  EDUCATION,
  EXPERIENCE,
  SERVICES,
  SKILL_GROUPS,
  SOCIAL_LINKS,
  MENTIONS,
  FALLBACK_PROJECTS,
  HOME_TITLE,
  HOME_DESCRIPTION,
  BLOG_DESCRIPTION,
  hero: { src: HERO_PORTRAIT, srcset: HERO_PORTRAIT_SRCSET, sizes: HERO_PORTRAIT_SIZES },
};
