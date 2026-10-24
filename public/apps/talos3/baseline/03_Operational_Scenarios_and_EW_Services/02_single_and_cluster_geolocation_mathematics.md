# Single-Satellite and Cluster Geolocation Mathematics & Signal Processing

**Document ID**: `SIGINT-MATH-GEO-002`  
**Classification**: Unclassified / Technical Baseline  
**Target Platform**: 100–150 kg ESPA-Class LEO Spaceborne SIGINT Spacecraft & Distributed Constellation  
**Constellation Orbit**: 500–600 km Low Earth Orbit (SSO & 45°–50° Mid-Inclination)  
**Mathematical Scope**: Vector Kinematics, Doppler Physics, Interferometry, TDOA/FDOA Hyperboloids, CRLB, GDOP, Covariance Inversion, and Sub-Nanosecond Clock Synchronization  

---

## Executive Summary

This document presents the complete mathematical, physical, and algorithmic derivations governing passive radio frequency (RF) emitter geolocation from Low Earth Orbit (LEO). Both single-satellite mechanisms (Doppler rate-of-change, multi-baseline phase interferometry, synthetic aperture baseline extension) and multi-satellite distributed techniques (Time Difference of Arrival [TDOA], Frequency Difference of Arrival [FDOA], Cross-Ambiguity Function [CAF], Cramer-Rao Lower Bounds [CRLB], Geometric Dilution of Precision [GDOP], and clock synchronization) are derived from first principles.

All formulations use standard aerospace coordinate systems: Earth-Centered Inertial (ECI / J2000), Earth-Centered Earth-Fixed (ECEF / WGS-84), and Local Tangent Plane (East-North-Up / ENU).

---

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                  SPACEBORNE PASSIVE GEOLOCATION TAXONOMY & GEOMETRY                                     |
+-------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                         |
|    SINGLE-SATELLITE TECHNIQUES (1 Spacecraft)              MULTI-SATELLITE CLUSTER TECHNIQUES (3+ Spacecraft)           |
|                                                                                                                         |
|    1. Doppler Rate-of-Change (df/dt Curve)                 1. Distributed TDOA (Hyperbolic Isochrones)                  |
|       - Uses orbital velocity (7.56 km/s)                     - Measures differential arrival time between spacecraft   |
|       - Inflection slope yields slant range R_min             - 2 baseline pairs produce intersecting hyperboloids      |
|                                                                                                                         |
|    2. Multi-Baseline Phase Interferometry (AOA)            2. Distributed FDOA (Isodop Surfaces)                        |
|       - Measures spatial phase gradient across antennas       - Measures differential Doppler shift between spacecraft  |
|       - Coarse/fine baseline resolves 2π ambiguity            - Near-orthogonal intersection with TDOA isochrones       |
|                                                                                                                         |
|    3. Synthetic Baseline Extension                         3. Joint TDOA/FDOA Least-Squares Fusion                      |
|       - Controlled spacecraft pitch/roll slewing              - Solves non-linear Jacobian system H via Gauss-Newton    |
|       - Synthesizes km-long baseline along orbit track        - Minimizes GDOP to achieve sub-100m CEP_50 fixes         |
|                                                                                                                         |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 1. Reference Coordinate Frames & Ellipsoidal Boundary Conditions

To maintain mathematical rigor across orbital mechanics and terrestrial geolocation, three fundamental coordinate frames are employed:

### 1.1 Coordinate Frame Transformations

1. **Earth-Centered Inertial Frame ($\mathcal{F}_{ECI}$ / J2000)**:
   - Origin: Earth's center of mass.
   - Fundamental plane: Earth's mean equator at J2000 epoch.
   - $X_{ECI}$: Directed toward the First Point of Aries (vernal equinox $\Upsilon$).
   - $Z_{ECI}$: Aligned with Earth's rotational axis (North Pole).
   - $Y_{ECI}$: Completes the right-handed orthogonal triad ($Y = Z \times X$).
   - Used for integrating spacecraft equations of motion under orbital mechanics:
     $$\mathbf{r}_s(t) = [X(t), Y(t), Z(t)]^T, \quad \mathbf{v}_s(t) = [\dot{X}(t), \dot{Y}(t), \dot{Z}(t)]^T$$

2. **Earth-Centered, Earth-Fixed Frame ($\mathcal{F}_{ECEF}$ / WGS-84)**:
   - Origin: Earth's center of mass.
   - $Z_{ECEF}$: Directed along the IERS Reference Pole (IRP).
   - $X_{ECEF}$: Passes through the intersection of the IERS Reference Meridian (Greenwich Prime Meridian) and equator.
   - $Y_{ECEF}$: Completes right-handed system ($90^\circ\text{ East longitude}$).
   - The transformation from ECI to ECEF accounts for Greenwich Mean Sidereal Time $\theta_{GMST}(t)$, polar motion $\mathbf{W}(t)$, and nutation/precession $\mathbf{PN}(t)$:
     $$\mathbf{r}_{ECEF}(t) = \mathbf{W}(t) \mathbf{R}_3(\theta_{GMST}(t)) \mathbf{PN}(t) \mathbf{r}_{ECI}(t)$$
     For short intercept intervals ($< 10\text{ minutes}$), the transformation simplifies to an axial rotation about $Z$ at Earth's angular rotation rate $\omega_E = 7.292115 \times 10^{-5}\text{ rad/s}$:
     $$\mathbf{R}_{ECI \to ECEF}(t) = \begin{bmatrix} \cos(\omega_E t) & \sin(\omega_E t) & 0 \\ -\sin(\omega_E t) & \cos(\omega_E t) & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

3. **Terrestrial Ellipsoid Constraint (WGS-84)**:
   A stationary ground emitter at position $\mathbf{r}_t = [x_t, y_t, z_t]^T$ in $\mathcal{F}_{ECEF}$ must satisfy the ellipsoidal boundary condition:
   $$\frac{x_t^2 + y_t^2}{(a_E + h_{alt})^2} + \frac{z_t^2}{(b_E + h_{alt})^2} = 1$$
   where:
   - Semi-major axis: $a_E = 6,378,137.0\text{ m}$.
   - Semi-minor axis: $b_E = 6,356,752.3142\text{ m}$.
   - First eccentricity squared: $e^2 = 1 - \frac{b_E^2}{a_E^2} \approx 6.69437999014 \times 10^{-3}$.
   - $h_{alt}$: Terrain elevation above the reference ellipsoid obtained from a Digital Terrain Elevation Model (DTED-2 or SRTM).

---

## 2. Single-Satellite Geolocation Mathematics

A single spacecraft cannot utilize instantaneous differential time of arrival between distinct platforms. However, by leveraging its orbital velocity ($v_s \approx 7.56\text{ km/s}$ at $550\text{ km}$), spatial phase interferometry, and active attitude maneuvering, the spacecraft achieves highly accurate single-pass localization.

### 2.1 Doppler Frequency Physics & Slant Range Kinematics

Let the spacecraft position and velocity in $\mathcal{F}_{ECEF}$ at time $t$ be $\mathbf{r}_s(t)$ and $\mathbf{v}_s(t)$.  
Let the stationary target emitter on the WGS-84 surface be $\mathbf{r}_t$.  
The relative range vector pointing from emitter to satellite is:
$$\mathbf{R}(t) = \mathbf{r}_s(t) - \mathbf{r}_t$$
The instantaneous Euclidean slant range is:
$$R(t) = \|\mathbf{R}(t)\| = \sqrt{(\mathbf{r}_s(t) - \mathbf{r}_t)^T (\mathbf{r}_s(t) - \mathbf{r}_t)}$$

The unit line-of-sight (LOS) vector is:
$$\mathbf{u}(t) = \frac{\mathbf{R}(t)}{R(t)} = \frac{\mathbf{r}_s(t) - \mathbf{r}_t}{\|\mathbf{r}_s(t) - \mathbf{r}_t\|}$$

Differentiating $R(t)$ with respect to time yields the range rate (radial velocity):
$$\dot{R}(t) = \frac{d}{dt} \sqrt{\mathbf{R}(t)^T \mathbf{R}(t)} = \frac{\mathbf{R}(t)^T \dot{\mathbf{R}}(t)}{\|\mathbf{R}(t)\|} = \mathbf{u}(t) \cdot (\mathbf{v}_s(t) - \mathbf{v}_t)$$
For a stationary emitter in ECEF, $\mathbf{v}_t = \mathbf{0}$, hence:
$$\dot{R}(t) = \mathbf{u}(t) \cdot \mathbf{v}_s(t) = \frac{(\mathbf{r}_s(t) - \mathbf{r}_t) \cdot \mathbf{v}_s(t)}{\|\mathbf{r}_s(t) - \mathbf{r}_t\|}$$

```
                  Satellite Orbit Track (v_s, a_s)
             ---o-----------------o-----------------o--->
              t_1                t_CA              t_2
               \                  |                  /
                \                 | R_min           /
                 \                |                /
                  \               |               /
                   \              |              /
                    \             v             /
                     ------> Emitter r_t <------
```

The received frequency $f_{rx}(t)$ for a nominal transmitter carrier frequency $f_0$ is:
$$f_{rx}(t) = f_0 \left( 1 - \frac{\dot{R}(t)}{c} \right) = f_0 \left( 1 - \frac{\mathbf{u}(t) \cdot \mathbf{v}_s(t)}{c} \right)$$
The Doppler shift $\Delta f_d(t) = f_{rx}(t) - f_0$ is:
$$\Delta f_d(t) = -\frac{f_0}{c} \frac{(\mathbf{r}_s(t) - \mathbf{r}_t) \cdot \mathbf{v}_s(t)}{\|\mathbf{r}_s(t) - \mathbf{r}_t\|}$$

**Geometric Interpretation**: Each instantaneous measurement of Doppler frequency $\Delta f_d(t)$ restricts the emitter to the surface of a **Doppler cone of position** whose vertex is at $\mathbf{r}_s(t)$, whose symmetry axis is aligned with $\mathbf{v}_s(t)$, and whose cone half-angle $\theta_c$ satisfies:
$$\cos\theta_c = \frac{\mathbf{u}(t) \cdot \mathbf{v}_s(t)}{\|\mathbf{v}_s(t)\|} = -\frac{c \cdot \Delta f_d(t)}{f_0 \|\mathbf{v}_s(t)\|}$$

---

### 2.2 Doppler Rate-of-Change ($df/dt$) & Inflection Geometry

Differentiating the Doppler shift with respect to time yields the **Doppler Rate-of-Change**:
$$\dot{f}_d(t) = \frac{d}{dt} [\Delta f_d(t)] = -\frac{f_0}{c} \frac{d}{dt} \left[ \frac{\mathbf{R}(t) \cdot \mathbf{v}_s(t)}{R(t)} \right]$$

Applying the quotient and product rules:
$$\frac{d}{dt} \left[ \frac{\mathbf{R} \cdot \mathbf{v}_s}{R} \right] = \frac{(\dot{\mathbf{R}} \cdot \mathbf{v}_s + \mathbf{R} \cdot \dot{\mathbf{v}}_s) R - (\mathbf{R} \cdot \mathbf{v}_s) \dot{R}}{R^2}$$
Noting that $\dot{\mathbf{R}} = \mathbf{v}_s$, $\dot{\mathbf{v}}_s = \mathbf{a}_s(t)$ (spacecraft gravitational and orbital acceleration), and $\dot{R} = \mathbf{u} \cdot \mathbf{v}_s$:
$$\dot{f}_d(t) = -\frac{f_0}{c R(t)} \left[ \|\mathbf{v}_s(t)\|^2 + (\mathbf{r}_s(t) - \mathbf{r}_t) \cdot \mathbf{a}_s(t) - (\mathbf{u}(t) \cdot \mathbf{v}_s(t))^2 \right]$$

```
  Doppler Frequency Shift df (kHz)
       +df_max ^
               |       \
               |        \
               |         \
             0 +----------*-----------> Time t (seconds)
               |           \   T_CA (Inflection Point: df = 0)
               |            \  Slope = -f0 * vs^2 / (c * R_min)
       -df_max |             \
```

#### The Time of Closest Approach ($T_{CA}$):
At the moment of closest approach ($t = T_{CA}$):
1. The line-of-sight vector is strictly orthogonal to spacecraft velocity:
   $$\mathbf{R}(T_{CA}) \cdot \mathbf{v}_s(T_{CA}) = 0 \implies \mathbf{u}(T_{CA}) \cdot \mathbf{v}_s(T_{CA}) = 0$$
2. The Doppler frequency shift crosses zero:
   $$\Delta f_d(T_{CA}) = 0$$
3. The slant range is at its global minimum: $R(T_{CA}) = R_{min}$.
4. The Doppler rate reaches its maximum negative magnitude (the steepest slope of the S-curve):
   $$\left. \dot{f}_d \right|_{T_{CA}} = -\frac{f_0}{c R_{min}} \left[ \|\mathbf{v}_s(T_{CA})\|^2 + (\mathbf{r}_s(T_{CA}) - \mathbf{r}_t) \cdot \mathbf{a}_s(T_{CA}) \right]$$

In circular orbit, orbital acceleration is centripetal: $\mathbf{a}_s = -\frac{\mu}{\|\mathbf{r}_s\|^3} \mathbf{r}_s \approx -\frac{v_s^2}{r_s} \hat{\mathbf{r}}_s$. Since $\|\mathbf{a}_s\| \approx 8.4\text{ m/s}^2 \ll \frac{v_s^2}{R_{min}} \approx \frac{(7560)^2}{600 \times 10^3} \approx 95.2\text{ m/s}^2$, the velocity squared term dominates:
$$R_{min} \approx \frac{f_0 \|\mathbf{v}_s(T_{CA})\|^2}{c \left| \left. \frac{df_d}{dt} \right|_{T_{CA}} \right|}$$

#### Closed-Form Single-Satellite Inversion:
1. Identify the zero-crossing epoch $T_{CA}$ from the frequency discriminator output.
2. The satellite position $\mathbf{r}_s(T_{CA})$ and velocity $\mathbf{v}_s(T_{CA})$ define the zero-Doppler plane:
   $$\mathcal{P}_{\text{zero}}: \quad (\mathbf{x} - \mathbf{r}_s(T_{CA})) \cdot \mathbf{v}_s(T_{CA}) = 0$$
3. Measure the maximum slope $|\dot{f}_d(T_{CA})|$ to compute the sphere of radius $R_{min}$:
   $$\mathcal{S}_{\text{range}}: \quad \|\mathbf{x} - \mathbf{r}_s(T_{CA})\|^2 = R_{min}^2$$
4. Intersecting $\mathcal{P}_{\text{zero}}$, $\mathcal{S}_{\text{range}}$, and the WGS-84 ellipsoid produces **exactly two symmetric candidate points** on the ground (one left of the ground track, one right of the ground track).
5. The left/right ambiguity is resolved via the spacecraft's directional antenna beam or interferometric phase.

---

### 2.3 Multi-Baseline Phase Interferometry Direction Finding (AOA)

To obtain instantaneous Angle of Arrival (AOA) without waiting for an orbital pass, the ESPA spacecraft integrates a multi-baseline planar antenna array.

```
       Incoming Wavefront (Angle theta relative to normal)
           /       /       /
          /       /       /
         /       /       /
        v       v       v
       [Ant 1]=========d=========[Ant 2]
                <- d * sin(theta) ->
```

Consider two antenna elements separated by baseline vector $\mathbf{d}$ with baseline length $d = \|\mathbf{d}\|$. An incident plane wave at carrier frequency $f_0$ ($\lambda = c/f_0$) arrives at an incidence angle $\theta$ relative to the array broadside normal (or angle of arrival $\psi = 90^\circ - \theta$).

The spatial path length difference is:
$$\Delta L = d \sin\theta$$
The resulting electrical phase difference between the two receiver channels is:
$$\Delta \Phi = \frac{2\pi}{\lambda} \Delta L = \frac{2\pi d}{\lambda} \sin\theta$$
Solving for the Angle of Arrival:
$$\theta = \arcsin\left( \frac{\lambda \Delta \Phi}{2\pi d} \right)$$

#### Phase Wrapping & Ambiguity Resolution
Standard digital I/Q phase detectors measure the wrapped phase $\Delta \phi \in [-\pi, \pi)$. If the antenna baseline exceeds half a wavelength ($d > \lambda/2$), phase wrapping occurs:
$$\Delta \Phi = \Delta \phi + 2\pi m, \quad m \in \{ -M, \dots, -1, 0, 1, \dots, M \}$$
where the integer ambiguity index $m$ is bounded by $M = \lfloor d/\lambda + 0.5 \rfloor$.

To simultaneously achieve wide angular coverage without ambiguity and high angular precision, a **Dual-Baseline Architecture** is implemented:

```
    [Ant 1]==== d_1 (Coarse) ====[Ant 2]=============== d_2 (Fine) ===============[Ant 3]
```

1. **Coarse Baseline ($d_1 \le \lambda/2$)**:
   - For an X-band center frequency of $10.0\text{ GHz}$ ($\lambda = 3.0\text{ cm}$), choose $d_1 = 1.4\text{ cm} \le \lambda/2$.
   - Phase wrapping is physically impossible ($m = 0$).
   - Yields an unambiguous but noisy coarse angle estimate $\hat{\theta}_{\text{coarse}}$:
     $$\hat{\theta}_{\text{coarse}} = \arcsin\left( \frac{\lambda \Delta \phi_1}{2\pi d_1} \right)$$

2. **Fine Baseline ($d_2 \gg \lambda/2$)**:
   - Antennas mounted at the ends of an antenna panel or deployable boom ($d_2 = 1.2\text{ m} = 40\lambda$).
   - The angular resolution improves proportionally to the baseline length:
     $$\sigma_\theta = \frac{\lambda}{2\pi d_2 \cos\theta \sqrt{2 \cdot \text{SNR}}}$$
     For $d_2 = 40\lambda$ and $\text{SNR} = 20\text{ dB}$ (ratio 100) at broadside ($\cos\theta = 1$):
     $$\sigma_\theta = \frac{1}{2\pi \cdot 40 \cdot \sqrt{200}} \approx 0.000281\text{ rad} \approx 0.016^\circ\text{ (0.96 arcmin)!}$$

3. **Ambiguity Resolution Algorithm**:
   The unambiguous coarse angle $\hat{\theta}_{\text{coarse}}$ determines the true integer ambiguity index $m^*$ of the fine baseline:
   $$m^* = \text{round}\left( \frac{d_2 \sin\hat{\theta}_{\text{coarse}}}{\lambda} - \frac{\Delta \phi_2}{2\pi} \right)$$
   The resolved fine angle of arrival is:
   $$\theta_{\text{fine}} = \arcsin\left( \frac{\lambda (\Delta \phi_2 + 2\pi m^*)}{2\pi d_2} \right)$$

---

### 2.4 Synthetic Baseline Extension via Spacecraft Pitch/Roll Maneuvers

Physical antenna booms on small ESPA satellites are structurally limited to $\le 1.5\text{--}2.5\text{ m}$ to avoid exciting solar array flexible vibration modes. However, by leveraging spacecraft orbital velocity ($v_s = 7.56\text{ km/s}$) and executing coordinated pitch-rate slews, the satellite synthesizes a **virtual baseline thousands of meters long**.

```
+---------------------------------------------------------------------------------------------------+
|                        SYNTHETIC BASELINE EXTENSION VIA SLEW MANEUVERING                          |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|    Satellite Position at t = 0                                     Satellite Position at t = Δt   |
|         [ SAT(t=0) ] =============================================> [ SAT(t=Δt) ]                  |
|               \            Synthetic Baseline d_synth = vs * Δt           /                       |
|                \                     (e.g., 3.78 km)                     /                        |
|                 \                                                       /                         |
|                  \  Antenna Bore-Sight Kept Locked on Target Area      /                          |
|                   \  via Continuous ADCS Pitch Slew (ω_pitch ~ 1.2°/s)/                           |
|                    \                                                 /                            |
|                     v                                               v                             |
|                                       +-------------+                                             |
|                                       | Target Area |                                             |
|                                       +-------------+                                             |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

1. **Target Tracking Maneuver (Spotlight Pitch)**:
   The satellite attitude control system (ADCS) commands reaction wheels to pitch forward at an angular rate $\omega_p(t) = \frac{v_s R_{min}}{R^2(t)}$, keeping the high-gain antenna bore-sight focused on the target coordinates throughout the pass.
2. **Synthetic Baseline Length**:
   Over a coherent/semi-coherent integration dwell time $\Delta t = 0.5\text{ seconds}$, the physical displacement along the velocity vector is:
   $$d_{\text{synth}} = v_s \cdot \Delta t = 7,560\text{ m/s} \times 0.5\text{ s} = 3,780\text{ meters}$$
3. **Cross-Track Resolution**:
   Interferometrically correlating pulse trains across $d_{\text{synth}}$ provides a cross-track spatial resolution on the ground of:
   $$\delta x \approx \frac{\lambda R}{d_{\text{synth}}}$$
   For X-band ($\lambda = 0.0319\text{ m}$) at $R = 600\text{ km}$:
   $$\delta x \approx \frac{0.0319 \times 600 \times 10^3}{3,780} \approx 5.06\text{ meters!}$$

---

## 3. Multi-Satellite Constellation Geolocation

While single satellites provide essential standalone mapping, a distributed constellation flying in formation (clusters of 3 or 4 spacecraft separated by 15–150 km) achieves **instantaneous 2D/3D geolocation** without requiring extended dwell times.

```
                  Sat 1 (r_1, v_1)            Sat 2 (r_2, v_2)
                        \                       /
                         \  TDOA Isochrone     /
                          \   Hyperboloid     /
                           \                 /
                            \               /
                             \             /
                              \           /
                        Sat 3 (r_3, v_3) /
                                |       /
                                | FDOA Isodop Surface
                                v      v
                          [ Emitter r_t ]
                           (CEP_50 Ellipse)
```

### 3.1 Distributed Time Difference of Arrival (TDOA) Hyperboloids

Consider a cluster of $M \ge 3$ satellites at positions $\mathbf{r}_i(t)$ ($i = 1, \dots, M$) with clock synchronization errors $\delta t_i$.  
An emitter at unknown terrestrial coordinates $\mathbf{r}_t$ transmits a signal at unknown epoch $t_0$.  
The Time of Arrival (TOA) $\tau_i$ at satellite $i$ is:
$$\tau_i = t_0 + \frac{\|\mathbf{r}_i - \mathbf{r}_t\|}{c} + \delta t_i + \epsilon_i$$
where $\epsilon_i$ represents receiver thermal noise and channel estimation jitter.

Taking the differential TOA between satellite $i$ and reference satellite $j$ cancels the unknown transmission time $t_0$:
$$\Delta \tau_{ij} = \tau_i - \tau_j = \frac{\|\mathbf{r}_i - \mathbf{r}_t\| - \|\mathbf{r}_j - \mathbf{r}_t\|}{c} + (\delta t_i - \delta t_j) + \epsilon_{ij}$$
Multiplying by the speed of light $c$ converts this into the Range Difference of Arrival (RDOA):
$$\Delta R_{ij} = c \Delta \tau_{ij} = \|\mathbf{r}_i - \mathbf{r}_t\| - \|\mathbf{r}_j - \mathbf{r}_t\| + c(\delta t_i - \delta t_j) + c\epsilon_{ij}$$

#### Mathematical Geometry of TDOA:
The locus of points satisfying $\|\mathbf{r}_i - \mathbf{r}_t\| - \|\mathbf{r}_j - \mathbf{r}_t\| = \text{constant}$ defines a **hyperboloid of two sheets in three dimensions**, where the foci are located at the satellite positions $\mathbf{r}_i$ and $\mathbf{r}_j$.
- The intersection of this 3D hyperboloid with the 2D WGS-84 Earth ellipsoid forms a **hyperbolic Line of Position (LOP)** on the surface.
- For a cluster of $M = 3$ satellites, there are $M - 1 = 2$ independent baselines (e.g., pairs $(1, 2)$ and $(1, 3)$).
- The intersection of two independent hyperbolic LOPs on the Earth's surface yields two discrete points: the true emitter location and a "ghost" ambiguity point. The ghost point is immediately rejected as it falls outside the antennas' common field of view or produces non-physical altitude solutions.

---

### 3.2 Distributed Frequency Difference of Arrival (FDOA) Isodops

Concurrently, each satellite $i$ measures the received carrier frequency $f_{rx, i}$:
$$f_{rx, i} = f_0 \left( 1 - \frac{(\mathbf{r}_i - \mathbf{r}_t) \cdot (\mathbf{v}_i - \mathbf{v}_t)}{c \|\mathbf{r}_i - \mathbf{r}_t\|} \right) + \delta f_{LO, i} + \eta_i$$
where $\delta f_{LO, i}$ is the spacecraft local oscillator frequency offset and $\eta_i$ is measurement noise.

Taking the difference between satellites $i$ and $j$ eliminates the transmitter's unknown nominal center frequency $f_0$ to first order:
$$\Delta f_{ij} = f_{rx, i} - f_{rx, j} = -\frac{f_0}{c} \left[ \frac{(\mathbf{r}_i - \mathbf{r}_t) \cdot \mathbf{v}_i}{\|\mathbf{r}_i - \mathbf{r}_t\|} - \frac{(\mathbf{r}_j - \mathbf{r}_t) \cdot \mathbf{v}_j}{\|\mathbf{r}_j - \mathbf{r}_t\|} \right] + (\delta f_{LO, i} - \delta f_{LO, j}) + \eta_{ij}$$

The surface of constant $\Delta f_{ij}$ forms a 3D **isodop surface**. Its intersection with the WGS-84 ellipsoid defines an **isodop contour line**.

---

### 3.3 Joint TDOA/FDOA Isochrone-Isodop Intersection Geometry

Combining TDOA and FDOA measurements provides an extraordinarily powerful geometric synergy:

```
+---------------------------------------------------------------------------------------------------+
|                        JOINT TDOA/FDOA ISOCHRONE-ISODOP INTERSECTION                              |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       \     TDOA Isochrone LOP                                                    |
|                        \    Δτ_12 = C_1                                                           |
|                         \                                                                         |
|                          \         / FDOA Isodop LOP                                              |
|                           \       /  Δf_12 = C_2                                                  |
|                            \     /                                                                |
|                             \   /   Intersection Angle ψ ≈ 75° - 90°                              |
|                              \ /    (Near-Orthogonal!)                                            |
|                               X  <================ [ UNAMBIGUOUS 2-SATELLITE FIX ]                |
|                              / \                    CEP_50 collapsed from kilometers              |
|                             /   \                   down to < 200 meters                          |
|                            /     \                                                                |
|                           /       \                                                               |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

1. **Geometric Orthogonality**:
   - The spatial gradient of the TDOA hyperboloid ($\nabla_{\mathbf{r}_t} \Delta \tau_{ij}$) points along the line connecting the two spacecraft.
   - The spatial gradient of the FDOA isodop ($\nabla_{\mathbf{r}_t} \Delta f_{ij}$) depends heavily on the relative velocity vectors $\mathbf{v}_i - \mathbf{v}_j$.
   - In typical LEO orbital trajectories, the TDOA isochrones and FDOA isodops intersect at angles between $60^\circ$ and $90^\circ$.
2. **Minimal Constellation Sizing**:
   - **Single Baseline ($M = 2$ Satellites)**: With just two satellites flying in formation, one TDOA measurement and one FDOA measurement intersect the Earth ellipsoid to yield an **instantaneous 2D geolocation fix**!
   - **Triplet Cluster ($M = 3$ Satellites)**: Yields two TDOA and two FDOA equations, forming an over-determined system of 4 non-linear equations for the 2 unknown surface coordinates, suppressing noise and driving $\text{CEP}_{50} \le 100\text{ meters}$.

---

### 3.4 Cross-Ambiguity Function (CAF) & Cramer-Rao Lower Bounds (CRLB)

The joint estimation of differential time delay $\Delta \tau$ and differential Doppler shift $\Delta f$ from noisy satellite signals is achieved via the 2D **Cross-Ambiguity Function (CAF)**.

Let the complex analytic baseband signals recorded at satellites $i$ and $j$ over coherent observation interval $T$ be:
$$r_i(t) = s(t) + n_i(t)$$
$$r_j(t) = A \cdot s(t - \Delta \tau_{ij}) e^{j 2\pi \Delta f_{ij} t} + n_j(t)$$
where $s(t)$ is the unknown emitter waveform, $A$ is relative amplitude, and $n_i(t), n_j(t)$ are mutually independent zero-mean complex Gaussian noise processes with spectral densities $N_{0, i}$ and $N_{0, j}$.

The 2D Cross-Ambiguity Function is defined as:
$$\chi(\tau, \nu) = \int_0^T r_i(t) r_j^*(t + \tau) e^{-j 2\pi \nu t} dt$$

The maximum likelihood estimate (MLE) corresponds to the global peak of the CAF surface:
$$(\widehat{\Delta \tau}_{ij}, \widehat{\Delta f}_{ij}) = \arg \max_{\tau, \nu} |\chi(\tau, \nu)|^2$$

```
   CAF Magnitude |χ(τ, ν)|^2
              ^
             / \        Peak at (Δτ_true, Δf_true)
            / | \
           /  |  \
          *---+---*-----> Differential Time Delay τ
         /         \
        v           v
    Differential Doppler ν
```

#### Analytical Derivation of the Cramer-Rao Lower Bounds:
The Cramer-Rao Lower Bound defines the theoretical minimum variance achievable by any unbiased estimator. Inverting the Fisher Information Matrix $\mathbf{J}$ yields:

1. **CRLB for Time Delay Estimation ($\sigma_{\Delta \tau}$)**:
   $$\sigma_{\Delta \tau}^2 \ge \frac{1}{(2\pi)^2 \cdot B_{\text{rms}}^2 \cdot (B \cdot T) \cdot \text{SNR}_{\text{eff}}}$$
   where:
   - $B$ is the pre-detection signal bandwidth.
   - $T$ is the coherent correlation integration time.
   - $\text{SNR}_{\text{eff}}$ is the post-correlation effective signal-to-noise ratio:
     $$\text{SNR}_{\text{eff}} = \frac{\text{SNR}_i \cdot \text{SNR}_j}{1 + \text{SNR}_i + \text{SNR}_j}$$
   - $B_{\text{rms}}$ is the Root-Mean-Square (RMS) bandwidth of the signal:
     $$B_{\text{rms}} = \left[ \frac{\int_{-\infty}^{\infty} f^2 |S(f)|^2 df}{\int_{-\infty}^{\infty} |S(f)|^2 df} \right]^{1/2}$$
     For an ideal rectangular bandpass spectrum of bandwidth $B$:
     $$B_{\text{rms}} = \frac{B}{\sqrt{12}} \approx 0.2887 B$$

2. **CRLB for Frequency Shift Estimation ($\sigma_{\Delta f}$)**:
   $$\sigma_{\Delta f}^2 \ge \frac{12}{(2\pi)^2 \cdot T^2 \cdot (B \cdot T) \cdot \text{SNR}_{\text{eff}}} = \frac{3}{\pi^2 T^3 B \cdot \text{SNR}_{\text{eff}}}$$

#### Numerical Evaluation Across Typical Waveforms:

| Waveform Type | Bandwidth $B$ | Dwell $T$ | Input $\text{SNR}_i = \text{SNR}_j$ | Effective $\text{SNR}_{\text{eff}}$ | TDOA Bound $\sigma_{\Delta \tau}$ | Range Diff $\sigma_{\Delta R} = c \sigma_\tau$ | FDOA Bound $\sigma_{\Delta f}$ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tactical VHF Comms** | $25\text{ kHz}$ | $100\text{ ms}$ | $+15\text{ dB}$ (31.6) | $15.3\text{ dB}$ (34.0) | $1.74\,\mu\text{s}$ | $522.0\text{ m}$ | $0.59\text{ Hz}$ |
| **Tactical Drone FHSS** | $2\text{ MHz}$ | $10\text{ ms}$ | $+12\text{ dB}$ (15.8) | $11.8\text{ dB}$ (15.1) | $4.12\text{ ns}$ | $1.24\text{ m}$ | $3.18\text{ Hz}$ |
| **GNSS Jammer Chirp** | $20\text{ MHz}$ | $20\text{ ms}$ | $+10\text{ dB}$ (10.0) | $9.8\text{ dB}$ (9.5) | $0.11\text{ ns}$ | $0.033\text{ m}$ | $0.20\text{ Hz}$ |
| **X-band Radar Pulse** | $10\text{ MHz}$ | $1.0\,\mu\text{s}$ ($N=100$) | $+20\text{ dB}$ (100.0) | $19.9\text{ dB}$ (99.0) | $0.35\text{ ns}$ | $0.105\text{ m}$ | $2.75\text{ Hz}$ |

---

## 4. GDOP, Covariance Formulation & Circular Error Probable (CEP)

### 4.1 Measurement Jacobian Matrix $\mathbf{H}$

Let the unknown target position on the Earth's surface be parameterized by horizontal local coordinates $\mathbf{x} = [x, y]^T \in \mathbb{R}^2$.  
Let the measurement vector stacking $K$ TDOA pairs and $L$ FDOA pairs be:
$$\mathbf{z} = [\Delta \tau_1, \Delta \tau_2, \dots, \Delta \tau_K, \Delta f_1, \Delta f_2, \dots, \Delta f_L]^T = \mathbf{h}(\mathbf{x}) + \mathbf{w}$$
where measurement noise $\mathbf{w} \sim \mathcal{N}(\mathbf{0}, \mathbf{R})$.

Linearizing $\mathbf{h}(\mathbf{x})$ around an estimated position $\mathbf{x}_0$ via first-order Taylor expansion yields:
$$\delta \mathbf{z} = \mathbf{H} \delta \mathbf{x} + \mathbf{w}$$
The Jacobian matrix $\mathbf{H}$ has dimension $(K + L) \times 2$:
$$\mathbf{H} = \left. \begin{bmatrix} \frac{\partial \Delta \tau_1}{\partial \mathbf{x}} \\ \vdots \\ \frac{\partial \Delta \tau_K}{\partial \mathbf{x}} \\ \frac{\partial \Delta f_1}{\partial \mathbf{x}} \\ \vdots \\ \frac{\partial \Delta f_L}{\partial \mathbf{x}} \end{bmatrix} \right|_{\mathbf{x}_0}$$

#### Analytical Jacobian Row Derivations:
1. **For TDOA Baseline $(i, j)$**:
   $$\frac{\partial \Delta \tau_{ij}}{\partial \mathbf{x}} = \frac{1}{c} \left[ \frac{\partial \|\mathbf{r}_i - \mathbf{r}_t\|}{\partial \mathbf{x}} - \frac{\partial \|\mathbf{r}_j - \mathbf{r}_t\|}{\partial \mathbf{x}} \right] = \frac{1}{c} (\mathbf{u}_i - \mathbf{u}_j)_{2D}^T$$
   where $\mathbf{u}_i = \frac{\mathbf{r}_i - \mathbf{r}_t}{\|\mathbf{r}_i - \mathbf{r}_t\|}$ is the 3D unit line-of-sight vector, and $(\cdot)_{2D}$ denotes projection onto the local horizontal plane.
2. **For FDOA Baseline $(i, j)$**:
   $$\frac{\partial \Delta f_{ij}}{\partial \mathbf{x}} = \frac{f_0}{c} \left[ \frac{\mathbf{v}_{i, 2D} - (\mathbf{v}_i \cdot \mathbf{u}_i)\mathbf{u}_{i, 2D}}{\|\mathbf{r}_i - \mathbf{r}_t\|} - \frac{\mathbf{v}_{j, 2D} - (\mathbf{v}_j \cdot \mathbf{u}_j)\mathbf{u}_{j, 2D}}{\|\mathbf{r}_j - \mathbf{r}_t\|} \right]^T$$

---

### 4.2 Error Covariance Matrix & Gauss-Newton Inversion

The minimum-variance unbiased estimate of the target position error covariance is:
$$\mathbf{P} = \mathbb{E}[\delta \mathbf{x} \delta \mathbf{x}^T] = (\mathbf{H}^T \mathbf{R}^{-1} \mathbf{H})^{-1} = \begin{bmatrix} \sigma_x^2 & \sigma_{xy} \\ \sigma_{xy} & \sigma_y^2 \end{bmatrix}$$

The iterative **Gauss-Newton Algorithm** updates the estimated position until convergence:
$$\hat{\mathbf{x}}_{k+1} = \hat{\mathbf{x}}_k + (\mathbf{H}_k^T \mathbf{R}^{-1} \mathbf{H}_k)^{-1} \mathbf{H}_k^T \mathbf{R}^{-1} [\mathbf{z} - \mathbf{h}(\hat{\mathbf{x}}_k)]$$
Convergence is reached when $\|\hat{\mathbf{x}}_{k+1} - \hat{\mathbf{x}}_k\| < 0.1\text{ meters}$ (typically 3–5 iterations).

---

### 4.3 Geometric Dilution of Precision (GDOP)

When measurement errors are normalized and uncorrelated ($\mathbf{R} = \sigma_0^2 \mathbf{I}$), the Geometric Dilution of Precision represents the purely geometric multiplier linking sensor measurement error to terrestrial position error:
$$\text{GDOP} = \sqrt{\text{Tr}\left((\mathbf{H}^T \mathbf{H})^{-1}\right)}$$

- **Optimal Constellation Baselines**: For LEO satellites at $550\text{ km}$, cluster baselines of $40\text{ to }100\text{ km}$ provide an optimal GDOP balance ($\text{GDOP} \approx 15\text{--}35$).
- **Collinear Degeneracy**: If three satellites fly in a straight along-track "pearl-string" formation, the baseline vectors are parallel, driving $\det(\mathbf{H}^T \mathbf{H}) \to 0$ and $\text{GDOP} \to \infty$ in the cross-track direction! Therefore, the constellation **must maintain cross-track separation** ($\Delta y \ge 25\text{ km}$) via slightly inclined or out-of-plane relative motion.

---

### 4.4 Circular Error Probable ($\text{CEP}_{50}$) Derivation

The 2D position estimation error follows a bivariate Gaussian distribution with covariance $\mathbf{P}$.

```
                 y ^
                   |           * * *
                   |       *     |     *   Semi-major axis 'a'
                   |     *       |       *
                   |    *        |  /----*--- Tilt angle theta_tilt
                   |   *         | /      *
                   |   *---------+--------*------> x
                   |   *         |        *
                   |    *        |       *
                   |     *       |     *   Semi-minor axis 'b'
                   |       *     |   *
                   |           * * *
```

1. **Eigenvalue Decomposition**:
   $$\det(\mathbf{P} - \lambda \mathbf{I}) = 0 \implies \lambda^2 - (\sigma_x^2 + \sigma_y^2)\lambda + (\sigma_x^2 \sigma_y^2 - \sigma_{xy}^2) = 0$$
   $$\lambda_{1, 2} = \frac{\sigma_x^2 + \sigma_y^2 \pm \sqrt{(\sigma_x^2 - \sigma_y^2)^2 + 4\sigma_{xy}^2}}{2}$$
   - Semi-major axis of $1\sigma$ error ellipse ($39.3\%$ probability): $a = \sqrt{\lambda_1}$.
   - Semi-minor axis of $1\sigma$ error ellipse: $b = \sqrt{\lambda_2}$.
   - Ellipse orientation tilt angle relative to local East:
     $$\theta_{\text{tilt}} = \frac{1}{2} \arctan\left( \frac{2\sigma_{xy}}{\sigma_x^2 - \sigma_y^2} \right)$$

2. **Circular Error Probable ($\text{CEP}_{50}$)**:
   The $\text{CEP}_{50}$ is defined as the radius of the circle centered at the true position containing $50\%$ of the probability mass:
   $$\iint_{x^2 + y^2 \le \text{CEP}_{50}^2} \frac{1}{2\pi \sqrt{\det\mathbf{P}}} \exp\left( -\frac{1}{2} \mathbf{x}^T \mathbf{P}^{-1} \mathbf{x} \right) dx dy = 0.50$$

   Using the standard aerospace **Rand Corporation / Torrieri approximation**:
   $$\text{CEP}_{50} \approx 0.589 (\sqrt{\lambda_1} + \sqrt{\lambda_2}) = 0.589 (a + b)$$
   Alternatively, using the isotropic quadratic mean:
   $$\text{CEP}_{50} = \sqrt{-2\ln(1 - 0.5)} \sqrt{\frac{\lambda_1 + \lambda_2}{2}} \approx 0.83255 \sqrt{\lambda_1 + \lambda_2}$$
   For high-confidence strike operations, the $90\%$ and $95\%$ containment radii are:
   $$R_{90\%} = 1.65 \times \text{CEP}_{50}, \quad R_{95\%} = 2.08 \times \text{CEP}_{50}$$

---

## 5. Constellation Clock Synchronization & Disciplinary Models

In distributed TDOA systems, timing errors between spacecraft translate directly into range difference errors:
$$\Delta R_{\text{error}} = c \cdot \Delta t_{\text{sync}}$$
- A timing offset of $\Delta t_{\text{sync}} = 1.0\text{ ns}$ creates a range difference error of $\Delta R = 0.2998\text{ meters}$.
- An uncalibrated timing drift of $10\text{ ns}$ induces $\Delta R = 3.0\text{ meters}$, which with a typical LEO GDOP of 30 expands into an **in-plane geolocation error of 90 meters!**

```
+---------------------------------------------------------------------------------------------------+
|                        CONSTELLATION CLOCK SYNCHRONIZATION ARCHITECTURE                           |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|    [PRIMARY OSCILLATOR]                                                                           |
|    Microchip SA.45s Chip-Scale Atomic Clock (CSAC)                                                |
|    - Allan Deviation: σ_y(τ) <= 2.5 x 10^-11 @ τ = 1s, 1.5 x 10^-11 @ τ = 10s                     |
|                                         |                                                         |
|                                         v                                                         |
|    [LEVEL 1 DISCIPLINE: SPACEBORNE GNSSDO]                                                        |
|    Multi-Frequency Dual-Constellation Receiver (GPS L1/L2/L5 + Galileo E1/E5a)                    |
|    - Carrier-Phase Precise Point Positioning (PPP) Real-Time Filter                               |
|    - Synchronizes Epochs to UTC(USNO) / GPST with Jitter < 0.35 ns RMS                            |
|                                         |                                                         |
|                                         v (When GNSS is Intentionally Jammed)                     |
|    [LEVEL 2 DISCIPLINE: OPTICAL ISL DUAL-ONE-WAY TIME TRANSFER (DOWTT)]                            |
|    Bidirectional Lasercom Pulse Timing Exchange                                                   |
|    - Cancels symmetric orbital propagation delay c * T_prop                                       |
|    - Yields Relative Inter-Satellite Clock Offset δt_ij < 50 PICOSECONDS!                         |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### 5.1 Oscillator Stability & Allan Deviation Requirements

The fractional frequency stability of the onboard oscillator is quantified by the **Allan Deviation $\sigma_y(\tau)$**:
$$\sigma_y^2(\tau) = \frac{1}{2} \mathbb{E}\left[ (\bar{y}_{k+1} - \bar{y}_k)^2 \right]$$
The accumulated time error $\sigma_x(T_{\text{dwell}})$ over an uncorrected observation dwell $T_{\text{dwell}}$ is:
$$\sigma_x(T_{\text{dwell}}) \approx \sigma_y(T_{\text{dwell}}) \cdot T_{\text{dwell}}$$

#### Oscillator Performance Comparison:

| Oscillator Type | Power Consumption | Mass | Allan Dev $\sigma_y(1\text{ s})$ | Time Drift in $10\text{ s}$ | Max Uncalibrated TDOA Error | Suitability |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard TCXO** | $0.2\text{ W}$ | $15\text{ g}$ | $1.0 \times 10^{-8}$ | $100\text{ ns}$ | $30.0\text{ meters}$ | **Unusable for TDOA** |
| **High-Grade OCXO (Wenzel)** | $2.5\text{ W}$ | $180\text{ g}$ | $5.0 \times 10^{-12}$ | $0.05\text{ ns}$ | $0.015\text{ meters}$ | **Marginal (Thermal Drift)** |
| **Chip-Scale Atomic Clock (CSAC SA.45s)**| $0.12\text{ W}$ | $35\text{ g}$ | $2.5 \times 10^{-11}$ | $0.25\text{ ns}$ | $0.075\text{ meters}$ | **Excellent Baseline** |
| **Space-Grade Rubidium Clock (mRAFS)** | $12.0\text{ W}$ | $1.2\text{ kg}$ | $1.5 \times 10^{-12}$ | $0.015\text{ ns}$ | $0.0045\text{ meters}$ | **Heavy / High Power** |

*Baseline Selection*: Microchip SA.45s CSAC combined with GNSS carrier-phase disciplining is selected for the 100–150 kg spacecraft platform.

---

### 5.2 Optical ISL Dual-One-Way Time Transfer (DOWTT) Derivation

When flying through intense contested EW theaters where terrestrial GNSS signals are aggressively jammed, the constellation transitions to autonomous **Optical Inter-Satellite Link Time Transfer**:

1. **Protocol Execution**:
   - Satellite $i$ transmits an optical timing marker (pulse) at local clock epoch $t_{tx, i}$. It is received at satellite $j$ at local epoch $t_{rx, j}$.
   - Simultaneously, satellite $j$ transmits an identical timing marker at local epoch $t_{tx, j}$, received at satellite $i$ at local epoch $t_{rx, i}$.
2. **Measurement Equations**:
   $$t_{rx, j} - t_{tx, i} = T_{\text{prop}} + (\delta t_j - \delta t_i) + \Delta_{\text{rel}} + \epsilon_{ij}$$
   $$t_{rx, i} - t_{tx, j} = T_{\text{prop}} - (\delta t_j - \delta t_i) - \Delta_{\text{rel}} + \epsilon_{ji}$$
   where $T_{\text{prop}} = \frac{\|\mathbf{r}_i - \mathbf{r}_j\|}{c}$ is the symmetric inter-satellite optical time-of-flight, and $\Delta_{\text{rel}}$ is the Sagnac relativistic correction.
3. **Cancellation of Propagation Delay**:
   Subtracting the two equations completely eliminates the distance $T_{\text{prop}}$:
   $$\delta t_{ij} = \delta t_j - \delta t_i = \frac{(t_{rx, j} - t_{tx, i}) - (t_{rx, i} - t_{tx, j})}{2} - \Delta_{\text{rel}}$$
   $$\sigma_{\delta t_{ij}} \le 50\text{ picoseconds (corresponding to } < 1.5\text{ cm range difference)}$$
   *Operational Result*: DOWTT renders the constellation completely independent of external GPS/GNSS signals for sub-nanosecond synchronization!
