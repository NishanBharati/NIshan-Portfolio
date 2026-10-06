import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from './supabase';
import { fetchPublishedPosts, type PostSummary } from './posts';
import { getInitialData } from './initialData';

export type PostsState =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'error' }
  | { status: 'ready'; posts: PostSummary[] };

function initialState(limit?: number): PostsState {
  const prerendered = getInitialData().posts;
  if (prerendered) return { status: 'ready', posts: limit ? prerendered.slice(0, limit) : prerendered };
  return isSupabaseConfigured ? { status: 'loading' } : { status: 'unconfigured' };
}

/** Starts from the posts baked in at build time (if any), then refreshes from Supabase in the background. */
export function usePublishedPosts(limit?: number): PostsState {
  const [state, setState] = useState<PostsState>(() => initialState(limit));

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    fetchPublishedPosts(limit)
      .then((posts) => !cancelled && setState({ status: 'ready', posts }))
      .catch((error: unknown) => {
        console.error('Failed to load blog posts', error);
        // Keep prerendered posts on screen if the refresh fails.
        if (!cancelled) setState((prev) => (prev.status === 'ready' ? prev : { status: 'error' }));
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return state;
}
