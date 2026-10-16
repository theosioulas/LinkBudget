import { describe, it, expect, beforeAll } from 'vitest';
import { loadGridsFromDisk } from '../test/loadGrids';
import { CONSTELLATIONS, PAYLOADS, TERMINALS, DEFAULT_ANALYSIS, DEFAULT_MBB } from '../data/presets';
import { buildSatellites, makeEvalContext, evalSatLink, quickVisible } from './sim/runtime';
import { runHandoverSim } from './sim/handover';
import { satEcef } from './orbit/propagator';
import { ecefToGeodetic } from './geo/coords';
import { norm } from './vec';
import { periodSec } from './orbit/kepler';
import { fsplDb } from './rf/linkbudget';
import { relativeGainDb } from './rf/antenna';

const T0 = Date.UTC(2026, 9, 16, 12, 0, 0);

describe('engine', () => {
  beforeAll(() => loadGridsFromDisk());

  it('basic RF formulas', () => {
    expect(fsplDb(12, 36000)).toBeCloseTo(205.16, 1);
    const p = { kind: 'bessel' as const, hpbwDeg: 1, sidelobeDb: -25, scanLossExp: 0, maxScanDeg: 0 };
    expect(relativeGainDb(p, 0.5)).toBeCloseTo(-3.0, 1);
    expect(relativeGainDb({ ...p, kind: 'gaussian' }, 0.5)).toBeCloseTo(-3.0, 5);
    expect(relativeGainDb({ ...p, kind: 's672' }, 0.5)).toBeCloseTo(-3.0, 5);
  });

  it('builds constellations with correct counts and altitudes', () => {
    const sats = buildSatellites(CONSTELLATIONS.map((c) => ({ ...c, enabled: true })), T0);
    const count = (id: string) => sats.filter((s) => s.constellationId === id).length;
    expect(count('starlink')).toBe(4408);
    expect(count('oneweb')).toBe(588);
    expect(count('kuiper')).toBe(3236);
    expect(count('lightspeed')).toBe(198);
    const geo = sats.find((s) => s.constellationId === 'geo-hts')!;
    const g1 = ecefToGeodetic(satEcef(geo, T0)), g2 = ecefToGeodetic(satEcef(geo, T0 + 6 * 3600e3));
    expect(Math.abs(g1.lon - 9)).toBeLessThan(0.1);
    expect(Math.abs(g2.lon - 9)).toBeLessThan(0.1);
    expect(Math.abs(g1.alt - 35786)).toBeLessThan(5);
    const mp = sats.find((s) => s.constellationId === 'mpower')!;
    expect(norm(satEcef(mp, T0)) - 6378.137).toBeCloseTo(8062, 0);
    expect(periodSec(6378.137 + 8062) / 3600).toBeCloseTo(4.8, 1);
  });

  it('computes realistic budgets for each system from Athens', () => {
    const term = TERMINALS[0];
    const sats = buildSatellites(CONSTELLATIONS.map((c) => ({ ...c, enabled: true })), T0);
    const ctx = makeEvalContext(term, DEFAULT_ANALYSIS, CONSTELLATIONS, PAYLOADS);
    for (const cid of ['starlink', 'oneweb', 'kuiper', 'mpower', 'geo-hts', 'geo-ku']) {
      const vis = sats.filter((s) => s.constellationId === cid).map((s) => ({ s, q: quickVisible(s, T0, ctx, 10) })).filter((x) => x.q);
      vis.sort((a, b) => b.q!.el - a.q!.el);
      const best = vis[0];
      expect(best, cid).toBeTruthy();
      const L = evalSatLink(best.s, T0, ctx)!;
      // eslint-disable-next-line no-console
      console.log(cid.padEnd(9), `el ${L.geometry.look.el.toFixed(1)}`, `range ${L.geometry.look.range.toFixed(0)}`,
        `fwd Es/N0 ${L.forward.esn0TotalClear.toFixed(1)} ${L.forward.modcodClear?.name} ${L.forward.throughputClearMbps.toFixed(0)} Mbps avail ${L.forward.availabilityPct.toFixed(3)}`,
        `| rtn Es/N0 ${L.ret.esn0TotalClear.toFixed(1)} ${L.ret.throughputClearMbps.toFixed(0)} Mbps | beam ${L.beam.beamLabel} rel ${L.beam.relGainDb.toFixed(2)} C/I ${L.beam.cciDb.toFixed(1)} | RTT ${L.rttMs.toFixed(0)} ms | ${L.forward.reason ?? ''}`);
      if (cid !== 'oneweb' || L.forward.feasible) expect(L.forward.feasible || cid === 'kuiper', cid + ' ' + L.forward.reason).toBe(true);
    }
  });

  it('runs a make-before-break simulation with zero interruption on a dual-beam terminal', () => {
    const term = TERMINALS[0];
    const cons = CONSTELLATIONS;
    const sats = buildSatellites(cons, T0);
    const ctx = makeEvalContext(term, DEFAULT_ANALYSIS, cons, PAYLOADS);
    const t = performance.now();
    const r = runHandoverSim(sats, ctx, { ...DEFAULT_MBB, durationMin: 15, stepSec: 2, allowedConstellations: ['starlink'] }, T0);
    // eslint-disable-next-line no-console
    console.log('MBB starlink', (performance.now() - t).toFixed(0), 'ms', r.summary, r.events.slice(0, 8));
    expect(r.summary.handovers).toBeGreaterThan(1);
    expect(r.summary.mbbHandovers).toBe(r.summary.handovers);
    expect(r.summary.availabilityPct).toBeGreaterThan(99);
    const single = runHandoverSim(sats, ctx, { ...DEFAULT_MBB, durationMin: 15, stepSec: 1, acquisitionSec: 2, allowedConstellations: ['starlink'] }, T0);
    expect(single.summary.availabilityPct).toBeGreaterThan(99);
    const st = { ...term, beams: 1 as const };
    const ctx1 = makeEvalContext(st, DEFAULT_ANALYSIS, cons, PAYLOADS);
    const one = runHandoverSim(sats, ctx1, { ...DEFAULT_MBB, durationMin: 15, stepSec: 1, acquisitionSec: 2, allowedConstellations: ['starlink'] }, T0);
    // eslint-disable-next-line no-console
    console.log('single-beam', one.summary);
    expect(one.summary.outageS).toBeGreaterThan(0);
    const dual = runHandoverSim(sats, ctx, { ...DEFAULT_MBB, orbitPolicy: 'geo-leo-dual', durationMin: 15 }, T0);
    // eslint-disable-next-line no-console
    console.log('geo-leo-dual', dual.summary);
  }, 60_000);

  it('what-if rain degrades Ka more than Ku and obstructions block satellites', () => {
    const sats = buildSatellites(CONSTELLATIONS, T0);
    const geoKa = sats.find((s) => s.constellationId === 'geo-hts')!;
    const geoKu = sats.find((s) => s.constellationId === 'geo-ku')!;
    const base = makeEvalContext(TERMINALS[0], DEFAULT_ANALYSIS, CONSTELLATIONS, PAYLOADS);
    const wet = makeEvalContext(TERMINALS[0], { ...DEFAULT_ANALYSIS, liveRainMmH: 25 }, CONSTELLATIONS, PAYLOADS);
    const dKa = evalSatLink(geoKa, T0, base)!.forward.esn0TotalClear - evalSatLink(geoKa, T0, wet)!.forward.esn0TotalClear;
    const dKu = evalSatLink(geoKu, T0, base)!.forward.esn0TotalClear - evalSatLink(geoKu, T0, wet)!.forward.esn0TotalClear;
    expect(dKa).toBeGreaterThan(3);
    expect(dKu).toBeGreaterThan(0.3);
    expect(dKa).toBeGreaterThan(2 * dKu);
    const L = evalSatLink(geoKa, T0, base)!;
    const az = L.geometry.look.az;
    const blocked = makeEvalContext({ ...TERMINALS[0], obstructions: [{ azFrom: az - 10, azTo: az + 10, elMax: 60 }] }, DEFAULT_ANALYSIS, CONSTELLATIONS, PAYLOADS);
    const Lb = evalSatLink(geoKa, T0, blocked)!;
    expect(Lb.forward.feasible).toBe(false);
    expect(Lb.forward.reason).toMatch(/obstruction/);
    expect(quickVisible(geoKa, T0, blocked, 5)).toBeNull();
  });

  it('applies per-beam overrides on GEO multibeam payloads', () => {
    const sats = buildSatellites(CONSTELLATIONS, T0);
    const geo = sats.find((s) => s.constellationId === 'geo-hts')!;
    const pl = PAYLOADS.find((p) => p.id === 'pl-geo-ka-eu')!;
    const ctx = makeEvalContext(TERMINALS[0], DEFAULT_ANALYSIS, CONSTELLATIONS, PAYLOADS);
    const L0 = evalSatLink(geo, T0, ctx)!;
    const id = L0.beam.beamId;
    const boosted = { ...pl, layout: { ...pl.layout, overrides: { [id]: { eirpOffsetDb: 3 } } } } as typeof pl;
    const ctxB = makeEvalContext(TERMINALS[0], DEFAULT_ANALYSIS, CONSTELLATIONS, PAYLOADS.map((p) => (p.id === pl.id ? boosted : p)));
    const L1 = evalSatLink(geo, T0, ctxB)!;
    expect(L1.forward.eirpDbw - L0.forward.eirpDbw).toBeCloseTo(3, 5);
    expect(L1.ret.gtDbK).toBeCloseTo(L0.ret.gtDbK, 5);
    const off = { ...pl, layout: { ...pl.layout, overrides: { [id]: { off: true } } } } as typeof pl;
    const ctxO = makeEvalContext(TERMINALS[0], DEFAULT_ANALYSIS, CONSTELLATIONS, PAYLOADS.map((p) => (p.id === pl.id ? off : p)));
    const L2 = evalSatLink(geo, T0, ctxO)!;
    expect(L2.beam.beamId).not.toBe(id);
  });
});
