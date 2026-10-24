/* TALOS-3 simulator — orbit model.
   Mean-element propagation with J2 secular rates (RAAN, argument of perigee, mean anomaly),
   Kepler solution per epoch, WGS-84 Earth, GMST rotation to ECEF.
   Velocities are central differences of the propagated position (|err| < 1 mm/s), so the
   Doppler model is exactly consistent with the trajectory. */
'use strict';
(function (S) {
  const { C, V } = S;

  // Inclination that makes dΩ/dt equal the Sun's mean motion (360° per tropical year)
  S.ssoInclination = (a, e = 0) => {
    const n = Math.sqrt(C.MU / a ** 3), p = a * (1 - e * e);
    const req = C.TWO_PI / C.TROPICAL_YEAR_S;
    return Math.acos(-req / (1.5 * n * C.J2 * (C.RE / p) ** 2));
  };

  S.Orbit = class {
    constructor(o) {
      Object.assign(this, o);               // a, e, i, raan, argp, M0, epoch(ms)
      const n = Math.sqrt(C.MU / this.a ** 3), p = this.a * (1 - this.e ** 2);
      const k = 1.5 * C.J2 * (C.RE / p) ** 2 * n, ci = Math.cos(this.i);
      this.n = n; this.p = p;
      this.dRaan = -k * ci;                                         // rad/s
      this.dArgp = 0.5 * k * (5 * ci * ci - 1);                     // rad/s
      this.dM = n + 0.5 * k * Math.sqrt(1 - this.e ** 2) * (3 * ci * ci - 1);
      this.periodKepler = C.TWO_PI / n;
      this.periodNodal = C.TWO_PI / (this.dM + this.dArgp);
    }
    elementsAt(ms) {
      const dt = (ms - this.epoch) / 1000;
      return { M: this.M0 + this.dM * dt, w: this.argp + this.dArgp * dt, O: this.raan + this.dRaan * dt };
    }
    posEci(ms) {
      const { M, w, O } = this.elementsAt(ms), e = this.e;
      let E = M;
      for (let k = 0; k < 8; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      const cE = Math.cos(E), sE = Math.sin(E), r = this.a * (1 - e * cE);
      const u = w + Math.atan2(Math.sqrt(1 - e * e) * sE, cE - e);
      const cO = Math.cos(O), sO = Math.sin(O), ci = Math.cos(this.i), si = Math.sin(this.i), cu = Math.cos(u), su = Math.sin(u);
      return [r * (cO * cu - sO * su * ci), r * (sO * cu + cO * su * ci), r * su * si];
    }
    stateEci(ms) {
      const h = 500, a = this.posEci(ms - h), b = this.posEci(ms + h);
      return { r: this.posEci(ms), v: V.mul(V.sub(b, a), 1000 / (2 * h)) };
    }
    posEcef(ms) { return S.eci2ecef(this.posEci(ms), ms); }
    stateEcef(ms) {
      const h = 500, a = this.posEcef(ms - h), b = this.posEcef(ms + h);
      return { r: this.posEcef(ms), v: V.mul(V.sub(b, a), 1000 / (2 * h)) };
    }
    geo(ms) { return S.ecef2geo(this.posEcef(ms)); }
  };

  /* Formation: identical a, e, i. Along-track offsets via mean anomaly, cross-track via ΔΩ
     (equal inclinations => equal J2 RAAN rates => the formation does not drift apart secularly). */
  S.SAT_COLORS = ['--s1', '--s2', '--s3', '--s4'];
  S.buildCluster = cfg => {
    const a = C.RE + cfg.altKm, e = cfg.ecc;
    const inc = cfg.sso ? S.ssoInclination(a, e) : cfg.incDeg * C.DEG;
    const sun = S.sunEci(cfg.epoch), raSun = Math.atan2(sun[1], sun[0]);
    const raan0 = raSun + (cfg.ltanH - 12) * 15 * C.DEG;
    return cfg.sats.slice(0, cfg.nSats).map((s, k) => ({
      idx: k, id: 'S' + (k + 1), name: `TALOS-3${'ABCD'[k]}`, colorVar: S.SAT_COLORS[k],
      along: s.along, cross: s.cross,
      orbit: new S.Orbit({
        a, e, i: inc,
        raan: raan0 + s.cross / (a * Math.sin(inc)),
        argp: cfg.argpDeg * C.DEG,
        M0: cfg.M0Deg * C.DEG + s.along / a,
        epoch: cfg.epoch
      })
    }));
  };

  // Earth central angle of the coverage circle for a minimum elevation (rad)
  S.coverageAngle = (rKm, elMask) => Math.acos(C.RE / rKm * Math.cos(elMask)) - elMask;
  S.horizonNadir = rKm => Math.asin(C.RE / rKm);

  // Cylindrical Earth shadow; returns true when the satellite is in umbra
  S.inEclipse = (rEci, sunEci) => {
    const s = V.unit(sunEci), d = V.dot(rEci, s);
    if (d > 0) return false;
    return V.norm(V.sub(rEci, V.mul(s, d))) < C.RE;
  };

  S.betaAngle = (orbit, ms) => {
    const st = orbit.stateEci(ms), h = V.unit(V.cross(st.r, st.v));
    return Math.asin(V.dot(h, V.unit(S.sunEci(ms))));
  };

  // Relative position of `b` in the LVLH (radial, along-track, cross-track) frame of `a`, km
  S.lvlh = (a, b, ms) => {
    const sa = a.stateEci(ms), rb = b.posEci(ms);
    const R = V.unit(sa.r), W = V.unit(V.cross(sa.r, sa.v)), Sx = V.cross(W, R), d = V.sub(rb, sa.r);
    return { r: V.dot(d, R), s: V.dot(d, Sx), w: V.dot(d, W) };
  };

  /* Generic visibility windows: scan fn(ms)->bool with `step` ms, then bisect edges to ~20 ms */
  S.windows = (t0, t1, step, fn) => {
    const out = [];
    const edge = (a, b, va) => { for (let k = 0; k < 10; k++) { const m = (a + b) / 2; if (fn(m) === va) a = m; else b = m; } return (a + b) / 2; };
    let prev = fn(t0), start = prev ? t0 : null;
    for (let t = t0 + step; t <= t1; t += step) {
      const cur = fn(t);
      if (cur !== prev) {
        const te = edge(t - step, t, prev);
        if (cur) start = te; else { out.push([start, te]); start = null; }
        prev = cur;
      }
    }
    if (start !== null) out.push([start, t1]);
    return out;
  };

  /* Approximate two-line element set from the mean elements (for export / tooling interop) */
  S.makeTle = (orbit, satnum, name) => {
    const ep = new Date(orbit.epoch), y = ep.getUTCFullYear();
    const doy = (orbit.epoch - Date.UTC(y, 0, 1)) / 86400000 + 1;
    const deg = x => ((x * C.RAD) % 360 + 360) % 360;
    const cks = l => { let s = 0; for (const ch of l) { if (ch >= '0' && ch <= '9') s += +ch; else if (ch === '-') s += 1; } return s % 10; };
    const nRev = (orbit.dM + orbit.dArgp) * 86400 / C.TWO_PI;
    const l1 = `1 ${String(satnum).padStart(5, '0')}U 26900${'ABCD'[satnum % 4]}   ${String(y % 100).padStart(2, '0')}${doy.toFixed(8).padStart(12, '0')}  .00000412  00000-0  21645-4 0  999`;
    const l2 = `2 ${String(satnum).padStart(5, '0')} ${deg(orbit.i).toFixed(4).padStart(8)} ${deg(orbit.raan).toFixed(4).padStart(8)} ${orbit.e.toFixed(7).slice(2)} ${deg(orbit.argp).toFixed(4).padStart(8)} ${deg(orbit.M0).toFixed(4).padStart(8)} ${nRev.toFixed(8).padStart(11)}    1`;
    return [name, l1 + cks(l1), l2 + cks(l2)];
  };
})(window.SIM);
