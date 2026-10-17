import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { supabase, useAuth, authMessage, loginEmail, displayName, userRole, MIN_PASSWORD, type AccountMode } from '../auth/supabase';
import { listScenarios, saveScenario, loadScenario, deleteScenario, type CloudScenario } from '../auth/cloud';
import { useStore } from '../store/store';
import { Icon } from './icons';

const TITLES: Record<AccountMode, string> = { newPassword: 'Change password', account: 'Your account' };

export function AccountDialog() {
  const mode = useAuth((s) => s.dialog);
  const close = useAuth((s) => s.close);
  useEffect(() => {
    if (!mode) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [mode, close]);
  if (!mode) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal glass" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <div className="modal-head">
          <h3 id="account-title">{TITLES[mode]}</h3>
          <button className="ibtn sm" onClick={close} title="Close"><Icon.close /></button>
        </div>
        {mode === 'account' ? <AccountView /> : <NewPasswordForm />}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="afield"><span>{label}</span>{children}</label>;
}

/** Full-screen sign-in shown until there is a session: the app requires login. */
export function LoginScreen() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail(user), password });
      if (error) throw error;
    } catch (err) {
      setError(authMessage(err));
      setBusy(false);
    }
  };
  return (
    <div className="login-screen">
      <form className="modal glass login-card" onSubmit={submit}>
        <div className="login-brand">
          <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="12" fill="#1f6feb" /><ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#38d6f0" strokeWidth="3.5" transform="rotate(-25 32 32)" /><circle cx="56" cy="21" r="4.5" fill="#f472b6" /></svg>
          <div>
            <div className="login-title">OrbitLink</div>
            <div className="dim small">Multi-orbit link budget studio</div>
          </div>
        </div>
        <div className="modal-body">
          <Field label="Username or e-mail"><input type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus value={user} onChange={(e) => setUser(e.target.value)} /></Field>
          <Field label="Password"><input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          {error && <div className="amsg bad" role="alert">{error}</div>}
          <button className="btn primary wide" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <p className="dim small" style={{ margin: 0, textAlign: 'center' }}>Access is by invitation. Ask the administrator for an account.</p>
        </div>
      </form>
    </div>
  );
}

function NewPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError('The two passwords do not match.');
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      useAuth.getState().open('account');
      useStore.getState().notify('Password updated');
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="modal-body" onSubmit={submit}>
      <Field label={`New password (min. ${MIN_PASSWORD} characters)`}>
        <input type="password" required autoComplete="new-password" autoFocus minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="Repeat password"><input type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      {error && <div className="amsg bad" role="alert">{error}</div>}
      <button className="btn primary wide" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Save new password'}</button>
      <div className="alinks"><button type="button" onClick={() => useAuth.getState().open('account')}>Back</button></div>
    </form>
  );
}

function AccountView() {
  const user = useAuth((s) => s.user);
  const name = useStore((s) => s.name);
  const [items, setItems] = useState<CloudScenario[] | null>(null);
  const [saveName, setSaveName] = useState(name);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = () => listScenarios().then(setItems).catch((e) => setError(authMessage(e)));
  useEffect(() => { refresh(); }, []);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key); setError(null);
    try { await fn(); } catch (e) { setError(authMessage(e)); } finally { setBusy(null); }
  };
  const nameTrim = saveName.trim();
  const existing = items?.find((s) => s.name === nameTrim);
  const save = () => run('save', async () => {
    await saveScenario(nameTrim, useStore.getState().exportScenario(), existing?.id);
    useStore.getState().notify(existing ? `Updated "${nameTrim}" in the cloud` : `Saved "${nameTrim}" to the cloud`);
    await refresh();
  });
  const load = (s: CloudScenario) => run(s.id, async () => {
    const f = await loadScenario(s.id);
    useStore.getState().importScenario(f);
    useStore.getState().notify(`Loaded "${s.name}"`);
    useAuth.getState().close();
  });
  const del = (s: CloudScenario) => run(s.id, async () => { await deleteScenario(s.id); setConfirmDel(null); await refresh(); });
  const signOut = () => run('out', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    useAuth.getState().close();
  });

  return (
    <div className="modal-body">
      <div className="row acct-id">
        <span className="avatar">{displayName(user).slice(0, 1).toUpperCase()}</span>
        <span className="grow ellipsis">{displayName(user)} <span className={`chip ${userRole(user) === 'admin' ? 'a' : ''}`}>{userRole(user)}</span></span>
        <button className="btn sm ghost" onClick={() => useAuth.getState().open('newPassword')}>Change password</button>
        <button className="btn sm" onClick={signOut} disabled={busy === 'out'}>Sign out</button>
      </div>

      <h4 className="sect">Save current scenario</h4>
      <form className="row" onSubmit={(e) => { e.preventDefault(); if (nameTrim) save(); }}>
        <input className="ainput grow" value={saveName} maxLength={120} onChange={(e) => setSaveName(e.target.value)} placeholder="Scenario name" aria-label="Scenario name" />
        <button className="btn primary" type="submit" disabled={!nameTrim || busy === 'save'}>{existing ? 'Overwrite' : 'Save'}</button>
      </form>

      <h4 className="sect">Saved in the cloud</h4>
      {error && <div className="amsg bad" role="alert">{error}</div>}
      {items === null && !error && <p className="dim small">Loading…</p>}
      {items?.length === 0 && <p className="dim small">Nothing saved yet.</p>}
      <div className="alist">
        {items?.map((s) => (
          <div key={s.id} className="aitem">
            <div className="grow" style={{ minWidth: 0 }}>
              <div className="ellipsis">{s.name}</div>
              <div className="dim small">{new Date(s.updated_at).toLocaleString()}</div>
            </div>
            {confirmDel === s.id ? (
              <>
                <button className="btn sm danger" onClick={() => del(s)} disabled={busy === s.id}>Delete</button>
                <button className="btn sm ghost" onClick={() => setConfirmDel(null)}>Keep</button>
              </>
            ) : (
              <>
                <button className="btn sm" onClick={() => load(s)} disabled={busy === s.id}><Icon.open /> Open</button>
                <button className="btn sm ghost icon" title="Delete" onClick={() => setConfirmDel(s.id)}><Icon.close /></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
