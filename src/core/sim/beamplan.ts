/**
 * Dual-beam plan: what each terminal beam may track, how it picks satellites, and which beam carries
 * the traffic. Resolves the per-beam settings (MbbSettings.beamCfg) with the scenario-wide defaults
 * and the older plan formats ('geo-leo-dual', beamAssign) so saved scenarios keep working.
 */
import type { MbbSettings, OrbitClass, BeamCfg } from '../model';

export type BeamName = 'A' | 'B';
export type TrafficMode = 'best' | 'A' | 'B' | 'bonded';

/**
 * on: beam in use · systems: constellations it may track (empty = any in the scenario) ·
 * satId: pin to one satellite (null = automatic) · policy / elevations: how it picks and when it hands over.
 */
export type BeamConfig = BeamCfg;

/** True when each beam has its own systems (as opposed to one shared make-before-break pool). */
export const isDedicated = (s: MbbSettings) => s.orbitPolicy === 'dedicated' || s.orbitPolicy === 'geo-leo-dual';

export function trafficMode(s: MbbSettings): TrafficMode {
  return s.traffic ?? (s.orbitPolicy === 'geo-leo-dual' ? 'B' : 'best');
}

export function resolveBeams(s: MbbSettings, orbitOf: (constId: string) => OrbitClass, enabledIds: string[]): Record<BeamName, BeamConfig> {
  const base = (b: BeamName): BeamConfig => {
    let systems: string[] = [];
    if (s.orbitPolicy === 'geo-leo-dual') systems = enabledIds.filter((id) => (orbitOf(id) === 'LEO') === (b === 'B'));
    else if (s.beamAssign) systems = s.beamAssign[b];
    return {
      on: true, systems, satId: null,
      policy: s.orbitPolicy === 'geo-leo-dual' && b === 'A' ? 'best-sinr' : s.policy,
      minElevationDeg: s.minElevationDeg, handoverElevationDeg: s.handoverElevationDeg,
    };
  };
  const merge = (b: BeamName): BeamConfig => ({ ...base(b), ...(s.beamCfg?.[b] ?? {}) });
  return { A: merge('A'), B: merge('B') };
}
