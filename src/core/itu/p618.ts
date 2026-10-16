import { rainSpecificAttenuation } from './p838';

const DEGR = Math.PI / 180;

export interface RainInputs {
  lat: number;
  fGHz: number;
  elDeg: number;
  hsKm: number; // station height above MSL
  pPct: number; // time percentage exceeded (0.001..5)
  R001: number; // rain rate exceeded 0.01% [mm/h]
  hRainKm: number; // rain height (P.839) [km]
  tauDeg: number;
}

/** ITU-R P.618-13 §2.2.1.1 long-term rain attenuation statistics. */
export function rainAttenuation(x: RainInputs): number {
  const { lat, fGHz: f, hsKm: hs, R001, hRainKm: hr, tauDeg } = x;
  const p = Math.min(Math.max(x.pPct, 0.001), 5);
  if (x.pPct > 5 || R001 <= 0 || hr - hs <= 0) return 0;
  const el = Math.max(x.elDeg, 1);
  const Re = 8500;
  const sinEl = Math.sin(el * DEGR);
  const Ls = el >= 5 ? (hr - hs) / sinEl : (2 * (hr - hs)) / (Math.sqrt(sinEl ** 2 + (2 * (hr - hs)) / Re) + sinEl);
  const Lg = Math.abs(Ls * Math.cos(el * DEGR));
  const gR = rainSpecificAttenuation(R001, f, el, tauDeg);
  const r001 = 1 / (1 + 0.78 * Math.sqrt((Lg * gR) / f) - 0.38 * (1 - Math.exp(-2 * Lg)));
  const zeta = Math.atan2(hr - hs, Lg * r001) / DEGR;
  const Lr = zeta > el ? (Lg * r001) / Math.cos(el * DEGR) : (hr - hs) / sinEl;
  const chi = Math.abs(lat) < 36 ? 36 - Math.abs(lat) : 0;
  const v001 = 1 / (1 + Math.sqrt(sinEl) * ((31 * (1 - Math.exp(-(el / (1 + chi)))) * Math.sqrt(Lr * gR)) / f ** 2 - 0.45));
  const Le = Lr * v001;
  const A001 = gR * Le;
  let beta = 0;
  if (p < 1 && Math.abs(lat) < 36) {
    beta = el > 25 ? -0.005 * (Math.abs(lat) - 36) : -0.005 * (Math.abs(lat) - 36) + 1.8 - 4.25 * sinEl;
  }
  const A = A001 * Math.pow(p / 0.01, -(0.655 + 0.033 * Math.log(p) - 0.045 * Math.log(A001) - beta * (1 - p) * sinEl));
  return Number.isFinite(A) && A > 0 ? A : 0;
}

/** ITU-R P.618-13 §2.4.1 tropospheric scintillation fade depth [dB]. */
export function scintillationAttenuation(fGHz: number, elDeg: number, pPct: number, Nwet: number, Dm: number, eta = 0.5): number {
  const el = Math.max(elDeg, 5);
  const p = Math.min(Math.max(pPct, 0.01), 50);
  const sigmaRef = 3.6e-3 + 1e-4 * Nwet;
  const hL = 1000;
  const sinEl = Math.sin(el * DEGR);
  const L = (2 * hL) / (Math.sqrt(sinEl ** 2 + 2.35e-4) + sinEl);
  const Deff = Math.sqrt(eta) * Math.max(Dm, 0.05);
  const x = (1.22 * Deff ** 2 * fGHz) / L;
  const g = x >= 7 ? 0 : Math.sqrt(Math.max(0, 3.86 * (x ** 2 + 1) ** (11 / 12) * Math.sin((11 / 6) * Math.atan2(1, x)) - 7.08 * x ** (5 / 6)));
  const sigma = (sigmaRef * fGHz ** (7 / 12) * g) / sinEl ** 1.2;
  const lp = Math.log10(p);
  const a = -0.061 * lp ** 3 + 0.072 * lp ** 2 - 1.71 * lp + 3;
  return a * sigma;
}

/** ITU-R P.618-13 §4.1 rain XPD not exceeded for p% [dB] (4–55 GHz). */
export function rainXpd(Ap: number, fGHz: number, elDeg: number, pPct: number, tauDeg: number): number {
  if (Ap <= 0.01) return 60;
  const f = Math.min(Math.max(fGHz, 6), 55);
  const Cf = f < 9 ? 60 * Math.log10(f) - 28.3 : f < 36 ? 26 * Math.log10(f) + 4.1 : 35.9 * Math.log10(f) - 11.3;
  const V = f < 9 ? 30.8 * f ** -0.21 : f < 20 ? 12.8 * f ** 0.19 : f < 40 ? 22.6 : 13.0 * f ** 0.15;
  const Ca = V * Math.log10(Ap);
  const Ctau = -10 * Math.log10(1 - 0.484 * (1 + Math.cos(4 * tauDeg * DEGR)));
  const Cth = -40 * Math.log10(Math.cos(Math.min(elDeg, 60) * DEGR));
  const Cs = pPct <= 0.001 ? 0.0053 * 225 : pPct <= 0.01 ? 0.0053 * 100 : pPct <= 0.1 ? 0.0053 * 25 : 0;
  const xr = Cf - Ca + Ctau + Cth + Cs;
  return xr - (xr * (0.3 + 0.1 * Math.log10(pPct))) / 2;
}

/** Sky/atmospheric noise temperature contribution [K] for total path loss A [dB]. */
export function skyNoiseTemp(AdB: number, Tm = 275): number {
  const l = Math.pow(10, -AdB / 10);
  return Tm * (1 - l) + 2.7 * l;
}
