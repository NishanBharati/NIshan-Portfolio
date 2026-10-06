import FadeIn from '../components/FadeIn';
import { SERVICES } from '../data/content';

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-section-white px-5 pb-28 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-32 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-40 md:pt-32"
    >
      <FadeIn y={40}>
        <h2
          className="mb-16 text-center font-black uppercase leading-none tracking-tight text-[#0C0C0C] sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Services
        </h2>
      </FadeIn>

      <ul className="mx-auto max-w-5xl">
        {SERVICES.map((service, i) => (
          <FadeIn
            as="li"
            key={service.name}
            delay={i * 0.1}
            className="flex items-center gap-6 border-t border-[rgba(12,12,12,0.15)] py-8 first:border-t-0 text-[#0C0C0C] sm:gap-10 sm:py-10 md:gap-14 md:py-12"
          >
            <span
              className="shrink-0 font-black leading-none"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)', color: '#0C0C0C' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-2 sm:gap-3">
              <h3 className="font-medium uppercase" style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}>
                {service.name}
              </h3>
              <p
                className="max-w-2xl font-light leading-relaxed"
                style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)', opacity: 0.6 }}
              >
                {service.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </ul>
    </section>
  );
}
