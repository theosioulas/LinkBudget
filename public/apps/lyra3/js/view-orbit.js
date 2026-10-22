/* LYRA-3 simulator — Orbit view: orthographic globe (inertial or Earth-fixed), formation LVLH plot,
   baselines, mean elements, orbit / formation design form and TLE export. */
'use strict';
(function (S) {
  const { C, V } = S, U = S.ui;
  const st = () => S.state;
  const cam = { yaw: 0.6, pitch: 0.5, zoom: 1, frame: 'eci', follow: true, los: true };
  let gcv, drag = null;

  const basis = () => {
    const cl = Math.cos(cam.pitch), sl = Math.sin(cam.pitch), co = Math.cos(cam.yaw), so = Math.sin(cam.yaw);
    return { f: [cl * co, cl * so, sl], r: [-so, co, 0], u: [-sl * co, -sl * so, cl] };
  };

  const renderGlobe = () => {
    if (!U.visible(gcv)) return;
    const { ctx, w, h } = U.fit(gcv), s = st(), t = s.t, th = S.gmst(t), eci = cam.frame === 'eci';
    const lead = s.sats[0].orbit;
    if (cam.follow && !drag) {
      const p = eci ? lead.posEci(t) : lead.posEcef(t), u = V.unit(p);
      const ty = Math.atan2(u[1], u[0]), tp = Math.asin(u[2]) * 0.85;
      cam.yaw += S.wrapPi(ty - cam.yaw) * 0.12; cam.pitch += (tp - cam.pitch) * 0.12;
    }
    const B = basis(), R = Math.min(w, h) * 0.34 * cam.zoom, cx = w / 2, cy = h / 2;
    // world point (km, ECI or ECEF) -> screen
    const proj = p => [cx + (p[0] * B.r[0] + p[1] * B.r[1] + p[2] * B.r[2]) / C.RE * R, cy - (p[0] * B.u[0] + p[1] * B.u[1] + p[2] * B.u[2]) / C.RE * R, (p[0] * B.f[0] + p[1] * B.f[1] + p[2] * B.f[2]) / C.RE];
    const hidden = q => q[2] < 0 && Math.hypot(q[0] - cx, q[1] - cy) < R;
    const toWorld = e => eci ? S.rotZ(e, -th) : e;   // ECEF -> displayed frame
    ctx.fillStyle = S.tk('bg'); ctx.fillRect(0, 0, w, h);
    // Earth disc
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = S.tk('ocean'); ctx.fill(); ctx.clip();
    // graticule
    ctx.strokeStyle = S.tk('grid'); ctx.lineWidth = 1;
    for (let la = -60; la <= 60; la += 30) { ctx.beginPath(); let pen = false; for (let lo = -180; lo <= 180; lo += 5) { const q = proj(toWorld(S.geo2ecef(la * C.DEG, lo * C.DEG, 0))); if (q[2] > 0) { pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; } else pen = false; } ctx.stroke(); }
    for (let lo = -180; lo < 180; lo += 30) { ctx.beginPath(); let pen = false; for (let la = -90; la <= 90; la += 5) { const q = proj(toWorld(S.geo2ecef(la * C.DEG, lo * C.DEG, 0))); if (q[2] > 0) { pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; } else pen = false; } ctx.stroke(); }
    // land
    if (S.world.ready) {
      const c = Math.cos(eci ? -th : 0), sn = Math.sin(eci ? -th : 0);
      ctx.fillStyle = S.tk('land'); ctx.strokeStyle = S.tk('land-edge'); ctx.lineWidth = 0.6; ctx.beginPath();
      for (const r of S.world.rings) {
        const xyz = r.xyz, n = xyz.length / 3; let front = 0;
        const pts = new Float32Array(n * 2);
        for (let k = 0; k < n; k++) {
          const x0 = xyz[3 * k], y0 = xyz[3 * k + 1], z0 = xyz[3 * k + 2];
          const x = c * x0 + sn * y0, y = -sn * x0 + c * y0, z = z0;
          let sx = x * B.r[0] + y * B.r[1] + z * B.r[2], sy = x * B.u[0] + y * B.u[1] + z * B.u[2];
          const d = x * B.f[0] + y * B.f[1] + z * B.f[2];
          if (d > 0) front++; else { const m = Math.hypot(sx, sy) || 1; sx /= m; sy /= m; }
          pts[2 * k] = cx + sx * R; pts[2 * k + 1] = cy - sy * R;
        }
        if (!front) continue;
        ctx.moveTo(pts[0], pts[1]); for (let k = 1; k < n; k++) ctx.lineTo(pts[2 * k], pts[2 * k + 1]); ctx.closePath();
      }
      ctx.fill(); ctx.stroke();
    }
    // night side: front half of the terminator + the anti-sun limb arc
    const sunW = eci ? S.sunEci(t) : S.eci2ecef(S.sunEci(t), t), su = V.unit(sunW);
    const e1 = V.unit(V.cross(su, Math.abs(su[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), e2 = V.cross(su, e1);
    const term = [];
    for (let k = 0; k < 360; k++) { const a = k * C.DEG, p = V.add(V.mul(e1, Math.cos(a) * C.RE), V.mul(e2, Math.sin(a) * C.RE)); term.push(proj(p)); }
    let k0 = term.findIndex((q, i) => q[2] >= 0 && term[(i + 359) % 360][2] < 0);
    if (k0 >= 0) {
      const arc = []; for (let i = 0; i < 360; i++) { const q = term[(k0 + i) % 360]; if (q[2] < 0) break; arc.push(q); }
      const A = arc[0], Bq = arc[arc.length - 1], aA = Math.atan2(A[1] - cy, A[0] - cx), aB = Math.atan2(Bq[1] - cy, Bq[0] - cx);
      const sunS = [su[0] * B.r[0] + su[1] * B.r[1] + su[2] * B.r[2], -(su[0] * B.u[0] + su[1] * B.u[1] + su[2] * B.u[2])];
      ctx.beginPath(); arc.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]));
      // A and B are antipodal on the limb: close along the half whose midpoint faces away from the Sun
      const m1 = aB + Math.PI / 2, cwAway = Math.cos(m1) * sunS[0] + Math.sin(m1) * sunS[1] < 0;
      ctx.arc(cx, cy, R, aB, aA, !cwAway);
      ctx.closePath(); ctx.fillStyle = S.tk('night'); ctx.fill();
    } else if (V.dot(su, B.f) < 0) { ctx.fillStyle = S.tk('night'); ctx.fillRect(0, 0, w, h); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.strokeStyle = S.tk('line'); ctx.lineWidth = 1; ctx.stroke();

    // lead footprint (10°)
    const g0 = lead.geo(t), ang = S.coverageAngle(C.RE + g0.h, S.Plan.COLLECT_MASK_DEG * C.DEG);
    ctx.save(); ctx.strokeStyle = S.rgba(U.satColor(0), 0.8); ctx.lineWidth = 1.2; ctx.beginPath(); let pen = false;
    for (let k = 0; k <= 90; k++) { const [la, lo] = S.dest(g0.lat, g0.lon, k / 90 * C.TWO_PI, ang * C.RM), q = proj(toWorld(S.geo2ecef(la, lo, 0))); if (q[2] > 0) { pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; } else pen = false; }
    ctx.stroke(); ctx.restore();
    // orbits
    s.sats.forEach((sat, i) => {
      const o = sat.orbit, P = o.periodNodal * 1000, col = U.satColor(i), n = 160;
      const span = eci ? P : 1.2 * P;
      let prev = null;
      for (let k = 0; k <= n; k++) {
        const tt = t - span / 2 + span * k / n, p = eci ? o.posEci(tt) : o.posEcef(tt), q = proj(p);
        if (prev) { ctx.strokeStyle = S.rgba(col, hidden(q) || hidden(prev) ? 0.12 : (i === 0 ? 0.85 : 0.45)); ctx.lineWidth = i === 0 ? 1.4 : 1; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
        prev = q;
      }
    });
    // emitters + lines of sight
    const selEm = S.emitterById(s.sel.emitter);
    for (const em of s.emitters) {
      const es = S.emitterState(em, t), q = proj(toWorld(es.r));
      if (q[2] <= 0) continue;
      U.emitterGlyph(ctx, q[0], q[1], U.classColor(em.cls), em === selEm);
      if (cam.zoom > 1.8 || em === selEm) U.label(ctx, em.id, q[0] + 8, q[1] - 8, S.tk('fg'));
    }
    if (cam.los && selEm) {
      const es = S.emitterState(selEm, t), qe = proj(toWorld(es.r));
      s.sats.forEach((sat, i) => {
        const ss = sat.orbit.stateEcef(t), lk = S.link(selEm, es, sat, ss, t);
        if (!lk.visible) return;
        const qs = proj(toWorld(ss.r));
        ctx.save(); ctx.strokeStyle = S.rgba(U.satColor(i), 0.75); ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(qe[0], qe[1]); ctx.lineTo(qs[0], qs[1]); ctx.stroke(); ctx.restore();
      });
    }
    // satellites, velocity arrows
    s.sats.forEach((sat, i) => {
      const stt = eci ? sat.orbit.stateEci(t) : sat.orbit.stateEcef(t), q = proj(stt.r), q2 = proj(V.add(stt.r, V.mul(stt.v, 60)));
      if (hidden(q)) return;
      ctx.save(); ctx.strokeStyle = U.satColor(i); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke(); ctx.restore();
      U.satGlyph(ctx, q[0], q[1], U.satColor(i), 4.5);
      if (i === 0 || cam.zoom > 6) U.label(ctx, sat.name, q[0] + 10, q[1] + 12, U.satColor(i));
    });
    document.getElementById('globe-hud').textContent = `${eci ? 'Inertial (ECI)' : 'Earth-fixed (ECEF)'} · zoom ${cam.zoom.toFixed(1)}× · drag to rotate, scroll to zoom`;
  };

  /* ---------- formation plots ---------- */
  let formCache = null;
  const formation = () => {
    const s = st(), lead = s.sats[0].orbit, P = lead.periodNodal * 1000, key = `${s.sats.length}:${Math.floor(s.t / (P / 4))}:${lead.a}`;
    if (formCache && formCache.key === key) return formCache;
    const t0 = s.t - P / 2, n = 180, tr = s.sats.map(() => []);
    for (let k = 0; k <= n; k++) { const tt = t0 + P * k / n; s.sats.forEach((sat, i) => { if (i) tr[i].push(Object.assign({ t: tt }, S.lvlh(lead, sat.orbit, tt))); }); }
    formCache = { key, t0, P, tr };
    return formCache;
  };
  const renderLvlh = () => {
    const cv = document.getElementById('lvlh'); if (!U.visible(cv)) return;
    const { ctx, w, h } = U.fit(cv), s = st(), f = formation();
    let ext = 5; f.tr.forEach(a => a.forEach(p => { ext = Math.max(ext, Math.abs(p.s), Math.abs(p.w)); }));
    ext *= 1.15;
    const box = { x: 54, y: 10, w: w - 70, h: h - 40 };
    const sc = Math.min(box.w, box.h) / (2 * ext), cxp = box.x + box.w / 2, cyp = box.y + box.h / 2;
    const ax = U.axes(ctx, box, { x0: -box.w / 2 / sc, x1: box.w / 2 / sc, y0: -box.h / 2 / sc, y1: box.h / 2 / sc, ylabel: 'Cross-track W (km)', ylabelOff: 40, xfmt: v => v });
    ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(10.5); ctx.textAlign = 'right'; ctx.fillText('Along-track S (km) →', box.x + box.w - 4, box.y + box.h - 8);
    f.tr.forEach((a, i) => {
      if (!i) return;
      ctx.strokeStyle = S.rgba(U.satColor(i), 0.7); ctx.lineWidth = 1.3; ctx.beginPath();
      a.forEach((p, k) => { const x = ax.X(p.s), y = ax.Y(p.w); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      const now = S.lvlh(s.sats[0].orbit, s.sats[i].orbit, s.t);
      U.satGlyph(ctx, ax.X(now.s), ax.Y(now.w), U.satColor(i), 4);
      U.label(ctx, `${s.sats[i].name}  R ${now.r >= 0 ? '+' : ''}${now.r.toFixed(2)} km`, ax.X(now.s) + 10, ax.Y(now.w) - 10, U.satColor(i));
    });
    U.satGlyph(ctx, cxp, cyp, U.satColor(0), 4.5); U.label(ctx, 'LYRA-3A', cxp + 10, cyp + 12, U.satColor(0));
  };
  const renderBase = () => {
    const cv = document.getElementById('baselines'); if (!U.visible(cv)) return;
    const { ctx, w, h } = U.fit(cv), s = st(), f = formation();
    let mx = 1; f.tr.forEach(a => a.forEach(p => { mx = Math.max(mx, Math.hypot(p.r, p.s, p.w)); }));
    const box = { x: 46, y: 10, w: w - 60, h: h - 38 };
    const ax = U.axes(ctx, box, { x0: 0, x1: f.P / 60e3, y0: 0, y1: mx * 1.15, xfmt: v => v + 'm', ylabel: 'Baseline (km)', ylabelOff: 36 });
    f.tr.forEach((a, i) => {
      if (!i) return;
      ctx.strokeStyle = U.satColor(i); ctx.lineWidth = 1.5; ctx.beginPath();
      a.forEach((p, k) => { const x = ax.X((p.t - f.t0) / 60e3), y = ax.Y(Math.hypot(p.r, p.s, p.w)); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    });
    const xn = ax.X((s.t - f.t0) / 60e3);
    ctx.strokeStyle = S.tk('accent'); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xn, box.y); ctx.lineTo(xn, box.y + box.h); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(10.5); ctx.textAlign = 'right'; ctx.fillText('minutes into orbit', box.x + box.w - 4, box.y + box.h - 8);
  };

  /* ---------- elements & form ---------- */
  const refresh = () => {
    const s = st(), o = s.sats[0].orbit, t = s.t, cfg = s.orbitCfg;
    const ecl = s.plan.eclipses[1] || s.plan.eclipses[0];
    const beta = S.betaAngle(o, t) * C.RAD, el = o.elementsAt(t);
    const covR = S.coverageAngle(o.a, S.Plan.COLLECT_MASK_DEG * C.DEG) * C.RM;
    const shift = (o.periodNodal * (C.WE - o.dRaan)) * C.RE;
    const rows = [
      ['Semi-major axis', `${o.a.toFixed(3)} km`], ['Altitude (mean)', `${(o.a - C.RE).toFixed(1)} km`],
      ['Eccentricity', o.e.toFixed(5)], ['Inclination', `${(o.i * C.RAD).toFixed(4)}°${cfg.sso ? ' (SSO)' : ''}`],
      ['RAAN (now)', `${(((el.O * C.RAD) % 360 + 360) % 360).toFixed(3)}°`], ['Arg. of perigee', `${(((el.w * C.RAD) % 360 + 360) % 360).toFixed(2)}°`],
      ['LTAN / LTDN', `${hhmm(cfg.ltanH)} / ${hhmm((cfg.ltanH + 12) % 24)}`],
      ['Nodal period', `${(o.periodNodal / 60).toFixed(3)} min`], ['Revolutions / day', (86400 / o.periodNodal).toFixed(4)],
      ['dΩ/dt (J2)', `${(o.dRaan * 86400 * C.RAD).toFixed(4)} °/day`], ['dω/dt (J2)', `${(o.dArgp * 86400 * C.RAD).toFixed(3)} °/day`],
      ['Orbital speed', `${V.norm(o.stateEci(t).v).toFixed(3)} km/s`], ['Beta angle (now)', `${beta.toFixed(1)}°`],
      ['Eclipse duration', ecl ? S.fmtDur((ecl.t1 - ecl.t0) / 1000) : 'none'], ['Coverage radius (10°)', `${covR.toFixed(0)} km`],
      ['Track shift / orbit', `${shift.toFixed(0)} km at equator`]
    ];
    const dl = document.getElementById('orbit-elements');
    dl.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  };
  const hhmm = hh => `${String(Math.floor(hh)).padStart(2, '0')}:${String(Math.round((hh % 1) * 60)).padStart(2, '0')}`;
  const fillForm = () => {
    const c = st().orbitCfg;
    document.getElementById('f-alt').value = c.altKm; document.getElementById('f-ltan').value = c.ltanH;
    document.getElementById('f-sso').checked = c.sso; const inc = document.getElementById('f-inc');
    inc.disabled = c.sso; inc.value = (st().sats[0].orbit.i * C.RAD).toFixed(2);
    document.getElementById('f-nsat').value = c.nSats; document.getElementById('f-preset').value = c.preset;
    satRows();
    document.getElementById('tle').textContent = st().sats.map((s, i) => S.makeTle(s.orbit, 69001 + i, s.name).join('\n')).join('\n');
  };
  const satRows = () => {
    const c = st().orbitCfg, n = +document.getElementById('f-nsat').value;
    document.querySelector('#f-sats tbody').innerHTML = Array.from({ length: n }, (_, i) => {
      const s = c.sats[i] || { along: -35 * i, cross: 0 };
      return `<tr><td>${U.satDot(i)} ${'ABCD'[i]}</td><td class="num"><input type="number" id="f-al-${i}" value="${s.along}" step="1" style="width:90px"${i ? '' : ' disabled'}></td><td class="num"><input type="number" id="f-cr-${i}" value="${s.cross}" step="1" style="width:90px"${i ? '' : ' disabled'}></td></tr>`;
    }).join('');
  };

  const init = () => {
    gcv = document.getElementById('globe');
    document.querySelectorAll('#globe-frame button').forEach(b => b.addEventListener('click', () => { cam.frame = b.dataset.frame; U.setSeg(document.getElementById('globe-frame'), 'frame', cam.frame); }));
    document.getElementById('globe-follow').addEventListener('change', e => { cam.follow = e.target.checked; });
    document.getElementById('globe-los').addEventListener('change', e => { cam.los = e.target.checked; });
    gcv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch }; gcv.setPointerCapture(e.pointerId); });
    gcv.addEventListener('pointermove', e => { if (!drag) return; cam.yaw = drag.yaw - (e.clientX - drag.x) * 0.006 / Math.sqrt(cam.zoom); cam.pitch = S.clamp(drag.pitch + (e.clientY - drag.y) * 0.006 / Math.sqrt(cam.zoom), -1.5, 1.5); });
    gcv.addEventListener('pointerup', () => { if (drag && cam.follow) { cam.follow = false; document.getElementById('globe-follow').checked = false; } drag = null; });
    gcv.addEventListener('wheel', e => { e.preventDefault(); cam.zoom = S.clamp(cam.zoom * (e.deltaY < 0 ? 1.18 : 0.85), 0.6, 60); }, { passive: false });
    document.getElementById('f-sso').addEventListener('change', e => { document.getElementById('f-inc').disabled = e.target.checked; });
    document.getElementById('f-nsat').addEventListener('change', satRows);
    document.getElementById('f-preset').addEventListener('change', e => {
      const p = S.PRESETS[e.target.value], n = +document.getElementById('f-nsat').value;
      for (let i = 1; i < n; i++) { document.getElementById(`f-al-${i}`).value = p[i][0]; document.getElementById(`f-cr-${i}`).value = p[i][1]; }
    });
    document.getElementById('orbit-form').addEventListener('submit', e => {
      e.preventDefault();
      const s = st(), c = s.orbitCfg, n = +document.getElementById('f-nsat').value;
      c.altKm = S.clamp(+document.getElementById('f-alt').value || 550, 400, 900);
      c.ltanH = S.clamp(+document.getElementById('f-ltan').value, 0, 24);
      c.sso = document.getElementById('f-sso').checked; c.incDeg = +document.getElementById('f-inc').value;
      c.nSats = n; c.preset = document.getElementById('f-preset').value;
      c.sats = Array.from({ length: n }, (_, i) => i ? { along: +document.getElementById(`f-al-${i}`).value, cross: +document.getElementById(`f-cr-${i}`).value } : { along: 0, cross: 0 });
      s.products = []; s.processed.clear(); s.sel.product = null; formCache = null;
      S.log('info', `Orbit / formation updated: ${c.altKm} km, ${n} spacecraft, preset “${c.preset}”. Plan regenerated.`);
      S.rebuild(s.t - 14 * 3600e3);
      if (s.sel.emitter && s.bus.length <= s.sel.sat) s.sel.sat = 0;
    });
    document.getElementById('tle-copy').addEventListener('click', e => U.copy(document.getElementById('tle').textContent, e.currentTarget));
    S.on('rebuild', () => { formCache = null; fillForm(); });
    fillForm();
  };
  S.views.orbit = { init, refresh, render: () => { renderGlobe(); renderLvlh(); renderBase(); }, onShow: fillForm };
})(window.SIM);
