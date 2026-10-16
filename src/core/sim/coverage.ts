/**
 * Service-area coverage map: evaluates the full link budget from one
 * satellite to a grid of virtual terminals (same terminal model, moved to
 * each grid point) and reports a chosen metric per cell.
 */
import type { Payload, Terminal, AnalysisSettings, OrbitClass } from '../model';
import type { SatelliteDef } from '../orbit/propagator';
import { satEcef } from '../orbit/propagator';
import { lookAngles, ecefToGeodetic } from '../geo/coords';
import { evaluateBeam, beamFootprints, coverageRing } from '../rf/beams';
import { computeLink } from '../rf/linkbudget';
import { siteClimate } from '../itu/atmosphere';
import { sub } from '../vec';

export type CoverageMetric = 'eirp' | 'esn0Fwd' | 'thrFwd' | 'cci' | 'availFwd' | 'esn0Rtn' | 'thrRtn' | 'elevation';

export const METRICS: Record<CoverageMetric, { label: string; unit: string }> = {
  eirp: { label: 'EIRP toward ground', unit: 'dBW' },
  esn0Fwd: { label: 'Forward Es/(N0+I0), clear', unit: 'dB' },
  thrFwd: { label: 'Forward throughput, clear', unit: 'Mbps' },
  cci: { label: 'Co-channel C/I', unit: 'dB' },
  availFwd: { label: 'Forward availability', unit: '%' },
  esn0Rtn: { label: 'Return Es/(N0+I0), clear', unit: 'dB' },
  thrRtn: { label: 'Return throughput, clear', unit: 'Mbps' },
  elevation: { label: 'Elevation angle', unit: '°' },
};

export interface CoverageCell { lat: number; lon: number; value: number }
export interface CoverageResult {
  metric: CoverageMetric;
  stepDeg: number;
  cells: CoverageCell[];
  min: number;
  max: number;
  satName: string;
  timeMs: number;
  bounds: { south: number; north: number; west: number; east: number };
}

export function coverageBounds(sat: SatelliteDef, payload: Payload, ms: number, terminal: Terminal) {
  const pos = satEcef(sat, ms);
  const vel = sub(satEcef(sat, ms + 500), satEcef(sat, ms - 500));
  let rings: [number, number][][];
  if (payload.layout.kind === 'hex-grid' || payload.layout.kind === 'spot' || payload.layout.kind === 'kml' || payload.layout.kind === 'fixed-strips') {
    rings = beamFootprints(payload, { ecef: pos, velEcef: vel }, { lat: terminal.lat, lon: terminal.lon, alt: 0 }).map((f) => f.ring);
  } else {
    rings = [coverageRing(pos, Math.max(payload.minElevationDeg, 5), 72)];
  }
  const pts = rings.flat();
  const sub0 = ecefToGeodetic(pos);
  // unwrap longitudes around the sub-satellite point
  const lons = pts.map(([, lo]) => { let d = lo - sub0.lon; while (d > 180) d -= 360; while (d < -180) d += 360; return sub0.lon + d; });
  const lats = pts.map(([la]) => la);
  const pad = payload.layout.kind === 'hex-grid' || payload.layout.kind === 'spot' ? 1.5 : 0.5;
  return {
    south: Math.max(-85, Math.min(...lats) - pad), north: Math.min(85, Math.max(...lats) + pad),
    west: Math.min(...lons) - pad, east: Math.max(...lons) + pad,
  };
}

export function computeCoverage(
  sat: SatelliteDef, ms: number, payload: Payload, orbitClass: OrbitClass, terminal: Terminal, settings: AnalysisSettings,
  metric: CoverageMetric, stepDeg: number, maxCells = 12000,
): CoverageResult {
  const b = coverageBounds(sat, payload, ms, terminal);
  let step = stepDeg;
  const count = () => Math.ceil((b.north - b.south) / step) * Math.ceil((b.east - b.west) / step);
  while (count() > maxCells) step *= 1.25;
  const pos = satEcef(sat, ms);
  const prev = satEcef(sat, ms - 500), next = satEcef(sat, ms + 500);
  const vel = sub(next, prev);
  const cells: CoverageCell[] = [];
  let min = Infinity, max = -Infinity;
  for (let lat = b.south + step / 2; lat < b.north; lat += step) {
    for (let lon0 = b.west + step / 2; lon0 < b.east; lon0 += step) {
      const lon = ((lon0 + 540) % 360) - 180;
      const obs = { lat, lon, alt: 0 };
      const look = lookAngles(obs, pos);
      if (look.el < Math.max(payload.minElevationDeg, 0)) continue;
      const beam = evaluateBeam(payload, { ecef: pos, velEcef: vel }, obs);
      if (!beam.covered) continue;
      let value: number;
      if (metric === 'elevation') value = look.el;
      else if (metric === 'cci') value = Math.min(beam.cciDb, 40);
      else {
        const t: Terminal = { ...terminal, lat, lon, altM: 0 };
        const rP = lookAngles(obs, prev).range, rN = lookAngles(obs, next).range;
        const L = computeLink({
          payload, orbitClass, terminal: t, climate: siteClimate(lat, lon), settings, satEcef: pos, look, rangeRateKmS: rN - rP, beam,
          fast: metric !== 'availFwd',
        });
        const f = L.forward, r = L.ret;
        value = metric === 'eirp' ? f.eirpDbw : metric === 'esn0Fwd' ? f.esn0TotalClear : metric === 'thrFwd' ? f.throughputClearMbps
          : metric === 'availFwd' ? f.availabilityPct : metric === 'esn0Rtn' ? r.esn0TotalClear : r.throughputClearMbps;
        if (!f.feasible && metric !== 'esn0Rtn' && metric !== 'thrRtn') continue;
      }
      if (!Number.isFinite(value)) continue;
      cells.push({ lat, lon, value });
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  return { metric, stepDeg: step, cells, min, max, satName: sat.name, timeMs: ms, bounds: b };
}

/** Perceptually ordered sequential ramp (viridis-like), t in [0,1] → css rgb. */
export function rampColor(t: number): [number, number, number] {
  const stops: [number, number, number][] = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
  return [0, 1, 2].map((k) => Math.round(stops[i][k] + (stops[i + 1][k] - stops[i][k]) * f)) as [number, number, number];
}
