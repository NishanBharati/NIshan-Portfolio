import { GraduationCap } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { EDUCATION } from '../data/content';

export default function EducationSection() {
  return (
    <section
      id="education"
      className="bg-section-white relative z-10 -mt-10 rounded-t-[40px] px-5 pb-28 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-32 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-40 md:pt-32"
    >
      <div className="mb-16 flex flex-col items-center gap-6 sm:mb-20 md:mb-28">
        <FadeIn y={20}>
          <span
            className="font-light uppercase tracking-widest text-[#0C0C0C]/60"
            style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
          >
            The foundation
          </span>
        </FadeIn>
        <FadeIn y={40}>
          <h2
            className="heading-dark text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Education
          </h2>
        </FadeIn>
      </div>

      <ol className="mx-auto grid max-w-6xl gap-3 sm:gap-4 lg:grid-cols-3">

        {EDUCATION.map((item, i) => {
          const latest = i === EDUCATION.length - 1;
          return (
            <FadeIn
              as="li"
              key={item.level}
              delay={i * 0.12}
              className={`relative flex flex-col gap-8 rounded-[40px] border-2 p-6 transition-colors duration-200 sm:rounded-[50px] sm:p-8 ${
                latest
                  ? 'border-[#0C0C0C] bg-[#0C0C0C] text-white'
                  : 'border-[#0C0C0C]/15 bg-white text-[#0C0C0C] hover:border-[#0C0C0C]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 sm:h-14 sm:w-14 ${
                    latest ? 'border-white/30' : 'border-[#0C0C0C]/20'
                  }`}
                >
                  <GraduationCap aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                </span>
                <span className={`text-xs font-light uppercase tracking-widest sm:text-sm ${latest ? 'text-white/60' : 'text-[#0C0C0C]/50'}`}>
                  {item.period ?? `Step ${String(i + 1).padStart(2, '0')}`}
                </span>
              </div>

              <span className="font-black leading-none tracking-tight" style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)' }}>
                {item.level}
              </span>

              <div className="mt-auto flex flex-col gap-2">
                <h3 className="font-medium uppercase leading-tight" style={{ fontSize: 'clamp(1.05rem, 1.6vw, 1.4rem)' }}>
                  {item.qualification}
                </h3>
                <p className={`font-light leading-relaxed ${latest ? 'text-white/70' : 'text-[#0C0C0C]/60'}`}>{item.institution}</p>
                <span
                  className={`mt-2 w-fit rounded-full border px-4 py-1.5 text-xs font-light uppercase tracking-wider sm:text-sm ${
                    latest ? 'border-white/30' : 'border-[#0C0C0C]/20'
                  }`}
                >
                  {item.field}
                </span>
              </div>
            </FadeIn>
          );
        })}
      </ol>
    </section>
  );
}
