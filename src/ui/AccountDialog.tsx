import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { supabase, useAuth, siteUrl, authMessage, MIN_PASSWORD, type AccountMode } from '../auth/supabase';
import { listScenarios, saveScenario, loadScenario, deleteScenario, type CloudScenario } from '../auth/cloud';
import { useStore } from '../store/store';
import { Icon } from './icons';

const TITLES: Record<AccountMode, string> = {
  signin: 'Sign in', signup: 'Create account', forgot: 'Reset password', newPassword: 'Choose a new password', account: 'Your account',
};

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
        {mode === 'account' ? <AccountView /> : <AuthForm mode={mode} />}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="afield"><span>{label}</span>{children}</label>;
}

function AuthForm({ mode }: { mode: Exclude<AccountMode, 'account'> }) {
  const open = useAuth((s) => s.open);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  useEffect(() => { setError(null); setInfo(null); setPassword(''); setConfirm(''); }, [mode]);

  const needsNewPassword = mode === 'signup' || mode === 'newPassword';
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null);
    if (needsNewPassword) {
      if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
      if (password !== confirm) return setError('The two passwords do not match.');
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        useAuth.getState().open('account');
        useStore.getState().notify('Signed in');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: siteUrl() } });
        if (error) throw error;
        if (data.session) { useAuth.getState().open('account'); useStore.getState().notify('Account created'); }
        else setInfo(`Almost done: we sent a confirmation link to ${email}. Open it to activate your account, then sign in.`);
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() });
        if (error) throw error;
        setInfo(`If an account exists for ${email}, a reset link is on its way.`);
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        useAuth.getState().open('account');
        useStore.getState().notify('Password updated');
      }
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="modal-body" onSubmit={submit}>
      {mode === 'signin' && <p className="muted small">Sign in to save scenarios to the cloud and open them on any device.</p>}
      {mode === 'forgot' && <p className="muted small">Enter your e-mail and we'll send you a link to set a new password.</p>}
      {mode !== 'newPassword' && (
        <Field label="E-mail"><input type="email" required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      )}
      {mode !== 'forgot' && (
        <Field label={needsNewPassword ? `New password (min. ${MIN_PASSWORD} characters)` : 'Password'}>
          <input type="password" required autoComplete={needsNewPassword ? 'new-password' : 'current-password'} autoFocus={mode === 'newPassword'} minLength={needsNewPassword ? MIN_PASSWORD : undefined} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
      )}
      {needsNewPassword && (
        <Field label="Repeat password"><input type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      )}
      {error && <div className="amsg bad" role="alert">{error}</div>}
      {info && <div className="amsg good" role="status">{info}</div>}
      <button className="btn primary wide" type="submit" disabled={busy}>
        {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Save new password'}
      </button>
      <div className="alinks">
        {mode === 'signin' && <><button type="button" onClick={() => open('forgot')}>Forgot password?</button><button type="button" onClick={() => open('signup')}>Create an account</button></>}
        {mode === 'signup' && <button type="button" onClick={() => open('signin')}>Already have an account? Sign in</button>}
        {mode === 'forgot' && <button type="button" onClick={() => open('signin')}>Back to sign in</button>}
      </div>
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
    useStore.getState().notify('Signed out');
  });

  return (
    <div className="modal-body">
      <div className="row acct-id">
        <span className="avatar">{(user?.email ?? '?').slice(0, 1).toUpperCase()}</span>
        <span className="grow ellipsis">{user?.email}</span>
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
