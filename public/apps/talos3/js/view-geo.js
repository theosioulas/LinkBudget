/* TALOS-3 simulator — Geolocation view: collection picker, processing settings, local map with
   iso-TDOA hyperbolae / iso-FDOA curves, estimate + error ellipses + Monte Carlo cloud,
   cross-ambiguity surface, solution report, error budget and measurement table. */
'use strict';
(function (S) {
  const { C, V } = S, U = S.ui, G = S.Geo;
  const st = () => S.state;
  const A = { coll: null, col: null, dr: null, sol: null, mc: null, iso: null, isoKey: '', caf: null, cafSel: '', R: 60, center: null, prj: null, gen: 0 };
  let mcv, ccv;

  const seedFor = c => c.product ? c.product.seed : Math.floor(S.hash(c.c0 / 1000, c.em.id.charCodeAt(1) * 131 + c.em.id.charCodeAt(2)) * 2 ** 31);
  const sameCfg = (a, b) => Object.keys(a).every(k => a[k] === b[k]);

  const analyze = (c, force) => {
    if (!c) return;
    const gen = ++A.gen, s = st();
    A.coll = c; A.mc = null; A.iso = null; A.isoKey = ''; A.caf = null;
    if (!force && c.product && sameCfg(c.product.gc, s.geoCfg)) { A.col = c.product.col; A.dr = c.product.dr; A.sol = c.product.sol; }
    else {
      A.col = G.collect(c.em, s.sats, c.cMid, Object.assign({}, s.geoCfg));
      A.dr = G.draw(A.col, seedFor(c)); A.sol = G.solve(A.col, A.dr);
    }
    const tr = A.col.truthMid;
    A.center = A.sol.ok ? { lat: A.sol.lat, lon: A.sol.lon } : { lat: tr.lat, lon: tr.lon };
    A.R = A.sol.ok ? S.clamp(A.sol.ell.smaj * A.sol.ell.k95 / 1000 * 7, 6, 900) : 600;
    A.prj = new S.AzEq(A.center.lat, A.center.lon);
    fillCafSel(); renderResult(); listColls(true);
    // heavier work after first paint
    setTimeout(() => {
      if (gen !== A.gen) return;
      if (A.sol.ok && s.geoCfg.mcN > 0) { A.mc = G.monteCarlo(A.col, A.sol, s.geoCfg.mcN, A.dr.seed); renderResult(); }
      runCaf();
    }, 30);
  };

  /* ---------- iso-lines (recomputed when zoom or selection changes) ---------- */
  const ensureIso = () => {
    if (!A.col || !A.col.defs.length || A.col.cfg.mode === 'FOA') { A.iso = null; return; }
    const all = document.getElementById('gl-all').checked, asp = A.aspect || 1.6, key = `${A.gen}:${A.R.toFixed(3)}:${all}:${asp.toFixed(1)}`;
    if (A.isoKey === key) return;
    const ks = [...new Set(A.col.defs.map(d => d.k))], kMid = ks[Math.floor(ks.length / 2)];
    const idx = A.col.defs.map((d, m) => m).filter(m => all || A.col.defs[m].k === kMid);
    A.iso = { kMid, lines: G.isoLines(A.col, A.dr, A.prj, A.R * Math.max(asp, 1) * 1.05, all ? 120 : 170, idx) };
    A.isoKey = key;
  };

  const renderMap = () => {
    if (!U.visible(mcv)) return;
    const { ctx, w, h } = U.fit(mcv);
    ctx.fillStyle = S.tk('ocean'); ctx.fillRect(0, 0, w, h);
    if (!A.col) { ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(13); ctx.fillText('Select a collection on the left.', 20, 30); return; }
    A.aspect = Math.max(w, h) / Math.min(w, h);
    ensureIso();
    const k = Math.min(w, h) / (2 * A.R), cx = w / 2, cy = h / 2, P = A.prj;
    const toS = (x, y) => [cx + x * k, cy - y * k];
    const ll2s = (la, lo) => { const q = P.fwd(la, lo); return q[2] > 0 ? toS(q[0], q[1]) : null; };
    // land
    if (S.world.ready) {
      const latD = A.center.lat * C.RAD, lonD = A.center.lon * C.RAD, rDeg = A.R * 2.5 / 111;
      ctx.fillStyle = S.tk('land'); ctx.strokeStyle = S.tk('land-edge'); ctx.lineWidth = 0.8; ctx.beginPath();
      for (const r of S.world.rings) {
        const b = r.bbox; if (b[1] > latD + rDeg + 2 || b[3] < latD - rDeg - 2) continue;
        if (Math.abs(lonD) < 170 && (b[0] > lonD + rDeg / Math.max(Math.cos(A.center.lat), 0.1) + 5 || b[2] < lonD - rDeg / Math.max(Math.cos(A.center.lat), 0.1) - 5)) continue;
        const p = r.pts; let started = false;
        for (let i = 0; i < p.length; i += 2) { const q = ll2s(p[i + 1] * C.DEG, p[i] * C.DEG); if (!q) continue; started ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); started = true; }
        if (started) ctx.closePath();
      }
      ctx.fill(); ctx.stroke();
    }
    // graticule
    const stepDeg = U.niceStep(A.R * 2 / 111, 4);
    ctx.strokeStyle = S.tk('grid'); ctx.lineWidth = 1; ctx.font = U.mono(9.5); ctx.fillStyle = S.tk('dim');
    const la0 = A.center.lat * C.RAD, lo0 = A.center.lon * C.RAD, span = A.R * 1.6 / 111;
    for (let la = Math.floor((la0 - span) / stepDeg) * stepDeg; la <= la0 + span; la += stepDeg) {
      ctx.beginPath(); let pen = false;
      for (let lo = lo0 - span * 2; lo <= lo0 + span * 2; lo += stepDeg / 10) { const q = ll2s(la * C.DEG, lo * C.DEG); if (!q) continue; pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; }
      ctx.stroke(); const q = ll2s(la * C.DEG, lo0 * C.DEG); if (q) ctx.fillText(`${la.toFixed(stepDeg < 1 ? 2 : 0)}°`, 4, q[1] - 2);
    }
    for (let lo = Math.floor((lo0 - span * 2) / stepDeg) * stepDeg; lo <= lo0 + span * 2; lo += stepDeg) {
      ctx.beginPath(); let pen = false;
      for (let la = la0 - span; la <= la0 + span; la += stepDeg / 10) { const q = ll2s(la * C.DEG, lo * C.DEG); if (!q) continue; pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; }
      ctx.stroke(); const q = ll2s(la0 * C.DEG, lo * C.DEG); if (q) ctx.fillText(`${lo.toFixed(stepDeg < 1 ? 2 : 0)}°`, q[0] + 2, h - 6);
    }
    // iso lines
    const showT = document.getElementById('gl-t').checked, showF = document.getElementById('gl-f').checked;
    if (A.iso) for (const L of A.iso.lines) {
      const d = L.def; if ((d.type === 'T' && !showT) || (d.type === 'F' && !showF)) continue;
      const mid = d.k === A.iso.kMid;
      ctx.strokeStyle = S.rgba(U.satColor(d.i), mid ? 0.95 : 0.35); ctx.lineWidth = mid ? 1.6 : 1;
      ctx.setLineDash(d.type === 'F' ? [6, 4] : []);
      ctx.beginPath(); const sg = L.segs;
      for (let q = 0; q < sg.length; q += 4) { const a = toS(sg[q], sg[q + 1]), b = toS(sg[q + 2], sg[q + 3]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // emitter truth track during the collection
    const tr = A.col.snaps.map(sn => ll2s(sn.es.lat, sn.es.lon)).filter(Boolean);
    if (tr.length > 1) { ctx.strokeStyle = S.tk('fg'); ctx.lineWidth = 1.5; ctx.beginPath(); tr.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); }
    const tm = ll2s(A.col.truthMid.lat, A.col.truthMid.lon);
    // Monte Carlo cloud
    if (A.mc && document.getElementById('gl-mc').checked) {
      ctx.fillStyle = S.rgba(S.tk('s1'), 0.45);
      for (const p of A.mc.pts) { const q = ll2s(p.lat, p.lon); if (q) ctx.fillRect(q[0] - 1.2, q[1] - 1.2, 2.4, 2.4); }
    }
    // AIS claim
    const em = A.col.em;
    if (em.claimed && document.getElementById('gl-ais').checked) {
      const q = ll2s(em.claimed.lat, em.claimed.lon), e = A.sol.ok ? ll2s(A.sol.lat, A.sol.lon) : tm;
      if (q && e) {
        ctx.strokeStyle = S.tk('warn'); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(q[0] - 9, q[1]); ctx.lineTo(q[0] + 9, q[1]); ctx.moveTo(q[0], q[1] - 9); ctx.lineTo(q[0], q[1] + 9); ctx.stroke();
        U.label(ctx, `AIS-reported position (${S.fmtM(S.gcDist(em.claimed.lat, em.claimed.lon, A.sol.ok ? A.sol.lat : A.col.truthMid.lat, A.sol.ok ? A.sol.lon : A.col.truthMid.lon) * 1000)} from fix)`, q[0] + 10, q[1] - 10, S.tk('warn'));
      } else if (e) {
        const qq = P.fwd(em.claimed.lat, em.claimed.lon), ang = Math.atan2(-qq[1], qq[0]);
        const ex = cx + Math.cos(ang) * (Math.min(w, h) / 2 - 24), ey = cy + Math.sin(ang) * (Math.min(w, h) / 2 - 24);
        U.label(ctx, `AIS claim → ${S.fmtM(Math.hypot(qq[0], qq[1]) * 1000)}`, ex, ey, S.tk('warn'), 'center');
      }
    }
    // truth
    if (tm) { U.emitterGlyph(ctx, tm[0], tm[1], U.classColor(em.cls), false); U.label(ctx, 'Truth (sim)', tm[0] + 10, tm[1] + 12, S.tk('muted')); }
    // ambiguity
    if (A.sol.ok && A.sol.ambiguity) { const q = ll2s(A.sol.ambiguity.lat, A.sol.ambiguity.lon); if (q) { ctx.strokeStyle = S.tk('crit'); ctx.beginPath(); ctx.arc(q[0], q[1], 7, 0, 7); ctx.stroke(); U.label(ctx, `Ambiguous solution Δχ² ${A.sol.ambiguity.dChi2.toFixed(1)}`, q[0] + 10, q[1], S.tk('crit')); } }
    // estimate + ellipses
    if (A.sol.ok) {
      const q = ll2s(A.sol.lat, A.sol.lon), e = A.sol.ell, px = k / 1000;
      if (q) {
        U.ellipse(ctx, q[0], q[1], e.smaj * e.k95 * px, e.smin * e.k95 * px, e.angE, S.tk('accent'), S.rgba(S.tk('accent'), 0.1));
        U.ellipse(ctx, q[0], q[1], e.smaj * px, e.smin * px, e.angE, S.tk('accent'), null, [3, 3]);
        ctx.strokeStyle = S.tk('accent'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(q[0] - 8, q[1]); ctx.lineTo(q[0] + 8, q[1]); ctx.moveTo(q[0], q[1] - 8); ctx.lineTo(q[0], q[1] + 8); ctx.stroke();
        U.label(ctx, 'Estimate · 95% ellipse', q[0] + 12, q[1] - 12, S.tk('accent'));
      }
    }
    // satellites off-map: direction arrows from the centre at the mid snapshot
    const sn = A.col.snaps[Math.floor(A.col.snaps.length / 2)];
    sn.ss.forEach((ssat, i) => {
      const g = S.ecef2geo(ssat.r), q = P.fwd(g.lat, g.lon), dist = Math.hypot(q[0], q[1]);
      const sx = cx + q[0] * k, sy = cy - q[1] * k;
      if (sx > 10 && sx < w - 10 && sy > 10 && sy < h - 10) { U.satGlyph(ctx, sx, sy, U.satColor(i), 4); U.label(ctx, st().sats[i].name, sx + 10, sy, U.satColor(i)); return; }
      const ang = Math.atan2(-q[1], q[0]), rr = Math.min(w, h) / 2 - 16 - i * 4;
      const ax = cx + Math.cos(ang) * rr * (w > h ? w / h : 1) * 0.98, ay = cy + Math.sin(ang) * rr;
      const x = S.clamp(ax, 18, w - 18), y = S.clamp(ay, 18, h - 18);
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = U.satColor(i); ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -5); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill(); ctx.restore();
      U.label(ctx, `${st().sats[i].name.slice(-2)} ${dist.toFixed(0)} km`, x - Math.cos(ang) * 30, y - Math.sin(ang) * 14, U.satColor(i), 'center');
    });
    // scale bar
    const sb = U.niceStep(A.R * 0.6, 1), sbp = sb * k;
    ctx.fillStyle = S.tk('fg'); ctx.fillRect(w - 20 - sbp, h - 22, sbp, 3);
    ctx.font = U.mono(10); ctx.textAlign = 'right'; ctx.fillText(sb >= 1 ? `${sb} km` : `${sb * 1000} m`, w - 20, h - 28); ctx.textAlign = 'left';
    document.getElementById('geo-hud').textContent = `centre ${S.fmtLL(A.center.lat, A.center.lon)} · view ±${A.R < 10 ? A.R.toFixed(1) : A.R.toFixed(0)} km · solid = iso-TDOA, dashed = iso-FDOA, colour = satellite paired with ${st().sats[A.col.ref].name}`;
  };

  /* ---------- CAF ---------- */
  const fillCafSel = () => {
    const sel = document.getElementById('caf-pair'), col = A.col;
    if (!col || col.cfg.mode === 'FOA') { sel.innerHTML = '<option>Not applicable</option>'; sel.disabled = true; return; }
    sel.disabled = false;
    const ks = [...new Set(col.defs.map(d => d.k))], pick = [ks[0], ks[Math.floor(ks.length / 2)], ks[ks.length - 1]].filter((v, i, a) => v !== undefined && a.indexOf(v) === i);
    const opts = [];
    for (const k of pick) for (let i = 0; i < col.sats.length; i++) if (i !== col.ref && col.defs.some(d => d.k === k && d.i === i)) opts.push({ v: `${k}:${i}`, t: `${st().sats[i].name.slice(-2)}–${st().sats[col.ref].name.slice(-2)} · snapshot ${k + 1}/${col.snaps.length}` });
    sel.innerHTML = opts.map(o => `<option value="${o.v}">${o.t}</option>`).join('');
    const mid = opts.find(o => +o.v.split(':')[0] === pick[Math.min(1, pick.length - 1)]) || opts[0];
    if (mid) sel.value = mid.v;
  };
  const runCaf = () => {
    const sel = document.getElementById('caf-pair'), col = A.col;
    if (!col || col.cfg.mode === 'FOA' || !sel.value || sel.disabled) { A.caf = null; return; }
    const [k, i] = sel.value.split(':').map(Number), sn = col.snaps[k], li = sn.lk[i], lr = sn.lk[col.ref];
    const em = col.em, f0 = em.f * 1e6;
    A.caf = S.DSP.caf({ em, snr1: lr.snr, snr2: li.snr, tdoaTrue: (li.range - lr.range) / C.CKM, fdoaTrue: -f0 / C.CKM * (li.rr - lr.rr), seed: (A.dr.seed + k * 17 + i) >>> 0 });
    A.cafSel = sel.value;
  };
  const cmapRGB = x => {
    const stops = [[0, [8, 14, 26]], [0.35, [20, 70, 120]], [0.65, [24, 160, 170]], [0.85, [242, 165, 58]], [1, [255, 245, 220]]];
    let k = 0; while (k < stops.length - 2 && x > stops[k + 1][0]) k++;
    const [a, ca] = stops[k], [b, cb] = stops[k + 1], u = S.clamp((x - a) / (b - a), 0, 1);
    return ca.map((c, j) => Math.round(c + (cb[j] - c) * u));
  };
  let cafImg = null, cafImgFor = null;
  const renderCaf = () => {
    if (!U.visible(ccv)) return;
    const { ctx, w, h } = U.fit(ccv);
    ctx.fillStyle = S.tk('panel'); ctx.fillRect(0, 0, w, h);
    const info = document.getElementById('caf-info');
    if (!A.caf) { ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(12); ctx.fillText(A.col && A.col.cfg.mode === 'FOA' ? 'Single-satellite FOA measures absolute frequency; there is no second receiver to cross-correlate.' : 'Computing cross-ambiguity surface…', 16, 28); info.textContent = ''; return; }
    const cf = A.caf, Wd = 2 * cf.L + 1, Hd = 2 * cf.K + 1;
    let mx = 0; for (const v of cf.grid) mx = Math.max(mx, v);
    if (cafImgFor !== cf) {
      cafImg = document.createElement('canvas'); cafImg.width = Wd; cafImg.height = Hd;
      const g = cafImg.getContext('2d'), im = g.createImageData(Wd, Hd);
      for (let kk = 0; kk < Hd; kk++) for (let l = 0; l < Wd; l++) {
        const v = cf.grid[kk * Wd + l], db = S.db(Math.max(v, 1e-30) / mx), x = S.clamp((db + 30) / 30, 0, 1), c = cmapRGB(x), o = ((Hd - 1 - kk) * Wd + l) * 4;
        im.data[o] = c[0]; im.data[o + 1] = c[1]; im.data[o + 2] = c[2]; im.data[o + 3] = 255;
      }
      g.putImageData(im, 0, 0); cafImgFor = cf;
    }
    const hw = Math.max(220, w * 0.5), box = { x: 58, y: 10, w: hw - 70, h: h - 44 };
    ctx.imageSmoothingEnabled = true; ctx.drawImage(cafImg, box.x, box.y, box.w, box.h);
    const tau0 = cf.prior.tau, nu0 = cf.prior.nu, dt = 1 / cf.fs * 1e9;
    const ax = U.axes(ctx, box, { x0: -cf.L * dt, x1: cf.L * dt, y0: -cf.K * cf.dnu, y1: cf.K * cf.dnu, xfmt: v => v.toFixed(0), yfmt: v => Math.abs(cf.dnu * cf.K) < 10 ? v.toFixed(2) : v.toFixed(0), ylabel: 'ν − ν₀ (Hz)', ylabelOff: 46 });
    ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(10.5); ctx.textAlign = 'center'; ctx.fillText('τ − τ₀ (ns)', box.x + box.w / 2, box.y + box.h + 28);
    const tx = ax.X((cf.truth.tau - tau0) * 1e9), ty = ax.Y(cf.truth.nu - nu0), mxp = ax.X((cf.meas.tau - tau0) * 1e9), myp = ax.Y(cf.meas.nu - nu0);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(tx, ty, 6, 0, 7); ctx.stroke();
    ctx.strokeStyle = S.tk('accent'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mxp - 6, myp); ctx.lineTo(mxp + 6, myp); ctx.moveTo(mxp, myp - 6); ctx.lineTo(mxp, myp + 6); ctx.stroke();
    // slices
    const W = cf.L * 2 + 1, kP = Math.round((cf.meas.nu - nu0) / cf.dnu) + cf.K, lP = Math.round((cf.meas.tau - tau0) * cf.fs) + cf.L;
    const sx = hw + 8, sw = w - sx - 14, sh = (h - 54) / 2;
    const slice = (vals, y0, x0v, x1v, lbl, mark, xf) => {
      const b = { x: sx + 36, y: y0, w: sw - 40, h: sh - 14 };
      const a = U.axes(ctx, b, { x0: x0v, x1: x1v, y0: -30, y1: 2, yticks: [-30, -20, -10, 0], xfmt: xf });
      ctx.strokeStyle = S.tk('accent'); ctx.lineWidth = 1.5; ctx.beginPath();
      vals.forEach((v, i) => { const x = a.X(x0v + (x1v - x0v) * i / (vals.length - 1)), y = a.Y(S.clamp(S.db(Math.max(v, 1e-30) / mx), -30, 2)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      ctx.strokeStyle = S.tk('fg'); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(a.X(mark), b.y); ctx.lineTo(a.X(mark), b.y + b.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(10.5); ctx.textAlign = 'left'; ctx.fillText(lbl, b.x + 6, b.y + 12);
    };
    const kRow = S.clamp(kP, 0, 2 * cf.K), lCol = S.clamp(lP, 0, W - 1);
    slice(Array.from({ length: W }, (_, l) => cf.grid[kRow * W + l]), 10, -cf.L * dt, cf.L * dt, 'Delay cut at peak Doppler (dB vs ns)', (cf.truth.tau - tau0) * 1e9, v => v.toFixed(0));
    slice(Array.from({ length: 2 * cf.K + 1 }, (_, kk) => cf.grid[kk * W + lCol]), 10 + sh + 14, -cf.K * cf.dnu, cf.K * cf.dnu, 'Doppler cut at peak delay (dB vs Hz)', cf.truth.nu - nu0, v => Math.abs(cf.dnu * cf.K) < 10 ? v.toFixed(1) : v.toFixed(0));
    const eT = (cf.meas.tau - cf.truth.tau), eF = cf.meas.nu - cf.truth.nu;
    info.textContent = `T ${(cf.T * 1e3).toFixed(2)} ms${cf.plan.pulses ? ` (${cf.plan.pulses} pulses, gated)` : cf.plan.M > 1 ? ` (${cf.plan.M}×${cf.plan.N})` : ''} · fs ${S.fmtHz(cf.fs)} · peak/mean ${cf.pmrDb.toFixed(1)} dB · δτ ${S.fmtSec(eT)} (CRLB ${S.fmtSec(cf.crlb.sT)}) · δν ${eF.toFixed(2)} Hz (CRLB ${cf.crlb.sF.toFixed(2)} Hz)`;
  };

  /* ---------- report ---------- */
  const renderResult = () => {
    const el = document.getElementById('geo-result'), stEl = document.getElementById('geo-status'), c = A.coll;
    if (!c || !A.col) { el.innerHTML = '<div class="empty">Pick a collection to see its fix.</div>'; stEl.innerHTML = ''; return; }
    const s = st(), col = A.col, sol = A.sol, em = col.em;
    stEl.innerHTML = c.status === 'done' ? U.pill(c.product ? c.product.id : 'Done', 'ok') : c.status === 'active' ? U.pill('Collecting', 'acc') : U.pill('Pre-pass simulation', 'info');
    document.getElementById('geo-title').textContent = `${em.id} · ${em.name}`;
    const nT = col.defs.filter(d => d.type === 'T').length, nF = col.defs.filter(d => d.type === 'F').length, nA = col.defs.filter(d => d.type === 'A').length;
    let html = '';
    if (sol.ok) {
      const e = sol.ell;
      html += `<div class="result-hero">
        <div><div class="l">Estimate</div><div class="big">${S.fmtLat(sol.lat)}<br>${S.fmtLon(sol.lon)}</div></div>
        <div><div class="l">CEP 50 %</div><div class="big">${S.fmtM(e.cep)}</div><div class="hint">95 %: ${S.fmtM(e.smaj * e.k95)} × ${S.fmtM(e.smin * e.k95)} at ${e.azDeg.toFixed(0)}°</div></div>
        <div><div class="l">Miss vs truth</div><div class="big">${S.fmtM(sol.miss)}</div><div class="hint">E ${sol.dE.toFixed(0)} m, N ${sol.dN.toFixed(0)} m</div></div>
        <div><div class="l">Monte Carlo CEP</div><div class="big">${A.mc ? S.fmtM(A.mc.cep50) : s.geoCfg.mcN ? '…' : 'off'}</div><div class="hint">${A.mc ? `${A.mc.pts.length} runs, R95 ${S.fmtM(A.mc.r95)}` : 'independent noise + bias draws'}</div></div></div>`;
      if (em.claimed) { const d = S.gcDist(em.claimed.lat, em.claimed.lon, sol.lat, sol.lon) * 1000, bad = d > 3 * e.smaj * e.k95 + 500; html += `<div class="callout ${bad ? 'crit' : 'ok'}">${bad ? `<b>AIS position inconsistent.</b> The vessel reports a position ${S.fmtM(d)} from the RF fix, far outside the 95 % ellipse. Flag for possible AIS spoofing and cue imagery.` : `AIS-reported position agrees with the RF fix (${S.fmtM(d)}).`}</div>`; }
      if (sol.ambiguity) html += `<div class="callout crit">A second solution ${S.fmtM(S.gcDist(sol.lat, sol.lon, sol.ambiguity.lat, sol.ambiguity.lon) * 1000)} away fits almost as well (Δχ² ${sol.ambiguity.dChi2.toFixed(1)}). The cluster geometry is near-symmetric for this target, so a second pass is needed to resolve it.</div>`;
      if (sol.chi2 > 3) html += `<div class="callout">Normalised χ² is ${sol.chi2.toFixed(1)}: residuals exceed the error model. Check for multipath, co-channel interference or an emitter moving faster than the assumed ${s.geoCfg.tgtSpd} m/s.</div>`;
      if (col.cfg.mode === 'FOA') html += `<div class="callout info">Single-satellite Doppler positioning also estimates the emitter carrier offset Δf = ${S.fmtHz(sol.df)}. It needs a long arc and a stable oscillator. That is why 406 MHz beacons work and magnetron radars do not.</div>`;
    } else html += `<div class="callout crit"><b>No fix.</b> ${S.esc(sol.reason)}</div>`;
    const ref = s.sats[col.ref], vis = col.snaps.filter(sn => sn.lk.filter(l => l.visible).length > 1).length;
    const posts = col.defs.map(d => d.post), meanPost = posts.length ? posts.reduce((a, b) => a + b, 0) / posts.length : 0;
    html += `<div class="sect-title">Solution</div><div class="panel-body"><dl class="kv">
      <dt>Method</dt><dd>${G.MODES[col.cfg.mode]}</dd><dt>Signal</dt><dd>${S.fmtMHz(em.f)}, ${S.esc(em.mod)}</dd>
      <dt>Window</dt><dd>${S.fmtHMS(col.times[0])}–${S.fmtHMS(col.times[col.times.length - 1])}</dd>
      <dt>Snapshots / integration</dt><dd>${col.snaps.length} × ${(col.tInt * 1e3).toFixed(1)} ms</dd>
      <dt>Measurements</dt><dd>${nT} TDOA · ${nF} FDOA${nA ? ` · ${nA} FOA` : ''}</dd><dt>Reference</dt><dd>${ref.name}</dd>
      <dt>Multi-sat snapshots</dt><dd>${vis} / ${col.snaps.length}</dd><dt>Mean post-corr. SNR</dt><dd>${meanPost.toFixed(1)} dB</dd>
      ${sol.ok ? `<dt>χ² / dof</dt><dd>${sol.chi2.toFixed(2)}</dd><dt>NEES (2 dof)</dt><dd>${sol.nees.toFixed(2)}</dd><dt>Iterations · starts</dt><dd>${sol.iters} · ${sol.candidates}</dd>` : ''}
      ${A.mc ? `<dt>MC mean bias</dt><dd>E ${A.mc.biasE.toFixed(0)} m, N ${A.mc.biasN.toFixed(0)} m</dd>` : ''}</dl></div>`;
    // error budget for representative measurements
    const kMid = col.defs.length ? col.defs[Math.floor(col.defs.length / 2)].k : 0;
    for (const type of ['T', 'F', 'A']) {
      const d = col.defs.find(q => q.type === type && q.k === kMid) || col.defs.find(q => q.type === type);
      if (!d) continue;
      const b = G.budget(col, d), mx = Math.max(...b.items.map(x => x[1]), 1e-9);
      const lbl = type === 'T' ? `TDOA ${s.sats[d.i].name.slice(-2)}–${s.sats[d.j].name.slice(-2)}, 1σ range difference` : type === 'F' ? `FDOA ${s.sats[d.i].name.slice(-2)}–${s.sats[d.j].name.slice(-2)}, 1σ range-rate difference` : 'FOA, 1σ range-rate';
      html += `<div class="sect-title">Error budget · ${lbl}</div><div class="panel-body budget">${b.items.map(([k, v]) => `<div class="b"><span>${k}</span><span class="track"><i style="width:${(v / mx * 100).toFixed(1)}%"></i></span><span class="v">${v < 10 ? v.toFixed(2) : v.toFixed(1)} ${b.unit}</span></div>`).join('')}
        <div class="b"><b>Total (RSS)</b><span></span><span class="v"><b>${b.total < 10 ? b.total.toFixed(2) : b.total.toFixed(1)} ${b.unit}</b></span></div></div>`;
    }
    // measurement table
    if (col.defs.length) {
      const rows = col.defs.map((d, m) => {
        const val = d.type === 'T' ? S.fmtSec(A.dr.z[m]) : d.type === 'F' ? `${A.dr.z[m].toFixed(2)} Hz` : S.fmtHz(A.dr.z[m] - d.f0);
        const sg = d.type === 'T' ? S.fmtSec(d.sigma) : `${d.sigma.toFixed(2)} Hz`;
        const r = sol.ok ? sol.resid[m] : null;
        return { cells: [d.k + 1, d.type === 'T' ? 'TDOA' : d.type === 'F' ? 'FDOA' : 'FOA', d.j >= 0 ? `${'ABCD'[d.i]}–${'ABCD'[d.j]}` : 'ABCD'[d.i], val, sg, r == null ? '—' : `<span style="color:var(${Math.abs(r) > 3 ? '--crit' : Math.abs(r) > 2 ? '--warn' : '--fg'})">${r.toFixed(2)}</span>`, d.post.toFixed(1)] };
      });
      html += `<div class="sect-title">Measurements (residual in σ)</div><div class="tbl-wrap"><table class="data" id="geo-meas"></table></div>`;
      el.innerHTML = html;
      U.table(document.getElementById('geo-meas'), [{ t: '#', num: 1 }, { t: 'Type' }, { t: 'Pair' }, { t: 'Value', num: 1 }, { t: 'σ', num: 1 }, { t: 'Resid', num: 1 }, { t: 'SNR dB', num: 1 }], rows);
    } else el.innerHTML = html;
  };

  /* ---------- collection list & form ---------- */
  let listSig = '';
  const listColls = force => {
    const s = st(), cs = s.plan.collections, el = document.getElementById('geo-colls');
    const sig = cs.map(c => c.id + c.status).join() + (A.coll && A.coll.id);
    if (!force && sig === listSig) return; listSig = sig;
    document.getElementById('geo-coll-count').textContent = `${cs.filter(c => c.status === 'done').length} done · ${cs.length}`;
    el.innerHTML = cs.map(c => {
      const p = c.product, cep = p && p.sol.ok ? p.sol.ell.cep : null;
      return `<div class="product${A.coll === c ? ' sel' : ''}" data-id="${c.id}" tabindex="0" role="button">
        <div class="top">${U.clsDot(c.em.cls)}<b>${c.em.id} · ${S.esc(c.em.name)}</b>${c.status === 'done' ? U.pill(cep != null ? S.fmtM(cep) : 'no fix', cep != null ? U.cepKind(cep) : 'crit') : c.status === 'active' ? U.pill('now', 'acc') : U.pill('planned', 'dim')}</div>
        <div class="sub">${S.fmtUtc(c.c0).slice(5, 16)} · max ${(c.maxEl * C.RAD).toFixed(0)}° · pred ${U.cepTxt(c.predCep)}</div></div>`;
    }).join('');
  };
  const fillForm = () => {
    const g = st().geoCfg, set = (id, v) => { document.getElementById(id).value = v; };
    set('g-mode', g.mode); set('g-nsnap', g.nSnap); set('g-dt', g.dtSnap); set('g-tint', String(g.tIntScale)); set('g-clk', g.clkNs); set('g-pos', g.posM);
    set('g-vel', g.velMms); set('g-lo', String(g.yLo)); set('g-tec', g.tecu); set('g-spd', g.tgtSpd); set('g-mc', String(g.mcN));
    document.getElementById('g-lo').value = ['1e-12', '1e-11', '1e-10', '1e-9'].find(v => +v === g.yLo) || '1e-11';
  };
  const readForm = () => {
    const g = st().geoCfg, num = (id, lo, hi, d) => { const v = +document.getElementById(id).value; return isFinite(v) ? S.clamp(v, lo, hi) : d; };
    g.mode = document.getElementById('g-mode').value; g.nSnap = Math.round(num('g-nsnap', 2, 60, 12)); g.dtSnap = num('g-dt', 1, 60, 10);
    g.tIntScale = +document.getElementById('g-tint').value; g.clkNs = num('g-clk', 0, 500, 15); g.posM = num('g-pos', 0, 100, 2); g.velMms = num('g-vel', 0, 200, 5);
    g.yLo = +document.getElementById('g-lo').value; g.tecu = num('g-tec', 0, 150, 20); g.tgtSpd = num('g-spd', 0, 30, 7); g.mcN = +document.getElementById('g-mc').value;
  };

  const init = () => {
    mcv = document.getElementById('geo-map'); ccv = document.getElementById('caf');
    document.getElementById('g-mode').innerHTML = Object.entries(G.MODES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    fillForm();
    document.getElementById('geo-form').addEventListener('submit', e => { e.preventDefault(); readForm(); analyze(A.coll, true); });
    document.getElementById('g-reset').addEventListener('click', () => { Object.assign(st().geoCfg, G.defaults()); fillForm(); analyze(A.coll, true); });
    document.getElementById('geo-colls').addEventListener('click', e => { const it = e.target.closest('.product'); if (!it) return; const c = st().plan.collections.find(q => q.id === it.dataset.id); if (c) { S.select('coll', c); S.select('emitter', c.em.id); } });
    document.getElementById('geo-colls').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList.contains('product')) e.target.click(); });
    document.getElementById('geo-zin').onclick = () => { A.R = Math.max(A.R / 1.6, 0.3); };
    document.getElementById('geo-zout').onclick = () => { A.R = Math.min(A.R * 1.6, 2500); };
    mcv.addEventListener('wheel', e => { e.preventDefault(); A.R = S.clamp(A.R * (e.deltaY < 0 ? 0.8 : 1.25), 0.3, 2500); }, { passive: false });
    document.getElementById('caf-pair').addEventListener('change', () => { A.caf = null; setTimeout(runCaf, 10); });
    document.getElementById('geo-copy').addEventListener('click', e => {
      if (!A.sol || !A.sol.ok || !A.coll) return;
      const c = A.coll, sol = A.sol, eEl = sol.ell;
      const text = [
        'TALOS-3 RF GEOLOCATION PRODUCT',
        `Product ID: ${c.product ? c.product.id : 'PRE-PASS'}`,
        `Target: ${c.em.id} · ${c.em.name}`,
        `Signal: ${S.fmtMHz(c.em.f)} · ${c.em.label}`,
        `Estimate: ${S.fmtLat(sol.lat)} ${S.fmtLon(sol.lon)} (${(sol.lat * C.RAD).toFixed(5)}°, ${(sol.lon * C.RAD).toFixed(5)}°)`,
        `CEP (50%): ${S.fmtM(eEl.cep)}`,
        `95% Ellipse: ${S.fmtM(eEl.smaj * eEl.k95)} × ${S.fmtM(eEl.smin * eEl.k95)} at ${eEl.azDeg.toFixed(1)}°`,
        `Miss vs truth: ${S.fmtM(sol.miss)}`,
        `Measurements: ${sol.nMeas} (${G.MODES[A.col.cfg.mode]})`,
        `Time: ${S.fmtUtc(c.c1)} UTC`
      ].join('\n');
      U.copy(text, e.currentTarget);
    });
    S.on('select', w => { if (w === 'coll' && st().sel.coll && st().sel.coll !== A.coll && st().tab === 'geo') analyze(st().sel.coll); });
    S.on('product', p => { if (A.coll === p.coll) analyze(p.coll); });
    S.on('rebuild', () => { if (A.coll && !st().plan.collections.includes(A.coll)) A.coll = null; listColls(true); });
  };
  const onShow = () => {
    fillForm();
    const s = st(), c = s.sel.coll || (s.products[0] && s.products[0].coll) || S.Plan.next(s.plan.collections, s.t, 'c1');
    if (c && c !== A.coll) analyze(c); else { listColls(true); if (!A.col && c) analyze(c); }
  };
  const refresh = () => { listColls(false); };
  S.views.geo = { init, refresh, onShow, render: () => { renderMap(); renderCaf(); } };
})(window.SIM);
