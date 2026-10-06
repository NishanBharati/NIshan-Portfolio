import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../lib/posts';

/** Replaces <body> classes for the lifetime of a layout (AdminLTE keys its layouts off body classes). */
export function useBodyClass(className: string) {
  useEffect(() => {
    const previous = document.body.className;
    document.body.className = className;
    return () => {
      document.body.className = previous;
    };
  }, [className]);
}

type Crumb = { label: string; to?: string };

export function PageHeader({ title, crumbs, actions }: { title: string; crumbs: Crumb[]; actions?: ReactNode }) {
  return (
    <div className="app-content-header">
      <div className="container-fluid">
        <div className="row align-items-center g-3">
          <div className="col-sm-6">
            <h3 className="mb-1">{title}</h3>
            <ol className="breadcrumb mb-0">
              {crumbs.map((crumb, i) =>
                crumb.to && i < crumbs.length - 1 ? (
                  <li key={crumb.label} className="breadcrumb-item">
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </li>
                ) : (
                  <li key={crumb.label} className="breadcrumb-item active" aria-current="page">
                    {crumb.label}
                  </li>
                ),
              )}
            </ol>
          </div>
          {actions && <div className="col-sm-6 d-flex justify-content-sm-end gap-2 flex-wrap">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function isScheduled(post: Pick<Post, 'status' | 'published_at'>): boolean {
  return post.status === 'published' && !!post.published_at && new Date(post.published_at) > new Date();
}

export function StatusBadge({ post }: { post: Pick<Post, 'status' | 'published_at'> }) {
  if (isScheduled(post)) return <span className="badge rounded-pill text-bg-info">Scheduled</span>;
  return post.status === 'published' ? (
    <span className="badge rounded-pill text-bg-success">Published</span>
  ) : (
    <span className="badge rounded-pill text-bg-secondary">Draft</span>
  );
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatRelative(iso: string): string {
  const diffSeconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) return rtf.format(Math.round(diffSeconds / seconds), unit);
  }
  return 'just now';
}

export function publicPostUrl(slug: string): string {
  return `${window.location.origin}/blog/${slug}`;
}

export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 py-5 text-secondary">
      <span className="spinner-border spinner-border-sm" aria-hidden />
      {label}
    </div>
  );
}
