/** Small-area polygon helpers in lat/lon (rings as [lat, lon]). */
const KM_PER_DEG = 111.195;

function unwrap(lon: number, ref: number) {
  let d = lon - ref;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return ref + d;
}

/** Local equirectangular projection around (lat0, lon0) in km. */
export function toLocalKm(lat: number, lon: number, lat0: number, lon0: number): [number, number] {
  return [(unwrap(lon, lon0) - lon0) * KM_PER_DEG * Math.cos((lat0 * Math.PI) / 180), (lat - lat0) * KM_PER_DEG];
}
export function fromLocalKm(x: number, y: number, lat0: number, lon0: number): [number, number] {
  const lat = lat0 + y / KM_PER_DEG;
  let lon = lon0 + x / (KM_PER_DEG * Math.cos((lat0 * Math.PI) / 180));
  lon = ((lon + 540) % 360) - 180;
  return [lat, lon];
}

export function pointInRing(lat: number, lon: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i][0], xi = unwrap(ring[i][1], lon);
    const yj = ring[j][0], xj = unwrap(ring[j][1], lon);
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-300) + xi) inside = !inside;
  }
  return inside;
}

/** Minimum distance [km] from a point to a ring boundary. */
export function distanceToRingKm(lat: number, lon: number, ring: [number, number][]): number {
  let best = Infinity;
  const pts = ring.map(([la, lo]) => toLocalKm(la, lo, lat, lon));
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const dx = x2 - x1, dy = y2 - y1;
    const L2 = dx * dx + dy * dy;
    const t = L2 > 0 ? Math.max(0, Math.min(1, -(x1 * dx + y1 * dy) / L2)) : 0;
    const d = Math.hypot(x1 + t * dx, y1 + t * dy);
    if (d < best) best = d;
  }
  return best;
}

export function ringAreaKm2(ring: [number, number][]): number {
  if (ring.length < 3) return 0;
  const [lat0, lon0] = ring[0];
  const pts = ring.map(([la, lo]) => toLocalKm(la, lo, lat0, lon0));
  let a = 0;
  for (let i = 0; i < pts.length - 1; i++) a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
  return Math.abs(a) / 2;
}

export function ringCentroid(ring: [number, number][]): [number, number] {
  const [lat0, lon0] = ring[0];
  let sx = 0, sy = 0, n = 0;
  for (const [la, lo] of ring) { const [x, y] = toLocalKm(la, lo, lat0, lon0); sx += x; sy += y; n++; }
  return fromLocalKm(sx / n, sy / n, lat0, lon0);
}
