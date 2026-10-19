import { useStore } from '../store/store';
import type { Payload, ContourMeaning, BeamLayout } from '../core/model';
import { parseKml, parseKmz } from '../core/kml/kml';
import { pickFile } from './controls';

async function readKml() {
  const f = await pickFile('.kml,.kmz');
  if (!f) return null;
  const r = f.name.toLowerCase().endsWith('.kmz') ? parseKmz(await f.arrayBuffer()) : parseKml(await f.text());
  return { f, r };
}

/**
 * The payload a system's beam edits should go to: its own payload, or — when that payload is shared with
 * other systems — a fresh copy assigned to this system, so importing beams for one satellite never
 * changes another.
 */
export function ownPayload(systemId: string): Payload | null {
  const st = useStore.getState();
  const c = st.constellations.find((x) => x.id === systemId);
  const p = c && st.payloads.find((x) => x.id === c.payloadId);
  if (!c || !p) return null;
  if (st.constellations.filter((x) => x.payloadId === p.id).length <= 1) return p;
  const np: Payload = { ...JSON.parse(JSON.stringify(p)), id: `pl-${Date.now().toString(36)}`, name: `${p.name} (${c.name})` };
  st.addPayload(np);
  st.updateConstellation(c.id, { payloadId: np.id });
  return np;
}

function setLayout(p: Payload, layout: BeamLayout) {
  useStore.getState().updatePayload(p.id, { ...p, layout });
}

/** Import beam contours (absolute EIRP, relative gain, or beam edges) from a KML/KMZ file into a payload. */
export async function importBeamKml(p: Payload) {
  const notify = useStore.getState().notify;
  try {
    const x = await readKml();
    if (!x) return;
    const { f, r } = x;
    if (!r.beams.length) { notify(r.warnings.join(' ') || 'No beams found'); return; }
    const maxLv = Math.max(...r.beams.flatMap((b) => b.contours.map((c) => c.level)));
    const meaning: ContourMeaning = !r.hasLevels ? 'edge-only' : maxLv > 15 ? 'absolute-eirp' : 'relative';
    setLayout(p, { kind: 'kml', beams: r.beams, meaning, edgeRelDb: -3, sourceName: f.name });
    notify(`Imported ${r.beams.length} beam(s) from ${f.name} (${meaning})${r.warnings.length ? ' – ' + r.warnings.join(' ') : ''}`);
  } catch (e) {
    notify(`KML import failed: ${String(e)}`);
  }
}

/** Import G/T contours (dB/K) for a payload that already has KML beams. */
export async function importGtKml(p: Payload) {
  const notify = useStore.getState().notify;
  if (p.layout.kind !== 'kml') return;
  try {
    const x = await readKml();
    if (!x) return;
    const { f, r } = x;
    if (!r.beams.length || !r.hasLevels) { notify('G/T file needs contour levels (dB/K)'); return; }
    setLayout(p, { ...p.layout, gtBeams: r.beams, gtSourceName: f.name });
    notify(`Imported G/T contours for ${r.beams.length} beam(s) from ${f.name}`);
  } catch (e) {
    notify(`G/T import failed: ${String(e)}`);
  }
}
