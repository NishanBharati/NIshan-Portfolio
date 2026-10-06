import { ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { MENTIONS } from '../data/content';

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(iso));

/**
 * "In the press": third-party articles, interviews, talks and listings. Renders nothing until
 * MENTIONS in content.ts has real entries, so the page never shows an empty or placeholder block.
 */
export default function MentionsSection() {
  if (MENTIONS.length === 0) return null;

  return (
    <section
      id="press"
      aria-labelledby="press-heading"
      className="bg-section-black relative z-10 -mt-10 rounded-t-[40px] px-5 pb-28 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-32 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-40 md:pt-32"
    >
      <FadeIn y={40}>
        <h2
          id="press-heading"
          className="hero-heading mb-16 text-center font-black uppercase leading-none tracking-tight sm:mb-20"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          In the press
        </h2>
      </FadeIn>
      <ul className="mx-auto flex max-w-5xl flex-col">
        {MENTIONS.map((m) => (
          <li key={m.url} className="border-t border-[#D7E2EA]/15 first:border-t-0">
            <a
              href={m.url}
              target="_blank"
              rel="noopener"
              className="group flex items-center justify-between gap-6 py-6 text-[#D7E2EA] sm:py-8"
            >
              <span className="flex flex-col gap-1">
                <span className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">
                  {m.publisher} · {m.kind} · <time dateTime={m.date}>{formatDate(m.date)}</time>
                </span>
                <span className="font-medium uppercase" style={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)' }}>
                  {m.title}
                </span>
              </span>
              <ArrowUpRight aria-hidden className="h-6 w-6 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
