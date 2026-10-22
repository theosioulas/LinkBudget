# 01 — Operators & Programmes Landscape: Space-Based Passive RF / SIGINT (status as of 21 Oct 2026)

Scope: who has built or is building space-based passive RF detection / geolocation systems relevant to a 100–150 kg LEO SIGINT microsatellite that grows into a TDOA/FDOA constellation (UHF/L/S/C/X). Commercial operators first, then government reference programmes, primes/integrators, lessons learned, a comparison table, and market data. Figures are company/press claims unless stated otherwise; "claimed" and "unverified" are flagged explicitly. All web sources were checked in Oct 2026.

---

## 1. Commercial RF geolocation / RF-mapping operators

### 1.1 HawkEye 360 (USA) — the reference case
- **Founded** Sept 2015 (Herndon/Chantilly, VA); first commercial space-based SIGINT provider by its own description. IPO on NYSE as **HAWK** on 7 May 2026: 16 M shares at $26, ~$416 M gross (later $478.4 M gross / $437.5 M net incl. over-allotment), valuation ≈ $2.4 B. [1][2][3]
- **Constellation:** Clusters of **3 formation-flying satellites**. Pathfinder (Cluster 1) Dec 2018; Clusters 2–14 Jan 2021 → Mar 2026; **Cluster 15 launched 20 Oct 2026** (Bandwagon-5, mid-inclination); Cluster 16 is next. ">30 satellites" and "over a dozen clusters" per the May 2026 prospectus; 29 satellites in Apr 2025 per SpaceNews. Two legacy Aurora Insight spectrum-scanning sats (Charlie, Delta) also operated. [4][5][6][7]
- **Orbits:** 400–600 km; mix of SSO (~97.5°) and mid-inclination (40.5°, 45°, 45.6°) planes to raise revisit over shipping lanes / conflict zones. Claimed **global revisit <45 min**; ">1 M km² per pass". [4][6]
- **Spacecraft:** Pathfinder on UTIAS-SFL NEMO-15 bus, **13.4 kg** wet mass, DSI water electrothermal propulsion (Isp ≈182 s, ΔV ≈96 m/s), formation target 125 km along-track spacing with 5 km (1σ) control, only two of three actively controlled. Block 2 "Hawks" on SFL DEFIANT bus, **≈30 kg**, 3-yr design life, water thrusters. Block 3 "Kestrel" (Kestrel-0A "Block 3 Lite", 8U, flown June 2025): company says Block 3 captures ~80 % of signals at ~75 % lower cost; Block 4 planned with "superior precision". [6][8][9][10]
- **Payload:** SDR (AD9361 ×3 + Zynq 7045 on Pathfinder) tuning 70 MHz–6 GHz with 56 MHz IBW plus LNB to ~18 GHz; dipole/patch/button/horn antennas; onboard conversion of RF to metadata. Prospectus states coverage **30 MHz–18 GHz**. Geolocation = TOA/FOA measured on orbit, TDOA/FDOA solved on ground; results delivered as 95 % confidence ellipses. **No public numeric accuracy** (unverified anecdotal figures of ~500 m–few km circulate; treat as unverified). [6][4]
- **Cluster 1 → Cluster 2 lessons:** Pathfinder was single-string and power-limited; Cluster 2 (IOC Mar 2021) brought "up to 10× collection capacity", wider frequency coverage, redundancy for longer life, more onboard compute and a dedicated GNSS antenna for GPS-interference monitoring. [11]
- **Products:** RFGeo (2019), Mission Space platform (2021), RFIQ data product, SEAker (maritime), GNSS Jamming Detection, Military Radar Monitoring, Communications Mapping, Spectrum Exploitation, Custom SIGINT; commercial models = subscriptions, "IQ dedicated tasking", and **dedicated capacity** (Clusters 15/16 are the first built around a committed-capacity customer model). [4][5][6]
- **Government anchor contracts:** NRO integration study 2019; NRO SCE RF study Sept 2022 (~$300 K base, options; 6 awardees); 23-month SCE extension Dec 2025 (EUCOM-focused); **NRO Commercial RF Capability Augmentation (CRFCA)** operational contract Aug 2026 — first commercial RF provider moved from BAA studies to operational augmentation, "no contract-value cap". NGA RF Emitter Data contract up to $10 M (2021). NRO was **39 % of 2025 revenue** (24 % in 2024); top-3 customers 66 % of 2025 revenue. [12][13][14][15]
- **International:** >$100 M, 5-year "strategic international partner" deal (Dec 2025) incl. dedicated clusters with FOC early 2027; a European MoD EW programme worth up to $75 M (Mar 2026); India FMS approval $131 M (May 2025, with SeaVision); ~$18 M Middle East; >$100 M H1-2026 international awards across 8 customers; $36 M Q3-2026 awards across >10 nations; Japan = 16 % of 2025 revenue. Leonardo MoU (Sept 2026) for sovereign European RF layer via Italian ground stations; ERA (CZ) radar-product partnership; first EU subsidiary in Luxembourg (Sept 2026). [16][17][18][19]
- **Financials:** Revenue $30.5 M (2022) → **$117.7 M (2025)** per prospectus (one trade report cited $98.7 M — discrepancy, prospectus figure preferred); first net income $2.7 M in 2025; Q2-2026 revenue $49.8 M (+87 % YoY), FY-2026 guidance $215–220 M; backlog $292 M (Jun 2026); cash $503 M. Pre-IPO equity ≈ $378 M by Oct 2023 (Series B $70 M 2019, C $55 M 2021, D $145 M 2021, D-1 $68 M 2023) plus Series E ≈ $150 M (Dec 2025) + $23 M (Mar 2026). Acquisitions: Maxar RF Solutions/Aurora Insight (Dec 2023), Innovative Signal Analysis (Dec 2025). [2][3][4][20]

### 1.2 Unseenlabs (France) — single-satellite geolocation
- Founded 2015 (Rennes). **BRO** (Breizh Reconnaissance Orbiter) Gen 1 = 6U/8U GomSpace CubeSats, **~15 kg**, 500–550 km, mostly SSO (one at 45°). BRO-1 Aug 2019; 25 satellites on orbit after BRO-23 + BRO-32 (1 Oct 2026, Transporter-18). [21][22]
- **Method:** "monosatellite" — each satellite geolocates independently (proprietary; essentially single-platform Doppler/FOA + AOA-type processing, not disclosed). Claimed accuracy **"to the nearest kilometre"** (~1 km) for maritime emitters — company claim, unverified independently. [22]
- **Gen 2:** BRO-31 (Transporter-17, July 2026) is a **~150 kg microsatellite** (platforms from U-Space and GomSpace; payload in Brittany; ~10× Gen-1 mass), covers **L, S, C, X (and Ku)** up to 12 GHz, up to 1 M km² per pass, multi-domain (maritime, land, space). BRO-32 is the second Gen 2. Target ~20 satellites, possibly 30–40 if demand justifies. Manufacturing contracts cited: €2.9 M (May 2024), €5.3 M (Dec 2024), €5.5 M (Apr 2026), €2.2 M GomSpace for two more CubeSats (2027). [23][24][25]
- **Funding:** €7.5 M (2018), €20 M (2021), **€85 M (Feb 2024)** — record French space round. ~150 staff (2026). Revenue target €100 M by 2029; >10 % margin claimed. Copernicus Contributing Mission (2025). [25][26]
- **Sovereign role:** Co-contractor with Airbus on **CASSIOPÉE** (DGA, announced 17 Sept 2026) — the sovereign core of France's **CELESTE** programme replacing CERES by 2032; Unseenlabs supplies payload, mission planning, on-board/ground processing. Value undisclosed. [27]

### 1.3 Kleos Space (Luxembourg/Australia) — the failure case
- Founded 2017; ASX-listed Aug 2018 (raised €6.96 M at IPO). Business model: RF "reconnaissance data-as-a-service" (LOCATE products), clusters of **4 CubeSats** using multilateration from up to six antenna pairs. [28][29]
- Missions: Scouting KSM1 (Nov 2020, PSLV, 4 sats, ~37° per text/95.9° per table — conflicting), Vigilance KSF1 (Jun 2021, SSO ~500 km), Patrol KSF2 (Apr 2022, ISISPACE-built), Observer KSF3 (Jan 2023, VHF + X-band). Raises included A$12.6 M (Sept 2021) to fund a 4th cluster. [28][30]
- **What went wrong:** Vigilance launched Jun 2021 but was **not fully commissioned until Feb 2023** (~20 months); KSM1 suffered technical issues in 2022 and was being deorbited; the company warned in 2023 that 5-year-design satellites would likely last **~18 months**. 2022 results: **€272 K revenue vs €11.3 M loss**; ~60 % of revenue from US defence; "170 qualified deals in pipeline" never converted at scale. Trading suspended 3 May 2023; a June 2023 convertible note failed; sole lender Pure Asset Management called loans; bankruptcy petition announced 26 Jul 2023, paused 28 Aug 2023 pending asset interest; no acquirer publicly confirmed. [28][29][31][32]
- Also one of the six NRO SCE RF study awardees (Sept 2022) — a government study contract did not save it. [13]

### 1.4 Spire Global (USA/Luxembourg)
- Multi-purpose LEMUR CubeSat constellation (AIS/ADS-B/weather RO); sold most of the **maritime** business in 2025 ($21 M 2025 revenue; buyer not named in filings). RF geolocation (RFGL) now a growth line: satellite **pairs** ("six new pairings" added Q1 2026), AFRL $14 M cluster contract for moving-object detection, five US + three international RFGL orders in Q1 2026. [33][34]
- **Single-satellite RFGL demo** (Mar 2026) on S- and X-band using a satellite launched on Bandwagon-4 (late 2025) co-funded by Luxembourg via ESA **LuxIMPULSE**; coverage now VHF, UHF, GNSS L-band, S, X. No accuracy figure disclosed. One of NRO's three current commercial RF providers (with HawkEye 360 and Umbra). [35][12]
- Financials: Q1-2026 revenue $15.8 M (ex-maritime +13 %), FY-2026 guidance $75–85 M, cash $49.5 M + $70 M raised Apr 2026; still loss-making. [34]

### 1.5 Aurora Insight (USA) → Maxar → HawkEye 360
- Spectrum-mapping (not geolocation) start-up; two scanning sats Charlie (Jan 2021, ~360 km) and Delta (Jun 2023). Maxar invested Feb 2022, acquired Jan 2023; HawkEye 360 bought "RF Solutions" from Maxar Dec 2023. Lesson: pure spectrum-occupancy mapping did not sustain an independent company; it became a feature inside a geolocation operator. [36][37][4]

### 1.6 Horizon Technologies (UK) — Amber
- 6U "Amber" CubeSat (AAC Clyde Space bus), SIGINT heritage from airborne FlyingFish/BlackFish sat-phone intercept. Amber-1 (IOD-3) was lost on Virgin Orbit's failed UK launch (Jan 2023; widely reported — unverified from Horizon's own site). UKSA £1.2 M for Amber-2 (CDR passed Oct 2024, "mid-2025" launch); Amber-3 late 2025 — **no launch confirmed as of Oct 2026** on company news feed; AmberPersistent ground variant collects L/S/X. Customers framed around Royal Navy/JMSC MDA. Status: effectively stalled/unverified. [38][39][40]

### 1.7 Aerospacelab (Belgium)
- Launched a **trio of RF-sensing satellites in Mar 2024** flying a HawkEye-style triangular formation; white paper (2025) claims geolocation of ground-based radar emitters — no accuracy published. Primarily a bus manufacturer (Series B €40 M 2022; "megafactory" up to 500 sats/yr; Sept 2026 reports it will build 264 IRIS² LEO satellites, ~€2.4 B). Relevant as a European supplier able to deliver RF-capable 100-kg-class buses. [7][41][42]

### 1.8 Newer / adjacent entrants 2023–2026
- **Umbra (USA):** SAR operator; NRO RF study awardee 2022 and listed as a current NRO RF provider — details of its RF payload are undisclosed. [12][13]
- **PredaSAR / Terran Orbital (USA):** NRO RF study awardee 2022; no RF constellation materialised (acquired by Lockheed Martin 2024). [13]
- **BAE Systems Azalea (UK):** 3 × ~150 kg RF satellites + 1 ICEYE SAR, launched 28 Nov 2025 (Transporter-15), ~560 km, onboard "Enhanced SDR" AI processing; self-funded; trials with customers 2026 — see §3. [43]
- **Reflex Aerospace (Germany):** €50 M Series A (2026), offers buses with SIGINT payload options for sovereign constellations. [44]
- **Libre Space Foundation / Hellenic Space Center — PHASMA (Greece):** two 3U CubeSats (LAMARR, DIRAC) launched 28 Nov 2025, €2 M, RF-spectrum monitoring & interference localisation IOD under ESA's Greek CubeSat programme. [45]
- **EDF SIGMA (France/Bulgaria/Estonia):** €5.8 M EU-funded SME project (M3 Systems, EnduroSat, Latitude, Skudo) to demonstrate space-based detection/localisation of GNSS jamming/spoofing. [46]
- **US Army terrestrial/aerial RF:** Sept 2026 awards ~$196 M (Heaviside MOTH, Research Innovations Dragonfly) show RF-sensing budgets but not space-based. [19]
- Searches for independent RF-geolocation start-ups in Israel, India, Japan, Korea and Australia returned **no verified space-based commercial operator** as of Oct 2026 (India's PierSight is SAR+AIS; Israel's Rafael nanosat swarm is EO/SAR with possible SIGINT — speculative). [44][47]

---

## 2. Government / national programmes (reference architectures)

### 2.1 United States
- **NRO Strategic Commercial Enhancements (SCE):** RF BAA studies Sept 2022 to six firms (Aurora Insight, HawkEye 360, Kleos, PredaSAR, Spire, Umbra) ~$300 K base each with 24-month options; 2023 options to four; Dec 2025 extensions (HawkEye 23 months); July 2025 RFP for a **Commercial Solutions Opening** with a rolling 5-year window across EO/SAR/RF/HSI/LIDAR; Aug 2026 **CRFCA** operational RF augmentation to HawkEye 360 (uncapped). Pattern: ~4 years from study award to operational buy. [12][13][14]
- **NGA:** RF Emitter Data contract (HawkEye 360, up to $10 M, 2021) for "non-traditional" data and cueing of imaging satellites; later extensions/task orders. [15]
- **US Space Force / SDA:** no public commercial RF-geolocation buy found; USSF SBIR D2P2 to ISA (now HawkEye) for signal-processing latency; AFRL $14 M to Spire. NRO's own proliferated architecture is classified. [3][33]

### 2.2 China — Yaogan ELINT triplets
- **JianBing-8 / Yaogan-9, -16, -17, -20, -25 (2010–2014):** triplets at **~1,100 km, 63°**, close formation (tens of km), 3→6 planes; assessed as NOSS-like naval ELINT (US NOSS covered ~555 MHz–10 GHz with 2–3 km geolocation accuracy per open sources). [48][49]
- **Yaogan-31 (2018–2021):** four triplets (12 sats), 63.4°, lead/trailer/outlier geometry. **Yaogan-30 (2017–2021):** 5–6 triplets at **~600 km, 35°**, but satellites phased 120° apart in-plane (not close formation) — high-revisit rather than TDOA formation; function debated. **Yaogan-40 01A/B/C (Sept 2023):** triangular formation at ~790–850 km, 86°, likely Yaogan-31 successor. GEO SIGINT (Qianshao-3 class) assessed 250 MHz–4 GHz. [49][50]
- Design takeaway: China uses **3-sat close formations at ~1,000 km** for wide-area ELINT, and separately uses low-inclination planes to concentrate revisit on Taiwan/South China Sea.

### 2.3 Russia — Liana
- **Lotos-S1 (14F145):** 8 launched 2014–Dec 2024, 9th planned 2026; **~900 km, 67.15°**; TsSKB-Progress bus, KB Arsenal payload; general SIGINT. **Pion-NKS (14F139):** 1 launched Jun 2021 (Kosmos 2550), **~450 km, 67°**, ELINT + active radar naval component; imagery suggests only one radar antenna deployed. Russia relies on single large satellites, not formations. [51][52]

### 2.4 France — CERES → CELESTE/CASSIOPÉE
- **CERES:** 3 × **516 kg** (446 kg per another source) satellites launched 16 Nov 2021 (Vega VV20), **~670 km, 75°**, triangular formation (two in-plane, one offset), **€450 M** programme, 10-yr life, Airbus prime/payload, Thales Alenia Space platforms (EliteBus), CNES manages for DGA; TDOA triangulation of radar/telecom emitters; operational during Ukraine war spring 2022. Predecessors ESSAIM (2004, 4 µsats) and ELISA (2011, 4 × ~130 kg, deorbited 2021). [53][54]
- **CASSIOPÉE** (DGA, Sept 2026): Airbus prime on **S250 platform** (CO3D heritage) + Unseenlabs payload/processing; in service by **2032**; satellite count and value undisclosed. [27]

### 2.5 European Union / ESA / EDA
- IISS (2026) costs a European ISR package with **4 ELINT/SIGINT satellites at ~$200 M each** ($800 M), or 8 ($1.6 B) under full autonomy; identifies "SIGINT and RF-mapping" as the most constrained European gap vs the US. [55]
- No dedicated EDF/PESCO SIGINT constellation project is public; adjacent: **EDF SIGMA** (space GNSS-interference monitoring, €5.8 M), **EDA VLEO-DEF** (€15.65 M, 17 partners incl. GomSpace Lux, Thales Alenia, Airbus, SENER; VLEO ISR satellite concept, 36 months from Mar 2026). EU Space Act (proposed 2025) and IRIS² (264 LEO sats to Aerospacelab, €2.4 B, Sept 2026) matter mainly as regulatory/industrial context. [46][56][42]
- **Luxembourg:** home of Kleos (failed), Spire's European HQ and the LuxIMPULSE-funded single-sat RFGL satellite, HawkEye 360's first EU subsidiary (Sept 2026) — a de-facto hub for commercial RF. [35][18]
- **Germany:** no dedicated SIGINT satellite today; **SPOCK-2** (~1,000-satellite reconnaissance constellation incl. EO + **SIGINT** sensors, target 2030, inside a €35 B space fund) is in competition between Helsing/OHB ("KIRK") and Rheinmetall-ICEYE; Rheinmetall–OHB JV formed 2026 for SATCOMBw. [57]
- **Italy:** no national SIGINT satellite; Leonardo positions as integrator of HawkEye 360 RF data via Italian ground stations (MoU Sept 2026). [17]
- **UK:** BAE Azalea (self-funded, 2025) and Horizon Amber (stalled); MoD has not announced a sovereign SIGINT constellation buy. [43][40]
- **Greece / Hellenic context:** the €130 M Greek National Small Satellite Programme (ESA-managed, RRF-funded) is EO-only — 2 ICEYE X-band SAR (~120 kg, Nov 2025), 4 OroraTech thermal 8U (May 2026), 7 Open Cosmos optical ~100 kg (first, Hyperion GR1, Jul 2026); payloads include AIS/VDES receivers but **no SIGINT**. Separate ESA IOD/IOV CubeSat line produced **PHASMA** (RF spectrum monitoring, Libre Space + HSC). Open Cosmos Aegean manufactures in Pallini — a potential local bus/AIT partner. [58][59][45]

### 2.6 Others
- **India:** **EMISAT** (1 Apr 2019, PSLV-C45) — 436 kg IMS-2 bus, ~748 km SSO 98.4°, DRDO "Kautilya" ELINT payload (radar detection/characterisation); DRDO has floated a GEO ELINT follow-on (unverified press). Indian Navy is also a HawkEye 360 MDA customer. [60][3]
- **Israel:** Ofek (EO) plus a Rafael ~100 kg nanosat swarm at 350–380 km; SIGINT payloads **speculated** only. Technion/IAI Adelis-SAMSON (2021) demonstrated 3-nanosat formation geolocation — academic, unverified operationally. [47]
- **Japan:** no national SIGINT satellite announced; Japan is HawkEye 360's largest non-US market (16 % of 2025 revenue). [20]
- **South Korea:** 425 Project (5 SAR/EO, 2023–25) plus plan for ~60 small/micro reconnaissance sats by 2030 (<500 kg and <100 kg classes); SIGINT content not specified. [61]
- **Turkey:** Göktürk EO line; no ELINT satellite found in open sources (unverified). **Australia:** no national RF constellation; Kleos's ASX listing was its main link.

---

## 3. Defence primes & integrators offering smallsat SIGINT/EW payloads
- **Airbus Defence & Space (FR/DE):** CERES prime and payload; CASSIOPÉE prime on S250 bus; VLEO-DEF partner. The only European prime with two generations of operational space SIGINT. [53][27]
- **Thales Alenia Space (FR/IT):** CERES platforms + mission chain; VLEO-DEF; ELINT heritage via Thales. [53][56]
- **BAE Systems (UK):** **Azalea** — 3 × ~150 kg RF sats + ICEYE SAR in one cluster, ~560 km, launched 28 Nov 2025; ultra-wideband RF sensors, onboard AI "Enhanced SDR", re-programmable in orbit; self-funded; customer trials 2026. Closest public analogue to a 150 kg-class RF cluster. [43]
- **Leonardo (IT):** integrator role (HawkEye MoU); no own RF payload disclosed. [17]
- **L3Harris / Northrop Grumman / Lockheed Martin / RTX (US):** classified national SIGINT payload heritage; L3Harris builds the NRO/USAF classified smallsats; Lockheed invested in HawkEye (Series D-1) and collaborated at Valiant Shield 2026; none sells an off-the-shelf commercial smallsat SIGINT payload publicly. [3][4]
- **OHB (DE):** in KIRK consortium for SPOCK-2 (SIGINT-capable); Rheinmetall–OHB JV (SATCOM). **Rheinmetall-ICEYE** competes for SPOCK-2. **Hensoldt** — airborne Pegasus SIGINT; no space product found. [57]
- **IAI/ELTA (IL):** ELINT sensor heritage and nanosat work with Technion; **Elbit** — comms nanosats only. **Saab (SE), Indra (ES):** airborne/naval ESM; no space SIGINT product found (unverified). **Kongsberg NanoAvionics (LT/NO), GomSpace (DK/LU), U-Space (FR), Open Cosmos (UK/GR), SFL Missions (CA), AAC Clyde Space (UK/SE), EnduroSat (BG), ISISPACE (NL):** bus/AIT suppliers with RF-mission flight heritage (GomSpace → BRO; SFL → Hawks; ISISPACE → Kleos Patrol; EnduroSat → SIGMA; AAC → Amber). [22][8][30][46]

---

## 4. Lessons learned & failure analysis
- **Kleos:** (i) **commissioning took 20 months** for Vigilance — revenue slipped two years while burn continued; (ii) satellite anomalies (KSM1) and **~18-month actual life vs 5-yr design**; (iii) **€272 K revenue** on €11 M losses in 2022 — a data product without an anchor customer; (iv) single lender, equity raised in small ASX placements (A$12–13 M), no deep-pocketed strategic; (v) 60 % US-defence revenue dependence while being a Luxembourg entity. Net: insufficient capital to survive technical slippage. [28][31][32]
- **HawkEye 360 Cluster 1 → later:** Pathfinder (13 kg, single-string, 2–4° pointing, power-limited manoeuvres) proved TDOA/FDOA but was not a product-grade system; Cluster 2 (30 kg, redundancy, 10× capacity, dedicated GNSS antenna, more compute) was the real IOC (Mar 2021, **5.5 years after founding**). Subsequent evolution: mid-inclination planes for revisit, onboard processing (Cluster 14), multi-signal simultaneous collection + faster downlink (Cluster 15), Block 3 for ~75 % lower cost, dedicated-capacity business model. [6][8][11][5]
- **Time to IOC:** HawkEye 2015 → first data 2019 → IOC 2021 (≈5–6 yr); Unseenlabs 2015 → BRO-1 2019 → paying maritime service ~2020 (≈4–5 yr); Kleos 2017 → first commissioned cluster 2023 (6 yr, too late); BAE Azalea concept 2022 → launch Nov 2025 (3 yr, self-funded prime).
- **Funding to a 3-satellite operational cluster:** HawkEye had raised roughly **$100 M+** (seed + Series A + $70 M Series B) before Cluster 2 was operational, and ~$378 M before cash-flow breakeven in 2025; Unseenlabs reached ~10 nanosats on ~€27.5 M; Kleos spent ~A$60–80 M (unverified aggregate) for 12 CubeSats that never generated meaningful revenue. Rule of thumb for a 150 kg-class 3-sat cluster incl. launch, ground and 2 yrs ops: **€60–120 M** (analyst inference from CERES €450 M/3 at the high end and Unseenlabs Gen-2 unit contracts ~€5 M bus-only at the low end).
- **Customer concentration:** every surviving operator is government-anchored — HawkEye NRO 39 %, top-3 66 %, US 61 %; Spire pivoting to defence after selling maritime; Unseenlabs now embedded in a sovereign programme. Pure commercial maritime demand (Kleos, Horizon) did not sustain a company. [20][34]
- **Geolocation method:** cluster TDOA/FDOA (HawkEye, CERES, Yaogan, Azalea, Aerospacelab) is proven; single-satellite geolocation (Unseenlabs ~1 km claimed; Spire demo 2026) trades accuracy/time-to-fix for cost and is now credible for maritime/strong emitters. No operator publishes independently verified CEP figures.

---

## 5. Comparison table

| Operator | Country | Sats on orbit (Oct 2026) | Mass class | Bands | Geolocation method | Claimed accuracy | Products | Funding / revenue | Status |
|---|---|---|---|---|---|---|---|---|---|
| HawkEye 360 | USA | >30 (Clusters 1–15), ~500 km SSO + 40–46° | 13 kg (C1) → ~30 kg (Block 2) → Block 3 Kestrel | 30 MHz–18 GHz (claimed) | 3-sat formation TDOA/FDOA | 95 % ellipse; no public CEP | RFGeo, Mission Space, RFIQ, SEAker, GNSS jamming, radar monitoring, dedicated capacity | ≈$550 M equity pre-IPO + $437 M IPO; rev $117.7 M (2025), guide $215–220 M (2026); backlog $292 M | Operational, profitable (adj.), NRO operational contract |
| Unseenlabs | France | 25 (23 Gen-1 6U/8U + 2 Gen-2) | 15 kg Gen-1; **~150 kg Gen-2** | Gen-1 maritime radars/comms; Gen-2 L/S/C/X(/Ku) to 12 GHz | **Single-satellite** | ~1 km (claimed) | Maritime RF tracks; multi-domain Gen-2; sovereign CASSIOPÉE payload | €112.5 M raised; ~150 staff; target €100 M rev 2029 | Operational; scaling to ~20–40 sats |
| Kleos Space | LU/AU | 0 operational (16 launched 2020–23) | ~6U CubeSats, 4 per cluster | VHF, X-band (Observer) + maritime | 4-sat multilateration | n/a | LOCATE data | ~A$60–80 M (unverified); rev €272 K (2022) | **Bankrupt 2023** |
| Spire Global | USA/LU | Multi-mission LEMUR fleet; RFGL "pairs" (count n/d) | 3U–16U CubeSats | VHF, UHF, GNSS L, S, X | Pairs + single-sat demo (2026) | n/d | RFGL, GNSS interference, voice collection | Public (SPIR); rev guide $75–85 M (2026), loss-making | Operational, defence pivot |
| Aurora Insight | USA | 2 (Charlie, Delta) → HawkEye | ~6U | Wideband spectrum scan | None (mapping) | n/a | Spectrum maps | Acquired by Maxar 2023 → HawkEye Dec 2023 | Absorbed |
| Horizon Technologies | UK | 0 confirmed (Amber-1 lost 2023) | 6U | L/S/X (sat-phone, nav radar) | Single-sat (patented) | n/d | Amber MDA, AmberPersistent | UKSA £1.2 M + small grants | Stalled / unverified |
| Aerospacelab | Belgium | 3 RF (Mar 2024) | ~tens of kg (n/d) | n/d (radar emitters claimed) | 3-sat formation | n/d | Demo/white paper | €40 M Series B; IRIS² €2.4 B build contract | Demo; manufacturer |
| BAE Systems Azalea | UK | 3 RF + 1 ICEYE SAR (Nov 2025) | **~150 kg** | Ultra-wideband (n/d) | Cluster + onboard AI fusion | n/d | RF+SAR fused intelligence | Self-funded (n/d) | In trials |
| PHASMA (Libre Space/HSC) | Greece | 2 × 3U (Nov 2025) | ~4 kg | Spectrum monitoring (n/d) | Close-proximity pair | n/d | Spectrum/interference IOD | €2 M | IOD in progress |
| CERES (DGA) | France | 3 (Nov 2021), 670 km 75° | 446–516 kg | Radar + telecom (n/d) | 3-sat triangulation | n/d | National SIGINT | €450 M | Operational; CASSIOPÉE successor 2032 |
| Yaogan ELINT | China | ~12+ triplets (JB-8, Y-31, Y-40) | n/d (est. 1–2 t) | n/d (NOSS-like) | 3-sat formation | 2–3 km (NOSS analogue) | National | n/d | Operational, replenishing |
| Liana | Russia | 8 Lotos-S1 (900 km) + 1 Pion-NKS (450 km) | multi-tonne | n/d | Single large sat | n/d | National | n/d | Operational, slow cadence |
| EMISAT | India | 1 (2019), 748 km | 436 kg | Radar ELINT | Single sat | n/d | National | n/d | Operational |

n/d = not disclosed.

---

## 6. Market size & contract values
- **Analyst estimates (treat with caution; methodologies opaque):** Space-based RF-mapping market **$3.8 B (2025) → $9.3 B (2034), 10.5 % CAGR**; Defence & Intelligence ≈47 % of demand; LEO ≈68 %; formation-flying clusters ≈50 % of architectures, single-sat fastest-growing; microsats <100 kg fastest-growing class (15 % CAGR). Broader passive-RF/SIGINT market (all platforms) **$28.6 B (2026) → $46.9 B (2032), 8.6 % CAGR**, ground-based dominant. [62][63]
- **Revealed demand (hard numbers):** HawkEye 360 alone ~$118 M revenue (2025) → $215–220 M (2026) with $292 M backlog — the single best proxy for the commercial space-SIGINT market today; the company's own TAM relies on the "Renaissance Study" and is flagged in its prospectus as possibly optimistic. [20][2]
- **Typical contract values:** NRO SCE study ~$0.3 M base (2022); NGA data up to $10 M (2021); AFRL cluster $14 M (Spire); UKSA grant £1.2 M; EDF SIGMA €5.8 M; European MoD EW subscription up to $75 M; 5-year dedicated-capacity deal >$100 M; India FMS $131 M (RF data + SeaVision); NRO CRFCA uncapped; sovereign national systems €450 M (CERES, 3 sats) and ~$200 M/sat (IISS planning figure). [13][15][33][16][55]
- **Capital markets:** HawkEye IPO $2.4 B valuation at ~20× 2025 revenue; Unseenlabs €85 M round (2024); Spire $70 M raise (2026). Investor appetite for space-RF is currently strong but concentrated in the leader.

---

## Sources
[1] Payload — HawkEye 360 raises $416M in IPO (8 May 2026): https://payloadspace.com/hawkeye-360-raises-416m-in-ipo/
[2] HawkEye 360 Q2 2026 results (PR Newswire, Aug 2026): https://www.prnewswire.com/news-releases/hawkeye-360-announces-second-quarter-2026-financial-results-302851298.html
[3] Same as [2] — ISA/USSF SBIR, Indian Navy, NASA, Lockheed Valiant Shield items.
[4] Wikipedia — HawkEye 360 (launch table, funding rounds, FCC licence): https://en.wikipedia.org/wiki/HawkEye_360
[5] HawkEye 360 Cluster 15 launch release (20 Oct 2026): https://www.prnewswire.com/news-releases/hawkeye-360-successfully-launches-cluster-15-advancing-on-orbit-collection-and-data-delivery-302914192.html ; Cluster 14 release (30 Mar 2026): https://www.prnewswire.com/news-releases/hawkeye-360-successfully-launches-cluster-14-satellites-302728684.html
[6] eoPortal — HawkEye 360 (Pathfinder bus, SDR, formation, products): https://www.eoportal.org/satellite-missions/hawkeye-360
[7] SpaceNews — Space-based electronic eavesdropping becomes commercial battleground: https://spacenews.com/space-based-electronic-eavesdropping-becomes-commercial-battleground/
[8] Gunter's Space Page — Hawk 2A–14C (30 kg DEFIANT bus, launch table): https://space.skyrocket.de/doc_sdat/hawk-2a.htm
[9] Gunter's Space Page — Kestrel-0A: https://space.skyrocket.de/doc_sdat/kestrel-0a.htm
[10] HawkEye 360 prospectus (Form 424B4, May 2026): https://www.sec.gov/Archives/edgar/data/0001750704/000162828026032207/hawkeye360424b4.htm
[11] SpaceMart — HawkEye 360 commissioning of second cluster (Apr 2021): https://spacemart.com/hawkeye-360-announces-commissioning-of-second-satellite-cluster-999/
[12] Breaking Defense — NRO extends contracts for 4 providers (Dec 2025): https://breakingdefense.com/2025/12/nro-extends-contracts-for-4-providers-readies-new-acquisition-approach/
[13] Breaking Defense — NRO awards RF geolocation study contracts to 6 companies (Sept 2022): https://breakingdefense.com/2022/09/spy-satellite-agency-nro-awards-rf-geolocation-study-contracts-to-6-companies/
[14] Military & Aerospace Electronics — NRO moves commercial RF into operational augmentation (Aug 2026): https://www.militaryaerospace.com/rf-analog/article/55399280/nro-moves-commercial-rf-sensing-into-operational-augmentation
[15] NGA — commercial RF emitter data contract (2021): https://www.nga.mil/news/NGA_looks_to_commercial_RF_emitter_data_for_non-tr.html
[16] Seraphim — HawkEye 360 $100M+ 5-year international contract (Dec 2025): https://seraphim.vc/news/hawkeye-360-secures-landmark-100m-contract-to-expand-global-signals-intelligence-capabilities/
[17] Defence Industry Europe — HawkEye 360 & Leonardo MoU (Sept 2026): https://defence-industry.eu/hawkeye-360-and-leonardo-expand-european-space-intelligence-offering-with-dedicated-rf-capacity-and-local-data-delivery/
[18] The Defense Post — HawkEye 360 Luxembourg base, $75M European MoD, ERA (Sept 2026): https://thedefensepost.com/2026/09/17/hawkeye-360-luxembourg-europe-base/
[19] The Defense Post — HawkEye 360 $36M international deals (19 Oct 2026): https://thedefensepost.com/2026/10/19/hawkeye360-signals-intelligence-deals/
[20] Via Satellite — HawkEye 360 files to go public (Apr 2026): https://www.satellitetoday.com/finance/2026/04/27/hawkeye-360-files-to-go-public-reports-99m-in-revenue-in-2025/ ; TAMradar Series E note: https://www.tamradar.com/funding-rounds/hawkeye360-series-e-23m
[21] Yahoo Finance / PRN — Unseenlabs BRO-23 & BRO-32 launch (Oct 2026): https://finance.yahoo.com/technology/articles/unseenlabs-announces-successful-launch-bro-123000039.html
[22] eoPortal — BRO / Unseenlabs (bus, orbits, 1 km claim, funding): https://www.eoportal.org/satellite-missions/unseenlabs
[23] Unseenlabs — BRO-31 Gen 2 launch release (Jul 2026): https://unseenlabs.com/en/press-center/press-releases/bro-31-gen-2-launch-announcement/
[24] everythingRF — Unseenlabs first Gen 2 satellite (bands, 150 kg): https://www.everythingrf.com/news/details/22321-unseenlabs-launches-first-gen-2-satellite-to-expand-space-based-rf-intelligence
[25] L'Essentiel de l'Éco — Unseenlabs change de dimension (Jul 2026; mass, suppliers, contracts, targets): https://lessentieldeleco.fr/7793-rennes-avec-son-nouveau-satellite-la-pepite-bretonne-unseenlabs-change-de-dimension/
[26] Via Satellite — Unseenlabs secures $92M/€85M (Feb 2024): https://www.satellitetoday.com/finance/2024/02/27/unseenlabs-secures-92m-in-fundraising-for-maritime-surveillance-constellation/
[27] Intelligence Community News — Unseenlabs and Airbus to develop France's SIGINT satellites / CASSIOPÉE (Sept 2026): https://intelligencecommunitynews.com/unseenlabs-and-airbus-to-develop-frances-sigint-satellites/
[28] Wikipedia — Kleos Space: https://en.wikipedia.org/wiki/Kleos_Space
[29] Luxembourg Space Agency — Kleos ASX listing (2018): https://space-agency.public.lu/en/news-media/news/2018/kleos-space-capital-raising-launch-on-the-asx.html
[30] Small Caps — Kleos A$12.6M raise (Sept 2021): https://smallcaps.com.au/article/kleos-space-funds-grow-satellite-constellation
[31] Payload — Kleos Space declares bankruptcy (Jul 2023): https://payloadspace.com/kleos-space-declares-bankruptcy/
[32] Space Intel Report — Kleos first major revenue, liquidity, anomalies (Mar 2023): https://www.spaceintelreport.com/satellite-signals-intelligence-operator-kleos-space-reports-1st-major-revenue-liquidity-issues-satellite-anomalies-remain/
[33] Via Satellite — Spire builds out space reconnaissance portfolio (Jul 2025): https://www.satellitetoday.com/government-military/2025/07/24/spire-builds-out-its-space-reconnaissance-portfolio-for-defense/
[34] Spire Global Q1 2026 results (SEC 8-K Ex. 99.1): https://www.sec.gov/Archives/edgar/data/0001816017/000119312526221629/spir-ex99_1.htm
[35] ASDNews — Spire single-satellite RF geolocation demo (Mar 2026): https://www.asdnews.com/news/defense/2026/03/24/spire-global-demos-singlesatellite-rf-geolocation-capability
[36] Light Reading — Maxar buys Aurora Insight (Jan 2023): https://www.lightreading.com/aiautomation/maxar-technologies-buys-aurora-insight/d/d-id/782596
[37] Intelligence Community News — HawkEye 360 acquires RF Solutions from Maxar (Dec 2023): https://intelligencecommunitynews.com/hawkeye-360-acquires-rf-solutions-from-maxar-intelligence/
[38] UK Defence Journal — UK satellite to combat illegal migration, launch 2025 (Oct 2024): https://ukdefencejournal.org.uk/uk-satellite-to-combat-illegal-migration-launch-in-2025
[39] GOV.UK — UK satellites to boost maritime security on track for 2025 launch: https://www.gov.uk/government/news/uk-satellites-to-boost-maritime-security-on-track-for-2025-launch
[40] Horizon Technologies news feed (checked Oct 2026; no Amber-2 launch item): https://horizontechnologies.eu/news
[41] Aerospacelab — RF sensing satellites blog (May 2024): https://www.aerospacelab.com/blog/feature-insights-4/the-pioneering-technology-of-radio-frequency-sensing-satellites-19
[42] ingenieur.de — Aerospacelab to build 264 IRIS² satellites, €2.4bn (Sept 2026): https://www.ingenieur.de/technik/fachbereiche/raumfahrt/24-mrd-fuer-264-satelliten-start-up-baut-den-grossteil-von-europas-iris2-netz/
[43] The Manufacturer — BAE Azalea cluster reaches orbit (Nov 2025): https://www.themanufacturer.com/articles/uk-built-satellite-cluster-reaches-orbit-to-boost-national-security-capabilities/
[44] Via Satellite — 10 smallsat startups to watch in 2026: https://www.satellitetoday.com/10-hottest/2026/07/27/10-smallsat-startups-to-watch-in-2026/
[45] Wikipedia — PHASMA (Libre Space / HSC CubeSats): https://en.wikipedia.org/wiki/PHASMA
[46] European Commission — EDF 2024 SIGMA factsheet: https://defence-industry-space.ec.europa.eu/document/download/f9f1d4e9-2240-4339-aa07-341824dcb5e7_en?filename=FACTSHEET_EDF_2024_LS_DA_SME_NT_101224544_SIGMA.pdf
[47] Defence Network — Israel to expand nanosatellite programme (Mar 2026): https://defence-network.com/hightech-spione-israel-nanosatellitenprogramm/
[48] satelliteobservation.net — The Chinese maritime surveillance system (JB-8 at 1,100 km/63°): https://satelliteobservation.net/2016/09/20/the-chinese-maritime-surveillance-system/
[49] The Space Review — Chinese SIGINT satellites (Yaogan-31/30/40, NOSS accuracy): https://thespacereview.com/article/4831/1
[50] satelliteobservation.net — Yaogan-30 high-revisit constellation: https://satelliteobservation.net/2017/12/03/the-yaogan-30-high-revisit-constellation/ ; Janes — China deploys more surveillance satellites: https://www.janes.com/osint-insights/defence-news/china-deploys-more-surveillance-satellites
[51] Gunter's Space Page — Lotos-S1: https://space.skyrocket.de/doc_sdat/lotos-s1.htm
[52] Gunter's Space Page — Pion-NKS: https://space.skyrocket.de/doc_sdat/pion-nks.htm
[53] Wikipedia — CERES (satellite): https://en.wikipedia.org/wiki/CERES_(satellite)
[54] Spaceflight Now — French military intelligence satellites launch on Vega (Nov 2021): https://spaceflightnow.com/2021/11/16/french-military-intelligence-satellites-launch-on-vega-rocket/
[55] IISS — Advancing European Military Capacity in Space (2026): https://www.iiss.org/globalassets/media-library---content--migration/images-delta/publications/research-papers/2026-new/space-report/advancing-european-military-capacity-in-space.pdf
[56] EDA — VLEO-DEF contract (Mar 2026): https://www.eda.europa.eu/news-and-events/news/2026/03/13/eda-signs-contract-for-military-satellite-research-project
[57] Advanced Television — German army to order 1,200 satellites / SPOCK-2 (Jul 2026): https://www.advanced-television.com/2026/07/14/german-army-to-order-1200-satellites/
[58] eoPortal — Greek National Small Satellite Programme: https://www.eoportal.org/satellite-missions/gnssp
[59] Hellenic Space Center — Greece acquires 7 EO microsatellites (Jul 2024): https://hsc.gov.gr/en/greece-acquires-7-earth-observation-microsatellites-within-2026/
[60] eoPortal — EMISAT: https://eoportal.org/satellite-missions/emisat
[61] Korea Times — Korea to procure ~60 small/micro spy satellites by 2030 (Mar 2024): https://www.koreatimes.co.kr/southkorea/defense/20240327/koreas-military-aims-to-procure-approximately-60-small-and-micro-spy-satellites-by-2030
[62] Dataintelo — Space-Based RF Mapping Market 2034: https://dataintelo.com/report/space-based-rf-mapping-market
[63] MarketsandMarkets via PR Newswire — Passive RF analyzers, RF sensing and SIGINT market to $46.93B by 2032: https://www.prnewswire.com/news-releases/passive-rf-analyzers-rf-sensing-and-sigint-market-worth-46-93-billion-by-2032---exclusive-report-by-marketsandmarkets-302852712.html
