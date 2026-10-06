import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type AuthStatus = 'unconfigured' | 'loading' | 'signed-out' | 'forbidden' | 'admin';

type AuthValue = {
  status: AuthStatus;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function checkIsAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    console.error('Admin check failed', error);
    return false;
  }
  return data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'loading' : 'unconfigured');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    // Only store the session here: Supabase advises against awaiting its calls inside this callback.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  // Re-verify admin rights whenever the signed-in user changes (not on every token refresh).
  useEffect(() => {
    if (!supabase || !sessionLoaded) return;
    if (!userId) {
      setStatus('signed-out');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    checkIsAdmin().then((isAdmin) => !cancelled && setStatus(isAdmin ? 'admin' : 'forbidden'));
    return () => {
      cancelled = true;
    };
  }, [userId, sessionLoaded]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
    }
    if (!(await checkIsAdmin())) {
      await supabase.auth.signOut();
      throw new Error('This account does not have admin access.');
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const value = useMemo(() => ({ status, session, signIn, signOut }), [status, session, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
