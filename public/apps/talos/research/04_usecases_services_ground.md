# 04 — Use Cases, Service Models, Customers, Ground Segment and EW Databases

*Research note for the LEO passive-RF / SIGINT smallsat feasibility study. Status: 21 October 2026. Sources are given as [n] and listed at the end. Where a figure is a vendor claim rather than an independently verified measurement, it is labelled as such. Items marked "general knowledge" are standard doctrine/standards facts not tied to a single fetched source.*

---

## 1. Use cases with documented examples

The commercial space-RF market has existed since HawkEye 360's Pathfinder cluster became operational in February 2019 [14][30]. In seven years the use cases have moved from demonstrations to recurring, contracted services. The table below collects the best-documented public examples; the narrative that follows adds detail on accuracy and latency where it is public.

| Use case | Documented example | Who / when | What was achieved | Accuracy / latency notes |
|---|---|---|---|---|
| GNSS interference mapping (military indicator) | GPS jamming detected on the Ukraine–Belarus border (Chernobyl exclusion zone) and along the Luhansk/Donetsk line of contact | HawkEye 360, collections from Nov 2021, published 4 Mar 2022 [6] | Jamming shown as a "leading indicator" of military activity in the four months before the 24 Feb 2022 invasion; corroborated by OSCE UAV GPS-loss reports | No public CEP; product was RFGeo GNSS-interference layer. Latency was days-to-weeks (analytic report), not tactical |
| GNSS interference / spoofing geolocation | GNSS-I product suite upgrade: wider-band algorithm, spoofing vs jamming discrimination, terrain-adjusted geolocation | HawkEye 360, 29 Jul 2025 [5] | Claimed 15x increase in geolocation density; spoofers geolocated to "kilometer-level" precision (vendor claim) | Km-class accuracy against GNSS-band interferers is the realistic benchmark for a 3-sat cluster at ~500 km |
| GNSS interference (aviation context) | EASA 7-day FIR ranking: Ankara, Warsaw, Bucharest, Sofia, Vilnius top five; IATA: GPS-loss events +220% 2021–2024; EUROCONTROL: up to 38% of European en-route traffic crosses regularly affected regions; >800 pilot reports around Vilnius in Q4 2024 vs 124 a year earlier | EASA / IATA / EUROCONTROL / Reuters, 2024–2026 [18] | Terrestrial-sensor and ADS-B-derived maps (EASA, gpsjam.org) exist, but they map *effect on receivers*, not the *emitter*. Space RF closes that gap by geolocating the source | ADS-B-derived maps have hourly/daily cadence and ~hex-cell (tens of km) resolution; satellite RF adds emitter position |
| GNSS interference (maritime) | Windward filtered >2.2 million false ship-to-ship meeting records across ~47,000 jammed vessels since late Feb 2026 (Iran conflict, "Operation Epic Fury"); Q2 2026: 171,286 distinct vessels affected at least once | Windward, 25 Jun 2026 [19] | Shows the commercial maritime market's appetite for an interference layer; Windward is building a near-real-time jamming map and AOI alerts | Windward infers jamming from AIS corruption, not from RF; a space-RF source layer is complementary |
| GNSS interference (seafarer impact) | RIN survey: 79% of 271 respondents experienced interference; >80% in the Persian Gulf; episodes >1 day common in the Gulf | Royal Institute of Navigation via Shipping Telegraph, 2025 [20] | Demand-side evidence for insurers/shipowners | — |
| GNSS interference (research validation) | CYGNSS GNSS-R noise-floor analysis across 7 satellites vs 1: median detection latency 48 min (N=7) vs 3 h 46 min (N=1); median revisit on top-50 hotspots 1 h 49 min vs 23 h | arXiv, 2026 [17] | Independent evidence that the biggest step-change in GNSS-interference detection utility is from 1 to 3 satellites | No false-alarm characterisation yet; ±40° latitude only |
| Dark vessel / IUU fishing | ~325-vessel Chinese fleet off Galápagos EEZ, mid-Jul to end-Aug 2020; S/X-band marine radar and VHF detections not matching AIS; joint RF+SAR collection with Airbus found 58 SAR vessels of which only 16 matched AIS within ±60 min | HawkEye 360 + Airbus DS, 2020 [7] | Template for RF→SAR cueing on dark fleets; Ecuador reported 149 vessels with AIS off | RF geolocation of radars triangulated by a 3-sat cluster; emitters ≥1 W detectable (vendor claim) |
| Maritime RF surveillance (dedicated product) | Unseenlabs BRO constellation (13 monosatellites by 2024, 11 in orbit at Feb 2024, +10 planned by end-2025), "dozens of clients", use cases: dark ship tracking, seabed protection, piracy | Unseenlabs, 2024–2026 [10][11] | Single-satellite RF geolocation of ships to "sub-kilometre" (vendor claim); next-gen 150 kg satellites in 2026 add land (satphones, jammers) and space monitoring | Single-sat geolocation is feasible for persistent maritime emitters because the ship is quasi-static over a pass |
| Military radar / air-defence monitoring | Unnamed European MoD subscription to HawkEye 360 "Air Defense and GPS Interference Monitoring services", up to USD 75 M | HawkEye 360, 2 Mar 2026 [22] | Air-defence radar order-of-battle monitoring is now a named commercial service line | Radar detection in S/C/X-band; emitter ID against a library |
| Force posture / pattern-of-life | Galwan Valley (China–India border), 2020: increased RF activity used to task EO imagery which showed a Chinese build-up | HawkEye 360 [14] | Canonical "RF tips imagery" case | — |
| UAS communications / tactical radio | HawkEye's Signal-of-Interest library includes UHF push-to-talk (GMRS/FRS), VHF radios, satphones, cellular, X-band radar, Ku VSAT [30]; Spire's 2025 RF service transcribes/translates unencrypted voice from VHF/UHF/L-band [9] | HawkEye 360, Spire | Push-to-talk and UAS C2 link mapping is a mature product class in UHF/L/S; detection, not content, for encrypted links | Short, bursty push-to-talk needs the cluster to be overhead during the burst; dwell planning matters |
| Spectrum compliance / interference hunting for a satellite operator | NOAA GOES Data Collection System uplink slot blocked for years by a lost environmental transmitter (1.9 s bursts, 1.5 kHz channel); HawkEye 360 geolocated it, NOAA recovered it plus a second device | NOAA + HawkEye 360, published 31 Jul 2026 [31] | First public case of space-RF resolving a satellite operator's uplink interference; directly relevant to the user's satellite-operations background | No CEP published; the point is that narrowband, low-duty-cycle emitters are findable with persistent tasking |
| Spectrum monitoring (civil/regulatory) | Aurora Insight (acquired via Maxar RF Solutions, Dec 2023) mapped terrestrial spectrum occupancy from space; HawkEye lists "spectrum exploitation" as a solution area | HawkEye 360 [2][14] | Regulators and MNOs buy occupancy maps for licence enforcement and planning | — |
| Space domain awareness | HawkEye 360 RF satellites detecting emissions from other satellites | KeepTrack Space Brief, 7 Oct 2026 [39] | New product direction: RF characterisation of spacecraft | — |
| Search and rescue / disaster response | HawkEye lists emergency-beacon location and tower-health checks [14]; Spire lists "emergency beacons" as a detected signal class [9] | — | Complementary to COSPAS-SARSAT (406 MHz) which already geolocates beacons with MEOSAR to a few km within minutes (general knowledge) | Commercial RF adds non-COSPAS emitters (VHF DSC, handhelds) |
| Border / migration / smuggling | Frontex paid HawkEye 360 ~EUR 1.5 M in 2019 for maritime situational awareness [30]; Frontex implements the Copernicus border-surveillance service and EUROSUR Fusion Services [38] | Frontex | RF detection of small-vessel VHF/satphone activity feeds EUROSUR | Low-power handhelds at sea are at the edge of detectability from 500 km; see 02/03 link-budget notes |

**Key observations for the feasibility study**

- Every documented success is either (a) a *persistent* emitter (radar, jammer, fixed transmitter) where multi-pass accumulation compensates for coarse single-pass geolocation, or (b) a *correlation* product (RF vs AIS, RF vs SAR). Pure one-shot detection of a short burst is rarely the headline.
- Latency in the published cases was hours to days. HawkEye's S-1 explicitly says latency is being reduced "from hours to minutes" with a goal of seconds via direct downlink, crosslinks and onboard processing [2]. The tactical-latency market is therefore still open.
- GNSS interference is the use case with the widest customer base (military, aviation regulators, maritime, insurers, EUSPA) and the simplest signal (continuous, known band), making it the natural first product.

---

## 2. Service and product models of existing operators

### 2.1 HawkEye 360 (NYSE: HAWK since 7 May 2026)

HawkEye 360 is the only operator with a full public disclosure of its business model, via its S-1/A [1][2].

| Dimension | What is public |
|---|---|
| Scale | >30 satellites in tri-satellite clusters (12 clusters / 36 Hawks + Kestrel-0A + 2 spectrum sats as of Jul 2025 [14]; Cluster 13 since [40]); 30 MHz – 18 GHz; global revisit "< 45 minutes" (vendor claim) [1][2] |
| Revenue | FY2025 USD 117.7 M (+74%); adj. EBITDA 24.8 M; gross margin ex-D&A ~82%; funded backlog 302.7 M at Dec 2025 [1][2] |
| Customer mix | US 61% (NRO alone 39% of 2025 revenue), Japan 16%, other international 23% [1][2] |
| Service tiers | (1) **IQ dedicated tasking** — customer-tasked collections, raw IQ delivered with processing toolkits; (2) **Geolocation** — RFGeo detections/geolocations; (3) **Subscription packages** — HawkEye-tasked collections sold to multiple customers (e.g., South China Sea vessel data); (4) **Knowledge-based products** — analytics on subscription; (5) **Dedicated-capacity / sovereign** — customised clusters, bespoke algorithms, in-country ground stations, HawkEye retains ownership and control [2] |
| Named solution areas | Maritime intelligence, military radar monitoring, GNSS jamming detection, communications mapping, spectrum exploitation, custom SIGINT [2] |
| Products | RFGeo (2019; UHF/L-band added Oct 2019 with MMSI matching and archive) [14]; Mission Space (Feb 2021) analytics platform [12]; Regional Awareness Subscription (Jul 2020): daily collections over multi-million-km² AOIs (Mediterranean, South China Sea, Korean Peninsula), GeoJSON delivery [13]; GNSS-I suite [5]; Air Defense Monitoring service [22]; SeaVision bundle (India FMS) [14] |
| Delivery | GeoJSON via API or Mission Space dashboard [13][29]; "fully vetted for operations within classified enclaves" [2] |
| Contract forms | Subscriptions, IQ tasking, multi-year international contracts, US IDIQs (no guaranteed volume), FMS (India USD 131 M, 4 May 2025 [14]), up to USD 75 M European MoD subscription [22], USD 36 M across >10 nations announced 19 Oct 2026 [21] |
| Data rights | Data shareable under EULAs; >200 export licences; nearly half the workforce cleared [1][2] |

Pricing figures: HawkEye does not publish list prices. Order-of-magnitude anchors from contracts: EUR 1.5 M for a Frontex maritime awareness pilot (2019) [30]; USD 5.8 M NIWC Pacific monitoring task [30]; USD 75 M ceiling for a single European MoD multi-service subscription [22]; USD 131 M FMS case including software, training and support [14]. A reasonable planning assumption is that a national-MoD regional subscription with air-defence and GNSS-I layers runs in the low-to-mid tens of millions USD per multi-year term.

### 2.2 Kleos Space (reference model; company ceased trading 2023)

Kleos's February 2023 brochure remains the clearest public statement of a DaaS/MaaS price structure for space RF [8]:

- **Guardian LOCATE** (DaaS): frequency, time, lat/lon and ECEF of each detection, confidence ellipse, JSON over an encrypted REST API; VHF 155–165 MHz (tunable), X-band "coming soon"; accuracy "within 300 m depending on conditions" (vendor claim); daily revisit of any AOI; **monthly or annual subscription priced by AOI**.
- **Mission-as-a-Service**: a 4-satellite polar cluster with propulsion; up to **9 min per orbit or ~70 min per day of VHF collection per satellite** (capacity heavily AOI-dependent); options for direct-to-user downlink and on-premises/cloud geolocation processing; exclusive, full or partial tasking with unrestricted data rights; **price a function of % of capacity, taskability and exclusivity**.

Kleos's failure is itself a data point: four clusters launched (Nov 2020–Jan 2023) but revenue never matched capital needs. The lesson for a 100–150 kg programme is that the anchor customer and the analytics layer must exist before the third cluster, not after.

### 2.3 Spire Global

Spire's July 2025 "Space Reconnaissance" expansion offers RF GEOINT across VHF/UHF/L-band: unauthorised/unregistered emitters, unencrypted voice transcription/translation/summarisation by AI, GNSS interference, emergency beacons, emitter tracking over time, and the ability to trigger third-party imagery for confirmation; delivered through secure cloud with "sovereign-ready" deployments; a USD 14 M AFRL contract (Jun 2024) funds a moving-object tracking cluster [9]. Spire is also an NRO SCE RF provider alongside HawkEye 360 and Umbra [3].

### 2.4 Unseenlabs

Maritime-first, single-satellite RF geolocation; 150 kg next-gen spacecraft from 2026 extending to land (satphones, jammers) and space; target customers include insurers, shipowners, offshore energy and fisheries enforcement in addition to navies [10][11]. EUR 85 M Series C (Feb 2024), EUR 120 M total [11]. Public claim: sub-kilometre accuracy, near-real-time delivery, interoperability with other EO systems [10]. Unseenlabs is the closest European comparable for a Greek operator and the one most likely to compete for EDF/EUSPA work.

### 2.5 Pricing and packaging patterns across the market

| Model | Who uses it | Typical unit | Notes |
|---|---|---|---|
| AOI subscription (DaaS) | HawkEye RAS, Kleos Guardian LOCATE, Unseenlabs | USD/EUR per month or year per AOI, tiered by AOI size and revisit | Lowest friction; shareable; the core of commercial revenue |
| Tasked collection | HawkEye IQ tasking, Spire | Per collection or per tasking-hours block | Sold to governments; raw IQ plus toolkit |
| Analytics subscription | HawkEye Mission Space knowledge products, Windward | Per seat / per AOI | Highest margin; depends on fusion with AIS, imagery |
| Dedicated / sovereign capacity (MaaS) | Kleos MaaS, HawkEye sovereign model, Unseenlabs | % of cluster capacity, exclusivity premium, in-country ground station | Where the user's project could differentiate (sovereign Greek/EU cluster) |
| Government framework / IDIQ | NRO SCE → CRFCA (no contract-value cap) [3][4]; NGA Luno A/B (USD 490 M combined ceiling, delivery orders USD 3.5–24.4 M) [15] | Task orders | The US model; NATO/EU equivalents are emerging |
| FMS bundle | India USD 131 M [14] | Hardware-free data + software + training | Shows governments will buy data services through defence-sales channels |

**Delivery formats observed**: GeoJSON (HawkEye) [13], JSON with confidence ellipses (Kleos) [8], REST APIs, dashboards; HawkEye's 2019 RFGeo update added vessel MMSI matching [14]. None of the commercial operators publicly advertises native STANAG 4676 (NATO ISR tracking) or STANAG 4607 (GMTI) output; NATO ISR interoperability work (e.g., MAJIIC, AGS) relies on STANAG 4559/NSILI libraries and 4676 tracks [44], so a NATO-facing service should plan to export tracks in 4676 and expose a 4559-compatible catalogue — a gap in the current commercial offer (general knowledge; see Section 8).

---

## 3. Customer landscape and procurement

### 3.1 United States

- **NRO** is the dominant buyer. It ran SCE BAA study contracts for RF from 2019/2022 (six RF companies selected Sep 2022), extended HawkEye 360 by 23 months in Dec 2025 with a focus on US European Command needs, and in Aug 2026 awarded HawkEye 360 the first **Commercial RF Capabilities Augmentation (CRFCA)** operational contract, "without a contract-value cap", managed by the Commercial Systems Program Office for national security, civil and humanitarian missions [3][4]. The next SCE round moves to a Commercial Solutions Opening with a rolling five-year window covering EO, radar, RF, hyperspectral and LIDAR [3].
- **NGA** buys *analytics*, not raw collections, through Luno A/B (USD 490 M combined ceiling, five-year IDIQs; six delivery orders worth USD 70.8 M by Jul 2025 to BlackSky, Ursa, Maxar, NV5, Electromagnetic Systems) [15]. An RF-derived "activity change" analytic is a natural Luno-style product.
- **Services**: Army (overhead RF for the Army; Sep 2026 USD 196 M in terrestrial ES/SIGINT sensors to Heaviside and Research Innovations [21]), Navy/NIWC (USD 5.8 M Pacific RF monitoring [30]), AFRL (Spire USD 14 M [9]). SOCOM is a known buyer of commercial RF but no public contract value was found.
- **Civil**: NOAA used HawkEye for the GOES DCS interference case [31].

### 3.2 NATO

NATO's **Alliance Persistent Surveillance from Space (APSS)** and its **Aquila** virtual constellation pool national and commercial assets; NCIA implements with ACO and states the shift "from owning assets ... to contracting services from industry" [26][37]. NCIA has issued a market opportunity for "access to commercial ISR data, services and products from space" [36]. Entry points for a new operator are: NCIA framework contracts, participation in APSS via a national contribution (Greece is a participant in allied "virtual constellation" arrangements per [25]), and ACT experimentation.

### 3.3 European Union

- **EUSPA** issued an RFI (deadline 27 Feb 2025) on *Space-Based GNSS RFI Monitoring Services and Systems* in two independent parts: Part A a full service, Part B payloads/hosting on EU constellations; bands Galileo E1/E5a/E5b/E6 and GPS L1/L2/L5; questions on update rate, time-to-localise-and-notify, single- vs multi-satellite geolocation, jamming vs spoofing discrimination, classified handling and National Security Authority clearances, and earliest availability "Q2 2025 or 2026" [16]. This is the single most relevant European demand signal for the user's project.
- **EDA / EDF**: EDF-2022-DA-SPACE-ISR ("Innovative multi-sensor space-based EO capabilities towards persistent and reactive ISR") targets an affordable smallsat constellation with ground segment, lists SIGINT among eligible sectors, requires consortia from EU/associated states, and funds CONOPS studies through prototyping [27]. EDA and ESA signed an EO-for-defence cooperation in April 2026 (per search listing; details not fetched).
- **Frontex** (EUROSUR Fusion Services, Copernicus border surveillance) [38] and **EMSA** (CleanSeaNet, IMS) are established buyers of satellite-derived maritime layers; Frontex has already bought RF from HawkEye 360 [30].
- **EU SST / Govsatcom / IRIS²**: potential hosting routes for an RF payload (EUSPA RFI Part B) [16].

### 3.4 National MoDs and the Eastern Mediterranean context

- **Greece**: Hellas Space 2.0 (EUR 350 M, announced Aug 2026, Ministry of Digital Governance / General Secretariat of Telecommunications and Post with ESA; RRF-funded) covers VHR optical, thermal, data integration and workforce, with tenders through late 2026–2027; it does *not* name SIGINT/RF [24]. The national posture pairs Open Cosmos optical microsats (Hyperion GR-1 launched Jul 2026), ICEYE Hellas SAR assembly in Athens, a Planetek Hellas geospatial hub, HAI facility upgrades, and participation in an allied virtual constellation; priority missions are maritime movements, sanctions evasion, wildfires and floods, and the author recommends a joint tasking board including defence [25]. An RF layer is the obvious missing modality; the Hellenic MoD / HNDGS is a plausible anchor customer for Aegean, Eastern Mediterranean and Black Sea approaches, while KSAT already operates a ground site at **Nemea** in the Peloponnese [33].
- **Cyprus** publishes EDF SSA calls through its national funding portal (search listing), indicating interest in space security topics.
- **Gulf**: the UAE Armed Forces are alleged (not confirmed by HawkEye) to be a "strong" HawkEye customer [30]; HawkEye's Oct 2026 USD 36 M award set spans the Middle East [21].
- **Japan** is HawkEye's largest non-US market at 16% of revenue [1].

### 3.5 Commercial, regulatory and NGO customers

- **Maritime intelligence platforms** (Windward, Kpler, Lloyd's List Intelligence) are both competitors for the analytic layer and channel partners for an RF source layer; Windward's jamming features demonstrate demand [19].
- **Insurers / P&I clubs**, shipowners, offshore energy: named by Unseenlabs as growth segments [10][11].
- **Satellite operators**: the GOES case [31] and Kratos's satID/Monics terrestrial geolocation line (TDMA VSAT interference geolocation, 2017) [34] show the existing toolset; Kratos and HawkEye announced a spectrum detection/geolocation collaboration as early as May 2017 [35]. For the user's satellite-operations background: space-based detection of uplink interferers (C/Ku/Ka VSAT, GEO uplinks) is a niche where a LEO RF constellation sees the *uplink* that GEO geolocation systems struggle with when only one satellite is affected.
- **Regulators** (ITU-R spectrum monitoring, national NRAs) and **MNOs**: spectrum-occupancy products (Aurora Insight heritage) [14].
- **NGOs**: Global Fishing Watch-style IUU work (HawkEye has presented RF for sustainability [search listing]); Galápagos case [7].

### 3.6 Legal / regulatory angle for a Greek-based operator

- **EU dual-use export control** (Regulation (EU) 2021/821 recast) classifies many SIGINT receivers, direction-finding and signal-analysis equipment under Category 5 Part 1 and related entries; a space-RF *service* (data) is less constrained than the hardware, but delivery of raw IQ, emitter libraries and tasking rights to non-EU customers requires licensing analysis. HawkEye's ">200 export licences" [2] shows the administrative load. (General knowledge; verify entries with the Greek Ministry of Development export authority.)
- **National security law**: operation of a SIGINT-capable payload by a private Greek entity will require coordination with the Hellenic MoD / National Intelligence Service and a legal basis for collection over foreign territory; the EUSPA RFI's questions on NSA clearances [16] indicate that EU buyers will expect facility and personnel clearances (NATO SECRET / EU SECRET handling).
- **ITU filings** for the downlink and any uplink; passive reception itself requires no ITU filing.
- **Data protection**: interception of content is out of scope; metadata/geolocation of communications emitters may still engage GDPR and national law when emitters can be tied to individuals.

---

## 4. Ground segment architecture of space-RF services

### 4.1 Ground station networks

| Provider | Relevant facts | Source |
|---|---|---|
| KSAT / KSATlite | 20+ sites incl. Svalbard (78°N; 14/14 orbits for SSO), Troll (Antarctica), Tromsø, Vardø, Nuuk, Inuvik, Fairbanks, Punta Arenas, Hartebeesthoek, Mauritius, Singapore, Dubai, **Nemea (Greece)**, Puertollano, Awarua, Tokyo, Jeju, Hawaii, Panama; S-band up 2025–2110 MHz, S down 2200–2300 MHz, X down 8000–8400 MHz, Ka down 25.5–27 GHz; per-pass pricing with dedicated-antenna option | [33] |
| AWS Ground Station | On-demand or reserved (12-month monthly commitment) antenna-minute billing; narrowband <40 MHz vs wideband ≥40 MHz; no list prices on the page | [32] |
| Leaf Space | European smallsat network (Italy) built for low-latency smallsat passes | search listing |

**Pass and latency arithmetic.** A sun-synchronous satellite at ~500–550 km completes ~15 orbits/day. One polar site (Svalbard or Troll) sees essentially every orbit (~14–15 contacts/day); a mid-latitude site such as Nemea (37.8°N) sees ~4–6 contacts/day. With a polar site, worst-case data age at downlink is ~one orbit (~95 min); with only a mid-latitude national site it is up to ~8–10 hours for collections on the far side of the Earth. HawkEye's statement that latency is "hours" today and "minutes" with direct downlink, crosslinks and onboard processing [2] matches this geometry. An X-band downlink at 8000–8400 MHz with a 3.7 m KSATlite dish typically supports tens to a few hundred Mbit/s (the KSATlite sheet does not state rates); a 10-minute pass at 100 Mbit/s moves ~7.5 GB, enough for several minutes of multi-channel IQ or hours of PDW/detection products. This forces the on-board detection vs raw-IQ trade covered in document 02.

### 4.2 Cloud and processing

- US operators process in commercial and government clouds; HawkEye's platform is "vetted for operations within classified enclaves" [2]; Spire offers "sovereign-ready" deployments [9]; Kleos offered customer-premises/cloud geolocation processing [8].
- European MoDs "favour keeping data processing, system integration and security controls within European borders", which is why HawkEye set up HawkEye 360 Europe S.à r.l. in Luxembourg (Sep 2026) for "localised data management", with Leonardo (sovereign RF capability integration) and ERA (fusion of space RF with ground passive emitter tracking) as partners [23].
- For a Greek operator: EU sovereign cloud (e.g., national data centre, GAIA-X-aligned providers, or an accredited on-premises enclave) is a selling point; the EUSPA RFI's classified-handling questions [16] mean a classified processing enclave will be needed for government tiers.

### 4.3 Data pipeline (as practised by the operators)

```
Satellite:  tasking window → tune/record (IQ or on-board detection/PDW) → store
Downlink:   next contact (polar site: ≤1 orbit; national site: hours) → ground station → cloud ingest
Level 0→1:  IQ → channelisation → detection (energy/cyclostationary/match) → pulse/burst descriptors (PDW: TOA, f, PW, PRI, BW, modulation hints, power)
Level 1→2:  cross-satellite association → TDOA/FDOA solve → geolocation + confidence ellipse (CEP/EEP) + terrain adjust
Level 2→3:  emitter identification against library → platform association (MMSI/ADS-B/known site) → track formation over passes
Level 3→4:  catalogue update (new emitter, parametric drift, mode change) → pattern-of-life model → anomaly/alert
Delivery:   GeoJSON/JSON API, dashboard, STANAG 4676 export, alert feed; archive query
```

HawkEye's public description ("collection over a tasking window, downlink on the next pass, processing and classification, characterisation, delivery; outputs frequency, bandwidth, modulation hints, duty cycle, confidence-bounded location") [29] and Kleos's product fields (frequency, time, lat/lon/ECEF, confidence ellipse) [8] confirm this layering. The GOES case shows the catalogue stage at work: a 1.9 s, 1.5 kHz emitter with co-channel neighbours was isolated by repeated collections [31].

### 4.4 Tasking workflow

Inputs: AOI polygon, frequency plan (bands/channels, bandwidths), revisit/priority, collection window, product level (IQ vs detections vs geolocations), classification and release caveats. Kleos quantified the constraint that matters: ~9 minutes of VHF collection per orbit per satellite [8]. HawkEye distinguishes *fixed monitoring* (standing AOIs), *reserved* and *on-demand* tasking [2]. A collection manager deconflicts competing AOIs across the constellation, and the system must predict passes/geometry (cluster baseline vs AOI) to estimate expected CEP before accepting a task.

### 4.5 Integration with other ISR

- RF→SAR/EO cueing: HawkEye–BlackSky RF data sharing (2019), HawkEye–Airbus strategic partnership and the Galápagos RF+SAR collection [7], Galwan RF→imagery [14], Spire's "trigger third-party imagery" button [9]. For the Eastern Mediterranean, ICEYE Hellas SAR [25] is the natural local partner.
- Fusion with AIS/ADS-B: HawkEye's MMSI matching [14]; Windward's AIS-based jamming analytics [19]; ADS-B-based GNSS interference maps (EASA, gpsjam) [18].
- Ground passive sensors: HawkEye–ERA (passive emitter tracking) [23] — a model for integrating with Hellenic Air Force passive surveillance.

### 4.6 Human roles

- **Collection manager**: translates customer AOIs and priorities into a constellation collection deck; manages conflicts and capacity (the scarce "minutes per orbit").
- **RF/ELINT analyst**: validates detections, resolves ambiguous geolocations, writes assessments (the Ukraine jamming report was analyst-produced [6]).
- **EW database manager**: owns the emitter catalogue, maturity levels, de-confliction with national/NATO libraries.
- **Mission operations**: spacecraft health, formation keeping, downlink scheduling.
- **Product/API engineering and security officer** (facility clearance, accreditation).
HawkEye notes training and services can compress margins if under-scoped [2] — the analyst layer is a real cost.

---

## 5. EW databases and signature catalogues

### 5.1 What national libraries contain

The US **Electronic Warfare Integrated Reprogramming Database (EWIRDB)**, managed by DIA, is "the primary DoD-approved source for technical parametric and performance data" on non-communications emitters. It merges NSA's **KILTING** national technical ELINT parametric database, multi-source S&T assessments of foreign emitters, and US emitter data from service EW support agencies via the USNCSDB; fourteen offices at ten organisations contribute, and updates were historically released on a quarterly cycle [28]. NATO maintains an analogous NATO Emitter Database (NEDB/EWDB) fed by nations (general knowledge). Key concepts:

- **ELNOT / ENOT**: ELINT notation — a short code uniquely identifying a non-communications emitter type (radar) or a communications emitter respectively; the join key between collections and the library (general knowledge).
- **Parametric data**: RF (centre, agility set, bandwidth), PRI (value, stagger/jitter patterns), pulse width, scan type and period, antenna beamwidths, polarisation, intra-pulse modulation (chirp, phase codes), power, mode-dependent variations; for communications emitters: channelisation, modulation, burst structure, hopping pattern, network ID fields.
- **Platform association**: which ships, aircraft, SAM systems, vehicles carry the emitter; the EWIRDB is used to build threat **mission libraries** for RWR/ESM reprogramming [28].

### 5.2 What a commercial space-RF catalogue contains

HawkEye describes a "growing unclassified emitter database" built from five years of unclassified collection and "over one billion data points" used to train and validate algorithms [1][2]. Its Signal-of-Interest library lists signal *classes* (GMRS/FRS PTT, VHF marine, EPIRB, cellular, satphone, X-band radar, Ku VSAT, GNSS jammers) [30]. The commercial catalogue therefore sits one level above the national library: it is a **library of signal classes and of geolocated emitter instances with history**, not a validated parametric ELINT database. That is what makes it exportable and unclassified.

### 5.3 Proposed data model (synthesis for this project)

| Entity | Key fields | Notes |
|---|---|---|
| Signal class | class ID, band, bandwidth, modulation family, burst/duty statistics, detection recipe, confidence thresholds | Unclassified, maps to ENOT/ELNOT only in a classified annex |
| Detection | time, satellite(s), frequency, bandwidth, SNR, PDW set or burst descriptor, raw-IQ pointer | Level 1 |
| Geolocation | lat/lon/alt, error ellipse (semi-major/minor/orientation, CEP), method (TDOA/FDOA/AOA/multi-pass), geometry quality (GDOP), terrain-adjusted flag | Level 2 |
| Emitter instance | emitter ID, class, best-estimate position, position history, parametric drift history, first/last seen, platform association (MMSI, ICAO24, site ID), **maturity level** | Level 3 — the catalogue |
| Track | ordered geolocations for a moving emitter, kinematic estimate, STANAG 4676 export | Level 3 |
| Pattern-of-life | activity histograms by hour/day, typical dwell, co-occurrence with other emitters, baseline statistics per AOI | Level 4 |
| Alert | rule or model, trigger evidence, severity, customer release caveat | Level 4 |

**Maturity / confidence levels** (adapted from EW-library practice): *Candidate* (single pass, one class match) → *Provisional* (≥3 independent geolocations consistent within ellipse) → *Confirmed* (corroborated by imagery, AIS/ADS-B or customer ground truth) → *Characterised* (stable parametric set, platform assigned) → *Archived*. Each transition is logged for auditability, which government customers expect.

**De-confliction and change detection**: new detections are gated against the catalogue (position within k·ellipse, class match, parametric distance); non-matches create candidates; matches with parametric drift (new PRI mode, frequency shift) flag *mode change*; emitters not seen for N expected observation opportunities flag *dormant*. This is how the GOES hunt isolated a 1.5 kHz emitter among co-channel neighbours [31].

**Pattern-of-life and anomaly analytics**: baseline the AOI (per class, per cell, per hour-of-week); flag departures (new radar on a previously quiet island, GNSS jammer activation near a port, surge in UHF PTT in a training area), as HawkEye did with jamming north of Chernobyl in Nov 2021–Feb 2022 [6] and RF activity in Galwan 2020 [14]. The CYGNSS study is a useful reference for the statistics: a z-score detector against a rolling quiet baseline with streak confirmation, with reliability rising from 86% (N=1) to 100% (N=3) [17].

**Feeding national libraries**: commercial geolocations and parametric observations can be *contributed* to NATO/national EW databases as low-classification source records; the reverse flow (library→commercial) is normally blocked. A Greek operator should design the catalogue so a classified annex can hold ELNOT mappings and national platform associations without changing the unclassified core.

---

## 6. Operational concept: one satellite to a constellation (user's viewpoint)

### 6.1 Revisit and dwell arithmetic (500–550 km, ~97° SSO, mid-latitude AOI such as Athens 38°N)

- A single satellite yields ~4–6 passes/day over a mid-latitude point if all passes above ~10° elevation are counted (footprint radius ~1,800–2,000 km at 10° elevation; HawkEye quotes >1 million km² per pass [2]). Useful RF geometry (emitter within ~1,000 km ground range for acceptable geolocation) reduces this to roughly **2–4 useful passes/day**, clustered in the morning and evening for an SSO, each giving **~5–10 minutes** of visibility, of which a few minutes are "dwell" on any specific AOI. Kleos's "9 min per orbit, ~70 min/day per satellite" of collection [8] is the practical capacity figure.
- Gaps between useful passes at mid-latitudes are therefore ~1.5 h (consecutive orbits) and ~10–12 h (morning vs evening groups).
- The independent CYGNSS study (±40°, 7 satellites in a single inclined plane) measured median revisit on hotspots of 23 h (N=1) → 1 h 49 min (N=7) and detection latency 3 h 46 min → 48 min [17]. The largest marginal gain was from 1 to 3 satellites.
- HawkEye 360 claims a **global revisit under 45 minutes** with >30 satellites in 13 clusters across multiple planes [1][2][40]; Kleos claimed daily revisit of any AOI with 3–4 clusters [8].

### 6.2 What each stage delivers

| Stage | Satellites | What the customer gets | Geolocation | Revisit (mid-lat AOI) | Comparable |
|---|---|---|---|---|---|
| Single satellite | 1 | Snapshot detection and characterisation; spectrum occupancy; GNSS jammer presence maps; emitter catalogue seeding; **coarse geolocation** by single-sat FDOA/Doppler over the pass (needs tens of seconds of signal), AOA if an interferometric antenna is flown, or **multi-pass accumulation** for fixed emitters | ~5–30 km single pass for burst signals; km-class after several passes for persistent emitters (ships: Unseenlabs claims sub-km with monosatellites [10]) | 2–4 useful passes/day, ~10–12 h worst gap | Unseenlabs BRO; HawkEye spectrum sats |
| 3-sat cluster (formation, ~100–500 km baselines) | 3 | Instantaneous TDOA/FDOA fixes on single bursts; confidence ellipses; dark-vessel correlation; air-defence radar order-of-battle | Hundreds of metres to few km depending on bandwidth, SNR, duration, geometry [29]; "within 500 m" best-case marketing [30]; GNSS spoofers km-class [5] | Same pass count as 1 sat (cluster moves together) | HawkEye Pathfinder/Cluster-N; Kleos 4-sat cluster |
| 3 clusters / 3 planes | 9 | Morning/evening gap filled; several fixes/day on the same emitter → tracks, pattern-of-life; alerting within hours | As above, plus track-smoothed accuracy | ~3–6 h typical gap; daily revisit anywhere | Kleos at 3 clusters; HawkEye 2021 |
| 7–10 clusters, multiple planes | 20–30 | Sub-hour revisit at mid-latitudes; near-persistent monitoring of chokepoints; cueing of SAR/EO within the same hour; near-real-time GNSS-interference alerts with polar downlink or crosslinks | Cluster-level; density of fixes improves emitter position via averaging | <1 h (HawkEye: <45 min global claim [1]) | HawkEye 360 today |

### 6.3 Service tiers mapped to stages

- **Stage 1 (IOC, one satellite)**: sell *monitoring*, not *geolocation*: GNSS-interference presence/intensity maps per pass, spectrum occupancy by band, radar-presence indicators, catalogue seeding for a national EW database, and demonstrations for EUSPA/EDF. Price as AOI subscription with daily cadence (HawkEye's 2020 RAS model [13]).
- **Stage 2 (first cluster)**: add geolocation products with ellipses, dark-vessel correlation with AIS, GNSS jammer/spoofer positions; qualify for EUSPA service Part A [16] and national MoD air-defence monitoring (HawkEye's EUR/USD 75 M-class contracts [22]).
- **Stage 3 (three clusters)**: pattern-of-life and alerting; STANAG 4676 tracks for NATO; Luno-style analytics.
- **Stage 4 (20–30 satellites)**: persistence SLAs, tactical latency tiers, sovereign dedicated-capacity sales.

---

## 7. UI/UX of existing operational consoles (reference for a demo UI)

Public descriptions and demos converge on a common set of components. The table lists what each reference system is known for; feature descriptions are from public materials and product pages (not from authenticated sessions).

| System | Known UI features relevant to space RF | Source / status |
|---|---|---|
| HawkEye 360 Mission Space | Single-view map of worldwide RF activity; trend/pattern views; drill-down to signal details (frequency, bandwidth, duty cycle, confidence ellipse); summary of overall RF activity per AOI; maritime join of vessel identity, history, sanctions flags and behaviours to RF geolocations; API and dashboard delivery | [12][29] |
| HawkEye 360 RFGeo / RAS | GeoJSON layers for GIS ingestion; archive search; MMSI matching | [13][14] |
| Kleos Guardian LOCATE | JSON detections with ellipses via REST; AOI-based subscription management; customer platform with order registration | [8] |
| Spire RF GEOINT | Emitter tracking over time; AI transcripts of unencrypted voice; "trigger imagery" action; sovereign deployment | [9] |
| Unseenlabs portal | Maritime RF detections with vessel correlation; near-real-time delivery; interoperability with EO | [10] |
| Windward | AIS-centric vessel intelligence; GPS-jamming suppression of false ship-to-ship meetings; planned near-real-time jamming map distinguishing denial vs injection zones, hourly updates; AOI jamming alerts; imagery tasking | [19] |
| EASA / gpsjam-style maps | Hex-cell daily maps of GNSS degradation from ADS-B NAC/NIC; FIR rankings | [18] |
| Military COPs: TAK/ATAK, Systematic SitaWare, Palantir Gotham | Layered map with military symbology (APP-6), CoT/JSON feeds, time slider, alerts, chat/tasking; SitaWare consumes STANAG tracks; Gotham offers object-centric investigation graphs and timelines | General knowledge |
| Kratos satID / Monics | Spectrum monitoring: waterfall and carrier-list views, interference events, geolocation of VSAT uplinks on a map with error ellipses, TDMA network geolocation | [34] |
| ArcGIS-based dashboards (NGA/NATO common) | Operations Dashboard with map, time slider, indicators, filters; Feature Services for GeoJSON ingestion | General knowledge |

**Feature set a credible demo UI should include** (derived from the above):

1. **Map with emitter layers** by signal class and band (UHF/L/S/C/X), **confidence ellipses**, clustering, heat/density mode, basemap toggle (satellite/nautical/aeronautical), APP-6 symbology option.
2. **Timeline / scrubber** with pass markers; playback of detections per pass; pattern-of-life histograms per selected cell/emitter.
3. **Spectrum view**: per-pass waterfall / occupancy strip for the selected AOI; click-to-filter the map by frequency.
4. **AOI tasking**: draw polygon, choose bands, cadence, product level; see **pass prediction** (next contacts, expected geometry/CEP, dwell minutes) and capacity impact.
5. **Alerts**: rule builder (new emitter in AOI, GNSS jammer active, radar mode change, dark vessel with radar on), delivery to email/API/COP.
6. **Catalogue browser**: emitter instances with maturity level, parametric history, platform association, linked detections, export.
7. **Fusion overlays**: AIS/ADS-B tracks, SAR/EO footprints, cue-imagery button.
8. **Export**: GeoJSON, CSV, KML, STANAG 4676 (tracks), report PDF; API keys.
9. **Governance**: classification banners, release caveats, audit log — a requirement for MoD demos.

---

## 8. KPIs and SLAs customers ask for

| KPI / requirement | What the market quotes | Comment for this project |
|---|---|---|
| Geolocation accuracy | HawkEye: "few hundred m to few km", "within 500 m" best case [29][30]; GNSS spoofers km-class [5]; Kleos ≤300 m best case [8]; Unseenlabs sub-km (ships) [10]; EUSPA asks explicitly about jammer/spoofer localisation accuracy and single- vs multi-sat capability [16] | Quote CEP/EEP with the conditions (signal bandwidth, duration, SNR, geometry) and publish predicted CEP in the tasking UI |
| Time to detect / latency | Today hours; HawkEye target minutes→seconds [2]; EUSPA asks for time-to-localise-and-notify and NRT feasibility [16]; Windward hourly jamming map [19] | Tiering: NRT (<1 h with polar downlink/crosslink), standard (<6 h), archive |
| Revisit | HawkEye <45 min global (30+ sats) [1]; Kleos daily (3–4 clusters) [8]; CYGNSS 1 h 49 min with 7 sats at ±40° [17] | Publish revisit by latitude band and constellation stage (Section 6) |
| Probability of detection / false-alarm rate | Rarely published; CYGNSS study explicitly defers FAR [17] | Government customers will ask; define Pd/FAR per signal class from calibration campaigns |
| Availability / coverage | Service availability, AOI coverage %, capacity minutes per day (Kleos ~70 min/sat/day [8]) | SLA on fulfilled tasking minutes |
| Data formats / APIs | GeoJSON/JSON REST [8][13]; NATO ISR expects STANAG 4676 tracks, 4559/NSILI catalogue, 4607 for GMTI-like products [44] | Offer GeoJSON + OGC API Features + 4676 export |
| Security accreditation | Classified-enclave vetting [2]; sovereign/in-country processing [9][23]; NSA clearances per EUSPA RFI [16] | Plan NATO SECRET / EU SECRET facility; EU sovereign cloud |
| Data rights / exclusivity | EULA-shared vs exclusive tasking with unrestricted rights at a premium [2][8] | Define tiers early; sovereign cluster option |
| ITAR-free / export | HawkEye >200 export licences [2] | An EU-sourced payload chain is a competitive feature for EU/NATO non-US customers |
| Training and support | Included in FMS bundles [14]; a margin risk [2] | Budget analyst training and onboarding |

---

## Sources

[1] Asymmetrix Intelligence, "$118m revenue satellite data provider HawkEye 360 files for IPO" (Apr 2026) — https://asymmetrixintelligence.substack.com/p/118m-revenue-satellite-data-provider
[2] HawkEye 360 Inc., Form S-1/A, SEC EDGAR (2026) — https://www.sec.gov/Archives/edgar/data/1750704/000162828026027299/hawkeye360-sx1a.htm
[3] Breaking Defense, "NRO extends contracts for 4 providers, readies new acquisition approach" (Dec 2025) — https://breakingdefense.com/2025/12/nro-extends-contracts-for-4-providers-readies-new-acquisition-approach/
[4] Military & Aerospace Electronics, "NRO moves commercial RF sensing into operational augmentation" (20 Aug 2026) — https://www.militaryaerospace.com/rf-analog/article/55399280/nro-moves-commercial-rf-sensing-into-operational-augmentation
[5] Inside GNSS, "HawkEye 360 Launches Advanced GNSS Interference Detection Capabilities" (29 Jul 2025) — https://insidegnss.com/hawkeye-360-launches-advanced-gnss-interference-detection-capabilities-to-enhance-defense-and-intelligence-operations/
[6] Geospatial World, "HawkEye 360 detects GPS jamming along Ukraine border prior to Russian invasion" (Mar 2022) — https://geospatialworld.net/blogs/hawkeye-360-detects-gps-jamming-along-ukraine-border-prior-to-russian-invasion
[7] Seapower Magazine, "HawkEye 360 Satellite System Tracked Chinese Activity near Galapagos" (Oct 2020) — https://seapowermagazine.org/hawkeye-360-satellite-system-tracked-chinese-activity-near-galapagos/?print=pdf
[8] Kleos Space, Company/Product Brochure (6 Feb 2023) — https://kleos.space/wp-content/uploads/2023/02/20230206-Kleos-Brochure.pdf
[9] SatNow, "Spire Launches New Space-Based Radio Frequency Intelligence Capabilities for Defense and Security" (28 Jul 2025) — https://www.satnow.com/news/details/3662-spire-launches-new-space-based-radio-frequency-intelligence-capabilities-for-defense-and-security
[10] Unseenlabs, "Next-Generation Satellite Constellation for 2026" (30 Apr 2024) — https://unseenlabs.com/en/news/next-gen-2026/
[11] Offshore Source, "Unseenlabs announces a record-breaking fundraising of €85 million" (Feb 2024) — https://offshoresource.com/news/finance/unseenlabs-announces-a-record-breaking-fundraising-of-85-million-2/
[12] Military Embedded Systems, "Automated geospatial RF data collection enabled through Mission Space platform" (Feb 2021) — https://militaryembedded.com/radar-ew/rf-and-microwave/automated-geospatial-rf-data-collection-enabled-through-mission-space-platform
[13] SmallSat News, "HawkEye 360 now delivering daily Regional Awareness Subscription service" (28 Jul 2020) — https://smallsatnews.com/2020/07/28/hawkeye-360-now-delivering-daily-regional-awareness-subscription-service/
[14] Wikipedia, "HawkEye 360" (accessed 21 Oct 2026) — https://en.wikipedia.org/wiki/HawkEye_360
[15] NGA, "NGA announces new Luno A and Luno B delivery orders" (2 Jul 2025) — https://www.nga.mil/assets/files/25-10_Release_Luno_A_B_Update.pdf
[16] EUSPA, "Request for Information on Space-Based GNSS Radio Frequency Interference Monitoring Services and Systems" (deadline 27 Feb 2025) — https://www.euspa.europa.eu/sites/default/files/documents/Request%20for%20Information%20on%20Space%20based%20RFI%20monitoring%20service.pdf
[17] arXiv 2606.14056, "Space-Based GNSS Radio Frequency Interference Detection Evaluation Through Multi-Satellite Data Integration" (2026) — https://arxiv.org/pdf/2606.14056
[18] AeroXplorer, "GPS Jamming Is Now a Daily Airline Problem" (Oct 2026) — https://aeroxplorer.com/articles/gps-jamming-is-now-a-daily-airline-problem-here-is-how-bad-it-has-gotten.php
[19] Windward, "Introducing Windward's GPS Jamming Resilience" (25 Jun 2026) — https://windward.ai/blog/introducing-windwards-gps-jamming-resilience/
[20] Shipping Telegraph, "Mapping GNSS interference on shipping: From the Black Sea to the Gulf" (2025) — https://shippingtelegraph.com/shipping-reports/mapping-gnss-interference-on-shipping-from-the-black-sea-to-the-gulf/
[21] The Defense Post, "HawkEye 360 signals intelligence deals" (19 Oct 2026) — https://thedefensepost.com/2026/10/19/hawkeye360-signals-intelligence-deals/
[22] PR Newswire via StreetInsider, "HawkEye 360 Expands Partnership with European Ministry of Defense Clients" (2 Mar 2026) — https://www.streetinsider.com/PRNewswire/HawkEye+360+Expands+Partnership+with+European+Ministry+of+Defense+Clients/26088144.html
[23] SatNews, "HawkEye 360 executes three-part European strategy to establish in-region RF intelligence operations" (15 Sep 2026) — https://satnews.com/2026/09/15/hawkeye-360-executes-three-part-european-strategy-to-establish-in-region-rf-intelligence-operations/
[24] SatNews, "Greece unveils €350 million Hellas Space 2.0 national space programme" (3 Aug 2026) — http://satnews.com/2026/08/03/greece-unveils-e350-million-hellas-space-2-0-national-space-programme/
[25] To Vima / ELIAMEP, "Greece's Space Posture and Path to Data Autonomy" (Nov 2025) — https://www.tovima.com/opinions/greeces-space-posture-and-path-to-data-autonomy/amp/
[26] NCIA, "Space" (technology and innovation page) — https://www.ncia.nato.int/about-us/technology-and-innovation/space
[27] Grantbite, "EDF-2022-DA-SPACE-ISR: Innovative multi-sensor space-based Earth observation capabilities towards persistent and reactive ISR" — https://www.grantbite.com/en/funding/edf-space-isr-defence-funding-capabilities
[28] GlobalSecurity.org, "Electronic Warfare Integrated Reprogramming Database (EWIRDB)" — https://www.globalsecurity.org/intell/systems/ewirdb.htm
[29] Hubble, "How HawkEye 360 Finds RF Signals from Space" — https://hubble.com/community/guides/how-hawkeye-360-finds-rf-signals-from-space/
[30] Jack Poulson, "Lockheed is now tracking phones and walkie-talkies from space..." (Oct 2023) — https://jackpoulson.substack.com/p/lockheed-is-now-tracking-phones-and
[31] Military & Aerospace Electronics, "HawkEye 360 uses space-based RF to locate NOAA transmitter" (31 Jul 2026) — https://www.militaryaerospace.com/sensors/news/55394690/hawkeye-360-uses-space-based-rf-to-locate-noaa-transmitter
[32] AWS, "AWS Ground Station Pricing" — https://aws.amazon.com/ground-station/pricing/
[33] KSAT, "KSATlite Network Overview" (PDF) — https://www.ksat.no/globalassets/ksat/ksatlite/ksatlite-network-overview.pdf
[34] Kratos, "satID 3.20 product release offers TDMA network geolocation to combat VSAT interference" (2017) — https://www.kratosdefense.com/newsroom/kratos-satid-3-20-product-release-offers-industrys-only-tdma-network-geolocation-capability-to-combat-vsat-interference
[35] Via Satellite, "Kratos, HawkEye 360 Collaborate on Spectrum Detection, Geolocation Services" (8 May 2017) — https://www.satellitetoday.com/connectivity/2017/05/08/kratos-hawkeye-360-collaborate-spectrum-detection-geolocation-services/
[36] UK DBT export opportunity, "NATO – Access to commercial ISR data, services and products from space" — https://www.great.gov.uk/export-opportunities/opportunities/nato-access-to-commercial-isr-data-services-and-products-from-space
[37] Defense News, "New NATO initiative to bolster alliance's space-based data collection" (13 Feb 2023) — https://www.defensenews.com/global/europe/2023/02/13/new-nato-initiative-to-bolster-alliances-space-based-data-collection/
[38] Frontex, "Frontex to implement border surveillance services as part of Copernicus" — https://frontex.europa.eu/media-centre/news/news-release/frontex-to-implement-border-surveillance-services-as-part-of-copernicus-Z1r4A0
[39] KeepTrack, "Space Brief 7 Oct 2026 — HawkEye 360 RF sats detect other satellites" — https://keeptrack.space/space-brief/space-brief-2026-10-07
[40] SpaceMart, "HawkEye 360 boosts RF coverage with new Cluster 13 satellites" — https://spacemart.com/hawkeye-360-boosts-rf-coverage-with-new-cluster-13-satellites-999/
[41] Via Satellite, "HawkEye 360 Plans to Have 60 Satellites on Orbit By 2025" (5 Oct 2022) — https://www.satellitetoday.com/imagery-and-sensing/2022/10/05/hawkeye-360-plans-to-have-60-satellites-on-orbit-by-2025/
[42] HawkEye 360, "Arctic Brief" (Aug 2022, Ted Stevens Center) — https://tedstevensarcticcenter.org/wp-content/uploads/2022/08/HawkEye-360-Arctic-Brief.pdf
[43] GPS World, "HawkEye 360 tech reveals early GPS interference in Ukraine" (2022) — https://www.gpsworld.com/hawkeye-360-tech-reveals-early-gps-interference-in-ukraine/
[44] MITRE, "NATO ISR interoperability / STANAG 4676, 4607, 4559 (MAJIIC)" — https://www.mitre.org/sites/default/files/pdf/05_0164.pdf

*Not retrievable during this session: the Manila Times mirror of the Unseenlabs second-generation press release (8 Jul 2026) was refused by the fetch proxy (rate-limited); Unseenlabs' own site [10] was used instead. Pricing pages of AWS Ground Station [32] and KSATlite [33] do not publish list prices.*
