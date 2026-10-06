import { Plus } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { FAQS } from '../data/content';
import { getInitialData } from '../lib/initialData';

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(iso));

/** Visible FAQ; the FAQPage JSON-LD in lib/seo.ts is generated from the same FAQS array. */
export default function FaqSection() {
  const { lastUpdated } = getInitialData();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-section-white relative z-10 -mt-10 rounded-t-[40px] px-5 pb-28 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-32 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-40 md:pt-32"
    >
      <div className="mb-16 flex flex-col items-center gap-6 sm:mb-20 md:mb-24">
        <FadeIn y={20}>
          <span
            className="font-light uppercase tracking-widest text-[#0C0C0C]/60"
            style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
          >
            Frequently asked questions
          </span>
        </FadeIn>
        <FadeIn y={40}>
          <h2
            id="faq-heading"
            className="heading-dark text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            FAQ
          </h2>
        </FadeIn>
      </div>

      <ul className="mx-auto flex max-w-4xl flex-col gap-3 sm:gap-4">
        {FAQS.map((faq, i) => (
          <FadeIn as="li" key={faq.question} delay={Math.min(i, 4) * 0.05}>
            <details
              className="group rounded-[32px] border-2 border-[#0C0C0C]/15 bg-white px-6 text-[#0C0C0C] transition-colors duration-200 open:border-[#0C0C0C] hover:border-[#0C0C0C] sm:rounded-[40px] sm:px-8"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 sm:py-6 [&::-webkit-details-marker]:hidden">
                <h3 className="font-medium uppercase leading-snug" style={{ fontSize: 'clamp(1rem, 1.6vw, 1.3rem)' }}>
                  {faq.question}
                </h3>
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0C0C0C]/20 transition-all duration-300 group-open:rotate-45 group-open:border-[#0C0C0C] group-open:bg-[#0C0C0C] group-open:text-white"
                >
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <p
                className="max-w-3xl pb-6 font-light leading-relaxed text-[#0C0C0C]/70 sm:pb-8"
                style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)' }}
              >
                {faq.answer}
              </p>
            </details>
          </FadeIn>
        ))}
      </ul>

      {lastUpdated && (
        <p className="mt-10 text-center text-xs font-light uppercase tracking-widest text-[#0C0C0C]/65 sm:text-sm">
          Last updated <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
        </p>
      )}
    </section>
  );
}
