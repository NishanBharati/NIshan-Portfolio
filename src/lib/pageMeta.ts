import { PROFILE } from '../data/content';

export const SITE_TITLE = 'Nishan Bharati — Full Stack Developer';

const DEFAULT_DESCRIPTION =
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '';
const DEFAULT_IMAGE = `${PROFILE.siteUrl}/og-image.jpg`;

type PageMetaOptions = {
  /** Absolute or root-relative share image; defaults to the site's Open Graph card. */
  image?: string | null;
  /** Keeps the page out of search results (e.g. 404s). */
  noindex?: boolean;
  type?: 'website' | 'article';
};

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/**
 * Updates the tab title, description, canonical URL and social share tags for client-side routes.
 * index.html carries the home page values for crawlers that don't run JavaScript.
 */
export function setPageMeta(title: string, description?: string | null, { image, noindex = false, type = 'website' }: PageMetaOptions = {}) {
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${PROFILE.siteUrl}${window.location.pathname}`;
  const img = image ? new URL(image, PROFILE.siteUrl).href : DEFAULT_IMAGE;

  document.title = title;
  setMeta('name', 'description', desc);
  setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  setMeta('property', 'og:type', type);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:image', img);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', desc);
  setMeta('name', 'twitter:image', img);
}
