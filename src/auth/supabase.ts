import { createClient, type Session, type User } from '@supabase/supabase-js';
import { create } from 'zustand';

// The project URL and publishable key are public by design: they only identify the
// project. What a visitor may read or write is enforced in the database by Row Level
// Security (supabase/schema.sql). Never put the service_role / secret key here.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://alknxjvvrggsxhvhkpzm.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Vu1bDZ1cMdbN4ykwiJ9ABA_1dv5P5M4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

/** Where e-mail links (confirm sign-up, reset password) send the user back to. */
export const siteUrl = () => new URL('.', document.baseURI).href;

export type AccountMode = 'signin' | 'signup' | 'forgot' | 'newPassword' | 'account';

interface AuthState {
  ready: boolean;
  session: Session | null;
  user: User | null;
  /** Account dialog: null = closed. */
  dialog: AccountMode | null;
  open: (mode?: AccountMode) => void;
  close: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  ready: false,
  session: null,
  user: null,
  dialog: null,
  open: (mode) => set({ dialog: mode ?? (get().user ? 'account' : 'signin') }),
  close: () => set({ dialog: null }),
}));

supabase.auth.getSession().then(({ data }) => useAuth.setState({ ready: true, session: data.session, user: data.session?.user ?? null }));
supabase.auth.onAuthStateChange((event, session) => {
  useAuth.setState({ ready: true, session, user: session?.user ?? null });
  // Arrived from a "reset password" e-mail: ask for the new password straight away.
  if (event === 'PASSWORD_RECOVERY') useAuth.setState({ dialog: 'newPassword' });
});

export const MIN_PASSWORD = 8;

/** Turn Supabase auth errors into short, user-facing messages. */
export function authMessage(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/invalid login credentials/i.test(m)) return 'Wrong e-mail or password.';
  if (/email not confirmed/i.test(m)) return 'Please confirm your e-mail first: check your inbox for the link.';
  if (/already registered|already exists/i.test(m)) return 'An account with this e-mail already exists. Sign in instead.';
  if (/rate limit|too many/i.test(m)) return 'Too many attempts. Please wait a few minutes and try again.';
  if (/failed to fetch|network/i.test(m)) return 'Could not reach the account server. Check your connection.';
  return m;
}
