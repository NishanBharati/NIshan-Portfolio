import type { ShowcaseProject } from '../lib/projects';
import { SITE_URL } from '../config/site';

/**
 * Entity facts. Keep this wording identical everywhere (site copy, meta tags, JSON-LD, llms.txt and
 * external profiles; see SEO-OFFSITE-CHECKLIST.md). Search and AI engines match entities on consistency.
 */
export const PROFILE = {
  firstName: 'Nishan',
  fullName: 'Nishan Bharati',
  /** Primary job title used in titles, meta and schema. */
  jobTitle: 'Full Stack Developer',
  role: 'Co-Founder & Full Stack Developer',
  tagline: 'co-founder & full stack developer building fast, scalable software for ambitious businesses',
  email: 'nishanbharati12345@gmail.com',
  phone: '+977 981-3796949',
  phoneHref: 'tel:+9779813796949',
  company: {
    name: 'Navya EdTech',
    href: 'https://navyaedtech.com/',
    description: 'an IT and software development company in Nepal',
  },
  location: 'Kathmandu, Nepal',
  city: 'Kathmandu',
  country: 'Nepal',
  countryCode: 'NP',
  /** Canonical origin, from src/config/site.ts. */
  siteUrl: SITE_URL,
  /** Drop the PDF at public/Nishan-Bharati-CV.pdf. */
  /** null until the PDF exists at build time (see __CV_AVAILABLE__ in vite.config.ts): no broken CV links. */
  cvHref: __CV_AVAILABLE__ ? '/Nishan-Bharati-CV.pdf' : null,
};

// Ordered by relevance to clients and recruiters. Also listed as `sameAs` in the JSON-LD in index.html.
export const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/NishanBharati', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nishan-bharati-35333927b/', icon: 'linkedin' },
  { label: 'Instagram', href: 'https://www.instagram.com/nishan_bharati/', icon: 'instagram' },
  { label: 'Facebook', href: 'https://www.facebook.com/nisan.bharati', icon: 'facebook' },
] as const;

export type NavLinkItem = {
  label: string;
  /** "/#id" for home sections, "/path" for pages, "#id" for an anchor on the current page. */
  href: string;
  /** Hidden below 640px so the bar never overflows on phones. */
  hideOnMobile?: boolean;
};

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'About', href: '/#about' },
  { label: 'Skills', href: '/#skills', hideOnMobile: true },
  { label: 'Services', href: '/#services', hideOnMobile: true },
  { label: 'Projects', href: '/#projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
];

// Optimised WebP of src/assets/nishan-portrait-original.png (bundled and hashed by Vite).
import portrait520 from '../assets/nishan-portrait-520.webp';
import portrait800 from '../assets/nishan-portrait-800.webp';
import portrait1040 from '../assets/nishan-portrait-1040.webp';
import decorMoon from '../assets/decor/moon.webp';
import decorObject from '../assets/decor/object.webp';
import decorLego from '../assets/decor/lego.webp';
import decorGroup from '../assets/decor/group.webp';

export const HERO_PORTRAIT = portrait800;
/** Responsive candidates for the hero portrait (rendered 280-520 CSS px wide). */
export const HERO_PORTRAIT_SRCSET = `${portrait520} 520w, ${portrait800} 800w, ${portrait1040} 1040w`;
export const HERO_PORTRAIT_SIZES = '(min-width: 1024px) 520px, (min-width: 768px) 440px, (min-width: 640px) 360px, 280px';

// Self-hosted, resized WebP versions of the original Figma decorations.
export const ABOUT_DECORATIONS = {
  moon: { src: decorMoon, width: 440, height: 440 },
  object: { src: decorObject, width: 420, height: 446 },
  lego: { src: decorLego, width: 440, height: 536 },
  group: { src: decorGroup, width: 440, height: 432 },
};

export const ABOUT_TEXT =
  "I'm a full stack developer and co-founder of Navya EdTech, an IT and software development company in Nepal. From custom web platforms and CMS-driven storefronts to scalable APIs, i turn complex business problems into clean, fast and reliable software. Let's build something incredible together!";

export type ExperienceItem = {
  role: string;
  organization: string;
  href?: string;
  type: string;
  /** e.g. "2024 — Present". Rendered only when set. */
  period?: string;
  current?: boolean;
  description: string;
  highlights: string[];
};

// Most recent first.
export const EXPERIENCE: ExperienceItem[] = [
  {
    role: 'Co-Founder & Lead Full Stack Developer',
    organization: 'Navya EdTech',
    href: 'https://navyaedtech.com/',
    type: 'Full-time · Lead',
    current: true,
    description:
      'Co-founded an IT and software development company and lead its engineering, taking client products from architecture and data model through to deployment and ongoing support.',
    highlights: ['System Architecture', 'Team Leadership', 'Client Delivery', 'Full Stack Development'],
  },
  {
    role: 'Full Stack Developer Intern',
    organization: 'Clickpoint Innovations',
    type: 'Internship',
    description:
      'Worked within a professional development team on production web projects, applying modern full stack practices, version control and collaborative workflows.',
    highlights: ['Production Codebases', 'Git Workflow', 'Team Collaboration'],
  },
  {
    role: 'Full Stack MERN Development',
    organization: 'Broadway Infosys',
    type: 'Professional Training',
    description:
      'Intensive, project-based training in building complete web applications with MongoDB, Express, React and Node.js.',
    highlights: ['MongoDB', 'Express', 'React', 'Node.js'],
  },
];

export type EducationItem = {
  /** Short display mark for the qualification, e.g. "SEE". */
  level: string;
  qualification: string;
  institution: string;
  field: string;
  /** e.g. "2019". Rendered only when set. */
  period?: string;
};

// Chronological, first to latest.
export const EDUCATION: EducationItem[] = [
  {
    level: 'SEE',
    qualification: 'Secondary Education Examination',
    institution: 'Tarapunja School',
    field: 'Secondary Level',
  },
  {
    level: '+2',
    qualification: 'Higher Secondary Education',
    institution: 'Bluebird College',
    field: 'Science Faculty',
  },
  {
    level: 'BIM',
    qualification: 'Bachelor of Information Management',
    institution: 'Nepal Commerce Campus',
    field: 'Tribhuvan University',
  },
];

export type SkillGroup = {
  title: string;
  icon: 'frontend' | 'backend' | 'data' | 'cloud' | 'product';
  skills: string[];
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Frontend Engineering',
    icon: 'frontend',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Responsive & Accessible UI'],
  },
  {
    title: 'Backend & APIs',
    icon: 'backend',
    skills: ['Node.js', 'Express', 'Laravel', 'RESTful APIs', 'Auth & Role-Based Access', 'Third-Party Integrations'],
  },
  {
    title: 'Data & CMS',
    icon: 'data',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Schema Design', 'Custom Admin Dashboards', 'Headless CMS'],
  },
  {
    title: 'Cloud & DevOps',
    icon: 'cloud',
    skills: ['Git & GitHub', 'CI/CD Pipelines', 'Linux VPS', 'Docker', 'Cloudflare', 'Domain & DNS Setup'],
  },
  {
    title: 'Product & Leadership',
    icon: 'product',
    skills: [
      'System Architecture',
      'Technical SEO',
      'Performance Optimisation',
      'Client Consulting',
      'Project Management',
      'Team Leadership',
    ],
  },
];

export const SERVICES = [
  {
    name: 'Custom Web Applications',
    description:
      'Tailor-made platforms, portals and dashboards built end to end, from data model to polished interface, around how your business actually works.',
  },
  {
    name: 'E-Commerce & CMS',
    description:
      'Storefronts, product catalogues and self-serve admin panels that let teams update content, products and inquiries without touching code.',
  },
  {
    name: 'Backend & API Development',
    description:
      'Secure, well-documented APIs and server-side systems with authentication, integrations and the performance to scale with demand.',
  },
  {
    name: 'UI/UX & Web Design',
    description:
      'Clean, modern and conversion-focused websites with careful attention to layout, typography, motion and mobile experience.',
  },
  {
    name: 'Technical Consulting',
    description:
      'Architecture, technology choices, SEO and performance audits that help businesses plan, launch and grow their digital products with confidence.',
  },
];

/**
 * Built-in projects, shown when Supabase isn't configured or can't be reached.
 * Once Supabase is set up, projects are managed in Admin → Projects (seeded with these same three
 * by supabase/schema.sql). Images live in public/projects/ so both can reference them by URL.
 */
export const FALLBACK_PROJECTS: ShowcaseProject[] = [
  {
    key: 'kabita-studio-and-store',
    name: 'Kabita Studio & Store',
    category: 'Photography & E-Commerce',
    description:
      'A booking-first website and online catalogue for a Bhaktapur photography studio and cultural retail store, with WhatsApp inquiries built in.',
    live_url: 'https://kabitastudioandstore.com.np/',
    images: {
      colTop: { src: '/projects/kabita/k3.webp', alt: 'Kabita Studio product catalogue section', position: 'left center' },
      colBottom: { src: '/projects/kabita/k2.webp', alt: 'Kabita Studio blogs and stories section', position: 'center top' },
      tall: { src: '/projects/kabita/k1.webp', alt: 'Kabita Studio homepage hero', position: 'left center' },
    },
  },
  {
    key: 'navya-edtech',
    name: 'Navya EdTech',
    category: 'Co-Founded · IT & Software Company',
    description:
      'The website of the IT and software development company i co-founded, presenting its services, featured case studies and technology stack.',
    live_url: 'https://navyaedtech.com/',
    images: {
      colTop: { src: '/projects/navya/n3.webp', alt: 'Navya technology stack section', position: 'center top' },
      colBottom: { src: '/projects/navya/n2.webp', alt: 'Navya featured case studies section', position: 'center top' },
      tall: { src: '/projects/navya/n1.webp', alt: 'Navya homepage hero', position: 'left center' },
    },
  },
  {
    key: 'suravi-sanitary-suppliers',
    name: 'Suravi Sanitary Suppliers',
    category: 'Retail & Home Services',
    description:
      'A full-stack storefront and self-serve CMS for a Lalitpur sanitary, solar and water-purification retailer.',
    live_url: 'https://suravisanitary.com.np/',
    images: {
      colTop: { src: '/projects/suravi/s2.webp', alt: 'Suravi featured KENT water purifier section', position: 'left center' },
      colBottom: { src: '/projects/suravi/s3.webp', alt: 'Suravi renovation projects section', position: 'center center' },
      tall: { src: '/projects/suravi/s1.webp', alt: 'Suravi Sanitary homepage hero', position: 'center top' },
    },
  },
];

/**
 * Direct answer to "Who is Nishan Bharati?" (40-60 words, third person) so search and answer engines
 * can quote it verbatim. Shown in the About section and reused in meta, JSON-LD and llms.txt.
 */
export const WHO_IS =
  'Nishan Bharati is a Full Stack Developer based in Kathmandu, Nepal, and the co-founder of Navya EdTech, an IT and software development company. As its Lead Full Stack Developer, Nishan builds custom web applications, e-commerce stores and CMS platforms with React, Next.js, TypeScript, Node.js, Express, Laravel, MongoDB and PostgreSQL.';

export type Faq = { question: string; answer: string };

/** Visible FAQ section; the FAQPage JSON-LD is generated from this same array, so they always match. */
export const FAQS: Faq[] = [
  {
    question: 'What does Nishan Bharati do?',
    answer:
      'Nishan Bharati is a Full Stack Developer and the co-founder of Navya EdTech in Kathmandu, Nepal. Nishan designs and builds complete web products, from database schema and APIs to the finished interface, including custom web applications, e-commerce storefronts, self-serve CMS admin panels and technical SEO and performance work for businesses.',
  },
  {
    question: 'What is Navya EdTech?',
    answer:
      'Navya EdTech is an IT and software development company in Nepal, co-founded by Nishan Bharati, who leads its engineering as Lead Full Stack Developer. The company designs and builds websites, web applications and software for businesses, and presents its services, case studies and technology stack at navyaedtech.com.',
  },
  {
    question: 'What technologies does Nishan Bharati work with?',
    answer:
      'Nishan Bharati works with the MERN stack (MongoDB, Express, React, Node.js) plus Next.js, TypeScript, Tailwind CSS and Framer Motion on the frontend, Laravel for PHP backends and REST APIs, MySQL and PostgreSQL for relational data, and Git, CI/CD, Docker, Linux VPS hosting and Cloudflare for deployment.',
  },
  {
    question: 'What services does Nishan Bharati offer?',
    answer:
      'Nishan Bharati offers five core services: custom web applications built end to end, e-commerce and CMS platforms with self-serve admin panels, backend and API development, UI/UX and web design, and technical consulting covering architecture, technology choices, SEO and performance audits for businesses planning or growing a digital product.',
  },
  {
    question: 'Is Nishan Bharati available for new projects?',
    answer: `Yes. Nishan Bharati is currently available for new projects through Navya EdTech. The quickest way to start is the inquiry form on this site; you can also email ${PROFILE.email} or call ${PROFILE.phone} with a short description of the product, timeline and budget, and Nishan will reply with next steps.`,
  },
  {
    question: 'Where is Nishan Bharati based?',
    answer:
      'Nishan Bharati is based in Kathmandu, Nepal. Past work includes websites and storefronts for businesses in the Kathmandu Valley, such as a photography studio and cultural store in Bhaktapur and a sanitary, solar and water-purification retailer in Lalitpur, alongside the website of Navya EdTech, the company Nishan co-founded.',
  },
  {
    question: 'What projects has Nishan Bharati built?',
    answer:
      'Selected projects include Kabita Studio & Store, a booking-first website and online catalogue for a Bhaktapur photography studio with WhatsApp inquiries; the company website of Navya EdTech; and Suravi Sanitary Suppliers, a full-stack storefront with a self-serve CMS for a Lalitpur retailer. Each project links to its live site on this page.',
  },
  {
    question: "What is Nishan Bharati's educational background?",
    answer:
      'Nishan Bharati studied for a Bachelor of Information Management (BIM) at Nepal Commerce Campus, Tribhuvan University, after completing +2 (higher secondary) in the Science faculty at Bluebird College and the Secondary Education Examination (SEE) at Tarapunja School. Professional training includes a Full Stack MERN Development course at Broadway Infosys.',
  },
];

export type Mention = {
  title: string;
  publisher: string;
  url: string;
  /** ISO date, e.g. "2026-05-14". */
  date: string;
  kind: 'article' | 'interview' | 'podcast' | 'talk' | 'award' | 'listing';
};

/**
 * Third-party press, interviews, talks and listings about Nishan or Navya EdTech. The "In the press"
 * section and the Person.subjectOf JSON-LD render only when this has entries. Add real, linkable
 * mentions only; never placeholders.
 */
export const MENTIONS: Mention[] = [];
