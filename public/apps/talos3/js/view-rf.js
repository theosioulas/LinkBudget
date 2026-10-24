/* TALOS-3 simulator — Payload RF view: spectrum analyser + waterfall per spacecraft, signal list,
   link budget, receive-chain table and pass geometry (Doppler, TDOA, FDOA, SNR vs time). */
'use strict';
(function (S) {
  const { C, V } = S, U = S.ui;
  const st = () => S.state;
  const NB = 640, WF_ROWS = 260;
  let cv, wf, wfx, tune = 'xrad', avg = 16, passMode = 'dop', lastRow = 0, spec = null, specKey = '', passCache = null, rng = S.rng(99);

  const tuning = () => {
    const p = S.TUNING.find(x => x.id === tune), em = S.emitterById(st().sel.emitter);
    if (p.id === 'zoom' && em) { const span = Math.max(em.bw * 6e-6, 0.06); return { fc: em.f, span, name: `Zoom: ${em.id} ${em.name}` }; }
    return p.id === 'zoom' ? S.TUNING[0] : p;
  };

  // spectrum trace in dBm per resolution bandwidth (peak detector), plus per-signal annotations
  const computeSpectrum = () => {
    const s = st(), t = s.t, sat = s.sats[s.sel.sat] || s.sats[0], ss = sat.orbit.stateEcef(t), tu = tuning();
    const f0 = tu.fc - tu.span / 2, df = tu.span / NB, rbw = df * 1e6, band = S.bandFor(tu.fc);
    const n0 = C.K_DBW + S.db(S.tsys(band)), nb = n0 + S.db(rbw);
    const sig = new Float64Array(NB), marks = [];
    for (const em of s.emitters) {
      if (em.f + em.bw / 2e6 < f0 - 1 || em.f - em.bw / 2e6 > f0 + tu.span + 1) continue;
      const es = S.emitterState(em, t), lk = S.link(em, es, sat, ss, t, true);
      if (!lk.visible) continue;
      const act = S.emitterActivity(em, t);
      const fObs = em.f + lk.doppler * 1e-6;
      marks.push({ em, fObs, lk, act });
      if (!act) continue;
      const P = S.lin(lk.pr);                                   // W (peak)
      const bwM = em.bw / 1e6;
      for (let b = 0; b < NB; b++) {
        const lo = f0 + b * df, hi = lo + df;
        let frac;
        if (em.sig === 'pulse') {                                 // sinc² spectrum of a rectangular pulse
          let acc = 0; for (let q = 0; q < 4; q++) { const x = ((lo + (q + 0.5) * df / 4) - fObs) * 1e6 * em.pw; const sc = Math.abs(x) < 1e-9 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x); acc += sc * sc; }
          frac = acc / 4 * rbw * em.pw;
        } else {
          frac = Math.max(0, Math.min(hi, fObs + bwM / 2) - Math.max(lo, fObs - bwM / 2)) / bwM;
        }
        sig[b] += P * Math.min(frac, 1);
      }
    }
    const nl = S.lin(nb), out = new Float32Array(NB);
    for (let b = 0; b < NB; b++) {
      let g = 0; for (let k = 0; k < avg; k++) g -= Math.log(1 - rng() * 0.999999);
      out[b] = S.db(sig[b] + nl * g / avg) + 30;
    }
    return { out, f0, df, span: tu.span, fc: tu.fc, floor: nb + 30, marks, sat, band, name: tu.name, rbw };
  };

  const cmap = (() => {
    const stops = [[0, [5, 9, 17]], [0.25, [14, 43, 84]], [0.5, [18, 120, 150]], [0.72, [242, 165, 58]], [0.9, [255, 224, 160]], [1, [255, 255, 255]]];
    const lut = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const x = i / 255; let k = 0; while (k < stops.length - 2 && x > stops[k + 1][0]) k++;
      const [a, ca] = stops[k], [b, cb] = stops[k + 1], u = (x - a) / (b - a);
      for (let c = 0; c < 3; c++) lut[i * 3 + c] = ca[c] + (cb[c] - ca[c]) * u;
    }
    return lut;
  })();

  const render = () => {
    if (!U.visible(cv)) return;
    const now = performance.now();
    const key = `${tune}:${st().sel.sat}:${st().sel.emitter}`;
    if (!spec || now - lastRow > 70 || key !== specKey) {
      if (key !== specKey) { wfx.fillStyle = '#050911'; wfx.fillRect(0, 0, NB, WF_ROWS); specKey = key; }
      spec = computeSpectrum(); lastRow = now;
      // scroll waterfall down by one row and paint the new row
      wfx.drawImage(wf, 0, 0, NB, WF_ROWS - 1, 0, 1, NB, WF_ROWS - 1);
      const img = wfx.createImageData(NB, 1), lo = spec.floor - 3, hi = spec.floor + 38;
      for (let b = 0; b < NB; b++) { const i = Math.round(S.clamp((spec.out[b] - lo) / (hi - lo), 0, 1) * 255); img.data[4 * b] = cmap[3 * i]; img.data[4 * b + 1] = cmap[3 * i + 1]; img.data[4 * b + 2] = cmap[3 * i + 2]; img.data[4 * b + 3] = 255; }
      wfx.putImageData(img, 0, 0);
    }
    const { ctx, w, h } = U.fit(cv), sp = spec;
    ctx.fillStyle = S.tk('scope-bg'); ctx.fillRect(0, 0, w, h);
    const box = { x: 52, y: 12, w: w - 66, h: Math.max(120, h * 0.42) };
    const y0 = Math.floor((sp.floor - 8) / 10) * 10, y1 = y0 + 60;
    const fmtF = v => sp.span < 1 ? v.toFixed(3) : sp.span < 20 ? v.toFixed(2) : v.toFixed(0);
    ctx.save();
    const ax = { X: v => box.x + (v - sp.f0) / sp.span * box.w, Y: v => box.y + box.h - (v - y0) / (y1 - y0) * box.h };
    ctx.strokeStyle = S.tk('scope-grid'); ctx.lineWidth = 1; ctx.fillStyle = '#7f93ab'; ctx.font = U.mono(10);
    for (let k = 0; k <= 10; k++) { const x = Math.round(box.x + box.w * k / 10) + 0.5; ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke(); if (k % 2 === 0) { ctx.textAlign = 'center'; ctx.fillText(fmtF(sp.f0 + sp.span * k / 10), x, box.y + box.h + 12); } }
    for (let v = y0; v <= y1; v += 10) { const y = Math.round(ax.Y(v)) + 0.5; ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(v, box.x - 6, y + 3); }
    ctx.save(); ctx.translate(14, box.y + box.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(`dBm / ${S.fmtHz(sp.rbw)}`, 0, 0); ctx.restore();
    // noise floor line
    ctx.strokeStyle = '#3a5674'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(box.x, ax.Y(sp.floor)); ctx.lineTo(box.x + box.w, ax.Y(sp.floor)); ctx.stroke(); ctx.setLineDash([]);
    // trace
    ctx.beginPath();
    for (let b = 0; b < NB; b++) { const x = box.x + (b + 0.5) / NB * box.w, y = S.clamp(ax.Y(sp.out[b]), box.y, box.y + box.h); b ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.lineTo(box.x + box.w, box.y + box.h); ctx.lineTo(box.x, box.y + box.h); ctx.closePath(); ctx.fillStyle = 'rgba(127,224,255,0.08)'; ctx.fill();
    // markers
    for (const m of sp.marks) {
      const x = ax.X(m.fObs); if (x < box.x || x > box.x + box.w) continue;
      const sel = m.em.id === st().sel.emitter, col = U.classColor(m.em.cls);
      ctx.strokeStyle = S.rgba(col, sel ? 0.9 : 0.5); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x, box.y + 14); ctx.lineTo(x, box.y + box.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col; ctx.font = U.sans(10.5, 600); ctx.textAlign = 'center'; ctx.fillText(m.em.id + (m.act ? '' : ' ·off'), x, box.y + 10);
      if (tune === 'zoom') { const xn = ax.X(m.em.f); ctx.strokeStyle = '#6a7f99'; ctx.beginPath(); ctx.moveTo(xn, box.y + box.h - 30); ctx.lineTo(xn, box.y + box.h); ctx.stroke(); ctx.fillStyle = '#8fa3bb'; ctx.fillText('f₀', xn, box.y + box.h - 34); ctx.fillText(`Δf ${S.fmtHz(m.lk.doppler)}`, x, box.y + 24); }
    }
    ctx.fillStyle = '#7f93ab'; ctx.font = U.mono(10); ctx.textAlign = 'right'; ctx.fillText('MHz', box.x + box.w, box.y + box.h + 24);
    // waterfall
    const wy = box.y + box.h + 32, wh = h - wy - 8;
    if (wh > 30) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(wf, 0, 0, NB, Math.min(WF_ROWS, Math.round(wh)), box.x, wy, box.w, wh);
      ctx.strokeStyle = S.tk('scope-grid'); ctx.strokeRect(box.x + 0.5, wy + 0.5, box.w, wh);
      ctx.save(); ctx.translate(14, wy + wh / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillStyle = '#7f93ab'; ctx.fillText('time ↓ (newest at top)', 0, 0); ctx.restore();
    }
    ctx.restore();
    document.getElementById('rf-scope-title').textContent = `${sp.sat.name} · ${sp.name}`;
    document.getElementById('rf-scope-info').textContent = `chain ${sp.band.name} · RBW ${S.fmtHz(sp.rbw)} · floor ${sp.floor.toFixed(1)} dBm · peak detector`;
  };

  /* ---------- pass geometry ---------- */
  const passData = () => {
    const s = st(), em = S.emitterById(s.sel.emitter); if (!em) return null;
    const acc = s.plan.accesses.filter(a => a.em === em);
    const a = acc.find(x => s.t >= x.t0 - 120e3 && s.t <= x.t1 + 120e3) || acc.find(x => x.t0 > s.t) || acc[acc.length - 1];
    if (!a) return null;
    const key = `${em.id}:${a.t0}:${s.sats.length}`;
    if (passCache && passCache.key === key) return passCache;
    const t0 = a.t0 - 120e3, t1 = a.t1 + 120e3, n = 200, rows = [];
    for (let k = 0; k <= n; k++) {
      const t = t0 + (t1 - t0) * k / n, es = S.emitterState(em, t);
      rows.push({ t, lk: s.sats.map(sat => S.link(em, es, sat, sat.orbit.stateEcef(t), t)) });
    }
    passCache = { key, em, a, t0, t1, rows };
    return passCache;
  };
  const renderPass = () => {
    const cvp = document.getElementById('rf-passplot'); if (!U.visible(cvp)) return;
    const { ctx, w, h } = U.fit(cvp), s = st(), pd = passData();
    ctx.fillStyle = S.tk('panel'); ctx.fillRect(0, 0, w, h);
    if (!pd) { ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(12); ctx.fillText('No access to this emitter in the planning horizon.', 20, 30); return; }
    const ns = s.sats.length, series = [];
    const get = (r, i) => {
      const l = r.lk[i], l0 = r.lk[0];
      if (!l.visible || (passMode !== 'dop' && passMode !== 'snr' && !l0.visible)) return null;
      if (passMode === 'dop') return l.doppler / 1e3;
      if (passMode === 'snr') return l.snr;
      if (passMode === 'tdoa') return (l.range - l0.range) / C.CKM * 1e6;
      return -pd.em.f * 1e6 / C.CKM * (l.rr - l0.rr);
    };
    for (let i = 0; i < ns; i++) { if ((passMode === 'tdoa' || passMode === 'fdoa') && i === 0) continue; series.push({ i, v: pd.rows.map(r => get(r, i)) }); }
    let lo = Infinity, hi = -Infinity; series.forEach(sr => sr.v.forEach(v => { if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
    if (!isFinite(lo)) { lo = -1; hi = 1; } if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
    const pad = (hi - lo) * 0.08;
    const box = { x: 60, y: 12, w: w - 76, h: h - 40 };
    const unit = { dop: 'Doppler (kHz)', snr: 'SNR in signal BW (dB)', tdoa: 'TDOA vs 3A (µs)', fdoa: 'FDOA vs 3A (Hz)' }[passMode];
    const ax = U.axes(ctx, box, { x0: pd.t0, x1: pd.t1, y0: lo - pad, y1: hi + pad, xticks: U.ticks(pd.t0 / 60e3, pd.t1 / 60e3, 6).map(v => v * 60e3), xfmt: v => S.fmtHM(v), ylabel: unit, ylabelOff: 50 });
    // collection window shading
    const c = s.plan.collections.find(q => q.em === pd.em && q.c0 >= pd.t0 && q.c1 <= pd.t1);
    if (c) { ctx.fillStyle = S.tk('accent-soft'); ctx.fillRect(ax.X(c.c0), box.y, ax.X(c.c1) - ax.X(c.c0), box.h); }
    for (const sr of series) {
      ctx.strokeStyle = U.satColor(sr.i); ctx.lineWidth = 1.6; ctx.beginPath(); let pen = false;
      sr.v.forEach((v, k) => { if (v == null) { pen = false; return; } const x = ax.X(pd.rows[k].t), y = ax.Y(v); pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; });
      ctx.stroke();
    }
    if (s.t >= pd.t0 && s.t <= pd.t1) { const x = ax.X(s.t); ctx.strokeStyle = S.tk('fg'); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke(); ctx.setLineDash([]); }
    ctx.font = U.sans(11, 500); ctx.textAlign = 'left';
    let lx = box.x + 8; for (const sr of series) { ctx.fillStyle = U.satColor(sr.i); const lbl = s.sats[sr.i].name + (passMode === 'tdoa' || passMode === 'fdoa' ? ' − 3A' : ''); ctx.fillText(lbl, lx, box.y + 14); lx += ctx.measureText(lbl).width + 14; }
    ctx.fillStyle = S.tk('muted'); ctx.fillText(`${pd.em.id} pass, max elev. ${(pd.a.maxEl * C.RAD).toFixed(0)}°${c ? ' · shaded: scheduled collection' : ''}`, lx + 6, box.y + 14);
  };

  /* ---------- tables ---------- */
  const refresh = () => {
    const s = st(), t = s.t, sat = s.sats[s.sel.sat] || s.sats[0], ss = sat.orbit.stateEcef(t);
    const rows = [];
    for (const em of s.emitters) {
      const es = S.emitterState(em, t), lk = S.link(em, es, sat, ss, t);
      if (!lk.visible) continue;
      rows.push({ em, lk });
    }
    rows.sort((a, b) => b.lk.snr - a.lk.snr);
    document.getElementById('rf-sig-count').textContent = `${rows.length} above horizon`;
    U.table(document.getElementById('rf-signals'), [{ t: 'ID' }, { t: 'Emitter' }, { t: 'f₀', num: 1 }, { t: 'Doppler', num: 1 }, { t: 'SNR dB', num: 1 }, { t: 'Elev', num: 1 }, { t: 'Range km', num: 1 }],
      rows.map(({ em, lk }) => ({ cls: 'clickable' + (em.id === s.sel.emitter ? ' sel' : ''), attrs: `data-em="${em.id}"`,
        cells: [`${U.clsDot(em.cls)} ${em.id}`, S.esc(em.label), S.fmtMHz(em.f), S.fmtHz(lk.doppler), lk.snr.toFixed(1), (lk.el * C.RAD).toFixed(1) + '°', lk.range.toFixed(0)] })));
    if (!rows.length) document.getElementById('rf-signals').innerHTML += '<tbody><tr><td colspan="7" class="empty">No catalogued emitter is above this spacecraft’s horizon.</td></tr></tbody>';
    // link budget for the emitter of interest
    const em = S.emitterById(s.sel.emitter), lbT = document.getElementById('rf-lb');
    document.getElementById('rf-lb-title').textContent = em ? `${em.id} → ${sat.name}` : '';
    if (em) {
      const es = S.emitterState(em, t), lk = S.link(em, es, sat, ss, t);
      if (!lk.visible) lbT.innerHTML = `<tbody><tr><td class="empty">${em.id} is below ${sat.name}’s horizon (elevation ${(lk.el * C.RAD).toFixed(1)}°). Next access: ${(() => { const a = S.Plan.next(s.plan.accesses.filter(x => x.em === em), t); return a ? S.fmtUtc(a.t0) + ' UTC' : 'none in horizon'; })()}</td></tr></tbody>`;
      else {
        const cr = S.pairCrlb(lk.snr, lk.snr, em.bw, em.tInt, S.onFraction(em));
        U.table(lbT, [{ t: 'Term' }, { t: 'Value', num: 1 }], [
          ['Transmit power', `${em.pDbw.toFixed(1)} dBW`], ['Tx antenna gain toward sat', `${(lk.eirp - em.pDbw).toFixed(1)} dBi`], ['EIRP', `${lk.eirp.toFixed(1)} dBW`],
          ['Slant range / elevation', `${lk.range.toFixed(0)} km / ${(lk.el * C.RAD).toFixed(1)}°`], ['Free-space loss', `−${lk.fspl.toFixed(1)} dB`],
          ['Atmosphere + polarisation', `−${(lk.latm + lk.lpol).toFixed(1)} dB`], [`Rx gain (${lk.band.name}, ${(lk.offNadir * C.RAD).toFixed(0)}° off-nadir)`, `${lk.grx.toFixed(1)} dBi`],
          ['Received power', `${lk.pr.toFixed(1)} dBW`], ['System noise temp.', `${lk.tsys.toFixed(0)} K`], ['C/N₀', `${lk.cn0.toFixed(1)} dB-Hz`],
          ['Signal bandwidth', S.fmtHz(em.bw)], ['SNR (in-band)', `${lk.snr.toFixed(1)} dB`],
          ['Integration / duty', `${(em.tInt * 1e3).toFixed(1)} ms / ${(S.onFraction(em) * 100).toPrecision(2)} %`],
          ['Post-correlation SNR (pair)', `${cr.postDb.toFixed(1)} dB`], ['σ TDOA / σ FDOA (CRLB)', `${S.fmtSec(cr.sT)} / ${cr.sF.toFixed(2)} Hz`]
        ].map(r => ({ cells: r })));
      }
    }
  };
  const bandsTable = () => {
    U.table(document.getElementById('rf-bands'), [{ t: 'Chain' }, { t: 'MHz', num: 1 }, { t: 'G dBi', num: 1 }, { t: 'NF', num: 1 }, { t: 'Tsys K', num: 1 }, { t: 'G/T', num: 1 }],
      S.BANDS.map(b => ({ cells: [b.name, `${b.fmin}–${b.fmax}`, b.gain.toFixed(0), b.nf.toFixed(1), S.tsys(b).toFixed(0), (b.gain - S.db(S.tsys(b))).toFixed(1)] })));
    document.getElementById('rf-bands-note').textContent = 'Antenna temperature is Earth-facing: 290 K above 300 MHz, 1500 K at VHF (man-made and galactic noise). Gain is at nadir with cosⁿ roll-off to the Earth limb.';
  };

  const init = () => {
    cv = document.getElementById('rf-spec');
    wf = document.createElement('canvas'); wf.width = NB; wf.height = WF_ROWS; wfx = wf.getContext('2d'); wfx.fillStyle = '#050911'; wfx.fillRect(0, 0, NB, WF_ROWS);
    const satSel = document.getElementById('rf-sat'), tuneSel = document.getElementById('rf-tune'), emSel = document.getElementById('rf-em');
    const fillSel = () => {
      satSel.innerHTML = st().sats.map((s, i) => `<option value="${i}">${s.name}</option>`).join(''); satSel.value = Math.min(st().sel.sat, st().sats.length - 1);
      emSel.innerHTML = st().emitters.map(e => `<option value="${e.id}">${e.id} · ${S.esc(e.name)}</option>`).join(''); emSel.value = st().sel.emitter;
    };
    tuneSel.innerHTML = S.TUNING.map(x => `<option value="${x.id}">${x.name}</option>`).join(''); tuneSel.value = tune;
    satSel.addEventListener('change', () => { st().sel.sat = +satSel.value; });
    tuneSel.addEventListener('change', () => { tune = tuneSel.value; });
    emSel.addEventListener('change', () => { S.select('emitter', emSel.value); autoTune(); });
    document.getElementById('rf-avg').addEventListener('change', e => { avg = +e.target.value; });
    document.querySelectorAll('#rf-pass-mode button').forEach(b => b.addEventListener('click', () => { passMode = b.dataset.m; U.setSeg(document.getElementById('rf-pass-mode'), 'm', passMode); }));
    document.getElementById('rf-signals').addEventListener('click', e => { const tr = e.target.closest('tr[data-em]'); if (tr) { S.select('emitter', tr.dataset.em); emSel.value = tr.dataset.em; autoTune(); } });
    // hover readout on the spectrum
    const tip = document.getElementById('rf-tip');
    cv.addEventListener('pointermove', e => {
      if (!spec) return; const r = cv.getBoundingClientRect(), x = e.clientX - r.left, bx = 52, bw = r.width - 66;
      const b = Math.floor((x - bx) / bw * NB); if (b < 0 || b >= NB) { tip.hidden = true; return; }
      const f = spec.f0 + (b + 0.5) * spec.df, near = spec.marks.slice().sort((p, q) => Math.abs(p.fObs - f) - Math.abs(q.fObs - f))[0];
      tip.hidden = false; tip.style.left = Math.min(x + 14, r.width - 250) + 'px'; tip.style.top = (e.clientY - r.top + 12) + 'px';
      tip.innerHTML = `<b>${S.fmtMHz(f)}</b><span class="mono">${spec.out[b].toFixed(1)} dBm${near && Math.abs(near.fObs - f) < spec.span * 0.03 ? `<br>${near.em.id} ${S.esc(near.em.label)}` : ''}</span>`;
    });
    cv.addEventListener('pointerleave', () => { tip.hidden = true; });
    bandsTable(); fillSel();
    S.on('rebuild', () => { fillSel(); passCache = null; });
    S.on('select', w => { if (w === 'emitter') { emSel.value = st().sel.emitter; passCache = null; autoTune(); } });
  };
  const autoTune = () => {
    const em = S.emitterById(st().sel.emitter); if (!em) return;
    const p = S.TUNING.find(x => x.id !== 'zoom' && Math.abs(x.fc - em.f) <= x.span / 2);
    tune = p ? p.id : 'zoom'; document.getElementById('rf-tune').value = tune;
  };
  S.views.rf = { init, refresh, render: () => { render(); renderPass(); }, onShow: () => { if (!spec) autoTune(); } };
})(window.SIM);
