import type { ShowcaseProject } from '../lib/projects';

export const PROFILE = {
  firstName: 'Nishan',
  fullName: 'Nishan Bharati',
  role: 'Co-Founder & Full Stack Developer',
  tagline: 'co-founder & full stack developer building fast, scalable software for ambitious businesses',
  email: 'nishanbharati12345@gmail.com',
  phone: '+977 981-3796949',
  phoneHref: 'tel:+9779813796949',
  company: {
    name: 'Navya EdTech',
    href: 'https://navyaedtech.com/',
  },
  location: 'Nepal',
  /** Canonical origin; keep in sync with index.html, public/robots.txt and public/sitemap.xml. */
  siteUrl: 'https://nishanbharati.com.np',
  /** Drop the PDF at public/Nishan-Bharati-CV.pdf. */
  cvHref: '/Nishan-Bharati-CV.pdf',
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
export { default as HERO_PORTRAIT } from '../assets/nishan-portrait.webp';

const FIGMA = 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7';

export const ABOUT_DECORATIONS = {
  moon: `${FIGMA}/moon_icon.11395d36.png`,
  object: `${FIGMA}/p59_1.4659672e.png`,
  lego: `${FIGMA}/lego_icon-1.703bb594.png`,
  group: `${FIGMA}/Group_134-1.2e04f3ce.png`,
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
