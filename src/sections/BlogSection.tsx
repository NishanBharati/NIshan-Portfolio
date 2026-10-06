import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import BlogCard, { BlogCardSkeleton, BlogEmptyState } from '../components/BlogCard';
import { usePublishedPosts } from '../lib/usePublishedPosts';

const LATEST_COUNT = 3;

export default function BlogSection() {
  const state = usePublishedPosts(LATEST_COUNT);
  const hasPosts = state.status === 'ready' && state.posts.length > 0;

  return (
    <section
      id="blog"
      className="bg-section-white relative z-10 -mt-10 rounded-t-[40px] px-5 pb-28 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pb-32 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-40 md:pt-32"
    >
      <div className="mb-16 flex flex-col items-center gap-6 sm:mb-20 md:mb-28">
        <FadeIn y={20}>
          <span
            className="font-light uppercase tracking-widest text-[#0C0C0C]/60"
            style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
          >
            Insights &amp; articles
          </span>
        </FadeIn>
        <FadeIn y={40}>
          <h2
            className="heading-dark text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Blogs
          </h2>
        </FadeIn>
      </div>

      <div className="mx-auto max-w-7xl">
        {state.status === 'loading' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading articles">
            {Array.from({ length: LATEST_COUNT }, (_, i) => (
              <BlogCardSkeleton key={i} tone="light" />
            ))}
          </div>
        )}

        {hasPosts && (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.posts.map((post, i) => (
              <FadeIn as="li" key={post.id} delay={i * 0.1}>
                <BlogCard post={post} tone="light" />
              </FadeIn>
            ))}
          </ul>
        )}

        {(state.status === 'unconfigured' || (state.status === 'ready' && !hasPosts)) && <BlogEmptyState tone="light" />}
        {state.status === 'error' && <BlogEmptyState error tone="light" />}

        {hasPosts && (
          <FadeIn y={20} className="mt-12 flex justify-center sm:mt-16">
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0C0C0C] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#0C0C0C] transition-colors duration-200 hover:bg-[#0C0C0C] hover:text-white sm:px-10 sm:py-3.5 sm:text-base"
            >
              View all articles
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:h-5 sm:w-5"
              />
            </Link>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
