import type { KeplerElements } from './kepler';
import { R_EARTH } from '../constants';

export interface WalkerShell {
  altitudeKm: number;
  inclinationDeg: number;
  planes: number;
  satsPerPlane: number;
  phasing: number; // Walker F parameter
  pattern: 'delta' | 'star'; // star: RAAN spread over 180 deg (polar constellations)
  raan0Deg?: number;
  eccentricity?: number;
  argpDeg?: number;
}

/** Generate mean elements for a Walker Delta/Star shell. */
export function walkerElements(shell: WalkerShell, epochMs: number): { el: KeplerElements; plane: number; slot: number }[] {
  const { planes: P, satsPerPlane: S, phasing: F } = shell;
  const T = P * S;
  const spread = shell.pattern === 'star' ? 180 : 360;
  const out: { el: KeplerElements; plane: number; slot: number }[] = [];
  for (let j = 0; j < P; j++) {
    for (let k = 0; k < S; k++) {
      out.push({
        plane: j,
        slot: k,
        el: {
          a: R_EARTH + shell.altitudeKm,
          e: shell.eccentricity ?? 0,
          i: shell.inclinationDeg,
          raan: ((shell.raan0Deg ?? 0) + (j * spread) / P) % 360,
          argp: shell.argpDeg ?? 0,
          M0: ((k * 360) / S + (j * F * 360) / T) % 360,
          epochMs,
        },
      });
    }
  }
  return out;
}
