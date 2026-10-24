/* TALOS-3 simulator — signal-level processing.
   Generates complex-baseband IQ for each emitter waveform, applies the differential delay and Doppler
   between two receivers, adds thermal noise at the link-budget SNR and computes the cross-ambiguity
   function  A(τ,ν) = |Σ s1*(t) · s2(t+τ) · e^{-j2πνt}|²
   - continuous waveforms: FFT correlation per Doppler bin, coherently summed over blocks
   - pulsed waveforms: pulse-gated CAF over the whole pulse train (time-domain, only gated samples) */
'use strict';
(function (S) {
  const D = S.DSP = {};
  const TP = 2 * Math.PI;

  D.fft = (re, im, inverse) => {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inverse ? TP : -TP) / len, wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < h; k++) {
          const a = i + k, b = a + h, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
    if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  };

  // sampling plan per waveform: fs (Hz), FFT block N, coherent blocks M, demonstrated aperture T
  D.plan = em => {
    const mult = { pulse: 4, chirp: 2.5, fm: 4, gmsk: 8 * 9600 / em.bw, bpsk: 4, noise: 2.5 }[em.sig] || 4;
    const fs = mult * em.bw;
    if (em.sig === 'pulse') { const np = Math.max(4, Math.round(em.tInt * em.prf)); return { fs, N: 0, M: np, T: np / em.prf, pulses: np }; }
    const need = em.tInt * fs;
    const N = Math.min(need > 16384 ? 8192 : 16384, Math.max(1024, 2 ** Math.round(Math.log2(Math.max(need, 1024)))));
    const M = Math.max(1, Math.min(8, Math.round(need / N)));
    return { fs, N, M, T: N * M / fs };
  };

  D.waveform = (em, N, fs, r) => {
    const re = new Float64Array(N), im = new Float64Array(N);
    const setPh = (n, ph) => { re[n] = Math.cos(ph); im[n] = Math.sin(ph); };
    if (em.sig === 'chirp') {
      const Tsw = 12e-6, B = em.bw; let ph = 0;
      for (let n = 0; n < N; n++) { const t = n / fs, f = -B / 2 + B * ((t % Tsw) / Tsw); ph += TP * f / fs; setPh(n, ph); }
    } else if (em.sig === 'fm') {
      const tones = [0, 1, 2].map(() => ({ f: 300 + r() * 2700, p: r() * TP, a: 0.4 + r() * 0.6 })), dev = em.bw / 4; let ph = 0;
      for (let n = 0; n < N; n++) { const t = n / fs; let m = 0; for (const q of tones) m += q.a * Math.sin(TP * q.f * t + q.p); ph += TP * dev * m / 1.5 / fs; setPh(n, ph); }
    } else if (em.sig === 'gmsk') {
      const sps = Math.round(fs / 9600), nb = Math.ceil(N / sps) + 4, bits = Array.from({ length: nb }, () => r() < 0.5 ? -1 : 1);
      const sig = Math.sqrt(Math.LN2) / (TP * 0.4) * sps, half = Math.ceil(3 * sig), ker = [];
      for (let k = -half; k <= half; k++) ker.push(Math.exp(-0.5 * (k / sig) ** 2));
      const ks = ker.reduce((a, b) => a + b, 0); let ph = 0;
      for (let n = 0; n < N; n++) { let f = 0; for (let k = -half; k <= half; k++) { const b = Math.floor((n + k) / sps) + 2; f += bits[Math.max(0, Math.min(nb - 1, b))] * ker[k + half]; } ph += (Math.PI / 2) * (f / ks) / sps; setPh(n, ph); }
    } else if (em.sig === 'bpsk') {
      const sps = Math.round(fs / 400); let bit = 1;
      for (let n = 0; n < N; n++) { if (n % sps === 0) bit = r() < 0.5 ? -1 : 1; setPh(n, 1.1 * bit * ((n % sps) < sps / 2 ? 1 : -1)); }
    } else {
      for (let n = 0; n < N; n++) { re[n] = r.gauss(); im[n] = r.gauss(); }
      D.fft(re, im, false);
      const keep = Math.floor(N * em.bw / fs / 2);
      for (let k = keep; k < N - keep; k++) { re[k] = 0; im[k] = 0; }
      D.fft(re, im, true);
      let p = 0; for (let n = 0; n < N; n++) p += re[n] * re[n] + im[n] * im[n];
      const g = 1 / Math.sqrt(p / N); for (let n = 0; n < N; n++) { re[n] *= g; im[n] *= g; }
    }
    return { re, im };
  };

  // circular fractional delay by `d` samples via frequency-domain phase ramp
  D.delay = (x, d) => {
    const N = x.re.length, re = Float64Array.from(x.re), im = Float64Array.from(x.im);
    D.fft(re, im, false);
    for (let k = 0; k < N; k++) {
      const f = k < N / 2 ? k : k - N, a = -TP * f * d / N, c = Math.cos(a), s = Math.sin(a);
      const r0 = re[k] * c - im[k] * s; im[k] = re[k] * s + im[k] * c; re[k] = r0;
    }
    D.fft(re, im, true);
    return { re, im };
  };

  const L = 12, K = 16;
  const peakOf = (grid, prior, fs, dnu) => {
    const W = 2 * L + 1;
    let bi = 0; for (let q = 1; q < grid.length; q++) if (grid[q] > grid[bi]) bi = q;
    const bk = Math.floor(bi / W), bl = bi % W;
    const para = (a, b, c) => { const den = a - 2 * b + c; return den === 0 ? 0 : 0.5 * (a - c) / den; };
    const g = (k, l) => grid[S.clamp(k, 0, 2 * K) * W + S.clamp(l, 0, 2 * L)];
    const fl = bl - L + para(g(bk, bl - 1), g(bk, bl), g(bk, bl + 1));
    const fk = bk - K + para(g(bk - 1, bl), g(bk, bl), g(bk + 1, bl));
    let side = 0, mean = 0;
    for (let k = 0; k <= 2 * K; k++) for (let l = 0; l < W; l++) { mean += grid[k * W + l]; if (Math.abs(k - bk) > 5 || Math.abs(l - bl) > 2) side = Math.max(side, grid[k * W + l]); }
    return { tau: prior.tau + fl / fs, nu: prior.nu + fk * dnu, peak: grid[bi], pslDb: S.db(grid[bi] / Math.max(side, 1e-30)), pmrDb: S.db(grid[bi] / (mean / grid.length)) };
  };

  /* Cross-ambiguity surface around a coarse prior.
     o: { em, snr1 (reference), snr2, tdoaTrue, fdoaTrue, seed } */
  D.caf = o => {
    const r = S.rng(o.seed), pl = D.plan(o.em), fs = pl.fs;
    const dnu = 1 / pl.T / 4;
    const prior = { tau: Math.round(o.tdoaTrue * fs) / fs + Math.round((r() - 0.5) * 6) / fs, nu: o.fdoaTrue + (r() - 0.5) * 10 * dnu };
    const dSamp = (o.tdoaTrue - prior.tau) * fs, dNu = o.fdoaTrue - prior.nu;
    const sd1 = Math.sqrt((fs / o.em.bw) / S.lin(o.snr1) / 2), sd2 = Math.sqrt((fs / o.em.bw) / S.lin(o.snr2) / 2);
    const W = 2 * L + 1, grid = new Float32Array((2 * K + 1) * W);
    let wave;
    if (o.em.sig === 'pulse') {
      // pulse-gated: each pulse contributes a short window; carrier phase random per pulse (magnetron)
      const pw = o.em.pw * fs, pri = 1 / o.em.prf, G = Math.ceil(pw) + 2 * L + 8, np = pl.pulses;
      const env = t => { const a = S.clamp(t + 0.5, 0, 1), b = S.clamp(pw + 0.5 - t, 0, 1); return Math.min(a, b); };
      const P1 = [], P2 = [];
      for (let p = 0; p < np; p++) {
        const tp = p * pri + (r() - 0.5) * 2e-6, ph0 = r() * TP, df = (r() - 0.5) * 0.05 * fs / pw;
        const a1 = new Float64Array(2 * G), a2 = new Float64Array(2 * G);
        for (let n = 0; n < G; n++) {
          const t1 = n - L - 4, t2 = t1 - dSamp, e1 = env(t1), e2 = env(t2);
          const ph1 = ph0 + TP * df * t1 / fs, ph2 = ph0 + TP * df * t2 / fs + TP * dNu * (tp + n / fs);
          a1[2 * n] = e1 * Math.cos(ph1) + sd1 * r.gauss(); a1[2 * n + 1] = e1 * Math.sin(ph1) + sd1 * r.gauss();
          a2[2 * n] = e2 * Math.cos(ph2) + sd2 * r.gauss(); a2[2 * n + 1] = e2 * Math.sin(ph2) + sd2 * r.gauss();
        }
        P1.push({ tp, a: a1 }); P2.push(a2);
      }
      for (let k = -K; k <= K; k++) {
        const nu = k * dnu;
        for (let l = -L; l <= L; l++) {
          let sr = 0, si = 0;
          for (let p = 0; p < np; p++) {
            const a1 = P1[p].a, a2 = P2[p], tp = P1[p].tp;
            let pr = 0, pi = 0;
            const n0 = Math.max(0, -l), n1 = Math.min(G, G - l);
            for (let n = n0; n < n1; n++) {
              const xr = a1[2 * n], xi = -a1[2 * n + 1], yr = a2[2 * (n + l)], yi = a2[2 * (n + l) + 1];
              const ph = -TP * nu * (n / fs), c = Math.cos(ph), s = Math.sin(ph);
              const zr = yr * c - yi * s, zi = yr * s + yi * c;
              pr += xr * zr - xi * zi; pi += xr * zi + xi * zr;
            }
            const ph = -TP * nu * tp, c = Math.cos(ph), s = Math.sin(ph);
            sr += pr * c - pi * s; si += pr * s + pi * c;
          }
          grid[(k + K) * W + (l + L)] = sr * sr + si * si;
        }
      }
      const show = Math.min(np, 6), wr = [], wi = [];
      for (let p = 0; p < show; p++) for (let n = 0; n < G; n++) { wr.push(P1[p].a[2 * n]); wi.push(P1[p].a[2 * n + 1]); }
      wave = { re: Float64Array.from(wr), im: Float64Array.from(wi), gated: true, G };
    } else {
      const N = pl.N, M = pl.M, NT = N * M;
      const s0 = D.waveform(o.em, NT, fs, r), s2 = D.delay(s0, dSamp);
      const x1r = new Float64Array(NT), x1i = new Float64Array(NT), x2r = new Float64Array(NT), x2i = new Float64Array(NT);
      for (let n = 0; n < NT; n++) {
        const a = TP * dNu * n / fs, c = Math.cos(a), s = Math.sin(a);
        x1r[n] = s0.re[n] + sd1 * r.gauss(); x1i[n] = s0.im[n] + sd1 * r.gauss();
        x2r[n] = s2.re[n] * c - s2.im[n] * s + sd2 * r.gauss(); x2i[n] = s2.re[n] * s + s2.im[n] * c + sd2 * r.gauss();
      }
      const F1 = [];
      for (let b = 0; b < M; b++) { const fr = x1r.slice(b * N, b * N + N), fi = x1i.slice(b * N, b * N + N); D.fft(fr, fi, false); F1.push([fr, fi]); }
      const wr = new Float64Array(N), wi = new Float64Array(N), ar = new Float64Array(N), ai = new Float64Array(N);
      for (let k = -K; k <= K; k++) {
        const nu = k * dnu; ar.fill(0); ai.fill(0);
        for (let b = 0; b < M; b++) {
          for (let n = 0; n < N; n++) { const q = b * N + n, a = -TP * nu * q / fs, c = Math.cos(a), s = Math.sin(a); wr[n] = x2r[q] * c - x2i[q] * s; wi[n] = x2r[q] * s + x2i[q] * c; }
          D.fft(wr, wi, false);
          const [fr, fi] = F1[b];
          for (let n = 0; n < N; n++) { ar[n] += fr[n] * wr[n] + fi[n] * wi[n]; ai[n] += fr[n] * wi[n] - fi[n] * wr[n]; }
        }
        D.fft(ar, ai, true);
        for (let l = -L; l <= L; l++) { const idx = (l + N) % N; grid[(k + K) * W + (l + L)] = ar[idx] * ar[idx] + ai[idx] * ai[idx]; }
      }
      wave = { re: x1r.subarray(0, Math.min(NT, 2048)), im: x1i.subarray(0, Math.min(NT, 2048)) };
    }
    const pk = peakOf(grid, prior, fs, dnu);
    const cr = S.pairCrlb(o.snr1, o.snr2, o.em.bw, pl.T, S.onFraction(o.em));
    return { grid, K, L, fs, plan: pl, T: pl.T, dnu, prior, meas: { tau: pk.tau, nu: pk.nu }, truth: { tau: o.tdoaTrue, nu: o.fdoaTrue },
      pslDb: pk.pslDb, pmrDb: pk.pmrDb, crlb: cr, wave };
  };
})(window.SIM);
