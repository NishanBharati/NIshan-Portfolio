import { ArrowUpRight } from 'lucide-react';

type LiveProjectButtonProps = {
  href?: string;
  /** Project name, announced to screen readers so each button is distinguishable. */
  projectName?: string;
};

export default function LiveProjectButton({ href = '#', projectName }: LiveProjectButtonProps) {
  const external = href.startsWith('http');

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base"
    >
      Live Project
      {projectName && <span className="sr-only">: {projectName} (opens in a new tab)</span>}
      <ArrowUpRight
        aria-hidden
        className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:h-5 sm:w-5"
      />
    </a>
  );
}
