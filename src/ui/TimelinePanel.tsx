import { useMemo } from 'react';
import { useStore, activeTerminal } from '../store/store';
import { NumberField, SelectField, Toggle, download, fmtNum } from './controls';
import { TimeChart, type Series } from './Charts';
import { globe } from '../globe/GlobeView';
import type { SimResult } from '../core/sim/handover';
import { DEMOS, applyDemo } from '../app/demos';

const A = '#22d3ee', B = '#f472b6';

function simCsv(sim: SimResult): string {
  const head = 'time_utc,active_beam,active_thr_fwd_mbps,active_thr_rtn_mbps,aggregate_thr_fwd_mbps,rtt_ms,visible,' +
    ['A', 'B'].map((b) => `${b}_sat,${b}_orbit,${b}_phase,${b}_el_deg,${b}_az_deg,${b}_scan_deg,${b}_range_km,${b}_esn0_fwd_db,${b}_esn0_rtn_db,${b}_thr_fwd,${b}_thr_rtn,${b}_modcod,${b}_doppler_khz`).join(',');
  const n = (v: number) => (Number.isFinite(v) ? v.toFixed(3) : '');
  const rows = sim.steps.map((s) => [
    new Date(s.t).toISOString(), s.active ?? '', n(s.activeThrFwd), n(s.activeThrRtn), n(s.aggregateThrFwd), n(s.latencyMs), s.visible,
    ...[s.A, s.B].flatMap((b) => [b.satName, b.orbitClass, b.phase, n(b.el), n(b.az), n(b.scan), n(b.rangeKm), n(b.esn0Fwd), n(b.esn0Rtn), n(b.thrFwd), n(b.thrRtn), b.modcodFwd, n(b.dopplerKHz)]),
  ].join(','));
  return [head, ...rows].join('\n');
}

export function TimelinePanel() {
  const sim = useStore((s) => s.sim);
  const running = useStore((s) => s.simRunning);
  const progress = useStore((s) => s.simProgress);
  const err = useStore((s) => s.simError);
  const mbb = useStore((s) => s.mbb);
  const set = useStore((s) => s.set);
  const run = useStore((s) => s.runSim);
  const constellations = useStore((s) => s.constellations);
  const terminal = useStore(activeTerminal);
  const t = useStore((s) => s.clock.t);
  const up = (p: Partial<typeof mbb>) => set({ mbb: { ...mbb, ...p } });
  const jump = (ms: number) => { globe?.setTime(ms); set({ clock: { ...useStore.getState().clock, t: ms } }); };

  const charts = useMemo(() => {
    if (!sim) return null;
    const x = sim.steps.map((s) => s.t);
    const v = (f: (s: SimResult['steps'][number]) => number) => sim.steps.map((s) => { const r = f(s); return Number.isFinite(r) ? r : null; });
    const el: Series[] = [
      { label: 'Beam A', color: A, values: v((s) => (s.A.phase === 'idle' ? NaN : s.A.el)), width: 2 },
      { label: 'Beam B', color: B, values: v((s) => (s.B.phase === 'idle' ? NaN : s.B.el)), width: 2 },
    ];
    const es: Series[] = [
      { label: 'A fwd', color: A, values: v((s) => s.A.esn0Fwd) },
      { label: 'B fwd', color: B, values: v((s) => s.B.esn0Fwd) },
      { label: 'A rtn', color: A, values: v((s) => s.A.esn0Rtn), dash: [4, 3], width: 1 },
      { label: 'B rtn', color: B, values: v((s) => s.B.esn0Rtn), dash: [4, 3], width: 1 },
    ];
    const thr: Series[] = [
      { label: 'Active (fwd)', color: '#34d399', values: v((s) => s.activeThrFwd), width: 2, fill: 'rgba(52,211,153,0.10)', step: true },
      { label: 'Aggregate A+B', color: '#fbbf24', values: v((s) => s.aggregateThrFwd), width: 1, dash: [3, 3], step: true },
      { label: 'Active (rtn)', color: '#a78bfa', values: v((s) => s.activeThrRtn), width: 1.4, step: true },
    ];
    const lat: Series[] = [
      { label: 'RTT', color: '#fbbf24', values: v((s) => s.latencyMs), width: 1.8, step: true },
      { label: 'Visible sats', color: '#94a3b8', values: v((s) => s.visible), width: 1, step: true },
    ];
    return { x, el, es, thr, lat };
  }, [sim]);

  const allowed = mbb.allowedConstellations;
  const toggleAllowed = (id: string, on: boolean) => {
    const base = allowed.length ? allowed : constellations.filter((c) => c.enabled).map((c) => c.id);
    const next = on ? [...new Set([...base, id])] : base.filter((x) => x !== id);
    up({ allowedConstellations: next });
  };
  const S = sim?.summary;

  return (
    <div className="panel bottom">
      <div className="panel-head">
        <h3>Make-before-break timeline</h3>
        <span className="dim small" style={{ whiteSpace: 'nowrap' }}>{terminal.name} · {terminal.beams === 2 ? 'dual-beam (MBB)' : 'single beam (break-before-make)'}</span>
        {S && (
          <span className="chips" style={{ marginLeft: 8 }}>
            <span className={`chip ${S.availabilityPct >= 99.99 ? 'good' : S.availabilityPct > 99 ? 'warn' : 'bad'}`}>avail {fmtNum(S.availabilityPct, 2)}%</span>
            <span className="chip">{S.mbbHandovers} MBB · {S.breakHandovers} break</span>
            <span className="chip">outage {fmtNum(S.outageS, 0)} s</span>
            <span className="chip">mean {fmtNum(S.meanThrFwd, 0)} / {fmtNum(S.meanThrRtn, 0)} Mbps</span>
            <span className="chip">RTT {fmtNum(S.meanLatencyMs, 0)} ms</span>
            {Object.entries(S.orbitShare).map(([k, v]) => <span key={k} className={`chip ${k.toLowerCase()}`}>{k} {fmtNum(v, 0)}%</span>)}
          </span>
        )}
        <div className="grow" />
        {sim && <button className="btn sm" onClick={() => download('mbb-timeline.csv', simCsv(sim), 'text/csv')}>Export CSV</button>}
        <button className="btn sm" onClick={() => set({ bottomOpen: false })} title="Hide">✕</button>
      </div>
      <div className="bottom-body">
        <div className="bottom-side">
          <div className="field" style={{ marginBottom: 6 }}>
            <label>Demo scenarios</label>
            <div className="input-wrap" style={{ borderColor: 'rgba(34,211,238,0.45)' }}>
              <select value="" onChange={(e) => applyDemo(e.target.value)}>
                <option value="">▶ Load a demo…</option>
                {DEMOS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="fgrid">
            <SelectField label="Satellite selection" value={mbb.policy} onChange={(v) => up({ policy: v })}
              options={[['longest-visibility', 'Longest visibility'], ['max-elevation', 'Max elevation'], ['best-sinr', 'Best Es/N0']]} />
            <SelectField label="Multi-orbit policy" value={mbb.orbitPolicy} onChange={(v) => up({ orbitPolicy: v })}
              options={[['leo-first', 'LEO first → MEO → GEO'], ['geo-leo-dual', 'GEO/MEO + LEO dual'], ['best-throughput', 'Best throughput'], ['single', 'No orbit priority']]} />
            <NumberField label="Duration" unit="min" value={mbb.durationMin} min={1} max={720} step={5} onChange={(v) => up({ durationMin: v })} />
            <NumberField label="Time step" unit="s" value={mbb.stepSec} min={0.5} max={120} step={0.5} onChange={(v) => up({ stepSec: v })} />
            <NumberField label="Min elevation" unit="°" value={mbb.minElevationDeg} min={0} max={80} step={1} onChange={(v) => up({ minElevationDeg: v })} />
            <NumberField label="Handover elev." unit="°" value={mbb.handoverElevationDeg} min={0} max={85} step={1} onChange={(v) => up({ handoverElevationDeg: v })} />
            <NumberField label="Acquisition" unit="s" value={mbb.acquisitionSec} min={0} max={60} step={0.5} onChange={(v) => up({ acquisitionSec: v })} />
            <NumberField label="MBB overlap" unit="s" value={mbb.overlapSec} min={0} max={60} step={0.5} onChange={(v) => up({ overlapSec: v })} />
            <NumberField label="Hysteresis" unit="dB" value={mbb.hysteresisDb} min={0} max={10} step={0.5} onChange={(v) => up({ hysteresisDb: v })} />
          </div>
          <h4 className="sect" style={{ marginTop: 10 }}>Constellations</h4>
          <div className="col">
            {constellations.filter((c) => c.enabled).map((c) => (
              <Toggle key={c.id} checked={!allowed.length || allowed.includes(c.id)} onChange={(on) => toggleAllowed(c.id, on)}
                label={<span className="row" style={{ gap: 5 }}><span className="dot" style={{ color: c.color, background: c.color, width: 8, height: 8 }} />{c.name}</span>} />
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="btn primary" style={{ width: '100%' }} disabled={running} onClick={() => run()}>{running ? `Simulating… ${(progress * 100).toFixed(0)}%` : '▶ Run from current time'}</button>
            {running && <div className="progress" style={{ marginTop: 6 }}><div style={{ width: `${progress * 100}%` }} /></div>}
            {err && <div className="small" style={{ color: 'var(--bad)', marginTop: 6 }}>{err}</div>}
            {sim && <button className="btn sm" style={{ width: '100%', marginTop: 6 }} onClick={() => jump(sim.startMs)}>⏮ Jump to start of run</button>}
          </div>
        </div>
        <div className="charts">
          {!charts ? (
            <div className="empty">
              Run a timeline to simulate the dual-beam terminal tracking satellites across orbits: beam B acquires the next satellite while beam A carries traffic, traffic switches on lock, and A is released after the overlap — make-before-break.
            </div>
          ) : (
            <div className="chart-grid">
              <TimeChart title="Elevation" unit="deg" x={charts.x} series={charts.el} nowMs={t} onPick={jump} syncKey="mbb" yRange={[0, 90]} height={98} />
              <TimeChart title="Es/(N0+I0) end-to-end, clear" unit="dB" x={charts.x} series={charts.es} nowMs={t} onPick={jump} syncKey="mbb" height={98} />
              <TimeChart title="Throughput / carrier" unit="Mbps" x={charts.x} series={charts.thr} nowMs={t} onPick={jump} syncKey="mbb" height={98} />
              <TimeChart title="RTT & visible sats" unit="ms / #" x={charts.x} series={charts.lat} nowMs={t} onPick={jump} syncKey="mbb" height={98} />
            </div>
          )}
        </div>
        <div className="events">
          {sim ? sim.events.filter((e) => e.type !== 'outage-end' || true).map((e, i) => (
            <div key={i} className="ev" onClick={() => jump(e.t)} title={e.detail}>
              <span className="t">{new Date(e.t).toISOString().slice(11, 19)}</span>
              <span className={`chip ${e.beam === 'A' ? 'a' : 'b'}`}>{e.beam}</span>
              <span style={{ color: e.type === 'switch' ? 'var(--good)' : e.type === 'lost' || e.type === 'outage-start' || e.type === 'break' ? 'var(--bad)' : e.type === 'lock' ? 'var(--accent)' : undefined }}>{e.type}</span>
              <span className="dim" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.satName}</span>
            </div>
          )) : <div className="empty small">Handover events appear here.</div>}
        </div>
      </div>
    </div>
  );
}
