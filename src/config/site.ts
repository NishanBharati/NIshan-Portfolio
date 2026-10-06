/**
 * Canonical origin of the public site: the ONE place to change the domain.
 * Read by content.ts (PROFILE.siteUrl), the SEO head/JSON-LD builders, vite.config.ts and the
 * build-time prerender script, which writes it into every page, robots.txt, sitemap.xml and llms.txt.
 *
 * TODO: confirm with Nishan. The site is not deployed yet; this is the intended production domain.
 * Use the bare (non-www) https origin and redirect www -> bare at the DNS/host level.
 */
export const SITE_URL = 'https://nishanbharati.com.np';

export const SITE_NAME = 'Nishan Bharati';
export const SITE_LANGUAGE = 'en';
