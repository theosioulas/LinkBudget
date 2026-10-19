import './cesium-setup';
import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import './styles.css';
import App from './App';
import { useAuth } from './auth/supabase';
import { LoginScreen } from './ui/AccountDialog';

// The whole app requires a signed-in account; the globe only mounts after login.
// Local development only (`VITE_SKIP_AUTH=1 npm run dev`): skip the login screen.
// Production builds never include this: import.meta.env.DEV is statically false there.
const SKIP_AUTH = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === '1';

/** Startup / error screens so the app never sits on an empty dark page. */
function Splash({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="login-screen">
      <div className="splash">
        <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="12" fill="#1f6feb" /><ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#38d6f0" strokeWidth="3.5" transform="rotate(-25 32 32)" /><circle cx="56" cy="21" r="4.5" fill="#f472b6" /></svg>
        <div>{text}</div>
        {action}
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Splash text={`Something went wrong: ${this.state.error.message}`}
        action={<button className="btn primary" onClick={() => location.reload()}>Reload</button>} />
    );
  }
}

function Root() {
  const ready = useAuth((s) => s.ready);
  const user = useAuth((s) => s.user);
  if (SKIP_AUTH) return <App />;
  if (!ready) return <Splash text="Loading OrbitLink…" />;
  return user ? <App /> : <LoginScreen />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary><Root /></ErrorBoundary>
  </StrictMode>,
);
