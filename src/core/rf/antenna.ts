import type { BeamPattern } from '../model';
import { DEG, RAD } from '../constants';
import { wavelength } from '../units';

/** Bessel J1 (Numerical Recipes rational approximation). */
export function besselJ1(x: number): number {
  const ax = Math.abs(x);
  if (ax < 8.0) {
    const y = x * x;
    const a1 = x * (72362614232.0 + y * (-7895059235.0 + y * (242396853.1 + y * (-2972611.439 + y * (15704.4826 + y * -30.16036606)))));
    const a2 = 144725228442.0 + y * (2300535178.0 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y))));
    return a1 / a2;
  }
  const z = 8.0 / ax, y = z * z, xx = ax - 2.356194491;
  const p1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)));
  const p2 = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
  const ans = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * p1 - z * Math.sin(xx) * p2);
  return x < 0 ? -ans : ans;
}

/** Relative gain [dB ≤ 0] at off-axis angle θ for a beam pattern (no scan effects). */
export function relativeGainDb(p: BeamPattern, thetaDeg: number, hpbwDeg = p.hpbwDeg): number {
  const t = Math.abs(thetaDeg);
  const floor = p.sidelobeDb - 15; // far-out sidelobe floor
  switch (p.kind) {
    case 'gaussian': {
      return Math.max(-12 * (t / hpbwDeg) ** 2, floor);
    }
    case 's672': {
      // ITU-R S.672-4 single-feed/multibeam envelope (ψ0 = half 3 dB beamwidth)
      const psi0 = hpbwDeg / 2;
      const Ls = p.sidelobeDb;
      const a = Ls <= -30 ? 3.16 : Ls <= -25 ? 2.88 : 2.58;
      const b = 6.32;
      const r = t / psi0;
      if (r <= a) return -3 * r * r;
      if (r <= b) return Ls;
      return Math.max(Ls + 20 - 25 * Math.log10(r), floor);
    }
    case 'bessel':
    case 'phased-array':
    default: {
      // Uniform circular aperture: G = (2 J1(u)/u)^2, u chosen so θ = hpbw/2 gives −3.01 dB
      const u = (1.6163 * Math.sin(t * DEG)) / Math.sin((hpbwDeg / 2) * DEG);
      if (u < 1e-6) return 0;
      const g = (2 * besselJ1(u)) / u;
      const v = 10 * Math.log10(Math.max(g * g, 1e-12));
      // Enforce sidelobe envelope (taper) beyond the first null
      if (u > 3.8317) return Math.max(Math.min(v, p.sidelobeDb - 10 * Math.log10(u / 3.8317) * 2), floor);
      return Math.max(v, floor);
    }
  }
}

/**
 * Gain change for an electronically steered array scanned by `scanDeg`:
 * loss = 10·n·log10(cos θ) and beam broadening hpbw/cos θ.
 */
export function scanEffects(p: BeamPattern, scanDeg: number): { lossDb: number; hpbwDeg: number } {
  if (p.kind !== 'phased-array') return { lossDb: 0, hpbwDeg: p.hpbwDeg };
  const c = Math.max(Math.cos(Math.min(scanDeg, 89) * DEG), 0.02);
  return { lossDb: 10 * p.scanLossExp * Math.log10(c), hpbwDeg: p.hpbwDeg / c };
}

/** Peak gain of a circular aperture [dBi]. */
export const apertureGainDbi = (dM: number, fGHz: number, eff = 0.65) =>
  10 * Math.log10(eff * (Math.PI * dM / wavelength(fGHz)) ** 2);

/** Approx. 3 dB beamwidth of an aperture [deg]. */
export const apertureHpbwDeg = (dM: number, fGHz: number, k = 70) => (k * wavelength(fGHz)) / dM;

/** Approximate peak gain from beam solid angle (elliptical beam) [dBi]. */
export const gainFromBeamwidths = (az3dB: number, el3dB: number, eff = 0.65) =>
  10 * Math.log10((eff * 41253) / (az3dB * el3dB));

/** ITU-R S.580/S.465 earth-station off-axis gain envelope [dBi]. */
export function earthStationOffAxisDbi(thetaDeg: number): number {
  const t = Math.max(thetaDeg, 1);
  if (t < 20) return 29 - 25 * Math.log10(t);
  if (t < 26.3) return -3.5;
  if (t < 48) return 32 - 25 * Math.log10(t);
  return -10;
}

export const toDeg = (r: number) => r * RAD;
