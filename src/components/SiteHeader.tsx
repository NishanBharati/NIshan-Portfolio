import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ArrowUpRight,
  FileText,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  type LucideIcon,
} from 'lucide-react';
import { NAV_LINKS, PROFILE, SOCIAL_LINKS } from '../data/content';
import logoMark from '../assets/logo-mark.svg';

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  github: Github,
  instagram: Instagram,
  linkedin: Linkedin,
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Derive section IDs from NAV_LINKS ("/#about" -> "about", "/blog" -> "blog")
const NAV_ITEMS = NAV_LINKS.map((link) => ({
  ...link,
  id: link.href.replace(/^\/#?/, ''),
}));
const SECTION_IDS = NAV_ITEMS.filter((item) => item.href.startsWith('/#')).map((item) => item.id);

export default function SiteHeader() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  // Thin reading-progress bar along the bottom edge of the nav pill
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  // Track scroll: compact styling, hide-on-scroll-down, and active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      // Hide when scrolling down past the hero, reveal as soon as the user scrolls up
      const delta = scrollY - lastScrollY.current;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && scrollY > 400);
        lastScrollY.current = scrollY;
      }

      if (location.pathname.startsWith('/blog')) {
        setActiveSection('blog');
        return;
      }

      if (location.pathname !== '/' || scrollY < 180) {
        setActiveSection('');
        return;
      }

      let currentSection = '';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Active when section top is near the upper third of screen
        if (rect.top <= 240 && rect.bottom >= 150) {
          currentSection = id;
        }
      }

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close mobile menu on click outside or escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Smooth scroll handler for anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith('/#') || href.startsWith('#')) {
      const targetId = href.replace(/^\/?#/, '');
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `/#${targetId}`);
          setActiveSection(targetId);
        }
      }
    }
  };

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    activeSection === item.id || (item.href === '/blog' && location.pathname.startsWith('/blog'));

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: hidden && !isMobileMenuOpen ? '-120%' : 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className={`fixed top-0 left-0 right-0 z-50 transition-[padding] duration-300 pointer-events-none ${
        scrolled ? 'py-2.5 sm:py-3' : 'py-4 sm:py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pointer-events-auto">
        <nav
          className={`relative flex items-center justify-between px-2 sm:px-2.5 py-2 rounded-full transition-all duration-300 ${
            scrolled
              ? 'bg-[#0c0c0c]/90 backdrop-blur-xl border border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.08)_inset]'
              : 'bg-[#0c0c0c]/60 backdrop-blur-md border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.25)]'
          }`}
          aria-label="Main Navigation"
        >
          {/* Left Brand & Logo */}
          <div className="flex items-center gap-3 pl-1">
            <Link
              to="/#top"
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.pushState(null, '', '/');
                  setActiveSection('');
                }
              }}
              className="group flex items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <img
                  src={logoMark}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 transition-transform duration-500 ease-out group-hover:rotate-90"
                />
              </span>
              <span className="flex flex-col">
                <span className="text-sm sm:text-[15px] font-semibold leading-tight tracking-tight text-white">
                  {PROFILE.firstName}
                  <span className="sr-only"> Bharati, home</span>
                </span>
                <span className="hidden sm:block text-[10px] font-normal uppercase leading-none tracking-[0.18em] text-white/60">
                  Full Stack
                </span>
              </span>
            </Link>

            {/* Live Status Pill (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 pl-3 ml-1 border-l border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-white/70 tracking-wide select-none">Available for work</span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <ul className="hidden md:flex items-center gap-0.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative isolate block px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      active ? 'text-[#0c0c0c]' : 'text-white/65 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeNavPill"
                        className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Section: Actions & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {PROFILE.cvHref && (
              <a
                href={PROFILE.cvHref}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide text-white/75 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title="Download Nishan's CV"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>CV</span>
              </a>
            )}

            <Link
              to="/#contact"
              onClick={(e) => handleNavClick(e, '/#contact')}
              className="group hidden sm:inline-flex items-center gap-1.5 pl-4 pr-3 py-2 rounded-full bg-white text-xs font-semibold uppercase tracking-wider text-[#0c0c0c] transition-all duration-200 hover:bg-white/85 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c]"
            >
              <span>Let&apos;s Talk</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0c0c0c] text-white transition-transform duration-200 group-hover:rotate-45">
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>

            {/* Mobile Menu Hamburger Button (lines morph into an X) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0c0c0c] transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c]"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
            >
              <span aria-hidden className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 h-[1.5px] w-4 rounded-full bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'top-[5px] rotate-45' : 'top-[2px]'
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] rounded-full bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'top-[5px] w-4 -rotate-45' : 'top-[8px] w-2.5'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Scroll progress */}
          <span aria-hidden className="pointer-events-none absolute inset-x-6 -bottom-px h-px overflow-hidden rounded-full">
            <motion.span className="block h-full w-full origin-left bg-white/70" style={{ scaleX: progress }} />
          </span>
        </nav>

        {/* Mobile Navigation Dropdown Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="md:hidden mt-2.5 origin-top rounded-3xl bg-[#0c0c0c]/95 backdrop-blur-2xl border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Mobile Status Header */}
              <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-white/70 tracking-wide">Available for new projects</span>
                </div>
                <span className="text-[10px] text-white/35 uppercase tracking-widest font-mono">Menu</span>
              </div>

              {/* Mobile Nav Links */}
              <motion.ul
                className="flex flex-col"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
              >
                {NAV_ITEMS.map((item, i) => {
                  const active = isActive(item);
                  return (
                    <motion.li
                      key={item.label}
                      variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                      <Link
                        to={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        aria-current={active ? 'page' : undefined}
                        className={`group flex items-center gap-4 px-3 py-3 rounded-2xl transition-colors ${
                          active ? 'bg-white text-[#0c0c0c]' : 'text-white/80 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className={`font-mono text-[10px] ${active ? 'text-[#0c0c0c]/50' : 'text-white/30'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-base font-medium uppercase tracking-wide">{item.label}</span>
                        <ArrowUpRight
                          className={`ml-auto h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                            active ? 'text-[#0c0c0c]' : 'text-white/30'
                          }`}
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>

              {/* Mobile Actions */}
              <div className={`mt-3 pt-3 border-t border-white/[0.08] grid gap-2 ${PROFILE.cvHref ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <Link
                  to="/#contact"
                  onClick={(e) => handleNavClick(e, '/#contact')}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-white text-xs font-semibold tracking-wider uppercase text-[#0c0c0c] transition-transform active:scale-[0.98]"
                >
                  <span>Let&apos;s Talk</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                {PROFILE.cvHref && (
                  <a
                    href={PROFILE.cvHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-medium tracking-wider uppercase text-white border border-white/15 hover:bg-white/10 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>CV</span>
                  </a>
                )}
              </div>

              {/* Social Links row in mobile menu */}
              <div className="mt-3 flex items-center justify-center gap-2">
                {SOCIAL_LINKS.map(({ label, href, icon }) => {
                  const Icon = SOCIAL_ICONS[icon];
                  return (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-[#0c0c0c] hover:bg-white transition-colors"
                      aria-label={`${PROFILE.fullName} on ${label}`}
                      title={label}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
