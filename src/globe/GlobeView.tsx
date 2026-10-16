import { useEffect, useRef, useState } from 'react';
import { GlobeController } from './controller';
import { useStore, activeTerminal } from '../store/store';

export let globe: GlobeController | null = null;

export function GlobeView() {
  const host = useRef<HTMLDivElement>(null);
  const credit = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const sats = useStore((s) => s.sats);
  const satsVersion = useStore((s) => s.satsVersion);
  const constellations = useStore((s) => s.constellations);
  const payloads = useStore((s) => s.payloads);
  const terminal = useStore(activeTerminal);
  const layers = useStore((s) => s.layers);
  const live = useStore((s) => s.live);
  const selectedSatId = useStore((s) => s.selectedSatId);
  const focus = useStore((s) => s.focusPayloadSatId);
  const pickTerminal = useStore((s) => s.pickTerminal);
  const clockMult = useStore((s) => s.clock.multiplier);
  const playing = useStore((s) => s.clock.playing);

  useEffect(() => {
    const g = new GlobeController(host.current!, credit.current!);
    globe = g;
    (window as unknown as { __globe: GlobeController }).__globe = g;
    let lastPush = 0;
    g.onTick = (ms) => {
      const now = performance.now();
      if (now - lastPush > 200) {
        lastPush = now;
        const c = useStore.getState().clock;
        useStore.setState({ clock: { ...c, t: ms } });
      }
    };
    g.onPick = (id) => useStore.setState({ selectedSatId: id, focusPayloadSatId: id });
    g.onPickGround = (lat, lon) => {
      useStore.getState().updateTerminal({ lat: +lat.toFixed(4), lon: +lon.toFixed(4) });
      useStore.setState({ pickTerminal: false, sim: null });
      useStore.getState().notify(`Terminal moved to ${lat.toFixed(3)}°, ${lon.toFixed(3)}°`);
    };
    g.onHover = (id, x, y) => setHover(id ? { id, x, y } : null);
    g.setTime(useStore.getState().clock.t);
    const st = useStore.getState();
    g.applyLayers(st.layers);
    g.setTerminal(activeTerminal(st));
    g.flyToTerminal(26000, -78, 0);
    const intro = setTimeout(() => g.flyToTerminal(17000, -62, 3), 600);
    g.onImageryFallback = () => useStore.getState().notify('Satellite imagery unreachable – using the offline Natural Earth II globe');
    return () => { clearTimeout(intro); g.destroy(); if (globe === g) globe = null; };
  }, []);

  useEffect(() => { globe?.setScenario(sats, useStore.getState().constellations, useStore.getState().payloads); }, [sats]);
  useEffect(() => { globe?.updatePayloads(payloads, constellations); }, [payloads, constellations, satsVersion]);
  useEffect(() => { globe?.setTerminal(terminal); }, [terminal]);
  useEffect(() => { globe?.applyLayers(layers); }, [layers]);
  useEffect(() => { globe?.setClock(clockMult, playing); }, [clockMult, playing]);
  useEffect(() => { if (globe) globe.pickGroundMode = pickTerminal; }, [pickTerminal]);
  useEffect(() => { globe?.setSelected(selectedSatId, focus); }, [selectedSatId, focus]);
  useEffect(() => {
    globe?.setLinks({
      A: live.A ? { satId: live.A.satId, phase: live.A.phase, active: live.A.active, aim: live.A.link?.beam.aim } : null,
      B: live.B ? { satId: live.B.satId, phase: live.B.phase, active: live.B.active, aim: live.B.link?.beam.aim } : null,
    });
  }, [live]);

  const hoverSat = hover ? sats.find((s) => s.id === hover.id) : null;
  const hc = hoverSat ? constellations.find((c) => c.id === hoverSat.constellationId) : null;
  return (
    <>
      <div className="globe" ref={host} style={{ cursor: pickTerminal ? 'crosshair' : undefined }} />
      <div className="credits" ref={credit} />
      {hover && hoverSat && (
        <div className="tooltip" style={{ left: hover.x + 14, top: hover.y + 10 }}>
          <b>{hoverSat.name}</b> <span className="dim">· {hc?.name} · {hc?.orbitClass}</span>
        </div>
      )}
    </>
  );
}
