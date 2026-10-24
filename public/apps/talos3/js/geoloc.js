/* TALOS-3 simulator — TDOA / FDOA geolocation engine.
   1. collect(): geometry + link budgets per snapshot; each measurement gets its white (CRLB) noise and
      linear sensitivities to the systematic error sources that are constant over a collection:
      per-satellite clock offset, ephemeris position/velocity, LO frequency offset, ionospheric slant
      delay, and the unknown emitter velocity. R = diag(σ_w²) + G Σ Gᵀ is the full measurement covariance.
   2. draw(): one random realisation — truth geometry + sampled biases + white noise; the estimator's
      ephemeris is truth + ephemeris error.
   3. solve(): global grid search over the coverage circle on the WGS-84 surface, then
      generalised least squares (Levenberg–Marquardt, Cholesky-whitened by R) in (lat, lon[, Δf]).
   4. predict(): analytic covariance (Hᵀ R⁻¹ H)⁻¹ at the truth, used by mission planning. */
'use strict';
(function (S) {
  const { C, V } = S;
  const G = S.Geo = {};
  const CKM = C.CKM;

  G.defaults = () => ({
    mode: 'TF',          // TF hybrid | T TDOA-only | F FDOA-only | FOA single-satellite frequency-of-arrival
    nSnap: 12, dtSnap: 10, tIntScale: 1,
    clkNs: 15, posM: 2.0, velMms: 5, yLo: 1e-11, tecu: 20, ionoGrad: 0.08, tgtSpd: 7,
    elMask: 5, detDb: 13, mcN: 200
  });
  G.MODES = { TF: 'TDOA + FDOA hybrid', T: 'TDOA only', F: 'FDOA only', FOA: 'Single-satellite Doppler (FOA)' };
  G.GROUPS = ['Thermal noise (CRLB)', 'Clock sync', 'Ephemeris position', 'Ephemeris velocity', 'LO stability', 'Ionosphere', 'Target motion (assumed)', 'Emitter carrier drift'];

  G.collect = (em, sats, tc, cfg) => {
    const n = cfg.nSnap, times = [];
    for (let k = 0; k < n; k++) times.push(tc + (k - (n - 1) / 2) * cfg.dtSnap * 1000);
    const tInt = em.tInt * cfg.tIntScale, onFrac = S.onFraction(em), f0 = em.f * 1e6, mask = cfg.elMask * C.DEG;
    const snaps = times.map(t => {
      const es = S.emitterState(em, t), ss = sats.map(s => s.orbit.stateEcef(t));
      return { t, es, ss, lk: sats.map((s, i) => S.link(em, es, s, ss[i], t)) };
    });
    const visOf = l => l.visible && l.el >= mask && l.snr > -35;
    let ref = 0, best = -1e9;                  // reference = best mean SNR while visible
    sats.forEach((s, i) => {
      const v = snaps.filter(sn => visOf(sn.lk[i]));
      const m = v.length ? v.reduce((a, sn) => a + sn.lk[i].snr, 0) / v.length + 3 * v.length : -1e9;
      if (m > best) { best = m; ref = i; }
    });

    // systematic error sources (index -> σ, group)
    const src = [], idx = {};
    const reg = (key, sigma, group) => { if (!(key in idx)) { idx[key] = src.length; src.push({ key, sigma, group }); } return idx[key]; };
    const vA = em.mobile ? cfg.tgtSpd : 0.3, tMid = times[Math.floor(n / 2)];
    const defs = [];
    snaps.forEach((sn, k) => {
      const lr = sn.lk[ref];
      if (!visOf(lr)) return;
      const dt = (sn.t - tMid) / 1000;
      // analytic gradients of range ρ and range-rate ρ̇ for each satellite (static-emitter model)
      const gs = sats.map((s, i) => {
        const d = V.sub(sn.ss[i].r, sn.es.r), rho = V.norm(d), u = V.mul(d, 1 / rho), v = sn.ss[i].v;
        return { u, dRdr: V.mul(V.sub(v, V.mul(u, V.dot(u, v))), 1 / rho) };     // ∂ρ/∂r = u, ∂ρ̇/∂r = dRdr, ∂ρ̇/∂v = u
      });
      const eE = S.enu2ecef(sn.es.lat, sn.es.lon, [1, 0, 0]), eN = S.enu2ecef(sn.es.lat, sn.es.lon, [0, 1, 0]);
      const veSrc = [reg('veE', vA / Math.SQRT2 / 1000, 6), reg('veN', vA / Math.SQRT2 / 1000, 6)];
      // h-gradients for one measurement: wrt sat position/velocity, emitter position, emitter velocity
      const grads = (type, i, j) => {
        const k0 = f0 / CKM, gi = gs[i], gj = j >= 0 ? gs[j] : null, z3 = [0, 0, 0];
        if (type === 'T') return { ri: V.mul(gi.u, 1 / CKM), rj: V.mul(gj.u, -1 / CKM), vi: z3, vj: z3, x: V.mul(V.sub(gj.u, gi.u), 1 / CKM), ve: z3 };
        if (type === 'F') return { ri: V.mul(gi.dRdr, -k0), rj: V.mul(gj.dRdr, k0), vi: V.mul(gi.u, -k0), vj: V.mul(gj.u, k0),
          x: V.mul(V.sub(gi.dRdr, gj.dRdr), k0), ve: V.mul(V.sub(gi.u, gj.u), k0) };
        return { ri: V.mul(gi.dRdr, -k0), rj: z3, vi: V.mul(gi.u, -k0), vj: z3, x: V.mul(gi.dRdr, k0), ve: V.mul(gi.u, k0) };
      };
      // systematic sensitivities in the z − h convention: ephemeris error δ enters as −∇h·δ,
      // emitter motion as ∇ₓh·v_e·Δt + ∇ᵥh·v_e
      const geomSens = (type, i, j, sens) => {
        const g = grads(type, i, j);
        for (let a = 0; a < 3; a++) {
          sens.push([reg(`pos${i}${a}`, cfg.posM / 1000, 2), -g.ri[a]], [reg(`vel${i}${a}`, cfg.velMms * 1e-6, 3), -g.vi[a]]);
          if (j >= 0) sens.push([reg(`pos${j}${a}`, cfg.posM / 1000, 2), -g.rj[a]], [reg(`vel${j}${a}`, cfg.velMms * 1e-6, 3), -g.vj[a]]);
        }
        sens.push([veSrc[0], V.dot(g.x, eE) * dt + V.dot(g.ve, eE)], [veSrc[1], V.dot(g.x, eN) * dt + V.dot(g.ve, eN)]);
        return sens;
      };
      if (cfg.mode === 'FOA') {
        const cr = S.singleCrlbF(lr.snr, em.bw, tInt, onFrac);
        if (cr.postDb < cfg.detDb) return;
        const sens = geomSens('A', ref, -1, [[reg(`lo${ref}`, cfg.yLo, 4), f0]]);
        defs.push({ k, type: 'A', i: ref, j: -1, f0, crlb: cr.sF, drift: f0 * em.yEmit * 0.05, post: cr.postDb, snrI: lr.snr, snrJ: null,
          white: Math.hypot(cr.sF, f0 * em.yEmit * 0.05), sens, truth: f0 - f0 * lr.rr / CKM });
        return;
      }
      sats.forEach((s, i) => {
        const li = sn.lk[i];
        if (i === ref || !visOf(li)) return;
        const cr = S.pairCrlb(li.snr, lr.snr, em.bw, tInt, onFrac);
        if (cr.postDb < cfg.detDb) return;
        const base = { k, i, j: ref, f0, post: cr.postDb, snrI: li.snr, snrJ: lr.snr, gEff: cr.gEffDb, du: V.norm(V.sub(gs[i].u, gs[ref].u)) };
        if (cfg.mode !== 'F') {
          const dI = S.ionoDelay(em.f, cfg.tecu, li.el), dJ = S.ionoDelay(em.f, cfg.tecu, lr.el);
          const sens = geomSens('T', i, ref, [[reg(`clk${i}`, cfg.clkNs * 1e-9, 1), 1], [reg(`clk${ref}`, cfg.clkNs * 1e-9, 1), -1],
            [reg(`ion${i}`, cfg.ionoGrad, 5), dI], [reg(`ion${ref}`, cfg.ionoGrad, 5), -dJ], [reg(`ionb${i}`, 1, 5), dI - dJ]]);
          defs.push(Object.assign({ type: 'T', crlb: cr.sT, white: cr.sT, ionoI: dI, ionoJ: dJ, sens, truth: (li.range - lr.range) / CKM }, base));
        }
        if (cfg.mode !== 'T') {
          const sens = geomSens('F', i, ref, [[reg(`lo${i}`, cfg.yLo, 4), f0], [reg(`lo${ref}`, cfg.yLo, 4), -f0]]);
          defs.push(Object.assign({ type: 'F', crlb: cr.sF, white: cr.sF, sens, truth: -f0 / CKM * (li.rr - lr.rr) }, base));
        }
      });
    });
    // full covariance and per-measurement σ / budget
    const M = defs.length, R = new Float64Array(M * M);
    defs.forEach((d, m) => {
      R[m * M + m] += d.white * d.white;
      d.groups = new Array(G.GROUPS.length).fill(0);
      d.groups[0] = d.crlb * d.crlb; if (d.drift) d.groups[7] = d.drift * d.drift;
      d.vec = new Map();
      for (const [s, c] of d.sens) { d.vec.set(s, (d.vec.get(s) || 0) + c); }
      for (const [s, c] of d.vec) d.groups[src[s].group] += (c * src[s].sigma) ** 2;
    });
    for (let a = 0; a < M; a++) for (let b = a; b < M; b++) {
      let s = 0; for (const [q, c] of defs[a].vec) { const c2 = defs[b].vec.get(q); if (c2) s += c * c2 * src[q].sigma ** 2; }
      R[a * M + b] += s; if (b !== a) R[b * M + a] += s;
    }
    defs.forEach((d, m) => { d.sigma = Math.sqrt(R[m * M + m]); d.groups = d.groups.map(Math.sqrt); });
    const mid = snaps[Math.floor(n / 2)];
    return { em, sats, cfg, times, snaps, ref, defs, src, R, L: chol(R, M), tInt, onFrac, tc, truthMid: mid.es, vAssume: vA };
  };

  // Cholesky factor (lower, row-major) with a tiny diagonal load for numerical safety
  function chol(R, M) {
    const L = new Float64Array(M * M);
    for (let i = 0; i < M; i++) {
      for (let j = 0; j <= i; j++) {
        let s = R[i * M + j];
        for (let k = 0; k < j; k++) s -= L[i * M + k] * L[j * M + k];
        if (i === j) L[i * M + i] = Math.sqrt(Math.max(s, R[i * M + i] * 1e-12 + 1e-300));
        else L[i * M + j] = s / L[j * M + j];
      }
    }
    return L;
  }
  const whiten = (L, M, x) => {
    const y = new Float64Array(M);
    for (let i = 0; i < M; i++) { let s = x[i]; for (let k = 0; k < i; k++) s -= L[i * M + k] * y[k]; y[i] = s / L[i * M + i]; }
    return y;
  };

  G.draw = (col, seed) => {
    const r = S.rng(seed), cfg = col.cfg;
    const bias = col.sats.map(() => ({
      clk: r.gauss() * cfg.clkNs * 1e-9,
      dr: [r.gauss(), r.gauss(), r.gauss()].map(x => x * cfg.posM / 1000),
      dv: [r.gauss(), r.gauss(), r.gauss()].map(x => x * cfg.velMms * 1e-6),
      y: r.gauss() * cfg.yLo, xi: r.gauss()
    }));
    const yE = r.gauss() * col.em.yEmit;
    const est = col.snaps.map(sn => sn.ss.map((s, i) => ({ r: V.add(s.r, bias[i].dr), v: V.add(s.v, bias[i].dv) })));
    const z = col.defs.map(d => {
      if (d.type === 'T') {
        const iono = d.ionoI * (1 + cfg.ionoGrad * bias[d.i].xi) - d.ionoJ * (1 + cfg.ionoGrad * bias[d.j].xi);
        return d.truth + bias[d.i].clk - bias[d.j].clk + iono + r.gauss() * d.crlb;
      }
      if (d.type === 'F') return d.truth + d.f0 * (bias[d.i].y - bias[d.j].y) + r.gauss() * d.crlb;
      return d.truth + d.f0 * yE + d.f0 * bias[d.i].y + r.gauss() * d.white;
    });
    return { z, est, bias, yE, seed };
  };

  /* ---------- packed measurement model ---------- */
  const pack = (col, states, z) => {
    const M = col.defs.length, A = new Float64Array(M * 6), B = new Float64Array(M * 6);
    const typ = new Int8Array(M), f0 = new Float64Array(M), w = new Float64Array(M), zz = new Float64Array(M);
    col.defs.forEach((d, m) => {
      const a = states[d.k][d.i]; A.set(a.r, m * 6); A.set(a.v, m * 6 + 3);
      if (d.j >= 0) { const b = states[d.k][d.j]; B.set(b.r, m * 6); B.set(b.v, m * 6 + 3); }
      typ[m] = d.type === 'T' ? 0 : d.type === 'F' ? 1 : 2; f0[m] = d.f0; w[m] = 1 / d.sigma; zz[m] = z ? z[m] : d.truth;
    });
    return { M, A, B, typ, f0, w, z: zz, L: col.L, alt: col.em.alt, foa: col.cfg.mode === 'FOA' };
  };
  const model = (pk, P, out) => {
    const A = pk.A, B = pk.B;
    for (let m = 0; m < pk.M; m++) {
      const o = m * 6, ax = A[o] - P[0], ay = A[o + 1] - P[1], az = A[o + 2] - P[2];
      const ra = Math.sqrt(ax * ax + ay * ay + az * az), t = pk.typ[m];
      if (t === 2) { out[m] = pk.f0[m] - pk.f0[m] / CKM * (ax * A[o + 3] + ay * A[o + 4] + az * A[o + 5]) / ra; continue; }
      const bx = B[o] - P[0], by = B[o + 1] - P[1], bz = B[o + 2] - P[2], rb = Math.sqrt(bx * bx + by * by + bz * bz);
      out[m] = t === 0 ? (ra - rb) / CKM
        : -pk.f0[m] / CKM * ((ax * A[o + 3] + ay * A[o + 4] + az * A[o + 5]) / ra - (bx * B[o + 3] + by * B[o + 4] + bz * B[o + 5]) / rb);
    }
  };
  // diagonal-weighted cost for the coarse grid; FOA solves Δf in closed form
  const costAt = (pk, lat, lon, buf) => {
    model(pk, S.geo2ecef(lat, lon, pk.alt), buf);
    let df = 0;
    if (pk.foa) { let sw = 0, s = 0; for (let m = 0; m < pk.M; m++) { const w2 = pk.w[m] ** 2; s += w2 * (pk.z[m] - buf[m]); sw += w2; } df = s / sw; }
    let c = 0;
    for (let m = 0; m < pk.M; m++) { const r = (pk.z[m] - buf[m] - (pk.typ[m] === 2 ? df : 0)) * pk.w[m]; c += r * r; }
    return { c, df };
  };
  // GLS-whitened residuals and Jacobian wrt (lat, lon[, df])
  const jac = (pk, x) => {
    const M = pk.M, p = x.length, h0 = new Float64Array(M), h1 = new Float64Array(M), h2 = new Float64Array(M);
    model(pk, S.geo2ecef(x[0], x[1], pk.alt), h0);
    const dLat = 2e-7, dLon = 2e-7 / Math.max(Math.cos(x[0]), 0.05);
    model(pk, S.geo2ecef(x[0] + dLat, x[1], pk.alt), h1);
    model(pk, S.geo2ecef(x[0], x[1] + dLon, pk.alt), h2);
    const r = new Float64Array(M), cols = Array.from({ length: p }, () => new Float64Array(M));
    for (let m = 0; m < M; m++) {
      const isA = pk.typ[m] === 2;
      r[m] = pk.z[m] - h0[m] - (isA && p === 3 ? x[2] : 0);
      cols[0][m] = (h1[m] - h0[m]) / dLat; cols[1][m] = (h2[m] - h0[m]) / dLon;
      if (p === 3) cols[2][m] = isA ? 1 : 0;
    }
    const rw = whiten(pk.L, M, r), cw = cols.map(c => whiten(pk.L, M, c));
    const J = []; for (let m = 0; m < M; m++) J.push(cw.map(c => c[m]));
    return { r: rw, J };
  };
  const normal = (J, r, p) => {
    const A = Array.from({ length: p }, () => new Array(p).fill(0)), g = new Array(p).fill(0);
    for (let m = 0; m < J.length; m++) for (let a = 0; a < p; a++) { g[a] += J[m][a] * r[m]; for (let b = 0; b < p; b++) A[a][b] += J[m][a] * J[m][b]; }
    return { A, g };
  };
  const lm = (pk, x0) => {
    let x = x0.slice(), { r, J } = jac(pk, x), cost = r.reduce((s, v) => s + v * v, 0), lam = 1e-3, it = 0;
    for (; it < 40; it++) {
      const { A, g } = normal(J, r, x.length);
      const Al = A.map((row, a) => row.map((v, b) => a === b ? v * (1 + lam) + 1e-30 : v));
      const d = S.solve(Al, g);
      if (!d) break;
      const xn = x.map((v, a) => v + d[a]);
      const t = jac(pk, xn), cn = t.r.reduce((s, v) => s + v * v, 0);
      if (cn < cost) {
        x = xn; r = t.r; J = t.J; lam = Math.max(lam / 3, 1e-9);
        const stepM = Math.hypot(d[0] * C.RE * 1000, d[1] * Math.cos(x[0]) * C.RE * 1000);
        const done = stepM < 0.05 || (cost - cn) / cost < 1e-10;
        cost = cn; if (done) break;
      } else { lam *= 5; if (lam > 1e8) break; }
    }
    return { x, cost, it, J, r };
  };
  const enuCov = (P, lat, h) => {
    const s = Math.sin(lat), w = Math.sqrt(1 - C.E2 * s * s);
    const Rn = C.RE / w * 1000, Rm = C.RE * (1 - C.E2) / (w * w * w) * 1000;
    const kE = (Rn + h * 1000) * Math.cos(lat), kN = Rm + h * 1000;
    return { ee: P[1][1] * kE * kE, en: P[0][1] * kE * kN, nn: P[0][0] * kN * kN };
  };
  const offsets = (tr, lat, lon) => ({
    dE: S.gcDist(tr.lat, tr.lon, tr.lat, lon) * 1000 * Math.sign(S.wrapPi(lon - tr.lon)),
    dN: (lat - tr.lat) * C.RM * 1000
  });
  const finish = (col, pk, sol) => {
    const p = sol.x.length, { A } = normal(sol.J, sol.r, p), P = S.inv(A);
    if (!P) return { ok: false, reason: 'Singular geometry (normal matrix not invertible).' };
    const cv = enuCov(P, sol.x[0], pk.alt), ell = S.ellipse(cv.ee, cv.en, cv.nn);
    const tr = col.truthMid, miss = S.gcDist(sol.x[0], sol.x[1], tr.lat, tr.lon) * 1000, o = offsets(tr, sol.x[0], sol.x[1]);
    // raw residuals normalised by each measurement's own σ (for the table)
    const h = new Float64Array(pk.M); model(pk, S.geo2ecef(sol.x[0], sol.x[1], pk.alt), h);
    const resid = Array.from(h, (v, m) => (pk.z[m] - v - (pk.typ[m] === 2 ? sol.x[2] : 0)) * pk.w[m]);
    const nees = (o.dE * o.dE * cv.nn - 2 * o.dE * o.dN * cv.en + o.dN * o.dN * cv.ee) / (cv.ee * cv.nn - cv.en * cv.en);
    return { ok: true, lat: sol.x[0], lon: S.wrapPi(sol.x[1]), df: p === 3 ? sol.x[2] : 0, cov: cv, ell, miss, nees,
      chi2: sol.cost / Math.max(pk.M - p, 1), iters: sol.it, nMeas: pk.M, resid, dE: o.dE, dN: o.dN };
  };

  G.solve = (col, dr, opt = {}) => {
    const foa = col.cfg.mode === 'FOA', p = foa ? 3 : 2;
    if (col.defs.length < p + 1) return { ok: false, reason: `Only ${col.defs.length} usable measurements: the pass geometry or SNR does not support a ${G.MODES[col.cfg.mode]} fix.` };
    const pk = pack(col, dr.est, dr.z), buf = new Float64Array(pk.M);
    let starts;
    if (opt.start) starts = [opt.start];
    else {
      const mid = Math.floor(col.snaps.length / 2), g0 = S.ecef2geo(dr.est[mid][col.ref].r);
      const R = S.coverageAngle(C.RE + g0.h, col.cfg.elMask * C.DEG) * C.RM;
      const prj = new S.AzEq(g0.lat, g0.lon), N = 81, step = 2 * R / (N - 1), pts = [];
      for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++) {
        const x = -R + ix * step, y = -R + iy * step;
        if (x * x + y * y > R * R) continue;
        const [la, lo] = prj.inv(x, y), q = costAt(pk, la, lo, buf);
        pts.push({ la, lo, c: q.c, df: q.df });
      }
      pts.sort((a, b) => a.c - b.c);
      const cand = [pts[0]];
      for (const q of pts) { if (cand.length >= 3) break; if (cand.every(c => S.gcDist(c.la, c.lo, q.la, q.lo) > 250)) cand.push(q); }
      starts = cand.map(c => {
        const lp = new S.AzEq(c.la, c.lo); let b = c;
        for (let iy = -6; iy <= 6; iy++) for (let ix = -6; ix <= 6; ix++) {
          const [la, lo] = lp.inv(ix * step / 6, iy * step / 6), q = costAt(pk, la, lo, buf);
          if (q.c < b.c) b = { la, lo, c: q.c, df: q.df };
        }
        return foa ? [b.la, b.lo, b.df] : [b.la, b.lo];
      });
    }
    let best = null, all = [];
    for (const s of starts) { const sol = lm(pk, s); all.push(sol); if (!best || sol.cost < best.cost) best = sol; }
    const res = finish(col, pk, best);
    if (res.ok) {
      res.candidates = starts.length;
      // a second basin within a few χ² units flags a geometric (mirror) ambiguity
      const alt = all.filter(s => s !== best && S.gcDist(s.x[0], s.x[1], best.x[0], best.x[1]) > 50).sort((a, b) => a.cost - b.cost)[0];
      res.ambiguity = alt && alt.cost - best.cost < 25 ? { lat: alt.x[0], lon: alt.x[1], dChi2: alt.cost - best.cost } : null;
    }
    return res;
  };

  G.predict = col => {
    const foa = col.cfg.mode === 'FOA', p = foa ? 3 : 2;
    if (col.defs.length < p + 1) return null;
    const pk = pack(col, col.snaps.map(sn => sn.ss), null), tr = col.truthMid;
    const { J } = jac(pk, foa ? [tr.lat, tr.lon, 0] : [tr.lat, tr.lon]);
    const { A } = normal(J, new Float64Array(J.length), p), P = S.inv(A);
    if (!P) return null;
    const cv = enuCov(P, tr.lat, pk.alt);
    return { cov: cv, ell: S.ellipse(cv.ee, cv.en, cv.nn), nMeas: pk.M };
  };

  G.monteCarlo = (col, sol, n, seed0) => {
    const pts = [], start = col.cfg.mode === 'FOA' ? [sol.lat, sol.lon, sol.df] : [sol.lat, sol.lon], tr = col.truthMid;
    for (let k = 0; k < n; k++) {
      const dr = G.draw(col, seed0 + 7919 * (k + 1)), s = lm(pack(col, dr.est, dr.z), start);
      pts.push(Object.assign({ lat: s.x[0], lon: s.x[1] }, offsets(tr, s.x[0], s.x[1])));
    }
    const rad = pts.map(p => Math.hypot(p.dE, p.dN)).sort((a, b) => a - b);
    return { pts, cep50: rad[Math.floor(n * 0.5)], r95: rad[Math.floor(n * 0.95)],
      biasE: pts.reduce((s, p) => s + p.dE, 0) / n, biasN: pts.reduce((s, p) => s + p.dN, 0) / n };
  };

  /* ---------- error budget of one measurement: 1σ per group, in range-difference m or range-rate cm/s ---------- */
  G.budget = (col, d) => {
    const k = d.type === 'T' ? C.CMS : C.CMS / d.f0 * 100;
    return { unit: d.type === 'T' ? 'm' : 'cm/s', total: d.sigma * k,
      items: G.GROUPS.map((g, q) => [g, d.groups[q] * k]).filter(([, v]) => v > 0) };
  };

  /* ---------- iso-TDOA / iso-FDOA contours on a local grid (marching squares) ---------- */
  G.isoLines = (col, dr, prj, R, N, defIdx) => {
    const pk = pack(col, dr.est, dr.z), vals = defIdx.map(() => new Float32Array(N * N));
    const sub = { M: defIdx.length, A: new Float64Array(defIdx.length * 6), B: new Float64Array(defIdx.length * 6), typ: new Int8Array(defIdx.length), f0: new Float64Array(defIdx.length) };
    defIdx.forEach((m, q) => { sub.A.set(pk.A.subarray(m * 6, m * 6 + 6), q * 6); sub.B.set(pk.B.subarray(m * 6, m * 6 + 6), q * 6); sub.typ[q] = pk.typ[m]; sub.f0[q] = pk.f0[m]; });
    const out = new Float64Array(defIdx.length), step = 2 * R / (N - 1);
    for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++) {
      const [la, lo] = prj.inv(-R + ix * step, R - iy * step);
      model(sub, S.geo2ecef(la, lo, pk.alt), out);
      for (let q = 0; q < defIdx.length; q++) vals[q][iy * N + ix] = (out[q] - pk.z[defIdx[q]]) * pk.w[defIdx[q]];
    }
    return defIdx.map((m, q) => ({ m, def: col.defs[m], segs: G.march(vals[q], N, -R, R, step) }));
  };
  G.march = (v, N, x0, y0, step) => {
    const segs = [], lerp = (a, b) => a / (a - b);
    for (let iy = 0; iy < N - 1; iy++) for (let ix = 0; ix < N - 1; ix++) {
      const a = v[iy * N + ix], b = v[iy * N + ix + 1], c = v[(iy + 1) * N + ix + 1], d = v[(iy + 1) * N + ix];
      const idx = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const X = x0 + ix * step, Y = y0 - iy * step;
      const top = [X + lerp(a, b) * step, Y], right = [X + step, Y - lerp(b, c) * step];
      const bot = [X + lerp(d, c) * step, Y - step], left = [X, Y - lerp(a, d) * step];
      const add = (p, q) => segs.push(p[0], p[1], q[0], q[1]);
      switch (idx) {
        case 1: case 14: add(left, bot); break;
        case 2: case 13: add(bot, right); break;
        case 3: case 12: add(left, right); break;
        case 4: case 11: add(top, right); break;
        case 6: case 9: add(top, bot); break;
        case 7: case 8: add(left, top); break;
        case 5: add(left, top); add(bot, right); break;
        case 10: add(top, right); add(left, bot); break;
      }
    }
    return new Float32Array(segs);
  };
})(window.SIM);
