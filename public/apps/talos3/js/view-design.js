/* TALOS-3 simulator — System Design view: mission architecture, payload block diagram,
   orbital mechanics, TDOA/FDOA math, link budgets, spacecraft bus and interactive scenario deep-links. */
'use strict';
(function (S) {
  const { C, V } = S, U = S.ui, B = S.Bus;
  const st = () => S.state;
  let docEl, initialized = false;

  const buildSvgDiagram = () => `
    <div class="diagram">
      <svg viewBox="0 0 1060 480" role="img" aria-label="TALOS-3 End-to-End System Architecture Diagram">
        <defs>
          <marker id="ar-norm" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="ar" d="M0,0 L8,4 L0,8 z"/></marker>
          <marker id="ar-acc" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="ar-acc" d="M0,0 L8,4 L0,8 z"/></marker>
          <marker id="ar-sync" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="ar-s" d="M0,0 L8,4 L0,8 z"/></marker>
        </defs>

        <!-- Subsystem Group 1: Antennas & RF Front Ends -->
        <rect class="grp" x="12" y="20" width="220" height="440" rx="8"/>
        <text class="tg" x="24" y="42">1. ANTENNAS &amp; RF FRONT ENDS</text>

        <rect class="bx" x="24" y="60" width="196" height="52" rx="6"/>
        <text class="t" x="36" y="82">VHF Crossed Dipole</text>
        <text class="ts" x="36" y="98">30–300 MHz · Dual-Linear Deployable</text>

        <rect class="bx" x="24" y="125" width="196" height="52" rx="6"/>
        <text class="t" x="36" y="147">UHF / L-Band Patch Array</text>
        <text class="ts" x="36" y="163">300–2000 MHz · 2×2 Dual-Polarized</text>

        <rect class="bx" x="24" y="190" width="196" height="52" rx="6"/>
        <text class="t" x="36" y="212">S / C-Band Patch Array</text>
        <text class="ts" x="36" y="228">2–6 GHz · 4×4 Dual-Polarized</text>

        <rect class="bx" x="24" y="255" width="196" height="52" rx="6"/>
        <text class="t" x="36" y="277">X / Ku-Band Horn Array</text>
        <text class="ts" x="36" y="293">6–18 GHz · Quad-Ridged Horns</text>

        <rect class="bx-s" x="24" y="325" width="196" height="60" rx="6"/>
        <text class="t" x="36" y="347">Analog Conditioning &amp; Mixers</text>
        <text class="ts" x="36" y="362">Pre-filters, LNA (NF 2.0–3.5 dB)</text>
        <text class="tm" x="36" y="376">Downconversion to 2.4 GHz IF</text>

        <rect class="bx" x="24" y="398" width="196" height="50" rx="6"/>
        <text class="t" x="36" y="420">Calibration Couplers</text>
        <text class="ts" x="36" y="435">Loopback delay / phase cal tone</text>

        <!-- Subsystem Group 2: Digital Payload (RFSoC) -->
        <rect class="grp" x="250" y="20" width="270" height="440" rx="8"/>
        <text class="tg" x="262" y="42">2. AMD XILINX RFSoC PAYLOAD</text>

        <rect class="bx-acc" x="264" y="60" width="242" height="65" rx="6"/>
        <text class="t" x="276" y="83">Quad 14-Bit RF-ADCs</text>
        <text class="ts" x="276" y="99">4× 5.0 GSPS Direct RF/IF Sampling</text>
        <text class="tm" x="276" y="114">ENOB 9.8 · SFDR 72 dBc</text>

        <rect class="bx-acc" x="264" y="140" width="242" height="75" rx="6"/>
        <text class="t" x="276" y="163">Channeliser Engine (FPGA Logic)</text>
        <text class="ts" x="276" y="179">4096-Bin Polyphase Filter Bank</text>
        <text class="tm" x="276" y="194">Instantaneous BW: 20 to 400 MHz</text>
        <text class="ts" x="276" y="208">Sub-band extraction &amp; decimation</text>

        <rect class="bx-acc" x="264" y="230" width="242" height="70" rx="6"/>
        <text class="t" x="276" y="253">CFAR Detector &amp; PDW Extractor</text>
        <text class="ts" x="276" y="269">Cell-Averaging CFAR · Pulse Time-Tag</text>
        <text class="tm" x="276" y="284">TOA, PW, Frequency, PRI, SNR</text>

        <rect class="bx" x="264" y="315" width="242" height="65" rx="6"/>
        <text class="t" x="276" y="338">Snapshot Buffer (DDR4)</text>
        <text class="ts" x="276" y="354">256 GB High-Speed Baseband I/Q</text>
        <text class="tm" x="276" y="368">16-bit Complex I/Q Snapshot Buffer</text>

        <rect class="bx-s" x="264" y="395" width="242" height="53" rx="6"/>
        <text class="t" x="276" y="416">ARM Cortex-A53 / cFS</text>
        <text class="ts" x="276" y="432">Payload Controller &amp; In-Orbit Scheduler</text>

        <!-- Subsystem Group 3: Timing, GNSS POD & Bus -->
        <rect class="grp" x="540" y="20" width="235" height="440" rx="8"/>
        <text class="tg" x="552" y="42">3. TIMING &amp; SPACECRAFT BUS</text>

        <rect class="bx-s" x="552" y="60" width="210" height="70" rx="6"/>
        <text class="t" x="564" y="83">Dual-Freq GNSS POD</text>
        <text class="ts" x="564" y="99">GPS L1/L2 + Galileo E1/E5a</text>
        <text class="tm" x="564" y="114">3D RMS Position &lt; 1.8 m · Vel &lt; 5 mm/s</text>

        <rect class="bx-s" x="552" y="145" width="210" height="65" rx="6"/>
        <text class="t" x="564" y="168">Chip-Scale Atomic Clock (CSAC)</text>
        <text class="ts" x="564" y="184">Allan Dev 1×10⁻¹¹ (1 s) · 1 PPS Sync</text>
        <text class="tm" x="564" y="199">Inter-Sat Clock Skew &le; 15 ns RMS</text>

        <rect class="bx" x="552" y="225" width="210" height="65" rx="6"/>
        <text class="t" x="564" y="248">Electrical Power Subsystem (EPS)</text>
        <text class="ts" x="564" y="264">320 W Deployable Wings + Body Array</text>
        <text class="tm" x="564" y="278">576 Wh Li-Ion Battery · 28V Regulated</text>

        <rect class="bx" x="552" y="305" width="210" height="65" rx="6"/>
        <text class="t" x="564" y="328">3-Axis ADCS Subsystem</text>
        <text class="ts" x="564" y="344">4 Reaction Wheels, 2 Star Trackers</text>
        <text class="tm" x="564" y="358">Pointing &lt; 0.05° · Nadir &amp; Sun Modes</text>

        <rect class="bx" x="552" y="385" width="210" height="63" rx="6"/>
        <text class="t" x="564" y="407">Green Monoprop Propulsion</text>
        <text class="ts" x="564" y="422">4× 1 N Thrusters · 9.0 kg LMP-103S</text>
        <text class="tm" x="564" y="436">Δv 178 m/s · Formation / Deorbit</text>

        <!-- Subsystem Group 4: Storage, Downlink & Ground -->
        <rect class="grp" x="795" y="20" width="253" height="440" rx="8"/>
        <text class="tg" x="807" y="42">4. DOWNLINK &amp; PROCESSING</text>

        <rect class="bx" x="807" y="60" width="228" height="60" rx="6"/>
        <text class="t" x="819" y="82">1.5 TB Mass Memory (SSMS)</text>
        <text class="ts" x="819" y="97">Flash storage for I/Q records &amp; PDWs</text>
        <text class="tm" x="819" y="111">Store &amp; Forward downlink queue</text>

        <rect class="bx-acc" x="807" y="135" width="228" height="75" rx="6"/>
        <text class="t" x="819" y="157">X-Band Downlink (8.2 GHz)</text>
        <text class="ts" x="819" y="173">5 W SSPA · Isoflux Wide-Beam Antenna</text>
        <text class="tm" x="819" y="188">DVB-S2 ACM · Up to 380 Mbit/s</text>
        <text class="ts" x="819" y="202">Contact volumes &gt; 15 GB / pass</text>

        <rect class="bx-s" x="807" y="225" width="228" height="65" rx="6"/>
        <text class="t" x="819" y="247">Ground Station Network</text>
        <text class="ts" x="819" y="263">Svalbard (SVB), Kiruna (KIR), Athens (ATH)</text>
        <text class="tm" x="819" y="278">Polar passes every 96 min · 7.3 m dishes</text>

        <rect class="bx-acc" x="807" y="305" width="228" height="143" rx="6"/>
        <text class="t" x="819" y="328">Mission Operations Center (MOC)</text>
        <text class="ts" x="819" y="344">Ground Processing Pipeline:</text>
        <text class="tm" x="819" y="361">• Fine Time/Doppler Cross-Correlation</text>
        <text class="tm" x="819" y="377">• CAF Peak Extraction A(τ,ν)</text>
        <text class="tm" x="819" y="393">• WGS-84 Levenberg-Marquardt Solver</text>
        <text class="tm" x="819" y="409">• Covariance &amp; 95% Error Ellipse</text>
        <text class="tm" x="819" y="425">• AIS Track Cross-Check / Spoof Alert</text>
        <text class="tm" x="819" y="440">• Product Dissemination (TDOA/FDOA)</text>

        <!-- Signal interconnects -->
        <!-- RF Front End to ADC -->
        <path class="ln" d="M 220 86 L 242 86 L 242 80 L 264 80" marker-end="url(#ar-norm)"/>
        <path class="ln" d="M 220 151 L 242 151 L 242 90 L 264 90" marker-end="url(#ar-norm)"/>
        <path class="ln" d="M 220 355 L 242 355 L 242 105 L 264 105" marker-end="url(#ar-norm)"/>
        <!-- ADC to Channelizer -->
        <path class="ln-acc" d="M 385 125 L 385 140" marker-end="url(#ar-acc)"/>
        <!-- Channelizer to CFAR & Snapshot -->
        <path class="ln-acc" d="M 385 215 L 385 230" marker-end="url(#ar-acc)"/>
        <path class="ln-acc" d="M 385 300 L 385 315" marker-end="url(#ar-acc)"/>
        <!-- Timing to ADC & FPGA -->
        <path class="ln-s" d="M 552 178 L 528 178 L 528 115 L 506 115" marker-end="url(#ar-sync)"/>
        <path class="ln-s" d="M 552 95 L 535 95 L 535 70 L 506 70" marker-end="url(#ar-sync)"/>
        <!-- Buffer to Mass Storage -->
        <path class="ln-acc" d="M 506 348 L 780 348 L 780 90 L 807 90" marker-end="url(#ar-acc)"/>
        <!-- Mass Storage to Downlink -->
        <path class="ln-acc" d="M 921 120 L 921 135" marker-end="url(#ar-acc)"/>
        <!-- Downlink to Ground Stations -->
        <path class="ln-acc" d="M 921 210 L 921 225" marker-end="url(#ar-acc)"/>
        <!-- Ground Station to MOC -->
        <path class="ln-acc" d="M 921 290 L 921 305" marker-end="url(#ar-acc)"/>
      </svg>
    </div>
  `;

  const renderContent = () => {
    const s = st(), o = s.sats[0].orbit, cfg = s.orbitCfg, mt = S.Bus.massTotals(), dv = S.Bus.deltaV();
    return `
      <!-- Hero Header -->
      <div class="sec doc-hero">
        <div>
          <div class="row" style="margin-bottom:8px">
            <span class="pill acc">TALOS-3 System Architecture</span>
            <span class="pill ok">Active Baseline Design</span>
            <span class="pill info">TRL 8/9 Flight Heritage</span>
          </div>
          <h1>TALOS-3 Mission Architecture &amp; System Design</h1>
          <p class="lede">A high-precision spaceborne radio frequency (RF) geolocation constellation consisting of three (expandable to four) formation-flying ESPA-class microsatellites in a 550 km Sun-Synchronous Orbit (SSO). The cluster performs synchronised dual-channel Time-Difference-of-Arrival (TDOA) and Frequency-Difference-of-Arrival (FDOA) cross-ambiguity processing to detect, classify, and locate maritime radars, illegal communications, distress beacons, GNSS jammers, and satcom uplinks with sub-kilometer accuracy.</p>
          <div class="row" style="margin-top:14px;gap:8px">
            <button class="btn primary" id="doc-btn-ops">Launch Common Operating Picture</button>
            <button class="btn" id="doc-btn-orbit">Inspect Cluster Formation</button>
            <button class="btn" id="doc-btn-rf">Open Payload RF Scope</button>
            <button class="btn" id="doc-btn-geo">View Geolocation Fixes</button>
          </div>
        </div>
        <div class="card">
          <h4>Key System Metrics (Current Baseline)</h4>
          <ul>
            <li><b>Constellation:</b> ${cfg.nSats} Spacecraft (${s.sats.map(sat => sat.name).join(', ')})</li>
            <li><b>Orbit:</b> ${(o.a - C.RE).toFixed(0)} km SSO, ${(o.i * C.RAD).toFixed(2)}° inc, LTAN ${cfg.ltanH}:00</li>
            <li><b>Formation Baseline:</b> 10 km to 185 km (${cfg.preset} preset)</li>
            <li><b>Frequency Coverage:</b> 30 MHz – 18 GHz across 4 RF chains</li>
            <li><b>Instantaneous Bandwidth:</b> 20 MHz to 400 MHz per channel</li>
            <li><b>Clock Synchronisation:</b> &le; 15 ns RMS (CSAC + Dual-Freq GNSS POD)</li>
            <li><b>Geolocation Accuracy:</b> 25 m to 500 m CEP (50% circular error probable)</li>
            <li><b>Spacecraft Wet Mass:</b> ${mt.wet.toFixed(1)} kg (${B.SPEC.propKg} kg LMP-103S propellant)</li>
            <li><b>Available &Delta;v:</b> ${dv.total.toFixed(1)} m/s (5-year mission + 350 km disposal)</li>
            <li><b>Payload Downlink:</b> X-Band 8.2 GHz DVB-S2 ACM (up to 380 Mbit/s)</li>
          </ul>
        </div>
      </div>

      <!-- End-to-End System Architecture Diagram -->
      <div class="sec">
        <h3>End-to-End System Block Diagram</h3>
        <p class="lede">From RF aperture intercept to digital channelisation, time-tagged snapshot recording, space-to-ground downlink, and MOC cross-ambiguity processing.</p>
        ${buildSvgDiagram()}
      </div>

      <!-- Section 1: Constellation & Formation Flying -->
      <div class="sec">
        <h3>1. Orbit Dynamics &amp; Relative Motion</h3>
        <p class="lede">Autonomous cluster maintenance in a 550 km Sun-Synchronous Orbit without secular separation.</p>
        <div class="two">
          <div>
            <p>Geolocating unknown surface emitters using passive TDOA and FDOA requires multiple spacecraft to observe the same RF signal simultaneously from non-collinear lines of sight. If satellites simply trail each other in the same orbital plane, the resulting TDOA hyperboloids degenerate into narrow cones aligned with the velocity vector, yielding large along-track uncertainty and geometric singularities at the horizon.</p>
            <p>TALOS-3 resolves this by creating an orthogonal two-dimensional baseline aperture through a combination of along-track separation (&Delta;M) and small cross-track inclination / RAAN offsets (&Delta;&Omega;):</p>
            <pre>Nodal regression rate (J2 secular):
d&Omega;/dt = - (3/2) * J2 * (R_E / p)^2 * n * cos(i)

Perigee precession rate (J2 secular):
d&omega;/dt =   (3/4) * J2 * (R_E / p)^2 * n * (5 * cos^2(i) - 1)

Condition for zero secular drift:
&Delta;a = 0,  &Delta;e = 0,  &Delta;i = 0  ==&gt;  d(&Delta;&Omega;)/dt = 0,  d(&Delta;M)/dt = 0</pre>
            <p>Because all spacecraft in the cluster share the identical semi-major axis, eccentricity, and inclination, their secular J2 nodal and anomalous precession rates are exactly equal. The satellites remain gravitationally bound in a tight formation over years without requiring continuous propulsion burns.</p>
          </div>
          <div>
            <div class="card">
              <h4>Formation Geometry Presets</h4>
              <ul>
                <li><b>Trail + Cross-Track (Default, "tri"):</b> TALOS-3B is offset -35 km along-track and +14 km cross-track; TALOS-3C is offset -70 km along-track and -14 km cross-track. Provides balanced, non-singular TDOA/FDOA intersecting cuts regardless of pass direction.</li>
                <li><b>Wide Baseline ("wide"):</b> Along-track baselines up to 185 km with &plusmn;30 km cross-track separation. Produces ultra-narrow error ellipses (&lt;50 m CEP) on high-SNR pulsed radar and VSAT targets.</li>
                <li><b>Tight Cluster ("tight"):</b> 5–15 km baselines. Minimises decorrelation and differential Doppler spread for high-frequency or short-burst signals.</li>
                <li><b>Pure Along-Track ("trail"):</b> Zero cross-track offset. Used during initial orbit insertion and checkout.</li>
              </ul>
            </div>
            <div class="card" style="margin-top:12px">
              <h4>Hill-Clohessy-Wiltshire (LVLH) Motion</h4>
              <p style="font-size:12px;color:var(--muted);margin:0 0 8px">In the Local-Vertical Local-Horizontal frame of lead spacecraft TALOS-3A, relative coordinates satisfy:</p>
              <pre>&delta;r(t) = 0   (circular orbit, &Delta;a = 0)
&delta;s(t) = a * &Delta;M = const   (along-track)
&delta;w(t) = a * sin(i) * &Delta;&Omega; * cos(u(t))   (cross-track harmonic)</pre>
              <p style="font-size:11.5px;color:var(--muted);margin:8px 0 0">The cross-track motion traces a pure harmonic oscillation &plusmn;&Delta;W twice per orbit, naturally expanding the 2D spatial aperture as the cluster traverses from pole to equator.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Mathematical Geolocation & DSP Theory -->
      <div class="sec">
        <h3>2. Geolocation Processing &amp; Signal Theory</h3>
        <p class="lede">Cross-Ambiguity Function (CAF) calculation, Cramér–Rao Lower Bounds, and Levenberg–Marquardt optimization on the WGS-84 ellipsoid.</p>
        <div class="two">
          <div>
            <p>Passive geolocation computes the intersection of Time-Difference-of-Arrival (TDOA) hyperboloids and Frequency-Difference-of-Arrival (FDOA) Doppler isodops on the WGS-84 Earth surface. For any two satellites <i>i</i> and <i>j</i>, the differential measurements satisfy:</p>
            <pre>TDOA:  &tau;_ij(x) = (||r_i - x|| - ||r_j - x||) / c
FDOA:  &nu;_ij(x) = - (f_0 / c) * [ (r_i - x)&sdot;v_i / ||r_i - x|| - (r_j - x)&sdot;v_j / ||r_j - x|| ]</pre>
            <p>To extract &tau; and &nu; from intercepted I/Q baseband signals, the ground processor computes the 2D Cross-Ambiguity Function:</p>
            <pre>A(&tau;, &nu;) = | &int;_0^T  s_i*(t) &sdot; s_j(t + &tau;) &sdot; e^{-j 2&pi; &nu; t}  dt |^2</pre>
            <p><b>Continuous Waveforms (FM, GMSK, BPSK):</b> Evaluated via block-segmented FFTs with frequency-domain phase rotation across <i>M</i> coherent blocks of length <i>N</i>.</p>
            <p><b>Pulsed Waveforms (Magnetron Radar):</b> Non-coherent pulse-gated CAF. Magnetron oscillators exhibit random initial RF phase on every pulse. The processor automatically gates pulse arrival windows and coherently integrates intra-pulse modulation while non-coherently summing envelope cross-correlations.</p>
          </div>
          <div>
            <div class="card">
              <h4>Cramér–Rao Bounds (Stein 1981)</h4>
              <p style="font-size:12px;color:var(--muted);margin:0 0 6px">The fundamental lower bound on measurement standard deviation is given by:</p>
              <pre>&gamma;_eff = (&gamma;_i * &gamma;_j) / (1 + &gamma;_i + &gamma;_j)
&sigma;_&tau;   = 1 / ( 2&pi; * B_rms * sqrt(B * T * &gamma;_eff) )
&sigma;_&nu;   = sqrt(12) / ( 2&pi; * T * sqrt(B * T * &gamma;_eff) )</pre>
              <p style="font-size:11.5px;color:var(--muted);margin:6px 0 0">Where <i>B_rms = &pi; B / &radic;3</i>, <i>T</i> is coherent integration time, and <i>&gamma;</i> is the receiver input signal-to-noise ratio.</p>
            </div>
            <div class="card" style="margin-top:12px">
              <h4>Systematic Error Budget Covariance</h4>
              <p style="font-size:12px;color:var(--muted);margin:0 0 6px">Thermal noise alone severely underestimates real-world satellite error. TALOS-3 employs a rigorous full-covariance formulation:</p>
              <pre>R = diag(&sigma;_w^2) + G &Sigma; G^T</pre>
              <p style="font-size:11.5px;color:var(--muted);margin:0">Where <i>G</i> represents analytic sensitivities &part;h/&part;&theta; to the systematic error parameters:</p>
              <ul style="font-size:11.5px;margin-top:4px">
                <li><b>Clock sync skew:</b> &plusmn;15 ns (&Delta;r &sim; 4.5 m)</li>
                <li><b>Ephemeris uncertainty:</b> 2.0 m 3D RMS, 5 mm/s velocity</li>
                <li><b>Local oscillator drift:</b> 1&times;10⁻¹¹ fractional instability</li>
                <li><b>Ionospheric TEC:</b> Dual-frequency dispersive delay modeling</li>
                <li><b>Target kinematics:</b> Target vessel speed uncertainty vector</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Payload RF & Receive Chains -->
      <div class="sec">
        <h3>3. Payload RF Front-End Architecture</h3>
        <p class="lede">Broadband frequency coverage from 30 MHz to 18 GHz across four optimized receive chains.</p>
        <div class="cols">
          <div class="card">
            <h4>VHF Chain (30–300 MHz)</h4>
            <ul>
              <li><b>Aperture:</b> Deployable crossed dipole (dual-linear)</li>
              <li><b>Nadir Gain:</b> 2.0 dBi (120° HPBW)</li>
              <li><b>Noise Figure:</b> 4.0 dB (Tsys 1500 K Earth-facing)</li>
              <li><b>Bandwidth:</b> 20 MHz instantaneous</li>
              <li><b>Digitization:</b> Direct RFSoC ADC sampling (1st Nyquist)</li>
              <li><b>Signals:</b> Marine VHF Ch 16, air traffic VHF voice, tactical nets</li>
            </ul>
          </div>
          <div class="card">
            <h4>UHF / L-Band Chain (300–2000 MHz)</h4>
            <ul>
              <li><b>Aperture:</b> 2×2 dual-pol microstrip patch array</li>
              <li><b>Nadir Gain:</b> 7.0 dBi (90° HPBW)</li>
              <li><b>Noise Figure:</b> 2.0 dB (Tsys 290 K)</li>
              <li><b>Bandwidth:</b> 100 MHz instantaneous</li>
              <li><b>Digitization:</b> Direct RFSoC ADC sampling (2nd Nyquist)</li>
              <li><b>Signals:</b> Cospas-Sarsat 406 MHz beacons, AIS 162 MHz, GNSS L1/L2 jamming, UHF PTT</li>
            </ul>
          </div>
          <div class="card">
            <h4>S / C-Band Chain (2–6 GHz)</h4>
            <ul>
              <li><b>Aperture:</b> 4×4 dual-pol cavity-backed patch array</li>
              <li><b>Nadir Gain:</b> 10.0 dBi (70° HPBW)</li>
              <li><b>Noise Figure:</b> 2.5 dB (Tsys 290 K)</li>
              <li><b>Bandwidth:</b> 200 MHz instantaneous</li>
              <li><b>Downconverter:</b> Analog heterodyne to 1.8 GHz IF</li>
              <li><b>Signals:</b> S-band maritime radars (3.05 GHz), airborne radars, C-band satcom up</li>
            </ul>
          </div>
          <div class="card">
            <h4>X / Ku-Band Chain (6–18 GHz)</h4>
            <ul>
              <li><b>Aperture:</b> Quad-ridged broadband horn array</li>
              <li><b>Nadir Gain:</b> 13.0 dBi (60° HPBW)</li>
              <li><b>Noise Figure:</b> 3.5 dB (Tsys 290 K)</li>
              <li><b>Bandwidth:</b> 400 MHz instantaneous</li>
              <li><b>Downconverter:</b> Dual-stage mixer to 2.4 GHz IF</li>
              <li><b>Signals:</b> X-band navigation radars (9.41 GHz), Ku-band maritime VSAT terminals (14.25 GHz)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Section 4: Spacecraft Platform & Budgets -->
      <div class="sec">
        <h3>4. Spacecraft Platform &amp; Resource Budgets</h3>
        <p class="lede">ESPA-class microsatellite platform optimized for high peak power processing and high data rate downlink.</p>
        <div class="cols">
          <div class="card">
            <h4>Mass Budget (${mt.wet.toFixed(1)} kg Wet)</h4>
            <ul>
              <li><b>Structure &amp; Mechanisms:</b> 23.8 kg (Al honeycomb)</li>
              <li><b>Electrical Power (EPS):</b> 17.2 kg (wings + battery)</li>
              <li><b>ADCS (Reaction Wheels, Star Trackers):</b> 11.4 kg</li>
              <li><b>Propulsion Subsystem:</b> 15.8 kg (6.8 kg dry + 9.0 kg prop)</li>
              <li><b>SIGINT Receiver &amp; Antennas:</b> 19.2 kg (RFSoC + horns)</li>
              <li><b>CDH, TT&amp;C, Harness, Thermal:</b> 18.0 kg</li>
              <li><b>Design Margin:</b> ${mt.margin.toFixed(1)} kg (${B.SPEC.marginPct}% of dry mass)</li>
            </ul>
          </div>
          <div class="card">
            <h4>Power &amp; Energy Balance</h4>
            <ul>
              <li><b>Solar Array:</b> 320 W peak deployable + 70 W body</li>
              <li><b>Battery Storage:</b> 576 Wh Li-ion (8S4P 21700 cells)</li>
              <li><b>Standby / Orbit-Average Load:</b> 48 W (ADCS, OBC, TT&C)</li>
              <li><b>Wideband Survey Mode:</b> 94 W continuous</li>
              <li><b>Synchronised Collection Mode:</b> 144 W peak</li>
              <li><b>X-Band Downlink Mode:</b> 90 W (5 W RF SSPA)</li>
              <li><b>Worst-Case Eclipse DOD:</b> &le; 24.5% (5-year cycle life &gt; 28,000 cycles)</li>
            </ul>
          </div>
          <div class="card">
            <h4>High-Rate Downlink (X-Band)</h4>
            <ul>
              <li><b>Carrier Frequency:</b> 8.2 GHz (Space Research / Earth Exploration)</li>
              <li><b>RF Output Power:</b> 5.0 W (+37 dBm GaN SSPA)</li>
              <li><b>Antenna:</b> Shaped-dielectric isoflux horn (G &gt; +3 dBi)</li>
              <li><b>Modulation:</b> DVB-S2 ACM, 100 Msym/s (QPSK to 16APSK)</li>
              <li><b>Ground Stations:</b> Svalbard (7.3 m), Kiruna (7.3 m), Athens (5.4 m)</li>
              <li><b>Throughput:</b> 150 to 380 Mbit/s (12 to 24 GB per pass)</li>
            </ul>
          </div>
          <div class="card">
            <h4>Propulsion &amp; Deorbit Lifecycle</h4>
            <ul>
              <li><b>Thrusters:</b> 4&times; 1 N LMP-103S green monopropellant</li>
              <li><b>Propellant Load:</b> 9.0 kg (high chemical density)</li>
              <li><b>Total Specific Impulse:</b> 220 s (effective &Delta;v = ${dv.total.toFixed(0)} m/s)</li>
              <li><b>Formation In-Track Drift Trim:</b> 12 m/s</li>
              <li><b>5-Year Differential Drag Trimming:</b> 15 m/s</li>
              <li><b>Collision Avoidance Maneuvers:</b> 10 m/s</li>
              <li><b>Disposal Hohmann Burn:</b> ${(178 - 37).toFixed(0)} m/s (lowers perigee to 350 km, re-entry &lt; 5 yr)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Section 5: Operational Use Cases & Scenario Library -->
      <div class="sec">
        <h3>5. Mission Operations &amp; Target Profiles</h3>
        <p class="lede">Simulated target profiles highlighting maritime domain awareness, electronic warfare, and distress response.</p>
        <div class="cols">
          <div class="card clickable" id="card-e01" style="cursor:pointer">
            <div class="row"><span class="dot" style="background:var(--c-radar)"></span><h4>Contact HOTEL-07 (Dark Vessel)</h4></div>
            <p style="font-size:12px;color:var(--muted)">Large merchant vessel cruising at 12 knots off Crete with AIS transmitter deactivated. Operating a pulsed 9.41 GHz X-band magnetron radar.</p>
            <div class="row" style="margin-top:8px"><span class="pill acc">TDOA/FDOA Fix</span><span class="pill ok">CEP &lt; 90 m</span></div>
          </div>
          <div class="card clickable" id="card-e03" style="cursor:pointer">
            <div class="row"><span class="dot" style="background:var(--c-comms)"></span><h4>"BLUE MARLIN" (AIS Spoofing)</h4></div>
            <p style="font-size:12px;color:var(--muted)">Vessel broadcasting legitimate AIS SOTDMA packets claiming coordinates off Alexandria, while RF emissions place it 64 km away. Automated spoof alert triggered.</p>
            <div class="row" style="margin-top:8px"><span class="pill crit">AIS Mismatch Alert</span><span class="pill ok">Fix Confirmed</span></div>
          </div>
          <div class="card clickable" id="card-e04" style="cursor:pointer">
            <div class="row"><span class="dot" style="background:var(--c-jammer)"></span><h4>GNSS L1 Chirp Jammer</h4></div>
            <p style="font-size:12px;color:var(--muted)">Swept continuous-wave 20 MHz chirp jamming GPS L1 / Galileo E1 in the Eastern Mediterranean basin, causing civil aviation navigation outages.</p>
            <div class="row" style="margin-top:8px"><span class="pill warn">Interference</span><span class="pill ok">CEP &lt; 25 m</span></div>
          </div>
          <div class="card clickable" id="card-e08" style="cursor:pointer">
            <div class="row"><span class="dot" style="background:var(--c-sar)"></span><h4>406 MHz Emergency Beacon</h4></div>
            <p style="font-size:12px;color:var(--muted)">Distress beacon activation in the Gulf of Guinea. Single-satellite Frequency-of-Arrival (FOA) Doppler curve solves position and carrier offset simultaneously.</p>
            <div class="row" style="margin-top:8px"><span class="pill info">SAR Cospas-Sarsat</span><span class="pill ok">Single-Pass Fix</span></div>
          </div>
        </div>
      </div>
    `;
  };

  const bindEvents = () => {
    document.getElementById('doc-btn-ops').addEventListener('click', () => S.showTab('ops'));
    document.getElementById('doc-btn-orbit').addEventListener('click', () => S.showTab('orbit'));
    document.getElementById('doc-btn-rf').addEventListener('click', () => S.showTab('rf'));
    document.getElementById('doc-btn-geo').addEventListener('click', () => S.showTab('geo'));

    document.getElementById('card-e01').addEventListener('click', () => {
      S.select('emitter', 'E01');
      S.showTab('rf');
    });
    document.getElementById('card-e03').addEventListener('click', () => {
      S.select('emitter', 'E03');
      const coll = st().plan.collections.find(c => c.em.id === 'E03');
      if (coll) S.select('coll', coll);
      S.showTab('geo');
    });
    document.getElementById('card-e04').addEventListener('click', () => {
      S.select('emitter', 'E04');
      const coll = st().plan.collections.find(c => c.em.id === 'E04');
      if (coll) S.select('coll', coll);
      S.showTab('geo');
    });
    document.getElementById('card-e08').addEventListener('click', () => {
      S.select('emitter', 'E08');
      const coll = st().plan.collections.find(c => c.em.id === 'E08');
      if (coll) S.select('coll', coll);
      S.showTab('geo');
    });
  };

  const refresh = () => {
    // Only re-render when tab is active and parameters updated
    if (st().tab !== 'design') return;
  };

  const onShow = () => {
    docEl = document.getElementById('doc');
    if (!docEl) return;
    docEl.innerHTML = renderContent();
    bindEvents();
  };

  const init = () => {
    docEl = document.getElementById('doc');
    S.on('rebuild', () => {
      if (st().tab === 'design') onShow();
    });
  };

  S.views.design = { init, refresh, onShow };
})(window.SIM);
