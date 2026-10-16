/** ITU-R P.840 cloud/fog attenuation (Rayleigh, double-Debye water permittivity). */
export function cloudSpecificCoefficient(f: number, Tc = 0): number {
  const theta = 300 / (Tc + 273.15);
  const e0 = 77.66 + 103.3 * (theta - 1), e1 = 0.0671 * e0, e2 = 3.52;
  const fp = 20.2 - 146 * (theta - 1) + 316 * (theta - 1) ** 2, fs = 39.8 * fp;
  const ep = (e0 - e1) / (1 + (f / fp) ** 2) + (e1 - e2) / (1 + (f / fs) ** 2) + e2;
  const epp = (f * (e0 - e1)) / (fp * (1 + (f / fp) ** 2)) + (f * (e1 - e2)) / (fs * (1 + (f / fs) ** 2));
  const eta = (2 + ep) / epp;
  return (0.819 * f) / (epp * (1 + eta ** 2)); // (dB/km)/(g/m³)
}

/** Cloud attenuation [dB] for reduced columnar liquid water Lred [kg/m²]. */
export function cloudAttenuation(f: number, elDeg: number, Lred: number): number {
  return (Lred * cloudSpecificCoefficient(f, 0)) / Math.sin((Math.max(elDeg, 5) * Math.PI) / 180);
}
