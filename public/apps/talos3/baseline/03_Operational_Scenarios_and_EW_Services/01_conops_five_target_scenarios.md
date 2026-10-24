# Operational Scenarios & CONOPS for Five Key Target Types

**Document ID**: `SIGINT-OPS-CONOPS-001`  
**Classification**: Unclassified / Technical Baseline  
**Target Platform**: 100–150 kg ESPA-Class LEO Spaceborne SIGINT Spacecraft & Distributed Constellation  
**Constellation Orbit**: 500–600 km Low Earth Orbit (SSO & 45°–50° Mid-Inclination)  
**Payload Coverage**: 30 MHz to 12.0 GHz (VHF, UHF, L-band, S-band, C-band, X-band)  

---

## Executive Summary

This document establishes the operational Concept of Operations (CONOPS), collection mechanics, spaceborne intercept geometry, signal processing workflows, and Electronic Warfare (EW) database update architectures for five foundational target classes:
1. **Maritime AIS & Coastal/Naval Surveillance Radars** (X-band navigation, S-band air surveillance, dark vessel tracking)
2. **GNSS Spoofing & High-Power Barrage/Chirp Jamming Complexes** (L-band L1, L2, L5 denial and electronic order of battle mapping)
3. **Tactical Unmanned Aerial Systems (UAS) Command & Control (C2) and Video Telemetry** (UHF and C-band datalinks, kinematic GCS-versus-drone discrimination)
4. **Airborne Early Warning & Control (AEW&C) and Ground-Based Air Defense (GBAD) Radars** (S-band/X-band phased-array sweeps, sidelobe intercept, agile de-interleaving)
5. **Tactical Military Communications & Push-to-Talk (PTT) Radios** (VHF/UHF fast frequency-hopping nets, SINCGARS/HAVE QUICK, RF fingerprinting / SEI)

For each target class, this report defines the exact emitter RF parameters, orbital intercept link budgets, onboard hardware execution (FPGA/GPU edge extraction), constellation cross-cueing, and ground exploitation protocols.

---

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    LEO SPACEBORNE SIGINT MULTI-TARGET CONOPS OVERVIEW                                   |
+-------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                         |
|             LEO Constellation Cluster (Altitude: 550 km, Velocity: 7.56 km/s, Baselines: 25-100 km)                     |
|                                                                                                                         |
|                   [Sat 1: Master] <====== Optical ISL ======> [Sat 2: Slave A] <====== Optical ISL ======> [Sat 3: Slave B] |
|                         \                                          |                                          /         |
|                          \                                         |                                         /          |
|                           \                                        |                                        /           |
|  Target 1: Maritime        \       Target 2: GNSS Jammer           |        Target 4: GBAD Radar           / Target 5:  |
|  - AIS (162 MHz)            \      - L1/L2 Barrage/Chirp          /         - S/X-Band Phased Array       /  Tactical   |
|  - X-Band Nav Radar (9.4 GHz)\     - 10 W to 5 kW Complexes      /          - Mainlobe & Sidelobes       /   Comms     |
|  - Dark Vessel Tracking       \    - Area Denial Mapping        /           - De-Interleaving & EOB     /  - VHF/UHF    |
|                                \                               /                                       /   - FHSS Net   |
|                                 v                             v                                       v    - SEI Match  |
|                       +-------------------------------------------------------------------------------+                 |
|                       |                         TERRESTRIAL THEATER OF OPERATIONS                     |                 |
|                       |                                                                               |                 |
|                       |   [Ship / Dark Vessel]      [Strategic Jammer]     [SAM Battery]     [Soldier PTT]    |         |
|                       |   X-Band Pulse (9.4 GHz)    L-band Sweep (1.5 GHz) S-band (3.0 GHz)  VHF Hop (40 MHz) |         |
|                       +-------------------------------------------------------------------------------+                 |
|                                                                                                                         |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 1. Target Scenario 1: Maritime AIS & Coastal/Naval Surveillance Radar

### 1.1 Target Profile & Electromagnetic Characteristics

Maritime surveillance from Low Earth Orbit demands simultaneous observation of cooperative tracking transponders and uncooperative radar emissions to isolate illicit maritime actors.

#### 1. Automatic Identification System (AIS)
- **Carrier Frequencies**: 
  - AIS 1: $161.975\text{ MHz}$ (Maritime Channel 87B)
  - AIS 2: $162.025\text{ MHz}$ (Maritime Channel 88B)
- **Modulation & Protocol**: Gaussian Minimum Shift Keying (GMSK, bandwidth-time product $BT = 0.4$), data rate $9,600\text{ bps}$, NRZI encoded, 25 kHz channel bandwidth.
- **Access Scheme**: Self-Organized Time Division Multiple Access (SOTDMA). The standard 60-second frame is partitioned into 2,250 time slots ($26.67\text{ ms}$ per slot, 256 bits per burst).
- **Transmit Power & Antenna**:
  - Class A (Commercial vessels $>300\text{ GT}$ and passenger ships): $12.5\text{ W}$ ($+41\text{ dBm}$) or $1\text{ W}$ ($+30\text{ dBm}$) into a vertical omnidirectional monopole ($0\text{--}3\text{ dBi}$ gain), yielding $\text{EIRP} \approx +41\text{ to }+44\text{ dBm}$ ($12.5\text{--}25\text{ W}$).
  - Class B (Recreational and small commercial craft): $2.0\text{ W}$ ($+33\text{ dBm}$) CSTDMA/SOTDMA into $0\text{ dBi}$ antenna ($\text{EIRP} \approx +33\text{ dBm}$).

#### 2. X-band Marine Navigation Radars
- **Carrier Frequency**: $9.30\text{ to }9.50\text{ GHz}$ (nominal international marine radionavigation center: $9.410\text{ GHz} \pm 30\text{ MHz}$).
- **Transmitter Architecture**: Traditional magnetron tube oscillators (pulsed CW) or modern solid-state pulsed-compression transmitters (GaN/GaAs Linear Frequency Modulation [LFM] chirp).
- **Pulse Width ($\tau$)**:
  - Short Pulse ($SP$): $0.05\text{ to }0.08\,\mu\text{s}$ ($50\text{--}80\text{ ns}$), utilized in harbor and close-in navigation for sub-15 meter range resolution.
  - Medium Pulse ($MP$): $0.25\text{ to }0.40\,\mu\text{s}$ ($250\text{--}400\text{ ns}$).
  - Long Pulse ($LP$): $0.80\text{ to }1.20\,\mu\text{s}$ ($800\text{--}1200\text{ ns}$), used in open-sea navigation for maximum detection range.
- **Pulse Repetition Frequency (PRF)**: $500\text{ to }3,200\text{ Hz}$ (often staggered or jittered to eliminate blind ranges and second-time-around clutter).
- **Peak Transmit Power & EIRP**:
  - Magnetron systems: $4.0\text{ kW to }25.0\text{ kW}$ peak power ($+66\text{ to }+74\text{ dBm}$).
  - Slotted waveguide array antenna: Horizontal beamwidth $\theta_{az} \approx 0.8^\circ\text{ to }1.9^\circ$, vertical beamwidth $\theta_{el} \approx 20^\circ\text{ to }25^\circ$, bore-sight gain $G_t \approx +28\text{ to }+32\text{ dBi}$.
  - Resulting Peak EIRP: $\text{EIRP}_{peak} = P_{peak} + G_t \approx +94\text{ to }+106\text{ dBm}$ ($2.5\text{ kW to }40\text{ MW}$ equivalent isotropic peak power).
- **Antenna Scanning Profile**: Continuous mechanical $360^\circ$ azimuthal rotation at $20\text{ to }48\text{ RPM}$ ($1.25\text{ to }3.0\text{ seconds}$ rotation period).

#### 3. S-band Coastal / Naval Surveillance Radars
- **Carrier Frequency**: $2.90\text{ to }3.10\text{ GHz}$ (ITU maritime radiolocation).
- **Peak Power & EIRP**: $30.0\text{ kW to }250.0\text{ kW}$ peak, antenna gain $32\text{ to }38\text{ dBi}$, yielding $\text{EIRP}_{peak} \approx +107\text{ to }+122\text{ dBm}$ ($50\text{ kW to }1.6\text{ GW}$ peak).
- **Pulse Modulations**: Staggered PRF ($400\text{--}1,200\text{ Hz}$), chirp bandwidths $5\text{ to }20\text{ MHz}$.

---

### 1.2 Spaceborne Intercept Geometry & Link Budget

At an orbital altitude $h = 550\text{ km}$, the spacecraft field of view extends to a maximum slant range $R_{max} \approx 2,150\text{ km}$ at a minimum elevation angle $\epsilon = 10^\circ$, covering an instantaneous ground footprint diameter of $\sim 4,800\text{ km}$.

```
                  Satellite Orbit (h = 550 km, vs = 7.56 km/s)
                               [ SATELLITE ]
                               /     |     \
                             /       |       \
                           /         |         \
           Slant Range R /           | Nadir     \ R_max (10 deg elev)
                       /             |             \
                     /               |               \
                   v                 v                 v
            +------------+     +-----------+     +------------+
            | Emitter A  |     | Emitter B |     | Emitter C  |
            | (Zenith)   |     | (Mid-Swath|     | (Horizon)  |
            +------------+     +-----------+     +------------+
            Slant R: 550 km    Slant: 900 km     Slant: 2,150 km
            FSPL (9.4 GHz):    FSPL: 171.0 dB    FSPL: 178.6 dB
            166.7 dB
```

#### X-band Radar Intercept Link Calculation (at $f = 9.41\text{ GHz}$, $\lambda = 3.19\text{ cm}$)
1. **Free-Space Path Loss (FSPL)**:
   $$\text{FSPL} = 20\log_{10}\left(\frac{4\pi R}{\lambda}\right) = 20\log_{10}(R_{\text{km}}) + 20\log_{10}(f_{\text{MHz}}) + 32.44$$
   - At Sub-satellite Zenith ($R = 550\text{ km}$): $\text{FSPL} = 166.72\text{ dB}$.
   - At Mid-Swath ($R = 1,000\text{ km}$): $\text{FSPL} = 171.91\text{ dB}$.
   - At Maximum Tactical Horizon ($R = 2,150\text{ km}$): $\text{FSPL} = 178.57\text{ dB}$.

2. **Mainlobe Intercept Signal-to-Noise Ratio (SNR)**:
   Assume magnetron radar $P_t = 12\text{ kW}$ ($+70.8\text{ dBm}$), $G_t = +30.0\text{ dBi}$, satellite deployable reflector antenna $G_r = +24.0\text{ dBi}$, receiver RF losses $L_s = 2.0\text{ dB}$, intermediate frequency (IF) filter bandwidth $B = 20\text{ MHz}$, and system noise figure $NF = 3.5\text{ dB}$.
   Thermal noise floor:
   $$P_n = -174\text{ dBm/Hz} + 10\log_{10}(20 \times 10^6) + 3.5\text{ dB} = -97.5\text{ dBm}$$
   Received peak power at mid-swath ($R = 1,000\text{ km}$):
   $$P_r = +70.8\text{ dBm} + 30.0\text{ dBi} + 24.0\text{ dBi} - 171.91\text{ dB} - 2.0\text{ dB} = -49.11\text{ dBm}$$
   $$\text{SNR}_{peak} = P_r - P_n = -49.11\text{ dBm} - (-97.5\text{ dBm}) = +48.39\text{ dB}$$
   *Design Insight*: The mainlobe illuminates the LEO receiver with overwhelming power, requiring fast digital step attenuators (DSA, $0\text{--}31.5\text{ dB}$ range) to avoid ADC saturation.

3. **Sidelobe Intercept Feasibility**:
   When the rotating radar beam points away from the satellite, backlobes and isotropic sidelobes ($G_{t, side} \approx -5\text{ to }0\text{ dBi}$) illuminate the spacecraft continuously:
   $$P_{r, side} = +70.8\text{ dBm} + 0.0\text{ dBi} + 24.0\text{ dBi} - 171.91\text{ dB} - 2.0\text{ dB} = -79.11\text{ dBm}$$
   $$\text{SNR}_{sidelobe} = -79.11\text{ dBm} - (-97.5\text{ dBm}) = +18.39\text{ dB}$$
   *Crucial Operational Conclusion*: The spaceborne payload intercepts the radar continuously throughout the entire $8\text{--}10\text{ minute}$ orbital overflight, not merely during the brief mainlobe flash!

---

### 1.3 Collection CONOPS & Dark Vessel Detection Workflow

A core strategic mission is detecting **"Dark Vessels"**—ships that deliberately disable their AIS transponders to conduct illicit activities (e.g., sanction-busting ship-to-ship crude oil transfers, IUU fishing in Exclusive Economic Zones, or clandestine naval maneuvers).

```
+---------------------------------------------------------------------------------------------------------------+
|                                DARK VESSEL DETECTION & CROSS-CUEING CONOPS                                    |
+---------------------------------------------------------------------------------------------------------------+
|                                                                                                               |
|  [STAGE 1: PASSIVE RF ACQUISITION]                                                                            |
|  LEO SIGINT Cluster overflies maritime theater (e.g., South China Sea / Persian Gulf).                         |
|  - Payload Receiver A: Ingests VHF AIS Channel 87B/88B (Decollision & message decoding).                      |
|  - Payload Receiver B: Intercepts pulsed X-band (9.4 GHz) & S-band (3.0 GHz) marine radar emissions.           |
|                                         |                                                                     |
|                                         v                                                                     |
|  [STAGE 2: ONBOARD EDGE COMPUTING & GEOLOCATION]                                                              |
|  - AIS Receiver decodes 2,400+ vessel MMSI IDs, GPS coordinates, and SOTDMA timestamps.                      |
|  - Multi-Satellite TDOA/FDOA solver computes radar emitter coordinates to CEP_50 <= 250 m.                    |
|                                         |                                                                     |
|                                         v                                                                     |
|  [STAGE 3: AUTOMATED SPATIAL-TEMPORAL RECONCILIATION]                                                         |
|  Spatial matching query executed between radar fixes and decoded AIS positions:                               |
|                                                                                                               |
|      Δr = || r_radar - r_AIS ||                                                                               |
|                                                                                                               |
|      IF min(Δr) > Threshold (3.0 km)  -->  TRIGGER "HIGH-CONFIDENCE DARK VESSEL ALERT"                        |
|                                         |                                                                     |
|                                         v                                                                     |
|  [STAGE 4: SPECIFIC EMITTER IDENTIFICATION (SEI)]                                                             |
|  - Magnetron turn-on frequency chirp (df/dt), RF harmonic decay, and pulse jitter matched                     |
|    against historical Maritime RF Emitter Library.                                                            |
|  - Re-identifies true vessel identity despite disabled AIS or painted-over hull markings.                    |
|                                         |                                                                     |
|                                         v                                                                     |
|  [STAGE 5: TACTICAL CROSS-CUEING (M2M TASKING)]                                                               |
|  - Automated tasking dispatch sent via O-ISL or tactical downlink to commercial SAR constellation             |
|    (e.g., Capella, ICEYE) to capture 0.5m Spotlight SAR imagery of dark vessel fix within 25 minutes.          |
|                                                                                                               |
+---------------------------------------------------------------------------------------------------------------+
```

#### Detailed Procedural Execution:
1. **AIS Decollision Engine**:
   In dense choke points (Strait of Malacca, English Channel), over 2,000 ships transmit simultaneously within the satellite's $4,800\text{ km}$ footprint. Packet collision destroys up to $70\%$ of standard transmissions. The satellite payload employs **Successive Interference Cancellation (SIC)**:
   - Signals are digitized at $10\text{ MSPS}$ across $161.9\text{--}162.1\text{ MHz}$.
   - The strongest packet is demodulated, re-modulated locally, scaled, and subtracted from the digital buffer.
   - The process iterates 4–6 times, recovering collided packets down to $-15\text{ dB}$ carrier-to-interference ratio ($C/I$), boosting message reception probability to $>92\%$.
2. **Reconciliation Logic**:
   Every geolocated radar emitter is correlated against the decoded AIS track database. If a radar emitter exhibits a valid maritime surface Doppler profile but has no corresponding AIS transponder broadcast within a $3.0\text{ km}$ spatial uncertainty boundary over a 15-minute observation window, it is classified as a **Dark Target of Interest (DTOI)**.

---

### 1.4 Onboard vs. Ground Processing Allocation

| Processing Subtask | Allocated Segment | Hardware Execution | Latency / Output |
| :--- | :--- | :--- | :--- |
| **AIS Packet Demodulation & Decollision** | Onboard Satellite | Xilinx Kintex UltraScale+ FPGA (SIC Engine) | Real-time ($< 50\text{ ms}$ per burst); outputs decoded JSON AIS messages. |
| **Radar Pulse Detection & PDW Generation** | Onboard Satellite | AMD Versal AI Core (Polyphase Filter Bank + CFAR) | Real-time ($< 10\text{ ns}$ timestamping); outputs 64-byte PDW records. |
| **Pulse De-Interleaving & PRI Sorting** | Onboard Satellite | Multi-core ARM Cortex-A72 / Versal AI Engines | $< 500\text{ ms}$; groups pulse trains into distinct radar tracks. |
| **Cluster TDOA/FDOA Geolocation** | Onboard Master Sat (or Tactical Ground) | Nvidia Jetson Orin Space / Ground Server | $< 3.5\text{ s}$ onboard via O-ISL data sharing; $< 1.0\text{ s}$ on ground. |
| **SEI Magnetron Fingerprint Matching** | Ground EW Center | High-performance GPU cluster with deep neural net | $< 30\text{ s}$; matches intra-pulse RF features against 500,000+ emitter library. |
| **Dark Vessel Database Ingestion** | Ground / C2 Cloud | PostgreSQL / PostGIS Spatial Database | Persistent storage; feeds Maritime Domain Awareness (MDA) COP. |

---

## 2. Target Scenario 2: GNSS Spoofing & High-Power Jamming

### 2.1 Target Profile & Electromagnetic Characteristics

Hostile electronic warfare units deploy ground-based and airborne jamming systems to neutralize GPS, Galileo, and BeiDou signals, disrupting precision-guided munitions (PGMs), commercial aviation, and tactical units.

#### 1. Target Frequency Allocations
- **GPS L1 / Galileo E1 / BeiDou B1C**: $1575.42\text{ MHz}$ (Bandwidth: $2.046\text{ MHz}$ C/A, $20.46\text{ MHz}$ P(Y)/M-code).
- **GPS L2**: $1227.60\text{ MHz}$ (Bandwidth: $20.46\text{ MHz}$).
- **GPS L5 / Galileo E5a**: $1176.45\text{ MHz}$ (Bandwidth: $20.46\text{ MHz}$).
- **GLONASS G1 / G2**: $1598.0625\text{--}1605.375\text{ MHz}$ and $1242.9375\text{--}1248.625\text{ MHz}$ (FDMA).

#### 2. Jamming & Spoofing Waveform Taxonomies
- **Broadband Barrage Noise**: Gaussian white noise filtered to $20\text{--}40\text{ MHz}$ bandwidth centered on L1/L2. Completely swamps spread-spectrum correlation gain.
- **Swept-CW (Chirp) Jamming**: High-power continuous wave swept linearly or through a sawtooth profile across $\pm 10\text{ MHz}$ around L1/L2 at sweep frequencies of $10\text{ to }100\text{ kHz}$. Creates repeating cross-correlation spikes in GNSS tracking loops, inducing cycle slips.
- **Pulsed Jamming**: High-power RF pulses ($10\text{--}50\,\mu\text{s}$ width, $10\text{--}50\%\text{ duty cycle}$) designed to saturate GNSS receiver front-end LNAs and trigger automatic gain control (AGC) pumping.
- **Coordinated Spoofer Complexes**: Transmit authentic-structured pseudo-random noise (PRN) codes synchronized to false ephemeris and clock states. Typically operate $+3\text{ to }+10\text{ dB}$ above true satellite signals to "capture" the victim receiver's tracking loops and drag its computed position hundreds of kilometers away (e.g., toward hostile airbases or hazardous reefs).

#### 3. Emitter Power Classes & Operational Capabilities
- **Class I: Personal Privacy Devices (PPDs)**: $10\text{ to }500\text{ mW}$ RF output ($+10\text{ to }+27\text{ dBm}$ EIRP). Portable, vehicle-plug-in jammers. Disruption radius: $0.5\text{ to }3\text{ km}$.
- **Class II: Tactical Mobile Jammers**: $10\text{ to }100\text{ W}$ RF output ($+40\text{ to }+50\text{ dBm}$). E.g., R-330Zh Zhitel, Borisoglebsk-2 tactical modules. Deployed on high-mobility trucks with collinear mast antennas ($G_t \approx +6\text{ to }+10\text{ dBi}$). $\text{EIRP} \approx +46\text{ to }+60\text{ dBm}$ ($40\text{ W to }1\text{ kW}$). Denial radius: $25\text{ to }60\text{ km}$ against airborne GPS receivers.
- **Class III: Strategic High-Power EW Complexes**: $1.0\text{ kW to }10.0\text{ kW}$ continuous RF power ($+60\text{ to }+70\text{ dBm}$). E.g., Pole-21, Krasukha-4, Murmansk-BN. Sectoral horn or high-gain phased arrays ($G_t \approx +15\text{ to }+22\text{ dBi}$). $\text{EIRP} \approx +75\text{ to }+92\text{ dBm}$ ($30\text{ kW to }1.5\text{ MW}$). Area denial radius: $150\text{ to }350\text{ km}$.

---

### 2.2 The Spaceborne LEO Intercept Paradox

Terrestrial GNSS receivers struggle against jammers because authentic GNSS satellites orbit in Medium Earth Orbit (MEO, altitude $\approx 20,200\text{ km}$), delivering an infinitesimal signal to the Earth's surface of $-130\text{ dBm}$ ($-160\text{ dBW}$).

In stark contrast, a LEO SIGINT satellite at $550\text{ km}$ altitude experiences the **LEO Intercept Advantage**:

```
+---------------------------------------------------------------------------------------------------+
|                            THE LEO GNSS JAMMER INTERCEPT ADVANTAGE                                 |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|   MEO GPS Satellite (20,200 km)                       LEO SIGINT Satellite (550 km)               |
|            |                                                         ^                            |
|            | FSPL = 182.5 dB                                         | FSPL = 151.2 dB            |
|            |                                                         | (31.3 dB LOWER LOSS!)      |
|            v                                                         |                            |
|     +--------------+                                          +--------------+                    |
|     | Ground GPS   | <========= Jammer Line of Sight ======== | Tactical EW  |                    |
|     | Receiver     |       High Interference (+60 dB J/S)     | Jammer (100W)|                    |
|     +--------------+                                          +--------------+                    |
|     Received GPS: -130 dBm                                    Jammer EIRP: +56 dBm                |
|     Jammer Power: -70 dBm                                     Received at LEO: -85.2 dBm          |
|     RESULT: GPS BLINDED!                                      RESULT: SNR at LEO = +15.8 dB!      |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

#### Quantitative Link Comparison:
1. **Free-Space Path Loss to LEO ($h = 550\text{ km}$, $f = 1575.42\text{ MHz}$)**:
   $$\text{FSPL}_{\text{LEO}} = 20\log_{10}(550) + 20\log_{10}(1575.42) + 32.44 = 151.20\text{ dB}$$
2. **Received Power at LEO Satellite**:
   For a tactical $100\text{ W}$ jammer ($\text{EIRP} = +56\text{ dBm}$), satellite deployable helical antenna gain $G_r = +12.0\text{ dBi}$, receiver losses $L_s = 2.0\text{ dB}$:
   $$P_r = +56.0\text{ dBm} - 151.20\text{ dB} + 12.0\text{ dBi} - 2.0\text{ dB} = -85.20\text{ dBm}$$
3. **Receiver Noise in 20 MHz GNSS Bandwidth**:
   $$P_n = -174\text{ dBm/Hz} + 10\log_{10}(20 \times 10^6) + 3.0\text{ dB (NF)} = -98.0\text{ dBm}$$
4. **Signal-to-Noise Ratio at Satellite**:
   $$\text{SNR}_{\text{LEO}} = -85.20\text{ dBm} - (-98.0\text{ dBm}) = +12.80\text{ dB}$$
   *Strategic Assessment*: A jammer capable of blinding a theater on the ground presents an unmistakable, high-SNR beacon to a LEO SIGINT constellation. For strategic $5\text{ kW}$ complexes ($\text{EIRP} \approx +85\text{ dBm}$), the received $\text{SNR} > +40\text{ dB}$.

---

### 2.3 Collection CONOPS & EW Cataloguing

1. **Spectrum Monitoring & Sweeper Mode**:
   The L-band digital tuner continuously channelizes the $1150\text{--}1610\text{ MHz}$ swath using an FPGA 4,096-point Polyphase Filter Bank (PFB). Energy threshold detectors continuously audit the total spectral power density.
2. **Jammer Detection & Characterization**:
   When power in any GNSS sub-band exceeds the baseline thermal noise threshold by $>6\text{ dB}$, an interrupt triggers the burst-capture buffer. The FPGA executes:
   - Waveform categorization (Gaussian noise, swept-chirp slope $\alpha = \frac{\Delta f}{\Delta t}$, or pseudo-PRN spoofing sequences).
   - Instantaneous spectral occupancy mapping.
3. **Constellation TDOA/FDOA Geolocation**:
   A 3-satellite cluster captures time-tagged raw IQ data over a synchronized $50\text{ ms}$ window via optical crosslink coordination. The Cross-Ambiguity Function (CAF) resolves the emitter's terrestrial coordinates to $\text{CEP}_{50} \le 100\text{--}250\text{ meters}$.
4. **Dynamic EW Database Ingestion**:
   The geolocated jammer is automatically added to the global Electronic Order of Battle (EOB). The EW database issues:
   - Dynamic **GNSS Denial Footprint Polygons** (projected jammer boundary based on radiated power, antenna height, and digital elevation models).
   - Automated NOTAM alerts for civil aviation and strike flight-path deconfliction.

---

## 3. Target Scenario 3: Tactical UAS Command & Control (C2) and Video Telemetry

### 3.1 Target Profile & Electromagnetic Characteristics

Tactical and operational Unmanned Aerial Systems (UAS / Drones) rely on robust bidirectionally linked datalinks for flight control, waypoint reprogramming, and high-definition sensor video streaming.

```
+---------------------------------------------------------------------------------------------------------------+
|                            UAS TACTICAL DATALINK OPERATIONAL ARCHITECTURE                                     |
+---------------------------------------------------------------------------------------------------------------+
|                                                                                                               |
|                                       LEO SIGINT SATELLITE (550 km)                                           |
|                                            /                 \                                                |
|                                           /                   \                                               |
|                           Uplink Intercept                     Downlink Intercept                             |
|                           (GCS -> Drone)                       (Drone -> GCS)                                 |
|                           - High Power (20 W)                  - Low Power (2 W)                              |
|                           - Fixed / Vehicular                  - Moving Aerial Platform                       |
|                           - Smooth Doppler Curve               - Dynamic Doppler + Kinematics                 |
|                                         /                         \                                           |
|                                        v                           v                                          |
|                         +-----------------------+         +-----------------------+                           |
|                         | GROUND CONTROL STATION| <=====> | TACTICAL AIRBORNE UAS |                           |
|                         | (GCS / PILOT POSITION)|         | (Reconnaissance Drone)|                           |
|                         +-----------------------+         +-----------------------+                           |
|                         Velocity: 0 - 25 m/s              Velocity: 30 - 90 m/s                               |
|                         Altitude: 0 m AGL                 Altitude: 500 - 4,000 m AGL                         |
|                         Uplink: Telecommands              Downlink: Video & Telemetry                         |
|                                                                                                               |
+---------------------------------------------------------------------------------------------------------------+
```

#### 1. Frequency Allocations & Waveforms
- **UHF ISM & Military Bands**: $433.05\text{--}434.79\text{ MHz}$ (sub-GHz C2), $868\text{ MHz}$ (EU), $902\text{--}928\text{ MHz}$ (US FHSS), $1.350\text{--}1.450\text{ GHz}$ (NATO C2).
- **C-band & 5 GHz ISM Bands**: $5.150\text{--}5.250\text{ GHz}$, $5.725\text{--}5.875\text{ GHz}$ (COFDM video downlinks, DJI OcuSync, MicroHard, Silvus StreamCaster, Persistent Systems Wave Relay).
- **Modulation Profiles**:
  - **Frequency-Hopping Spread Spectrum (FHSS)**: 100 to 1,000 hops/second across 50–200 channels with $250\text{ kHz to }2\text{ MHz}$ channelization.
  - **Coded Orthogonal Frequency Division Multiplexing (COFDM)**: 1.25, 2.5, 5.0, 10.0, or 20.0 MHz bandwidth; QPSK, 16-QAM, or 64-QAM subcarrier modulation; LDPC forward error correction.

#### 2. Transmit Power, Antennas & RF EIRP
- **Ground Control Station (GCS Uplink $\rightarrow$ Drone)**:
  - Transmit Power: $2.0\text{ to }20.0\text{ W}$ ($+33\text{ to }+43\text{ dBm}$).
  - Antenna: High-gain directional patch or tracking dish ($G_t \approx +8\text{ to }+18\text{ dBi}$) or vehicular collinear omni ($+5\text{ dBi}$).
  - Resulting EIRP: $\text{EIRP}_{GCS} = +41\text{ to }+61\text{ dBm}$ ($12.5\text{ W to }1.25\text{ kW}$).
- **Airborne Drone (Downlink $\rightarrow$ GCS)**:
  - Transmit Power: $0.5\text{ to }5.0\text{ W}$ ($+27\text{ to }+37\text{ dBm}$).
  - Antenna: Compact omnidirectional blade or dipole ($G_t \approx +1\text{ to }+3\text{ dBi}$).
  - Resulting EIRP: $\text{EIRP}_{drone} = +28\text{ to }+40\text{ dBm}$ ($0.6\text{ to }10\text{ W}$).

---

### 3.2 Kinematic Discrimination: Ground Pilot (GCS) vs. Airborne Drone

In tactical counter-UAS operations, locating the expendable drone is of secondary value; **the high-priority objective is finding the Ground Control Station (the pilot and launcher crew)** to enable kinetic or counter-battery interdiction.

The LEO SIGINT constellation differentiates between the GCS and the drone using **Kinematic Doppler Decomposition**:

1. **State Vector Formulation**:
   Let the satellite state be $(\mathbf{r}_s(t), \mathbf{v}_s(t))$.
   - The GCS is static on the Earth's surface or moving at vehicular speeds ($\|\mathbf{v}_{GCS}\| \le 25\text{ m/s}$), strictly constrained to terrain elevation $h_{terrain}(\text{lat, lon})$ on the WGS-84 ellipsoid:
     $$\mathbf{r}_{GCS} = [x_g, y_g, z_g]^T \in \text{WGS-84}$$
   - The drone flies in 3D space with velocity $\mathbf{v}_d(t)$ ($30\text{ to }90\text{ m/s}$) and altitude $z_d(t) = h_{terrain} + h_{AGL}$ ($100\text{ to }5,000\text{ m}$ above ground level):
     $$\mathbf{r}_{drone}(t) = \mathbf{r}_{GCS} + \mathbf{p}(t)$$

2. **Differential Doppler Profiling**:
   The received carrier frequency from an emitter with velocity $\mathbf{v}_e$ is:
   $$f_{rx}(t) = f_0 \left( 1 - \frac{(\mathbf{r}_s(t) - \mathbf{r}_e) \cdot (\mathbf{v}_s(t) - \mathbf{v}_e)}{c \|\mathbf{r}_s(t) - \mathbf{r}_e\|} \right)$$
   - **For the Ground Station**: Because $\|\mathbf{v}_s\| \approx 7,560\text{ m/s} \gg \|\mathbf{v}_{GCS}\|$, the Doppler curve is purely governed by orbital motion relative to a static terrestrial point. The zero-Doppler inflection point occurs exactly at the geometric closest approach ($T_{CA}$).
   - **For the Drone**: The airborne flight velocity $\mathbf{v}_d$ introduces an instantaneous Doppler bias:
     $$\delta f_{d}(t) = \frac{f_0}{c} \left( \frac{(\mathbf{r}_s - \mathbf{r}_d) \cdot \mathbf{v}_d}{\|\mathbf{r}_s - \mathbf{r}_d\|} \right)$$
     For a drone flying at $v_d = 60\text{ m/s}$ at $f_0 = 5.8\text{ GHz}$:
     $$\delta f_{d, max} = \frac{5.8 \times 10^9 \times 60}{3 \times 10^8} = \pm 1,160\text{ Hz}$$
   - Furthermore, drone maneuvers (bank turns, climbs) induce instantaneous phase and frequency acceleration ($\ddot{f}_{rx} \neq 0$) that deviate from the smooth orbital S-curve of a stationary ground emitter.

3. **Multi-Satellite Altitude Separation**:
   In a 3-satellite TDOA fix, the intersection of three hyperboloids without an Earth-elevation constraint solves for a full 3D position vector $[x, y, z]$. The solver decomposes the two emitters into:
   - Solution 1: Ground elevation ($h_{MSL} = 142\text{ m}$), static Doppler residual $\rightarrow$ **GCS Pilot Coordinates ($\text{CEP}_{50} \le 150\text{ m}$)**.
   - Solution 2: Aerial elevation ($h_{MSL} = 2,450\text{ m}$), kinetic Doppler residuals $\rightarrow$ **Airborne Drone Track**.

---

### 3.3 Sensor Processing & EW Exploitation Workflow

1. **UHF/C-band FPGA Channelization**:
   The satellite payload routes the $5.8\text{ GHz}$ downlinks through an RF bandpass filter into an ultra-high-speed ADC ($5.2\text{ GSPS}$). An FPGA PFB splits the $100\text{ MHz}$ swath into 1,024 channels.
2. **Hop Extraction & Dwell De-Interleaving**:
   For FHSS signals (e.g., $900\text{ MHz}$ military datalinks), the FPGA detects hop transitions within $5\,\mu\text{s}$, recording hop frequency, dwell duration, and received power. A hop sequence de-hop correlator groups bursts belonging to the same pseudo-random hopset.
3. **Automated Interdiction Trigger**:
   Once the GCS is isolated, its coordinates are formatted as a Cursor-on-Target (CoT) XML message and broadcast via tactical downlink directly to theater strike assets (artillery, precision loitering munitions) with latency $< 20\text{ seconds}$.

---

## 4. Target Scenario 4: Airborne Early Warning & Control (AEW&C) and Ground-Based Air Defense (GBAD) Radars

### 4.1 Target Profile & Electromagnetic Characteristics

Long-range Integrated Air Defense Systems (IADS) and Airborne Early Warning platforms form the core of anti-access/area-denial (A2/AD) bubbles.

```
+---------------------------------------------------------------------------------------------------------------+
|                       AIR DEFENSE & AEW&C RADAR INTERCEPT DYNAMICS AT LEO                                     |
+---------------------------------------------------------------------------------------------------------------+
|                                                                                                               |
|                                       LEO SATELLITE (h = 550 km)                                              |
|                                          /         |         \                                                |
|                                         /          |          \                                               |
|                                        /           |           \                                              |
|                                       /            |            \                                             |
|                   Far Sidelobe Intercept           |             Mainlobe Flash Intercept                     |
|                   Continuous (SNR = +15 dB)        |             Periodic Sweep (SNR = +45 dB)                |
|                   (DSA Set to 0 dB Loss)           |             (DSA Steps in 25 dB Attenuation)             |
|                                     /              |              \                                           |
|                                    v               v               v                                          |
|                         +-----------------------------------------------+                                     |
|                         |      GROUND-BASED AIR DEFENSE RADAR (GBAD)    |                                     |
|                         |      (e.g., S-300 / S-400 Target Acquisition) |                                     |
|                         +-----------------------------------------------+                                     |
|                         Peak Power: 50 kW to 1.5 MW (+77 to +92 dBm)                                          |
|                         Mainbeam Gain: +38 to +44 dBi (EIRP > 1 GW)                                           |
|                         Far Sidelobes: -10 to 0 dBi (EIRP ~ 50 kW)                                            |
|                                                                                                               |
+---------------------------------------------------------------------------------------------------------------+
```

#### 1. Target Systems Breakdown
- **GBAD Target Acquisition Radars**: S-band active electronically scanned arrays (AESA) or 3D mechanical rotators (e.g., Russian 96L6E Cheese Board, 91N6E Big Bird; US AN/MPQ-64 Sentinel; European Giraffe AMB; $2.7\text{--}3.5\text{ GHz}$).
- **GBAD Fire-Control & Target Engagement Radars**: X-band phased arrays (e.g., 30N6E Tombstone, 92N6E Grave Stone, AN/MPQ-53/65 Patriot; $8.5\text{--}10.5\text{ GHz}$).
- **AEW&C Platforms**: High-power airborne radars (e.g., E-3 Sentry AN/APY-1/2 S-band rotodome, Beriev A-50 Shmel, Chinese KJ-2000; $3.1\text{--}3.5\text{ GHz}$; E-2D Advanced Hawkeye UHF AESA, $400\text{--}450\text{ MHz}$).

#### 2. Transmit Power, Antennas & Pulse Modulations
- **Transmit Peak Power**: Giant RF emitters. $50\text{ kW to }1.5\text{ MW}$ peak ($+77\text{ to }+91.8\text{ dBm}$).
- **Antenna Gain & Scanning**: Narrow pencil or fan-beam antennas ($G_t \approx +38\text{ to }+45\text{ dBi}$). Peak $\text{EIRP} \approx +115\text{ to }+137\text{ dBm}$ ($300\text{ MW to }50\text{ GW}$). Mechanical scan rates: 6 to 15 RPM; AESA electronic raster scanning: sub-millisecond beam switching.
- **Intra-Pulse Modulation**:
  - Linear Frequency Modulation (LFM Chirp) with chirp slopes $\alpha = \pm 1\text{ to }50\text{ MHz}/\mu\text{s}$.
  - Non-Linear FM (NLFM) for low range sidelobes.
  - Polyphase codes (Frank codes, P1, P2, P3, P4) and binary phase codes (13-element Barker codes).
- **Pulse Repetition Intervals (PRI)**: Pulse-to-pulse agile, staggered (3 to 7 distinct PRIs), or jittered ($200\text{ Hz to }12\text{ kHz}$ PRF) to resolve range/Doppler blind zones and counter range-gate pull-off (RGPO) jammers.

---

### 4.2 Mainlobe vs. Sidelobe Intercept from LEO

The spaceborne intercept of gigawatt-class radars presents a major dynamic range challenge:
1. **Mainlobe Flash Dynamics**:
   When the radar's mainbeam sweeps across the LEO satellite line of sight ($R = 800\text{ km}$, $\text{FSPL} \approx 170\text{ dB}$ at $3.0\text{ GHz}$):
   $$P_{r, peak} = +85\text{ dBm (Tx)} + 42\text{ dBi (Tx)} + 18\text{ dBi (Rx)} - 170\text{ dB (FSPL)} - 2\text{ dB (Loss)} = -27.0\text{ dBm}$$
   This enormous signal level threatens to overdrive sensitive low-noise amplifiers (LNAs) into their 1-dB compression point ($P_{1dB} \approx -15\text{ dBm}$). Fast GaN diode limiters protect the front-end, while digital step attenuators (DSA) inject $20\text{ to }30\text{ dB}$ attenuation within $20\text{ nanoseconds}$.
2. **Continuous Sidelobe Intercept**:
   Throughout the remaining $98\%$ of the radar's rotational cycle, the radar antenna points away from the satellite. However, the antenna's **backlobes and far sidelobes** (typically $-30\text{ to }-40\text{ dB}$ down from mainbeam, or $0\text{ to }+10\text{ dBi}$ gain) still radiate $50\text{ kW}$ peak power into the upper hemisphere:
   $$P_{r, sidelobe} = +85\text{ dBm} + 5\text{ dBi} + 18\text{ dBi} - 170\text{ dB} - 2\text{ dB} = -64.0\text{ dBm}$$
   $$\text{SNR}_{sidelobe} = -64.0\text{ dBm} - (-98.0\text{ dBm noise floor}) = +34.0\text{ dB}$$
   *Key Operational Takeaway*: The LEO SIGINT satellite receives an exceptionally strong, high-fidelity pulse stream **continuously** throughout the pass, allowing complete de-interleaving and PRI extraction without waiting for the mainlobe to sweep.

---

### 4.3 Onboard Pulse Descriptor Word (PDW) Engine & De-Interleaving

Downlinking raw gigasample IQ data from space is physically impossible due to downlink bandwidth constraints. The satellite payload solves this by extracting compact **Pulse Descriptor Words (PDWs)** in real-time hardware:

```
+---------------------------------------------------------------------------------------------------+
|                        REAL-TIME HARDWARE PDW EXTRACTION PIPELINE                                 |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  Analog RF (S/X-Band)                                                                             |
|         |                                                                                         |
|         v                                                                                         |
|  [5.2 GSPS 12-bit ADC]                                                                            |
|         |                                                                                         |
|         v (Digital IF Stream)                                                                     |
|  [FPGA Polyphase Filter Bank] (1,024 Channels, 100 kHz Resolution)                                |
|         |                                                                                         |
|         v                                                                                         |
|  [CFAR Energy Detector] ===> Detects Pulse Leading & Trailing Edges                              |
|         |                                                                                         |
|         +-------------------------------------------------------------+                           |
|         |                                                             |                           |
|         v                                                             v                           |
|  [Time-to-Digital Converter]                                [Frequency & Phase Estimator]         |
|  - TOA (Time of Arrival): 2.5 ns res                        - Carrier Center Frequency (10 kHz)   |
|  - PW (Pulse Width): 5 ns res                               - Intra-Pulse Chirp Slope (df/dt)     |
|         |                                                             |                           |
|         +-----------------------------+-------------------------------+                           |
|                                       |                                                           |
|                                       v                                                           |
|                        [Interferometer Phase Correlator]                                          |
|                        - Phase Difference ΔΦ (AOA Vector)                                         |
|                                       |                                                           |
|                                       v                                                           |
|                        [COMPACT 32-BYTE PDW RECORD]                                               |
|                        {TOA, PW, Amp_Peak, Freq, AOA_Az, AOA_El, Mod_Type, Chirp_Rate}             |
|                                       |                                                           |
|                                       v (1,600:1 Data Compression!)                               |
|                        [De-Interleaving & PRI Clustering FIFO]                                    |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

#### De-Interleaving Algorithms:
1. **PRI Transform**: The onboard processor computes difference-time-of-arrival (DTOA) histograms between pulse pairs:
   $$\tau_k = \text{TOA}_j - \text{TOA}_i$$
   Periodic pulse trains create distinct harmonic peaks corresponding to fixed or staggered PRIs, separating interleaved emitters.
2. **Agile Frequency Clustering**: Pulses are clustered in multi-dimensional space $[f, \text{PW}, \text{AOA}, \text{Amplitude}]$ using unsupervised density-based spatial clustering (DBSCAN), separating multiple co-channel radars.
3. **Electronic Order of Battle (EOB) Update**:
   Identified radars are classified against the onboard EW database. A confirmed match (e.g., "92N6E Grave Stone Engagement Radar") generates an urgent tactical threat alert dispatched over the inter-satellite link.

---

## 5. Target Scenario 5: Tactical Military Communications & Push-to-Talk (PTT) Radios

### 5.1 Target Profile & Electromagnetic Characteristics

Tactical land forces utilize combat net radio (CNR) networks for command, squad coordination, and fire-support coordination. Modern military comms rely on fast frequency-hopping spread-spectrum (FHSS) to defeat jamming and interception.

```
+---------------------------------------------------------------------------------------------------------------+
|                            TACTICAL COMBAT NET RADIO (VHF/UHF) INTERCEPT                                      |
+---------------------------------------------------------------------------------------------------------------+
|                                                                                                               |
|                                       LEO SATELLITE (550 km Zenith)                                           |
|                                                     |                                                         |
|                                                     | FSPL @ 40 MHz = 119.3 dB                                |
|                                                     | (Extraordinarily Low Propagation Loss!)                 |
|                                                     v                                                         |
|                                      +-------------------------------+                                        |
|                                      | SOLDIER MANPACK CNR (5 W Tx)  |                                        |
|                                      | - Frequency: 30 to 88 MHz     |                                        |
|                                      | - Hop Rate: 100 to 111 hops/s |                                        |
|                                      | - Dwell: ~9 ms per hop        |                                        |
|                                      +-------------------------------+                                        |
|                                      Received Power at LEO: -85.8 dBm                                         |
|                                      Thermal Noise (25 kHz): -127.0 dBm                                       |
|                                      RESULTING SNR AT LEO: +41.2 dB!                                          |
|                                                                                                               |
+---------------------------------------------------------------------------------------------------------------+
```

#### 1. Target Radio Systems Breakdown
- **VHF Combat Net Radio (CNR)**: $30.000\text{ to }87.975\text{ MHz}$ (e.g., US SINCGARS, French PR4G, Russian R-168-5UN/Akveduk, Thales FML).
- **Tactical UHF / Air-Ground-Air**: $225.000\text{ to }399.975\text{ MHz}$ (e.g., HAVE QUICK II, SATURN, Rohde & Schwarz M3SR, AN/PRC-117G).
- **Professional Mobile Radio (PMR)**: $380\text{--}430\text{ MHz}$ (TETRA), $450\text{--}470\text{ MHz}$ (DMR, APCO P25).

#### 2. Frequency Hopping & Modulation Mechanics
- **SINCGARS**: 100 to 111 hops/second across 2,320 channels with $25\text{ kHz}$ channel spacing. Continuous Phase FSK (CPFSK). Hop dwell time $\sim 9.0\text{ ms}$. Cryptographically generated pseudo-random hop sequence.
- **HAVE QUICK II**: Several hundred hops/second across 7,000 channels ($25\text{ kHz}$ spacing) in UHF AM.
- **DMR / P25**: 2-slot TDMA 4FSK in $12.5\text{ kHz}$ channels; vocoder rate $4.8\text{ kbps}$.

#### 3. Power Levels & Antenna Gain
- Handheld Tactical Radios: $1.0\text{ to }5.0\text{ W}$ ($+30\text{ to }+37\text{ dBm}$) into flexible whip antennas ($G_t \approx -2\text{ to }+1\text{ dBi}$).
- Vehicular / Base Stations: $20.0\text{ to }50.0\text{ W}$ ($+43\text{ to }+47\text{ dBm}$) into vehicular broadband whips ($G_t \approx 0\text{ to }+2\text{ dBi}$).

---

### 5.2 Spaceborne Intercept Link Feasibility

A prevalent misconception in military communications is that low-power soldier manpack radios ($5\text{ W}$) are undetectable from space. Physics proves the opposite due to the inverse-square frequency dependence of free-space path loss!

#### VHF Link Budget Derivation ($f = 40.0\text{ MHz}$, $\lambda = 7.5\text{ m}$):
1. **Free-Space Path Loss at 550 km Zenith**:
   $$\text{FSPL} = 20\log_{10}(550) + 20\log_{10}(40.0) + 32.44 = 54.81 + 32.04 + 32.44 = 119.29\text{ dB}$$
2. **Received Signal Power**:
   Assume $5\text{ W}$ manpack transmitter ($P_t = +37.0\text{ dBm}$), soldier whip antenna gain $G_t = 0.0\text{ dBi}$, satellite deployable VHF monopole antenna gain $G_r = +1.5\text{ dBi}$, line losses $L_s = 1.0\text{ dB}$:
   $$P_r = +37.0\text{ dBm} + 0.0\text{ dBi} + 1.5\text{ dBi} - 119.29\text{ dB} - 1.0\text{ dB} = -81.79\text{ dBm}$$
3. **Noise Floor in 25 kHz Channel Bandwidth**:
   At VHF, galactic and man-made noise raises the effective antenna noise temperature to $T_a \approx 3,000\text{ K}$ ($NF_{ext} \approx 10\text{ dB}$):
   $$P_n = -174\text{ dBm/Hz} + 10\log_{10}(25 \times 10^3) + 10.0\text{ dB} = -174 + 43.98 + 10.0 = -120.02\text{ dBm}$$
4. **Signal-to-Noise Ratio (SNR)**:
   $$\text{SNR}_{\text{LEO}} = P_r - P_n = -81.79\text{ dBm} - (-120.02\text{ dBm}) = +38.23\text{ dB}$$
   Even off-zenith at a $1,500\text{ km}$ slant range ($\text{FSPL} \approx 128\text{ dB}$), the received $\text{SNR} > +29\text{ dB}$!
   *Definitive Physical Finding*: Tactical VHF push-to-talk communications are intercepted with **flawless signal margins** from Low Earth Orbit.

---

### 5.3 Fast Frequency Hopping Intercept & Specific Emitter Identification (SEI)

1. **Wideband Direct-Digitization Architecture**:
   Scanning receivers fail against 100 hops/s radios because the probability of intercept is $<0.1\%$. The satellite payload employs **Wideband Instantaneous Digitization**:
   - The entire $30\text{--}88\text{ MHz}$ combat net band ($58\text{ MHz}$ span) is digitized simultaneously using a 14-bit ADC sampling at $200\text{ MSPS}$.
   - An FPGA polyphase filter bank continuously monitors all 2,320 channels in parallel with zero dead-time.
   - Hop energy triggers a burst capture engine that logs channel frequency, timestamp, and IQ samples for each $9\text{ ms}$ dwell.
2. **Specific Emitter Identification (SEI) RF Fingerprinting**:
   Even when different radios use the same cryptographic hopset, their hardware variations introduce unique physical-layer artifacts:
   - **Power-Amplifier Turn-On Transient**: The transient envelope rise time ($10\text{--}50\,\mu\text{s}$) and overshoot profile.
   - **Phase Noise & Frequency Settling**: The dynamic settling trajectory of the local synthesizer PLL during hop retuning.
   - **Nonlinear Intermodulation / IQ Imbalance**: Power-amplifier memory effects and harmonic distortion ratios.
   The ground AI engine extracts a 128-dimensional embedding vector per hop burst, linking transmissions to specific physical transceivers (e.g., "Battalion Commander Radio #4").
3. **Command Post & Tactical Net Localization**:
   By associating hops from the same SEI profile across a 3-satellite TDOA/FDOA pass, the system geolocates the tactical headquarters or forward command post to $\text{CEP}_{50} \le 300\text{ meters}$, providing actionable target coordinates prior to offensive operations.

---

## 6. Comprehensive Five-Target Technical Parameter Matrix

| System Parameter | Target 1: Maritime Radar & AIS | Target 2: GNSS Jammer Complexes | Target 3: Tactical UAS C2 & Telemetry | Target 4: GBAD & AEW&C Radars | Target 5: Tactical VHF/UHF Comms |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Operational Frequency Band** | X-band (9.4 GHz), S-band (3.0 GHz), VHF AIS (162 MHz) | L-band (1176, 1227, 1575 MHz), GLONASS G1/G2 | UHF (433/900 MHz), C-band (5.8 GHz) | S-band (2.7–3.5 GHz), X-band (8.5–10.5 GHz) | VHF (30–88 MHz), Tactical UHF (225–400 MHz) |
| **Modulation Schemes** | Unmodulated CW, LFM chirp, GMSK (AIS) | Gaussian noise barrage, swept-CW chirp, false C/A codes | FHSS (100–1000 hops/s), COFDM (QPSK/64QAM) | LFM chirp, NLFM, Frank/Barker polyphase codes | CPFSK, AM, 4FSK (DMR), fast FHSS |
| **RF Peak Transmit Power** | 4 kW – 25 kW (Radar), 12.5 W (AIS) | 10 W – 10 kW continuous | 0.5 W – 5 W (Drone), 2 W – 20 W (GCS) | 50 kW – 1.5 MW peak | 1 W – 5 W (Manpack), 20 W – 50 W (Vehicle) |
| **Emitter Antenna Gain** | +28 to +32 dBi (Radar), +2 dBi (AIS) | +6 dBi (Omni) to +22 dBi (Phased Array) | +2 dBi (Drone) to +18 dBi (GCS tracking dish) | +38 to +45 dBi (Mainlobe), -10 to 0 dBi (Sidelobes) | -2 to +2 dBi (Whip antennas) |
| **Effective Radiated Power (EIRP)** | +94 to +106 dBm (Radar peak), +44 dBm (AIS) | +46 to +92 dBm (40 W to 1.5 MW) | +28 to +40 dBm (Drone), +41 to +61 dBm (GCS) | +115 to +137 dBm (Main), +65 to +85 dBm (Sidelobe) | +28 to +49 dBm (0.6 W to 80 W) |
| **LEO Free Space Path Loss (550 km)** | 166.7 dB (X-band), 120.8 dB (AIS) | 151.2 dB (L-band L1) | 140.0 dB (UHF), 162.5 dB (C-band) | 156.8 dB (S-band), 166.7 dB (X-band) | 119.3 dB (VHF 40 MHz) |
| **Received SNR at LEO Payload** | +48 dB (Mainlobe), +18 dB (Sidelobes) | +12 to +42 dB (High SNR!) | +15 to +35 dB (GCS), +8 to +20 dB (Drone) | > +45 dB (Mainlobe), +15 to +35 dB (Sidelobes) | +30 to +42 dB (High SNR!) |
| **Primary Geolocation Method** | 3-Sat TDOA/FDOA + Magnetron Chirp SEI | 3-Sat TDOA/FDOA + Doppler Rate S-curve | Multi-Sat TDOA + Kinematic Doppler Separation | 3-Sat TDOA/FDOA + AOA Phase Interferometer | Wideband PFB Channelization + Cluster TDOA |
| **Target Localization Accuracy (CEP_50)** | $\le 150\text{--}250\text{ m}$ | $\le 100\text{--}200\text{ m}$ | $\le 150\text{ m}$ (GCS Pilot), $\le 300\text{ m}$ (Drone) | $\le 100\text{ m}$ | $\le 200\text{--}300\text{ m}$ |
| **Tactical Intelligence Deliverable** | Dark Vessel Alert & SAR Satellite Cross-Cue | GNSS Denial Heatmap & NOTAM Air Alert | Pilot/GCS Interdiction Vector & Drone Video Tapping | Electronic Order of Battle (EOB) Radar Tag | HQ Command Post Geolocation & Net Topology |

---

## 7. Electronic Warfare Database Ingestion & Dissemination Protocols

### 7.1 Standardized NATO EW Record Formats

All geolocated signals and extracted emitter characteristics are normalized into standard NATO Electronic Warfare schemas:
1. **Combined Emitter Database (CED) Record**:
   - `ELNOT` (Electronic Intelligence Notation, 5 characters, e.g., `B1024` for naval navigation radar).
   - `MODULATION_PARAMETRICS`: Carrier frequencies (min, max, agility mode), PRI distribution (fixed, staggered, jittered), pulse width range.
   - `ANTENNA_PROPERTIES`: Polarization, scan period, rotation rate, beamwidth.
2. **Electronic Order of Battle (EOB) Schema**:
   - `RECORD_UUID`: Unique mission intercept identifier.
   - `EQUIPMENT_DESIGNATION`: Common name (e.g., `SA-20 Gargoyle Fire Control Radar`).
   - `GEOLOCATION_COORDINATES`: WGS-84 Latitude, Longitude, Altitude, Time of Intercept.
   - `ERROR_ELLIPSE`: Semi-major axis $a$, semi-minor axis $b$, orientation angle $\theta_{tilt}$, confidence percentage ($50\%$, $90\%$, $95\%$).
   - `CONFIDENCE_LEVEL`: Algorithm convergence metric ($\chi^2$ test score).

### 7.2 Tactical Dissemination Channels

```
+---------------------------------------------------------------------------------------------------------------+
|                            TACTICAL INTELLIGENCE DISSEMINATION ARCHITECTURE                                   |
+---------------------------------------------------------------------------------------------------------------+
|                                                                                                               |
|                        LEO SIGINT CONSTELLATION (Onboard Edge Extraction)                             |
|                                       |                                                                       |
|                     +-----------------+-----------------+                                                     |
|                     |                                   |                                                     |
|                     v (Direct S-Band / UHF Beam)        v (Optical ISL Relay)                                 |
|          +----------------------+             +----------------------+                                        |
|          | TACTICAL EDGE USER   |             | CLOUD GROUND SEGMENT |                                        |
|          | (Theater Terminal)   |             | (Operations Center)  |                                        |
|          +----------------------+             +----------------------+                                        |
|                     |                                   |                                                     |
|                     v                                   v                                                     |
|         Cursor-on-Target (CoT) XML              NATO STANAG 4607 / 4676                                       |
|         Link-16 J13.2 / J14.0 Messages          Air Defense EOB Database                                      |
|         TAK / ATAK Geospatial Feed              Automated SAR Satellite Tasking                               |
|         LATENCY: < 15 SECONDS!                  LATENCY: 5 TO 30 MINUTES                                      |
|                                                                                                               |
+---------------------------------------------------------------------------------------------------------------+
```

The system architecture implements **dual-pathway dissemination**:
- **Tactical Edge Pathway**: Critical threat warnings (radar lock-ons, active GNSS denial complexes, drone pilot coordinates) are formatted directly onboard into **Cursor-on-Target (CoT) XML** and **Link-16 J-Series messages** (J13.2 Electronic Warfare Product, J14.0 Electronic Parametric Data) and downlinked directly to theater mobile ground stations (e.g., Tactical Assault Kit [TAK/ATAK] terminals) with **latency under 15 seconds**.
- **Strategic Cloud Pathway**: The complete stream of millions of Pulse Descriptor Words is downlinked over high-speed X-band ($300\text{ Mbps}$) to ground enterprise stations during orbital passes. Ground automated processing pipelines ingest data into the national/coalition EOB database, executing historical trend analysis, pattern-of-life modeling, and strategic order-of-battle maintenance.
