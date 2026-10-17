import { useStore, activeTerminal, setView } from '../store/store';
import type { Terminal, TerminalBand, Obstruction } from '../core/model';
import { NumberField, SelectField, TextField, Toggle, Sect, fmtNum } from './controls';
import { siteClimate } from '../core/itu/atmosphere';

const PLACES: [string, number, number][] = [
  ['Athens', 37.98, 23.73], ['London', 51.51, -0.13], ['New York', 40.71, -74.01], ['Singapore', 1.35, 103.82], ['Dubai', 25.2, 55.27],
  ['São Paulo', -23.55, -46.63], ['Tromsø', 69.65, 18.96], ['Mid-Atlantic ship', 35.0, -40.0], ['Nairobi', -1.29, 36.82], ['Sydney', -33.87, 151.21],
];

export const OBSTRUCTION_PRESETS: [string, Obstruction[]][] = [
  ['Clear sky', []],
  ['Urban canyon (N–S street)', [{ azFrom: 30, azTo: 150, elMax: 60 }, { azFrom: 210, azTo: 330, elMax: 60 }]],
  ['Ship superstructure aft', [{ azFrom: 135, azTo: 225, elMax: 40 }]],
  ['Mountain valley (south ridge)', [{ azFrom: 100, azTo: 260, elMax: 35 }]],
  ['Rooftop with tree line west', [{ azFrom: 225, azTo: 315, elMax: 45 }]],
];

function BandEditor({ k, band, onChange }: { k: 'Ku' | 'Ka'; band?: TerminalBand; onChange: (b?: TerminalBand) => void }) {
  const def: TerminalBand = k === 'Ku'
    ? { rxFreqGHz: [10.7, 12.75], txFreqGHz: [13.75, 14.5], rxGainDbi: 34, gtDbK: 10, eirpMaxDbw: 40 }
    : { rxFreqGHz: [17.7, 21.2], txFreqGHz: [27.5, 31.0], rxGainDbi: 38, gtDbK: 12, eirpMaxDbw: 46 };
  const u = (p: Partial<TerminalBand>) => onChange({ ...(band ?? def), ...p });
  const tsys = band ? Math.pow(10, (band.rxGainDbi - band.gtDbK) / 10) : 0;
  return (
    <div className="card">
      <div className="card-title"><span style={{ flex: 1 }}>{k}-band</span><Toggle checked={!!band} onChange={(v) => onChange(v ? def : undefined)} label="" /></div>
      {band && (
        <div className="fgrid" style={{ marginTop: 6 }}>
          <NumberField label="Rx low" unit="GHz" value={band.rxFreqGHz[0]} step={0.05} onChange={(v) => u({ rxFreqGHz: [v, band.rxFreqGHz[1]] })} />
          <NumberField label="Rx high" unit="GHz" value={band.rxFreqGHz[1]} step={0.05} onChange={(v) => u({ rxFreqGHz: [band.rxFreqGHz[0], v] })} />
          <NumberField label="Tx low" unit="GHz" value={band.txFreqGHz[0]} step={0.05} onChange={(v) => u({ txFreqGHz: [v, band.txFreqGHz[1]] })} />
          <NumberField label="Tx high" unit="GHz" value={band.txFreqGHz[1]} step={0.05} onChange={(v) => u({ txFreqGHz: [band.txFreqGHz[0], v] })} />
          <NumberField label="Rx gain (boresight)" unit="dBi" value={band.rxGainDbi} step={0.5} onChange={(v) => u({ rxGainDbi: v })} />
          <NumberField label="G/T (boresight)" unit="dB/K" value={band.gtDbK} step={0.5} onChange={(v) => u({ gtDbK: v })} />
          <NumberField label="EIRP max (boresight)" unit="dBW" value={band.eirpMaxDbw} step={0.5} onChange={(v) => u({ eirpMaxDbw: v })} />
          <div className="field"><label>Implied Tsys</label><div className="input-wrap mono">{fmtNum(tsys, 0)} K</div></div>
        </div>
      )}
    </div>
  );
}

function ScanCurve({ t }: { t: Terminal }) {
  const W = 330, H = 110, m = { l: 30, r: 8, t: 6, b: 18 };
  const X = (a: number) => m.l + (a / 80) * (W - m.l - m.r);
  const Y = (db: number) => m.t + (-db / 10) * (H - m.t - m.b);
  const path = (n: number) => Array.from({ length: 81 }, (_, a) => `${a ? 'L' : 'M'}${X(a).toFixed(1)},${Y(Math.max(-10, 10 * n * Math.log10(Math.cos((a * Math.PI) / 180)))).toFixed(1)}`).join('');
  return (
    <svg width={W} height={H}>
      {[0, -3, -6, -9].map((g) => <g key={g}><line x1={m.l} x2={W - m.r} y1={Y(g)} y2={Y(g)} stroke="rgba(148,178,230,0.12)" /><text x={m.l - 4} y={Y(g) + 3} fontSize="9.5" fill="#7d8da6" textAnchor="end">{g}</text></g>)}
      {[0, 20, 40, 60, 80].map((a) => <text key={a} x={X(a)} y={H - 4} fontSize="9.5" fill="#7d8da6" textAnchor="middle">{a}°</text>)}
      <line x1={X(t.maxScanDeg)} x2={X(t.maxScanDeg)} y1={m.t} y2={H - m.b} stroke="rgba(248,113,113,0.6)" strokeDasharray="3 3" />
      <path d={path(t.scanLossExpRx)} stroke="#22d3ee" fill="none" strokeWidth={1.6} />
      <path d={path(t.scanLossExpTx)} stroke="#f472b6" fill="none" strokeWidth={1.6} />
      <text x={W - m.r} y={m.t + 10} fontSize="10" fill="#22d3ee" textAnchor="end">Rx cos^{t.scanLossExpRx}</text>
      <text x={W - m.r} y={m.t + 22} fontSize="10" fill="#f472b6" textAnchor="end">Tx cos^{t.scanLossExpTx}</text>
    </svg>
  );
}

export function TerminalTab() {
  const terminals = useStore((s) => s.terminals);
  const t = useStore(activeTerminal);
  const set = useStore((s) => s.set);
  const update = useStore((s) => s.updateTerminal);
  const pick = useStore((s) => s.pickTerminal);
  const u = (p: Partial<Terminal>) => { update(p); if ('lat' in p || 'lon' in p || 'beams' in p || 'bands' in p) set({ sim: null }); };
  const c = siteClimate(t.lat, t.lon);
  return (
    <div>
      <div className="row" style={{ gap: 6 }}>
        <div style={{ flex: 1 }}><SelectField label="Earth station / terminal" value={t.id} options={terminals.map((x) => [x.id, x.name])} onChange={(v) => set({ activeTerminalId: v, sim: null })} /></div>
        <button className="btn sm" style={{ marginTop: 14 }} onClick={() => useStore.getState().addTerminal({ ...JSON.parse(JSON.stringify(t)), id: `ut-${Date.now().toString(36)}`, name: `${t.name} (copy)` })}>Duplicate</button>
      </div>

      <Sect>Location</Sect>
      <div className="fgrid three">
        <NumberField label="Latitude" unit="°" value={t.lat} step={0.01} min={-89.9} max={89.9} onChange={(v) => u({ lat: v })} />
        <NumberField label="Longitude" unit="°" value={t.lon} step={0.01} min={-180} max={180} onChange={(v) => u({ lon: v })} />
        <NumberField label="Altitude" unit="m" value={t.altM} step={10} min={0} onChange={(v) => u({ altM: v })} />
      </div>
      <div className="row wrap" style={{ gap: 5, marginTop: 6 }}>
        <button className={`btn sm ${pick ? 'active' : ''}`} onClick={() => set({ pickTerminal: !pick })}>{pick ? 'Click the globe…' : '⌖ Pick on globe'}</button>
        <button className="btn sm" onClick={() => setView('terminal')}>Fly to</button>
        <select className="btn sm" value="" onChange={(e) => { const p = PLACES.find((x) => x[0] === e.target.value); if (p) u({ lat: p[1], lon: p[2] }); }}>
          <option value="">Quick locations…</option>
          {PLACES.map(([n]) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="small dim" style={{ marginTop: 6 }}>ITU climate: R0.01 {fmtNum(c.R001, 1)} mm/h · rain height {fmtNum(c.hRain, 2)} km · Nwet {fmtNum(c.Nwet, 0)}</div>

      <Sect>Antenna</Sect>
      <div className="fgrid">
        <TextField label="Name" value={t.name} onChange={(v) => u({ name: v })} />
        <SelectField label="Type" value={t.type} options={[['phased-array', 'Electronically steered array'], ['parabolic', 'Parabolic (mechanical)']]} onChange={(v) => u({ type: v, beams: v === 'parabolic' ? 1 : t.beams })} />
        <SelectField label="Independent beams" value={t.beams} options={[[1, '1 – break-before-make'], [2, '2 – make-before-break']]} onChange={(v) => u({ beams: v as 1 | 2 })} />
        <NumberField label="Equivalent aperture" unit="m" value={t.apertureM} step={0.05} min={0.05} onChange={(v) => u({ apertureM: v })} />
      </div>
      {t.type === 'phased-array' && (
        <>
          <div className="fgrid three" style={{ marginTop: 6 }}>
            <NumberField label="Rx scan exp." value={t.scanLossExpRx} step={0.1} min={0} onChange={(v) => u({ scanLossExpRx: v })} />
            <NumberField label="Tx scan exp." value={t.scanLossExpTx} step={0.1} min={0} onChange={(v) => u({ scanLossExpTx: v })} />
            <NumberField label="Max scan" unit="°" value={t.maxScanDeg} step={1} min={10} max={89} onChange={(v) => u({ maxScanDeg: v })} />
            <NumberField label="Panel tilt" unit="°" value={t.panelTiltDeg} step={1} min={0} max={90} onChange={(v) => u({ panelTiltDeg: v })} />
            <NumberField label="Panel azimuth" unit="°" value={t.panelAzDeg} step={5} min={0} max={360} onChange={(v) => u({ panelAzDeg: v })} />
          </div>
          <div style={{ marginTop: 6 }}><ScanCurve t={t} /></div>
          <div className="small dim">Gain falls as cosⁿ(θ) with scan angle off the panel normal; the cyan cone on the globe shows the steering limit.</div>
        </>
      )}

      <Sect>Bands</Sect>
      <BandEditor k="Ku" band={t.bands.Ku} onChange={(b) => u({ bands: { ...t.bands, Ku: b } })} />
      <BandEditor k="Ka" band={t.bands.Ka} onChange={(b) => u({ bands: { ...t.bands, Ka: b } })} />

      <Sect>Obstruction mask</Sect>
      <div className="small dim" style={{ marginBottom: 6 }}>Satellites inside a blocked sector below its elevation are not usable (ship superstructure, buildings, terrain). Shown as red walls on the globe.</div>
      {(t.obstructions ?? []).map((o, i) => (
        <div key={i} className="fgrid three" style={{ marginBottom: 4, alignItems: 'end' }}>
          <NumberField label="Az from" unit="°" value={o.azFrom} step={5} min={0} max={360} onChange={(v) => u({ obstructions: (t.obstructions ?? []).map((x, j) => (j === i ? { ...x, azFrom: v } : x)) })} />
          <NumberField label="Az to" unit="°" value={o.azTo} step={5} min={0} max={360} onChange={(v) => u({ obstructions: (t.obstructions ?? []).map((x, j) => (j === i ? { ...x, azTo: v } : x)) })} />
          <div className="row" style={{ gap: 4 }}>
            <NumberField label="Below el." unit="°" value={o.elMax} step={1} min={0} max={90} onChange={(v) => u({ obstructions: (t.obstructions ?? []).map((x, j) => (j === i ? { ...x, elMax: v } : x)) })} />
            <button className="btn sm icon danger" style={{ marginBottom: 2 }} onClick={() => u({ obstructions: (t.obstructions ?? []).filter((_, j) => j !== i) })}>✕</button>
          </div>
        </div>
      ))}
      <div className="row wrap" style={{ gap: 5 }}>
        <button className="btn sm" onClick={() => u({ obstructions: [...(t.obstructions ?? []), { azFrom: 90, azTo: 180, elMax: 30 }] })}>＋ Sector</button>
        <select className="btn sm" value="" onChange={(e) => { const p = OBSTRUCTION_PRESETS.find((x) => x[0] === e.target.value); if (p) u({ obstructions: p[1] }); }}>
          <option value="">Presets…</option>
          {OBSTRUCTION_PRESETS.map(([n]) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <Sect>Losses & margins</Sect>
      <div className="fgrid three">
        <NumberField label="Pointing" unit="dB" value={t.pointingLossDb} step={0.1} min={0} onChange={(v) => u({ pointingLossDb: v })} />
        <NumberField label="Radome" unit="dB" value={t.radomeLossDb} step={0.1} min={0} onChange={(v) => u({ radomeLossDb: v })} />
        <NumberField label="Polarisation" unit="dB" value={t.polLossDb} step={0.1} min={0} onChange={(v) => u({ polLossDb: v })} />
        <NumberField label="Impl. margin" unit="dB" value={t.implMarginDb} step={0.1} min={0} onChange={(v) => u({ implMarginDb: v })} />
        <NumberField label="Tx back-off" unit="dB" value={t.txBackoffDb} step={0.5} min={0} onChange={(v) => u({ txBackoffDb: v })} />
        <NumberField label="Ground spill" unit="K" value={t.groundSpillK} step={1} min={0} onChange={(v) => u({ groundSpillK: v })} />
      </div>
    </div>
  );
}
