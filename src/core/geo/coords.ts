import { R_EARTH, E2_EARTH, DEG, RAD } from '../constants';
import { type Vec3, sub, dot, norm, cross, unit, angleBetween } from '../vec';

export interface LatLonAlt { lat: number; lon: number; alt: number } // deg, deg, km

/** Geodetic (WGS-84) -> ECEF [km]. */
export function geodeticToEcef(lat: number, lon: number, altKm = 0): Vec3 {
  const phi = lat * DEG, lam = lon * DEG;
  const s = Math.sin(phi), c = Math.cos(phi);
  const N = R_EARTH / Math.sqrt(1 - E2_EARTH * s * s);
  return [(N + altKm) * c * Math.cos(lam), (N + altKm) * c * Math.sin(lam), (N * (1 - E2_EARTH) + altKm) * s];
}

/** ECEF [km] -> geodetic (Bowring iteration). */
export function ecefToGeodetic(p: Vec3): LatLonAlt {
  const [x, y, z] = p;
  const lon = Math.atan2(y, x);
  const r = Math.hypot(x, y);
  let lat = Math.atan2(z, r * (1 - E2_EARTH));
  let alt = 0;
  for (let i = 0; i < 5; i++) {
    const s = Math.sin(lat);
    const N = R_EARTH / Math.sqrt(1 - E2_EARTH * s * s);
    alt = r / Math.cos(lat) - N;
    lat = Math.atan2(z, r * (1 - (E2_EARTH * N) / (N + alt)));
  }
  return { lat: lat * RAD, lon: lon * RAD, alt };
}

/** Local East-North-Up basis at a geodetic location. */
export function enuBasis(lat: number, lon: number): { e: Vec3; n: Vec3; u: Vec3 } {
  const phi = lat * DEG, lam = lon * DEG;
  const sp = Math.sin(phi), cp = Math.cos(phi), sl = Math.sin(lam), cl = Math.cos(lam);
  return { e: [-sl, cl, 0], n: [-sp * cl, -sp * sl, cp], u: [cp * cl, cp * sl, sp] };
}

export interface LookAngles { az: number; el: number; range: number } // deg, deg, km

export function lookAngles(obs: LatLonAlt, satEcef: Vec3): LookAngles {
  const o = geodeticToEcef(obs.lat, obs.lon, obs.alt);
  const d = sub(satEcef, o);
  const { e, n, u } = enuBasis(obs.lat, obs.lon);
  const de = dot(d, e), dn = dot(d, n), du = dot(d, u);
  const range = norm(d);
  let az = Math.atan2(de, dn) * RAD;
  if (az < 0) az += 360;
  return { az, el: Math.asin(du / range) * RAD, range };
}

/** Direction unit vector (ECEF) for az/el at an observer. */
export function azElToEcefDir(obs: LatLonAlt, azDeg: number, elDeg: number): Vec3 {
  const { e, n, u } = enuBasis(obs.lat, obs.lon);
  const a = azDeg * DEG, el = elDeg * DEG;
  const ce = Math.cos(el);
  return unit([
    e[0] * ce * Math.sin(a) + n[0] * ce * Math.cos(a) + u[0] * Math.sin(el),
    e[1] * ce * Math.sin(a) + n[1] * ce * Math.cos(a) + u[1] * Math.sin(el),
    e[2] * ce * Math.sin(a) + n[2] * ce * Math.cos(a) + u[2] * Math.sin(el),
  ]);
}

/** Great-circle destination point (spherical) from start, bearing, distance [km]. */
export function destination(lat: number, lon: number, bearingDeg: number, distKm: number): [number, number] {
  const R = 6371.0088;
  const d = distKm / R, b = bearingDeg * DEG, p1 = lat * DEG, l1 = lon * DEG;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [p2 * RAD, ((((l2 * RAD) + 540) % 360) - 180)];
}

export function greatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * DEG, p2 = lat2 * DEG, dp = p2 - p1, dl = (lon2 - lon1) * DEG;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * DEG, p2 = lat2 * DEG, dl = (lon2 - lon1) * DEG;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) * RAD) + 360) % 360;
}

/**
 * Intersect a ray (origin o, unit dir d, ECEF km) with the WGS-84 ellipsoid.
 * Returns the nearest intersection or null.
 */
export function rayEllipsoid(o: Vec3, d: Vec3): Vec3 | null {
  const a = R_EARTH, b = R_EARTH * Math.sqrt(1 - E2_EARTH);
  const ox = o[0] / a, oy = o[1] / a, oz = o[2] / b;
  const dx = d[0] / a, dy = d[1] / a, dz = d[2] / b;
  const A = dx * dx + dy * dy + dz * dz;
  const B = 2 * (ox * dx + oy * dy + oz * dz);
  const Cc = ox * ox + oy * oy + oz * oz - 1;
  const disc = B * B - 4 * A * Cc;
  if (disc < 0) return null;
  const t = (-B - Math.sqrt(disc)) / (2 * A);
  if (t < 0) return null;
  return [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]];
}

/**
 * Off-axis angle [deg] at the satellite between its boresight (pointing at
 * `aimEcef`) and the direction to `targetEcef`.
 */
export function offAxisDeg(satEcef: Vec3, aimEcef: Vec3, targetEcef: Vec3): number {
  return angleBetween(sub(aimEcef, satEcef), sub(targetEcef, satEcef)) * RAD;
}

/** Nadir angle at the satellite toward a ground point. */
export function nadirAngleDeg(satEcef: Vec3, targetEcef: Vec3): number {
  return angleBetween([-satEcef[0], -satEcef[1], -satEcef[2]], sub(targetEcef, satEcef)) * RAD;
}

/** Earth central angle [deg] of the coverage circle for min elevation `elMin` at altitude h [km]. */
export function coverageHalfAngleDeg(altKm: number, elMinDeg: number): number {
  const Re = 6371.0;
  const el = elMinDeg * DEG;
  const eta = Math.asin((Re / (Re + altKm)) * Math.cos(el)); // nadir angle
  return 90 - elMinDeg - eta * RAD;
}

/** Nadir angle [deg] at which a satellite at altitude h sees a ground point at elevation el. */
export function nadirFromElevationDeg(altKm: number, elDeg: number): number {
  return Math.asin((6371 / (6371 + altKm)) * Math.cos(elDeg * DEG)) * RAD;
}

export function normalOfPlane(p1: Vec3, p2: Vec3): Vec3 {
  return unit(cross(p1, p2));
}
