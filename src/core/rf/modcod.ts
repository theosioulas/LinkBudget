/**
 * DVB-S2 / DVB-S2X MODCOD table (normal FECFRAME, AWGN, QEF, no pilots).
 * Es/N0 thresholds per ETSI EN 302 307-1 Table 13 and EN 302 307-2 Table 20a
 * (S2X entries rounded). Spectral efficiency in information bits per symbol.
 */
export interface ModCod {
  name: string;
  mod: 'BPSK' | 'QPSK' | '8PSK' | '8APSK' | '16APSK' | '32APSK' | '64APSK' | '128APSK' | '256APSK';
  rate: string;
  esn0: number;
  eff: number;
  s2x: boolean;
}

const bps: Record<ModCod['mod'], number> = { BPSK: 1, QPSK: 2, '8PSK': 3, '8APSK': 3, '16APSK': 4, '32APSK': 5, '64APSK': 6, '128APSK': 7, '256APSK': 8 };
const frac = (r: string) => { const [a, b] = r.replace('-L', '').split('/').map(Number); return a / b; };
const mk = (mod: ModCod['mod'], rate: string, esn0: number, s2x = false): ModCod => ({
  name: `${mod} ${rate}`, mod, rate, esn0, s2x, eff: +(bps[mod] * frac(rate) * 0.9886).toFixed(3),
});

export const MODCODS: ModCod[] = [
  mk('BPSK', '1/5', -6.85, true), mk('BPSK', '11/45', -5.8, true), mk('BPSK', '1/3', -4.0, true),
  mk('QPSK', '2/9', -2.85, true), mk('QPSK', '1/4', -2.35), mk('QPSK', '13/45', -2.03, true), mk('QPSK', '1/3', -1.24),
  mk('QPSK', '2/5', -0.3), mk('QPSK', '9/20', 0.22, true), mk('QPSK', '1/2', 1.0), mk('QPSK', '11/20', 1.45, true),
  mk('QPSK', '3/5', 2.23), mk('QPSK', '2/3', 3.1), mk('QPSK', '3/4', 4.03), mk('QPSK', '4/5', 4.68),
  mk('8APSK', '5/9-L', 4.73, true), mk('QPSK', '5/6', 5.18), mk('8APSK', '26/45-L', 5.13, true), mk('8PSK', '3/5', 5.5),
  mk('16APSK', '1/2-L', 5.97, true), mk('8PSK', '23/36', 6.12, true), mk('QPSK', '8/9', 6.2), mk('QPSK', '9/10', 6.42),
  mk('16APSK', '8/15-L', 6.55, true), mk('8PSK', '2/3', 6.62), mk('16APSK', '5/9-L', 6.84, true), mk('8PSK', '25/36', 7.02, true),
  mk('16APSK', '3/5-L', 7.41, true), mk('8PSK', '13/18', 7.49, true), mk('16APSK', '26/45', 7.51, true), mk('16APSK', '3/5', 7.8, true),
  mk('8PSK', '3/4', 7.91), mk('16APSK', '28/45', 8.1, true), mk('16APSK', '23/36', 8.38, true), mk('16APSK', '2/3-L', 8.43, true),
  mk('16APSK', '25/36', 8.83, true), mk('16APSK', '2/3', 8.97), mk('16APSK', '13/18', 9.27, true), mk('8PSK', '5/6', 9.35),
  mk('16APSK', '7/9', 9.71, true), mk('16APSK', '3/4', 10.21), mk('16APSK', '77/90', 10.65, true), mk('8PSK', '8/9', 10.69),
  mk('8PSK', '9/10', 10.98), mk('16APSK', '4/5', 11.03), mk('32APSK', '2/3-L', 11.1, true), mk('16APSK', '5/6', 11.61),
  mk('32APSK', '32/45', 11.75, true), mk('32APSK', '11/15', 12.17, true), mk('32APSK', '3/4', 12.73), mk('16APSK', '8/9', 12.89),
  mk('16APSK', '9/10', 13.13), mk('32APSK', '7/9', 13.05, true), mk('32APSK', '4/5', 13.64), mk('64APSK', '32/45-L', 13.98, true),
  mk('32APSK', '5/6', 14.28), mk('64APSK', '11/15', 14.81, true), mk('64APSK', '7/9', 15.47, true), mk('32APSK', '8/9', 15.69),
  mk('64APSK', '4/5', 15.87, true), mk('32APSK', '9/10', 16.05), mk('64APSK', '5/6', 16.55, true), mk('128APSK', '3/4', 17.73, true),
  mk('128APSK', '7/9', 18.53, true), mk('256APSK', '29/45-L', 18.59, true), mk('256APSK', '2/3-L', 18.84, true),
  mk('256APSK', '31/45-L', 19.57, true), mk('256APSK', '32/45', 19.33, true), mk('256APSK', '11/15-L', 20.11, true), mk('256APSK', '3/4', 20.81, true),
].sort((a, b) => a.esn0 - b.esn0);

export interface AcmResult {
  modcod: ModCod | null;
  marginDb: number; // Es/N0 − threshold − implementation/ACM margin
  efficiency: number;
}

/** Highest-efficiency MODCOD whose threshold + margin is ≤ Es/N0. */
export function selectModcod(esn0: number, marginDb: number, allowS2x = true): AcmResult {
  let best: ModCod | null = null;
  for (const m of MODCODS) {
    if (!allowS2x && m.s2x) continue;
    if (m.esn0 + marginDb <= esn0 && (!best || m.eff > best.eff)) best = m;
  }
  return { modcod: best, marginDb: best ? esn0 - best.esn0 - marginDb : esn0 - MODCODS[0].esn0 - marginDb, efficiency: best?.eff ?? 0 };
}

/** Shannon bound spectral efficiency [b/s/Hz] for reference. */
export const shannonEff = (esn0Db: number) => Math.log2(1 + Math.pow(10, esn0Db / 10));
