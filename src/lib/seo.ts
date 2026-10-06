import { SITE_LANGUAGE, SITE_NAME, SITE_URL } from '../config/site';
import { EDUCATION, FAQS, MENTIONS, PROFILE, SKILL_GROUPS, SOCIAL_LINKS, WHO_IS } from '../data/content';
import type { Post, PostSummary } from './posts';
import type { ShowcaseProject } from './projects';
import portraitUrl from '../assets/nishan-portrait.webp';

/**
 * Single source of truth for every page's <head>: title, description, canonical, robots, social cards
 * and JSON-LD. Used at build time by the prerenderer (renderHeadTags) and on client-side navigation
 * (applySeo via useSeo), so crawlers and browsers always get the same metadata.
 */
export type Seo = {
  title: string;
  description: string;
  /** Path for the canonical URL, e.g. "/" or "/blog/my-post". Omit for pages without a canonical. */
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: Record<string, unknown>[];
};

// ---------------------------------------------------------------------------------------------
// Stable entity identifiers. Never change these once live: search engines join entities on them.
// ---------------------------------------------------------------------------------------------
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PROFILE_PAGE_ID = `${SITE_URL}/#profilepage`;
export const ORG_ID = 'https://navyaedtech.com/#organization';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_OG_ALT = `${PROFILE.fullName}, ${PROFILE.jobTitle} and co-founder of ${PROFILE.company.name}, ${PROFILE.location}`;

export const HOME_TITLE = `${PROFILE.fullName} | ${PROFILE.jobTitle} in ${PROFILE.location}`;
export const HOME_DESCRIPTION = `${PROFILE.fullName} is a ${PROFILE.jobTitle} and co-founder of ${PROFILE.company.name} in ${PROFILE.location}, building fast, scalable web apps, e-commerce stores and CMS platforms.`;

const absolute = (pathOrUrl: string) => new URL(pathOrUrl, SITE_URL).href;
const canonicalFor = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

/** Trims to `max` chars at a word boundary (search engines cut meta descriptions at ~160). */
function clamp(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.-]+$/, '')}…`;
}

/** "<page> | Nishan Bharati", dropping the suffix when it would push the title past ~60 chars. */
const withBrand = (title: string) => {
  const branded = `${title} | ${PROFILE.fullName}`;
  return branded.length <= 60 ? branded : title;
};

// ---------------------------------------------------------------------------------------------
// JSON-LD nodes
// ---------------------------------------------------------------------------------------------
/** `onProfilePage`: the home page carries the ProfilePage node, so the Person can point at it. */
function personNode({ onProfilePage = false }: { onProfilePage?: boolean } = {}): Record<string, unknown> {
  const knowsAbout = Array.from(new Set(SKILL_GROUPS.flatMap((g) => g.skills))).concat(['MERN Stack', 'Full Stack Development']);
  const node: Record<string, unknown> = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PROFILE.fullName,
    givenName: PROFILE.firstName,
    familyName: 'Bharati',
    // Spelling used by the Facebook handle (facebook.com/nisan.bharati).
    alternateName: ['Nisan Bharati'],
    jobTitle: PROFILE.jobTitle,
    description: WHO_IS,
    url: `${SITE_URL}/`,
    mainEntityOfPage: onProfilePage ? { '@id': PROFILE_PAGE_ID } : { '@type': 'ProfilePage', url: `${SITE_URL}/` },
    image: { '@type': 'ImageObject', url: absolute(portraitUrl), caption: `Portrait of ${PROFILE.fullName}` },
    email: `mailto:${PROFILE.email}`,
    telephone: PROFILE.phone.replace(/\s/g, '-'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: PROFILE.city,
      addressCountry: PROFILE.countryCode,
    },
    homeLocation: { '@type': 'Place', name: PROFILE.location },
    worksFor: { '@id': ORG_ID },
    alumniOf: EDUCATION.map((e) => ({
      '@type': 'EducationalOrganization',
      name: e.institution,
      ...(e.institution === 'Nepal Commerce Campus'
        ? { parentOrganization: { '@type': 'CollegeOrUniversity', name: 'Tribhuvan University' } }
        : {}),
    })),
    knowsAbout,
    knowsLanguage: ['en'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'business inquiries',
      email: PROFILE.email,
      telephone: PROFILE.phone.replace(/\s/g, '-'),
      availableLanguage: ['English'],
      url: `${SITE_URL}/#contact`,
    },
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };
  if (MENTIONS.length) {
    node.subjectOf = MENTIONS.map((m) => ({
      '@type': m.kind === 'podcast' ? 'PodcastEpisode' : 'CreativeWork',
      name: m.title,
      url: m.url,
      datePublished: m.date,
      publisher: { '@type': 'Organization', name: m.publisher },
    }));
  }
  return node;
}

function organizationNode(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: PROFILE.company.name,
    url: PROFILE.company.href,
    description: `${PROFILE.company.name} is ${PROFILE.company.description}.`,
    founder: { '@id': PERSON_ID },
    employee: { '@id': PERSON_ID },
    // TODO: confirm with Nishan: add `logo` (absolute URL on navyaedtech.com) and the company's own `sameAs` profiles.
  };
}

function websiteNode(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: [`${PROFILE.fullName} Portfolio`, `${PROFILE.fullName}, ${PROFILE.jobTitle}`],
    description: HOME_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    publisher: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID },
  };
}

function breadcrumbNode(path: string, items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalFor(path)}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: canonicalFor(item.path),
    })),
  };
}

const graph = (...nodes: Record<string, unknown>[]) => [{ '@context': 'https://schema.org', '@graph': nodes }];

// ---------------------------------------------------------------------------------------------
// Per-route SEO
// ---------------------------------------------------------------------------------------------
export function homeSeo({ projects = [], lastUpdated }: { projects?: ShowcaseProject[]; lastUpdated?: string } = {}): Seo {
  const profilePage: Record<string, unknown> = {
    '@type': 'ProfilePage',
    '@id': PROFILE_PAGE_ID,
    url: `${SITE_URL}/`,
    name: HOME_TITLE,
    description: HOME_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
    about: { '@id': PERSON_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE, width: 1200, height: 630 },
    ...(lastUpdated ? { dateModified: lastUpdated } : {}),
  };

  const projectList: Record<string, unknown> = {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/#projects`,
    name: `Projects by ${PROFILE.fullName}`,
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: p.name,
        description: p.description,
        genre: p.category,
        creator: { '@id': PERSON_ID },
        ...(p.stack?.length ? { keywords: p.stack.join(', ') } : {}),
        ...(p.result ? { abstract: [p.problem, p.approach, p.result].filter(Boolean).join(' ') } : {}),
        ...(p.live_url ? { url: p.live_url } : {}),
        ...(p.images.tall.src ? { image: absolute(p.images.tall.src) } : {}),
      },
    })),
  };

  const faqPage: Record<string, unknown> = {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    isPartOf: { '@id': PROFILE_PAGE_ID },
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const nodes = [personNode({ onProfilePage: true }), organizationNode(), websiteNode(), profilePage, faqPage];
  if (projects.length) nodes.push(projectList);

  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: '/',
    type: 'profile',
    modifiedTime: lastUpdated,
    jsonLd: graph(...nodes),
  };
}

export const BLOG_TITLE = `Blog by ${PROFILE.fullName} | Full Stack Development Insights`;
export const BLOG_DESCRIPTION = `Articles by ${PROFILE.fullName}, ${PROFILE.jobTitle} and co-founder of ${PROFILE.company.name}, on web development, software, AI and building digital products in Nepal.`;

export function blogIndexSeo({ posts = [] }: { posts?: PostSummary[] } = {}): Seo {
  const blog = {
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: `${PROFILE.fullName}'s Blog`,
    description: BLOG_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/${encodeURIComponent(p.slug)}#article`,
      headline: p.title,
      url: `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`,
      ...(p.published_at ? { datePublished: p.published_at } : {}),
      author: { '@id': PERSON_ID },
    })),
  };
  return {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    path: '/blog',
    type: 'website',
    jsonLd: graph(
      personNode(),
      organizationNode(),
      websiteNode(),
      blog,
      breadcrumbNode('/blog', [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
      ]),
    ),
  };
}

export function postSeo(post: Post): Seo {
  const path = `/blog/${encodeURIComponent(post.slug)}`;
  const url = canonicalFor(path);
  const image = post.cover_image_url ? absolute(post.cover_image_url) : DEFAULT_OG_IMAGE;
  const words = post.content.trim().split(/\s+/).filter(Boolean).length;
  const article = {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title.slice(0, 110),
    description: post.excerpt,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: [image],
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Person', '@id': PERSON_ID, name: PROFILE.fullName, url: `${SITE_URL}/` },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': `${SITE_URL}/blog#blog` },
    inLanguage: SITE_LANGUAGE,
    keywords: post.tags.join(', '),
    wordCount: words,
    timeRequired: `PT${post.reading_minutes}M`,
  };
  const blogStub = {
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: `${PROFILE.fullName}'s Blog`,
    isPartOf: { '@id': WEBSITE_ID },
  };
  return {
    title: withBrand(post.title),
    description: clamp(post.excerpt || BLOG_DESCRIPTION),
    path,
    image,
    imageAlt: post.title,
    type: 'article',
    publishedTime: post.published_at ?? undefined,
    modifiedTime: post.updated_at,
    jsonLd: graph(
      personNode(),
      organizationNode(),
      websiteNode(),
      blogStub,
      article,
      breadcrumbNode(path, [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path },
      ]),
    ),
  };
}

export function notFoundSeo(title = 'Page Not Found'): Seo {
  return {
    title: `${title} | ${PROFILE.fullName}`,
    description: "The page you're looking for doesn't exist or has been moved. Explore Nishan Bharati's work, services and articles instead.",
    noindex: true,
  };
}

// ---------------------------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------------------------
const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** JSON for <script type="application/ld+json">, safe against "</script>" inside content. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

/** Server side: the page-specific <head> tags as an HTML string. */
export function renderHeadTags(seo: Seo): string {
  const image = seo.image ?? DEFAULT_OG_IMAGE;
  const imageAlt = seo.imageAlt ?? DEFAULT_OG_ALT;
  const canonical = seo.path ? canonicalFor(seo.path) : undefined;
  const tags = [
    `<title>${escapeAttr(seo.title)}</title>`,
    `<meta name="description" content="${escapeAttr(seo.description)}" />`,
    `<meta name="robots" content="${seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />`,
    canonical && `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="${seo.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    canonical && `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${escapeAttr(seo.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(seo.description)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    image === DEFAULT_OG_IMAGE && `<meta property="og:image:type" content="image/jpeg" />`,
    image === DEFAULT_OG_IMAGE && `<meta property="og:image:width" content="1200" />`,
    image === DEFAULT_OG_IMAGE && `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeAttr(imageAlt)}" />`,
    seo.type === 'profile' && `<meta property="profile:first_name" content="${PROFILE.firstName}" />`,
    seo.type === 'profile' && `<meta property="profile:last_name" content="Bharati" />`,
    seo.publishedTime && `<meta property="article:published_time" content="${seo.publishedTime}" />`,
    seo.modifiedTime && seo.type === 'article' && `<meta property="article:modified_time" content="${seo.modifiedTime}" />`,
    seo.type === 'article' && `<meta property="article:author" content="${SITE_URL}/" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttr(imageAlt)}" />`,
    ...(seo.jsonLd ?? []).map((block) => `<script type="application/ld+json">${serializeJsonLd(block)}</script>`),
  ];
  return tags.filter(Boolean).join('\n    ');
}

/** Client side: updates the live <head> on client-side navigation. */
export function applySeo(seo: Seo) {
  if (typeof document === 'undefined') return;
  const head = document.head;
  head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
  // Drop the prerendered tags too (they carry no marker), then re-insert the current page's set.
  head
    .querySelectorAll(
      'meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"], meta[property^="article:"], meta[property^="profile:"], meta[name^="twitter:"], script[type="application/ld+json"]',
    )
    .forEach((el) => el.remove());
  document.title = seo.title;
  const template = document.createElement('template');
  template.innerHTML = renderHeadTags(seo).replace(/^<title>.*?<\/title>/, '');
  template.content.querySelectorAll('*').forEach((el) => el.setAttribute('data-seo', ''));
  head.append(template.content);
}
