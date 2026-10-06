import Magnet from '../components/Magnet';
import Reveal from '../components/Reveal';
import ContactButton from '../components/ContactButton';
import { HERO_PORTRAIT, HERO_PORTRAIT_SIZES, HERO_PORTRAIT_SRCSET, PROFILE } from '../data/content';

export default function HeroSection() {
  return (
    <section className="relative flex h-screen flex-col pt-20 sm:pt-24 md:pt-20" style={{ overflowX: 'clip' }}>
      <div className="overflow-hidden">
        <Reveal rise y={110} delay={0.05}>
          {/* Sizes scaled from the 12-char original so the 14-char name still spans the viewport */}
          <h1 className="hero-heading mt-2 sm:mt-0 md:-mt-3 w-full whitespace-nowrap text-center text-[12vw] font-black uppercase leading-none tracking-tight sm:text-[12.85vw] md:text-[13.7vw] lg:text-[15vw]">
            Hi, i&apos;m {PROFILE.firstName.toLowerCase()}
            {/* Completes the H1 for crawlers and screen readers: "Hi, i'm nishan Bharati, Full Stack Developer..." */}
            <span className="sr-only">
              {' '}
              Bharati, {PROFILE.jobTitle} and Co-Founder of {PROFILE.company.name} in {PROFILE.location}
            </span>
          </h1>
        </Reveal>
      </div>

      {/* Portrait: plain wrapper owns positioning so Reveal/Magnet transforms don't clobber it */}
      <div className="absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:bottom-0 sm:top-auto sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]">
        <Reveal y={30} delay={0.6}>
          <Magnet
            padding={150}
            strength={3}
            activeTransition="transform 0.3s ease-out"
            inactiveTransition="transform 0.6s ease-in-out"
            className="w-full"
          >
            <img
              src={HERO_PORTRAIT}
              srcSet={HERO_PORTRAIT_SRCSET}
              sizes={HERO_PORTRAIT_SIZES}
              alt={`Portrait of ${PROFILE.fullName}, ${PROFILE.jobTitle} in ${PROFILE.location}`}
              width={1040}
              height={1040}
              fetchpriority="high"
              className="portrait-fade block h-auto w-full select-none"
              draggable={false}
            />
          </Magnet>
        </Reveal>
      </div>

      <div className="mt-auto flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
        <Reveal y={20} delay={0.35}>
          <p
            className="max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            {PROFILE.tagline}
          </p>
        </Reveal>
        <Reveal y={20} delay={0.5} className="relative z-20">
          <ContactButton />
        </Reveal>
      </div>
    </section>
  );
}
