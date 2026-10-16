import { describe, it, expect } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import { parseKml, footprintsToKml, contourSetFromBeams } from './kml';
import { kmlLevelAt } from '../rf/beams';

const P = DOMParser as unknown as { new (): globalThis.DOMParser };

describe('KML beams', () => {
  it('round-trips a synthesized contour set and interpolates levels', () => {
    const fps = contourSetFromBeams([
      { id: 'B1', color: 0, center: [48, 10], radiusKmAt3dB: 120 },
      { id: 'B2', color: 1, center: [48, 13.2], radiusKmAt3dB: 120 },
    ]);
    const kml = footprintsToKml('test', fps);
    const r = parseKml(kml, P);
    expect(r.beams.length).toBe(2);
    expect(r.hasLevels).toBe(true);
    const b1 = r.beams.find((b) => b.name === 'B1')!;
    expect(b1.contours.length).toBe(5);
    expect(b1.contours[0].level).toBe(-1);
    const atCenter = kmlLevelAt(b1, 'relative', -3, 48, 10);
    expect(atCenter.inside).toBe(true);
    expect(atCenter.level).toBeGreaterThan(-1.1);
    // ~120 km east of centre should be close to −3 dB
    const atEdge = kmlLevelAt(b1, 'relative', -3, 48, 10 + 120 / (111.2 * Math.cos((48 * Math.PI) / 180)));
    expect(Math.abs(atEdge.level + 3)).toBeLessThan(0.35);
    expect(r.beams[0].color).not.toBe(r.beams[1].color);
  });

  it('reads levels from placemark names and folders', () => {
    const ring = (d: number) => `${10 - d},${48 - d},0 ${10 + d},${48 - d},0 ${10 + d},${48 + d},0 ${10 - d},${48 + d},0 ${10 - d},${48 - d},0`;
    const kml = `<kml><Document><Folder><name>Beam 7</name>
      <Placemark><name>52 dBW</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${ring(0.5)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
      <Placemark><name>50 dBW</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${ring(1)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
      <Placemark><name>48 dBW</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${ring(1.5)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
    </Folder></Document></kml>`;
    const r = parseKml(kml, P);
    expect(r.beams.length).toBe(1);
    expect(r.beams[0].name).toBe('Beam 7');
    expect(r.beams[0].contours.map((c) => c.level)).toEqual([52, 50, 48]);
    const v = kmlLevelAt(r.beams[0], 'absolute-eirp', -3, 48, 10.75);
    // midway between the 52 and 50 dBW contours
    expect(v.level).toBeCloseTo(51, 1);
  });

  it('assigns different reuse colours to adjacent beams of a hex lattice', () => {
    const beams: { id: string; color: number; center: [number, number]; radiusKmAt3dB: number }[] = [];
    const sp = 200; // km centre spacing
    for (let q = -2; q <= 2; q++) for (let r = Math.max(-2, -q - 2); r <= Math.min(2, -q + 2); r++) {
      const x = sp * (q + r / 2), y = sp * (Math.sqrt(3) / 2) * r;
      beams.push({ id: `H${q}${r}`, color: 0, center: [48 + y / 111.2, 10 + x / (111.2 * Math.cos((48 * Math.PI) / 180))], radiusKmAt3dB: 120 });
    }
    const r = parseKml(footprintsToKml('hex', contourSetFromBeams(beams)), P);
    expect(r.beams.length).toBe(19);
    const km = (a: [number, number], b: [number, number]) => Math.hypot((a[0] - b[0]) * 111.2, (a[1] - b[1]) * 111.2 * Math.cos((48 * Math.PI) / 180));
    let pairs = 0;
    for (let i = 0; i < r.beams.length; i++) for (let j = i + 1; j < r.beams.length; j++) {
      if (km(r.beams[i].centroid, r.beams[j].centroid) < 1.1 * sp) { pairs++; expect(r.beams[i].color).not.toBe(r.beams[j].color); }
    }
    expect(pairs).toBe(42);
  });
});
