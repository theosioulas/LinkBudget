import { useStore, activeTerminal } from '../store/store';
import { makeEvalContext, evalSatLink, quickVisible, type EvalContext } from '../core/sim/runtime';
import { rankCandidates } from '../core/sim/handover';
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
  const pool = s.mbb.allowedConstellations.length ? s.sats.filter((x) => s.mbb.allowedConstellations.includes(x.constellationId)) : s.sats;
  let A = null as typeof s.live.A, B = null as typeof s.live.B;
  let mode: 'timeline' | 'instant' = 'instant';
  const sim = s.sim;
  if (sim && t >= sim.startMs && t <= sim.endMs) {
    mode = 'timeline';
    const st = sim.steps[Math.min(sim.steps.length - 1, Math.max(0, Math.round((t - sim.startMs) / sim.stepMs)))];
    const mk = (b: typeof st.A, name: 'A' | 'B') => {
      if (!b.satId || b.phase === 'idle') return null;
      const sat = byId.get(b.satId);
      return sat ? { satId: b.satId, phase: b.phase as 'acquiring' | 'tracking', active: st.active === name, link: evalSatLink(sat, t, ctx) } : null;
    };
    A = mk(st.A, 'A');
    B = mk(st.B, 'B');
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
    if (ctx.terminal.beams === 2 && bId && bId !== A?.satId && byId.get(bId)) B = { satId: bId, phase: 'acquiring', active: false, link: evalSatLink(byId.get(bId)!, t, ctx) };
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
