# 05 — Risks, Programmatics, Cost, Schedule and Regulatory Framework

**Scope.** This chapter covers the "can we afford it, how long will it take, are we allowed to, and what will kill us" part of the feasibility study for a 100–150 kg LEO passive RF monitoring (SIGINT/ELINT-class) satellite built and operated from Greece/EU, growing into a TDOA/FDOA constellation (UHF, L, S, C, X band). It is written from a programme-manager / systems-engineer viewpoint. All figures are **ranges**; where a number is our own estimate rather than a sourced data point it is marked **[est.]**. Prices are quoted in the currency of the source; assume ~€1 ≈ $1.10–1.15 for rough conversions. Date of writing: 21 October 2026.

---

## 1. Cost model

### 1.1 Why public data points are scarce — and how we triangulate

Bus vendors (NanoAvionics, Blue Canyon, York, EnduroSat, OHB/BST, Satlantis) do not publish unit prices for ESPA-class platforms; payload NRE for SIGINT receivers is almost never disclosed. We therefore anchor the model on four kinds of public evidence:

1. **Government fixed-price awards** where the per-satellite figure can be inferred (e.g., SDA Tranche 0: York Space received ~$94M for 10 satellites in 2020 ≈ $9.4M per ESPA-class satellite including payload integration [28] — a US-defence-grade price, not a floor).
2. **Programme-level caps**, e.g. ESA's Scout class: a complete small EO mission (satellite, payload, launch, three years from approval to launch) capped at €35M (initially €30M) [26]; Greece's ESA-managed national smallsat programme: €60M for the satellite segment out of a €130M envelope that also funds an AIT facility and three optical ground stations [15][14].
3. **Company-level capital raised vs satellites fielded** (HawkEye 360, Unseenlabs, Kleos) — crude but honest unit economics (see §1.4).
4. **Published list prices** that exist: SpaceX rideshare ($350k for up to 50 kg + $7,000/kg above that, SSO) [1]; insurance market rates [18][19]; ITU cost-recovery fees [21][31].

### 1.2 Cost elements (per satellite unless noted)

| Element | Range | Basis / notes |
|---|---|---|
| **Bus, ESPA-class 100–150 kg** (structure, EPS, ADCS with star tracker + reaction wheels, GNSS, OBC, S-band TT&C, X-band TX, electric or green propulsion) | **€3.0–7.0M recurring; first unit +30–60%** [est.] | NanoAvionics MP42 (Gen-2, 40–50 kg payload, 150 kg launch mass; >€10M booked for five Gen-2 buses → low-€M each but mix unknown) [16][17]; US vendors (Blue Canyon X-SAT, York S-Class) typically higher and ITAR-laden. Deployable antennas, precision timing and EMC-driven layout push toward the top of the range. |
| **SIGINT payload — NRE** (RFSoC wideband receiver(s) UHF–X, front-end filters/LNAs, downconverters for C/X, antenna suite, disciplined timing/GNSS, FPGA firmware, on-board detection/DSP, EMC qualification) | **€6–15M one-off** [est.] | Two to three receiver chain variants, EM + QM + FM, antenna development and range testing, firmware. Comparable: HawkEye 360 Pathfinder payload used three AD9361-based basebands + Zynq 7045, 70 MHz–6 GHz, 56 MHz IBW [9] — i.e. a first-generation payload can be modest; going to 100s of MHz IBW with RFSoC is where the NRE lands. |
| **Payload — recurring** | **€1.2–3.5M** [est.] | RFSoC devices are commercial (no rad-hard RFSoC exists) at ~$10–25k each; cost is dominated by filters, LNAs, antennas, timing, screening and test. |
| **AIT & environmental test** (TVAC, vibration/shock, EMC, mass properties, campaign labour) | **€0.5–1.5M** [est.] | Lower end if Greece's Hellenic AIT Facility (HAITF, under implementation with TVAC + vibration system) is usable [14]. |
| **Launch** (rideshare to SSO or mid-inclination) | **$1.0–1.8M per 100–150 kg satellite** | SpaceX list: 100 kg ≈ $700k, 150 kg ≈ $1.05M, excluding separation system, processing, logistics, insurance; non-SSO orbits "require a quote"; rebooking fee 5–10% [1]. Add $150–400k for deployer/integration via a broker (Exolaunch, ISILaunch, D-Orbit) [est.]. A cluster of 3 on one flight ≈ $3.5–5M. Dedicated European small launcher (Isar Spectrum, RFA One) when operational: €10–15M for ~1 t class [est.]. |
| **Insurance** | Launch + 1 yr: **5–12% of insured value** (GEO benchmark rose from <6% to ~10% in 2023) [19]; in-orbit: **1–3%/yr** [19]. Third-party liability (national licence condition): **€50–200k/yr** [est.] | Most LEO smallsats are **not** insured in orbit (<1% of active LEO satellites carry in-orbit cover); admin cost can exceed premium for small policies; blanket policies for ≥10 satellites cut overhead ~25% [19]. 2025 was a profitable, softening year for underwriters [18]. |
| **Ground segment — GSaaS** | **€40–250 per pass** [est.]; AWS and KSAT/Leaf price per antenna-minute, narrowband (<40 MHz) vs wideband (≥40 MHz), on-demand vs 12-month reserved [20] | 1 satellite × 4–6 X-band passes/day ≈ €120–400k/yr; 12 satellites ≈ €1.5–4M/yr. An owned X-band/S-band station in Greece (3–5 m, dual-band) costs **€1.0–2.5M capex + €0.2M/yr** [est.] and removes a security dependency. |
| **Mission control & data platform software** | **€0.2–0.6M/yr** licences/cloud [est.]; or €1–3M to build | Off-the-shelf MCS (e.g., commercial flight dynamics + M&C) plus cloud for I/Q storage and processing; raw I/Q volumes for wideband collection dominate storage/egress. |
| **Operations staffing** | 1 sat: **4–6 FTE** (€0.5–0.8M/yr); 3 sats: 6–9 FTE; 12 sats: 10–15 FTE incl. RF analysts and tasking desk [est.] | Automated pass scheduling and anomaly detection keeps growth sub-linear. |
| **Regulatory / licensing** | ITU cost recovery **CHF ~10–60k per non-GSO filing** [est., Decision 482 structure] [21][31]; Greek national authorisation fee **not yet defined** (implementing JMD not adopted) [13]; legal/compliance **€0.2–0.5M** over Phase A–D [est.] | Includes export-control classification, frequency coordination support, debris mitigation plan, environmental impact reports required by Law 4508/2017 [13]. |
| **Programme management, systems engineering, product assurance** | **12–20% of hardware cost** [est.] | ECSS-tailored PA, configuration management, reviews. |
| **Contingency** | **20–30%** at Phase A; 10–15% at CDR | Standard for first-of-kind payload. |

### 1.3 Scenario totals

| Scenario | Capex (cumulative) | Opex per year (steady state) | Duration to IOC | Notes |
|---|---|---|---|---|
| **(a) 1 demonstrator** (150 kg, 2–3 receiver chains, single-satellite geolocation) | **€18–35M** [est.] | **€2–4M/yr** | 30–42 months | Payload NRE dominates (~40–50%). Comparable envelope: ESA Scout cap €35M for a full small mission in 3 years [26]. |
| **(b) 3-satellite cluster** (TDOA/FDOA capable, one orbital plane) | **€40–65M** cumulative (incremental €22–35M over (a)) [est.] | **€4–7M/yr** | +18–24 months after (a) | Recurring payload + bus ≈ €5–9M per satellite incl. launch; ground segment scaled; formation flying/propulsion must be in the bus. |
| **(c) 12-satellite constellation** (4 planes × 3, or 3 clusters + spares) | **€110–170M** cumulative [est.] | **€12–22M/yr** (incl. replenishment reserve) | +36–48 months after (b) | Learning-curve reduction ~10–15% per doubling [est.]; replenishment at 5–7 yr life implies ~2 satellites/yr steady state. |

Per-year opex includes ground segment, operations staff, cloud/processing, insurance (liability), licence maintenance and a small sustaining-engineering team; it excludes sales/G&A and analytics product development (another €2–6M/yr for a commercial entity [est.]).

### 1.4 Reality check against operators that actually did it

| Operator | Capital raised | Satellites fielded | Implied capital per satellite | Comment |
|---|---|---|---|---|
| **HawkEye 360** (US, founded Sept 2015) | $378M pre-IPO (Series B $70M 2019; C $55M 2021; D $145M 2021; D-1 $68M 2023) + $150M debt/equity Dec 2025 + $23M Series E extension Mar 2026; IPO May 2026 net $435.9M [6][7][8] | 36 Hawks (12 clusters × 3) + Kestrel-0A + 2 ex-Maxar spectrum-scanning satellites by mid-2025; +6 in Q1 2026 (Clusters 13–14) [6][7] | ~$10M per satellite of total capital (satellites are small: Pathfinder 13.4 kg [9]) | Q1 2026 revenue $49.8M (+116% YoY), net loss $9.0M, backlog $285M [7]. Took ~10 years and >$500M to reach ~$200M revenue run-rate. |
| **Unseenlabs** (France, founded 2015) | ~€120M total incl. €85M Series C (Feb 2024) [11] | 11 in orbit at Series C; target 25 by 2025 [11] | ~€10M per satellite of total capital | Single-satellite geolocation architecture (no cluster); 4–6 h revisit with 11 satellites [11]. |
| **Kleos Space** (Luxembourg/ASX, founded 2017) | Serial small raises (A$19M Nov 2020 [4]; $9.3M 2021 [5]; debt facility Aug 2022 [3]); order of A$60–80M lifetime [est.] | 16 satellites in four 4-sat clusters (KSM1 Nov 2020; KSF1 Vigilance; KSF2 Patrol; KSF3 Observer) [3][4] | ~A$4–5M per satellite | 2022 revenue €272k vs loss €11.3M; bankruptcy filed 26 July 2023 [2]. See §5.1. |
| **ESA Scout class** | €35M cap per mission incl. launch [26] | 1 small satellite | €35M | Institutional benchmark for "one small satellite + payload + launch in 3 years". |
| **Greek national smallsat programme (GNTS)** | €60M satellites / €130M total (RRF-funded, ESA-managed, Ministry of Digital Governance) [15][14] | 11 satellites (mostly CubeSats, several Greek universities/SMEs; launches 2025–26) [14] | ~€5.5M per (mostly cubesat-class) satellite incl. programme overheads | Shows Greek industrial base can execute Phase B–D under ESA management, and builds a national AIT facility [14]. |

**Takeaway.** Our scenario (a)–(c) totals are consistent with these anchors: a credible first operational SIGINT constellation of ~12 ESPA-class satellites is a **€100–170M, 7–9 year** undertaking before considering commercial G&A. Companies that raised less than ~€100M before reaching a revenue-generating constellation (Kleos) failed; those that survived raised €120M–$500M+.

---

## 2. Schedule

### 2.1 Phases, durations and reviews (ECSS-M-ST-10 nomenclature, tailored)

| Phase | Content | Duration (demonstrator) | Exit review |
|---|---|---|---|
| **Phase 0 / A** — Mission analysis & feasibility | Needs, CONOPS, architecture trades (hosted / pathfinder / 150 kg), cost/schedule, regulatory path, funding plan | 6–9 months | MDR → **PRR/SRR** |
| **Phase B** — Preliminary definition | Requirements baseline, bus selection and contract, payload breadboards (RF chain, timing, FPGA), antenna prototypes, ITU filing started, licence application started | 9–12 months | **PDR** |
| **Phase C** — Detailed definition | EM payload, EMC/self-interference test with bus EM, firmware, ground segment design, launch booking (12–18 months before flight) | 9–12 months | **CDR** |
| **Phase D** — Qualification & production | QM/FM payload, bus FM, AIT, environmental test, end-to-end RF compatibility test, ops rehearsals | 10–14 months | **QR → AR**, ORR, **FRR** |
| **Launch campaign** | Shipment, integration to deployer, launch | 2–4 months (slot-dependent) | LRR |
| **E1 — Commissioning** | Bus checkout, payload calibration against known emitters, antenna pattern verification, timing characterisation | 3–6 months | **CRR / IOC** |
| **Total kick-off → IOC** | | **36–48 months** | |

Realistic comparators (founding → first launch): HawkEye 360, Sept 2015 → 3 Dec 2018 (39 months) [6]; Kleos, 2017 → 7 Nov 2020 (~42 months, after a months-long launch slip that strained liquidity) [4][5]; Unseenlabs, 2015 → Aug 2019 (~48 months) [11]. Greek GNTS: programme start March 2019 → CDR of seven missions Dec 2024 → launches 2025–26 [14] — a reminder that institutional, multi-stakeholder programmes run slower than start-ups. Plan the demonstrator for **42 months** with a 6-month float.

### 2.2 Long-lead items

| Item | Typical lead time [est. unless noted] | Mitigation |
|---|---|---|
| Rad-tolerant/space-grade FPGAs (Kintex UltraScale XQRKU060, Microchip RTG4/PolarFire) | 12–18 months, allocation-driven | Order at PDR; design RFSoC (commercial) + rad-tolerant supervisor so the supervisor part is the only long-lead |
| Star trackers (EU: Sodern, Jena-Optronik, Terma; or bus-vendor integrated) | 9–14 months | Buy via bus vendor's frame contract |
| Propulsion (electric or green-mono) | 12–18 months | Fix thruster at SRR; qualification heritage required |
| Deployable antennas (UHF/L helices, log-periodic, X-band reflectarray or patch arrays) | 12–24 months for custom; 6–9 for catalogue | Baseline catalogue items; custom only where link budget demands |
| Chip-scale atomic clock / OCXO + GNSS disciplined timing | 6–12 months | Dual-source |
| Launch slot (rideshare) | Book 12–18 months ahead; delays common; 5–10% rebooking fee at SpaceX [1] | Book two options; design orbit-agnostic (SSO and 45–55°) |
| Environmental test facility slots | 3–6 months booking | HAITF in Greece [14], or ESA/ESTEC, IABG, Intespace |
| Export licences for US parts (if any) | 2–6 months per licence | Decide ITAR-free at SRR (see §3.4) |

### 2.3 ECSS tailoring for a smallsat programme

Full ECSS compliance would double cost and schedule. Apply the ESA practice for IOD/smallsat missions: tailor **ECSS-M-ST-10** (project planning), **ECSS-E-ST-10** (system engineering), **ECSS-E-ST-10-03** (testing, reduced environmental matrix: proto-flight approach), **ECSS-Q-ST-60-13** (commercial EEE parts with screening and radiation lot testing rather than Class 1/2 parts), **ECSS-Q-ST-70** (materials), and keep **ECSS-E-ST-50** series only where the ground segment interoperates with ESA/third-party stations (CCSDS). Document the tailoring in a Product Assurance Plan accepted by the funding agency at SRR; this is what ESA Scout contractors do to hit the €35M/3-year envelope [26].

---

## 3. Regulatory and legal framework

### 3.1 National authorisation in Greece

- **Law 4508/2017** ("Licensing of space activities – Registration in the National Register of Space Objects"), amended by **Law 4712/2020**, is the Greek national space law. Authorisation is granted by decision of the **Minister of Digital Governance**; conditions include adequate provision for mitigation/management of space debris and non-contamination; operators must file environmental impact reports before launch, after launch and at end of life; the Minister may require insurance; the implementing Joint Ministerial Decision on report content and technical standards had **not yet been adopted** as of February 2025, so existing international/ESA standards apply in the interim [13].
- The **Hellenic Space Center (HSC/ΕΛΚΕΔ)**, created in 2019 under the Ministry of Digital Governance, is the national space agency and technical advisor; the GNTS programme is run by the Ministry with ESA as procurement agent [14]. Expect HSC to be the technical assessor for a licence application and the custodian of the National Register entry (UN Registration Convention).
- **Spectrum**: the Greek administration notifies ITU filings through **EETT** (Hellenic Telecommunications & Post Commission) with the Ministry; national frequency assignment for TT&C and downlink is required in parallel.
- **Timeline**: allow **12–18 months** from first contact to licence, since the implementing framework is young and a passive RF intelligence payload has no Greek precedent. Engage HSC/Ministry informally in Phase A.

### 3.2 EU Space Act (proposal of 25 June 2025) — status

The Commission proposal (COM(2025) 335) introduces EU-wide authorisation, cybersecurity/resilience and environmental-footprint obligations for operators. Status as of March 2026: Council presidency compromise text (5 Dec 2025); Parliament suggested revisions (3 Mar 2026); no agreement yet. Application: Commission proposed 1 Jan 2030; Council and Parliament propose 36 months after entry into force. Authorisation handled by the Member State of main establishment with a 12-month (Council) or 6-month (Parliament, with deemed approval) decision window; cybersecurity either a bespoke resilience chapter or full NIS2 applicability; environmental footprint calculation/estimate; fines up to 2% of worldwide turnover (Commission text). Assets launched before application (Commission: before 2030; Council: <36 months after entry into force) are grandfathered [12].

**Implication**: a demonstrator launched 2029–2030 will likely be grandfathered, but the cluster/constellation will fall under the Act. Design the ground segment to **NIS2** from day one and keep a debris/footprint file.

### 3.3 ITU frequency filing and coordination

| Topic | What applies |
|---|---|
| Bands | TT&C in S-band (2025–2110 MHz up / 2200–2290 MHz down, Space Operations/EESS/Space Research); wideband downlink in X-band 8025–8400 MHz (EESS). A passive RF-sensing mission is defensible as EESS (sensing of the Earth environment); confirm the service classification with EETT early. Receive-only sensing bands require **no** ITU filing but offer no protection. |
| Procedure | For non-GSO networks subject to coordination (Art. 9.11A bands) the API step was abolished; file **Coordination Request (CR/C)** → coordination with affected administrations → **Notification (N)** and bringing into use within the **7-year** regulatory period. For non-coordinated bands: **API** only. |
| Timelines | Filing publication 4–6 months; coordination 12–36 months; plan to file at **PDR (−30 months to launch)**. |
| Costs | ITU cost recovery under **Council Decision 482 (as modified 2024)**: flat fee per filing plus per-unit charges, non-GSO filings typically in the **CHF 10–60k** range depending on complexity [est.] [21]; administrations may add their own fee (Ofcom's cost-recovery regime is a public example) [31]. |
| Risk | Mid-inclination orbits and 8 GHz X-band are congested with EO constellations; coordination delays and EPFD-type constraints are a schedule risk (see risk register T-15). |

### 3.4 Orbital debris and disposal

- **IADC guidelines / ISO 24113**: 25-year post-mission disposal; **FCC 5-year rule** (adopted Sept 2022; in force for US-licensed and US-market-access satellites launched after Sept 2024) [30]; **ESA Zero Debris approach** (ESA missions from 2030: ≤5 years disposal, ≥90% successful disposal probability) and the **Zero Debris Charter** (2023, signed by many states and companies); the **draft EU Space Act** codifies disposal/collision-avoidance obligations for EU operators [12]. Insurers reward Charter compliance with lower deductibles [19].
- **Design consequence**: at 500–550 km a 150 kg satellite with ~1 m² drag area decays in roughly 5–15 years uncontrolled [est.] — borderline. Baseline **propulsion with ≥50 m/s reserved for disposal** (also needed for cluster formation keeping) and/or a drag augmentation device; passivation at EOL; conjunction-assessment subscription (EU SST or commercial).

### 3.5 Export control

| Regime | Relevance |
|---|---|
| **US ITAR (22 CFR 121)** | USML **Category XI(a)** covers electronic systems specially designed for SIGINT/ELINT/electronic support; **Category XV(a)** explicitly captures spacecraft that perform SIGINT/ELINT or other defined military functions, plus XV(e) components (e.g., space-qualified rad-hard ICs, certain star trackers, cryptography). A satellite *designed for SIGINT* that contains **any** ITAR-controlled item becomes an ITAR-controlled end-item for US-origin content, with re-export and end-user restrictions (NATO ally Greece is licensable, but onward sale to non-NATO customers is constrained and US DDTC agreements (TAA/MLA) add 4–9 months). **Verify the exact USML paragraphs with counsel.** |
| **US EAR (15 CFR 774)** | **9A515** (commercial spacecraft and components; Oct 2024 interim final rule removed licence requirements for many 9A515 items to 40+ allies and reclassified less-sensitive items to NS2/RS2) [22]; **3A001.a.5** high-speed ADCs/DACs (RFSoC ADCs at multi-GSPS are controlled → US export licence or licence exception needed even for Greece); **5A002** encryption. EAR items embedded in a European satellite trigger US re-export jurisdiction if de minimis thresholds are exceeded (and **no de minimis for 9x515 .a–.x items going to certain destinations**). |
| **EU Regulation 2021/821 (dual-use)** | Annex I: **Cat 3** (3A001 ADCs, rad-hard ICs), **Cat 5 Part 1** (5A001 telecom incl. interception-related equipment; 5A001.f mobile interception) and Part 2 (crypto), **Cat 9** (9A004 spacecraft, 9A515-like entries), **Cat 7** (ADCS/inertial). Intra-EU transfers are free except Annex IV items; exports outside the EU need Greek national authorisation (Ministry of Development / MFA for military list). The **EU Common Military List** (Council Common Position 2008/944) **ML11** (electronic equipment, incl. ELINT/SIGINT) can capture a purpose-built SIGINT satellite as a *military* item requiring arms-export licensing under Greek Law 2168/1993 — classification at SRR is a gating activity. |
| **Wassenaar** | Source of the control lists above; the GNSS/timing and ADC entries are the ones most likely to bite a wideband receiver. |

**"ITAR-free" design** is achievable at ESPA-class: European bus (NanoAvionics, OHB/BST, EnduroSat), European star trackers/wheels/propulsion, European LNAs/filters and antennas; the hard spots are **RFSoC/high-speed ADCs** (AMD/Xilinx, Analog Devices — US EAR, licensable to Greece but attracting re-export conditions) and **rad-tolerant FPGAs** (Microchip is US; NanoXplore is the French alternative). A pragmatic compromise: EAR-only US content, no ITAR content, so that the satellite remains an EU dual-use item and sales to non-US-aligned but EU-approved customers (e.g., Gulf, Indo-Pacific partners) need EU rather than US consent.

### 3.6 Legal basis for passive RF collection from space

- **What is collected.** The system is designed to measure **externals** — frequency, bandwidth, modulation class, timing, power, direction/geolocation, activity patterns — not the **content** of communications. This distinction is the backbone of how HawkEye 360, Unseenlabs and Kleos operated commercially: they market "RF geolocation and signal characterisation", not content.
- **Greece.** Article 19 of the Constitution protects the secrecy of correspondence and communications; lifting of secrecy is governed by Law 2225/1994 and Law 5002/2022 (post-2022 reform, ADAE oversight), which address interception of communications by state authorities, and criminal-code provisions on unlawful interception. A commercial operator that **does not demodulate or store content** and treats emitters (radars, data links, jammers, AIS/VHF beacons) as physical phenomena operates outside the interception regime; collection of **content-bearing** signals (satphone, HF/VHF voice, cellular) for anything other than technical characterisation would require either (i) a state mandate under Law 3649/2008 (EYP) / 5002/2022, or (ii) a strict technical policy of immediate discard. **Obtain a written legal opinion in Phase A.**
- **EU.** ePrivacy Directive 2002/58/EC Art. 5 (confidentiality of communications over public networks) and the GDPR apply when data are personal; emitter metadata becomes personal data when it can identify a natural person (e.g., a small vessel's MMSI linked to an owner, a satphone terminal). Apply data-protection-by-design: pseudonymise identifiers, define retention, run a DPIA for any product touching civil communications.
- **ECHR.** *Big Brother Watch v UK* and *Centrum för rättvisa v Sweden* (Grand Chamber, 2021) accept bulk interception for national security with end-to-end safeguards; relevant if a Greek state customer tasks the system, and it argues for a clear tasking/oversight protocol in the government service agreement.
- **International law.** Passive sensing from orbit is lawful under the Outer Space Treaty (freedom of use; Remote Sensing Principles 1986 by analogy); no state consent is needed to observe emissions reaching orbit.

### 3.7 Classified data handling and customers

- Products for the Hellenic MoD/NATO will attract classification (NATO RESTRICTED–SECRET; EU RESTRICTED–SECRET under Council Decision 2013/488/EU). The company needs a **Facility Security Clearance** from the Greek National Security Authority and cleared personnel, segregated classified enclave (air-gapped processing, SECRET-accredited ground link if tasking is sensitive), and an **unclassified commercial product line** run in parallel.
- Sales to **non-NATO** customers: EU dual-use/military export licence (Greek), end-user certificates, and — if any US content — US re-export consent. Design the commercial product tiers so that the most sensitive capabilities (e.g., specific radar fingerprints) are government-only.
- **GDPR**: metadata catalogues are largely non-personal (platform emitters), but any civil-maritime or cellular-adjacent data need lawful-basis analysis (legitimate interest for maritime safety/security is the common route).

---

## 4. Technical risk register

Scoring: likelihood L (1 rare – 5 almost certain) × impact I (1 negligible – 5 mission loss). Scores ≥ 12 are red.

| ID | Risk | Cause | Consequence | L | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|---|---|
| T-01 | Deployable antenna fails to deploy or deploys out of tolerance | Hinge/HDRM failure, thermal gradients, stowage damage | Loss of UHF/L sensitivity or X-band downlink; mission degraded | 2 | 5 | 10 | Catalogue mechanisms with heritage; deployment test ×10 at ambient/TVAC; redundant release; fallback body-mounted patch for TT&C | Payload lead |
| T-02 | Self-interference / EMC (TT&C, X-band TX, DC-DC, OBC clocks leak into sensitive receiver) | Co-located wideband receiver and transmitters on a small bus | Raised noise floor, false detections, lost sensitivity in bands of interest | 4 | 4 | 16 | Early EMC budget; EM-level bus+payload RF compatibility test; transmit blanking windows; filtering; shielding; "quiet mode" ops | Systems eng. |
| T-03 | Timing synchronisation below TDOA budget | GNSS receiver jitter, OCXO drift, FPGA timestamp latency, inter-satellite clock bias | Geolocation error exceeds spec (TDOA needs ~10–50 ns) | 3 | 4 | 12 | GNSS-disciplined OCXO/CSAC; hardware timestamping at ADC; on-ground clock-bias estimation from known emitters; characterise in commissioning | DSP lead |
| T-04 | FPGA/RFSoC SEU, SEFI or latch-up | Commercial RFSoC in LEO radiation | Payload resets, data corruption, permanent damage | 4 | 3 | 12 | Current-limiting latch-up protection; scrubbing; watchdog; rad-tolerant supervisor; radiation lot testing (ECSS-Q-ST-60-13); shielding; duty cycling over SAA | Payload lead |
| T-05 | Downlink bottleneck | Wideband I/Q volume vs X-band pass time and ground-station availability | Data latency; dropped collections | 4 | 3 | 12 | On-board detection/compression; downlink only cued snippets + metadata; ≥2 GSaaS providers; Greek X-band station; optical downlink later | Ground seg. |
| T-06 | Data volume vs processing | Many signals, wide bandwidth, limited OBC/cloud budget | Backlog, cost overrun in cloud | 3 | 3 | 9 | Tiered processing; edge detection; cloud cost model with caps | Data platform |
| T-07 | Geolocation accuracy below spec | Single-satellite AoA/Doppler limits; poor geometry; clock errors | Product does not meet customer CEP | 3 | 4 | 12 | Realistic KPIs by phase (demonstrator: 5–20 km single-sat; cluster: 1–3 km); calibration against known emitters | Systems eng. |
| T-08 | Thermal of high-power RFSoC/FPGA | 20–40 W dissipation in a small bus, duty cycle | Derating, reduced collection time | 3 | 3 | 9 | Thermal straps/heat pipe, duty cycling, thermal model validation in TVAC | Thermal |
| T-09 | ADCS pointing insufficient for directional antennas | Reaction wheel/star tracker performance, jitter | Reduced gain on target, X-band downlink margin lost | 2 | 3 | 6 | Specify ≤0.1° pointing (standard on MP42-class); wide-beam fallback | Bus vendor |
| T-10 | GNSS receiver loss or jamming/spoofing in orbit | Receiver failure, interference in GNSS bands (the very thing we monitor) | Timing and orbit knowledge degraded | 2 | 4 | 8 | Dual GNSS receivers (Galileo+GPS), holdover oscillator, ground orbit determination via ranging/TLE | Payload lead |
| T-11 | Cluster formation drift | Propulsion performance, differential drag, ops errors | TDOA baselines degrade | 3 | 3 | 9 | Propulsion sized for formation keeping; differential-drag strategies; automated station-keeping | Flight dyn. |
| T-12 | Launch delay or failure | Rideshare manifest slips; launcher failure | 6–12 month slip; loss of satellite | 4 | 4 | 16 | Two launch options; design orbit flexibility; launch insurance for the FM; schedule float; spare long-lead parts | PM |
| T-13 | Supplier insolvency / exit | Smallsat supplier fragility (e.g., UTIAS SFL ceased manufacturing, continuing via SFL Missions Inc.) [27] | Bus or component unavailable mid-programme | 3 | 4 | 12 | Dual sourcing of critical items; escrow of design data; financial due diligence; EU-based suppliers | Procurement |
| T-14 | Export licence refusal or delay | US controls on RFSoC/ADC/FPGA; ML11 classification | Redesign, 6–12 month slip, market restrictions | 3 | 4 | 12 | ITAR-free baseline; early classification; European alternatives (NanoXplore, Teledyne e2v ADCs); licence applications at PDR | Legal/export |
| T-15 | Spectrum / ITU coordination delays | Congested S/X bands, mid-inclination orbits | Cannot bring into use; forced band change | 3 | 3 | 9 | File at PDR; use standard EESS/SO bands; coordinate via EETT early; design agile TT&C | Spectrum lead |
| T-16 | Ground-station availability | GSaaS contention, outages, geopolitics | Missed passes, latency | 3 | 3 | 9 | Multi-provider; owned Greek station; store-and-forward | Ground seg. |
| T-17 | Cyber-attack on ground segment / data | Nation-state interest in a SIGINT constellation | Loss of control, data exfiltration, licence breach (NIS2/EU Space Act) | 3 | 5 | 15 | Zero-trust architecture; encrypted TT&C (AES-256), HSM key management; NIS2 compliance; red-team; classified enclave | CISO |
| T-18 | Radiation lifetime shortfall | COTS parts in 500–600 km, TID/DD | Satellites die at 18–24 months vs 5-year design (Kleos warned exactly this) [2] | 3 | 4 | 12 | Lot testing, shielding, derating; plan 3-year warranted life with 5-year goal; replenishment reserve in financial plan | PA |
| T-19 | Debris collision / conjunction load | Congested 500–600 km shells | Loss of asset; ops burden | 2 | 5 | 10 | Propulsion + CA service; Zero Debris Charter compliance; altitude choice | Flight dyn. |
| T-20 | Antenna/receiver calibration drift | Thermal cycling, aging | Biased power/AoA measurements | 3 | 2 | 6 | Periodic calibration using known emitters/beacons | DSP lead |

Secondary mitigations common to many rows: a **pathfinder flight** (hosted payload or 12U/16U) retires T-02, T-03, T-04, T-05 and T-18 before committing the ESPA-class FM (see §6.4).

---

## 5. Programmatic and commercial risks — lessons learned

### 5.1 Case study: Kleos Space (2017–2023)

**Timeline.** Luxembourg company listed on ASX in 2018; first 4-satellite "Scouting Mission" (KSM1) launched on PSLV on 7 Nov 2020 after a months-long delay that left liquidity "tenuous" [5]; raised A$19M in Nov 2020 for the next clusters [4]; KSF1 Vigilance (2021), KSF2 Patrol (2022), KSF3 Observer (Jan 2023) followed; 2022: revenue €272k vs net loss €11.3M, ~60% of revenue from US defence [2]; early 2023 the company warned that satellites designed for 5 years would likely live ~18 months [2]; 3 May 2023 voluntary trading suspension [3]; 7 July 2023 ASX update: still negotiating a secured converting note, financier allowed only A$650k more drawdown "through the second half of July", one satellite each in KSF2 and KSF3 impaired (≤50% chance of recovery, €1.5M non-cash) [3]; principal creditor Pure Asset Management withdrew funding and called loans; **bankruptcy filing announced 26 July 2023** [2][32].

**Causes.**
1. **Under-capitalisation and financing structure** — serial small equity placements and a single secured lender; a converting-note process stalled on market timing and the lender pulled the plug within weeks [2][3].
2. **Technical reliability** — short in-orbit lifetime and cluster-level satellite losses undercut the data product just as it was supposed to scale [2][3].
3. **Revenue lag** — four clusters in orbit but <€0.3M revenue in 2022; defence procurement cycles are longer than start-up runways [2].
4. **Dependence on launch cadence** — each launch slip was existential because the business plan required cluster revenue to fund the next cluster [5].

**Lessons for this programme.** Secure funding to the *cluster* (not just the demonstrator) before launching the demonstrator; treat lifetime/radiation as a first-class requirement; sign anchor-customer contracts (government) that pay on milestones during development; avoid single-lender debt before revenue.

### 5.2 HawkEye 360 — iterating from a 13 kg pathfinder to a 39-satellite business

Pathfinder (Cluster 1, Dec 2018): three 13.4 kg SFL NEMO-15 buses, water electrothermal propulsion (~96 m/s), payload of three AD9361-based receivers on a Zynq 7045 (70 MHz–6 GHz, 56 MHz IBW), 125 km spacing with 5 km (1σ) formation control, only two of three satellites actively controlled due to power limits [9]. Cluster 2 (Jan 2021, IOC Mar 2021) brought "up to 10× collection capacity", wider frequency range, GNSS-interference monitoring with a dedicated antenna, more onboard processing and redundancy [10]; Cluster 3 onward added redundant systems and expanded coverage; Cluster 11 (2024) multi-band simultaneous capture and more bandwidth; Pathfinders were decommissioned by end-2024 [9][6]. The company moved from outsourced buses (SFL) to in-house build with SFL support [6], acquired Maxar's RF Solutions unit (ex-Aurora Insight spectrum-mapping satellites) in Dec 2023 [29][6], raised $378M pre-IPO, listed on NYSE in May 2026 ($435.9M net) and reported Q1 2026 revenue of $49.8M with a $285M backlog [6][7]. **Lesson:** the first cluster was deliberately *small and cheap* to prove the geolocation chain; power, redundancy and collection bandwidth were the gaps fixed in generation 2; scale and a US government customer base did the rest.

### 5.3 Spire Global — the data-only business is hard

Spire (RF-based weather/AIS/ADS-B, ~100 satellites) sold its maritime business to Kpler for $241M (announced Nov 2024) to deleverage and refocus on space services and weather [25]. **Lesson:** even a mature RF-sensing constellation struggled to monetise pure data; "space services" (hosted payloads, build-to-order) and government contracts carry the economics.

### 5.4 Aurora Insight → Maxar → HawkEye 360

Aurora Insight (Colorado, spectrum mapping with small satellites) was bought by Maxar in 2022, then divested to HawkEye 360 in Dec 2023 [29][6]. **Lesson:** spectrum-monitoring as a standalone commercial niche consolidates into the SIGINT leader; a European entrant needs a differentiated (sovereign, regional, government-anchored) rationale rather than competing head-on in the US market.

### 5.5 Supplier fragility

UTIAS Space Flight Laboratory — builder of HawkEye 360's early clusters — has ceased satellite manufacturing within the University of Toronto, with activity continuing in a separate company, SFL Missions Inc. [27]. Several European smallsat component suppliers have been acquired or restructured in 2024–26. **Lesson:** T-13 is not theoretical; contractually secure design data and second sources.

### 5.6 Funding environment 2024–2026 (Europe, defence/dual-use space)

- European "Defence, Security and Resilience" start-ups raised a record **$8.7B** in 2025, +55% YoY and ~4× 2020, driven by late-stage mega-rounds (Dealroom/NATO Innovation Fund) [23].
- **NATO Innovation Fund** (24 allies, ~€1B) has space holdings incl. SatVu, Isar Aerospace, Kreios Space and Simera Sense; investments carry no procurement guarantee [23].
- **EU instruments**: European Defence Fund (~€8B 2021–27, annual calls incl. space/ISR), EDIP, and the 2025 SAFE loan facility (€150B) for joint procurement; **EIB** widened eligibility for defence/dual-use in 2024–25; ESA programmes (GSTP, InCubed, Scout, ARTES) remain the natural source for Phase A–B technology money. **[verify current call cycles]**
- **Greece**: the **Hellenic Centre for Defence Innovation (HCDI/ΕΛΚΑΚ)** runs investor-access programmes (Bpifrance EuroQuity partnership, European Defence Alliance network, "Pitch Arena" since early 2026 where 45+ start-ups sought >€101M from 22 VCs) [24]; Greece ranks highly in EDF project participation [24]; the RRF-funded GNTS proved the national procurement route through ESA [14][15]. Greece's multi-year armaments plan ("Achilles' Shield", 2025–2036) includes space/ISR lines **[verify allocation]**.
- **Positioning**: dual-use (maritime domain awareness, GNSS-interference monitoring, spectrum regulation support for EETT, SAR cueing) widens the funding base and eases export; the defence-grade products (emitter catalogues, AEW&C/naval ELINT) are the margin.

### 5.7 Programmatic/commercial risk list

| ID | Risk | L | I | Score | Mitigation |
|---|---|---|---|---|---|
| P-01 | Funding gap between demonstrator and cluster (the Kleos trap) | 4 | 5 | 20 | Raise/commit for demonstrator **and** cluster before FM launch; milestone-paid government anchor contract; EDF/ESA co-funding |
| P-02 | Customer concentration (single government) | 4 | 4 | 16 | NATO/EU agencies (EU SatCen, FRONTEX, EMSA), allied MoDs, spectrum regulators, maritime insurers |
| P-03 | Competition at scale (HawkEye 360: 40+ satellites, $285M backlog, public) [7] | 4 | 3 | 12 | Sovereign-EU positioning, regional persistence (Eastern Med/Black Sea/Aegean), band coverage to X, data fusion with national assets |
| P-04 | Key-person dependency (RF/DSP leads) | 3 | 4 | 12 | Documentation, pairs, retention equity, partner with university labs (AUTh, NTUA, DUTH have GNTS heritage [14]) |
| P-05 | Regulatory precedent risk (first Greek SIGINT licence) | 3 | 4 | 12 | Early engagement with Ministry/HSC/EETT; frame as EESS/RF-environment monitoring; legal opinion |
| P-06 | Export-control constraints on sales | 3 | 3 | 9 | ITAR-free; EU-origin where feasible; product tiering |
| P-07 | Launch market disruption (price rises, manifest slips) | 3 | 3 | 9 | Multi-provider; European launchers as they mature |
| P-08 | Reputational/legal exposure from content collection | 2 | 5 | 10 | Externals-only policy, technical enforcement, audit |
| P-09 | Cost overrun on payload NRE (first-of-kind) | 4 | 3 | 12 | 25–30% contingency; pathfinder to de-risk; fixed-price bus |
| P-10 | Insurance unavailability / cost | 2 | 2 | 4 | Self-insure in orbit; launch-only cover; liability policy as licence condition |

---

## 6. Organisation and team

### 6.1 Roles

Payload RF engineers (front-end, antennas, EMC); DSP/FPGA engineers (RFSoC firmware, detection, timestamping); flight software; systems engineering and mission analysis (orbit/geometry, link and timing budgets); product/quality assurance; AIT/test; mission operations and flight dynamics; ground-segment/cloud and cyber security; RF/ELINT analysts (signature library, product generation); programme management and procurement; sales/government relations (MoD, NATO, EU agencies); legal/export/licensing/data protection.

### 6.2 Headcount by phase [est.]

| Phase | Core team (FTE) | Notes |
|---|---|---|
| Phase 0/A | 6–10 | Systems, RF, DSP, PM, business, legal (part-time) |
| Phase B | 15–22 | + antenna, FPGA, software, PA, procurement |
| Phase C/D (demonstrator) | 25–35 | + AIT, ground segment, ops preparation, analysts |
| Operations + cluster build | 35–50 | Ops 6–9; analysts 5–8; sales/GR 3–5; engineering for cluster |
| Constellation | 60–90 | Production engineering, 24/7 ops, product teams |

Comparator: HawkEye 360 reached a few hundred staff by its 39-satellite stage; Unseenlabs ~100–150 at 11 satellites [est. from public profiles].

### 6.3 Build-vs-buy

| Element | Recommendation | Rationale |
|---|---|---|
| Bus (incl. ADCS, EPS, propulsion, TT&C, X-band TX) | **Buy** (European ESPA-class vendor, fixed price, with RF-quietness and timing-interface requirements in the spec) | Not a differentiator; vendors deliver in 18–24 months; keeps ITAR exposure manageable |
| RF front-end (LNAs, filters, downconverters) | **Buy** components / **co-develop** modules with an EU RF house | Mature supply base; EMC performance is integration work |
| Antennas | **Partner** with an EU antenna specialist; own the requirements and range testing | Long-lead and failure-prone (T-01); heritage matters |
| Digital receiver, firmware, timestamping, on-board detection | **Build** (core IP) | Determines sensitivity, bandwidth, and geolocation performance |
| Geolocation algorithms, signature library, analytics | **Build** (core IP), with academic partners | This is the product |
| Ground stations | **Buy** GSaaS + one owned Greek station | Security and sovereignty |
| Mission control software | **Buy** licence, customise | Commodity |
| Launch | **Buy** via broker; two options | Commodity, but schedule-critical |

### 6.4 Pathfinder strategy before the 150 kg satellite

| Option | Cost [est.] | Time to orbit | What it proves | What it does not |
|---|---|---|---|---|
| **Hosted payload** on a Greek/ESA cubesat or a partner microsat | €1.5–4M | 18–30 months (depends on host) | RFSoC radiation behaviour, firmware, timing chain, EMC on a real bus | No control over orbit, antennas or downlink; host schedule risk |
| **12U/16U pathfinder** with one UHF/L/S chain | €5–9M incl. launch | 24–30 months | Full chain end-to-end: antenna, receiver, timing, single-satellite geolocation, ground processing, licensing precedent | Limited power/aperture, no C/X band, no cluster |
| **Go straight to 150 kg demonstrator** | €18–35M | 36–48 months | Everything, at full performance | Highest first-flight risk; Kleos-type exposure if it under-performs |

**Recommendation:** run the **16U pathfinder in parallel with Phase B of the 150 kg satellite** (not sequentially), so that its flight results feed the CDR of the demonstrator. This mirrors HawkEye 360's 13 kg Pathfinder → larger Cluster 2 path [9][10] and costs ~20–25% of the demonstrator. If budget forbids both, the hosted-payload route on a GNTS-class national mission is the cheapest way to retire radiation/firmware/timing risk and to establish the Greek licensing precedent.

### 6.5 Partnering

- **Bus vendor**: frame agreement covering pathfinder + demonstrator + cluster options with price steps; joint EMC/timing interface development.
- **Ground**: KSAT/Leaf/AWS multi-provider; MoU with HSC for a Greek X/S-band station co-located with national infrastructure.
- **Analytics**: partner with a maritime-domain-awareness or geospatial analytics firm for first products; keep signature libraries in-house.
- **Institutional**: ESA (GSTP/InCubed/Scout-like), HCDI for defence access, EETT for spectrum, AUTh/NTUA/DUTH for talent and radiation/antenna test campaigns [14].

---

## 7. Decision gates and phased roadmap

| Gate | When | Go criteria (all required) | KPIs to be met before passing |
|---|---|---|---|
| **G0 — Feasibility close-out** | End Phase A (M9) | Legal opinion that externals-only collection is lawful under Greek/EU law; licensing path agreed with Ministry/HSC/EETT; export classification complete (ITAR-free baseline); cost estimate ±30% within €18–35M; ≥1 government LOI | Link/timing budgets closed on paper; antenna concept with heritage items; funding plan covering demonstrator **and** 50% of cluster |
| **G1 — Commit to pathfinder + Phase B** | M9–M12 | ≥€8–12M committed (pathfinder + Phase B); bus vendor selected; ITU filing strategy approved | Breadboard RF chain demonstrates target noise figure and IBW; timestamp jitter ≤ target in lab |
| **G2 — PDR / commit to FM build** | M21–M24 | Pathfinder results (or hosted payload) show RFSoC survives radiation environment with mitigation; EMC compatibility shown at EM level; launch option booked; licence application filed | Lab geolocation emulation within 2× of spec; cumulative funding ≥ demonstrator total |
| **G3 — Demonstrator IOC** | M42–M48 | Commissioning complete; ≥90% availability over 3 months; products delivered to anchor customer | Detection of reference emitters across UHF/L/S (C/X stretch); single-satellite geolocation CEP ≤10–20 km (multi-pass ≤5–10 km); downlink ≥ planned daily volume; no self-interference above budget |
| **G4 — Commit to 3-satellite cluster** | M48–M54 | Demonstrator KPIs met; funding ≥€25–35M incremental secured; ≥2 paying customers; licence extension & ITU coordination progressing | Clock-bias estimation shows TDOA feasibility; recurring cost per satellite ≤€8M incl. launch |
| **G5 — Cluster IOC** | M66–M78 | Formation maintained within budget; TDOA/FDOA products operational | Geolocation CEP ≤1–3 km for pulsed/burst emitters; revisit per region per spec; revenue run-rate covering opex |
| **G6 — Commit to constellation (12)** | M78–M84 | Revenue/backlog + funding ≥€60–100M; EU Space Act authorisation pathway clear; second production source qualified | Unit cost learning curve demonstrated; satellite lifetime ≥3 years confirmed on demonstrator |
| **G7 — Constellation IOC** | M114–M138 | ≥9 of 12 satellites operational | Regional revisit ≤2–3 h; catalogue update latency per customer SLA |

**Kill criteria** (no-go triggers): no lawful basis for the intended collection model; licence refusal or ITAR classification making EU-controlled sales impossible; pathfinder shows RFSoC lifetime <18 months without a credible fix; failure to secure cluster funding before demonstrator launch (do not launch into a funding cliff).

### 7.1 Roadmap summary

1. **2026 Q4–2027 Q3 — Phase 0/A**: feasibility (this study), legal/regulatory opinions, concept, funding (ESA/HCDI/EDF/VC), G0.
2. **2027 Q4–2028 Q4 — Phase B + 16U pathfinder build**; ITU filing; licence application; G1 → G2.
3. **2029 — Pathfinder flight; Phase C/D demonstrator**; HAITF test campaign; cluster financing round.
4. **2030 — Demonstrator launch and commissioning**; G3; anchor-customer service; grandfathered under EU Space Act (likely) [12].
5. **2031–2032 — Cluster of 3** (TDOA/FDOA); G4 → G5; NIS2/EU Space Act-compliant ground segment.
6. **2033–2036 — Constellation build-out to 12** in 3–4 planes; replenishment logistics; G6 → G7.

---

## Sources

[1] New Space Economy, "SpaceX Rideshare Pricing as of February 2026", 27 Feb 2026 — https://newspaceeconomy.ca/2026/02/27/spacex-rideshare-pricing-as-of-february-2026-what-it-costs-whats-included-and-how-buyers-budget-a-mission/
[2] Payload, "Kleos Space declares bankruptcy", July 2023 — https://payloadspace.com/kleos-space-declares-bankruptcy/
[3] Kleos Space ASX announcement, 7 July 2023 (financing update, satellite impairments) — https://announcements.asx.com.au/asxpdf/20230707/pdf/05rf835372ghm8.pdf
[4] Chronicle.lu, "Kleos Space raises €11.7M to progress next satellite clusters", 11 Nov 2020 — https://www.chronicle.lu/category/satellite/34582-kleos-space-raises-eur11-7m-to-progress-next-satellite-clusters
[5] Space Intel Report, Kleos Space raises $9.3M, liquidity "tenuous" after launch delay, 2021 — https://www.spaceintelreport.com/?p=79052
[6] Wikipedia, "HawkEye 360" (funding rounds, clusters, IPO May 2026, Maxar RF Solutions acquisition) — https://en.wikipedia.org/wiki/HawkEye_360
[7] HawkEye 360 Q1 2026 financial results (revenue $49.8M, backlog $285M, IPO net proceeds $435.9M) — https://finviz.com/news/362923/hawkeye-360-announces-first-quarter-2026-financial-results
[8] Via Satellite, "HawkEye 360 Adds $23M to Series E Funding", 4 Mar 2026 — https://www.satellitetoday.com/finance/2026/03/04/hawkeye-360-adds-23m-to-series-e-funding/
[9] eoPortal, "HawkEye 360" mission page (Pathfinder mass, payload, propulsion, formation; later clusters) — https://www.eoportal.org/satellite-missions/hawkeye
[10] SmallSat News, "HawkEye 360's Cluster 2 smallsats achieve IOC", 31 Mar 2021 — https://smallsatnews.com/2021/03/31/hawkeye-360s-cluster-2-smallsats-achieve-initial-operating-capabilities/
[11] European Spaceflight, "Maritime Surveillance Provider Unseenlabs Closes €85M Funding Round", Feb 2024 — https://europeanspaceflight.com/maritime-surveillance-provider-unseenlabs-closes-e85m-funding-round/
[12] Gleiss Lutz, "EU Space Act update: relationship to NIS 2, adjustments to scope and practical simplifications", 26 Mar 2026 — https://www.gleisslutz.com/en/know-how/eu-space-act-update-relationship-nis-2-directive-adjustments-scope-and-practical-simplifications
[13] UNOOSA, Greece national space law summary (Law 4508/2017 as amended by 4712/2020), updated 14 Feb 2025 — https://www.unoosa.org/documents/pdf/spacelaw/sd/Greece_updated20250214.pdf
[14] ESA, "ESA-managed Greek National Satellite Space Project meets key milestones", 20 Dec 2024 — https://resilience.esa.int/archives/news/esa-managed-greek-national-satellite-space-project-meets-key-milestones
[15] Geospatial World, "Greece announces €60M EO microsatellite constellation", 7 Feb 2024 — https://geospatialworld.net/news/greece-e60-million-eo-microsatellite/
[16] Via Satellite, "NanoAvionics Upgrades its Flagship MP42 Bus Line, Adding a 500kg Platform", 24 Aug 2026 — https://www.satellitetoday.com/manufacturing/2026/08/24/nanoavionics-upgrades-its-flagship-mp42-bus-line-adding-a-500kg-platform/
[17] Space Intel Report, "NanoAvionics adds 50–150-kg MP42 bus to capture constellation market" — https://spaceintelreport.com/?p=72974
[18] Gallagher Specialty, "Space Market Update Q4 2025", 8 Jan 2026 — https://specialty.ajg.com/plane-talking/space-market-update-q4-2025
[19] New Space Economy, "The Orbital Insurance Market: How Underwriters Are Pricing Constellation-Scale Risk", 29 Mar 2026 — https://newspaceeconomy.ca/2026/03/29/the-orbital-insurance-market-how-underwriters-are-pricing-constellation-scale-risk/
[20] AWS Ground Station pricing (on-demand vs reserved, narrowband/wideband) — https://aws.amazon.com/ground-station/pricing/
[21] ITU-R, Space Services cost recovery (Council Decision 482, modified 2024) — https://www.itu.int/ITU-R/space/costrec/
[22] Thomson Reuters ONESOURCE, "BIS issues interim final rule on space-related exports", Oct 2024 — https://www.thomsonreuters.com/en-us/help/onesource-global-trade/regulatory-insights/2024/october-28nd/bis-issues-interim-final-rule-on-space-related-exp.html
[23] Breaking Defense, "SatVu, GMV latest space firms to benefit from Europe's new milspace focus", Feb 2026 — https://breakingdefense.com/2026/02/satvu-gmv-latest-space-firms-to-benefit-from-europes-new-milspace-focus/
[24] Naftemporiki, "Greek defense innovative companies gain access to the European network of investors and capital" (HCDI, Pitch Arena) — https://www.naftemporiki.gr/english/2119327/greek-defense-innovative-companies-gain-access-to-the-european-network-of-investors-and-capital/
[25] Via Satellite, "Spire to Sell Maritime Business to Kpler in $241M Deal", 13 Nov 2024 — https://www.satellitetoday.com/finance/2024/11/13/spire-to-sell-maritime-business-to-kpler-in-241m-deal/
[26] European Spaceflight, "ESA Greenlights Two Budget-Friendly Earth Observation Missions" (Scout cap €35M, 3 years) — https://europeanspaceflight.com/esa-greenlights-two-budget-friendly-earth-observation-missions/
[27] UTIAS Space Flight Laboratory notice on closure of satellite manufacturing; continuation via SFL Missions Inc. — https://www.utias-sfl.net/
[28] SpaceNews coverage of SDA Tranche 0 Transport Layer award to York Space Systems (~$94M for 10 satellites, 2020) — https://spacenews.com/?p=111818
[29] SatNow, "HawkEye 360 Enhances Spectrum Scanning with Acquisition of RF Solutions from Maxar", Dec 2023 — https://satnow.com/news/details/1437-hawkeye-360-enhances-spectrum-scanning-with-acquisition-of-rf-solutions-from-maxar
[30] Defense Daily, "FCC adopts 5-year rule for deorbiting satellites" — https://www.defensedaily.com/fcc-adopts-5-year-rule-for-deorbiting-satellites/space/
[31] Ofcom, "Satellite filings cost recovery" statement — https://www.ofcom.org.uk/consultations-and-statements/category-1/satellite-filings-cost-recovery
[32] Via Satellite, "Kleos Space to File for Bankruptcy", 27 July 2023 — https://www.satellitetoday.com/finance/2023/07/27/kleos-space-to-file-for-bankruptcy/

Additional references used for regulatory statements (not fetched; cite from primary texts before publication): Law 4508/2017 and 4712/2020 (ΦΕΚ); Law 4623/2019 (Hellenic Space Center); Laws 2225/1994, 3649/2008, 5002/2022 (communications secrecy/EYP); Constitution Art. 19; Directive 2002/58/EC; Regulation (EU) 2016/679; Regulation (EU) 2021/821; Council Common Position 2008/944/CFSP (ML11); 22 CFR 121 USML Cat XI and XV; 15 CFR 774 ECCNs 3A001, 5A002, 9A515; ITU Radio Regulations Arts. 9 and 11; ESA Zero Debris Charter (2023); ECSS-M-ST-10C, ECSS-E-ST-10-03C, ECSS-Q-ST-60-13C; ECtHR *Big Brother Watch v UK* and *Centrum för rättvisa v Sweden* (GC, 25 May 2021).
