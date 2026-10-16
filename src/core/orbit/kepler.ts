import { MU_EARTH, R_EARTH, J2, DEG, RAD, TWO_PI } from '../constants';
import type { Vec3 } from '../vec';

/** Classical mean orbital elements (angles in degrees, a in km). */
export interface KeplerElements {
  a: number;
  e: number;
  i: number;
  raan: number;
  argp: number;
  M0: number;
  epochMs: number;
}

export interface SecularRates { dRaan: number; dArgp: number; n: number } // rad/s

/** Mean motion & J2 secular drift rates (rad/s). */
export function secularRates(el: KeplerElements, useJ2 = true): SecularRates {
  const n0 = Math.sqrt(MU_EARTH / el.a ** 3);
  if (!useJ2) return { dRaan: 0, dArgp: 0, n: n0 };
  const p = el.a * (1 - el.e * el.e);
  const k = J2 * (R_EARTH / p) ** 2;
  const ci = Math.cos(el.i * DEG);
  const eta = Math.sqrt(1 - el.e * el.e);
  return {
    dRaan: -1.5 * n0 * k * ci,
    dArgp: 0.75 * n0 * k * (5 * ci * ci - 1),
    n: n0 * (1 + 0.75 * k * eta * (3 * ci * ci - 1)),
  };
}

export function solveKepler(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI;
  for (let k = 0; k < 12; k++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  return E;
}

/** Position in the (pseudo-)inertial frame [km] at time ms, two-body + J2 secular. */
export function keplerEci(el: KeplerElements, ms: number, rates?: SecularRates): Vec3 {
  const r = rates ?? secularRates(el);
  const dt = (ms - el.epochMs) / 1000;
  const raan = el.raan * DEG + r.dRaan * dt;
  const argp = el.argp * DEG + r.dArgp * dt;
  let M = (el.M0 * DEG + r.n * dt) % TWO_PI;
  if (M < 0) M += TWO_PI;
  let xo: number, yo: number;
  if (el.e < 1e-9) {
    xo = el.a * Math.cos(M);
    yo = el.a * Math.sin(M);
  } else {
    const E = solveKepler(M, el.e);
    xo = el.a * (Math.cos(E) - el.e);
    yo = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  }
  return perifocalToEci(xo, yo, raan, argp, el.i * DEG);
}

export function perifocalToEci(xo: number, yo: number, raan: number, argp: number, inc: number): Vec3 {
  const cO = Math.cos(raan), sO = Math.sin(raan);
  const cw = Math.cos(argp), sw = Math.sin(argp);
  const ci = Math.cos(inc), si = Math.sin(inc);
  const x = (cO * cw - sO * sw * ci) * xo + (-cO * sw - sO * cw * ci) * yo;
  const y = (sO * cw + cO * sw * ci) * xo + (-sO * sw + cO * cw * ci) * yo;
  const z = sw * si * xo + cw * si * yo;
  return [x, y, z];
}

/** Sample the orbit ellipse (inertial frame) at time ms — used for orbit ring rendering. */
export function orbitRing(el: KeplerElements, ms: number, samples = 128): Vec3[] {
  const r = secularRates(el);
  const dt = (ms - el.epochMs) / 1000;
  const raan = el.raan * DEG + r.dRaan * dt;
  const argp = el.argp * DEG + r.dArgp * dt;
  const pts: Vec3[] = [];
  for (let k = 0; k <= samples; k++) {
    const E = (k / samples) * TWO_PI;
    const xo = el.a * (Math.cos(E) - el.e);
    const yo = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
    pts.push(perifocalToEci(xo, yo, raan, argp, el.i * DEG));
  }
  return pts;
}

export const periodSec = (aKm: number) => TWO_PI * Math.sqrt(aKm ** 3 / MU_EARTH);
export const altitudeToA = (altKm: number) => altKm + R_EARTH;
export const radToDeg = (x: number) => x * RAD;
