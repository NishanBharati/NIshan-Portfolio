import { ArrowUpRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPostDate, type PostSummary } from '../lib/posts';

export const BRAND_GRADIENT = 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)';

/** Cards default to the dark page palette; `light` is for cards placed on a light section. */
export type BlogCardTone = 'dark' | 'light';

const TONES = {
  dark: {
    card: 'border-[#D7E2EA]/30 text-[#D7E2EA] hover:border-[#D7E2EA] hover:bg-[#D7E2EA]/5',
    muted: 'text-[#D7E2EA]/60',
    skeletonBorder: 'border-[#D7E2EA]/10',
    skeletonFill: 'bg-[#D7E2EA]/10',
    empty: 'border-[#D7E2EA]/20 text-[#D7E2EA]',
  },
  light: {
    card: 'border-[#0C0C0C]/15 bg-white/60 text-[#0C0C0C] hover:border-[#0C0C0C] hover:bg-white',
    muted: 'text-[#0C0C0C]/60',
    skeletonBorder: 'border-[#0C0C0C]/10',
    skeletonFill: 'bg-[#0C0C0C]/10',
    empty: 'border-[#0C0C0C]/20 text-[#0C0C0C]',
  },
} as const;

export default function BlogCard({ post, tone = 'dark' }: { post: PostSummary; tone?: BlogCardTone }) {
  const t = TONES[tone];
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group flex h-full flex-col gap-5 rounded-[40px] border-2 p-4 transition-colors duration-300 sm:rounded-[50px] sm:p-5 ${t.card}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[30px] sm:rounded-[38px]">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: BRAND_GRADIENT }}>
            <Newspaper aria-hidden className="h-12 w-12 text-white/70" strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-2 pb-2">
        <p className={`text-xs font-light uppercase tracking-widest sm:text-sm ${t.muted}`}>
          <time dateTime={post.published_at ?? undefined}>{formatPostDate(post.published_at, 'short')}</time>
          <span aria-hidden> · </span>
          {post.reading_minutes} min read
        </p>
        <h3 className="font-medium uppercase leading-tight" style={{ fontSize: 'clamp(1.1rem, 1.7vw, 1.5rem)' }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className={`line-clamp-3 font-light leading-relaxed ${t.muted}`} style={{ fontSize: 'clamp(0.85rem, 1.1vw, 1rem)' }}>
            {post.excerpt}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-xs font-medium uppercase tracking-widest sm:text-sm">
          Read article
          <ArrowUpRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

export function BlogCardSkeleton({ tone = 'dark' }: { tone?: BlogCardTone }) {
  const t = TONES[tone];
  return (
    <div aria-hidden className={`flex flex-col gap-5 rounded-[40px] border-2 p-4 sm:rounded-[50px] sm:p-5 ${t.skeletonBorder}`}>
      <div className={`aspect-[16/10] animate-pulse rounded-[30px] sm:rounded-[38px] ${t.skeletonFill}`} />
      <div className="flex flex-col gap-3 px-2 pb-2">
        <div className={`h-3 w-1/3 animate-pulse rounded-full ${t.skeletonFill}`} />
        <div className={`h-5 w-4/5 animate-pulse rounded-full ${t.skeletonFill}`} />
        <div className={`h-3 w-full animate-pulse rounded-full ${t.skeletonFill}`} />
        <div className={`h-3 w-2/3 animate-pulse rounded-full ${t.skeletonFill}`} />
      </div>
    </div>
  );
}

export function BlogEmptyState({ error = false, tone = 'dark' }: { error?: boolean; tone?: BlogCardTone }) {
  const t = TONES[tone];
  return (
    <div className={`mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[40px] border-2 border-dashed px-8 py-14 text-center sm:rounded-[50px] ${t.empty}`}>
      <Newspaper aria-hidden className="h-10 w-10 opacity-60" strokeWidth={1.25} />
      <p className="font-medium uppercase tracking-wider">{error ? 'Articles are unavailable' : 'Articles are on the way'}</p>
      <p className={`font-light ${t.muted}`}>
        {error
          ? "Something went wrong while loading the blog. Please try again in a moment."
          : 'New insights on software, design and building products in Nepal are coming soon.'}
      </p>
    </div>
  );
}
