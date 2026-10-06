import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeIn from './FadeIn';

type NotFoundContentProps = {
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
};

export default function NotFoundContent({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or has been moved.",
  backTo = '/',
  backLabel = 'Back home',
}: NotFoundContentProps) {
  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center gap-8 px-5 pb-20 pt-28 text-center">
      <FadeIn y={40}>
        <p className="hero-heading font-black uppercase leading-none tracking-tight" style={{ fontSize: 'clamp(5rem, 22vw, 280px)' }}>
          404
        </p>
      </FadeIn>
      <FadeIn y={20} delay={0.1} className="flex flex-col items-center gap-3">
        <h1 className="font-medium uppercase text-[#D7E2EA]" style={{ fontSize: 'clamp(1.1rem, 2.2vw, 2rem)' }}>
          {title}
        </h1>
        <p className="max-w-md font-light text-[#D7E2EA]/60">{message}</p>
      </FadeIn>
      <FadeIn y={20} delay={0.2}>
        <Link
          to={backTo}
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base"
        >
          <ArrowLeft aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {backLabel}
        </Link>
      </FadeIn>
    </section>
  );
}
