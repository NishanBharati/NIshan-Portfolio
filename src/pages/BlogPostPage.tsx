import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import Reveal from '../components/Reveal';
import Breadcrumbs from '../components/Breadcrumbs';
import Markdown from '../components/Markdown';
import BlogCard, { BRAND_GRADIENT } from '../components/BlogCard';
import NotFoundContent from '../components/NotFoundContent';
import { fetchPublishedPost, formatPostDate, type Post } from '../lib/posts';
import { isSupabaseConfigured } from '../lib/supabase';
import { usePublishedPosts } from '../lib/usePublishedPosts';
import { getInitialData } from '../lib/initialData';
import { notFoundSeo, postSeo } from '../lib/seo';
import { useSeo } from '../lib/useSeo';
import { PROFILE } from '../data/content';

type State = { status: 'loading' } | { status: 'missing' } | { status: 'error' } | { status: 'ready'; post: Post };

function initialState(slug: string): State {
  const prerendered = getInitialData().post;
  return prerendered?.slug === slug ? { status: 'ready', post: prerendered } : { status: 'loading' };
}

export default function BlogPostPage() {
  const { slug = '' } = useParams();
  const [state, setState] = useState<State>(() => initialState(slug));

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState((prev) => (prev.status === 'ready' && prev.post.slug === slug ? prev : { status: 'missing' }));
      return;
    }
    let cancelled = false;
    // Keep a prerendered article on screen while it refreshes; only show the skeleton for a new slug.
    setState((prev) => (prev.status === 'ready' && prev.post.slug === slug ? prev : { status: 'loading' }));
    fetchPublishedPost(slug)
      .then((post) => !cancelled && setState(post ? { status: 'ready', post } : { status: 'missing' }))
      .catch((error: unknown) => {
        console.error('Failed to load post', error);
        if (!cancelled) setState((prev) => (prev.status === 'ready' ? prev : { status: 'error' }));
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useSeo(
    state.status === 'ready'
      ? postSeo(state.post)
      : state.status === 'missing'
        ? notFoundSeo('Article Not Found')
        : null,
  );

  return (
    <>
      {state.status === 'loading' && <ArticleSkeleton />}
      {state.status === 'missing' && <NotFoundContent title="Article not found" backTo="/blog" backLabel="All articles" />}
      {state.status === 'error' && (
        <NotFoundContent title="Something went wrong" message="The article couldn't be loaded. Please try again." backTo="/blog" backLabel="All articles" />
      )}
      {state.status === 'ready' && <Article post={state.post} />}
    </>
  );
}

function Article({ post }: { post: Post }) {
  return (
    <>
      <article className="px-5 pb-20 pt-24 sm:px-8 sm:pt-28 md:px-10 md:pb-28 md:pt-32">
        <header className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:gap-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: post.title }]} />
          <Reveal y={20} delay={0.05}>
            <p className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">
              By{' '}
              <Link to="/#about" rel="author" className="font-medium text-[#D7E2EA] underline-offset-4 hover:underline">
                {PROFILE.fullName}
              </Link>
              <span aria-hidden> · </span>
              <time dateTime={post.published_at ?? undefined}>{formatPostDate(post.published_at)}</time>
              {post.updated_at && post.published_at && post.updated_at.slice(0, 10) > post.published_at.slice(0, 10) && (
                <>
                  <span aria-hidden> · </span>
                  Updated <time dateTime={post.updated_at}>{formatPostDate(post.updated_at)}</time>
                </>
              )}
              <span aria-hidden> · </span>
              {post.reading_minutes} min read
            </p>
          </Reveal>
          <div className="overflow-hidden pb-1">
          <Reveal rise y={90} delay={0.05}>
            <h1
              className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(2.25rem, 6.5vw, 6rem)' }}
            >
              {post.title}
            </h1>
          </Reveal>
          </div>
          {post.excerpt && (
            <Reveal y={20} delay={0.2}>
              <p className="max-w-2xl font-light leading-relaxed text-[#D7E2EA]/80" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.3rem)' }}>
                {post.excerpt}
              </p>
            </Reveal>
          )}
          {post.tags.length > 0 && (
            <Reveal y={20} delay={0.25} className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#D7E2EA]/30 px-4 py-1.5 text-xs font-light uppercase tracking-wider text-[#D7E2EA] sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </Reveal>
          )}
        </header>

        <Reveal y={30} delay={0.3} className="mx-auto mt-12 max-w-6xl sm:mt-16">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={`Cover image for "${post.title}"`}
              width={1600}
              height={900}
              fetchpriority="high"
              className="aspect-[16/9] w-full rounded-[40px] border-2 border-[#D7E2EA]/20 object-cover sm:rounded-[50px] md:rounded-[60px]"
            />
          ) : (
            <div className="aspect-[16/6] w-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px]" style={{ background: BRAND_GRADIENT }} />
          )}
        </Reveal>

        <Markdown
          className="prose prose-invert mx-auto mt-14 max-w-3xl font-light sm:prose-lg sm:mt-20 prose-headings:font-semibold prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-[#D7E2EA] prose-p:text-[#D7E2EA]/80 prose-a:text-[#D7E2EA] prose-a:decoration-[#B600A8] prose-a:underline-offset-4 prose-blockquote:border-l-[#B600A8] prose-blockquote:text-[#D7E2EA]/80 prose-strong:text-[#D7E2EA] prose-code:text-[#D7E2EA] prose-pre:rounded-[24px] prose-pre:border prose-pre:border-[#D7E2EA]/10 prose-pre:bg-[#141414] prose-li:text-[#D7E2EA]/80 prose-img:rounded-[32px] prose-hr:border-[#D7E2EA]/15"
        >
          {post.content}
        </Markdown>
      </article>

      <MoreArticles currentId={post.id} />
    </>
  );
}

function MoreArticles({ currentId }: { currentId: string }) {
  const state = usePublishedPosts(4);
  if (state.status !== 'ready') return null;
  const others = state.posts.filter((p) => p.id !== currentId).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <section className="border-t border-[#D7E2EA]/15 px-5 py-20 sm:px-8 md:px-10 md:py-28">
      <FadeIn y={40}>
        <h2
          className="hero-heading mb-12 text-center font-black uppercase leading-none tracking-tight sm:mb-16"
          style={{ fontSize: 'clamp(2.25rem, 7vw, 96px)' }}
        >
          Keep reading
        </h2>
      </FadeIn>
      <ul className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {others.map((post, i) => (
          <FadeIn as="li" key={post.id} delay={i * 0.1}>
            <BlogCard post={post} />
          </FadeIn>
        ))}
      </ul>
    </section>
  );
}

function ArticleSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading article" className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 pb-28 pt-28">
      <div className="h-3 w-40 animate-pulse rounded-full bg-[#D7E2EA]/10" />
      <div className="h-14 w-full max-w-3xl animate-pulse rounded-full bg-[#D7E2EA]/10" />
      <div className="h-14 w-2/3 animate-pulse rounded-full bg-[#D7E2EA]/10" />
      <div className="mt-10 aspect-[16/9] w-full animate-pulse rounded-[40px] bg-[#D7E2EA]/10 md:rounded-[60px]" />
    </div>
  );
}
