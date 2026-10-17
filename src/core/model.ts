/**
 * Scenario data model shared by the engine, the store and the UI.
 * Every field is user editable from the payload / terminal editors.
 */
import type { WalkerShell } from './orbit/walker';

export type OrbitClass = 'LEO' | 'MEO' | 'GEO' | 'HEO';
export type Polarization = 'RHCP' | 'LHCP' | 'H' | 'V';
export type PatternKind = 'bessel' | 'gaussian' | 's672' | 'phased-array';

export interface BeamPattern {
  kind: PatternKind;
  hpbwDeg: number; // 3 dB beamwidth at boresight
  sidelobeDb: number; // near-in sidelobe level relative to peak (S.672 Ls / floor)
  scanLossExp: number; // gain ∝ cos^n(scan) for phased arrays
  maxScanDeg: number; // electronic steering limit (phased arrays)
}

export interface KmlContour {
  level: number; // dBW (absolute EIRP), dB/K (absolute G/T) or dB (relative)
  rings: [number, number][][]; // [lat, lon] rings (outer boundaries)
}

export interface BeamOverride { eirpOffsetDb?: number; off?: boolean; color?: number }

export interface KmlBeam {
  id: string;
  name: string;
  eirpOffsetDb?: number; // per-beam power adjustment
  off?: boolean; // beam switched off
  color: number; // frequency/polarisation colour index for C/I
  contours: KmlContour[]; // sorted descending by level
  centroid: [number, number];
}

export type ContourMeaning = 'absolute-eirp' | 'relative' | 'edge-only';

export type BeamLayout =
  | {
      kind: 'steerable-cells'; cellDiameterKm: number; reuseColors: number; beamsPerSat: number;
      /** Fraction of first-tier co-channel cells illuminated at the same time by the same satellite. */
      coChannelLoad?: number;
      /** Scheduler constraint: minimum co-channel beam separation in (scan-broadened) beamwidths. */
      minSepBeamwidths?: number;
    }
  | { kind: 'fixed-strips'; count: number; alongTrackDeg: number; crossTrackDeg: number; reuseColors: number; boresightTiltDeg: number }
  | { kind: 'hex-grid'; aimLat: number; aimLon: number; spacingDeg: number; rings: number; reuseColors: number; overrides?: Record<string, BeamOverride> }
  | { kind: 'spot'; aimLat: number; aimLon: number; followTerminal?: boolean }
  | { kind: 'kml'; beams: KmlBeam[]; meaning: ContourMeaning; edgeRelDb: number; sourceName: string; gtBeams?: KmlBeam[]; gtSourceName?: string };

export interface PayloadDirection {
  freqGHz: number;
  bandwidthMHz: number;
  rolloff: number;
  pol: Polarization;
}

export interface Payload {
  id: string;
  name: string;
  architecture: 'bent-pipe' | 'regenerative';
  band: string; // e.g. 'Ku', 'Ka'
  forward: PayloadDirection & {
    eirpPeakDbw: number; // per beam, saturated, at beam peak (boresight, no scan)
    oboDb: number; // output back-off
    cimDb: number; // C/IM of the satellite HPA
  };
  ret: PayloadDirection & {
    gtPeakDbK: number; // per beam at peak
  };
  feeder: { fwdCnDb: number; rtnCnDb: number }; // gateway uplink / downlink C/N contributions
  pattern: BeamPattern;
  layout: BeamLayout;
  casiDb: number; // C/ASI from adjacent systems
  xpolIsoDb: number; // antenna cross-pol isolation
  minElevationDeg: number;
  maxBeamThroughputGbps?: number; // informative
  notes?: string;
}

export type ConstellationSource =
  | { kind: 'walker'; shells: WalkerShell[] }
  | { kind: 'geo'; slots: { name: string; lon: number; inc?: number }[] }
  | { kind: 'tle'; text: string; label: string };

export interface Constellation {
  id: string;
  name: string;
  operator: string;
  orbitClass: OrbitClass;
  color: string;
  enabled: boolean;
  source: ConstellationSource;
  payloadId: string;
  showOrbits: boolean;
  showCoverage: boolean;
  showLabels: boolean;
  propagator: 'kepler-j2' | 'sgp4';
  description?: string;
  /** GEO slot longitude tracks the terminal's longitude (optional, switchable). */
  followTerminal?: boolean;
}

export interface TerminalBand {
  rxFreqGHz: [number, number];
  txFreqGHz: [number, number];
  rxGainDbi: number; // boresight receive gain
  gtDbK: number; // boresight clear-sky G/T (zenith)
  eirpMaxDbw: number; // boresight max EIRP
}

export interface Terminal {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altM: number;
  type: 'phased-array' | 'parabolic';
  beams: 1 | 2;
  bands: { Ku?: TerminalBand; Ka?: TerminalBand };
  // phased array
  scanLossExpRx: number;
  scanLossExpTx: number;
  maxScanDeg: number;
  panelTiltDeg: number; // 0 = flat/zenith facing
  panelAzDeg: number;
  // general
  apertureM: number; // equivalent diameter (scintillation, sizing)
  pointingLossDb: number;
  radomeLossDb: number;
  polLossDb: number;
  implMarginDb: number;
  txBackoffDb: number;
  groundSpillK: number; // ground/spillover noise added at low elevation
  /** Local horizon / obstruction mask: azimuth sectors blocked below an elevation. */
  obstructions?: Obstruction[];
}

export interface Obstruction { azFrom: number; azTo: number; elMax: number; label?: string }

/** True when the direction (az, el) is hidden by the terminal's obstruction mask. */
export function isObstructed(t: Pick<Terminal, 'obstructions'>, azDeg: number, elDeg: number): boolean {
  if (!t.obstructions?.length) return false;
  const az = ((azDeg % 360) + 360) % 360;
  return t.obstructions.some((o) => {
    const a = ((o.azFrom % 360) + 360) % 360, b = ((o.azTo % 360) + 360) % 360;
    const inSector = a <= b ? az >= a && az <= b : az >= a || az <= b;
    return inSector && elDeg < o.elMax;
  });
}

export type HandoverPolicy = 'max-elevation' | 'longest-visibility' | 'best-sinr';
export type OrbitPolicy = 'leo-first' | 'geo-leo-dual' | 'single' | 'best-throughput' | 'dedicated';

/** Dual-beam terminal with dedicated beams: the constellations each beam may use (empty = any). */
export interface BeamAssignment { A: string[]; B: string[] }

export interface BeamCfg {
  on: boolean;
  systems: string[];
  satId: string | null;
  policy: HandoverPolicy;
  minElevationDeg: number;
  handoverElevationDeg: number;
}

export interface MbbSettings {
  policy: HandoverPolicy;
  orbitPolicy: OrbitPolicy;
  allowedConstellations: string[]; // empty = all enabled
  /** Used when orbitPolicy is 'dedicated': which systems beam A and beam B may track (older format). */
  beamAssign?: BeamAssignment;
  /** Per-beam settings (see core/sim/beamplan.ts); unset fields fall back to the scenario-wide values. */
  beamCfg?: { A?: Partial<BeamCfg>; B?: Partial<BeamCfg> };
  /** Which beam carries the traffic when both are locked: the better one, A, B, or both bonded. */
  traffic?: 'best' | 'A' | 'B' | 'bonded';
  minElevationDeg: number; // terminal-side
  handoverElevationDeg: number; // trigger when serving falls below
  hysteresisDb: number;
  overlapSec: number; // make-before-break overlap
  acquisitionSec: number; // time to acquire/lock beam B
  stepSec: number;
  durationMin: number;
}

export interface AnalysisSettings {
  availabilityPct: number; // e.g. 99.5
  includeGas: boolean;
  includeCloud: boolean;
  includeRain: boolean;
  includeScint: boolean;
  R001Override?: number;
  acmMarginDb: number;
  direction: 'forward' | 'return';
  /** What-if: instantaneous rain rate at the terminal [mm/h]; 0 = clear sky. Applied to the "current" columns. */
  liveRainMmH?: number;
}
