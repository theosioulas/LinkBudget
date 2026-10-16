/**
 * KML / KMZ beam import & export.
 *
 * Import accepts operator-style coverage files:
 *   • one Folder per beam containing nested contour Polygons, or
 *   • flat Placemarks whose name/ExtendedData carry the beam id and level.
 * Contour levels are read from ExtendedData (EIRP, G/T, level, value, gain,
 * contour), from SimpleData, or from numbers in the Placemark name
 * (e.g. "B12 52 dBW", "-3 dB").
 */
import { unzipSync, strFromU8 } from 'fflate';
import type { KmlBeam, KmlContour } from '../model';
import { ringCentroid, ringAreaKm2 } from '../geo/polygon';
import type { Footprint } from '../rf/beams';

type El = Element;
const kids = (e: El | Document, tag: string): El[] => Array.from(e.getElementsByTagName(tag)) as El[];
const directChildren = (e: El, tag: string): El[] => Array.from(e.childNodes).filter((n) => (n as El).tagName === tag || (n as El).localName === tag) as El[];
const text = (e: El | undefined | null) => (e?.textContent ?? '').trim();

function parseCoords(s: string): [number, number][] {
  return s.trim().split(/\s+/).map((t) => t.split(',').map(Number)).filter((a) => a.length >= 2 && a.every((v) => Number.isFinite(v))).map(([lon, lat]) => [lat, lon]);
}

const LEVEL_KEYS = ['eirp', 'g/t', 'gt', 'level', 'value', 'gain', 'contour', 'db', 'dbw'];

function levelOf(pm: El): number | undefined {
  for (const d of kids(pm, 'Data')) {
    const n = (d.getAttribute('name') ?? '').toLowerCase();
    if (LEVEL_KEYS.some((k) => n.includes(k))) { const v = parseFloat(text(kids(d, 'value')[0])); if (Number.isFinite(v)) return v; }
  }
  for (const d of kids(pm, 'SimpleData')) {
    const n = (d.getAttribute('name') ?? '').toLowerCase();
    if (LEVEL_KEYS.some((k) => n.includes(k))) { const v = parseFloat(text(d)); if (Number.isFinite(v)) return v; }
  }
  const nm = text(directChildren(pm, 'name')[0]) + ' ' + text(directChildren(pm, 'description')[0]);
  const m = nm.match(/(-?\d+(?:\.\d+)?)\s*(dBW|dB\/K|dBK|dBi|dB)\b/i) ?? nm.match(/(?:eirp|level|contour|g\/t)\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i);
  if (m) return parseFloat(m[1]);
  return undefined;
}

function beamKeyOf(pm: El): string | undefined {
  for (const d of kids(pm, 'Data')) {
    const n = (d.getAttribute('name') ?? '').toLowerCase();
    if (n === 'beam' || n === 'beam_id' || n === 'beamid' || n === 'beam name') return text(kids(d, 'value')[0]);
  }
  for (const d of kids(pm, 'SimpleData')) {
    const n = (d.getAttribute('name') ?? '').toLowerCase();
    if (n === 'beam' || n === 'beam_id' || n === 'beamid') return text(d);
  }
  const nm = text(directChildren(pm, 'name')[0]);
  const m = nm.match(/^([A-Za-z]*[-_ ]?\d+[A-Za-z]?)\b/);
  return m ? m[1] : nm || undefined;
}

function ringsOf(pm: El): [number, number][][] {
  const rings: [number, number][][] = [];
  for (const poly of kids(pm, 'Polygon')) {
    const ob = kids(poly, 'outerBoundaryIs')[0] ?? poly;
    const lr = kids(ob, 'LinearRing')[0];
    const c = lr ? kids(lr, 'coordinates')[0] : kids(poly, 'coordinates')[0];
    const r = parseCoords(text(c));
    if (r.length >= 3) rings.push(r);
  }
  // LineString contours (closed lines) are accepted too
  for (const ls of kids(pm, 'LineString')) {
    const r = parseCoords(text(kids(ls, 'coordinates')[0]));
    if (r.length >= 3) rings.push(r);
  }
  return rings;
}

export interface KmlParseResult { beams: KmlBeam[]; warnings: string[]; hasLevels: boolean }

export function parseKml(xml: string, Parser: { new (): DOMParser } = DOMParser): KmlParseResult {
  const doc = new Parser().parseFromString(xml, 'text/xml') as unknown as Document;
  const warnings: string[] = [];
  const placemarks = kids(doc, 'Placemark').filter((pm) => ringsOf(pm).length);
  if (!placemarks.length) return { beams: [], warnings: ['No polygon placemarks found'], hasLevels: false };

  // Group by parent Folder when folders hold several polygon placemarks; else by beam key
  const groups = new Map<string, { name: string; pms: El[] }>();
  for (const pm of placemarks) {
    let parent = pm.parentNode as El | null;
    while (parent && parent.tagName !== 'Folder' && parent.localName !== 'Folder') parent = parent.parentNode as El | null;
    const folderName = parent ? text(directChildren(parent, 'name')[0]) : '';
    const siblings = parent ? kids(parent, 'Placemark').filter((p) => ringsOf(p).length).length : 0;
    const key = folderName && siblings > 1 ? `F:${folderName}` : `K:${beamKeyOf(pm) ?? 'beam'}`;
    const nm = folderName && siblings > 1 ? folderName : beamKeyOf(pm) ?? 'Beam';
    if (!groups.has(key)) groups.set(key, { name: nm, pms: [] });
    groups.get(key)!.pms.push(pm);
  }
  let hasLevels = false;
  const beams: KmlBeam[] = [];
  let idx = 0;
  for (const [, g] of groups) {
    const byLevel = new Map<number, KmlContour>();
    let anon = 0;
    for (const pm of g.pms) {
      const lv = levelOf(pm);
      if (lv !== undefined) hasLevels = true;
      const level = lv ?? -3 * anon++;
      const c = byLevel.get(level) ?? { level, rings: [] };
      c.rings.push(...ringsOf(pm));
      byLevel.set(level, c);
    }
    const contours = [...byLevel.values()].sort((a, b) => b.level - a.level);
    // Largest ring of the outermost contour defines the centroid
    const outer = contours[contours.length - 1].rings.reduce((a, b) => (ringAreaKm2(b) > ringAreaKm2(a) ? b : a));
    const inner = contours[0].rings.reduce((a, b) => (ringAreaKm2(b) > ringAreaKm2(a) ? b : a));
    beams.push({ id: `kml-${idx}`, name: g.name || `Beam ${idx + 1}`, color: 0, contours, centroid: ringCentroid(contours.length > 1 ? inner : outer) });
    idx++;
  }
  assignColors(beams, 4);
  if (!hasLevels) warnings.push('No contour levels found – polygons treated as beam edges (edge-only mode).');
  return { beams, warnings, hasLevels };
}

export function parseKmz(buf: ArrayBuffer, Parser?: { new (): DOMParser }): KmlParseResult {
  const files = unzipSync(new Uint8Array(buf));
  const name = Object.keys(files).find((n) => n.toLowerCase().endsWith('.kml'));
  if (!name) return { beams: [], warnings: ['KMZ contains no .kml file'], hasLevels: false };
  return parseKml(strFromU8(files[name]), Parser);
}

/** Greedy graph colouring: beams whose centroids are closer than ~1.6× their radius are neighbours. */
export function assignColors(beams: KmlBeam[], colors: number) {
  const R = beams.map((b) => Math.sqrt(ringAreaKm2(b.contours[b.contours.length - 1].rings[0]) / Math.PI));
  const dist = (a: [number, number], b: [number, number]) => {
    const dl = ((a[1] - b[1] + 540) % 360) - 180;
    return Math.hypot((a[0] - b[0]) * 111.2, dl * 111.2 * Math.cos((a[0] * Math.PI) / 180));
  };
  const order = beams.map((_, i) => i).sort((a, b) => beams[a].centroid[0] - beams[b].centroid[0] || beams[a].centroid[1] - beams[b].centroid[1]);
  const assigned: number[] = new Array(beams.length).fill(-1);
  for (const i of order) {
    const used = new Set<number>();
    for (let j = 0; j < beams.length; j++) {
      if (j === i || assigned[j] < 0) continue;
      if (dist(beams[i].centroid, beams[j].centroid) < 1.6 * (R[i] + R[j])) used.add(assigned[j]);
    }
    let c = 0;
    while (used.has(c) && c < colors - 1) c++;
    assigned[i] = c;
    beams[i].color = c;
  }
}

// ------------------------------------------------------------------ export
const COLOR_HEX = ['ff4cc9f0', 'ff06d6a0', 'ffffd166', 'ffef476f', 'ffb388ff', 'ffff9f43', 'ff90e0ef'];
const kmlColor = (rgbaHex: string, alpha: string) => {
  // input aarrggbb-ish from palette (stored as ffRRGGBB) → KML aabbggrr
  const rr = rgbaHex.slice(2, 4), gg = rgbaHex.slice(4, 6), bb = rgbaHex.slice(6, 8);
  return `${alpha}${bb}${gg}${rr}`;
};
const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!);

export function footprintsToKml(name: string, fps: Footprint[], levelLabel = 'dB'): string {
  const styles = COLOR_HEX.map((c, i) => `<Style id="c${i}"><LineStyle><color>${kmlColor(c, 'ff')}</color><width>1.5</width></LineStyle><PolyStyle><color>${kmlColor(c, '40')}</color></PolyStyle></Style>`).join('\n');
  const pms = fps.filter((f) => f.ring.length > 2).map((f) => {
    const coords = f.ring.map(([la, lo]) => `${lo.toFixed(5)},${la.toFixed(5)},0`).join(' ');
    const lvl = f.level !== undefined ? `<ExtendedData><Data name="level"><value>${f.level}</value></Data><Data name="beam"><value>${esc(f.id.split('#')[0])}</value></Data></ExtendedData>` : `<ExtendedData><Data name="beam"><value>${esc(f.id)}</value></Data></ExtendedData>`;
    return `<Placemark><name>${esc(f.id)}${f.level !== undefined ? ` ${f.level} ${levelLabel}` : ''}</name><styleUrl>#c${f.color % COLOR_HEX.length}</styleUrl>${lvl}<Polygon><tessellate>1</tessellate><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${esc(name)}</name>\n${styles}\n${pms}\n</Document></kml>\n`;
}

/** Synthesize contour rings (relative levels) around circular beams — for exporting a hex/spot layout as an operator-style KML. */
export function contourSetFromBeams(beams: { id: string; color: number; center: [number, number]; radiusKmAt3dB: number }[], levels = [-1, -2, -3, -4, -5]): Footprint[] {
  const out: Footprint[] = [];
  for (const b of beams) {
    for (const lv of levels) {
      const r = b.radiusKmAt3dB * Math.sqrt(lv / -3);
      const ring: [number, number][] = [];
      for (let k = 0; k <= 48; k++) {
        const a = (2 * Math.PI * k) / 48;
        const lat = b.center[0] + (r * Math.sin(a)) / 111.2;
        const lon = b.center[1] + (r * Math.cos(a)) / (111.2 * Math.cos((b.center[0] * Math.PI) / 180));
        ring.push([lat, lon]);
      }
      out.push({ id: `${b.id}#${lv}`, color: b.color, ring, level: lv });
    }
  }
  return out;
}
