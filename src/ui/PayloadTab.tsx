import { useStore } from '../store/store';
import type { Payload, BeamLayout, PatternKind, Polarization, ContourMeaning } from '../core/model';
import { NumberField, SelectField, TextField, Sect, download, pickFile, fmtNum } from './controls';
import { PatternPlot } from './PatternPlot';
import { parseKml, parseKmz, footprintsToKml } from '../core/kml/kml';
import { beamContours, beamFootprints, hexBeamIds } from '../core/rf/beams';
import { satEcef } from '../core/orbit/propagator';
import { sub } from '../core/vec';
import { REUSE_COLORS, } from '../globe/controller';
import { gainFromBeamwidths } from '../core/rf/antenna';

const POLS: [Polarization, string][] = [['RHCP', 'RHCP'], ['LHCP', 'LHCP'], ['H', 'Linear H'], ['V', 'Linear V']];

function defaultLayout(kind: BeamLayout['kind'], p: Payload): BeamLayout {
  switch (kind) {
    case 'steerable-cells': return { kind, cellDiameterKm: 24, reuseColors: 4, beamsPerSat: 48, coChannelLoad: 0.5, minSepBeamwidths: 1.6 };
    case 'fixed-strips': return { kind, count: 16, alongTrackDeg: 3, crossTrackDeg: 48, reuseColors: 2, boresightTiltDeg: 0 };
    case 'hex-grid': return { kind, aimLat: 45, aimLon: 10, spacingDeg: p.pattern.hpbwDeg * 0.9, rings: 5, reuseColors: 4 };
    case 'spot': return { kind, aimLat: 45, aimLon: 10 };
    case 'kml': return { kind, beams: [], meaning: 'absolute-eirp', edgeRelDb: -3, sourceName: '' };
  }
}

export function PayloadTab() {
  const payloads = useStore((s) => s.payloads);
  const constellations = useStore((s) => s.constellations);
  const selId = useStore((s) => s.selectedPayloadId);
  const set = useStore((s) => s.set);
  const update = useStore((s) => s.updatePayload);
  const notify = useStore((s) => s.notify);
  const p = payloads.find((x) => x.id === selId) ?? payloads[0];
  if (!p) return <div className="empty">No payloads.</div>;
  const usedBy = constellations.filter((c) => c.payloadId === p.id);
  const up = (patch: Partial<Payload>) => update(p.id, { ...p, ...patch });
  const upF = (patch: Partial<Payload['forward']>) => up({ forward: { ...p.forward, ...patch } });
  const upR = (patch: Partial<Payload['ret']>) => up({ ret: { ...p.ret, ...patch } });
  const upP = (patch: Partial<Payload['pattern']>) => up({ pattern: { ...p.pattern, ...patch } });
  const L = p.layout;
  const upL = (patch: Partial<BeamLayout>) => up({ layout: { ...L, ...patch } as BeamLayout });

  const duplicate = () => {
    const np: Payload = { ...JSON.parse(JSON.stringify(p)), id: `pl-${Date.now().toString(36)}`, name: `${p.name} (copy)` };
    useStore.getState().addPayload(np);
  };

  const importKml = async () => {
    const f = await pickFile('.kml,.kmz');
    if (!f) return;
    try {
      const r = f.name.toLowerCase().endsWith('.kmz') ? parseKmz(await f.arrayBuffer()) : parseKml(await f.text());
      if (!r.beams.length) { notify(r.warnings.join(' ') || 'No beams found'); return; }
      const lv = r.beams.flatMap((b) => b.contours.map((c) => c.level));
      const maxLv = Math.max(...lv);
      const meaning: ContourMeaning = !r.hasLevels ? 'edge-only' : maxLv > 15 ? 'absolute-eirp' : 'relative';
      up({ layout: { kind: 'kml', beams: r.beams, meaning, edgeRelDb: -3, sourceName: f.name } });
      notify(`Imported ${r.beams.length} beam(s) from ${f.name} (${meaning})${r.warnings.length ? ' – ' + r.warnings.join(' ') : ''}`);
    } catch (e) {
      notify(`KML import failed: ${String(e)}`);
    }
  };

  const exportKml = () => {
    const st = useStore.getState();
    const c = usedBy[0];
    const sat = c ? st.sats.find((s) => s.constellationId === c.id) : undefined;
    if (!sat && L.kind !== 'kml') { notify('Enable a constellation that uses this payload to export its beams.'); return; }
    let fps;
    if (L.kind === 'kml') fps = beamFootprints(p, { ecef: [0, 0, 0], velEcef: [0, 0, 1] });
    else {
      const t = st.clock.t;
      const pose = { ecef: satEcef(sat!, t), velEcef: sub(satEcef(sat!, t + 500), satEcef(sat!, t - 500)) };
      const term = st.terminals.find((x) => x.id === st.activeTerminalId)!;
      fps = L.kind === 'hex-grid' || L.kind === 'spot' ? beamContours(p, pose) : beamFootprints(p, pose, { lat: term.lat, lon: term.lon, alt: 0 }, 4);
    }
    download(`${p.name.replace(/\W+/g, '_')}_beams.kml`, footprintsToKml(p.name, fps, L.kind === 'hex-grid' || L.kind === 'spot' ? 'dBW' : 'dB'), 'application/vnd.google-earth.kml+xml');
  };

  const estPeakGain = L.kind === 'fixed-strips' ? gainFromBeamwidths(L.alongTrackDeg, L.crossTrackDeg) : gainFromBeamwidths(p.pattern.hpbwDeg, p.pattern.hpbwDeg);

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <SelectField label="Payload" value={p.id} options={payloads.map((x) => [x.id, x.name])} onChange={(v) => set({ selectedPayloadId: v })} />
        </div>
        <button className="btn sm" style={{ marginTop: 14 }} onClick={duplicate}>Duplicate</button>
      </div>
      <div className="small dim" style={{ marginBottom: 6 }}>Used by: {usedBy.length ? usedBy.map((c) => c.name).join(', ') : 'no constellation'}</div>
      {p.notes && <div className="small muted" style={{ marginBottom: 6 }}>{p.notes}</div>}

      <Sect>General</Sect>
      <div className="fgrid">
        <TextField label="Name" value={p.name} onChange={(v) => up({ name: v })} />
        <SelectField label="Band" value={p.band} options={[['Ku', 'Ku'], ['Ka', 'Ka']]} onChange={(v) => up({ band: v })} />
        <SelectField label="Architecture" value={p.architecture} options={[['bent-pipe', 'Transparent (bent-pipe)'], ['regenerative', 'Regenerative (OBP)']]} onChange={(v) => up({ architecture: v })} />
        <NumberField label="Min elevation (service)" unit="°" value={p.minElevationDeg} step={1} min={0} max={89} onChange={(v) => up({ minElevationDeg: v })} />
      </div>

      <Sect>Forward downlink (sat → user)</Sect>
      <div className="fgrid">
        <NumberField label="Frequency" unit="GHz" value={p.forward.freqGHz} step={0.05} onChange={(v) => upF({ freqGHz: v })} />
        <NumberField label="Carrier bandwidth" unit="MHz" value={p.forward.bandwidthMHz} step={1} min={0.1} onChange={(v) => upF({ bandwidthMHz: v })} />
        <NumberField label="Roll-off α" value={p.forward.rolloff} step={0.05} min={0} max={0.5} onChange={(v) => upF({ rolloff: v })} />
        <SelectField label="Polarisation" value={p.forward.pol} options={POLS} onChange={(v) => upF({ pol: v })} />
        <NumberField label="EIRP peak / beam (sat.)" unit="dBW" value={p.forward.eirpPeakDbw} step={0.5} onChange={(v) => upF({ eirpPeakDbw: v })} />
        <NumberField label="Output back-off" unit="dB" value={p.forward.oboDb} step={0.25} min={0} onChange={(v) => upF({ oboDb: v })} />
        <NumberField label="C/IM (HPA)" unit="dB" value={p.forward.cimDb} step={0.5} onChange={(v) => upF({ cimDb: v })} />
        <NumberField label="Feeder uplink C/N" unit="dB" value={p.feeder.fwdCnDb} step={0.5} onChange={(v) => up({ feeder: { ...p.feeder, fwdCnDb: v } })} />
      </div>

      <Sect>Return uplink (user → sat)</Sect>
      <div className="fgrid">
        <NumberField label="Frequency" unit="GHz" value={p.ret.freqGHz} step={0.05} onChange={(v) => upR({ freqGHz: v })} />
        <NumberField label="Carrier bandwidth" unit="MHz" value={p.ret.bandwidthMHz} step={0.5} min={0.05} onChange={(v) => upR({ bandwidthMHz: v })} />
        <NumberField label="Roll-off α" value={p.ret.rolloff} step={0.05} min={0} max={0.5} onChange={(v) => upR({ rolloff: v })} />
        <SelectField label="Polarisation" value={p.ret.pol} options={POLS} onChange={(v) => upR({ pol: v })} />
        <NumberField label="G/T peak / beam (sat.)" unit="dB/K" value={p.ret.gtPeakDbK} step={0.5} onChange={(v) => upR({ gtPeakDbK: v })} />
        <NumberField label="Feeder downlink C/N" unit="dB" value={p.feeder.rtnCnDb} step={0.5} onChange={(v) => up({ feeder: { ...p.feeder, rtnCnDb: v } })} />
      </div>

      <Sect>Interference</Sect>
      <div className="fgrid">
        <NumberField label="C/ASI (adjacent systems)" unit="dB" value={p.casiDb} step={0.5} onChange={(v) => up({ casiDb: v })} />
        <NumberField label="X-pol isolation" unit="dB" value={p.xpolIsoDb} step={0.5} onChange={(v) => up({ xpolIsoDb: v })} />
      </div>
      <div className="small dim" style={{ marginTop: 4 }}>Co-channel C/I is computed from the beam layout geometry and the antenna pattern (frequency-reuse colours).</div>

      <Sect>Satellite antenna pattern</Sect>
      <div className="fgrid">
        <SelectField<PatternKind> label="Pattern model" value={p.pattern.kind} onChange={(v) => upP({ kind: v })}
          options={[['phased-array', 'Phased array (scan loss)'], ['bessel', 'Circular aperture (Bessel)'], ['s672', 'ITU-R S.672 envelope'], ['gaussian', 'Gaussian']]} />
        <NumberField label="3 dB beamwidth" unit="°" value={p.pattern.hpbwDeg} step={0.05} min={0.01} onChange={(v) => upP({ hpbwDeg: v })} />
        <NumberField label="Sidelobe level Ls" unit="dB" value={p.pattern.sidelobeDb} step={1} max={-5} onChange={(v) => upP({ sidelobeDb: v })} />
        {p.pattern.kind === 'phased-array' && <NumberField label="Scan loss exponent n" value={p.pattern.scanLossExp} step={0.1} min={0} onChange={(v) => upP({ scanLossExp: v })} />}
        <NumberField label="Max steering (nadir)" unit="°" value={p.pattern.maxScanDeg} step={1} min={0} max={90} onChange={(v) => upP({ maxScanDeg: v })} />
      </div>
      <div style={{ marginTop: 6 }}>
        <PatternPlot pattern={p.pattern} scans={p.pattern.kind === 'phased-array' ? [0, 30, 50] : [0]} />
        <div className="small dim">Implied directivity ≈ {fmtNum(estPeakGain, 1)} dBi (65 % efficiency).</div>
      </div>

      <Sect>Beam layout</Sect>
      <SelectField<BeamLayout['kind']> label="Layout" value={L.kind} onChange={(v) => up({ layout: defaultLayout(v, p) })}
        options={[['steerable-cells', 'Steerable spots over ground cells (LEO/MEO ESA)'], ['fixed-strips', 'Fixed body-mounted strips (OneWeb-style)'], ['hex-grid', 'Multibeam hex grid (GEO HTS)'], ['spot', 'Single spot / regional beam'], ['kml', 'Imported KML / KMZ contours']]} />
      <div className="fgrid" style={{ marginTop: 6 }}>
        {L.kind === 'steerable-cells' && (<>
          <NumberField label="Cell diameter" unit="km" value={L.cellDiameterKm} step={1} min={1} onChange={(v) => upL({ cellDiameterKm: v })} />
          <NumberField label="Reuse colours" value={L.reuseColors} step={1} min={1} max={7} onChange={(v) => upL({ reuseColors: Math.round(v) })} />
          <NumberField label="Beams per satellite" value={L.beamsPerSat} step={1} min={1} onChange={(v) => upL({ beamsPerSat: Math.round(v) })} />
          <NumberField label="Co-channel load" value={L.coChannelLoad ?? 0.5} step={0.05} min={0} max={1} title="Fraction of first-tier co-channel cells lit simultaneously by the same satellite" onChange={(v) => upL({ coChannelLoad: v })} />
          <NumberField label="Min co-ch. separation" unit="BW" value={L.minSepBeamwidths ?? 1.6} step={0.1} min={0} max={6} title="Scheduler keeps co-channel beams at least this many (scan-broadened) beamwidths apart" onChange={(v) => upL({ minSepBeamwidths: v })} />
        </>)}
        {L.kind === 'fixed-strips' && (<>
          <NumberField label="Number of beams" value={L.count} step={1} min={1} max={64} onChange={(v) => upL({ count: Math.round(v) })} />
          <NumberField label="Along-track width" unit="°" value={L.alongTrackDeg} step={0.1} min={0.1} onChange={(v) => upL({ alongTrackDeg: v })} />
          <NumberField label="Cross-track width" unit="°" value={L.crossTrackDeg} step={1} min={1} onChange={(v) => upL({ crossTrackDeg: v })} />
          <NumberField label="Reuse colours" value={L.reuseColors} step={1} min={1} max={4} onChange={(v) => upL({ reuseColors: Math.round(v) })} />
          <NumberField label="Boresight pitch" unit="°" value={L.boresightTiltDeg} step={0.5} onChange={(v) => upL({ boresightTiltDeg: v })} />
        </>)}
        {L.kind === 'hex-grid' && (<>
          <NumberField label="Aim latitude" unit="°" value={L.aimLat} step={0.5} min={-90} max={90} onChange={(v) => upL({ aimLat: v })} />
          <NumberField label="Aim longitude" unit="°" value={L.aimLon} step={0.5} min={-180} max={180} onChange={(v) => upL({ aimLon: v })} />
          <NumberField label="Beam spacing" unit="°" value={L.spacingDeg} step={0.01} min={0.02} onChange={(v) => upL({ spacingDeg: v })} />
          <NumberField label="Rings" value={L.rings} step={1} min={0} max={14} onChange={(v) => upL({ rings: Math.round(v) })} />
          <NumberField label="Reuse colours" value={L.reuseColors} step={1} min={1} max={7} onChange={(v) => upL({ reuseColors: Math.round(v) })} />
          <div className="field"><label>Beams</label><div className="input-wrap mono">{1 + 3 * L.rings * (L.rings + 1)}</div></div>
        </>)}
        {L.kind === 'spot' && (<>
          <NumberField label="Aim latitude" unit="°" value={L.aimLat} step={0.5} min={-90} max={90} onChange={(v) => upL({ aimLat: v })} />
          <NumberField label="Aim longitude" unit="°" value={L.aimLon} step={0.5} min={-180} max={180} onChange={(v) => upL({ aimLon: v })} />
        </>)}
        {L.kind === 'kml' && (<>
          <SelectField<ContourMeaning> label="Contour values are" value={L.meaning} onChange={(v) => upL({ meaning: v })}
            options={[['absolute-eirp', 'Absolute EIRP (dBW)'], ['relative', 'Relative gain (dB re peak)'], ['edge-only', 'Beam edges only']]} />
          <NumberField label="Edge level (edge-only)" unit="dB" value={L.edgeRelDb} step={0.5} max={0} onChange={(v) => upL({ edgeRelDb: v })} />
        </>)}
      </div>
      <div className="row wrap" style={{ marginTop: 8 }}>
        <button className="btn sm primary" onClick={importKml}>Import KML / KMZ beams…</button>
        <button className="btn sm" onClick={exportKml}>Export beams as KML</button>
        <a className="btn sm" href="./samples/ka-hts-europe-eirp.kml" download>Sample KML</a>
      </div>
      {L.kind === 'hex-grid' && (
        <div style={{ marginTop: 8 }}>
          <div className="row small dim" style={{ marginBottom: 4 }}>
            <span>Per-beam settings · {Object.values(L.overrides ?? {}).filter((o) => o.off).length} off · {Object.values(L.overrides ?? {}).filter((o) => o.eirpOffsetDb).length} adjusted</span>
            <button className="btn sm right-align" onClick={() => upL({ overrides: {} })}>Reset</button>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <table className="grid">
              <thead><tr><th>Beam</th><th>On</th><th>Colour</th><th>EIRP Δ dB</th></tr></thead>
              <tbody>
                {hexBeamIds(L).map((b) => {
                  const o = L.overrides?.[b.id] ?? {};
                  const setO = (patch: Partial<typeof o>) => upL({ overrides: { ...(L.overrides ?? {}), [b.id]: { ...o, ...patch } } });
                  const col = o.color ?? b.color;
                  return (
                    <tr key={b.id} style={{ opacity: o.off ? 0.45 : 1 }}>
                      <td>{b.id}</td>
                      <td><input type="checkbox" checked={!o.off} onChange={(e) => setO({ off: !e.target.checked })} /></td>
                      <td>
                        <select value={col} style={{ background: 'transparent', border: 'none', color: REUSE_COLORS[col % REUSE_COLORS.length] }} onChange={(e) => setO({ color: +e.target.value })}>
                          {Array.from({ length: Math.max(L.reuseColors, 2) }, (_, c) => <option key={c} value={c}>● {c + 1}</option>)}
                        </select>
                      </td>
                      <td><input type="number" step={0.5} value={o.eirpOffsetDb ?? 0} style={{ width: 64, background: 'transparent', border: '1px solid var(--border)', borderRadius: 4 }} onChange={(e) => setO({ eirpOffsetDb: parseFloat(e.target.value) || 0 })} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {L.kind === 'kml' && (
        <div style={{ marginTop: 8 }}>
          <div className="small dim" style={{ marginBottom: 4 }}>{L.beams.length} beams from {L.sourceName || 'KML'} · contour levels {L.meaning === 'absolute-eirp' ? 'dBW' : 'dB'} · G/T follows the same relative shape</div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <table className="grid">
              <thead><tr><th>Beam</th><th>On</th><th>Colour</th><th>EIRP Δ</th><th>Levels</th></tr></thead>
              <tbody>
                {L.beams.map((b, i) => (
                  <tr key={b.id} style={{ opacity: b.off ? 0.45 : 1 }}>
                    <td style={{ fontFamily: 'var(--sans)' }}>{b.name}</td>
                    <td><input type="checkbox" checked={!b.off} onChange={(e) => upL({ beams: L.beams.map((x, j) => (j === i ? { ...x, off: !e.target.checked } : x)) })} /></td>
                    <td>
                      <select value={b.color} style={{ background: 'transparent', border: 'none', color: REUSE_COLORS[b.color % REUSE_COLORS.length] }}
                        onChange={(e) => upL({ beams: L.beams.map((x, j) => (j === i ? { ...x, color: +e.target.value } : x)) })}>
                        {[0, 1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>● {c + 1}</option>)}
                      </select>
                    </td>
                    <td><input type="number" step={0.5} value={b.eirpOffsetDb ?? 0} style={{ width: 52, background: 'transparent', border: '1px solid var(--border)', borderRadius: 4 }} onChange={(e) => upL({ beams: L.beams.map((x, j) => (j === i ? { ...x, eirpOffsetDb: parseFloat(e.target.value) || 0 } : x)) })} /></td>
                    <td>{b.contours.map((c) => c.level).join(' / ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="small dim" style={{ marginTop: 8 }}>
        KML import: one Folder per beam with nested contour polygons, or Placemarks whose name / ExtendedData carry the level (e.g. "52 dBW") and beam id. KMZ archives are supported.
      </div>
    </div>
  );
}
