# Spacecraft RF Link Budgets, High-Speed Mission Downlink & Inter-Satellite Communications

**Document ID**: `SIGINT-ENG-02-004`  
**Classification**: Technical Baseline / Publication Grade  
**Bands**: X-Band Downlink (8.20 GHz), S-Band TT&C (2.0–2.3 GHz), Optical ISL (1550 nm)  
**Standard Compliance**: ITU-R P.618, CCSDS 131.0-B-3, ECSS-E-ST-50-05C  
**Review Status**: Baseline Approved  

---

## 1. Communications Architecture Overview

The communications system fulfills three distinct operational mandates:
1. **High-Rate Mission Downlink**: Dumps condensed Pulse Descriptor Words (PDWs), high-priority I/Q signal captures, and threat catalogues to ground station networks at **300 Mbps** in the Earth Exploration Satellite Service (EESS) X-band ($8.025\text{–}8.400\text{ GHz}$).
2. **Telemetry, Tracking & Command (TT&C)**: Provides continuous, omnidirectional, low-rate command uplink ($100\text{ kbps}$) and health telemetry/ranging downlink ($2.0\text{ Mbps}$) in the space operations S-band ($2.025\text{–}2.290\text{ GHz}$).
3. **Inter-Satellite Optical Link (O-ISL)**: Establishes a 1550 nm high-speed laser crosslink between constellation planes and intra-cluster satellites for real-time collaborative TDOA/FDOA data exchange ($1.0\text{–}10.0\text{ Gbps}$) and sub-nanosecond (< 100 ps) Dual-One-Way Time Transfer (DOWTT).

```
+----------------------------------------------------------------------------------------------------+
|                       COMMUNICATIONS SUBSYSTEM ARCHITECTURE & DATA FLOW                            |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ONBOARD INSTRUMENTS & RECORDERS]                                                                 |
|   - Real-Time PDW Extractor (51.2 Mbps Stream)                                                     |
|   - 1 TB Rad-Hard NVMe Solid-State Recorder (Raw I/Q Bursts)                                       |
|   - Flight Computer Health Telemetry (CCSDS Packets)                                               |
|         │                                                                                          |
|         ├───────────────────────────────────┬──────────────────────────────────┐                   |
|         ▼                                   ▼                                  ▼                   |
|  [X-BAND MISSION DOWNLINK]           [S-BAND TT&C TRANSPONDER]          [OPTICAL ISL TERMINAL]     |
|   - 8.20 GHz Carrier                 - Uplink: 2.067 GHz (100 kbps)     - 1550 nm EDFA Laser       |
|   - 10.0 W GaN SSPA (+40 dBm)        - Downlink: 2.245 GHz (2 Mbps)     - 80 mm Fine Steering Head |
|   - DVB-S2X QPSK Rate 3/4 Modulator  - Dual Coherent Transponders       - 1.0 to 10.0 Gbps Data    |
|   - Steerable Microstrip Patch Array - 4x Isocone Hemispheric Antennas  - Sub-ns Clock Transfer    |
|         │                                   │                                  │                   |
|         ▼                                   ▼                                  ▼                   |
|  [5.4m Polar Ground Terminals]       [Global TT&C Ground Network]       [Peer Constellation Sat]   |
|   (Svalbard, Troll, Inuvik, KSAT)     (S-band Ground Station Ring)       (Cross-Plane / Cluster)   |
|   - Net Link Margin: +14.45 dB        - Uplink Margin: +18.2 dB          - Optical Margin: +6.5 dB |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. End-to-End Friis Transmission Link Budget for X-Band Downlink

The link budget is formulated via the logarithmic Friis transmission equation with ITU-R P.618 atmospheric and rain degradation models.

### 2.1 Orbital Geometry & Worst-Case Slant Range
- **Orbit**: Circular altitude $h = 600\text{ km}$ ($a = 6,978.14\text{ km}$).
- **Minimum Elevation Angle ($\varepsilon_{\text{min}}$)**: $10.0^\circ$ at the ground station horizon.
- **Earth Radius ($R_E$)**: $6,378.14\text{ km}$.
- **Earth Central Angle ($\psi$)**:
  $$\cos(\psi + \varepsilon) = \frac{R_E}{R_E + h} \cos(\varepsilon) = \frac{6,378.14}{6,978.14} \cos(10^\circ) = 0.9140 \times 0.9848 = 0.9001$$
  $$\psi + 10^\circ = 25.83^\circ \implies \psi = 15.83^\circ$$
- **Maximum Slant Range ($\rho_{\text{max}}$)**:
  $$\rho_{\text{max}} = \sqrt{R_E^2 + (R_E + h)^2 - 2 R_E (R_E + h) \cos(\psi)} = \mathbf{2,120.0\text{ km}}$$

### 2.2 End-to-End Tabulated Link Budget (8.20 GHz, 300 Mbps)

```
Friis Decibel Transmission Formula:
  [Eb/N0] = EIRP - Total_Path_Loss + (G/T)_rx - k_B - 10*log10(R_b)
```

| Parameter Description | Symbol | Numerical Value | Units | Technical Basis & ECSS/NASA Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Carrier Frequency** | $f_c$ | $8.20$ | $\text{GHz}$ | EESS Space-to-Earth allocated band (8.025–8.400 GHz) |
| Free Space Wavelength | $\lambda$ | $0.03656$ | $\text{m}$ | $\lambda = c / f_c$ |
| **Transmitter RF Output Power** | $P_{\text{tx}}$ | $10.0$ | $\text{W}$ | Space-qualified GaN Solid-State Power Amplifier (SSPA) |
| Transmitter RF Output Power | $P_{\text{tx}}$ | $+40.00$ | $\text{dBm}$ | $+10.00\text{ dBW}$ |
| Internal Feeder & Filter Loss | $L_{\text{tx}}$ | $1.20$ | $\text{dB}$ | Coaxial cable, isolator, and bandpass filter losses |
| Spacecraft Transmit Antenna Type | — | Phased Patch | — | $4 \times 4$ microstrip array with beam steering |
| Transmit Antenna Boresight Gain | $G_{\text{tx}}$ | $+17.50$ | $\text{dBi}$ | Aperture efficiency $\eta = 0.70$ over $200 \times 200\text{ mm}$ panel |
| Spacecraft Pointing Error Loss | $L_{\text{pt,tx}}$ | $0.60$ | $\text{dB}$ | ADCS fine body pointing offset ($0.10^\circ$) |
| **Equivalent Isotropically Radiated Power** | **EIRP** | **+25.70** | **dBW** | $\text{EIRP} = P_{\text{tx}} - L_{\text{tx}} + G_{\text{tx}} - L_{\text{pt,tx}}$ |
| Slant Range to Ground Station | $\rho$ | $2,120.0$ | $\text{km}$ | Worst-case geometry at $\varepsilon = 10.0^\circ$ elevation |
| Free Space Path Loss (FSPL) | $\text{FSPL}$ | $177.25$ | $\text{dB}$ | $\text{FSPL} = 32.44 + 20 \log_{10}(\rho) + 20 \log_{10}(f_{\text{MHz}})$ |
| Atmospheric Gaseous Absorption | $L_{\text{gas}}$ | $0.25$ | $\text{dB}$ | Oxygen ($O_2$) and water vapor ($H_2 O$) at $10^\circ$ elevation |
| Rain & Cloud Attenuation (99% avail) | $L_{\text{rain}}$ | $0.65$ | $\text{dB}$ | ITU-R P.618 model for Svalbard / high-latitude station |
| Ionospheric & Polarization Loss | $L_{\text{pol}}$ | $0.40$ | $\text{dB}$ | Faraday rotation & axial ratio mismatch |
| Ground Station Tracking Loss | $L_{\text{pt,rx}}$ | $0.50$ | $\text{dB}$ | Radome autotrack monopulse tracking error ($0.03^\circ$) |
| **Total Propagation Path Loss** | $L_{\text{path}}$ | **179.05** | **dB** | Sum of FSPL, atmosphere, rain, polarization, pointing |
| Ground Station Antenna Diameter | $D_{\text{rx}}$ | $5.40$ | $\text{m}$ | Standard commercial polar network aperture (KSAT) |
| Ground Station Antenna Efficiency | $\eta_{\text{rx}}$ | $0.65$ | — | High-efficiency shaped Cassegrain dual-reflector |
| Ground Station Antenna Gain | $G_{\text{rx}}$ | $+50.80$ | $\text{dBi}$ | $G_{\text{rx}} = 10 \log_{10}\left(\eta_{\text{rx}} (\pi D_{\text{rx}} / \lambda)^2\right)$ |
| Receiver LNA Noise Temperature | $T_{\text{lna}}$ | $65.0$ | $\text{K}$ | Uncooled cryo-equivalent HEMT front-end |
| Antenna Sky & Radome Temperature | $T_{\text{sky}}$ | $70.0$ | $\text{K}$ | Atmospheric emission + ground pickup at $10^\circ$ elevation |
| Total System Noise Temperature | $T_{\text{sys}}$ | $135.0$ | $\text{K}$ | $T_{\text{sys}} = T_{\text{lna}} + T_{\text{sky}}$ |
| System Noise Temperature in dB-K | $10 \log_{10}(T)$ | $21.30$ | $\text{dB-K}$ | Reference plane at ground station LNA feed |
| **Ground Station Figure of Merit** | **$G/T$** | **+29.50** | **dB/K** | $G/T = G_{\text{rx}} - 10 \log_{10}(T_{\text{sys}})$ |
| Boltzmann's Constant | $k_B$ | $-228.60$ | $\text{dBW/(Hz}\cdot\text{K)}$ | Fundamental physical constant |
| Carrier-to-Noise Density Ratio | $C/N_0$ | $+104.75$ | $\text{dB-Hz}$ | $C/N_0 = \text{EIRP} - L_{\text{path}} + G/T - k_B$ |
| Information Transmission Bit Rate | $R_b$ | $300.0$ | $\text{Mbps}$ | High-rate mission data stream |
| Transmission Bit Rate in dB-Hz | $10 \log_{10}(R_b)$ | $84.77$ | $\text{dB-Hz}$ | $10 \log_{10}(300 \times 10^6)$ |
| **Received Energy per Bit to Noise Density** | **$E_b/N_0$** | **+19.98** | **dB** | $E_b/N_0 = C/N_0 - 10 \log_{10}(R_b)$ |
| Theoretical $E_b/N_0$ Threshold | — | $+4.03$ | $\text{dB}$ | DVB-S2X QPSK Rate 3/4 with LDPC (BER = $10^{-7}$) |
| Receiver Implementation Loss | $L_{\text{impl}}$ | $1.50$ | $\text{dB}$ | Carrier recovery, timing jitter, phase noise, ADC distortion |
| **Required $E_b/N_0$ Threshold** | **$(E_b/N_0)_{\text{req}}$**| **+5.53** | **dB** | $(E_b/N_0)_{\text{req}} = \text{Threshold} + L_{\text{impl}}$ |
| **FINAL RF LINK MARGIN** | **Margin** | **+14.45** | **dB** | $\mathbf{\text{Margin} = E_b/N_0 - (E_b/N_0)_{\text{req}}}$ |

> **Link Margin Compliance**: The calculated link margin of **$+14.45\text{ dB}$** exceeds the standard required space margin ($3.0\text{ dB}$) by $+11.45\text{ dB}$, satisfying the project specification for $\ge 20\%$ margin ($> 4.0\text{ dB}$).

---

## 3. S-Band TT&C Link Budget

The Telemetry, Tracking, and Command (TT&C) subsystem utilizes omnidirectional antennas to maintain communications during spacecraft tumbling, safe mode, and launch deployment.

| Parameter | S-Band Uplink (Command) | S-Band Downlink (Telemetry) | Comments / Basis |
| :--- | :--- | :--- | :--- |
| **Carrier Frequency** | $2.067\text{ GHz}$ | $2.245\text{ GHz}$ | CCSDS Space Operation Allocation |
| Ground Station Transmit Power | $200.0\text{ W}$ ($+23.0\text{ dBW}$) | — | High-power ground transmitter |
| Spacecraft Transmit Power | — | $2.0\text{ W}$ ($+3.0\text{ dBW}$) | Low-power solid-state amplifier |
| Ground Station Antenna Gain | $+38.5\text{ dBi}$ ($5.4\text{ m}$ dish) | $+39.2\text{ dBi}$ ($5.4\text{ m}$ dish) | Standard ground aperture |
| Spacecraft Antenna Gain | $0.0\text{ dBi}$ (Isocone Patch) | $0.0\text{ dBi}$ (Isocone Patch) | Hemispherical omnidirectional coverage |
| Slant Range | $2,120.0\text{ km}$ ($10^\circ$ elevation) | $2,120.0\text{ km}$ ($10^\circ$ elevation) | Maximum range |
| Free Space Path Loss (FSPL) | $165.28\text{ dB}$ | $166.00\text{ dB}$ | $\lambda = 0.145\text{ m} / 0.134\text{ m}$ |
| Atmospheric & Polarization Losses | $0.80\text{ dB}$ | $0.80\text{ dB}$ | Moderate atmosphere |
| Data Bit Rate | $100\text{ kbps}$ ($50.0\text{ dB-Hz}$) | $2.0\text{ Mbps}$ ($63.01\text{ dB-Hz}$) | Robust command / high-rate housekeeping |
| Receiver System Noise Temperature | $450\text{ K}$ (Spacecraft RX, $26.5\text{ dB-K}$) | $110\text{ K}$ (Ground RX, $20.4\text{ dB-K}$) | Uncooled receiver noise |
| Received $E_b/N_0$ | $+28.2\text{ dB}$ | $+22.8\text{ dB}$ | Logarithmic link summation |
| Required $E_b/N_0$ (PCM/PSK, BER $10^{-6}$)| $+10.0\text{ dB}$ | $+6.0\text{ dB}$ (Turbo code) | Standard CCSDS threshold |
| **Net Link Margin** | **+18.2 dB** | **+16.8 dB** | **Extremely robust link margins** |

---

## 4. Optical Inter-Satellite Link (O-ISL) & Clock Transfer

To perform multi-satellite instantaneous TDOA/FDOA geolocation, satellites in the constellation exchange raw pulse time-tags and coordinate measurements across a high-speed laser crosslink.

```
+----------------------------------------------------------------------------------------------------+
|                         1550 nm OPTICAL INTER-SATELLITE LINK (O-ISL)                               |
+----------------------------------------------------------------------------------------------------+
|  Optical Architecture    : 1550 nm Erbium-Doped Fiber Amplifier (EDFA), Coherent DP-QPSK           |
|  Optical Transmit Power  : 200 mW (+23.0 dBm / -7.0 dBW)                                            |
|  Telescope Aperture      : 80 mm clear aperture with Fast Steering Mirror (FSM, 1 kHz bandwidth)   |
|  Transmit Beam Divergence: 25.0 µrad (Full Width at Half Maximum)                                  |
|  Pointing Jitter         : < 1.5 µrad (3-sigma, closed-loop quadrant photodiode tracking)          |
|  Inter-Satellite Range   : 50 km to 2,500 km (intra-cluster and cross-plane links)                 |
|  Data Rate               : 1.0 Gbps (Nominal) / 10.0 Gbps (Burst Mode)                             |
|  Receiver Sensitivity    : -42.0 dBm (at BER = 10^-9 with Reed-Solomon RS(255,239) FEC)            |
|  Received Optical Power  : -35.5 dBm at 1,500 km range                                             |
|  Net Optical Link Margin : +6.5 dB                                                                 |
+----------------------------------------------------------------------------------------------------+
```

### 4.1 Sub-Nanosecond Dual-One-Way Time Transfer (DOWTT)
Precision TDOA geolocation demands that clock skews between cluster satellites be known to **$< 1.0\text{ ns}$**. The optical link implements continuous Dual-One-Way Time Transfer:
- Satellite A transmits a pseudo-random optical pulse sequence with timestamp $t_A^{\text{tx}}$.
- Satellite B records arrival time $t_B^{\text{rx}}$ and simultaneously transmits its return pulse with timestamp $t_B^{\text{tx}}$.
- The propagation delay $\tau$ and inter-satellite clock bias $\Delta t_{\text{clock}}$ are decoupled algebraically:
  $$\tau = \frac{(t_B^{\text{rx}} - t_A^{\text{tx}}) + (t_A^{\text{rx}} - t_B^{\text{tx}})}{2}$$
  $$\Delta t_{\text{clock}} = \frac{(t_B^{\text{rx}} - t_A^{\text{tx}}) - (t_A^{\text{rx}} - t_B^{\text{tx}})}{2}$$
- By operating at $1550\text{ nm}$ with picosecond optical pulse slicing, DOWTT achieves an absolute clock synchronization accuracy of **$\sigma_t \le 85\text{ ps}$**, virtually eliminating clock error from the constellation TDOA error budget.

---

## 5. Contact Time & Daily Data Volume Analysis

```
LEO Downlink Dynamics (600 km Sun-Synchronous Orbit):
  - Orbital Velocity    : 7.558 km/s
  - Orbital Period      : 96.69 minutes (14.89 orbits per day)
  - Ground Pass Time    : 580 seconds average duration above 10° elevation
  - Polar Ground Network: 4 primary stations (Svalbard, Troll, Inuvik, Punta Arenas)
  - Average Contacts    : 5.2 usable passes per satellite per day
```

### Daily Data Throughput Sizing
- **Data Dump per Ground Pass**:
  $$\text{Volume}_{\text{pass}} = 300\text{ Mbps} \times 580\text{ s} = 174,000\text{ Mb} = \mathbf{21.75\text{ GigaBytes (GB)}}$$
- **Total Daily Data Downlinked per Satellite**:
  $$\text{Volume}_{\text{daily}} = 5.2\text{ passes/day} \times 21.75\text{ GB/pass} = \mathbf{113.1\text{ GB / satellite / day}}$$
- **Constellation Capacity**:
  - In a dense 10-satellite constellation, the aggregate daily data return exceeds **$1.13\text{ TeraBytes/day}$** of processed PDW tracks and high-priority RF threat captures.
