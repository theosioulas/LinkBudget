/* TALOS-3 simulator — mission planning.
   Eclipses, ground-station contacts, target access windows, predicted geolocation accuracy per pass,
   and a greedy priority scheduler for the dual-channel payload. */
'use strict';
(function (S) {
  const { C, V } = S;
  const P = S.Plan = {};
  P.COLLECT_MASK_DEG = 10;       // lead-satellite elevation seen from the target
  P.GS_MASK_DEG = 5;
  P.CHANNELS = 2;                // independent tuners / DDC chains in the receiver

  P.collectionSpan = (em, gc) => ((gc.nSnap - 1) * gc.dtSnap + em.tInt * gc.tIntScale) * 1000;

  P.compute = (sats, emitters, t0, t1, gc) => {
    const lead = sats[0].orbit, step = 20e3;
    const eclipses = S.windows(t0, t1, step, t => S.inEclipse(lead.posEci(t), S.sunEci(t))).map(w => ({ t0: w[0], t1: w[1] }));
    const elOf = (siteR, lat, lon, t) => S.look(siteR, lat, lon, lead.posEcef(t)).el;
    const maxElIn = (fn, a, b) => { let best = -9, tb = a; for (let t = a; t <= b; t += 10e3) { const e = fn(t); if (e > best) { best = e; tb = t; } } return { el: best, t: tb }; };

    const contacts = [];
    for (const g of S.GROUND_STATIONS) {
      const fn = t => elOf(g.ecef, g.lat, g.lon, t);
      for (const w of S.windows(t0, t1, step, t => fn(t) > P.GS_MASK_DEG * C.DEG)) {
        const m = maxElIn(fn, w[0], w[1]);
        contacts.push({ gs: g, t0: w[0], t1: w[1], tca: m.t, maxEl: m.el });
      }
    }
    contacts.sort((a, b) => a.t0 - b.t0);

    const accesses = [];
    for (const em of emitters) {
      const st = S.emitterState(em, t0), fn = t => elOf(st.r, st.lat, st.lon, t);
      for (const w of S.windows(t0, t1, step, t => fn(t) > P.COLLECT_MASK_DEG * C.DEG)) {
        const m = maxElIn(fn, w[0], w[1]);
        accesses.push({ em, t0: w[0], t1: w[1], tca: m.t, maxEl: m.el });
      }
    }
    // predicted accuracy for a collection centred on the time of closest approach
    accesses.forEach((a, k) => {
      const span = P.collectionSpan(a.em, gc), c0 = S.clamp(a.tca - span / 2, a.t0, Math.max(a.t0, a.t1 - span));
      a.c0 = c0; a.c1 = Math.min(c0 + span, a.t1); a.cMid = (a.c0 + a.c1) / 2;
      const col = S.Geo.collect(a.em, sats, a.cMid, gc), pr = S.Geo.predict(col);
      a.nMeas = col.defs.length; a.predCep = pr ? pr.ell.cep : null; a.pred = pr;
      a.feasible = !!pr && a.c1 - a.c0 > span * 0.6;
      a.id = `C${String(k + 1).padStart(3, '0')}`;
    });
    accesses.sort((a, b) => a.t0 - b.t0);

    // greedy scheduler: priority first, then best predicted accuracy; at most CHANNELS concurrent
    const order = accesses.filter(a => a.feasible).sort((a, b) => a.em.prio - b.em.prio || a.predCep - b.predCep);
    const chosen = [];
    for (const a of order) {
      const overlap = chosen.filter(c => c.c0 < a.c1 && a.c0 < c.c1).length;
      if (overlap < P.CHANNELS) { a.status = 'planned'; chosen.push(a); } else a.status = 'conflict';
    }
    accesses.forEach(a => { if (!a.status) a.status = a.feasible ? 'conflict' : 'infeasible'; });
    const collections = chosen.sort((a, b) => a.c0 - b.c0);
    collections.forEach((c, k) => { c.seq = k + 1; });
    return { t0, t1, eclipses, contacts, accesses, collections };
  };

  P.inWindows = (list, t) => list.find(w => t >= w.t0 && t < w.t1) || null;
  P.next = (list, t, key = 't0') => list.find(w => w[key] > t) || null;
})(window.SIM);
