import { useEffect, useRef, useState } from 'react';
import { GlobeController } from './controller';
import { useStore, activeTerminal } from '../store/store';

export let globe: GlobeController | null = null;

export function GlobeView() {
  const host = useRef<HTMLDivElement>(null);
  const credit = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [heading, setHeading] = useState(0);
  const sats = useStore((s) => s.sats);
  const satsVersion = useStore((s) => s.satsVersion);
  const constellations = useStore((s) => s.constellations);
  const payloads = useStore((s) => s.payloads);
  const terminal = useStore(activeTerminal);
  const layers = useStore((s) => s.layers);
  const live = useStore((s) => s.live);
  const selectedSatId = useStore((s) => s.selectedSatId);
  const focus = useStore((s) => s.focusPayloadSatId);
  const view = useStore((s) => s.view);
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
    g.onPick = (id) => useStore.setState({ selectedSatId: id });
    g.onViewModeChange = (mode) => useStore.setState((s) => ({ view: { ...s.view, mode } }));
    g.onPickGround = (lat, lon) => {
      useStore.getState().updateTerminal({ lat: +lat.toFixed(4), lon: +lon.toFixed(4) });
      useStore.setState({ pickTerminal: false, sim: null });
      useStore.getState().notify(`Terminal moved to ${lat.toFixed(3)}°, ${lon.toFixed(3)}°`);
    };
    g.onHover = (id, x, y) => setHover(id ? { id, x, y } : null);
    g.onHeading = setHeading;
    // Google Earth shortcut: N turns north back up.
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey) g.resetNorth();
    };
    window.addEventListener('keydown', onKey);
    g.setTime(useStore.getState().clock.t);
    const st = useStore.getState();
    g.applyLayers(st.layers);
    g.setTerminal(activeTerminal(st));
    g.setView('terminal', { rangeKm: 30000, pitchDeg: -80, duration: 0 });
    const intro = setTimeout(() => g.setView('terminal', { rangeKm: 12000, pitchDeg: -55, duration: 3 }), 600);
    g.onImageryFallback = () => useStore.getState().notify('Satellite imagery unreachable – using the offline Natural Earth II globe');
    return () => { clearTimeout(intro); window.removeEventListener('keydown', onKey); g.destroy(); if (globe === g) globe = null; };
  }, []);

  useEffect(() => { globe?.setScenario(sats, useStore.getState().constellations, useStore.getState().payloads); }, [sats]);
  useEffect(() => { globe?.updatePayloads(payloads, constellations); }, [payloads, constellations, satsVersion]);
  useEffect(() => { globe?.setTerminal(terminal); }, [terminal]);
  useEffect(() => { globe?.applyLayers(layers); }, [layers]);
  useEffect(() => { globe?.setClock(clockMult, playing); }, [clockMult, playing]);
  useEffect(() => { if (globe) globe.pickGroundMode = pickTerminal; }, [pickTerminal]);
  useEffect(() => { globe?.setSelected(selectedSatId, focus); }, [selectedSatId, focus]);
  useEffect(() => {
    if (!globe || view.nonce === 0) return;
    globe.setView(view.mode, { satId: view.satId ?? undefined, rangeKm: view.rangeKm });
  }, [view.nonce]); // eslint-disable-line react-hooks/exhaustive-deps
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
      <button className="compass glass" onClick={() => globe?.resetNorth()} title="North up (N) · Drag: move · Wheel: zoom · Middle-drag or Shift+drag: tilt & rotate · Ctrl+drag: look around" aria-label="Reset north">
        <svg viewBox="0 0 40 40" style={{ transform: `rotate(${-heading}deg)` }} aria-hidden="true">
          <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(160,185,225,0.35)" strokeWidth="1.2" />
          <path d="M20 6 L24.5 20 L15.5 20 Z" fill="#f87171" />
          <path d="M20 34 L24.5 20 L15.5 20 Z" fill="#cbd5e1" />
          <text x="20" y="5.2" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#e8eef8">N</text>
        </svg>
      </button>
      {hover && hoverSat && (
        <div className="tooltip" style={{ left: hover.x + 14, top: hover.y + 10 }}>
          <b>{hoverSat.name}</b> <span className="dim">· {hc?.name} · {hc?.orbitClass}</span>
        </div>
      )}
    </>
  );
}
