# 03 — Payload Engineering Reference: Passive RF Monitoring / SIGINT Payload for a 100–150 kg LEO Satellite

**Scope.** Engineering state of the art for a passive RF collection payload covering UHF (~300 MHz) to X-band (~12 GHz) on a 100–150 kg bus at 450–600 km, intended to detect, characterise and geolocate emitters, first as a single satellite and later as a TDOA/FDOA constellation, and to feed EW databases and RF-signature catalogues. Numbers are sourced where a source exists; values marked **(est.)** are engineering estimates derived in this document and should be treated as inputs to be confirmed by analysis or test.

**Conventions.** dBm referenced to 1 mW; dBi gain relative to isotropic; `log` is base-10; c = 3×10^8 m/s; Earth radius R_E = 6371 km; k·T₀ = −174 dBm/Hz at 290 K. Compiled 21 October 2026.

---

## 1. Target emitter classes and RF characteristics

### 1.1 Summary table

Detectability column assumes the baseline payload defined in §2–§4 (G_rx 5–10 dBi at UHF/L, 15–25 dBi at S/C/X, NF 2–3 dB, 450–600 km orbit) and a 1000–1500 km slant range (elevation 15–30°). "ML" = mainlobe, "SL" = sidelobe.

| Class | Frequency | Signal BW | Tx power / EIRP (typ.) | Modulation | Duty cycle | Detectable from ~500 km LEO? |
|---|---|---|---|---|---|---|
| Tactical VHF/UHF manpack & vehicular radios | 30–88, 225–400, 400–512 MHz | 25 kHz (analog FM / CPM), 0.5–5 MHz (frequency-hopping / wideband waveforms) | 5 W handheld (37 dBm), 20–50 W vehicular (43–47 dBm); antenna −3…+2 dBi → EIRP ≈ 34–49 dBm **(est.)** | FM, FSK/CPM, FH | PTT, 5–50 % | **Yes**, SNR 15–25 dB in 25 kHz (§2.4). HawkEye 360 publicly geolocates VHF/UHF push-to-talk radios [3]. |
| TETRA / trunked PMR | 380–400 (mil/gov), 410–430, 450–470 MHz | 25 kHz | BS 25–40 W + 10 dBi ≈ 54–56 dBm; MS 1–3 W **(est.)** | π/4-DQPSK, 18 kbit/s | BS continuous; MS bursty | **Yes** (BS SNR ≈ 40 dB in 25 kHz; MS similar to tactical). |
| Cellular base stations (GSM/LTE/5G) | 700–960, 1700–2700 MHz | 0.2–20 MHz | 20–40 W/carrier + 15–18 dBi ≈ 58–64 dBm **(est.)**, down-tilted | GMSK / OFDMA | Continuous | **Yes** in sidelobes; dense environments produce a clutter floor that limits other detections. |
| Link-16 / JTIDS (MIDS) | 960–1215 MHz, 51 hop frequencies, excl. 1030/1090 | ≈3 MHz per pulse (5 Mchip/s MSK, 6.4 µs pulse, 13 µs period) | 200 W standard, 1 kW high-power terminals; blade antenna 0–3 dBi → EIRP 53–63 dBm **(est.; power classes per open MIDS literature)** | MSK, FH/TDMA, Reed-Solomon | Time-slotted, ≤ 7.8 ms slot | **Marginal–yes**: per-pulse SNR ≈ 8 dB with 5 dBi (§2.4); pulse integration and 10 dBi antenna gives robust detection. Full 255 MHz IBW needed to follow all hops. |
| IFF / SSR / Mode S / ADS-B | 1030 MHz (interrogation), 1090 MHz (reply) | 1030: ~8 MHz; 1090: ~6 MHz (PPM 1 µs chips) | Transponder 125–500 W (51–57 dBm), 0 dBi; interrogator 1–2 kW + 20–27 dBi → ML EIRP 80–90 dBm **(est.)** | PPM / DPSK (Mode 4/5 encrypted) | Reply <1 % | **Yes**: space-based ADS-B (Aireon, Spire) proves 1090 reception from LEO with ~8–10 dBi antennas; interrogators detectable in sidelobes. |
| GNSS jammers | 1164–1300 (L5/L2), 1559–1610 MHz (L1/E1/G1) | CW, 2–20 MHz chirp; wideband noise 2–40 MHz | PPD ≈ 10 mW; "hedgehog" criminal units ≈ 10 W [15]; military/truck-mounted 100 W–kW class with 5–15 dBi **(est.)** | Linear chirp (sweep ≈ 9 µs, ≤ 20 MHz span [15]), CW, noise | Continuous | **No** for 10 mW PPDs (SNR ≈ −46 dB, −23 dB after de-chirp, §2.4). **Marginal** for 10 W. **Yes** for ≥ 100 W military jammers (SNR +4…+14 dB raw). |
| UAS C2 / video — consumer (DJI OcuSync/O3/O4) | 2.400–2.4835, 5.725–5.850 GHz | 1.4–20 MHz (OFDM) | EIRP ≈ 26 dBm (CE) / 33 dBm (FCC) **(regulatory limits; est.)** | OFDM, FH | Continuous while flying | **No** with practical apertures (SNR −9…−16 dB even at nadir; §2.4). Only aggregated/activity-level sensing or large (>2 m) apertures. |
| UAS C2 — military/mil-COTS (Orlan-10 GCS, RFD900/MAVLink, LoRa-class, Ukrainian/Russian 433/868/915 MHz links) | 433, 868, 915 MHz; some 1.2–1.3 GHz; 2.4 GHz | 100 kHz–2 MHz | Air unit 0.5–2 W; GCS 10–20 W with 8–14 dBi directional → GCS EIRP 50–55 dBm **(est.)** | FSK/GFSK, LoRa CSS, OFDM | Continuous or bursty | **Marginal (airborne unit)**, **Yes (GCS)**: SNR ≈ 5 dB for 10 W / 500 kHz at 900 MHz with 5 dBi; GCS mainlobe points at UAS (low elevation), satellite sees GCS sidelobes/upper lobes. |
| AEW&C radars: E-3 APY-1/2 (S), E-7 MESA (L), A-50 Shmel (S), Saab Erieye PS-890 (S, 192 GaAs T/R modules; ER variant GaN) [17], KJ-500 (UHF/L, est.) | 1.2–1.4 GHz (MESA), 2.9–3.3 GHz (S-band types) | 1–10 MHz (pulse compression) | Peak hundreds of kW–MW class (APY-1/2, Shmel), tens of kW (AESA types) **(est.; not published)**; antenna 35–40 dBi → ML EIRP 120–140 dBm | Pulsed, pulse-compressed, pulse-Doppler, PRF 300 Hz–several kHz | 1–10 % | **Yes**, including via sidelobes (−30…−45 dB) from any elevation; mainlobe causes ADC saturation (§2.6). |
| Naval surveillance radars: AN/SPY-1 (S, 3.1–3.5 GHz, peak 4–6 MW, avg 58 kW, PW 6.4–51 µs, 1.7° beam [16]); Fregat MR-710 "Top Plate" (S/E-band); Pozitiv-ME1 (X-band); Mineral-ME (X-band active + ESM) | 2.9–3.5 GHz (S), 8.5–10 GHz (X) | 1–10 MHz (compressed), 100 kHz–1 MHz (simple pulse) | ML EIRP 100–140 dBm; SL (−30…−45 dB) EIRP 60–105 dBm | Pulsed, chirp/phase-coded, frequency agile; scan 6–30 rpm (rotating) or electronic | 0.1–5 % | **Yes** (strong). SPY-1 sidelobes at 2000 km give SNR ≈ 40 dB in 10 MHz (§2.4). |
| Naval fire-control / illuminators (AN/SPG-62 X/Ku, Orekh/Kinzhal X) | 8–12 GHz (+Ku) | 1–50 MHz | 10–100 kW peak; 35–40 dBi → ML 110–120 dBm **(est.)** | CW or high-PRF pulse-Doppler | Engagement-only | **Yes** in sidelobes when active (rare, high intelligence value). |
| Maritime navigation radars (IMO X/S) | 9.3–9.5 GHz (X), 2.9–3.1 GHz (S) | 0.08–1 µs magnetron pulses → 1–20 MHz; solid-state chirp 10–50 MHz | 4–25 kW peak (66–74 dBm); 25–30 dBi fan beam → ML 92–104 dBm; vertical beamwidth 20–25° | Pulsed, PRF 400–3000 Hz, 24–48 rpm | 0.03–0.1 % | **Yes**: ML SNR ≈ 32 dB, SL ≈ 7 dB at 2000 km with 10 dBi (§2.4). This is the staple of HawkEye 360, Unseenlabs and Kleos maritime products [3][6][9]. |
| Ground-based air-defence radars: 91N6E Big Bird (S, fully digital, higher peak power than 64N6E which operates near 2 GHz [18]); 92N6E Grave Stone (X); 96L6E Cheese Board (C/S); Nebo-M RLM-M (VHF), RLM-D (L), RLM-S (S); 1L119 Nebo-SVU (VHF); AN/MPQ-53/65 Patriot (C, 5.25–5.925 GHz) | 150–200 MHz (VHF) to 10 GHz | 1–20 MHz | Peak MW class (Big Bird, Patriot est.), 100s kW (Grave Stone est.); ML EIRP 120–145 dBm | Pulse-compressed, frequency agile, electronic scan | 1–10 % | **Yes** via sidelobes at all elevations; VHF types easy at UHF antenna. Emission control (EMCON) and low-probability-of-intercept (LPI) modes, not SNR, limit collection. |
| Coastal surveillance radars (Scanter, Terma, Furuno/JRC derived) | X-band 9.2–9.5 GHz; some S | 5–50 MHz (solid-state chirp) | 100 W–25 kW; 30–35 dBi; ML 80–110 dBm | Pulsed/chirp, 10–40 rpm | 0.1–10 % | **Yes** (as marine radars). |
| EW / communications jammers (R-330Zh Zhitel, Krasukha-4 S/X, Pole-21, Bukovel-AD) | 100 MHz–18 GHz | 1–100 MHz | 1–10 kW into 10–25 dBi → EIRP 70–95 dBm **(est.)** | Noise, swept, DRFM | Continuous during ops | **Yes** (very strong; detection trivial, classification by spectral shape). |
| SATCOM uplink terminals: UHF SATCOM manpack; L-band MSS handsets (Iridium ≈ 7 W burst, Inmarsat); X-band mil VSAT (7.9–8.4 GHz); C-band VSAT (5.85–6.725 GHz) | 292–318 MHz; 1.6 GHz; 5.9–6.7 GHz; 7.9–8.4 GHz | 5–25 kHz (UHF), 31.5–200 kHz (L-MSS), 1–36 MHz (VSAT) | UHF: 20–50 W + 5–10 dBi (broad beam) → 48–57 dBm; L: 10–15 dBW; X/C VSAT ML 50–70 dBW pointed at GEO, SL −30…−50 dB → 50–60 dBm **(est.)** | FSK/PSK, DAMA; OFDM/QPSK/8PSK DVB-S2 | Continuous (VSAT) or bursty | UHF: **Yes** (broad beam covers LEO geometry). L-band handsets: **Yes** (HawkEye lists L-band mobile satellite devices [3]). X/C VSAT: **Marginal** (sidelobe SNR ≈ 0 dB with 15 dBi; §2.4). |

**Key engineering takeaways.** (i) Radars are never SNR-limited from LEO; the design driver is *dynamic range and saturation* (§2.6, §4.4). (ii) Narrowband tactical comms in VHF/UHF/L are comfortably detectable with modest gain; the driver is *frequency coverage, instantaneous bandwidth and dwell*. (iii) Low-power consumer-class 2.4/5.8 GHz links and 10 mW GNSS jammers are below the thermal floor for any aperture that fits a 150 kg bus; claims of "drone detection from LEO" should be read as detection of ground control stations, military-class links, or aggregate activity. (iv) Unknown emitter EIRP means every detection is an *EIRP lower bound*, not a measurement, unless geolocation and antenna pattern knowledge are combined.

---

## 2. Link budget methodology from LEO

### 2.1 Geometry: slant range and footprint

Slant range d to a ground emitter seen at elevation ε from altitude h:

```
d(ε) = −R_E·sin ε + sqrt( (R_E·sin ε)² + 2·R_E·h + h² )
```

Nadir angle from the satellite to a point at elevation ε: `η = asin( R_E·cos ε / (R_E + h) )`. Earth-central angle `γ = 90° − ε − η`; ground footprint radius `ρ = R_E·γ`.

| Elevation ε | d @ 450 km | d @ 500 km | d @ 600 km | Nadir angle η @ 500 km | Footprint radius ρ @ 500 km |
|---|---|---|---|---|---|
| 90° (nadir) | 450 km | 500 km | 600 km | 0° | 0 |
| 45° | 626 | 683 | 796 | 41° | 240 km |
| 30° | 845 | 909 | 1035 | 53.4° | 740 km |
| 20° | 1115 | 1193 | 1340 | 60.6° | 1060 km |
| 10° | 1570 | 1695 | 1932 | 65.9° | 1560 km |
| 5° | 1930 | 2077 | 2340 | 67.4° | 1950 km |
| 0° (horizon) | 2436 | 2573 | 2829 | 68.0° | 2450 km |

The visible area above 10° elevation at 500 km is ≈ 7.7 million km² (radius 1560 km); an antenna must cover a cone of ≈ ±66° about nadir to see it all. This half-angle is the fundamental tension in §3: a wide field of regard caps antenna gain at roughly 4–8 dBi, whereas a steerable narrow beam buys gain at the cost of search rate.

### 2.2 Free-space path loss

```
FSPL(dB) = 32.45 + 20·log(f_MHz) + 20·log(d_km)
```

| Band (centre) | FSPL @ 500 km | FSPL @ 1000 km | FSPL @ 2000 km | FSPL @ 2573 km (horizon) |
|---|---|---|---|---|
| 300 MHz | 136.0 | 142.0 | 148.0 | 150.2 |
| 1.0 GHz | 146.4 | 152.4 | 158.5 | 160.7 |
| 1.5 GHz | 150.0 | 156.0 | 162.0 | 164.2 |
| 3.0 GHz | 156.0 | 162.0 | 168.0 | 170.2 |
| 5.5 GHz | 161.3 | 167.3 | 173.3 | 175.5 |
| 9.5 GHz | 166.0 | 172.0 | 178.0 | 180.2 |
| 12 GHz | 168.0 | 174.0 | 180.0 | 182.2 |

Atmospheric and ionospheric losses are < 1 dB above 300 MHz for ε > 10° (ionospheric scintillation at UHF near the equatorial anomaly and auroral zones can add several dB of fading, **est.**). Polarisation mismatch (§3.6) is budgeted separately at 0–3 dB with dual-polarised receive, up to 20+ dB with a single linear polarisation.

### 2.3 Received power, noise and sensitivity

```
P_rx (dBm) = EIRP (dBm) − FSPL (dB) + G_rx (dBi) − L_pol − L_misc
N (dBm)    = −174 + 10·log(B_Hz) + NF (dB)          [T_ant ≈ 290 K, Earth-facing]
SNR        = P_rx − N
P_min      = N + SNR_req − G_proc
```

Earth-facing antennas see ≈ 290 K brightness, so the sky-noise advantage of radio astronomy does not apply; system noise is set by the LNA (NF 0.5–1.5 dB) plus front-end losses (filters, switches, cable: 1–2 dB), giving NF_sys ≈ 2–3 dB.

| Detection bandwidth B | Noise floor (NF 2 dB) | P_min for SNR 10 dB |
|---|---|---|
| 25 kHz | −128 dBm | −118 dBm |
| 500 kHz | −115 | −105 |
| 1 MHz | −112 | −102 |
| 4 MHz | −106 | −96 |
| 10 MHz | −102 | −92 |
| 20 MHz | −99 | −89 |
| 50 MHz (NF 3 dB) | −94 | −84 |

Processing gain G_proc: coherent integration over N pulses or T seconds gives up to 10·log(N) or 10·log(B·T) for signals with known structure (de-chirp, preamble correlation); non-coherent energy integration gives ≈ 5·log(N). For *blind* energy detection of an unknown signal, the matched bandwidth matters most: a 25 kHz FM voice signal detected in a 25 kHz bin is 26 dB "better off" than in a 10 MHz bin. Hence channelisation (polyphase filter bank) is the first processing stage (§5.2).

### 2.4 Worked examples (500 km orbit unless noted)

**(a) 5 W handheld UHF radio, 300 MHz, 25 kHz, ε = 15° (d ≈ 1450 km).** FSPL = 32.45 + 49.5 + 63.2 = 145.2 dB. EIRP 37 dBm (0 dBi). G_rx = 5 dBi. P_rx = 37 − 145.2 + 5 = −103 dBm. N(25 kHz) = −128 dBm → **SNR ≈ 25 dB**. Even with 10 dB of body/antenna/polarisation loss the signal remains ≈ 15 dB above the floor; detection and TDOA/FDOA are feasible. This matches CaJacob et al.'s AIS budget (161 MHz, 12.5 W, 2843 km at 1° elevation, FSPL 145.3 dB, P_rx −112.9 dBm, C/N₀ 15.6 dB in 25 kHz) [2].

**(b) Link-16, 200 W terminal, 1.1 GHz, 3 MHz pulse, d = 1500 km.** FSPL = 156.8 dB. P_rx = 53 − 156.8 + 5 = −98.8 dBm. N(3 MHz) = −107 dBm → **SNR ≈ 8 dB per pulse**. A 10 dBi antenna gives 13 dB; non-coherent integration over a 258-pulse slot adds ≈ 12 dB. Detection of net activity and hop pattern is realistic; the receiver must span 960–1215 MHz instantaneously (255 MHz) or sample a subset of the 51 hop frequencies.

**(c) Mode S transponder 250 W, 1090 MHz, 4 MHz, d = 1500 km.** P_rx = 54 − 156.7 + 5 = −97.7 dBm; N(4 MHz) = −106 → **SNR ≈ 8 dB**; with 10 dBi, 13 dB. Consistent with operational space-based ADS-B.

**(d) GNSS jammers at 1575 MHz, 20 MHz chirp, d = 1500 km (FSPL 159.9 dB), G_rx 5 dBi, N(20 MHz) = −99 dBm.**
- 10 mW PPD (EIRP 10 dBm): P_rx = −144.9 dBm → SNR **−46 dB**. De-chirp processing gain ≈ 10·log(B·T_sweep) = 10·log(20 MHz × 9 µs) ≈ 22.5 dB [15] → −23 dB. **Undetectable.**
- 10 W unit (EIRP 43 dBm): P_rx = −112 dBm → SNR −13 dB raw, **+9 dB after de-chirp**: marginal, detectable only with a 10 dBi antenna and knowledge of the chirp class.
- 100 W–1 kW military jammer with 10 dBi (EIRP 60–70 dBm): P_rx = −95…−85 dBm → **SNR +4…+14 dB raw**, robust with 10 dBi.
Conclusion: space-based GNSS-interference mapping is a *strong-jammer* capability; weak PPDs are detected only statistically as elevated noise over dense areas.

**(e) DJI-class UAS link, 2.44 GHz, 10 MHz OFDM, EIRP 33 dBm.** At d = 1000 km: FSPL = 160.0 dB; with G_rx = 10 dBi, P_rx = −117 dBm; N(10 MHz, NF 2.5) = −101.5 dBm → **SNR −15.5 dB**. At nadir (500 km): −9.5 dB. Required aperture for +10 dB at nadir ≈ 30 dBi (≈ 1.5 m dish at 2.4 GHz, beamwidth ≈ 6°, footprint ≈ 50 km at nadir): not practical for a survey payload. **Not detectable.**

**(f) Military UAS GCS at 915 MHz, 10 W, 500 kHz, 3 dBi upper-lobe toward satellite, d = 1500 km.** FSPL = 155.1 dB; P_rx = 43 − 155.1 + 5 = −107 dBm; N(500 kHz) = −115 dBm → **SNR ≈ 8 dB**; with 10 dBi, 13 dB. Detectable; the 1 W airborne unit is 10 dB weaker and marginal.

**(g) AN/SPY-1, 3.3 GHz, 10 MHz processing bandwidth, d = 2000 km (FSPL 168.8 dB), G_rx 5 dBi.** Peak 6 MW = 97.8 dBm; antenna ≈ 42 dBi **(est.)** → ML EIRP ≈ 140 dBm. P_rx,ML = 140 − 168.8 + 5 = **−24 dBm**: this will saturate any receiver whose chain is set up to see −120 dBm signals (§2.6). Sidelobes at −35 dB → P_rx,SL = −59 dBm → **SNR ≈ 43 dB** in 10 MHz (N = −102 dBm). Even −60 dB far sidelobes give −84 dBm → SNR 18 dB. Large radars are therefore visible continuously through their sidelobes from anywhere in the satellite's field of regard, which is why ELINT satellites have geolocated naval radars since the 1970s (US NOSS/White Cloud, Soviet US-P/Legenda).

**(h) 25 kW marine X-band radar, 9.4 GHz, 20 MHz, d = 2000 km (FSPL 177.9 dB), G_rx 10 dBi.** ML EIRP = 74 + 28 = 102 dBm → P_rx = −66 dBm; N(20 MHz, NF 3) = −98 dBm → **SNR_ML ≈ 32 dB**; sidelobes (−25 dB) → **SNR_SL ≈ 7 dB**. The vertical fan beam (20–25° half-power) means the satellite is in the mainlobe for ε ≲ 12° and in vertical sidelobes above that; a single satellite therefore sees each ship's radar strongly only near its horizon, with intermittent mainlobe sweeps every 1.25–2.5 s (24–48 rpm). Pulse widths of 0.08–1 µs demand ≥ 20–50 MHz instantaneous bandwidth per channel to preserve TOA precision (§6).

**(i) X-band mil-SATCOM VSAT sidelobe, 8.2 GHz, 5 MHz, d = 1500 km, G_rx 15 dBi.** SL EIRP ≈ 55 dBm → P_rx = 55 − 174.2 + 15 = −104 dBm; N(5 MHz, NF 3) = −104 dBm → **SNR ≈ 0 dB**. Marginal: requires a steerable ≥ 25 dBi beam or cueing from other sources.

### 2.5 Mainlobe vs sidelobe, pulsed signals and duty cycle

- Radar antenna sidelobe levels: parabolic reflectors −20 to −30 dB (first), −40 to −50 dB (far); planar phased arrays −30 to −45 dB; marine slotted waveguides −25 to −30 dB **(typical published ranges)**. Backlobes −40 to −60 dB.
- The *intercept probability* per pass is driven by the product of the radar scan pattern and the satellite's dwell on the frequency. With a staring (wide-FOV) receiver and energy detection across the full S/X band, mainlobe intercepts occur once per scan (rotating) or stochastically (AESA), while sidelobe intercepts are continuous whenever SNR_SL > threshold — the design should treat sidelobe detection as the baseline and mainlobe hits as high-SNR bonus events for fine modulation-on-pulse (MOP) characterisation.
- Duty cycle affects *average* power and therefore energy-detection in long FFT bins: a 1 µs pulse at 1 kHz PRF (0.1 %) is 30 dB below its peak in a 1 ms integration. Radar detection therefore uses short-time (µs-scale) detection on wideband channels, not long FFTs; comms detection uses long FFTs on narrow channels. This drives the dual-path architecture in §4.
- Pulse-compressed / LPI radars (FMCW coastal radars at 1–10 W average, solid-state marine radars) spread energy over 10–50 MHz at low peak power; detection needs bandwidth-matched de-chirp or long integration and is the hardest radar class.

### 2.6 Dynamic range and ADC saturation

The payload must simultaneously tolerate −24 dBm radar mainlobe pulses (§2.4g) and resolve −120 dBm comms: ≈ **95–100 dB instantaneous dynamic range**, exceeding any single ADC chain. Consequences and mitigations:

1. **Band segregation** (§4.3): separate RF chains and ADCs for UHF/L (comms-dominated) and S/C/X (radar-dominated), with high-rejection (> 60 dB) band filters, so a saturating S-band pulse does not desensitise the UHF channel.
2. **Fast AGC / step attenuators** (µs response) and **limiters** ahead of the LNA; the chain must recover within a few µs of a strong pulse to preserve TOA of following pulses.
3. **ADC headroom**: a 14-bit RF ADC (SNR ≈ 6.02·ENOB + 1.76; ENOB ≈ 9–10 at GHz input → 56–62 dB over Nyquist) gains 10·log(f_s/2B) processing gain in a narrow bin: at f_s = 5 GSPS and B = 1 MHz, +34 dB → ≈ 90–95 dB spur-free range per bin only if the converter is *not* clipped. Clipping generates broadband intermodulation that destroys the whole Nyquist band for the duration of the pulse.
4. **Pulse blanking**: detect saturation (ADC over-range flag) and blank/flag the affected samples in comms channels.
5. For the comms path, lower-rate higher-ENOB converters (16-bit, 100–250 MSPS, ENOB ≈ 12–13) in a superheterodyne or zero-IF chain give a cleaner 80+ dB range than direct RF sampling at 5 GSPS.

---

## 3. Antenna options

### 3.1 Gain, size and beamwidth fundamentals

```
G ≈ η_ap · (π·D/λ)²  → G(dBi) ≈ 20·log(D/λ) + 9.94 + 10·log(η_ap)      (aperture antennas)
θ_3dB ≈ 70°·λ/D
Footprint diameter at range d ≈ d·θ_3dB (rad)
```

| Aperture D (effective) | 300 MHz (λ = 1 m) | 1 GHz (0.30 m) | 3 GHz (0.10 m) | 10 GHz (0.03 m) |
|---|---|---|---|---|
| 0.3 m | — (electrically small) | 7 dBi / 70° | 17 dBi / 23° | 27.5 dBi / 7° |
| 1.0 m | ~7–10 dBi (helix/LPDA, not aperture-limited) | 17.8 dBi / 21° (footprint ≈ 370 km @ 1000 km) | 27.3 dBi / 7° (120 km) | 37.8 dBi / 2.1° (37 km) |
| 2.0 m (deployable) | 10–13 dBi | 23.8 dBi / 10.5° | 33.3 dBi / 3.5° | 43.8 dBi / 1° |

(η_ap = 55 %.) The table makes the UHF problem explicit: at 300 MHz a 1 m structure is only 1 λ, so gain is 5–10 dBi at best and comes from *length* (axial helix, LPDA) rather than area. It also shows why high-gain X-band apertures are incompatible with wide-area survey unless they are electronically or mechanically scanned, or used as a cued "zoom" channel.

### 3.2 Candidate antenna types by band

| Type | Band fit | Gain | Polarisation | Size on a 150 kg bus | Notes |
|---|---|---|---|---|---|
| Deployable axial-mode helix | 225–1000 MHz | 8–13 dBi (5–12 turns) | Circular (one sense; dual needs two) | 0.3–1.5 m long when deployed, stowed in ~Ø20 cm × 10 cm | Narrow-ish bandwidth (≈ 1.5:1); proven in cubesats (e.g., UHF/S-band helices from several suppliers). Good hemispheric-to-±40° coverage. |
| Quadrifilar helix (QFH) | 137–500 MHz | 3–5 dBi | Circular | 0.3–0.6 m | Excellent hemispheric coverage for wide-FOV UHF survey; low gain. |
| Deployable monopoles/dipoles (tape) | 30–500 MHz | 0–2 dBi | Linear | 0.5–2.5 m elements | Cheapest VHF/UHF coverage; HawkEye Pathfinder used quarter-wave dipoles [1]; pairs form a crude interferometer. |
| Log-periodic dipole array (LPDA) | 0.3–3 GHz (10:1) | 6–8 dBi | Linear (dual needs crossed LPDA) | Longest element ≈ λ_low/2 = 0.5 m at 300 MHz; boom 0.5–0.8 m | Frequency-independent, moderate gain; phase centre moves with frequency (an issue for interferometry calibration). |
| Cavity-backed spiral / sinuous | 1–18 GHz (10:1 or more) | 2–6 dBi | Circular (spiral) / dual-linear or dual-circular (sinuous) | Diameter ≈ λ_low/π: 10 cm for 1 GHz, 1 m for 300 MHz | Classic ESM/DF element; wide beam (≈ 70–90°), stable phase centre, ideal for amplitude- or phase-comparison DF arrays. Sinuous gives both polarisations from one aperture. |
| Vivaldi / tapered-slot array (TSA) | 2–18 GHz ultra-wideband | 5–10 dBi element; arrays 15–25 dBi | Dual-linear | Element ≈ λ_low/2; 8×8 at 2 GHz ≈ 60 × 60 cm | Enables digital beamforming across S/C/X with one aperture; many channels → power. |
| Microstrip patch arrays | Per band (10–15 %) | 4×4: 18–20 dBi; 8×8: 24–26 dBi | Dual-linear or circular | 4×4 at 2.4 GHz ≈ 25 × 25 cm; at 9.5 GHz ≈ 7 × 7 cm | Low profile, body-mounted; stackable multi-band (L/S/X) panels; narrow band per panel. HawkEye used patches [1]. |
| Horns (ridged, wideband) | 2–18 GHz | 10–20 dBi | Dual-linear (quad-ridged) | 10–30 cm | Robust, high-gain, well-defined phase centre; used by HawkEye ("wideband button and horn antennas") [1]. |
| Deployable mesh/rigid reflector | 2–12 GHz | 25–40 dBi | Any (feed-defined) | 1–2 m | Only for a cued, pointed "zoom" channel (e.g., VSAT sidelobes, LPI radars); drives ADCS and mass. |
| Conformal / body-mounted wideband arrays | 1–12 GHz | 10–20 dBi with DBF | Dual | Uses bus faces | Attractive for a 1 m-class bus; phase-stable structure needed. |

### 3.3 What operators fly (open sources)

- **HawkEye 360 Pathfinder (SFL NEMO-15, 13.4 kg wet / 15 kg):** quarter-wave dipoles, patch antennas, wideband button and horn antennas covering VHF–Ku; three independent SDR channels (AD9361 on Zynq 7045), 70 MHz–6 GHz tunable (LNB extension to ≈ 18 GHz), 56 MHz IBW; S-band ISL; X-band downlink 3–50 Mbit/s [1][2]. Later clusters (Defiant bus, ≈ 30 kg) carry an upgraded payload covering 144 MHz–15 GHz [3][4]. Imagery of Cluster 2+ shows deployable VHF/UHF whip elements and larger body panels.
- **Unseenlabs BRO Gen 1 (6U, ≈ 6 kg, GomSpace bus; BRO-12 onward 8U; BRO-14/15 8U at ≈ 510 km SSO):** deployable antenna panels; single-satellite ("monosatellite") geolocation "to the nearest kilometre" [6][7]. **Gen 2 BRO-31 (≈ 150 kg microsatellite, Transporter-17): L, S, C, X and Ku bands** — directly comparable to the bus class considered here [8].
- **Kleos KSM-1 (4 × 6U, ≈ 8 kg each):** VHF maritime-band receivers with "up to six antenna pairs" per cluster for multilateration; later Patrol mission added 8.5–9.6 GHz X-band radar geolocation [9][10].
- **Chinese Yaogan triplets (e.g., Yaogan-9/16/17/20/25/31 series)** fly in ~100 km-scale triangular formations at ~1100 km, widely assessed by OSINT analysts as naval ELINT/ocean-surveillance (NOSS analogues); antenna details are not public. **US NOSS/Intruder** pairs (~1100 km, tens of km spacing) are the historic TDOA reference architecture **(OSINT, unverified)**.

### 3.4 Interferometric direction finding (single-satellite AOA)

Two-element phase interferometer with baseline D:

```
Δφ = (2π·D/λ)·sin θ            θ = angle from boresight
σ_θ = λ·σ_φ / (2π·D·cos θ)      [rad]
Ground error ≈ d·σ_θ / sin ε  (cross-range), worse along the line of sight
```

Example: D = 1 m, f = 1 GHz (D/λ = 3.3), σ_φ = 5° (0.087 rad) → σ_θ = 4.2 mrad → **2.1 km at nadir (500 km), ≈ 4–6 km at 1000 km range**. At 300 MHz the same baseline gives 13 mrad → 6.5–13 km. At 3 GHz with D = 1 m and 5° phase error: 1.4 mrad → 0.7–1.4 km. Achieving σ_φ = 5° at 1 GHz requires residual phase-path errors < 4 mm, i.e., thermally stable cabling, matched LNAs and on-orbit calibration with known beacons (AIS base stations, ADS-B ground references, or dedicated calibration beacons).

**Ambiguity:** phase wraps when D > λ/2, so D = 1 m at 1 GHz (3.3 λ) has ≈ 6 ambiguous lobes across ±90°. Resolutions: (a) a short unambiguous baseline (λ/2) plus long precise baselines (coarse/fine), (b) three or more non-collinear elements (planar array, correlative interferometry), (c) combining AOA with the Doppler history over the pass. For UHF, a 2.5 m deployable boom with elements at 0.5/1.0/2.5 m is a realistic coarse/fine set **(est.)**. Correlative (pattern-matching) interferometry with 4–6 wideband elements over 1–12 GHz is the standard ESM approach and tolerates mutual coupling via calibration tables.

### 3.5 Swept beam vs wide field of view

Search-rate argument: a staring 70° beam sees the whole footprint continuously with G ≈ 7 dBi; a 7° beam (27 dBi at 3 GHz) covers 1/100 of the solid angle and must revisit 100 cells per pass (≈ 8 min above 10°) → ≈ 5 s per cell, which is longer than a radar scan period (fine for radars) but short compared with PTT comms bursts (poor). Practical compromise used in ESM systems: **wide-FOV omnidirectional channels for detection/alarm, plus one or two steerable high-gain channels (digital beamforming array or gimballed horn) cued for characterisation and precise AOA.**

### 3.6 Polarisation

Ground comms are predominantly vertical, marine radars horizontal, aircraft antennas vary, and the geometry from LEO rotates apparent polarisation; Faraday rotation adds tens of degrees at 300 MHz (≈ 1/f² scaling, ~1° at 3 GHz). A single linear polarisation risks 10–30 dB fades; dual-polarised (dual-linear or dual-circular) elements with polarisation diversity combining limit the loss to ≤ 3 dB and yield polarisation as a classification feature.

---

## 4. Receiver architecture

### 4.1 Direct RF sampling (RFSoC) vs tuner-based superheterodyne

| | Direct-sampling RFSoC | Superheterodyne / zero-IF tuner + ADC |
|---|---|---|
| Example | AMD Zynq UltraScale+ RFSoC ZU48DR: 8 × 14-bit ADC up to 5 GSPS, 8 × 14-bit DAC to 10 GSPS, 930k logic cells, 4272 DSP slices [19] | AD9361-class (70 MHz–6 GHz, 56 MHz IBW, 12-bit) as flown on HawkEye Pathfinder [1]; ADRV9009/ADRV9040-class (200–450 MHz IBW); discrete LO + 16-bit 250 MSPS ADC |
| Instantaneous bandwidth | ≈ 2 GHz Nyquist per ADC (first/second Nyquist zones to ~6 GHz with input BW limits); sub-bands via digital down-converters | 56–450 MHz per tuner; agile hopping across bands |
| Coherent channels | 8 phase-coherent ADCs on one die — ideal for interferometry/DBF | Multi-tuner coherence needs shared LO distribution and calibration |
| Dynamic range | ENOB ≈ 9–10 at GHz → 56–62 dB over Nyquist; +processing gain in narrow bins | 16-bit ADCs ENOB 12–13 → 75–80 dB; analog pre-selection protects from out-of-band radars |
| Power | 30–60 W for a full 8-channel RFSoC board at high sample rates **(est. from vendor boards)** | 5–15 W for 2–4 tuner channels |
| Radiation | Commercial die, 16 nm FinFET; needs SEU mitigation (§7); space-grade XQRFSoC exists at high cost | Mature COTS, extensively flown |
| Fit | S/C/X radar path (wide IBW, PDW extraction, DBF) | UHF/L comms path (narrowband, high dynamic range, low power) |

A dual-path hybrid is the recommended direction: **(1) a tuner-based, high-dynamic-range comms receiver (4 coherent channels, 100–200 MHz IBW each, 70 MHz–6 GHz) and (2) a direct-sampling radar receiver (4–8 coherent channels, 1–2 GHz IBW, block-downconverted from S/C/X into the ADC's first Nyquist zone).** This mirrors how modern ESM suites split "comms ESM" and "radar ESM".

### 4.2 Frequency plan and filter banks

Block down-conversion with a shared, GNSS-disciplined 100 MHz OCXO reference (phase noise and absolute accuracy drive FDOA, §6):

| Sub-band | Coverage | Path | Pre-select filter | Notes |
|---|---|---|---|---|
| UHF-lo | 225–512 MHz | Direct to ADC (1st Nyquist) or tuner | 225–512 bandpass, > 60 dB rejection of 800–1000 MHz cellular | Cellular/TETRA desensitisation risk; notch for 380–400 if TETRA is not a target |
| L | 960–1700 MHz | Tuner, 200 MHz IBW agile; optional whole-band direct sampling for Link-16 hop-following | Split 960–1215 / 1215–1300 / 1525–1700 | Includes IFF, Link-16, GNSS bands, L-MSS, AEW L-band |
| S | 2.0–4.0 GHz | Block down-convert to 0–2 GHz IF → RFSoC | 2.0–2.5 / 2.5–3.0 / 3.0–4.0 | Own S-band TT&C transmitter (2.2–2.29 GHz) must be notched / time-gated |
| C | 4.0–8.0 GHz | Two 2 GHz blocks → RFSoC | 4–6 / 6–8 | Patriot C-band, C-VSAT, 5.8 GHz |
| X | 8.0–12.0 GHz | Two 2 GHz blocks → RFSoC | 8–10 / 10–12 | Own X-band downlink at 8.025–8.4 GHz: receive blanked or notched during transmission |

### 4.3 LNA and gain budget

Per chain: limiter (−) → pre-select filter (−1 to −1.5 dB) → LNA (G 20–30 dB, NF 0.5–1.2 dB at L/S/X; 0.3–0.6 dB at UHF) → step attenuator 0–31 dB (for AGC) → block converter/tuner → anti-alias filter → ADC. Cascaded NF ≈ 2–3 dB. Total gain is set so the thermal floor sits ≈ 10–15 dB above the ADC quantisation floor (LSB), leaving ≈ 60–70 dB headroom to full scale for the direct-sampling path and ≈ 80 dB for the tuner path; the step attenuator extends the strong-signal range by another 30 dB in µs.

### 4.4 Channel count, mass and power on a 150 kg bus

| Element | Mass **(est.)** | Power (collection mode) **(est.)** |
|---|---|---|
| Antennas: 2–4 deployable UHF elements/helices, 4–6 wideband spirals/sinuous (1–12 GHz) for DF, 1–2 S/X patch panels or horns | 10–20 kg | — |
| RF front-ends (8–12 chains, filters, LNAs, converters, LO distribution) | 5–8 kg | 20–35 W |
| Digitiser/processor (RFSoC board + FPGA/GPU co-processor + 1–2 TB storage) | 6–10 kg | 60–120 W |
| Timing (GNSS receiver, OCXO/CSAC) | 1–2 kg | 3–6 W |
| Harness, thermal straps, shielding | 3–6 kg | — |
| **Payload total** | **≈ 25–45 kg** | **≈ 90–160 W** collecting; 20–40 W standby |

Reference points: HawkEye Pathfinder entire spacecraft 13.4 kg wet [1] (whole-satellite, payload mass not published); Cluster 2+ spacecraft ≈ 30–30.5 kg [3][4]; Unseenlabs Gen 1 6U ≈ 6 kg [7], Gen 2 ≈ 150 kg [8]; Kleos 6U ≈ 8 kg [9]. A 150 kg bus typically affords 30–40 % payload mass and 150–300 W orbit-average power, so the budget above is comfortable and leaves room for a steerable high-gain channel.

### 4.5 EMC, self-interference, thermal

- The spacecraft's own emitters (S-band TT&C ≈ 2–5 W, X-band downlink 5–20 W RF, GNSS receiver LO, switching regulators, reaction-wheel drivers, OBC clocks) are 100+ dB stronger than the signals of interest. Measures: receive blanking during downlink, > 80 dB isolation to the X-band receive path (filters + antenna placement on opposite faces), conducted-emission filtering on all payload power lines, shielded enclosures, and a payload self-test that records the on-orbit interference "fingerprint" to subtract or mask.
- Bus unintentional emissions in UHF (DC/DC converters at 100 kHz–2 MHz and harmonics) are the dominant threat to the 225–512 MHz band; a UHF-quiet design rule for the bus is a Phase A requirement.
- Thermal: LNA gain and phase drift (~0.01 dB/°C and ~0.5–1°/°C per stage **(est.)**) directly degrade interferometric AOA; front-ends for DF channels should be co-located on a temperature-controlled plate (±2 °C) with matched cable lengths, and phase calibration injected periodically through a coupled calibration tone.

---

## 5. On-board processing and data handling

### 5.1 Why raw IQ downlink is infeasible

```
R_IQ = 2 · B · n_bits · N_ch
```

Four coherent channels at 100 MHz IBW, 12 bits: 2 × 100e6 × 12 × 4 = **9.6 Gbit/s** (≈ 104 TB/day). Eight RFSoC channels at 5 GSPS × 14 bits raw: 560 Gbit/s. A good X-band downlink delivers ≈ 100–200 GB/day (§5.6), i.e., 0.1–0.2 % of the modest 4-channel case. Everything else must be reduced on board.

### 5.2 Processing chain

1. **Channelisation:** polyphase filter bank (PFB) producing e.g. 4096 × 25 kHz bins across 100 MHz for comms, and 64 × 31 MHz bins across 2 GHz for radar; per-bin noise-floor estimation (order-statistic CFAR) and energy detection (threshold 10–13 dB above floor for P_fa ≈ 1e-6).
2. **Radar path — pulse descriptor words (PDW):** on every threshold crossing in the wideband path, measure TOA (resolution ≈ 1/f_s to a few ns with interpolation), pulse width, pulse amplitude, carrier frequency (via instantaneous frequency or FFT), AOA/phase (from coherent channels), polarisation ratio, intra-pulse modulation flag (LFM slope / phase code). Typical PDW 128–256 bits. At 10⁵ pulses/s this is 13–26 Mbit/s — still too high for continuous downlink, so:
3. **Deinterleaving and emitter formation:** cluster PDWs by AOA/frequency/PW, then PRI analysis (CDIF/SDIF histograms, PRI transform) to separate interleaved trains and label PRI type (constant, stagger, jitter, dwell-and-switch), scan period from amplitude modulation of successive mainlobe passes, frequency agility pattern. Output: an emitter report of ~1–2 kB per emitter per dwell plus a short IQ "exemplar" (10–100 pulses).
4. **Comms path — signal reports:** for each detected channel occupancy: centre frequency, bandwidth, start/stop, power, AOA, modulation class and symbol rate (cyclostationary / CNN classifier on IQ or spectrogram), hop-pattern statistics for FH nets. Classifier inference fits on an FPGA DPU or an embedded GPU (Jetson Orin-class, 15–40 W, COTS, now flown on several LEO missions **(est.)**).
5. **Snapshot capture:** on detection of a signal of interest (SOI list, geographic area of interest, or novelty), store a time-stamped IQ snapshot (10–500 ms comms; 1–20 ms radar) for ground-based TDOA/FDOA cross-correlation, fine MOP analysis and library building. Each snapshot carries GNSS time (≤ 20 ns), satellite PVT and attitude.
6. **Catalogue matching on board:** compare emitter reports with an uploaded signature library (frequency, PRI, PW, scan, MOP; or modulation/bandwidth for comms) to prioritise downlink and to generate low-latency alerts over a relay link.

### 5.3 Snapshot and storage sizing

| Snapshot type | Decimated rate | Duration | Size (2 × 16 bit) |
|---|---|---|---|
| 25 kHz comms (TDOA/FDOA) | 50 kSPS | 100 ms | 20 kB |
| 1 MHz FH/data link | 1.25 MSPS | 200 ms | 1 MB |
| 20 MHz radar band | 25 MSPS | 10 ms | 1 MB |
| 100 MHz radar band | 125 MSPS | 10 ms | 5 MB |

At 2000 comms snapshots + 500 radar snapshots per orbit: ≈ 1–3 GB/orbit, 15–45 GB/day. Storage of 1–2 TB (radiation-screened NAND with ECC) buffers 1–2 weeks against ground-segment outages.

### 5.4 Downlink sizing

- COTS X-band transmitters: ~100 Mbit/s class (e.g., Syrlinks EWC27, ~0.3 kg, ~10 W DC [26]) up to ~1 Gbit/s class (Syrlinks XONOS, IQ Spacecom XLink-X, DVB-S2 / CCSDS 131.2) at 20–40 W DC **(vendor-stated classes; verify current datasheets)** [27]. A 150 kg bus can accommodate the 1 Gbit/s class with a ≥ 15 dBi X-band antenna.
- Contacts: a 500 km SSO sees a polar station (Svalbard/Troll) ≈ 10–12 of 15 orbits/day, 5–8 min each above 10°; a mid-latitude station (e.g., Greece, 38–40° N) sees 3–5 usable passes/day for SSO and 4–6 for a 40–50° inclination orbit. For a 40–50° inclination constellation (regional focus), polar stations are useless and a mid-latitude ground network is required.
- Volume: 500 Mbit/s × 6 min × 5 passes ≈ **110 GB/day**; 1 Gbit/s × 7 min × 10 passes (polar SSO) ≈ **525 GB/day**. Both exceed the §5.3 reduced-data volume, confirming that reduction to reports + selected snapshots (not raw IQ) is the correct operating point.
- Latency: store-and-forward gives 45–100 min typical, up to 12 h for regional targets with a single ground station; inter-satellite or commercial relay links (Unseenlabs cut delivery time by 3× through KSAT integration [6]) and on-board alerting bring tactically useful latency to minutes for prioritised emitters.

---

## 6. Geolocation techniques

### 6.1 Single-satellite techniques

**(a) AOA / interferometry** (see §3.4): σ_θ = λ·σ_φ/(2π·D·cos θ); ground error ≈ d·σ_θ. Typical: 1–10 km per snapshot from 500–1500 km range with 1 m baselines at L-band; averaging n independent snapshots across a pass improves as 1/√n and the changing geometry breaks the mirror ambiguity. Requires phase calibration (§4.5) and an attitude knowledge of ≈ 0.05–0.1° (1 mrad = 1 km at 1000 km) — this sets a star-tracker-class ADCS requirement for any AOA-based product, far tighter than HawkEye Pathfinder's 2.1° (2σ) pointing [1].

**(b) Doppler / frequency-of-arrival (FOA) over a pass.** Received frequency:

```
f_r(t) = f_0·(1 − (v_sat(t)·û(t))/c) + δf        û = unit vector satellite→emitter, δf = unknown emitter offset
Max Doppler (f_0 = 1 GHz, v = 7.6 km/s): ±25 kHz
Doppler rate at closest approach: ḟ ≈ −(f_0/c)·v²/d  → 385 Hz/s at d = 500 km, 193 Hz/s at 1000 km
```

Fitting f_r(t) over 1–8 minutes with unknowns (lat, lon, δf) and an Earth-surface constraint yields a fix; the Doppler curve is left/right symmetric about the ground track, so a *mirror ambiguity* remains unless broken by antenna pattern, AOA or a second pass. Sensitivity: position error ≈ λ·σ_f·d/v × geometry factor (1–10): with λ = 0.3 m, d = 1000 km, v = 7.6 km/s → ≈ 40 m per Hz of frequency error (×1–10). The emitter must hold frequency to ~1e-8–1e-9 over the observation (crystal-controlled radios and radars do; cheap VCO jammers and FH nets do not). Published results: Clements et al. geolocated a stationary S-band spoofing transmitter from a single Spire satellite in one 20 s capture to **68 m** error with a 6.7 km 95 % semi-major axis, with simulated worst cases of 2–24 km [14]; FoA-based interference localisation studies show satellite-velocity error and oscillator offset (≈ 50 Hz bound) as dominant terms [13]. Unseenlabs' entire Gen 1 product is single-satellite geolocation "to the nearest kilometre" [6], almost certainly Doppler/multi-snapshot based **(inference)**.

**(c) Multi-pass triangulation.** Lines of bearing or Doppler fixes from successive passes (90–100 min apart for one satellite; the geometry changes by 20–25° of longitude) intersect; accuracy improves to the few-hundred-metre class for stationary emitters over days, which is adequate for fixed radar sites and SATCOM terminals but useless for moving ships/vehicles.

**(d) TDOA against a known reference.** With a cooperative/known emitter (AIS base station, ADS-B site, calibration beacon) in the same footprint, the differential TOA between reference and target through the same receiver cancels clock and path biases; this is the single-satellite analogue of the gateway-reference scheme in [13] and is used for payload calibration rather than as a primary product.

### 6.2 Multi-satellite TDOA / FDOA

**TDOA.** For satellites i, j at r_i, r_j and emitter at x:

```
Δτ_ij = (|x − r_i| − |x − r_j|)/c + (b_i − b_j)        b = clock biases
```
Each pair defines a hyperboloid; with the Earth-surface constraint, **2 satellites give a curve (ambiguous), 3 give a point (plus mirror), 3–4 with FDOA or a 4th satellite remove ambiguity** [2][11].

**Thermal-noise TDOA accuracy (Stein form, used by HawkEye 360 [2]):**

```
σ_τ ≈ 1 / ( β · sqrt( B·T·γ ) )
β = 2π·B_rms  (rectangular spectrum: B_rms = B/√12 → β ≈ 1.81·B)
γ = effective SNR = 1 / (1/γ₁ + 1/γ₂ + 1/(γ₁γ₂))
σ_f ≈ 1 / ( T_e · sqrt( B·T·γ ) ),  T_e ≈ 1.81·T
```

The CRLB for TDOA-only geolocation scales with 1/(η·ρ) where η = W_e²/c² (W_e RMS bandwidth) and ρ = E_s/N₀, with horizontal error improving as 1/N for N satellites and growing ≈ h² with altitude [12].

Examples:
- 25 kHz voice channel, T = 100 ms (BT = 2500), γ = 10 dB: σ_τ ≈ 0.55/(25e3 × 158) ≈ **139 ns ≈ 42 m** of range-difference.
- 1 MHz radar pulse, single 1 µs pulse, γ = 20 dB: σ_τ ≈ 55 ns ≈ 16 m; 100 pulses → **1.6 m**.

**Geometric dilution.** Ground error ≈ GDOP × σ_d with GDOP ≈ d/L for baseline L (order of magnitude; exact value from the Jacobian H and covariance, CEP from projecting the error ellipsoid on the local tangent plane [2]). For d = 1000 km and L = 100 km, GDOP ≈ 10 → 25 kHz comms ≈ 400 m (thermal) and radar ≈ 20–160 m, before clock, ephemeris and propagation terms. Error degrades along the formation's ground-track direction and is best perpendicular to it [11] for emitters ahead of or behind the formation. **Study-simulator note (Oct 2026):** the CRLB evaluated in this study's TDOA/FDOA simulator shows the weak axis is in general the *radial* direction emitter→formation; at closest approach (emitter abeam) that is the cross-track direction, and a perfectly collinear along-track formation is degenerate for emitters under its track — which is why HawkEye flies a 20 km out-of-plane oscillation and the TALOS baseline carries a ±20 km cross-track offset. The GDOP ≈ d/L rule applies along the baseline; across it the factor is ≈ d/W for cross-track width W, and hybrid TDOA+FDOA removes most of that penalty.

**Error budget terms:**

| Term | Typical value | Range-difference error | Notes |
|---|---|---|---|
| Thermal noise | §6.2 | 2–140 m | dominant for narrowband comms [2] |
| Clock sync (GNSS-disciplined) | 5–20 ns (HawkEye assumed 20 ns [2]); CSAC holdover ADEV ≈ 3e-10 @1 s, ~1e-11 @1000 s **(vendor-class est.)** | 1.5–6 m | 1 ns = 0.3 m. Leiter & Gurfil: σ_t 20 ns → 0.2–3 km CRLB maps; 100 ns → 1–15 km with 3 satellites at 100 km spacing [11] |
| Satellite position | 1–10 m (GNSS) [2] | 1–10 m (×GDOP) | post-processed POD 10–30 cm possible |
| Satellite velocity (FDOA) | 1 cm/s ≈ 20 ns-equivalent [2] | — | drives FDOA bias |
| Ionosphere/troposphere differential | metres at L-band, tens of m at UHF **(est.)** | 1–30 m | partially common-mode for close baselines |
| Emitter motion during integration | ship at 10 m/s × 0.1 s = 1 m | small | aircraft (250 m/s) require short snapshots |

**FDOA.** Iso-Doppler surfaces from Δf_ij = (f_0/c)·(ṙ_i − ṙ_j). For two satellites L = 100 km apart along-track at d = 1000 km and f_0 = 1 GHz, the FDOA spans ≈ 2.5 kHz across the footprint and the ground gradient is ≈ 2.5 mHz/m (≈ **400 m per Hz** of FDOA error). Thermal FDOA for the 25 kHz / 100 ms / 10 dB case: σ_f ≈ 0.035 Hz → ≈ 14 m — FDOA is very powerful for narrowband emitters and is why coplanar (poor TDOA geometry) formations still work [2]. Requirements: the two LOs must agree to ≪ 0.1 Hz at 1 GHz (1e-10 relative) over the snapshot → GNSS-disciplined OCXOs (short-term 1e-11–1e-12) are adequate, free-running TCXOs are not; emitter drift during the snapshot must be ≪ 0.1 Hz (fails for FH nets, OK for radars and fixed-frequency comms).

**Hybrid TDOA/FDOA** (cross-ambiguity function, CAF) is standard: Kleos cross-correlates time-aligned, downlinked recordings pairwise, extracts TDOA and FDOA from the CAF peak, solves by iterative non-linear least squares with a zero-altitude constraint, and reports a confidence ellipse [10]; HawkEye combines TDOA/FDOA across the three-satellite cluster with GNSS-disciplined clocks and an S-band inter-satellite link for on-orbit geolocation [1][2].

**Reported accuracies.** HawkEye 360 publishes no numeric accuracy; products carry a 95 % confidence ellipse that depends on signal type, power, SNR and geometry [1][3]. Kleos' Cape Verde test (4.2 W VHF beacon, 145.175 MHz, 4-satellite cluster) produced errors of **0.32–32 km** with a best ellipse of 4.5 × 0.26 km [10]. Unseenlabs claims "nearest kilometre" from one satellite [6]. Simulations with 3 satellites at 100 km spacing and 20 ns clocks give 0.2–3 km CRLB [11]. A conservative planning figure for narrowband comms is **1–5 km (95 %) per cluster pass, hundreds of metres for wideband radars**, improving with revisits **(est.)**.

### 6.3 Formation flying

- HawkEye: three spacecraft 125 km (later 250 km) along-track, middle spacecraft with 20 km peak-to-peak out-of-plane oscillation, formation control 5 km (1σ), near-circular J2-invariant orbits; NCO formation ΔV budget ≈ 35/29/5 m/s of 100 m/s available over 3 years; altitudes 550–650 km preferred for drag vs disposal [1][2].
- Kleos: diamond of four in two planes offset by ≈ 1° RAAN and ≈ 1° true anomaly (≈ 120 km) [10].
- Leiter & Gurfil: ~100 km quasi-planar formation, GPS-PPS timing, 10 pulses → ≈ 1 km RMS with three satellites, 2 km with two [11].
- Baseline trade: larger L lowers GDOP (≈ d/L) but shrinks the common footprint and breaks co-visibility at low elevation; 50–250 km is the practical window for 500 km orbits. Relative navigation via differential GNSS (metres) suffices; the ISL or ground must share PVT and clock states.

### 6.4 ISL coherent processing vs ground cross-correlation

| | On-orbit (ISL, HawkEye-style) | Ground (Kleos-style) |
|---|---|---|
| Data exchanged | snapshots or detection reports over S-band ISL (hundreds of kbit/s–few Mbit/s) | all snapshots downlinked from every satellite |
| Snapshot volume for cross-correlation | 25 kHz × 100 ms ≈ 20 kB per satellite per emitter — trivially shared; 20 MHz × 10 ms radar ≈ 1 MB — feasible over a Mbit/s ISL for prioritised targets | same volumes × N satellites × all candidates |
| Latency | minutes (alerts) | one downlink cycle (45–100 min+) |
| Complexity | ISL hardware, on-board CAF, relative time transfer | simpler spacecraft, more downlink |
| Recommended phasing | Phase 2 (constellation) | Phase 1 (first cluster) |

A pragmatic path: downlink time-stamped snapshots for ground CAF processing from the first cluster; add an ISL (S-band or optical) and on-board CAF for low-latency tactical alerts later.

---

## 7. Radiation, reliability and environment

- **TID.** At 500–600 km SSO behind ≈ 2.5 mm Al, mission-class design values of ≈ 20 krad(Si) are used by cubesat/microsat programmes (CAMELOT platform spec: "500–600 km SSO equivalent 20 kRAD TID" [20]); annual dose ≈ 1–4 krad depending on shielding and solar cycle **(est.)**. A 30–50° inclination orbit at 500 km avoids the polar horns but crosses the South Atlantic Anomaly on every orbit, giving a comparable TID dominated by trapped protons **(est.)**. Both are benign for screened COTS over 3–5 years.
- **Single-event effects.** Polar passes and the SAA raise SEU rates by an order of magnitude or more (count rates 60× higher near the poles in [20]). Mitigation for the RFSoC/FPGA: configuration memory scrubbing (SEM IP), TMR of control logic, ECC on DDR and NAND, watchdogs with staged resets, latch-up current monitors with fast power cycling on all COTS rails, and the acceptance that the payload may be reset several times per month. Flight heritage of Zynq-7000/UltraScale+ on dozens of LEO missions supports a COTS-plus-mitigation approach; the XQR space-grade RFSoC is an option if budget allows.
- **COTS screening.** Lot-level TID testing (Co-60 to 20–30 krad), proton SEE testing of the ADC/FPGA/NAND, derating, and redundancy at the board level (dual payload computers, cold spare front-ends).
- **Disposal.** FCC rule (adopted 29 Sep 2022): LEO satellites must deorbit within 5 years of mission end [21]. ESA's Zero Debris approach targets a stop to new debris generation by 2030, including prompt post-mission disposal and ≥ 90 % disposal success probability under its updated requirements (ESSB-ST-U-007) [22]. Natural decay from 500 km takes 5–25 years depending on area-to-mass and solar activity; a 150 kg bus at 500–550 km therefore needs **propulsion for controlled lowering (ΔV ≈ 30–60 m/s to ≤ 350 km)** or a drag device, plus formation-keeping ΔV (≈ 30–70 m/s over 3 years per [2]) → budget ≥ 100 m/s **(est.)**. Lifetime target 3–5 years is consistent with HawkEye (3 years) [4] and the 5-year rule.

---

## 8. Regulatory, spectrum and legal

- **Receive-only payload.** No ITU frequency assignment is needed for passive reception, and a receive-only space station cannot claim protection from interference. The spacecraft still needs ITU filings (via the national administration, in Greece the EETT/Ministry of Digital Governance) for **TT&C (S-band 2025–2110 MHz up / 2200–2290 MHz down) and the X-band data downlink (8025–8400 MHz, EESS)**, coordination with existing networks, and ground-station licences.
- **National authorisation.** Greek Law 4508/2017 (as amended by Law 4712/2020) governs authorisation of space activities carried out from Greek territory or by Greek entities, requires debris-mitigation provisions, environmental reporting before/after launch and at end of life, possible insurance conditions, and registration in a National Register of Space Objects; the Minister of Digital Governance issues the authorisation [23]. A 150 kg SIGINT satellite would be the first such Greek-licensed military-relevant payload, so early engagement with the Hellenic Space Center and the Ministry of National Defence is advisable **(assessment)**.
- **Export control.** Payload subsystems and know-how are likely to fall under: ITAR USML Category XI (military electronics; XI(a) covers electronic combat/SIGINT-class equipment) and Category XV (spacecraft and specially designed components; spacecraft performing SIGINT/ELINT missions are enumerated — check current 22 CFR §121.1 paragraphs) for any US-origin part; EU Dual-Use Regulation 2021/821 Annex I, notably **5A001.e (radio direction-finding equipment > 30 MHz with ≥ 10 MHz instantaneous bandwidth and LOB capability against non-cooperating emitters with signal duration < 1 ms)**, 5A001.b/f items, 6A008 (radar-related), 9A004 (spacecraft) [24], and the EU Common Military List ML11 for military-specification versions. US GNSS/timing components also carry specific controls [25]. Practical consequence: prefer EU/ESA-member suppliers for RF front-ends, FPGA boards and timing to avoid ITAR re-export constraints on the finished satellite and its data.
- **Interception law.** Commercial operators (HawkEye 360, Unseenlabs, Kleos) collect *externals* only — frequency, time, bandwidth, modulation, power, location — and do not demodulate content [1][3][9]. Content interception is governed by national criminal and constitutional law (in Greece, Article 19 of the Constitution and Law 2225/1994 on lifting the secrecy of communications) and by ECHR Article 8; a state operator may lawfully perform it under its intelligence mandate, a commercial entity may not. The architecture in §5 is therefore built around metadata/PDW extraction and signature libraries, with demodulation capability as an optional, separately governed mode.

---

## 9. Reference architectures

**A. HawkEye 360 Pathfinder / Hawk clusters [1][2][3][4].** *Block diagram (text):* VHF–Ku antenna suite (dipoles, patches, wideband button and horn antennas) → custom RF front-end with switchable filter/LNA/attenuator paths and a Ku-band LNB → 3 × AD9361 SDR transceivers (70 MHz–6 GHz, 56 MHz IBW each; two share an LO) on a Xilinx Zynq 7045 (ARM + Kintex FPGA, GNU Radio) → GPS-disciplined timing (≈ 20 ns) → S-band ISL for on-orbit TDOA/FDOA → X-band downlink 3–50 Mbit/s and S-band TT&C → KSAT ground network. Bus: SFL NEMO-15, 13.4 kg wet, 2.1° pointing, water electro-thermal propulsion (96 m/s). Formation: three spacecraft 125–250 km along-track, 20 km cross-track oscillation, 5 km (1σ) control. Later clusters: SFL Defiant bus ≈ 30 kg, payload 144 MHz–15 GHz, 42 satellites in 14 clusters by 2026, revisit at 40° N improved from 75 min (2021) to 45 min (2022). Lesson: start with modest SDRs and a tight cluster; grow bandwidth and bus size as the signal library and demand mature.

**B. Kleos Scouting Mission KSM-1 [9][10].** *Block diagram:* VHF maritime-band antennas (several pairs) → VHF receivers with onboard AIS decoder → high-precision GNSS time-stamping of raw IQ plus ADCS attitude/position logging → store-and-forward downlink → ground time alignment → time/frequency slicing → pairwise CAF (TDOA + FDOA) → blind measurement filtering → NLLS with zero-altitude constraint → emitter position + confidence ellipse. Platform: 4 × 6U (≈ 8 kg) in a diamond across two planes (≈ 1° RAAN, ≈ 1° anomaly), 550 km × 37° (later 525 km SSO); X-band 8.5–9.6 GHz radar geolocation added on the Patrol mission. Demonstrated 0.32–32 km on a 4.2 W VHF beacon. The company ceased operations in 2023 **(verify)**; the architecture is nonetheless the cleanest published "ground-correlation" reference.

**C. Unseenlabs BRO Gen 1 → Gen 2 [6][7][8][29].** *Block diagram:* deployable antenna panels → wideband spectrum-monitoring receiver → onboard detection → downlink via KSAT → single-satellite geolocation (proprietary; Doppler/multi-snapshot inferred) "to the nearest kilometre". Gen 1: 6U → 8U, ≈ 6 kg, GomSpace bus, ~500–550 km SSO (one 45° unit), > 15 launched 2019–2024, ESA EDAP+ quality assessment published. Gen 2 BRO-31: ≈ 150 kg microsatellite covering L/S/C/X/Ku for maritime, land and space-domain RF detection — the closest existing analogue to the bus and mission in this study and a strong indicator that the 150 kg class is where single-satellite wideband RF monitoring is heading.

**D. Academic / agency references.** Leiter & Gurfil (Technion) real-time TDOA geolocation with a 100 km quasi-planar formation, GPS-PPS timing, 1–2 km RMS after 10 pulses [11]; Clements et al. (UT Austin, Spire data) single-pass single-satellite Doppler geolocation of a spoofing transmitter to 68 m [14]; FoA single-satellite interference localisation with oscillator-error modelling [13]; asymptotic TDOA CRLB scaling with N satellites and altitude [12]; Aerospace Corporation policy review of commercial RF collection [30]; ESA EDAP+ technical note on BRO data quality [29].

### Design implications for a 100–150 kg Greek SIGINT microsatellite (synthesis)

1. Build a **dual-path receiver** (tuner-based high-dynamic-range comms path 70 MHz–6 GHz; direct-sampling RFSoC radar path 2–12 GHz) with 8–12 coherent channels, 25–45 kg, 90–160 W.
2. Antennas: deployable UHF helices/dipoles for 225–512 MHz; 4–6 wideband sinuous/spiral elements forming a 1–12 GHz correlative interferometer with ≥ 1 m baselines; S/X patch panels or horns; everything dual-polarised; one optional steerable high-gain channel.
3. Timing: GNSS-disciplined OCXO (≤ 20 ns, ≤ 1e-11 short-term) with CSAC holdover; star-tracker ADCS (≤ 0.05°) if AOA products are required.
4. Processing: PFB channelisation, CFAR detection, PDW extraction/deinterleaving on FPGA, ML classification on FPGA/GPU, triggered IQ snapshots, 1–2 TB storage, 0.5–1 Gbit/s X-band downlink to a Greek/Mediterranean ground network sized for a 40–50° inclination orbit.
5. Geolocation roadmap: single-satellite Doppler + multi-pass + AOA (1–10 km class) → 3-satellite cluster TDOA/FDOA with 50–250 km baselines (hundreds of metres to few km) → ISL for tactical latency.
6. Compliance: Greek Law 4508/2017 authorisation, ITU filings for TT&C/X-band, EU dual-use/ML11 handling of the payload, controlled-reentry propulsion for the 5-year disposal rule.

---

## Sources

[1] eoPortal, "HawkEye 360" mission page — https://www.eoportal.org/satellite-missions/hawkeye-360
[2] D. CaJacob, N. McCarthy, T. O'Shea, R. McGwier (HawkEye 360), "Geolocation of RF Emitters with a Formation-Flying Cluster of Three Microsatellites," SSC16-VI-5, AIAA/USU Small Satellite Conference 2016 — https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=3379&context=smallsat
[3] HawkEye 360, "RF for Arctic Domain Awareness" briefing (2021) — https://tedstevensarcticcenter.org/wp-content/uploads/2023/09/HawkEye-360-Arctic-Brief.pdf
[4] Gunter's Space Page, "Hawk 2A-C, ..., 14A-C" — https://space.skyrocket.de/doc_sdat/hawk-2a.htm
[5] Wikipedia, "HawkEye 360" — https://en.wikipedia.org/wiki/HawkEye_360
[6] eoPortal, "BRO (Breizh Reconnaissance Orbiter) / Unseenlabs" — https://www.eoportal.org/satellite-missions/unseenlabs
[7] Gunter's Space Page, "BRO 1, ..., 11" — https://space.skyrocket.de/doc_sdat/bro-1.htm
[8] Asia-Pacific Defence Reporter, "Unseenlabs deploys second-gen satellite for RF detection" (BRO-31, ≈ 150 kg, L/S/C/X/Ku) — https://asiapacificdefencereporter.com/unseenlabs-deploys-second-gen-satellite-for-rf-detection/
[9] eoPortal, "Kleos Commercial RF Monitoring CubeSat Constellation" — https://www.eoportal.org/satellite-missions/kleos
[10] Space & Defense, "Kleos Space Releases Technical Paper Showcasing Technical Capability" (Cape Verde beacon test) — https://spaceanddefense.io/kleos-space-releases-technical-paper-showcasing-technical-capability/
[11] N. Leiter, P. Gurfil, "Real-Time Geolocation with a Satellite Formation," SSC13-VIII-2 — https://digitalcommons.usu.edu/cgi/viewcontent.cgi?httpsredir=1&article=2967&context=smallsat
[12] "Asymptotic Performance of TDOA Estimation using Satellites," arXiv:2106.01025 — https://arxiv.org/pdf/2106.01025
[13] "Frequency of Arrival-based Interference Localization Using a Single Satellite," arXiv:1608.00350 — https://arxiv.org/pdf/1608.00350
[14] Z. Clements et al. (UT Austin Radionavigation Lab), "Single-Satellite-Based Geolocation of Broadcast GNSS Spoofers from a Low Earth Orbit," NAVIGATION 73(1) — https://radionavlab.ae.utexas.edu/wp-content/uploads/Clements_Spoofer_SSG.pdf ; https://navi.ion.org/content/73/1/navi.750
[15] GNSSJamming.com, "Signal Characteristics of GPS Jammers" (18-jammer study: ~10 mW PPDs, ~10 W multi-antenna units, ~9 µs chirp sweep, ≤ 20 MHz span) — https://www.gnssjamming.com/post/signal-characteristics-of-gps-jammers
[16] Radartutorial, "AN/SPY-1" (3.1–3.5 GHz, 4–6 MW peak, 58 kW average, 6.4–51 µs, 1.7°) — https://www.radartutorial.eu/19.kartei/07.naval/karte003.en.html
[17] Wikipedia, "Erieye" (S-band, 192 T/R modules, 450 km instrumented range) — https://en.wikipedia.org/wiki/Erieye
[18] Air Power Australia, "Search and Acquisition Radars (S-Band, X-band)" (64N6E ~2 GHz band; 91N6E fully digital, higher peak power) — https://www.ausairpower.net/APA-Acquisition-GCI.html
[19] AMD, "Zynq UltraScale+ RFSoC ZCU208 Evaluation Kit" (ZU48DR: 8 × 14-bit ADC 5 GSPS, 8 × 14-bit DAC 10 GSPS) — https://www.amd.com/en/products/adaptive-socs-and-fpgas/evaluation-boards/zcu208.html
[20] CAMELOT mission overview, arXiv:1806.03681 (platform spec: 500–600 km SSO, 20 krad TID design; polar count-rate increase) — https://arxiv.org/pdf/1806.03681
[21] Via Satellite, "FCC Adopts 5-Year Rule for Deorbiting Satellites" (29 Sep 2022) — https://www.satellitetoday.com/government-military/2022/09/30/fcc-adopts-5-year-rule-for-deorbiting-satellites/
[22] ESA, "ESA's Zero Debris approach" — https://www.esa.int/Space_Safety/Space_Debris/ESA_s_Zero_Debris_approach ; ESA Space Debris Mitigation Requirements training (ESSB-ST-U-007) — https://indico.esa.int/event/541/attachments/6306/10969/ESA-TECQI-HO-2024-002968%20-%20ESA's%20Space%20Debris%20Mitigation%20Requirments%20-%20training.pdf
[23] UNOOSA, Greece national space-debris mitigation mechanism summary, Law 4508/2017 as amended by 4712/2020 (updated 14 Feb 2025) — https://www.unoosa.org/documents/pdf/spacelaw/sd/Greece_updated20250214.pdf
[24] EU Dual-Use Regulation 2021/821, Annex I (Category 5 Part 1 incl. 5A001; Categories 6, 9) — https://respectus-knowledge-base.document360.io/docs/eu-dual-use-regulation-2021821-annex-a-en ; consolidated text https://data.consilium.europa.eu/doc/document/ST-13059-2021-ADD-1/en/pdf
[25] US Dept. of Commerce Office of Space Commerce, "US export controls — GPS/GNSS equipment" (2022) — https://www.space.commerce.gov/wp-content/uploads/2022-03-US-export-controls-GPS-GNSS-equipment.pdf
[26] satsearch, "Syrlinks EWC27 X-band transmitter" — https://satsearch.co/products/syrlinks-ewc27-x-band-transmitter
[27] satsearch, "IQ Spacecom XLink-X" and Syrlinks XONOS high-data-rate X-band transmitter — https://satsearch.co/products/iq-xlink-x ; https://satsearch.co/products/syrlinks-xonos-x-band-high-data-rate-transmitter
[28] PySDR, "TDOA" chapter (cross-correlation / hyperbola fundamentals) — https://pysdr.org/content/tdoa
[29] ESA EDAP+, "Technical Note on Quality Assessment of BRO (Unseenlabs)" — https://earth.esa.int/eogateway/documents/20142/37627/Technical-Note-on-Quality-Assessment-for-BRO.pdf
[30] J. Vedda, J. Koller (Aerospace Center for Space Policy and Strategy), "Commercial RF collection" (2020) — https://csps.aerospace.org/sites/default/files/2021-08/VeddaKoller_RFCollection_20200226.pdf
[31] Kleos Space Wikipedia / market releases (cluster plans) — https://en.wikipedia.org/wiki/Kleos_Space ; https://kleos.space/technology/
[32] Gunter's Space Page / eoPortal cross-check of Hawk Pathfinder paper (withdrawn SSC18 paper listing) — https://digitalcommons.usu.edu/smallsat/2018/all2018/15
