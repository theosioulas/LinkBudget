// Run with: node tools/orbit_study.js  (from the study folder; needs Node.js ≥ 18)
// Precompute constellation-template performance with orbit.js (node). Output: site/assets/data/orbit_study.js
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(require('path').join(__dirname, '../assets/js/orbit.js'), 'utf8')); const ORB = window.ORB;
const t0 = new Date('2031-03-18T00:00:00Z'); const DUR = 3 * 86400, STEP = 20;
const SSO = ORB.ssoInclination(530);
const mk = (name, alt, inc, raan, ta) => ORB.makeOrbit({ name, alt, inc, raan, ta, epoch: t0 });
function walker(T, P, F, alt, inc) { return ORB.walker(T, P, F, alt, inc, t0); }
// a "node" = one revisit node (a single satellite or one cluster flying as a unit). Templates list nodes as orbits; clusterSize multiplies satellites.
const TEMPLATES = [
  { id: 'T1', name: 'Single satellite, sun-synchronous', sats: 1, nodes: 1, planes: 1, clusterSize: 1, inc: SSO, alt: 530, orbits: () => [mk('S1', 530, SSO, 20, 0)],
    tag: 'Demonstrator (rideshare-friendly)', geoloc: 'single', launch: 'Any SpaceX Transporter (SSO), ~3–4 per year; most European rideshares',
    pros: ['Cheapest launch access and most frequent slots', 'Polar ground stations (Svalbard/Troll) see every orbit → shortest data latency', 'Constant local solar time: stable power and thermal design', 'Global coverage including polar regions'],
    cons: ['Fewest passes over mid-latitudes: two groups of passes per day (morning/evening) with a 10–12 h gap', 'Fixed local times — the same hour every day, easy for adversaries to predict', 'No instantaneous geolocation; only Doppler/AOA/multi-pass (5–20 km class)'],
    capabilities: 'Presence maps, spectrum occupancy, radar fingerprinting, GNSS-jammer presence; coarse geolocation of persistent emitters over days.' },
  { id: 'T2', name: 'Single satellite, mid-inclination 53°', sats: 1, nodes: 1, planes: 1, clusterSize: 1, inc: 53, alt: 530, orbits: () => [mk('S1', 530, 53, 20, 0)],
    tag: 'TALOS-1 baseline', geoloc: 'single', launch: 'SpaceX Bandwagon (~45°), 2–3 per year; dedicated Electron for exact inclination',
    pros: ['Most passes per day over 30–55° latitude (pass density peaks near the inclination)', 'Pass times drift through the day (less predictable)', 'Regional persistence for Greece / E. Med / Black Sea / Middle East'],
    cons: ['No coverage above ~60° latitude', 'Polar ground stations useless → one Greek station leaves a 13–14 h daily gap; needs Mediterranean/Gulf complements', 'Beta-angle seasons complicate power and thermal design', 'Fewer rideshare slots than SSO'],
    capabilities: 'As T1 but with ≈ 7 passes/day at 38°N instead of ≈ 4; the right single-satellite choice for a regional mission.' },
  { id: 'T3', name: 'Two satellites, same plane, 180° apart', sats: 2, nodes: 2, planes: 1, clusterSize: 1, inc: 53, alt: 530, orbits: () => [mk('S1', 530, 53, 20, 0), mk('S2', 530, 53, 20, 180)],
    tag: 'Revisit doubler', geoloc: 'single', launch: 'One rideshare, in-plane phasing by differential drag or FEEP (weeks–months)',
    pros: ['Halves the revisit gap of T2 for the price of one more satellite', 'Both satellites see the same emitter ~48 min apart → two independent Doppler/AOA fixes per orbit pair', 'Redundancy against a single failure'],
    cons: ['Still no instantaneous TDOA/FDOA (satellites never co-visible)', 'Same plane → same latitude coverage limits as T2', 'Phasing manoeuvre takes months with electric propulsion'],
    capabilities: 'Twice-per-orbit sampling of a region; dual-satellite multi-pass geolocation of fixed emitters to the few-km class within a day.' },
  { id: 'T4', name: 'Three-satellite TDOA/FDOA cluster', sats: 3, nodes: 1, planes: 1, clusterSize: 3, inc: 53, alt: 530, orbits: () => [mk('C1', 530, 53, 20, 0)],
    tag: 'TALOS Stage 2 — the product threshold', geoloc: 'cluster', launch: 'One rideshare for all three; formation acquisition by FEEP in weeks',
    pros: ['Instantaneous geolocation of single bursts with confidence ellipses (0.3–3 km comms, 100–500 m radars)', 'Dark-vessel correlation, GNSS jammer/spoofer positions, air-defence order of battle become products', 'Same launch as one satellite'],
    cons: ['Revisit identical to a single satellite — the cluster is one node', 'Formation keeping needs propulsion and flight dynamics (±5 km control, 150 km spacing, ±20 km cross-track)', 'Three satellites of cost for one node of revisit'],
    capabilities: 'What customers actually pay for: geolocation with ellipses on every pass; tracks and patterns only as fast as the revisit allows (≈ 7 passes/day at 38°N).' },
  { id: 'T5', name: 'Four-satellite diamond cluster', sats: 4, nodes: 1, planes: 2, clusterSize: 4, inc: 53, alt: 530, orbits: () => [mk('C1', 530, 53, 20, 0)],
    tag: 'Kleos-style geometry', geoloc: 'cluster', launch: 'One rideshare; two satellites drift to a second plane 1° away by RAAN differential (months) or a second rideshare',
    pros: ['Ambiguity-free TDOA fixes without needing FDOA; good geometry in both axes', 'One spare: cluster survives a failure as a 3-sat TDOA node'],
    cons: ['Still one revisit node', 'Most expensive per node; two-plane geometry needs cross-track control'],
    capabilities: 'As T4 with better geometric dilution and graceful degradation; justified when the budget allows a spare in the first cluster.' },
  { id: 'T6', name: 'Two clusters, two planes (6 satellites)', sats: 6, nodes: 2, planes: 2, clusterSize: 3, inc: 53, alt: 530, orbits: () => [mk('C1', 530, 53, 20, 0), mk('C2', 530, 53, 110, 180)],
    tag: 'First real persistence step', geoloc: 'cluster', launch: 'Two rideshares (one per plane) or one launch with months of RAAN drift',
    pros: ['Instantaneous geolocation twice as often; fills part of the morning/evening gap', 'Two independent nodes → tracks of moving emitters within hours'],
    cons: ['Max gap at mid-latitude still several hours', 'Two planes means two launches or a long drift campaign'],
    capabilities: 'Daily multi-fix tracking of ships and relocatable radars; alerting within ~3–6 h.' },
  { id: 'T7', name: 'Three clusters, three planes (9 satellites)', sats: 9, nodes: 3, planes: 3, clusterSize: 3, inc: 53, alt: 530, orbits: () => [mk('C1', 530, 53, 20, 0), mk('C2', 530, 53, 80, 120), mk('C3', 530, 53, 140, 240)],
    tag: 'TALOS Stage 3 (2034)', geoloc: 'cluster', launch: 'Three rideshares; or two with drift',
    pros: ['Typical gaps of 1–3 h at mid-latitude; patterns of life and anomaly alerts become credible', 'Three nodes: a moving ship is fixed several times per day'],
    cons: ['Nine satellites for three revisit nodes — the cost of instantaneous geolocation everywhere', 'Still not sub-hour'],
    capabilities: 'Pattern-of-life baselines per AOI, change detection, STANAG 4676 tracks, cueing of SAR/EO within a few hours.' },
  { id: 'T8', name: 'Walker 12 singles, 4 planes', sats: 12, nodes: 12, planes: 4, clusterSize: 1, inc: 53, alt: 530, orbits: () => walker(12, 4, 1, 530, 53),
    tag: 'Revisit-first (Unseenlabs model)', geoloc: 'single', launch: 'Four rideshares or two with drift',
    pros: ['Sub-2-hour typical gaps with only 12 satellites because every satellite is a node', 'Best detection/activity-monitoring persistence per euro', 'Each emitter seen from many directions → multi-pass geolocation to km-class within a day'],
    cons: ['No instantaneous TDOA/FDOA: burst emitters get only Doppler/AOA fixes', 'Geolocation of moving ships relies on successive passes'],
    capabilities: 'GNSS-interference and activity monitoring with ~1–2 h latency; radar catalogue updates many times a day.' },
  { id: 'T9', name: 'Four clusters, four planes (12 satellites)', sats: 12, nodes: 4, planes: 4, clusterSize: 3, inc: 53, alt: 530, orbits: () => walker(4, 4, 1, 530, 53),
    tag: 'TALOS Stage 4 (2036)', geoloc: 'cluster', launch: 'Four rideshares',
    pros: ['Instantaneous geolocation with typical gaps around 2–3 h', 'Operational-grade order-of-battle and dark-vessel service'],
    cons: ['Same satellite count as T8 for a third of the revisit', 'Formation keeping for four clusters'],
    capabilities: 'The regional service a MoD would subscribe to; near-real-time alerts need ISL or more nodes.' },
  { id: 'T10', name: 'Eight clusters, four planes (24 satellites)', sats: 24, nodes: 8, planes: 4, clusterSize: 3, inc: 53, alt: 530, orbits: () => walker(8, 4, 1, 530, 53),
    tag: 'HawkEye-class regional persistence', geoloc: 'cluster', launch: 'Six+ rideshares over 2–3 years',
    pros: ['Sub-hour typical gaps (max ≈ 45 min at 38°N) with instantaneous fixes', 'Cueing of SAR/EO within the same hour'],
    cons: ['€110–170 M-class programme; replenishment of ~2 satellites/yr', 'Ground segment and processing must scale accordingly'],
    capabilities: 'Persistent regional monitoring; HawkEye 360 claims < 45 min global with 30+ satellites.' },
  { id: 'T11', name: 'Mixed: 1 cluster SSO + 1 cluster 53°', sats: 6, nodes: 2, planes: 2, clusterSize: 3, inc: 'SSO + 53°', alt: 530, orbits: () => [mk('C1', 530, SSO, 20, 0), mk('C2', 530, 53, 110, 90)],
    tag: 'Global + regional', geoloc: 'cluster', launch: 'One Transporter + one Bandwagon',
    pros: ['Global coverage from the SSO cluster plus regional density from the 53° cluster', 'Polar station downlink for the SSO node (short latency)', 'Uses the two most frequent rideshare types'],
    cons: ['Two different power/thermal designs or a compromise', 'Mid-latitude gap not much better than T6'],
    capabilities: 'A hedge: global catalogue building plus regional persistence; the HawkEye 360 approach (SSO + 40–46° planes).' },
  { id: 'T12', name: 'Walker 24 singles, 6 planes', sats: 24, nodes: 24, planes: 6, clusterSize: 1, inc: 53, alt: 530, orbits: () => walker(24, 6, 1, 530, 53),
    tag: 'Maximum revisit', geoloc: 'single', launch: 'Six rideshares',
    pros: ['~10–20 min typical gaps at mid-latitude: near-persistent activity monitoring', 'Every emitter seen from many geometries each hour → single-satellite methods converge to km-class quickly'],
    cons: ['No instantaneous fixes on single bursts', 'Highest ground-segment load'],
    capabilities: 'Near-real-time GNSS-interference and EW activity mapping; the Unseenlabs path scaled up.' },
];
const SITES = [
  { name: 'Equator (Gulf of Guinea)', lat: 0, lon: 0 }, { name: 'Hormuz 26°N', lat: 26.5, lon: 56.5 }, { name: 'Nicosia 35°N', lat: 35.2, lon: 33.4 },
  { name: 'Athens 38°N', lat: 38, lon: 23.7 }, { name: 'Odesa 46°N', lat: 46.5, lon: 30.7 }, { name: 'Kyiv 50°N', lat: 50.4, lon: 30.5 },
  { name: 'Baltic 58°N', lat: 58, lon: 20 }, { name: 'Svalbard 78°N', lat: 78.2, lon: 15.4 },
];
function stats(orbits, lat, lon, minEl) {
  // merged access windows across all nodes
  let wins = [];
  for (const o of orbits) for (const p of ORB.passes(o, lat, lon, 0, t0, DUR, minEl, STEP)) wins.push([+p.aos, +p.los, p.maxEl]);
  wins.sort((a, b) => a[0] - b[0]);
  const merged = []; for (const w of wins) { const l = merged[merged.length - 1]; if (l && w[0] <= l[1]) l[1] = Math.max(l[1], w[1]); else merged.push([w[0], w[1]]); }
  const gaps = []; for (let i = 1; i < merged.length; i++) gaps.push((merged[i][0] - merged[i - 1][1]) / 60000);
  const days = DUR / 86400; const access = merged.reduce((s, w) => s + (w[1] - w[0]) / 60000, 0) / days;
  const sorted = gaps.slice().sort((a, b) => a - b);
  return { passesPerDay: +(wins.length / days).toFixed(1), windowsPerDay: +(merged.length / days).toFixed(1), meanGapMin: gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null, medianGapMin: gaps.length ? Math.round(sorted[Math.floor(sorted.length / 2)]) : null, maxGapMin: gaps.length ? Math.round(Math.max(...gaps)) : (merged.length ? 0 : null), accessMinPerDay: Math.round(access), covered: merged.length > 0 };
}
const out = { generated: new Date().toISOString(), epoch: t0.toISOString(), durationDays: DUR / 86400, sso: +SSO.toFixed(2), sites: SITES, templates: [], curves: {}, incCurve: [] };
for (const T of TEMPLATES) {
  const orbits = T.orbits(); const perf = {};
  for (const s of SITES) perf[s.name] = { el5: stats(orbits, s.lat, s.lon, 5), el15: stats(orbits, s.lat, s.lon, 15) };
  const { orbits: _, ...rest } = T; out.templates.push({ ...rest, perf });
  console.error(T.id, T.name, 'Athens 5°:', JSON.stringify(perf['Athens 38°N'].el5));
}
// curves: mean/max gap vs number of nodes for Walker (nodes, planes=min(nodes,…)) at 53° and SSO, Athens and Odesa and Hormuz, 5° and 15°
const PLANES = { 1: 1, 2: 1, 3: 1, 4: 2, 6: 2, 8: 4, 9: 3, 12: 4, 16: 4, 18: 6, 24: 6, 30: 6 };
function walkerNodes(N, inc) { return walker(N, PLANES[N], 1, 530, inc); }
for (const inc of [53, SSO]) {
  for (const s of SITES.filter(x => ['Hormuz 26°N', 'Athens 38°N', 'Odesa 46°N', 'Kyiv 50°N'].includes(x.name))) {
    const key = `${inc === 53 ? 'i53' : 'sso'}|${s.name}`; out.curves[key] = [];
    for (const N of [1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 30]) { const o = walkerNodes(N, inc); const st5 = stats(o, s.lat, s.lon, 5), st15 = stats(o, s.lat, s.lon, 15); out.curves[key].push({ N, planes: PLANES[N], el5: st5, el15: st15 }); }
    console.error('curve', key, out.curves[key].map(c => c.N + ':' + c.el5.meanGapMin).join(' '));
  }
}
// passes/day vs latitude for several inclinations (single satellite, 5°)
for (const inc of [30, 45, 53, 60, 70, SSO]) { const o = [mk('S', 530, inc, 20, 0)]; const row = { inc: +inc.toFixed(1), byLat: [] }; for (let lat = 0; lat <= 80; lat += 10) { const st = stats(o, lat, 20, 5); row.byLat.push({ lat, passesPerDay: st.passesPerDay, accessMinPerDay: st.accessMinPerDay, maxGapMin: st.maxGapMin }); } out.incCurve.push(row); console.error('inc', inc, row.byLat.map(b => b.passesPerDay).join(' ')); }
// altitude trade (single sat 53°, Athens)
out.altTrade = [400, 450, 500, 530, 550, 600, 650, 700].map(alt => { const o = [mk('S', alt, 53, 20, 0)]; const st = stats(o, 38, 23.7, 5); return { alt, periodMin: +(ORB.period(ORB.RE + alt) / 60).toFixed(1), footprintKm5: Math.round(ORB.footprintRadiusKm(alt, 5)), footprintKm15: Math.round(ORB.footprintRadiusKm(alt, 15)), slant5: Math.round(ORB.slantRange(alt, 5)), fsplDeltaDb: +(20 * Math.log10(ORB.slantRange(alt, 5) / ORB.slantRange(530, 5))).toFixed(1), passesPerDay: st.passesPerDay, accessMinPerDay: st.accessMinPerDay, meanGapMin: st.meanGapMin }; });
fs.writeFileSync(require('path').join(__dirname, '../assets/data/orbit_study.js'), '// Precomputed constellation-template performance (tools/orbit_study.js, orbit.js circular+J2, 3-day runs, 20 s steps, epoch ' + t0.toISOString() + ')\nwindow.ORBIT_STUDY=' + JSON.stringify(out) + ';\n');
console.error('written');
