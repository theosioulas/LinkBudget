import { useState, type ReactNode } from 'react';
import { useStore, activeTerminal, markCustom, setView } from '../store/store';
import type { Constellation, OrbitClass } from '../core/model';
import type { WalkerShell } from '../core/orbit/walker';
import { NumberField, SelectField, TextField, Toggle, Sect, Seg, pickFile } from './controls';
import { Icon } from './icons';
import { DEMOS } from '../app/demos';
import { CONSTELLATIONS } from '../data/presets';
import { parseTleText } from '../core/orbit/propagator';
import { globe } from '../globe/GlobeView';
import { periodSec } from '../core/orbit/kepler';
import { rankCandidates } from '../core/sim/handover';
import { makeEvalContext } from '../core/sim/runtime';

const PALETTE = ['#e8eef7', '#ff9f43', '#4cc9f0', '#b388ff', '#06d6a0', '#ffd166', '#ef476f', '#90e0ef', '#f4a261', '#a3e635'];
const CELESTRAK: [string, string, OrbitClass][] = [
  ['starlink', 'Starlink', 'LEO'], ['oneweb', 'OneWeb', 'LEO'], ['kuiper', 'Amazon Kuiper', 'LEO'], ['ses', 'SES (incl. O3b)', 'MEO'],
  ['intelsat', 'Intelsat', 'GEO'], ['geo', 'Active GEO', 'GEO'], ['iridium-NEXT', 'Iridium NEXT', 'LEO'], ['gps-ops', 'GPS', 'MEO'],
];

export function focusConstellation(id: string) {
  const s = useStore.getState();
  const ctx = makeEvalContext(activeTerminal(s), s.analysis, s.constellations, s.payloads);
  const pool = s.sats.filter((x) => x.constellationId === id);
  const best = rankCandidates(pool, s.clock.t, ctx, { ...s.mbb, policy: 'max-elevation', orbitPolicy: 'single' }, new Set())[0];
  const sat = best?.sat ?? pool[0];
  if (!sat) return;
  useStore.setState({ selectedSatId: sat.id, focusPayloadSatId: sat.id });
  globe?.frameBeamLayout(sat.id);
}

function ShellEditor({ shell, onChange, onRemove }: { shell: WalkerShell; onChange: (s: WalkerShell) => void; onRemove?: () => void }) {
  const u = (p: Partial<WalkerShell>) => onChange({ ...shell, ...p });
  return (
    <div className="card" style={{ background: 'rgba(0,0,0,0.15)' }}>
      <div className="fgrid three">
        <NumberField label="Altitude" unit="km" value={shell.altitudeKm} step={10} min={160} onChange={(v) => u({ altitudeKm: v })} />
        <NumberField label="Inclination" unit="°" value={shell.inclinationDeg} step={0.1} min={0} max={180} onChange={(v) => u({ inclinationDeg: v })} />
        <NumberField label="Eccentricity" value={shell.eccentricity ?? 0} step={0.001} min={0} max={0.9} onChange={(v) => u({ eccentricity: v })} />
        <NumberField label="Planes P" value={shell.planes} step={1} min={1} onChange={(v) => u({ planes: Math.round(v) })} />
        <NumberField label="Sats / plane" value={shell.satsPerPlane} step={1} min={1} onChange={(v) => u({ satsPerPlane: Math.round(v) })} />
        <NumberField label="Phasing F" value={shell.phasing} step={1} min={0} onChange={(v) => u({ phasing: Math.round(v) })} />
        <SelectField label="Pattern" value={shell.pattern} options={[['delta', 'Walker Delta'], ['star', 'Walker Star']]} onChange={(v) => u({ pattern: v })} />
        <NumberField label="RAAN₀" unit="°" value={shell.raan0Deg ?? 0} step={1} onChange={(v) => u({ raan0Deg: v })} />
        <NumberField label="Arg. perigee" unit="°" value={shell.argpDeg ?? 0} step={1} onChange={(v) => u({ argpDeg: v })} />
      </div>
      <div className="row small dim" style={{ marginTop: 4 }}>
        {shell.planes * shell.satsPerPlane} sats · period {(periodSec(6378.137 + shell.altitudeKm) / 60).toFixed(1)} min
        {onRemove && <button className="btn sm danger right-align" onClick={onRemove}>Remove shell</button>}
      </div>
    </div>
  );
}


export const PLACES: [string, number, number][] = [
  ['Athens', 37.98, 23.73], ['London', 51.51, -0.13], ['New York', 40.71, -74.01], ['Singapore', 1.35, 103.82], ['Dubai', 25.2, 55.27],
  ['São Paulo', -23.55, -46.63], ['Tromsø', 69.65, 18.96], ['Mid-Atlantic ship', 35.0, -40.0], ['Nairobi', -1.29, 36.82], ['Sydney', -33.87, 151.21],
];

const PRESET_IDS = new Set(CONSTELLATIONS.map((c) => c.id));
let rerunTimer: ReturnType<typeof setTimeout> | undefined;
/** Re-run the handover simulation shortly after a structural change to the scenario. */
const rerun = () => { clearTimeout(rerunTimer); rerunTimer = setTimeout(() => useStore.getState().runSim(), 150); };

function Node({ icon, title, sub, right, open, onToggle, children }: { icon: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode; open?: boolean; onToggle?: () => void; children?: ReactNode }) {
  return (
    <div className={`ob-node ${open ? 'open' : ''}`}>
      <div className="ob-row">
        <span className="ob-ico">{icon}</span>
        <span className="nm"><b>{title}</b>{sub && <span>{sub}</span>}</span>
        {right}
        {onToggle && <button className="ibtn sm" onClick={onToggle} title={open ? 'Collapse' : 'Properties'}>{open ? <Icon.chevronUp /> : <Icon.chevronDown />}</button>}
      </div>
      {open && <div className="ob-body">{children}</div>}
    </div>
  );
}

// ------------------------------------------------------------------ ground terminal
function TerminalNode() {
  const terminal = useStore(activeTerminal);
  const terminals = useStore((s) => s.terminals);
  const pick = useStore((s) => s.pickTerminal);
  const [open, setOpen] = useState(false);
  const place = PLACES.find(([, la, lo]) => Math.abs(la - terminal.lat) < 0.05 && Math.abs(lo - terminal.lon) < 0.05)?.[0] ?? '';
  const where = place || `${terminal.lat.toFixed(2)}°, ${terminal.lon.toFixed(2)}°`;
  const up = (p: Parameters<ReturnType<typeof useStore.getState>['updateTerminal']>[0]) => { useStore.getState().updateTerminal(p); rerun(); };
  const switchTerminal = (id: string) => {
    const { lat, lon, altM, obstructions } = terminal;
    useStore.setState({ activeTerminalId: id });
    useStore.getState().updateTerminal({ lat, lon, altM, obstructions });
    markCustom();
    rerun();
  };
  return (
    <Node icon={<Icon.terminal />} title={terminal.name} sub={`${where} · ${terminal.type === 'phased-array' ? 'phased array' : 'parabolic'} · ${terminal.beams === 2 ? 'dual beam' : 'single beam'}`}
      open={open} onToggle={() => setOpen(!open)}
      right={<button className="ibtn sm" onClick={() => setView('terminal')} title="Centre the view on the terminal"><Icon.target /></button>}>
      <div className="fgrid">
        <div style={{ gridColumn: '1 / -1' }}>
          <SelectField label="Terminal model" value={terminal.id} options={terminals.map((t) => [t.id, t.name])} onChange={switchTerminal} />
        </div>
        <SelectField label="Location" value={place} options={[['', place || where], ...PLACES.filter(([n]) => n !== place).map(([n]) => [n, n] as [string, string])]}
          onChange={(n) => { const p = PLACES.find((x) => x[0] === n); if (p) up({ lat: p[1], lon: p[2] }); }} />
        <div className="field">
          <label>Simultaneous beams</label>
          <Seg value={terminal.beams} onChange={(v) => { up({ beams: v, type: v === 2 && terminal.type === 'parabolic' ? 'phased-array' : terminal.type }); markCustom(); }} options={[[2, 'Two'], [1, 'One']]} />
        </div>
        <NumberField label="Latitude" unit="°" value={terminal.lat} step={0.01} min={-90} max={90} onChange={(v) => up({ lat: v })} />
        <NumberField label="Longitude" unit="°" value={terminal.lon} step={0.01} min={-180} max={180} onChange={(v) => up({ lon: v })} />
      </div>
      <div className="row" style={{ marginTop: 8, gap: 6 }}>
        <button className={`btn sm ${pick ? 'active' : ''}`} onClick={() => useStore.setState({ pickTerminal: true })}><Icon.target /> Pick on globe</button>
        <button className="btn sm right-align" onClick={() => useStore.setState({ drawer: 'terminal' })}>RF, scan &amp; obstructions…</button>
      </div>
    </Node>
  );
}

// ------------------------------------------------------------------ satellite systems
function SystemNode({ c }: { c: Constellation }) {
  const [open, setOpen] = useState(false);
  const payloads = useStore((s) => s.payloads);
  const update = useStore((s) => s.updateConstellation);
  const remove = useStore((s) => s.removeConstellation);
  const n = useStore((s) => s.sats.filter((x) => x.constellationId === c.id).length);
  const u = (p: Partial<Constellation>) => { update(c.id, p); if ('source' in p || 'payloadId' in p || 'followTerminal' in p) { markCustom(); rerun(); } };
  const pl = payloads.find((p) => p.id === c.payloadId);
  const src = c.source;
  const drop = () => {
    const st = useStore.getState();
    const a = st.mbb.beamAssign;
    if (a) st.set({ mbb: { ...st.mbb, beamAssign: { A: a.A.filter((x) => x !== c.id), B: a.B.filter((x) => x !== c.id) } } });
    update(c.id, { enabled: false });
    markCustom();
    rerun();
  };
  return (
    <Node
      icon={<input type="color" value={c.color} onChange={(e) => u({ color: e.target.value })} className="cdot" title="Colour" />}
      title={c.name}
      sub={`${c.orbitClass} · ${n} sats · ${pl?.band ?? '?'}-band · ${c.operator}`}
      open={open} onToggle={() => setOpen(!open)}
      right={<>
        <button className="ibtn sm" title="Edit this system's payload" onClick={() => useStore.setState({ payloadSystemId: c.id, drawer: 'payload' })}><Icon.payload /></button>
        <button className="ibtn sm" title="Show the best visible satellite and its beams" onClick={() => focusConstellation(c.id)}><Icon.target /></button>
        <button className="ibtn sm" title="Remove from scenario" onClick={drop}><Icon.close /></button>
      </>}>
      {c.description && <div className="small muted" style={{ margin: '6px 0' }}>{c.description}</div>}
      <div className="fgrid">
        <TextField label="Name" value={c.name} onChange={(v) => u({ name: v })} />
        <TextField label="Operator" value={c.operator} onChange={(v) => u({ operator: v })} />
        <SelectField label="Orbit class" value={c.orbitClass} options={[['LEO', 'LEO'], ['MEO', 'MEO'], ['GEO', 'GEO'], ['HEO', 'HEO']]} onChange={(v) => u({ orbitClass: v })} />
        <SelectField label="Payload" value={c.payloadId} options={payloads.map((p) => [p.id, p.name])} onChange={(v) => u({ payloadId: v })} />
      </div>
      <div className="row wrap" style={{ gap: 14, margin: '8px 0' }}>
        <Toggle checked={c.showOrbits} onChange={(v) => u({ showOrbits: v })} label="Orbits" />
        <Toggle checked={c.showCoverage} onChange={(v) => u({ showCoverage: v })} label="Coverage" />
        <Toggle checked={c.showLabels} onChange={(v) => { u({ showLabels: v }); useStore.getState().rebuildSats(); }} label="Labels" />
      </div>
      {src.kind === 'walker' && (
        <>
          {src.shells.map((sh, i) => (
            <ShellEditor key={i} shell={sh}
              onChange={(ns) => u({ source: { kind: 'walker', shells: src.shells.map((x, j) => (j === i ? ns : x)) } })}
              onRemove={src.shells.length > 1 ? () => u({ source: { kind: 'walker', shells: src.shells.filter((_, j) => j !== i) } }) : undefined} />
          ))}
          <button className="btn sm" onClick={() => u({ source: { kind: 'walker', shells: [...src.shells, { ...src.shells[src.shells.length - 1] }] } })}>＋ Add shell</button>
        </>
      )}
      {src.kind === 'geo' && (
        <>
          <div style={{ marginBottom: 6 }}>
            <Toggle checked={!!c.followTerminal} onChange={(v) => u({ followTerminal: v })} label="Slot follows the terminal's longitude" title="Move the first slot over the terminal wherever it goes" />
          </div>
          {src.slots.map((sl, i) => (
            <div key={i} className="fgrid three" style={{ marginBottom: 6 }}>
              <TextField label="Name" value={sl.name} onChange={(v) => u({ source: { kind: 'geo', slots: src.slots.map((x, j) => (j === i ? { ...x, name: v } : x)) } })} />
              <NumberField label="Longitude" unit="°E" value={sl.lon} step={0.1} min={-180} max={180} onChange={(v) => u({ source: { kind: 'geo', slots: src.slots.map((x, j) => (j === i ? { ...x, lon: v } : x)) } })} />
              <NumberField label="Inclination" unit="°" value={sl.inc ?? 0} step={0.05} min={0} max={15} onChange={(v) => u({ source: { kind: 'geo', slots: src.slots.map((x, j) => (j === i ? { ...x, inc: v } : x)) } })} />
            </div>
          ))}
          <button className="btn sm" onClick={() => u({ source: { kind: 'geo', slots: [...src.slots, { name: `GEO ${src.slots.length + 1}`, lon: 0, inc: 0 }] } })}>＋ Add slot</button>
        </>
      )}
      {src.kind === 'tle' && (
        <>
          <SelectField label="Propagator" value={c.propagator} options={[['kepler-j2', 'Kepler + J2 (fast, from TLE mean elements)'], ['sgp4', 'SGP4 (precise, slower)']]} onChange={(v) => u({ propagator: v })} />
          <div className="small dim" style={{ margin: '6px 0' }}>{parseTleText(src.text).length} element sets · {src.label}</div>
          <textarea className="ta" value={src.text} onChange={(e) => u({ source: { ...src, text: e.target.value } })} />
        </>
      )}
      {!PRESET_IDS.has(c.id) && (
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn sm danger right-align" onClick={() => { remove(c.id); markCustom(); rerun(); }}>Delete system</button>
        </div>
      )}
    </Node>
  );
}

function AddSystems() {
  const constellations = useStore((s) => s.constellations);
  const payloads = useStore((s) => s.payloads);
  const add = useStore((s) => s.addConstellation);
  const update = useStore((s) => s.updateConstellation);
  const notify = useStore((s) => s.notify);
  const [group, setGroup] = useState('oneweb');
  const [busy, setBusy] = useState(false);
  const library = constellations.filter((c) => !c.enabled);
  const color = () => PALETTE[constellations.length % PALETTE.length];
  const id = (p: string) => `${p}-${Date.now().toString(36)}`;
  const defaultPayload = (oc: OrbitClass) => (oc === 'GEO' ? 'pl-geo-ku-wide' : oc === 'MEO' ? 'pl-mpower-ka' : 'pl-starlink-ku');
  const added = (c: Constellation) => { add(c); markCustom(); rerun(); };

  const addTle = (text: string, label: string, oc: OrbitClass, name: string) => {
    const n = parseTleText(text).length;
    if (!n) { notify('No valid TLEs found'); return; }
    added({
      id: id('tle'), name, operator: label, orbitClass: oc, color: color(), enabled: true, payloadId: defaultPayload(oc),
      showOrbits: n < 60, showCoverage: false, showLabels: n < 40, propagator: n > 800 ? 'kepler-j2' : 'sgp4',
      source: { kind: 'tle', text, label: `${n} TLEs · ${label}` },
    });
    notify(`Added ${n} satellites from ${label}`);
  };
  const fetchLive = async () => {
    const g = CELESTRAK.find((x) => x[0] === group)!;
    setBusy(true);
    try {
      const r = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${encodeURIComponent(group)}&FORMAT=tle`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      addTle(await r.text(), `CelesTrak ${new Date().toISOString().slice(0, 10)}`, g[2], `${g[1]} (live TLE)`);
    } catch (e) {
      notify(`CelesTrak fetch failed (${String(e)}). Paste TLEs or load a file instead.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <details className="adv" style={{ marginTop: 6 }}>
      <summary>Add satellites to the scenario</summary>
      <div>
        {library.length > 0 && <div className="small dim" style={{ marginBottom: 4 }}>Library</div>}
        {library.map((c) => (
          <div key={c.id} className="lib-item">
            <span className="bdot" style={{ background: c.color }} />
            <span className="grow ellipsis small">{c.name} <span className="dim">· {c.operator}</span></span>
            <span className={`chip ${c.orbitClass.toLowerCase()}`}>{c.orbitClass}</span>
            <button className="btn sm" onClick={() => { update(c.id, { enabled: true }); markCustom(); rerun(); }}>＋ Add</button>
          </div>
        ))}
        <div className="small dim" style={{ margin: '10px 0 4px' }}>Custom</div>
        <div className="row wrap" style={{ gap: 6 }}>
          <button className="btn sm" onClick={() => added({
            id: id('walker'), name: 'Custom Walker', operator: 'Custom', orbitClass: 'LEO', color: color(), enabled: true, payloadId: payloads[0].id,
            showOrbits: true, showCoverage: false, showLabels: false, propagator: 'kepler-j2',
            source: { kind: 'walker', shells: [{ altitudeKm: 800, inclinationDeg: 60, planes: 8, satsPerPlane: 10, phasing: 1, pattern: 'delta' }] },
          })}>＋ Walker LEO</button>
          <button className="btn sm" onClick={() => added({
            id: id('meo'), name: 'Custom MEO', operator: 'Custom', orbitClass: 'MEO', color: color(), enabled: true, payloadId: 'pl-mpower-ka',
            showOrbits: true, showCoverage: true, showLabels: true, propagator: 'kepler-j2',
            source: { kind: 'walker', shells: [{ altitudeKm: 8062, inclinationDeg: 0, planes: 1, satsPerPlane: 8, phasing: 0, pattern: 'delta' }] },
          })}>＋ MEO ring</button>
          <button className="btn sm" onClick={() => added({
            id: id('geo'), name: 'Custom GEO', operator: 'Custom', orbitClass: 'GEO', color: color(), enabled: true, payloadId: 'pl-geo-ku-wide',
            showOrbits: true, showCoverage: false, showLabels: true, propagator: 'kepler-j2', source: { kind: 'geo', slots: [{ name: 'GEO 0°E', lon: 0, inc: 0 }] },
          })}>＋ GEO satellite</button>
          <button className="btn sm" onClick={async () => {
            const f = await pickFile('.txt,.tle,.3le');
            if (f) addTle(await f.text(), f.name, 'LEO', f.name.replace(/\.\w+$/, ''));
          }}>＋ TLE file…</button>
        </div>
        <div className="row" style={{ gap: 6, marginTop: 8 }}>
          <div style={{ flex: 1 }}><SelectField label="Live TLEs from CelesTrak" value={group} options={CELESTRAK.map(([k, l]) => [k, l])} onChange={setGroup} /></div>
          <button className="btn sm" style={{ marginTop: 14 }} disabled={busy} onClick={fetchLive}>{busy ? 'Fetching…' : 'Fetch'}</button>
        </div>
      </div>
    </details>
  );
}

// ------------------------------------------------------------------ beam plan
function BeamPlan() {
  const mbb = useStore((s) => s.mbb);
  const terminal = useStore(activeTerminal);
  const constellations = useStore((s) => s.constellations);
  const inScenario = constellations.filter((c) => c.enabled);
  const up = (p: Partial<typeof mbb>) => { useStore.getState().set({ mbb: { ...useStore.getState().mbb, ...p } }); markCustom(); rerun(); };
  const dual = terminal.beams === 2;
  const dedicated = dual && (mbb.orbitPolicy === 'dedicated' || mbb.orbitPolicy === 'geo-leo-dual');
  const assign = mbb.orbitPolicy === 'geo-leo-dual'
    ? { A: inScenario.filter((c) => c.orbitClass !== 'LEO').map((c) => c.id), B: inScenario.filter((c) => c.orbitClass === 'LEO').map((c) => c.id) }
    : mbb.beamAssign ?? { A: [], B: [] };
  const setMode = (m: 'mbb' | 'dedicated') => {
    if (m === 'mbb') { up({ orbitPolicy: 'leo-first' }); return; }
    const A = inScenario.filter((c) => c.orbitClass !== 'LEO').map((c) => c.id);
    const B = inScenario.filter((c) => c.orbitClass === 'LEO').map((c) => c.id);
    up({ orbitPolicy: 'dedicated', beamAssign: mbb.beamAssign?.A.length || mbb.beamAssign?.B.length ? mbb.beamAssign : { A, B: B.length ? B : A } });
  };
  const toggle = (b: 'A' | 'B', id: string, on: boolean) => {
    const cur = { ...assign, [b]: on ? [...assign[b], id] : assign[b].filter((x) => x !== id) };
    up({ orbitPolicy: 'dedicated', beamAssign: cur });
  };
  const col = (b: 'A' | 'B') => {
    const ids = assign[b].filter((id) => inScenario.some((c) => c.id === id));
    return (
      <div className="beam-col">
        <h5><span className="bdot" style={{ background: b === 'A' ? '#22d3ee' : '#f472b6' }} /> Beam {b}</h5>
        {inScenario.map((c) => (
          <label key={c.id} className="chk">
            <input type="checkbox" checked={ids.includes(c.id)} onChange={(e) => toggle(b, c.id, e.target.checked)} />
            <span className="ellipsis">{c.name}</span>
          </label>
        ))}
        {!ids.length && <div className="small" style={{ color: 'var(--warn)', marginTop: 4 }}>No system: beam {b} stays idle</div>}
      </div>
    );
  };
  return (
    <div>
      {dual ? (
        <Seg value={dedicated ? 'dedicated' : 'mbb'} onChange={setMode} options={[['mbb', 'Make-before-break'], ['dedicated', 'Dedicated beams']]} />
      ) : null}
      <div className="small muted" style={{ margin: '8px 0' }}>
        {!dual
          ? 'Single-beam terminal: every handover breaks the link for the acquisition time.'
          : dedicated
            ? 'Each beam tracks only the systems ticked below and re-points within them. Traffic rides the beam with the higher throughput, so one beam always covers the other’s re-pointing.'
            : 'Both beams may use any satellite in the scenario. Before the serving satellite is lost, the free beam acquires the next one and traffic switches with no interruption.'}
      </div>
      {dedicated && <div className="beam-plan">{col('A')}{col('B')}</div>}
      <div className="fgrid" style={{ marginTop: 8 }}>
        <SelectField label="Satellite choice" value={mbb.policy} onChange={(v) => up({ policy: v })}
          options={[['longest-visibility', 'Longest visibility'], ['max-elevation', 'Highest elevation'], ['best-sinr', 'Best signal']]} />
        {!dedicated && (
          <SelectField label="Orbit preference" value={mbb.orbitPolicy === 'dedicated' || mbb.orbitPolicy === 'geo-leo-dual' ? 'leo-first' : mbb.orbitPolicy} onChange={(v) => up({ orbitPolicy: v })}
            options={[['leo-first', 'LEO → MEO → GEO'], ['best-throughput', 'Best throughput'], ['single', 'No preference']]} />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ simulation
function SimSettings() {
  const mbb = useStore((s) => s.mbb);
  const running = useStore((s) => s.simRunning);
  const progress = useStore((s) => s.simProgress);
  const stale = useStore((s) => s.simStale);
  const sim = useStore((s) => s.sim);
  const up = (p: Partial<typeof mbb>) => useStore.getState().set({ mbb: { ...useStore.getState().mbb, ...p } });
  return (
    <div>
      <div className="fgrid">
        <NumberField label="Duration" unit="min" value={mbb.durationMin} min={1} max={720} step={5} onChange={(v) => up({ durationMin: v })} />
        <NumberField label="Time step" unit="s" value={mbb.stepSec} min={0.5} max={120} step={0.5} onChange={(v) => up({ stepSec: v })} />
        <NumberField label="Min elevation" unit="°" value={mbb.minElevationDeg} min={0} max={80} step={1} onChange={(v) => up({ minElevationDeg: v })} />
        <NumberField label="Hand over below" unit="°" value={mbb.handoverElevationDeg} min={0} max={85} step={1} onChange={(v) => up({ handoverElevationDeg: v })} />
        <NumberField label="Acquisition time" unit="s" value={mbb.acquisitionSec} min={0} max={60} step={0.5} onChange={(v) => up({ acquisitionSec: v })} />
        <NumberField label="MBB overlap" unit="s" value={mbb.overlapSec} min={0} max={60} step={0.5} onChange={(v) => up({ overlapSec: v })} />
      </div>
      <button className="btn primary" style={{ width: '100%', marginTop: 10 }} disabled={running} onClick={() => useStore.getState().runSim()}>
        {running ? `Simulating… ${Math.round(progress * 100)}%` : 'Run simulation from current time'}
      </button>
      <div className="small dim" style={{ marginTop: 6 }}>
        {sim ? <>Last run: {sim.summary.handovers} handovers, availability {sim.summary.availabilityPct.toFixed(2)}%{stale && <span className="stale"> · settings changed, re-run to update</span>}</> : 'Not simulated yet.'}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ panel
export function ScenarioTab() {
  const name = useStore((s) => s.name);
  const scenarioId = useStore((s) => s.scenarioId);
  const constellations = useStore((s) => s.constellations);
  const sats = useStore((s) => s.sats);
  const inScenario = constellations.filter((c) => c.enabled);
  const template = DEMOS.find((d) => d.id === scenarioId);
  const counts = { LEO: 0, MEO: 0, GEO: 0, HEO: 0 } as Record<OrbitClass, number>;
  const consMap = new Map(constellations.map((c) => [c.id, c]));
  for (const x of sats) counts[consMap.get(x.constellationId)?.orbitClass ?? 'LEO']++;
  return (
    <div>
      <div className="ob-head">
        <input className="ob-name" value={name} onChange={(e) => useStore.setState({ name: e.target.value })} aria-label="Scenario name" />
        <button className="btn sm" onClick={() => useStore.setState({ templatesOpen: true })} title="Start from a ready-made scenario"><Icon.scenarios /> Templates</button>
      </div>
      <div className="ob-sub">{template ? `From template “${template.name}”` : 'Custom scenario'} · {sats.length} satellites (LEO {counts.LEO} · MEO {counts.MEO} · GEO {counts.GEO})</div>

      <Sect>Ground terminal</Sect>
      <TerminalNode />

      <Sect>Satellites in scenario ({inScenario.length})</Sect>
      {inScenario.map((c) => <SystemNode key={c.id} c={c} />)}
      <AddSystems />

      <Sect>Beam plan</Sect>
      <BeamPlan />

      <Sect>Simulation</Sect>
      <SimSettings />
    </div>
  );
}
