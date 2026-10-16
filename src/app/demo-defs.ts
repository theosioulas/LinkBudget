import type { MbbSettings, Obstruction } from '../core/model';

export interface Demo {
  id: string;
  name: string;
  description: string;
  enable: string[];
  mbb: Partial<MbbSettings>;
  beams?: 1 | 2;
  obstructions?: Obstruction[];
}

export const DEMOS: Demo[] = [
  {
    id: 'leo-mbb', name: 'LEO ↔ LEO make-before-break (Starlink)', enable: ['starlink'],
    description: 'Dual-beam ESA hands over between Starlink satellites every few minutes with zero interruption.',
    mbb: { allowedConstellations: ['starlink'], orbitPolicy: 'leo-first', policy: 'longest-visibility', durationMin: 20, stepSec: 2 }, beams: 2, obstructions: [],
  },
  {
    id: 'canyon', name: 'Multi-orbit MBB in an urban canyon (OneWeb + MEO + GEO)', enable: ['oneweb', 'mpower', 'geo-hts'],
    description: 'East and west sky blocked below 60°: LEO-first policy falls back to O3b mPOWER and GEO whenever no OneWeb satellite is visible, without dropping traffic.',
    mbb: { allowedConstellations: ['oneweb', 'mpower', 'geo-hts'], orbitPolicy: 'leo-first', policy: 'longest-visibility', durationMin: 60, stepSec: 4 }, beams: 2,
    obstructions: [{ azFrom: 30, azTo: 150, elMax: 60 }, { azFrom: 210, azTo: 330, elMax: 60 }],
  },
  {
    id: 'geo-leo', name: 'GEO anchor + LEO (dual-orbit, both beams active)', enable: ['starlink', 'geo-hts'],
    description: 'Beam A stays on the GEO Ka-HTS, beam B tracks LEO satellites; traffic rides LEO for latency and GEO covers the LEO re-points.',
    mbb: { allowedConstellations: ['starlink', 'geo-hts'], orbitPolicy: 'geo-leo-dual', policy: 'longest-visibility', durationMin: 20, stepSec: 2 }, beams: 2, obstructions: [],
  },
  {
    id: 'meo', name: 'MEO make-before-break (O3b mPOWER, 6 h)', enable: ['mpower'],
    description: 'Long passes from 8,062 km: a handful of MEO handovers over six hours.',
    mbb: { allowedConstellations: ['mpower'], orbitPolicy: 'single', policy: 'longest-visibility', minElevationDeg: 10, handoverElevationDeg: 15, durationMin: 360, stepSec: 30 }, beams: 2, obstructions: [],
  },
  {
    id: 'oneweb', name: 'OneWeb push-broom beams (1 s resolution)', enable: ['oneweb'],
    description: 'Watch the Es/N0 ripple as the terminal crosses the 16 fixed beams of each satellite, plus satellite handovers.',
    mbb: { allowedConstellations: ['oneweb'], orbitPolicy: 'single', policy: 'longest-visibility', durationMin: 15, stepSec: 1 }, beams: 2, obstructions: [],
  },
  {
    id: 'single', name: 'Single-beam terminal: break-before-make outage', enable: ['starlink'],
    description: 'Same LEO run with one beam: every handover costs the acquisition time.',
    mbb: { allowedConstellations: ['starlink'], orbitPolicy: 'leo-first', policy: 'longest-visibility', durationMin: 20, stepSec: 1, acquisitionSec: 2 }, beams: 1, obstructions: [],
  },
];
