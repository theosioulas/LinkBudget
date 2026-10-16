import { ituGrids } from './grids';
import { gaseousAttenuationSlant } from './p676';
import { cloudAttenuation } from './p840';
import { rainAttenuation, scintillationAttenuation, rainXpd } from './p618';

/** Site climate parameters (auto from ITU maps where available, otherwise latitude fallbacks). */
export interface SiteClimate {
  R001: number; // mm/h
  hRain: number; // km (P.839: h0 + 0.36)
  rho: number; // g/m³
  V: number; // kg/m²
  Nwet: number;
  hs: number; // station altitude [km]
  lred: { p01: number; p1: number; p5: number };
  source: 'itu-maps' | 'fallback';
}

export function siteClimate(lat: number, lon: number): SiteClimate {
  const g = (n: Parameters<typeof ituGrids.get>[0]) => ituGrids.get(n);
  if (ituGrids.ready) {
    return {
      R001: g('r001')!.at(lat, lon),
      hRain: g('h0')!.at(lat, lon) + 0.36,
      rho: g('rho_50')!.at(lat, lon),
      V: g('v_50')!.at(lat, lon),
      Nwet: g('nwet_50')!.at(lat, lon),
      hs: g('topo')!.at(lat, lon),
      lred: { p01: g('lred_0.1')!.at(lat, lon), p1: g('lred_1')!.at(lat, lon), p5: g('lred_5')!.at(lat, lon) },
      source: 'itu-maps',
    };
  }
  // P.839-2 style latitude model + rough climatology.
  const a = Math.abs(lat);
  const h0 = lat > 23 ? 5 - 0.075 * (lat - 23) : lat >= -21 ? 5 : lat >= -71 ? 5 + 0.1 * (lat + 21) : 0;
  const tropical = a < 20;
  return {
    R001: tropical ? 95 : a < 35 ? 55 : a < 50 ? 32 : 22,
    hRain: Math.max(0.5, h0 + 0.36),
    rho: tropical ? 19 : a < 45 ? 10 : 6,
    V: tropical ? 45 : a < 45 ? 22 : 12,
    Nwet: tropical ? 110 : a < 45 ? 60 : 35,
    hs: 0,
    lred: { p01: 1.4, p1: 0.8, p5: 0.4 },
    source: 'fallback',
  };
}

export interface AtmosInputs {
  lat: number;
  fGHz: number;
  elDeg: number;
  pPct: number; // exceedance percentage of interest (e.g. 0.5 for 99.5% availability)
  tauDeg: number;
  antennaDiameterM: number;
  climate: SiteClimate;
  /** Optional user overrides */
  R001Override?: number;
  include?: { gas: boolean; cloud: boolean; rain: boolean; scint: boolean };
}

export interface AtmosResult {
  gas: number;
  cloud: number;
  rain: number;
  scint: number;
  total: number;
  xpd: number;
}

function lredAt(c: SiteClimate, p: number): number {
  // log-interpolate between available exceedance levels
  const pts: [number, number][] = [[0.1, c.lred.p01], [1, c.lred.p1], [5, c.lred.p5]];
  if (p <= 0.1) return pts[0][1];
  if (p >= 5) return pts[2][1];
  const i = p < 1 ? 0 : 1;
  const t = (Math.log(p) - Math.log(pts[i][0])) / (Math.log(pts[i + 1][0]) - Math.log(pts[i][0]));
  return pts[i][1] + t * (pts[i + 1][1] - pts[i][1]);
}

/** ITU-R P.618-13 §2.5 total attenuation for a slant path. */
export function atmosphericAttenuation(x: AtmosInputs): AtmosResult {
  const inc = x.include ?? { gas: true, cloud: true, rain: true, scint: true };
  const c = x.climate;
  const el = Math.max(x.elDeg, 2);
  const pc = Math.max(x.pPct, 1); // for p < 1%, gas & cloud are evaluated at 1%
  const gas = inc.gas ? gaseousAttenuationSlant(x.fGHz, el, c.rho, 1013.25, 288.15, c.V) : 0;
  const cloud = inc.cloud ? cloudAttenuation(x.fGHz, el, lredAt(c, pc)) : 0;
  const R001 = x.R001Override ?? c.R001;
  const rain = inc.rain
    ? rainAttenuation({ lat: x.lat, fGHz: x.fGHz, elDeg: el, hsKm: c.hs, pPct: x.pPct, R001, hRainKm: c.hRain, tauDeg: x.tauDeg })
    : 0;
  const scint = inc.scint ? scintillationAttenuation(x.fGHz, el, Math.min(x.pPct, 50), c.Nwet, x.antennaDiameterM) : 0;
  const total = gas + Math.sqrt((rain + cloud) ** 2 + scint ** 2);
  const xpd = rainXpd(rain, x.fGHz, el, Math.max(x.pPct, 0.001), x.tauDeg);
  return { gas, cloud, rain, scint, total, xpd };
}

/** Invert: find the exceedance p [%] at which total attenuation equals `marginDb` (bisection on log p). */
export function availabilityForMargin(marginDb: number, base: Omit<AtmosInputs, 'pPct'>): number {
  const A = (p: number) => atmosphericAttenuation({ ...base, pPct: p }).total;
  let lo = Math.log10(0.001), hi = Math.log10(50);
  if (A(0.001) <= marginDb) return 100 - 0.001;
  if (A(50) > marginDb) return 50;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (A(10 ** mid) > marginDb) lo = mid; else hi = mid;
  }
  return 100 - 10 ** hi;
}
