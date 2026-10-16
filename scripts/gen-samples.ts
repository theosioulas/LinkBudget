/** Generates sample KML beam files in public/samples (run: npx vite-node scripts/gen-samples.ts). */
import { writeFileSync } from 'node:fs';
import { PAYLOADS } from '../src/data/presets';
import { makeGeoSat, satEcef } from '../src/core/orbit/propagator';
import { beamContours } from '../src/core/rf/beams';
import { footprintsToKml } from '../src/core/kml/kml';

const t = Date.UTC(2026, 0, 1);
const pl = { ...PAYLOADS.find((p) => p.id === 'pl-geo-ka-eu')! };
pl.layout = { kind: 'hex-grid', aimLat: 47, aimLon: 10, spacingDeg: 0.38, rings: 3, reuseColors: 4 };
const sat = makeGeoSat('s', 'Ka-HTS 9E', 'c', { lon: 9, inc: 0, phaseDeg: 0, epochMs: t });
const pose = { ecef: satEcef(sat, t), velEcef: [0, 0, 1] as [number, number, number] };
const fps = beamContours(pl, pose, [-1, -2, -3, -4, -5, -6]);
writeFileSync('public/samples/ka-hts-europe-eirp.kml', footprintsToKml('Sample Ka-HTS EIRP contours (9°E, 37 beams)', fps, 'dBW'));
console.log('wrote', fps.length, 'contours');
