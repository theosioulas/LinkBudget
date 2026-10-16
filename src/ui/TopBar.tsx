import { useStore, type ScenarioFile } from '../store/store';
import { globe } from '../globe/GlobeView';
import { Seg, download, pickFile } from './controls';
import { buildHtmlReport } from './report';

const SPEEDS: [number, string][] = [[1, '1×'], [10, '10×'], [60, '60×'], [300, '5m/s'], [1800, '30m/s']];

export function TopBar() {
  const clock = useStore((s) => s.clock);
  const name = useStore((s) => s.name);
  const live = useStore((s) => s.live);
  const set = useStore((s) => s.set);
  const d = new Date(clock.t);
  const iso = d.toISOString().replace('T', ' ').slice(0, 19);
  const setT = (ms: number) => { globe?.setTime(ms); set({ clock: { ...clock, t: ms } }); };

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
      useStore.getState().notify(`Could not load: ${String(e)}`);
    }
  };
  const report = () => {
    const html = buildHtmlReport(useStore.getState());
    download(`link-budget-report-${iso.replace(/[: ]/g, '-')}.html`, html, 'text/html');
  };

  return (
    <div className="topbar">
      <div className="brand">
        <svg className="brand-logo" viewBox="0 0 64 64"><circle cx="32" cy="32" r="13" fill="#1f6feb" /><ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#22d3ee" strokeWidth="3" transform="rotate(-25 32 32)" /><circle cx="55" cy="22" r="4.5" fill="#f472b6" /></svg>
        <div className="col" style={{ gap: 0 }}>
          <span>OrbitLink Studio</span>
          <small>Multi-orbit link budget</small>
        </div>
      </div>
      <div className="sep" />
      <button className="btn icon" title={clock.playing ? 'Pause' : 'Play'} onClick={() => set({ clock: { ...clock, playing: !clock.playing } })}>{clock.playing ? '❚❚' : '▶'}</button>
      <Seg value={clock.multiplier} options={SPEEDS} onChange={(v) => set({ clock: { ...clock, multiplier: v } })} />
      <div className="time" title="Simulation time (UTC)"><b>UTC</b> {iso}</div>
      <button className="btn sm" title="Back 10 min" onClick={() => setT(clock.t - 600_000)}>−10m</button>
      <button className="btn sm" title="Forward 10 min" onClick={() => setT(clock.t + 600_000)}>+10m</button>
      <button className="btn sm" title="Jump to real time now" onClick={() => setT(Date.now())}>Now</button>
      <div className="sep hide-sm" />
      <span className="chip hide-sm" title="Satellites above the terminal's minimum elevation">{live.visible} visible</span>
      <span className={`chip hide-sm ${live.mode === 'timeline' ? 'good' : ''}`} title="Links follow the simulated MBB timeline, or an instantaneous best-satellite view">{live.mode === 'timeline' ? 'Timeline links' : 'Instant links'}</span>
      <div className="grow" />
      <button className="btn sm" onClick={() => globe?.flyToTerminal(9000, -55)} title="Fly to the terminal">⌖ Terminal</button>
      <button className="btn sm" onClick={() => globe?.flyGlobal()} title="Show the whole GEO belt">◎ Global</button>
      <div className="sep" />
      <button className="btn sm" onClick={save} title="Save scenario as JSON">Save</button>
      <button className="btn sm" onClick={load} title="Open a scenario JSON">Open</button>
      <button className="btn sm primary" onClick={report} title="Export a full HTML link-budget report">Export report</button>
    </div>
  );
}
