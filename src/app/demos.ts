import { useStore, activeTerminal, setView } from '../store/store';
import { DEFAULT_MBB } from '../data/presets';
import { DEMOS } from './demo-defs';

export { DEMOS };

export function applyDemo(id: string) {
  const d = DEMOS.find((x) => x.id === id);
  if (!d) return;
  const s = useStore.getState();
  const constellations = s.constellations.map((c) => ({ ...c, enabled: c.locked || d.enable.includes(c.id) }));
  useStore.setState({ constellations, scenarioId: d.id, drawer: null, mbb: { ...DEFAULT_MBB, ...d.mbb }, sim: null, selectedSatId: null, focusPayloadSatId: null });
  const t = activeTerminal(useStore.getState());
  useStore.getState().updateTerminal({
    beams: d.beams ?? t.beams, obstructions: d.obstructions ?? t.obstructions,
    type: d.beams === 2 && t.type === 'parabolic' ? 'phased-array' : t.type,
  });
  useStore.getState().rebuildSats();
  setTimeout(() => { useStore.getState().runSim(); setView('terminal', { rangeKm: d.obstructions?.length ? 2500 : 12000 }); }, 100);
}
