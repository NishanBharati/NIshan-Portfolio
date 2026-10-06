# SEO / GEO / AEO Audit: nishanbharati portfolio

_Phase 1 (read-only audit) · 2026-10-06 · Status: **awaiting approval before any code changes**_

## 1. Stack and environment

| Item | Finding |
|---|---|
| Framework | React 18.3 + Vite 5.4 + TypeScript, Tailwind 3, framer-motion 12 |
| Router | `react-router-dom` 7 (`BrowserRouter`, declarative `<Routes>`), `src/App.tsx` |
| Routes | `/` (home), `/blog`, `/blog/:slug` (lazy), `*` (404), plus a separate `/admin` entry (`admin/index.html`) |
| Data | Supabase: blog posts and projects are fetched **in the browser at runtime** (`src/lib/posts.ts`, `src/lib/projects.ts`); the projects section falls back to `FALLBACK_PROJECTS` |
| Hosting config | **Both** `vercel.json` and `public/_redirects` (Netlify) exist. Each one rewrites every path to `/index.html`. Which host is used isn't clear. |
| Rendering | **Client-side SPA only.** No SSR, SSG or prerendering. |
| Domain | Not deployed. `https://nishanbharati.com.np` is hard-coded in **4 places**: `src/data/content.ts` (`PROFILE.siteUrl`), `vite.config.ts` (`SITE_URL`), `index.html` (canonical, OG, JSON-LD), `public/robots.txt` |
| Git | **Not a git repository**, so the `seo-geo-aeo` branch can't be created until it's initialised. |

## 2. Rendering check (critical)

I built the site (`vite build`), served `dist/` with `vite preview`, and requested each route without JavaScript, the way a non-rendering crawler or AI bot would.

**What every bot that doesn't run JavaScript receives on every URL:**

```html
<body>
  <div id="root"></div>
</body>
```

| URL | HTTP status | `<title>` served | Any page text in HTML? |
|---|---|---|---|
| `/` | 200 | Nishan Bharati — Full Stack Developer | **No** |
| `/blog` | 200 | Nishan Bharati — Full Stack Developer (home title) | **No** |
| `/blog/is-seo-dead-how-ai-search-is-changing-marketing` | 200 | home title, home description, home OG image | **No** |
| `/this-page-does-not-exist` | **200** (soft 404) | home title | **No** |
| `/llms.txt` (doesn't exist) | **200**, serves the SPA shell | home title | No |

What this means:
- **GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot/Claude-User, CCBot and most other AI crawlers don't execute JavaScript.** Today they see a title, a meta description and JSON-LD, and **no body content**: no About text, skills, services, projects, experience, education or blog articles.
- **Social previews (LinkedIn, Facebook, WhatsApp, X, Slack) don't run JavaScript.** Every shared blog post shows the home page card, because per-route meta is only set client-side in `src/lib/pageMeta.ts`.
- **Googlebot** does render JavaScript, but in a deferred second pass. Blog content also depends on a Supabase call succeeding at render time.
- Unknown URLs return **200**, so Google sees soft 404s.
- **Good news:** the `<head>` of `index.html` already has a solid title, description, canonical, OG/Twitter tags and a JSON-LD `@graph`, so the home page *identity* reaches bots even now.

### Rendering options (effort vs. impact)

| Option | What it is | Effort | Impact | Risks |
|---|---|---|---|---|
| **A. Build-time SSG with Vite's SSR build (recommended)** | Add `entry-server.tsx` and render each route with `react-dom/server` at build time. Write `dist/index.html`, `dist/blog/index.html`, `dist/blog/<slug>/index.html` and `dist/404.html`, each with the full HTML body and its own `<head>`. Switch `createRoot` to `hydrateRoot`. Blog posts and projects are fetched from Supabase **at build time**. | Medium (~1 day) | **High.** Every route ships real content and correct meta, and 404s work properly. | Posts published from `/admin` only appear as static HTML after a rebuild. Fix: a Vercel/Netlify **deploy hook** called on publish, and keep a client-side fallback for brand-new slugs. A few `document`/`window` reads at module level need guarding (`pageMeta.ts:7`). |
| B. Headless-browser prerender (puppeteer or a `vite-plugin-prerender`-style tool) | Run Chrome at build time and snapshot the DOM | Low–Medium | High | Needs Chrome in the build environment, which is fragile on Vercel/Netlify. It also snapshots animation state (`opacity:0` inline styles). |
| C. `vite-react-ssg` | Library-based SSG | Medium | High | Requires restructuring routes into its API, and support for React Router 7 is uncertain. |
| D. Migrate to Next.js (App Router) | Full SSR/SSG framework | **High** (2–4 days; the admin entry, Supabase and the router all need porting) | Highest long-term (ISR solves the publish-then-rebuild issue) | Large change. **I won't do this without your explicit approval.** |

**Recommendation: Option A.** It keeps the current stack, design and admin as they are, adds no heavy dependencies, and fixes the biggest problem.

## 3. Prioritized findings

Impact: H/M/L. Effort: S (< 1h), M (a few hours), L (a day or more).

| # | Issue | Evidence | Impact | Effort | Fix |
|---|---|---|---|---|---|
| 1 | SPA ships an empty body, so AI and social bots see no content | `dist/index.html` body is `<div id="root"></div>`. Table in §2. | **H** | L | Option A (SSG) |
| 2 | Per-route meta (title, description, canonical, OG) exists only after JavaScript runs. Every blog URL shares the home title and OG card. | `src/lib/pageMeta.ts:31-60`, `BlogPostPage.tsx:40` | **H** | M (part of #1) | Render the `<head>` per route at build time from one central SEO module |
| 3 | Soft 404s: unknown paths return 200 | `vercel.json` catch-all `/:path*` → `/index.html`. `public/_redirects` `/* /index.html 200` | **H** | S | With SSG, emit `404.html` and drop the catch-all rewrite (keep it only for `/blog/*` until rebuild-on-publish exists). Vercel and Netlify serve `404.html` with a real 404 status. |
| 4 | Duplicated text in the DOM: `AnimatedText` renders **every character twice** (a `visibility:hidden` copy plus a visible copy). Plain-text extractors (most AI crawlers once the page is prerendered) would read "II''mm  aa  ffuullll…" for the About and Contact paragraphs. It also puts `aria-label` on a `<p>`, which axe flags as prohibited. | `src/components/AnimatedText.tsx:28-59`. Lighthouse `aria-prohibited-attr` fails on both paragraphs. | **H** (once prerendered) | S | Render the sentence once as real text and animate overlays with `aria-hidden`, or animate per-word opacity on one text node. The visuals stay the same. |
| 5 | No clear "who is Nishan Bharati" statement in the first 100 words. The H1 is "Hi, i'm nishan" (lowercase, no surname, no role). The About text is first-person and never uses the full name. | `HeroSection.tsx:12-14`, `content.ts:59-60` (`ABOUT_TEXT`) | **H** | S | Keep the visual H1 and add the full name and role to it (e.g. a visually-hidden "Nishan Bharati: MERN Stack Developer and Co-Founder of Navya EdTech" alongside the visible text). Add a third-person 40–60 word answer paragraph. |
| 6 | Entity naming isn't fixed. The site uses "Navya EdTech" and "Full Stack Developer"; your brief uses "NavyaEdTech" and "MERN stack developer". Location is "Nepal" only; your brief says Kathmandu. | `content.ts:7,12,15`, `index.html:6,50` | **H** (disambiguation) | S | **Needs your decision** (see questions). Then use one exact string everywhere. |
| 7 | JSON-LD is valid but thin: no `ProfilePage`, `alternateName`, `alumniOf` (education data now exists), `address.addressLocality`, `ContactPoint`, or logo on the Organization. `Person.image` is the OG banner, not a headshot. No `BlogPosting` or `BreadcrumbList`. | `index.html:40-80` | **H** | M | Extend the `@graph` with stable `@id`s and generate `BlogPosting` and `BreadcrumbList` per page at build time |
| 8 | Mobile performance is 67. LCP 4.6 s, FCP 3.1 s, TBT 330 ms. | Lighthouse mobile (§4) | **H** | M | See #9–#12 |
| 9 | Google Fonts Kanit loads **7 weights** as a render-blocking stylesheet (903 ms blocking) | `index.html` `<link … Kanit:wght@300;…;900>`. Lighthouse `render-blocking-resources`. | M | S | Self-host 3–4 weights as `woff2` with `font-display: swap`, a `preload` for the hero weight, and a Latin subset |
| 10 | About decorations are **hotlinked from a Figma preview site** as 970 KB of oversized PNGs with no dimensions. If that Figma site goes down, the images disappear. | `content.ts:50-57`. Lighthouse: lego 422 KB, Group 230 KB, moon 209 KB, p59 106 KB, all `unsized-images`. | M | S | Download them, convert to WebP/AVIF at display size (~420 px), host in `public/` or `src/assets`, add `width`/`height` |
| 11 | Hero portrait is 1254×1254 but displayed at most ~520 px (67 KB wasted), with no `srcset` and no preload | `HeroSection.tsx:28-36`. Lighthouse `uses-responsive-images`. | M | S | Make 520/800/1040 px WebP variants with `srcset`/`sizes`, `fetchpriority="high"` and a preload |
| 12 | Supabase JS (221 KB, 46 KB unused) loads on the home page just to fetch projects | Lighthouse `unused-javascript` | M | M | With SSG, projects are baked in at build time and the client can skip Supabase on the home page |
| 13 | Sitemap `lastmod` is always the build date for static pages. All 3 posts show `2026-10-06`. | `vite.config.ts:36-40`, `dist/sitemap.xml` | M | S | Use the real modification date (content hash or git date for static pages; `updated_at` is already used for posts, so verify those values) |
| 14 | Projects only have a one-line description: no problem, stack, role or outcome, and no detail pages | `content.ts` `FALLBACK_PROJECTS`, `ShowcaseProject` type | M | M | Add optional `problem`, `approach`, `stack[]`, `result` fields (results only when verified) and render them as text. Detail pages are optional later. |
| 15 | No FAQ and no question-style headings, so there's little to win featured snippets or direct answers with | Every H2 is a single label ("Skills", "Project", etc.) | M | M | Add a visible FAQ section with matching `FAQPage` schema |
| 16 | `robots.txt` has no AI-crawler policy (allow-all by default, which is fine) and there's no `llms.txt` | `public/robots.txt` | M | S | Explicit groups per bot after you decide (table in §5) |
| 17 | No security headers configured (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). No long-cache header for hashed `/assets/*`. | `vercel.json` has only rewrites; `public/_headers` doesn't exist | M | S | Add `headers` to `vercel.json` (or Netlify `_headers`) |
| 18 | Two conflicting host configs | `vercel.json` and `public/_redirects` | L | S | Keep only the one for your host |
| 19 | The footer renders **inside** `<main>`, so the `contentinfo` landmark is lost. No skip link. | `App.tsx:18-35`; pages render `<FooterSection/>` inside routes | L | S | Move the footer outside `<main>` and add a "Skip to content" link |
| 20 | A11y: the logo link's `aria-label` ("Nishan Bharati - Home") doesn't contain its visible text ("Nishan Full Stack"). The "Full Stack" caption fails contrast (`text-white/45` at 10 px). | Lighthouse desktop `label-content-name-mismatch`, `color-contrast` | L | S | Label "Nishan Bharati, home" and raise the caption to `white/60` |
| 21 | The section H2 says "Project" (singular). Decorative images correctly use `alt=""`. Project screenshots have good alt text. | `ProjectsSection.tsx:48` | L | S | Rename to "Projects" |
| 22 | The site URL is duplicated in 4 files | §1 | L | S | One constant (`SITE_URL`) that `vite.config.ts` reads and injects into `index.html`, `robots.txt` and `sitemap.xml` at build time |
| 23 | Missing `humans.txt` and `/.well-known/security.txt` | `public/` listing | L | S | Optional; add `security.txt` with your contact email |
| 24 | The social list has no X or YouTube. The Facebook handle is `nisan.bharati` (spelled differently). | `content.ts:23-28` | L | n/a | **Confirm** which profiles exist; never invent them |

### Already good (keep)
- `lang="en"`, `meta viewport`, `theme-color`, and a manifest with 192/512 icons and a maskable entry. The favicon set (SVG + 32 px PNG + apple-touch) was regenerated today.
- OG image is **1200×630** JPEG with absolute URLs and `og:image:alt`. `twitter:card=summary_large_image`.
- `robots.txt` disallows `/admin`, and the admin HTML has `noindex, nofollow`.
- Build-time sitemap already includes published blog posts (3 found).
- The existing JSON-LD `@graph` parses as valid JSON with consistent `@id`s.
- Hashed, code-split bundles. The Markdown renderer only loads on article pages.
- CLS is about 0 (mobile 0, desktop 0.004).
- `.env.local` is git-ignored, and `vite.config.ts` refuses to build with a Supabase service-role key.

## 4. Lighthouse baseline (local `vite preview`, Lighthouse 12, headless Chrome)

| | Performance | Accessibility | Best Practices | SEO | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|---|---|---|
| **Mobile** | **67** | 96 | 100 | 100 | **4.6 s** | 3.1 s | 330 ms | 0 | 5.0 s |
| **Desktop** | 97 | 92 | 100 | 100 | 1.1 s | 0.7 s | 20 ms | 0.004 | 0.9 s |

- The mobile LCP element is the hero section (H1 + tagline). LCP is gated by the render-blocking font CSS and the JS bundle, because nothing paints until React runs.
- **INP** can't be measured in a lab run; it needs field data from CrUX or Search Console after launch. Lab TBT (330 ms mobile) suggests a risk.
- Lighthouse's "SEO 100" only checks basics on the rendered DOM. It does **not** reflect the empty-HTML problem in §2.
- These are local numbers without a CDN, HTTP/2 or compression tuning, so production will differ.

## 5. AI crawler policy (your decision)

| Bot | Operator | Purpose | Respects robots.txt | Proposed default |
|---|---|---|---|---|
| Googlebot | Google | Search index (also feeds AI Overviews) | Yes | **Allow** |
| Bingbot | Microsoft | Search index (also feeds Copilot and ChatGPT search partly) | Yes | **Allow** |
| OAI-SearchBot | OpenAI | ChatGPT search results and citations | Yes | **Allow** |
| ChatGPT-User | OpenAI | Fetches a page when a user asks ChatGPT about it | Treated as user-initiated | **Allow** |
| PerplexityBot | Perplexity | Perplexity search index and citations | Yes | **Allow** |
| Perplexity-User | Perplexity | User-initiated fetch | Treated as user-initiated | **Allow** |
| Claude-SearchBot | Anthropic | Claude search results | Yes | **Allow** |
| Claude-User | Anthropic | User-initiated fetch | Yes | **Allow** |
| GPTBot | OpenAI | **Model training** | Yes | _Your call_ (allow = more likely to be "known" by future models) |
| ClaudeBot | Anthropic | **Model training** | Yes | _Your call_ |
| Google-Extended | Google | Token controlling **Gemini training/grounding** use (not search ranking) | Yes | _Your call_ |
| CCBot | Common Crawl | Open dataset used by many model trainers | Yes | _Your call_ |
| Applebot-Extended | Apple | Apple AI training use | Yes | _Your call_ |

For a personal-brand site whose goal is to be **known and cited**, allowing the training crawlers is usually in your interest. Nothing will be blocked without your answer.

## 6. Content audit summary
- **Text content exists:** About, 5 skill groups, 5 services, 3 projects, 3 experience entries, 3 education entries, contact details and 3 blog posts. It's just not in the initial HTML (§2).
- **First 100 words** in DOM order: navbar labels → "Hi, i'm nishan" → tagline → a first-person About paragraph. The full name "Nishan Bharati" doesn't appear as visible body text until the footer.
- **Projects:** a category and one sentence each. No problem, stack or outcome.
- **No** FAQ, no question-style headings, no tables or lists of the tech stack as plain HTML (skills are lists, which is good), no "last updated" dates on static pages, and no press or mentions structure.
- **Blog posts** have dates and reading time, but no visible author byline on the article page (not verified in the template yet; I'll check when implementing BlogPosting).

## 7. Change log
- Phase 1: no code changes. This file was added.
