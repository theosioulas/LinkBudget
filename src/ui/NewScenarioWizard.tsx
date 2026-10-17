import { useEffect, useMemo, useState } from 'react';
import { useStore, activeTerminal, setView } from '../store/store';
import { DEFAULT_MBB } from '../data/presets';
import { buildSatellites } from '../core/sim/runtime';
import { satEcef } from '../core/orbit/propagator';
import { lookAngles } from '../core/geo/coords';
import type { Constellation } from '../core/model';
import { NumberField, SelectField, TextField, Seg } from './controls';
import { PLACES, rfSummary } from './ScenarioTab';
import { Icon } from './icons';

type Traffic = 'best' | 'A' | 'B' | 'bonded';
interface BeamPick { system: string; satId: string | null }

const STEPS = ['Terminal', 'Beam A', 'Beam B', 'Review'];
const BEAM_COLOR = { A: '#22d3ee', B: '#f472b6' };

/** Satellites of one system, for pinning a beam (only for systems small enough to list). */
function useSatList(c?: Constellation) {
  const epochMs = useStore((s) => s.epochMs);
  return useMemo(() => {
    if (!c) return [];
    const list = buildSatellites([{ ...c, enabled: true }], epochMs);
    return list.length <= 400 ? list.map((x) => [x.id, x.name] as [string, string]).sort((a, b) => a[1].localeCompare(b[1])) : [];
  }, [c, epochMs]);
}

/** How many satellites of each system are above the minimum elevation at the location right now. */
function useVisibility(lat: number, lon: number) {
  const constellations = useStore((s) => s.constellations);
  const epochMs = useStore((s) => s.epochMs);
  const minEl = useStore((s) => s.mbb.minElevationDeg);
  const t = useStore((s) => Math.floor(s.clock.t / 60_000) * 60_000);
  return useMemo(() => {
    const out = new Map<string, { n: number; maxEl: number }>();
    for (const c of constellations) {
      let n = 0, maxEl = -90;
      for (const sat of buildSatellites([{ ...c, enabled: true }], epochMs)) {
        const el = lookAngles({ lat, lon, alt: 0 }, satEcef(sat, t)).el;
        if (el > maxEl) maxEl = el;
        if (el >= minEl) n++;
      }
      out.set(c.id, { n, maxEl });
    }
    return { out, minEl };
  }, [constellations, epochMs, lat, lon, t, minEl]);
}

function SystemPicker({ beam, value, onChange, exclude, lat, lon }: { beam: 'A' | 'B'; value: BeamPick; onChange: (v: BeamPick) => void; exclude?: string; lat: number; lon: number }) {
  const constellations = useStore((s) => s.constellations);
  const payloads = useStore((s) => s.payloads);
  const vis = useVisibility(lat, lon);
  const chosen = constellations.find((c) => c.id === value.system);
  const sats = useSatList(chosen);
  const groups: ['LEO' | 'MEO' | 'GEO' | 'HEO', string][] = [['GEO', 'GEO'], ['MEO', 'MEO'], ['LEO', 'LEO'], ['HEO', 'HEO']];
  return (
    <div>
      {groups.map(([oc, label]) => {
        const list = constellations.filter((c) => c.orbitClass === oc);
        if (!list.length) return null;
        return (
          <div key={oc} style={{ marginBottom: 6 }}>
            <div className="small dim" style={{ margin: '6px 0 4px' }}>{label}</div>
            {list.map((c) => {
              const on = value.system === c.id;
              const n = c.source.kind === 'walker' ? c.source.shells.reduce((a, s) => a + s.planes * s.satsPerPlane, 0) : c.source.kind === 'geo' ? c.source.slots.length : undefined;
              return (
                <button key={c.id} className={`pick ${on ? 'on' : ''}`} style={on ? { borderColor: BEAM_COLOR[beam] } : undefined}
                  onClick={() => onChange({ system: c.id, satId: null })} disabled={c.id === exclude} title={c.id === exclude ? 'Already on the other beam' : undefined}>
                  <span className="bdot" style={{ background: c.color }} />
                  <span className="grow" style={{ minWidth: 0 }}>
                    <b>{c.name}</b> <span className="dim">· {c.operator}{n ? ` · ${n} sats` : ''}</span>
                    <span className="dim small" style={{ display: 'block' }}>{rfSummary(payloads.find((p) => p.id === c.payloadId))}</span>
                    {(() => {
                      const v = vis.out.get(c.id);
                      if (!v) return null;
                      return v.n
                        ? <span className="small" style={{ display: 'block', color: 'var(--good)' }}>{v.n} visible from here now (≥ {vis.minEl}° elevation)</span>
                        : <span className="small" style={{ display: 'block', color: 'var(--warn)' }}>Not visible from here now: highest {v.maxEl.toFixed(0)}° (minimum {vis.minEl}°)</span>;
                    })()}
                  </span>
                  {on && <span style={{ width: 16, height: 16, display: 'inline-flex', color: BEAM_COLOR[beam] }}><Icon.check /></span>}
                </button>
              );
            })}
          </div>
        );
      })}
      {chosen && (
        <div style={{ marginTop: 8 }}>
          <SelectField label="Satellite" value={value.satId ?? ''} onChange={(v) => onChange({ ...value, satId: v || null })}
            options={[['', sats.length ? 'Automatic (best available)' : `Automatic (best of ${chosen.name})`], ...sats]} />
        </div>
      )}
    </div>
  );
}

export function NewScenarioWizard() {
  const open = useStore((s) => s.wizardOpen);
  const terminals = useStore((s) => s.terminals);
  const current = useStore(activeTerminal);
  const [step, setStep] = useState(0);
  const [termId, setTermId] = useState(current.id);
  const [lat, setLat] = useState(current.lat);
  const [lon, setLon] = useState(current.lon);
  const [beams, setBeams] = useState<1 | 2>(2);
  const [A, setA] = useState<BeamPick>({ system: '', satId: null });
  const [B, setB] = useState<BeamPick>({ system: '', satId: null });
  const [bOn, setBOn] = useState(true);
  const [traffic, setTraffic] = useState<Traffic>('best');
  const [name, setName] = useState('My scenario');
  const [duration, setDuration] = useState(30);
  const close = () => useStore.setState({ wizardOpen: false });

  useEffect(() => {
    if (!open) return;
    const t = activeTerminal(useStore.getState());
    setStep(0); setTermId(t.id); setLat(t.lat); setLon(t.lon); setBeams(t.beams);
    setA({ system: '', satId: null }); setB({ system: '', satId: null }); setBOn(true); setTraffic('best'); setName('My scenario'); setDuration(30);
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  if (!open) return null;

  const constellations = useStore.getState().constellations;
  const sysName = (id: string) => constellations.find((c) => c.id === id)?.name ?? '—';
  const useB = beams === 2 && bOn;
  const place = PLACES.find(([, la, lo]) => Math.abs(la - lat) < 0.05 && Math.abs(lo - lon) < 0.05)?.[0] ?? '';
  const steps = beams === 2 ? STEPS : STEPS.filter((s) => s !== 'Beam B');
  const stepName = steps[Math.min(step, steps.length - 1)];
  const canNext = stepName === 'Beam A' ? !!A.system : stepName === 'Beam B' ? !useB || !!B.system : true;

  const create = () => {
    const st = useStore.getState();
    const enabled = new Set([A.system, ...(useB ? [B.system] : [])]);
    const terminal = st.terminals.find((t) => t.id === termId)!;
    useStore.setState({
      name: name.trim() || 'My scenario', scenarioId: 'custom', activeTerminalId: termId, wizardOpen: false, drawer: 'scenario',
      constellations: st.constellations.map((c) => ({ ...c, enabled: enabled.has(c.id) })),
      mbb: {
        ...DEFAULT_MBB, durationMin: duration,
        orbitPolicy: useB ? 'dedicated' : 'leo-first', traffic,
        beamCfg: { A: { on: true, systems: [A.system], satId: A.satId }, B: { on: useB, systems: useB ? [B.system] : [], satId: useB ? B.satId : null } },
      },
      sim: null, selectedSatId: null, focusPayloadSatId: null,
    });
    st.updateTerminal({ lat, lon, beams, type: beams === 2 && terminal.type === 'parabolic' ? 'phased-array' : terminal.type });
    useStore.getState().rebuildSats();
    setTimeout(() => { useStore.getState().runSim(); setView('terminal'); }, 100);
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal glass wizard" role="dialog" aria-modal="true" aria-labelledby="wiz-title">
        <div className="modal-head">
          <h3 id="wiz-title">New scenario</h3>
          <button className="ibtn sm" onClick={close} title="Close"><Icon.close /></button>
        </div>
        <div className="wiz-steps">
          {steps.map((s, i) => <span key={s} className={`wiz-step ${i === step ? 'on' : i < step ? 'done' : ''}`}>{i + 1}. {s}</span>)}
        </div>
        <div className="modal-body wiz-body">
          {stepName === 'Terminal' && (
            <div className="fgrid">
              <div style={{ gridColumn: '1 / -1' }}>
                <SelectField label="Terminal model" value={termId} options={terminals.map((t) => [t.id, t.name])} onChange={setTermId} />
              </div>
              <SelectField label="Location" value={place} options={[['', place || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`], ...PLACES.filter(([n]) => n !== place).map(([n]) => [n, n] as [string, string])]}
                onChange={(n) => { const p = PLACES.find((x) => x[0] === n); if (p) { setLat(p[1]); setLon(p[2]); } }} />
              <div className="field">
                <label>Simultaneous beams</label>
                <Seg value={beams} onChange={setBeams} options={[[2, 'Two (A + B)'], [1, 'One']]} />
              </div>
              <NumberField label="Latitude" unit="°" value={lat} step={0.01} min={-90} max={90} onChange={setLat} />
              <NumberField label="Longitude" unit="°" value={lon} step={0.01} min={-180} max={180} onChange={setLon} />
            </div>
          )}
          {stepName === 'Beam A' && (
            <>
              <p className="small muted" style={{ margin: 0 }}>Choose the system <b style={{ color: BEAM_COLOR.A }}>Beam A</b> tracks, and optionally pin one satellite (e.g. a GEO slot).</p>
              <SystemPicker beam="A" value={A} onChange={setA} lat={lat} lon={lon} />
            </>
          )}
          {stepName === 'Beam B' && (
            <>
              <div className="row" style={{ gap: 10 }}>
                <p className="small muted grow" style={{ margin: 0 }}>Choose the system <b style={{ color: BEAM_COLOR.B }}>Beam B</b> tracks, or switch it off.</p>
                <Seg value={bOn ? 'on' : 'off'} onChange={(v) => setBOn(v === 'on')} options={[['on', 'Beam B on'], ['off', 'Off']]} />
              </div>
              {bOn && <SystemPicker beam="B" value={B} onChange={setB} lat={lat} lon={lon} />}
              {bOn && (
                <div style={{ marginTop: 10 }}>
                  <SelectField label="Traffic" value={traffic} onChange={setTraffic}
                    options={[['best', 'Faster beam carries the traffic'], ['A', 'Beam A primary, B backup'], ['B', 'Beam B primary, A backup'], ['bonded', 'Both beams bonded (throughputs add)']]} />
                </div>
              )}
            </>
          )}
          {stepName === 'Review' && (
            <>
              <TextField label="Scenario name" value={name} onChange={setName} />
              <div className="specs" style={{ marginTop: 10 }}>
                <div className="spec"><span>Terminal</span><b>{terminals.find((t) => t.id === termId)?.name} · {place || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`} · {beams === 2 ? 'two beams' : 'one beam'}</b></div>
                <div className="spec"><span style={{ color: BEAM_COLOR.A }}>Beam A →</span><b>{sysName(A.system)}{A.satId ? ` · pinned ${A.satId.split(':')[1] ?? ''}` : ' · automatic'}</b></div>
                {beams === 2 && <div className="spec"><span style={{ color: BEAM_COLOR.B }}>Beam B →</span><b>{useB ? `${sysName(B.system)}${B.satId ? ' · pinned' : ' · automatic'}` : 'off'}</b></div>}
                {useB && <div className="spec"><span>Traffic</span><b>{{ best: 'faster beam', A: 'A primary, B backup', B: 'B primary, A backup', bonded: 'bonded A + B' }[traffic]}</b></div>}
              </div>
              <div style={{ marginTop: 10, maxWidth: 200 }}>
                <NumberField label="Simulate" unit="min" value={duration} min={1} max={720} step={5} onChange={setDuration} />
              </div>
              <p className="small dim" style={{ margin: '8px 0 0' }}>Everything stays editable afterwards in the Scenario and Payloads panels.</p>
            </>
          )}
        </div>
        <div className="wiz-foot">
          <button className="btn ghost" onClick={() => (step ? setStep(step - 1) : close())}>{step ? 'Back' : 'Cancel'}</button>
          <span className="grow" />
          {stepName !== 'Review'
            ? <button className="btn primary" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button>
            : <button className="btn primary" onClick={create}>Create scenario</button>}
        </div>
      </div>
    </div>
  );
}
