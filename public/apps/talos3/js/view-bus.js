/* TALOS-3 simulator — Spacecraft view: KPIs, housekeeping telemetry strips, mode state machine,
   power / mass / downlink / propulsion budgets. */
'use strict';
(function (S) {
  const { C } = S, U = S.ui, B = S.Bus;
  const st = () => S.state;
  let sat = 0, win = 6, ccv, tablesKey = '';

  const renderChart = () => {
    if (!U.visible(ccv)) return;
    const { ctx, w, h } = U.fit(ccv), s = st(), sim = s.bus[sat]; if (!sim) return;
    ctx.fillStyle = S.tk('panel'); ctx.fillRect(0, 0, w, h);
    const tEnd = sim.t0 + (sim.n - 1) * sim.step;
    const t0 = win >= 18 ? sim.t0 : Math.max(sim.t0, s.t - win * 3600e3), t1 = win >= 18 ? tEnd : Math.min(tEnd, s.t + win * 3600e3);
    const k0 = Math.max(0, Math.floor((t0 - sim.t0) / sim.step)), k1 = Math.min(sim.n - 1, Math.ceil((t1 - sim.t0) / sim.step));
    const left = 62, right = 14, bandH = 14, gap = 16, top = 8;
    const strips = [
      { key: 'soc', label: 'Battery SoC (%)', y0: 0, y1: 100, f: k => sim.soc[k] * 100, col: S.tk('ok') },
      { key: 'pwr', label: 'Power (W)', y0: 0, y1: 360, f: k => sim.pGen[k], f2: k => sim.pLoad[k], col: S.tk('warn'), col2: S.tk('s2') },
      { key: 'store', label: 'Mass memory (%)', y0: 0, y1: 100, f: k => sim.store[k] * 100, col: S.tk('s1') },
      { key: 'temp', label: 'Payload temp (°C)', y0: -10, y1: 40, f: k => sim.temp[k], col: S.tk('c-radar') }
    ];
    const sh = (h - top - bandH - 8 - gap * strips.length - 18) / strips.length;
    const X = t => left + (t - t0) / (t1 - t0) * (w - left - right);
    // mode band
    for (let k = k0; k < k1; k++) { ctx.fillStyle = S.tk(B.MODE_COLORS[sim.mode[k]].slice(2)); ctx.fillRect(X(sim.t0 + k * sim.step), top, Math.max(1, X(sim.t0 + (k + 1) * sim.step) - X(sim.t0 + k * sim.step)) + 0.5, bandH); }
    ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(10.5); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('Mode', left - 6, top + bandH / 2);
    strips.forEach((sp, i) => {
      const box = { x: left, y: top + bandH + 8 + gap + i * (sh + gap), w: w - left - right, h: sh };
      // eclipse shading
      for (let k = k0; k < k1; k++) if (sim.ecl[k]) { ctx.fillStyle = S.rgba(S.tk('dim'), 0.16); ctx.fillRect(X(sim.t0 + k * sim.step), box.y, X(sim.t0 + (k + 1) * sim.step) - X(sim.t0 + k * sim.step) + 0.5, box.h); }
      const ax = U.axes(ctx, box, { x0: t0, x1: t1, y0: sp.y0, y1: sp.y1, yticks: U.ticks(sp.y0, sp.y1, Math.max(2, sh / 26)), xticks: U.ticks(t0 / 3600e3, t1 / 3600e3, Math.max(3, box.w / 110)).map(v => v * 3600e3), xfmt: v => S.fmtHM(v), noXLabels: i < strips.length - 1 });
      const line = (f, col, fill) => {
        ctx.beginPath(); for (let k = k0; k <= k1; k++) { const x = X(sim.t0 + k * sim.step), y = ax.Y(S.clamp(f(k), sp.y0, sp.y1)); k > k0 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke();
        if (fill) { ctx.lineTo(X(sim.t0 + k1 * sim.step), box.y + box.h); ctx.lineTo(X(sim.t0 + k0 * sim.step), box.y + box.h); ctx.closePath(); ctx.fillStyle = S.rgba(col, 0.1); ctx.fill(); }
      };
      line(sp.f, sp.col, true); if (sp.f2) line(sp.f2, sp.col2, false);
      ctx.fillStyle = S.tk('fg'); ctx.font = U.sans(11, 500); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(sp.label, box.x + 6, box.y + 4);
      if (sp.f2) { ctx.fillStyle = sp.col; ctx.fillText('generated', box.x + 110, box.y + 4); ctx.fillStyle = sp.col2; ctx.fillText('consumed', box.x + 182, box.y + 4); }
      const kn = S.clamp(Math.round((s.t - sim.t0) / sim.step), 0, sim.n - 1), v = sp.f(kn);
      ctx.fillStyle = sp.col; ctx.textAlign = 'right'; ctx.font = U.mono(11); ctx.fillText(v.toFixed(sp.key === 'temp' ? 1 : 0), box.x + box.w - 6, box.y + 4);
    });
    const xn = X(s.t); if (xn >= left && xn <= w - right) { ctx.strokeStyle = S.tk('fg'); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xn, top); ctx.lineTo(xn, h - 20); ctx.stroke(); ctx.setLineDash([]); }
  };

  const refresh = () => {
    const s = st(), sim = s.bus[sat]; if (!sim) return;
    const b = B.sample(sim, s.t), o = s.sats[sat].orbit, beta = S.betaAngle(o, s.t) * C.RAD;
    const kp = [
      ['Mode', B.MODES[b.mode], b.dl ? 'X-band downlink active' : b.ecl ? 'in eclipse' : 'sunlit'],
      ['Battery', `${(b.soc * 100).toFixed(0)} %`, `${(b.soc * B.SPEC.battWh).toFixed(0)} of ${B.SPEC.battWh} Wh`],
      ['Power', `${b.pGen.toFixed(0)} / ${b.pLoad.toFixed(0)} W`, 'generated / consumed'],
      ['Mass memory', `${(b.store * 100).toFixed(1)} %`, `${(b.store * B.SPEC.storeBits / 8e9).toFixed(0)} GB of ${(B.SPEC.storeBits / 8e9).toFixed(0)} GB`],
      ['Payload temp.', `${b.temp.toFixed(1)} °C`, 'operating −10 to +45 °C'],
      ['Beta angle', `${beta.toFixed(1)}°`, 'Sun to orbit-plane angle']
    ];
    document.getElementById('bus-kpis').innerHTML = kp.map(([l, v, sub]) => `<div class="kpi"><span class="l">${l}</span><span class="v">${v}</span><span class="s">${sub}</span></div>`).join('');
    B.MODES.forEach((m, i) => { const r = document.getElementById('m-' + m); if (r) r.classList.toggle('on', i === b.mode); });
    const key = `${sat}:${s.bus.length}:${s.plan.collections.length}`;
    if (key === tablesKey) return; tablesKey = key;
    // power budget with orbit-average duty from the simulation
    const frac = [0, 0, 0, 0, 0]; let ecl = 0, gen = 0, load = 0;
    for (let k = 0; k < sim.n; k++) { frac[sim.mode[k]]++; ecl += sim.ecl[k]; gen += sim.pGen[k]; load += sim.pLoad[k]; }
    const n = sim.n, dl = sim.dl.reduce((a, v) => a + v, 0) / n;
    const duty = { always: 1, eclipse: ecl / n, survey: (frac[2] + frac[4]) / n, collect: frac[3] / n, downlink: dl };
    U.table(document.getElementById('pwr-table'), [{ t: 'Load' }, { t: 'W', num: 1 }, { t: 'Duty', num: 1 }, { t: 'Orbit avg W', num: 1 }],
      B.SPEC.power.map(([nm, wv, m]) => ({ cells: [nm, wv, `${(duty[m] * 100).toFixed(1)} %`, (wv * duty[m]).toFixed(1)] })),
      { foot: ['Consumed / generated (simulated)', '', '', `${(load / n).toFixed(0)} / ${(gen / n).toFixed(0)}`] });
    document.getElementById('pwr-note').textContent = `margin ${(((gen - load) / load) * 100).toFixed(0)} % · arrays ${B.SPEC.arrayPeak} W peak + ${B.SPEC.bodyPanel} W body`;
    const mt = B.massTotals();
    U.table(document.getElementById('mass-table'), [{ t: 'Subsystem' }, { t: 'Description', wrap: 1 }, { t: 'kg', num: 1 }],
      [...B.SPEC.mass.map(([a, d, kg]) => ({ cells: [a, S.esc(d), kg.toFixed(1)] })), { cells: [`System margin (${B.SPEC.marginPct} % of dry)`, 'Design maturity allowance', mt.margin.toFixed(1)] }],
      { foot: ['Launch mass (wet)', `dry ${mt.dry.toFixed(1)} kg + propellant ${B.SPEC.propKg} kg + margin`, mt.wet.toFixed(1)] });
    document.getElementById('mass-pill').textContent = `${mt.wet.toFixed(1)} kg`;
    renderDl();
    // propulsion / lifetime
    const dv = B.deltaV(), a = o.a * 1000, v = Math.sqrt(398600.4418e9 / a), bc = mt.wet / (2.2 * 0.9);
    const decay = rho => rho * Math.sqrt(398600.4418e9 * a) / bc * 3.156e7 / 1000;   // km/yr
    const deorbit = v * (o.a - (6378.137 + 350)) / (4 * o.a) * 1000 / 1000;           // lower perigee to 350 km
    const items = [['Formation acquisition after separation', 12], ['Formation keeping, differential drag, 5 yr', 15], ['Collision avoidance, 5 yr', 10], ['Disposal: perigee to 350 km (≤ 5 yr re-entry)', deorbit]];
    const need = items.reduce((s2, x) => s2 + x[1], 0);
    U.table(document.getElementById('dv-table'), [{ t: 'Item' }, { t: 'Δv (m/s)', num: 1 }, { t: 'Notes', wrap: 1 }],
      [...items.map(([k, x], i) => ({ cells: [k, x.toFixed(1), ['along-track drift stop + cross-track ΔΩ trim', `natural decay at ${(o.a - 6378.137).toFixed(0)} km: ${decay(1e-13).toFixed(1)} km/yr (solar min) to ${decay(6e-13).toFixed(1)} km/yr (solar max)`, '≈ 2 manoeuvres per spacecraft-year', 'Hohmann half-burn; natural lifetime > 5 yr at this altitude'][i]] })),
        { cells: ['Available (LMP-103S, Isp 220 s)', dv.total.toFixed(1), `${B.SPEC.propKg} kg propellant, ${mt.wet.toFixed(1)} kg wet mass`] }],
      { foot: ['Margin', (dv.total - need).toFixed(1), `${((dv.total / need - 1) * 100).toFixed(0)} % over requirement`] });
  };
  const renderDl = () => {
    const gs = S.GROUND_STATIONS.find(g => g.id === document.getElementById('dl-gs').value) || S.GROUND_STATIONS[1];
    U.table(document.getElementById('dl-table'), [{ t: 'Elev', num: 1 }, { t: 'Range km', num: 1 }, { t: 'C/N₀ dB-Hz', num: 1 }, { t: 'Es/N₀ dB', num: 1 }, { t: 'MODCOD' }, { t: 'Mbit/s', num: 1 }, { t: 'Margin dB', num: 1 }],
      [5, 10, 20, 30, 60, 90].map(e => { const d = B.downlink(e, gs); return { cells: [e + '°', d.range.toFixed(0), d.cn0.toFixed(1), d.esn0.toFixed(1), d.modcod, (d.rate / 1e6).toFixed(0), d.margin.toFixed(1)] }; }));
  };

  const init = () => {
    ccv = document.getElementById('bus-chart');
    const seg = document.getElementById('bus-sat');
    const fill = () => { seg.innerHTML = st().sats.map((s, i) => `<button data-s="${i}" aria-pressed="${i === sat}">${s.name}</button>`).join(''); };
    fill();
    seg.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; sat = +b.dataset.s; U.setSeg(seg, 's', sat); tablesKey = ''; refresh(); });
    document.querySelectorAll('#bus-win button').forEach(b => b.addEventListener('click', () => { win = +b.dataset.w; U.setSeg(document.getElementById('bus-win'), 'w', win); }));
    const dg = document.getElementById('dl-gs');
    dg.innerHTML = S.GROUND_STATIONS.map(g => `<option value="${g.id}">${g.name} · G/T ${g.gt}</option>`).join(''); dg.value = 'SVB';
    dg.addEventListener('change', renderDl);
    S.on('rebuild', () => { if (sat >= st().sats.length) sat = 0; fill(); tablesKey = ''; });
  };
  S.views.bus = { init, refresh, render: renderChart };
})(window.SIM);
