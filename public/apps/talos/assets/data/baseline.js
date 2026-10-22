/* TALOS mission baseline — the single source of truth for numbers quoted across the study.
   TALOS: study codename (the bronze guardian who circled Crete three times a day).
   All values are design-level assumptions derived from the research notes (research/01–05) and are
   marked with their basis. Change here → every calculator and page that references BASELINE follows. */
window.BASELINE = {
  codename: 'TALOS',
  satName: 'TALOS-1',
  version: 'Baseline v0.3 — 21 Oct 2026',
  orbit: {
    altKm: 530, incDeg: 53, altOptions: [450, 500, 530, 550, 600],
    rationale: '530 km / 53° maximises passes over the Eastern Mediterranean, Aegean, Black Sea and Middle East (regional persistence) while keeping drag make-up and 5-year disposal ΔV modest. SSO 97.5° is the alternative if the first launch must ride a Transporter mission; it costs ~40% of mid-latitude revisit but gives polar ground-station contacts every orbit.',
    ssoAlt: 530, lifetimeYears: 5, designLifeYears: 3,
  },
  mass: { // kg — computed live from COMPONENTS (components.js); these are the roll-up targets
    launchMax: 150, marginPct: 20,
    note: 'Core TALOS-1 (no options) ≈ 87 kg dry + 20% system margin ≈ 104 kg; with reflector, ML co-processor and ISL ≈ 93 kg + margin ≈ 112 kg. The 150 kg allocation leaves ~35–45 kg for a larger reflector, more propellant, bigger arrays or a second RFSoC.',
  },
  power: { // W
    modes: { // payload/bus figures roll up from COMPONENTS; heaters add ~10–20 W bus in eclipse
      collect: { name: 'Collection (payload on, no downlink)', payload: 124, bus: 60, downlink: 0 },
      collectDownlink: { name: 'Collection + X-band downlink', payload: 124, bus: 60, downlink: 45 },
      standby: { name: 'Standby / safe', payload: 20, bus: 50, downlink: 0 },
      thrust: { name: 'Orbit maintenance (thruster on)', payload: 20, bus: 60, downlink: 0, prop: 110 },
    },
    arrayBolW: 620, arrayEolW: 540, batteryWh: 420, dodMax: 0.3,
    cellEff: 0.30, arrayAreaM2: 1.9, packingFactor: 0.85,
    basis: 'Payload 90–160 W collecting (research 03 §4.4); bus 60–100 W (research 02 §H); deployable wings with Azur 3G30/4G32 cells on DHV-class wings.',
  },
  payload: {
    bands: [
      { id: 'uhf', name: 'UHF', fMin: 225, fMax: 512, path: 'comms tuner / direct sampling', antennas: ['ant-uhf'], note: 'Tactical radios, TETRA, UHF SATCOM, military UAS GCS' },
      { id: 'l', name: 'L', fMin: 960, fMax: 1700, path: 'comms tuner, 200 MHz agile; optional whole-band direct sampling', antennas: ['ant-wb', 'ant-df'], note: 'Link-16, IFF/ADS-B, GNSS jammers, L-MSS, AEW L-band' },
      { id: 's', name: 'S', fMin: 2000, fMax: 4000, path: 'block downconvert → RFSoC', antennas: ['ant-df', 'ant-sarr'], note: 'AEW&C, naval surveillance radars, air-defence S-band' },
      { id: 'c', name: 'C', fMin: 4000, fMax: 8000, path: '2 × 2 GHz blocks → RFSoC', antennas: ['ant-df'], note: 'Patriot-class C-band, C-VSAT, 5.8 GHz links' },
      { id: 'x', name: 'X', fMin: 8000, fMax: 12000, path: '2 × 2 GHz blocks → RFSoC (receive blanked during own downlink)', antennas: ['ant-df', 'ant-xarr'], note: 'Naval & coastal radars, fire-control, mil-SATCOM uplinks' },
    ],
    channels: { tuner: 4, tunerIbwMHz: 200, rfsoc: 8, rfsocGsps: 5, rfsocIbwMHz: 2000, adcBits: 14, enob: 9.5 },
    nfDb: 2.5, dynamicRangeTargetDb: 95,
    timing: { syncNs: 20, holdoverAdev1s: 3e-10, gnssPosM: 5, freqStability: 1e-11 },
    storageTB: 2, snapshotsPerOrbit: { comms: 2000, radar: 500 }, dataPerDayGB: 30,
    massKg: 24.4, massWithOptionsKg: 30.9, powerW: 124, powerWithOptionsW: 136,
  },
  comms: {
    xband: { rateMbps: 1000, bandMHz: '8025–8400', txW: 45, antGainDbi: 15 },
    ttc: { band: 'S 2025–2110 / 2200–2290 MHz', rateKbps: 2000 },
    isl: { type: 'S-band, cluster phase', rateKbps: 1000 },
  },
  adcs: { pointingDeg: 0.05, knowledgeDeg: 0.02, starTrackers: 2, wheels: 4, wheelNms: 0.5 },
  prop: { type: 'FEEP (ENPULSION MICRO R³ class)', totalImpulseKNs: 26, dvTotalMs: 235, dvDisposalMs: 100, dvFormationMs: 60, dvDragMs: 40, dvMarginMs: 35, powerW: 110,
    note: '26 kN·s on a ~110 kg spacecraft ≈ 235 m/s. Disposal is budgeted at 100 m/s because a 1 mN thruster can only lower the orbit continuously (low-thrust circular descent 530→350 km ≈ 100 m/s), not with an impulsive perigee burn (≈ 50 m/s). From 350 km natural decay takes < 1 year at any solar level.' },
  ground: {
    stations: [
      { id: 'nemea', name: 'Nemea (KSAT), Greece', lat: 37.82, lon: 22.66, bands: ['S', 'X'], role: 'Primary national X/S site (GSaaS, Greek soil)' },
      { id: 'svalbard', name: 'Svalbard (KSAT), Norway', lat: 78.23, lon: 15.39, bands: ['S', 'X'], role: 'Polar: every orbit for SSO; not useful at 53°' },
      { id: 'troll', name: 'Troll (KSAT), Antarctica', lat: -72.01, lon: 2.53, bands: ['S', 'X'], role: 'Southern polar complement (SSO)' },
      { id: 'puertollano', name: 'Puertollano (KSAT), Spain', lat: 38.69, lon: -4.11, bands: ['S', 'X'], role: 'Western Med complement' },
      { id: 'dubai', name: 'Dubai (KSAT), UAE', lat: 25.2, lon: 55.27, bands: ['S', 'X'], role: 'Gulf / Red Sea latency' },
      { id: 'athens', name: 'Thermopylae / Athens area (owned S-band TT&C)', lat: 38.8, lon: 22.55, bands: ['S'], role: 'Owned TT&C and tasking uplink' },
    ],
    minElDeg: 5, latencyNote: '90 min is achievable only with the Mediterranean/Gulf complements or the ISL; a single Greek station leaves a 13–14 h gap once per day at 53°', passesPerDayMidLat: '5–7 at ≥5° elevation, of which 2–4 above 20° (53° inclination); 3–5 (SSO)', latencyTargetMin: 90,
  },
  constellation: {
    stages: [
      { id: 's1', name: 'Stage 1 — TALOS-1 demonstrator', sats: 1, planes: 1, year: 2030, geoloc: 'Single-satellite: Doppler/FOA over pass, interferometric AOA, multi-pass accumulation', cep: '5–20 km single pass; 1–5 km multi-pass fixed emitters' },
      { id: 's2', name: 'Stage 2 — 3-satellite cluster', sats: 3, planes: 1, year: 2032, geoloc: 'TDOA/FDOA within cluster (150 km along-track, ±20 km cross-track)', cep: '0.3–3 km (comms), 100–500 m (radars)' },
      { id: 's3', name: 'Stage 3 — 3 clusters, 3 planes', sats: 9, planes: 3, year: 2034, geoloc: 'Cluster TDOA/FDOA + inter-cluster tracks', cep: 'as Stage 2, track-smoothed' },
      { id: 's4', name: 'Stage 4 — 12–24 satellites', sats: 12, planes: 4, year: 2036, geoloc: 'Persistent regional coverage, ISL alerts', cep: 'as Stage 2, sub-hour revisit' },
    ],
    cluster: { alongTrackKm: 150, crossTrackKm: 20, controlSigmaKm: 5 },
  },
  cost: { // M€ — from research 05 §1.3 (ranges)
    demonstrator: [18, 35], cluster3: [40, 65], constellation12: [110, 170],
    opex: { demonstrator: [2, 4], cluster3: [4, 7], constellation12: [12, 22] },
    unit: { busFirst: [3.5, 7], payloadNre: [6, 15], payloadRecurring: [1.2, 3.5], ait: [0.5, 1.5], launch: [1.0, 1.6], recurringSat: [5, 9] },
  },
  schedule: { kickoff: '2027-Q1', pdr: '2028-Q2', cdr: '2029-Q1', launch: '2030-Q2', ioc: '2030-Q4', clusterIoc: '2032-Q4', constellationIoc: '2036' },
};
