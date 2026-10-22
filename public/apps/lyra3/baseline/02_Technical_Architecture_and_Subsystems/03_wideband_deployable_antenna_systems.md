# Wideband Deployable Antenna Systems Engineering, Mechanical Packaging & RF Gain Trade Study

**Document ID**: `SIGINT-ENG-02-003`  
**Classification**: Technical Baseline / Publication Grade  
**Frequency Span**: 300 MHz to 12.0 GHz (UHF to X-Band)  
**Standard Compliance**: AIAA S-110-2005, NASA-STD-5017A, ECSS-E-ST-32-10C  
**Review Status**: Baseline Approved  

---

## 1. Mission Challenge & Antenna Architectural Strategy

A Low Earth Orbit Signals Intelligence spacecraft must intercept and geolocate RF emissions spanning a 40:1 frequency ratio (**300 MHz to 12.0 GHz**). This multi-octave span introduces conflicting physical requirements:
1. **Low Frequencies (UHF, 300–1,000 MHz)**: Free-space wavelengths range from $\lambda = 1.0\text{ m}$ to $\lambda = 0.3\text{ m}$. Capturing weak signals requires large physical apertures or long helical/dipole structures that cannot fit rigidly within a rideshare envelope.
2. **High Frequencies (C/X-Band, 4–12 GHz)**: Free-space wavelengths contract to $\lambda = 2.5\text{ cm}$. Achieving the directivity and link gain required to detect weak radar sidelobes requires large-aperture parabolic reflectors ($D \ge 1.5\text{ m}$) with surface accuracy $< 0.5\text{ mm}$ RMS.
3. **Packaging Ceiling**: The entire satellite must conform to the **ESPA envelope** ($600 \times 600 \times 800\text{ mm}$ stowed) with a dedicated antenna volume limit of **$< 50.0\text{ Liters}$** on the Earth-facing nadir deck.

To solve this challenge, the satellite platform implements a **heterogeneous multi-antenna suite**:

```
+-------------------------------------------------------------------------------------------------------------------+
|                                 DEPLOYABLE ANTENNA SYSTEM SUITE (UHF TO X-BAND)                                   |
+-------------------------------------------------------------------------------------------------------------------+
|                                                                                                                   |
|  1. DEPLOYABLE PARABOLIC MESH REFLECTOR (1.8m Aperture) - C/X-BAND                                                |
|     • Frequency: 4.0 GHz – 12.0 GHz                                                                               |
|     • Gain: 32.5 dBi (C-band) to 38.2 dBi (X-band), Beamwidth: 1.4° to 0.8°                                       |
|     • Architecture: Perimeter ring-truss with gold-plated molybdenum wire mesh (40 OPI)                           |
|     • Deployment: Spring-driven pantograph with Shape Memory Alloy (SMA) non-explosive release                    |
|                                                                                                                   |
|  2. DEPLOYABLE MULTI-OCTAVE LOG-PERIODIC DIPOLE ARRAY (LPDA) - UHF/L/S-BAND                                       |
|     • Frequency: 400 MHz – 3.0 GHz                                                                                |
|     • Gain: 7.5 to 9.2 dBi, Beamwidth: ~65°, Linear Polarization (Orthogonal dual-boom)                          |
|     • Architecture: Folding beryllium-copper dipole elements on an articulating composite boom                     |
|     • Deployment: Self-deploying tape-spring carpenter hinges with damped latches                                 |
|                                                                                                                   |
|  3. DEPLOYABLE HELICAL ANTENNA (Axial Mode) - UHF/L-BAND                                                          |
|     • Frequency: 300 MHz – 1.0 GHz                                                                                |
|     • Gain: 11.5 to 13.0 dBi, Circular Polarization (RHCP, Axial Ratio < 1.5 dB)                                  |
|     • Architecture: Spring-tempered CuBe helix inside collapsible Nomex/Kapton deployment sock                    |
|     • Deployment: Pre-stressed elastic release upon burn-wire / SMA pin puller activation                         |
|                                                                                                                   |
|  4. 4-ARM CAVITY-BACKED SINUOUS / SPIRAL ARRAY (Body Mounted) - INTERFEROMETRIC AOA                               |
|     • Frequency: 2.0 GHz – 12.0 GHz (Continuous Multi-Octave)                                                     |
|     • Gain: 5.0 to 7.5 dBi, Beamwidth: 75° to 90° (Hemispherical Coverage)                                        |
|     • Polarization: Dual Circular (RHCP & LHCP simultaneous)                                                      |
|     • Architecture: Planar cavity-backed sinuous printed elements arranged in a 4-element interferometric array   |
|     • Mission: Instantaneous single-satellite Angle-of-Arrival (AOA) via Phase Difference of Arrival (PDOA)       |
|                                                                                                                   |
|  5. CONFORMAL STEERABLE PATCH ARRAY - HIGH-SPEED DOWNLINK (X-BAND)                                               |
|     • Frequency: 8.025 GHz – 8.400 GHz                                                                            |
|     • Gain: 17.5 dBi (Boresight), Electronic Scanning: ±45° Azimuth/Elevation                                     |
|     • Architecture: 4x4 aperture-coupled microstrip patch phased array with GaN beamforming core                  |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 2. Comprehensive Trade Study of Antenna Form Factors

| Parameter | 1.8m Parabolic Mesh Reflector | Folding LPDA Boom | Deployable Axial Helix | 4-Element Sinuous Spiral Array | Conformal Phased Patch Array |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Operational Band** | C-Band (4–8 GHz) & X-Band (8–12 GHz) | UHF (0.4–1 GHz), L-Band, S-Band (to 3 GHz) | UHF (0.3–1.0 GHz) & L-Band (1–2 GHz) | S, C, and X-Band (2.0–12.0 GHz) | X-Band Downlink (8.025–8.400 GHz) |
| **Aperture Type** | Deployable Perimeter Ring-Truss Mesh | Articulating Folded Boom Dipole Array | Spring-Loaded Axial Mode Helix | Flush-Mounted Cavity-Backed Sinuous | Flat-Panel Microstrip $4 \times 4$ Array |
| **Boresight Gain (dBi)** | **$32.5\text{ dBi}$ (4 GHz) to $38.2\text{ dBi}$ (12 GHz)** | **$7.5\text{ to }9.2\text{ dBi}$** | **$11.5\text{ to }13.0\text{ dBi}$** | **$5.0\text{ to }7.5\text{ dBi}$** | **$17.5\text{ dBi}$ (Boresight)** |
| **3-dB Beamwidth (HPBW)** | $1.4^\circ\text{ at }4\text{ GHz} \to 0.8^\circ\text{ at }12\text{ GHz}$ | $60^\circ\text{ to }70^\circ$ | $42^\circ\text{ to }50^\circ$ | $75^\circ\text{ to }90^\circ$ (Hemispherical) | $22^\circ \times 22^\circ$ (Steerable $\pm 45^\circ$) |
| **Polarization & Purity** | Dual Circular (RHCP/LHCP), $\text{AR} < 1.0\text{ dB}$ | Dual Linear (H & V orthogonal booms) | Circular (RHCP), $\text{AR} < 1.5\text{ dB}$ | Simultaneous Dual Circular, $\text{AR} < 1.2\text{ dB}$ | Circular (RHCP), $\text{AR} < 1.2\text{ dB}$ |
| **Stowed Volume** | **$27.0\text{ Liters}$** ($\varnothing 250 \times 550\text{ mm}$) | **$9.4\text{ Liters}$** ($120 \times 120 \times 650\text{ mm}$) | **$5.6\text{ Liters}$** ($\varnothing 180 \times 220\text{ mm}$) | **$3.5\text{ Liters}$** ($4\times \varnothing 85 \times 40\text{ mm}$) | **$2.0\text{ Liters}$** ($200 \times 200 \times 15\text{ mm}$) |
| **Deployed Dimensions** | $\varnothing 1,800\text{ mm}$ aperture $\times 950\text{ mm}$ focal depth | $1,200\text{ mm}$ boom $\times 750\text{ mm}$ max dipole span | $\varnothing 240\text{ mm} \times 950\text{ mm}$ extended length | Flush body mounted (Zero deployment) | Flush body mounted (Zero deployment) |
| **Mass (CBE / MEM)** | $4.20\text{ kg} / 5.25\text{ kg}$ | $2.30\text{ kg} / 2.88\text{ kg}$ | $1.40\text{ kg} / 1.75\text{ kg}$ | $1.10\text{ kg} / 1.38\text{ kg}$ | $1.00\text{ kg} / 1.25\text{ kg}$ |
| **Deployment Mechanism** | TiNi SMA Frangibolt + Pantograph Spring Truss | Tape-spring composite hinges + Over-center latches | SMA pin puller + Elastic spring sock release | None (Passive conformal mount) | None (Passive conformal mount) |
| **Primary Mission Role** | High-sensitivity intercept of weak radar sidelobes | Broadband tactical comms, Link 16, search radars | UHF MilSatCom & tactical VHF/UHF radio intercept | Single-satellite phase interferometry AOA | High-throughput 300 Mbps mission data downlink |
| **Technology Readiness** | **TRL 7** (Flight heritage on LEO SmallSats) | **TRL 8** (Extensive flight heritage) | **TRL 8** (Proven spaceflight design) | **TRL 9** (Mature EW standard) | **TRL 7** (Validated space qualification) |

---

## 3. Electromagnetic Analysis & RF Gain Patterns

### 3.1 1.8m Deployable Parabolic Mesh Reflector
- **Aperture Directivity**:
  $$D = \left(\frac{\pi D_{\text{ap}}}{\lambda}\right)^2 \cdot \eta_{\text{ap}}$$
  Where $D_{\text{ap}} = 1.80\text{ m}$, aperture efficiency $\eta_{\text{ap}} = 0.58$ (accounting for feed taper, spillover, blockage, and mesh reflectivity).
  - At $f = 4.0\text{ GHz}$ ($\lambda = 0.075\text{ m}$):
    $$G = 10 \log_{10}\left( \left(\frac{\pi \times 1.80}{0.075}\right)^2 \times 0.58 \right) = 10 \log_{10}(3,293) = \mathbf{32.5\text{ dBi}}$$
  - At $f = 12.0\text{ GHz}$ ($\lambda = 0.025\text{ m}$):
    $$G = 10 \log_{10}\left( \left(\frac{\pi \times 1.80}{0.025}\right)^2 \times 0.58 \right) = 10 \log_{10}(29,638) = \mathbf{38.2\text{ dBi}}$$
- **Half-Power Beamwidth (HPBW)**:
  $$\theta_{-3\text{dB}} \approx 70^\circ \cdot \frac{\lambda}{D_{\text{ap}}}$$
  - At $4.0\text{ GHz}$: $\theta_{-3\text{dB}} = 70^\circ \times \frac{0.075}{1.80} \approx \mathbf{1.46^\circ}$
  - At $12.0\text{ GHz}$: $\theta_{-3\text{dB}} = 70^\circ \times \frac{0.025}{1.80} \approx \mathbf{0.49^\circ}$
- **Mesh Surface Accuracy & Ruze Loss**:
  The wire mesh is knitted from gold-plated molybdenum wire ($0.030\text{ mm}$ diameter, 40 openings per inch). The RMS surface deviation is measured at $\epsilon_{\text{rms}} \le 0.40\text{ mm}$. The Ruze gain degradation factor is:
  $$\Delta G_{\text{Ruze}} = 10 \log_{10}\left( e^{-\left(\frac{4\pi \epsilon_{\text{rms}}}{\lambda}\right)^2} \right) = -685.8 \left(\frac{\epsilon_{\text{rms}}}{\lambda}\right)^2\text{ dB}$$
  At $12.0\text{ GHz}$ ($\lambda = 25.0\text{ mm}$):
  $$\Delta G_{\text{Ruze}} = -685.8 \left(\frac{0.40}{25.0}\right)^2 = -685.8 \times 0.000256 \approx \mathbf{-0.176\text{ dB}}$$
  This demonstrates that the $0.40\text{ mm}$ RMS surface accuracy preserves $> 96\%$ aperture efficiency even at the top of X-band.

### 3.2 Deployable Log-Periodic Dipole Array (LPDA)
- **Geometry & Carrel Design Parameters**:
  - Scale factor $\tau = 0.88$; Spacing factor $\sigma = 0.15$.
  - Number of dipole elements $N = 14$ pairs, with longest dipole $L_{\text{max}} = 0.75\text{ m}$ (resonant at $380\text{ MHz}$) and shortest dipole $L_{\text{min}} = 0.048\text{ m}$ (resonant at $3.2\text{ GHz}$).
  - Boom Length: $1.20\text{ m}$.
- **Radiation Pattern**:
  - Front-to-back ratio ($F/B$) $> 18.0\text{ dB}$.
  - Gain: $7.5\text{ dBi}$ at $400\text{ MHz}$, rising smoothly to $9.2\text{ dBi}$ at $3.0\text{ GHz}$.
  - Polarization: Orthogonal dual-boom configuration allowing software-defined reconstruction of horizontal, vertical, RHCP, or LHCP polarizations.

### 3.3 Deployable Axial-Mode Quadrifilar Helical Antenna
- **Aperture Modeling (Kraus Formulation)**:
  - Circumference $C \approx 1.05 \lambda$; Pitch angle $\alpha = 12.5^\circ$; Number of turns $N = 7.5$.
  - Extended axial length $L_{\text{ax}} = N \cdot S = 7.5 \times (C \tan \alpha) \approx 0.95\text{ m}$.
  - Peak Boresight Gain:
    $$G_{\text{helix}} = 12 \left(\frac{C}{\lambda}\right)^2 \cdot \frac{N S}{\lambda} \approx 12 \times (1.05)^2 \times \frac{0.95}{\lambda} \approx \mathbf{12.5\text{ dBi}}$$
  - Axial Ratio: $\text{AR} \le 1.25\text{ dB}$ on boresight, remaining $< 2.0\text{ dB}$ out to the $3\text{-dB}$ beam edge ($45^\circ$ beamwidth), providing circular polarization intercept of ground tactical communications and naval beacons without polarization fading.

### 3.4 4-Element Cavity-Backed Sinuous Spiral Array
- **Interferometric Baseline Geometry**:
  Four identical planar sinuous antennas are flush-mounted on the nadir deck in an L-shaped orthogonal baseline arrangement:
  - Element 1 to Element 2 ($d_{\text{short}} = 0.0375\text{ m} = 0.5 \lambda$ at $4.0\text{ GHz}$): Resolves phase ambiguity over $\pm 90^\circ$ field-of-view.
  - Element 1 to Element 3 ($d_{\text{long}} = 0.300\text{ m} = 4.0 \lambda$ at $4.0\text{ GHz}$): Provides fine angular resolution.
- **Phase Interferometry Relationship**:
  $$\Delta \Phi = \frac{2\pi d}{\lambda} \sin(\theta) + \Delta \Phi_{\text{inst}}$$
  For an instrument phase calibration error $\sigma_{\Delta \Phi} \le 2.0^\circ$, the long baseline achieves an instantaneous single-satellite Angle-of-Arrival (AOA) accuracy of:
  $$\sigma_\theta = \frac{\lambda}{2\pi d \cos(\theta)} \sigma_{\Delta \Phi} = \frac{1}{2\pi \times 4.0 \times 1.0} \times \left(\frac{2.0^\circ \times \pi}{180^\circ}\right) \approx \mathbf{0.08^\circ}\text{ (1.4 mrad)}$$

---

## 4. Deployment Kinematics & Mechanical Staging

```
            DEPLOYABLE PARABOLIC MESH REFLECTOR MECHANICAL STAGING

  [STOWED CONFIGURATION IN ESPA CANISTER]
  +-------------------------------------------------------+
  | [HDRM Pin] === [Retaining Ring] === [Folded Ribs/Mesh]| -> Outer Dimensions: Ø250 mm x 550 mm
  +-------------------------------------------------------+
                             │
                             ▼ (SMA Actuator fires; TiNi Frangibolt releases preload)
  [DEPLOYMENT KINEMATICS: 3 DISTINCT STAGES]
  1. Hinge Release: Torsional spring hinges rotate 12 composite ribs outward radially (0 to 90°).
  2. Mesh Tensioning: Motorized central hub pulls synchronization cables to tension gold-plated molybdenum mesh.
  3. Latching & Lockout: Over-center spring-loaded latches engage with zero-backlash, guaranteeing <= 0.4 mm RMS surface error.
                             │
                             ▼
  [DEPLOYED CONFIGURATION]
            \                                   /
             \               FEED              /
              \               (O)             /
               \               |             /
                \              |            /
                 \____________/ \__________/   -> 1.8m Parabolic Aperture
                             [HUB]
```

### 4.1 Non-Explosive Hold-Down & Release Mechanisms (HDRM)
To eliminate pyro-shock that could fracture high-frequency wire bonds or misalign star tracker optical benches, all deployable antennas utilize **TiNi Shape Memory Alloy (SMA)** non-explosive release mechanisms:
- **Reflector Release**: 3x TiNi Frangibolt FC4-100 actuators preloaded to $4.5\text{ kN}$. Upon electrical pulse ($28\text{ V}$, $3.5\text{ A}$ for $12\text{ s}$), internal SMA expansion cylinders break the notched titanium fasteners cleanly without debris.
- **LPDA & Helix Release**: SMA pin pullers (Glenair / TiNi P10) retracting internal locking pins within $< 25\text{ ms}$.
- **Shock Generation**: Residual peak shock acceleration is measured at $< 25\text{ g}$ at $1,000\text{ Hz}$ (compared to $> 2,500\text{ g}$ for pyrotechnic separation nuts), well below the payload avionics qualification envelope ($40\text{ g}$).

### 4.2 Composite Tape-Spring Carpenter Hinges (LPDA Boom)
The deployable LPDA uses High-Strain Composite (HSC) carbon-fiber tape-spring hinges:
- **Kinematic Principle**: Pre-stressed curved shells store elastic strain energy when rolled flat inside the launch canister. Upon release, stored elastic energy drives deployment without requiring auxiliary motors or gears.
- **Over-Center Lockout**: When the boom straightens to $180^\circ$, the tape springs snap back into their curved transverse cross-section, providing high mechanical latching stiffness with **zero backlash**.
- **Eddy-Current Damping**: An onboard magnetic eddy-current damper regulates angular latching velocity to $< 0.15\text{ rad/s}$, preventing latching shock and rebound oscillations.

---

## 5. Volumetric Packaging & Structural Dynamics

### 5.1 ESPA Packaging Trade Study & Stowed Allocations
All five antenna assemblies are mounted on the satellite's $600 \times 600\text{ mm}$ nadir deck. The total stowed volume footprint is allocated as follows:

```
        NADIR DECK PACKAGING LAYOUT (600 mm x 600 mm Footprint)
+---------------------------------------------------------------+
|  [Spiral 1]    +-----------------------------+    [Spiral 2]  |
|  (Ø85 mm)      |  1.8m Parabolic Mesh Dish   |    (Ø85 mm)    |
|                |  Stowed Canister            |                |
|                |  Ø250 mm x 550 mm           |                |
|                |  Volume: 27.0 Liters        |                |
|                +-----------------------------+                |
|                                                               |
|  +--------------------+             +----------------------+  |
|  | LPDA Folded Boom   |             | UHF Helical Canister |  |
|  | 120 x 120 x 650 mm |             | Ø180 mm x 220 mm     |  |
|  | Volume: 9.4 Liters |             | Volume: 5.6 Liters   |  |
|  +--------------------+             +----------------------+  |
|                                                               |
|  [Spiral 3]    +-----------------------------+    [Spiral 4]  |
|  (Ø85 mm)      | Conformal Downlink Patch    |    (Ø85 mm)    |
|                | 200 x 200 x 15 mm (2.0 L)   |                |
+---------------------------------------------------------------+
```

- **Total Stowed Antenna Suite Volume**:
  $$V_{\text{total}} = 27.0\text{ L} + 9.4\text{ L} + 5.6\text{ L} + 3.5\text{ L} + 2.0\text{ L} = \mathbf{47.5\text{ Liters}}$$
  This strictly satisfies the maximum nadir allocation limit of **$\le 50.0\text{ Liters}$** and leaves clearance margins for solar panel deployment hinges.

### 5.2 Structural Modal Dynamics & ADCS Coupling
- **Stowed Launch Configuration**:
  - Longitudinal natural frequency: $f_1 = 68.5\text{ Hz}$.
  - Lateral natural frequency: $f_2 = 58.4\text{ Hz}$.
  - *Compliance*: Significantly exceeds launch vehicle Coupled Loads Analysis (CLA) criteria of $> 35\text{ Hz}$ axial and $> 20\text{ Hz}$ lateral.
- **Deployed On-Orbit Configuration**:
  - Fully deployed 1.8m reflector & 1.2m LPDA boom:
    $$f_{\text{deployed}} = \mathbf{2.15\text{ Hz}}$$
  - *ADCS Control Bandwidth*: The closed-loop attitude control loop operates at $f_{\text{ctrl}} = 0.05\text{ Hz}$.
  - *Separation Ratio*:
    $$\frac{f_{\text{deployed}}}{f_{\text{ctrl}}} = \frac{2.15\text{ Hz}}{0.05\text{ Hz}} = \mathbf{43 : 1}$$
  - A modal separation ratio $> 40:1$ fully precludes structural flexible-body attitude control interaction (control spillover) without requiring active structural damping filters.
