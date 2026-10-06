# Off-site SEO / GEO checklist: Nishan Bharati

The website is now technically ready (see `SEO-AUDIT.md`). What decides whether Google and AI assistants recognise
**"Nishan Bharati"** as *you*, rather than someone else with the same name, happens mostly **off** the site: the same
facts, worded the same way, on every profile that links back to it.

Work top to bottom. Each item has copy-paste text. Character counts are shown where platforms have limits.

---

## 0. The rules (memorise these)

| Always write | Never write |
|---|---|
| **Nishan Bharati** | Nisan Bharati, Nishan B., N. Bharati |
| **Full Stack Developer** | Fullstack dev, Full-Stack Engineer, MERN guy (in titles) |
| **Co-Founder, Navya EdTech** (or "co-founder of Navya EdTech") | NavyaEdTech, Navya Edtech, Navya Ed Tech, Navya Tech |
| **Kathmandu, Nepal** | Nepal only, KTM, Kathmandu Valley (in bios) |
| Website: **https://nishanbharati.com.np** | other URLs as your "main" site |

- Use **the same profile photo** everywhere (the portrait on the site). Search engines and AI models use it to match profiles to one person.
- Always pair your name with **"Navya EdTech"** or **"Full Stack Developer, Kathmandu"**. That combination is what separates you from other people named Nishan Bharati.

---

## 1. Copy blocks (reuse everywhere)

**One-liner** (104 chars)
```
Full Stack Developer & Co-Founder of Navya EdTech · Kathmandu, Nepal · React, Next.js, Node.js, Laravel
```

**Short bio** (≈160 chars, same as the site's meta description)
```
Nishan Bharati is a Full Stack Developer and co-founder of Navya EdTech in Kathmandu, Nepal, building fast, scalable web apps, e-commerce stores and CMS platforms.
```

**Standard bio** (third person, same as the "Who is Nishan Bharati?" answer on the site)
```
Nishan Bharati is a Full Stack Developer based in Kathmandu, Nepal, and the co-founder of Navya EdTech, an IT and software development company. As its Lead Full Stack Developer, Nishan builds custom web applications, e-commerce stores and CMS platforms with React, Next.js, TypeScript, Node.js, Express, Laravel, MongoDB and PostgreSQL.
```

**First-person bio** (for LinkedIn About, guest posts, talks)
```
I'm Nishan Bharati, a Full Stack Developer based in Kathmandu, Nepal, and the co-founder of Navya EdTech, an IT and software development company. I lead engineering there and build custom web applications, e-commerce stores and CMS platforms end to end, from database schema and APIs to the finished interface, with React, Next.js, TypeScript, Node.js, Express, Laravel, MongoDB and PostgreSQL.

Portfolio and articles: https://nishanbharati.com.np
```

---

## 2. Profiles to update (in this order)

### LinkedIn: https://www.linkedin.com/in/nishan-bharati-35333927b/
- [ ] **Headline** (≤220 chars):
  ```
  Full Stack Developer & Co-Founder at Navya EdTech | React, Next.js, Node.js, Laravel | Web apps, e-commerce & CMS | Kathmandu, Nepal
  ```
- [ ] **Location:** Kathmandu, Bagmati, Nepal
- [ ] **About:** paste the *first-person bio*.
- [ ] **Contact info → Website:** `https://nishanbharati.com.np` (type: Portfolio). Add `https://navyaedtech.com/` as Company.
- [ ] **Experience**, matching the site's wording exactly:
  - *Co-Founder & Lead Full Stack Developer*, **Navya EdTech** (link the Navya EdTech company page if it exists), Full-time
  - *Full Stack Developer Intern*, **Clickpoint Innovations**, Internship
  - Add the dates. Then add the same dates to `src/data/content.ts` (`period`) so the site and LinkedIn match.
- [ ] **Licenses & certifications:** *Full Stack MERN Development*, **Broadway Infosys**
- [ ] **Education:** Bachelor of Information Management (BIM), **Nepal Commerce Campus**, Tribhuvan University · +2 Science, **Bluebird College** · SEE, **Tarapunja School**
- [ ] **Custom public URL:** if `linkedin.com/in/nishanbharati` is free, claim it. Then update `SOCIAL_LINKS` in `src/data/content.ts` (it feeds the JSON-LD `sameAs`).
- [ ] **Featured:** pin the portfolio link and your best article.

### GitHub: https://github.com/NishanBharati
- [ ] **Name:** Nishan Bharati
- [ ] **Bio** (≤160 chars):
  ```
  Full Stack Developer · Co-Founder of Navya EdTech · Kathmandu, Nepal
  ```
- [ ] **Company:** Navya EdTech  **Location:** Kathmandu, Nepal  **Website:** `https://nishanbharati.com.np`
- [ ] **Profile README** (create a repo named `NishanBharati` containing `README.md`):
  ```markdown
  # Hi, I'm Nishan Bharati 👋

  **Full Stack Developer** and **co-founder of [Navya EdTech](https://navyaedtech.com/)** in Kathmandu, Nepal.
  I build custom web applications, e-commerce stores and CMS platforms end to end.

  - 🧰 React · Next.js · TypeScript · Node.js · Express · Laravel · MongoDB · PostgreSQL
  - 🌐 Portfolio & articles: [nishanbharati.com.np](https://nishanbharati.com.np)
  - 📫 nishanbharati12345@gmail.com
  ```
- [ ] Pin repositories that match the projects on the site (if they're public).

### Instagram: https://www.instagram.com/nishan_bharati/
- [ ] **Name field** (searchable): `Nishan Bharati | Full Stack Developer`
- [ ] **Bio** (≤150 chars):
  ```
  Full Stack Developer · Co-Founder @ Navya EdTech · Kathmandu, Nepal
  ```
- [ ] **Link:** `https://nishanbharati.com.np`

### Facebook: https://www.facebook.com/nisan.bharati
- [ ] **Intro** (≤101 chars):
  ```
  Full Stack Developer & Co-Founder of Navya EdTech · Kathmandu, Nepal
  ```
- [ ] **Work:** Co-Founder & Lead Full Stack Developer at Navya EdTech. **Website:** `https://nishanbharati.com.np`
- [ ] Optional: if a username with the correct spelling is free (e.g. `facebook.com/nishanbharati`), switch to it and update `SOCIAL_LINKS`. The site currently lists "Nisan Bharati" as an alternate spelling because of the current handle; remove it from `src/lib/seo.ts` if you don't use that spelling.

---

## 3. Navya EdTech website (navyaedtech.com): the strongest link you control

- [ ] On the **About / Team** page, add a card:
  > **Nishan Bharati**: Co-Founder & Lead Full Stack Developer
  > link to `https://nishanbharati.com.np` with the anchor text **"Nishan Bharati"** (not "click here")
- [ ] In the footer or "Founders" line: `Co-founded by Nishan Bharati`, linked the same way.
- [ ] Add this JSON-LD to navyaedtech.com's `<head>`. It points back to the same Person `@id` your site defines, so search engines merge both into one entity:
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://navyaedtech.com/#organization",
    "name": "Navya EdTech",
    "url": "https://navyaedtech.com/",
    "description": "Navya EdTech is an IT and software development company in Nepal.",
    "logo": "https://navyaedtech.com/PATH-TO-LOGO.png",
    "founder": {
      "@type": "Person",
      "@id": "https://nishanbharati.com.np/#person",
      "name": "Nishan Bharati",
      "url": "https://nishanbharati.com.np/",
      "jobTitle": "Full Stack Developer"
    }
  }
  </script>
  ```
  Replace `PATH-TO-LOGO.png` with the real logo URL, then send that URL so it can go into `src/lib/seo.ts` too (it's a TODO there).
- [ ] If Navya EdTech has LinkedIn, Facebook or Instagram pages, list them as `sameAs` in that snippet and send them over as well.

---

## 4. Client sites you built (ask the clients)

A small credit link in the footer of each live project is a strong, honest signal:
- [ ] kabitastudioandstore.com.np
- [ ] suravisanitary.com.np

Suggested footer text:
```
Website by Nishan Bharati · Navya EdTech
```
Link "Nishan Bharati" to `https://nishanbharati.com.np` and "Navya EdTech" to `https://navyaedtech.com/`.

---

## 5. Launch-day technical steps (after deploying)

- [ ] **Domain:** confirm `nishanbharati.com.np` in `src/config/site.ts`. Redirect `www.` and `http://` to `https://nishanbharati.com.np` (one hop).
- [ ] **Host:** keep `vercel.json` *or* `public/_redirects` + `public/_headers`, and delete the other.
- [ ] **Environment variables** on the host: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- [ ] **Deploy hook:** create one (Vercel → Settings → Git → Deploy Hooks, or Netlify → Build hooks) and trigger it **every time you publish a blog post**, so the post gets its own prerendered page, metadata and sitemap entry.
- [ ] **Google Search Console** (https://search.google.com/search-console): add a *Domain* property (DNS TXT record) → Sitemaps → submit `https://nishanbharati.com.np/sitemap.xml` → URL Inspection on `/` and `/blog` → *Request indexing*.
- [ ] **Bing Webmaster Tools** (https://www.bing.com/webmasters): *Import from Google Search Console*. Bing's index also feeds ChatGPT search and Copilot.
- [ ] **Validate structured data:** run `/`, `/blog` and one article through
  - Google Rich Results Test: https://search.google.com/test/rich-results
  - Schema.org validator: https://validator.schema.org/
- [ ] **Refresh social previews** (they cache the old image):
  - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
  - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- [ ] **CSP:** after about a week with no CSP warnings in the browser console (site and `/admin`), change `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in your host config.
- [ ] Add `public/Nishan-Bharati-CV.pdf` and redeploy (the CV buttons appear automatically).
- [ ] Replace the hotlinked Google-thumbnail cover on "Is SEO Dead? How AI Search Is Changing Marketing" with a real 1200×630 image uploaded in the admin.

---

## 6. Ongoing: build mentions (GEO)

AI assistants cite what *other* sites say about you. Aim for a few genuine, linkable mentions:
- [ ] **Cross-post articles** on Dev.to, Hashnode or Medium with the **canonical URL set to your own post** (each platform has a "canonical URL" setting), plus the short bio and a link at the end.
- [ ] **Talks, meetups, podcasts, college events** in Kathmandu. Ask organisers to link to `https://nishanbharati.com.np` and use the short bio.
- [ ] **Interviews or features** about Navya EdTech in Nepali tech media.
- [ ] Every real mention: add it to `MENTIONS` in `src/data/content.ts`. It then appears in an "In the press" section and in the `subjectOf` structured data. **Real, linkable mentions only.**
- [ ] Don't buy links or directory listings, and don't create a Wikipedia/Wikidata entry until independent sources exist (it gets deleted and can hurt trust).

---

## 7. Monitor (monthly, about 15 minutes)

- [ ] **Search Console → Performance:** watch the queries `nishan bharati`, `nishan bharati developer`, `navya edtech founder`, `full stack developer kathmandu`.
- [ ] **Search Console → Core Web Vitals** (about 28 days after launch): check INP and LCP field data on mobile.
- [ ] **Ask the assistants** and note the answers in a simple log (date, assistant, correct?):
  - "Who is Nishan Bharati?"
  - "Who founded Navya EdTech?"
  - "Recommend a full stack developer in Kathmandu, Nepal."

  Ask ChatGPT (with search), Perplexity, Gemini, Claude and Google (AI Overview). If an answer is wrong or mixes you up with someone else, the fix is usually more consistent profiles (§0–3) and more third-party mentions (§6), not changes to the site.
- [ ] Re-run `npm run build && npm run seo:check` after content changes. CI runs it automatically on GitHub.
