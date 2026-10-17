import { useStore, DEFAULT_LAYERS, type Layers, type Imagery } from '../store/store';
import { Toggle, Seg } from './controls';

type BoolKey = { [K in keyof Layers]: Layers[K] extends boolean ? K : never }[keyof Layers];

const ROWS: [string, [BoolKey, string, string?][]][] = [
  ['Lines', [
    ['links', 'Terminal ↔ satellite links', '#38d6f0'],
    ['orbits', 'Orbit paths'],
    ['coverage', 'Coverage rings'],
    ['groundTrack', 'Ground track (selected)'],
  ]],
  ['Beams', [
    ['cones', 'Serving beam cones (LEO/MEO)'],
    ['fovCones', 'Field-of-view cones (visible LEO/MEO)'],
    ['beams', 'Beam footprints'],
  ]],
  ['Terminal', [
    ['walls', 'Obstruction walls'],
    ['scanCone', 'Steering-limit cone'],
  ]],
  ['Globe', [
    ['labels', 'Satellite labels'],
    ['lighting', 'Day / night lighting'],
    ['nightLights', 'City lights at night'],
    ['atmosphere', 'Atmosphere'],
  ]],
];

export function LayersMenu() {
  const layers = useStore((s) => s.layers);
  const set = useStore((s) => s.set);
  const up = (p: Partial<Layers>) => set({ layers: { ...layers, ...p } });
  const allOff = () => up({ dotsLEO: false, dotsMEO: false, dotsGEO: false, labels: false, orbits: false, coverage: false, beams: false, cones: false, fovCones: false, links: false, scanCone: false, walls: false, groundTrack: false });
  return (
    <div>
      <h5>Satellites</h5>
      <div className="lgrid">
        {(['LEO', 'MEO', 'GEO'] as const).map((o) => {
          const k = `dots${o}` as const;
          return <button key={o} className={`pill ${layers[k] ? 'on' : ''}`} onClick={() => up({ [k]: !layers[k] })} aria-pressed={layers[k]}><span className="dot" />{o}</button>;
        })}
      </div>
      {ROWS.map(([title, rows]) => (
        <div key={title}>
          <h5>{title}</h5>
          {rows.map(([k, label]) => (
            <div className="lrow" key={k}>
              <span className="name">{label}</span>
              <Toggle checked={layers[k]} onChange={(v) => up({ [k]: v } as Partial<Layers>)} label="" title={label} />
            </div>
          ))}
        </div>
      ))}
      <h5>Base map</h5>
      <Seg<Imagery> value={layers.imagery} onChange={(v) => up({ imagery: v })} options={[['satellite', 'Satellite'], ['natural', 'Offline'], ['dark', 'Dark']]} />
      <div className="row" style={{ marginTop: 12, gap: 6 }}>
        <button className="btn sm" onClick={allOff}>Hide all overlays</button>
        <button className="btn sm ghost" onClick={() => set({ layers: { ...DEFAULT_LAYERS, imagery: layers.imagery } })}>Reset</button>
      </div>
    </div>
  );
}
