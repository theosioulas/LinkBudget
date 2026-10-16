import { isObstructed, type Constellation, type Payload, type Terminal, type AnalysisSettings, type OrbitClass } from '../model';
import { walkerElements } from '../orbit/walker';
import { makeKeplerSat, makeGeoSat, makeTleSat, parseTleText, satEcef, type SatelliteDef } from '../orbit/propagator';
import { lookAngles, geodeticToEcef, type LatLonAlt } from '../geo/coords';
import { evaluateBeam } from '../rf/beams';
import { computeLink, terminalScanDeg, type LinkResult } from '../rf/linkbudget';
import { siteClimate, type SiteClimate } from '../itu/atmosphere';
import { type Vec3, sub, scale, norm } from '../vec';

/** Expand constellation definitions into individual satellites. */
export function buildSatellites(constellations: Constellation[], epochMs: number): SatelliteDef[] {
  const out: SatelliteDef[] = [];
  for (const c of constellations) {
    if (!c.enabled) continue;
    const src = c.source;
    if (src.kind === 'walker') {
      src.shells.forEach((shell, si) => {
        for (const w of walkerElements(shell, epochMs)) {
          const idx = `${si}-${w.plane}-${w.slot}`;
          const prefix = c.name.split(' ')[0];
          const name = src.shells.length === 1 && shell.planes === 1
            ? `${prefix} ${String(w.slot + 1).padStart(2, '0')}`
            : `${prefix}-${si + 1}.${String(w.plane + 1).padStart(2, '0')}.${String(w.slot + 1).padStart(2, '0')}`;
          out.push(makeKeplerSat(`${c.id}:${idx}`, name, c.id, w.el, w.plane + si * 1000, w.slot));
        }
      });
    } else if (src.kind === 'geo') {
      src.slots.forEach((s, k) =>
        out.push(makeGeoSat(`${c.id}:${k}`, s.name, c.id, { lon: s.lon, inc: s.inc ?? 0, phaseDeg: 0, epochMs })),
      );
    } else {
      parseTleText(src.text).forEach((t, k) => {
        const sat = makeTleSat(`${c.id}:${k}`, c.id, t, k);
        if (sat) {
          if (c.propagator !== 'sgp4') sat.kind = 'kepler';
          out.push(sat);
        }
      });
    }
  }
  return out;
}

export interface EvalContext {
  terminal: Terminal;
  settings: AnalysisSettings;
  climate: SiteClimate;
  payloadOf: (constellationId: string) => Payload | undefined;
  orbitClassOf: (constellationId: string) => OrbitClass;
  obs: LatLonAlt;
  obsEcef: Vec3;
}

export function makeEvalContext(
  terminal: Terminal, settings: AnalysisSettings, constellations: Constellation[], payloads: Payload[],
): EvalContext {
  const pmap = new Map(payloads.map((p) => [p.id, p]));
  const cmap = new Map(constellations.map((c) => [c.id, c]));
  const obs = { lat: terminal.lat, lon: terminal.lon, alt: terminal.altM / 1000 };
  return {
    terminal, settings, climate: siteClimate(terminal.lat, terminal.lon),
    payloadOf: (id) => pmap.get(cmap.get(id)?.payloadId ?? ''),
    orbitClassOf: (id) => cmap.get(id)?.orbitClass ?? 'LEO',
    obs, obsEcef: geodeticToEcef(obs.lat, obs.lon, obs.alt),
  };
}

/** Quick geometric visibility check (elevation + terminal scan). */
export function quickVisible(sat: SatelliteDef, ms: number, ctx: EvalContext, minEl: number) {
  const pos = satEcef(sat, ms);
  const d = sub(pos, ctx.obsEcef);
  const r = norm(d);
  const up = scale(ctx.obsEcef, 1 / norm(ctx.obsEcef));
  const sinEl = (d[0] * up[0] + d[1] * up[1] + d[2] * up[2]) / r;
  const el = (Math.asin(sinEl) * 180) / Math.PI;
  if (el < minEl) return null;
  if (ctx.terminal.obstructions?.length && isObstructed(ctx.terminal, lookAngles(ctx.obs, pos).az, el)) return null;
  const scan = terminalScanDeg(ctx.terminal, pos);
  if (ctx.terminal.type === 'phased-array' && scan > ctx.terminal.maxScanDeg) return null;
  return { pos, el, scan };
}

/** Full link evaluation of one satellite at time ms. */
export function evalSatLink(sat: SatelliteDef, ms: number, ctx: EvalContext, fast = false): LinkResult | null {
  const payload = ctx.payloadOf(sat.constellationId);
  if (!payload) return null;
  const pos = satEcef(sat, ms);
  const prev = satEcef(sat, ms - 500), next = satEcef(sat, ms + 500);
  const look = lookAngles(ctx.obs, pos);
  const rP = norm(sub(prev, ctx.obsEcef)), rN = norm(sub(next, ctx.obsEcef));
  const rangeRate = rN - rP; // km/s over 1 s
  const rangeAccel = (rN - 2 * look.range + rP) / 0.25;
  const vel = sub(next, prev);
  const beam = evaluateBeam(payload, { ecef: pos, velEcef: vel }, ctx.obs, ctx.obsEcef);
  const res = computeLink({
    payload, orbitClass: ctx.orbitClassOf(sat.constellationId), terminal: ctx.terminal, climate: ctx.climate, settings: ctx.settings,
    satEcef: pos, look, rangeRateKmS: rangeRate, rangeAccelKmS2: rangeAccel, beam, fast,
  });
  res.geometry.satAltKm = norm(pos) - 6371;
  return res;
}
