import type { ReactElement } from 'react';
import { useStore, type LeftTab } from '../store/store';
import { Icon } from './icons';
import { ScenariosPanel } from './ScenariosPanel';
import { ScenarioTab } from './ScenarioTab';
import { PayloadTab } from './PayloadTab';
import { TerminalTab } from './TerminalTab';
import { CoverageTab } from './CoverageTab';
import { BeamLabTab } from './BeamLabTab';
import { SettingsTab } from './SettingsTab';

const ITEMS: [LeftTab, string, () => ReactElement][] = [
  ['scenarios', 'Scenarios', Icon.scenarios],
  ['scenario', 'Satellites', Icon.satellites],
  ['payload', 'Payloads', Icon.payload],
  ['terminal', 'Terminal', Icon.terminal],
  ['coverage', 'Coverage map', Icon.coverage],
  ['beamlab', 'Beam Lab', Icon.beamlab],
];

export function Rail() {
  const drawer = useStore((s) => s.drawer);
  const set = useStore((s) => s.set);
  const item = (k: LeftTab, label: string, I: () => ReactElement) => (
    <div className="rail-item" key={k}>
      <button className={`ibtn ${drawer === k ? 'on' : ''}`} onClick={() => set({ drawer: drawer === k ? null : k })} aria-label={label}><I /></button>
      <span className="rail-tip">{label}</span>
    </div>
  );
  return (
    <nav className="rail glass">
      {ITEMS.slice(0, 1).map(([k, l, I]) => item(k, l, I))}
      <div className="sep" />
      {ITEMS.slice(1).map(([k, l, I]) => item(k, l, I))}
      <div className="sep" />
      {item('settings', 'Settings', Icon.settings)}
    </nav>
  );
}

export function Drawer() {
  const drawer = useStore((s) => s.drawer);
  const set = useStore((s) => s.set);
  if (!drawer) return null;
  const title = [...ITEMS, ['settings', 'Settings'] as const].find((x) => x[0] === drawer)?.[1];
  return (
    <aside className="drawer glass" aria-label={title}>
      <div className="drawer-head">
        <h2>{title}</h2>
        <button className="ibtn sm" onClick={() => set({ drawer: null })} aria-label="Close panel"><Icon.close /></button>
      </div>
      <div className="scroll">
        {drawer === 'scenarios' && <ScenariosPanel />}
        {drawer === 'scenario' && <ScenarioTab />}
        {drawer === 'payload' && <PayloadTab />}
        {drawer === 'terminal' && <TerminalTab />}
        {drawer === 'coverage' && <CoverageTab />}
        {drawer === 'beamlab' && <BeamLabTab />}
        {drawer === 'settings' && <SettingsTab />}
      </div>
    </aside>
  );
}
