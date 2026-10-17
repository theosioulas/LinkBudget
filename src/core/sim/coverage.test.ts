import { describe, it, expect, beforeAll } from 'vitest';
import { loadGridsFromDisk } from '../../test/loadGrids';
import { CONSTELLATIONS, PAYLOADS, TERMINALS, DEFAULT_ANALYSIS } from '../../data/presets';
import { buildSatellites } from './runtime';
import { computeCoverage } from './coverage';

const T0 = Date.UTC(2026, 9, 16, 12, 0, 0);

describe('coverage map', () => {
  beforeAll(() => loadGridsFromDisk());
  it('GEO Ka-HTS throughput map peaks inside beams and drops in rainy climates', () => {
    const geo = buildSatellites(CONSTELLATIONS.map((c) => ({ ...c, enabled: true })), T0).find((s) => s.constellationId === 'geo-hts')!;
    const pl = PAYLOADS.find((p) => p.id === 'pl-geo-ka-eu')!;
    const t0 = performance.now();
    const r = computeCoverage(geo, T0, pl, 'GEO', TERMINALS[2], DEFAULT_ANALYSIS, 'esn0Fwd', 0.5);
    const ms = performance.now() - t0;
    expect(r.cells.length).toBeGreaterThan(300);
    expect(ms).toBeLessThan(8000);
    expect(r.max).toBeGreaterThan(8);
    expect(r.max - r.min).toBeGreaterThan(3);
    const av = computeCoverage(geo, T0, pl, 'GEO', TERMINALS[2], DEFAULT_ANALYSIS, 'availFwd', 1.5);
    expect(av.min).toBeGreaterThan(90);
    expect(av.max).toBeLessThanOrEqual(100);
  }, 30_000);
});
