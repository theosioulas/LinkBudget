import { useStore, type LeftTab } from '../store/store';
import { ScenarioTab } from './ScenarioTab';
import { PayloadTab } from './PayloadTab';
import { TerminalTab } from './TerminalTab';
import { BeamLabTab } from './BeamLabTab';
import { SettingsTab } from './SettingsTab';
import { CoverageTab } from './CoverageTab';

const TABS: [LeftTab, string][] = [['scenario', 'Satellites'], ['payload', 'Payload'], ['terminal', 'Terminal'], ['coverage', 'Coverage'], ['beamlab', 'Beam Lab'], ['settings', '⚙']];

export function LeftPanel() {
  const tab = useStore((s) => s.leftTab);
  const set = useStore((s) => s.set);
  return (
    <div className="panel left">
      <div className="tabs">
        {TABS.map(([k, l]) => <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => set({ leftTab: k })}>{l}</button>)}
      </div>
      <div className="scroll">
        {tab === 'scenario' && <ScenarioTab />}
        {tab === 'payload' && <PayloadTab />}
        {tab === 'terminal' && <TerminalTab />}
        {tab === 'coverage' && <CoverageTab />}
        {tab === 'beamlab' && <BeamLabTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
