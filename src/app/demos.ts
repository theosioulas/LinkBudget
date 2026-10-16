import { useStore, activeTerminal } from '../store/store';
import { DEFAULT_MBB } from '../data/presets';
import { globe } from '../globe/GlobeView';
import { DEMOS } from './demo-defs';

export { DEMOS };

export function applyDemo(id: string) {
  const d = DEMOS.find((x) => x.id === id);
  if (!d) return;
  const s = useStore.getState();
  for (const c of s.constellations) if (d.enable.includes(c.id) && !c.enabled) s.updateConstellation(c.id, { enabled: true });
  const t = activeTerminal(useStore.getState());
  useStore.getState().updateTerminal({
    beams: d.beams ?? t.beams, obstructions: d.obstructions ?? t.obstructions,
    type: d.beams === 2 && t.type === 'parabolic' ? 'phased-array' : t.type,
  });
  useStore.setState({ mbb: { ...DEFAULT_MBB, ...d.mbb }, sim: null, bottomOpen: true });
  useStore.getState().notify(d.description);
  setTimeout(() => { useStore.getState().runSim(); globe?.flyToTerminal(d.obstructions?.length ? 2500 : 9000, -50); }, 100);
}
