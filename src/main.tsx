import './cesium-setup';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import './styles.css';
import App from './App';
import { useAuth } from './auth/supabase';
import { LoginScreen } from './ui/AccountDialog';

// The whole app requires a signed-in account; the globe only mounts after login.
function Root() {
  const ready = useAuth((s) => s.ready);
  const user = useAuth((s) => s.user);
  if (!ready) return null;
  return user ? <App /> : <LoginScreen />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
