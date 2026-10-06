import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import Markdown from '../components/Markdown';
import BlogCard, { BRAND_GRADIENT } from '../components/BlogCard';
import FooterSection from '../sections/FooterSection';
import NotFoundContent from '../components/NotFoundContent';
import { fetchPublishedPost, formatPostDate, type Post } from '../lib/posts';
import { isSupabaseConfigured } from '../lib/supabase';
import { usePublishedPosts } from '../lib/usePublishedPosts';
import { SITE_TITLE, setPageMeta } from '../lib/pageMeta';

type State = { status: 'loading' } | { status: 'missing' } | { status: 'error' } | { status: 'ready'; post: Post };

export default function BlogPostPage() {
  const { slug = '' } = useParams();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ status: 'missing' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    fetchPublishedPost(slug)
      .then((post) => !cancelled && setState(post ? { status: 'ready', post } : { status: 'missing' }))
      .catch((error: unknown) => {
        console.error('Failed to load post', error);
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (state.status === 'ready')
      setPageMeta(`${state.post.title} · ${SITE_TITLE}`, state.post.excerpt, {
        image: state.post.cover_image_url,
        type: 'article',
      });
    if (state.status === 'missing') setPageMeta(`Article not found · ${SITE_TITLE}`, null, { noindex: true });
  }, [state]);

  return (
    <>
      {state.status === 'loading' && <ArticleSkeleton />}
      {state.status === 'missing' && <NotFoundContent title="Article not found" backTo="/blog" backLabel="All articles" />}
      {state.status === 'error' && (
        <NotFoundContent title="Something went wrong" message="The article couldn't be loaded. Please try again." backTo="/blog" backLabel="All articles" />
      )}
      {state.status === 'ready' && <Article post={state.post} />}
      <FooterSection />
    </>
  );
}

function Article({ post }: { post: Post }) {
  return (
    <>
      <article className="px-5 pb-20 pt-24 sm:px-8 sm:pt-28 md:px-10 md:pb-28 md:pt-32">
        <header className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:gap-8">
          <FadeIn y={20}>
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 sm:text-sm"
            >
              <ArrowLeft aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              All articles
            </Link>
          </FadeIn>
          <FadeIn y={20} delay={0.05}>
            <p className="text-xs font-light uppercase tracking-widest text-[#D7E2EA]/60 sm:text-sm">
              <time dateTime={post.published_at ?? undefined}>{formatPostDate(post.published_at)}</time>
              <span aria-hidden> · </span>
              {post.reading_minutes} min read
            </p>
          </FadeIn>
          <FadeIn y={40} delay={0.1}>
            <h1
              className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(2.25rem, 6.5vw, 6rem)' }}
            >
              {post.title}
            </h1>
          </FadeIn>
          {post.excerpt && (
            <FadeIn y={20} delay={0.2}>
              <p className="max-w-2xl font-light leading-relaxed text-[#D7E2EA]/80" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.3rem)' }}>
                {post.excerpt}
              </p>
            </FadeIn>
          )}
          {post.tags.length > 0 && (
            <FadeIn y={20} delay={0.25} className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#D7E2EA]/30 px-4 py-1.5 text-xs font-light uppercase tracking-wider text-[#D7E2EA] sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </FadeIn>
          )}
        </header>

        <FadeIn y={30} delay={0.3} className="mx-auto mt-12 max-w-6xl sm:mt-16">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt=""
              className="aspect-[16/9] w-full rounded-[40px] border-2 border-[#D7E2EA]/20 object-cover sm:rounded-[50px] md:rounded-[60px]"
            />
          ) : (
            <div className="aspect-[16/6] w-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px]" style={{ background: BRAND_GRADIENT }} />
          )}
        </FadeIn>

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
