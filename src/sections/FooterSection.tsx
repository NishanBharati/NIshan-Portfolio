import { ArrowUp, ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import SiteLink from '../components/SiteLink';
import SocialLinks from '../components/SocialLinks';
import { NAV_LINKS, PROFILE } from '../data/content';
import logo from '../assets/logo-mark.svg';

const columnHeading = 'mb-5 text-xs font-light uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm';
const footerLink =
  'text-sm font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 sm:text-base';

/** `overlap` tucks the footer over the bottom of a coloured section above it (home page). */
export default function FooterSection({ overlap = false }: { overlap?: boolean }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`relative z-10 rounded-t-[40px] bg-[#0C0C0C] px-6 border-t-2 border-[#D7E2EA]/20 ${overlap ? '-mt-10 sm:-mt-12 md:-mt-14' : ''} pb-8 pt-16 sm:rounded-t-[50px] sm:pb-10 sm:pt-20 md:rounded-t-[60px] md:px-10 md:pt-24`}
      style={{ overflowX: 'clip' }}
    >
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <FadeIn y={20} className="flex flex-col gap-5">
          <img src={logo} alt="" width={64} height={64} loading="lazy" className="h-16 w-16 object-contain object-left" />
          <p className="hero-heading font-black uppercase leading-none tracking-tight" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}>
            {PROFILE.fullName}
          </p>
          <p className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">{PROFILE.role}</p>
          <p className="max-w-sm font-light leading-relaxed text-[#D7E2EA]/80">
            Building fast, scalable software for ambitious businesses with the team at{' '}
            <a
              href={PROFILE.company.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D7E2EA] underline decoration-[#B600A8] underline-offset-4 transition-opacity hover:opacity-70"
            >
              {PROFILE.company.name}
            </a>
            .
          </p>
          <SocialLinks className="mt-1" />
        </FadeIn>

        <FadeIn as="nav" y={20} delay={0.1} aria-label="Footer">
          <p className={columnHeading}>Explore</p>
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <SiteLink href={link.href} className={footerLink}>
                  {link.label}
                </SiteLink>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn y={20} delay={0.2}>
          <p className={columnHeading}>Get in touch</p>
          <ul className="flex flex-col gap-3">
            <li>
              <a href={`mailto:${PROFILE.email}`} className="break-all font-light text-[#D7E2EA] transition-opacity hover:opacity-70">
                {PROFILE.email}
              </a>
            </li>
            <li>
              <a href={PROFILE.phoneHref} className="font-light text-[#D7E2EA] transition-opacity hover:opacity-70">
                {PROFILE.phone}
              </a>
            </li>
            <li className="font-light text-[#D7E2EA]/60">{PROFILE.location}</li>
            <li>
              <a
                href={PROFILE.cvHref}
                download={`${PROFILE.fullName.replace(/\s+/g, '-')}-CV.pdf`}
                className="inline-flex items-center gap-2 font-light text-[#D7E2EA] underline decoration-[#B600A8] underline-offset-4 transition-opacity hover:opacity-70"
              >
                Download CV <span className="sr-only">(PDF)</span>
              </a>
            </li>
            <li className="pt-3">
              <SiteLink
                href="/#contact"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 sm:text-sm"
              >
                Start a project
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </SiteLink>
            </li>
          </ul>
        </FadeIn>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col-reverse items-center gap-5 border-t border-[#D7E2EA]/15 pt-8 sm:mt-20 sm:flex-row sm:justify-between">
        <p className="text-center text-xs font-light uppercase tracking-wider text-[#D7E2EA]/60 sm:text-left sm:text-sm">
          &copy; {year} {PROFILE.fullName}. All rights reserved.
        </p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 sm:text-sm"
        >
          Back to top
          <ArrowUp aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </footer>
  );
}
