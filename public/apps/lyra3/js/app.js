/* LYRA-3 simulator — application state, simulation clock, product generation and view orchestration. */
'use strict';
(function (S) {
  const { C } = S;
  const H = 3600e3;

  S.PRESETS = {
    tri: [[0, 0], [-35, 14], [-70, -14], [-105, 6]],
    trail: [[0, 0], [-35, 0], [-70, 0], [-105, 0]],
    wide: [[0, 0], [-60, 30], [-125, -30], [-185, 10]],
    tight: [[0, 0], [-5, 3], [-10, -3], [-15, 1]]
  };
  S.ORBIT_DEFAULT = () => ({
    altKm: 550, ecc: 0.0005, sso: true, incDeg: 97.59, ltanH: 22.5, argpDeg: 90, M0Deg: 119, epoch: S.SCEN_EPOCH,
    nSats: 3, preset: 'tri', sats: S.PRESETS.tri.map(([a, c]) => ({ along: a, cross: c }))
  });

  const st = S.state = {
    t: S.SCEN_EPOCH, playing: true, speed: 20, tab: 'ops',
    orbitCfg: S.ORBIT_DEFAULT(), geoCfg: S.Geo.defaults(),
    sats: [], emitters: S.SCENARIO(), plan: null, bus: null, horizon: [0, 0],
    products: [], processed: new Map(), log: [], logDirty: true, prodSeq: 0,
    sel: { emitter: 'E01', sat: 0, coll: null, product: null }
  };

  S.log = (kind, txt, t = st.t) => {
    st.log.push({ t, kind, txt });
    st.log.sort((a, b) => b.t - a.t);
    if (st.log.length > 400) st.log.length = 400;
    st.logDirty = true;
  };
  S.emitterById = id => st.emitters.find(e => e.id === id);

  /* ---------- planning horizon ---------- */
  S.rebuild = (t0) => {
    st.sats = S.buildCluster(st.orbitCfg);
    st.horizon = [t0, t0 + 36 * H];
    st.plan = S.Plan.compute(st.sats, st.emitters, st.horizon[0], st.horizon[1], st.geoCfg);
    st.bus = S.Bus.simulate(st.sats, st.plan, st.emitters, st.horizon[0], st.horizon[1]);
    for (const c of st.plan.collections) {
      const p = st.processed.get(keyOf(c));
      if (p) { c.status = 'done'; c.product = p; }
      else if (c.c1 <= st.t) processCollection(c, true);
    }
    if (st.sel.coll && !st.plan.collections.includes(st.sel.coll)) st.sel.coll = null;
    S.emit('rebuild');
  };
  const keyOf = c => `${c.em.id}:${Math.round(c.c0 / 60000)}`;

  /* ---------- turn a finished collection into a geolocation product ---------- */
  const processCollection = (c, quiet) => {
    const key = keyOf(c);
    if (st.processed.has(key)) { c.status = 'done'; c.product = st.processed.get(key); return c.product; }
    const gc = Object.assign({}, st.geoCfg);
    const col = S.Geo.collect(c.em, st.sats, c.cMid, gc);
    const seed = Math.floor(S.hash(c.c0 / 1000, c.em.id.charCodeAt(1) * 131 + c.em.id.charCodeAt(2)) * 2 ** 31);
    const dr = S.Geo.draw(col, seed), sol = S.Geo.solve(col, dr);
    const p = { id: `GEO-${String(++st.prodSeq).padStart(4, '0')}`, key, coll: c, em: c.em, t: c.c1, col, dr, sol, seed, gc };
    if (sol.ok && c.em.claimed) {
      const d = S.gcDist(c.em.claimed.lat, c.em.claimed.lon, sol.lat, sol.lon) * 1000;
      p.ais = { dist: d, inconsistent: d > 3 * sol.ell.smaj * sol.ell.k95 + 500 };
    }
    st.processed.set(key, p);
    st.products.push(p); st.products.sort((a, b) => b.t - a.t);
    c.status = 'done'; c.product = p;
    if (sol.ok) {
      S.log('fix', `${p.id} ${c.em.id} ${c.em.name}: ${S.fmtLL(sol.lat, sol.lon)}, CEP ${S.fmtM(sol.ell.cep)} (${sol.nMeas} meas.)`, c.c1 + 40e3);
      if (p.ais && p.ais.inconsistent) S.log('alert', `${c.em.id} AIS-reported position is ${S.fmtM(p.ais.dist)} from the RF fix. Possible AIS spoofing.`, c.c1 + 41e3);
    } else S.log('alert', `${c.em.id} ${c.em.name}: no fix. ${sol.reason}`, c.c1 + 40e3);
    if (!quiet) S.emit('product', p);
    return p;
  };
  S.processCollection = processCollection;

  /* ---------- clock ---------- */
  const scanEvents = (a, b) => {
    const pl = st.plan; if (!pl) return;
    for (const c of pl.contacts) {
      if (c.t0 > a && c.t0 <= b) S.log('gs', `AOS ${c.gs.name}, max elevation ${(c.maxEl * C.RAD).toFixed(0)}°`, c.t0);
      if (c.t1 > a && c.t1 <= b) S.log('gs', `LOS ${c.gs.name}`, c.t1);
    }
    for (const e of pl.eclipses) {
      if (e.t0 > a && e.t0 <= b) S.log('ecl', 'LYRA-3A eclipse entry', e.t0);
      if (e.t1 > a && e.t1 <= b) S.log('ecl', 'LYRA-3A eclipse exit', e.t1);
    }
    for (const c of pl.collections) {
      if (c.c0 > a && c.c0 <= b) { S.log('coll', `${c.id} start: ${c.em.id} ${c.em.name}, ${S.fmtMHz(c.em.f)}, ${st.geoCfg.nSnap} snapshots`, c.c0); c.status = c.status === 'done' ? 'done' : 'active'; }
      if (c.c1 > a && c.c1 <= b && c.status !== 'done') { S.log('coll', `${c.id} end: snapshots time-tagged and queued for downlink`, c.c1); processCollection(c, false); }
    }
  };
  S.setTime = t => {
    const prev = st.t; st.t = t;
    if (t > prev) scanEvents(prev, t);
    if (t > st.horizon[1] - 4 * H || t < st.horizon[0]) S.rebuild(t - 14 * H);
    S.emit('time');
  };
  S.nextCollection = () => S.Plan.next(st.plan.collections, st.t + 61e3, 'c0');

  /* ---------- tabs ---------- */
  const showTab = name => {
    st.tab = name;
    document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    const v = S.views[name]; if (v && v.onShow) v.onShow();
    try { localStorage.setItem('lyra3-tab', name); } catch (e) { /* storage unavailable */ }
    if (location.hash.slice(1) !== name) try { history.replaceState(null, '', '#' + name); } catch (e) { /* sandboxed */ }
  };
  S.showTab = showTab;
  S.select = (what, val) => { st.sel[what] = val; S.emit('select', what); };

  /* ---------- boot ---------- */
  const boot = () => {
    S.ui.refreshTokens();
    const t0 = Date.UTC(2026, 9, 21, 8, 40, 0);
    st.t = t0;
    S.rebuild(t0 - 14 * H);
    const first = st.plan.collections.find(c => c.c0 > t0 && c.em.id === 'E01') || S.Plan.next(st.plan.collections, t0, 'c0');
    st.t = first ? first.c0 - 75e3 : t0;
    for (const c of st.plan.collections) if (c.c1 <= st.t && c.status !== 'done') processCollection(c, true);
    st.sel.coll = first || null;
    S.log('info', `Plan uploaded: ${st.plan.collections.length} collections, ${st.plan.contacts.length} ground contacts over 36 h`, st.horizon[0] + 60e3);
    S.log('info', 'GNSS POD ephemeris and clock solution updated for all spacecraft (3D rms 1.8 m, sync 12 ns)', st.t - 20 * 60e3);

    Object.values(S.views).forEach(v => v.init && v.init());
    document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
    const play = document.getElementById('btn-play');
    const setPlay = p => {
      st.playing = p; document.getElementById('ico-pause').hidden = !p; document.getElementById('ico-play').hidden = p;
      play.title = p ? 'Pause simulation' : 'Resume simulation'; play.setAttribute('aria-label', play.title);
    };
    play.addEventListener('click', () => setPlay(!st.playing));
    document.getElementById('sel-speed').addEventListener('change', e => { st.speed = +e.target.value; });
    document.getElementById('btn-next').addEventListener('click', () => {
      const c = S.nextCollection(); if (!c) return;
      S.setTime(c.c0 - 60e3); S.select('coll', c); S.select('emitter', c.em.id);
    });
    document.addEventListener('keydown', e => { if (e.code === 'Space' && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); setPlay(!st.playing); } });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onTheme = () => { S.ui.refreshTokens(); S.emit('theme'); };
    if (mq.addEventListener) mq.addEventListener('change', onTheme);
    new MutationObserver(onTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    let tab = 'ops';
    try { tab = localStorage.getItem('lyra3-tab') || tab; } catch (e) { /* storage unavailable */ }
    const h = location.hash.slice(1); if (S.views[h]) tab = h;
    showTab(S.views[tab] ? tab : 'ops');

    S.world.load().then(() => S.emit('theme'));
    let last = performance.now(), lastDom = 0;
    const frame = now => {
      const dt = Math.min(now - last, 250); last = now;
      if (st.playing) S.setTime(st.t + dt * st.speed);
      document.getElementById('clk').textContent = S.fmtUtc(st.t);
      const v = S.views[st.tab];
      try {
        if (v && v.render) v.render(dt);
        if (now - lastDom > 250) { lastDom = now; if (v && v.refresh) v.refresh(); }
      } catch (err) { console.error(err); }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.SIM);
