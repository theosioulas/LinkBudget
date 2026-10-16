import { describe, it, expect, beforeAll } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import { loadGridsFromDisk } from '../../test/loadGrids';
import { CONSTELLATIONS, PAYLOADS, TERMINALS, DEFAULT_ANALYSIS } from '../../data/presets';
import { buildSatellites, makeEvalContext, evalSatLink } from '../sim/runtime';
import { satEcef } from '../orbit/propagator';
import { beamContours } from '../rf/beams';
import { parseKml, footprintsToKml } from './kml';
import type { Payload } from '../model';

const P = DOMParser as unknown as { new (): globalThis.DOMParser };
const T0 = Date.UTC(2026, 9, 16, 12, 0, 0);

describe('KML EIRP + G/T contours drive the link budget', () => {
  beforeAll(() => loadGridsFromDisk());
  it('uses absolute EIRP forward and absolute G/T on return', () => {
    const geo = buildSatellites(CONSTELLATIONS, T0).find((s) => s.constellationId === 'geo-hts')!;
    const base = PAYLOADS.find((p) => p.id === 'pl-geo-ka-eu')!;
    const hex: Payload = { ...base, layout: { kind: 'hex-grid', aimLat: 38, aimLon: 23.7, spacingDeg: 0.38, rings: 1, reuseColors: 4 } };
    const fps = beamContours(hex, { ecef: satEcef(geo, T0), velEcef: [0, 0, 1] }, [-1, -2, -3, -4, -5, -6]);
    const eirp = parseKml(footprintsToKml('eirp', fps, 'dBW'), P);
    const gt = parseKml(footprintsToKml('gt', fps.map((f) => ({ ...f, level: +(f.level! - 60 + 17).toFixed(2) })), 'dB/K'), P);
    expect(eirp.beams.length).toBe(7);
    const pl: Payload = { ...base, layout: { kind: 'kml', beams: eirp.beams, meaning: 'absolute-eirp', edgeRelDb: -3, sourceName: 'x', gtBeams: gt.beams } };
    const ctx = makeEvalContext(TERMINALS[0], DEFAULT_ANALYSIS, CONSTELLATIONS, PAYLOADS.map((p) => (p.id === base.id ? pl : p)));
    const L = evalSatLink(geo, T0, ctx)!;
    expect(L.forward.feasible).toBe(true);
    // Athens sits near the centre beam: EIRP within the −1…0 dB contour ring, G/T = EIRP − 43 dB
    expect(L.beam.absEirpDbw!).toBeGreaterThan(58.8);
    expect(L.beam.absEirpDbw!).toBeLessThanOrEqual(60.6);
    expect(L.ret.gtDbK).toBeCloseTo(L.beam.absEirpDbw! - 43, 1);
    expect(L.forward.eirpDbw).toBeCloseTo(L.beam.absEirpDbw! - base.forward.oboDb, 5);
  });
});
