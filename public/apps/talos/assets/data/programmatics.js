/* Cost, schedule, gates, use cases, customers, products — from research/04 and /05. Money in M€ unless noted; ranges [low, high]. */
window.COST_ELEMENTS = [
  { id: 'bus', name: 'Bus, ESPA-class 100–150 kg', range: [3.0, 7.0], unit: 'per sat (first unit +30–60%)', basis: 'NanoAvionics MP42H / Aerospacelab VSP / BST class; US buses higher and ITAR-laden' },
  { id: 'pl-nre', name: 'SIGINT payload — non-recurring', range: [6, 15], unit: 'one-off', basis: 'Receiver chain variants, EM+QM+FM, antenna development and range tests, firmware, EMC qualification' },
  { id: 'pl-rec', name: 'SIGINT payload — recurring', range: [1.2, 3.5], unit: 'per sat', basis: 'RFSoC ~$10–25k; cost dominated by filters, LNAs, antennas, timing, screening and test' },
  { id: 'ait', name: 'AIT & environmental test', range: [0.5, 1.5], unit: 'per sat', basis: 'Lower end with HAITF (Schimatari); EMC/antenna range at IABG/Intespace/MVG' },
  { id: 'launch', name: 'Launch (rideshare)', range: [1.0, 1.6], unit: 'per sat', basis: 'SpaceX $7,000/kg (2026) → 150 kg ≈ $1.05 M + deployer/integration $150–400k via Exolaunch' },
  { id: 'ins', name: 'Insurance', range: [0.3, 1.5], unit: 'per sat (launch+1 yr, 5–12%)', basis: 'Most LEO smallsats uninsured in orbit; liability €50–200k/yr' },
  { id: 'gs', name: 'Ground segment (GSaaS + owned S-band)', range: [0.5, 2.5], unit: 'capex + €0.1–0.4 M/yr per sat', basis: '€40–250 per pass; owned Greek X/S station €1–2.5 M' },
  { id: 'mcs', name: 'Mission control & data platform', range: [1.0, 3.0], unit: 'build, or €0.2–0.6 M/yr licences', basis: 'Commercial MCS + cloud; IQ storage dominates' },
  { id: 'ops', name: 'Operations staffing', range: [0.5, 0.8], unit: 'per year (1 sat, 4–6 FTE)', basis: '6–9 FTE for 3 sats; 10–15 FTE for 12' },
  { id: 'reg', name: 'Regulatory / licensing / legal', range: [0.2, 0.5], unit: 'Phase A–D', basis: 'ITU CHF 10–60k per filing; Greek fee undefined; export classification' },
  { id: 'pm', name: 'PM, systems engineering, PA', range: [12, 20], unit: '% of hardware', basis: 'ECSS-tailored' },
  { id: 'cont', name: 'Contingency', range: [20, 30], unit: '% at Phase A (10–15% at CDR)', basis: 'First-of-kind payload' },
];
window.COST_SCENARIOS = [
  { id: 'a', name: '1 demonstrator (TALOS-1)', capex: [18, 35], opex: [2, 4], duration: '30–42 months to IOC', note: 'Payload NRE ≈40–50%; ESA Scout cap €35 M is the institutional benchmark', sats: 1 },
  { id: 'b', name: '3-satellite cluster', capex: [40, 65], opex: [4, 7], duration: '+18–24 months', note: 'Incremental €22–35 M; recurring €5–9 M per satellite incl. launch', sats: 3 },
  { id: 'c', name: '12-satellite constellation', capex: [110, 170], opex: [12, 22], duration: '+36–48 months', note: 'Learning curve 10–15% per doubling; replenishment ~2 sats/yr at steady state', sats: 12 },
];
window.COMPARATORS = [
  { name: 'HawkEye 360', raised: '$378 M pre-IPO + $150 M + $23 M; IPO May 2026 net $436 M', sats: '>30 (13–30 kg)', perSat: '~$10 M of total capital per satellite', note: '~10 years and >$500 M to a ~$200 M revenue run-rate; profitable 2025' },
  { name: 'Unseenlabs', raised: '~€120 M incl. €85 M Series C (2024)', sats: '25 (6U/8U → 150 kg Gen 2)', perSat: '~€5–10 M', note: 'Single-satellite geolocation; now CASSIOPÉE co-contractor' },
  { name: 'Kleos Space', raised: '~A$60–80 M lifetime (est.)', sats: '16 (6U, 4 per cluster)', perSat: '~A$4–5 M', note: '€272k revenue vs €11.3 M loss (2022); bankruptcy Jul 2023' },
  { name: 'ESA Scout class', raised: '€35 M cap', sats: '1 small mission incl. launch', perSat: '€35 M', note: '3 years approval → launch' },
  { name: 'Greek national smallsat programme', raised: '€60 M satellites / €130 M total (RRF, ESA-managed)', sats: '11 (mostly CubeSats, 2 × 120 kg SAR)', perSat: '~€5.5 M incl. overheads', note: 'Proved Greek Phase B–D execution; built HAITF' },
  { name: 'CERES (France)', raised: '€450 M', sats: '3 × ~500 kg', perSat: '€150 M', note: 'Sovereign-grade; IISS plans ~$200 M per European SIGINT satellite' },
];
window.PHASES = [
  { id: '0A', name: 'Phase 0/A — Mission analysis & feasibility', months: [6, 9], content: 'Needs, CONOPS, architecture trades (hosted / pathfinder / 150 kg), cost & schedule, regulatory path, funding plan', review: 'MDR → PRR / SRR' },
  { id: 'B', name: 'Phase B — Preliminary definition', months: [9, 12], content: 'Requirements baseline, bus selection & contract, payload breadboards (RF chain, timing, FPGA), antenna prototypes, ITU filing started, licence application started', review: 'PDR' },
  { id: 'C', name: 'Phase C — Detailed definition', months: [9, 12], content: 'EM payload, EMC/self-interference test with bus EM, firmware, ground-segment design, launch booking (12–18 months before flight)', review: 'CDR' },
  { id: 'D', name: 'Phase D — Qualification & production', months: [10, 14], content: 'QM/FM payload, bus FM, AIT, environmental test, end-to-end RF compatibility, ops rehearsals', review: 'QR → AR, ORR, FRR' },
  { id: 'L', name: 'Launch campaign', months: [2, 4], content: 'Shipment, integration to deployer, launch', review: 'LRR' },
  { id: 'E1', name: 'E1 — Commissioning', months: [3, 6], content: 'Bus checkout, payload calibration on known emitters, antenna pattern verification, timing characterisation', review: 'CRR / IOC' },
];
window.LONG_LEAD = [
  { item: 'Rad-tolerant / space-grade FPGAs (XQRKU060, PolarFire RT, XQR Versal)', months: [12, 18], mit: 'Order at PDR; commercial RFSoC + rad-tolerant supervisor so only the supervisor is long-lead' },
  { item: 'Deployable antennas / DF array (custom)', months: [12, 24], mit: 'Catalogue items where possible; custom only where the link budget demands; start Phase B' },
  { item: 'Deployable reflector (if adopted)', months: [12, 18], mit: 'Stage 2 option; OSS Wrapped-Rib / Tendeg' },
  { item: 'Launch slot (rideshare)', months: [12, 18], mit: 'Book two options; orbit-agnostic design' },
  { item: 'Propulsion (electric or green mono)', months: [12, 18], mit: 'Fix thruster at SRR; heritage required' },
  { item: 'Star trackers (EU)', months: [9, 14], mit: 'Via bus vendor frame contract' },
  { item: 'Reaction wheels', months: [6, 15], mit: 'EU (Vectronic, Hyperion) 6–9 months; US 12+ and licences' },
  { item: 'Space CSAC / mRO-50 + GNSS timing', months: [6, 12], mit: 'Dual-source; thin heritage on new space CSAC' },
  { item: 'X-band transmitter', months: [9, 12], mit: 'Syrlinks / EnduroSat' },
  { item: 'Solar wings, battery', months: [6, 12], mit: 'DHV / Azur; Saft or ABSL' },
  { item: 'ITU filing & EETT coordination', months: [12, 24], mit: 'File at PDR (−30 months to launch)' },
  { item: 'Greek national licence (Law 4508/2017)', months: [12, 18], mit: 'Engage HSC / Ministry informally in Phase A; first SIGINT precedent' },
  { item: 'Environmental test slots', months: [3, 6], mit: 'HAITF Schimatari; ESTEC, IABG, Intespace' },
];
window.GATES = [
  { id: 'G0', name: 'Feasibility close-out', when: 'End Phase A (M9)', go: 'Legal opinion that externals-only collection is lawful; licensing path agreed with Ministry/HSC/EETT; export classification complete (ITAR-free baseline); cost ±30% within €18–35 M; ≥1 government LOI', kpi: 'Link/timing budgets closed on paper; antenna concept with heritage; funding plan covering demonstrator and 50% of cluster' },
  { id: 'G1', name: 'Commit to pathfinder + Phase B', when: 'M9–M12', go: '≥€8–12 M committed; bus vendor selected; ITU strategy approved', kpi: 'Breadboard RF chain meets NF and IBW; timestamp jitter ≤ target in lab' },
  { id: 'G2', name: 'PDR / commit to FM build', when: 'M21–M24', go: 'Pathfinder (or hosted payload) shows RFSoC survives with mitigation; EMC compatibility at EM level; launch option booked; licence filed', kpi: 'Lab geolocation emulation within 2× of spec; cumulative funding ≥ demonstrator total' },
  { id: 'G3', name: 'Demonstrator IOC', when: 'M42–M48', go: 'Commissioning complete; ≥90% availability over 3 months; products delivered to anchor customer', kpi: 'Reference emitters detected across UHF/L/S (C/X stretch); single-sat CEP ≤10–20 km (multi-pass ≤5–10 km); downlink ≥ planned volume; self-interference within budget' },
  { id: 'G4', name: 'Commit to 3-satellite cluster', when: 'M48–M54', go: 'Demonstrator KPIs met; ≥€25–35 M incremental secured; ≥2 paying customers; licence extension & ITU coordination progressing', kpi: 'Clock-bias estimation shows TDOA feasibility; recurring cost ≤€8 M per satellite incl. launch' },
  { id: 'G5', name: 'Cluster IOC', when: 'M66–M78', go: 'Formation maintained; TDOA/FDOA products operational', kpi: 'CEP ≤1–3 km for pulsed/burst emitters; revisit per spec; revenue run-rate covering opex' },
  { id: 'G6', name: 'Commit to constellation (12)', when: 'M78–M84', go: 'Revenue/backlog + funding ≥€60–100 M; EU Space Act authorisation clear; second production source qualified', kpi: 'Learning curve demonstrated; lifetime ≥3 years on demonstrator' },
  { id: 'G7', name: 'Constellation IOC', when: 'M114–M138', go: '≥9 of 12 satellites operational', kpi: 'Regional revisit ≤2–3 h; catalogue update latency per SLA' },
];
window.ROADMAP = [
  { when: '2026 Q4 – 2027 Q3', what: 'Phase 0/A', detail: 'Feasibility (this study), legal/regulatory opinions, concept, funding (ESA / HCDI / EDF / VC), G0' },
  { when: '2027 Q4 – 2028 Q4', what: 'Phase B + 16U pathfinder build', detail: 'ITU filing; licence application; G1 → G2' },
  { when: '2029', what: 'Pathfinder flight; Phase C/D demonstrator', detail: 'HAITF test campaign; cluster financing round' },
  { when: '2030', what: 'TALOS-1 launch & commissioning', detail: 'G3; anchor-customer service; likely grandfathered under EU Space Act' },
  { when: '2031 – 2032', what: 'Cluster of 3 (TDOA/FDOA)', detail: 'G4 → G5; NIS2 / EU Space Act compliant ground segment' },
  { when: '2033 – 2036', what: 'Constellation build-out to 12 in 3–4 planes', detail: 'Replenishment logistics; G6 → G7' },
];
window.HEADCOUNT = [
  { phase: 'Phase 0/A', fte: [6, 10], note: 'Systems, RF, DSP, PM, business, legal (part-time)' },
  { phase: 'Phase B', fte: [15, 22], note: '+ antenna, FPGA, software, PA, procurement' },
  { phase: 'Phase C/D (demonstrator)', fte: [25, 35], note: '+ AIT, ground segment, ops preparation, analysts' },
  { phase: 'Operations + cluster build', fte: [35, 50], note: 'Ops 6–9; analysts 5–8; sales/GR 3–5; cluster engineering' },
  { phase: 'Constellation', fte: [60, 90], note: 'Production engineering, 24/7 ops, product teams' },
];
window.BUILD_VS_BUY = [
  { element: 'Bus (ADCS, EPS, propulsion, TT&C, X-band TX)', rec: 'Buy', why: 'Not a differentiator; EU vendors deliver in 18–24 months; keeps ITAR exposure manageable' },
  { element: 'RF front-end (LNAs, filters, converters)', rec: 'Buy / co-develop', why: 'Mature supply base; EMC performance is integration work' },
  { element: 'Antennas', rec: 'Partner', why: 'Long-lead and failure-prone; own the requirements and range testing' },
  { element: 'Digital receiver, firmware, timestamping, on-board detection', rec: 'Build', why: 'Core IP: sets sensitivity, bandwidth and geolocation performance' },
  { element: 'Geolocation algorithms, signature library, analytics', rec: 'Build', why: 'This is the product' },
  { element: 'Ground stations', rec: 'Buy GSaaS + one owned Greek station', why: 'Security and sovereignty' },
  { element: 'Mission control software', rec: 'Buy licence, customise', why: 'Commodity' },
  { element: 'Launch', rec: 'Buy via broker, two options', why: 'Commodity but schedule-critical' },
];
window.PATHFINDER_OPTIONS = [
  { option: 'Hosted payload on a Greek/ESA CubeSat or partner microsat', cost: [1.5, 4], time: '18–30 months', proves: 'RFSoC radiation behaviour, firmware, timing chain, EMC on a real bus', not: 'No control over orbit, antennas or downlink; host schedule risk' },
  { option: '12U/16U pathfinder with one UHF/L/S chain', cost: [5, 9], time: '24–30 months', proves: 'Full chain end-to-end incl. single-satellite geolocation, ground processing, licensing precedent', not: 'Limited power/aperture, no C/X, no cluster' },
  { option: 'Go straight to the 150 kg demonstrator', cost: [18, 35], time: '36–48 months', proves: 'Everything at full performance', not: 'Highest first-flight risk; Kleos-type exposure if it under-performs' },
];

/* ---------- Use cases, customers, products (research 04) ---------- */
window.USECASES = [
  { id: 'gnss-interference', name: 'GNSS interference & spoofing mapping', emitters: ['gnss-jam', 'ew-jam'], stage: 1, customers: ['MoD', 'EUSPA', 'aviation regulators (EASA/EUROCONTROL)', 'maritime insurers', 'Windward-class platforms'],
    example: 'HawkEye 360 showed jamming on the Ukraine–Belarus border Nov 2021–Feb 2022 as a leading indicator of the invasion; Jul 2025 GNSS-I suite claims km-class spoofer geolocation; Windward counted ~47,000 jammed vessels since Feb 2026; EUSPA issued an RFI (Feb 2025) for a space-based GNSS RFI monitoring service.',
    why: 'Widest customer base, continuous emitters in a known band, the natural first product. Stage 1 sells presence/intensity maps per pass; Stage 2 adds positions with ellipses.' },
  { id: 'dark-vessel', name: 'Dark vessel & IUU fishing detection', emitters: ['marine-nav', 'satcom-l', 'naval-surv'], stage: 2, customers: ['coast guards', 'EMSA', 'Frontex', 'navies', 'Global Fishing Watch', 'insurers'],
    example: '~325-vessel Chinese fleet off Galápagos (2020): HawkEye RF + Airbus SAR found 58 SAR vessels of which only 16 matched AIS; Unseenlabs sells single-satellite maritime RF tracks to "dozens of clients".',
    why: 'RF-vs-AIS correlation product; radars at sea are strong and persistent; RF cues SAR/EO.' },
  { id: 'naval', name: 'Naval RF activity & order of battle', emitters: ['naval-surv', 'naval-fc', 'link16', 'satcom-uhf'], stage: 2, customers: ['Hellenic Navy / HNDGS', 'NATO MARCOM', 'allied MoDs'],
    example: 'Historic NOSS/Legenda mission; Yaogan triplets today; CERES for France. Fire-control illuminator activation is a direct indicator.',
    why: 'Eastern Mediterranean and Black Sea naval activity is the regional core product; S/X-band radar fingerprints feed the EW database.' },
  { id: 'aewc', name: 'AEW&C and air-activity monitoring', emitters: ['aewc', 'iff', 'link16'], stage: 1, customers: ['Hellenic Air Force', 'NATO CAOC', 'allied MoDs'],
    example: 'AEW radar mainlobes saturate from any elevation; sidelobe detection is continuous — patterns of AEW orbits, IFF interrogator activity and Link-16 net activity map air operations.',
    why: 'Radars never SNR-limited; detectable from day one with a single satellite.' },
  { id: 'air-defence', name: 'Ground-based air-defence radar monitoring', emitters: ['gbad', 'ew-jam'], stage: 1, customers: ['MoD', 'NATO', 'SEAD planners'],
    example: 'A European MoD signed up to USD 75 M for HawkEye "Air Defense and GPS Interference Monitoring" (Mar 2026).',
    why: 'Named commercial service line; relocatable SAM radars are the classic ELINT catalogue entry.' },
  { id: 'force-posture', name: 'Force-posture change & pre-kinetic indicators', emitters: ['tac-vhf-uhf', 'ew-jam', 'gnss-jam', 'uas-mil', 'satcom-uhf'], stage: 3, customers: ['intelligence agencies', 'MoD', 'NATO'],
    example: 'Galwan Valley 2020: RF surge tasked EO imagery that showed the build-up; Ukraine 2021–22 jamming indicator.',
    why: 'Needs revisit (Stage 3) for pattern-of-life baselines and anomaly alerts — the highest-value analytic product.' },
  { id: 'uas', name: 'UAS communications detection', emitters: ['uas-mil', 'uas-consumer'], stage: 2, customers: ['MoD', 'border agencies'],
    example: 'Military GCS (10–20 W directional) detectable via upper lobes; consumer links below the thermal floor from LEO — claims of drone detection from space mean GCS or military links.',
    why: 'Sold honestly as "UAS activity" (GCS, mil links), not individual consumer drones.' },
  { id: 'tactical-comms', name: 'Tactical radio & PTT activity mapping', emitters: ['tac-vhf-uhf', 'satcom-uhf', 'satcom-l'], stage: 1, customers: ['MoD', 'SOF', 'border agencies'],
    example: 'HawkEye SOI library includes UHF PTT, VHF radios, satphones; Spire transcribes unencrypted voice (content — a state-mandate product, not a commercial one here).',
    why: 'Externals-only activity maps; bursty signals need the satellite overhead during the burst, so dwell planning matters.' },
  { id: 'border', name: 'Border, migration & smuggling awareness', emitters: ['satcom-l', 'tac-vhf-uhf', 'tetra', 'marine-nav'], stage: 2, customers: ['Frontex (EUROSUR)', 'Hellenic Coast Guard', 'police'],
    example: 'Frontex paid HawkEye ~€1.5 M in 2019 for maritime situational awareness.',
    why: 'Low-power handhelds at sea are at the edge of detectability; satphones and small-vessel radars are the realistic signals.' },
  { id: 'satops-interference', name: 'Satellite-operator uplink interference hunting', emitters: ['vsat', 'satcom-l'], stage: 2, customers: ['satellite operators (GEO)', 'regulators (EETT)', 'teleport operators'],
    example: 'NOAA GOES DCS: a lost 1.9 s / 1.5 kHz transmitter blocking an uplink slot for years was geolocated by HawkEye 360 (Jul 2026). A LEO RF satellite sees the uplink that GEO geolocation struggles with when only one satellite is affected.',
    why: 'Directly relevant to the team\'s satellite-operations background; a niche with paying commercial customers.' },
  { id: 'spectrum', name: 'Spectrum occupancy & regulatory compliance', emitters: ['cellular', 'tetra'], stage: 1, customers: ['regulators (EETT, ITU-R)', 'MNOs'],
    example: 'Aurora Insight mapped occupancy from space; absorbed into HawkEye as a feature.',
    why: 'Day-one product from a single satellite; low margin alone (Aurora lesson) but good calibration data.' },
  { id: 'aviation', name: 'Aviation GNSS-interference source location', emitters: ['gnss-jam'], stage: 2, customers: ['EASA', 'EUROCONTROL', 'ANSPs', 'airlines'],
    example: 'EASA FIR rankings (Ankara, Warsaw, Bucharest, Sofia, Vilnius); IATA +220% GPS-loss events 2021–24; ADS-B maps show effect on receivers, space RF adds the emitter position.',
    why: 'Complements gpsjam-style maps with source geolocation.' },
  { id: 'maritime', name: 'Maritime domain awareness (general)', emitters: ['marine-nav', 'satcom-l', 'coastal'], stage: 1, customers: ['EMSA', 'coast guards', 'shipping intelligence'],
    example: 'Unseenlabs maritime product line; Kleos Guardian LOCATE.', why: 'Radar presence maps from one satellite; tracks with a cluster.' },
  { id: 'air-activity', name: 'Air activity (IFF / data-link) mapping', emitters: ['iff', 'link16'], stage: 1, customers: ['air forces', 'NATO'], example: 'Space ADS-B precedent (Aireon).', why: 'Interrogator and net-activity patterns.' },
];
window.CUSTOMERS = [
  { seg: 'US national', who: 'NRO (SCE → CRFCA operational RF, uncapped, Aug 2026), NGA (Luno A/B analytics, $490 M ceiling), AFRL ($14 M Spire cluster), Navy/NIWC ($5.8 M)', entry: 'Commercial Solutions Opening (5-year rolling); ~4 years from study to operational buy' },
  { seg: 'NATO', who: 'APSS / Aquila virtual constellation via NCIA; ACT experimentation', entry: 'NCIA framework; national contribution; STANAG 4676/4559 interoperability' },
  { seg: 'EU', who: 'EUSPA (space-based GNSS RFI monitoring RFI, Feb 2025 — Parts A service / B hosted payload), EDF SPACE-ISR calls, EDA, Frontex EUROSUR, EMSA, EU SatCen', entry: 'EDF consortia; EUSPA service tender; Copernicus-style contributing mission' },
  { seg: 'Greece & region', who: 'Hellenic MoD / HNDGS, Hellenic Navy & Air Force, Hellenic Coast Guard, EETT, Hellas Space 2.0 (€350 M, no RF line yet), Cyprus, Gulf states', entry: 'Anchor customer with milestone payments; joint tasking board with defence; KSAT Nemea site; HCDI investor access' },
  { seg: 'Commercial', who: 'Windward / Kpler / Lloyd\'s List class platforms (channel partners), P&I clubs & insurers, shipowners, offshore energy, GEO satellite operators, teleports, MNOs', entry: 'AOI subscriptions, source-layer licensing, interference-hunting service' },
];
window.PRODUCTS = [
  { tier: 'L1 Detections', name: 'RF detection feed', stage: 1, what: 'Time, frequency, bandwidth, power, modulation class, satellite, footprint; per-pass occupancy strips', format: 'GeoJSON / JSON API', price: 'AOI subscription from ~€50k/yr (est.)' },
  { tier: 'L2 Geolocations', name: 'Emitter geolocations with confidence ellipses', stage: 2, what: 'Lat/lon, 95% ellipse, method (TDOA/FDOA/AOA/multi-pass), GDOP, terrain-adjusted flag', format: 'GeoJSON, STANAG 4676 tracks, OGC API Features', price: 'AOI subscription €0.2–2 M/yr by area and revisit (est.)' },
  { tier: 'L3 Catalogue', name: 'Emitter catalogue & signature library', stage: 2, what: 'Emitter instances with maturity level, parametric history, platform association (MMSI, ICAO24, site), first/last seen', format: 'Catalogue API, STANAG 4559-compatible library export, classified annex', price: 'National EW-database feed; sovereign licence' },
  { tier: 'L4 Analytics', name: 'Pattern-of-life, anomaly & alert products', stage: 3, what: 'Baselines per AOI/class/hour-of-week; alerts: new emitter in AOI, jammer active, radar mode change, dark vessel with radar on', format: 'Dashboard, alert feed (email/API/COP), reports', price: 'Knowledge-product subscription; highest margin' },
  { tier: 'Tasking', name: 'IQ dedicated tasking', stage: 1, what: 'Customer-tasked collections with raw IQ snapshots and processing toolkit; exclusivity option', format: 'IQ files + metadata', price: 'Per collection / capacity block; exclusivity premium' },
  { tier: 'Sovereign', name: 'Dedicated capacity / sovereign cluster', stage: 2, what: 'Committed % of cluster capacity, in-country ground station, bespoke algorithms, classified enclave; operator retains ownership', format: 'MaaS contract', price: 'Multi-year, tens of M€ (HawkEye: $75 M European MoD, $100 M+ 5-year partner)' },
];
window.KPIS = [
  { kpi: 'Geolocation accuracy (CEP / 95% ellipse)', market: 'HawkEye "few hundred m to few km"; Kleos ≤300 m best case; Unseenlabs sub-km ships; GNSS spoofers km-class', ours: 'Stage 1: 5–20 km single pass, 1–5 km multi-pass fixed; Stage 2: 0.3–3 km comms, 100–500 m radars — always with conditions and predicted CEP in the tasking UI' },
  { kpi: 'Latency (collection → product)', market: 'Hours today; HawkEye targets minutes→seconds; EUSPA asks time-to-localise-and-notify', ours: 'Standard <6 h (Greek site), NRT <90 min with KSAT polar/Dubai complement, minutes with ISL (Stage 3)' },
  { kpi: 'Revisit', market: 'HawkEye <45 min global (30+ sats); CYGNSS 1 h 49 min with 7 sats at ±40°', ours: 'Stage 1: 5–7 passes/day at 38°N (≥5° elevation); Stage 3: ~3–6 h gaps; Stage 4: <1 h regional' },
  { kpi: 'Pd / false-alarm rate', market: 'Rarely published', ours: 'Per signal class from calibration campaigns; CFAR P_fa 1e-6 on board' },
  { kpi: 'Availability & capacity', market: 'Kleos ~70 collection-min per satellite per day', ours: 'SLA on fulfilled tasking minutes; ~9 min/orbit collection capacity per satellite' },
  { kpi: 'Formats / APIs', market: 'GeoJSON/JSON REST; NATO expects STANAG 4676 / 4559 / 4607', ours: 'GeoJSON + OGC API Features + STANAG 4676 export — a gap in current commercial offers' },
  { kpi: 'Security accreditation', market: 'Classified-enclave vetting; sovereign in-country processing', ours: 'NATO SECRET / EU SECRET facility; EU sovereign cloud; NIS2 from day one' },
  { kpi: 'ITAR-free', market: 'HawkEye needs >200 export licences', ours: 'EU-sourced payload chain; EAR-only residual semiconductors' },
];
