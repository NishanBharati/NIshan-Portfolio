import { requireSupabase } from './supabase';

export type PostStatus = 'draft' | 'published';

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  status: PostStatus;
  published_at: string | null;
  reading_minutes: number;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PostSummary = Pick<
  Post,
  'id' | 'title' | 'slug' | 'excerpt' | 'cover_image_url' | 'tags' | 'published_at' | 'reading_minutes'
>;

const SUMMARY_FIELDS = 'id, title, slug, excerpt, cover_image_url, tags, published_at, reading_minutes';

/** Published posts, newest first. Filters are explicit so drafts never leak, even for a signed-in admin. */
export async function fetchPublishedPosts(limit?: number): Promise<PostSummary[]> {
  let query = requireSupabase()
    .from('posts')
    .select(SUMMARY_FIELDS)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PostSummary[];
}

export async function fetchPublishedPost(slug: string): Promise<Post | null> {
  const { data, error } = await requireSupabase()
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data as Post | null;
}

export function formatPostDate(iso: string | null, style: 'long' | 'short' = 'long'): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}
