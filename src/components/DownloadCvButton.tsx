import { Download } from 'lucide-react';
import { PROFILE } from '../data/content';

const TONES = {
  dark: 'border-[#D7E2EA] text-[#D7E2EA] hover:bg-[#D7E2EA]/10',
  light: 'border-[#0C0C0C] text-[#0C0C0C] hover:bg-[#0C0C0C] hover:text-white',
} as const;

/** Outline companion to the gradient ContactButton; serves the PDF from public/. `light` is for white sections. */
export default function DownloadCvButton({ className = '', tone = 'dark' }: { className?: string; tone?: keyof typeof TONES }) {
  if (!PROFILE.cvHref) return null;
  return (
    <a
      href={PROFILE.cvHref}
      download={`${PROFILE.fullName.replace(/\s+/g, '-')}-CV.pdf`}
      className={`group inline-flex items-center justify-center gap-2 rounded-full border-2 px-8 py-3 text-xs font-medium uppercase tracking-widest transition-colors duration-200 ${TONES[tone]} sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base ${className}`}
    >
      Download CV
      <Download aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5 sm:h-5 sm:w-5" />
      <span className="sr-only">(PDF)</span>
    </a>
  );
}
