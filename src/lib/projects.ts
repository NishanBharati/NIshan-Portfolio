import { requireSupabase } from './supabase';

export type ProjectImage = {
  src: string;
  alt: string;
  /** CSS object-position, chosen so the important part survives the crop. */
  position?: string;
};

export type ProjectImageSlot = 'tall' | 'colTop' | 'colBottom';
export type ProjectImages = Record<ProjectImageSlot, ProjectImage>;

/** A row of the `projects` table. */
export type Project = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  live_url: string | null;
  images: ProjectImages;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

/** What a showcase card needs, whether it comes from Supabase or the built-in fallback. */
export type ShowcaseProject = Pick<Project, 'name' | 'category' | 'description' | 'live_url' | 'images'> & { key: string };

export const EMPTY_IMAGE: ProjectImage = { src: '', alt: '', position: 'center' };

export function hasAllImages(images: Partial<ProjectImages> | null | undefined): images is ProjectImages {
  return !!images?.tall?.src && !!images.colTop?.src && !!images.colBottom?.src;
}

export async function fetchPublishedProjects(): Promise<ShowcaseProject[]> {
  const { data, error } = await requireSupabase()
    .from('projects')
    .select('id, name, category, description, live_url, images')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as Pick<Project, 'id' | 'name' | 'category' | 'description' | 'live_url' | 'images'>[])
    .filter((p) => hasAllImages(p.images))
    .map(({ id, ...rest }) => ({ key: id, ...rest }));
}
