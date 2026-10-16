export const db = (x: number) => 10 * Math.log10(x);
export const undb = (x: number) => Math.pow(10, x / 10);
/** Power-sum of dB ratios expressed as C/X values -> combined C/(X1+X2+...) */
export function combineCN(...cnDb: number[]): number {
  let inv = 0;
  for (const v of cnDb) if (Number.isFinite(v)) inv += 1 / undb(v);
  return inv === 0 ? Infinity : -db(inv);
}
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const fmt = (x: number, d = 2) =>
  Number.isFinite(x) ? x.toFixed(d) : x === Infinity ? '∞' : x === -Infinity ? '−∞' : '—';
export const wavelength = (fGHz: number) => 0.299792458 / fGHz; // [m]
