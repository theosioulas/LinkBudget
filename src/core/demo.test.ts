import { it, expect, beforeAll } from 'vitest';
import { loadGridsFromDisk } from '../test/loadGrids';
import { CONSTELLATIONS, PAYLOADS, TERMINALS, DEFAULT_ANALYSIS, DEFAULT_MBB } from '../data/presets';
import { buildSatellites, makeEvalContext } from './sim/runtime';
import { runHandoverSim } from './sim/handover';
import { DEMOS } from '../app/demo-defs';

beforeAll(() => loadGridsFromDisk());

it('urban-canyon demo switches orbits without interruption', () => {
  const d = DEMOS.find((x) => x.id === 'canyon')!;
  const T0 = Date.UTC(2026, 9, 16, 11, 0, 0);
  const cons = CONSTELLATIONS.map((c) => ({ ...c, enabled: c.enabled || d.enable.includes(c.id) }));
  const sats = buildSatellites(cons, T0);
  const ctx = makeEvalContext({ ...TERMINALS[0], obstructions: d.obstructions, beams: 2 }, DEFAULT_ANALYSIS, cons, PAYLOADS);
  const r = runHandoverSim(sats, ctx, { ...DEFAULT_MBB, ...d.mbb }, T0);
  // eslint-disable-next-line no-console
  console.log(r.summary);
  expect(Object.keys(r.summary.orbitShare).length).toBeGreaterThanOrEqual(2);
  expect(r.summary.mbbHandovers).toBeGreaterThan(10);
  expect(r.summary.availabilityPct).toBeGreaterThan(99.9);
}, 120_000);

it('every template closes the link and keeps each beam on its own systems', () => {
  const T0 = Date.UTC(2026, 9, 16, 11, 0, 0);
  for (const d of DEMOS) {
    const cons = CONSTELLATIONS.map((c) => ({ ...c, enabled: d.enable.includes(c.id) }));
    const sats = buildSatellites(cons, T0);
    const ctx = makeEvalContext({ ...TERMINALS[0], obstructions: d.obstructions, beams: d.beams ?? 2 }, DEFAULT_ANALYSIS, cons, PAYLOADS);
    const mbb = { ...DEFAULT_MBB, ...d.mbb, durationMin: 10, stepSec: Math.max(2, d.mbb.stepSec ?? 2) };
    const r = runHandoverSim(sats, ctx, mbb, T0);
    const sys = (id: string | null) => sats.find((x) => x.id === id)?.constellationId;
    for (const b of ['A', 'B'] as const) {
      const allowed = d.mbb.beamCfg?.[b]?.systems ?? [];
      if (d.mbb.orbitPolicy === 'dedicated' && allowed.length) {
        for (const st of r.steps) if (st[b].satId) expect(allowed).toContain(sys(st[b].satId));
      }
    }
    // eslint-disable-next-line no-console
    console.log(d.id, r.summary.availabilityPct.toFixed(2), r.summary.meanThrFwd.toFixed(0));
    expect(r.summary.availabilityPct, d.id).toBeGreaterThan(99);
  }
}, 240_000);
