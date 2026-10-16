/** ITU-R P.838-3: specific attenuation model for rain. */
const KH = { a: [-5.3398, -0.35351, -0.23789, -0.94158], b: [-0.10008, 1.2697, 0.86036, 0.64552], c: [1.13098, 0.454, 0.15354, 0.16817], m: -0.18961, k: 0.71147 };
const KV = { a: [-3.80595, -3.44965, -0.39902, 0.50167], b: [0.56934, -0.22911, 0.73042, 1.07319], c: [0.81061, 0.51059, 0.11899, 0.27195], m: -0.16398, k: 0.63297 };
const AH = { a: [-0.14318, 0.29591, 0.32177, -5.3761, 16.1721], b: [1.82442, 0.77564, 0.63773, -0.9623, -3.2998], c: [-0.55187, 0.19822, 0.13164, 1.47828, 3.4399], m: 0.67849, k: -1.95537 };
const AV = { a: [-0.07771, 0.56727, -0.20238, -48.2991, 48.5833], b: [2.3384, 0.95545, 1.1452, 0.791669, 0.791459], c: [-0.76284, 0.54039, 0.26809, 0.116226, 0.116479], m: -0.053739, k: 0.83433 };

type Coef = typeof KH;
const gauss = (c: Coef, lf: number) =>
  c.a.reduce((s, a, j) => s + a * Math.exp(-(((lf - c.b[j]) / c.c[j]) ** 2)), 0);

export function rainCoefficients(fGHz: number, elDeg: number, tauDeg: number): { k: number; alpha: number } {
  const lf = Math.log10(fGHz);
  const kH = Math.pow(10, gauss(KH, lf) + KH.m * lf + KH.k);
  const kV = Math.pow(10, gauss(KV, lf) + KV.m * lf + KV.k);
  const aH = gauss(AH, lf) + AH.m * lf + AH.k;
  const aV = gauss(AV, lf) + AV.m * lf + AV.k;
  const el = (elDeg * Math.PI) / 180, tau = (tauDeg * Math.PI) / 180;
  const cc = Math.cos(el) ** 2 * Math.cos(2 * tau);
  const k = (kH + kV + (kH - kV) * cc) / 2;
  const alpha = (kH * aH + kV * aV + (kH * aH - kV * aV) * cc) / (2 * k);
  return { k, alpha };
}

/** Specific attenuation γR [dB/km] for rain rate R [mm/h]. */
export function rainSpecificAttenuation(R: number, fGHz: number, elDeg: number, tauDeg: number): number {
  const { k, alpha } = rainCoefficients(fGHz, elDeg, tauDeg);
  return k * Math.pow(R, alpha);
}

/** Polarization tilt angle τ [deg]: 0 = horizontal, 90 = vertical, 45 = circular. */
export function tauForPolarization(pol: string): number {
  if (pol === 'H') return 0;
  if (pol === 'V') return 90;
  return 45;
}
