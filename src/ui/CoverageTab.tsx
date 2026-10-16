import { useState } from 'react';
import { useStore, activeTerminal } from '../store/store';
import { computeCoverage, METRICS, rampColor, type CoverageMetric, type CoverageResult } from '../core/sim/coverage';
import { NumberField, SelectField, Sect, download, fmtNum } from './controls';
import { globe } from '../globe/GlobeView';
import { rankCandidates } from '../core/sim/handover';
import { makeEvalContext } from '../core/sim/runtime';

function coverageKml(r: CoverageResult, lo: number, hi: number): string {
  const h = r.stepDeg / 2;
  const pms = r.cells.map((c) => {
    const [R, G, B] = rampColor(hi > lo ? (c.value - lo) / (hi - lo) : 0.5);
    const col = `b0${B.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${R.toString(16).padStart(2, '0')}`;
    const ring = [[c.lon - h, c.lat - h], [c.lon + h, c.lat - h], [c.lon + h, c.lat + h], [c.lon - h, c.lat + h], [c.lon - h, c.lat - h]].map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)},0`).join(' ');
    return `<Placemark><name>${c.value.toFixed(2)}</name><Style><LineStyle><width>0</width></LineStyle><PolyStyle><color>${col}</color><outline>0</outline></PolyStyle></Style><ExtendedData><Data name="value"><value>${c.value.toFixed(3)}</value></Data></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>${ring}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${METRICS[r.metric].label} – ${r.satName}</name>\n${pms}\n</Document></kml>`;
}

export function CoverageTab() {
  const constellations = useStore((s) => s.constellations);
  const selectedSatId = useStore((s) => s.selectedSatId);
  const sats = useStore((s) => s.sats);
  const notify = useStore((s) => s.notify);
  const enabled = constellations.filter((c) => c.enabled);
  const [cid, setCid] = useState(enabled.find((c) => c.orbitClass === 'GEO')?.id ?? enabled[0]?.id ?? '');
  const [useSelected, setUseSelected] = useState(false);
  const [metric, setMetric] = useState<CoverageMetric>('thrFwd');
  const [step, setStep] = useState(0.5);
  const [res, setRes] = useState<CoverageResult | null>(null);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);

  const run = () => {
    const s = useStore.getState();
    const term = activeTerminal(s);
    let sat = useSelected && selectedSatId ? s.sats.find((x) => x.id === selectedSatId) : undefined;
    if (!sat) {
      const pool = s.sats.filter((x) => x.constellationId === cid);
      const ctx = makeEvalContext(term, s.analysis, s.constellations, s.payloads);
      sat = rankCandidates(pool, s.clock.t, ctx, { ...s.mbb, policy: 'max-elevation', orbitPolicy: 'single', minElevationDeg: 0 }, new Set())[0]?.sat ?? pool[0];
    }
    if (!sat) { notify('No satellite available for this constellation'); return; }
    const c = s.constellations.find((x) => x.id === sat!.constellationId)!;
    const pl = s.payloads.find((p) => p.id === c.payloadId)!;
    setBusy(true);
    setTimeout(() => {
      const t0 = performance.now();
      const r = computeCoverage(sat!, s.clock.t, pl, c.orbitClass, term, s.analysis, metric, step);
      setBusy(false);
      setRes(r);
      setRange(null);
      globe?.setCoverageMap(r);
      if (r.cells.length) globe?.flyToBounds(r.bounds);
      notify(`Coverage of ${sat!.name}: ${r.cells.length} cells in ${(performance.now() - t0).toFixed(0)} ms`);
    }, 30);
  };

  const lo = range?.[0] ?? res?.min ?? 0, hi = range?.[1] ?? res?.max ?? 1;
  const unit = METRICS[metric].unit;
  const mean = res && res.cells.length ? res.cells.reduce((a, c) => a + c.value, 0) / res.cells.length : NaN;

  return (
    <div>
      <div className="small muted" style={{ marginBottom: 8 }}>
        Evaluates the complete link budget (ITU-R propagation, beam pattern, C/I, terminal scan loss, ACM) from one satellite to a grid of terminals across its service area.
        LEO/MEO maps are snapshots at the current simulation time.
      </div>
      <Sect>Satellite</Sect>
      <div className="fgrid">
        <SelectField label="Constellation (best satellite)" value={cid} options={enabled.map((c) => [c.id, c.name])} onChange={setCid} />
        <SelectField label="Source" value={useSelected ? 'sel' : 'best'} options={[['best', 'Best seen from terminal'], ['sel', `Selected: ${sats.find((x) => x.id === selectedSatId)?.name ?? 'none'}`]]} onChange={(v) => setUseSelected(v === 'sel')} />
      </div>
      <Sect>Metric</Sect>
      <div className="fgrid">
        <SelectField<CoverageMetric> label="Metric" value={metric} onChange={setMetric} options={(Object.keys(METRICS) as CoverageMetric[]).map((k) => [k, `${METRICS[k].label} [${METRICS[k].unit}]`])} />
        <NumberField label="Grid step" unit="°" value={step} step={0.05} min={0.05} max={5} onChange={setStep} />
      </div>
      <div className="row" style={{ marginTop: 8, gap: 6 }}>
        <button className="btn primary" disabled={busy} onClick={run}>{busy ? 'Computing…' : 'Compute coverage map'}</button>
        <button className="btn sm" onClick={() => { setRes(null); globe?.setCoverageMap(null); }}>Clear</button>
      </div>
      {res && (
        <>
          <Sect>Result · {res.satName}</Sect>
          <div style={{ height: 12, borderRadius: 6, background: `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1].map((t) => `rgb(${rampColor(t).join(',')})`).join(',')})` }} />
          <div className="row small mono" style={{ marginTop: 3 }}><span>{fmtNum(lo, 1)} {unit}</span><span className="right-align">{fmtNum(hi, 1)} {unit}</span></div>
          <div className="fgrid" style={{ marginTop: 6 }}>
            <NumberField label="Colour min" unit={unit} value={lo} step={0.5} onChange={(v) => { const r: [number, number] = [v, hi]; setRange(r); globe?.setCoverageMap(res, r); }} />
            <NumberField label="Colour max" unit={unit} value={hi} step={0.5} onChange={(v) => { const r: [number, number] = [lo, v]; setRange(r); globe?.setCoverageMap(res, r); }} />
          </div>
          <table className="lb" style={{ marginTop: 6 }}>
            <tbody>
              <tr><td>Grid cells evaluated</td><td className="v">{res.cells.length}</td><td className="u">@ {fmtNum(res.stepDeg, 2)}°</td></tr>
              <tr><td>Minimum</td><td className="v">{fmtNum(res.min, 2)}</td><td className="u">{unit}</td></tr>
              <tr><td>Mean</td><td className="v">{fmtNum(mean, 2)}</td><td className="u">{unit}</td></tr>
              <tr><td>Maximum</td><td className="v">{fmtNum(res.max, 2)}</td><td className="u">{unit}</td></tr>
            </tbody>
          </table>
          <div className="row" style={{ gap: 6, marginTop: 8 }}>
            <button className="btn sm" onClick={() => download(`coverage-${metric}.csv`, ['lat,lon,' + metric, ...res.cells.map((c) => `${c.lat.toFixed(4)},${c.lon.toFixed(4)},${c.value.toFixed(4)}`)].join('\n'), 'text/csv')}>Export CSV</button>
            <button className="btn sm" onClick={() => download(`coverage-${metric}.kml`, coverageKml(res, lo, hi), 'application/vnd.google-earth.kml+xml')}>Export KML</button>
          </div>
        </>
      )}
    </div>
  );
}
