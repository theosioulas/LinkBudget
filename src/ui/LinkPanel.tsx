import { useState } from 'react';
import { useStore, activeTerminal, setView, type LiveBeam } from '../store/store';
import type { LinkResult, DirectionResult, LineItem } from '../core/rf/linkbudget';
import { Seg, download, fmtNum } from './controls';
import { siteClimate } from '../core/itu/atmosphere';

type Which = 'auto' | 'A' | 'B' | 'sel';

export function linkToCsv(title: string, L: LinkResult): string {
  const rows: string[] = [`"${title}"`, 'Direction,Section,Item,Value,Unit,Note'];
  for (const d of [L.forward, L.ret]) for (const l of d.lines) rows.push([d.direction, l.section, `"${l.label}"`, typeof l.value === 'number' ? l.value.toFixed(3) : `"${l.value}"`, l.unit, `"${l.note ?? ''}"`].join(','));
  rows.push(`geometry,Geometry,Elevation,${L.geometry.look.el.toFixed(3)},deg,`);
  rows.push(`geometry,Geometry,Azimuth,${L.geometry.look.az.toFixed(3)},deg,`);
  rows.push(`geometry,Geometry,Slant range,${L.geometry.look.range.toFixed(3)},km,`);
  rows.push(`geometry,Geometry,Terminal scan angle,${L.geometry.terminalScanDeg.toFixed(3)},deg,`);
  rows.push(`geometry,Geometry,Doppler (forward),${L.dopplerFwdKHz.toFixed(3)},kHz,`);
  rows.push(`geometry,Geometry,Doppler rate,${L.dopplerRateHzS.toFixed(3)},Hz/s,`);
  rows.push(`geometry,Geometry,RTT,${L.rttMs.toFixed(3)},ms,`);
  return rows.join('\n');
}

export function BudgetTable({ d }: { d: DirectionResult }) {
  if (!d.feasible) return <div className="empty">⚠ {d.reason}</div>;
  let last = '';
  return (
    <table className="lb">
      <tbody>
        {d.lines.flatMap((l: LineItem, i) => {
          const out = [];
          if (l.section !== last) { last = l.section; out.push(<tr key={`s${i}`} className="sec"><td colSpan={3}>{l.section}</td></tr>); }
          out.push(
            <tr key={i} className={l.key ? 'key' : ''}>
              <td>{l.label}{l.note && <span className="note">{l.note}</span>}</td>
              <td className="v">{fmtNum(l.value, l.unit === '%' ? 3 : 2)}</td>
              <td className="u">{l.unit}</td>
            </tr>,
          );
          return out;
        })}
      </tbody>
    </table>
  );
}

export function LinkPanel() {
  const live = useStore((s) => s.live);
  const sats = useStore((s) => s.sats);
  const constellations = useStore((s) => s.constellations);
  const terminal = useStore(activeTerminal);
  const analysis = useStore((s) => s.analysis);
  const selectedSatId = useStore((s) => s.selectedSatId);
  const [pick, setPick] = useState<Which>('auto');
  const [dir, setDir] = useState<'forward' | 'return'>('forward');
  const [details, setDetails] = useState(false);
  const which: Exclude<Which, 'auto'> = pick !== 'auto' ? pick : live.B?.active && !live.A?.active ? 'B' : 'A';
  const beam: LiveBeam | null = which === 'A' ? live.A : which === 'B' ? live.B : live.selected ? { satId: selectedSatId ?? '', phase: 'tracking', active: false, link: live.selected } : null;
  const sat = beam ? sats.find((s) => s.id === beam.satId) : undefined;
  const cons = sat ? constellations.find((c) => c.id === sat.constellationId) : undefined;
  const L = beam?.link ?? null;
  const d = L ? (dir === 'forward' ? L.forward : L.ret) : null;
  const climate = siteClimate(terminal.lat, terminal.lon);
  const state = !beam ? '' : which === 'sel' ? 'selected' : beam.phase === 'tracking' ? (beam.active ? 'carrying traffic' : 'locked, overlapping') : live.mode === 'instant' ? 'standby' : 'acquiring';
  const tabs: [Which, string][] = [['auto', 'Active'], ['A', 'Beam A'], ['B', 'Beam B'], ...(selectedSatId ? [['sel', 'Selected'] as [Which, string]] : [])];
  const kpi = (k: string, v: string, unit = '', title?: string) => (
    <div className="kpi" title={title}><div className="k">{k}</div><div className="v">{v}<small>{unit}</small></div></div>
  );

  return (
    <section className="linkcard glass" aria-label="Link budget">
      <div className="lc-head">
        <Seg value={pick} options={tabs} onChange={setPick} />
        {beam && L && sat ? (
          <div>
            <div className="lc-title">
              {which !== 'sel' && <span className={`beam-badge ${which === 'A' ? 'a' : 'b'}`}>{which}</span>}
              <b>{sat.name}</b>
              <span className={`chip ${cons?.orbitClass.toLowerCase()}`}>{cons?.orbitClass}</span>
              <button className="btn sm ghost right-align" onClick={() => setView('satellite', { satId: sat.id })}>Follow</button>
            </div>
            <div className="lc-sub">{cons?.name} · {L.bandKey}-band · {L.beam.beamLabel} · <span style={{ color: beam.active || which === 'sel' ? 'var(--good)' : 'var(--warn)' }}>{state}</span></div>
          </div>
        ) : null}
      </div>
      <div className="lc-body">
        {!beam || !L || !d ? (
          <div className="empty">
            {which === 'sel' ? 'Click any satellite on the globe to analyse its link.' : terminal.beams === 1 && which === 'B' ? 'This terminal has a single beam, so there is no make-before-break.' : 'No satellite on this beam right now.'}
          </div>
        ) : (
          <>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <Seg value={dir} options={[['forward', 'Downlink'], ['return', 'Uplink']]} onChange={setDir} />
            </div>
            {d.feasible ? (
              <div className="big">
                <span className="num">{fmtNum(d.throughputClearMbps, 0)}<small>Mbps</small></span>
                <span className="mc">{d.modcodClear?.name ?? 'outage'}<br />Es/(N0+I) {fmtNum(d.esn0TotalClear, 1)} dB</span>
              </div>
            ) : <div className="empty" style={{ padding: '10px 0' }}>{d.reason}</div>}
            <div className="kpis">
              {kpi('Elevation', fmtNum(L.geometry.look.el, 1), '°')}
              {kpi('Range', fmtNum(L.geometry.look.range, 0), 'km')}
              {kpi('Round trip', fmtNum(L.rttMs, 0), 'ms', 'User → satellite → gateway → satellite → user')}
              {kpi('Availability', d.feasible ? fmtNum(d.availabilityPct, 3) : '—', '%', 'Annual availability at the lowest MODCOD (ITU-R P.618)')}
              {kpi('Doppler', fmtNum(dir === 'forward' ? L.dopplerFwdKHz : L.dopplerRtnKHz, 1), 'kHz')}
              {kpi('Antenna scan', fmtNum(L.geometry.terminalScanDeg, 1), '°', 'Angle off the terminal panel normal')}
            </div>
            <div className="row" style={{ gap: 10 }}>
              <span className="small muted" style={{ whiteSpace: 'nowrap' }}>Rain now</span>
              <input type="range" min={0} max={100} step={1} value={analysis.liveRainMmH ?? 0} aria-label="Rain rate at the terminal"
                onChange={(e) => useStore.getState().set({ analysis: { ...analysis, liveRainMmH: +e.target.value } })} />
              <span className="mono small" style={{ width: 64, textAlign: 'right' }}>{analysis.liveRainMmH ? `${analysis.liveRainMmH} mm/h` : 'clear'}</span>
            </div>
            <button className="btn sm ghost" style={{ width: '100%', marginTop: 10 }} onClick={() => setDetails(!details)} aria-expanded={details}>
              {details ? 'Hide full budget' : 'Show full budget'}
            </button>
            {details && (
              <>
                <BudgetTable d={d} />
                <div className="small dim" style={{ marginTop: 10 }}>
                  ITU climate: rain R0.01 {fmtNum(analysis.R001Override ?? climate.R001, 1)} mm/h · rain height {fmtNum(climate.hRain, 2)} km · vapour {fmtNum(climate.V, 1)} kg/m²
                </div>
                <div className="row wrap" style={{ marginTop: 10, gap: 6 }}>
                  <button className="btn sm" onClick={() => download(`budget-${sat?.name}.csv`, linkToCsv(`${sat?.name} → ${terminal.name} @ ${new Date(live.t).toISOString()}`, L), 'text/csv')}>CSV</button>
                  <button className="btn sm" onClick={() => download(`budget-${sat?.name}.json`, JSON.stringify({ satellite: sat?.name, time: new Date(live.t).toISOString(), terminal: terminal.name, link: L }, null, 2), 'application/json')}>JSON</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
