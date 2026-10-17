/**
 * Preset constellations, payloads and terminals.
 *
 * Orbital shells follow public FCC/ITU filings. Payload RF figures are
 * representative values reconstructed from public filings, papers and
 * operator statements; they are starting points meant to be edited.
 */
import type { Constellation, Payload, Terminal, MbbSettings, AnalysisSettings } from '../core/model';

export const PAYLOADS: Payload[] = [
  {
    id: 'pl-starlink-ku', name: 'Starlink-class Ku phased array', architecture: 'bent-pipe', band: 'Ku',
    forward: { freqGHz: 11.7, bandwidthMHz: 250, rolloff: 0.1, pol: 'RHCP', eirpPeakDbw: 37.0, oboDb: 1.0, cimDb: 22 },
    ret: { freqGHz: 14.25, bandwidthMHz: 62.5, rolloff: 0.1, pol: 'LHCP', gtPeakDbK: 8.0 },
    feeder: { fwdCnDb: 22, rtnCnDb: 20 },
    pattern: { kind: 'phased-array', hpbwDeg: 2.5, sidelobeDb: -20, scanLossExp: 1.2, maxScanDeg: 60 },
    layout: { kind: 'steerable-cells', cellDiameterKm: 24, reuseColors: 4, beamsPerSat: 48, coChannelLoad: 0.5, minSepBeamwidths: 1.6 },
    casiDb: 25, xpolIsoDb: 25, minElevationDeg: 25, maxBeamThroughputGbps: 0.8,
    notes: 'Electronically steered Ku beams hopping over ~24 km hexagonal service cells. Starlink uses its own OFDM waveform; DVB-S2X ACM is used here as a performance proxy.',
  },
  {
    id: 'pl-oneweb-ku', name: 'OneWeb-class Ku fixed strip beams', architecture: 'bent-pipe', band: 'Ku',
    forward: { freqGHz: 11.7, bandwidthMHz: 250, rolloff: 0.1, pol: 'RHCP', eirpPeakDbw: 34.6, oboDb: 1.0, cimDb: 20 },
    ret: { freqGHz: 14.25, bandwidthMHz: 20, rolloff: 0.1, pol: 'LHCP', gtPeakDbK: -4.0 },
    feeder: { fwdCnDb: 20, rtnCnDb: 18 },
    pattern: { kind: 'gaussian', hpbwDeg: 3, sidelobeDb: -30, scanLossExp: 0, maxScanDeg: 60 },
    layout: { kind: 'fixed-strips', count: 16, alongTrackDeg: 3, crossTrackDeg: 48, reuseColors: 2, boresightTiltDeg: 0 },
    casiDb: 22, xpolIsoDb: 22, minElevationDeg: 15, maxBeamThroughputGbps: 0.5,
    notes: '16 identical, fixed, highly elliptical Ku user beams (≈48°×3° at −3 dB) stacked along-track – a ~1,080 km "push-broom" footprint swept by the satellite motion.',
  },
  {
    id: 'pl-kuiper-ka', name: 'Kuiper-class Ka phased array', architecture: 'bent-pipe', band: 'Ka',
    forward: { freqGHz: 19.0, bandwidthMHz: 400, rolloff: 0.1, pol: 'RHCP', eirpPeakDbw: 40.0, oboDb: 1.0, cimDb: 22 },
    ret: { freqGHz: 28.5, bandwidthMHz: 50, rolloff: 0.1, pol: 'LHCP', gtPeakDbK: 9.0 },
    feeder: { fwdCnDb: 22, rtnCnDb: 20 },
    pattern: { kind: 'phased-array', hpbwDeg: 2.0, sidelobeDb: -22, scanLossExp: 1.2, maxScanDeg: 58 },
    layout: { kind: 'steerable-cells', cellDiameterKm: 22, reuseColors: 4, beamsPerSat: 64, coChannelLoad: 0.5, minSepBeamwidths: 1.6 },
    casiDb: 25, xpolIsoDb: 25, minElevationDeg: 35, maxBeamThroughputGbps: 1.2,
    notes: 'Ka-band user links (17.7–20.2 GHz down / 27.5–30 GHz up) with electronically steered spot beams.',
  },
  {
    id: 'pl-lightspeed-ka', name: 'Lightspeed-class Ka regenerative', architecture: 'regenerative', band: 'Ka',
    forward: { freqGHz: 19.2, bandwidthMHz: 500, rolloff: 0.1, pol: 'RHCP', eirpPeakDbw: 44.0, oboDb: 1.0, cimDb: 24 },
    ret: { freqGHz: 29.0, bandwidthMHz: 100, rolloff: 0.1, pol: 'LHCP', gtPeakDbK: 11.0 },
    feeder: { fwdCnDb: 20, rtnCnDb: 20 },
    pattern: { kind: 'phased-array', hpbwDeg: 1.6, sidelobeDb: -22, scanLossExp: 1.2, maxScanDeg: 62 },
    layout: { kind: 'steerable-cells', cellDiameterKm: 30, reuseColors: 3, beamsPerSat: 135, coChannelLoad: 0.5, minSepBeamwidths: 1.6 },
    casiDb: 25, xpolIsoDb: 25, minElevationDeg: 10, maxBeamThroughputGbps: 2,
    notes: 'Direct radiating arrays with on-board digital processing (regenerative): uplink and downlink budgets decouple.',
  },
  {
    id: 'pl-mpower-ka', name: 'O3b mPOWER-class Ka MEO', architecture: 'bent-pipe', band: 'Ka',
    forward: { freqGHz: 19.0, bandwidthMHz: 500, rolloff: 0.05, pol: 'RHCP', eirpPeakDbw: 56.0, oboDb: 1.5, cimDb: 20 },
    ret: { freqGHz: 28.8, bandwidthMHz: 100, rolloff: 0.05, pol: 'LHCP', gtPeakDbK: 14.0 },
    feeder: { fwdCnDb: 22, rtnCnDb: 20 },
    pattern: { kind: 'phased-array', hpbwDeg: 0.6, sidelobeDb: -22, scanLossExp: 1.1, maxScanDeg: 26 },
    layout: { kind: 'steerable-cells', cellDiameterKm: 120, reuseColors: 4, beamsPerSat: 5000, coChannelLoad: 0.7, minSepBeamwidths: 1.6 },
    casiDb: 24, xpolIsoDb: 25, minElevationDeg: 10, maxBeamThroughputGbps: 10,
    notes: 'Fully digital, electronically steered beams (thousands per satellite) from 8,062 km equatorial MEO; ~150 ms RTT.',
  },
  {
    id: 'pl-geo-ka-eu', name: 'GEO Ka-HTS multibeam (Europe)', architecture: 'bent-pipe', band: 'Ka',
    forward: { freqGHz: 19.95, bandwidthMHz: 237, rolloff: 0.2, pol: 'LHCP', eirpPeakDbw: 60.0, oboDb: 1.0, cimDb: 18 },
    ret: { freqGHz: 29.75, bandwidthMHz: 20, rolloff: 0.2, pol: 'RHCP', gtPeakDbK: 18.0 },
    feeder: { fwdCnDb: 22, rtnCnDb: 22 },
    pattern: { kind: 'bessel', hpbwDeg: 0.42, sidelobeDb: -25, scanLossExp: 0, maxScanDeg: 9 },
    layout: { kind: 'hex-grid', aimLat: 47, aimLon: 10, spacingDeg: 0.38, rings: 6, reuseColors: 4 },
    casiDb: 22, xpolIsoDb: 27, minElevationDeg: 5, maxBeamThroughputGbps: 0.9,
    notes: '127 spot beams (~250 km) in a 4-colour (2 frequencies × 2 polarisations) reuse pattern. Replace with operator KML contours for exact EIRP.',
  },
  {
    id: 'pl-geo-ka-am', name: 'GEO Ka-HTS multibeam (Americas/Atlantic)', architecture: 'bent-pipe', band: 'Ka',
    forward: { freqGHz: 19.95, bandwidthMHz: 250, rolloff: 0.1, pol: 'LHCP', eirpPeakDbw: 61.0, oboDb: 1.0, cimDb: 18 },
    ret: { freqGHz: 29.75, bandwidthMHz: 40, rolloff: 0.1, pol: 'RHCP', gtPeakDbK: 18.0 },
    feeder: { fwdCnDb: 22, rtnCnDb: 22 },
    pattern: { kind: 'bessel', hpbwDeg: 0.5, sidelobeDb: -25, scanLossExp: 0, maxScanDeg: 9 },
    layout: { kind: 'hex-grid', aimLat: 12, aimLon: -60, spacingDeg: 0.45, rings: 8, reuseColors: 4 },
    casiDb: 22, xpolIsoDb: 27, minElevationDeg: 5, maxBeamThroughputGbps: 1,
    notes: '~200 Ka spot beams with a digital channeliser (SES-17-class) serving aero & maritime routes.',
  },
  {
    id: 'pl-geo-ku-wide', name: 'GEO Ku wide beam (follows terminal)', architecture: 'bent-pipe', band: 'Ku',
    forward: { freqGHz: 11.7, bandwidthMHz: 36, rolloff: 0.2, pol: 'H', eirpPeakDbw: 52.0, oboDb: 3.0, cimDb: 18 },
    ret: { freqGHz: 14.25, bandwidthMHz: 4, rolloff: 0.2, pol: 'V', gtPeakDbK: 4.0 },
    feeder: { fwdCnDb: 25, rtnCnDb: 25 },
    pattern: { kind: 's672', hpbwDeg: 6.0, sidelobeDb: -25, scanLossExp: 0, maxScanDeg: 9 },
    layout: { kind: 'spot', aimLat: 38, aimLon: 24, followTerminal: true },
    casiDb: 20, xpolIsoDb: 30, minElevationDeg: 5, maxBeamThroughputGbps: 0.15,
    notes: 'Regional Ku wide beam (~4,000 km). By default it aims at the terminal (switch off ‘Aim follows the terminal’ to point it anywhere).',
  },
];

const now = () => Date.now();

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'starlink', name: 'Starlink Gen1', operator: 'SpaceX', orbitClass: 'LEO', color: '#e8eef7', enabled: true, payloadId: 'pl-starlink-ku',
    showOrbits: false, showCoverage: false, showLabels: false, propagator: 'kepler-j2',
    description: 'Five Gen1 shells (4,408 satellites, 540–570 km). Ku user links, Ka/E gateways, laser ISLs.',
    source: {
      kind: 'walker', shells: [
        { altitudeKm: 550, inclinationDeg: 53.0, planes: 72, satsPerPlane: 22, phasing: 39, pattern: 'delta' },
        { altitudeKm: 540, inclinationDeg: 53.2, planes: 72, satsPerPlane: 22, phasing: 39, pattern: 'delta', raan0Deg: 2.5 },
        { altitudeKm: 570, inclinationDeg: 70.0, planes: 36, satsPerPlane: 20, phasing: 11, pattern: 'delta' },
        { altitudeKm: 560, inclinationDeg: 97.6, planes: 6, satsPerPlane: 58, phasing: 1, pattern: 'delta' },
        { altitudeKm: 560, inclinationDeg: 97.6, planes: 4, satsPerPlane: 43, phasing: 1, pattern: 'delta', raan0Deg: 30 },
      ],
    },
  },
  {
    id: 'oneweb', name: 'OneWeb Gen1', operator: 'Eutelsat OneWeb', orbitClass: 'LEO', color: '#ff9f43', enabled: true, payloadId: 'pl-oneweb-ku',
    showOrbits: false, showCoverage: false, showLabels: false, propagator: 'kepler-j2',
    description: '588 satellites in 12 near-polar planes at 1,200 km (87.9°).',
    source: { kind: 'walker', shells: [{ altitudeKm: 1200, inclinationDeg: 87.9, planes: 12, satsPerPlane: 49, phasing: 1, pattern: 'star' }] },
  },
  {
    id: 'kuiper', name: 'Amazon Kuiper', operator: 'Amazon', orbitClass: 'LEO', color: '#4cc9f0', enabled: false, payloadId: 'pl-kuiper-ka',
    showOrbits: false, showCoverage: false, showLabels: false, propagator: 'kepler-j2',
    description: 'FCC-authorised 3,236 satellites in three shells (590–630 km). Ka-band user links.',
    source: {
      kind: 'walker', shells: [
        { altitudeKm: 630, inclinationDeg: 51.9, planes: 34, satsPerPlane: 34, phasing: 1, pattern: 'delta' },
        { altitudeKm: 610, inclinationDeg: 42.0, planes: 36, satsPerPlane: 36, phasing: 1, pattern: 'delta' },
        { altitudeKm: 590, inclinationDeg: 33.0, planes: 28, satsPerPlane: 28, phasing: 1, pattern: 'delta' },
      ],
    },
  },
  {
    id: 'lightspeed', name: 'Telesat Lightspeed', operator: 'Telesat', orbitClass: 'LEO', color: '#b388ff', enabled: false, payloadId: 'pl-lightspeed-ka',
    showOrbits: false, showCoverage: false, showLabels: false, propagator: 'kepler-j2',
    description: '198 satellites: 78 polar (1,015 km) + 120 inclined (1,325 km). Regenerative Ka payload, optical ISLs.',
    source: {
      kind: 'walker', shells: [
        { altitudeKm: 1015, inclinationDeg: 98.98, planes: 6, satsPerPlane: 13, phasing: 1, pattern: 'star' },
        { altitudeKm: 1325, inclinationDeg: 50.88, planes: 20, satsPerPlane: 6, phasing: 1, pattern: 'delta' },
      ],
    },
  },
  {
    id: 'mpower', name: 'O3b mPOWER', operator: 'SES', orbitClass: 'MEO', color: '#06d6a0', enabled: true, payloadId: 'pl-mpower-ka',
    showOrbits: true, showCoverage: false, showLabels: true, propagator: 'kepler-j2',
    description: 'Equatorial MEO at 8,062 km (13-satellite build-out). Thousands of steerable Ka beams per satellite.',
    source: { kind: 'walker', shells: [{ altitudeKm: 8062, inclinationDeg: 0.0, planes: 1, satsPerPlane: 13, phasing: 0, pattern: 'delta' }] },
  },
  {
    id: 'geo-hts', name: 'GEO Ka-HTS', operator: 'Generic HTS', orbitClass: 'GEO', color: '#ffd166', enabled: false, payloadId: 'pl-geo-ka-eu',
    showOrbits: true, showCoverage: false, showLabels: true, propagator: 'kepler-j2',
    description: 'Ka-band multibeam HTS at 9°E covering Europe (KA-SAT/KONNECT-class).',
    source: { kind: 'geo', slots: [{ name: 'Ka-HTS 9°E', lon: 9.0, inc: 0.05 }] },
  },
  {
    id: 'geo-hts-am', name: 'GEO Ka-HTS Americas', operator: 'Generic HTS', orbitClass: 'GEO', color: '#f4a261', enabled: false, payloadId: 'pl-geo-ka-am',
    showOrbits: true, showCoverage: false, showLabels: true, propagator: 'kepler-j2',
    description: 'Ka multibeam HTS at 67.1°W (SES-17-class) for aero/maritime.',
    source: { kind: 'geo', slots: [{ name: 'Ka-HTS 67.1°W', lon: -67.1, inc: 0.05 }] },
  },
  {
    id: 'geo-ku', name: 'GEO wide beam', operator: 'Generic FSS', orbitClass: 'GEO', color: '#ef476f', enabled: true, payloadId: 'pl-geo-ku-wide',
    showOrbits: true, showCoverage: false, showLabels: true, propagator: 'kepler-j2', followTerminal: true,
    description: 'Ku GEO with a ~6° wide beam. By default its slot follows the terminal’s longitude and the beam aims at the terminal; switch either off to place it yourself.',
    source: { kind: 'geo', slots: [{ name: 'GEO wide beam', lon: 24, inc: 0.05 }] },
  },
];

export const TERMINALS: Terminal[] = [
  {
    id: 'ut-dual-esa', name: 'Dual-beam Ku/Ka multi-orbit ESA', lat: 37.98, lon: 23.73, altM: 100, type: 'phased-array', beams: 2,
    bands: {
      Ku: { rxFreqGHz: [10.7, 12.75], txFreqGHz: [13.75, 14.5], rxGainDbi: 36.0, gtDbK: 12.0, eirpMaxDbw: 44.0 },
      Ka: { rxFreqGHz: [17.7, 21.2], txFreqGHz: [27.5, 31.0], rxGainDbi: 39.5, gtDbK: 14.0, eirpMaxDbw: 49.0 },
    },
    scanLossExpRx: 1.3, scanLossExpTx: 1.5, maxScanDeg: 70, panelTiltDeg: 0, panelAzDeg: 0,
    apertureM: 0.8, pointingLossDb: 0.2, radomeLossDb: 0.3, polLossDb: 0.1, implMarginDb: 0.5, txBackoffDb: 0, groundSpillK: 25,
  },
  {
    id: 'ut-starlink-std', name: 'Starlink-class standard UT (Ku)', lat: 37.98, lon: 23.73, altM: 100, type: 'phased-array', beams: 1,
    bands: { Ku: { rxFreqGHz: [10.7, 12.7], txFreqGHz: [14.0, 14.5], rxGainDbi: 34.0, gtDbK: 10.5, eirpMaxDbw: 38.2 } },
    scanLossExpRx: 1.2, scanLossExpTx: 1.4, maxScanDeg: 65, panelTiltDeg: 0, panelAzDeg: 0,
    apertureM: 0.5, pointingLossDb: 0.2, radomeLossDb: 0.2, polLossDb: 0.1, implMarginDb: 0.5, txBackoffDb: 0, groundSpillK: 25,
  },
  {
    id: 'ut-ka-vsat', name: '1.2 m Ka VSAT (parabolic, GEO)', lat: 37.98, lon: 23.73, altM: 100, type: 'parabolic', beams: 1,
    bands: { Ka: { rxFreqGHz: [19.2, 20.2], txFreqGHz: [29.0, 30.0], rxGainDbi: 46.0, gtDbK: 21.0, eirpMaxDbw: 52.0 } },
    scanLossExpRx: 0, scanLossExpTx: 0, maxScanDeg: 90, panelTiltDeg: 0, panelAzDeg: 0,
    apertureM: 1.2, pointingLossDb: 0.4, radomeLossDb: 0, polLossDb: 0.1, implMarginDb: 0.5, txBackoffDb: 0, groundSpillK: 15,
  },
  {
    id: 'ut-mega-ka', name: 'Enterprise Ka dual-beam ESA (MEO/GEO/LEO)', lat: 37.98, lon: 23.73, altM: 100, type: 'phased-array', beams: 2,
    bands: { Ka: { rxFreqGHz: [17.7, 21.2], txFreqGHz: [27.5, 31.0], rxGainDbi: 42.5, gtDbK: 17.0, eirpMaxDbw: 53.0 } },
    scanLossExpRx: 1.3, scanLossExpTx: 1.5, maxScanDeg: 70, panelTiltDeg: 0, panelAzDeg: 0,
    apertureM: 1.1, pointingLossDb: 0.2, radomeLossDb: 0.3, polLossDb: 0.1, implMarginDb: 0.5, txBackoffDb: 0, groundSpillK: 25,
  },
];

export const DEFAULT_MBB: MbbSettings = {
  policy: 'longest-visibility', orbitPolicy: 'leo-first', allowedConstellations: [], minElevationDeg: 25, handoverElevationDeg: 30,
  hysteresisDb: 2, overlapSec: 2, acquisitionSec: 1, stepSec: 2, durationMin: 20,
};

export const DEFAULT_ANALYSIS: AnalysisSettings = {
  availabilityPct: 99.5, includeGas: true, includeCloud: true, includeRain: true, includeScint: true, acmMarginDb: 0.5, direction: 'forward',
};

export const scenarioEpoch = now;
