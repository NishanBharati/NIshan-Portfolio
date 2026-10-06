import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** `null` until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (see .env.example). */
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!) : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  }
  return supabase;
}
