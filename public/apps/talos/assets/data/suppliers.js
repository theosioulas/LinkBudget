// Supplier & component catalogue — extracted from research/02_suppliers_catalogue.md (Oct 2026). Prices indicative, see export/price notes.
window.SUPPLIERS=[
{
"id": "A",
"name": "Satellite buses / platforms (80–200 kg class)",
"items": [
{
"supplier": "Kongsberg NanoAvionics",
"country": "LT/NO",
"product": "MP42H (Light/Mid/Max)",
"specs": "Max s/c mass 100 kg; payload 35 kg; payload power ~94–100 W sun-tracking; Falcon 9 quarter-plate envelope; pointing 0.01° (1σ) knowledge on Max variant (4.3° on Light); downlink 650 Mbps (Mid/Max)",
"trl": "TRL 9. MP42 flew 2022; three MP42H N3X maritime-surveillance sats for Kongsberg Defence launched 2025",
"price": "Price and lead time via online configurator; community estimates €2–4 M per flight unit (price unverified). Typical 12–18 months",
"export": "EU/Norway; ITAR-free bus; Kongsberg ownership eases NATO/defence sales",
"itarRisk": false,
"urls": [
"https://nanoavionics.com/small-satellite-buses/microsatellite-bus-mp42h/"
]
},
{
"supplier": "Kongsberg NanoAvionics",
"country": "LT",
"product": "MP42 (≤75 kg class)",
"specs": "Smaller sibling; payload ≤25 kg, ~70–160 W array",
"trl": "TRL 9 (Tiger-3 2022, multiple customers)",
"price": "Configurator",
"export": "EU",
"itarRisk": false,
"urls": [
"https://www.satnow.com/products/satellite-bus-platforms/nanoavionics/45-1145-mp42-15-mid"
]
},
{
"supplier": "OHB LuxSpace",
"country": "LU",
"product": "Triton-X (ESA ARTES-supported)",
"specs": "Launch mass 40–250 kg; payload 15–90 kg; modular; ESPA-compatible",
"trl": "TRL 7–8; first flight planned mid-2020s under ESA ARTES; verify flight status",
"price": "On request",
"export": "EU, ITAR-free",
"itarRisk": false,
"urls": [
"https://www.esa.int/Applications/Connectivity_and_Secure_Communications/Triton-X"
]
},
{
"supplier": "Berlin Space Technologies",
"country": "DE",
"product": "LEOS-50 (MR/HR) and LEOS-100 (HP/HR)",
"specs": "LEOS-50: ~50–100 kg class; LEOS-100HP: up to 2 kW power, MoI limit 120 kg·m²; agile pointing",
"trl": "Heritage via Kent Ridge-1 (2015), Azista-BST, Kleos (ISISPACE/BST scouting sats)",
"price": "On request; BST has history of competitive pricing (price unverified)",
"export": "DE/EU, ITAR-free",
"itarRisk": false,
"urls": [
"https://www.satcatalog.com/component/leos-50hr/"
]
},
{
"supplier": "Aerospacelab",
"country": "BE",
"product": "Versatile Satellite Platform (VSP) 150 kg class",
"specs": "~150 kg; in-house XSDR/SSDR radios (X-band 206 Mbps) and components; ESPA class",
"trl": "TRL 9 (Arthur-1 2021, Risk/Arthur series, Gravity, Element satellites)",
"price": "On request; Aerospacelab builds in volume (Louvain-la-Neuve megafactory)",
"export": "BE/EU, ITAR-free",
"itarRisk": false,
"urls": [
"https://www.newspace.im/constellations/aerospacelab"
]
},
{
"supplier": "Surrey Satellite Technology (SSTL)",
"country": "UK",
"product": "SSTL-150 / SSTL-Micro",
"specs": "SSTL-150 bus dry 103 kg; payload ≤50 kg; 50 W orbit-average (100 W peak)",
"trl": "TRL 9, decades of heritage (RapidEye, DMC)",
"price": "Historically £5–10 M class (price unverified); 24 months",
"export": "UK export control; non-ITAR",
"itarRisk": false,
"urls": [
"https://spacenexus.us/compare/satellite-buses"
]
},
{
"supplier": "EnduroSat",
"country": "BG",
"product": "Microsat platform (ESPA-class, 100+ kg) and 16U",
"specs": "In-house X-band SDR TX ≤6 Gbps, S-band, EPS, ADCS; mission-as-a-service model",
"trl": "16U TRL 9; microsat platform first flights ~2025–26 (verify)",
"price": "On request; EnduroSat historically price-aggressive",
"export": "BG/EU, ITAR-free",
"itarRisk": false,
"urls": [
"https://www.nasa.gov/wp-content/uploads/2026/05/9-soa-comm-2025-final.pdf"
]
},
{
"supplier": "Open Cosmos",
"country": "UK/ES/PT",
"product": "OpenSat platforms (6U–150 kg) + mission-as-a-service",
"specs": "Mission-as-a-service incl. launch, ops; platforms up to ~150 kg (Platero, Menut, Alisio heritage are 6–16U; larger buses under development)",
"trl": "TRL 9 for nanosat class; larger class verify",
"price": "Full missions on request",
"export": "UK/EU",
"itarRisk": false,
"urls": [
"https://spacenexus.us/guide/cost-to-launch/hosted-payload"
]
},
{
"supplier": "Satlantis",
"country": "ES",
"product": "Platform + payload integrator (GEISAT, Garai)",
"specs": "~100 kg class satellites; in-house EO; integrates third-party buses",
"trl": "TRL 9 (GEISAT Precursor 2023)",
"price": "On request",
"export": "ES/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Argotec",
"country": "IT",
"product": "HAWK-6 / HAWK platforms",
"specs": "6U–~100 kg; deep-space heritage (LICIACube, ArgoMoon)",
"trl": "TRL 9",
"price": "On request",
"export": "IT/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Hemeria",
"country": "FR",
"product": "Hemeria nano/microsat platforms (ANGELS heritage)",
"specs": "12U–~50 kg; CNES heritage",
"trl": "TRL 9",
"price": "On request",
"export": "FR/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Reflex Aerospace",
"country": "DE",
"product": "Reflex bus (defence-oriented, ~100–300 kg)",
"specs": "Fast-turn modular bus for defence/ISR; SIGINT/EO oriented",
"trl": "TRL 6–8; first flights 2025–26 (verify)",
"price": "On request",
"export": "DE/EU",
"itarRisk": false,
"urls": [
"https://www.defencejobseu.com/companies/reflex-aerospace"
]
},
{
"supplier": "Dragonfly Aerospace",
"country": "ZA",
"product": "μDragonfly / Dragonfly platform (up to ~200 kg)",
"specs": "In-house HDRTX X-band 1.5–3 Gbps, CTRS S-band; EO heritage",
"trl": "TRL 9 (EOS SAT-1 2023)",
"price": "On request",
"export": "ZA (non-ITAR, EU-friendly)",
"itarRisk": false,
"urls": []
},
{
"supplier": "Alén Space",
"country": "ES",
"product": "Nano/micro platforms with TOTEM/TREVO SDR integration",
"specs": "Focus 3U–16U; partners for larger",
"trl": "TRL 9 (Lume-1, numerous)",
"price": "On request",
"export": "ES/EU",
"itarRisk": false,
"urls": [
"https://satsearch.co/products/alenspace-totem-software-defined-radio-sdr"
]
},
{
"supplier": "AAC Clyde Space",
"country": "SE/UK",
"product": "EPIC series (6U–~50 kg); Sirius avionics",
"specs": "Smaller than target class but strong avionics/EPS components",
"trl": "TRL 9",
"price": "On request",
"export": "SE/UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "Blue Canyon Technologies (RTX)",
"country": "US",
"product": "X-SAT Saturn-class (ESPA), X-SAT Venus-class",
"specs": "Saturn: ~200 kg class, ≥70 kg payload, high agility; Venus: ~100 kg",
"trl": "TRL 9 (numerous DoD/NASA)",
"price": "Reported $5–10 M class (price unverified); 12–18 months",
"export": "US; likely ITAR for defence payload integration",
"itarRisk": true,
"urls": [
"https://www.satnow.com/products/satellite-bus-platforms/blue-canyon-technologies/45-1186-x-sat-saturn-class"
]
},
{
"supplier": "York Space Systems",
"country": "US",
"product": "S-CLASS / LX-CLASS",
"specs": "S-CLASS: payload 85 kg+, 500 W peak (ext. to 1 kW); mass-produced for SDA Tranche",
"trl": "TRL 9 (SDA T0/T1)",
"price": "~$10 M+ per unit incl. integration at SDA volumes (price unverified)",
"export": "US; ITAR likely",
"itarRisk": true,
"urls": [
"https://spacenexus.us/compare/satellite-buses"
]
},
{
"supplier": "Apex Space",
"country": "US",
"product": "Aries (100 kg payload), Nova (300 kg), GEO Aries",
"specs": "Aries: ~100 kg payload, ~1 kW; delivered in <12 months",
"trl": "TRL 9 (Aries SN1 2024; multiple 2025)",
"price": "Public starting price ~ $8 M (price unverified)",
"export": "US; EAR/ITAR depending on config",
"itarRisk": true,
"urls": [
"https://www.apexspace.com/platforms"
]
},
{
"supplier": "Terran Orbital (Lockheed Martin)",
"country": "US",
"product": "Nebula / Renegade buses",
"specs": "ESPA to ESPA-Grande class",
"trl": "TRL 9 (SDA Tranche 0 Transport)",
"price": "On request",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Rocket Lab",
"country": "US/NZ",
"product": "Photon / Pioneer",
"specs": "Photon: up to 180 kg instrument; dedicated launch synergy",
"trl": "TRL 9 (CAPSTONE, Varda)",
"price": "On request",
"export": "US ITAR",
"itarRisk": true,
"urls": [
"https://spacenexus.us/compare/satellite-buses"
]
},
{
"supplier": "Muon Space",
"country": "US",
"product": "Halo bus (~200–500 kg)",
"specs": "High-power, in-house; climate/defence",
"trl": "TRL 9 (MuSat 2023–25)",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "K2 Space",
"country": "US",
"product": "Mega-class (large); Gravitas",
"specs": "Above target class; listed for completeness",
"trl": "TRL 7–8",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Astro Digital",
"country": "US",
"product": "Corvus-Micro / Corvus-XL",
"specs": "16U–ESPA; hosted-payload model",
"trl": "TRL 9",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Loft Orbital",
"country": "US/FR",
"product": "YAM hosted-payload service (Longbow bus by Airbus)",
"specs": "Hosted-payload slot + ops; avoids owning a bus",
"trl": "TRL 9 (YAM-2/3/5/6)",
"price": "Negotiated per mission; no rate card",
"export": "US/FR",
"itarRisk": false,
"urls": [
"https://spacenexus.us/guide/cost-to-launch/hosted-payload"
]
},
{
"supplier": "Spacemanic",
"country": "SK/CZ",
"product": "Nano platforms (≤16U)",
"specs": "Not in target class; components (GNSS, OBC) relevant",
"trl": "TRL 9",
"price": "—",
"export": "EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "ISISPACE",
"country": "NL",
"product": "16U and small micro platforms; Kleos scouting-mission heritage",
"specs": "Built Kleos Scouting Mission (4× 6U) RF-geolocation cluster",
"trl": "TRL 9",
"price": "On request",
"export": "NL/EU",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "B",
"name": "Wideband and multiband receive antennas (UHF/L/S/C/X)",
"items": [
{
"supplier": "Anywaves",
"country": "FR",
"product": "Compact Wideband Antennas (UHF–S)",
"specs": "300 MHz–4 GHz defined per project; up to 100% fractional bandwidth; <3 dBi boresight, hemispherical; single CP (RHCP/LHCP); S-band version <1U footprint; marketed for spectrum monitoring, SSA, \"intelligence applications\"",
"trl": "TRL 9; flew on Pandore nanosat (Mar 2025)",
"price": "On request; typ. €20–60 k per FM antenna class (price unverified); 4–8 months",
"export": "ITAR-free (stated)",
"itarRisk": false,
"urls": [
"https://anywaves.com/products/compact-wideband-antennas/"
]
},
{
"supplier": "Anywaves",
"country": "FR",
"product": "Quadrifilar Helix (UHF/VHF/L) and S/X patches",
"specs": "QFH: hemispherical CP; S-band TT&C patch 6.5 dBi 132 g; X-band payload TM patch 11.5 dBi 65 g",
"trl": "TRL 9 (100+ units flown)",
"price": "On request",
"export": "ITAR-free",
"itarRisk": false,
"urls": [
"https://anywaves.com/products/quadrifilar-helix-antennas/"
]
},
{
"supplier": "Oxford Space Systems",
"country": "UK",
"product": "Deployable helical antennas (UHF/VHF/S), Wrapped-Rib reflectors (0.5–3 m)",
"specs": "Helical: >4–4.5 dBi, <1.2 kg, high RF power; Wrapped-Rib 1 m-class deployable reflector usable for L/S/C/X receive at 20–35 dBi",
"trl": "Helical TRL 9; Wrapped-Rib flown 2024–25 (verify)",
"price": "On request; deployable reflectors £0.5–1.5 M (price unverified)",
"export": "UK export control; non-ITAR",
"itarRisk": false,
"urls": [
"https://www.nasa.gov/wp-content/uploads/2026/05/9-soa-comm-2025-final.pdf"
]
},
{
"supplier": "Helical Communication Technologies",
"country": "US",
"product": "Helios deployable helical",
"specs": "3 dBi, 180 g; UHF/VHF",
"trl": "TRL 9",
"price": "On request",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Tendeg",
"country": "US",
"product": "KaTENna / deployable mesh reflectors 0.5–1.5 m; deployable arrays",
"specs": "Ka to L-band; stowed <2U-class for 1 m",
"trl": "TRL 9 (multiple CubeSat missions)",
"price": "On request",
"export": "US (likely ITAR for DoD derivatives)",
"itarRisk": true,
"urls": []
},
{
"supplier": "MMA Design",
"country": "US",
"product": "T-DaHGR, NeuSAR deployable reflectarrays (X-band 29–45 dBi); HaWK arrays",
"specs": "T-DaHGR 1.3–11 kg, 29–42.5 dBi; NeuSAR >45.5 dBi 16.5 kg",
"trl": "NeuSAR flown; T-DaHGR not yet",
"price": "On request",
"export": "US EAR/ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "EnduroSat",
"country": "BG",
"product": "X-band patch arrays (1×1 to 8×12), S-band wideband patch, UHF",
"specs": "X-band 4×4: 16 dBi 53 g; 8×12: 26 dBi 490 g; S-band wideband patch 5 dBi 115 g",
"trl": "TRL 9 (most), 8×12 TRL 7",
"price": "Published catalogue prices historically €1–10 k per patch (price unverified)",
"export": "EU, ITAR-free",
"itarRisk": false,
"urls": []
},
{
"supplier": "Anteral",
"country": "ES",
"product": "X-band patches/arrays (12–22 dBi), waveguide horns X/K/Ka, Cassegrain 40 dBi",
"specs": "8×8 X-band array 22 dBi 500 g; horns 15–30 dBi",
"trl": "Partial heritage",
"price": "On request",
"export": "ES/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "IQ spacecom",
"country": "DE",
"product": "S/X-band patches, high-gain patch 11.5 dBi",
"specs": "Light (10–180 g)",
"trl": "TRL 9",
"price": "Catalogue pricing",
"export": "DE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "ISISPACE",
"country": "NL",
"product": "UHF/VHF deployable dipoles, S-band patch",
"specs": "For TT&C class, not wideband",
"trl": "TRL 9",
"price": "Catalogue",
"export": "NL/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Alén Space",
"country": "ES",
"product": "UHF/VHF deployable, S-band; custom arrays with TOTEM",
"specs": "TT&C class",
"trl": "TRL 9",
"price": "Catalogue",
"export": "ES/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Space Inventor",
"country": "DK",
"product": "S/X patches integrated with STTC-P3 SDR",
"specs": "Downlink-oriented",
"trl": "TRL 9",
"price": "On request",
"export": "DK/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Haigh-Farr",
"country": "US",
"product": "Wraparound/conformal antennas, S-band patches, waveguide 25 dBi",
"specs": "Conformal launch-vehicle heritage; useful for conformal UHF/L designs",
"trl": "TRL 9",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Cobham Advanced Electronic Solutions / Honeywell",
"country": "US/UK",
"product": "Space antennas (helices, horns)",
"specs": "Mostly larger-sat class",
"trl": "TRL 9",
"price": "On request",
"export": "US ITAR / UK",
"itarRisk": true,
"urls": []
},
{
"supplier": "Beyond Gravity (ex-RUAG Space)",
"country": "CH/SE/AT",
"product": "Antennas, TT&C, GNSS antennas, PODRIX",
"specs": "Institutional class; S/X horns",
"trl": "TRL 9",
"price": "On request; expensive",
"export": "CH/SE",
"itarRisk": false,
"urls": []
},
{
"supplier": "Airbus Defence & Space / Thales Alenia Space",
"country": "FR/DE/IT",
"product": "Custom SIGINT arrays (CERES-class)",
"specs": "Not COTS; CERES (2021) uses multi-sat formation for TDOA/FDOA",
"trl": "TRL 9 (institutional)",
"price": "Programme-level",
"export": "FR (strict)",
"itarRisk": false,
"urls": []
},
{
"supplier": "Eravant (ex-SAGE Millimeter)",
"country": "US",
"product": "Horns, OMTs, waveguide components to 110 GHz",
"specs": "COTS lab-grade; not space-qualified by default",
"trl": "TRL 5–6 for space",
"price": "Catalogue $0.5–5 k",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Printech Circuit Laboratories",
"country": "UK",
"product": "Flexible/printed antennas and RF circuits",
"specs": "Conformal printed arrays",
"trl": "TRL 7–9",
"price": "On request",
"export": "UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "Kall Morris Inc",
"country": "US",
"product": "Deployable structures/antennas (REACCH)",
"specs": "Deployable booms",
"trl": "TRL 6–8",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Custom Vivaldi/LPDA/spiral arrays (universities, SMEs: e.g., TTI Norte ES, Antenna Development Corp US, Heliox/Greek SMEs)",
"country": "various",
"product": "Tapered-slot (Vivaldi) and log-periodic arrays 0.3–12 GHz for wideband DF",
"specs": "Vivaldi elements give 1:10+ bandwidth with 5–8 dBi; arrays of 4–16 elements for interferometric DF",
"trl": "TRL 4–6 space; mature on aircraft/ground",
"price": "Dev contract €0.3–1.5 M (price unverified)",
"export": "EU DU 5A001 possible for DF",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "C",
"name": "RF front-end: LNAs, filters, limiters, switches, downconverters",
"items": [
{
"supplier": "Qorvo",
"country": "US",
"product": "CMD167 and CMD-series GaAs LNAs (e.g., CMD167 0.5–3 GHz/8 GHz class), QPL9xxx; \"Space\" screening flows",
"specs": "CMD-series die/SMT LNAs NF 0.6–1.5 dB, 10–25 dB gain; space screening per MIL-PRF-38534 on request",
"trl": "TRL 9 (many space uses)",
"price": "$20–200 per unit commercial; space-screened 10–50×",
"export": "US EAR (3A001/9A515); not ITAR",
"itarRisk": false,
"urls": [
"https://www.qorvo.com/products/p/CMD167"
]
},
{
"supplier": "Analog Devices",
"country": "US",
"product": "Space-qualified RF: ADL8xxx LNAs, HMC series, ADRF6xxx/ADMV downconverters, ADF4xxx PLLs (S-grade / SMD 5962)",
"specs": "e.g., ADRF5020 switch, HMC1049 LNA NF 1.1 dB 0.25–6 GHz; space-grade (QMLV) subsets",
"trl": "TRL 9",
"price": "Space grade $0.5–5 k per part; 20–40 weeks",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Mini-Circuits",
"country": "US",
"product": "Space-Qualified (SQ) catalogue: LNAs, filters, mixers, switches",
"specs": "NASA-qualification heritage on Cubesats; \"space-qualified\" catalogue, limited screening",
"trl": "TRL 7–9",
"price": "$50–1,000; 4–12 weeks",
"export": "US EAR99/3A001",
"itarRisk": false,
"urls": []
},
{
"supplier": "Low Noise Factory",
"country": "SE",
"product": "Cryogenic and room-temp LNAs (LNF-LNR series 0.3–18 GHz)",
"specs": "Room-temp NF 0.3–1 dB at L/S/C; packaged modules 20–50 g",
"trl": "TRL 6–7 for space (radio-astronomy heritage; some space uses)",
"price": "€2–8 k per module; 8–16 weeks",
"export": "SE/EU, EU DU 3A001 possible",
"itarRisk": false,
"urls": []
},
{
"supplier": "Erzia Technologies",
"country": "ES",
"product": "ERZ-LNA space LNAs (e.g., ERZ-LNA-2100-2700-25-2-NS K-band, S/C/X variants); NewSpace COTS line; SSPAs",
"specs": "Hermetic modules 20–100 g; NF 1–2.5 dB; ECSS-screened options; NewSpace COTS line lower-cost",
"trl": "TRL 9 (institutional); NewSpace line TRL 8",
"price": "€3–15 k per hi-rel LNA; NewSpace line €1–5 k (price unverified); 12–20 weeks",
"export": "ES/EU, ITAR-free",
"itarRisk": false,
"urls": [
"https://erzia.com/newspace"
]
},
{
"supplier": "TTI Norte",
"country": "ES",
"product": "Space LNAs, filters, converters (ESA heritage: Galileo, Sentinel)",
"specs": "L/S/C/X/Ku LNAs; frequency converters",
"trl": "TRL 9",
"price": "On request; 6–12 months hi-rel",
"export": "ES/EU ITAR-free",
"itarRisk": false,
"urls": []
},
{
"supplier": "Teledyne e2v / Teledyne Defense Electronics",
"country": "UK/FR/US",
"product": "Microwave modules, limiters, switches; also ADCs (see D)",
"specs": "Hi-rel",
"trl": "TRL 9",
"price": "On request",
"export": "UK/FR + US entities (check)",
"itarRisk": false,
"urls": []
},
{
"supplier": "Frontgrade (ex-CAES/Cobham AES)",
"country": "US",
"product": "Rad-hard RF: LNAs, switches, PLLs, GaN",
"specs": "Rad-hard to 100 krad+",
"trl": "TRL 9",
"price": "High (hi-rel)",
"export": "US ITAR/EAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Microchip",
"country": "US",
"product": "Space RF (ex-Microsemi): PLLs, PIN diodes, limiters, GaN",
"specs": "QMLV parts",
"trl": "TRL 9",
"price": "—",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "MACOM",
"country": "US",
"product": "GaAs/GaN LNAs, switches, limiters (e.g., MAAL-011xxx)",
"specs": "Commercial, screening via distributors",
"trl": "TRL 7–9",
"price": "$5–100",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Cobham Advanced Electronic Solutions (now Frontgrade)",
"country": "US",
"product": "see Frontgrade",
"specs": "—",
"trl": "—",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Filtronic",
"country": "UK",
"product": "Space-grade filters, diplexers, LNAs (E-band to X)",
"specs": "Hi-rel, used on NASA/ESA",
"trl": "TRL 9",
"price": "On request",
"export": "UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "K&L Microwave / Knowles (DLI)",
"country": "US",
"product": "Space cavity/ceramic filters, diplexers",
"specs": "Hi-rel",
"trl": "TRL 9",
"price": "$1–10 k; 20–30 weeks",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Exxelia / Temex / Rakon (FR)",
"country": "FR/NZ",
"product": "Filters, SAW, frequency references",
"specs": "Space heritage",
"trl": "TRL 9",
"price": "On request",
"export": "FR/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "CAES/Frontgrade Gaisler",
"country": "SE",
"product": "(processors, see J)",
"specs": "—",
"trl": "—",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "D",
"name": "Digitisers, SDRs and on-board processing",
"items": [
{
"supplier": "AMD (Xilinx)",
"country": "US",
"product": "Zynq UltraScale+ RFSoC (ZU2xDR–ZU4xDR Gen1–3; DFE)",
"specs": "Up to 8× 12/14-bit ADC @ 4–5 GSPS (Gen3 up to 6 GHz RF input), 8× DAC; ARM A53 + FPGA; commercial/industrial grade (used in space as COTS)",
"trl": "TRL 9 as COTS (HawkEye 360 via Xiphos Q8RF; many others)",
"price": "Devices $2–10 k; boards $10–40 k",
"export": "US EAR (3A001/4A994); high-rate ADC thresholds matter for EU DU 3A001.a.5",
"itarRisk": false,
"urls": [
"https://resources.epiqsolutions.com/hubfs/Xiphos/Xiphos%20Q8RF%20Processor%20spec%20sheet.pdf"
]
},
{
"supplier": "AMD",
"country": "US",
"product": "Versal RF (VR1602/VR1652 etc.)",
"specs": "Up to 32 GSPS 14-bit ADCs, 7 GHz+ direct RF, hardened DSP; commercial sampling 2025–26",
"trl": "TRL 5–6 for space",
"price": "$$$; no space grade yet",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "AMD",
"country": "US",
"product": "XQR Versal AI Core XQRVC1902 / AI Edge XQRVE2302 (space-grade)",
"specs": "Class B qualified (2024); Class Y lidless package sampling Oct 2026, flight units 2H 2027; 15-year missions",
"trl": "TRL 8–9 (Class B parts flying)",
"price": "$50–150 k per device class (price unverified); long lead",
"export": "US EAR 9A515",
"itarRisk": false,
"urls": [
"https://techaeris.com/2026/10/05/amd-launches-15-year-space-grade-versal/"
]
},
{
"supplier": "Microchip",
"country": "US",
"product": "PolarFire RT (RTPF500T) rad-tolerant FPGA; PolarFire SoC",
"specs": "100 krad TID, SEL-immune; low power; no on-chip RF ADC",
"trl": "TRL 8–9",
"price": "$10–40 k class",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Teledyne e2v",
"country": "FR/UK",
"product": "EV12AQ600 quad 12-bit ADC",
"specs": "1×6.0 GSPS / 2×3.0 / 4×1.5 GSPS; input bandwidth 4.5–6 GHz (datasheet-dependent); 2.2–6.8 W; 150 krad; QML-Y",
"trl": "TRL 9 (space-qualified)",
"price": "€5–15 k per device (price unverified); 20–40 weeks",
"export": "FR/UK; EU DU 3A001.a.5 (export licence likely needed even intra-EU for non-EU end use)",
"itarRisk": false,
"urls": [
"https://www.everythingrf.com/products/analog-to-digital-converters/e2v-inc/776-354-ev12aq600"
]
},
{
"supplier": "Teledyne e2v",
"country": "FR/UK",
"product": "EV12AD550 (dual 12-bit 1.5 GSPS), EV10AQ190 (quad 10-bit 1.25 GSPS)",
"specs": "Space-grade",
"trl": "TRL 9",
"price": "—",
"export": "EU DU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Frontgrade (CAES)",
"country": "US",
"product": "Rad-hard ADCs/DACs, GR740/GR765 processors",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR/EAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Xiphos (Epiq Solutions)",
"country": "CA/US",
"product": "Q8 / Q8J / Q8RF",
"specs": "Q8RF: Zynq RFSoC ZU28DR, 8 RX + 8 TX, ADC 12-bit 4.096 GSPS, RF input to 4 GHz, 20–30 W, 200 g, 100×100×20 mm, -40/+60 °C; TMR control FPGA, EDAC, scrubbing",
"trl": "Q8/Q8J flying on 24 HawkEye 360 satellites (Clusters 8–9 on Q8/Q8J); Q8RF announced, heritage to verify",
"price": "$50–150 k per FM (price unverified); 6–9 months",
"export": "CA (Xiphos) / US (Epiq) — EAR; Canadian ECL",
"itarRisk": false,
"urls": [
"https://www.everythingrf.com/News/details/22615-hawkeye-360-enhances-space-based-rf-intelligence-with-xiphos-onboard-processing-cards"
]
},
{
"supplier": "Epiq Solutions",
"country": "US",
"product": "Sidekiq X4/X2/NV100 SDR cards; Matchstiq",
"specs": "X4: 4 RX/4 TX, 1 MHz–6 GHz, up to 200 MHz IBW/ch, Zynq UltraScale+; used in airborne SIGINT; space variants via Xiphos",
"trl": "TRL 7–8 space",
"price": "$10–30 k",
"export": "US EAR (SDRs can be 5A001)",
"itarRisk": false,
"urls": []
},
{
"supplier": "Alén Space",
"country": "ES",
"product": "TOTEM / TREVO SDR",
"specs": "TOTEM: Zynq-7000 + AD9364, 70 MHz–6 GHz, 56 MHz IBW, 130 g; TREVO: higher power, <714 g",
"trl": "TRL 9 (Lume-1 and others; Kleos used similar class)",
"price": "TOTEM ~€15–40 k (price unverified)",
"export": "ES/EU",
"itarRisk": false,
"urls": [
"https://satsearch.co/products/alenspace-totem-software-defined-radio-sdr"
]
},
{
"supplier": "GomSpace",
"country": "DK",
"product": "NanoCom SDR MK2 / MK3",
"specs": "Zynq + AD936x transceivers; VHF–X; 271 g; MK3 with more FPGA",
"trl": "TRL 9",
"price": "€20–50 k (price unverified)",
"export": "DK/EU",
"itarRisk": false,
"urls": [
"https://gomspace.com/product/software-defined-radio/"
]
},
{
"supplier": "EnduroSat",
"country": "BG",
"product": "Versatile Wideband SDR (VW-SDR)",
"specs": "VHF–C-band, up to ~982 Mbps processing, <1.5 kg",
"trl": "TRL 9",
"price": "On request",
"export": "BG/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Space Micro (Voyager)",
"country": "US",
"product": "MicroSDR-C, Proton400k processors",
"specs": "VHF–C; 750 g",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Rincon Research",
"country": "US",
"product": "AstroSDR",
"specs": "VHF–C, 95 g; SIGINT lineage",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR likely",
"itarRisk": true,
"urls": []
},
{
"supplier": "CesiumAstro",
"country": "US",
"product": "SDR-2104 (L/S/C/X), Nightingale RFPU",
"specs": "Phased-array oriented; 0.9–3.5 kg",
"trl": "TRL 7–8",
"price": "—",
"export": "US ITAR/EAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Trident Systems",
"country": "US",
"product": "RDRT (RFSoC, 8 ch L/S), ADCM (MPSoC, 6.4 GSPS RX)",
"specs": "571–690 g",
"trl": "TRL 6–7",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Innoflight",
"country": "US",
"product": "SCR-104/106/108 SDRs; CFC-400/500 processors",
"specs": "Encrypted radios; CFC-500 Zynq US+ based",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Per Vices",
"country": "CA",
"product": "Cyan/Crimson SDRs (to 18 GHz, 3 GHz IBW)",
"specs": "Lab/ground SDRs; good for ground processing and testbeds",
"trl": "TRL 4 space",
"price": "$20–100 k",
"export": "CA",
"itarRisk": false,
"urls": []
},
{
"supplier": "Ettus/NI",
"country": "US",
"product": "B205mini (flown), X410 (ground)",
"specs": "B205mini 24 g flown as COTS",
"trl": "TRL 7",
"price": "$1–3 k",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Unibap",
"country": "SE",
"product": "iX10-100 / iX5 SpaceCloud",
"specs": "AMD x86 + FPGA + GPU-class AI; 10–20 W; ESA/NASA heritage",
"trl": "TRL 9",
"price": "€50–150 k (price unverified)",
"export": "SE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Ubotica",
"country": "IE",
"product": "CogniSAT-XE2 (Intel Myriad X)",
"specs": "AI inference 1–3 W; Φ-sat heritage",
"trl": "TRL 9",
"price": "€20–50 k",
"export": "IE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "KP Labs",
"country": "PL",
"product": "Leopard / Antelope DPU/OBC",
"specs": "Zynq US+ with AI; Intuition-1 heritage",
"trl": "TRL 9",
"price": "On request",
"export": "PL/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "AITech / Aitech Systems",
"country": "US/IL",
"product": "S-A1760 Venus (NVIDIA Jetson TX2i rad-tolerant), SP0-S",
"specs": "Jetson-based rad-tolerant AI SBCs",
"trl": "TRL 8–9",
"price": "$30–80 k",
"export": "US/IL EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Spiral Blue",
"country": "AU",
"product": "Space Edge Computers (Jetson)",
"specs": "COTS AI compute",
"trl": "TRL 8",
"price": "—",
"export": "AU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Exo-Space, Kepler Communications",
"country": "US/CA",
"product": "FeatherEdge AI; Kepler payload compute",
"specs": "Edge AI",
"trl": "TRL 7–8",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "RHEA / Xiphos / Moog",
"country": "—",
"product": "Moog Broad Reach OBCs",
"specs": "Hi-rel",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
}
]
},
{
"id": "E",
"name": "Timing and frequency references, GNSS receivers",
"items": [
{
"supplier": "Microchip",
"country": "US",
"product": "Space CSAC SA.65 (P/N 090-02789-007), announced 15 Sep 2026",
"specs": "Chip-scale Cs atomic clock; ≥30 krad TID; -40/+80 °C; <120 mW; <17 cm³; Allan deviation class ~1e-10 @1 s, ~1e-12 @ 1 day (SA.65 commercial values; verify space variant)",
"trl": "Space variant new (TRL 7–8); SA.45s widely flown on CubeSats",
"price": "Commercial SA.65 ~$3–6 k; space CSAC likely $15–40 k (price unverified)",
"export": "US EAR (atomic clocks 7A/3A controls possible)",
"itarRisk": false,
"urls": [
"https://www.militaryaerospace.com/communications/product/55404857/microchip-introduces-radiation-tolerant-atomic-clock-for-leo-satellites"
]
},
{
"supplier": "Microchip",
"country": "US",
"product": "SA.45s CSAC (legacy), also 5071 Cs standard (ground)",
"specs": "SA.45s: 35 g, 120 mW, 1e-10 @1 s short-term, 3e-10/month drift",
"trl": "TRL 9 (many CubeSats)",
"price": "$3–5 k",
"export": "US EAR",
"itarRisk": false,
"urls": [
"https://www.gpsworld.com/microchip-offers-new-chip-scale-atomic-clock-for-defense/"
]
},
{
"supplier": "Safran Timing (ex-Orolia / Spectratime)",
"country": "FR/CH",
"product": "mRO-50 Ruggedized miniature Rb oscillator; RAFS (large)",
"specs": "mRO-50: 51 cc, 0.45 W, ADEV 3e-11 @1 s (typ.), 4e-13 @ 1 day class; ruggedised not space-qualified by default; Spectratime RAFS/mini-RAFS space grade (Galileo)",
"trl": "mRO-50 TRL 6–7 space; RAFS TRL 9",
"price": "mRO-50 ~€8–15 k; space RAFS €200 k+ (price unverified)",
"export": "FR/CH; EU DU 3A002.g for atomic clocks",
"itarRisk": false,
"urls": []
},
{
"supplier": "AccuBeat",
"country": "IL",
"product": "AR133/AR140 space Rb clocks; USO",
"specs": "Rb AFS for small sats; 1e-12/day class",
"trl": "TRL 9 (several LEO)",
"price": "On request",
"export": "IL",
"itarRisk": false,
"urls": []
},
{
"supplier": "Rakon",
"country": "NZ/FR",
"product": "Space OCXOs (e.g., RK409, LNO series)",
"specs": "ADEV 1e-12 @1 s class; phase-noise optimised",
"trl": "TRL 9",
"price": "€2–15 k",
"export": "NZ/FR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Q-Tech / Vectron (Microchip) / Bliley",
"country": "US",
"product": "Space OCXOs (QT2020, Poseidon)",
"specs": "1e-12 class short-term",
"trl": "TRL 9",
"price": "$3–20 k",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "AXTAL",
"country": "DE",
"product": "Space-qualified OCXOs/USOs",
"specs": "ESA heritage",
"trl": "TRL 9",
"price": "On request",
"export": "DE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Septentrio",
"country": "BE",
"product": "mosaic-X5 / mosaic-T / mosaic-G5 T (timing module 2025); PolaRx (ground); space-adapted via partners (e.g., LEO-PNT, Celeste)",
"specs": "mosaic-T: multi-constellation, PPS ~5 ns 1σ (ground); COCOM limits removed on request for space; raw data output for post-processing",
"trl": "mosaic in LEO via several missions (verify per customer)",
"price": "€0.8–3 k per module; space screening extra",
"export": "BE/EU; EU DU 7A005 may apply to space GNSS",
"itarRisk": false,
"urls": [
"https://www.septentrio.com/en/applications/assured-pnt-space/space"
]
},
{
"supplier": "Hyperion Technologies (AAC Clyde)",
"country": "NL",
"product": "GNSS200/GNSS400 space receivers",
"specs": "Multi-GNSS, ~10 m / 0.1 m/s, PPS output; 20–40 g",
"trl": "TRL 9",
"price": "€10–25 k (price unverified)",
"export": "NL/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "SkyFox Labs",
"country": "CZ",
"product": "piNAV-NG / piNAV-L1",
"specs": "GPS L1 C/A; 10 m; 24 g; 125 mW; ≤9 km/s",
"trl": "TRL 9 (many CubeSats)",
"price": "~€5–10 k (price unverified)",
"export": "CZ/EU",
"itarRisk": false,
"urls": [
"https://www.satnow.com/products/gnss-receivers/skyfox-labs/143-1320-pinav-ng"
]
},
{
"supplier": "Syrlinks (Safran)",
"country": "FR",
"product": "GNSS receivers for space (N-GNSS / SPACE GNSS)",
"specs": "Multi-constellation, rad-tolerant",
"trl": "TRL 9",
"price": "On request",
"export": "FR/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "GomSpace",
"country": "DK",
"product": "NanoSense GPS-kit / GNSS",
"specs": "PPS ±100 ns class",
"trl": "TRL 9",
"price": "€5–15 k",
"export": "DK/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Beyond Gravity",
"country": "CH/SE",
"product": "PODRIX / LEORIX GNSS receivers",
"specs": "Institutional grade; cm-level POD with post-processing; PPS <10 ns class",
"trl": "TRL 9 (Sentinel, etc.)",
"price": "€100 k+ (price unverified)",
"export": "CH/SE",
"itarRisk": false,
"urls": []
},
{
"supplier": "NovAtel (Hexagon)",
"country": "CA",
"product": "OEM7 series (OEM719/729) adapted for space",
"specs": "Multi-frequency; raw obs; used in several LEO sats",
"trl": "TRL 8–9",
"price": "$2–10 k + screening",
"export": "CA/US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Spacemanic",
"country": "SK",
"product": "GNSS receivers for CubeSats",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Inter-satellite timing transfer",
"country": "—",
"product": "Options: (1) GNSS common-view with raw-observable logging (ns-level, no extra hardware); (2) two-way time transfer over S-band or optical ISL (Mynaric/Tesat terminals support ps-level ranging on some models); (3) ground-based post-correction using known reference emitters (calibration beacons)",
"specs": "Method (1)+(3) is baseline for first satellites; (2) when ISLs are added",
"trl": "—",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "F",
"name": "Downlink, TT&C, optical and inter-satellite links",
"items": [
{
"supplier": "Syrlinks (Safran)",
"country": "FR",
"product": "EWC27 X-band TX; N-XONOS; XONOS",
"specs": "EWC27: ≤1.4 Gbps, 27–33 dBm, 235 g; N-XONOS: ≤4 Gbps, 33 dBm, 385 g; XONOS: ≤6.3 Gbps in 375 MHz (DVB-S2/4D-TCM), 40 dBm, 2.4 kg",
"trl": "EWC27 & N-XONOS TRL 9; XONOS TRL 7–8",
"price": "EWC27 class ~€80–150 k (price unverified); 9–12 months",
"export": "FR/EU, ITAR-free",
"itarRisk": false,
"urls": [
"https://satsearch.co/products/syrlinks-xonos-x-band-high-data-rate-transmitter"
]
},
{
"supplier": "Syrlinks",
"country": "FR",
"product": "EWC31 / EWC31-NG S-band TT&C transceivers",
"specs": "256 kbps–2 Mbps, 33 dBm, 360–405 g; CCSDS",
"trl": "TRL 9",
"price": "€40–80 k (price unverified)",
"export": "FR/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "EnduroSat",
"country": "BG",
"product": "X-band Transmitter (≤1.5 Gbps, 270 g); X-band SDR TX (≤6 Gbps, <2.5 kg); S-band TRX III",
"specs": "Catalogue products",
"trl": "TRL 9 (both X-band units flown)",
"price": "Historically published €30–120 k (price unverified)",
"export": "BG/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Aerospacelab",
"country": "BE",
"product": "XSDR (206 Mbps, 29 dBm, 555 g), SSDR",
"specs": "In-house, sold externally",
"trl": "TRL 9",
"price": "On request",
"export": "BE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Dragonfly Aerospace",
"country": "ZA",
"product": "HDRTX-1.5 (1.5 Gbps, <4 W RF, 1.6 kg); HDRTx-3 (3 Gbps)",
"specs": "—",
"trl": "HDRTX-1.5 TRL 9",
"price": "On request",
"export": "ZA",
"itarRisk": false,
"urls": []
},
{
"supplier": "Satlab",
"country": "DK",
"product": "SRX-8 X-band (<1 Gbps, 300 g); SRS-3/4 S-band",
"specs": "Danish; widely flown",
"trl": "TRL 9",
"price": "€30–80 k",
"export": "DK/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "CUBECOM",
"country": "ZA",
"product": "XTXG2 (2.5 Gbps, 137 g), µHDTRX-X, HDRTX",
"specs": "Low mass",
"trl": "TRL 7–9",
"price": "On request",
"export": "ZA",
"itarRisk": false,
"urls": []
},
{
"supplier": "Space Inventor",
"country": "DK",
"product": "STTC-P3 SDR (S/X, 9 kbps–10 Mbps, 230 g)",
"specs": "TT&C + modest payload DL",
"trl": "TRL 9",
"price": "—",
"export": "DK/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "AAC Clyde Space",
"country": "SE/UK",
"product": "PULSAR-DATA XTX (50 Mbps, 130 g), STX",
"specs": "TT&C class",
"trl": "TRL 9",
"price": "—",
"export": "SE/UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "IQ spacecom",
"country": "DE",
"product": "XLINK transceiver (≤25 Mbps), SLINK-PHY, HISPICO",
"specs": "TT&C class",
"trl": "TRL 9",
"price": "€20–60 k",
"export": "DE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "GomSpace",
"country": "DK",
"product": "NanoCom TR-600 S-band; NanoCom XR / X-band modules",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "DK/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Tethers Unlimited (ARKA)",
"country": "US",
"product": "SWIFT-XTS (S/X, 6–25 Mbps, 800 g), SWIFT-KTX Ka",
"specs": "—",
"trl": "XTS TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Innoflight",
"country": "US",
"product": "SCR-106HDR (1 Gbps X-band, AES-256), SCR-108 Ka",
"specs": "Encrypted DoD-oriented",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Honeywell",
"country": "US",
"product": "STC-MS03 S-band transceiver",
"specs": "6.25 Mbps, 1 kg",
"trl": "TRL 9",
"price": "—",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Space Micro (Voyager)",
"country": "US",
"product": "microKaTx-300 (1 Gbps K-band)",
"specs": "—",
"trl": "TRL 7",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Thales Alenia Space",
"country": "FR/IT",
"product": "Institutional X/Ka TT&C and HDR transmitters",
"specs": "Large-sat class",
"trl": "TRL 9",
"price": "High",
"export": "FR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Tesat-Spacecom",
"country": "DE",
"product": "SCOT20 (CubeLCT lineage) / SCOT80 optical terminals",
"specs": "SCOT20: ~100 Mbps–1 Gbps to ground, ~0.4–1 kg class, ~10–15 W (CubeLCT 100 Mbps, 0.4 kg flown on PIXL-1 2021); SCOT80: 10 Gbps class ISL/DTE, ~10 kg",
"trl": "CubeLCT TRL 9; SCOT20/80 TRL 8–9 (SDA/German missions)",
"price": "€0.3–1.5 M per terminal (price unverified); 12–18 months",
"export": "DE/EU; EU DU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Mynaric (Rocket Lab)",
"country": "DE",
"product": "CONDOR Mk3",
"specs": "313 Mbps–2.5 Gbps (roadmap 10 Gbps); range >6,500 km; 80 mm aperture; 1536–1553 nm; SDA OCT standard-compliant; optical head 372×282×257 mm",
"trl": "Heritage listed; SDA Tranche 1 production",
"price": "~$0.5–1 M+ per unit at volume (price unverified)",
"export": "DE (now US-owned by Rocket Lab since 2025; check regime)",
"itarRisk": false,
"urls": [
"https://www.satnow.com/products/laser-communication-terminals/mynaric/155-1475-condor-mk3"
]
},
{
"supplier": "Skyloom",
"country": "US",
"product": "Skyloom Mini / OCT terminals",
"specs": "SDA-compliant",
"trl": "TRL 7–8",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Astrolight",
"country": "LT",
"product": "ATLAS optical terminal (1 Gbps class DTE)",
"specs": "Small-sat optical DTE; Lithuanian; EDF-funded",
"trl": "TRL 6–7 (first flights 2025–26, verify)",
"price": "On request",
"export": "LT/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "AAC Clyde Space",
"country": "SE",
"product": "CubeCat optical (1 Gbps, <1.33 kg, 15 W)",
"specs": "Flown NorSat-TD (Apr 2023)",
"trl": "TRL 9",
"price": "—",
"export": "SE/UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "DLR / Emxys",
"country": "DE/ES",
"product": "OSIRIS4 CubeSat (100 Mbps, 0.4 kg, 10 W); ODALCOM (200 Mbps, <1 kg, 2.6 W)",
"specs": "—",
"trl": "OSIRIS4 TRL 9; ODALCOM TRL 6",
"price": "—",
"export": "EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Inter-satellite RF links",
"country": "—",
"product": "S-band ISL (e.g., Paradigma PFES-1 front-end, GomSpace/Alén SDRs with ISL waveform; Ka-band in production constellations)",
"specs": "For a 2–4 satellite cluster, S-band ISL at 100 kbps–1 Mbps suffices for time-transfer and cueing; optical for data",
"trl": "TRL 7–9",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "G",
"name": "ADCS and GNC",
"items": [
{
"supplier": "Blue Canyon Technologies",
"country": "US",
"product": "NST / Standard NST star trackers; RWP050/100/500, RW1/RW4 wheels; FlexCore ADCS",
"specs": "NST: ~6 arcsec cross-boresight, ~0.35 kg, ~1.5 W; RWP500: 0.5 N·m·s, ~0.75 kg; RW1: 1 N·m·s ~0.95 kg; RW4: 4 N·m·s ~3.2 kg (datasheet values, verify in ADCS-2026 PDF)",
"trl": "TRL 9 (hundreds flown)",
"price": "$50–120 k per star tracker; $30–80 k per wheel (price unverified); 9–12 months",
"export": "US; often ITAR (USML XV) for star trackers above certain performance",
"itarRisk": true,
"urls": [
"http://www.bluecanyontech.com/wp-content/uploads/ADCS-2026.pdf"
]
},
{
"supplier": "Arcsec",
"country": "BE",
"product": "Sagitta star tracker; Twinkle (small)",
"specs": "Sagitta: 2 arcsec cross / 10 arcsec about boresight; 270 g; 1.5 W; 5–10 Hz; radiation-tested",
"trl": "TRL 9",
"price": "~€40–70 k (price unverified)",
"export": "BE/EU, ITAR-free",
"itarRisk": false,
"urls": [
"https://www.satnow.com/products/star-trackers/arcsec/37-1184-sagitta-star-tracker"
]
},
{
"supplier": "CubeSpace",
"country": "ZA",
"product": "CubeStar; CubeWheel (Small/Medium/Large: ~1.7 / 10 / 30 mN·m·s legacy, new Gen2 up to 0.05+ N·m·s); CubeADCS integrated",
"specs": "For ≤50 kg; for 150 kg need external wheels",
"trl": "TRL 9 (hundreds)",
"price": "€5–40 k",
"export": "ZA",
"itarRisk": false,
"urls": []
},
{
"supplier": "Hyperion Technologies (AAC Clyde)",
"country": "NL",
"product": "ST200/ST400 star trackers; RW210/RW400 wheels; IM200 IMU",
"specs": "ST400: 10 arcsec, 280 g; RW400: 0.03–0.05 N·m·s class",
"trl": "TRL 9",
"price": "€20–60 k",
"export": "NL/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Sodern (ArianeGroup)",
"country": "FR",
"product": "Auriga star tracker; Horus",
"specs": "Auriga: ~2 arcsec class (3σ cross), ~210 g optical head; NewSpace price point; Horus for larger",
"trl": "TRL 9 (OneWeb volume)",
"price": "~€50–100 k (price unverified)",
"export": "FR/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Jena-Optronik",
"country": "DE",
"product": "ASTRO CL / ASTRO XP star trackers",
"specs": "ASTRO CL: 1–2 arcsec class, ~1.1 kg",
"trl": "TRL 9",
"price": "€150–300 k (price unverified)",
"export": "DE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Terma",
"country": "DK",
"product": "T1 / HE-5AS star trackers",
"specs": "Institutional",
"trl": "TRL 9",
"price": "High",
"export": "DK/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Rocket Lab (Sinclair Interplanetary)",
"country": "CA/US",
"product": "RW-0.03, RW-0.06, RW-0.4, RW-1.0 wheels; ST-16RT2 star tracker",
"specs": "RW-1.0: 1 N·m·s, ~1.5 kg; ST-16RT2 7 arcsec, 185 g",
"trl": "TRL 9 (very wide)",
"price": "$30–60 k per wheel; $60–100 k tracker (price unverified)",
"export": "CA (now US-owned): EAR/ITAR check",
"itarRisk": true,
"urls": []
},
{
"supplier": "Vectronic Aerospace",
"country": "DE",
"product": "VRW-02/VRW-D series wheels; VST-41M star tracker; VMM magnetometers",
"specs": "VRW wheels 0.2–2 N·m·s class; VST-41M 10 arcsec",
"trl": "TRL 9",
"price": "€20–60 k",
"export": "DE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Redwire (ex-Adcole)",
"country": "US/BE",
"product": "Star trackers, sun sensors; Redwire Space Belgium (ex-QinetiQ)",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "US/BE",
"itarRisk": false,
"urls": []
},
{
"supplier": "Honeywell",
"country": "US",
"product": "HR-series wheels (large); MIMU",
"specs": "Too large for class",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Safran (Sensonor) / Honeywell / Northrop LN-200S",
"country": "NO/US",
"product": "IMUs: Sensonor STIM300/STIM377H (NO, tactical MEMS, 55 g, 1.5 W, flown widely); LN-200S FOG",
"specs": "STIM300: 0.3°/h bias stability; LN-200S 1°/h",
"trl": "TRL 9",
"price": "STIM300 ~€5–10 k; LN-200S ~$50 k+",
"export": "NO/EU (STIM) vs US ITAR (LN-200S)",
"itarRisk": true,
"urls": []
},
{
"supplier": "Magnetorquers/magnetometers",
"country": "various",
"product": "NewSpace Systems (ZA) NCTR series, ISISPACE iMTQ, Vectronic, Hyperion",
"specs": "For momentum dumping",
"trl": "TRL 9",
"price": "€5–20 k",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "GNC software",
"country": "—",
"product": "Bright Ascension (UK) GenerationOne ADCS; CubeSpace/Hyperion firmware; custom on OBC",
"specs": "—",
"trl": "—",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "H",
"name": "Electrical power system and solar arrays",
"items": [
{
"supplier": "MMA Design",
"country": "US",
"product": "HaWK / eHaWK / rHaWK deployable arrays (17–42 series), next-gen \"Disrupting the State of the Art\" arrays",
"specs": "HaWK 17AS42: ~112 W; eHaWK 27A up to ~240 W per wing; 30% ZTJ/XTJ cells; articulating (with Honeybee SADA)",
"trl": "TRL 9 (Artemis I CubeSats, GEO heliophysics, many LEO)",
"price": "$200–600 k per wing pair class (price unverified); 9–12 months",
"export": "US EAR 9A515",
"itarRisk": false,
"urls": [
"https://mmadesignllc.com/solar-arrays"
]
},
{
"supplier": "Rocket Lab (SolAero)",
"country": "US",
"product": "Z4J/IMM-α cells (30–33%); SolAero/Rocket Lab solar panels and arrays",
"specs": "Cells 30–32% BOL; panel integration",
"trl": "TRL 9",
"price": "Cells $150–300 per cell (price unverified)",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Azur Space",
"country": "DE",
"product": "3G30C/4G32C triple/quad-junction cells (30–32%); assembled panels via partners",
"specs": "3G30: 30% BOL, 80 µm; 4G32: 32%",
"trl": "TRL 9 (European standard)",
"price": "~€100–250 per cell class (price unverified); panels via DHV/AAC/others",
"export": "DE/EU, ITAR-free",
"itarRisk": false,
"urls": []
},
{
"supplier": "DHV Technology",
"country": "ES",
"product": "Deployable arrays and body panels for 1U–200 kg; MP42-class wings",
"specs": "Custom wings 100–500 W; Azur cells; hold-down/release mechanisms",
"trl": "TRL 9 (100+ missions)",
"price": "€100–400 k for 1 kW class (price unverified); 6–10 months",
"export": "ES/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "EnduroSat",
"country": "BG",
"product": "Solar panels (1U–ESPA), deployable arrays",
"specs": "Azur cells",
"trl": "TRL 9",
"price": "Catalogue",
"export": "BG/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "AAC Clyde Space",
"country": "SE/UK",
"product": "Photon solar panels, deployable; Starbuck EPS",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "SE/UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "Redwire",
"country": "US/BE",
"product": "ROSA (large), Redwire Space Belgium (ex-QinetiQ) cells & arrays",
"specs": "ROSA too large; Redwire Belgium = EU source",
"trl": "TRL 9",
"price": "—",
"export": "US / BE",
"itarRisk": false,
"urls": []
},
{
"supplier": "Airbus / Beyond Gravity / Leonardo",
"country": "EU",
"product": "Institutional arrays",
"specs": "Large-sat",
"trl": "TRL 9",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Saft (TotalEnergies)",
"country": "FR",
"product": "VES16 / VL51ES Li-ion cells; MPS/VES modules; Saft 4S/8S smallsat batteries",
"specs": "VES16: 4.5 Ah, 155 Wh/kg, 20-year GEO heritage; smallsat packs 100–1,000 Wh",
"trl": "TRL 9 (industry reference)",
"price": "€30–150 k per smallsat battery (price unverified); 9–12 months",
"export": "FR/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "EaglePicher",
"country": "US",
"product": "SLC-16050 / 18650-based LEO batteries; Li-ion SAR",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "EnerSys ABSL",
"country": "UK/US",
"product": "18650-based space batteries (Sony/Molicel cells)",
"specs": "Modular 8s–Ns strings; very wide heritage",
"trl": "TRL 9",
"price": "£50–200 k",
"export": "UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "GomSpace",
"country": "DK",
"product": "NanoPower BPX / BP4 battery packs; P60 PDU/ACU EPS",
"specs": "BPX: 77–154 Wh; P60: 350 W class EPS",
"trl": "TRL 9",
"price": "€10–40 k",
"export": "DK/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Berlin Space Technologies / AAC / Kongsberg NanoAvionics / EnduroSat",
"country": "EU",
"product": "PCDUs for 100–200 kg class (bus-integrated)",
"specs": "28 V unregulated, 300–1,000 W",
"trl": "TRL 9",
"price": "Bus-integrated",
"export": "EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Terma",
"country": "DK",
"product": "Power conditioning (institutional PCDUs)",
"specs": "Large-sat",
"trl": "TRL 9",
"price": "—",
"export": "DK",
"itarRisk": false,
"urls": []
},
{
"supplier": "Ibeos / Pumpkin / Vectronic",
"country": "US/DE",
"product": "Standalone 28 V PCDUs for microsats",
"specs": "—",
"trl": "TRL 8–9",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "I",
"name": "Propulsion (100–150 kg class)",
"items": [
{
"supplier": "ENPULSION",
"country": "AT",
"product": "MICRO R³ (FEEP, indium)",
"specs": "0.5–1 mN; Isp 2,700–3,600 s; 26 kN·s total impulse; 64–120 W (110 W nominal); 2.7 kg dry / 3.95 kg wet incl. PPU; 1.25 kg indium; 140×120×127 mm",
"trl": "TRL 9 (first MICRO in space Q1 2021; >300 ENPULSION thrusters in orbit)",
"price": "~€150–300 k (price unverified); 6–9 months",
"export": "AT/EU, ITAR-free",
"itarRisk": false,
"urls": [
"https://www.enpulsion.com/wp-content/uploads/DataSheet_Micro_20260323.pdf"
]
},
{
"supplier": "ENPULSION",
"country": "AT",
"product": "NANO R³ / NANO AR³",
"specs": "0.35 mN; Isp 2,000–6,000 s; ~5 kN·s; 40 W; 0.9 kg",
"trl": "TRL 9",
"price": "€80–150 k (price unverified)",
"export": "AT/EU",
"itarRisk": false,
"urls": [
"https://www.enpulsion.com/products/nano-r3/"
]
},
{
"supplier": "Exotrail",
"country": "FR",
"product": "spaceware-micro / spaceware-mini Hall thrusters (xenon)",
"specs": "micro: 2–7 mN, Isp ~800–1,000 s, 60–200 W; for 50–250 kg sats; mini for larger",
"trl": "TRL 9 (flown 2020 on 6U; multiple microsats)",
"price": "€300–600 k class (price unverified); 9–12 months",
"export": "FR/EU",
"itarRisk": false,
"urls": [
"https://www.exotrail.com/product/hall-thrusters-spaceware"
]
},
{
"supplier": "ThrustMe",
"country": "FR",
"product": "NPT30-I2 (iodine gridded ion), NPT30-I2-1.5U",
"specs": "0.3–1.1 mN, Isp 1,500–2,400 s, 35–65 W, 1.2–1.7 kg; iodine (unpressurised)",
"trl": "TRL 9 (2020 first iodine ion in orbit; many Spacety/others)",
"price": "€100–200 k (price unverified)",
"export": "FR/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Busek",
"country": "US",
"product": "BIT-3 (iodine RF ion), BHT-200 Hall",
"specs": "BIT-3: 1.1 mN, 2,100 s, 56 W; BHT-200: 13 mN 200 W",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Orbion Space Technology",
"country": "US",
"product": "Aurora Hall thruster",
"specs": "10–25 mN class, 200–500 W; too power-hungry for 150 kg",
"trl": "TRL 9 (2024+)",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Dawn Aerospace",
"country": "NL/NZ",
"product": "B20 (nitrous/propene green bi-prop), B1",
"specs": "B20: 20 N class thruster; CubeDrive/SatDrive systems; ΔV 100–300 m/s for 100–150 kg at 10–20 kg system",
"trl": "TRL 9 (dozens flown incl. on microsats)",
"price": "€250–500 k per system (price unverified)",
"export": "NL/NZ, ITAR-free",
"itarRisk": false,
"urls": [
"https://www.dawnaerospace.com/thrusters"
]
},
{
"supplier": "Bradford Space (ECAPS)",
"country": "NL/SE",
"product": "HPGP 1 N / 0.1 N LMP-103S green mono-prop",
"specs": "High-TRL (PRISMA 2010, SkySat constellation)",
"trl": "TRL 9",
"price": "€0.5–1 M system class (price unverified)",
"export": "NL/SE; LMP-103S propellant logistics",
"itarRisk": false,
"urls": []
},
{
"supplier": "Benchmark Space Systems",
"country": "US",
"product": "Halcyon (HTP), Xantus metal plasma",
"specs": "Green mono/bi-prop",
"trl": "TRL 9",
"price": "—",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Aerojet (L3Harris) / Moog",
"country": "US",
"product": "MR-103/106 hydrazine, cold gas",
"specs": "Hydrazine undesirable for class",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "Cold gas: GomSpace (NanoProp 6U/MEMS), VACCO (US), Hyperion PM200/PM400 (NL)",
"country": "DK/US/NL",
"product": "Butane/other cold gas",
"specs": "ΔV 10–40 m/s for this mass; useful for phasing only",
"trl": "TRL 9",
"price": "€50–150 k",
"export": "EU/US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Pale Blue (JP) / Aliena (SG) / Morpheus Space (DE)",
"country": "JP/SG/DE",
"product": "Water resistojet / Hall / FEEP",
"specs": "Alternatives; Morpheus GO-2 FEEP (DE) EU-sourced",
"trl": "TRL 7–9",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "J",
"name": "On-board computers and flight software",
"items": [
{
"supplier": "Xiphos (Epiq)",
"country": "CA",
"product": "Q8 / Q8J / Q8S",
"specs": "Zynq UltraScale+ MPSoC; Q8J adds I/O; 10–20 W; rad-tolerant features (TMR supervisor, scrubbing)",
"trl": "TRL 9 (HawkEye 360, dozens of missions)",
"price": "$40–100 k (price unverified)",
"export": "CA ECL / US EAR",
"itarRisk": false,
"urls": [
"https://satsearch.co/products/xiphos-q8-processor"
]
},
{
"supplier": "Unibap",
"country": "SE",
"product": "iX10-100 / iX10-101 (SpaceCloud)",
"specs": "AMD Ryzen V1605B + Microchip PolarFire + optional Myriad X; Linux; 10–30 W",
"trl": "TRL 9",
"price": "€60–150 k (price unverified)",
"export": "SE/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Innoflight",
"country": "US",
"product": "CFC-400 / CFC-500",
"specs": "Zynq; encrypted; DoD",
"trl": "TRL 9",
"price": "—",
"export": "US ITAR",
"itarRisk": true,
"urls": []
},
{
"supplier": "GomSpace",
"country": "DK",
"product": "NanoMind A3200 / HPC (Zynq)",
"specs": "TRL 9; CSP-based",
"trl": "TRL 9",
"price": "€10–40 k",
"export": "DK/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "KP Labs",
"country": "PL",
"product": "Antelope OBC/DPU; Leopard DPU; Oryx software",
"specs": "Zynq US+; RTOS + Linux; Intuition-1 (2023)",
"trl": "TRL 9",
"price": "On request",
"export": "PL/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Frontgrade Gaisler",
"country": "SE",
"product": "GR712RC (LEON3), GR740 (LEON4), GR765 (LEON5/NOELV) rad-hard processors and OBC boards",
"specs": "Rad-hard (300 krad); ESA standard",
"trl": "TRL 9",
"price": "€20–100 k per board",
"export": "SE/EU (some US-owned content)",
"itarRisk": false,
"urls": []
},
{
"supplier": "ISISPACE / AAC Clyde Space (Sirius OBC) / EnduroSat OBC / Spacemanic",
"country": "NL/SE/BG/SK",
"product": "Nanosat OBCs (ARM Cortex-M/R)",
"specs": "For bus functions",
"trl": "TRL 9",
"price": "€5–30 k",
"export": "EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Bright Ascension",
"country": "UK",
"product": "GenerationOne flight software framework + ground software",
"specs": "Component-based FSW; many missions",
"trl": "TRL 9",
"price": "Licence £50–200 k class (price unverified)",
"export": "UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "NASA cFS / F´ (F Prime)",
"country": "US",
"product": "Open-source flight software frameworks",
"specs": "cFS: Apache-2.0; F´: Apache-2.0 (JPL); huge heritage",
"trl": "TRL 9",
"price": "Free; integration effort",
"export": "Open source (no export issue)",
"itarRisk": false,
"urls": []
},
{
"supplier": "Kubos (KubOS) / Major Tom",
"country": "US",
"product": "KubOS Linux FSW (largely dormant), Major Tom mission control",
"specs": "Mission control still used",
"trl": "TRL 7–9",
"price": "SaaS",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Libre Space / SatNOGS",
"country": "GR",
"product": "Open-source ground network and software; Greek foundation",
"specs": "Useful for UHF/S-band TT&C testing and community ground stations",
"trl": "TRL 9",
"price": "Free",
"export": "GR",
"itarRisk": false,
"urls": []
},
{
"supplier": "GNU Radio / OpenSatKit",
"country": "—",
"product": "SDR waveform development and FSW integration",
"specs": "—",
"trl": "—",
"price": "Free",
"export": "—",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "K",
"name": "Ground station networks, services and hardware",
"items": [
{
"supplier": "KSAT (Kongsberg Satellite Services)",
"country": "NO",
"product": "KSATlite (S/X-band, 20+ sites incl. Svalbard, Troll); KSAT full network",
"specs": "Polar sites give ~every-orbit contact for SSO; X-band up to 1–2 Gbps on 3.7–7.3 m dishes",
"trl": "TRL 9 (industry leader)",
"price": "Pay-per-pass or monthly; market range X-band $150–500/pass; KSATlite entry contracts ~$1–5 k/month (price unverified)",
"export": "NO; data-handling under Norwegian/NATO rules",
"itarRisk": false,
"urls": [
"https://satsearch.co/products/kongsberg-satellite-services-ksat-lite"
]
},
{
"supplier": "AWS Ground Station",
"country": "US",
"product": "On-demand / reserved antenna time; narrowband (<40 MHz) and wideband (≥40 MHz); sites US, Ireland, Bahrain, Sweden, Singapore, Australia, Cape Town, etc.",
"specs": "Per-minute billing; reserved requires 12-month monthly commitment; data lands in S3",
"trl": "TRL 9",
"price": "Historical published rates: on-demand $3/min narrowband, $10/min wideband; reserved $2/$7 per minute (public pricing page now says \"contact sales\"; price unverified for 2026)",
"export": "US (AWS ToS; data residency selectable)",
"itarRisk": false,
"urls": [
"https://aws.amazon.com/ground-station/pricing/"
]
},
{
"supplier": "Leaf Space",
"country": "IT",
"product": "Leaf Line (S/X-band shared network, 15+ sites incl. Nova Scotia, Ireland, Spain, Italy, Chile, Australia); Leaf Key (dedicated)",
"specs": "S/X; up to 1 Gbps X-band on larger dishes",
"trl": "TRL 9",
"price": "Pay-per-pass; no public rate card",
"export": "IT/EU",
"itarRisk": false,
"urls": [
"https://leaf.space/faq/"
]
},
{
"supplier": "SSC (Swedish Space Corporation)",
"country": "SE",
"product": "SSC Infinity network (Esrange, Inuvik, Santiago, Punta Arenas, WA Australia, etc.)",
"specs": "Polar S/X; institutional heritage",
"trl": "TRL 9",
"price": "On request",
"export": "SE/EU",
"itarRisk": false,
"urls": [
"https://newspacemarket.com/guides/ground-station-services/"
]
},
{
"supplier": "Atlas Space Operations",
"country": "US",
"product": "Freedom network/software; sites global",
"specs": "S/X; software-first",
"trl": "TRL 9",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Viasat Real-Time Earth (RTE)",
"country": "US",
"product": "S/X/Ka global sites (incl. Sweden, Ghana, Australia)",
"specs": "High-rate X/Ka",
"trl": "TRL 9",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Infostellar",
"country": "JP",
"product": "StellarStation (aggregator)",
"specs": "S/X via partner antennas",
"trl": "TRL 9",
"price": "Per-pass",
"export": "JP",
"itarRisk": false,
"urls": []
},
{
"supplier": "Dhruva Space",
"country": "IN",
"product": "Ground station hardware and services (India)",
"specs": "S/X",
"trl": "TRL 8–9",
"price": "—",
"export": "IN",
"itarRisk": false,
"urls": []
},
{
"supplier": "RBC Signals",
"country": "US",
"product": "Aggregated network",
"specs": "—",
"trl": "TRL 9",
"price": "Per-pass",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Azure Orbital Ground Station",
"country": "US",
"product": "Microsoft Azure Orbital GSaaS — status: Microsoft announced end of Azure Orbital Ground Station as a public service (2024–25); treat as unavailable; verify",
"specs": "—",
"trl": "—",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Hellenic / Greek assets",
"country": "GR",
"product": "Thermopylae satellite ground station (OTE/COSMOTE), ESA Greek Connectivity Programme ground segment; Libre Space SatNOGS nodes; University of Patras/AUTh",
"specs": "Primarily telecom teleports; X-band EESS reception would need a new 3.7–5 m antenna",
"trl": "TRL 9 (teleports)",
"price": "—",
"export": "GR",
"itarRisk": false,
"urls": [
"https://resilience.esa.int/?p=27235"
]
},
{
"supplier": "Ground station hardware: Safran Data Systems (Zodiac Aerospace) (FR) Cortex receivers, 3.7–7.3 m X-band systems",
"country": "FR",
"product": "Cortex HDR, Cortex CRT; full-motion antennas",
"specs": "X-band 1–2 Gbps receivers",
"trl": "TRL 9",
"price": "€0.5–2 M per 5 m X-band station (price unverified)",
"export": "FR/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Orbit Communication Systems (IL), Intellian (KR), Kratos/Quintech (US), ND SatCom (DE), Celestia STS (NL/ES), Satlantis Ground, AAC Clyde (SE)",
"country": "various",
"product": "3–7 m X/S-band tracking antennas; modems",
"specs": "3.7 m X-band ~ 500 Mbps–1 Gbps; 5 m 1–2 Gbps",
"trl": "TRL 9",
"price": "3.7 m system €300–800 k; 7.3 m €1.5–3 M (price unverified)",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Kratos",
"country": "US",
"product": "quantumRadio, OpenSpace virtual ground; EW-related ground processing (SpectralNet)",
"specs": "Software-defined ground",
"trl": "TRL 9",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "L",
"name": "Launch (2026 market)",
"items": [
{
"supplier": "SpaceX",
"country": "US",
"product": "Transporter (SSO, ~3–4/yr) rideshare; ESPA ports via SpaceX or aggregators",
"specs": "SSO 500–600 km; ESPA 15\" port up to ~200 kg (24\" Grande for larger)",
"trl": "TRL 9 (Transporter-15 Nov 2025; T-16 in 2026)",
"price": "$7,000/kg for 2026 flights (min 50 kg = $350 k); $7,500/kg for 2027; 150 kg → ~$1.05–1.13 M; book 12–18 months ahead",
"export": "US; payload export/import (ITAR/EAR) paperwork for integration in US",
"itarRisk": true,
"urls": [
"https://newspaceeconomy.ca/2026/02/27/satellite-ridesharing-market-analysis-2026/",
"https://spacenexus.us/guide/cost-to-launch/hosted-payload"
]
},
{
"supplier": "SpaceX",
"country": "US",
"product": "Bandwagon (mid-inclination ~45°, ~2–3/yr)",
"specs": "~45° inclination, 500–600 km; Bandwagon-5 flew Oct 2026",
"trl": "TRL 9",
"price": "Same per-kg schedule as Transporter (~$7,000/kg 2026)",
"export": "US",
"itarRisk": false,
"urls": [
"https://tech-insider.org/spacex-bandwagon-5-launch-scrub-weather-delay-2026/"
]
},
{
"supplier": "Exolaunch",
"country": "DE",
"product": "Rideshare integration and deployment (CarboNIX separation system) on Transporter/Bandwagon/others",
"specs": "Mission management, port aggregation, ESPA integration in Berlin",
"trl": "TRL 9 (hundreds of sats)",
"price": "SpaceX price + service margin (typ. 10–25%, price unverified); handles US import paperwork",
"export": "DE/EU — eases ITAR exposure for EU integrators",
"itarRisk": true,
"urls": [
"https://newspaceeconomy.ca/2026/02/27/satellite-ridesharing-market-analysis-2026/"
]
},
{
"supplier": "Rocket Lab",
"country": "US/NZ",
"product": "Electron dedicated (200 kg SSO; 300 kg LEO)",
"specs": "Custom inclination/LTAN; 21 launches in 2025; 93 flights by Aug 2026 (89 successes)",
"trl": "TRL 9",
"price": "~$7.5 M dedicated list (~$25–37 k/kg); Kick Stage for precise insertion",
"export": "US ITAR (US launch licence)",
"itarRisk": true,
"urls": [
"https://spacenexus.us/rockets/electron"
]
},
{
"supplier": "Isar Aerospace",
"country": "DE",
"product": "Spectrum (1,000 kg LEO / 700 kg SSO) from Andøya",
"specs": "First flight failed Mar 2025; second flight pending (multiple 2026 scrubs); no successful launch as of Oct 2026",
"trl": "TRL 6",
"price": "Target €10,000/kg (design goal)",
"export": "DE/EU",
"itarRisk": false,
"urls": [
"https://en.wikipedia.org/wiki/Spectrum_(rocket"
]
},
{
"supplier": "Rocket Factory Augsburg (RFA)",
"country": "DE",
"product": "RFA One (1,300 kg LEO) from SaxaVord",
"specs": "Static-fire anomaly 2024; first flight pending 2026 (verify)",
"trl": "TRL 6",
"price": "Target ~€3–5 M/launch (price unverified)",
"export": "DE/UK",
"itarRisk": false,
"urls": [
"https://en.wikipedia.org/wiki/RFA_One"
]
},
{
"supplier": "PLD Space",
"country": "ES",
"product": "Miura 5 (~540 kg LEO) from Kourou",
"specs": "First flight targeted 2026 (verify)",
"trl": "TRL 5–6",
"price": "On request",
"export": "ES/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "Arianespace / Avio",
"country": "FR/IT",
"product": "Vega-C rideshare (SSMS)",
"specs": "Vega-C returned to flight Dec 2024; SSMS rideshare slots to SSO",
"trl": "TRL 9",
"price": "Not published; historically above SpaceX per kg; ESA-supported European preference",
"export": "EU",
"itarRisk": false,
"urls": [
"https://newspaceeconomy.ca/2026/02/27/satellite-ridesharing-market-analysis-2026/"
]
},
{
"supplier": "Firefly Aerospace",
"country": "US",
"product": "Alpha (1,000 kg LEO)",
"specs": "Mixed record (failure Apr 2025; return to flight 2026 verify)",
"trl": "TRL 8",
"price": "~$15 M dedicated (price unverified)",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "ESPA port / adapter costs",
"country": "—",
"product": "ESPA 15\" port ring share, separation system (Exolaunch CarboNIX, RUAG/Beyond Gravity PAS, Planetary Systems Lightband)",
"specs": "Separation system $50–150 k; port fees embedded in rideshare price",
"trl": "TRL 9",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Orbit choice",
"country": "—",
"product": "SSO 500–550 km (Transporter): global coverage, polar passes, consistent lighting, but revisit at mid-latitudes ~2×/day per sat; Mid-inclination 45–53° (Bandwagon): 2–3× more passes over the Eastern Mediterranean/Black Sea/Middle East, better for regional persistence; no polar ground-station advantage",
"specs": "For a Greece-centred regional mission, 45–55° inclination at ~500 km is preferred; SSO for the first demonstrator if schedule is tight",
"trl": "—",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
}
]
},
{
"id": "M",
"name": "Test, AIT and environmental facilities (Europe, with Hellenic options)",
"items": [
{
"supplier": "Hellenic Aerospace Industry (EAB/HAI) — HAITF",
"country": "GR",
"product": "Hellenic Assembly, Integration and Testing Facility, Schimatari",
"specs": "ISO 8 cleanroom ~400 m²; large and small TVAC chambers; 3-axis slip-table vibration; EVT; satellites up to 500 kg / 1.5 m³; ESA-implemented, RRF-funded; operational (ESA news 14 Jul 2026); EMC not mentioned",
"trl": "New (commissioned 2026)",
"price": "Greek national facility; terms via EAB/Ministry of Digital Governance",
"export": "GR",
"itarRisk": false,
"urls": [
"https://resilience.esa.int/?p=27235"
]
},
{
"supplier": "ESA ESTEC Test Centre",
"country": "NL",
"product": "LSS, HYDRA shaker, EMC, acoustic, mass properties",
"specs": "Full-service; commercial access via European Test Services (ETS)",
"trl": "TRL 9",
"price": "€150–400 k for a microsat campaign (price unverified); 6–9 months booking",
"export": "NL/EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "IABG",
"country": "DE",
"product": "Ottobrunn test centre: TVAC, vibration, acoustic, EMC, antenna range (CATR)",
"specs": "Large-sat heritage; smallsat packages",
"trl": "TRL 9",
"price": "Comparable to ESTEC",
"export": "DE",
"itarRisk": false,
"urls": []
},
{
"supplier": "Intespace (Airbus)",
"country": "FR",
"product": "Toulouse: TVAC, vibration, EMC, antenna CATR",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "FR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Beyond Gravity / RUAG (Zürich)",
"country": "CH",
"product": "Environmental test",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "CH",
"itarRisk": false,
"urls": []
},
{
"supplier": "SERMS (Terni), CSL (Liège), Mecano ID, Sener, Alter Technology (ES), Angelantoni Test Technologies (IT)",
"country": "IT/BE/ES",
"product": "Microsat-scale TVAC/vibration; component screening (Alter: EEE parts radiation testing)",
"specs": "Alter Technology for COTS radiation screening (TID/SEE)",
"trl": "TRL 9",
"price": "€50–200 k per campaign",
"export": "EU",
"itarRisk": false,
"urls": []
},
{
"supplier": "EMC / antenna ranges",
"country": "—",
"product": "IABG CATR; Intespace; University of Patras / AUTh antenna labs (GR); Aalborg/ UPM anechoic (DK/ES); NPL (UK); Microwave Vision Group (MVG, FR) near-field ranges; ESA Hertz chamber (ESTEC)",
"specs": "Needed for pattern/phase-centre calibration of the DF array (critical for AoA accuracy)",
"trl": "TRL 9",
"price": "€20–80 k per campaign",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Radiation testing",
"country": "—",
"product": "UCLouvain HIF (BE), RADEF Jyväskylä (FI), GANIL (FR), ESA Co-60 (ESTEC), Demokritos tandem accelerator (GR) for lower-energy protons",
"specs": "For COTS RFSoC/ADC SEE characterisation",
"trl": "TRL 9",
"price": "€20–60 k per campaign",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Clean-room / AIT subcontractors",
"country": "GR",
"product": "EAB/HAI (Schimatari), Prisma Electronics (Alexandroupolis), Planetek Hellas (Athens), Satways, Space Hellas (antennas/EMC), Libre Space Foundation",
"specs": "Greek industrial base for AIT, harness, software, ground segment",
"trl": "TRL 7–9",
"price": "—",
"export": "GR",
"itarRisk": false,
"urls": [
"https://mindigital.gr/wp-content/uploads/2025/02/Request-for-Proposals.v1.3.pdf"
]
}
]
},
{
"id": "N",
"name": "Software and tools",
"items": [
{
"supplier": "Ansys",
"country": "US",
"product": "STK (Systems Tool Kit) incl. Communications, Coverage, EOIR; TDOA/FDOA geolocation via Analysis Workbench",
"specs": "Industry standard for coverage/revisit, access, link budgets",
"trl": "TRL 9",
"price": "$10–50 k/seat/yr (price unverified); academic licences",
"export": "US EAR (software)",
"itarRisk": false,
"urls": []
},
{
"supplier": "NASA",
"country": "US",
"product": "GMAT (General Mission Analysis Tool)",
"specs": "Open-source orbit design/propagation",
"trl": "TRL 9",
"price": "Free",
"export": "Open source",
"itarRisk": false,
"urls": []
},
{
"supplier": "a.i. solutions",
"country": "US",
"product": "FreeFlyer",
"specs": "Mission design/ops",
"trl": "TRL 9",
"price": "$10–30 k/seat",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "GNU Radio",
"country": "—",
"product": "Open-source SDR DSP framework; gr-satellites; gr-radar; cross-ambiguity-function blocks",
"specs": "Core of payload DSP prototyping and ground processing",
"trl": "TRL 9",
"price": "Free",
"export": "Open source",
"itarRisk": false,
"urls": []
},
{
"supplier": "DeepSig",
"country": "US",
"product": "OmniSIG (ML signal detection/classification), OmniPHY",
"specs": "AI spectrum sensing; used by HawkEye 360-type pipelines",
"trl": "TRL 8–9",
"price": "Licence on request",
"export": "US EAR",
"itarRisk": false,
"urls": []
},
{
"supplier": "Kratos",
"country": "US",
"product": "SpectralNet, quantumRadio, OpenSpace; EW/SIGINT ground processing heritage",
"specs": "Software-defined ground and RF monitoring",
"trl": "TRL 9",
"price": "On request",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Libre Space Foundation",
"country": "GR",
"product": "SatNOGS network and DB, SIDLOC; open-source ground segment",
"specs": "Greek open-source leadership; useful for TT&C test and community ops",
"trl": "TRL 9",
"price": "Free",
"export": "Open source",
"itarRisk": false,
"urls": []
},
{
"supplier": "Kubos (Major Tom)",
"country": "US",
"product": "Major Tom mission control SaaS",
"specs": "Multi-mission ops",
"trl": "TRL 9",
"price": "SaaS $ k/month",
"export": "US",
"itarRisk": false,
"urls": []
},
{
"supplier": "Bright Ascension",
"country": "UK",
"product": "Mission Control Software + FSW",
"specs": "—",
"trl": "TRL 9",
"price": "Licence",
"export": "UK",
"itarRisk": false,
"urls": []
},
{
"supplier": "Spire / NSL (Nanosat Launch) / Open Cosmos \"OpenApp\" / Leaf Space ops",
"country": "US/UK",
"product": "Mission ops platforms",
"specs": "—",
"trl": "TRL 9",
"price": "—",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Rohde & Schwarz",
"country": "DE",
"product": "R&S PR200/EM200/ESMD monitoring receivers and RAMON signal-analysis software; AMMOS SIGINT suite (government)",
"specs": "Reference-grade ground truth and signal-database tooling; EU-sourced",
"trl": "TRL 9",
"price": "€50–500 k",
"export": "DE (AMMOS government-controlled)",
"itarRisk": false,
"urls": []
},
{
"supplier": "Keysight / Rohde & Schwarz / Anritsu",
"country": "US/DE/JP",
"product": "Vector signal analysers/generators for payload test; Keysight PathWave",
"specs": "Lab",
"trl": "TRL 9",
"price": "€100–500 k lab set",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "EW database tools",
"country": "—",
"product": "Open: SIGIDWIKI, ITU BR IFIC/SRS databases, FCC ULS; Commercial: Jane's C4ISR & Radar databases (UK), Spectrum Monitoring databases (R&S), HawkEye 360 RFGeo/Mission Space; Government: NATO EWDB/NEDB (restricted)",
"specs": "Seed the emitter catalogue with ITU filings and Jane's; build own PDW/signature database (e.g., PostgreSQL/TimescaleDB + custom schema)",
"trl": "—",
"price": "Jane's licences €20–100 k/yr (price unverified)",
"export": "—",
"itarRisk": false,
"urls": []
},
{
"supplier": "Geolocation/analysis libraries",
"country": "—",
"product": "Python: numpy/scipy/cupy CAF; Skyfield/poliastro/orekit (Java, open-source, CS Group FR) for precise orbit; MATLAB Phased Array Toolbox",
"specs": "Orekit is EU-origin, used by CNES",
"trl": "TRL 9",
"price": "Free / MATLAB licence",
"export": "—",
"itarRisk": false,
"urls": []
}
]
}
];
