import { Fragment, useState } from 'react';
import { useStore } from '../store/store';
import { LIBRARY } from '../data/library';
import { NumberField, Sect, fmtNum } from './controls';
import { focusConstellation } from './ScenarioTab';
import { PatternPlot } from './PatternPlot';
import { nadirFromElevationDeg } from '../core/geo/coords';
import type { Payload } from '../core/model';

const DEG = Math.PI / 180;

/** Footprint dimensions [km] for a beam of width hpbw from altitude h seen at elevation el (flat-earth local approx + spherical geometry). */
export function footprint(hKm: number, hpbwDeg: number, elDeg: number, broaden: boolean) {
  const Re = 6371;
  const eta = nadirFromElevationDeg(hKm, elDeg);
  const range = Math.sqrt((Re + hKm) ** 2 - (Re * Math.cos(elDeg * DEG)) ** 2) - Re * Math.sin(elDeg * DEG);
  const bw = broaden ? hpbwDeg / Math.max(Math.cos(eta * DEG), 0.05) : hpbwDeg;
  const minor = 2 * range * Math.tan((bw / 2) * DEG);
  const major = minor / Math.sin(Math.max(elDeg, 3) * DEG);
  return { eta, range, minor, major, bw };
}

function payloadAltitude(p: Payload, consts: ReturnType<typeof useStore.getState>['constellations']): number | null {
  const c = consts.find((x) => x.payloadId === p.id);
  if (!c) return null;
  if (c.source.kind === 'walker') return c.source.shells[0].altitudeKm;
  if (c.source.kind === 'geo') return 35786;
  return null;
}

function SizeChart() {
  const payloads = useStore((s) => s.payloads);
  const consts = useStore((s) => s.constellations);
  const rows = payloads.map((p) => {
    const h = payloadAltitude(p, consts);
    if (!h) return null;
    const L = p.layout;
    let nadir: number, edge: number, label = p.name;
    if (L.kind === 'fixed-strips') {
      nadir = 2 * h * Math.tan((L.alongTrackDeg / 2) * DEG);
      edge = 2 * h * Math.tan((L.crossTrackDeg / 2) * DEG);
      label += ' (along × cross)';
    } else if (L.kind === 'spot' || L.kind === 'hex-grid') {
      const f = footprint(h, p.pattern.hpbwDeg, 40, false);
      nadir = 2 * (h) * Math.tan((p.pattern.hpbwDeg / 2) * DEG) * (h > 30000 ? 1 : 1);
      edge = f.major;
    } else {
      const f0 = footprint(h, p.pattern.hpbwDeg, 89.9, true);
      const f1 = footprint(h, p.pattern.hpbwDeg, Math.max(p.minElevationDeg, 5), p.pattern.kind === 'phased-array');
      nadir = f0.minor;
      edge = f1.major;
    }
    return { label, nadir, edge, band: p.band };
  }).filter(Boolean) as { label: string; nadir: number; edge: number; band: string }[];
  const W = 340, rowH = 30, m = { l: 8, r: 8, t: 18, b: 22 };
  const H = m.t + m.b + rows.length * rowH;
  const lx = (km: number) => m.l + ((Math.log10(Math.max(km, 5)) - Math.log10(5)) / (Math.log10(5000) - Math.log10(5))) * (W - m.l - m.r);
  return (
    <svg width={W} height={H}>
      {[10, 30, 100, 300, 1000, 3000].map((v) => (
        <g key={v}><line x1={lx(v)} x2={lx(v)} y1={m.t - 6} y2={H - m.b} stroke="rgba(148,178,230,0.12)" /><text x={lx(v)} y={H - 8} fontSize="9.5" fill="#7d8da6" textAnchor="middle">{v} km</text></g>
      ))}
      <text x={m.l} y={10} fontSize="10" fill="#22d3ee">● nadir / best case</text>
      <text x={m.l + 120} y={10} fontSize="10" fill="#f472b6">● edge of coverage (major axis)</text>
      {rows.map((r, i) => {
        const y = m.t + i * rowH;
        return (
          <g key={r.label}>
            <text x={m.l} y={y + 9} fontSize="10.5" fill="#c9d4e5">{r.label}</text>
            <line x1={lx(r.nadir)} x2={lx(r.edge)} y1={y + 18} y2={y + 18} stroke="rgba(148,178,230,0.35)" strokeWidth={2} />
            <circle cx={lx(r.nadir)} cy={y + 18} r={4} fill="#22d3ee" />
            <circle cx={lx(r.edge)} cy={y + 18} r={4} fill="#f472b6" />
            <text x={Math.min(lx(r.edge) + 7, W - 40)} y={y + 21} fontSize="9.5" fill="#7d8da6">{fmtNum(r.nadir, 0)}–{fmtNum(r.edge, 0)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function BeamLabTab() {
  const constellations = useStore((s) => s.constellations);
  const payloads = useStore((s) => s.payloads);
  const update = useStore((s) => s.updateConstellation);
  const [calc, setCalc] = useState({ h: 550, hpbw: 2.5, el: 25, esa: true });
  const f = footprint(calc.h, calc.hpbw, calc.el, calc.esa);
  const [pid, setPid] = useState(payloads[0]?.id);
  const p = payloads.find((x) => x.id === pid) ?? payloads[0];

  const visualize = (cid: string) => {
    const c = constellations.find((x) => x.id === cid);
    if (!c) return;
    if (!c.enabled) update(cid, { enabled: true });
    setTimeout(() => focusConstellation(cid), 50);
  };

  return (
    <div>
      <div className="small muted" style={{ marginBottom: 8 }}>
        How the user beams of each system are built, with representative performance. <b>Visualize</b> enables the constellation, selects the best satellite seen from your terminal and draws its full beam layout on the globe.
      </div>
      {LIBRARY.map((s) => (
        <div key={s.id} className="card lib-card">
          <div className="row">
            <h5 style={{ flex: 1 }}>{s.name}</h5>
            <span className={`chip ${s.orbit.toLowerCase()}`}>{s.orbit}</span>
            <button className="btn sm primary" onClick={() => visualize(s.constellationId)}>Visualize</button>
          </div>
          <div className="small dim">{s.operator}</div>
          <dl>{s.facts.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
          <p><b>Beams.</b> {s.beams}</p>
          <p><b>Handover.</b> {s.handover}</p>
          {s.sources.length > 0 && <div className="small">{s.sources.map((x) => <div key={x.url}><a href={x.url} target="_blank" rel="noreferrer">↗ {x.label}</a></div>)}</div>}
        </div>
      ))}

      <Sect>Footprint size comparison</Sect>
      <SizeChart />
      <div className="small dim">Log scale. Steered ESA beams broaden as 1/cos(scan) and stretch by 1/sin(elevation) toward the edge of coverage.</div>

      <Sect>Beam pattern explorer</Sect>
      <div className="field" style={{ marginBottom: 6 }}>
        <label>Payload</label>
        <div className="input-wrap"><select value={p?.id} onChange={(e) => setPid(e.target.value)}>{payloads.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
      </div>
      {p && <PatternPlot pattern={p.pattern} scans={p.pattern.kind === 'phased-array' ? [0, 25, 45, 60] : [0]} />}

      <Sect>Beam geometry calculator</Sect>
      <div className="fgrid">
        <NumberField label="Altitude" unit="km" value={calc.h} step={10} min={200} onChange={(v) => setCalc({ ...calc, h: v })} />
        <NumberField label="Beamwidth (3 dB)" unit="°" value={calc.hpbw} step={0.1} min={0.05} onChange={(v) => setCalc({ ...calc, hpbw: v })} />
        <NumberField label="User elevation" unit="°" value={calc.el} step={1} min={1} max={90} onChange={(v) => setCalc({ ...calc, el: v })} />
        <div className="field"><label>Steering</label><div className="input-wrap"><select value={calc.esa ? '1' : '0'} onChange={(e) => setCalc({ ...calc, esa: e.target.value === '1' })}><option value="1">Phased array (broadens)</option><option value="0">Reflector / fixed</option></select></div></div>
      </div>
      <table className="lb" style={{ marginTop: 6 }}>
        <tbody>
          <tr><td>Nadir (scan) angle at satellite</td><td className="v">{fmtNum(f.eta, 2)}</td><td className="u">°</td></tr>
          <tr><td>Slant range</td><td className="v">{fmtNum(f.range, 0)}</td><td className="u">km</td></tr>
          <tr><td>Effective beamwidth</td><td className="v">{fmtNum(f.bw, 2)}</td><td className="u">°</td></tr>
          <tr><td>Footprint minor axis</td><td className="v">{fmtNum(f.minor, 1)}</td><td className="u">km</td></tr>
          <tr className="key"><td>Footprint major axis</td><td className="v">{fmtNum(f.major, 1)}</td><td className="u">km</td></tr>
          <tr><td>Scan loss (cos^1.2)</td><td className="v">{fmtNum(calc.esa ? 12 * Math.log10(Math.cos(f.eta * DEG)) : 0, 2)}</td><td className="u">dB</td></tr>
          <tr><td>Free-space loss delta vs nadir</td><td className="v">{fmtNum(20 * Math.log10(f.range / calc.h), 2)}</td><td className="u">dB</td></tr>
        </tbody>
      </table>
    </div>
  );
}
