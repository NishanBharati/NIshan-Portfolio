import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type SiteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };

/** Client-side routing for internal paths; plain anchors for in-page hashes and external URLs. */
export default function SiteLink({ href, ...rest }: SiteLinkProps) {
  if (href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href)) {
    return <a href={href} {...rest} />;
  }
  return <Link to={href} {...rest} />;
}
