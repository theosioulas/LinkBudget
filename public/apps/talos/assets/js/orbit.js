/* orbit.js — self-contained orbital mechanics, geodesy, coverage and
   TDOA/FDOA geolocation geometry for the SIGINT constellation study.
   Units: km, s, rad internally; degrees at the API boundary where noted.
   Model: Keplerian circular/near-circular orbits with J2 secular drift
   (RAAN, argument of perigee, mean motion). Adequate for design-level
   coverage, revisit, pass and geolocation-geometry studies. */
(function (global) {
  const RE = 6378.137, RP = 6356.752, MU = 398600.4418, J2 = 1.08262668e-3, WE = 7.2921159e-5, C = 299792.458;
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;

  // ---------- time ----------
  function jd(date) { return date.getTime() / 86400000 + 2440587.5; }
  function gmst(date) { // radians
    const T = (jd(date) - 2451545.0) / 36525;
    let g = 280.46061837 + 360.98564736629 * (jd(date) - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
    g = ((g % 360) + 360) % 360; return g * D2R;
  }
  // low-precision sun direction (ECI unit vector) — good to ~0.01 AU angle
  function sunEci(date) {
    const n = jd(date) - 2451545.0;
    const L = (280.460 + 0.9856474 * n) * D2R, g = (357.528 + 0.9856003 * n) * D2R;
    const lam = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * D2R;
    const eps = (23.439 - 0.0000004 * n) * D2R;
    return [Math.cos(lam), Math.cos(eps) * Math.sin(lam), Math.sin(eps) * Math.sin(lam)];
  }

  // ---------- vectors ----------
  const V = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    norm: a => Math.hypot(a[0], a[1], a[2]),
    unit: a => { const n = Math.hypot(a[0], a[1], a[2]); return [a[0] / n, a[1] / n, a[2] / n]; },
  };

  // ---------- geodesy ----------
  function geodeticToEcef(latDeg, lonDeg, hKm = 0) {
    const lat = latDeg * D2R, lon = lonDeg * D2R, e2 = 1 - (RP * RP) / (RE * RE);
    const N = RE / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
    return [(N + hKm) * Math.cos(lat) * Math.cos(lon), (N + hKm) * Math.cos(lat) * Math.sin(lon), (N * (1 - e2) + hKm) * Math.sin(lat)];
  }
  function ecefToGeodetic(r) {
    const e2 = 1 - (RP * RP) / (RE * RE), p = Math.hypot(r[0], r[1]);
    let lat = Math.atan2(r[2], p * (1 - e2)), h = 0;
    for (let k = 0; k < 5; k++) { const N = RE / Math.sqrt(1 - e2 * Math.sin(lat) ** 2); h = p / Math.cos(lat) - N; lat = Math.atan2(r[2], p * (1 - e2 * N / (N + h))); }
    return { lat: lat * R2D, lon: Math.atan2(r[1], r[0]) * R2D, alt: h };
  }
  function eciToEcef(r, theta) { const c = Math.cos(theta), s = Math.sin(theta); return [c * r[0] + s * r[1], -s * r[0] + c * r[1], r[2]]; }
  function ecefToEci(r, theta) { const c = Math.cos(theta), s = Math.sin(theta); return [c * r[0] - s * r[1], s * r[0] + c * r[1], r[2]]; }
  // ECI velocity -> ECEF velocity (includes Earth rotation)
  function velEciToEcef(rEcef, vEci, theta) { const v = eciToEcef(vEci, theta); const w = [0, 0, WE]; return V.sub(v, V.cross(w, rEcef)); }
  function enuBasis(latDeg, lonDeg) {
    const lat = latDeg * D2R, lon = lonDeg * D2R;
    return { e: [-Math.sin(lon), Math.cos(lon), 0], n: [-Math.sin(lat) * Math.cos(lon), -Math.sin(lat) * Math.sin(lon), Math.cos(lat)], u: [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)] };
  }
  function lookAngles(siteLat, siteLon, siteAltKm, satEcef) {
    const s = geodeticToEcef(siteLat, siteLon, siteAltKm), d = V.sub(satEcef, s), b = enuBasis(siteLat, siteLon);
    const e = V.dot(d, b.e), n = V.dot(d, b.n), u = V.dot(d, b.u), range = V.norm(d);
    return { az: ((Math.atan2(e, n) * R2D) + 360) % 360, el: Math.asin(u / range) * R2D, range };
  }
  function greatCircleKm(lat1, lon1, lat2, lon2) {
    const p1 = lat1 * D2R, p2 = lat2 * D2R, dl = (lon2 - lon1) * D2R;
    return RE * Math.acos(Math.min(1, Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl)));
  }
  function destination(latDeg, lonDeg, bearingDeg, distKm) {
    const d = distKm / RE, br = bearingDeg * D2R, p1 = latDeg * D2R, l1 = lonDeg * D2R;
    const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(br));
    const l2 = l1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
    return [((l2 * R2D + 540) % 360) - 180, p2 * R2D];
  }

  // ---------- footprint geometry ----------
  // Earth central angle (rad) of the visibility circle at min elevation el (deg) for altitude h (km)
  function centralAngle(hKm, elDeg) { const el = elDeg * D2R; return Math.acos(RE / (RE + hKm) * Math.cos(el)) - el; }
  function footprintRadiusKm(hKm, elDeg) { return RE * centralAngle(hKm, elDeg); }
  function slantRange(hKm, elDeg) { const el = elDeg * D2R; const r = RE + hKm; return -RE * Math.sin(el) + Math.sqrt((RE * Math.sin(el)) ** 2 + r * r - RE * RE); }
  function nadirAngle(hKm, elDeg) { const el = elDeg * D2R; return Math.asin(RE / (RE + hKm) * Math.cos(el)) * R2D; } // off-nadir angle at the satellite
  function footprintPolygon(latDeg, lonDeg, radiusKm, n = 72) { const pts = []; for (let k = 0; k <= n; k++) pts.push(destination(latDeg, lonDeg, 360 * k / n, radiusKm)); return pts; }
  function period(aKm) { return 2 * Math.PI * Math.sqrt(aKm ** 3 / MU); }
  function velocity(aKm) { return Math.sqrt(MU / aKm); }
  // sun-synchronous inclination for circular orbit altitude
  function ssoInclination(hKm) { const a = RE + hKm; const n = Math.sqrt(MU / a ** 3); const cosi = -(1.991e-7) / (1.5 * n * J2 * (RE / a) ** 2); return Math.acos(cosi) * R2D; }

  // ---------- orbit propagation (circular + J2 secular) ----------
  // orbit: {alt (km), inc (deg), raan (deg), ta (deg) — argument of latitude at epoch, epoch (Date), name}
  function makeOrbit(o) {
    const a = RE + o.alt, n = Math.sqrt(MU / a ** 3), p = (RE / a) ** 2, i = o.inc * D2R;
    return {
      name: o.name || 'sat', alt: o.alt, a, inc: o.inc, raan0: o.raan * D2R, u0: (o.ta || 0) * D2R, epoch: o.epoch || new Date(),
      n, raanDot: -1.5 * n * J2 * p * Math.cos(i),
      // argument-of-latitude rate for a circular orbit: n + argp_dot + (M_dot - n)
      //  = n [1 + 0.75 J2 (RE/a)^2 ((5cos^2 i - 1) + (3cos^2 i - 1))]
      uDot: n * (1 + 0.75 * J2 * p * (8 * Math.cos(i) ** 2 - 2)),
      color: o.color, meta: o.meta || {},
    };
  }
  function stateEci(orb, date) {
    const dt = (date - orb.epoch) / 1000;
    const raan = orb.raan0 + orb.raanDot * dt, u = orb.u0 + orb.uDot * dt, i = orb.inc * D2R;
    const cu = Math.cos(u), su = Math.sin(u), cO = Math.cos(raan), sO = Math.sin(raan), ci = Math.cos(i), si = Math.sin(i);
    const r = [orb.a * (cO * cu - sO * su * ci), orb.a * (sO * cu + cO * su * ci), orb.a * (su * si)];
    const v = V.scale([-(cO * su + sO * cu * ci), -(sO * su - cO * cu * ci), cu * si], orb.a * orb.uDot);
    return { r, v };
  }
  function stateEcef(orb, date) {
    const th = gmst(date), s = stateEci(orb, date);
    const r = eciToEcef(s.r, th), v = velEciToEcef(r, s.v, th);
    const g = ecefToGeodetic(r);
    return { r, v, vEci: s.v, lat: g.lat, lon: g.lon, alt: g.alt, theta: th };
  }
  function groundTrack(orb, t0, durationS, stepS = 30) {
    const pts = []; for (let t = 0; t <= durationS; t += stepS) { const s = stateEcef(orb, new Date(t0.getTime() + t * 1000)); pts.push([s.lon, s.lat, t]); } return pts;
  }
  function isSunlit(rEcef, date) {
    const sEci = sunEci(date), s = eciToEcef(sEci, gmst(date));
    const proj = V.dot(rEcef, s); if (proj > 0) return true;
    const perp = V.norm(V.sub(rEcef, V.scale(s, proj))); return perp > RE;
  }
  function eclipseFraction(orb, date) { let lit = 0; const P = period(orb.a); const N = 120; for (let k = 0; k < N; k++) { const s = stateEcef(orb, new Date(date.getTime() + k * P * 1000 / N)); if (isSunlit(s.r, new Date(date.getTime() + k * P * 1000 / N))) lit++; } return 1 - lit / N; }

  // ---------- constellation generators ----------
  // Walker delta T/P/F — T total sats, P planes, F phasing
  function walker(T, P, F, alt, inc, epoch, raan0 = 0, color) {
    const S = T / P, orbits = []; const now = epoch || new Date();
    for (let p = 0; p < P; p++) for (let s = 0; s < S; s++) orbits.push(makeOrbit({ name: `P${p + 1}-S${s + 1}`, alt, inc, raan: raan0 + 360 * p / P, ta: 360 * s / S + 360 * F * p / T, epoch: now, color, meta: { plane: p, slot: s } }));
    return orbits;
  }
  // formation cluster: N satellites centred on a leader with along-track spacing alongKm; crossKm applies an alternating-sign RAAN offset
  // to every satellite except the first (k=0), so a 3-sat cluster is (0, +cross, -cross) → a shallow triangle rather than a collinear string
  function cluster(leader, N, alongKm, crossKm = 0, epoch) {
    const a = RE + leader.alt, dAng = alongKm / a * R2D, orbits = [];
    for (let k = 0; k < N; k++) {
      const off = (k - (N - 1) / 2);
      const dRaan = crossKm ? (off % 2 ? 1 : -1) * (crossKm / a) * R2D / Math.max(0.2, Math.sin(leader.inc * D2R)) * (k ? 1 : 0) : 0;
      orbits.push(makeOrbit({ name: `${leader.name || 'C'}-${k + 1}`, alt: leader.alt, inc: leader.inc, raan: leader.raan + dRaan, ta: (leader.ta || 0) + off * dAng, epoch: epoch || leader.epoch || new Date(), color: leader.color }));
    }
    return orbits;
  }

  // ---------- passes ----------
  function passes(orb, siteLat, siteLon, siteAlt, t0, durationS, minEl = 5, stepS = 20) {
    const out = []; let cur = null;
    for (let t = 0; t <= durationS; t += stepS) {
      const d = new Date(t0.getTime() + t * 1000), s = stateEcef(orb, d), la = lookAngles(siteLat, siteLon, siteAlt, s.r);
      if (la.el >= minEl) { if (!cur) cur = { aos: d, maxEl: la.el, tca: d, aosAz: la.az, samples: [] }; if (la.el > cur.maxEl) { cur.maxEl = la.el; cur.tca = d; } cur.samples.push({ t: d, el: la.el, az: la.az, range: la.range }); cur.los = d; cur.losAz = la.az; }
      else if (cur) { cur.duration = (cur.los - cur.aos) / 1000 + stepS; out.push(cur); cur = null; }
    }
    if (cur) { cur.duration = (cur.los - cur.aos) / 1000; out.push(cur); }
    return out;
  }

  // ---------- coverage / revisit on a lat-lon grid ----------
  // returns {lats, lons, revisitMax (min), revisitMean, accesses, coverageFrac} for a constellation over duration
  function coverageGrid(orbits, opts = {}) {
    const dLat = opts.dLat || 5, dLon = opts.dLon || 5, step = opts.stepS || 60, dur = opts.durationS || 86400, minEl = opts.minEl || 5, t0 = opts.t0 || new Date();
    const lats = [], lons = []; for (let la = -90 + dLat / 2; la < 90; la += dLat) lats.push(la); for (let lo = -180 + dLon / 2; lo < 180; lo += dLon) lons.push(lo);
    const nL = lats.length, nO = lons.length, N = nL * nO;
    const cells = new Array(N); for (let k = 0; k < N; k++) cells[k] = geodeticToEcef(lats[Math.floor(k / nO)], lons[k % nO], 0);
    const lastSeen = new Float64Array(N).fill(-1), maxGap = new Float64Array(N), sumGap = new Float64Array(N), nGap = new Float64Array(N), accesses = new Int32Array(N), seenAny = new Uint8Array(N), inView = new Uint8Array(N);
    const steps = Math.floor(dur / step);
    for (let k = 0; k < steps; k++) {
      const t = k * step, d = new Date(t0.getTime() + t * 1000); inView.fill(0);
      for (const orb of orbits) {
        const s = stateEcef(orb, d), lam = centralAngle(s.alt, minEl), cosLam = Math.cos(lam), ru = V.unit(s.r);
        for (let c = 0; c < N; c++) { const p = cells[c]; const cosang = (p[0] * ru[0] + p[1] * ru[1] + p[2] * ru[2]) / RE; if (cosang >= cosLam) inView[c] = 1; }
      }
      for (let c = 0; c < N; c++) {
        if (inView[c]) { if (lastSeen[c] >= 0 && lastSeen[c] < t - step) { const gap = t - lastSeen[c]; if (gap > maxGap[c]) maxGap[c] = gap; sumGap[c] += gap; nGap[c]++; } if (lastSeen[c] < t - step) accesses[c]++; lastSeen[c] = t; seenAny[c] = 1; }
      }
    }
    const revisitMax = new Float64Array(N), revisitMean = new Float64Array(N);
    for (let c = 0; c < N; c++) { revisitMax[c] = seenAny[c] ? (nGap[c] ? maxGap[c] / 60 : dur / 60) : NaN; revisitMean[c] = seenAny[c] ? (nGap[c] ? sumGap[c] / nGap[c] / 60 : dur / 60) : NaN; }
    return { lats, lons, nL, nO, revisitMax, revisitMean, accesses, seenAny };
  }
  // daily access statistics for one site
  function siteStats(orbits, lat, lon, opts = {}) {
    const dur = opts.durationS || 86400, minEl = opts.minEl || 5, t0 = opts.t0 || new Date(), step = opts.stepS || 20;
    let all = []; for (const o of orbits) for (const p of passes(o, lat, lon, 0, t0, dur, minEl, step)) all.push({ ...p, sat: o.name });
    all.sort((a, b) => a.aos - b.aos);
    const gaps = []; for (let i = 1; i < all.length; i++) gaps.push((all[i].aos - all[i - 1].los) / 60000);
    const total = all.reduce((s, p) => s + p.duration, 0);
    return { passes: all, count: all.length, totalMin: total / 60, meanGapMin: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : dur / 60, maxGapMin: gaps.length ? Math.max(...gaps) : dur / 60, meanDurMin: all.length ? total / all.length / 60 : 0 };
  }

  // ---------- geolocation geometry ----------
  // TDOA/FDOA Jacobians in the local East-North tangent plane at emitter p (ECEF), sats: [{r, v}] ECEF
  function geoJacobians(p, sats, pairs) {
    const g = ecefToGeodetic(p), b = enuBasis(g.lat, g.lon);
    const rows = { tdoa: [], fdoa: [] };
    const u = sats.map(s => V.unit(V.sub(p, s.r)));         // unit vectors sat->emitter
    const d = sats.map(s => V.norm(V.sub(p, s.r)));
    // gradient of range |p - r_i| wrt p is u_i ; gradient of range-rate (v_i·u_i) wrt p: (v_i - (v_i·u_i) u_i)/d_i   [sign: emitter fixed, sat moving]
    const gr = sats.map((s, i) => u[i]);
    const gf = sats.map((s, i) => { const vu = V.dot(s.v, u[i]); return V.scale(V.sub(s.v, V.scale(u[i], vu)), -1 / d[i]); });
    for (const [i, j] of pairs) {
      const dt = V.sub(gr[i], gr[j]), df = V.sub(gf[i], gf[j]);
      rows.tdoa.push([V.dot(dt, b.e), V.dot(dt, b.n)]);  // km per km (dimensionless) -> multiply by 1/c for s/km
      rows.fdoa.push([V.dot(df, b.e), V.dot(df, b.n)]);  // (km/s)/km = 1/s ; scale by f0/c for Hz/km
    }
    return rows;
  }
  // measurements: TDOA (s) and range-rate differences (km/s)
  function measurements(p, sats, pairs, f0Hz) {
    const d = sats.map(s => V.norm(V.sub(p, s.r)));
    const rr = sats.map((s, i) => V.dot(s.v, V.unit(V.sub(p, s.r))) * -1); // range-rate (km/s): negative when approaching... (d/dt |p - r| = -v·u)
    return pairs.map(([i, j]) => ({ tdoa: (d[i] - d[j]) / C, rrd: rr[i] - rr[j], fdoa: f0Hz ? (rr[i] - rr[j]) * f0Hz / C : null }));
  }
  function inv2(m) { const det = m[0][0] * m[1][1] - m[0][1] * m[1][0]; if (Math.abs(det) < 1e-18) return null; return [[m[1][1] / det, -m[0][1] / det], [-m[1][0] / det, m[0][0] / det]]; }
  // Covariance (km^2, EN frame) of least-squares fix given rows H (scaled to measurement units) and per-row sigma
  function covariance(H, sig) {
    let a = 0, bb = 0, c = 0; for (let k = 0; k < H.length; k++) { const w = 1 / (sig[k] * sig[k]); a += w * H[k][0] * H[k][0]; bb += w * H[k][0] * H[k][1]; c += w * H[k][1] * H[k][1]; }
    return inv2([[a, bb], [bb, c]]);
  }
  function ellipse(cov, prob = 0.95) {
    if (!cov) return null;
    const a = cov[0][0], b = cov[0][1], c = cov[1][1];
    const tr = a + c, det = a * c - b * b, disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    const k = Math.sqrt(-2 * Math.log(1 - prob)); // chi-square 2 dof scale
    const ang = 0.5 * Math.atan2(2 * b, a - c) * R2D; // from East axis towards North
    const s1 = Math.sqrt(Math.max(l1, 0)), s2 = Math.sqrt(Math.max(l2, 0));
    return { semiMajor: k * s1, semiMinor: k * s2, angleDeg: ang, cep: 0.59 * (s1 + s2), drms: Math.sqrt(l1 + l2), sigmaMajor: s1, sigmaMinor: s2 };
  }
  // Complete geolocation CRLB for emitter at lat/lon, satellites ECEF states, options {sigmaT (s), sigmaF (Hz), f0 (Hz), useTdoa, useFdoa, pairs}
  function geoAccuracy(lat, lon, sats, opt = {}) {
    const p = geodeticToEcef(lat, lon, 0);
    const pairs = opt.pairs || (() => { const pr = []; for (let i = 1; i < sats.length; i++) pr.push([0, i]); return pr; })();
    const J = geoJacobians(p, sats, pairs); const H = [], S = [];
    if (opt.useTdoa !== false && sats.length >= 2) J.tdoa.forEach(r => { H.push([r[0] / C, r[1] / C]); S.push(opt.sigmaT || 20e-9); });
    if (opt.useFdoa && sats.length >= 2 && opt.f0) J.fdoa.forEach(r => { H.push([r[0] * opt.f0 / C, r[1] * opt.f0 / C]); S.push(opt.sigmaF || 1); });
    if (H.length < 2) return null;
    const cov = covariance(H, S); return cov ? { cov, ellipse: ellipse(cov, opt.prob || 0.95), pairs } : null;
  }
  // visibility of emitter from satellite (elevation at emitter >= minEl)
  function visibleFrom(lat, lon, satEcef, minEl = 5) { return lookAngles(lat, lon, 0, satEcef).el >= minEl; }
  // Doppler shift (Hz) seen at satellite for emitter at lat/lon transmitting f0 (Hz)
  function doppler(lat, lon, sat, f0) { const p = geodeticToEcef(lat, lon, 0); const u = V.unit(V.sub(sat.r, p)); const rr = V.dot(sat.v, u); return -rr / C * f0; }
  // TDOA and FDOA lines of position: evaluate residual on a local grid for contouring
  function lopGrid(sats, pairIdx, trueLat, trueLon, spanDeg, n, f0) {
    const [i, j] = pairIdx, p0 = geodeticToEcef(trueLat, trueLon, 0);
    const m0 = measurements(p0, [sats[i], sats[j]], [[0, 1]], f0)[0];
    const vals = new Float64Array(n * n), fvals = new Float64Array(n * n), lats = [], lons = [];
    const cosl = Math.cos(trueLat * D2R);
    for (let r = 0; r < n; r++) lats.push(trueLat - spanDeg + 2 * spanDeg * r / (n - 1));
    for (let c = 0; c < n; c++) lons.push(trueLon - spanDeg / cosl + 2 * spanDeg / cosl * c / (n - 1));
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const p = geodeticToEcef(lats[r], lons[c], 0); const m = measurements(p, [sats[i], sats[j]], [[0, 1]], f0)[0]; vals[r * n + c] = (m.tdoa - m0.tdoa) * 1e6; fvals[r * n + c] = m.fdoa != null ? m.fdoa - m0.fdoa : 0; }
    return { lats, lons, n, tdoaUs: vals, fdoaHz: fvals };
  }

  // ---------- RF helpers ----------
  const RF = {
    fspl(dKm, fMHz) { return 20 * Math.log10(dKm) + 20 * Math.log10(fMHz) + 32.45; },
    kTB(bHz, tK = 290) { return 10 * Math.log10(1.380649e-23 * tK * bHz) + 30; }, // dBm
    sensitivity(bHz, nfDb, snrDb, tK = 290) { return RF.kTB(bHz, tK) + nfDb + snrDb; },
    rxPower(eirpDbm, dKm, fMHz, gRxDbi, lossDb = 0) { return eirpDbm - RF.fspl(dKm, fMHz) + gRxDbi - lossDb; },
    apertureGain(diamM, fMHz, eff = 0.6) { const lam = 299.792458 / fMHz; return 10 * Math.log10(eff * (Math.PI * diamM / lam) ** 2); },
    beamwidth(diamM, fMHz) { const lam = 299.792458 / fMHz; return 70 * lam / diamM; },
    helixGain(turns, fMHz, circumferenceLam = 1, spacingLam = 0.25) { return 10 * Math.log10(15 * turns * spacingLam * circumferenceLam ** 2); },
    // TDOA timing std (s) for rectangular-spectrum signal bandwidth B (Hz), integration T (s), effective SNR gamma (linear).
    // Knapp–Carter form: 1/(beta*sqrt(2*B*T*gamma)) with beta = 2*pi*B/sqrt(12). The Stein form used by HawkEye 360 and
    // research note 03 (sigma = 1/(beta*sqrt(B*T*gamma))) is sqrt(2) larger: use the *Stein variants below to reproduce the note's 139 ns example.
    sigmaTdoa(bHz, tS, snrLin) { const beta = bHz / Math.sqrt(12) * 2 * Math.PI; return 1 / (beta * Math.sqrt(2 * bHz * tS * snrLin)); },
    sigmaFdoa(bHz, tS, snrLin) { const te = tS / Math.sqrt(12) * 2 * Math.PI; return 1 / (te * Math.sqrt(2 * bHz * tS * snrLin)); },
    sigmaTdoaStein(bHz, tS, snrLin) { const beta = bHz / Math.sqrt(12) * 2 * Math.PI; return 1 / (beta * Math.sqrt(bHz * tS * snrLin)); },
    sigmaFdoaStein(bHz, tS, snrLin) { const te = tS / Math.sqrt(12) * 2 * Math.PI; return 1 / (te * Math.sqrt(bHz * tS * snrLin)); },
    wavelength(fMHz) { return 299.792458 / fMHz; },
  };

  global.ORB = { RE, MU, J2, WE, C, D2R, R2D, V, jd, gmst, sunEci, geodeticToEcef, ecefToGeodetic, eciToEcef, ecefToEci, enuBasis, lookAngles, greatCircleKm, destination,
    centralAngle, footprintRadiusKm, slantRange, nadirAngle, footprintPolygon, period, velocity, ssoInclination,
    makeOrbit, stateEci, stateEcef, groundTrack, isSunlit, eclipseFraction, walker, cluster, passes, coverageGrid, siteStats,
    geoJacobians, measurements, covariance, ellipse, geoAccuracy, visibleFrom, doppler, lopGrid, RF };
})(window);
