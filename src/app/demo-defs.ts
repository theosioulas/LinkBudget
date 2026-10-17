import type { MbbSettings, Obstruction } from '../core/model';

/** Scenario templates. `enable` lists the systems included in the scenario. */
export interface Demo {
  id: string;
  name: string;
  description: string;
  systems: string;
  enable: string[];
  mbb: Partial<MbbSettings>;
  beams?: 1 | 2;
  obstructions?: Obstruction[];
}

const GEO = 'geo-ku';

export const DEMOS: Demo[] = [
  {
    id: 'multi-orbit', name: 'Multi-orbit', systems: 'Starlink · OneWeb · O3b mPOWER · GEO',
    description: 'LEO first, falling back to MEO and the GEO wide beam. Dual-beam make-before-break.',
    enable: ['starlink', 'oneweb', 'mpower', GEO],
    mbb: { allowedConstellations: [], orbitPolicy: 'leo-first', policy: 'longest-visibility', durationMin: 20, stepSec: 2 }, beams: 2, obstructions: [],
  },
  {
    id: 'leo-mbb', name: 'LEO make-before-break', systems: 'Starlink · GEO',
    description: 'Handovers between Starlink satellites every few minutes with zero interruption.',
    enable: ['starlink', GEO],
    mbb: { allowedConstellations: ['starlink', GEO], orbitPolicy: 'leo-first', policy: 'longest-visibility', durationMin: 20, stepSec: 2 }, beams: 2, obstructions: [],
  },
  {
    id: 'canyon', name: 'Urban canyon', systems: 'OneWeb · O3b mPOWER · GEO',
    description: 'East and west sky blocked below 60°. Traffic moves LEO → MEO → GEO and back without dropping.',
    enable: ['oneweb', 'mpower', GEO],
    mbb: { allowedConstellations: ['oneweb', 'mpower', GEO], orbitPolicy: 'leo-first', policy: 'longest-visibility', durationMin: 60, stepSec: 4 }, beams: 2,
    obstructions: [{ azFrom: 30, azTo: 150, elMax: 60 }, { azFrom: 210, azTo: 330, elMax: 60 }],
  },
  {
    id: 'geo-leo', name: 'GEO + LEO together', systems: 'Starlink · GEO',
    description: 'Dedicated beams: beam A stays on the GEO wide beam, beam B tracks Starlink. Traffic rides the better beam; GEO covers the LEO re-points.',
    enable: ['starlink', GEO],
    mbb: { allowedConstellations: [], orbitPolicy: 'dedicated', beamAssign: { A: [GEO], B: ['starlink'] }, policy: 'longest-visibility', durationMin: 20, stepSec: 2 }, beams: 2, obstructions: [],
  },
  {
    id: 'meo', name: 'MEO (6 hours)', systems: 'O3b mPOWER · GEO',
    description: 'Long passes from 8,062 km and only a handful of handovers.',
    enable: ['mpower', GEO],
    mbb: { allowedConstellations: ['mpower', GEO], orbitPolicy: 'leo-first', policy: 'longest-visibility', minElevationDeg: 10, handoverElevationDeg: 15, durationMin: 360, stepSec: 30 }, beams: 2, obstructions: [],
  },
  {
    id: 'oneweb', name: 'OneWeb fixed beams', systems: 'OneWeb · GEO',
    description: 'Watch the signal ripple as the 16 fixed beams of each satellite sweep over the terminal.',
    enable: ['oneweb', GEO],
    mbb: { allowedConstellations: ['oneweb', GEO], orbitPolicy: 'leo-first', policy: 'longest-visibility', durationMin: 15, stepSec: 1 }, beams: 2, obstructions: [],
  },
  {
    id: 'single', name: 'Single-beam terminal', systems: 'Starlink · GEO',
    description: 'The same LEO run with one beam: every handover costs the acquisition time.',
    enable: ['starlink', GEO],
    mbb: { allowedConstellations: ['starlink', GEO], orbitPolicy: 'leo-first', policy: 'longest-visibility', durationMin: 20, stepSec: 1, acquisitionSec: 2 }, beams: 1, obstructions: [],
  },
];
