/* LYRA-3 simulator — Operations view: common operating picture, cluster state, products, event log. */
'use strict';
(function (S) {
  const { C, V } = S, U = S.ui;
  const st = () => S.state;
  const map = new U.EquiMap();
  const layers = { tracks: true, foot: true, night: true, emitters: true, gs: true, fixes: true };
  let cv, tip, hits = [], drag = null;

  const footprint = (lat, lon, ang) => {
    const pts = [];
    for (let k = 0; k <= 72; k++) pts.push(S.dest(lat, lon, k / 72 * C.TWO_PI, ang * C.RM));
    return pts;
  };

  const render = () => {
    if (!U.visible(cv)) return;
    const { ctx, w, h } = U.fit(cv), s = st(), t = s.t;
    map.setup(w, h);
    map.drawBase(ctx);
    if (layers.night) map.drawNight(ctx, t);
    hits = [];
    const lead = s.sats[0];
    // footprints (10° collection mask) and ground tracks
    s.sats.forEach((sat, i) => {
      const col = U.satColor(i), g = sat.orbit.geo(t);
      if (layers.foot && (i === 0 || map.zoom > 2.5)) {
        const ang = S.coverageAngle(C.RE + g.h, S.Plan.COLLECT_MASK_DEG * C.DEG);
        ctx.save(); ctx.strokeStyle = S.rgba(col, i === 0 ? 0.85 : 0.5); ctx.lineWidth = 1.2; ctx.setLineDash(i === 0 ? [] : [3, 3]);
        map.path(ctx, footprint(g.lat, g.lon, ang)); ctx.stroke();
        if (i === 0) {
          const ang0 = S.coverageAngle(C.RE + g.h, 0);
          ctx.strokeStyle = S.rgba(col, 0.3); ctx.setLineDash([2, 4]); map.path(ctx, footprint(g.lat, g.lon, ang0)); ctx.stroke();
        }
        ctx.restore();
      }
      if (layers.tracks && (i === 0 || map.zoom > 2.5)) {
        const past = [], fut = [], P = sat.orbit.periodNodal * 1000;
        for (let dt = -0.45 * P; dt <= 0; dt += 30e3) { const q = sat.orbit.geo(t + dt); past.push([q.lat, q.lon]); }
        for (let dt = 0; dt <= 1.05 * P; dt += 30e3) { const q = sat.orbit.geo(t + dt); fut.push([q.lat, q.lon]); }
        ctx.save(); ctx.lineWidth = i === 0 ? 1.6 : 1; ctx.strokeStyle = S.rgba(col, 0.9); map.path(ctx, past); ctx.stroke();
        ctx.setLineDash([5, 5]); ctx.strokeStyle = S.rgba(col, 0.55); map.path(ctx, fut); ctx.stroke(); ctx.restore();
      }
    });
    // ground stations
    const leadEcef = lead.orbit.posEcef(t);
    if (layers.gs) for (const g of S.GROUND_STATIONS) {
      const [x, y] = map.xy(g.lat * C.RAD, g.lon * C.RAD), el = S.look(g.ecef, g.lat, g.lon, leadEcef).el;
      const inC = el > S.Plan.GS_MASK_DEG * C.DEG;
      if (inC) { const [sx, sy] = map.xy(lead.orbit.geo(t).lat * C.RAD, lead.orbit.geo(t).lon * C.RAD); if (Math.abs(sx - x) < w / 2) { ctx.save(); ctx.strokeStyle = S.tk('s1'); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(sx, sy); ctx.stroke(); ctx.restore(); } }
      ctx.fillStyle = inC ? S.tk('s1') : S.tk('muted'); ctx.strokeStyle = S.tk('panel'); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.rect(x - 4, y - 4, 8, 8); ctx.fill(); ctx.stroke();
      U.label(ctx, g.name, x + 8, y, inC ? S.tk('s1') : S.tk('muted'));
      hits.push({ x, y, r: 8, html: `<b>${S.esc(g.name)}</b><span class="mono">${g.role} · ${g.dish} m · G/T ${g.gt} dB/K<br>elev. to 3A ${(el * C.RAD).toFixed(1)}°</span>` });
    }
    // active collection lines of sight
    const active = s.plan.collections.filter(c => t >= c.c0 && t <= c.c1);
    for (const c of active) {
      const es = S.emitterState(c.em, t), [ex, ey] = map.xy(es.lat * C.RAD, es.lon * C.RAD);
      s.sats.forEach((sat, i) => {
        const g = sat.orbit.geo(t), [sx, sy] = map.xy(g.lat * C.RAD, g.lon * C.RAD);
        if (Math.abs(sx - ex) > w / 2) return;
        ctx.save(); ctx.strokeStyle = S.rgba(U.satColor(i), 0.8); ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(sx, sy); ctx.stroke(); ctx.restore();
      });
      ctx.save(); ctx.strokeStyle = S.tk('accent'); ctx.lineWidth = 1.5; const ph = (performance.now() / 600) % 1;
      ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(ex, ey, 8 + ph * 18, 0, 7); ctx.stroke(); ctx.restore();
    }
    // fixes
    if (layers.fixes) for (const p of s.products) {
      if (!p.sol.ok) continue;
      const [x, y] = map.xy(p.sol.lat * C.RAD, p.sol.lon * C.RAD), pxPerM = map.s / 111320;
      const e = p.sol.ell, a = e.smaj * e.k95 * pxPerM, b = e.smin * e.k95 * pxPerM;
      const sel = s.sel.product === p;
      ctx.save(); ctx.strokeStyle = sel ? S.tk('accent') : S.tk('ok'); ctx.lineWidth = sel ? 2 : 1.3;
      ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
      if (a > 2) U.ellipse(ctx, x, y, a, b, e.angE, sel ? S.tk('accent') : S.tk('ok'), S.rgba(S.tk('ok'), 0.12));
      ctx.restore();
      hits.push({ x, y, r: 7, product: p, html: `<b>${p.id} · ${S.esc(p.em.name)}</b><span class="mono">${S.fmtLL(p.sol.lat, p.sol.lon)}<br>CEP ${S.fmtM(p.sol.ell.cep)} · ${S.fmtHMS(p.t)} UTC</span>` });
    }
    // emitters
    if (layers.emitters) for (const em of s.emitters) {
      const es = S.emitterState(em, t), [x, y] = map.xy(es.lat * C.RAD, es.lon * C.RAD), sel = s.sel.emitter === em.id;
      U.emitterGlyph(ctx, x, y, U.classColor(em.cls), sel);
      if (map.zoom > 1.6 || sel) U.label(ctx, em.id, x + 8, y - 8, S.tk('fg'));
      if (em.claimed && map.zoom > 2.5) {
        const [cx, cy] = map.xy(em.claimed.lat * C.RAD, em.claimed.lon * C.RAD);
        ctx.save(); ctx.strokeStyle = S.tk('warn'); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.setLineDash([]); ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.stroke(); ctx.restore();
        U.label(ctx, 'AIS claim', cx + 7, cy, S.tk('warn'));
      }
      hits.push({ x, y, r: 9, em, html: `<b>${em.id} · ${S.esc(em.name)}</b><span class="mono">${S.esc(em.label)}<br>${S.fmtMHz(em.f)} · ${S.esc(em.mod)}<br>${S.fmtLL(es.lat, es.lon)}${em.spd ? ` · ${em.spd} kn` : ''}</span>` });
    }
    // satellites
    s.sats.forEach((sat, i) => {
      const g = sat.orbit.geo(t), [x, y] = map.xy(g.lat * C.RAD, g.lon * C.RAD);
      U.satGlyph(ctx, x, y, U.satColor(i), i === 0 ? 5 : 4);
      if (i === 0 || map.zoom > 4) U.label(ctx, sat.name, x + 12, y - 9, U.satColor(i));
      hits.push({ x, y, r: 9, html: `<b>${sat.name}</b><span class="mono">${S.fmtLL(g.lat, g.lon)}<br>alt ${g.h.toFixed(1)} km</span>` });
    });
    const g0 = lead.orbit.geo(t), ss = S.subSolar(t);
    document.getElementById('ops-hud').textContent = `3A ${S.fmtLL(g0.lat, g0.lon)} · ${g0.h.toFixed(1)} km   ☉ ${S.fmtLL(ss.lat, ss.lon)}`;
  };

  /* ---------- side panels ---------- */
  const refresh = () => {
    const s = st(), t = s.t;
    const ecl = S.Plan.inWindows(s.plan.eclipses, t);
    const act = s.plan.collections.filter(c => t >= c.c0 && t <= c.c1);
    const cont = s.plan.contacts.filter(c => t >= c.t0 && t < c.t1);
    document.getElementById('ops-cluster-pill').innerHTML = act.length ? U.pill(`Collecting ${act.map(c => c.em.id).join(', ')}`, 'acc') : cont.length ? U.pill(`Contact ${cont[0].gs.id}`, 'info') : U.pill('Nominal', 'ok');
    const lead = s.sats[0];
    document.getElementById('ops-sats').innerHTML = s.sats.map((sat, i) => {
      const g = sat.orbit.geo(t), v = V.norm(sat.orbit.stateEci(t).v), b = S.Bus.sample(s.bus[i], t);
      const base = i ? V.norm(V.sub(sat.orbit.posEci(t), lead.orbit.posEci(t))) : 0;
      const mode = S.Bus.MODES[b.mode], mk = ['crit', 'dim', 'info', 'acc', 'ok'][b.mode];
      return `<div class="satcard">${U.satDot(i)}<span class="nm">${sat.name}</span>${U.pill(mode, mk)}
        <div class="meta"><span>lat <b>${(g.lat * C.RAD).toFixed(2)}°</b></span><span>lon <b>${(g.lon * C.RAD).toFixed(2)}°</b></span><span>alt <b>${g.h.toFixed(1)}</b></span>
        <span>v <b>${v.toFixed(3)}</b> km/s</span><span>SoC <b>${(b.soc * 100).toFixed(0)}%</b></span><span>${i ? `base <b>${base.toFixed(1)}</b> km` : (ecl ? '<b>eclipse</b>' : '<b>sunlit</b>')}</span></div>
        <div class="bar"><i style="width:${(b.soc * 100).toFixed(0)}%;background:var(${b.soc < 0.3 ? '--crit' : b.soc < 0.5 ? '--warn' : '--ok'})"></i></div></div>`;
    }).join('');
    // upcoming events
    const ev = [];
    s.plan.collections.filter(c => c.c1 > t).slice(0, 4).forEach(c => ev.push({ t: c.c0, txt: `${c.em.id} collection · ${c.em.name}`, cls: 'acc' }));
    s.plan.contacts.filter(c => c.t1 > t).slice(0, 3).forEach(c => ev.push({ t: c.t0, txt: `Contact ${c.gs.name} · ${(c.maxEl * C.RAD).toFixed(0)}°` }));
    const ne = S.Plan.next(s.plan.eclipses, t); if (ne) ev.push({ t: ne.t0, txt: `Eclipse ${S.fmtDur((ne.t1 - ne.t0) / 1000)}` });
    ev.sort((a, b) => a.t - b.t);
    document.getElementById('ops-next').innerHTML = ev.slice(0, 6).map(e => `<div class="event"><span class="t">${S.fmtHM(e.t)}</span><span>${S.esc(e.txt)}</span><span class="in">${e.t <= t ? 'now' : 'T−' + S.fmtDur((e.t - t) / 1000)}</span></div>`).join('');
    // products
    const pl = document.getElementById('ops-products');
    document.getElementById('ops-prod-count').textContent = s.products.length;
    if (pl.dataset.n !== String(s.products.length) || pl.dataset.sel !== String(s.sel.product && s.sel.product.id)) {
      pl.dataset.n = s.products.length; pl.dataset.sel = s.sel.product && s.sel.product.id;
      pl.innerHTML = s.products.length ? s.products.slice(0, 60).map(p => {
        const ok = p.sol.ok;
        return `<div class="product${s.sel.product === p ? ' sel' : ''}" data-id="${p.id}" tabindex="0" role="button">
          <div class="top">${U.clsDot(p.em.cls)}<b>${p.em.id} · ${S.esc(p.em.name)}</b>${ok ? U.pill('CEP ' + S.fmtM(p.sol.ell.cep), U.cepKind(p.sol.ell.cep)) : U.pill('No fix', 'crit')}</div>
          <div class="sub">${p.id} · ${S.fmtHMS(p.t)} · ${ok ? S.fmtLL(p.sol.lat, p.sol.lon) : 'insufficient measurements'}</div>
          ${p.ais && p.ais.inconsistent ? `<div class="sub" style="color:var(--crit)">AIS position ${S.fmtM(p.ais.dist)} from RF fix</div>` : ''}</div>`;
      }).join('') : '<div class="empty">No products yet. The first synchronised collection starts at the next pass. Use “Next collection” to jump ahead.</div>';
    }
    // log
    if (s.logDirty || performance.now() - (s.logAt || 0) > 2000) {
      s.logDirty = false; s.logAt = performance.now();
      const lines = s.log.filter(l => l.t <= t + 60e3).slice(0, 160);
      document.getElementById('ops-log').innerHTML = lines.map(l => `<div class="ln k-${l.kind}"><span class="ts">${S.fmtUtc(l.t)}</span><span class="k">${{ coll: 'COLLECT', fix: 'PRODUCT', gs: 'GROUND', ecl: 'POWER', alert: 'ALERT', info: 'MISSION' }[l.kind] || l.kind}</span><span>${S.esc(l.txt)}</span></div>`).join('');
    }
  };

  const init = () => {
    cv = document.getElementById('ops-map'); tip = document.getElementById('ops-tip');
    document.querySelectorAll('#ops-layers input').forEach(i => i.addEventListener('change', () => { layers[i.dataset.layer] = i.checked; }));
    const zoomAt = (f, x, y) => {
      const [la, lo] = map.ll(x, y); map.zoom = S.clamp(map.zoom * f, 1, 40); map.setup(map.w, map.h);
      const [la2, lo2] = map.ll(x, y); map.cLat += la - la2; map.cLon = ((map.cLon + lo - lo2 + 540) % 360) - 180;
    };
    cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    document.getElementById('ops-zin').onclick = () => zoomAt(1.5, map.w / 2, map.h / 2);
    document.getElementById('ops-zout').onclick = () => zoomAt(1 / 1.5, map.w / 2, map.h / 2);
    document.getElementById('ops-zreset').onclick = () => { map.zoom = 1; map.cLat = 20; map.cLon = 20; };
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, lat: map.cLat, lon: map.cLon, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
        map.cLon = ((drag.lon - dx / map.s + 540) % 360) - 180; map.cLat = drag.lat + dy / map.s;
      }
      const hit = hits.slice().reverse().find(hh => Math.hypot(hh.x - x, hh.y - y) < hh.r);
      if (hit && !drag) { tip.hidden = false; tip.innerHTML = hit.html; tip.style.left = Math.min(x + 14, r.width - 290) + 'px'; tip.style.top = (y + 14) + 'px'; cv.style.cursor = hit.em || hit.product ? 'pointer' : 'default'; }
      else { tip.hidden = true; cv.style.cursor = drag ? 'grabbing' : 'grab'; }
    });
    cv.addEventListener('pointerleave', () => { tip.hidden = true; });
    cv.addEventListener('pointerup', e => {
      const moved = drag && drag.moved; drag = null;
      if (moved) return;
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const hit = hits.slice().reverse().find(hh => Math.hypot(hh.x - x, hh.y - y) < hh.r && (hh.em || hh.product));
      if (hit && hit.em) S.select('emitter', hit.em.id);
      if (hit && hit.product) { S.select('product', hit.product); S.select('coll', hit.product.coll); S.showTab('geo'); }
    });
    document.getElementById('ops-products').addEventListener('click', e => {
      const el = e.target.closest('.product'); if (!el) return;
      const p = st().products.find(q => q.id === el.dataset.id); if (!p) return;
      S.select('product', p); S.select('coll', p.coll); S.select('emitter', p.em.id); S.showTab('geo');
    });
    document.getElementById('ops-products').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList.contains('product')) e.target.click(); });
    map.cLon = 20; map.cLat = 22;
  };
  S.views.ops = { init, render, refresh, onShow: () => { st().logDirty = true; } };
})(window.SIM);
