import { useState } from 'react';
import { useStore, activeTerminal, type LiveBeam } from '../store/store';
import type { LinkResult, DirectionResult, LineItem } from '../core/rf/linkbudget';
import { Seg, download, fmtNum } from './controls';
import { siteClimate } from '../core/itu/atmosphere';
import { globe } from '../globe/GlobeView';

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

function Kpis({ L, dir, tone }: { L: LinkResult; dir: 'forward' | 'return'; tone: string }) {
  const d = dir === 'forward' ? L.forward : L.ret;
  const k = (label: string, v: string, unit = '', title?: string) => (
    <div className={`kpi ${tone}`} title={title}><div className="k">{label}</div><div className="v">{d.feasible || ['Elevation', 'Range', 'RTT', 'Term. scan', 'Doppler'].includes(label) ? v : '—'}<small>{unit}</small></div></div>
  );
  return (
    <div className="kpis">
      {k('Es/(N0+I) clr', fmtNum(d.esn0TotalClear, 1), 'dB', 'End-to-end clear-sky Es/(N0+I0)')}
      {k('MODCOD', d.modcodClear?.name ?? (d.feasible ? 'OUTAGE' : '—'), '', 'Clear-sky ACM MODCOD')}
      {k('Throughput', fmtNum(d.throughputClearMbps, 0), 'Mbps', 'Per carrier, clear sky')}
      {k('Elevation', fmtNum(L.geometry.look.el, 1), '°')}
      {k('Range', fmtNum(L.geometry.look.range, 0), 'km')}
      {k('RTT', fmtNum(L.rttMs, 0), 'ms', 'User→sat→gateway→sat→user propagation')}
      {k('Availability', fmtNum(d.availabilityPct, 3), '%', 'Annual availability at lowest MODCOD (ITU-R P.618)')}
      {k('Doppler', fmtNum(dir === 'forward' ? L.dopplerFwdKHz : L.dopplerRtnKHz, 1), 'kHz')}
      {k('Term. scan', fmtNum(L.geometry.terminalScanDeg, 1), '°', 'Angle off the panel normal')}
    </div>
  );
}

export function LinkPanel() {
  const live = useStore((s) => s.live);
  const sats = useStore((s) => s.sats);
  const constellations = useStore((s) => s.constellations);
  const terminal = useStore(activeTerminal);
  const analysis = useStore((s) => s.analysis);
  const [pick, setWhich] = useState<Which>('auto');
  const which: Exclude<Which, 'auto'> = pick !== 'auto' ? pick : live.B?.active && !live.A?.active ? 'B' : 'A';
  const [dir, setDir] = useState<'forward' | 'return'>('forward');
  const beam: LiveBeam | null = which === 'A' ? live.A : which === 'B' ? live.B : live.selected ? { satId: useStore.getState().selectedSatId ?? '', phase: 'tracking', active: false, link: live.selected } : null;
  const sat = beam ? sats.find((s) => s.id === beam.satId) : undefined;
  const cons = sat ? constellations.find((c) => c.id === sat.constellationId) : undefined;
  const L = beam?.link ?? null;
  const climate = siteClimate(terminal.lat, terminal.lon);
  const tone = which === 'A' ? 'a' : which === 'B' ? 'b' : '';

  return (
    <div className="panel right">
      <div className="tabs">
        <button className={`tab ${pick === 'auto' ? 'on' : ''}`} onClick={() => setWhich('auto')} title="Follow the beam that carries traffic">Active</button>
        <button className={`tab ${pick === 'A' ? 'on' : ''}`} onClick={() => setWhich('A')}><span className="chip a">A</span> {live.A?.active ? '●' : ''}</button>
        <button className={`tab ${pick === 'B' ? 'on' : ''}`} onClick={() => setWhich('B')}><span className="chip b">B</span> {live.B?.active ? '●' : ''}</button>
        <button className={`tab ${pick === 'sel' ? 'on' : ''}`} onClick={() => setWhich('sel')}>Selected sat</button>
      </div>
      <div className="scroll">
        {!beam || !L ? (
          <div className="empty">
            {which === 'sel' ? 'Click any satellite on the globe to analyse its link to the terminal.' : terminal.beams === 1 && which === 'B' ? 'This terminal has a single beam (no make-before-break).' : 'No satellite assigned to this beam right now.'}
          </div>
        ) : (
          <>
            <div className="row wrap" style={{ marginBottom: 6 }}>
              <span className="dot" style={{ color: cons?.color, background: cons?.color }} />
              {which !== 'sel' && <span className={`chip ${which === 'A' ? 'a' : 'b'}`}>{which}</span>}
              <b style={{ fontSize: 14 }}>{sat?.name}</b>
              <span className={`chip ${cons?.orbitClass.toLowerCase()}`}>{cons?.orbitClass}</span>
              {which !== 'sel' && <span className={`chip ${beam.phase === 'tracking' ? 'good' : 'warn'}`}>{beam.phase === 'tracking' ? (beam.active ? 'carrying traffic' : 'locked · overlap') : live.mode === 'instant' ? 'standby (pre-pointed)' : 'acquiring'}</span>}
              <button className="btn sm right-align" onClick={() => sat && globe?.flyToSat(sat.id)}>Fly to</button>
            </div>
            <div className="row" style={{ marginBottom: 8 }}>
              <span className="muted small">{cons?.name} · {L.bandKey}-band · {L.beam.beamLabel}</span>
              <span className="right-align"><Seg value={dir} options={[['forward', 'Forward ↓'], ['return', 'Return ↑']]} onChange={setDir} /></span>
            </div>
            <Kpis L={L} dir={dir} tone={tone} />
            <BudgetTable d={dir === 'forward' ? L.forward : L.ret} />
            <h4 className="sect" style={{ marginTop: 14 }}>Site climate (ITU-R maps)</h4>
            <div className="small muted">
              R0.01 {fmtNum(analysis.R001Override ?? climate.R001, 1)} mm/h · rain height {fmtNum(climate.hRain, 2)} km · ρ {fmtNum(climate.rho, 1)} g/m³ · V {fmtNum(climate.V, 1)} kg/m² · Nwet {fmtNum(climate.Nwet, 0)} · alt {fmtNum(climate.hs * 1000, 0)} m
              {climate.source === 'fallback' && <span className="chip warn" style={{ marginLeft: 6 }}>latitude fallback</span>}
            </div>
            <div className="row wrap" style={{ marginTop: 10 }}>
              <button className="btn sm" onClick={() => download(`budget-${sat?.name}.csv`, linkToCsv(`${sat?.name} → ${terminal.name} @ ${new Date(live.t).toISOString()}`, L), 'text/csv')}>Export CSV</button>
              <button className="btn sm" onClick={() => download(`budget-${sat?.name}.json`, JSON.stringify({ satellite: sat?.name, time: new Date(live.t).toISOString(), terminal: terminal.name, link: L }, null, 2), 'application/json')}>Export JSON</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
