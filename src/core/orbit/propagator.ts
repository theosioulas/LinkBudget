import { twoline2satrec, propagate, type SatRec } from 'satellite.js';
import { gmst } from '../time';
import { rotZ, type Vec3 } from '../vec';
import { keplerEci, secularRates, type KeplerElements, type SecularRates } from './kepler';
import { DEG, GEO_RADIUS, OMEGA_EARTH, RAD, R_EARTH, MU_EARTH } from '../constants';

export type PropagatorKind = 'kepler' | 'sgp4' | 'geo';

export interface GeoSlot {
  lon: number; // sub-satellite longitude [deg E]
  inc: number; // residual inclination [deg] (0 = station-kept)
  phaseDeg: number; // argument of latitude at epoch for the figure-8
  epochMs: number;
}

export interface SatelliteDef {
  id: string;
  name: string;
  constellationId: string;
  plane: number;
  slot: number;
  kind: PropagatorKind;
  el: KeplerElements; // always present (approximate for SGP4/GEO) – used for rings/geometry
  rates: SecularRates;
  satrec?: SatRec;
  geo?: GeoSlot;
}

/** Earth-fixed position [km] at UTC epoch milliseconds. */
export function satEcef(sat: SatelliteDef, ms: number): Vec3 {
  if (sat.kind === 'geo' && sat.geo) return geoEcef(sat.geo, ms);
  return rotZ(satEci(sat, ms), -gmst(ms));
}

/** Inertial position [km] (TEME-like). */
export function satEci(sat: SatelliteDef, ms: number): Vec3 {
  if (sat.kind === 'sgp4' && sat.satrec) {
    const pv = propagate(sat.satrec, new Date(ms));
    const p = pv && pv.position;
    if (p && typeof p === 'object') return [p.x, p.y, p.z];
    return keplerEci(sat.el, ms, sat.rates);
  }
  if (sat.kind === 'geo' && sat.geo) return rotZ(geoEcef(sat.geo, ms), gmst(ms));
  return keplerEci(sat.el, ms, sat.rates);
}

/** Station-kept GEO with optional inclination -> classic figure-8 ground track. */
export function geoEcef(g: GeoSlot, ms: number): Vec3 {
  const u = g.phaseDeg * DEG + OMEGA_EARTH * ((ms - g.epochMs) / 1000);
  const i = g.inc * DEG;
  const lat = Math.asin(Math.sin(i) * Math.sin(u));
  const dLon = Math.atan2(Math.cos(i) * Math.sin(u), Math.cos(u)) - u;
  const lon = g.lon * DEG + dLon;
  const r = GEO_RADIUS;
  return [r * Math.cos(lat) * Math.cos(lon), r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat)];
}

export function makeKeplerSat(
  id: string, name: string, constellationId: string, el: KeplerElements, plane = 0, slot = 0,
): SatelliteDef {
  return { id, name, constellationId, plane, slot, kind: 'kepler', el, rates: secularRates(el) };
}

export function makeGeoSat(id: string, name: string, constellationId: string, geo: GeoSlot): SatelliteDef {
  // Equivalent inertial elements so orbit rings can be drawn.
  const theta = geo.lon * DEG + gmst(geo.epochMs);
  const el: KeplerElements = {
    a: GEO_RADIUS, e: 0, i: geo.inc, raan: (theta - geo.phaseDeg * DEG) * RAD, argp: 0, M0: geo.phaseDeg, epochMs: geo.epochMs,
  };
  return { id, name, constellationId, plane: 0, slot: 0, kind: 'geo', el, rates: secularRates(el, false), geo };
}

export interface ParsedTle { name: string; l1: string; l2: string }

export function parseTleText(text: string): ParsedTle[] {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim().length > 0);
  const out: ParsedTle[] = [];
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k];
    if (l.startsWith('1 ') && lines[k + 1]?.startsWith('2 ')) {
      out.push({ name: `SAT ${l.slice(2, 7).trim()}`, l1: l, l2: lines[k + 1] });
      k++;
    } else if (lines[k + 1]?.startsWith('1 ') && lines[k + 2]?.startsWith('2 ')) {
      out.push({ name: l.replace(/^0 /, '').trim(), l1: lines[k + 1], l2: lines[k + 2] });
      k += 2;
    }
  }
  return out;
}

export function makeTleSat(id: string, constellationId: string, tle: ParsedTle, idx: number): SatelliteDef | null {
  try {
    const satrec = twoline2satrec(tle.l1, tle.l2);
    if (!satrec || satrec.error) return null;
    const n = satrec.no / 60; // rad/s (Kozai-corrected mean motion from SGP4 init)
    const a = Math.cbrt(MU_EARTH / (n * n));
    const epochMs = (satrec.jdsatepoch - 2_440_587.5) * 86_400_000;
    const el: KeplerElements = {
      a, e: satrec.ecco, i: satrec.inclo * RAD, raan: satrec.nodeo * RAD, argp: satrec.argpo * RAD, M0: satrec.mo * RAD, epochMs,
    };
    return {
      id, name: tle.name, constellationId, plane: 0, slot: idx, kind: 'sgp4', el, rates: secularRates(el), satrec,
    };
  } catch {
    return null;
  }
}

export const altitudeKm = (el: KeplerElements) => el.a - R_EARTH;
