import { ArrowUpRight, Building2, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
import InquiryForm from '../components/InquiryForm';
import SocialLinks from '../components/SocialLinks';
import { PROFILE } from '../data/content';

const DETAILS: { icon: LucideIcon; label: string; value: string; href?: string }[] = [
  { icon: Mail, label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}` },
  { icon: Phone, label: 'Phone', value: PROFILE.phone, href: PROFILE.phoneHref },
  { icon: Building2, label: 'Company', value: `Co-Founder, ${PROFILE.company.name}`, href: PROFILE.company.href },
  { icon: MapPin, label: 'Based in', value: PROFILE.location },
];

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="bg-section-black relative z-10 -mt-10 scroll-mt-8 rounded-t-[40px] px-5 pb-28 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-32 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-40 md:pt-32"
    >
      <div className="mb-16 flex flex-col items-center gap-6 sm:mb-20 md:mb-24">
        <FadeIn y={20}>
          <span
            className="font-light uppercase tracking-widest text-[#D7E2EA]/60"
            style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
          >
            Got a project in mind?
          </span>
        </FadeIn>
        <FadeIn y={40}>
          <h2
            className="hero-heading text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Let&apos;s talk
          </h2>
        </FadeIn>
        <AnimatedText
          text="Whether it's a new product, a website or a business problem that needs the right software, my team at Navya EdTech and i would love to hear about it."
          className="max-w-[560px] text-center font-medium leading-relaxed text-[#D7E2EA]"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
        {/* Contact details */}
        <FadeIn x={-40} y={0} duration={0.9} className="flex flex-col gap-4">
          <ul className="flex flex-col gap-3 sm:gap-4">
            {DETAILS.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#D7E2EA]/30 sm:h-14 sm:w-14">
                    <Icon aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs font-light uppercase tracking-widest opacity-60 sm:text-sm">{label}</span>
                    <span className="truncate font-medium" style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)' }}>
                      {value}
                    </span>
                  </span>
                </>
              );
              const base =
                'flex items-center gap-4 rounded-[40px] border-2 border-[#D7E2EA]/30 px-5 py-4 text-[#D7E2EA] sm:gap-5 sm:rounded-[50px] sm:px-6';
              return (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={`group ${base} transition-colors duration-200 hover:border-[#D7E2EA] hover:bg-[#D7E2EA]/5`}
                    >
                      {content}
                      <ArrowUpRight
                        aria-hidden
                        className="ml-auto h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                  ) : (
                    <div className={base}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-4 rounded-[40px] border-2 border-[#D7E2EA]/30 px-6 py-6 sm:rounded-[50px] sm:px-8">
            <span className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">Follow along</span>
            <SocialLinks />
          </div>
        </FadeIn>

        {/* Inquiry form */}
        <FadeIn
          x={40}
          y={0}
          duration={0.9}
          delay={0.1}
          className="relative rounded-[40px] border-2 border-[#D7E2EA] p-6 sm:rounded-[50px] sm:p-8 md:rounded-[60px] md:p-10"
        >
          <div className="mb-8 flex flex-col gap-2">
            <h3 className="font-medium uppercase text-[#D7E2EA]" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 2rem)' }}>
              Send an inquiry
            </h3>
            <p className="font-light text-[#D7E2EA]/60" style={{ fontSize: 'clamp(0.85rem, 1.2vw, 1rem)' }}>
              Share a few details and I&apos;ll get back to you with next steps.
            </p>
          </div>
          <InquiryForm />
        </FadeIn>
      </div>
    </section>
  );
}
