# 02 — Supplier & Component Catalogue: 100–150 kg LEO Passive-RF / SIGINT Satellite

**Status:** Working catalogue, feasibility-study grade. Compiled 21 October 2026.
**Scope:** ESPA-class (100–150 kg) LEO spacecraft; passive RF monitoring payload covering UHF (300 MHz) to X-band (12 GHz); wideband digitising receivers; precise timing for TDOA/FDOA; high-rate downlink. Prefers products with LEO flight heritage.
**Conventions:** Prices are indicative and public-domain only. "Price unverified" = figure from secondary sources or community knowledge, not a current vendor quote. "On request" = vendor does not publish. Export regime: ITAR = US Munitions List (USML Cat. XV); EAR = US Commerce Control List (9A515 / 9x515 or EAR99); EU DU = EU Dual-Use Regulation 2021/821 (Annex I categories 3A/5A/9A). Wideband receivers, direction-finding systems and high-rate ADCs are frequently controlled under EU DU 3A001/5A001 and EAR 3A001 regardless of vendor nationality; check each line item.
**Key reference used throughout:** NASA *State-of-the-Art of Small Spacecraft Technology* (SoA) 2025 and 2026 editions, which tabulate manufacturer-supplied data (not independently verified by NASA).

---

## A. Satellite buses / platforms (80–200 kg class)

The payload for this mission is dominated by antenna aperture and receiver power (estimated 35–60 kg, 100–200 W orbit-average for a full UHF–X-band suite). The bus must therefore carry ≥40 kg payload, provide ≥150 W orbit-average to the payload, carry an X-band or optical downlink ≥500 Mbps, and offer ~0.05° pointing for the directional antennas. The buses below are the candidates that meet or approach that envelope.

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Kongsberg NanoAvionics | LT/NO | MP42H (Light/Mid/Max) | Max s/c mass 100 kg; payload 35 kg; payload power ~94–100 W sun-tracking; Falcon 9 quarter-plate envelope; pointing 0.01° (1σ) knowledge on Max variant (4.3° on Light); downlink 650 Mbps (Mid/Max) | TRL 9. MP42 flew 2022; three MP42H N3X maritime-surveillance sats for Kongsberg Defence launched 2025 | Price and lead time via online configurator; community estimates €2–4 M per flight unit (price unverified). Typical 12–18 months | EU/Norway; ITAR-free bus; Kongsberg ownership eases NATO/defence sales | https://nanoavionics.com/small-satellite-buses/microsatellite-bus-mp42h/ |
| Kongsberg NanoAvionics | LT | MP42 (≤75 kg class) | Smaller sibling; payload ≤25 kg, ~70–160 W array | TRL 9 (Tiger-3 2022, multiple customers) | Configurator | EU | https://www.satnow.com/products/satellite-bus-platforms/nanoavionics/45-1145-mp42-15-mid |
| OHB LuxSpace | LU | Triton-X (ESA ARTES-supported) | Launch mass 40–250 kg; payload 15–90 kg; modular; ESPA-compatible | TRL 7–8; first flight planned mid-2020s under ESA ARTES; verify flight status | On request | EU, ITAR-free | https://www.esa.int/Applications/Connectivity_and_Secure_Communications/Triton-X |
| Berlin Space Technologies | DE | LEOS-50 (MR/HR) and LEOS-100 (HP/HR) | LEOS-50: ~50–100 kg class; LEOS-100HP: up to 2 kW power, MoI limit 120 kg·m²; agile pointing | Heritage via Kent Ridge-1 (2015), Azista-BST, Kleos (ISISPACE/BST scouting sats) | On request; BST has history of competitive pricing (price unverified) | DE/EU, ITAR-free | https://www.satcatalog.com/component/leos-50hr/ |
| Aerospacelab | BE | Versatile Satellite Platform (VSP) 150 kg class | ~150 kg; in-house XSDR/SSDR radios (X-band 206 Mbps) and components; ESPA class | TRL 9 (Arthur-1 2021, Risk/Arthur series, Gravity, Element satellites) | On request; Aerospacelab builds in volume (Louvain-la-Neuve megafactory) | BE/EU, ITAR-free | https://www.newspace.im/constellations/aerospacelab |
| Surrey Satellite Technology (SSTL) | UK | SSTL-150 / SSTL-Micro | SSTL-150 bus dry 103 kg; payload ≤50 kg; 50 W orbit-average (100 W peak) | TRL 9, decades of heritage (RapidEye, DMC) | Historically £5–10 M class (price unverified); 24 months | UK export control; non-ITAR | https://spacenexus.us/compare/satellite-buses |
| EnduroSat | BG | Microsat platform (ESPA-class, 100+ kg) and 16U | In-house X-band SDR TX ≤6 Gbps, S-band, EPS, ADCS; mission-as-a-service model | 16U TRL 9; microsat platform first flights ~2025–26 (verify) | On request; EnduroSat historically price-aggressive | BG/EU, ITAR-free | https://www.nasa.gov/wp-content/uploads/2026/05/9-soa-comm-2025-final.pdf |
| Open Cosmos | UK/ES/PT | OpenSat platforms (6U–150 kg) + mission-as-a-service | Mission-as-a-service incl. launch, ops; platforms up to ~150 kg (Platero, Menut, Alisio heritage are 6–16U; larger buses under development) | TRL 9 for nanosat class; larger class verify | Full missions on request | UK/EU | https://spacenexus.us/guide/cost-to-launch/hosted-payload |
| Satlantis | ES | Platform + payload integrator (GEISAT, Garai) | ~100 kg class satellites; in-house EO; integrates third-party buses | TRL 9 (GEISAT Precursor 2023) | On request | ES/EU | (Satlantis corporate; verify) |
| Argotec | IT | HAWK-6 / HAWK platforms | 6U–~100 kg; deep-space heritage (LICIACube, ArgoMoon) | TRL 9 | On request | IT/EU | NASA SoA 2026 |
| Hemeria | FR | Hemeria nano/microsat platforms (ANGELS heritage) | 12U–~50 kg; CNES heritage | TRL 9 | On request | FR/EU | satsearch blog (see Sources) |
| Reflex Aerospace | DE | Reflex bus (defence-oriented, ~100–300 kg) | Fast-turn modular bus for defence/ISR; SIGINT/EO oriented | TRL 6–8; first flights 2025–26 (verify) | On request | DE/EU | https://www.defencejobseu.com/companies/reflex-aerospace |
| Dragonfly Aerospace | ZA | μDragonfly / Dragonfly platform (up to ~200 kg) | In-house HDRTX X-band 1.5–3 Gbps, CTRS S-band; EO heritage | TRL 9 (EOS SAT-1 2023) | On request | ZA (non-ITAR, EU-friendly) | NASA SoA 2026 |
| Alén Space | ES | Nano/micro platforms with TOTEM/TREVO SDR integration | Focus 3U–16U; partners for larger | TRL 9 (Lume-1, numerous) | On request | ES/EU | https://satsearch.co/products/alenspace-totem-software-defined-radio-sdr |
| AAC Clyde Space | SE/UK | EPIC series (6U–~50 kg); Sirius avionics | Smaller than target class but strong avionics/EPS components | TRL 9 | On request | SE/UK | NASA SoA 2026 |
| Blue Canyon Technologies (RTX) | US | X-SAT Saturn-class (ESPA), X-SAT Venus-class | Saturn: ~200 kg class, ≥70 kg payload, high agility; Venus: ~100 kg | TRL 9 (numerous DoD/NASA) | Reported $5–10 M class (price unverified); 12–18 months | US; likely ITAR for defence payload integration | https://www.satnow.com/products/satellite-bus-platforms/blue-canyon-technologies/45-1186-x-sat-saturn-class |
| York Space Systems | US | S-CLASS / LX-CLASS | S-CLASS: payload 85 kg+, 500 W peak (ext. to 1 kW); mass-produced for SDA Tranche | TRL 9 (SDA T0/T1) | ~$10 M+ per unit incl. integration at SDA volumes (price unverified) | US; ITAR likely | https://spacenexus.us/compare/satellite-buses |
| Apex Space | US | Aries (100 kg payload), Nova (300 kg), GEO Aries | Aries: ~100 kg payload, ~1 kW; delivered in <12 months | TRL 9 (Aries SN1 2024; multiple 2025) | Public starting price ~ $8 M (price unverified) | US; EAR/ITAR depending on config | https://www.apexspace.com/platforms |
| Terran Orbital (Lockheed Martin) | US | Nebula / Renegade buses | ESPA to ESPA-Grande class | TRL 9 (SDA Tranche 0 Transport) | On request | US ITAR | NASA SoA 2026 |
| Rocket Lab | US/NZ | Photon / Pioneer | Photon: up to 180 kg instrument; dedicated launch synergy | TRL 9 (CAPSTONE, Varda) | On request | US ITAR | https://spacenexus.us/compare/satellite-buses |
| Muon Space | US | Halo bus (~200–500 kg) | High-power, in-house; climate/defence | TRL 9 (MuSat 2023–25) | On request | US | (Muon Space corporate; verify) |
| K2 Space | US | Mega-class (large); Gravitas | Above target class; listed for completeness | TRL 7–8 | On request | US | — |
| Astro Digital | US | Corvus-Micro / Corvus-XL | 16U–ESPA; hosted-payload model | TRL 9 | On request | US | — |
| Loft Orbital | US/FR | YAM hosted-payload service (Longbow bus by Airbus) | Hosted-payload slot + ops; avoids owning a bus | TRL 9 (YAM-2/3/5/6) | Negotiated per mission; no rate card | US/FR | https://spacenexus.us/guide/cost-to-launch/hosted-payload |
| Spacemanic | SK/CZ | Nano platforms (≤16U) | Not in target class; components (GNSS, OBC) relevant | TRL 9 | — | EU | — |
| ISISPACE | NL | 16U and small micro platforms; Kleos scouting-mission heritage | Built Kleos Scouting Mission (4× 6U) RF-geolocation cluster | TRL 9 | On request | NL/EU | — |

**Observations (A):** For a Greek/EU integrator, the shortlist with real ESPA-class heritage and no ITAR exposure is NanoAvionics MP42H (payload-limited at 35 kg; a stretched variant must be negotiated), Aerospacelab VSP, OHB-LuxSpace Triton-X, BST LEOS-100, and EnduroSat microsat. US buses (BCT Saturn, York, Apex) carry more payload and power out of the box but introduce ITAR/EAR licensing for a SIGINT application. The Kleos (ISISPACE/BST), HawkEye 360 (SFL/UTIAS) and Unseenlabs precedents show RF-geolocation payloads flying on 6U–30 kg buses, so a 100–150 kg bus is generous for a first unit and leaves margin for larger apertures and ISLs.

---

## B. Wideband and multiband receive antennas (UHF/L/S/C/X)

Design driver: hemispherical or Earth-disc coverage for survey channels (gain 0–6 dBi, 300 MHz–4 GHz, ≥100% fractional bandwidth), plus directional apertures for C/X-band and for DF (phased arrays or multi-element interferometers). Few COTS products are marketed explicitly as "SIGINT antennas"; the practical path is spectrum-monitoring/wideband products plus custom arrays.

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Anywaves | FR | Compact Wideband Antennas (UHF–S) | 300 MHz–4 GHz defined per project; up to 100% fractional bandwidth; <3 dBi boresight, hemispherical; single CP (RHCP/LHCP); S-band version <1U footprint; marketed for spectrum monitoring, SSA, "intelligence applications" | TRL 9; flew on Pandore nanosat (Mar 2025) | On request; typ. €20–60 k per FM antenna class (price unverified); 4–8 months | ITAR-free (stated) | https://anywaves.com/products/compact-wideband-antennas/ |
| Anywaves | FR | Quadrifilar Helix (UHF/VHF/L) and S/X patches | QFH: hemispherical CP; S-band TT&C patch 6.5 dBi 132 g; X-band payload TM patch 11.5 dBi 65 g | TRL 9 (100+ units flown) | On request | ITAR-free | https://anywaves.com/products/quadrifilar-helix-antennas/ |
| Oxford Space Systems | UK | Deployable helical antennas (UHF/VHF/S), Wrapped-Rib reflectors (0.5–3 m) | Helical: >4–4.5 dBi, <1.2 kg, high RF power; Wrapped-Rib 1 m-class deployable reflector usable for L/S/C/X receive at 20–35 dBi | Helical TRL 9; Wrapped-Rib flown 2024–25 (verify) | On request; deployable reflectors £0.5–1.5 M (price unverified) | UK export control; non-ITAR | https://www.nasa.gov/wp-content/uploads/2026/05/9-soa-comm-2025-final.pdf |
| Helical Communication Technologies | US | Helios deployable helical | 3 dBi, 180 g; UHF/VHF | TRL 9 | On request | US EAR | NASA SoA 2026 |
| Tendeg | US | KaTENna / deployable mesh reflectors 0.5–1.5 m; deployable arrays | Ka to L-band; stowed <2U-class for 1 m | TRL 9 (multiple CubeSat missions) | On request | US (likely ITAR for DoD derivatives) | — |
| MMA Design | US | T-DaHGR, NeuSAR deployable reflectarrays (X-band 29–45 dBi); HaWK arrays | T-DaHGR 1.3–11 kg, 29–42.5 dBi; NeuSAR >45.5 dBi 16.5 kg | NeuSAR flown; T-DaHGR not yet | On request | US EAR/ITAR | NASA SoA 2026 |
| EnduroSat | BG | X-band patch arrays (1×1 to 8×12), S-band wideband patch, UHF | X-band 4×4: 16 dBi 53 g; 8×12: 26 dBi 490 g; S-band wideband patch 5 dBi 115 g | TRL 9 (most), 8×12 TRL 7 | Published catalogue prices historically €1–10 k per patch (price unverified) | EU, ITAR-free | NASA SoA 2026 |
| Anteral | ES | X-band patches/arrays (12–22 dBi), waveguide horns X/K/Ka, Cassegrain 40 dBi | 8×8 X-band array 22 dBi 500 g; horns 15–30 dBi | Partial heritage | On request | ES/EU | NASA SoA 2026 |
| IQ spacecom | DE | S/X-band patches, high-gain patch 11.5 dBi | Light (10–180 g) | TRL 9 | Catalogue pricing | DE/EU | NASA SoA 2026 |
| ISISPACE | NL | UHF/VHF deployable dipoles, S-band patch | For TT&C class, not wideband | TRL 9 | Catalogue | NL/EU | NASA SoA 2026 |
| Alén Space | ES | UHF/VHF deployable, S-band; custom arrays with TOTEM | TT&C class | TRL 9 | Catalogue | ES/EU | — |
| Space Inventor | DK | S/X patches integrated with STTC-P3 SDR | Downlink-oriented | TRL 9 | On request | DK/EU | — |
| Haigh-Farr | US | Wraparound/conformal antennas, S-band patches, waveguide 25 dBi | Conformal launch-vehicle heritage; useful for conformal UHF/L designs | TRL 9 | On request | US | NASA SoA 2026 |
| Cobham Advanced Electronic Solutions / Honeywell | US/UK | Space antennas (helices, horns) | Mostly larger-sat class | TRL 9 | On request | US ITAR / UK | — |
| Beyond Gravity (ex-RUAG Space) | CH/SE/AT | Antennas, TT&C, GNSS antennas, PODRIX | Institutional class; S/X horns | TRL 9 | On request; expensive | CH/SE | — |
| Airbus Defence & Space / Thales Alenia Space | FR/DE/IT | Custom SIGINT arrays (CERES-class) | Not COTS; CERES (2021) uses multi-sat formation for TDOA/FDOA | TRL 9 (institutional) | Programme-level | FR (strict) | — |
| Eravant (ex-SAGE Millimeter) | US | Horns, OMTs, waveguide components to 110 GHz | COTS lab-grade; not space-qualified by default | TRL 5–6 for space | Catalogue $0.5–5 k | US EAR | — |
| Printech Circuit Laboratories | UK | Flexible/printed antennas and RF circuits | Conformal printed arrays | TRL 7–9 | On request | UK | — |
| Kall Morris Inc | US | Deployable structures/antennas (REACCH) | Deployable booms | TRL 6–8 | On request | US | — |
| Custom Vivaldi/LPDA/spiral arrays (universities, SMEs: e.g., TTI Norte ES, Antenna Development Corp US, Heliox/Greek SMEs) | various | Tapered-slot (Vivaldi) and log-periodic arrays 0.3–12 GHz for wideband DF | Vivaldi elements give 1:10+ bandwidth with 5–8 dBi; arrays of 4–16 elements for interferometric DF | TRL 4–6 space; mature on aircraft/ground | Dev contract €0.3–1.5 M (price unverified) | EU DU 5A001 possible for DF | — |

**Observations (B):** No single COTS antenna covers 0.3–12 GHz. A realistic suite is (i) 2× Anywaves-class wideband CP antennas for UHF–S survey; (ii) a 0.6–1 m deployable mesh/wrapped-rib reflector (OSS/Tendeg) with a dual-band L/S or C/X feed for weak-signal collection; (iii) a 4–8 element X-band patch array for radar-emitter detection; (iv) a 4-element UHF/L interferometer baseline (≥1 m, deployable booms) for single-satellite AoA. Deployable reflectors are the long pole (12–18 months) and the main schedule risk in this category.

---

## C. RF front-end: LNAs, filters, limiters, switches, downconverters

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Qorvo | US | CMD167 and CMD-series GaAs LNAs (e.g., CMD167 0.5–3 GHz/8 GHz class), QPL9xxx; "Space" screening flows | CMD-series die/SMT LNAs NF 0.6–1.5 dB, 10–25 dB gain; space screening per MIL-PRF-38534 on request | TRL 9 (many space uses) | $20–200 per unit commercial; space-screened 10–50× | US EAR (3A001/9A515); not ITAR | https://www.qorvo.com/products/p/CMD167 |
| Analog Devices | US | Space-qualified RF: ADL8xxx LNAs, HMC series, ADRF6xxx/ADMV downconverters, ADF4xxx PLLs (S-grade / SMD 5962) | e.g., ADRF5020 switch, HMC1049 LNA NF 1.1 dB 0.25–6 GHz; space-grade (QMLV) subsets | TRL 9 | Space grade $0.5–5 k per part; 20–40 weeks | US EAR | — |
| Mini-Circuits | US | Space-Qualified (SQ) catalogue: LNAs, filters, mixers, switches | NASA-qualification heritage on Cubesats; "space-qualified" catalogue, limited screening | TRL 7–9 | $50–1,000; 4–12 weeks | US EAR99/3A001 | — |
| Low Noise Factory | SE | Cryogenic and room-temp LNAs (LNF-LNR series 0.3–18 GHz) | Room-temp NF 0.3–1 dB at L/S/C; packaged modules 20–50 g | TRL 6–7 for space (radio-astronomy heritage; some space uses) | €2–8 k per module; 8–16 weeks | SE/EU, EU DU 3A001 possible | — |
| Erzia Technologies | ES | ERZ-LNA space LNAs (e.g., ERZ-LNA-2100-2700-25-2-NS K-band, S/C/X variants); NewSpace COTS line; SSPAs | Hermetic modules 20–100 g; NF 1–2.5 dB; ECSS-screened options; NewSpace COTS line lower-cost | TRL 9 (institutional); NewSpace line TRL 8 | €3–15 k per hi-rel LNA; NewSpace line €1–5 k (price unverified); 12–20 weeks | ES/EU, ITAR-free | https://erzia.com/newspace |
| TTI Norte | ES | Space LNAs, filters, converters (ESA heritage: Galileo, Sentinel) | L/S/C/X/Ku LNAs; frequency converters | TRL 9 | On request; 6–12 months hi-rel | ES/EU ITAR-free | — |
| Teledyne e2v / Teledyne Defense Electronics | UK/FR/US | Microwave modules, limiters, switches; also ADCs (see D) | Hi-rel | TRL 9 | On request | UK/FR + US entities (check) | — |
| Frontgrade (ex-CAES/Cobham AES) | US | Rad-hard RF: LNAs, switches, PLLs, GaN | Rad-hard to 100 krad+ | TRL 9 | High (hi-rel) | US ITAR/EAR | — |
| Microchip | US | Space RF (ex-Microsemi): PLLs, PIN diodes, limiters, GaN | QMLV parts | TRL 9 | — | US EAR | — |
| MACOM | US | GaAs/GaN LNAs, switches, limiters (e.g., MAAL-011xxx) | Commercial, screening via distributors | TRL 7–9 | $5–100 | US EAR | — |
| Cobham Advanced Electronic Solutions (now Frontgrade) | US | see Frontgrade | — | — | — | — | — |
| Filtronic | UK | Space-grade filters, diplexers, LNAs (E-band to X) | Hi-rel, used on NASA/ESA | TRL 9 | On request | UK | — |
| K&L Microwave / Knowles (DLI) | US | Space cavity/ceramic filters, diplexers | Hi-rel | TRL 9 | $1–10 k; 20–30 weeks | US EAR | — |
| Exxelia / Temex / Rakon (FR) | FR/NZ | Filters, SAW, frequency references | Space heritage | TRL 9 | On request | FR/EU | — |
| CAES/Frontgrade Gaisler | SE | (processors, see J) | — | — | — | — | — |

**Observations (C):** The receive chain (limiter → preselect filter bank → LNA → tunable downconverter → ADC) can be built almost entirely from EU sources (Erzia, TTI Norte, Low Noise Factory, Filtronic, Exxelia) with Qorvo/ADI die as the only US content (EAR, not ITAR). Rad-tolerance for a 3–5 year LEO mission at 500–600 km requires ~10–20 krad TID behind 2–3 mm Al; most GaAs/GaN MMICs are inherently tolerant, so COTS+ screening (ECSS-Q-ST-60-13 style) is sufficient. Switched preselect filter banks and hot-standby LNAs for lightning/jamming survivability are the main custom items.

---

## D. Digitisers, SDRs and on-board processing

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| AMD (Xilinx) | US | Zynq UltraScale+ RFSoC (ZU2xDR–ZU4xDR Gen1–3; DFE) | Up to 8× 12/14-bit ADC @ 4–5 GSPS (Gen3 up to 6 GHz RF input), 8× DAC; ARM A53 + FPGA; commercial/industrial grade (used in space as COTS) | TRL 9 as COTS (HawkEye 360 via Xiphos Q8RF; many others) | Devices $2–10 k; boards $10–40 k | US EAR (3A001/4A994); high-rate ADC thresholds matter for EU DU 3A001.a.5 | https://resources.epiqsolutions.com/hubfs/Xiphos/Xiphos%20Q8RF%20Processor%20spec%20sheet.pdf |
| AMD | US | Versal RF (VR1602/VR1652 etc.) | Up to 32 GSPS 14-bit ADCs, 7 GHz+ direct RF, hardened DSP; commercial sampling 2025–26 | TRL 5–6 for space | $$$; no space grade yet | US EAR | — |
| AMD | US | XQR Versal AI Core XQRVC1902 / AI Edge XQRVE2302 (space-grade) | Class B qualified (2024); Class Y lidless package sampling Oct 2026, flight units 2H 2027; 15-year missions | TRL 8–9 (Class B parts flying) | $50–150 k per device class (price unverified); long lead | US EAR 9A515 | https://techaeris.com/2026/10/05/amd-launches-15-year-space-grade-versal/ |
| Microchip | US | PolarFire RT (RTPF500T) rad-tolerant FPGA; PolarFire SoC | 100 krad TID, SEL-immune; low power; no on-chip RF ADC | TRL 8–9 | $10–40 k class | US EAR | — |
| Teledyne e2v | FR/UK | EV12AQ600 quad 12-bit ADC | 1×6.0 GSPS / 2×3.0 / 4×1.5 GSPS; input bandwidth 4.5–6 GHz (datasheet-dependent); 2.2–6.8 W; 150 krad; QML-Y | TRL 9 (space-qualified) | €5–15 k per device (price unverified); 20–40 weeks | FR/UK; EU DU 3A001.a.5 (export licence likely needed even intra-EU for non-EU end use) | https://www.everythingrf.com/products/analog-to-digital-converters/e2v-inc/776-354-ev12aq600 |
| Teledyne e2v | FR/UK | EV12AD550 (dual 12-bit 1.5 GSPS), EV10AQ190 (quad 10-bit 1.25 GSPS) | Space-grade | TRL 9 | — | EU DU | — |
| Frontgrade (CAES) | US | Rad-hard ADCs/DACs, GR740/GR765 processors | — | TRL 9 | — | US ITAR/EAR | — |
| Xiphos (Epiq Solutions) | CA/US | Q8 / Q8J / Q8RF | Q8RF: Zynq RFSoC ZU28DR, 8 RX + 8 TX, ADC 12-bit 4.096 GSPS, RF input to 4 GHz, 20–30 W, 200 g, 100×100×20 mm, -40/+60 °C; TMR control FPGA, EDAC, scrubbing | Q8/Q8J flying on 24 HawkEye 360 satellites (Clusters 8–9 on Q8/Q8J); Q8RF announced, heritage to verify | $50–150 k per FM (price unverified); 6–9 months | CA (Xiphos) / US (Epiq) — EAR; Canadian ECL | https://www.everythingrf.com/News/details/22615-hawkeye-360-enhances-space-based-rf-intelligence-with-xiphos-onboard-processing-cards |
| Epiq Solutions | US | Sidekiq X4/X2/NV100 SDR cards; Matchstiq | X4: 4 RX/4 TX, 1 MHz–6 GHz, up to 200 MHz IBW/ch, Zynq UltraScale+; used in airborne SIGINT; space variants via Xiphos | TRL 7–8 space | $10–30 k | US EAR (SDRs can be 5A001) | — |
| Alén Space | ES | TOTEM / TREVO SDR | TOTEM: Zynq-7000 + AD9364, 70 MHz–6 GHz, 56 MHz IBW, 130 g; TREVO: higher power, <714 g | TRL 9 (Lume-1 and others; Kleos used similar class) | TOTEM ~€15–40 k (price unverified) | ES/EU | https://satsearch.co/products/alenspace-totem-software-defined-radio-sdr |
| GomSpace | DK | NanoCom SDR MK2 / MK3 | Zynq + AD936x transceivers; VHF–X; 271 g; MK3 with more FPGA | TRL 9 | €20–50 k (price unverified) | DK/EU | https://gomspace.com/product/software-defined-radio/ |
| EnduroSat | BG | Versatile Wideband SDR (VW-SDR) | VHF–C-band, up to ~982 Mbps processing, <1.5 kg | TRL 9 | On request | BG/EU | NASA SoA 2026 |
| Space Micro (Voyager) | US | MicroSDR-C, Proton400k processors | VHF–C; 750 g | TRL 9 | — | US ITAR | NASA SoA 2026 |
| Rincon Research | US | AstroSDR | VHF–C, 95 g; SIGINT lineage | TRL 9 | — | US ITAR likely | NASA SoA 2026 |
| CesiumAstro | US | SDR-2104 (L/S/C/X), Nightingale RFPU | Phased-array oriented; 0.9–3.5 kg | TRL 7–8 | — | US ITAR/EAR | NASA SoA 2026 |
| Trident Systems | US | RDRT (RFSoC, 8 ch L/S), ADCM (MPSoC, 6.4 GSPS RX) | 571–690 g | TRL 6–7 | — | US ITAR | NASA SoA 2026 |
| Innoflight | US | SCR-104/106/108 SDRs; CFC-400/500 processors | Encrypted radios; CFC-500 Zynq US+ based | TRL 9 | — | US ITAR | NASA SoA 2026 |
| Per Vices | CA | Cyan/Crimson SDRs (to 18 GHz, 3 GHz IBW) | Lab/ground SDRs; good for ground processing and testbeds | TRL 4 space | $20–100 k | CA | — |
| Ettus/NI | US | B205mini (flown), X410 (ground) | B205mini 24 g flown as COTS | TRL 7 | $1–3 k | US EAR | NASA SoA 2026 |
| Unibap | SE | iX10-100 / iX5 SpaceCloud | AMD x86 + FPGA + GPU-class AI; 10–20 W; ESA/NASA heritage | TRL 9 | €50–150 k (price unverified) | SE/EU | — |
| Ubotica | IE | CogniSAT-XE2 (Intel Myriad X) | AI inference 1–3 W; Φ-sat heritage | TRL 9 | €20–50 k | IE/EU | — |
| KP Labs | PL | Leopard / Antelope DPU/OBC | Zynq US+ with AI; Intuition-1 heritage | TRL 9 | On request | PL/EU | — |
| AITech / Aitech Systems | US/IL | S-A1760 Venus (NVIDIA Jetson TX2i rad-tolerant), SP0-S | Jetson-based rad-tolerant AI SBCs | TRL 8–9 | $30–80 k | US/IL EAR | — |
| Spiral Blue | AU | Space Edge Computers (Jetson) | COTS AI compute | TRL 8 | — | AU | — |
| Exo-Space, Kepler Communications | US/CA | FeatherEdge AI; Kepler payload compute | Edge AI | TRL 7–8 | — | — | — |
| RHEA / Xiphos / Moog | — | Moog Broad Reach OBCs | Hi-rel | TRL 9 | — | US ITAR | — |

**Observations (D):** The digitiser decision is the architectural fork: (a) a Zynq RFSoC-based COTS board (Xiphos Q8RF, or a custom board on ZU47DR/ZU48DR) gives 8 channels × ≥2 GHz instantaneous bandwidth direct-RF to 6 GHz, enabling simultaneous UHF–C digitisation and digital beamforming/DF, with X-band via a block downconverter; (b) a Teledyne EV12AQ600 + PolarFire RT architecture is more rad-tolerant and EU-sourced for the ADC but needs far more custom design. HawkEye 360's choice of Xiphos Q-series is the strongest precedent. Instantaneous bandwidth of ≥1 GHz per channel, 12-bit, and ≥60 dB spur-free range should be the specification floor; expect 40–80 W for the full digitiser + FPGA chain, which drives the EPS sizing in Section H.

---

## E. Timing and frequency references, GNSS receivers

TDOA/FDOA across satellites requires inter-satellite time alignment of ~10–50 ns (→ 3–15 m of path-difference error) and frequency stability of ~1e-11 over the collection interval. Practical approach: a GNSS-disciplined OCXO or CSAC with 1-PPS steering, common-view GNSS post-processing on the ground, and raw-GNSS logging alongside the RF captures.

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Microchip | US | Space CSAC SA.65 (P/N 090-02789-007), announced 15 Sep 2026 | Chip-scale Cs atomic clock; ≥30 krad TID; -40/+80 °C; <120 mW; <17 cm³; Allan deviation class ~1e-10 @1 s, ~1e-12 @ 1 day (SA.65 commercial values; verify space variant) | Space variant new (TRL 7–8); SA.45s widely flown on CubeSats | Commercial SA.65 ~$3–6 k; space CSAC likely $15–40 k (price unverified) | US EAR (atomic clocks 7A/3A controls possible) | https://www.militaryaerospace.com/communications/product/55404857/microchip-introduces-radiation-tolerant-atomic-clock-for-leo-satellites |
| Microchip | US | SA.45s CSAC (legacy), also 5071 Cs standard (ground) | SA.45s: 35 g, 120 mW, 1e-10 @1 s short-term, 3e-10/month drift | TRL 9 (many CubeSats) | $3–5 k | US EAR | https://www.gpsworld.com/microchip-offers-new-chip-scale-atomic-clock-for-defense/ |
| Safran Timing (ex-Orolia / Spectratime) | FR/CH | mRO-50 Ruggedized miniature Rb oscillator; RAFS (large) | mRO-50: 51 cc, 0.45 W, ADEV 3e-11 @1 s (typ.), 4e-13 @ 1 day class; ruggedised not space-qualified by default; Spectratime RAFS/mini-RAFS space grade (Galileo) | mRO-50 TRL 6–7 space; RAFS TRL 9 | mRO-50 ~€8–15 k; space RAFS €200 k+ (price unverified) | FR/CH; EU DU 3A002.g for atomic clocks | — |
| AccuBeat | IL | AR133/AR140 space Rb clocks; USO | Rb AFS for small sats; 1e-12/day class | TRL 9 (several LEO) | On request | IL | — |
| Rakon | NZ/FR | Space OCXOs (e.g., RK409, LNO series) | ADEV 1e-12 @1 s class; phase-noise optimised | TRL 9 | €2–15 k | NZ/FR | — |
| Q-Tech / Vectron (Microchip) / Bliley | US | Space OCXOs (QT2020, Poseidon) | 1e-12 class short-term | TRL 9 | $3–20 k | US EAR | — |
| AXTAL | DE | Space-qualified OCXOs/USOs | ESA heritage | TRL 9 | On request | DE/EU | — |
| Septentrio | BE | mosaic-X5 / mosaic-T / mosaic-G5 T (timing module 2025); PolaRx (ground); space-adapted via partners (e.g., LEO-PNT, Celeste) | mosaic-T: multi-constellation, PPS ~5 ns 1σ (ground); COCOM limits removed on request for space; raw data output for post-processing | mosaic in LEO via several missions (verify per customer) | €0.8–3 k per module; space screening extra | BE/EU; EU DU 7A005 may apply to space GNSS | https://www.septentrio.com/en/applications/assured-pnt-space/space |
| Hyperion Technologies (AAC Clyde) | NL | GNSS200/GNSS400 space receivers | Multi-GNSS, ~10 m / 0.1 m/s, PPS output; 20–40 g | TRL 9 | €10–25 k (price unverified) | NL/EU | — |
| SkyFox Labs | CZ | piNAV-NG / piNAV-L1 | GPS L1 C/A; 10 m; 24 g; 125 mW; ≤9 km/s | TRL 9 (many CubeSats) | ~€5–10 k (price unverified) | CZ/EU | https://www.satnow.com/products/gnss-receivers/skyfox-labs/143-1320-pinav-ng |
| Syrlinks (Safran) | FR | GNSS receivers for space (N-GNSS / SPACE GNSS) | Multi-constellation, rad-tolerant | TRL 9 | On request | FR/EU | — |
| GomSpace | DK | NanoSense GPS-kit / GNSS | PPS ±100 ns class | TRL 9 | €5–15 k | DK/EU | — |
| Beyond Gravity | CH/SE | PODRIX / LEORIX GNSS receivers | Institutional grade; cm-level POD with post-processing; PPS <10 ns class | TRL 9 (Sentinel, etc.) | €100 k+ (price unverified) | CH/SE | — |
| NovAtel (Hexagon) | CA | OEM7 series (OEM719/729) adapted for space | Multi-frequency; raw obs; used in several LEO sats | TRL 8–9 | $2–10 k + screening | CA/US EAR | — |
| Spacemanic | SK | GNSS receivers for CubeSats | — | TRL 9 | — | EU | — |
| Inter-satellite timing transfer | — | Options: (1) GNSS common-view with raw-observable logging (ns-level, no extra hardware); (2) two-way time transfer over S-band or optical ISL (Mynaric/Tesat terminals support ps-level ranging on some models); (3) ground-based post-correction using known reference emitters (calibration beacons) | Method (1)+(3) is baseline for first satellites; (2) when ISLs are added | — | — | — | — |

**Observations (E):** A dual-string approach (CSAC or mRO-50 for holdover + GNSS-disciplined OCXO for phase noise) costs <€40 k and is well within the mass/power budget. Space-GNSS receivers with raw observables (Septentrio mosaic-class, Beyond Gravity PODRIX) are the key enabler for post-processed ns-level common-view timing without ISLs. Rubidium standards fall under EU dual-use 3A002.g; CSACs may also be caught, so plan for intra-EU transfer formalities.

---

## F. Downlink, TT&C, optical and inter-satellite links

Data volume driver: a 4-channel × 500 MHz × 12-bit raw capture is 48 Gbit/s before decimation; realistic downlink is of detected/compressed snippets plus selected raw windows, so 0.5–2 Gbps X-band or 1–10 Gbps optical per pass is the target.

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Syrlinks (Safran) | FR | EWC27 X-band TX; N-XONOS; XONOS | EWC27: ≤1.4 Gbps, 27–33 dBm, 235 g; N-XONOS: ≤4 Gbps, 33 dBm, 385 g; XONOS: ≤6.3 Gbps in 375 MHz (DVB-S2/4D-TCM), 40 dBm, 2.4 kg | EWC27 & N-XONOS TRL 9; XONOS TRL 7–8 | EWC27 class ~€80–150 k (price unverified); 9–12 months | FR/EU, ITAR-free | https://satsearch.co/products/syrlinks-xonos-x-band-high-data-rate-transmitter |
| Syrlinks | FR | EWC31 / EWC31-NG S-band TT&C transceivers | 256 kbps–2 Mbps, 33 dBm, 360–405 g; CCSDS | TRL 9 | €40–80 k (price unverified) | FR/EU | NASA SoA 2026 |
| EnduroSat | BG | X-band Transmitter (≤1.5 Gbps, 270 g); X-band SDR TX (≤6 Gbps, <2.5 kg); S-band TRX III | Catalogue products | TRL 9 (both X-band units flown) | Historically published €30–120 k (price unverified) | BG/EU | NASA SoA 2026 |
| Aerospacelab | BE | XSDR (206 Mbps, 29 dBm, 555 g), SSDR | In-house, sold externally | TRL 9 | On request | BE/EU | NASA SoA 2026 |
| Dragonfly Aerospace | ZA | HDRTX-1.5 (1.5 Gbps, <4 W RF, 1.6 kg); HDRTx-3 (3 Gbps) | — | HDRTX-1.5 TRL 9 | On request | ZA | NASA SoA 2026 |
| Satlab | DK | SRX-8 X-band (<1 Gbps, 300 g); SRS-3/4 S-band | Danish; widely flown | TRL 9 | €30–80 k | DK/EU | NASA SoA 2026 |
| CUBECOM | ZA | XTXG2 (2.5 Gbps, 137 g), µHDTRX-X, HDRTX | Low mass | TRL 7–9 | On request | ZA | NASA SoA 2026 |
| Space Inventor | DK | STTC-P3 SDR (S/X, 9 kbps–10 Mbps, 230 g) | TT&C + modest payload DL | TRL 9 | — | DK/EU | NASA SoA 2026 |
| AAC Clyde Space | SE/UK | PULSAR-DATA XTX (50 Mbps, 130 g), STX | TT&C class | TRL 9 | — | SE/UK | NASA SoA 2026 |
| IQ spacecom | DE | XLINK transceiver (≤25 Mbps), SLINK-PHY, HISPICO | TT&C class | TRL 9 | €20–60 k | DE/EU | NASA SoA 2026 |
| GomSpace | DK | NanoCom TR-600 S-band; NanoCom XR / X-band modules | — | TRL 9 | — | DK/EU | — |
| Tethers Unlimited (ARKA) | US | SWIFT-XTS (S/X, 6–25 Mbps, 800 g), SWIFT-KTX Ka | — | XTS TRL 9 | — | US ITAR | NASA SoA 2026 |
| Innoflight | US | SCR-106HDR (1 Gbps X-band, AES-256), SCR-108 Ka | Encrypted DoD-oriented | TRL 9 | — | US ITAR | NASA SoA 2026 |
| Honeywell | US | STC-MS03 S-band transceiver | 6.25 Mbps, 1 kg | TRL 9 | — | US | NASA SoA 2026 |
| Space Micro (Voyager) | US | microKaTx-300 (1 Gbps K-band) | — | TRL 7 | — | US ITAR | NASA SoA 2026 |
| Thales Alenia Space | FR/IT | Institutional X/Ka TT&C and HDR transmitters | Large-sat class | TRL 9 | High | FR | — |
| Tesat-Spacecom | DE | SCOT20 (CubeLCT lineage) / SCOT80 optical terminals | SCOT20: ~100 Mbps–1 Gbps to ground, ~0.4–1 kg class, ~10–15 W (CubeLCT 100 Mbps, 0.4 kg flown on PIXL-1 2021); SCOT80: 10 Gbps class ISL/DTE, ~10 kg | CubeLCT TRL 9; SCOT20/80 TRL 8–9 (SDA/German missions) | €0.3–1.5 M per terminal (price unverified); 12–18 months | DE/EU; EU DU | NASA SoA 2026 |
| Mynaric (Rocket Lab) | DE | CONDOR Mk3 | 313 Mbps–2.5 Gbps (roadmap 10 Gbps); range >6,500 km; 80 mm aperture; 1536–1553 nm; SDA OCT standard-compliant; optical head 372×282×257 mm | Heritage listed; SDA Tranche 1 production | ~$0.5–1 M+ per unit at volume (price unverified) | DE (now US-owned by Rocket Lab since 2025; check regime) | https://www.satnow.com/products/laser-communication-terminals/mynaric/155-1475-condor-mk3 |
| Skyloom | US | Skyloom Mini / OCT terminals | SDA-compliant | TRL 7–8 | — | US ITAR | — |
| Astrolight | LT | ATLAS optical terminal (1 Gbps class DTE) | Small-sat optical DTE; Lithuanian; EDF-funded | TRL 6–7 (first flights 2025–26, verify) | On request | LT/EU | — |
| AAC Clyde Space | SE | CubeCat optical (1 Gbps, <1.33 kg, 15 W) | Flown NorSat-TD (Apr 2023) | TRL 9 | — | SE/UK | NASA SoA 2026 |
| DLR / Emxys | DE/ES | OSIRIS4 CubeSat (100 Mbps, 0.4 kg, 10 W); ODALCOM (200 Mbps, <1 kg, 2.6 W) | — | OSIRIS4 TRL 9; ODALCOM TRL 6 | — | EU | NASA SoA 2026 |
| Inter-satellite RF links | — | S-band ISL (e.g., Paradigma PFES-1 front-end, GomSpace/Alén SDRs with ISL waveform; Ka-band in production constellations) | For a 2–4 satellite cluster, S-band ISL at 100 kbps–1 Mbps suffices for time-transfer and cueing; optical for data | TRL 7–9 | — | — | NASA SoA 2026 |

**Observations (F):** The EU can supply the full comms chain without ITAR: Syrlinks N-XONOS/XONOS or EnduroSat X-band SDR TX (≥4 Gbps), Syrlinks EWC31 S-band TT&C, and Tesat SCOT20 or Astrolight optical as a growth path. X-band downlink needs a ground station with ≥3.7 m dish (Section K). Note spectrum: 8025–8400 MHz EESS downlink requires ITU filing; a passive-RF payload itself emits nothing, which simplifies licensing relative to SAR or comms missions.

---

## G. ADCS and GNC

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Blue Canyon Technologies | US | NST / Standard NST star trackers; RWP050/100/500, RW1/RW4 wheels; FlexCore ADCS | NST: ~6 arcsec cross-boresight, ~0.35 kg, ~1.5 W; RWP500: 0.5 N·m·s, ~0.75 kg; RW1: 1 N·m·s ~0.95 kg; RW4: 4 N·m·s ~3.2 kg (datasheet values, verify in ADCS-2026 PDF) | TRL 9 (hundreds flown) | $50–120 k per star tracker; $30–80 k per wheel (price unverified); 9–12 months | US; often ITAR (USML XV) for star trackers above certain performance | http://www.bluecanyontech.com/wp-content/uploads/ADCS-2026.pdf |
| Arcsec | BE | Sagitta star tracker; Twinkle (small) | Sagitta: 2 arcsec cross / 10 arcsec about boresight; 270 g; 1.5 W; 5–10 Hz; radiation-tested | TRL 9 | ~€40–70 k (price unverified) | BE/EU, ITAR-free | https://www.satnow.com/products/star-trackers/arcsec/37-1184-sagitta-star-tracker |
| CubeSpace | ZA | CubeStar; CubeWheel (Small/Medium/Large: ~1.7 / 10 / 30 mN·m·s legacy, new Gen2 up to 0.05+ N·m·s); CubeADCS integrated | For ≤50 kg; for 150 kg need external wheels | TRL 9 (hundreds) | €5–40 k | ZA | — |
| Hyperion Technologies (AAC Clyde) | NL | ST200/ST400 star trackers; RW210/RW400 wheels; IM200 IMU | ST400: 10 arcsec, 280 g; RW400: 0.03–0.05 N·m·s class | TRL 9 | €20–60 k | NL/EU | — |
| Sodern (ArianeGroup) | FR | Auriga star tracker; Horus | Auriga: ~2 arcsec class (3σ cross), ~210 g optical head; NewSpace price point; Horus for larger | TRL 9 (OneWeb volume) | ~€50–100 k (price unverified) | FR/EU | — |
| Jena-Optronik | DE | ASTRO CL / ASTRO XP star trackers | ASTRO CL: 1–2 arcsec class, ~1.1 kg | TRL 9 | €150–300 k (price unverified) | DE/EU | — |
| Terma | DK | T1 / HE-5AS star trackers | Institutional | TRL 9 | High | DK/EU | — |
| Rocket Lab (Sinclair Interplanetary) | CA/US | RW-0.03, RW-0.06, RW-0.4, RW-1.0 wheels; ST-16RT2 star tracker | RW-1.0: 1 N·m·s, ~1.5 kg; ST-16RT2 7 arcsec, 185 g | TRL 9 (very wide) | $30–60 k per wheel; $60–100 k tracker (price unverified) | CA (now US-owned): EAR/ITAR check | — |
| Vectronic Aerospace | DE | VRW-02/VRW-D series wheels; VST-41M star tracker; VMM magnetometers | VRW wheels 0.2–2 N·m·s class; VST-41M 10 arcsec | TRL 9 | €20–60 k | DE/EU | — |
| Redwire (ex-Adcole) | US/BE | Star trackers, sun sensors; Redwire Space Belgium (ex-QinetiQ) | — | TRL 9 | — | US/BE | — |
| Honeywell | US | HR-series wheels (large); MIMU | Too large for class | TRL 9 | — | US ITAR | — |
| Safran (Sensonor) / Honeywell / Northrop LN-200S | NO/US | IMUs: Sensonor STIM300/STIM377H (NO, tactical MEMS, 55 g, 1.5 W, flown widely); LN-200S FOG | STIM300: 0.3°/h bias stability; LN-200S 1°/h | TRL 9 | STIM300 ~€5–10 k; LN-200S ~$50 k+ | NO/EU (STIM) vs US ITAR (LN-200S) | — |
| Magnetorquers/magnetometers | various | NewSpace Systems (ZA) NCTR series, ISISPACE iMTQ, Vectronic, Hyperion | For momentum dumping | TRL 9 | €5–20 k | — | — |
| GNC software | — | Bright Ascension (UK) GenerationOne ADCS; CubeSpace/Hyperion firmware; custom on OBC | — | — | — | — | — |

**Observations (G):** A 0.05° pointing requirement (for 0.6–1 m reflector at X-band, ~3° HPBW) is met by any of Arcsec Sagitta + 4× Vectronic/Hyperion 0.2–0.5 N·m·s wheels + STIM300, all ITAR-free. EU star trackers (Arcsec, Sodern) have 6–9 month lead times; US wheels (BCT, Rocket Lab) can be 12+ months and need export licences; Vectronic and Hyperion are the EU alternatives. Budget ~€250–450 k for a complete ADCS set at this class.

---

## H. Electrical power system and solar arrays

Power budget basis: payload 100–200 W orbit-average (digitiser/FPGA 40–80 W, LNAs/converters 10–20 W, processing 20–40 W, downlink 40–80 W when active) + bus 60–100 W → 1.0–1.5 kW deployed array (EOL) at ~35% sunlit-duty with pointing losses; 300–600 Wh battery.

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| MMA Design | US | HaWK / eHaWK / rHaWK deployable arrays (17–42 series), next-gen "Disrupting the State of the Art" arrays | HaWK 17AS42: ~112 W; eHaWK 27A up to ~240 W per wing; 30% ZTJ/XTJ cells; articulating (with Honeybee SADA) | TRL 9 (Artemis I CubeSats, GEO heliophysics, many LEO) | $200–600 k per wing pair class (price unverified); 9–12 months | US EAR 9A515 | https://mmadesignllc.com/solar-arrays |
| Rocket Lab (SolAero) | US | Z4J/IMM-α cells (30–33%); SolAero/Rocket Lab solar panels and arrays | Cells 30–32% BOL; panel integration | TRL 9 | Cells $150–300 per cell (price unverified) | US EAR | — |
| Azur Space | DE | 3G30C/4G32C triple/quad-junction cells (30–32%); assembled panels via partners | 3G30: 30% BOL, 80 µm; 4G32: 32% | TRL 9 (European standard) | ~€100–250 per cell class (price unverified); panels via DHV/AAC/others | DE/EU, ITAR-free | — |
| DHV Technology | ES | Deployable arrays and body panels for 1U–200 kg; MP42-class wings | Custom wings 100–500 W; Azur cells; hold-down/release mechanisms | TRL 9 (100+ missions) | €100–400 k for 1 kW class (price unverified); 6–10 months | ES/EU | — |
| EnduroSat | BG | Solar panels (1U–ESPA), deployable arrays | Azur cells | TRL 9 | Catalogue | BG/EU | — |
| AAC Clyde Space | SE/UK | Photon solar panels, deployable; Starbuck EPS | — | TRL 9 | — | SE/UK | — |
| Redwire | US/BE | ROSA (large), Redwire Space Belgium (ex-QinetiQ) cells & arrays | ROSA too large; Redwire Belgium = EU source | TRL 9 | — | US / BE | — |
| Airbus / Beyond Gravity / Leonardo | EU | Institutional arrays | Large-sat | TRL 9 | — | — | — |
| Saft (TotalEnergies) | FR | VES16 / VL51ES Li-ion cells; MPS/VES modules; Saft 4S/8S smallsat batteries | VES16: 4.5 Ah, 155 Wh/kg, 20-year GEO heritage; smallsat packs 100–1,000 Wh | TRL 9 (industry reference) | €30–150 k per smallsat battery (price unverified); 9–12 months | FR/EU | — |
| EaglePicher | US | SLC-16050 / 18650-based LEO batteries; Li-ion SAR | — | TRL 9 | — | US EAR | — |
| EnerSys ABSL | UK/US | 18650-based space batteries (Sony/Molicel cells) | Modular 8s–Ns strings; very wide heritage | TRL 9 | £50–200 k | UK | — |
| GomSpace | DK | NanoPower BPX / BP4 battery packs; P60 PDU/ACU EPS | BPX: 77–154 Wh; P60: 350 W class EPS | TRL 9 | €10–40 k | DK/EU | — |
| Berlin Space Technologies / AAC / Kongsberg NanoAvionics / EnduroSat | EU | PCDUs for 100–200 kg class (bus-integrated) | 28 V unregulated, 300–1,000 W | TRL 9 | Bus-integrated | EU | — |
| Terma | DK | Power conditioning (institutional PCDUs) | Large-sat | TRL 9 | — | DK | — |
| Ibeos / Pumpkin / Vectronic | US/DE | Standalone 28 V PCDUs for microsats | — | TRL 8–9 | — | — | — |

**Observations (H):** A fully EU EPS (Azur cells on DHV wings, Saft or ABSL battery, bus PCDU) is routine. The deployable array is a 6–10 month lead item; MMA (US) is the performance benchmark but adds EAR licensing. Thermal design is coupled: the RFSoC digitiser dissipates 20–30 W in a compact volume and needs a dedicated conductive path/radiator.

---

## I. Propulsion (100–150 kg class)

Needed for: orbit phasing of constellation planes (ΔV 10–50 m/s per phasing), drag make-up at 450–550 km (5–20 m/s/year), collision avoidance, and end-of-life disposal (≤5-year rule → 20–60 m/s from 550 km). Total 100–200 m/s is a reasonable requirement.

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| ENPULSION | AT | MICRO R³ (FEEP, indium) | 0.5–1 mN; Isp 2,700–3,600 s; 26 kN·s total impulse; 64–120 W (110 W nominal); 2.7 kg dry / 3.95 kg wet incl. PPU; 1.25 kg indium; 140×120×127 mm | TRL 9 (first MICRO in space Q1 2021; >300 ENPULSION thrusters in orbit) | ~€150–300 k (price unverified); 6–9 months | AT/EU, ITAR-free | https://www.enpulsion.com/wp-content/uploads/DataSheet_Micro_20260323.pdf |
| ENPULSION | AT | NANO R³ / NANO AR³ | 0.35 mN; Isp 2,000–6,000 s; ~5 kN·s; 40 W; 0.9 kg | TRL 9 | €80–150 k (price unverified) | AT/EU | https://www.enpulsion.com/products/nano-r3/ |
| Exotrail | FR | spaceware-micro / spaceware-mini Hall thrusters (xenon) | micro: 2–7 mN, Isp ~800–1,000 s, 60–200 W; for 50–250 kg sats; mini for larger | TRL 9 (flown 2020 on 6U; multiple microsats) | €300–600 k class (price unverified); 9–12 months | FR/EU | https://www.exotrail.com/product/hall-thrusters-spaceware |
| ThrustMe | FR | NPT30-I2 (iodine gridded ion), NPT30-I2-1.5U | 0.3–1.1 mN, Isp 1,500–2,400 s, 35–65 W, 1.2–1.7 kg; iodine (unpressurised) | TRL 9 (2020 first iodine ion in orbit; many Spacety/others) | €100–200 k (price unverified) | FR/EU | — |
| Busek | US | BIT-3 (iodine RF ion), BHT-200 Hall | BIT-3: 1.1 mN, 2,100 s, 56 W; BHT-200: 13 mN 200 W | TRL 9 | — | US ITAR | — |
| Orbion Space Technology | US | Aurora Hall thruster | 10–25 mN class, 200–500 W; too power-hungry for 150 kg | TRL 9 (2024+) | — | US ITAR | — |
| Dawn Aerospace | NL/NZ | B20 (nitrous/propene green bi-prop), B1 | B20: 20 N class thruster; CubeDrive/SatDrive systems; ΔV 100–300 m/s for 100–150 kg at 10–20 kg system | TRL 9 (dozens flown incl. on microsats) | €250–500 k per system (price unverified) | NL/NZ, ITAR-free | https://www.dawnaerospace.com/thrusters |
| Bradford Space (ECAPS) | NL/SE | HPGP 1 N / 0.1 N LMP-103S green mono-prop | High-TRL (PRISMA 2010, SkySat constellation) | TRL 9 | €0.5–1 M system class (price unverified) | NL/SE; LMP-103S propellant logistics | — |
| Benchmark Space Systems | US | Halcyon (HTP), Xantus metal plasma | Green mono/bi-prop | TRL 9 | — | US | — |
| Aerojet (L3Harris) / Moog | US | MR-103/106 hydrazine, cold gas | Hydrazine undesirable for class | TRL 9 | — | US ITAR | — |
| Cold gas: GomSpace (NanoProp 6U/MEMS), VACCO (US), Hyperion PM200/PM400 (NL) | DK/US/NL | Butane/other cold gas | ΔV 10–40 m/s for this mass; useful for phasing only | TRL 9 | €50–150 k | EU/US | — |
| Pale Blue (JP) / Aliena (SG) / Morpheus Space (DE) | JP/SG/DE | Water resistojet / Hall / FEEP | Alternatives; Morpheus GO-2 FEEP (DE) EU-sourced | TRL 7–9 | — | — | — |

**Observations (I):** For 150 kg with 150–200 m/s, ENPULSION MICRO R³ (26 kN·s → ~170 m/s at 150 kg) at 110 W is the mass-efficient EU baseline if the power system can afford 110 W during thrust arcs (eclipse-side thrusting off); otherwise Exotrail spaceware-micro gives faster phasing at higher power, and Dawn B20 gives impulsive manoeuvres with no power penalty. Propulsion is not required for the first satellite's core mission but is mandatory for constellation phasing and the 5-year disposal rule.

---

## J. On-board computers and flight software

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Xiphos (Epiq) | CA | Q8 / Q8J / Q8S | Zynq UltraScale+ MPSoC; Q8J adds I/O; 10–20 W; rad-tolerant features (TMR supervisor, scrubbing) | TRL 9 (HawkEye 360, dozens of missions) | $40–100 k (price unverified) | CA ECL / US EAR | https://satsearch.co/products/xiphos-q8-processor |
| Unibap | SE | iX10-100 / iX10-101 (SpaceCloud) | AMD Ryzen V1605B + Microchip PolarFire + optional Myriad X; Linux; 10–30 W | TRL 9 | €60–150 k (price unverified) | SE/EU | — |
| Innoflight | US | CFC-400 / CFC-500 | Zynq; encrypted; DoD | TRL 9 | — | US ITAR | — |
| GomSpace | DK | NanoMind A3200 / HPC (Zynq) | TRL 9; CSP-based | TRL 9 | €10–40 k | DK/EU | — |
| KP Labs | PL | Antelope OBC/DPU; Leopard DPU; Oryx software | Zynq US+; RTOS + Linux; Intuition-1 (2023) | TRL 9 | On request | PL/EU | — |
| Frontgrade Gaisler | SE | GR712RC (LEON3), GR740 (LEON4), GR765 (LEON5/NOELV) rad-hard processors and OBC boards | Rad-hard (300 krad); ESA standard | TRL 9 | €20–100 k per board | SE/EU (some US-owned content) | — |
| ISISPACE / AAC Clyde Space (Sirius OBC) / EnduroSat OBC / Spacemanic | NL/SE/BG/SK | Nanosat OBCs (ARM Cortex-M/R) | For bus functions | TRL 9 | €5–30 k | EU | — |
| Bright Ascension | UK | GenerationOne flight software framework + ground software | Component-based FSW; many missions | TRL 9 | Licence £50–200 k class (price unverified) | UK | — |
| NASA cFS / F´ (F Prime) | US | Open-source flight software frameworks | cFS: Apache-2.0; F´: Apache-2.0 (JPL); huge heritage | TRL 9 | Free; integration effort | Open source (no export issue) | — |
| Kubos (KubOS) / Major Tom | US | KubOS Linux FSW (largely dormant), Major Tom mission control | Mission control still used | TRL 7–9 | SaaS | US | — |
| Libre Space / SatNOGS | GR | Open-source ground network and software; Greek foundation | Useful for UHF/S-band TT&C testing and community ground stations | TRL 9 | Free | GR | — |
| GNU Radio / OpenSatKit | — | SDR waveform development and FSW integration | — | — | Free | — | — |

**Observations (J):** For the payload processor the Xiphos Q8RF (or a custom RFSoC board) doubles as digitiser and processor. The bus OBC is normally part of the bus purchase. F´ or cFS on the payload OBC, with GNU Radio-derived DSP blocks compiled to the FPGA, is a credible, licence-free FSW stack. Encryption (AES-256 on TT&C and downlink) is mandatory for a SIGINT mission; EU-sourced crypto modules exist (e.g., Thales, Rohde & Schwarz Cybersecurity, Syrlinks options) but national-security-grade crypto implies national-authority involvement in Greece.

---

## K. Ground station networks, services and hardware

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| KSAT (Kongsberg Satellite Services) | NO | KSATlite (S/X-band, 20+ sites incl. Svalbard, Troll); KSAT full network | Polar sites give ~every-orbit contact for SSO; X-band up to 1–2 Gbps on 3.7–7.3 m dishes | TRL 9 (industry leader) | Pay-per-pass or monthly; market range X-band $150–500/pass; KSATlite entry contracts ~$1–5 k/month (price unverified) | NO; data-handling under Norwegian/NATO rules | https://satsearch.co/products/kongsberg-satellite-services-ksat-lite |
| AWS Ground Station | US | On-demand / reserved antenna time; narrowband (<40 MHz) and wideband (≥40 MHz); sites US, Ireland, Bahrain, Sweden, Singapore, Australia, Cape Town, etc. | Per-minute billing; reserved requires 12-month monthly commitment; data lands in S3 | TRL 9 | Historical published rates: on-demand $3/min narrowband, $10/min wideband; reserved $2/$7 per minute (public pricing page now says "contact sales"; price unverified for 2026) | US (AWS ToS; data residency selectable) | https://aws.amazon.com/ground-station/pricing/ |
| Leaf Space | IT | Leaf Line (S/X-band shared network, 15+ sites incl. Nova Scotia, Ireland, Spain, Italy, Chile, Australia); Leaf Key (dedicated) | S/X; up to 1 Gbps X-band on larger dishes | TRL 9 | Pay-per-pass; no public rate card | IT/EU | https://leaf.space/faq/ |
| SSC (Swedish Space Corporation) | SE | SSC Infinity network (Esrange, Inuvik, Santiago, Punta Arenas, WA Australia, etc.) | Polar S/X; institutional heritage | TRL 9 | On request | SE/EU | https://newspacemarket.com/guides/ground-station-services/ |
| Atlas Space Operations | US | Freedom network/software; sites global | S/X; software-first | TRL 9 | On request | US | — |
| Viasat Real-Time Earth (RTE) | US | S/X/Ka global sites (incl. Sweden, Ghana, Australia) | High-rate X/Ka | TRL 9 | On request | US | — |
| Infostellar | JP | StellarStation (aggregator) | S/X via partner antennas | TRL 9 | Per-pass | JP | — |
| Dhruva Space | IN | Ground station hardware and services (India) | S/X | TRL 8–9 | — | IN | — |
| RBC Signals | US | Aggregated network | — | TRL 9 | Per-pass | US | — |
| Azure Orbital Ground Station | US | Microsoft Azure Orbital GSaaS — status: Microsoft announced end of Azure Orbital Ground Station as a public service (2024–25); treat as unavailable; verify | — | — | — | — | — |
| Hellenic / Greek assets | GR | Thermopylae satellite ground station (OTE/COSMOTE), ESA Greek Connectivity Programme ground segment; Libre Space SatNOGS nodes; University of Patras/AUTh | Primarily telecom teleports; X-band EESS reception would need a new 3.7–5 m antenna | TRL 9 (teleports) | — | GR | https://resilience.esa.int/?p=27235 |
| Ground station hardware: Safran Data Systems (Zodiac Aerospace) (FR) Cortex receivers, 3.7–7.3 m X-band systems | FR | Cortex HDR, Cortex CRT; full-motion antennas | X-band 1–2 Gbps receivers | TRL 9 | €0.5–2 M per 5 m X-band station (price unverified) | FR/EU | — |
| Orbit Communication Systems (IL), Intellian (KR), Kratos/Quintech (US), ND SatCom (DE), Celestia STS (NL/ES), Satlantis Ground, AAC Clyde (SE) | various | 3–7 m X/S-band tracking antennas; modems | 3.7 m X-band ~ 500 Mbps–1 Gbps; 5 m 1–2 Gbps | TRL 9 | 3.7 m system €300–800 k; 7.3 m €1.5–3 M (price unverified) | — | — |
| Kratos | US | quantumRadio, OpenSpace virtual ground; EW-related ground processing (SpectralNet) | Software-defined ground | TRL 9 | On request | US | — |

**Observations (K):** For a Greek operator, a hybrid is sensible: own S-band TT&C at a Greek site (e.g., co-located with the ESA/Greek Connectivity ground segment at Thermopylae or a university), and buy X-band passes from KSATlite/Leaf Space for polar coverage. At ~1 Gbps X-band, a 7-minute pass delivers ~50 GB; 4 passes/day ≈ 200 GB/day, which bounds the raw-capture downlink strategy. Expect ~€50–150 k/year in GSaaS fees for a single satellite with 4–8 X-band passes/day (price unverified, derived from market ranges).

---

## L. Launch (2026 market)

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| SpaceX | US | Transporter (SSO, ~3–4/yr) rideshare; ESPA ports via SpaceX or aggregators | SSO 500–600 km; ESPA 15" port up to ~200 kg (24" Grande for larger) | TRL 9 (Transporter-15 Nov 2025; T-16 in 2026) | $7,000/kg for 2026 flights (min 50 kg = $350 k); $7,500/kg for 2027; 150 kg → ~$1.05–1.13 M; book 12–18 months ahead | US; payload export/import (ITAR/EAR) paperwork for integration in US | https://newspaceeconomy.ca/2026/02/27/satellite-ridesharing-market-analysis-2026/ ; https://spacenexus.us/guide/cost-to-launch/hosted-payload |
| SpaceX | US | Bandwagon (mid-inclination ~45°, ~2–3/yr) | ~45° inclination, 500–600 km; Bandwagon-5 flew Oct 2026 | TRL 9 | Same per-kg schedule as Transporter (~$7,000/kg 2026) | US | https://tech-insider.org/spacex-bandwagon-5-launch-scrub-weather-delay-2026/ |
| Exolaunch | DE | Rideshare integration and deployment (CarboNIX separation system) on Transporter/Bandwagon/others | Mission management, port aggregation, ESPA integration in Berlin | TRL 9 (hundreds of sats) | SpaceX price + service margin (typ. 10–25%, price unverified); handles US import paperwork | DE/EU — eases ITAR exposure for EU integrators | https://newspaceeconomy.ca/2026/02/27/satellite-ridesharing-market-analysis-2026/ |
| Rocket Lab | US/NZ | Electron dedicated (200 kg SSO; 300 kg LEO) | Custom inclination/LTAN; 21 launches in 2025; 93 flights by Aug 2026 (89 successes) | TRL 9 | ~$7.5 M dedicated list (~$25–37 k/kg); Kick Stage for precise insertion | US ITAR (US launch licence) | https://spacenexus.us/rockets/electron |
| Isar Aerospace | DE | Spectrum (1,000 kg LEO / 700 kg SSO) from Andøya | First flight failed Mar 2025; second flight pending (multiple 2026 scrubs); no successful launch as of Oct 2026 | TRL 6 | Target €10,000/kg (design goal) | DE/EU | https://en.wikipedia.org/wiki/Spectrum_(rocket) |
| Rocket Factory Augsburg (RFA) | DE | RFA One (1,300 kg LEO) from SaxaVord | Static-fire anomaly 2024; first flight pending 2026 (verify) | TRL 6 | Target ~€3–5 M/launch (price unverified) | DE/UK | https://en.wikipedia.org/wiki/RFA_One |
| PLD Space | ES | Miura 5 (~540 kg LEO) from Kourou | First flight targeted 2026 (verify) | TRL 5–6 | On request | ES/EU | — |
| Arianespace / Avio | FR/IT | Vega-C rideshare (SSMS) | Vega-C returned to flight Dec 2024; SSMS rideshare slots to SSO | TRL 9 | Not published; historically above SpaceX per kg; ESA-supported European preference | EU | https://newspaceeconomy.ca/2026/02/27/satellite-ridesharing-market-analysis-2026/ |
| Firefly Aerospace | US | Alpha (1,000 kg LEO) | Mixed record (failure Apr 2025; return to flight 2026 verify) | TRL 8 | ~$15 M dedicated (price unverified) | US | — |
| ESPA port / adapter costs | — | ESPA 15" port ring share, separation system (Exolaunch CarboNIX, RUAG/Beyond Gravity PAS, Planetary Systems Lightband) | Separation system $50–150 k; port fees embedded in rideshare price | TRL 9 | — | — | — |
| Orbit choice | — | SSO 500–550 km (Transporter): global coverage, polar passes, consistent lighting, but revisit at mid-latitudes ~2×/day per sat; Mid-inclination 45–53° (Bandwagon): 2–3× more passes over the Eastern Mediterranean/Black Sea/Middle East, better for regional persistence; no polar ground-station advantage | For a Greece-centred regional mission, 45–55° inclination at ~500 km is preferred; SSO for the first demonstrator if schedule is tight | — | — | — | — |

**Observations (L):** Launch for a 150 kg satellite is ~$1.1–1.4 M on Transporter/Bandwagon via Exolaunch (incl. margin and separation system) in 2026–27, versus $7.5 M+ for a dedicated Electron. European launchers (Spectrum, RFA One, Miura 5) have not yet demonstrated orbital success as of October 2026; they are an option for the 2028+ constellation phase, not for the first unit. Book 15–18 months ahead; SpaceX rideshare prices have risen ~8–10%/yr since 2022.

---

## M. Test, AIT and environmental facilities (Europe, with Hellenic options)

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Hellenic Aerospace Industry (EAB/HAI) — HAITF | GR | Hellenic Assembly, Integration and Testing Facility, Schimatari | ISO 8 cleanroom ~400 m²; large and small TVAC chambers; 3-axis slip-table vibration; EVT; satellites up to 500 kg / 1.5 m³; ESA-implemented, RRF-funded; operational (ESA news 14 Jul 2026); EMC not mentioned | New (commissioned 2026) | Greek national facility; terms via EAB/Ministry of Digital Governance | GR | https://resilience.esa.int/?p=27235 |
| ESA ESTEC Test Centre | NL | LSS, HYDRA shaker, EMC, acoustic, mass properties | Full-service; commercial access via European Test Services (ETS) | TRL 9 | €150–400 k for a microsat campaign (price unverified); 6–9 months booking | NL/EU | — |
| IABG | DE | Ottobrunn test centre: TVAC, vibration, acoustic, EMC, antenna range (CATR) | Large-sat heritage; smallsat packages | TRL 9 | Comparable to ESTEC | DE | — |
| Intespace (Airbus) | FR | Toulouse: TVAC, vibration, EMC, antenna CATR | — | TRL 9 | — | FR | — |
| Beyond Gravity / RUAG (Zürich) | CH | Environmental test | — | TRL 9 | — | CH | — |
| SERMS (Terni), CSL (Liège), Mecano ID, Sener, Alter Technology (ES), Angelantoni Test Technologies (IT) | IT/BE/ES | Microsat-scale TVAC/vibration; component screening (Alter: EEE parts radiation testing) | Alter Technology for COTS radiation screening (TID/SEE) | TRL 9 | €50–200 k per campaign | EU | — |
| EMC / antenna ranges | — | IABG CATR; Intespace; University of Patras / AUTh antenna labs (GR); Aalborg/ UPM anechoic (DK/ES); NPL (UK); Microwave Vision Group (MVG, FR) near-field ranges; ESA Hertz chamber (ESTEC) | Needed for pattern/phase-centre calibration of the DF array (critical for AoA accuracy) | TRL 9 | €20–80 k per campaign | — | — |
| Radiation testing | — | UCLouvain HIF (BE), RADEF Jyväskylä (FI), GANIL (FR), ESA Co-60 (ESTEC), Demokritos tandem accelerator (GR) for lower-energy protons | For COTS RFSoC/ADC SEE characterisation | TRL 9 | €20–60 k per campaign | — | — |
| Clean-room / AIT subcontractors | GR | EAB/HAI (Schimatari), Prisma Electronics (Alexandroupolis), Planetek Hellas (Athens), Satways, Space Hellas (antennas/EMC), Libre Space Foundation | Greek industrial base for AIT, harness, software, ground segment | TRL 7–9 | — | GR | https://mindigital.gr/wp-content/uploads/2025/02/Request-for-Proposals.v1.3.pdf |

**Observations (M):** The HAITF at Schimatari changes the calculus for a Greek integrator: system-level TVAC and vibration can be done domestically for a 150 kg satellite. EMC/antenna-range work (DF array calibration) still requires IABG/Intespace/MVG-class ranges, and EEE radiation screening goes to Alter/UCL/RADEF.

---

## N. Software and tools

| Supplier | Country | Product | Key specs | Heritage/TRL | Price/lead time | Export notes | Source |
|---|---|---|---|---|---|---|---|
| Ansys | US | STK (Systems Tool Kit) incl. Communications, Coverage, EOIR; TDOA/FDOA geolocation via Analysis Workbench | Industry standard for coverage/revisit, access, link budgets | TRL 9 | $10–50 k/seat/yr (price unverified); academic licences | US EAR (software) | — |
| NASA | US | GMAT (General Mission Analysis Tool) | Open-source orbit design/propagation | TRL 9 | Free | Open source | — |
| a.i. solutions | US | FreeFlyer | Mission design/ops | TRL 9 | $10–30 k/seat | US | — |
| GNU Radio | — | Open-source SDR DSP framework; gr-satellites; gr-radar; cross-ambiguity-function blocks | Core of payload DSP prototyping and ground processing | TRL 9 | Free | Open source | — |
| DeepSig | US | OmniSIG (ML signal detection/classification), OmniPHY | AI spectrum sensing; used by HawkEye 360-type pipelines | TRL 8–9 | Licence on request | US EAR | — |
| Kratos | US | SpectralNet, quantumRadio, OpenSpace; EW/SIGINT ground processing heritage | Software-defined ground and RF monitoring | TRL 9 | On request | US | — |
| Libre Space Foundation | GR | SatNOGS network and DB, SIDLOC; open-source ground segment | Greek open-source leadership; useful for TT&C test and community ops | TRL 9 | Free | Open source | — |
| Kubos (Major Tom) | US | Major Tom mission control SaaS | Multi-mission ops | TRL 9 | SaaS $ k/month | US | — |
| Bright Ascension | UK | Mission Control Software + FSW | — | TRL 9 | Licence | UK | — |
| Spire / NSL (Nanosat Launch) / Open Cosmos "OpenApp" / Leaf Space ops | US/UK | Mission ops platforms | — | TRL 9 | — | — | — |
| Rohde & Schwarz | DE | R&S PR200/EM200/ESMD monitoring receivers and RAMON signal-analysis software; AMMOS SIGINT suite (government) | Reference-grade ground truth and signal-database tooling; EU-sourced | TRL 9 | €50–500 k | DE (AMMOS government-controlled) | — |
| Keysight / Rohde & Schwarz / Anritsu | US/DE/JP | Vector signal analysers/generators for payload test; Keysight PathWave | Lab | TRL 9 | €100–500 k lab set | — | — |
| EW database tools | — | Open: SIGIDWIKI, ITU BR IFIC/SRS databases, FCC ULS; Commercial: Jane's C4ISR & Radar databases (UK), Spectrum Monitoring databases (R&S), HawkEye 360 RFGeo/Mission Space; Government: NATO EWDB/NEDB (restricted) | Seed the emitter catalogue with ITU filings and Jane's; build own PDW/signature database (e.g., PostgreSQL/TimescaleDB + custom schema) | — | Jane's licences €20–100 k/yr (price unverified) | — | — |
| Geolocation/analysis libraries | — | Python: numpy/scipy/cupy CAF; Skyfield/poliastro/orekit (Java, open-source, CS Group FR) for precise orbit; MATLAB Phased Array Toolbox | Orekit is EU-origin, used by CNES | TRL 9 | Free / MATLAB licence | — | — |

---

## Procurement observations

**1. Lead times (2026 market).** Typical quoted lead times: bus 12–18 months (NanoAvionics, Aerospacelab, BST); deployable reflector antennas 12–18 months (OSS, Tendeg, MMA); star trackers 6–12 months; reaction wheels 9–15 months (US) / 6–9 months (EU); X-band transmitters 9–12 months; deployable solar arrays 6–12 months; Saft/ABSL batteries 9–12 months; space-grade ADCs/FPGAs (Teledyne EV12AQ600, Microchip PolarFire RT, AMD XQR) 20–52 weeks and allocation-dependent; electric propulsion 6–12 months; launch slot booking 15–18 months ahead. Realistic schedule from ATP to launch of a first satellite with an ESPA-class bus is 24–30 months; 18 months is achievable only with a configured bus (MP42H-class) and a payload built on COTS boards (Xiphos Q8RF, Alén/GomSpace SDRs).

**2. Long poles.** (i) The deployable reflector/DF array and its RF calibration (custom, 12–18 months, drives AoA performance); (ii) the RFSoC payload board and its radiation characterisation (board 6–9 months, SEE testing campaign 3–4 months, software 12+ months in parallel); (iii) space-grade timing (new Microchip space CSAC and mRO-50 variants have thin heritage; order early); (iv) launch slot and the US import/export paperwork if launching with SpaceX (Exolaunch mitigates); (v) frequency coordination and ITU filing for X-band EESS downlink and S-band TT&C through the Greek administration (EETT), 12–24 months; (vi) national security approvals for an EU-based SIGINT operator (encryption, data handling, EU DU licences for DF receivers under 5A001).

**3. ITAR-free in Europe.** A fully ITAR-free architecture is feasible: bus (NanoAvionics MP42H / Aerospacelab VSP / LuxSpace Triton-X / BST LEOS-100); antennas (Anywaves, OSS, EnduroSat, Anteral, custom EU arrays); RF front-end (Erzia, TTI Norte, Low Noise Factory, Filtronic, Exxelia; Qorvo/ADI die are EAR-only); digitiser (Teledyne e2v EV12AQ600 + Microchip PolarFire RT; or COTS AMD RFSoC which is EAR, not ITAR); timing (Safran mRO-50 / Rakon / AXTAL OCXO; Septentrio or Beyond Gravity GNSS); downlink (Syrlinks, EnduroSat, Tesat/Astrolight optical); ADCS (Arcsec, Sodern, Vectronic, Hyperion, Sensonor STIM300); EPS (Azur cells, DHV arrays, Saft battery); propulsion (ENPULSION, Exotrail, ThrustMe, Dawn, Bradford); OBC (Unibap, KP Labs, GomSpace, Frontgrade Gaisler); FSW (F´/cFS open source). The residual US content is limited to EAR-controlled semiconductors (AMD RFSoC/FPGA, Qorvo/ADI MMICs), for which licence exceptions commonly apply for EU/NATO end users but which require end-use statements and are sensitive to the "SIGINT" descriptor; frame the mission as "spectrum monitoring / RF situational awareness" in commercial documentation and manage the defence dimension through the appropriate national channel. Conversely, EU dual-use controls (Reg. 2021/821 Annex I, items 3A001 high-speed ADCs, 3A002.g atomic clocks, 5A001 DF/wideband receivers, 7A005 space GNSS, 9A004 spacecraft) apply to the EU-built items when exported outside the EU and in some cases require intra-EU notifications; a Greek integrator should engage the Greek export-control authority early.

**4. Rough BOM cost ranges, single 150 kg SIGINT satellite (2026 €, indicative, all prices unverified).**
- Bus (ESPA-class, incl. ADCS, EPS, OBC, TT&C, propulsion, structure, integration support): €3.5–7 M (European NewSpace) / $6–12 M (US). Buying a configured bus avoids ~€1–2 M of component-level procurement overhead.
- Payload: antennas and deployables €0.8–2.0 M; RF front-end (LNAs, filters, converters, 4–8 channels) €0.3–0.8 M; digitiser/processing (RFSoC boards, ADC, memory, rad testing) €0.4–1.0 M; timing/GNSS €0.05–0.2 M; payload downlink (X-band ≥1 Gbps TX + antenna) €0.15–0.4 M; optical terminal (optional) €0.4–1.5 M; payload integration, software, calibration €1–2.5 M. Payload total €2.7–7 M.
- AIT and environmental test: €0.4–1.0 M (lower if HAITF used).
- Launch: €1.0–1.4 M (Transporter/Bandwagon via Exolaunch, 150 kg, 2026–27) or €7–9 M dedicated Electron.
- Ground segment: own S-band TT&C station €0.3–0.6 M; X-band station (3.7–5 m) €0.5–1.5 M or GSaaS €50–150 k/yr; mission control and processing software €0.3–1.0 M; licensing/frequency €0.1–0.3 M.
- Programme management, systems engineering, insurance (launch+1 yr ~8–15% of insured value), reserves (20–30%): €2–4 M.
- **Total first satellite: roughly €11–22 M** including ground segment and first-year ops; recurring units in a constellation: €5–9 M each (bus €2.5–4 M, payload €1.5–3 M, launch €1–1.4 M) as NRE amortises and buses are bought in batches. A 4-satellite initial cluster (enabling multi-satellite TDOA/FDOA) is therefore in the €30–50 M envelope; this is consistent with publicly reported figures for Kleos (~€20 M for first clusters) and HawkEye 360 (~$100 M+ for its first 15+ satellites with ground segment).

**5. Alternatives for a Greek/EU-based integrator.**
- *Buy the bus, build the payload.* Baseline: NanoAvionics MP42H (Kongsberg — strong NATO-defence alignment, N3X heritage), Aerospacelab VSP, or LuxSpace Triton-X; payload on Xiphos Q8RF or a custom RFSoC board; antennas from Anywaves/OSS plus a custom DF array developed with Greek universities (Patras, NTUA, AUTh) and Greek RF SMEs; AIT at HAITF Schimatari.
- *Hosted-payload first.* Fly the receiver and a 2-antenna survey suite as a hosted payload on Loft Orbital (YAM) or on an Open Cosmos/EnduroSat shared mission to retire payload risk in 12–15 months for €2–4 M, before committing to a dedicated bus.
- *Buy a proven RF-geolocation payload class.* Kleos-class (ISISPACE/BST scouting clusters) and HawkEye 360 (SFL) show that 4× 6U–30 kg satellites in formation achieve multi-satellite TDOA/FDOA; a Greek programme could start with 3–4 nanosats (€8–15 M total) and scale to 150 kg satellites with larger apertures for weak-signal (X-band radar) collection in phase 2.
- *Leverage EU programmes.* ESA (GSTP, ARTES, Greek Connectivity Programme, EU RRF-funded Greek microsatellite programme), EDF (European Defence Fund — space-based SIGINT/ISR calls), and EU IRIS²-adjacent funding can offset NRE; the EU Space Programme's dual-use shift (2025–26) and Greek participation in the microsatellite constellation under the Ministry of Digital Governance make institutional co-funding plausible.
- *Partnering.* Possible primes/partners with relevant heritage: Kongsberg (NO), Aerospacelab (BE), OHB (DE/LU), SSTL (UK), Satlantis (ES), Reflex Aerospace (DE, defence focus); US alternatives (BCT, York, Apex) deliver faster and bigger but introduce ITAR into a SIGINT programme, which is a strategic disadvantage for European data sovereignty.

---

## Sources

- NASA, *State-of-the-Art of Small Spacecraft Technology*, Communications chapter 2025 (published May 2026): https://www.nasa.gov/wp-content/uploads/2026/05/9-soa-comm-2025-final.pdf
- NASA SoA 2026 full report: https://www.nasa.gov/wp-content/uploads/2026/05/soa-2026.pdf ; portal: https://www.nasa.gov/smallsat-institute/sst-soa
- NanoAvionics MP42H: https://nanoavionics.com/small-satellite-buses/microsatellite-bus-mp42h/
- NanoAvionics MP42 (SatNow): https://www.satnow.com/products/satellite-bus-platforms/nanoavionics/45-1145-mp42-15-mid
- ESA Triton-X: https://www.esa.int/Applications/Connectivity_and_Secure_Communications/Triton-X
- BST LEOS-50HR: https://www.satcatalog.com/component/leos-50hr/
- Aerospacelab: https://www.newspace.im/constellations/aerospacelab
- satsearch microsatellite platforms review: https://blog.satsearch.co/2023-02-16-microsatellite-platforms-and-buses-on-the-global-market
- Satellite bus comparison: https://spacenexus.us/compare/satellite-buses
- Blue Canyon X-SAT Saturn: https://www.satnow.com/products/satellite-bus-platforms/blue-canyon-technologies/45-1186-x-sat-saturn-class
- Apex platforms: https://www.apexspace.com/platforms
- Reflex Aerospace: https://www.defencejobseu.com/companies/reflex-aerospace
- Hosted payload / rideshare pricing: https://spacenexus.us/guide/cost-to-launch/hosted-payload
- Anywaves Compact Wideband Antennas: https://anywaves.com/products/compact-wideband-antennas/
- Anywaves QFH: https://anywaves.com/products/quadrifilar-helix-antennas/
- Qorvo CMD167: https://www.qorvo.com/products/p/CMD167
- Erzia NewSpace amplifiers: https://erzia.com/newspace ; https://www.satnow.com/products/microwave-rf-amplifiers/erzia-hq/100-1110-erz-lna-2100-2700-25-2-ns
- Teledyne e2v EV12AQ600: https://www.everythingrf.com/products/analog-to-digital-converters/e2v-inc/776-354-ev12aq600
- AMD space-grade Versal XQRVC1902 (Oct 2026): https://techaeris.com/2026/10/05/amd-launches-15-year-space-grade-versal/
- AMD XQR Versal product brief: https://www.amd.com/content/dam/amd/en/documents/products/adaptive-socs-and-fpgas/product-briefs/amd-xqr-versal-product-brief.pdf
- Xiphos Q8RF spec sheet: https://resources.epiqsolutions.com/hubfs/Xiphos/Xiphos%20Q8RF%20Processor%20spec%20sheet.pdf
- Xiphos Q8: https://satsearch.co/products/xiphos-q8-processor
- HawkEye 360 / Xiphos (Sep 2026): https://www.everythingrf.com/News/details/22615-hawkeye-360-enhances-space-based-rf-intelligence-with-xiphos-onboard-processing-cards
- Alén Space TOTEM: https://satsearch.co/products/alenspace-totem-software-defined-radio-sdr
- GomSpace NanoCom SDR: https://gomspace.com/product/software-defined-radio/
- Microchip Space CSAC SA.65 (Sep 2026): https://www.militaryaerospace.com/communications/product/55404857/microchip-introduces-radiation-tolerant-atomic-clock-for-leo-satellites
- Microchip CSAC background: https://www.gpsworld.com/microchip-offers-new-chip-scale-atomic-clock-for-defense/
- Septentrio space PNT: https://www.septentrio.com/en/applications/assured-pnt-space/space
- SkyFox piNAV-NG: https://www.satnow.com/products/gnss-receivers/skyfox-labs/143-1320-pinav-ng
- Syrlinks XONOS: https://satsearch.co/products/syrlinks-xonos-x-band-high-data-rate-transmitter ; EWC27: https://www.satnow.com/products/space-transmitters/syrlinks/142-1346-ewc27
- Mynaric CONDOR Mk3: https://www.satnow.com/products/laser-communication-terminals/mynaric/155-1475-condor-mk3
- Tesat products: https://www.tesat.de/products
- Blue Canyon ADCS 2026 datasheet: http://www.bluecanyontech.com/wp-content/uploads/ADCS-2026.pdf
- Arcsec Sagitta: https://www.satnow.com/products/star-trackers/arcsec/37-1184-sagitta-star-tracker
- MMA Design solar arrays: https://mmadesignllc.com/solar-arrays
- ENPULSION MICRO R³ datasheet (Mar 2026): https://www.enpulsion.com/wp-content/uploads/DataSheet_Micro_20260323.pdf ; NANO R³: https://www.enpulsion.com/products/nano-r3/
- Exotrail spaceware: https://www.exotrail.com/product/hall-thrusters-spaceware
- Dawn Aerospace thrusters: https://www.dawnaerospace.com/thrusters
- KSATlite: https://satsearch.co/products/kongsberg-satellite-services-ksat-lite
- AWS Ground Station pricing: https://aws.amazon.com/ground-station/pricing/
- GSaaS market guide (2026): https://newspacemarket.com/guides/ground-station-services/
- Leaf Space FAQ: https://leaf.space/faq/
- Rideshare market analysis 2026 (SpaceX $/kg history): https://newspaceeconomy.ca/2026/02/27/satellite-ridesharing-market-analysis-2026/
- SpaceX rideshare price increases: https://payloadspace.com/spacex-increases-rideshare-prices/
- Bandwagon-5 (Oct 2026): https://tech-insider.org/spacex-bandwagon-5-launch-scrub-weather-delay-2026/
- Electron price/cadence: https://spacenexus.us/rockets/electron
- Isar Spectrum status: https://en.wikipedia.org/wiki/Spectrum_(rocket)
- RFA One: https://en.wikipedia.org/wiki/RFA_One
- HAITF Greek AIT facility (ESA, Jul 2026): https://resilience.esa.int/?p=27235
- Greek microsatellite RFP (Ministry of Digital Governance, 2025): https://mindigital.gr/wp-content/uploads/2025/02/Request-for-Proposals.v1.3.pdf
- HawkEye 360 background: https://www.eoportal.org/satellite-missions/hawkeye
