import { useEffect } from 'react';
import { useStore } from './store/store';
import { GlobeView } from './globe/GlobeView';
import { TopBar } from './ui/TopBar';
import { LeftPanel } from './ui/LeftPanel';
import { LinkPanel } from './ui/LinkPanel';
import { TimelinePanel } from './ui/TimelinePanel';
import { liveTick } from './app/live';
import { loadItuGrids } from './core/itu/grids';

export default function App() {
  const leftOpen = useStore((s) => s.leftOpen);
  const rightOpen = useStore((s) => s.rightOpen);
  const bottomOpen = useStore((s) => s.bottomOpen);
  const toast = useStore((s) => s.toast);
  const pick = useStore((s) => s.pickTerminal);
  const set = useStore((s) => s.set);

  useEffect(() => {
    useStore.getState().rebuildSats();
    loadItuGrids(new URL('itu/', document.baseURI).href)
      .then(() => useStore.setState({ gridsReady: true }))
      .catch(() => useStore.getState().notify('ITU-R climate maps unavailable – using latitude-based fallbacks'));
    const id = setInterval(liveTick, 250);
    // Kick off an initial make-before-break timeline once the scene is up.
    const t = setTimeout(() => useStore.getState().runSim(), 1500);
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);

  return (
    <div className={`app ${leftOpen ? '' : 'no-left'} ${rightOpen ? '' : 'no-right'}`} style={{ ['--bottom-gap' as string]: bottomOpen ? '312px' : '10px' }}>
      <GlobeView />
      <TopBar />
      {leftOpen && <LeftPanel />}
      {rightOpen && <LinkPanel />}
      {bottomOpen && <TimelinePanel />}
      <button className="collapse-btn" style={{ top: 80, left: leftOpen ? 382 : 0 }} onClick={() => set({ leftOpen: !leftOpen })} title="Toggle left panel">{leftOpen ? '‹' : '›'}</button>
      <button className="collapse-btn" style={{ top: 80, right: rightOpen ? 430 : 0, borderRadius: '8px 0 0 8px', borderLeft: '1px solid var(--border)', borderRight: 'none' }} onClick={() => set({ rightOpen: !rightOpen })} title="Toggle link budget panel">{rightOpen ? '›' : '‹'}</button>
      {!bottomOpen && <button className="btn sm" style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 9 }} onClick={() => set({ bottomOpen: true })}>▲ MBB timeline</button>}
      {pick && <div className="pick-banner">Click on the globe to place the terminal · <button className="btn sm" onClick={() => set({ pickTerminal: false })}>Cancel</button></div>}
      {toast && <div className="toast">{toast}</div>}
      <Legend />
    </div>
  );
}

function Legend() {
  const bottomOpen = useStore((s) => s.bottomOpen);
  const rightOpen = useStore((s) => s.rightOpen);
  return (
    <div className="legend" style={{ bottom: bottomOpen ? 314 : 14, right: rightOpen ? 440 : 14 }}>
      <span className="row" style={{ gap: 5 }}><span style={{ width: 18, height: 3, background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }} /> Beam A</span>
      <span className="row" style={{ gap: 5 }}><span style={{ width: 18, height: 3, background: '#f472b6', boxShadow: '0 0 6px #f472b6' }} /> Beam B</span>
      <span className="row dim" style={{ gap: 5 }}><span style={{ width: 18, borderTop: '2px dashed #f472b6' }} /> acquiring</span>
    </div>
  );
}
