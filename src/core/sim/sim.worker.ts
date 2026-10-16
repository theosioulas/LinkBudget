/// <reference lib="webworker" />
import { loadItuGrids, ituGrids } from '../itu/grids';
import { buildSatellites, makeEvalContext } from './runtime';
import { runHandoverSim } from './handover';
import type { Constellation, Payload, Terminal, AnalysisSettings, MbbSettings } from '../model';

export interface SimRequest {
  constellations: Constellation[];
  payloads: Payload[];
  terminal: Terminal;
  analysis: AnalysisSettings;
  mbb: MbbSettings;
  epochMs: number;
  startMs: number;
  gridsBase: string;
}

self.onmessage = async (ev: MessageEvent<SimRequest>) => {
  const r = ev.data;
  try {
    if (!ituGrids.ready) { try { await loadItuGrids(r.gridsBase); } catch { /* fall back to latitude models */ } }
    const sats = buildSatellites(r.constellations, r.epochMs);
    const ctx = makeEvalContext(r.terminal, r.analysis, r.constellations, r.payloads);
    const res = runHandoverSim(sats, ctx, r.mbb, r.startMs, (f) => (self as unknown as Worker).postMessage({ type: 'progress', value: f }));
    (self as unknown as Worker).postMessage({ type: 'done', result: res });
  } catch (e) {
    (self as unknown as Worker).postMessage({ type: 'error', message: String(e) });
  }
};
