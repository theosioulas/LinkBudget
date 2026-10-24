# Wideband RF Payload Subsystem, Front-End Electronics & High-Speed Digital Signal Processing Architecture

**Document ID**: `SIGINT-ENG-02-002`  
**Classification**: Technical Baseline / Publication Grade  
**Frequency Span**: 300 MHz to 12.0 GHz (UHF, L, S, C, X Bands)  
**Standard Compliance**: IEEE-STD-142, MIL-STD-461G, ECSS-E-ST-50C  
**Review Status**: Baseline Approved  

---

## 1. Mission Scope & RF Architecture Overview

The RF reconnaissance payload is engineered to detect, capture, channelize, and extract parametric telemetry from both continuous wave (CW) communication emitters and agile, low-duty-cycle pulsed radar emitters across a 40:1 frequency ratio (**300 MHz to 12.0 GHz**).

The payload combines high-dynamic-range front-end protection, switched sub-octave pre-selection, direct RF sampling up to 4.0 GHz, low-phase-noise block downconversion from 4.0 to 12.0 GHz, and high-throughput digital signal processing featuring a 128-channel Polyphase Filter Bank (PFB) and real-time Pulse Descriptor Word (PDW) extraction engine.

```
+-----------------------------------------------------------------------------------------------------------------------------+
|                                    END-TO-END WIDEBAND RF PAYLOAD SIGNAL CHAIN                                              |
+-----------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                             |
|  [ANTENNA INTERFACE]                                                                                                        |
|   - UHF/L-band Deployable Helix / LPDA (300 MHz – 2 GHz)                                                                    |
|   - S-band Sinuous Spiral / Conformal Array (2 GHz – 4 GHz)                                                                 |
|   - C/X-band Deployable 1.8m Parabolic Mesh & Horn Feed (4 GHz – 12 GHz)                                                    |
|         │                                                                                                                   |
|         ▼                                                                                                                   |
|  [FRONT-END SIGNAL CONDITIONING (RFFE)]                                                                                     |
|   ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  |
|   │ 1. Fast GaAs PIN Diode Limiter (Clamps high-power pulsed radar illumination up to +30 dBm, recovery < 15 ns)        │  |
|   │ 2. Digital Step Attenuator (PE43711: 0 to 31.5 dB in 0.5 dB steps, automated AGC / anti-saturation)                  │  |
|   │ 3. Switched Sub-Octave Pre-selection Filter Bank (Low insertion loss absorptive SP5T RF switches):                  │  |
|   │    • Channel 1: UHF (300 – 1,000 MHz)                                                                                │  |
|   │    • Channel 2: L-band (1,000 – 2,000 MHz)                                                                           │  |
|   │    • Channel 3: S-band (2,000 – 4,000 MHz)                                                                           │  |
|   │    • Channel 4: C-band (4,000 – 8,000 MHz)                                                                           │  |
|   │    • Channel 5: X-band (8,000 – 12,000 MHz)                                                                          │  |
|   │ 4. Ultra-Low Noise Amplifiers (GaN HEMT / GaAs pHEMT):                                                               │  |
|   │    • UHF/L-band: NF = 1.1 dB, Gain = 24 dB, OIP3 = +34 dBm                                                          │  |
|   │    • S-band:     NF = 1.3 dB, Gain = 25 dB, OIP3 = +33 dBm                                                          │  |
|   │    • C/X-band:   NF = 1.7 dB, Gain = 26 dB, OIP3 = +32 dBm                                                          │  |
|   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  |
|         │                                                                                                                   |
|         ▼                                                                                                                   |
|  [DOWNCONVERSION & DIRECT RF DIGITIZATION]                                                                                  |
|   ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  |
|   │ • UHF / L-band / S-band (0.3 – 4.0 GHz):                                                                             │  |
|   │   -> Direct RF Sampling via Dual-Channel 12-bit ADC (ADC12DJ5200RF or Teledyne EV12AQ600 at 5.2 GSPS)               │  |
|   │ • C-band / X-band (4.0 – 12.0 GHz):                                                                                 │  |
|   │   -> Block Downconversion: Image-reject mixer + Low Phase Noise Dielectric Resonator Oscillator (DRO LO at 6.0 GHz) │  |
|   │      Translates 8.0–12.0 GHz down to 2.0–6.0 GHz IF -> Sampled by High-Speed ADC in 2nd/3rd Nyquist Zone            │  |
|   │ • ADC Performance: Sample Rate = 5.2 GSPS, ENOB = 9.2 bits, SFDR = 68.5 dBc, Instantaneous Bandwidth (IBW) = 1 GHz   │  |
|   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  |
|         │                                                                                                                   |
|         ▼                                                                                                                   |
|  [HIGH-SPEED JESD204C DIGITAL INTERFACE (16 Lanes @ 24.75 Gbps)]                                                            |
|         │                                                                                                                   |
|         ▼                                                                                                                   |
|  [SDR CHANNELIZATION & DIGITAL SIGNAL PROCESSING (AMD/Xilinx Zynq UltraScale+ RFSoC)]                                       |
|   ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  |
|   │ • Polyphase Filter Bank (PFB) Channelizer:                                                                           │  |
|   │   - 128 fine sub-channels (each 15.625 MHz wide across 1.0 GHz IBW)                                                 │  |
|   │   - Oversampled FIR polyphase structure, > 80 dB adjacent channel rejection                                          │  |
|   │ • CFAR Energy Detection (Cell-Averaging CA-CFAR & Order-Statistic OS-CFAR):                                         │  |
|   │   - Adaptively tracks dynamic thermal/interference noise floor                                                       │  |
|   │   - Detects microsecond radar pulses with P_d > 0.999 at P_fa = 10^-6                                               │  |
|   │ • Real-Time Pulse Descriptor Word (PDW) Extraction Engine:                                                           │  |
|   │   1. Time of Arrival (TOA): Parabolic interpolation on leading edge, precision <= 1.25 ns                            │  |
|   │   2. Pulse Width (PW): -3 dB and -6 dB envelope duration (50 ns to 500 µs)                                           │  |
|   │   3. Carrier Frequency (RF): High-resolution FFT peak interpolation (accuracy <= 25 kHz)                             │  |
|   │   4. Pulse Amplitude (PA): Peak power detection with 0.5 dB resolution                                               │  |
|   │   5. Angle of Arrival (AOA): 4-channel Phase Difference of Arrival (PDOA) / Monopulse ratio                          │  |
|   │   6. Modulation on Pulse (MOP): Linear FM chirp rate (df/dt), Barker/polyphase BPSK detection                         │  |
|   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  |
|         │                                                                                                                   |
|         ▼                                                                                                                   |
|  [CO-PROCESSOR: SPACE JETSON ORIN NX EDGE AI ACCELERATOR]                                                                  |
|   ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  |
|   │ • Pulse De-interleaving & Radar Fingerprinting:                                                                      │  |
|   │   - Multi-dimensional clustering (TOA diff / PRI analysis, RF hopping sequences, agile jitter extraction)            │  |
|   │   - TensorRT-optimized Deep Neural Network (DNN) for emitter classification against onboard EW library               │  |
|   │ • Enormous Data Compression:                                                                                         │  |
|   │   - Raw I/Q data rate: 83.2 Gbps -> Condensed PDW stream: 51.2 Mbps (> 1,600:1 compression ratio!)                 │  |
|   │   - Immediate tactical downlink / crosslink queue generation                                                         │  |
|   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  |
+-----------------------------------------------------------------------------------------------------------------------------+
```

---

## 2. RF Front-End (RFFE) Engineering

### 2.1 Front-End Survivability: GaAs PIN Diode Fast Limiters
In Low Earth Orbit, high-power ground-based air defense radars (e.g., AN/TPY-2, S-400 91N6E Tomb Stone, Aegis AN/SPY-1/6) radiate gigawatts of effective radiated power (ERP). Direct main-beam illumination can present power levels exceeding $+20\text{ dBm}$ to $+30\text{ dBm}$ at the satellite antenna terminals.

To protect sensitive Low Noise Amplifiers from permanent gate degradation:
- **Topology**: Symmetrical two-stage GaAs PIN diode limiter integrated onto an alumina thin-film substrate.
- **Continuous Power Handling**: $+30\text{ dBm}$ CW; peak pulsed power handling up to $+43\text{ dBm}$ ($20\text{ W}$ peak for $10\text{ µs}$ pulses).
- **Limiting Threshold**: $+10.0\text{ dBm}$ input; maximum flat leakage output clamped to $\le +12.0\text{ dBm}$.
- **Spike Leakage & Recovery Time**: Spike leakage energy $< 0.1\text{ nJ}$; recovery time $t_{\text{rec}} < 15\text{ ns}$ to nominal insertion loss ($< 0.45\text{ dB}$ at 10 GHz), preserving receiver sensitivity immediately following high-power pulse illumination.

### 2.2 Dynamic Range Control: Digital Step Attenuation
Following the limiter, an automated gain control (AGC) stage incorporates a high-linearity Digital Step Attenuator (Peregrine/pSemi PE43711):
- **Attenuation Range**: $0.0\text{ to }31.5\text{ dB}$ in monotonic $0.5\text{ dB}$ steps.
- **Linearity**: Input Third-Order Intercept Point ($\text{IIP3}$) $> +55.0\text{ dBm}$.
- **Switching Speed**: $< 500\text{ ns}$ via parallel control bus from the FPGA.

### 2.3 Switched Sub-Octave Pre-Selection Filter Banks
Operating across a 40:1 frequency span exposes the digitizer to harmonic mixing and out-of-band saturation from commercial broadcast and cellular infrastructure (GSM, LTE, 5G NR). The pre-selection bank utilizes absorptive Single-Pole 5-Throw (SP5T) reflective/absorptive solid-state RF switches routing the signal through 5 dedicated sub-octave filter paths:

| Channel ID | Frequency Band | RF Range (GHz) | Filter Technology | Insertion Loss (dB) | Out-of-Band Rejection | In-Band Ripple (dB) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CH 1** | UHF | $0.30\text{ – }1.00$ | Lumped-Element / Ceramic Resonator | $0.85$ | $> 60\text{ dB}$ at $0.8 f_L$ & $1.2 f_H$ | $\pm 0.35$ |
| **CH 2** | L-Band | $1.00\text{ – }2.00$ | Microstrip Combline / Interdigital | $0.95$ | $> 60\text{ dB}$ at $0.8 f_L$ & $1.2 f_H$ | $\pm 0.40$ |
| **CH 3** | S-Band | $2.00\text{ – }4.00$ | Cavity Substrate Integrated Waveguide (SIW) | $1.10$ | $> 65\text{ dB}$ at $0.8 f_L$ & $1.2 f_H$ | $\pm 0.45$ |
| **CH 4** | C-Band | $4.00\text{ – }8.00$ | Thin-Film Alumina SIW Bandpass | $1.25$ | $> 65\text{ dB}$ at $0.8 f_L$ & $1.2 f_H$ | $\pm 0.50$ |
| **CH 5** | X-Band | $8.00\text{ – }12.00$| High-Q Cavity Waveguide Filter | $1.40$ | $> 70\text{ dB}$ at $0.8 f_L$ & $1.2 f_H$ | $\pm 0.50$ |

### 2.4 Ultra-Low Noise Amplifiers (LNAs) & Cascaded Analysis
Each filter channel feeds an optimized low-noise amplifier fabricated on pseudomorphic High Electron Mobility Transistor (pHEMT) or Gallium Nitride (GaN) on Silicon Carbide (SiC) substrates:

| Metric | UHF Band (0.3–1.0 GHz) | L-Band (1.0–2.0 GHz) | S-Band (2.0–4.0 GHz) | C-Band (4.0–8.0 GHz) | X-Band (8.0–12.0 GHz) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Active Process** | $0.15\text{ µm}$ GaAs pHEMT | $0.15\text{ µm}$ GaAs pHEMT | $0.15\text{ µm}$ GaN-on-SiC | $0.15\text{ µm}$ GaN-on-SiC | $0.10\text{ µm}$ GaN / InP |
| **Noise Figure ($NF_{\text{lna}}$)** | $\mathbf{1.10\text{ dB}}$ | $\mathbf{1.20\text{ dB}}$ | $\mathbf{1.30\text{ dB}}$ | $\mathbf{1.60\text{ dB}}$ | $\mathbf{1.80\text{ dB}}$ |
| **Small-Signal Gain ($G$)| $24.0\text{ dB}$ | $24.5\text{ dB}$ | $25.0\text{ dB}$ | $26.0\text{ dB}$ | $26.5\text{ dB}$ |
| **Input 1-dB Comp ($P_{1\text{dB}}$)** | $+12.0\text{ dBm}$ | $+12.0\text{ dBm}$ | $+15.0\text{ dBm}$ | $+16.0\text{ dBm}$ | $+16.0\text{ dBm}$ |
| **Output IP3 ($\text{OIP3}$)** | $\mathbf{+34.0\text{ dBm}}$ | $\mathbf{+34.0\text{ dBm}}$ | $\mathbf{+33.0\text{ dBm}}$ | $\mathbf{+33.0\text{ dBm}}$ | $\mathbf{+32.0\text{ dBm}}$ |
| **Operating DC Power** | $1.8\text{ W}$ | $1.8\text{ W}$ | $2.5\text{ W}$ | $3.2\text{ W}$ | $3.8\text{ W}$ |

#### Cascaded Noise Figure Derivation (Friis Formula)
The overall receiver noise figure $F_{\text{sys}}$ referenced to the antenna feed is:
$$F_{\text{sys}} = F_1 + \frac{F_2 - 1}{G_1} + \frac{F_3 - 1}{G_1 G_2} + \frac{F_4 - 1}{G_1 G_2 G_3}$$
Where:
- Stage 1: Feeder coax & PIN limiter ($L_1 = 0.50\text{ dB} \implies F_1 = 1.122, G_1 = 0.891$)
- Stage 2: Filter bank switch & BPF ($L_2 = 1.40\text{ dB} \implies F_2 = 1.380, G_2 = 0.724$)
- Stage 3: Low Noise Amplifier ($NF_3 = 1.80\text{ dB} \implies F_3 = 1.514, G_3 = 446.7\text{ [}+26.5\text{ dB]})$
- Stage 4: Second-stage amplifier & ADC buffer ($NF_4 = 6.50\text{ dB} \implies F_4 = 4.467$)

Evaluating for the worst-case X-band channel:
$$F_{\text{sys}} = 1.122 + \frac{1.380 - 1}{0.891} + \frac{1.514 - 1}{0.891 \times 0.724} + \frac{4.467 - 1}{0.891 \times 0.724 \times 446.7} = 1.122 + 0.426 + 0.797 + 0.012 = 2.357$$
$$\mathbf{NF_{\text{cascaded, X-band}}} = 10 \log_{10}(2.357) = \mathbf{3.72\text{ dB}}$$
(At UHF/L-band, the cascaded noise figure drops to $\le \mathbf{2.45\text{ dB}}$).

---

## 3. High-Speed Digitization & Direct RF ADCs

### 3.1 Converter Architecture & Space-Grade Selection
- **Selected Digitizer**: Texas Instruments **ADC12DJ5200RF** / Teledyne e2v **EV12AQ600** (Radiation-Tolerant Space Qualified).
- **Architecture**: Dual-channel 12-bit analog-to-digital converter capable of sampling at **$5.2\text{ GSPS}$** in dual-channel mode or **$10.4\text{ GSPS}$** in interleaved single-channel mode.
- **Analog Input Bandwidth**: $8.0\text{ GHz}$ (-3 dB bandwidth), supporting direct sampling up to the 3rd Nyquist zone.
- **Effective Number of Bits (ENOB)**:
  - $\text{ENOB} = 9.2\text{ bits}$ at $f_{\text{in}} = 2.5\text{ GHz}$
  - $\text{ENOB} = 8.6\text{ bits}$ at $f_{\text{in}} = 6.0\text{ GHz}$
- **Spurious-Free Dynamic Range (SFDR)**: $\ge 68.5\text{ dBc}$ across the Nyquist band, preventing false trigger generation in the pulse detector.
- **Signal-to-Noise Ratio (SNR)**: $56.8\text{ dBFS}$ at $f_{\text{in}} = 2.5\text{ GHz}$.

### 3.2 Nyquist Sampling Strategy
```
0 GHz          1.0 GHz        2.0 GHz        3.0 GHz        4.0 GHz        6.0 GHz        12.0 GHz
  |--------------|--------------|--------------|--------------|--------------|--------------|
  [  Nyquist 1   ] [  Nyquist 2   ] [  Nyquist 3   ]              [  Block Downconversion IF   ]
  [ UHF / L-band ] [   S-Band     ] [ Direct IF    ]              [   C-Band and X-Band Signals ]
```

1. **UHF, L-band, and S-band ($0.30\text{ to }4.00\text{ GHz}$)**:
   - Sampled directly at RF without analog frequency downconversion. Direct RF sampling eliminates local oscillator (LO) phase noise degradation, mixer spurious intermodulation products, and analog I/Q quadrature imbalance.
2. **C-band and X-band ($4.00\text{ to }12.00\text{ GHz}$)**:
   - Block downconversion architecture: Signals are translated to an Intermediate Frequency (IF) of $2.00\text{–}6.00\text{ GHz}$ using a high-reliability Dielectric Resonator Oscillator (DRO LO at $6.00\text{ GHz}$) and a sub-harmonic image-reject mixer ($> 35\text{ dB}$ image rejection).
   - The resulting IF band is subsequently digitized in the ADC's second and third Nyquist zones.

### 3.3 High-Speed Digital Interconnect (JESD204C)
- Output format: JESD204C Subclass 1 (deterministic latency locked to system 10 MHz reference and SYSREF).
- Lane configuration: 16 SerDes lanes operating at $24.75\text{ Gbps}$ with 64b/66b line encoding, routing digitized samples directly into the AMD/Xilinx RFSoC FPGA.

---

## 4. SDR Digital Processing Engine & PFB Channelization

The signal processing hardware consists of an **AMD/Xilinx Zynq UltraScale+ RFSoC (XQRKU060 / XCZU29DR)** coupled via PCIe Gen3 x4 to a **Space Jetson Orin NX** neural accelerator.

```
       5.2 GSPS Digitized Stream
                  │
                  ▼
       [ 128-CHANNEL POLYPHASE FILTER BANK (PFB) ]
       - Oversampled Prototype FIR Filter (M = 128, K = 8 taps/branch)
       - Decimation Factor D = 64 (50% Overlap)
       - Adjacent Channel Isolation > 80 dB
                  │
                  ├───────────────────────┬───────────────────────┐
                  ▼                       ▼                       ▼
             Sub-Channel 1           Sub-Channel 2          Sub-Channel 128
           (15.625 MHz IBW)        (15.625 MHz IBW)        (15.625 MHz IBW)
                  │                       │                       │
                  ▼                       ▼                       ▼
            [ CA-CFAR / OS-CFAR DUAL ENERGY DETECTOR ENGINE ]
            - Dynamic Thresholding (P_d >= 0.999, P_fa = 10^-6)
                  │
                  ▼ (Threshold Exceeded)
       [ REAL-TIME PULSE DESCRIPTOR WORD (PDW) EXTRACTOR ]
       - Time of Arrival (TOA): Parabolic interpolation, resolution <= 1.25 ns
       - Pulse Width (PW): -3 dB & -6 dB envelope duration (50 ns to 500 µs)
       - Carrier Frequency (RF): 2048-point FFT peak interpolation (<= 25 kHz)
       - Pulse Amplitude (PA): Peak power detection (0.5 dB resolution)
       - Angle of Arrival (AOA): 4-Channel Phase Difference of Arrival (PDOA)
       - Modulation on Pulse (MOP): LFM chirp slope & BPSK Barker detector
                  │
                  ▼
       [ SPACE JETSON ORIN NX: EDGE AI & PULSE DE-INTERLEAVING ]
       - Multi-dimensional clustering (PRI, RF hopping, agile jitter)
       - Emitter identification against onboard EW Threat Library
       - Data stream reduction: 83.2 Gbps -> 51.2 Mbps (> 1,600:1 compression)
```

### 4.1 Polyphase Filter Bank (PFB) Mathematical Formulation
To process an instantaneous bandwidth of $\text{IBW} = 1.0\text{ GHz}$, the digitizer stream is channeled into $M = 128$ sub-channels, each with an effective bin bandwidth of:
$$B_{\text{sub}} = \frac{f_s / 2}{M} = \frac{2,000\text{ MHz}}{128} = 15.625\text{ MHz}$$

The input signal $x[n]$ is filtered by a prototype low-pass filter $h[n]$ with cutoff frequency $\omega_c = \pi / M$ and length $L = K \cdot M = 8 \times 128 = 1,024\text{ taps}$. Using polyphase decomposition:
$$H(z) = \sum_{\ell=0}^{M-1} z^{-\ell} E_\ell(z^M)$$
Where $E_\ell(z) = \sum_{k=0}^{K-1} h[\ell + k M] z^{-k}$ represents the $\ell$-th polyphase sub-filter branch.

The output of the $m$-th channel after decimation by $D = 64$ ($50\%$ oversampling to avoid spectrum aliasing across bin boundaries) is computed via an efficient Inverse Fast Fourier Transform (IFFT):
$$X_m[k] = \sum_{\ell=0}^{M-1} \left( \sum_{p=0}^{K-1} x[k D - p M - \ell] h[p M + \ell] \right) e^{-j \frac{2\pi m \ell}{M}}$$
This architecture guarantees:
- Stopband attenuation: $> 82.5\text{ dB}$ at adjacent bin centers.
- Processing efficiency: Consumes only $384$ DSP48E2 slices ($15.2\%$ of RFSoC resources) and operates deterministically at $312.5\text{ MHz}$ internal clock.

### 4.2 Adaptive CFAR Energy Detection
In a dynamic electronic combat environment, ground clutter, atmospheric noise, and intentional broadband barrage jamming cause rapid fluctuations in the background noise floor. The payload implements dual CFAR engines:
1. **Cell-Averaging CFAR (CA-CFAR)**:
   Estimates noise power $P_n$ from $2N$ reference cells surrounding the cell under test (CUT), with $G$ guard cells preventing pulse energy leakage:
   $$T_{\text{CA}} = \alpha \cdot \frac{1}{2N} \sum_{i=1}^{N} \left( |x_{\text{left}}[i]|^2 + |x_{\text{right}}[i]|^2 \right)$$
   Where the scaling factor $\alpha = 2N (P_{\text{fa}}^{-1/2N} - 1)$ is dynamically tuned to maintain $P_{\text{fa}} = 10^{-6}$.
2. **Order-Statistic CFAR (OS-CFAR)**:
   In high-density pulse environments where multiple overlapping radar signals corrupt reference cells, the OS-CFAR sorts the $2N$ reference samples and selects the $k$-th order statistic ($k = \lfloor 0.75 \times 2N \rfloor$):
   $$T_{\text{OS}} = \beta \cdot X_{(k)}$$
   This completely eliminates target masking in dense multi-emitter combat environments.

---

## 5. Real-Time Pulse Descriptor Word (PDW) Extraction Engine

When a pulse event crosses the CFAR detection threshold, the hardware state machine captures the signal window and computes the **64-byte Pulse Descriptor Word (PDW)**.

### 5.1 PDW Field Specifications & Measurement Algorithms

| Byte Offset | Field Name | Data Type | Units / Range | Resolution | Extraction Algorithm / Principle |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **00–07** | **Time of Arrival (TOA)** | 64-bit uint | $0\text{ to }10^7\text{ s}$ | $\mathbf{1.25\text{ ns}}$ | Parabolic 3-point peak interpolation on leading edge (-6 dB threshold crossing) |
| **08–11** | **Pulse Width (PW)** | 32-bit uint | $50\text{ ns – }500\text{ µs}$ | $2.5\text{ ns}$ | Duration between leading and trailing -3 dB power envelope points |
| **12–15** | **Carrier Frequency ($f_c$)** | 32-bit uint | $300\text{ MHz – }12\text{ GHz}$ | $\mathbf{25\text{ kHz}}$ | 2048-point zero-padded FFT with Quinn/MacLeod parabolic frequency interpolation |
| **16–17** | **Pulse Amplitude (PA)** | 16-bit int | $-110\text{ to }+20\text{ dBm}$ | $0.5\text{ dB}$ | Peak power accumulator calibrated against digital step attenuator register |
| **18–21** | **Angle of Arrival: Azimuth ($\theta$)** | 16-bit int | $-90.0^\circ\text{ to }+90.0^\circ$| $0.1^\circ$ | Phase Difference of Arrival (PDOA) across horizontal spiral baseline |
| **22–25** | **Angle of Arrival: Elevation ($\phi$)** | 16-bit int | $-90.0^\circ\text{ to }+90.0^\circ$| $0.1^\circ$ | PDOA across vertical spiral baseline |
| **26–27** | **Modulation on Pulse (MOP)** | 16-bit flag | Enumerated Flags | — | LFM Up-Chirp, LFM Down-Chirp, Barker-13, Frank Code, Costas Hopping |
| **28–31** | **Chirp Rate ($\alpha = \Delta f / \tau$)** | 32-bit float| $\text{MHz/µs}$ | $0.01\text{ MHz/µs}$ | Instantaneous frequency phase-differencing: $\alpha = \frac{1}{2\pi} \frac{d^2\phi(t)}{dt^2}$ |
| **32–33** | **Signal-to-Noise Ratio (SNR)** | 16-bit uint | $0\text{ to }60\text{ dB}$ | $0.25\text{ dB}$ | Ratio of peak pulse power to local CFAR noise estimate |
| **34–35** | **Channel & Receiver ID** | 16-bit uint | $1\text{ to }128$ | — | Identifies PFB sub-channel and antenna source (Reflector / Helix / Spiral) |
| **36–47** | **Phase Differentials ($\Delta \Phi_{12}, \Delta \Phi_{34}$)** | 6x 16-bit int| $-\pi\text{ to }+\pi$ | $0.05^\circ$ | Raw inter-element phase angles for ground-based multi-baseline calibration |
| **48–63** | **Quality Metric & Reserved** | 16 bytes | Checksum / CRC-32 | — | Integrity checksum and hardware status flags |

### 5.2 Parabolic Leading-Edge TOA Interpolation
The leading edge of a pulse is detected when three consecutive power samples $p[n-1], p[n], p[n+1]$ cross the $-6\text{ dB}$ threshold. A continuous quadratic polynomial is fitted:
$$P(t) = a t^2 + b t + c$$
The sub-sample fractional time offset $\delta t$ is derived analytically:
$$\delta t = \frac{p[n-1] - p[n+1]}{2(p[n-1] - 2p[n] + p[n+1])} \cdot \Delta t_{\text{sample}}$$
For $\Delta t_{\text{sample}} = 2.5\text{ ns}$ (400 MHz processing clock), this interpolation yields an absolute TOA precision of **$\le 1.25\text{ ns}$**, which translates directly into high-accuracy TDOA geolocation.

---

## 6. Massive Onboard Data Compression & Throughput

In raw collection mode, the high-speed digitizer generates data at a massive rate:
$$\text{Data Rate}_{\text{raw}} = 5.2 \times 10^9\text{ samples/s} \times 2\text{ bytes/sample (12-bit I + 12-bit Q packed)} = 10.4\text{ GB/s} = \mathbf{83.2\text{ Gbps}}$$
Transmitting $83.2\text{ Gbps}$ directly over space-to-ground downlinks is impossible given RF bandwidth and power constraints.

### Data Compression via Real-Time PDW Extraction
At maximum tactical pulse density (e.g., intercepting a complex carrier battle group or dense integrated air defense system with $100,000\text{ pulses/second}$):
$$\text{Data Rate}_{\text{PDW}} = 100,000\text{ pulses/s} \times 64\text{ bytes/pulse} = 6.40\text{ MB/s} = \mathbf{51.2\text{ Mbps}}$$

$$\text{Compression Factor} = \frac{\text{Raw Data Rate}}{\text{PDW Data Rate}} = \frac{83,200\text{ Mbps}}{51.2\text{ Mbps}} = \mathbf{1,625 : 1}$$

> **Compression Metric**: The real-time PDW extraction engine achieves a **$> 1,600:1$ data compression ratio**, allowing continuous, uninterrupted streaming of all intercepted pulse parameters over the spacecraft's **$300\text{ Mbps}$** X-band downlink or the **$1\text{ Gbps}$** Optical Crosslink.

### 6.1 Edge AI Coprocessor: Space Jetson Orin NX
The condensed PDW stream is routed via PCIe to the **Space Jetson Orin NX** module:
- **Processor Specs**: 8-core ARM Cortex-A78AE CPU, 1024-core NVIDIA Ampere GPU with 32 Tensor Cores, delivering up to **100 TOPS** of INT8 AI compute at $25\text{ W}$.
- **Onboard Algorithms**:
  - *Pulse Repetition Interval (PRI) De-interleaving*: Real-time sequence difference histogram (SDH) and TOA clustering separating interleaved pulse trains into discrete radar tracks.
  - *Agile Frequency Hopping Tracking*: Reconstructs pseudo-random frequency hopping sequences.
  - *Deep Neural Network (DNN) Threat Classifier*: A TensorRT-compiled neural network matches extracted PDWs against an onboard library of $> 2,000$ known radar signatures (e.g., Russian 30N6E Tomb Stone, Chinese Type 346 Dragon Eye, Sea Hunter, NATO Aegis SPY-1), outputting immediate threat classification and priority queue alarms within $< 50\text{ ms}$.
