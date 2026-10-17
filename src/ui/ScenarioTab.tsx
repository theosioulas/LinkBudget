import { useState, type ReactNode } from 'react';
import { useStore, activeTerminal, markCustom, setView } from '../store/store';
import type { Constellation, OrbitClass, Payload, HandoverPolicy } from '../core/model';
import { resolveBeams, isDedicated, trafficMode, type BeamConfig } from '../core/sim/beamplan';
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


const LAYOUT_NAME: Record<Payload['layout']['kind'], string> = {
  'steerable-cells': 'Steerable spot beams over ground cells', 'fixed-strips': 'Fixed strip beams', 'hex-grid': 'Multibeam hex grid',
  spot: 'Single spot / regional beam', kml: 'Beams from KML contours',
};
const POL_NAME: Record<string, string> = { RHCP: 'RHCP', LHCP: 'LHCP', H: 'linear H', V: 'linear V' };
const ghz = (f: number) => `${+f.toFixed(3)} GHz`;
const mhz = (b: number) => (b >= 1000 ? `${+(b / 1000).toFixed(2)} GHz` : `${+b.toFixed(1)} MHz`);

/** One-line RF summary: band, downlink / uplink frequency and polarisation. */
export function rfSummary(pl?: Payload): string {
  if (!pl) return 'no payload';
  return `${pl.band}-band · ↓ ${ghz(pl.forward.freqGHz)} ${POL_NAME[pl.forward.pol]} · ↑ ${ghz(pl.ret.freqGHz)} ${POL_NAME[pl.ret.pol]}`;
}

function orbitSummary(c: Constellation, n: number): string {
  const src = c.source;
  if (src.kind === 'walker') return src.shells.map((sh) => `${sh.altitudeKm.toLocaleString()} km · ${sh.inclinationDeg}° · ${sh.planes}×${sh.satsPerPlane}`).join(' + ') + ` (${n} sats)`;
  if (src.kind === 'geo') return src.slots.map((x) => `${Math.abs(x.lon).toFixed(1)}°${x.lon >= 0 ? 'E' : 'W'}`).join(', ') + (c.followTerminal ? ' (follows terminal)' : '') + ' · 35,786 km';
  return `${n} satellites from TLE · ${src.label}`;
}

/** Everything about a system's RF set-up at a glance (band, frequencies, polarisation, power, beams, orbit). */
function SystemSpecs({ c, pl, n }: { c: Constellation; pl?: Payload; n: number }) {
  const rows: [string, string][] = [['Orbit', `${c.orbitClass} · ${orbitSummary(c, n)}`]];
  if (pl) {
    const L = pl.layout;
    const beams = L.kind === 'fixed-strips' ? `${L.count} × ${L.alongTrackDeg}° × ${L.crossTrackDeg}° strips`
      : L.kind === 'steerable-cells' ? `${L.beamsPerSat} beams · ${pl.pattern.hpbwDeg}° HPBW · ${L.cellDiameterKm} km cells · ${L.reuseColors}-colour reuse`
        : L.kind === 'hex-grid' ? `${3 * L.rings * (L.rings + 1) + 1} beams · ${pl.pattern.hpbwDeg}° HPBW · ${L.reuseColors}-colour reuse`
          : L.kind === 'kml' ? `${L.beams.length} beams · ${L.sourceName || 'KML'}`
            : `${pl.pattern.hpbwDeg}° HPBW${L.followTerminal ? ' · aimed at terminal' : ` · aimed at ${L.aimLat.toFixed(1)}°, ${L.aimLon.toFixed(1)}°`}`;
    rows.push(
      ['Band', `${pl.band}-band · ${pl.architecture === 'regenerative' ? 'regenerative (OBP)' : 'transparent (bent-pipe)'}`],
      ['Downlink', `${ghz(pl.forward.freqGHz)} · ${mhz(pl.forward.bandwidthMHz)} · ${POL_NAME[pl.forward.pol]}`],
      ['Uplink', `${ghz(pl.ret.freqGHz)} · ${mhz(pl.ret.bandwidthMHz)} · ${POL_NAME[pl.ret.pol]}`],
      ['EIRP / G/T', `${pl.forward.eirpPeakDbw} dBW · ${pl.ret.gtPeakDbK} dB/K per beam (peak)`],
      ['Beams', `${LAYOUT_NAME[L.kind]} · ${beams}`],
      ['Service', `min elevation ${pl.minElevationDeg}° · payload “${pl.name}”`],
    );
  }
  return (
    <div className="specs">
      {rows.map(([k, v]) => <div key={k} className="spec"><span>{k}</span><b>{v}</b></div>)}
      {(c.description || pl?.notes) && <p className="small muted" style={{ margin: '6px 0 0' }}>{c.description}{c.description && pl?.notes ? ' ' : ''}{pl?.notes}</p>}
    </div>
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
    const a = st.mbb.beamAssign, bc = st.mbb.beamCfg;
    const strip = (x?: Partial<BeamConfig>) => x && { ...x, systems: x.systems?.filter((id) => id !== c.id), satId: x.satId && st.sats.find((q) => q.id === x.satId)?.constellationId === c.id ? null : x.satId };
    st.set({ mbb: { ...st.mbb, beamAssign: a && { A: a.A.filter((x) => x !== c.id), B: a.B.filter((x) => x !== c.id) }, beamCfg: bc && { A: strip(bc.A), B: strip(bc.B) } } });
    update(c.id, { enabled: false });
    markCustom();
    rerun();
  };
  return (
    <Node
      icon={<input type="color" value={c.color} onChange={(e) => u({ color: e.target.value })} className="cdot" title="Colour" />}
      title={c.name}
      sub={<>{c.orbitClass} · {n} sats · {c.operator}<br />{rfSummary(pl)}</>}
      open={open} onToggle={() => setOpen(!open)}
      right={<>
        <button className="ibtn sm" title="Edit this system's payload" onClick={() => useStore.setState({ payloadSystemId: c.id, drawer: 'payload' })}><Icon.payload /></button>
        <button className="ibtn sm" title="Show the best visible satellite and its beams" onClick={() => focusConstellation(c.id)}><Icon.target /></button>
        <button className="ibtn sm" title="Remove from scenario" onClick={drop}><Icon.close /></button>
      </>}>
      <SystemSpecs c={c} pl={pl} n={n} />
      <h4 className="sect">Properties</h4>
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
            <span className="grow small" style={{ minWidth: 0 }}>{c.name} <span className="dim">· {c.operator}</span><br /><span className="dim">{rfSummary(payloads.find((p) => p.id === c.payloadId))}</span></span>
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
const POLICIES: [HandoverPolicy, string][] = [['longest-visibility', 'Longest visibility'], ['max-elevation', 'Highest elevation'], ['best-sinr', 'Best signal']];
const BEAM_COLOR = { A: '#22d3ee', B: '#f472b6' };

function SystemChips({ ids, value, onChange, all }: { ids: Constellation[]; value: string[]; onChange: (v: string[]) => void; all?: string }) {
  return (
    <div className="sys-tabs">
      {ids.map((c) => {
        const on = value.includes(c.id);
        return (
          <button key={c.id} className={`sys-tab ${on ? 'on' : ''}`} onClick={() => onChange(on ? value.filter((x) => x !== c.id) : [...value, c.id])} aria-pressed={on}>
            <span className="bdot" style={{ background: c.color }} />{c.name}<span className={`chip ${c.orbitClass.toLowerCase()}`}>{c.orbitClass}</span>
          </button>
        );
      })}
      {!value.length && all && <span className="small dim" style={{ alignSelf: 'center' }}>{all}</span>}
    </div>
  );
}

function BeamCard({ b, cfg, systems, onChange }: { b: 'A' | 'B'; cfg: BeamConfig; systems: Constellation[]; onChange: (p: Partial<BeamConfig>) => void }) {
  const sats = useStore((s) => s.sats);
  const live = useStore((s) => s.live[b]);
  const names = (cfg.systems.length ? systems.filter((c) => cfg.systems.includes(c.id)) : systems).map((c) => c.name);
  const candidates = sats.filter((x) => !cfg.systems.length || cfg.systems.includes(x.constellationId));
  const pinned = cfg.satId ? sats.find((x) => x.id === cfg.satId) : undefined;
  return (
    <div className={`beam-card ${cfg.on ? '' : 'off'}`} style={{ borderLeftColor: BEAM_COLOR[b] }}>
      <div className="beam-head">
        <span className="bdot" style={{ background: BEAM_COLOR[b] }} />
        <b>Beam {b} →</b>
        <span className="grow ellipsis small">{cfg.on ? (pinned ? pinned.name : names.join(' / ') || 'no system') : 'off'}</span>
        <Toggle checked={cfg.on} onChange={(v) => onChange({ on: v })} label="" title={cfg.on ? `Switch beam ${b} off` : `Switch beam ${b} on`} />
      </div>
      {cfg.on && !live && (
        <div className="small" style={{ color: 'var(--warn)', padding: '0 10px 6px' }}>No satellite of these systems is usable from the terminal right now (check elevation limits, location or obstructions).</div>
      )}
      {cfg.on && (
        <div className="beam-body">
          <div className="small dim">Systems</div>
          <SystemChips ids={systems} value={cfg.systems} onChange={(v) => onChange({ systems: v, satId: null })} all="none ticked = any system" />
          <div className="fgrid" style={{ marginTop: 8 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <SelectField label="Satellite" value={cfg.satId ?? ''} onChange={(v) => onChange({ satId: v || null })}
                options={[['', candidates.length > 400 ? `Automatic (best of ${candidates.length})` : 'Automatic (best available)'],
                  ...(candidates.length <= 400 ? candidates.map((x) => [x.id, x.name] as [string, string]).sort((p, q) => p[1].localeCompare(q[1])) : [])]} />
            </div>
            <SelectField label="Choose by" value={cfg.policy} options={POLICIES} onChange={(v) => onChange({ policy: v })} />
            <NumberField label="Min elevation" unit="°" value={cfg.minElevationDeg} min={0} max={85} step={1} onChange={(v) => onChange({ minElevationDeg: v })} />
            <NumberField label="Hand over below" unit="°" value={cfg.handoverElevationDeg} min={0} max={89} step={1} onChange={(v) => onChange({ handoverElevationDeg: v })} />
          </div>
          {candidates.length > 400 && <div className="small dim" style={{ marginTop: 4 }}>Pinning a single satellite is available for systems with up to 400 satellites (GEO, MEO, small LEO sets).</div>}
        </div>
      )}
    </div>
  );
}

function BeamPlan() {
  const mbb = useStore((s) => s.mbb);
  const terminal = useStore(activeTerminal);
  const constellations = useStore((s) => s.constellations);
  const inScenario = constellations.filter((c) => c.enabled);
  const orbitOf = (id: string) => constellations.find((c) => c.id === id)?.orbitClass ?? 'LEO';
  const cfg = resolveBeams(mbb, orbitOf, inScenario.map((c) => c.id));
  const dual = terminal.beams === 2;
  const dedicated = isDedicated(mbb);
  const up = (p: Partial<typeof mbb>) => { useStore.getState().set({ mbb: { ...useStore.getState().mbb, ...p } }); markCustom(); rerun(); };
  const setBeam = (b: 'A' | 'B', p: Partial<BeamConfig>) => up({
    orbitPolicy: mbb.orbitPolicy === 'geo-leo-dual' ? 'dedicated' : mbb.orbitPolicy,
    beamCfg: { A: { ...cfg.A }, B: { ...cfg.B }, [b]: { ...cfg[b], ...p } },
  });
  const setMode = (m: 'dedicated' | 'shared') => {
    if (m === 'shared') { up({ orbitPolicy: 'leo-first' }); return; }
    // sensible start: GEO/MEO on beam A, LEO on beam B
    const nonLeo = inScenario.filter((c) => c.orbitClass !== 'LEO').map((c) => c.id), leo = inScenario.filter((c) => c.orbitClass === 'LEO').map((c) => c.id);
    up({ orbitPolicy: 'dedicated', beamCfg: { A: { ...cfg.A, systems: nonLeo.length ? nonLeo : leo }, B: { ...cfg.B, systems: leo.length ? leo : nonLeo } } });
  };
  return (
    <div>
      {dual && <Seg value={dedicated ? 'dedicated' : 'shared'} onChange={setMode} options={[['dedicated', 'Each beam its own systems'], ['shared', 'Shared make-before-break']]} />}
      <div className="small muted" style={{ margin: '8px 0' }}>
        {!dual ? 'Single-beam terminal: every handover breaks the link for the acquisition time.'
          : dedicated ? 'Choose what each beam tracks. A beam re-points within its own systems; the traffic setting decides which beam carries the data.'
            : 'Both beams draw from the same systems: before the serving satellite is lost the free beam locks the next one and traffic switches with no interruption.'}
      </div>
      {dual && dedicated ? (
        <>
          <SelectField label="Traffic" value={trafficMode(mbb)} onChange={(v) => up({ traffic: v, orbitPolicy: mbb.orbitPolicy === 'geo-leo-dual' ? 'dedicated' : mbb.orbitPolicy, beamCfg: { A: cfg.A, B: cfg.B } })}
            options={[['best', 'Faster beam carries the traffic'], ['A', 'Beam A primary, B backup'], ['B', 'Beam B primary, A backup'], ['bonded', 'Both beams bonded (throughputs add)']]} />
          <div style={{ marginTop: 8 }}>
            <BeamCard b="A" cfg={cfg.A} systems={inScenario} onChange={(p) => setBeam('A', p)} />
            <BeamCard b="B" cfg={cfg.B} systems={inScenario} onChange={(p) => setBeam('B', p)} />
          </div>
        </>
      ) : (
        <div className="beam-card" style={{ borderLeftColor: BEAM_COLOR.A }}>
          <div className="beam-head">
            <span className="bdot" style={{ background: BEAM_COLOR.A }} />{dual && <span className="bdot" style={{ background: BEAM_COLOR.B, marginLeft: -4 }} />}
            <b>{dual ? 'Beams A + B →' : 'Beam →'}</b>
            <span className="grow" />
            {dual && <Toggle checked={cfg.B.on} onChange={(v) => setBeam('B', { on: v })} label="Use beam B" title="Switch off to run with one beam" />}
          </div>
          <div className="beam-body">
            <div className="small dim">Systems</div>
            <SystemChips ids={inScenario} value={cfg.A.systems} onChange={(v) => up({ beamCfg: { A: { ...cfg.A, systems: v }, B: { ...cfg.B, systems: v } } })} all="none ticked = any system" />
            <div className="fgrid" style={{ marginTop: 8 }}>
              <SelectField label="Choose by" value={mbb.policy} options={POLICIES} onChange={(v) => up({ policy: v, beamCfg: { A: { ...cfg.A, policy: v }, B: { ...cfg.B, policy: v } } })} />
              <SelectField label="Orbit preference" value={mbb.orbitPolicy === 'dedicated' || mbb.orbitPolicy === 'geo-leo-dual' ? 'leo-first' : mbb.orbitPolicy} onChange={(v) => up({ orbitPolicy: v })}
                options={[['leo-first', 'LEO → MEO → GEO'], ['best-throughput', 'Best throughput'], ['single', 'No preference']]} />
              <NumberField label="Min elevation" unit="°" value={mbb.minElevationDeg} min={0} max={85} step={1} onChange={(v) => up({ minElevationDeg: v })} />
              <NumberField label="Hand over below" unit="°" value={mbb.handoverElevationDeg} min={0} max={89} step={1} onChange={(v) => up({ handoverElevationDeg: v })} />
            </div>
          </div>
        </div>
      )}
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
        <button className="btn sm" onClick={() => useStore.setState({ wizardOpen: true })} title="Build a scenario from scratch">＋ New</button>
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
