import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import DownloadCvButton from '../components/DownloadCvButton';
import { ArrowUpRight } from 'lucide-react';
import { ABOUT_DECORATIONS, ABOUT_TEXT, PROFILE, WHO_IS } from '../data/content';

export default function AboutSection() {
  return (
    <section
      id="about"
      className="bg-section-white relative z-10 flex min-h-screen items-center justify-center overflow-hidden rounded-t-[40px] px-5 pb-32 pt-20 sm:rounded-t-[50px] sm:px-8 md:rounded-t-[60px] md:px-10"
    >
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]"
      >
        <img src={ABOUT_DECORATIONS.moon.src} width={ABOUT_DECORATIONS.moon.width} height={ABOUT_DECORATIONS.moon.height} alt="" loading="lazy" decoding="async" className="h-auto w-full" />
      </FadeIn>
      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]"
      >
        <img src={ABOUT_DECORATIONS.object.src} width={ABOUT_DECORATIONS.object.width} height={ABOUT_DECORATIONS.object.height} alt="" loading="lazy" decoding="async" className="h-auto w-full" />
      </FadeIn>
      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]"
      >
        <img src={ABOUT_DECORATIONS.lego.src} width={ABOUT_DECORATIONS.lego.width} height={ABOUT_DECORATIONS.lego.height} alt="" loading="lazy" decoding="async" className="h-auto w-full" />
      </FadeIn>
      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="pointer-events-none absolute bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]"
      >
        <img src={ABOUT_DECORATIONS.group.src} width={ABOUT_DECORATIONS.group.width} height={ABOUT_DECORATIONS.group.height} alt="" loading="lazy" decoding="async" className="h-auto w-full" />
      </FadeIn>

      <div className="relative z-10 flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn y={20}>
            <a
              href={PROFILE.company.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0C0C0C]/20 px-5 py-2 text-xs font-medium uppercase tracking-widest text-[#0C0C0C] transition-colors duration-200 hover:border-[#0C0C0C] hover:bg-[#0C0C0C]/5 sm:text-sm"
            >
              <span className="h-2 w-2 rounded-full bg-[#B600A8]" aria-hidden />
              Co-Founder @ {PROFILE.company.name}
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </FadeIn>
          <FadeIn delay={0} y={40}>
            <h2
              className="heading-dark text-center font-black uppercase leading-none tracking-tight"
              style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
            >
              About me
            </h2>
          </FadeIn>
          <AnimatedText
            text={ABOUT_TEXT}
            className="max-w-[560px] text-center font-medium leading-relaxed text-[#0C0C0C]"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ContactButton />
          <DownloadCvButton tone="light" />
        </div>

        {/* Direct, quotable answer for search and answer engines (also used in meta and JSON-LD). */}
        <FadeIn y={30} className="w-full max-w-4xl">
          <div className="flex flex-col gap-8 rounded-[40px] border-2 border-[#0C0C0C]/15 bg-white p-6 text-[#0C0C0C] sm:rounded-[50px] sm:p-10">
            <div className="flex flex-col gap-4">
              <h3 className="font-medium uppercase" style={{ fontSize: 'clamp(1.15rem, 2vw, 1.75rem)' }}>
                Who is {PROFILE.fullName}?
              </h3>
              <p className="font-light leading-relaxed text-[#0C0C0C]/75" style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)' }}>
                {WHO_IS}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[#0C0C0C]/10 pt-6 md:grid-cols-4">
              {[
                ['Role', PROFILE.jobTitle],
                ['Company', `Co-Founder, ${PROFILE.company.name}`],
                ['Based in', PROFILE.location],
                ['Core stack', 'MERN · Next.js · Laravel'],
              ].map(([term, value]) => (
                <div key={term} className="flex flex-col gap-1">
                  <dt className="text-xs font-light uppercase tracking-widest text-[#0C0C0C]/60">{term}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
