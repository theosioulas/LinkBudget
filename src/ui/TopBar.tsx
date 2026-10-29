import { useEffect, useRef, useState } from 'react';
import { useStore, setView, type ScenarioFile } from '../store/store';
import { globe } from '../globe/GlobeView';
import { download, pickFile } from './controls';
import { buildHtmlReport } from './report';
import { DEMOS } from '../app/demos';
import { Icon } from './icons';
import { LayersMenu } from './LayersMenu';
import { useAuth, displayName } from '../auth/supabase';

const SPEEDS: [number, string][] = [[1, 'Real time'], [10, '10×'], [60, '60×'], [300, '5 min/s'], [1800, '30 min/s']];

export function useClickAway(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('mousedown', h);
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('mousedown', h); window.removeEventListener('keydown', k); };
  }, [open, close]);
  return ref;
}

export function TopBar() {
  const clock = useStore((s) => s.clock);
  const name = useStore((s) => s.name);
  const scenarioId = useStore((s) => s.scenarioId);
  const drawer = useStore((s) => s.drawer);
  const view = useStore((s) => s.view);
  const servingId = useStore((s) => (s.live.A?.active ? s.live.A.satId : s.live.B?.active ? s.live.B.satId : s.live.A?.satId ?? null));
  const set = useStore((s) => s.set);
  const user = useAuth((s) => s.user);
  const openAccount = useAuth((s) => s.open);
  const [menu, setMenu] = useState<'layers' | 'export' | null>(null);
  const close = () => setMenu(null);
  const layersRef = useClickAway(menu === 'layers', close);
  const exportRef = useClickAway(menu === 'export', close);
  const d = new Date(clock.t);
  const iso = d.toISOString();
  const setT = (ms: number) => { globe?.setTime(ms); set({ clock: { ...clock, t: ms } }); };
  const scenario = DEMOS.find((x) => x.id === scenarioId);

  const save = () => download(`${name.replace(/\s+/g, '_')}.orbitlink.json`, JSON.stringify(useStore.getState().exportScenario(), null, 2), 'application/json');
  const load = async () => {
    const f = await pickFile('.json');
    if (!f) return;
    try {
      const j = JSON.parse(await f.text()) as ScenarioFile;
      if (!j.constellations || !j.payloads || !j.terminals) throw new Error('not a scenario file');
      useStore.getState().importScenario(j);
      useStore.getState().notify(`Loaded scenario "${j.name}"`);
    } catch (e) {
      useStore.getState().notify(`Could not open the file: ${String(e)}`);
    }
  };
  const report = () => download(`link-budget-report-${iso.slice(0, 19).replace(/[:T]/g, '-')}.html`, buildHtmlReport(useStore.getState()), 'text/html');

  return (
    <header className="topbar glass">
      <div className="brand">
        <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="12" fill="#1f6feb" /><ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#38d6f0" strokeWidth="3.5" transform="rotate(-25 32 32)" /><circle cx="56" cy="21" r="4.5" fill="#f472b6" /></svg>
        <span>SIGINT</span>
      </div>
      <button className="scenario-btn" onClick={() => set({ drawer: drawer === 'scenario' ? null : 'scenario' })} title="Build the scenario: terminal, satellites, beam plan">
        <span style={{ minWidth: 0 }}>
          <span className="lbl">Scenario{scenario ? '' : ' · custom'}</span>
          <span className="val">{name}</span>
        </span>
        <span style={{ color: 'var(--text-3)', display: 'flex' }}><span style={{ width: 16, height: 16, display: 'inline-flex' }}><Icon.chevronDown /></span></span>
      </button>
      <button className="btn sm ghost" onClick={() => set({ wizardOpen: true })} title="Build a scenario from scratch: terminal, Beam A, Beam B">＋ New</button>
      <button className="btn sm ghost" onClick={() => set({ templatesOpen: true })} title="Start from a ready-made scenario template">Templates</button>
      <div className="clock">
        <button className="ibtn sm" title={clock.playing ? 'Pause' : 'Play'} onClick={() => set({ clock: { ...clock, playing: !clock.playing } })}>{clock.playing ? <Icon.pause /> : <Icon.play />}</button>
        <select value={clock.multiplier} onChange={(e) => set({ clock: { ...clock, multiplier: +e.target.value } })} aria-label="Simulation speed">
          {SPEEDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span className="time" title="Simulation time (UTC)">{iso.slice(0, 10)} {iso.slice(11, 19)}<small>UTC</small></span>
        <button className="btn sm ghost" onClick={() => setT(Date.now())} title="Jump to the current real time">Now</button>
      </div>
      <div className="grow" />
      <div className="seg view-seg" role="group" aria-label="Camera view">
        <button className={view.mode === 'terminal' ? 'on' : ''} onClick={() => setView('terminal')} title="Orbit around the terminal"><Icon.target /> Terminal</button>
        <button className={view.mode === 'earth' ? 'on' : ''} onClick={() => setView('earth')} title="Orbit around the Earth: whole globe and GEO belt"><Icon.globe /> Earth</button>
        <button className={view.mode === 'satellite' ? 'on' : ''} disabled={!servingId} onClick={() => setView('satellite')} title="Follow the satellite carrying traffic (switches on handover)"><Icon.satellites /> Satellite</button>
      </div>
      <div className="menu-wrap" ref={layersRef}>
        <button className={`ibtn ${menu === 'layers' ? 'on' : ''}`} onClick={() => setMenu(menu === 'layers' ? null : 'layers')} title="Layers: choose what the globe shows"><Icon.layers /></button>
        {menu === 'layers' && <div className="menu layers-menu"><LayersMenu /></div>}
      </div>
      <div className="vsep" />
      <div className="menu-wrap" ref={exportRef}>
        <button className="btn primary" onClick={() => setMenu(menu === 'export' ? null : 'export')}><Icon.download /> Export</button>
        {menu === 'export' && (
          <div className="menu">
            <button className="item" onClick={() => { report(); close(); }}><Icon.report /> <span>Link-budget report <span className="hint">(HTML)</span></span></button>
            <button className="item" onClick={() => { save(); close(); }}><Icon.download /> <span>Save scenario <span className="hint">(JSON)</span></span></button>
            <button className="item" onClick={() => { load(); close(); }}><Icon.open /> <span>Open scenario…</span></button>
            <button className="item" onClick={() => { openAccount(); close(); }}><Icon.user /> <span>Cloud scenarios… <span className="hint">(account)</span></span></button>
          </div>
        )}
      </div>
      <button className={`ibtn ${user ? 'on' : ''}`} onClick={() => openAccount()} title={`Signed in as ${displayName(user)}: cloud scenarios, password, sign out`}>
        {user ? <span className="avatar">{displayName(user).slice(0, 1).toUpperCase()}</span> : <Icon.user />}
      </button>
    </header>
  );
}
