import { useEffect } from 'react';
import { useStore } from '../store/store';
import { DEMOS, applyDemo } from '../app/demos';
import { Icon } from './icons';

/** Ready-made scenarios, kept apart from the scenario builder. Applying one replaces the current setup. */
export function TemplatesDialog() {
  const open = useStore((s) => s.templatesOpen);
  const scenarioId = useStore((s) => s.scenarioId);
  const close = () => useStore.setState({ templatesOpen: false });
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal glass templates" role="dialog" aria-modal="true" aria-labelledby="tpl-title">
        <div className="modal-head">
          <h3 id="tpl-title">Scenario templates</h3>
          <button className="ibtn sm" onClick={close} title="Close"><Icon.close /></button>
        </div>
        <div className="modal-body">
          <p className="muted small" style={{ margin: 0 }}>Start from a ready-made setup, then change anything in the Scenario panel. Applying a template replaces the satellites, beam plan and simulation settings; the terminal location is kept.</p>
          <div className="tpl-grid">
            {DEMOS.map((d) => (
              <button key={d.id} className={`scn ${scenarioId === d.id ? 'on' : ''}`} onClick={() => applyDemo(d.id)}>
                <span className="t">{d.name}{scenarioId === d.id && <span className="check" style={{ width: 16, height: 16, display: 'inline-flex' }}><Icon.check /></span>}</span>
                <span className="sys">{d.systems}</span>
                <span className="d">{d.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
