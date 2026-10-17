/**
 * Dual-beam phased-array terminal handover simulator.
 *
 * Models two independent electronically-steered beams (A and B). With two
 * beams the terminal performs make-before-break (MBB): the idle beam acquires
 * and locks the target satellite while the serving beam keeps carrying
 * traffic; traffic switches on lock and the old beam is released after the
 * configured overlap. Single-beam terminals fall back to break-before-make.
 */
import type { MbbSettings, OrbitClass } from '../model';
import type { SatelliteDef } from '../orbit/propagator';
import { evalSatLink, quickVisible, type EvalContext } from './runtime';
import type { LinkResult } from '../rf/linkbudget';

export type BeamName = 'A' | 'B';
export type BeamPhase = 'idle' | 'acquiring' | 'tracking';

export interface BeamSample {
  satId: string | null;
  satName: string;
  constId: string;
  orbitClass: OrbitClass | '';
  phase: BeamPhase;
  el: number;
  az: number;
  scan: number;
  rangeKm: number;
  esn0Fwd: number;
  esn0Rtn: number;
  thrFwd: number;
  thrRtn: number;
  modcodFwd: string;
  delayMs: number;
  dopplerKHz: number;
}

export interface SimStep {
  t: number;
  A: BeamSample;
  B: BeamSample;
  active: BeamName | null;
  activeThrFwd: number;
  activeThrRtn: number;
  aggregateThrFwd: number;
  latencyMs: number;
  visible: number;
}

export interface SimEvent {
  t: number;
  beam: BeamName;
  type: 'acquire' | 'lock' | 'switch' | 'release' | 'lost' | 'break' | 'outage-start' | 'outage-end';
  satName: string;
  detail?: string;
}

export interface SimSummary {
  durationS: number;
  availabilityPct: number;
  outageS: number;
  handovers: number;
  mbbHandovers: number;
  breakHandovers: number;
  meanThrFwd: number;
  minThrFwd: number;
  meanThrRtn: number;
  meanLatencyMs: number;
  orbitShare: Record<string, number>;
  satsUsed: number;
}

export interface SimResult {
  startMs: number;
  endMs: number;
  stepMs: number;
  steps: SimStep[];
  events: SimEvent[];
  summary: SimSummary;
}

const ORBIT_PRIORITY: Record<string, number> = { LEO: 3, MEO: 2, HEO: 1, GEO: 0 };

interface BeamState { sat: SatelliteDef | null; phase: BeamPhase; since: number; link: LinkResult | null }

const emptySample = (): BeamSample => ({
  satId: null, satName: '', constId: '', orbitClass: '', phase: 'idle', el: NaN, az: NaN, scan: NaN, rangeKm: NaN,
  esn0Fwd: NaN, esn0Rtn: NaN, thrFwd: 0, thrRtn: 0, modcodFwd: '', delayMs: NaN, dopplerKHz: NaN,
});

function sample(b: BeamState, ctx: EvalContext): BeamSample {
  if (!b.sat || !b.link) return { ...emptySample(), phase: b.phase, satId: b.sat?.id ?? null, satName: b.sat?.name ?? '' };
  const L = b.link;
  const live = b.phase === 'tracking';
  return {
    satId: b.sat.id, satName: b.sat.name, constId: b.sat.constellationId, orbitClass: ctx.orbitClassOf(b.sat.constellationId), phase: b.phase,
    el: L.geometry.look.el, az: L.geometry.look.az, scan: L.geometry.terminalScanDeg, rangeKm: L.geometry.look.range,
    esn0Fwd: L.forward.esn0TotalClear, esn0Rtn: L.ret.esn0TotalClear,
    thrFwd: live ? L.forward.throughputClearMbps : 0, thrRtn: live ? L.ret.throughputClearMbps : 0,
    modcodFwd: L.forward.modcodClear?.name ?? 'OUTAGE', delayMs: L.rttMs, dopplerKHz: L.dopplerFwdKHz,
  };
}

export interface Candidate { sat: SatelliteDef; link: LinkResult; score: number; orbit: OrbitClass }

/** Rank feasible candidates at time ms according to the policy. */
export function rankCandidates(
  sats: SatelliteDef[], ms: number, ctx: EvalContext, s: MbbSettings, exclude: Set<string>, filter?: (o: OrbitClass) => boolean,
): Candidate[] {
  const vis: { sat: SatelliteDef; el: number }[] = [];
  for (const sat of sats) {
    if (exclude.has(sat.id)) continue;
    if (filter && !filter(ctx.orbitClassOf(sat.constellationId))) continue;
    const q = quickVisible(sat, ms, ctx, s.minElevationDeg);
    if (q) vis.push({ sat, el: q.el });
  }
  vis.sort((a, b) => b.el - a.el);
  const out: Candidate[] = [];
  const shortLived: Candidate[] = [];
  // A handover target must stay usable for a minimum dwell, otherwise it only goes in the fallback list.
  const dwellMs = Math.max(30_000, 4 * (s.acquisitionSec + s.overlapSec) * 1000);
  for (const v of vis.slice(0, 24)) {
    const link = evalSatLink(v.sat, ms, ctx, true);
    if (!link || !link.forward.feasible || link.forward.throughputClearMbps <= 0) continue;
    const lasting = usableAt(v.sat, ms + dwellMs, ctx, s.handoverElevationDeg);
    const orbit = ctx.orbitClassOf(v.sat.constellationId);
    let score: number;
    switch (s.policy) {
      case 'best-sinr': score = link.forward.esn0TotalClear; break;
      case 'longest-visibility': score = remainingVisibility(v.sat, ms, ctx, s); break;
      default: score = link.geometry.look.el;
    }
    if (s.orbitPolicy === 'best-throughput') score = link.forward.throughputClearMbps;
    (lasting ? out : shortLived).push({ sat: v.sat, link, score, orbit });
  }
  const prio = (c: Candidate) => (s.orbitPolicy === 'leo-first' ? ORBIT_PRIORITY[c.orbit] ?? 0 : 0);
  const order = (a: Candidate, b: Candidate) => prio(b) - prio(a) || b.score - a.score;
  out.sort(order);
  shortLived.sort((a, b) => b.score - a.score);
  return [...out, ...shortLived];
}

/** Usable = above the handover elevation, inside a beam and closing the forward link. */
export function usableAt(sat: SatelliteDef, ms: number, ctx: EvalContext, minEl: number): boolean {
  if (!quickVisible(sat, ms, ctx, minEl)) return false;
  const L = evalSatLink(sat, ms, ctx, true);
  return !!L && L.forward.feasible && L.forward.throughputClearMbps > 0;
}

function remainingVisibility(sat: SatelliteDef, ms: number, ctx: EvalContext, s: MbbSettings): number {
  const oc = ctx.orbitClassOf(sat.constellationId);
  const step = oc === 'LEO' ? 10_000 : oc === 'MEO' ? 120_000 : 600_000;
  for (let k = 1; k <= 120; k++) {
    if (!usableAt(sat, ms + k * step, ctx, s.handoverElevationDeg)) return k * step;
  }
  return 120 * step;
}

export function runHandoverSim(sats: SatelliteDef[], ctx: EvalContext, s: MbbSettings, startMs: number, onProgress?: (f: number) => void): SimResult {
  const pool = s.allowedConstellations.length ? sats.filter((x) => s.allowedConstellations.includes(x.constellationId)) : sats;
  const dual = ctx.terminal.beams === 2;
  const stepMs = Math.max(0.2, s.stepSec) * 1000;
  const endMs = startMs + s.durationMin * 60_000;
  const leadMs = (s.acquisitionSec + s.overlapSec) * 1000 + stepMs;
  const beams: Record<BeamName, BeamState> = {
    A: { sat: null, phase: 'idle', since: startMs, link: null },
    B: { sat: null, phase: 'idle', since: startMs, link: null },
  };
  let primary: BeamName | null = null;
  let releaseAt: { beam: BeamName; t: number } | null = null;
  const steps: SimStep[] = [];
  const events: SimEvent[] = [];
  let inOutage = false;
  let visible = 0;
  const other = (b: BeamName): BeamName => (b === 'A' ? 'B' : 'A');
  const isLeo = (o: OrbitClass) => o === 'LEO';
  // Dedicated beams: each beam tracks its own set of systems and re-points (break-before-make)
  // within that set; traffic rides the better of the two. 'geo-leo-dual' = A on GEO/MEO, B on LEO.
  const dedicated = dual && (s.orbitPolicy === 'dedicated' || s.orbitPolicy === 'geo-leo-dual');
  const geoLeo = dedicated && s.orbitPolicy === 'geo-leo-dual';
  const inSet = (ids: string[] | undefined) => (x: SatelliteDef) => !ids?.length || ids.includes(x.constellationId);
  const poolA = geoLeo ? pool.filter((x) => !isLeo(ctx.orbitClassOf(x.constellationId))) : pool.filter(inSet(s.beamAssign?.A));
  const poolB = geoLeo ? pool.filter((x) => isLeo(ctx.orbitClassOf(x.constellationId))) : pool.filter(inSet(s.beamAssign?.B));
  const thr = (b: BeamName) => (beams[b].phase === 'tracking' ? beams[b].link?.forward.throughputClearMbps ?? 0 : -1);

  const startAcq = (b: BeamName, c: Candidate, t: number, type: SimEvent['type'] = 'acquire') => {
    beams[b] = { sat: c.sat, phase: s.acquisitionSec > 0 ? 'acquiring' : 'tracking', since: t, link: c.link };
    events.push({ t, beam: b, type, satName: c.sat.name, detail: `el ${c.link.geometry.look.el.toFixed(1)}°, ${c.orbit}` });
    if (s.acquisitionSec <= 0) events.push({ t, beam: b, type: 'lock', satName: c.sat.name });
  };
  const inUse = () => new Set([beams.A.sat?.id, beams.B.sat?.id].filter(Boolean) as string[]);

  const total = Math.ceil((endMs - startMs) / stepMs);
  let n = 0;
  for (let t = startMs; t <= endMs; t += stepMs, n++) {
    if (onProgress && n % 50 === 0) onProgress(n / total);
    // 1. update tracked links, detect losses & locks
    for (const b of ['A', 'B'] as BeamName[]) {
      const st = beams[b];
      if (!st.sat) continue;
      const link = evalSatLink(st.sat, t, ctx, true);
      const ok = link && link.forward.feasible && link.geometry.look.el >= s.minElevationDeg;
      if (!ok) {
        events.push({ t, beam: b, type: 'lost', satName: st.sat.name, detail: link?.forward.reason ?? 'below horizon' });
        beams[b] = { sat: null, phase: 'idle', since: t, link: null };
        if (primary === b) primary = null;
        if (releaseAt?.beam === b) releaseAt = null;
        continue;
      }
      st.link = link;
      if (st.phase === 'acquiring' && t - st.since >= s.acquisitionSec * 1000) {
        st.phase = 'tracking';
        events.push({ t, beam: b, type: 'lock', satName: st.sat.name });
        // make-before-break: switch traffic to the freshly locked beam
        if (primary && primary !== b && beams[primary].phase === 'tracking' && !dedicated) {
          events.push({ t, beam: b, type: 'switch', satName: st.sat.name, detail: `from ${beams[primary].sat?.name}` });
          releaseAt = { beam: primary, t: t + s.overlapSec * 1000 };
          primary = b;
        }
      }
    }
    // 2. release after overlap
    if (releaseAt && t >= releaseAt.t) {
      const rb = releaseAt.beam;
      if (beams[rb].sat) events.push({ t, beam: rb, type: 'release', satName: beams[rb].sat!.name });
      beams[rb] = { sat: null, phase: 'idle', since: t, link: null };
      releaseAt = null;
    }

    if (dedicated) {
      for (const b of ['A', 'B'] as BeamName[]) {
        const cur = beams[b].sat;
        // GEO/MEO beams in the GEO+LEO mode stay put; otherwise re-point ahead of the loss of the satellite.
        const trigger = cur && !(geoLeo && b === 'A') && !usableAt(cur, t + leadMs, ctx, s.handoverElevationDeg);
        if (cur && !trigger) continue;
        const c = rankCandidates(b === 'A' ? poolA : poolB, t, ctx, geoLeo && b === 'A' ? { ...s, policy: 'best-sinr' } : s, inUse())[0];
        if (c) { startAcq(b, c, t, cur ? 'break' : 'acquire'); if (n === 0) beams[b].phase = 'tracking'; }
      }
      primary = geoLeo
        ? beams.B.phase === 'tracking' ? 'B' : beams.A.phase === 'tracking' ? 'A' : null
        : thr('A') < 0 && thr('B') < 0 ? null : thr('A') >= thr('B') ? 'A' : 'B';
    } else {
      // 3. no primary → promote a tracking beam or acquire the best candidate
      if (!primary) {
        if (beams.A.phase === 'tracking') primary = 'A';
        else if (beams.B.phase === 'tracking') primary = 'B';
        else if (beams.A.phase !== 'acquiring' && beams.B.phase !== 'acquiring') {
          const c = rankCandidates(pool, t, ctx, s, inUse())[0];
          if (c) {
            const b: BeamName = beams.A.sat ? 'B' : 'A';
            startAcq(b, c, t);
            // terminal is assumed to be already in service at the start of the run
            if (n === 0) { beams[b].phase = 'tracking'; primary = b; }
          }
        }
      }
      // 4. handover trigger on the serving beam
      if (primary && beams[primary].phase === 'tracking' && !releaseAt) {
        const ps = beams[primary];
        const sec = other(primary);
        const servingOrbit = ctx.orbitClassOf(ps.sat!.constellationId);
        let trigger = !usableAt(ps.sat!, t + leadMs, ctx, s.handoverElevationDeg);
        let target: Candidate | undefined;
        if (!trigger && (s.policy === 'best-sinr' || s.orbitPolicy === 'leo-first' || s.orbitPolicy === 'best-throughput') && n % 5 === 0) {
          const best = rankCandidates(pool, t, ctx, s, inUse())[0];
          if (best) {
            const better =
              (s.orbitPolicy === 'leo-first' && (ORBIT_PRIORITY[best.orbit] ?? 0) > (ORBIT_PRIORITY[servingOrbit] ?? 0)) ||
              (s.orbitPolicy === 'best-throughput' && best.link.forward.throughputClearMbps > ps.link!.forward.throughputClearMbps * 1.15) ||
              (s.policy === 'best-sinr' && best.link.forward.esn0TotalClear > ps.link!.forward.esn0TotalClear + s.hysteresisDb);
            if (better) { trigger = true; target = best; }
          }
        }
        if (trigger) {
          target ??= rankCandidates(pool, t, ctx, s, inUse())[0];
          if (target) {
            if (dual && !beams[sec].sat) startAcq(sec, target, t);
            else if (!dual) { startAcq(primary, target, t, 'break'); primary = null; }
          }
        }
      }
    }

    // 5. sample
    if (n % 5 === 0 || pool.length < 600) {
      visible = 0;
      for (const sat of pool) if (quickVisible(sat, t, ctx, s.minElevationDeg)) visible++;
    }
    const A = sample(beams.A, ctx), B = sample(beams.B, ctx);
    const act = primary ? (primary === 'A' ? A : B) : null;
    const outage = !act || act.thrFwd <= 0;
    if (outage !== inOutage) {
      events.push({ t, beam: primary ?? 'A', type: outage ? 'outage-start' : 'outage-end', satName: act?.satName ?? '' });
      inOutage = outage;
    }
    steps.push({
      t, A, B, active: outage ? null : primary,
      activeThrFwd: act?.thrFwd ?? 0, activeThrRtn: act?.thrRtn ?? 0,
      aggregateThrFwd: A.thrFwd + B.thrFwd,
      latencyMs: act ? act.delayMs : NaN,
      visible,
    });
  }
  return { startMs, endMs, stepMs, steps, events, summary: summarize(steps, events, stepMs) };
}

function summarize(steps: SimStep[], events: SimEvent[], stepMs: number): SimSummary {
  const up = steps.filter((x) => x.active);
  const thr = up.map((x) => x.activeThrFwd);
  const orbitShare: Record<string, number> = {};
  for (const x of up) {
    const o = (x.active === 'A' ? x.A : x.B).orbitClass || '?';
    orbitShare[o] = (orbitShare[o] ?? 0) + 1;
  }
  for (const k of Object.keys(orbitShare)) orbitShare[k] = (100 * orbitShare[k]) / Math.max(1, up.length);
  const sats = new Set<string>();
  for (const x of steps) { if (x.A.satId) sats.add(x.A.satId); if (x.B.satId) sats.add(x.B.satId); }
  // A beam that re-points while the other beam keeps carrying traffic (dedicated beams) is seamless too.
  const stepAt = (t: number) => steps[Math.min(steps.length - 1, Math.max(0, Math.round((t - (steps[0]?.t ?? t)) / stepMs)))];
  const breaks = events.filter((e) => e.type === 'break');
  const covered = breaks.filter((e) => { const st = stepAt(e.t); return !!st?.active && st.active !== e.beam; }).length;
  const mbb = events.filter((e) => e.type === 'switch').length + covered;
  const brk = breaks.length - covered;
  return {
    durationS: (steps.length * stepMs) / 1000,
    availabilityPct: (100 * up.length) / Math.max(1, steps.length),
    outageS: ((steps.length - up.length) * stepMs) / 1000,
    handovers: mbb + brk,
    mbbHandovers: mbb,
    breakHandovers: brk,
    meanThrFwd: thr.length ? thr.reduce((a, b) => a + b, 0) / thr.length : 0,
    minThrFwd: thr.length ? Math.min(...thr) : 0,
    meanThrRtn: up.length ? up.reduce((a, b) => a + b.activeThrRtn, 0) / up.length : 0,
    meanLatencyMs: up.length ? up.reduce((a, b) => a + (Number.isFinite(b.latencyMs) ? b.latencyMs : 0), 0) / up.length : NaN,
    orbitShare,
    satsUsed: sats.size,
  };
}
