/* TALOS-3 simulator — Planning view: tasking request (mock-up wired to the planner), target deck,
   36 h Gantt of accesses / collections / contacts / eclipses, collection and contact tables. */
'use strict';
(function (S) {
  const { C } = S, U = S.ui;
  const st = () => S.state;
  let gcv, tip, bars = [], lastFeas = '';

  const renderGantt = () => {
    if (!U.visible(gcv)) return;
    const { ctx, w, h } = U.fit(gcv), s = st(), pl = s.plan, [t0, t1] = s.horizon;
    ctx.fillStyle = S.tk('panel'); ctx.fillRect(0, 0, w, h);
    const rows = [...s.emitters.map(e => ({ kind: 'em', em: e, label: `${e.id} ${e.name}` })), { kind: 'gs', label: 'Ground contacts' }, { kind: 'ecl', label: 'Eclipse (3A)' }];
    const lw = Math.min(210, w * 0.32), top = 26, rh = Math.max(16, Math.min(24, (h - top - 10) / rows.length));
    const X = t => lw + (t - t0) / (t1 - t0) * (w - lw - 10);
    bars = [];
    // hour grid
    ctx.font = U.mono(10); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const h0 = Math.ceil(t0 / 3600e3) * 3600e3, stepH = w < 700 ? 6 : 3;
    for (let t = h0; t <= t1; t += 3600e3) {
      const x = Math.round(X(t)) + 0.5, hr = new Date(t).getUTCHours();
      ctx.strokeStyle = hr === 0 ? S.tk('line') : S.tk('line-soft'); ctx.beginPath(); ctx.moveTo(x, top - 4); ctx.lineTo(x, top + rows.length * rh); ctx.stroke();
      if (hr % stepH === 0) { ctx.fillStyle = S.tk('muted'); ctx.fillText(hr === 0 ? S.iso(t).slice(5, 10) : `${String(hr).padStart(2, '0')}h`, x, 14); }
    }
    rows.forEach((r, i) => {
      const y = top + i * rh;
      if (i % 2) { ctx.fillStyle = S.rgba(S.tk('raise'), 0.5); ctx.fillRect(0, y, w, rh); }
      ctx.fillStyle = r.kind === 'em' && r.em.id === s.sel.emitter ? S.tk('accent') : S.tk('fg'); ctx.font = U.sans(11.5, r.kind === 'em' && r.em.id === s.sel.emitter ? 600 : 400); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      if (r.kind === 'em') { ctx.fillStyle = U.classColor(r.em.cls); ctx.beginPath(); ctx.arc(10, y + rh / 2, 4, 0, 7); ctx.fill(); ctx.fillStyle = r.em.id === s.sel.emitter ? S.tk('accent') : S.tk('fg'); }
      let lbl = r.label; while (ctx.measureText(lbl).width > lw - 26 && lbl.length > 4) lbl = lbl.slice(0, -2);
      ctx.fillText(lbl === r.label ? lbl : lbl + '…', 20, y + rh / 2);
      const bar = (a, b, col, alpha, info, obj) => {
        const xa = X(Math.max(a, t0)), xb = X(Math.min(b, t1)); if (xb < lw) return;
        const ww = Math.max(xb - xa, 2.5); ctx.fillStyle = S.rgba(col, alpha); ctx.fillRect(xa, y + 3, ww, rh - 6);
        bars.push({ x: xa, y: y + 3, w: ww, h: rh - 6, info, obj });
      };
      if (r.kind === 'em') {
        for (const a of pl.accesses.filter(q => q.em === r.em)) {
          if (a.status === 'planned') { bar(a.t0, a.t1, S.tk('dim'), 0.35, a); bar(a.c0, a.c1, a.status === 'planned' && a.product ? S.tk('ok') : S.tk('accent'), 1, a, a); }
          else bar(a.t0, a.t1, S.tk('dim'), 0.55, a);
        }
      } else if (r.kind === 'gs') {
        for (const c of pl.contacts) bar(c.t0, c.t1, S.tk('s1'), 0.85, { gs: c });
      } else for (const e of pl.eclipses) bar(e.t0, e.t1, S.tk('line'), 1, { ecl: e });
    });
    // done collections recolour
    for (const c of pl.collections) if (c.status === 'done') { const b = bars.find(q => q.obj === c); if (b) { ctx.fillStyle = S.tk('ok'); ctx.fillRect(b.x, b.y, b.w, b.h); } }
    // now
    const xn = X(s.t); ctx.strokeStyle = S.tk('crit'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xn, top - 6); ctx.lineTo(xn, top + rows.length * rh); ctx.stroke();
    ctx.fillStyle = S.tk('crit'); ctx.font = U.mono(10); ctx.textAlign = 'center'; ctx.fillText('now', xn, top + rows.length * rh + 11);
  };

  const tipHtml = b => {
    const i = b.info;
    if (i.gs) return `<b>${S.esc(i.gs.gs.name)}</b><span class="mono">AOS ${S.fmtHMS(i.gs.t0)} · LOS ${S.fmtHMS(i.gs.t1)}<br>${S.fmtDur((i.gs.t1 - i.gs.t0) / 1000)} · max ${(i.gs.maxEl * C.RAD).toFixed(0)}°</span>`;
    if (i.ecl) return `<b>Eclipse</b><span class="mono">${S.fmtHMS(i.ecl.t0)}–${S.fmtHMS(i.ecl.t1)} · ${S.fmtDur((i.ecl.t1 - i.ecl.t0) / 1000)}</span>`;
    const p = i.product;
    return `<b>${i.id} · ${i.em.id} ${S.esc(i.em.name)}</b><span class="mono">access ${S.fmtHMS(i.t0)}–${S.fmtHMS(i.t1)} · max ${(i.maxEl * C.RAD).toFixed(0)}°<br>
      ${i.status === 'planned' ? `collection ${S.fmtHMS(i.c0)}–${S.fmtHMS(i.c1)}` : i.status === 'conflict' ? 'not scheduled: receiver channels busy' : 'infeasible: short pass or too few measurements'}<br>
      predicted CEP ${U.cepTxt(i.predCep)}${p && p.sol.ok ? ` · achieved ${S.fmtM(p.sol.ell.cep)}` : ''}</span>`;
  };

  const refresh = () => {
    const s = st(), pl = s.plan, t = s.t;
    // deck
    U.table(document.getElementById('deck'), [{ t: 'ID' }, { t: 'Target' }, { t: 'Signal' }, { t: 'Prio', num: 1 }, { t: 'Next access' }, { t: 'Passes', num: 1 }, { t: 'Best pred. CEP', num: 1 }, { t: 'Latest fix' }],
      s.emitters.map(em => {
        const acc = pl.accesses.filter(a => a.em === em), nx = acc.find(a => a.t1 > t), best = acc.filter(a => a.predCep != null).sort((a, b) => a.predCep - b.predCep)[0];
        const last = s.products.find(p => p.em === em && p.sol.ok);
        return { cls: 'clickable' + (em.id === s.sel.emitter ? ' sel' : ''), attrs: `data-em="${em.id}"`, cells: [
          `${U.clsDot(em.cls)} ${em.id}`, S.esc(em.name), `${S.fmtMHz(em.f)} ${S.esc(em.label.split(' ').slice(0, 2).join(' '))}`, em.prio,
          nx ? (nx.t0 <= t ? '<b>in view</b>' : `${S.fmtHM(nx.t0)} (T−${S.fmtDur((nx.t0 - t) / 1000)})`) : '—', acc.length, best ? U.cepTxt(best.predCep) : '—',
          last ? `${S.fmtHM(last.t)} · ${S.fmtM(last.sol.ell.cep)}${last.ais && last.ais.inconsistent ? ' · <span style="color:var(--crit)">AIS mismatch</span>' : ''}` : '<span class="muted">none</span>'] };
      }));
    document.getElementById('deck-count').textContent = `${s.emitters.length} targets`;
    // collections
    const cs = pl.collections;
    document.getElementById('coll-count').textContent = `${cs.length} scheduled · ${pl.accesses.filter(a => a.status === 'conflict').length} conflicts`;
    U.table(document.getElementById('coll-table'), [{ t: '#', num: 1 }, { t: 'Target' }, { t: 'Start UTC' }, { t: 'Dur', num: 1 }, { t: 'Max el', num: 1 }, { t: 'Pred. CEP', num: 1 }, { t: 'Status' }],
      cs.map(c => ({ cls: 'clickable' + (s.sel.coll === c ? ' sel' : ''), attrs: `data-c="${c.id}"`, cells: [c.seq, `${U.clsDot(c.em.cls)} ${c.em.id} ${S.esc(c.em.name)}`, S.fmtUtc(c.c0).slice(5, 19), S.fmtDur((c.c1 - c.c0) / 1000), (c.maxEl * C.RAD).toFixed(0) + '°', U.cepTxt(c.predCep),
        c.status === 'done' ? (c.product.sol.ok ? U.pill(`${S.fmtM(c.product.sol.ell.cep)}`, U.cepKind(c.product.sol.ell.cep)) : U.pill('no fix', 'crit')) : c.status === 'active' ? U.pill('collecting', 'acc') : U.pill('planned', 'dim')] })));
    // contacts
    const ct = pl.contacts.filter(c => c.t1 > t - 2 * 3600e3);
    document.getElementById('gs-count').textContent = `${pl.contacts.length} in horizon`;
    U.table(document.getElementById('gs-table'), [{ t: 'Station' }, { t: 'AOS' }, { t: 'Dur', num: 1 }, { t: 'Max el', num: 1 }, { t: 'Volume', num: 1 }],
      ct.slice(0, 40).map(c => {
        const vol = S.Bus.downlink(Math.max(5, c.maxEl * C.RAD * 0.6), c.gs).rate * (c.t1 - c.t0) / 1000 / 8e9;
        return { cls: t >= c.t0 && t < c.t1 ? 'sel' : '', cells: [c.gs.name, S.fmtUtc(c.t0).slice(5, 19), S.fmtDur((c.t1 - c.t0) / 1000), (c.maxEl * C.RAD).toFixed(0) + '°', `${vol.toFixed(1)} GB`] };
      }));
  };

  const feasibility = em => {
    const pl = st().plan, acc = pl.accesses.filter(a => a.em === em), t = st().t;
    const sched = pl.collections.filter(c => c.em === em && c.c1 > t);
    const best = acc.filter(a => a.predCep != null).sort((a, b) => a.predCep - b.predCep)[0];
    if (!acc.length) return `<span style="color:var(--crit)">Not feasible:</span> no pass above 10° elevation in the next 36 h.`;
    const first = sched[0];
    return `${first ? `<b style="color:var(--ok)">Scheduled.</b> First collection ${S.fmtUtc(first.c0).slice(5, 16)} UTC, predicted CEP ${U.cepTxt(first.predCep)}` : `<b style="color:var(--warn)">Accesses found but not scheduled</b> (channel conflicts with higher-priority targets)`}. ${acc.length} passes; best predicted CEP ${best ? U.cepTxt(best.predCep) : '—'}${em.reqCep && best ? (best.predCep <= em.reqCep ? `, meets the ${S.fmtM(em.reqCep)} requirement.` : `, does not meet the ${S.fmtM(em.reqCep)} requirement.`) : '.'}`;
  };

  const init = () => {
    gcv = document.getElementById('gantt-c'); tip = document.getElementById('gantt-tip');
    document.getElementById('t-type').innerHTML = Object.entries(S.EMITTER_TYPES).map(([k, v]) => `<option value="${k}">${v.label} · ${S.fmtMHz(v.f)}</option>`).join('');
    document.getElementById('t-type').value = 'navradarX';
    document.getElementById('task-form').addEventListener('submit', e => {
      e.preventDefault();
      const s = st(), n = s.emitters.length + 1, id = `E${String(n).padStart(2, '0')}`;
      const type = document.getElementById('t-type').value, mobile = document.getElementById('t-mobile').checked;
      const lat = S.clamp(+document.getElementById('t-lat').value, -85, 85), lon = S.clamp(+document.getElementById('t-lon').value, -180, 180);
      const name = (document.getElementById('t-name').value || `Target ${id}`).slice(0, 40);
      const em = Object.assign({}, S.EMITTER_TYPES[type], { id, type, name, lat: lat * C.DEG, lon: lon * C.DEG, alt: 0.02, spd: mobile ? 9 : 0, hdg: 75, patrol: 50, mobile,
        prio: +document.getElementById('t-prio').value, reqCep: +document.getElementById('t-cep').value, claimed: null, note: 'Analyst tasking request.' });
      s.emitters.push(em);
      S.log('info', `Tasking request ${id} “${name}” accepted: ${em.label}, priority ${em.prio}, required CEP ${S.fmtM(em.reqCep)}`);
      S.rebuild(s.horizon[0]);
      S.select('emitter', id);
      document.getElementById('t-feas').innerHTML = feasibility(em);
      document.getElementById('t-name').value = `Contact XRAY-${20 + n}`;
    });
    gcv.addEventListener('pointermove', e => {
      const r = gcv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const b = bars.slice().reverse().find(q => x >= q.x - 2 && x <= q.x + q.w + 2 && y >= q.y && y <= q.y + q.h);
      if (b) { tip.hidden = false; tip.innerHTML = tipHtml(b); tip.style.left = Math.min(x + 14, r.width - 300) + 'px'; tip.style.top = (y + 16) + 'px'; gcv.style.cursor = b.obj ? 'pointer' : 'default'; }
      else { tip.hidden = true; gcv.style.cursor = 'default'; }
    });
    gcv.addEventListener('pointerleave', () => { tip.hidden = true; });
    gcv.addEventListener('click', e => {
      const r = gcv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const b = bars.slice().reverse().find(q => q.obj && x >= q.x - 2 && x <= q.x + q.w + 2 && y >= q.y && y <= q.y + q.h);
      if (b) { S.select('coll', b.obj); S.select('emitter', b.obj.em.id); S.showTab('geo'); }
    });
    document.getElementById('deck').addEventListener('click', e => { const tr = e.target.closest('tr[data-em]'); if (tr) { S.select('emitter', tr.dataset.em); document.getElementById('t-feas').innerHTML = feasibility(S.emitterById(tr.dataset.em)); } });
    document.getElementById('coll-table').addEventListener('click', e => { const tr = e.target.closest('tr[data-c]'); if (!tr) return; const c = st().plan.collections.find(q => q.id === tr.dataset.c); if (c) { S.select('coll', c); S.select('emitter', c.em.id); S.showTab('geo'); } });
    S.on('rebuild', () => { refresh(); renderGantt(); });
  };
  S.views.plan = { init, refresh, render: renderGantt };
})(window.SIM);
