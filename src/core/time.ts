import { TWO_PI, DEG } from './constants';

/** Julian date from JS epoch milliseconds (UTC). */
export const julianDate = (ms: number) => ms / 86_400_000 + 2_440_587.5;

/** Greenwich mean sidereal time [rad] (IAU 1982, as used with SGP4/TEME). */
export function gmst(ms: number): number {
  const tut1 = (julianDate(ms) - 2_451_545.0) / 36_525.0;
  let temp =
    -6.2e-6 * tut1 * tut1 * tut1 +
    0.093104 * tut1 * tut1 +
    (876_600.0 * 3600 + 8_640_184.812866) * tut1 +
    67_310.54841;
  temp = ((temp * DEG) / 240.0) % TWO_PI;
  if (temp < 0) temp += TWO_PI;
  return temp;
}

/** Approximate Sun direction (unit vector, ECI) — Astronomical Almanac low precision. */
export function sunEci(ms: number): [number, number, number] {
  const n = julianDate(ms) - 2_451_545.0;
  const L = (280.46 + 0.9856474 * n) * DEG;
  const g = (357.528 + 0.9856003 * n) * DEG;
  const lambda = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const eps = (23.439 - 0.0000004 * n) * DEG;
  return [Math.cos(lambda), Math.cos(eps) * Math.sin(lambda), Math.sin(eps) * Math.sin(lambda)];
}
