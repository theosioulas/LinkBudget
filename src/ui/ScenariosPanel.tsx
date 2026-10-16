import { useStore, activeTerminal } from '../store/store';
import { DEMOS, applyDemo } from '../app/demos';
import { NumberField, SelectField, Seg } from './controls';
import { Icon } from './icons';

export const PLACES: [string, number, number][] = [
  ['Athens', 37.98, 23.73], ['London', 51.51, -0.13], ['New York', 40.71, -74.01], ['Singapore', 1.35, 103.82], ['Dubai', 25.2, 55.27],
  ['São Paulo', -23.55, -46.63], ['Tromsø', 69.65, 18.96], ['Mid-Atlantic ship', 35.0, -40.0], ['Nairobi', -1.29, 36.82], ['Sydney', -33.87, 151.21],
];

export function ScenariosPanel() {
  const scenarioId = useStore((s) => s.scenarioId);
  const terminal = useStore(activeTerminal);
  const mbb = useStore((s) => s.mbb);
  const running = useStore((s) => s.simRunning);
  const set = useStore((s) => s.set);
  const up = (p: Partial<typeof mbb>) => set({ mbb: { ...mbb, ...p } });
  const place = PLACES.find(([, la, lo]) => Math.abs(la - terminal.lat) < 0.05 && Math.abs(lo - terminal.lon) < 0.05)?.[0] ?? '';

  const moveTo = (name: string) => {
    const p = PLACES.find((x) => x[0] === name);
    if (!p) return;
    useStore.getState().updateTerminal({ lat: p[1], lon: p[2] });
    applyDemo(useStore.getState().scenarioId);
  };

  return (
    <div>
      <div className="scn-list">
        {DEMOS.map((d) => (
          <button key={d.id} className={`scn ${scenarioId === d.id ? 'on' : ''}`} onClick={() => applyDemo(d.id)} aria-pressed={scenarioId === d.id}>
            <span className="t">{d.name}{scenarioId === d.id && <span className="check" style={{ width: 16, height: 16, display: 'inline-flex' }}><Icon.check /></span>}</span>
            <span className="sys">{d.systems}</span>
            <span className="d">{d.description}</span>
          </button>
        ))}
      </div>

      <h4 className="sect" style={{ marginTop: 18 }}>Terminal</h4>
      <div className="fgrid">
        <SelectField label="Location" value={place} options={[['', place ? place : `${terminal.lat.toFixed(2)}°, ${terminal.lon.toFixed(2)}°`], ...PLACES.filter(([n]) => n !== place).map(([n]) => [n, n] as [string, string])]} onChange={moveTo} />
        <div className="field">
          <label>Antenna beams</label>
          <Seg value={terminal.beams} onChange={(v) => { useStore.getState().updateTerminal({ beams: v }); useStore.getState().runSim(); }} options={[[2, 'Dual (MBB)'], [1, 'Single']]} />
        </div>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className={`btn sm ${useStore.getState().pickTerminal ? 'active' : ''}`} onClick={() => set({ pickTerminal: true })}><Icon.target /> Pick on globe</button>
      </div>

      <details className="adv">
        <summary>Handover settings</summary>
        <div className="fgrid">
          <SelectField label="Satellite choice" value={mbb.policy} onChange={(v) => up({ policy: v })}
            options={[['longest-visibility', 'Longest visibility'], ['max-elevation', 'Highest elevation'], ['best-sinr', 'Best signal']]} />
          <SelectField label="Orbit preference" value={mbb.orbitPolicy} onChange={(v) => up({ orbitPolicy: v })}
            options={[['leo-first', 'LEO → MEO → GEO'], ['geo-leo-dual', 'GEO + LEO together'], ['best-throughput', 'Best throughput'], ['single', 'No preference']]} />
          <NumberField label="Duration" unit="min" value={mbb.durationMin} min={1} max={720} step={5} onChange={(v) => up({ durationMin: v })} />
          <NumberField label="Time step" unit="s" value={mbb.stepSec} min={0.5} max={120} step={0.5} onChange={(v) => up({ stepSec: v })} />
          <NumberField label="Min elevation" unit="°" value={mbb.minElevationDeg} min={0} max={80} step={1} onChange={(v) => up({ minElevationDeg: v })} />
          <NumberField label="Handover below" unit="°" value={mbb.handoverElevationDeg} min={0} max={85} step={1} onChange={(v) => up({ handoverElevationDeg: v })} />
          <NumberField label="Acquisition time" unit="s" value={mbb.acquisitionSec} min={0} max={60} step={0.5} onChange={(v) => up({ acquisitionSec: v })} />
          <NumberField label="Overlap (MBB)" unit="s" value={mbb.overlapSec} min={0} max={60} step={0.5} onChange={(v) => up({ overlapSec: v })} />
        </div>
        <button className="btn primary" style={{ width: '100%', marginTop: 12 }} disabled={running} onClick={() => useStore.getState().runSim()}>{running ? 'Simulating…' : 'Run from current time'}</button>
      </details>
    </div>
  );
}
