import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { EXPERIENCE } from '../data/content';

export default function ExperienceSection() {
  const timelineRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 0.7', 'end 0.6'] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section
      id="experience"
      className="bg-section-black relative z-10 -mt-10 rounded-t-[40px] px-5 pb-28 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-32 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-40 md:pt-32"
    >
      <div className="mb-16 flex flex-col items-center gap-6 sm:mb-20 md:mb-28">
        <FadeIn y={20}>
          <span
            className="font-light uppercase tracking-widest text-[#D7E2EA]/60"
            style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
          >
            Where i&apos;ve built my craft
          </span>
        </FadeIn>
        <FadeIn y={40}>
          <h2
            className="hero-heading text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Experience
          </h2>
        </FadeIn>
      </div>

      <ol ref={timelineRef} className="relative mx-auto max-w-5xl">
        {/* Rail: faint track with a fill that grows as you scroll */}
        <span aria-hidden className="absolute bottom-0 left-6 top-0 w-px bg-[#D7E2EA]/15 sm:left-7 md:left-1/2" />
        <motion.span
          aria-hidden
          className="absolute bottom-0 left-6 top-0 w-px origin-top bg-[#D7E2EA] sm:left-7 md:left-1/2"
          style={{ scaleY: lineScale }}
        />

        {EXPERIENCE.map((item, i) => {
          const alignRight = i % 2 === 1;
          return (
            <li key={item.organization} className="relative pb-10 pl-16 last:pb-0 sm:pb-14 sm:pl-20 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
              {/* Node */}
              <span
                aria-hidden
                className={`absolute left-6 top-8 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 sm:left-7 md:left-1/2 ${
                  item.current ? 'border-[#D7E2EA] bg-[#D7E2EA]' : 'border-[#D7E2EA] bg-[#0C0C0C]'
                }`}
              >
                {item.current && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D7E2EA]/60" />}
              </span>

              <FadeIn
                x={alignRight ? 40 : -40}
                y={0}
                duration={0.8}
                className={`flex flex-col gap-5 rounded-[40px] border-2 p-6 text-[#D7E2EA] transition-colors duration-200 sm:rounded-[50px] sm:p-8 ${
                  item.current ? 'border-[#D7E2EA] hover:bg-[#D7E2EA]/5' : 'border-[#D7E2EA]/30 hover:border-[#D7E2EA]'
                } ${alignRight ? 'md:col-start-2' : 'md:col-start-1'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full border border-[#D7E2EA]/30 px-4 py-1.5 text-xs font-light uppercase tracking-wider sm:text-sm">
                    {item.type}
                  </span>
                  {item.current ? (
                    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-emerald-400/90 sm:text-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {item.period ?? 'Current'}
                    </span>
                  ) : (
                    item.period && (
                      <span className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">{item.period}</span>
                    )
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-medium uppercase leading-tight" style={{ fontSize: 'clamp(1.15rem, 1.9vw, 1.75rem)' }}>
                    {item.role}
                  </h3>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex w-fit items-center gap-1.5 font-light uppercase tracking-widest text-[#D7E2EA]/70 transition-colors hover:text-[#D7E2EA]"
                      style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}
                    >
                      {item.organization}
                      <ArrowUpRight
                        aria-hidden
                        className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                  ) : (
                    <span className="font-light uppercase tracking-widest text-[#D7E2EA]/70" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}>
                      {item.organization}
                    </span>
                  )}
                </div>

                <p className="font-light leading-relaxed text-[#D7E2EA]/60" style={{ fontSize: 'clamp(0.85rem, 1.2vw, 1.05rem)' }}>
                  {item.description}
                </p>

                <ul className="flex flex-wrap gap-2">
                  {item.highlights.map((h) => (
                    <li key={h} className="rounded-full bg-[#D7E2EA]/[0.07] px-3.5 py-1 text-xs font-light uppercase tracking-wider">
                      {h}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
