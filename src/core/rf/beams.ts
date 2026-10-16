import type { Payload, KmlBeam, BeamLayout } from '../model';
import { type Vec3, sub, unit, dot, cross, add, scale, norm, angleBetween } from '../vec';
import { geodeticToEcef, ecefToGeodetic, rayEllipsoid, type LatLonAlt } from '../geo/coords';
import { toLocalKm, fromLocalKm, pointInRing, distanceToRingKm, ringAreaKm2 } from '../geo/polygon';
import { relativeGainDb, scanEffects } from './antenna';
import { DEG, RAD } from '../constants';

export interface BeamEval {
  covered: boolean;
  beamId: string;
  beamLabel: string;
  color: number;
  /** Gain toward the user relative to the payload's peak beam gain (incl. scan loss) [dB]. */
  relGainDb: number;
  /** For absolute-EIRP KML contours: EIRP toward user [dBW] (otherwise undefined). */
  absEirpDbw?: number;
  scanDeg: number;
  offAxisDeg: number;
  hpbwEffDeg: number;
  /** Aggregate intra-system co-channel C/I [dB]. */
  cciDb: number;
  coChannelBeams: number;
  aim: [number, number];
}

export interface SatPose { ecef: Vec3; velEcef: Vec3 }

const NOT_COVERED = (reason = 'none'): BeamEval => ({
  covered: false, beamId: reason, beamLabel: '—', color: 0, relGainDb: -99, scanDeg: 0, offAxisDeg: 0, hpbwEffDeg: 0, cciDb: Infinity, coChannelBeams: 0, aim: [0, 0],
});

const sumPow = (vals: number[]) => vals.reduce((s, v) => s + Math.pow(10, v / 10), 0);
const nadirAngle = (sat: Vec3, ground: Vec3) => angleBetween(scale(sat, -1), sub(ground, sat)) * RAD;

// ---------------------------------------------------------------- hex lattice helpers
const SQ3 = Math.sqrt(3);
/** Axial hex lattice (pointy-top) with centre spacing d. */
export function hexToXY(q: number, r: number, d: number): [number, number] {
  return [d * (q + r / 2), d * (SQ3 / 2) * r];
}
export function xyToHex(x: number, y: number, d: number): [number, number] {
  const r = (2 * y) / (SQ3 * d);
  const q = x / d - r / 2;
  // cube rounding
  let rx = Math.round(q), rz = Math.round(r), ry = Math.round(-q - r);
  const dx = Math.abs(rx - q), dz = Math.abs(rz - r), dy = Math.abs(ry - (-q - r));
  if (dx > dy && dx > dz) rx = -ry - rz; else if (dy <= dz) rz = -rx - ry;
  return [rx, rz];
}
export function hexColor(q: number, r: number, colors: number): number {
  const m = (a: number, n: number) => ((a % n) + n) % n;
  if (colors <= 1) return 0;
  if (colors === 2) return m(q, 2);
  if (colors === 3) return m(q - r, 3);
  if (colors === 4) return m(q, 2) + 2 * m(r, 2);
  return m(q + 3 * r, 7);
}
export function hexRing(rings: number): [number, number][] {
  const out: [number, number][] = [];
  for (let q = -rings; q <= rings; q++)
    for (let r = Math.max(-rings, -q - rings); r <= Math.min(rings, -q + rings); r++) out.push([q, r]);
  return out;
}

/** Cell lattice anchored on a whole-degree origin so it is stable as the user moves. */
export function cellFrame(lat: number, lon: number) {
  return { lat0: Math.round(lat), lon0: Math.round(lon) };
}

export function userCell(lat: number, lon: number, cellDiameterKm: number) {
  const { lat0, lon0 } = cellFrame(lat, lon);
  const d = (cellDiameterKm * SQ3) / 2; // centre spacing for circumradius D/2
  const [x, y] = toLocalKm(lat, lon, lat0, lon0);
  const [q, r] = xyToHex(x, y, d);
  return { q, r, d, lat0, lon0 };
}

export function cellCenter(q: number, r: number, d: number, lat0: number, lon0: number): [number, number] {
  const [x, y] = hexToXY(q, r, d);
  return fromLocalKm(x, y, lat0, lon0);
}

export function cellPolygon(q: number, r: number, cellDiameterKm: number, lat0: number, lon0: number): [number, number][] {
  const d = (cellDiameterKm * SQ3) / 2;
  const [cx, cy] = hexToXY(q, r, d);
  const R = cellDiameterKm / 2;
  const ring: [number, number][] = [];
  for (let k = 0; k <= 6; k++) {
    const a = ((60 * k + 30) * Math.PI) / 180;
    ring.push(fromLocalKm(cx + R * Math.cos(a), cy + R * Math.sin(a), lat0, lon0));
  }
  return ring;
}

// ---------------------------------------------------------------- satellite body frame
export function bodyFrame(pose: SatPose) {
  const z = unit(scale(pose.ecef, -1));
  const v = pose.velEcef;
  const x = unit(sub(v, scale(z, dot(v, z))));
  const y = cross(z, x);
  return { x, y, z };
}

/** Boresight-relative frame for a GEO/spot antenna pointed at aim point. */
function aimFrame(satEcef: Vec3, aimEcef: Vec3) {
  const b = unit(sub(aimEcef, satEcef));
  const north: Vec3 = [0, 0, 1];
  const u1 = unit(cross(north, b)); // ~east
  const u2 = cross(b, u1); // ~north
  return { b, u1, u2 };
}

function hexBeamDirs(satEcef: Vec3, layout: Extract<BeamLayout, { kind: 'hex-grid' }>) {
  const aim = geodeticToEcef(layout.aimLat, layout.aimLon, 0);
  const { b, u1, u2 } = aimFrame(satEcef, aim);
  const s = layout.spacingDeg * DEG;
  return hexRing(layout.rings).map(([q, r]) => {
    const ax = s * (q + r / 2), ay = s * (SQ3 / 2) * r;
    const dir = unit(add(add(b, scale(u1, Math.tan(ax))), scale(u2, Math.tan(ay))));
    return { q, r, dir, color: hexColor(q, r, layout.reuseColors), id: `B${String(q).padStart(2, '+')}${String(r).padStart(2, '+')}` };
  });
}

// ---------------------------------------------------------------- main evaluation
export function evaluateBeam(payload: Payload, pose: SatPose, user: LatLonAlt, userEcef?: Vec3): BeamEval {
  const u = userEcef ?? geodeticToEcef(user.lat, user.lon, user.alt);
  const sat = pose.ecef;
  const toUser = sub(u, sat);
  const p = payload.pattern;
  const L = payload.layout;

  switch (L.kind) {
    case 'steerable-cells': {
      const { q, r, d, lat0, lon0 } = userCell(user.lat, user.lon, L.cellDiameterKm);
      const cellLL = cellCenter(q, r, d, lat0, lon0);
      const aim = geodeticToEcef(cellLL[0], cellLL[1], 0);
      const scan = nadirAngle(sat, aim);
      if (scan > p.maxScanDeg) return NOT_COVERED('scan-limit');
      const { lossDb, hpbwDeg } = scanEffects(p, scan);
      const off = angleBetween(sub(aim, sat), toUser) * RAD;
      const rel = lossDb + relativeGainDb(p, off, hpbwDeg);
      // First-tier co-channel cells at the reuse distance (full load)
      const N = Math.max(1, L.reuseColors);
      const rangeKm = norm(sub(aim, sat));
      const load = Math.min(1, Math.max(0, L.coChannelLoad ?? 0.5));
      const sepKm = (L.minSepBeamwidths ?? 1.6) * rangeKm * Math.tan(hpbwDeg * DEG);
      const D = Math.max(d * Math.sqrt(N), sepKm);
      const tiers: number[] = [];
      const rot = N === 1 ? 0 : N === 3 ? 30 : N === 4 ? 0 : 19.1;
      const [ux, uy] = hexToXY(q, r, d);
      for (let k = 0; k < 6; k++) {
        const a = ((60 * k + rot) * Math.PI) / 180;
        const [la, lo] = fromLocalKm(ux + D * Math.cos(a), uy + D * Math.sin(a), lat0, lon0);
        const ce = geodeticToEcef(la, lo, 0);
        const sc = nadirAngle(sat, ce);
        if (sc > p.maxScanDeg) continue;
        const se = scanEffects(p, sc);
        tiers.push(se.lossDb + relativeGainDb(p, angleBetween(sub(ce, sat), toUser) * RAD, se.hpbwDeg));
      }
      const I = load * sumPow(tiers);
      return {
        covered: true, beamId: `cell ${q},${r}`, beamLabel: `Cell (${q},${r})`, color: hexColor(q, r, N), relGainDb: rel, scanDeg: scan, offAxisDeg: off, hpbwEffDeg: hpbwDeg,
        cciDb: I > 0 ? rel - 10 * Math.log10(I) : Infinity, coChannelBeams: tiers.length, aim: cellLL,
      };
    }
    case 'fixed-strips': {
      const f = bodyFrame(pose);
      const t = unit(toUser);
      const tz = dot(t, f.z);
      if (tz <= 0) return NOT_COVERED();
      const ax = Math.atan2(dot(t, f.x), tz) * RAD - L.boresightTiltDeg;
      const ay = Math.atan2(dot(t, f.y), tz) * RAD;
      const gains: { k: number; g: number }[] = [];
      for (let k = 0; k < L.count; k++) {
        const c = (k - (L.count - 1) / 2) * L.alongTrackDeg;
        // Gaussian along-track, iso-flux (super-Gaussian, order 4) shaping across-track
        const g = -12 * ((ax - c) / L.alongTrackDeg) ** 2 - 3 * (ay / (L.crossTrackDeg / 2)) ** 4;
        gains.push({ k, g: Math.max(g, p.sidelobeDb) });
      }
      const best = gains.reduce((a, b) => (b.g > a.g ? b : a));
      if (best.g < -8) return NOT_COVERED('outside-strips');
      const col = best.k % Math.max(1, L.reuseColors);
      const I = sumPow(gains.filter((x) => x.k !== best.k && x.k % Math.max(1, L.reuseColors) === col).map((x) => x.g));
      return {
        covered: true, beamId: `strip ${best.k + 1}`, beamLabel: `Beam ${best.k + 1}/${L.count}`, color: col, relGainDb: best.g,
        scanDeg: nadirAngle(sat, u), offAxisDeg: Math.hypot(ay, ax - (best.k - (L.count - 1) / 2) * L.alongTrackDeg), hpbwEffDeg: L.alongTrackDeg,
        cciDb: I > 0 ? best.g - 10 * Math.log10(I) : Infinity, coChannelBeams: gains.length - 1, aim: [user.lat, user.lon],
      };
    }
    case 'hex-grid': {
      const beams = hexBeamDirs(sat, L);
      const t = unit(toUser);
      let bi = 0, bg = -Infinity, boff = 0;
      const g = beams.map((b, i) => {
        const off = angleBetween(b.dir, t) * RAD;
        const v = relativeGainDb(p, off);
        if (v > bg) { bg = v; bi = i; boff = off; }
        return v;
      });
      const best = beams[bi];
      if (bg < -8) return NOT_COVERED('outside-coverage');
      const I = sumPow(g.filter((_, i) => i !== bi && beams[i].color === best.color));
      const aimPt = rayEllipsoid(sat, best.dir);
      const aimLL = aimPt ? ecefToGeodetic(aimPt) : { lat: user.lat, lon: user.lon };
      return {
        covered: true, beamId: best.id, beamLabel: `Beam ${best.id}`, color: best.color, relGainDb: bg, scanDeg: nadirAngle(sat, u), offAxisDeg: boff, hpbwEffDeg: p.hpbwDeg,
        cciDb: I > 0 ? bg - 10 * Math.log10(I) : Infinity, coChannelBeams: beams.filter((b) => b.color === best.color).length - 1, aim: [aimLL.lat, aimLL.lon],
      };
    }
    case 'spot': {
      const aim = geodeticToEcef(L.aimLat, L.aimLon, 0);
      const off = angleBetween(sub(aim, sat), toUser) * RAD;
      const rel = relativeGainDb(p, off);
      if (rel < -10) return NOT_COVERED('outside-spot');
      return {
        covered: true, beamId: 'spot', beamLabel: 'Spot beam', color: 0, relGainDb: rel, scanDeg: nadirAngle(sat, u), offAxisDeg: off, hpbwEffDeg: p.hpbwDeg,
        cciDb: Infinity, coChannelBeams: 0, aim: [L.aimLat, L.aimLon],
      };
    }
    case 'kml': {
      return evaluateKml(L, user);
    }
  }
}

// ---------------------------------------------------------------- KML contour beams
/** Level [dB/dBW] of a contour beam at a point; extrapolated (Gaussian roll-off) outside the outer contour. */
export function kmlLevelAt(beam: KmlBeam, meaning: 'absolute-eirp' | 'relative' | 'edge-only', edgeRelDb: number, lat: number, lon: number): { level: number; inside: boolean } {
  const cs = beam.contours;
  if (!cs.length) return { level: -99, inside: false };
  if (meaning === 'edge-only' || cs.length === 1) {
    const ring = cs[0].rings[0];
    const Req = Math.sqrt(ringAreaKm2(ring) / Math.PI) || 1;
    const [x, y] = toLocalKm(lat, lon, beam.centroid[0], beam.centroid[1]);
    const dc = Math.hypot(x, y);
    const inside = cs[0].rings.some((r) => pointInRing(lat, lon, r));
    const base = meaning === 'edge-only' ? 0 : cs[0].level - edgeRelDb;
    const rel = Math.max(edgeRelDb * (dc / Req) ** 2, edgeRelDb - 25);
    return { level: base + rel, inside };
  }
  const contains = cs.map((c) => c.rings.some((r) => pointInRing(lat, lon, r)));
  const minDist = (c: (typeof cs)[number]) => Math.min(...c.rings.map((r) => distanceToRingKm(lat, lon, r)));
  // innermost containing contour (contours sorted by descending level)
  let iIn = -1;
  for (let i = 0; i < cs.length; i++) if (contains[i]) { iIn = i; break; }
  if (iIn === -1) {
    const outer = cs[cs.length - 1];
    const Req = Math.sqrt(ringAreaKm2(outer.rings[0]) / Math.PI) || 1;
    const d = minDist(outer);
    return { level: Math.max(outer.level - 12 * ((d / Req) ** 2 + (d / Req)), outer.level - 25), inside: false };
  }
  if (iIn === 0) {
    const step = cs.length > 1 ? cs[0].level - cs[1].level : 1;
    const Req = Math.sqrt(ringAreaKm2(cs[0].rings[0]) / Math.PI) || 1;
    const d = minDist(cs[0]);
    return { level: cs[0].level + Math.min(1, d / Req) * step * 0.5, inside: true };
  }
  const outerC = cs[iIn], innerC = cs[iIn - 1];
  const dOut = minDist(outerC), dIn = minDist(innerC);
  const t = dOut / (dOut + dIn || 1);
  return { level: outerC.level + (innerC.level - outerC.level) * t, inside: true };
}

function evaluateKml(L: Extract<BeamLayout, { kind: 'kml' }>, user: LatLonAlt): BeamEval {
  if (!L.beams.length) return NOT_COVERED('no-beams');
  const vals = L.beams.map((b) => ({ b, ...kmlLevelAt(b, L.meaning, L.edgeRelDb, user.lat, user.lon) }));
  const peakOf = (b: KmlBeam) => (L.meaning === 'edge-only' ? 0 : b.contours[0]?.level ?? 0);
  // Choose the beam with the highest level (relative to its own peak for relative modes)
  const best = vals.reduce((a, c) => (c.level > a.level ? c : a));
  if (!best.inside) return NOT_COVERED('outside-kml');
  const I = sumPow(vals.filter((v) => v.b !== best.b && v.b.color === best.b.color).map((v) => v.level));
  const rel = L.meaning === 'absolute-eirp' ? best.level - peakOf(best.b) : best.level;
  return {
    covered: true, beamId: best.b.id, beamLabel: best.b.name, color: best.b.color, relGainDb: rel,
    absEirpDbw: L.meaning === 'absolute-eirp' ? best.level : undefined, scanDeg: 0, offAxisDeg: 0, hpbwEffDeg: 0,
    cciDb: I > 0 ? best.level - 10 * Math.log10(I) : Infinity, coChannelBeams: vals.filter((v) => v.b.color === best.b.color).length - 1,
    aim: best.b.centroid,
  };
}

// ---------------------------------------------------------------- footprints for display
export interface Footprint { id: string; color: number; ring: [number, number][]; active?: boolean; level?: number }

function coneFootprint(sat: Vec3, axis: Vec3, halfAngleDeg: number, n = 48): [number, number][] {
  const a = unit(axis);
  const ref: Vec3 = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1 = unit(cross(a, ref)), e2 = cross(a, e1);
  const t = Math.tan(halfAngleDeg * DEG);
  const ring: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const ang = (2 * Math.PI * k) / n;
    const dir = unit(add(a, add(scale(e1, t * Math.cos(ang)), scale(e2, t * Math.sin(ang)))));
    const hit = rayEllipsoid(sat, dir);
    if (!hit) continue;
    const g = ecefToGeodetic(hit);
    ring.push([g.lat, g.lon]);
  }
  return ring;
}

/** Ground footprints of a satellite's beams (−3 dB contours, or KML polygons). */
export function beamFootprints(payload: Payload, pose: SatPose, user?: LatLonAlt, maxCells = 3): Footprint[] {
  const L = payload.layout, p = payload.pattern, sat = pose.ecef;
  switch (L.kind) {
    case 'hex-grid':
      return hexBeamDirs(sat, L).map((b) => ({ id: b.id, color: b.color, ring: coneFootprint(sat, b.dir, p.hpbwDeg / 2, 36) }));
    case 'spot': {
      const aim = geodeticToEcef(L.aimLat, L.aimLon, 0);
      return [{ id: 'spot', color: 0, ring: coneFootprint(sat, sub(aim, sat), p.hpbwDeg / 2, 72) }];
    }
    case 'fixed-strips': {
      const f = bodyFrame(pose);
      const out: Footprint[] = [];
      for (let k = 0; k < L.count; k++) {
        const c = (k - (L.count - 1) / 2) * L.alongTrackDeg + L.boresightTiltDeg;
        const ring: [number, number][] = [];
        const hx = L.alongTrackDeg / 2, hy = L.crossTrackDeg / 2;
        const pts: [number, number][] = [];
        for (let s = 0; s <= 8; s++) pts.push([c - hx, -hy + (2 * hy * s) / 8]);
        for (let s = 0; s <= 8; s++) pts.push([c + hx, hy - (2 * hy * s) / 8]);
        pts.push(pts[0]);
        for (const [ax, ay] of pts) {
          const dir = unit(add(f.z, add(scale(f.x, Math.tan(ax * DEG)), scale(f.y, Math.tan(ay * DEG)))));
          const hit = rayEllipsoid(sat, dir);
          if (hit) { const g = ecefToGeodetic(hit); ring.push([g.lat, g.lon]); }
        }
        out.push({ id: `strip ${k + 1}`, color: k % Math.max(1, L.reuseColors), ring });
      }
      return out;
    }
    case 'steerable-cells': {
      if (!user) return [];
      const { q, r, lat0, lon0 } = userCell(user.lat, user.lon, L.cellDiameterKm);
      return hexRing(maxCells).map(([dq, dr]) => ({
        id: `cell ${q + dq},${r + dr}`, color: hexColor(q + dq, r + dr, L.reuseColors), ring: cellPolygon(q + dq, r + dr, L.cellDiameterKm, lat0, lon0), active: dq === 0 && dr === 0,
      }));
    }
    case 'kml':
      return L.beams.flatMap((b) => b.contours.flatMap((c, ci) => c.rings.map((ring, ri) => ({ id: `${b.id}#${ci}.${ri}`, color: b.color, ring, level: c.level }))));
  }
}

/** Ground footprint of a steered spot from `sat` toward a ground aim point (−3 dB, incl. scan broadening). */
export function steeredSpotFootprint(payload: Payload, sat: Vec3, aimLat: number, aimLon: number): [number, number][] {
  const aim = geodeticToEcef(aimLat, aimLon, 0);
  const scan = angleBetween(scale(sat, -1), sub(aim, sat)) * RAD;
  const { hpbwDeg } = scanEffects(payload.pattern, scan);
  return coneFootprint(sat, sub(aim, sat), hpbwDeg / 2, 48);
}

/** Coverage circle (minimum elevation) ground ring. */
export function coverageRing(sat: Vec3, minElDeg: number, n = 90): [number, number][] {
  const g = ecefToGeodetic(sat);
  const Re = 6371, h = g.alt;
  const eta = Math.asin((Re / (Re + h)) * Math.cos(minElDeg * DEG));
  const lam = Math.PI / 2 - minElDeg * DEG - eta; // earth central angle
  const ring: [number, number][] = [];
  const p1 = g.lat * DEG, l1 = g.lon * DEG;
  for (let k = 0; k <= n; k++) {
    const b = (2 * Math.PI * k) / n;
    const p2 = Math.asin(Math.sin(p1) * Math.cos(lam) + Math.cos(p1) * Math.sin(lam) * Math.cos(b));
    const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(lam) * Math.cos(p1), Math.cos(lam) - Math.sin(p1) * Math.sin(p2));
    ring.push([p2 * RAD, ((l2 * RAD + 540) % 360) - 180]);
  }
  return ring;
}

export const vecNorm = norm;

/** Off-axis angle [deg] at which the pattern falls to `levelDb` (bisection on the main lobe). */
export function offAxisForLevel(p: Payload['pattern'], levelDb: number, hpbwDeg = p.hpbwDeg): number {
  let lo = 0, hi = hpbwDeg * 1.5;
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2;
    if (relativeGainDb(p, m, hpbwDeg) > levelDb) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

/**
 * Multi-level contour rings for hex-grid / spot payloads, as absolute EIRP
 * (peak EIRP + relative level) — the format operators publish as KML.
 */
export function beamContours(payload: Payload, pose: SatPose, levelsRel: number[] = [-1, -2, -3, -4, -5]): Footprint[] {
  const L = payload.layout, p = payload.pattern, sat = pose.ecef;
  const peak = payload.forward.eirpPeakDbw;
  const beams: { id: string; color: number; dir: Vec3 }[] =
    L.kind === 'hex-grid' ? hexBeamDirs(sat, L).map((b) => ({ id: b.id, color: b.color, dir: b.dir }))
      : L.kind === 'spot' ? [{ id: 'spot', color: 0, dir: sub(geodeticToEcef(L.aimLat, L.aimLon, 0), sat) }] : [];
  const out: Footprint[] = [];
  for (const b of beams) {
    for (const lv of levelsRel) {
      const ring = coneFootprint(sat, b.dir, offAxisForLevel(p, lv), 48);
      if (ring.length > 3) out.push({ id: `${b.id}#${lv}`, color: b.color, ring, level: +(peak + lv).toFixed(2) });
    }
  }
  return out;
}
