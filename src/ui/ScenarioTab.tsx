import { useState } from 'react';
import { useStore } from '../store/store';
import type { Constellation, OrbitClass } from '../core/model';
import type { WalkerShell } from '../core/orbit/walker';
import { NumberField, SelectField, TextField, Toggle, Sect, pickFile } from './controls';
import { parseTleText } from '../core/orbit/propagator';
import { globe } from '../globe/GlobeView';
import { periodSec } from '../core/orbit/kepler';
import { rankCandidates } from '../core/sim/handover';
import { makeEvalContext } from '../core/sim/runtime';
import { activeTerminal } from '../store/store';

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
  globe?.flyToSat(sat.id);
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

function ConstellationCard({ c }: { c: Constellation }) {
  const [open, setOpen] = useState(false);
  const payloads = useStore((s) => s.payloads);
  const update = useStore((s) => s.updateConstellation);
  const remove = useStore((s) => s.removeConstellation);
  const sats = useStore((s) => s.sats);
  const n = sats.filter((s) => s.constellationId === c.id).length;
  const u = (p: Partial<Constellation>) => update(c.id, p);
  const src = c.source;
  return (
    <div className={`card ${open ? 'sel' : ''}`}>
      <div className="card-title">
        <input type="color" value={c.color} onChange={(e) => u({ color: e.target.value })} style={{ width: 18, height: 18, border: 'none', padding: 0, background: 'none', cursor: 'pointer' }} title="Colour" />
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
        <span className={`chip ${c.orbitClass.toLowerCase()}`}>{c.orbitClass}</span>
        <Toggle checked={c.enabled || !!c.locked} disabled={c.locked} onChange={(v) => u({ enabled: v })} label="" title={c.locked ? 'Always on: the GEO fallback for every scenario' : 'Show / hide this constellation'} />
      </div>
      <div className="row small dim" style={{ marginTop: 3 }}>
        <span>{c.operator} · {c.enabled ? `${n} sats` : 'disabled'} · {payloads.find((p) => p.id === c.payloadId)?.band ?? '?'}-band</span>
        <span className="right-align row" style={{ gap: 4 }}>
          {c.enabled && <button className="btn sm" onClick={() => focusConstellation(c.id)} title="Select the best visible satellite and show its beams">Focus</button>}
          <button className="btn sm" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Edit'}</button>
        </span>
      </div>
      {open && (
        <div style={{ marginTop: 8 }}>
          {c.description && <div className="small muted" style={{ marginBottom: 6 }}>{c.description}</div>}
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
              {src.slots.map((s, i) => (
                <div key={i} className="fgrid three" style={{ marginBottom: 6 }}>
                  <TextField label="Name" value={s.name} onChange={(v) => u({ source: { kind: 'geo', slots: src.slots.map((x, j) => (j === i ? { ...x, name: v } : x)) } })} />
                  <NumberField label="Longitude" unit="°E" value={s.lon} step={0.1} min={-180} max={180} onChange={(v) => u({ source: { kind: 'geo', slots: src.slots.map((x, j) => (j === i ? { ...x, lon: v } : x)) } })} />
                  <NumberField label="Inclination" unit="°" value={s.inc ?? 0} step={0.05} min={0} max={15} onChange={(v) => u({ source: { kind: 'geo', slots: src.slots.map((x, j) => (j === i ? { ...x, inc: v } : x)) } })} />
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
          <div className="row" style={{ marginTop: 8 }}>
            {!c.locked && <button className="btn sm danger right-align" onClick={() => remove(c.id)}>Delete constellation</button>}
          </div>
        </div>
      )}
    </div>
  );
}

export function ScenarioTab() {
  const constellations = useStore((s) => s.constellations);
  const payloads = useStore((s) => s.payloads);
  const add = useStore((s) => s.addConstellation);
  const notify = useStore((s) => s.notify);
  const [group, setGroup] = useState('oneweb');
  const [busy, setBusy] = useState(false);
  const color = () => PALETTE[constellations.length % PALETTE.length];
  const id = (p: string) => `${p}-${Date.now().toString(36)}`;
  const defaultPayload = (oc: OrbitClass) => (oc === 'GEO' ? 'pl-geo-ku-wide' : oc === 'MEO' ? 'pl-mpower-ka' : 'pl-starlink-ku');
  const counts = { LEO: 0, MEO: 0, GEO: 0, HEO: 0 } as Record<OrbitClass, number>;
  const sats = useStore((s) => s.sats);
  const consMap = new Map(constellations.map((c) => [c.id, c]));
  for (const s of sats) counts[consMap.get(s.constellationId)?.orbitClass ?? 'LEO']++;

  const addTle = (text: string, label: string, oc: OrbitClass, name: string) => {
    const n = parseTleText(text).length;
    if (!n) { notify('No valid TLEs found'); return; }
    add({
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
    <div>
      <div className="row wrap" style={{ gap: 6, marginBottom: 8 }}>
        <span className="chip leo">LEO {counts.LEO}</span><span className="chip meo">MEO {counts.MEO}</span><span className="chip geo">GEO {counts.GEO}</span>
        <span className="dim small right-align">{sats.length} satellites</span>
      </div>
      {constellations.map((c) => <ConstellationCard key={c.id} c={c} />)}

      <Sect>Add satellites</Sect>
      <div className="row wrap" style={{ gap: 6 }}>
        <button className="btn sm" onClick={() => add({
          id: id('walker'), name: 'Custom Walker', operator: 'Custom', orbitClass: 'LEO', color: color(), enabled: true, payloadId: payloads[0].id,
          showOrbits: true, showCoverage: false, showLabels: false, propagator: 'kepler-j2',
          source: { kind: 'walker', shells: [{ altitudeKm: 800, inclinationDeg: 60, planes: 8, satsPerPlane: 10, phasing: 1, pattern: 'delta' }] },
        })}>＋ Walker constellation</button>
        <button className="btn sm" onClick={() => add({
          id: id('geo'), name: 'Custom GEO', operator: 'Custom', orbitClass: 'GEO', color: color(), enabled: true, payloadId: 'pl-geo-ku-wide',
          showOrbits: true, showCoverage: false, showLabels: true, propagator: 'kepler-j2', source: { kind: 'geo', slots: [{ name: 'GEO 0°E', lon: 0, inc: 0 }] },
        })}>＋ GEO satellite</button>
        <button className="btn sm" onClick={() => add({
          id: id('meo'), name: 'Custom MEO', operator: 'Custom', orbitClass: 'MEO', color: color(), enabled: true, payloadId: 'pl-mpower-ka',
          showOrbits: true, showCoverage: true, showLabels: true, propagator: 'kepler-j2',
          source: { kind: 'walker', shells: [{ altitudeKm: 8062, inclinationDeg: 0, planes: 1, satsPerPlane: 8, phasing: 0, pattern: 'delta' }] },
        })}>＋ MEO ring</button>
        <button className="btn sm" onClick={async () => {
          const f = await pickFile('.txt,.tle,.3le');
          if (f) addTle(await f.text(), f.name, 'LEO', f.name.replace(/\.\w+$/, ''));
        }}>＋ TLE file…</button>
      </div>
      <div className="row" style={{ gap: 6, marginTop: 8 }}>
        <div style={{ flex: 1 }}><SelectField label="Live TLEs from CelesTrak" value={group} options={CELESTRAK.map(([k, l]) => [k, l])} onChange={setGroup} /></div>
        <button className="btn sm" style={{ marginTop: 14 }} disabled={busy} onClick={fetchLive}>{busy ? 'Fetching…' : 'Fetch'}</button>
      </div>
      <div className="small dim" style={{ marginTop: 6 }}>
        Presets use analytic Walker shells (two-body + J2 secular drift) so they start instantly and stay physically consistent. Live TLEs use real element sets (SGP4 or Kepler+J2).
      </div>
    </div>
  );
}
