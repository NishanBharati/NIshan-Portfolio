import { requireSupabase } from '../lib/supabase';
import type { Post, PostStatus } from '../lib/posts';
import type { Inquiry, InquiryStatus } from '../lib/inquiries';
import type { Project } from '../lib/projects';

export const COVER_BUCKET = 'blog-images';
export const PROJECT_BUCKET = 'project-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export type PostInput = Pick<
  Post,
  'title' | 'slug' | 'excerpt' | 'content' | 'cover_image_url' | 'tags' | 'status' | 'published_at' | 'reading_minutes'
>;

export async function listPosts(): Promise<Post[]> {
  const { data, error } = await requireSupabase().from('posts').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await requireSupabase().from('posts').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Post | null;
}

export async function createPost(input: PostInput): Promise<Post> {
  const { data, error } = await requireSupabase().from('posts').insert(input).select().single();
  if (error) throw error;
  return data as Post;
}

export async function updatePost(id: string, input: Partial<PostInput>): Promise<Post> {
  const { data, error } = await requireSupabase().from('posts').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Post;
}

export function setPostStatus(post: Post, status: PostStatus): Promise<Post> {
  return updatePost(post.id, {
    status,
    published_at: status === 'published' ? (post.published_at ?? new Date().toISOString()) : post.published_at,
  });
}

export async function deletePost(post: Post): Promise<void> {
  const { error } = await requireSupabase().from('posts').delete().eq('id', post.id);
  if (error) throw error;
  if (post.cover_image_url) await deleteStoredImage(post.cover_image_url);
}

/** Validates and uploads an image to a public bucket, returning its public URL. */
async function uploadImage(file: File, bucket: string, folder: string): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use a JPG, PNG, WebP, GIF or AVIF image.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Images must be 5 MB or smaller.');

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const storage = requireSupabase().storage.from(bucket);

  const { error } = await storage.upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
  if (error) throw error;
  return storage.getPublicUrl(path).data.publicUrl;
}

export const uploadCoverImage = (file: File) => uploadImage(file, COVER_BUCKET, 'covers');
export const uploadProjectImage = (file: File) => uploadImage(file, PROJECT_BUCKET, 'projects');

/** Best effort: only removes files that live in one of our buckets; failures are logged, never thrown. */
export async function deleteStoredImage(publicUrl: string): Promise<void> {
  for (const bucket of [COVER_BUCKET, PROJECT_BUCKET]) {
    const marker = `/object/public/${bucket}/`;
    const index = publicUrl.indexOf(marker);
    if (index === -1) continue;
    const path = decodeURIComponent(publicUrl.slice(index + marker.length));
    const { error } = await requireSupabase().storage.from(bucket).remove([path]);
    if (error) console.warn('Could not delete image', error);
    return;
  }
}

// ---------- Projects ----------

export type ProjectInput = Pick<
  Project,
  'name' | 'slug' | 'category' | 'description' | 'live_url' | 'images' | 'is_published' | 'sort_order'
>;

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await requireSupabase()
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await requireSupabase().from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

/** Sort order for a new project: after every existing one. */
export async function nextProjectSortOrder(): Promise<number> {
  const { data, error } = await requireSupabase()
    .from('projects')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return ((data as { sort_order: number } | null)?.sort_order ?? 0) + 10;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const { data, error } = await requireSupabase().from('projects').insert(input).select().single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  const { data, error } = await requireSupabase().from('projects').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Project;
}

/** Persists a new display order, writing only the rows whose position changed. */
export async function saveProjectOrder(ordered: Project[]): Promise<Project[]> {
  const next = ordered.map((p, i) => ({ ...p, sort_order: (i + 1) * 10 }));
  const changed = next.filter((p, i) => p.sort_order !== ordered[i].sort_order);
  await Promise.all(changed.map((p) => updateProject(p.id, { sort_order: p.sort_order })));
  return next;
}

export async function deleteProject(project: Project): Promise<void> {
  const { error } = await requireSupabase().from('projects').delete().eq('id', project.id);
  if (error) throw error;
  await Promise.all(Object.values(project.images ?? {}).map((img) => img?.src && deleteStoredImage(img.src)));
}

// ---------- Inquiries ----------

/** Fired after inquiries change so the sidebar badge can refresh its count. */
export const INQUIRIES_CHANGED = 'admin:inquiries-changed';

export async function listInquiries(): Promise<Inquiry[]> {
  const { data, error } = await requireSupabase().from('inquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Inquiry[];
}

export async function countNewInquiries(): Promise<number> {
  const { count, error } = await requireSupabase()
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');
  if (error) throw error;
  return count ?? 0;
}

export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  const { error } = await requireSupabase().from('inquiries').update({ status }).eq('id', id);
  if (error) throw error;
  window.dispatchEvent(new Event(INQUIRIES_CHANGED));
}

export async function deleteInquiry(id: string): Promise<void> {
  const { error } = await requireSupabase().from('inquiries').delete().eq('id', id);
  if (error) throw error;
  window.dispatchEvent(new Event(INQUIRIES_CHANGED));
}

export function describeError(error: unknown): string {
  const e = error as { code?: string; message?: string } | null;
  if (e?.code === '23505') return 'That slug is already in use. Choose a different one.';
  if (e?.code === '42501') return "You don't have permission to do that. Make sure your user is in admin_users.";
  if (e?.code === '23514') return 'Some fields are invalid. Check the title, slug and excerpt length.';
  return e?.message || 'Something went wrong. Please try again.';
}
