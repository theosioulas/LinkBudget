import { useMemo } from 'react';
import { useStore } from '../store/store';
import { download, fmtNum } from './controls';
import { TimeChart, type Series } from './Charts';
import { globe } from '../globe/GlobeView';
import type { SimResult } from '../core/sim/handover';
import { Icon } from './icons';

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
  const stale = useStore((s) => s.simStale);
  const open = useStore((s) => s.bottomOpen);
  const set = useStore((s) => s.set);
  const run = useStore((s) => s.runSim);
  const t = useStore((s) => s.clock.t);
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
      { label: 'A', color: A, values: v((s) => s.A.esn0Fwd) },
      { label: 'B', color: B, values: v((s) => s.B.esn0Fwd) },
    ];
    const thr: Series[] = [
      { label: 'Downlink', color: '#34d399', values: v((s) => s.activeThrFwd), width: 2, fill: 'rgba(52,211,153,0.10)', step: true },
      { label: 'Uplink', color: '#a78bfa', values: v((s) => s.activeThrRtn), width: 1.4, step: true },
    ];
    const lat: Series[] = [{ label: 'Round trip', color: '#fbbf24', values: v((s) => s.latencyMs), width: 1.8, step: true }];
    return { x, el, es, thr, lat };
  }, [sim]);

  const S = sim?.summary;
  const share = S ? (['LEO', 'MEO', 'GEO'] as const).map((k) => [k, S.orbitShare[k] ?? 0] as const) : [];
  const shareColor = { LEO: '#a5f3fc', MEO: '#6ee7b7', GEO: '#fde68a' };
  const avTone = S ? (S.availabilityPct >= 99.99 ? 'good' : S.availabilityPct > 99 ? 'warn' : 'bad') : '';

  return (
    <section className="timeline glass" aria-label="Handover timeline">
      <div className="tl-strip">
        <h3>Handover timeline</h3>
        {running ? (
          <div className="row grow" style={{ gap: 10 }}>
            <span className="small muted">Simulating {(progress * 100).toFixed(0)}%</span>
            <div className="progress" style={{ width: 160 }}><div style={{ width: `${progress * 100}%` }} /></div>
          </div>
        ) : S ? (
          <div className="tl-stats grow">
            <div className="stat"><span className="k">Availability</span><span className={`v ${avTone}`}>{fmtNum(S.availabilityPct, 2)}%</span></div>
            <div className="stat"><span className="k">Handovers</span><span className="v">{S.mbbHandovers} seamless{S.breakHandovers ? ` · ${S.breakHandovers} with gap` : ''}</span></div>
            <div className="stat"><span className="k">Outage</span><span className="v">{fmtNum(S.outageS, 0)} s</span></div>
            <div className="stat"><span className="k">Mean down / up</span><span className="v">{fmtNum(S.meanThrFwd, 0)} / {fmtNum(S.meanThrRtn, 0)} Mbps</span></div>
            <div className="stat hide-sm"><span className="k">Round trip</span><span className="v">{fmtNum(S.meanLatencyMs, 0)} ms</span></div>
            <div className="stat hide-sm" title={share.map(([k, v]) => `${k} ${v.toFixed(0)}%`).join(' · ')}>
              <span className="k">Time per orbit</span>
              <span className="share">{share.map(([k, v]) => <span key={k} style={{ width: `${v}%`, background: shareColor[k] }} />)}</span>
            </div>
          </div>
        ) : <span className="small dim grow">{err ?? 'Run a scenario to simulate handovers.'}</span>}
        {stale && !running && sim && <button className="btn sm" style={{ borderColor: 'var(--warn)', color: 'var(--warn)' }} onClick={() => run(sim.startMs)}>Out of date · re-run</button>}
        <button className="btn sm" disabled={running} onClick={() => run()} title="Simulate from the current time"><Icon.run /> Run</button>
        {sim && <button className="btn sm ghost hide-sm" onClick={() => download('handover-timeline.csv', simCsv(sim), 'text/csv')}>CSV</button>}
        <button className="ibtn sm" onClick={() => set({ bottomOpen: !open })} aria-expanded={open} title={open ? 'Collapse' : 'Show charts and events'}>{open ? <Icon.chevronDown /> : <Icon.chevronUp />}</button>
      </div>
      {open && (
        <div className="tl-body">
          <div className="charts">
            {!charts ? <div className="empty">No simulation yet.</div> : (
              <div className="chart-grid">
                <TimeChart title="Elevation" unit="°" x={charts.x} series={charts.el} nowMs={t} onPick={jump} syncKey="mbb" yRange={[0, 90]} height={86} />
                <TimeChart title="Signal Es/(N0+I)" unit="dB" x={charts.x} series={charts.es} nowMs={t} onPick={jump} syncKey="mbb" height={86} />
                <TimeChart title="Throughput" unit="Mbps" x={charts.x} series={charts.thr} nowMs={t} onPick={jump} syncKey="mbb" height={86} />
                <TimeChart title="Round-trip time" unit="ms" x={charts.x} series={charts.lat} nowMs={t} onPick={jump} syncKey="mbb" height={86} />
              </div>
            )}
          </div>
          <div className="events">
            {sim ? sim.events.filter((e) => e.type === 'switch' || e.type === 'acquire' || e.type === 'break' || e.type === 'lost' || e.type === 'outage-start').map((e, i) => (
              <div key={i} className="ev" onClick={() => jump(e.t)} title={e.detail}>
                <span className="t">{new Date(e.t).toISOString().slice(11, 19)}</span>
                <span className={`beam-badge ${e.beam === 'A' ? 'a' : 'b'}`}>{e.beam}</span>
                <span className="type" style={{ color: e.type === 'switch' ? 'var(--good)' : e.type === 'acquire' ? 'var(--text-2)' : 'var(--bad)' }}>
                  {e.type === 'switch' ? 'switch' : e.type === 'acquire' ? 'acquire' : e.type === 'break' ? 'break' : e.type === 'lost' ? 'lost' : 'outage'}
                </span>
                <span className="dim" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.satName}</span>
              </div>
            )) : <div className="empty small">Handover events appear here.</div>}
          </div>
        </div>
      )}
    </section>
  );
}
