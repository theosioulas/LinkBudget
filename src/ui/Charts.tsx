import { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

export interface Series { label: string; color: string; values: (number | null)[]; width?: number; dash?: number[]; fill?: string; step?: boolean }

const AXIS = { stroke: '#8193ad', grid: { stroke: 'rgba(148,178,230,0.08)', width: 1 }, ticks: { stroke: 'rgba(148,178,230,0.15)', width: 1 }, font: '11px Inter, system-ui' };

export function TimeChart(props: {
  title: string; x: number[]; series: Series[]; unit: string; height?: number; nowMs: number; onPick?: (ms: number) => void; syncKey?: string; yRange?: [number, number];
}) {
  const host = useRef<HTMLDivElement>(null);
  const plot = useRef<uPlot | null>(null);
  const now = useRef(props.nowMs);
  now.current = props.nowMs;
  const onPick = useRef(props.onPick);
  onPick.current = props.onPick;

  useEffect(() => {
    const el = host.current!;
    const opts: uPlot.Options = {
      width: el.clientWidth || 600,
      height: props.height ?? 120,
      cursor: { sync: props.syncKey ? { key: props.syncKey } : undefined, points: { size: 6 } },
      legend: { show: false },
      scales: { x: { time: true }, y: props.yRange ? { range: props.yRange } : { auto: true } },
      axes: [
        { ...AXIS, values: (_u, v) => v.map((s) => new Date(s * 1000).toISOString().slice(11, 16)) },
        { ...AXIS, size: 38, space: 18 },
      ],
      series: [
        { value: (_u, v) => (v == null ? '' : new Date(v * 1000).toISOString().slice(11, 19)) },
        ...props.series.map((s) => ({
          label: s.label, stroke: s.color, width: s.width ?? 1.6, dash: s.dash, fill: s.fill, spanGaps: false,
          paths: s.step ? uPlot.paths.stepped!({ align: 1 }) : undefined,
          value: (_u: uPlot, v: number | null) => (v == null ? '—' : v.toFixed(1)),
        })),
      ],
      hooks: {
        draw: [(u) => {
          const x = u.valToPos(now.current / 1000, 'x', true);
          if (x < u.bbox.left || x > u.bbox.left + u.bbox.width) return;
          const ctx = u.ctx;
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.75)';
          ctx.setLineDash([4, 3]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, u.bbox.top);
          ctx.lineTo(x, u.bbox.top + u.bbox.height);
          ctx.stroke();
          ctx.restore();
        }],
      },
    };
    const data: uPlot.AlignedData = [props.x.map((t) => t / 1000), ...props.series.map((s) => s.values)] as uPlot.AlignedData;
    const u = new uPlot(opts, data, el);
    plot.current = u;
    u.over.addEventListener('click', () => {
      const idx = u.cursor.idx;
      if (idx != null && onPick.current) onPick.current(props.x[idx]);
    });
    const ro = new ResizeObserver(() => u.setSize({ width: el.clientWidth, height: props.height ?? 120 }));
    ro.observe(el);
    return () => { ro.disconnect(); u.destroy(); };
  }, [props.x, props.series]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { plot.current?.redraw(false, false); }, [props.nowMs]);

  return (
    <div>
      <div className="chart-title row" style={{ gap: 10 }}>
        <span>{props.title} <span style={{ textTransform: 'none' }}>[{props.unit}]</span></span>
        <span className="row" style={{ gap: 8, marginLeft: 'auto', textTransform: 'none', letterSpacing: 0 }}>
          {props.series.map((s) => (
            <span key={s.label} className="row" style={{ gap: 4 }}>
              <span style={{ width: 12, height: 0, borderTop: `2px ${s.dash ? 'dashed' : 'solid'} ${s.color}` }} />{s.label}
            </span>
          ))}
        </span>
      </div>
      <div ref={host} />
    </div>
  );
}
