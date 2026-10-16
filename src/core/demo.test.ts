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
