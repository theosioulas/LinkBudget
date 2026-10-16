import { useState } from 'react';
import { useStore, resetScenario } from '../store/store';
import { NumberField, TextField, Toggle, Sect } from './controls';

export function SettingsTab() {
  const a = useStore((s) => s.analysis);
  const name = useStore((s) => s.name);
  const gridsReady = useStore((s) => s.gridsReady);
  const set = useStore((s) => s.set);
  const [confirmReset, setConfirmReset] = useState(false);
  const ua = (p: Partial<typeof a>) => set({ analysis: { ...a, ...p } });
  return (
    <div>
      <Sect>Scenario</Sect>
      <TextField label="Scenario name" value={name} onChange={(v) => set({ name: v })} />
      <div className="row" style={{ marginTop: 6 }}>
        {confirmReset
          ? <><button className="btn sm danger" onClick={() => { resetScenario(); setConfirmReset(false); }}>Yes, reset everything</button><button className="btn sm ghost" onClick={() => setConfirmReset(false)}>Cancel</button></>
          : <button className="btn sm danger" onClick={() => setConfirmReset(true)}>Reset to presets…</button>}
      </div>

      <Sect>Link analysis</Sect>
      <div className="fgrid">
        <NumberField label="Availability target" unit="%" value={a.availabilityPct} step={0.05} min={50} max={99.999} onChange={(v) => ua({ availabilityPct: v })} />
        <NumberField label="ACM margin" unit="dB" value={a.acmMarginDb} step={0.1} min={0} onChange={(v) => ua({ acmMarginDb: v })} />
        <NumberField label="R0.01 override (blank = ITU map)" unit="mm/h" value={a.R001Override ?? NaN} step={1} min={0}
          onChange={(v) => ua({ R001Override: Number.isFinite(v) ? v : undefined })} />
        <div className="field"><label>&nbsp;</label><button className="btn sm" onClick={() => ua({ R001Override: undefined })}>Use ITU-R P.837 map</button></div>
      </div>
      <div className="row wrap" style={{ gap: 14, marginTop: 8 }}>
        <Toggle checked={a.includeGas} onChange={(v) => ua({ includeGas: v })} label="Gases (P.676)" />
        <Toggle checked={a.includeCloud} onChange={(v) => ua({ includeCloud: v })} label="Clouds (P.840)" />
        <Toggle checked={a.includeRain} onChange={(v) => ua({ includeRain: v })} label="Rain (P.618)" />
        <Toggle checked={a.includeScint} onChange={(v) => ua({ includeScint: v })} label="Scintillation" />
      </div>
      <div className="small dim" style={{ marginTop: 6 }}>
        Climate data: {gridsReady ? 'ITU-R digital maps loaded (P.837-7 R0.01, P.839-4 isotherm, P.840-7 cloud, P.836-6 vapour, P.453-13 Nwet, P.1511 topography).' : 'loading ITU-R maps… (latitude fallback in use)'}
      </div>

      <Sect>About</Sect>
      <div className="small muted">
        OrbitLink Studio models propagation with ITU-R P.618-13 (rain, scintillation, XPD, total attenuation), P.676 Annex 2 (gases), P.840 (clouds), P.838-3 (rain
        coefficients), using global ITU-R digital maps. Orbits: two-body + J2 secular (Walker / GEO presets) or SGP4 (TLEs). MODCODs: DVB-S2/S2X ACM thresholds.
        Payload values are representative public estimates — edit them to match your data sheets.
      </div>
    </div>
  );
}
