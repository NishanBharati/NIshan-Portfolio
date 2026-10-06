import type { CSSProperties } from 'react';

/** The signature gradient pill, shared by links and the inquiry form's submit button. */
export const GRADIENT_PILL_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-medium uppercase tracking-widest text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base';

export const GRADIENT_PILL_STYLE: CSSProperties = {
  background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
  boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
  outline: '2px solid white',
  outlineOffset: '-3px',
};

type ContactButtonProps = {
  href?: string;
  className?: string;
};

export default function ContactButton({ href = '#contact', className = '' }: ContactButtonProps) {
  return (
    <a href={href} className={`${GRADIENT_PILL_CLASS} ${className}`} style={GRADIENT_PILL_STYLE}>
      Contact Me
    </a>
  );
}
