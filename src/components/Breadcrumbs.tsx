import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type Crumb = { label: string; to?: string };

/** Visible breadcrumb trail; mirrors the BreadcrumbList JSON-LD emitted for the same page. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li className={last ? 'max-w-[16rem] truncate text-[#D7E2EA] sm:max-w-md' : undefined}>
                {item.to && !last ? (
                  <Link to={item.to} className="transition-colors duration-200 hover:text-[#D7E2EA]">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined}>{item.label}</span>
                )}
              </li>
              {!last && (
                <li aria-hidden className="flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
