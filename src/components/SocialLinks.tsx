import { Facebook, Github, Instagram, Linkedin, type LucideIcon } from 'lucide-react';
import { PROFILE, SOCIAL_LINKS } from '../data/content';

const ICONS: Record<(typeof SOCIAL_LINKS)[number]['icon'], LucideIcon> = {
  facebook: Facebook,
  github: Github,
  instagram: Instagram,
  linkedin: Linkedin,
};

export default function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {SOCIAL_LINKS.map(({ label, href, icon }) => {
        const Icon = ICONS[icon];
        return (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="me noopener noreferrer"
              aria-label={`${PROFILE.fullName} on ${label} (opens in a new tab)`}
              title={label}
              className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D7E2EA]/30 text-[#D7E2EA] transition-colors duration-200 hover:border-[#D7E2EA] hover:bg-[#D7E2EA]/10 sm:h-14 sm:w-14"
            >
              <Icon
                aria-hidden
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 sm:h-6 sm:w-6"
                strokeWidth={1.5}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
