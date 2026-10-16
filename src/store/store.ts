import { create } from 'zustand';
import type { Constellation, Payload, Terminal, AnalysisSettings, MbbSettings } from '../core/model';
import { CONSTELLATIONS, PAYLOADS, TERMINALS, DEFAULT_ANALYSIS, DEFAULT_MBB } from '../data/presets';
import { buildSatellites } from '../core/sim/runtime';
import type { SatelliteDef } from '../core/orbit/propagator';
import type { SimResult } from '../core/sim/handover';
import type { LinkResult } from '../core/rf/linkbudget';
import type { SimRequest } from '../core/sim/sim.worker';

export type LeftTab = 'scenarios' | 'scenario' | 'payload' | 'terminal' | 'coverage' | 'beamlab' | 'settings';
export type Imagery = 'satellite' | 'natural' | 'dark';

export interface LiveBeam {
  satId: string;
  phase: 'acquiring' | 'tracking';
  active: boolean;
  link: LinkResult | null;
}

export interface Layers {
  imagery: Imagery;
  nightLights: boolean;
  lighting: boolean;
  atmosphere: boolean;
  /** Satellite dots per orbit class */
  dotsLEO: boolean;
  dotsMEO: boolean;
  dotsGEO: boolean;
  labels: boolean;
  orbits: boolean;
  coverage: boolean;
  /** Beam footprints on the ground */
  beams: boolean;
  /** Solid cones of the serving LEO/MEO spot beams */
  cones: boolean;
  /** Field-of-view cones of the LEO/MEO satellites visible from the terminal */
  fovCones: boolean;
  links: boolean;
  scanCone: boolean;
  walls: boolean;
  groundTrack: boolean;
  allOrbitsOpacity: number;
  pointSize: number;
}

export const DEFAULT_LAYERS: Layers = {
  imagery: 'satellite', nightLights: true, lighting: true, atmosphere: true,
  dotsLEO: true, dotsMEO: true, dotsGEO: true, labels: true, orbits: true, coverage: true,
  beams: true, cones: true, fovCones: true, links: true, scanCone: false, walls: true, groundTrack: true,
  allOrbitsOpacity: 0.35, pointSize: 3,
};

export interface ScenarioFile {
  version: 1;
  name: string;
  constellations: Constellation[];
  payloads: Payload[];
  terminals: Terminal[];
  activeTerminalId: string;
  analysis: AnalysisSettings;
  mbb: MbbSettings;
}

interface State {
  name: string;
  scenarioId: string;
  constellations: Constellation[];
  payloads: Payload[];
  terminals: Terminal[];
  activeTerminalId: string;
  analysis: AnalysisSettings;
  mbb: MbbSettings;
  epochMs: number;
  sats: SatelliteDef[];
  satsVersion: number;
  selectedSatId: string | null;
  selectedPayloadId: string;
  focusPayloadSatId: string | null; // satellite whose full beam layout is drawn
  sim: SimResult | null;
  simStale: boolean;
  simRunning: boolean;
  simProgress: number;
  simError: string | null;
  gridsReady: boolean;
  pickTerminal: boolean;
  leftTab: LeftTab;
  drawer: LeftTab | null;
  leftOpen: boolean;
  rightOpen: boolean;
  bottomOpen: boolean;
  layers: Layers;
  live: { t: number; A: LiveBeam | null; B: LiveBeam | null; selected: LinkResult | null; visible: number; mode: 'timeline' | 'instant' };
  clock: { t: number; multiplier: number; playing: boolean };
  toast: string | null;
  // actions
  set: (p: Partial<State>) => void;
  updateConstellation: (id: string, p: Partial<Constellation>) => void;
  addConstellation: (c: Constellation, p?: Payload) => void;
  removeConstellation: (id: string) => void;
  updatePayload: (id: string, p: Payload) => void;
  addPayload: (p: Payload) => void;
  updateTerminal: (p: Partial<Terminal>) => void;
  addTerminal: (t: Terminal) => void;
  rebuildSats: () => void;
  runSim: (startMs?: number) => void;
  exportScenario: () => ScenarioFile;
  importScenario: (f: ScenarioFile) => void;
  notify: (msg: string) => void;
}

const STORAGE_KEY = 'orbitlink.scenario.v2';
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function loadSaved(): Partial<ScenarioFile> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScenarioFile) : null;
  } catch {
    return null;
  }
}

const saved = typeof window !== 'undefined' ? loadSaved() : null;
const epoch = Math.floor(Date.now() / 60000) * 60000;

let worker: Worker | null = null;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useStore = create<State>((set, get) => ({
  name: saved?.name ?? 'Multi-orbit scenario',
  scenarioId: 'multi-orbit',
  constellations: saved?.constellations ?? clone(CONSTELLATIONS),
  payloads: saved?.payloads ?? clone(PAYLOADS),
  terminals: saved?.terminals ?? clone(TERMINALS),
  activeTerminalId: saved?.activeTerminalId ?? TERMINALS[0].id,
  analysis: { ...DEFAULT_ANALYSIS, ...(saved?.analysis ?? {}) },
  mbb: { ...DEFAULT_MBB, ...(saved?.mbb ?? {}) },
  epochMs: epoch,
  sats: [],
  satsVersion: 0,
  selectedSatId: null,
  selectedPayloadId: (saved?.payloads ?? PAYLOADS)[0].id,
  focusPayloadSatId: null,
  sim: null,
  simStale: false,
  simRunning: false,
  simProgress: 0,
  simError: null,
  gridsReady: false,
  pickTerminal: false,
  leftTab: 'scenarios',
  drawer: null,
  leftOpen: true,
  rightOpen: true,
  bottomOpen: false,
  layers: { ...DEFAULT_LAYERS },
  live: { t: epoch, A: null, B: null, selected: null, visible: 0, mode: 'instant' },
  clock: { t: epoch, multiplier: 10, playing: true },
  toast: null,

  set: (p) => set(p as Partial<State>),
  updateConstellation: (id, p) => {
    set({ constellations: get().constellations.map((c) => (c.id === id ? { ...c, ...p } : c)) });
    if ('enabled' in p || 'source' in p || 'propagator' in p) get().rebuildSats();
  },
  addConstellation: (c, p) => {
    set({ constellations: [...get().constellations, c], payloads: p ? [...get().payloads, p] : get().payloads });
    get().rebuildSats();
  },
  removeConstellation: (id) => {
    set({ constellations: get().constellations.filter((c) => c.id !== id) });
    get().rebuildSats();
  },
  updatePayload: (id, p) => set({ payloads: get().payloads.map((x) => (x.id === id ? p : x)), satsVersion: get().satsVersion + 1 }),
  addPayload: (p) => set({ payloads: [...get().payloads, p], selectedPayloadId: p.id }),
  updateTerminal: (p) => {
    set({ terminals: get().terminals.map((t) => (t.id === get().activeTerminalId ? { ...t, ...p } : t)) });
    if ('lat' in p || 'lon' in p) followTerminal();
  },
  addTerminal: (t) => set({ terminals: [...get().terminals, t], activeTerminalId: t.id }),
  rebuildSats: () => {
    followTerminal(false);
    const sats = buildSatellites(get().constellations, get().epochMs);
    set({ sats, satsVersion: get().satsVersion + 1 });
  },
  runSim: (startMs) => {
    const s = get();
    const terminal = s.terminals.find((t) => t.id === s.activeTerminalId)!;
    worker?.terminate();
    worker = new Worker(new URL('../core/sim/sim.worker.ts', import.meta.url), { type: 'module' });
    const req: SimRequest = {
      constellations: s.constellations, payloads: s.payloads, terminal, analysis: s.analysis, mbb: s.mbb,
      epochMs: s.epochMs, startMs: startMs ?? s.clock.t, gridsBase: new URL('itu/', document.baseURI).href,
    };
    set({ simRunning: true, simProgress: 0, simError: null });
    worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === 'progress') set({ simProgress: m.value });
      else if (m.type === 'done') { set({ sim: m.result, simRunning: false, simProgress: 1, simStale: false }); worker?.terminate(); worker = null; }
      else if (m.type === 'error') { set({ simRunning: false, simError: m.message }); worker?.terminate(); worker = null; }
    };
    worker.postMessage(req);
  },
  exportScenario: () => {
    const s = get();
    return { version: 1, name: s.name, constellations: s.constellations, payloads: s.payloads, terminals: s.terminals, activeTerminalId: s.activeTerminalId, analysis: s.analysis, mbb: s.mbb };
  },
  importScenario: (f) => {
    set({
      name: f.name, constellations: f.constellations, payloads: f.payloads, terminals: f.terminals, activeTerminalId: f.activeTerminalId,
      analysis: { ...DEFAULT_ANALYSIS, ...f.analysis }, mbb: { ...DEFAULT_MBB, ...f.mbb }, sim: null, selectedPayloadId: f.payloads[0]?.id ?? '',
    });
    get().rebuildSats();
  },
  notify: (msg) => {
    clearTimeout(toastTimer);
    set({ toast: msg });
    toastTimer = setTimeout(() => set({ toast: null }), 4000);
  },
}));

/**
 * Keep "follow terminal" systems locked onto the terminal: the GEO wide-beam slot moves to the
 * terminal's longitude and its beam aims at the terminal.
 */
function followTerminal(rebuild = true) {
  const s = useStore.getState();
  const t = s.terminals.find((x) => x.id === s.activeTerminalId) ?? s.terminals[0];
  if (!t) return;
  let changed = false;
  const lon = Math.round(t.lon);
  const constellations = s.constellations.map((c) => {
    if (!c.followTerminal || c.source.kind !== 'geo' || c.source.slots[0]?.lon === lon) return c;
    changed = true;
    return { ...c, source: { ...c.source, slots: c.source.slots.map((x, i) => (i === 0 ? { ...x, lon } : x)) } };
  });
  const payloads = s.payloads.map((p) => {
    if (p.layout.kind !== 'spot' || !p.layout.followTerminal || (p.layout.aimLat === t.lat && p.layout.aimLon === t.lon)) return p;
    changed = true;
    return { ...p, layout: { ...p.layout, aimLat: t.lat, aimLon: t.lon } };
  });
  if (!changed) return;
  useStore.setState({ constellations, payloads, satsVersion: s.satsVersion + 1 });
  if (rebuild) useStore.setState({ sats: buildSatellites(constellations, s.epochMs) });
}

// Persist scenario edits (debounced); storage may be unavailable.
let saveTimer: ReturnType<typeof setTimeout> | undefined;
useStore.subscribe((s, prev) => {
  if (s.constellations === prev.constellations && s.payloads === prev.payloads && s.terminals === prev.terminals && s.analysis === prev.analysis && s.mbb === prev.mbb && s.name === prev.name && s.activeTerminalId === prev.activeTerminalId) return;
  if (s.sim && !s.simStale && s.sim === prev.sim) useStore.setState({ simStale: true });
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(useStore.getState().exportScenario())); } catch { /* ignore */ }
  }, 500);
});

export const resetScenario = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  useStore.getState().importScenario({
    version: 1, name: 'Multi-orbit scenario', constellations: clone(CONSTELLATIONS), payloads: clone(PAYLOADS), terminals: clone(TERMINALS),
    activeTerminalId: TERMINALS[0].id, analysis: DEFAULT_ANALYSIS, mbb: DEFAULT_MBB,
  });
};

export const activeTerminal = (s: State) => s.terminals.find((t) => t.id === s.activeTerminalId) ?? s.terminals[0];

if (typeof window !== 'undefined') (window as unknown as { __store: typeof useStore }).__store = useStore;
