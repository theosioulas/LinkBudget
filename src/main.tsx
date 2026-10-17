import './cesium-setup';
import { StrictMode } from 'react';
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

function Root() {
  const ready = useAuth((s) => s.ready);
  const user = useAuth((s) => s.user);
  if (SKIP_AUTH) return <App />;
  if (!ready) return null;
  return user ? <App /> : <LoginScreen />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
