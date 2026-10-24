/* TALOS-3 simulator — spacecraft bus: budgets and a time-stepped power / data / thermal simulation. */
'use strict';
(function (S) {
  const { C, V } = S;
  const B = S.Bus = {};

  B.MODES = ['SAFE', 'STANDBY', 'SURVEY', 'COLLECT', 'DOWNLINK'];
  B.MODE_COLORS = ['--crit', '--dim', '--s1', '--accent', '--ok'];

  B.SPEC = {
    mass: [
      ['Structure & mechanisms', 'Al honeycomb panels, ESPA-class ring interface, deployment hinges', 23.8],
      ['Thermal control', 'MLI, OSR radiator 0.32 m², 6 heater zones', 3.4],
      ['Electrical power', '2 deployable GaAs wings + body panel, 576 Wh Li-ion, PCDU', 17.2],
      ['Attitude control', '4 reaction wheels, 2 star trackers, 3 magnetorquers, IMU, 6 sun sensors', 11.4],
      ['Command & data handling', 'Rad-tolerant OBC (cFS), 1.5 TB mass memory', 3.2],
      ['TT&C', 'S-band transceiver, 2 hemispherical patches', 2.4],
      ['Payload downlink', 'X-band 8.2 GHz, DVB-S2 ACM up to 400 Mbit/s, isoflux antenna', 3.6],
      ['Propulsion (dry)', 'Green monopropellant (LMP-103S), 4 × 1 N thrusters', 6.8],
      ['Propellant', 'LMP-103S, formation keeping + collision avoidance + deorbit assist', 9.0],
      ['SIGINT receiver', 'RFSoC digital receiver, 4 RF front ends, FPGA channeliser', 9.8],
      ['Payload antennas', 'VHF dipoles, UHF/L & S/C patch arrays, X/Ku horn array', 9.4],
      ['Timing & POD', 'Dual-frequency GNSS POD receiver + chip-scale atomic clock', 1.3],
      ['Payload processor', 'Detection / PDW extraction / snapshot buffering, 256 GB', 2.1],
      ['Harness', 'Power + data harness, RF coax', 5.8]
    ],
    marginPct: 8, propKg: 9.0,
    power: [  // W per mode, orbit-average when active
      ['Bus baseline (OBC, ADCS, TT&C Rx, EPS losses)', 48, 'always'],
      ['Survival heaters (eclipse)', 16, 'eclipse'],
      ['Payload — wideband survey', 46, 'survey'],
      ['Payload — synchronised collection', 96, 'collect'],
      ['X-band transmitter', 42, 'downlink']
    ],
    arrayPeak: 320, bodyPanel: 70, battWh: 576, cant: 35,
    surveyMbps: 35, downlinkMbps: 300, storeBits: 1.5e12 * 8,
    radArea: 0.32, emis: 0.85, heatCap: 9000
  };
  B.massTotals = () => {
    const sum = B.SPEC.mass.reduce((s, m) => s + m[2], 0), dry = sum - B.SPEC.propKg;
    return { sum, dry, margin: dry * B.SPEC.marginPct / 100, wet: sum + dry * B.SPEC.marginPct / 100 };
  };
  B.deltaV = () => {
    const { wet } = B.massTotals(), mp = B.SPEC.propKg, isp = 220;
    return { total: isp * 9.80665 * Math.log(wet / (wet - mp)), isp };
  };

  // X-band downlink budget (spacecraft -> ground station) at a given elevation
  B.downlink = (elDeg, gs) => {
    const h = 550, el = elDeg * C.DEG, r = C.RE + h;
    const range = Math.sqrt(r * r - (C.RE * Math.cos(el)) ** 2) - C.RE * Math.sin(el);
    const f = 8.2e9, ptx = S.db(5), gtx = elDeg < 20 ? 6 : 3, eirp = ptx + gtx - 1;
    const fspl = 20 * Math.log10(4 * Math.PI * range * 1e3 * f / C.CMS);
    const latm = 0.25 / Math.max(Math.sin(el), 0.1), lpt = 0.8;
    const cn0 = eirp - fspl - latm - lpt + gs.gt - C.K_DBW;
    const modcods = [['QPSK 1/2', 1.0, 1.0], ['QPSK 3/4', 4.0, 1.5], ['8PSK 2/3', 6.6, 2.0], ['8PSK 5/6', 9.4, 2.5], ['16APSK 3/4', 10.2, 3.0], ['16APSK 8/9', 13.1, 3.56]];
    const Rs = 100e6, esn0 = cn0 - S.db(Rs);
    let mc = null; for (const m of modcods) if (esn0 - 2.0 >= m[1]) mc = m;
    return { range, eirp, fspl, latm, gt: gs.gt, cn0, esn0, modcod: mc ? mc[0] : 'below threshold', rate: mc ? Rs * mc[2] * 0.95 : 0, margin: mc ? esn0 - mc[1] : esn0 - 1 };
  };

  B.simulate = (sats, plan, emitters, t0, t1, step = 30e3) => {
    const sp = B.SPEC, n = Math.floor((t1 - t0) / step) + 1;
    return sats.map(sat => {
      const o = sat.orbit, out = {
        t0, step, n, soc: new Float32Array(n), pGen: new Float32Array(n), pLoad: new Float32Array(n),
        store: new Float32Array(n), temp: new Float32Array(n), mode: new Uint8Array(n), ecl: new Uint8Array(n), dl: new Uint8Array(n)
      };
      let soc = 0.82, bits = 0.18 * sp.storeBits, T = 293;
      for (let k = 0; k < n; k++) {
        const t = t0 + k * step, st = o.stateEci(t), sun = S.sunEci(t), s = V.unit(sun);
        const ecl = S.inEclipse(st.r, sun);
        const rh = V.unit(st.r), hh = V.unit(V.cross(st.r, st.v)), hs = V.dot(hh, s) >= 0 ? hh : V.mul(hh, -1);
        const nrm = V.add(V.mul(hs, Math.cos(sp.cant * C.DEG)), V.mul(rh, Math.sin(sp.cant * C.DEG)));
        const gen = ecl ? 0 : sp.arrayPeak * Math.max(0, V.dot(nrm, s)) + sp.bodyPanel * Math.max(0, V.dot(rh, s));
        const coll = plan.collections.filter(c => t >= c.c0 - 30e3 && t <= c.c1 + 30e3);
        const contact = plan.contacts.find(c => t >= c.t0 && t < c.t1);
        const safe = soc < 0.25;
        let mode = safe ? 0 : coll.length ? 3 : soc > 0.45 ? 2 : 1;
        const downlink = !safe && contact && bits > 0;
        if (downlink && mode !== 3) mode = 4;
        let load = sp.power[0][1] + (ecl ? sp.power[1][1] : 0);
        if (mode === 2 || (mode === 4 && soc > 0.45)) load += sp.power[2][1];
        if (mode === 3) load += sp.power[3][1];
        if (downlink) load += sp.power[4][1];
        // energy
        const net = gen - load, dtH = step / 3.6e6;
        soc = S.clamp(soc + (net > 0 ? net * 0.95 : net / 0.95) * dtH / sp.battWh, 0, 1);
        // data
        let inRate = (mode === 2 || (mode === 4 && soc > 0.45)) ? sp.surveyMbps * 1e6 : 2e6;
        for (const c of coll) {
          const em = c.em, iq = em.bw * 2.5 * 32 * (em.tInt / 10);       // 16-bit I/Q snapshots, one per 10 s
          inRate += iq + 4e6;
        }
        let outRate = 0;
        if (downlink) {
          const g = contact.gs, el = S.look(g.ecef, g.lat, g.lon, S.eci2ecef(st.r, t)).el * C.RAD;
          outRate = B.downlink(Math.max(el, 5), g).rate;
        }
        bits = S.clamp(bits + (inRate - outRate) * step / 1000, 0, sp.storeBits);
        // payload electronics thermal node
        const pDiss = mode === 3 ? sp.power[3][1] : (mode === 2 || mode === 4) ? sp.power[2][1] : 6;
        let qin = 0.75 * pDiss + (ecl ? 0 : 30) + 18, heat = T < 278 ? 18 : 0;
        const qout = sp.emis * 5.670374e-8 * sp.radArea * (T ** 4 - 3 ** 4);
        T += (qin + heat - qout) * (step / 1000) / sp.heatCap;
        out.soc[k] = soc; out.pGen[k] = gen; out.pLoad[k] = load; out.store[k] = bits / sp.storeBits;
        out.temp[k] = T - 273.15; out.mode[k] = mode; out.ecl[k] = ecl ? 1 : 0; out.dl[k] = downlink ? 1 : 0;
      }
      return out;
    });
  };
  B.sample = (sim, t) => {
    const k = S.clamp(Math.round((t - sim.t0) / sim.step), 0, sim.n - 1);
    return { soc: sim.soc[k], pGen: sim.pGen[k], pLoad: sim.pLoad[k], store: sim.store[k], temp: sim.temp[k], mode: sim.mode[k], ecl: sim.ecl[k], dl: sim.dl[k] };
  };
})(window.SIM);
