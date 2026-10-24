/* TALOS-3 simulator — RF environment and payload receiver model.
   Emitter library, scenario, ground stations, link budgets, Doppler, Cramér–Rao bounds (Stein 1981). */
'use strict';
(function (S) {
  const { C, V } = S;
  S.SCEN_EPOCH = Date.UTC(2026, 9, 21, 6, 0, 0);   // scenario / element epoch

  /* ---------- payload receive chains (per spacecraft) ---------- */
  S.BANDS = [
    { id: 'VHF', name: 'VHF', fmin: 30, fmax: 300, gain: 2.0, hpbw: 120, nf: 4.0, tant: 1500, ibw: 20, adc: 'RFSoC ADC, 14-bit, direct sampling', ant: 'Deployable crossed dipole (dual linear)' },
    { id: 'UHF-L', name: 'UHF / L', fmin: 300, fmax: 2000, gain: 7.0, hpbw: 90, nf: 2.0, tant: 290, ibw: 100, adc: 'RFSoC ADC, 14-bit, direct sampling', ant: '2×2 dual-pol patch array' },
    { id: 'S-C', name: 'S / C', fmin: 2000, fmax: 6000, gain: 10.0, hpbw: 70, nf: 2.5, tant: 290, ibw: 200, adc: 'RFSoC ADC + analog down-converter', ant: '4×4 dual-pol patch array' },
    { id: 'X-Ku', name: 'X / Ku', fmin: 6000, fmax: 18000, gain: 13.0, hpbw: 60, nf: 3.5, tant: 290, ibw: 400, adc: 'Down-converter to 2.4 GHz IF + RFSoC', ant: 'Quad-ridged horn array, dual-pol' }
  ];
  S.bandFor = fMHz => S.BANDS.find(b => fMHz >= b.fmin && fMHz < b.fmax) || S.BANDS[S.BANDS.length - 1];
  S.tsys = b => b.tant + 290 * (S.lin(b.nf) - 1);
  // cos^q rolloff, q from HPBW; floor at -12 dB below isotropic
  S.rxGain = (b, offNadir) => {
    const q = Math.log(0.5) / Math.log(Math.cos(b.hpbw / 2 * C.DEG));
    const c = Math.cos(offNadir);
    return Math.max(b.gain + (c > 0 ? 10 * q * Math.log10(c) : -99), -12);
  };

  /* ---------- emitter library ---------- */
  S.EMITTER_TYPES = {
    navradarX: { cls: 'radar', label: 'X-band navigation radar', f: 9410, bw: 2.0e6, pDbw: 44.0, g: 30, pattern: 'radar', vbw: 22, hbw: 1.2, sll: -24, prf: 1500, pw: 0.5e-6, rpm: 24, mod: 'Pulsed magnetron, P0N', tInt: 0.05, sig: 'pulse', yEmit: 1e-5 },
    navradarS: { cls: 'radar', label: 'S-band navigation radar', f: 3050, bw: 1.0e6, pDbw: 44.8, g: 27, pattern: 'radar', vbw: 25, hbw: 2.0, sll: -23, prf: 800, pw: 1.0e-6, rpm: 22, mod: 'Pulsed magnetron, P0N', tInt: 0.05, sig: 'pulse', yEmit: 1e-5 },
    vhfVoice: { cls: 'comms', label: 'Marine VHF voice (Ch 16)', f: 156.8, bw: 16e3, pDbw: 14.0, g: 2, pattern: 'whip', mod: 'FM 16K0F3E', tInt: 0.25, sig: 'fm', duty: 0.35, yEmit: 5e-6 },
    ais: { cls: 'comms', label: 'AIS Class A transponder', f: 162.025, bw: 14e3, pDbw: 11.0, g: 2, pattern: 'whip', mod: 'GMSK 9.6 kbit/s, SOTDMA', tInt: 0.0267, sig: 'gmsk', burst: { period: 6, len: 0.0267 }, yEmit: 3e-6 },
    epirb: { cls: 'sar', label: '406 MHz distress beacon', f: 406.04, bw: 2.4e3, pDbw: 7.0, g: 0, pattern: 'whip', mod: 'Biphase-L BPSK 400 bit/s', tInt: 0.44, sig: 'bpsk', burst: { period: 50, len: 0.44 }, yEmit: 2e-9 },
    gnssJam: { cls: 'jammer', label: 'GNSS L1 interference source', f: 1575.42, bw: 20e6, pDbw: 10.0, g: 0, pattern: 'omni', mod: 'Swept CW chirp, 20 MHz / 12 µs', tInt: 0.02, sig: 'chirp', yEmit: 1e-6 },
    pttUhf: { cls: 'comms', label: 'UHF push-to-talk radio', f: 457.525, bw: 12.5e3, pDbw: 7.0, g: 2, pattern: 'whip', mod: 'FM 11K0F3E', tInt: 0.25, sig: 'fm', duty: 0.25, yEmit: 2.5e-6 },
    vsatKu: { cls: 'satcom', label: 'Ku-band VSAT uplink', f: 14250, bw: 5e6, pDbw: 6.0, g: 40, pattern: 'vsat', geoLon: 30, mod: 'DVB-S2 QPSK, 4 Msym/s', tInt: 0.02, sig: 'noise', yEmit: 1e-8 }
  };
  S.CLASS_INFO = {
    radar: { label: 'Radar', color: '--c-radar' },
    comms: { label: 'Comms', color: '--c-comms' },
    jammer: { label: 'Interference', color: '--c-jammer' },
    sar: { label: 'Distress', color: '--c-sar' },
    satcom: { label: 'Satcom', color: '--c-satcom' }
  };

  /* ---------- scenario (fictional) ---------- */
  S.SCENARIO = () => [
    { id: 'E01', type: 'navradarX', name: 'Contact HOTEL-07', lat: 34.20, lon: 25.10, spd: 12, hdg: 280, patrol: 80, prio: 1, note: 'Vessel transmitting X-band radar with AIS switched off.' },
    { id: 'E02', type: 'navradarS', name: 'Trawler group SIERRA', lat: 33.55, lon: 27.40, spd: 4, hdg: 45, patrol: 30, prio: 2, note: 'Fishing vessels inside a seasonal closure box.' },
    { id: 'E03', type: 'ais', name: 'AIS track "BLUE MARLIN"', lat: 32.85, lon: 29.60, spd: 10, hdg: 110, patrol: 60, prio: 1, claimed: { lat: 33.32, lon: 30.28 }, note: 'Reported AIS position disagrees with the RF fix.' },
    { id: 'E04', type: 'gnssJam', name: 'GNSS interference L1-A', lat: 33.95, lon: 31.30, prio: 1, note: 'Aviation reports of GPS L1 loss of lock.' },
    { id: 'E05', type: 'vhfVoice', name: 'VHF Ch 16 caller', lat: 35.30, lon: 23.30, spd: 8, hdg: 200, patrol: 40, prio: 3, note: 'Repeated unidentified calls on the distress channel.' },
    { id: 'E06', type: 'pttUhf', name: 'UHF PTT net', lat: 36.40, lon: 21.40, prio: 3, note: 'Unlicensed UHF voice net offshore.' },
    { id: 'E07', type: 'vsatKu', name: 'Ku VSAT terminal', lat: 32.40, lon: 26.20, prio: 3, note: 'Maritime VSAT uplink, sidelobe intercept.' },
    { id: 'E08', type: 'epirb', name: '406 beacon GoG-1', lat: 3.45, lon: 4.15, prio: 1, note: 'Distress beacon, Gulf of Guinea.' },
    { id: 'E09', type: 'navradarX', name: 'Contact ROMEO-12', lat: 3.10, lon: 2.80, spd: 9, hdg: 150, patrol: 60, prio: 2, note: 'Unidentified vessel near the beacon.' },
    { id: 'E10', type: 'epirb', name: '406 beacon SIO-4', lat: -38.60, lon: 77.40, prio: 2, note: 'Distress beacon, southern Indian Ocean.' }
  ].map(e => Object.assign({}, S.EMITTER_TYPES[e.type], e, { lat: e.lat * C.DEG, lon: e.lon * C.DEG, alt: 0.02, mobile: !!e.spd,
    claimed: e.claimed ? { lat: e.claimed.lat * C.DEG, lon: e.claimed.lon * C.DEG } : null }));

  S.GROUND_STATIONS = [
    { id: 'ATH', name: 'Athens MOC', lat: 37.98, lon: 23.73, dish: 5.4, gt: 28.5, role: 'TT&C + X-band' },
    { id: 'SVB', name: 'Svalbard', lat: 78.23, lon: 15.41, dish: 7.3, gt: 31.0, role: 'X-band downlink' },
    { id: 'KIR', name: 'Kiruna', lat: 67.86, lon: 20.96, dish: 7.3, gt: 31.0, role: 'X-band downlink' },
    { id: 'HBK', name: 'Hartebeesthoek', lat: -25.89, lon: 27.69, dish: 7.3, gt: 30.5, role: 'X-band downlink' },
    { id: 'PUA', name: 'Punta Arenas', lat: -52.94, lon: -70.85, dish: 7.3, gt: 30.5, role: 'X-band downlink' }
  ].map(g => Object.assign(g, { lat: g.lat * C.DEG, lon: g.lon * C.DEG, ecef: S.geo2ecef(g.lat * C.DEG, g.lon * C.DEG, 0.05) }));

  /* ---------- emitter kinematics: back-and-forth patrol along a heading ---------- */
  S.emitterState = (em, ms) => {
    if (!em.spd) {
      em._r = em._r || S.geo2ecef(em.lat, em.lon, em.alt);
      return { lat: em.lat, lon: em.lon, r: em._r, v: [0, 0, 0] };
    }
    const vk = em.spd * 0.000514444, L = em.patrol, dt = (ms - S.SCEN_EPOCH) / 1000;
    let s = ((vk * dt) % (2 * L) + 2 * L) % (2 * L);
    const fwd = s < L, along = (fwd ? s : 2 * L - s) - L / 2, hdg = em.hdg * C.DEG;
    const [la, lo] = along >= 0 ? S.dest(em.lat, em.lon, hdg, along) : S.dest(em.lat, em.lon, hdg + Math.PI, -along);
    const sgn = fwd ? 1 : -1, ve = [Math.sin(hdg) * vk * sgn, Math.cos(hdg) * vk * sgn, 0];
    return { lat: la, lon: lo, r: S.geo2ecef(la, lo, em.alt), v: S.enu2ecef(la, lo, ve), hdg: fwd ? em.hdg : (em.hdg + 180) % 360 };
  };

  // Transmit activity (0..1) for the spectrum display
  S.emitterActivity = (em, ms) => {
    const t = ms / 1000;
    if (em.burst) { const ph = ((t + S.hash(em.id.charCodeAt(2)) * em.burst.period) % em.burst.period); return ph < Math.max(em.burst.len, 0.25) ? 1 : 0; }
    if (em.duty) { const slot = Math.floor(t / 8); return S.hash(slot, em.id.charCodeAt(2)) < em.duty ? 1 : 0; }
    return 1;
  };

  /* ---------- emitter antenna toward the satellite ---------- */
  S.emitterEirp = (em, el, satEcef, emEcef, ms, withScan) => {
    let g = em.g;
    if (em.pattern === 'radar') {
      g += Math.max(-12 * (el * C.RAD / em.vbw) ** 2, -20);        // elevation fan beam
      if (withScan) {                                                // rotating main beam flash
        const look = S.look(emEcef, em.lat, em.lon, satEcef), beam = ((ms / 1000) * em.rpm * 6 + S.hash(em.id.charCodeAt(2)) * 360) % 360;
        const d = Math.abs(S.wrapPi((beam - look.az * C.RAD) * C.DEG)) * C.RAD;
        g += d < em.hbw / 2 ? 0 : em.sll;
      } else g += em.sll;                                            // collection planning uses sidelobe level
    } else if (em.pattern === 'whip') {
      g += 20 * Math.log10(Math.max(Math.cos(el), 0.15));
    } else if (em.pattern === 'vsat') {
      const geo = S.geo2ecef(0, em.geoLon * C.DEG, 35786);
      const th = Math.acos(S.clamp(V.dot(V.unit(V.sub(geo, emEcef)), V.unit(V.sub(satEcef, emEcef))), -1, 1)) * C.RAD;
      g = th < 1 ? em.g : Math.max(29 - 25 * Math.log10(th), -10);    // ITU-R S.580 sidelobe envelope
    }
    return em.pDbw + g;
  };

  /* ---------- one-way link budget: emitter -> payload ---------- */
  S.link = (em, es, sat, ss, ms, withScan = false) => {
    const d = V.sub(ss.r, es.r), rng = V.norm(d), e = S.enu(es.lat, es.lon, d), el = Math.asin(e[2] / rng);
    const out = { visible: el > 0, el, range: rng };
    if (el <= 0) return out;
    const band = S.bandFor(em.f);
    const offNadir = Math.acos(S.clamp(V.dot(V.unit(ss.r), V.unit(d)), -1, 1));
    const eirp = S.emitterEirp(em, el, ss.r, es.r, ms, withScan);
    const fspl = 20 * Math.log10(4 * Math.PI * rng * 1e3 * em.f * 1e6 / C.CMS);
    const zen = 1 / Math.max(Math.sin(el), 0.12);
    const latm = (em.f < 1000 ? 0.05 : em.f < 6000 ? 0.1 : em.f < 12000 ? 0.2 : 0.35) * zen;
    const lpol = 3.0;                                                  // unknown emitter polarisation, single-pol combine
    const grx = S.rxGain(band, offNadir);
    const pr = eirp - fspl - latm - lpol + grx - 1.0;                  // 1 dB receiver front-end / cable loss
    const tsys = S.tsys(band), n0 = C.K_DBW + S.db(tsys);
    const cn0 = pr - n0, snr = cn0 - S.db(em.bw);
    const rr = V.dot(d, V.sub(ss.v, es.v)) / rng;                     // km/s
    return Object.assign(out, { band, offNadir, eirp, fspl, latm, lpol, grx, pr, tsys, n0, cn0, snr, rr, doppler: -em.f * 1e6 * rr / C.CKM, az: Math.atan2(e[0], e[1]) });
  };

  /* ---------- Cramér–Rao bounds for a TDOA/FDOA pair (Stein, 1981) ---------- */
  S.onFraction = em => em.sig === 'pulse' ? em.pw * em.prf : 1;
  S.pairCrlb = (snr1, snr2, bw, tInt, onFrac) => {
    const g1 = S.lin(snr1), g2 = S.lin(snr2), g = g1 * g2 / (1 + g1 + g2);
    const bt = bw * tInt * onFrac, post = bt * g;
    const brms = C.TWO_PI * bw / Math.sqrt(12), trms = C.TWO_PI * tInt / Math.sqrt(12);
    return { gEffDb: S.db(g), btDb: S.db(bt), postDb: S.db(post), sT: 1 / (brms * Math.sqrt(post)), sF: 1 / (trms * Math.sqrt(post)) };
  };
  S.singleCrlbF = (snr, bw, tInt, onFrac) => {
    const post = bw * tInt * onFrac * S.lin(snr);
    return { postDb: S.db(post), sF: Math.sqrt(12) / (C.TWO_PI * tInt * Math.sqrt(post)) };
  };

  // Ionospheric group delay (s) at frequency f (MHz), TEC in TECU, thin shell at 350 km
  S.ionoDelay = (fMHz, tecu, el) => {
    const z = Math.asin(C.RE / (C.RE + 350) * Math.cos(el));
    return 40.3 * tecu * 1e16 / ((fMHz * 1e6) ** 2) / Math.cos(z) / C.CMS;
  };

  /* ---------- spectrum tuning presets ---------- */
  S.TUNING = [
    { id: 'vhfm', name: 'Marine VHF 156–163 MHz', fc: 159.5, span: 7 },
    { id: 'ais', name: 'AIS 161.95–162.05 MHz', fc: 162.0, span: 0.1 },
    { id: 'uhf', name: 'UHF PTT 440–470 MHz', fc: 455, span: 30 },
    { id: 'sar', name: 'Distress 406.0–406.1 MHz', fc: 406.05, span: 0.1 },
    { id: 'gnss', name: 'GNSS L1 1560–1590 MHz', fc: 1575.42, span: 40 },
    { id: 'srad', name: 'S-band radar 2.9–3.1 GHz', fc: 3000, span: 200 },
    { id: 'xrad', name: 'X-band radar 9.3–9.5 GHz', fc: 9400, span: 200 },
    { id: 'ku', name: 'Ku uplink 14.0–14.5 GHz', fc: 14250, span: 400 },
    { id: 'zoom', name: 'Zoom on selected emitter', fc: 0, span: 0 }
  ];
})(window.SIM);
