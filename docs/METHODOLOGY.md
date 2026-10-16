# OrbitLink Studio — methodology

This document lists the equations and assumptions behind every number in the link-budget panel,
timeline and coverage maps.

## 1. Orbits

* **Walker shells** — `T = P·S` satellites, plane *j* RAAN = Ω₀ + j·360°/P (Delta) or j·180°/P (Star),
  mean anomaly M = k·360°/S + j·F·360°/T.
* **Propagation (presets)** — two-body Kepler orbit with J2 secular rates
  `Ω̇ = −1.5 n J2 (Rₑ/p)² cos i`, `ω̇ = 0.75 n J2 (Rₑ/p)² (5cos²i − 1)`,
  `Ṁ = n [1 + 0.75 J2 (Rₑ/p)² √(1−e²)(3cos²i − 1)]`.
* **TLEs** — SGP4 (satellite.js) or the same Kepler+J2 model initialised from the TLE mean elements.
* **GEO** — station-kept slot with optional residual inclination *i*: sub-satellite latitude
  `asin(sin i · sin u)` and the classic figure-8 longitude libration.
* ECI→ECEF by GMST rotation (IAU-82). Orbit rings are drawn in the inertial frame and rotated by −GMST every frame.

## 2. Geometry

Look angles from WGS-84 ENU; terminal **scan angle** = angle between the panel normal (tilt, azimuth) and
the line of sight. Satellite **steering (nadir) angle** = angle between −r̂_sat and the direction to the beam aim point.
Range rate and Doppler from ±0.5 s finite differences: `f_D = −ṙ/c · f`, Doppler rate from the second difference.

## 3. Antenna patterns (relative gain G(θ) − G_max)

| Model | Expression |
| --- | --- |
| Bessel (uniform circular aperture) | `(2 J₁(u)/u)²`, `u = 1.6163 · sin θ / sin(θ₃dB/2)`, sidelobes capped by Ls |
| ITU-R S.672 | `−3(θ/ψ₀)²` for θ ≤ aψ₀; `Ls` to bψ₀; `Ls + 20 − 25 log(θ/ψ₀)` beyond |
| Gaussian | `−12 (θ/θ₃dB)²` |
| Phased array | Bessel shape with `θ₃dB/cos θ_scan` broadening and `10·n·log cos θ_scan` scan loss |

Terminal arrays use the same cosⁿ law separately for Rx and Tx.

## 4. Beam layouts and co-channel C/I

* **Steerable cells** — a hexagonal cell lattice (pointy-top, circumradius D/2) anchored on whole-degree
  origins. The serving beam is aimed at the centre of the terminal's cell, so the terminal sees a small
  off-axis loss that changes with its position in the cell. The first tier of 6 co-channel cells sits at
  `max(d·√N, k·R·tan θ₃dB,eff)` (reuse distance or scheduler separation in broadened beamwidths) and contributes
  `I = load · Σ G(θᵢ)`. `C/I = G(θ₀) − 10 log I`.
* **Fixed strips** — N beams fixed to the satellite body frame (x along-track, y cross-track, z nadir).
  Along-track Gaussian, cross-track iso-flux (4th-order super-Gaussian) shaping. Co-colour strips interfere.
* **Hex multibeam (GEO)** — beam boresights on a hexagonal angular lattice around the aim point, 1/3/4/7-colour reuse.
  The serving beam is the one with the highest gain toward the terminal; co-colour beams form I.
* **KML contours** — point-in-polygon on nested contours; between contour *Lᵢ* (outer) and *Lᵢ₊₁* (inner):
  `L = Lᵢ + (Lᵢ₊₁ − Lᵢ) · d_out/(d_out + d_in)`. Outside the outer contour a Gaussian roll-off is extrapolated
  for interference. Edge-only polygons use `L = L_edge · (r/R_eq)²`.

## 5. Propagation (ITU-R)

* Gaseous: P.676-10 Annex 2 γ₀, γ_w with equivalent heights; water vapour via the zenith method from
  the P.836 total columnar content V.
* Cloud: `A_C = L_red · K_l(f, 0 °C) / sin θ` (P.840) with L_red from the P.840 maps (p ≥ 1 % values used for p < 1 %).
* Rain: P.618-13 §2.2.1.1 steps 1–10, R0.01 from P.837-7, rain height h₀ + 0.36 km from P.839-4,
  coefficients from P.838-3 with polarisation tilt τ (45° for circular).
* Scintillation: P.618-13 §2.4.1 with Nwet from P.453 and the terminal equivalent aperture.
* Total: `A_T = A_G + √((A_R + A_C)² + A_S²)`.
* Rain XPD: P.618-13 §4.1 (combined in power with the antenna cross-pol isolation).
* Sky noise: `T_sky = T_m (1 − 10^(−A/10)) + 2.7·10^(−A/10)`, `T_m = 275 K`; the increase over clear sky is added to the
  terminal system temperature (downlink only).

## 6. Link equations

```
EIRP_fwd  = EIRP_peak + G_rel(beam → terminal) − OBO
G/T_term  = G_rx − n_rx·10log cos θ_scan − L_radome − 10 log(T_sys + T_ground·(1−sin el) + ΔT_sky)
EIRP_rtn  = EIRP_max − n_tx·10log cos θ_scan − back-off − L_radome
G/T_sat   = G/T_peak + G_rel(beam → terminal)
C/N0      = EIRP − FSPL − A_atm − L_pol − L_point + G/T + 228.6
Es/N0     = C/N0 − 10 log R_s,      R_s = B/(1+α)
(C/(N+I))⁻¹ = (Es/N0)⁻¹ + (C/I_cc)⁻¹ + (C/ASI)⁻¹ + (C/XPI)⁻¹ + (C/IM)⁻¹ + (C/N_feeder)⁻¹      (bent-pipe)
regenerative: min(space-segment, feeder)
```

ACM: the highest-efficiency DVB-S2/S2X MODCOD whose threshold + (ACM margin + implementation margin) ≤ Es/(N0+I0).
Throughput = R_s × spectral efficiency. **Availability** is the largest p for which the link still closes the lowest
MODCOD, found by bisection on P.618 (`100 − p` %). PFD = EIRP − 10log(4πd²) − 10log(B/4 kHz).
RTT = 4 × user–satellite propagation (gateway assumed at a similar slant range; no processing delay).

## 7. Make-before-break simulator

At each step the serving link(s) are re-evaluated. A handover is **triggered** when, looking ahead by
`acquisition + overlap + step`, the serving satellite will no longer be usable (below the handover elevation,
outside its beams or failing the link), or when the policy finds a better satellite (orbit upgrade in LEO-first,
Es/N0 better by the hysteresis, or ≥15 % more throughput). With two beams the idle beam **acquires** the target,
**locks** after the acquisition time, traffic **switches** on lock and the old beam is **released** after the
overlap — zero interruption. With one beam the beam is re-pointed (**break**) and traffic stops for the acquisition
time. Candidate ranking uses max elevation, best Es/N0 or longest remaining usable time (evaluated with the full
link model).

## 8. Limitations

* Payload RF values are representative public estimates; LEO systems use proprietary waveforms (e.g. OFDM) —
  DVB-S2X is used as a common performance proxy.
* No inter-satellite interference from other systems except through C/ASI; no EPFD/Article 22 masks.
* Rain is statistical (annual exceedance); the timeline is clear-sky. Feeder links are a fixed C/N contribution.
* Kepler+J2 ignores drag and higher harmonics (use SGP4 + fresh TLEs for operational accuracy).
