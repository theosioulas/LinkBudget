import { lazy, Suspense, useEffect, useState } from 'react';
import { AccountDialog } from './ui/AccountDialog';
import { canOpen, type Role } from './auth/access';

// Only the open tab is mounted: leaving a tab unmounts it, which stops its simulation loop.
const Simulator = lazy(() => import('./Simulator'));

type TabId = 'home' | 'link-budget' | 'talos' | 'talos3';

interface AppInfo { id: Exclude<TabId, 'home'>; label: string; title: string; text: string; src?: string }

const APPS: AppInfo[] = [
  {
    id: 'link-budget', label: 'Link budget', title: 'Multi-orbit link budget simulator',
    text: 'LEO, MEO and GEO constellations on a 3D globe: beams, terminals, handovers and ITU-R propagation, with a full link budget for every pass.',
  },
  {
    id: 'talos3', label: 'TALOS-3 simulator', title: 'TALOS-3 SIGINT mission simulator', src: 'apps/talos3/index.html',
    text: 'Three-satellite TDOA/FDOA geolocation cluster: operations picture, formation, payload RF, geolocation, planning and spacecraft budgets, plus the 100–150 kg baseline study (link chain, scaling, flight hardware, suppliers).',
  },
  {
    id: 'talos', label: 'TALOS study', title: 'TALOS SIGINT constellation study', src: 'apps/talos/index.html',
    text: 'Feasibility and engineering study for a 100–150 kg passive-RF microsatellite: research landscape, technical understanding, scenarios and services, service demo and orbit study.',
  },
];

const TABS: { id: TabId; label: string }[] = [{ id: 'home', label: 'Home' }, ...APPS.map(({ id, label }) => ({ id, label }))];

// Tabs live in the hash as #/<tab>; any other hash (e.g. a Supabase sign-in link) means home.
const tabFromHash = (): TabId => {
  const m = /^#\/([\w-]+)/.exec(location.hash);
  return (TABS.find((t) => t.id === m?.[1])?.id) ?? 'home';
};

function Home({ apps }: { apps: AppInfo[] }) {
  return (
    <div className="home">
      <div className="home-inner">
        <h1>RF Eye</h1>
        <p className="dim">Satellite link and SIGINT tools. Pick one to open it; nothing runs until you do.</p>
        <div className="home-cards">
          {apps.map((a) => (
            <a key={a.id} className="home-card glass" href={`#/${a.id}`}>
              <div className="home-card-title">{a.title}</div>
              <div className="dim">{a.text}</div>
              <span className="home-card-go">Open →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoAccess() {
  return (
    <div className="home">
      <div className="home-inner">
        <h1>Not available</h1>
        <p className="dim">This tool is not open to guest accounts. Ask the site owner if you need access.</p>
        <p><a href="#/home">← Back to home</a></p>
      </div>
    </div>
  );
}

// Site logo: drop a file at public/brand/logo.svg (or logo.png) and it shows in the top bar.
// Until one exists, the built-in mark and name are shown instead.
const LOGO_FILES = ['brand/logo.svg', 'brand/logo.png'];

function Logo() {
  const [i, setI] = useState(0);
  return (
    <a className="shell-logo" href="#/home" title="RF Eye home">
      {i < LOGO_FILES.length ? (
        <img src={LOGO_FILES[i]} alt="RF Eye" onError={() => setI(i + 1)} />
      ) : (
        <>
          <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="12" fill="#1f6feb" /><ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#38d6f0" strokeWidth="3.5" transform="rotate(-25 32 32)" /><circle cx="56" cy="21" r="4.5" fill="#f472b6" /></svg>
          <span>RF Eye</span>
        </>
      )}
    </a>
  );
}

function Loading() {
  return <div className="shell-loading dim">Loading the simulator…</div>;
}

export default function Shell({ role }: { role: Role }) {
  const [tab, setTab] = useState<TabId>(tabFromHash);
  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const allowed = canOpen(role, tab);
  const app = allowed ? APPS.find((a) => a.id === tab) : undefined;
  const apps = APPS.filter((a) => canOpen(role, a.id));

  return (
    <div className="shell">
      <nav className="shell-tabs" role="tablist" aria-label="Apps">
        <Logo />
        {TABS.filter((t) => canOpen(role, t.id)).map((t) => (
          <a key={t.id} role="tab" aria-selected={t.id === tab} href={`#/${t.id}`} className={t.id === tab ? 'on' : undefined}>{t.label}</a>
        ))}
        {app?.src && <a className="shell-pop" href={app.src} target="_blank" rel="noopener">Open in new tab ↗</a>}
      </nav>
      <div className="shell-body">
        {!allowed && <NoAccess />}
        {tab === 'home' && <Home apps={apps} />}
        {allowed && tab === 'link-budget' && <Suspense fallback={<Loading />}><Simulator /></Suspense>}
        {app?.src && <iframe key={app.id} className="shell-frame" src={app.src} title={app.title} />}
      </div>
      <AccountDialog />
    </div>
  );
}
