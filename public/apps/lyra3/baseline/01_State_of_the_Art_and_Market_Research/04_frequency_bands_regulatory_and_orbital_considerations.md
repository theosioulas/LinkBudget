# Target Spectrum, ITU Regulations & Orbital Plane Trade-Offs

## 1. Comprehensive Target Frequency Band Breakdown (UHF to X-Band)

Spaceborne SIGINT requires broadband monitoring capability across multiple military, civil, and dual-use spectral allocations. The table below delineates the five primary target bands, operational emitter classes, typical signal modulations, and their strategic intelligence value.

```
+---------------------------------------------------------------------------------------------------------------+
|                                    TARGET SPECTRUM BREAKDOWN & EW VALUE                                       |
+---------------------------------------------------------------------------------------------------------------+
|  Band        | Frequency Range  | Representative Emitters            | Signal Types & Modulation              |
|--------------|------------------|------------------------------------|----------------------------------------|
|  UHF         | 300 – 1000 MHz   | Combat Net Radios (CNR), MilSatCom | Narrowband FM, FSK, Frequency Hopping  |
|              |                  | UAV Telemetry, Air Traffic Control | Fast burst, DAMA / TDMA, Spread Spectr |
|--------------|------------------|------------------------------------|----------------------------------------|
|  L-band      | 1.0 – 2.0 GHz    | GNSS Jamming/Spoofing (L1/L2/L5),  | DSSS, BPSK/QPSK, High-power CW/Noise   |
|              |                  | Link-16 (960–1215 MHz), IFF, SATCOM| MSK Fast-hop (77k hops/s), Pulse pairs |
|--------------|------------------|------------------------------------|----------------------------------------|
|  S-band      | 2.0 – 4.0 GHz    | Naval Air Search Radars, Air Base  | Chirped pulses (LFM), Barker codes,    |
|              |                  | Radars, Tactical UAS Video Links   | High-order QAM, OFDM Datalinks         |
|--------------|------------------|------------------------------------|----------------------------------------|
|  C-band      | 4.0 – 8.0 GHz    | SAM Target Acquisition Radars,     | High-power pulsed RF, Pulse-Doppler,   |
|              |                  | Battlefield Surveillance Radars    | Staggered PRI, Frequency agility       |
|--------------|------------------|------------------------------------|----------------------------------------|
|  X-band      | 8.0 – 12.0 GHz   | Airborne Fire Control (AESA/PESA), | Sub-microsecond pulses, Monopulse,     |
|              |                  | Naval Surface Search, Missile Seek | Phase-coded LPI (Low Prob of Intercept)|
+---------------------------------------------------------------------------------------------------------------+
```

### 1.1 Detailed Emitter Profiles & Tactical Value

1. **UHF (300 MHz – 1 GHz)**:
   - *Target Emitters*: Military tactical tactical VHF/UHF tactical radios (PRC-117, VHF/UHF ground tactical communications), unmanned aerial vehicle (UAV) command links (e.g., 433 MHz, 915 MHz ISM and military bands), and MilSatCom uplink spillover (UHF Follow-On / Mobile User Objective System).
   - *EW & Intelligence Value*: Identifies troop concentrations, command post setups, forward operating base activations, and tactical coordination networks.
   - *Propagation & Hardware Challenge*: Long wavelengths ($\lambda = 30\text{ cm to } 1.0\text{ m}$) dictate that spaceborne antennas must be electrically large or deployable to achieve acceptable directivity and gain. Significant ionospheric Faraday rotation requires dual-orthogonal receiver polarization.

2. **L-band (1.0 GHz – 2.0 GHz)**:
   - *Target Emitters*:
     - **GNSS Denial**: GPS (1575.42 MHz L1, 1227.60 MHz L2, 1176.45 MHz L5), GLONASS, and Galileo jammers (broadband barrage noise, sweep CW, chirp jammers, and coordinated spoofers).
     - **Tactical Datalinks**: NATO Link-16 (969–1206 MHz, 51 frequencies, 77,000 hops per second, MSK modulation), Tactical Targeting Network Technology (TTNT), and Identification Friend or Foe (IFF / SSR at 1030/1090 MHz).
     - **Satellite Uplinks**: Inmarsat, Iridium, and Thuraya satphone handsets.
   - *EW Value*: Maps electronic warfare denial zones; detects battlefield spoofing front-lines; uncovers hostile attempts to blind precision-guided munitions (PGMs).

3. **S-band (2.0 GHz – 4.0 GHz)**:
   - *Target Emitters*: Naval 3D volume air search radars (e.g., Russian Fregat/Top Pair, Chinese Type 382/346 S-band elements, US AN/SPS-48/49), coastal defense radars, air surveillance radars, and long-range UAS C2 video uplinks (e.g., 2.3–2.5 GHz).
   - *EW Value*: Provides over-the-horizon naval order of battle (NOB); establishes warship presence and operational mode (search vs. tracking) outside coastal line-of-sight.

4. **C-band (4.0 GHz – 8.0 GHz)**:
   - *Target Emitters*: Integrated Air Defense System (IADS) target acquisition and early-warning radars (e.g., Russian 9S18 Kupol / 9S15 Bill Board for S-300V, Chinese JY-series, Patriot AN/MPQ-53/65 C-band multifunction radar).
   - *EW Value*: Alerts to the mobilization, deployment, or repositioning of strategic Surface-to-Air Missile (SAM) battalions prior to strike package ingress.

5. **X-band (8.0 GHz – 12.0 GHz)**:
   - *Target Emitters*: Airborne fighter fire-control radars (e.g., Su-35 Irbis-E, J-20 AESA, F-16 APG-68/83), missile guidance illumination radars (e.g., 9S32 Grill Pan), anti-ship cruise missile (ASCM) active radar seekers, and commercial/naval marine navigation radars (9.3–9.5 GHz).
   - *EW Value*: Indicates active targeting, weapons engagement zones, airborne interceptor combat air patrols (CAP), and dark vessel maritime traffic navigating without AIS.

---

## 2. ITU Radio Regulations & Frequency Licensing Framework

### 2.1 Passive Reception vs. Active Transmission
A fundamental principle of the International Telecommunication Union (ITU) Radio Regulations (RR) is that **passive radio reception does not transmit electromagnetic energy into space and therefore does not require an international frequency allocation or coordination under RR Article 9/11 for intercept operations**.
- The satellite payload listens passively across sovereign territories from international orbital space.
- *However*, the **downlink transmitters (telemetry, payload data downlink, inter-satellite links)** and **uplink receivers (command/telecommand)** are strictly regulated and legally bound to ITU frequency allocations, national spectrum licensing, and orbital slot coordination.

```
+-----------------------------------------------------------------------------------+
|                        REGULATORY DOMAIN DECOUPLING                               |
+-----------------------------------------------------------------------------------+
|  [PASSIVE RECEPTION / SIGINT PAYLOAD]                                             |
|    - UHF, L, S, C, X-band passive reception                                       |
|    - NO ITU frequency allocation filing required for listening                    |
|    - Complies with non-interference principles                                    |
|                                                                                   |
|  [ACTIVE COMMUNICATIONS & TT&C / DOWNLINK]                                        |
|    - S-band TT&C (Uplink: 2025–2110 MHz; Downlink: 2200–2290 MHz)                |
|    - X-band Payload Downlink (8025–8400 MHz, Earth Exploration-Satellite Service) |
|    - Ka-band High-Rate Downlink (25.5–27.0 GHz, EESS / Space Research)            |
|    - Optical Inter-Satellite Links (1550 nm laser — unregulated by ITU RR)        |
|    - REQUIRES: ITU Radio Regulations Appendix 4 Filing + National Admin Approval  |
+-----------------------------------------------------------------------------------+
```

### 2.2 Spacecraft Telemetry, Tracking & Command (TT&C) Allocations
1. **S-Band TT&C (Space Operation Service)**:
   - Uplink (Earth-to-space): **2025 – 2110 MHz**
   - Downlink (space-to-Earth): **2200 – 2290 MHz**
   - *Power Flux Density (PFD) Limits*: Must strictly adhere to ITU RR Article 21 PFD limits on the Earth’s surface to protect co-primary terrestrial fixed and mobile networks:
     $$\text{PFD} \le -154\text{ dBW/m}^2\text{ in any 4 kHz band for } \delta \le 5^\circ$$
2. **X-Band Payload Data Downlink (EESS / Space Research)**:
   - Downlink: **8025 – 8400 MHz** (allocations under ITU RR Article 5.464).
   - *Data Rate Capability*: 100 Mbps to 800 Mbps using DVB-S2X modulation (QPSK/8PSK) into 3.0-meter ground station dishes (e.g., KSAT Svalbard, Punta Arenas).
3. **Ka-Band High-Rate Downlink**:
   - Downlink: **25.5 – 27.0 GHz** (up to 2 Gbps using 16APSK / 32APSK modulation).
4. **Optical Inter-Satellite Links (O-ISL)**:
   - Operating at 1550 nm (telecom C-band infrared). Currently exempt from ITU spectrum filing procedures, providing secure, unjammed crosslinks with zero regulatory overhead.

---

## 3. Orbital Mechanics, Constellation Architecture & Revisit Trade-Offs

The constellation architecture determines the trade-off between **global revisit time**, **regional persistence**, **cluster baseline geometry for TDOA/FDOA**, and **launch deployment cost**.

### 3.1 Orbital Inclination Regimes

```
                                  LEO ORBITAL REGIMES
        +---------------------------------------------------------------------+
        |                                                                     |
     97.5° SSO (Polar)                                     45°–55° Mid-Inclination
  +-----------------------+                             +-----------------------+
  | - Global coverage     |                             | - Concentrated revisit|
  | - Consistent solar    |                             |   over 15°N to 50°N   |
  |   beta angle          |                             |   (Taiwan, Mideast,   |
  | - Ideal for Arctic,   |                             |   Ukraine, Littorals) |
  |   high-latitude naval |                             | - Higher revisit rate |
  | - Transporter ride-   |                             |   in contested zones  |
  |   shares readily avail|                             | - Lower revisit at    |
  |                       |                             |   poles (> 55° N/S)   |
  +-----------------------+                             +-----------------------+
```

| Parameter | Sun-Synchronous Orbit (SSO, 97.5°) | Mid-Inclination Orbit (MIO, 45°–53°) | Hybrid Constellation (Phase 2) |
| :--- | :--- | :--- | :--- |
| **Operational Altitude** | 550–600 km | 550–600 km | 550–600 km |
| **Target Latitude Focus** | Global (Poles to Equator) | 55°S to 55°N (Temperate crisis zones) | Global + Densified 30°–50°N belt |
| **Daily Revisit (1 Satellite)**| ~2 passes/day per target | ~4–6 passes/day per mid-lat target | Combined |
| **Launch Accessibility**| High (SpaceX Transporter ~quarterly)| Medium (Dedicated or ISS-inclination) | High (Mixed manifests) |
| **Solar Power Consistency**| High (Dawn-Dusk or constant beta) | Variable beta angle ($\beta \in [-75^\circ, 75^\circ]$)| Mixed (requires robust battery sizing)|

### 3.2 Walker Constellation Scaling & Revisit Analysis

To progress from a single pathfinder to an operational theater-persistent constellation, a **Walker-Delta** or **Walker-Star** configuration is employed:
$$\text{Notation: } T / P / F \text{ at inclination } i$$
where $T$ is total number of satellites, $P$ is number of orbital planes, and $F$ is relative phasing parameter ($0 \le F \le P-1$).

#### Progressive Constellation Phasing Roadmap

```
Phase 1: Initial Orbital Capability (IOC)
  - 1 Satellite (Pathfinder / Calibration)
  - Orbit: 550 km SSO (97.5°)
  - Mission: RF signature library collection, single-sat Doppler/AOA calibration, payload validation.
  - Revisit: 12–14 hours globally.

Phase 2: Triplet Cluster Baseline (TDOA/FDOA Demonstration)
  - 3 Satellites flying in formation (15–80 km baselines)
  - Orbit: 1 plane, 550 km, 45° inclination.
  - Mission: Instantaneous high-precision TDOA/FDOA geolocation (< 300 m CEP).
  - Revisit: 4–6 hours over key operational theaters (30°N–50°N).

Phase 3: Operational Constellation (FOC - Full Operational Capability)
  - 12 to 24 Satellites deployed across 4 to 6 orbital planes.
  - Example Walker-Delta: 12 / 4 / 1 at 50° inclination + 6 / 2 / 1 at SSO (Total 18 satellites).
  - Mission: Continuous persistence, sub-30-minute revisit over contested crisis zones, real-time crosslink cueing.
```

### 3.3 Target Revisit Time vs. Constellation Scale

| Constellation Scale | Architecture | Mean Revisit Time (Global) | Mean Revisit Time (Taiwan / Mediterranean / Black Sea) | Geolocation Capability |
| :--- | :--- | :--- | :--- | :--- |
| **1 Satellite** | Single SSO | ~12 hours | ~10 hours | Single-Sat Doppler Rate + Phase AOA (~1.5–3 km) |
| **3 Satellites** | 1 Plane Triplet Cluster | ~10 hours | ~4 hours | 3-Sat Instantaneous TDOA/FDOA (100–500 m) |
| **6 Satellites** | 2 Planes (1 SSO, 1 MIO) | ~5 hours | ~2 hours | Instantaneous TDOA/FDOA (100–300 m) |
| **12 Satellites** | 4 Planes (3 Sats per plane)| ~2.5 hours | **< 45 minutes** | Instantaneous TDOA/FDOA + Multi-INT cueing |
| **24 Satellites** | 6 Planes (4 Sats per plane)| **< 60 minutes** | **< 18 minutes** | Near-real-time tactical tracking & EW updates |
