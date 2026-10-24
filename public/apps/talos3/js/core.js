/* TALOS-3 simulator — core constants, frames, time, geodesy, small linear algebra.
   Units: km, km/s, seconds, radians unless a name says otherwise. */
'use strict';
window.SIM = window.SIM || {};
(function (S) {
  const C = S.C = {
    MU: 398600.4418,            // km^3/s^2 (EGM-96 / WGS-84)
    RE: 6378.137,               // km, WGS-84 equatorial radius
    F: 1 / 298.257223563,       // WGS-84 flattening
    J2: 1.08262668e-3,
    WE: 7.2921150e-5,           // rad/s, Earth rotation rate
    CKM: 299792.458,            // km/s
    CMS: 299792458,             // m/s
    K_DBW: -228.6,              // Boltzmann constant, dBW/K/Hz
    DEG: Math.PI / 180,
    RAD: 180 / Math.PI,
    TWO_PI: 2 * Math.PI,
    TROPICAL_YEAR_S: 365.2421897 * 86400,
    RM: 6371.0088               // km, mean Earth radius for spherical geodesy
  };
  C.E2 = C.F * (2 - C.F);

  const V = S.V = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    norm: a => Math.hypot(a[0], a[1], a[2]),
    unit: a => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; }
  };

  /* ---------- time ---------- */
  S.jd = ms => ms / 86400000 + 2440587.5;
  // GMST, IAU-82 (Vallado eq. 3-45), UT1 ≈ UTC
  S.gmst = ms => {
    const T = (S.jd(ms) - 2451545.0) / 36525;
    let g = 67310.54841 + (876600 * 3600 + 8640184.812866) * T + 0.093104 * T * T - 6.2e-6 * T * T * T;
    g = ((g % 86400) + 86400) % 86400;
    return g / 240 * C.DEG;
  };
  // Low-precision Sun position (Astronomical Almanac), ECI (mean equator of date), km
  S.sunEci = ms => {
    const n = S.jd(ms) - 2451545.0;
    const L = (280.460 + 0.9856474 * n) * C.DEG, g = (357.528 + 0.9856003 * n) * C.DEG;
    const lam = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * C.DEG;
    const eps = (23.439 - 4e-7 * n) * C.DEG;
    const r = (1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g)) * 149597870.7;
    return [r * Math.cos(lam), r * Math.cos(eps) * Math.sin(lam), r * Math.sin(eps) * Math.sin(lam)];
  };
  S.subSolar = ms => {
    const s = S.sunEci(ms), th = S.gmst(ms);
    return { lat: Math.atan2(s[2], Math.hypot(s[0], s[1])), lon: S.wrapPi(Math.atan2(s[1], s[0]) - th) };
  };

  /* ---------- frames ---------- */
  S.rotZ = (v, th) => { const c = Math.cos(th), s = Math.sin(th); return [c * v[0] + s * v[1], -s * v[0] + c * v[1], v[2]]; };
  S.eci2ecef = (r, ms) => S.rotZ(r, S.gmst(ms));
  S.ecef2eci = (r, ms) => S.rotZ(r, -S.gmst(ms));
  S.geo2ecef = (lat, lon, h = 0) => {
    const s = Math.sin(lat), N = C.RE / Math.sqrt(1 - C.E2 * s * s);
    return [(N + h) * Math.cos(lat) * Math.cos(lon), (N + h) * Math.cos(lat) * Math.sin(lon), (N * (1 - C.E2) + h) * s];
  };
  S.ecef2geo = r => {
    const x = r[0], y = r[1], z = r[2], p = Math.hypot(x, y), lon = Math.atan2(y, x);
    let lat = Math.atan2(z, p * (1 - C.E2)), h = 0;
    for (let k = 0; k < 6; k++) {
      const s = Math.sin(lat), N = C.RE / Math.sqrt(1 - C.E2 * s * s);
      h = Math.abs(lat) < 1.4 ? p / Math.cos(lat) - N : z / s - N * (1 - C.E2);
      lat = Math.atan2(z, p * (1 - C.E2 * N / (N + h)));
    }
    return { lat, lon, h };
  };
  // ECEF vector -> local East/North/Up at geodetic lat/lon
  S.enu = (lat, lon, d) => {
    const sl = Math.sin(lat), cl = Math.cos(lat), so = Math.sin(lon), co = Math.cos(lon);
    return [-so * d[0] + co * d[1], -sl * co * d[0] - sl * so * d[1] + cl * d[2], cl * co * d[0] + cl * so * d[1] + sl * d[2]];
  };
  S.enu2ecef = (lat, lon, e) => {
    const sl = Math.sin(lat), cl = Math.cos(lat), so = Math.sin(lon), co = Math.cos(lon);
    return [-so * e[0] - sl * co * e[1] + cl * co * e[2], co * e[0] - sl * so * e[1] + cl * so * e[2], cl * e[1] + sl * e[2]];
  };
  S.look = (siteR, lat, lon, satR) => {
    const d = V.sub(satR, siteR), rng = V.norm(d), e = S.enu(lat, lon, d);
    return { az: Math.atan2(e[0], e[1]), el: Math.asin(e[2] / rng), range: rng };
  };

  /* ---------- spherical geodesy (mean sphere) ---------- */
  S.wrapPi = a => { a = (a + Math.PI) % C.TWO_PI; if (a < 0) a += C.TWO_PI; return a - Math.PI; };
  S.gcDist = (la1, lo1, la2, lo2) => {
    const a = Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2;
    return 2 * C.RM * Math.asin(Math.min(1, Math.sqrt(a)));
  };
  S.gcAz = (la1, lo1, la2, lo2) => Math.atan2(Math.sin(lo2 - lo1) * Math.cos(la2),
    Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(lo2 - lo1));
  S.dest = (la, lo, az, d) => {
    const dr = d / C.RM;
    const la2 = Math.asin(Math.sin(la) * Math.cos(dr) + Math.cos(la) * Math.sin(dr) * Math.cos(az));
    const lo2 = lo + Math.atan2(Math.sin(az) * Math.sin(dr) * Math.cos(la), Math.cos(dr) - Math.sin(la) * Math.sin(la2));
    return [la2, S.wrapPi(lo2)];
  };
  // Azimuthal-equidistant local projection (km), used for regional views and grid searches
  S.AzEq = class {
    constructor(lat0, lon0) { this.lat0 = lat0; this.lon0 = lon0; this.s0 = Math.sin(lat0); this.c0 = Math.cos(lat0); }
    fwd(lat, lon) {
      const dl = lon - this.lon0, cl = Math.cos(lat), sl = Math.sin(lat), cdl = Math.cos(dl);
      const cc = S.clamp(this.s0 * sl + this.c0 * cl * cdl, -1, 1), c = Math.acos(cc);
      const k = c < 1e-9 ? C.RM : C.RM * c / Math.sin(c);
      return [k * cl * Math.sin(dl), k * (this.c0 * sl - this.s0 * cl * cdl), cc];
    }
    inv(x, y) { return S.dest(this.lat0, this.lon0, Math.atan2(x, y), Math.hypot(x, y)); }
  };

  /* ---------- numeric helpers ---------- */
  S.clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  S.db = x => 10 * Math.log10(x);
  S.lin = d => Math.pow(10, d / 10);
  S.lerp = (a, b, t) => a + (b - a) * t;
  S.rng = seed => {
    let a = seed >>> 0;
    const r = () => {
      a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.gauss = () => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(C.TWO_PI * r()); };
    return r;
  };
  S.hash = (...xs) => { let h = 2166136261; for (const x of xs) { h ^= Math.floor(x) & 0xffffffff; h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };

  // Solve A x = b (n <= 4) by Gaussian elimination with partial pivoting
  S.solve = (A, b) => {
    const n = b.length, M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      if (Math.abs(M[c][c]) < 1e-300) return null;
      for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
    return x;
  };
  S.inv = A => {
    const n = A.length, out = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let c = 0; c < n; c++) { const e = new Array(n).fill(0); e[c] = 1; const x = S.solve(A, e); if (!x) return null; for (let r = 0; r < n; r++) out[r][c] = x[r]; }
    return out;
  };
  // 2x2 symmetric covariance [[xx,xy],[xy,yy]] (x=East, y=North) -> error ellipse
  S.ellipse = (xx, xy, yy) => {
    const m = (xx + yy) / 2, d = Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy);
    const l1 = Math.max(m + d, 0), l2 = Math.max(m - d, 0);
    const th = 0.5 * Math.atan2(2 * xy, xx - yy);          // major-axis angle from East, CCW
    const smaj = Math.sqrt(l1), smin = Math.sqrt(l2);
    return { smaj, smin, angE: th, azDeg: ((90 - th * C.RAD) % 180 + 180) % 180, cep: 0.562 * smaj + 0.617 * smin, k95: 2.4477 };
  };

  /* ---------- formatting ---------- */
  S.iso = ms => new Date(ms).toISOString();
  S.fmtUtc = ms => S.iso(ms).replace('T', ' ').slice(0, 19);
  S.fmtHMS = ms => S.iso(ms).slice(11, 19);
  S.fmtHM = ms => S.iso(ms).slice(11, 16);
  S.fmtDur = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(x).padStart(2, '0')}s`; };
  S.fmtLat = la => `${Math.abs(la * C.RAD).toFixed(3)}°${la >= 0 ? 'N' : 'S'}`;
  S.fmtLon = lo => `${Math.abs(lo * C.RAD).toFixed(3)}°${lo >= 0 ? 'E' : 'W'}`;
  S.fmtLL = (la, lo) => `${S.fmtLat(la)} ${S.fmtLon(lo)}`;
  S.fmtM = m => Math.abs(m) < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(Math.abs(m) < 1e4 ? 2 : 1)} km`;
  S.fmtMHz = f => f >= 1000 ? `${(f / 1000).toFixed(3)} GHz` : `${f.toFixed(3)} MHz`;
  S.fmtHz = hz => { const a = Math.abs(hz); return a >= 1e6 ? `${(hz / 1e6).toFixed(3)} MHz` : a >= 1e3 ? `${(hz / 1e3).toFixed(3)} kHz` : `${hz.toFixed(2)} Hz`; };
  S.fmtSec = s => { const a = Math.abs(s); return a >= 1e-3 ? `${(s * 1e3).toFixed(4)} ms` : a >= 1e-6 ? `${(s * 1e6).toFixed(3)} µs` : `${(s * 1e9).toFixed(2)} ns`; };
  S.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- tiny event bus ---------- */
  const handlers = {};
  S.on = (ev, fn) => { (handlers[ev] = handlers[ev] || []).push(fn); };
  S.emit = (ev, data) => { (handlers[ev] || []).forEach(fn => fn(data)); };
})(window.SIM);
