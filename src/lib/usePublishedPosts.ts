import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from './supabase';
import { fetchPublishedPosts, type PostSummary } from './posts';

export type PostsState =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'error' }
  | { status: 'ready'; posts: PostSummary[] };

export function usePublishedPosts(limit?: number): PostsState {
  const [state, setState] = useState<PostsState>(
    isSupabaseConfigured ? { status: 'loading' } : { status: 'unconfigured' },
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    fetchPublishedPosts(limit)
      .then((posts) => !cancelled && setState({ status: 'ready', posts }))
      .catch((error: unknown) => {
        console.error('Failed to load blog posts', error);
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return state;
}
