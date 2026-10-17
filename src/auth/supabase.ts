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

export type AccountMode = 'newPassword' | 'account';

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
  open: (mode) => set({ dialog: get().user ? mode ?? 'account' : null }),
  close: () => set({ dialog: null }),
}));

supabase.auth.getSession().then(({ data }) => useAuth.setState({ ready: true, session: data.session, user: data.session?.user ?? null }));
supabase.auth.onAuthStateChange((event, session) => {
  useAuth.setState({ ready: true, session, user: session?.user ?? null });
  // Arrived from a "reset password" e-mail: ask for the new password straight away.
  if (event === 'PASSWORD_RECOVERY') useAuth.setState({ dialog: 'newPassword' });
});

export const MIN_PASSWORD = 8;

// Accounts are created by the owner in the Supabase dashboard (public sign-up is off).
// Supabase identifies users by e-mail, so a plain username such as "guest" is stored as
// "guest@<USERNAME_DOMAIN>". The domain is a placeholder: no mail is ever sent to it.
export const USERNAME_DOMAIN = 'linkbudget.local';

/** "guest" → "guest@linkbudget.local"; a full e-mail address is used as is. */
export function loginEmail(id: string): string {
  const v = id.trim().toLowerCase();
  return v.includes('@') ? v : `${v}@${USERNAME_DOMAIN}`;
}

/** Username for placeholder accounts, the e-mail address otherwise. */
export function displayName(user: User | null): string {
  const e = user?.email ?? '';
  return e.endsWith(`@${USERNAME_DOMAIN}`) ? e.slice(0, -USERNAME_DOMAIN.length - 1) : e;
}

/** Role set by the owner in app_metadata (users cannot change it themselves). */
export function userRole(user: User | null): 'admin' | 'guest' {
  return user?.app_metadata?.role === 'admin' ? 'admin' : 'guest';
}

/** Turn Supabase auth errors into short, user-facing messages. */
export function authMessage(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/invalid login credentials/i.test(m)) return 'Wrong username or password.';
  if (/email not confirmed/i.test(m)) return 'This account is not confirmed yet. Confirm it in the Supabase dashboard.';
  if (/rate limit|too many/i.test(m)) return 'Too many attempts. Please wait a few minutes and try again.';
  if (/failed to fetch|network/i.test(m)) return 'Could not reach the account server. Check your connection.';
  return m;
}
