import { useMemo, useState } from 'react';
import FadeIn from '../components/FadeIn';
import Breadcrumbs from '../components/Breadcrumbs';
import Reveal from '../components/Reveal';
import { PROFILE } from '../data/content';
import BlogCard, { BlogCardSkeleton, BlogEmptyState } from '../components/BlogCard';
import { usePublishedPosts } from '../lib/usePublishedPosts';
import { blogIndexSeo } from '../lib/seo';
import { useSeo } from '../lib/useSeo';

const ALL = 'All';

export default function BlogIndexPage() {
  const state = usePublishedPosts();
  const [activeTag, setActiveTag] = useState(ALL);

  const posts = state.status === 'ready' ? state.posts : [];
  useSeo(blogIndexSeo({ posts }));
  const tags = useMemo(() => [ALL, ...Array.from(new Set(posts.flatMap((p) => p.tags))).sort()], [posts]);
  const visible = activeTag === ALL ? posts : posts.filter((p) => p.tags.includes(activeTag));

  return (
    <>
      <section className="px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 md:px-10 md:pb-32 md:pt-36">
        <div className="mb-14 flex flex-col items-center gap-6 text-center sm:mb-20">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />
          <Reveal y={20}>
            <span
              className="font-light uppercase tracking-widest text-[#D7E2EA]/60"
              style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
            >
              Insights &amp; articles
            </span>
          </Reveal>
          <div className="overflow-hidden">
            <Reveal rise y={120} delay={0.05}>
              <h1
                className="hero-heading font-black uppercase leading-none tracking-tight"
                style={{ fontSize: 'clamp(3.5rem, 15vw, 220px)' }}
              >
                Blog
              </h1>
            </Reveal>
          </div>
          <Reveal y={20} delay={0.2}>
            <p
              className="max-w-[560px] font-medium leading-relaxed text-[#D7E2EA]"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
            >
              Articles by {PROFILE.fullName} on full stack development, shipping software for real businesses and what we
              learn building {PROFILE.company.name}.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto max-w-7xl">
          {tags.length > 2 && (
            <FadeIn y={20} className="mb-10 flex flex-wrap justify-center gap-2 sm:mb-14">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  aria-pressed={activeTag === tag}
                  className={`rounded-full border px-5 py-2 text-xs font-medium uppercase tracking-wider transition-colors duration-200 sm:text-sm ${
                    activeTag === tag
                      ? 'border-[#D7E2EA] bg-[#D7E2EA] text-[#0C0C0C]'
                      : 'border-[#D7E2EA]/30 text-[#D7E2EA] hover:border-[#D7E2EA]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </FadeIn>
          )}

          {state.status === 'loading' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading articles">
              {Array.from({ length: 6 }, (_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          )}

          {visible.length > 0 && (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((post, i) => (
                <FadeIn as="li" key={post.id} delay={(i % 3) * 0.1}>
                  <BlogCard post={post} />
                </FadeIn>
              ))}
            </ul>
          )}

          {(state.status === 'unconfigured' || (state.status === 'ready' && posts.length === 0)) && <BlogEmptyState />}
          {state.status === 'error' && <BlogEmptyState error />}
        </div>
      </section>
    </>
  );
}
