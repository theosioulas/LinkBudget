import type { Payload, Terminal, AnalysisSettings, TerminalBand, OrbitClass } from '../model';
import type { BeamEval } from './beams';
import type { LookAngles, LatLonAlt } from '../geo/coords';
import { azElToEcefDir, geodeticToEcef } from '../geo/coords';
import { type Vec3, sub, unit, angleBetween } from '../vec';
import { atmosphericAttenuation, type SiteClimate, type AtmosResult } from '../itu/atmosphere';
import { skyNoiseTemp } from '../itu/p618';
import { tauForPolarization } from '../itu/p838';
import { selectModcod, type ModCod, MODCODS } from './modcod';
import { combineCN, db, undb } from '../units';
import { C, K_BOLTZ_DB, RAD } from '../constants';

export interface LineItem {
  section: 'Transmit' | 'Path' | 'Receive' | 'Carrier' | 'Interference' | 'Performance' | 'Geometry';
  label: string;
  value: number | string;
  unit: string;
  note?: string;
  key?: boolean;
}

export interface Geometry {
  look: LookAngles;
  rangeRateKmS: number;
  terminalScanDeg: number;
  satAltKm: number;
}

export interface DirectionResult {
  direction: 'forward' | 'return';
  feasible: boolean;
  reason?: string;
  freqGHz: number;
  symbolRateMsps: number;
  eirpDbw: number;
  gtDbK: number;
  fsplDb: number;
  atmClear: AtmosResult;
  atmP: AtmosResult;
  cn0ClearDbHz: number;
  cn0PDbHz: number;
  esn0LinkClear: number; // space-segment hop only
  esn0LinkP: number;
  cOverIDb: number; // aggregate interference (CCI + ASI + XPI + IM)
  esn0TotalClear: number;
  esn0TotalP: number;
  modcodClear: ModCod | null;
  modcodP: ModCod | null;
  throughputClearMbps: number;
  throughputPMbps: number;
  marginClearDb: number; // vs lowest MODCOD incl. ACM margin
  availabilityPct: number;
  pfdDbWm2_4k: number;
  lines: LineItem[];
}

export interface LinkResult {
  ok: boolean;
  bandKey: 'Ku' | 'Ka';
  geometry: Geometry;
  dopplerFwdKHz: number;
  dopplerRtnKHz: number;
  dopplerRateHzS: number;
  oneWayDelayMs: number;
  rttMs: number;
  forward: DirectionResult;
  ret: DirectionResult;
  beam: BeamEval;
}

export interface LinkInputs {
  payload: Payload;
  orbitClass: OrbitClass;
  terminal: Terminal;
  climate: SiteClimate;
  settings: AnalysisSettings;
  satEcef: Vec3;
  look: LookAngles;
  rangeRateKmS: number;
  rangeAccelKmS2?: number;
  beam: BeamEval;
  /** Skip the (costlier) availability inversion — used inside time simulations. */
  fast?: boolean;
}

export const fsplDb = (fGHz: number, dKm: number) => 92.45 + 20 * Math.log10(fGHz) + 20 * Math.log10(dKm);

export function terminalBandFor(payload: Payload, t: Terminal): { key: 'Ku' | 'Ka'; band?: TerminalBand } {
  const key = payload.band.toLowerCase().startsWith('ka') ? 'Ka' : 'Ku';
  return { key, band: t.bands[key] };
}

/** Scan angle [deg] between the terminal panel normal and the line of sight. */
export function terminalScanDeg(t: Terminal, satEcef: Vec3): number {
  if (t.type === 'parabolic') return 0;
  const obs: LatLonAlt = { lat: t.lat, lon: t.lon, alt: t.altM / 1000 };
  const n = azElToEcefDir(obs, t.panelAzDeg, 90 - t.panelTiltDeg);
  const los = unit(sub(satEcef, geodeticToEcef(obs.lat, obs.lon, obs.alt)));
  return angleBetween(n, los) * RAD;
}

const pOf = (s: AnalysisSettings) => Math.min(Math.max(100 - s.availabilityPct, 0.001), 50);

export function computeLink(x: LinkInputs): LinkResult {
  const { payload: pl, terminal: t, look, beam } = x;
  const { key, band } = terminalBandFor(pl, t);
  const scan = terminalScanDeg(t, x.satEcef);
  const geometry: Geometry = { look, rangeRateKmS: x.rangeRateKmS, terminalScanDeg: scan, satAltKm: 0 };
  const oneWay = (look.range / (C / 1000)) * 1000;
  const fwd = direction('forward', x, band, scan);
  const ret = direction('return', x, band, scan);
  return {
    ok: fwd.feasible || ret.feasible,
    bandKey: key,
    geometry,
    dopplerFwdKHz: (-x.rangeRateKmS * 1000 / C) * pl.forward.freqGHz * 1e6,
    dopplerRtnKHz: (-x.rangeRateKmS * 1000 / C) * pl.ret.freqGHz * 1e6,
    dopplerRateHzS: x.rangeAccelKmS2 !== undefined ? (-x.rangeAccelKmS2 * 1000 / C) * pl.forward.freqGHz * 1e9 : 0,
    oneWayDelayMs: oneWay,
    rttMs: 4 * oneWay, // user→sat→gateway→sat→user (gateway at similar slant range)
    forward: fwd,
    ret,
    beam,
  };
}

function direction(dir: 'forward' | 'return', x: LinkInputs, band: TerminalBand | undefined, scan: number): DirectionResult {
  const { payload: pl, terminal: t, settings: s, look, beam, climate } = x;
  const fwd = dir === 'forward';
  const pd = fwd ? pl.forward : pl.ret;
  const f = pd.freqGHz;
  const Rs = (pd.bandwidthMHz * 1e6) / (1 + pd.rolloff);
  const lines: LineItem[] = [];
  const empty = (reason: string): DirectionResult => ({
    direction: dir, feasible: false, reason, freqGHz: f, symbolRateMsps: Rs / 1e6, eirpDbw: NaN, gtDbK: NaN, fsplDb: NaN,
    atmClear: { gas: 0, cloud: 0, rain: 0, scint: 0, total: 0, xpd: 99 }, atmP: { gas: 0, cloud: 0, rain: 0, scint: 0, total: 0, xpd: 99 },
    cn0ClearDbHz: NaN, cn0PDbHz: NaN, esn0LinkClear: NaN, esn0LinkP: NaN, cOverIDb: NaN, esn0TotalClear: NaN, esn0TotalP: NaN,
    modcodClear: null, modcodP: null, throughputClearMbps: 0, throughputPMbps: 0, marginClearDb: NaN, availabilityPct: 0, pfdDbWm2_4k: NaN, lines,
  });
  if (!band) return empty(`Terminal has no ${pl.band}-band configuration`);
  if (!beam.covered) return empty('Terminal outside beam coverage');
  if (look.el < Math.max(pl.minElevationDeg, 0)) return empty(`Elevation ${look.el.toFixed(1)}° below payload minimum ${pl.minElevationDeg}°`);
  if (t.type === 'phased-array' && scan > t.maxScanDeg) return empty(`Terminal scan ${scan.toFixed(1)}° exceeds limit ${t.maxScanDeg}°`);

  const tau = tauForPolarization(pd.pol);
  const p = pOf(s);
  const inc = { gas: s.includeGas, cloud: s.includeCloud, rain: s.includeRain, scint: s.includeScint };
  const atmBase = { lat: t.lat, fGHz: f, elDeg: look.el, tauDeg: tau, antennaDiameterM: t.apertureM, climate, R001Override: s.R001Override, include: inc };
  const atmP = atmosphericAttenuation({ ...atmBase, pPct: p });
  const atmClear = atmosphericAttenuation({ ...atmBase, pPct: 50, include: { gas: inc.gas, cloud: false, rain: false, scint: false } });
  const fspl = fsplDb(f, look.range);
  const cosScan = Math.max(Math.cos((Math.min(scan, 89) * Math.PI) / 180), 0.02);

  // --- transmit side
  let eirp: number, gt: number;
  let gtFn: (atmTotal: number) => number;
  if (fwd) {
    const satEirp = beam.absEirpDbw !== undefined ? beam.absEirpDbw : pl.forward.eirpPeakDbw + beam.relGainDb;
    eirp = satEirp - pl.forward.oboDb;
    lines.push({ section: 'Transmit', label: 'Satellite EIRP (beam peak, saturated)', value: beam.absEirpDbw !== undefined ? beam.absEirpDbw - beam.relGainDb : pl.forward.eirpPeakDbw, unit: 'dBW' });
    lines.push({ section: 'Transmit', label: `Beam gain toward terminal (${beam.beamLabel})`, value: beam.relGainDb, unit: 'dB', note: beam.offAxisDeg ? `off-axis ${beam.offAxisDeg.toFixed(2)}°, sat scan ${beam.scanDeg.toFixed(1)}°` : undefined });
    lines.push({ section: 'Transmit', label: 'Output back-off', value: -pl.forward.oboDb, unit: 'dB' });
    lines.push({ section: 'Transmit', label: 'EIRP toward terminal', value: eirp, unit: 'dBW', key: true });
    // terminal receive
    const gScan = band.rxGainDbi + 10 * t.scanLossExpRx * Math.log10(cosScan) - t.radomeLossDb;
    const tsys0 = undb(band.rxGainDbi - band.gtDbK);
    const tGround = t.groundSpillK * (1 - Math.sin((look.el * Math.PI) / 180));
    const tAtm0 = skyNoiseTemp(atmClear.total);
    gtFn = (A: number) => gScan - db(tsys0 + tGround + Math.max(0, skyNoiseTemp(A) - tAtm0));
    gt = gtFn(atmClear.total);
  } else {
    const ut = band.eirpMaxDbw + 10 * t.scanLossExpTx * Math.log10(cosScan) - t.txBackoffDb - t.radomeLossDb;
    eirp = ut;
    lines.push({ section: 'Transmit', label: 'Terminal EIRP (boresight, max)', value: band.eirpMaxDbw, unit: 'dBW' });
    lines.push({ section: 'Transmit', label: `Scan loss (θ=${scan.toFixed(1)}°, cos^${t.scanLossExpTx})`, value: 10 * t.scanLossExpTx * Math.log10(cosScan), unit: 'dB' });
    lines.push({ section: 'Transmit', label: 'Tx back-off / power control', value: -t.txBackoffDb, unit: 'dB' });
    lines.push({ section: 'Transmit', label: 'Radome loss', value: -t.radomeLossDb, unit: 'dB' });
    lines.push({ section: 'Transmit', label: 'EIRP toward satellite', value: eirp, unit: 'dBW', key: true });
    const g = pl.ret.gtPeakDbK + beam.relGainDb;
    gtFn = () => g;
    gt = g;
  }

  // --- path
  lines.push({ section: 'Path', label: `Slant range (el ${look.el.toFixed(1)}°, az ${look.az.toFixed(1)}°)`, value: look.range, unit: 'km' });
  lines.push({ section: 'Path', label: `Free-space loss @ ${f.toFixed(2)} GHz`, value: -fspl, unit: 'dB' });
  lines.push({ section: 'Path', label: 'Gaseous absorption (P.676)', value: -atmP.gas, unit: 'dB' });
  lines.push({ section: 'Path', label: 'Cloud attenuation (P.840)', value: -atmP.cloud, unit: 'dB' });
  lines.push({ section: 'Path', label: `Rain attenuation (P.618) @ ${p.toPrecision(2)}%`, value: -atmP.rain, unit: 'dB', note: `R0.01 = ${(s.R001Override ?? climate.R001).toFixed(1)} mm/h, hR = ${climate.hRain.toFixed(2)} km` });
  lines.push({ section: 'Path', label: 'Scintillation (P.618)', value: -atmP.scint, unit: 'dB' });
  lines.push({ section: 'Path', label: 'Total atmospheric (P.618 §2.5)', value: -atmP.total, unit: 'dB', key: true });
  lines.push({ section: 'Path', label: 'Polarisation + pointing losses', value: -(t.polLossDb + t.pointingLossDb), unit: 'dB' });

  const hop = (A: number) => eirp - fspl - A - (t.polLossDb + t.pointingLossDb) + gtFn(A) - K_BOLTZ_DB;
  const cn0Clear = hop(atmClear.total);
  const cn0P = hop(atmP.total);
  const gtP = gtFn(atmP.total);

  if (fwd) {
    lines.push({ section: 'Receive', label: `Terminal G/T (scan ${scan.toFixed(1)}°), clear sky`, value: gt, unit: 'dB/K' });
    lines.push({ section: 'Receive', label: 'Terminal G/T incl. rain noise', value: gtP, unit: 'dB/K', note: `ΔT_sky = ${(skyNoiseTemp(atmP.total) - skyNoiseTemp(atmClear.total)).toFixed(0)} K` });
  } else {
    lines.push({ section: 'Receive', label: `Satellite G/T toward terminal (${beam.beamLabel})`, value: gt, unit: 'dB/K' });
  }
  lines.push({ section: 'Carrier', label: 'Boltzmann constant', value: K_BOLTZ_DB, unit: 'dBW/K/Hz' });
  lines.push({ section: 'Carrier', label: 'C/N0 clear sky', value: cn0Clear, unit: 'dBHz' });
  lines.push({ section: 'Carrier', label: `C/N0 @ ${(100 - p).toFixed(2)}% avail.`, value: cn0P, unit: 'dBHz' });
  lines.push({ section: 'Carrier', label: `Symbol rate (BW ${pd.bandwidthMHz} MHz, α=${pd.rolloff})`, value: Rs / 1e6, unit: 'Msps' });
  const esClear = cn0Clear - db(Rs), esP = cn0P - db(Rs);
  lines.push({ section: 'Carrier', label: 'Es/N0 space link, clear sky', value: esClear, unit: 'dB', key: true });

  // --- interference
  const xpiAnt = pl.xpolIsoDb;
  const xpiClear = xpiAnt;
  const xpiP = combineCN(xpiAnt, atmP.xpd);
  const feeder = fwd ? pl.feeder.fwdCnDb : pl.feeder.rtnCnDb;
  const cim = fwd ? pl.forward.cimDb : Infinity;
  const ciClear = combineCN(beam.cciDb, pl.casiDb, xpiClear, cim);
  const ciP = combineCN(beam.cciDb, pl.casiDb, xpiP, cim);
  lines.push({ section: 'Interference', label: `C/I co-channel beams (${beam.coChannelBeams} co-colour)`, value: beam.cciDb, unit: 'dB' });
  lines.push({ section: 'Interference', label: 'C/ASI adjacent systems', value: pl.casiDb, unit: 'dB' });
  lines.push({ section: 'Interference', label: 'C/XPI (antenna ∥ rain XPD)', value: xpiP, unit: 'dB', note: `rain XPD ${atmP.xpd.toFixed(1)} dB` });
  if (fwd) lines.push({ section: 'Interference', label: 'C/IM satellite HPA', value: pl.forward.cimDb, unit: 'dB' });
  lines.push({ section: 'Interference', label: `${fwd ? 'Feeder uplink' : 'Feeder downlink'} C/N (gateway)`, value: feeder, unit: 'dB' });

  const totClear = combineCN(esClear, ciClear, pl.architecture === 'bent-pipe' ? feeder : Infinity);
  const totP = combineCN(esP, ciP, pl.architecture === 'bent-pipe' ? feeder : Infinity);
  // Regenerative payloads decode on board: end-to-end limited by the weaker hop.
  const e2eClear = pl.architecture === 'regenerative' ? Math.min(totClear, feeder) : totClear;
  const e2eP = pl.architecture === 'regenerative' ? Math.min(totP, feeder) : totP;

  const margin = s.acmMarginDb + t.implMarginDb;
  const mcClear = selectModcod(e2eClear, margin);
  const mcP = selectModcod(e2eP, margin);
  lines.push({ section: 'Performance', label: 'Es/(N0+I0) end-to-end, clear sky', value: e2eClear, unit: 'dB', key: true });
  lines.push({ section: 'Performance', label: `Es/(N0+I0) end-to-end @ ${(100 - p).toFixed(2)}%`, value: e2eP, unit: 'dB', key: true });
  lines.push({ section: 'Performance', label: 'ACM + implementation margin', value: margin, unit: 'dB' });
  lines.push({ section: 'Performance', label: 'MODCOD clear sky', value: mcClear.modcod?.name ?? 'OUTAGE', unit: '' });
  lines.push({ section: 'Performance', label: `MODCOD @ ${(100 - p).toFixed(2)}%`, value: mcP.modcod?.name ?? 'OUTAGE', unit: '' });
  const thrClear = (Rs * mcClear.efficiency) / 1e6, thrP = (Rs * mcP.efficiency) / 1e6;
  lines.push({ section: 'Performance', label: 'Throughput per carrier, clear sky', value: thrClear, unit: 'Mbps', key: true });
  lines.push({ section: 'Performance', label: `Throughput @ ${(100 - p).toFixed(2)}%`, value: thrP, unit: 'Mbps', key: true });

  // Availability: exceedance at which the link can just close the lowest MODCOD
  const req = MODCODS[0].esn0 + margin;
  const totAt = (pp: number) => {
    const A = atmosphericAttenuation({ ...atmBase, pPct: pp });
    const es = hop(A.total) - db(Rs);
    const ci = combineCN(beam.cciDb, pl.casiDb, combineCN(xpiAnt, A.xpd), cim);
    const tt = combineCN(es, ci, pl.architecture === 'bent-pipe' ? feeder : Infinity);
    return pl.architecture === 'regenerative' ? Math.min(tt, feeder) : tt;
  };
  let avail: number;
  if (x.fast) avail = NaN;
  else if (totAt(50) < req) avail = 0;
  else if (totAt(0.001) >= req) avail = 99.999;
  else {
    let lo = Math.log10(0.001), hi = Math.log10(50);
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (totAt(10 ** m) < req) lo = m; else hi = m; }
    avail = 100 - 10 ** hi;
  }
  lines.push({ section: 'Performance', label: 'Link margin vs lowest MODCOD (clear)', value: e2eClear - req, unit: 'dB' });
  lines.push({ section: 'Performance', label: 'Predicted availability (lowest MODCOD)', value: avail, unit: '%', key: true });

  const pfd = fwd ? eirp - db(4 * Math.PI * (look.range * 1000) ** 2) - db(pd.bandwidthMHz * 1e6 / 4000) : NaN;
  if (fwd) lines.push({ section: 'Performance', label: 'PFD at ground', value: pfd, unit: 'dBW/m²/4kHz' });

  return {
    direction: dir, feasible: true, freqGHz: f, symbolRateMsps: Rs / 1e6, eirpDbw: eirp, gtDbK: gt, fsplDb: fspl, atmClear, atmP,
    cn0ClearDbHz: cn0Clear, cn0PDbHz: cn0P, esn0LinkClear: esClear, esn0LinkP: esP, cOverIDb: ciP, esn0TotalClear: e2eClear, esn0TotalP: e2eP,
    modcodClear: mcClear.modcod, modcodP: mcP.modcod, throughputClearMbps: thrClear, throughputPMbps: thrP, marginClearDb: e2eClear - req,
    availabilityPct: avail, pfdDbWm2_4k: pfd, lines,
  };
}
