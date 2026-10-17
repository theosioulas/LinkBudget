import { useStore, activeTerminal } from '../store/store';
import { makeEvalContext, evalSatLink, quickVisible, type EvalContext } from '../core/sim/runtime';
import { rankCandidates } from '../core/sim/handover';
import { resolveBeams, isDedicated, trafficMode } from '../core/sim/beamplan';
import type { SatelliteDef } from '../core/orbit/propagator';

let ctxCache: { key: unknown[]; ctx: EvalContext } | null = null;
function ctxFor(): EvalContext {
  const s = useStore.getState();
  const t = activeTerminal(s);
  const key = [t, s.analysis, s.constellations, s.payloads, s.gridsReady];
  if (!ctxCache || ctxCache.key.some((k, i) => k !== key[i])) ctxCache = { key, ctx: makeEvalContext(t, s.analysis, s.constellations, s.payloads) };
  return ctxCache.ctx;
}

let lastVisible = 0;
let lastVisibleWall = 0;
let lastRankWall = 0;
let lastRank: { a?: string; b?: string } = {};

export function liveTick() {
  const s = useStore.getState();
  if (!s.sats.length) return;
  const t = s.clock.t;
  const ctx = ctxFor();
  const byId = new Map<string, SatelliteDef>();
  for (const x of s.sats) byId.set(x.id, x);
  const cfgAll = resolveBeams(s.mbb, ctx.orbitClassOf, [...new Set(s.sats.map((x) => x.constellationId))]);
  const sharedIds = !isDedicated(s.mbb) && cfgAll.A.systems.length ? cfgAll.A.systems : s.mbb.allowedConstellations;
  const pool = sharedIds.length ? s.sats.filter((x) => sharedIds.includes(x.constellationId)) : s.sats;
  let A = null as typeof s.live.A, B = null as typeof s.live.B;
  let mode: 'timeline' | 'instant' = 'instant';
  const sim = s.sim;
  // The recorded timeline is only used while it matches the current scenario; after any edit the
  // live view falls back to the instant choice so the links always reflect what is configured.
  if (sim && !s.simStale && t >= sim.startMs && t <= sim.endMs) {
    mode = 'timeline';
    const bonded = isDedicated(s.mbb) && trafficMode(s.mbb) === 'bonded';
    const st = sim.steps[Math.min(sim.steps.length - 1, Math.max(0, Math.round((t - sim.startMs) / sim.stepMs)))];
    const mk = (b: typeof st.A, name: 'A' | 'B') => {
      if (!b.satId || b.phase === 'idle') return null;
      const sat = byId.get(b.satId);
      // bonded traffic: every locked beam carries data
      const active = st.active === name || (!!st.active && bonded && b.phase === 'tracking');
      return sat ? { satId: b.satId, phase: b.phase as 'acquiring' | 'tracking', active, link: evalSatLink(sat, t, ctx) } : null;
    };
    A = mk(st.A, 'A');
    B = mk(st.B, 'B');
  } else if (ctx.terminal.beams === 2 && isDedicated(s.mbb)) {
    // Instant view, dedicated beams: each beam sticks to its satellite while usable, else takes the best
    // of its own systems (or its pinned satellite), with its own selection rule and elevation limits.
    const cfg = resolveBeams(s.mbb, ctx.orbitClassOf, [...new Set(s.sats.map((x) => x.constellationId))]);
    const now = performance.now();
    const rerank = now - lastRankWall > 1000;
    if (rerank) lastRankWall = now;
    const pick = (b: 'A' | 'B', taken?: string) => {
      const c = cfg[b];
      if (!c.on) return null;
      const pool = c.satId ? s.sats.filter((x) => x.id === c.satId) : c.systems.length ? s.sats.filter((x) => c.systems.includes(x.constellationId)) : s.sats;
      const allowed = (id: string) => pool.some((x) => x.id === id);
      const prev = s.live[b] && byId.get(s.live[b]!.satId);
      if (prev && prev.id !== taken && allowed(prev.id)) {
        const L = evalSatLink(prev, t, ctx);
        if (L && L.forward.feasible && L.geometry.look.el >= c.handoverElevationDeg) return { satId: prev.id, phase: 'tracking' as const, active: false, link: L };
      }
      const key = b === 'A' ? 'a' : 'b';
      if (rerank || !lastRank[key] || lastRank[key] === taken || !allowed(lastRank[key]!)) {
        lastRank[key] = rankCandidates(pool, t, ctx, { ...s.mbb, policy: c.policy, minElevationDeg: c.minElevationDeg, handoverElevationDeg: c.handoverElevationDeg }, new Set(taken ? [taken] : []))[0]?.sat.id;
      }
      const sat = lastRank[key] ? byId.get(lastRank[key]!) : undefined;
      const L = sat && evalSatLink(sat, t, ctx);
      return sat && L?.forward.feasible ? { satId: sat.id, phase: 'tracking' as const, active: false, link: L } : null;
    };
    A = pick('A');
    B = pick('B', A?.satId);
    const thr = (x: typeof A) => x?.link?.forward.throughputClearMbps ?? -1;
    const traffic = trafficMode(s.mbb);
    const act = traffic === 'A' ? A ?? B : traffic === 'B' ? B ?? A : thr(A) >= thr(B) ? A : B;
    if (act) act.active = true;
    if (traffic === 'bonded') { if (A) A.active = true; if (B) B.active = true; }
  } else {
    // Instant view: beam A sticks to its satellite while usable, beam B pre-points at the best alternative.
    const prevA = s.live.A && byId.get(s.live.A.satId);
    let aSat: SatelliteDef | undefined;
    if (prevA) {
      const L = evalSatLink(prevA, t, ctx);
      if (L && L.forward.feasible && L.geometry.look.el >= s.mbb.handoverElevationDeg) { aSat = prevA; A = { satId: prevA.id, phase: 'tracking', active: true, link: L }; }
    }
    // Candidate ranking (look-ahead heavy) runs at most once per second of wall time.
    const now = performance.now();
    if (now - lastRankWall > 1000 || (!A && !lastRank.a) || (aSat && lastRank.b === aSat.id)) {
      lastRankWall = now;
      const cands = rankCandidates(pool, t, ctx, s.mbb, new Set(aSat ? [aSat.id] : []));
      lastRank = aSat ? { a: aSat.id, b: cands[0]?.sat.id } : { a: cands[0]?.sat.id, b: cands[1]?.sat.id };
    }
    const aId = A ? A.satId : lastRank.a;
    if (!A && aId && byId.get(aId)) {
      const L = evalSatLink(byId.get(aId)!, t, ctx);
      if (L?.forward.feasible) A = { satId: aId, phase: 'tracking', active: true, link: L };
    }
    const bId = lastRank.b;
    if (ctx.terminal.beams === 2 && cfgAll.B.on && bId && bId !== A?.satId && byId.get(bId)) B = { satId: bId, phase: 'acquiring', active: false, link: evalSatLink(byId.get(bId)!, t, ctx) };
  }
  const sel = s.selectedSatId ? byId.get(s.selectedSatId) : undefined;
  const selected = sel ? evalSatLink(sel, t, ctx) : null;
  const wall = performance.now();
  if (wall - lastVisibleWall > 1000) {
    lastVisibleWall = wall;
    lastVisible = 0;
    for (const x of pool) if (quickVisible(x, t, ctx, s.mbb.minElevationDeg)) lastVisible++;
  }
  useStore.setState({ live: { t, A, B, selected, visible: lastVisible, mode } });
}
