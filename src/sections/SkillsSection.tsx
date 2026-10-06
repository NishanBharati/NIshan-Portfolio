import { Briefcase, Cloud, Code2, Database, Server, type LucideIcon } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { SKILL_GROUPS, type SkillGroup } from '../data/content';

const ICONS: Record<SkillGroup['icon'], LucideIcon> = {
  frontend: Code2,
  backend: Server,
  data: Database,
  cloud: Cloud,
  product: Briefcase,
};

// 6-column grid on large screens: three cards on the first row, two wider ones on the second.
const SPANS = ['lg:col-span-2', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-3', 'md:col-span-2 lg:col-span-3'];

export default function SkillsSection() {
  return (
    <section
      id="skills"
      className="bg-section-black relative z-10 -mt-10 rounded-t-[40px] px-5 pb-28 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-32 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-40 md:pt-32"
    >
      <div className="mb-16 flex flex-col items-center gap-6 sm:mb-20 md:mb-28">
        <FadeIn y={20}>
          <span
            className="font-light uppercase tracking-widest text-[#D7E2EA]/60"
            style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
          >
            The stack behind the work
          </span>
        </FadeIn>
        <FadeIn y={40}>
          <h2
            className="hero-heading text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Skills
          </h2>
        </FadeIn>
      </div>

      <ul className="mx-auto grid max-w-6xl gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-6">
        {SKILL_GROUPS.map((group, i) => {
          const Icon = ICONS[group.icon];
          return (
            <FadeIn
              as="li"
              key={group.title}
              delay={i * 0.1}
              className={`flex flex-col gap-6 rounded-[40px] border-2 border-[#D7E2EA] p-6 text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/5 sm:rounded-[50px] sm:p-8 md:gap-8 ${SPANS[i] ?? ''}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#D7E2EA]/30 sm:h-14 sm:w-14">
                    <Icon aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-medium uppercase leading-tight" style={{ fontSize: 'clamp(1.05rem, 1.6vw, 1.5rem)' }}>
                    {group.title}
                  </h3>
                </div>
                <span className="font-black leading-none text-[#D7E2EA]/20" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <ul className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-[#D7E2EA]/30 px-4 py-1.5 text-xs font-light uppercase tracking-wider sm:text-sm"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </FadeIn>
          );
        })}
      </ul>
    </section>
  );
}
