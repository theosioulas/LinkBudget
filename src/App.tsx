import { useEffect } from 'react';
import { useStore, hadSavedScenario, setView } from './store/store';
import { GlobeView } from './globe/GlobeView';
import { TopBar } from './ui/TopBar';
import { Rail, Drawer } from './ui/Drawer';
import { LinkPanel } from './ui/LinkPanel';
import { TimelinePanel } from './ui/TimelinePanel';
import { liveTick } from './app/live';
import { loadItuGrids } from './core/itu/grids';
import { applyDemo } from './app/demos';
import { AccountDialog } from './ui/AccountDialog';
import { TemplatesDialog } from './ui/TemplatesDialog';
import { NewScenarioWizard } from './ui/NewScenarioWizard';

export default function App() {
  const bottomOpen = useStore((s) => s.bottomOpen);
  const toast = useStore((s) => s.toast);
  const pick = useStore((s) => s.pickTerminal);
  const set = useStore((s) => s.set);

  useEffect(() => {
    useStore.getState().rebuildSats();
    loadItuGrids(new URL('itu/', document.baseURI).href)
      .then(() => useStore.setState({ gridsReady: true }))
      .catch(() => useStore.getState().notify('ITU-R climate maps unavailable, using latitude-based estimates'));
    const id = setInterval(liveTick, 250);
    // Restore the user's last scenario, or open on the default multi-orbit template.
    const t = setTimeout(() => {
      if (hadSavedScenario) { useStore.getState().runSim(); setView('terminal'); } else applyDemo('multi-orbit');
    }, 1200);
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);

  // Space reserved at the bottom by the timeline (strip only, or strip + charts).
  const reserve = bottomOpen ? 46 + 250 + 20 : 46 + 20;
  return (
    <div className="app" style={{ ['--bottom-gap' as string]: `${reserve}px`, ['--bottom-reserve' as string]: `${reserve - 10}px` }}>
      <GlobeView />
      <TopBar />
      <Rail />
      <Drawer />
      <LinkPanel />
      <TimelinePanel />
      {pick && (
        <div className="pick-banner glass">Click the globe to place the terminal <button className="btn sm" onClick={() => set({ pickTerminal: false })}>Cancel</button></div>
      )}
      <AccountDialog />
      <TemplatesDialog />
      <NewScenarioWizard />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
