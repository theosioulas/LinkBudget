import type { MbbSettings, Obstruction } from '../core/model';

/** Scenario templates. `enable` lists the systems included in the scenario; `mbb` holds the beam plan. */
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

const ded = (A: string[], B: string[], traffic: 'best' | 'A' | 'B' | 'bonded', extra: Partial<MbbSettings> = {}): Partial<MbbSettings> => ({
  allowedConstellations: [], orbitPolicy: 'dedicated', policy: 'longest-visibility', traffic,
  beamCfg: { A: { on: true, systems: A, satId: null }, B: { on: true, systems: B, satId: null } }, durationMin: 20, stepSec: 2, ...extra,
});

export const DEMOS: Demo[] = [
  {
    id: 'multi-orbit', name: 'GEO + multi-orbit', systems: 'A: GEO wide beam · B: Starlink / OneWeb / O3b mPOWER',
    description: 'Beam A holds the GEO wide beam; beam B tracks whichever LEO or MEO satellite lasts longest. Traffic rides the faster beam.',
    enable: ['starlink', 'oneweb', 'mpower', GEO], beams: 2, obstructions: [],
    mbb: ded([GEO], ['starlink', 'oneweb', 'mpower'], 'best'),
  },
  {
    id: 'geo-leo', name: 'GEO + Starlink', systems: 'A: GEO wide beam · B: Starlink',
    description: 'Traffic on Starlink (beam B); the GEO beam carries it while B re-points to the next satellite.',
    enable: ['starlink', GEO], beams: 2, obstructions: [],
    mbb: ded([GEO], ['starlink'], 'B'),
  },
  {
    id: 'oneweb', name: 'GEO + OneWeb', systems: 'A: GEO wide beam · B: OneWeb',
    description: 'OneWeb’s 16 fixed strip beams sweep over the terminal; traffic rides whichever beam is faster.',
    enable: ['oneweb', GEO], beams: 2, obstructions: [],
    mbb: ded([GEO], ['oneweb'], 'best', { durationMin: 15, stepSec: 1 }),
  },
  {
    id: 'meo', name: 'GEO + MEO bonded', systems: 'A: GEO wide beam · B: O3b mPOWER',
    description: 'Both beams carry traffic at once (bonded): GEO plus long MEO passes from 8,062 km over 6 hours.',
    enable: ['mpower', GEO], beams: 2, obstructions: [],
    mbb: ded([GEO], ['mpower'], 'bonded', { minElevationDeg: 10, handoverElevationDeg: 15, durationMin: 360, stepSec: 30 }),
  },
  {
    id: 'ka-hts', name: 'Ka: GEO HTS + Kuiper', systems: 'A: GEO Ka-HTS multibeam · B: Amazon Kuiper',
    description: 'A Ka-band pairing: a GEO high-throughput multibeam satellite on beam A and Kuiper on beam B.',
    enable: ['geo-hts', 'kuiper'], beams: 2, obstructions: [],
    mbb: ded(['geo-hts'], ['kuiper'], 'best'),
  },
  {
    id: 'canyon', name: 'Urban canyon', systems: 'A: GEO wide beam · B: OneWeb / O3b mPOWER',
    description: 'East and west sky blocked below 60°. Beam B finds LEO and MEO satellites in the gaps; GEO to the south covers the rest.',
    enable: ['oneweb', 'mpower', GEO], beams: 2,
    obstructions: [{ azFrom: 30, azTo: 150, elMax: 60 }, { azFrom: 210, azTo: 330, elMax: 60 }],
    mbb: ded([GEO], ['oneweb', 'mpower'], 'best', { durationMin: 60, stepSec: 4 }),
  },
  {
    id: 'leo-mbb', name: 'LEO make-before-break', systems: 'A + B shared: Starlink',
    description: 'Both beams on Starlink: the free beam locks the next satellite before the serving one is lost, so handovers never interrupt.',
    enable: ['starlink', GEO], beams: 2, obstructions: [],
    mbb: { allowedConstellations: [], orbitPolicy: 'leo-first', policy: 'longest-visibility', beamCfg: { A: { on: true, systems: ['starlink'] }, B: { on: true, systems: ['starlink'] } }, durationMin: 20, stepSec: 2 },
  },
  {
    id: 'single', name: 'Single-beam terminal', systems: 'One beam: Starlink, GEO fallback',
    description: 'The same LEO case with one beam: every handover costs the acquisition time; GEO is used when no LEO is usable.',
    enable: ['starlink', GEO], beams: 1, obstructions: [],
    mbb: { allowedConstellations: [], orbitPolicy: 'leo-first', policy: 'longest-visibility', beamCfg: { A: { on: true, systems: ['starlink', GEO] }, B: { on: false } }, durationMin: 20, stepSec: 1, acquisitionSec: 2 },
  },
];
