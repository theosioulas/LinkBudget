import type { BeamPattern } from '../core/model';
import { relativeGainDb, scanEffects } from '../core/rf/antenna';

/** Small SVG plot of a beam pattern (relative gain vs off-axis angle), optionally at several scan angles. */
export function PatternPlot({ pattern, scans = [0], width = 340, height = 150 }: { pattern: BeamPattern; scans?: number[]; width?: number; height?: number }) {
  const m = { l: 34, r: 8, t: 8, b: 22 };
  const W = width - m.l - m.r, H = height - m.t - m.b;
  const maxTh = pattern.hpbwDeg * 4;
  const yMin = -40;
  const X = (th: number) => m.l + (th / maxTh) * W;
  const Y = (g: number) => m.t + (Math.max(g, yMin) / yMin) * H;
  const colors = ['#22d3ee', '#f472b6', '#fbbf24', '#34d399'];
  const paths = scans.map((sc) => {
    const { lossDb, hpbwDeg } = scanEffects(pattern, sc);
    let d = '';
    for (let i = 0; i <= 200; i++) {
      const th = (i / 200) * maxTh;
      const g = lossDb + relativeGainDb(pattern, th, hpbwDeg);
      d += `${i ? 'L' : 'M'}${X(th).toFixed(1)},${Y(g).toFixed(1)}`;
    }
    return d;
  });
  const xt = [0, 1, 2, 3, 4].map((k) => (k * maxTh) / 4);
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {[0, -10, -20, -30, -40].map((g) => (
        <g key={g}><line x1={m.l} x2={m.l + W} y1={Y(g)} y2={Y(g)} stroke="rgba(148,178,230,0.12)" /><text x={m.l - 4} y={Y(g) + 3} fontSize="9.5" fill="#7d8da6" textAnchor="end">{g}</text></g>
      ))}
      {xt.map((t) => <text key={t} x={X(t)} y={height - 6} fontSize="9.5" fill="#7d8da6" textAnchor="middle">{t.toFixed(t < 2 ? 2 : 1)}°</text>)}
      <line x1={X(pattern.hpbwDeg / 2)} x2={X(pattern.hpbwDeg / 2)} y1={m.t} y2={m.t + H} stroke="rgba(251,191,36,0.4)" strokeDasharray="3 3" />
      <text x={X(pattern.hpbwDeg / 2) + 3} y={m.t + 10} fontSize="9.5" fill="#fbbf24">θ3dB/2</text>
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke={colors[i % colors.length]} strokeWidth={1.6} />)}
      {scans.length > 1 && scans.map((s, i) => <text key={s} x={m.l + W - 4} y={m.t + 12 + i * 12} fontSize="10" fill={colors[i % colors.length]} textAnchor="end">scan {s}°</text>)}
      <text x={8} y={m.t + H / 2} fontSize="9.5" fill="#7d8da6" transform={`rotate(-90 8 ${m.t + H / 2})`} textAnchor="middle">dB</text>
    </svg>
  );
}
