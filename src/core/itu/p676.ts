/**
 * ITU-R P.676-10 Annex 2 — approximate estimation of gaseous attenuation
 * (valid 1–350 GHz, elevation 5–90°), with the zenith water-vapour method.
 */
export function gammaWater(f: number, P: number, rho: number, T: number): number {
  const rp = P / 1013, rt = 288 / T;
  const eta1 = 0.955 * rp * rt ** 0.68 + 0.006 * rho;
  const eta2 = 0.735 * rp * rt ** 0.5 + 0.0353 * rt ** 4 * rho;
  const g = (fi: number) => 1 + ((f - fi) / (f + fi)) ** 2;
  const s =
    ((3.98 * eta1 * Math.exp(2.23 * (1 - rt))) / ((f - 22.235) ** 2 + 9.42 * eta1 ** 2)) * g(22.0) +
    (11.96 * eta1 * Math.exp(0.7 * (1 - rt))) / ((f - 183.31) ** 2 + 11.14 * eta1 ** 2) +
    (0.081 * eta1 * Math.exp(6.44 * (1 - rt))) / ((f - 321.226) ** 2 + 6.29 * eta1 ** 2) +
    (3.66 * eta1 * Math.exp(1.6 * (1 - rt))) / ((f - 325.153) ** 2 + 9.22 * eta1 ** 2) +
    (25.37 * eta1 * Math.exp(1.09 * (1 - rt))) / (f - 380.0) ** 2 +
    (17.4 * eta1 * Math.exp(1.46 * (1 - rt))) / (f - 448.0) ** 2 +
    ((844.6 * eta1 * Math.exp(0.17 * (1 - rt))) / (f - 557.0) ** 2) * g(557.0) +
    ((290.0 * eta1 * Math.exp(0.41 * (1 - rt))) / (f - 752.0) ** 2) * g(752.0) +
    ((8.3328e4 * eta2 * Math.exp(0.99 * (1 - rt))) / (f - 1780.0) ** 2) * g(1780.0);
  return s * f ** 2 * rt ** 2.5 * rho * 1e-4;
}

export function gammaOxygen(f: number, P: number, T: number): number {
  const rp = P / 1013.0, rt = 288.0 / T;
  const phi = (a: number, b: number, c: number, d: number) =>
    rp ** a * rt ** b * Math.exp(c * (1 - rp) + d * (1 - rt));
  const delta = -0.00306 * phi(3.211, -14.94, 1.583, -16.37);
  const xi1 = phi(0.0717, -1.8132, 0.0156, -1.6515);
  const xi2 = phi(0.5146, -4.6368, -0.1921, -5.7416);
  const xi3 = phi(0.3414, -6.5851, 0.213, -8.5854);
  const xi4 = phi(-0.0112, 0.0092, -0.1033, -0.0009);
  const xi5 = phi(0.2705, -2.7192, -0.3016, -4.1033);
  const xi6 = phi(0.2445, -5.9191, 0.0422, -8.0719);
  const xi7 = phi(-0.1833, 6.5589, -0.2402, 6.131);
  const g54 = 2.192 * phi(1.8286, -1.9487, 0.4051, -2.8509);
  const g58 = 12.59 * phi(1.0045, 3.561, 0.1588, 1.2834);
  const g60 = 15.0 * phi(0.9003, 4.1335, 0.0427, 1.6088);
  const g62 = 14.28 * phi(0.9886, 3.4176, 0.1827, 1.3429);
  const g64 = 6.819 * phi(1.432, 0.6258, 0.3177, -0.5914);
  const g66 = 1.908 * phi(2.0717, -4.1404, 0.491, -4.8718);
  if (f <= 54)
    return ((7.2 * rt ** 2.8) / (f ** 2 + 0.34 * rp ** 2 * rt ** 1.6) + (0.62 * xi3) / ((54 - f) ** (1.16 * xi1) + 0.83 * xi2)) * f ** 2 * rp ** 2 * 1e-3;
  if (f <= 60)
    return Math.exp((Math.log(g54) / 24) * (f - 58) * (f - 60) - (Math.log(g58) / 8) * (f - 54) * (f - 60) + (Math.log(g60) / 12) * (f - 54) * (f - 58));
  if (f <= 62) return g60 + ((g62 - g60) * (f - 60)) / 2;
  if (f <= 66)
    return Math.exp((Math.log(g62) / 8) * (f - 64) * (f - 66) - (Math.log(g64) / 4) * (f - 62) * (f - 66) + (Math.log(g66) / 8) * (f - 62) * (f - 64));
  if (f <= 120)
    return (3.02e-4 * rt ** 3.5 + (0.283 * rt ** 3.8) / ((f - 118.75) ** 2 + 2.91 * rp ** 2 * rt ** 1.6) + (0.502 * xi6 * (1 - 0.0163 * xi7 * (f - 66))) / ((f - 66) ** (1.4346 * xi4) + 1.15 * xi5)) * f ** 2 * rp ** 2 * 1e-3;
  return ((3.02e-4 / (1 + 1.9e-5 * f ** 1.5) + (0.283 * rt ** 0.3) / ((f - 118.75) ** 2 + 2.91 * rp ** 2 * rt ** 1.6)) * f ** 2 * rp ** 2 * rt ** 3.5 * 1e-3 + delta);
}

/** Equivalent heights (km) for oxygen and water vapour. */
export function equivalentHeights(f: number, P: number): { h0: number; hw: number } {
  const rp = P / 1013.0;
  const t1 = (4.64 / (1 + 0.066 * rp ** -2.3)) * Math.exp(-(((f - 59.7) / (2.87 + 12.4 * Math.exp(-7.9 * rp))) ** 2));
  const t2 = (0.14 * Math.exp(2.21 * rp)) / ((f - 118.75) ** 2 + 0.031 * Math.exp(2.2 * rp));
  const t3 = ((0.0114 / (1 + 0.14 * rp ** -2.6)) * f * (-0.0247 + 0.0001 * f + 1.61e-6 * f ** 2)) / (1 - 0.0169 * f + 4.1e-5 * f ** 2 + 3.2e-7 * f ** 3);
  let h0 = (6.1 / (1 + 0.17 * rp ** -1.1)) * (1 + t1 + t2 + t3);
  if (f < 70) h0 = Math.min(h0, 10.7 * rp ** 0.3);
  const sw = 1.013 / (1 + Math.exp(-8.6 * (rp - 0.57)));
  const hw = 1.66 * (1 + (1.39 * sw) / ((f - 22.235) ** 2 + 2.56 * sw) + (3.37 * sw) / ((f - 183.31) ** 2 + 4.69 * sw) + (1.58 * sw) / ((f - 325.1) ** 2 + 2.89 * sw));
  return { h0, hw };
}

/** Zenith water-vapour attenuation from total columnar content V [kg/m²]. */
export function zenithWaterAttenuation(f: number, V: number): number {
  const fRef = 20.6, pRef = 780, rhoRef = V / 4, tRef = 14 * Math.log((0.22 * V) / 4) + 3 + 273;
  return (0.0173 * V * gammaWater(f, pRef, rhoRef, tRef)) / gammaWater(fRef, pRef, rhoRef, tRef);
}

/**
 * Slant-path gaseous attenuation [dB].
 * @param rho surface water-vapour density [g/m³]; V total columnar vapour [kg/m²] (optional)
 */
export function gaseousAttenuationSlant(f: number, elDeg: number, rho: number, P = 1013.25, T = 288.15, V?: number): number {
  const el = Math.max(elDeg, 5);
  const g0 = gammaOxygen(f, P, T);
  const gw = gammaWater(f, P, rho, T);
  const e = (rho * T) / 216.7;
  const { h0, hw } = equivalentHeights(f, P + e);
  const Aw = V !== undefined && V > 0 ? zenithWaterAttenuation(f, V) : gw * hw;
  return (g0 * h0 + Aw) / Math.sin((el * Math.PI) / 180);
}
