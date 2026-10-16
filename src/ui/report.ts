import type { useStore } from '../store/store';
import { activeTerminal } from '../store/store';
import type { DirectionResult, LinkResult } from '../core/rf/linkbudget';
import { siteClimate } from '../core/itu/atmosphere';

type S = ReturnType<typeof useStore.getState>;
const f = (v: number | string, d = 2) => (typeof v === 'string' ? v : Number.isFinite(v) ? v.toFixed(d) : v === Infinity ? '∞' : '—');
const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!);

function table(d: DirectionResult) {
  if (!d.feasible) return `<p class="warn">Not feasible: ${esc(d.reason ?? '')}</p>`;
  let last = '';
  const rows = d.lines.map((l) => {
    const sec = l.section !== last ? `<tr class="sec"><td colspan="3">${l.section}</td></tr>` : '';
    last = l.section;
    return `${sec}<tr class="${l.key ? 'key' : ''}"><td>${esc(l.label)}${l.note ? `<br><small>${esc(l.note)}</small>` : ''}</td><td class="v">${f(l.value, l.unit === '%' ? 3 : 2)}</td><td class="u">${l.unit}</td></tr>`;
  }).join('');
  return `<table>${rows}</table>`;
}

function linkSection(title: string, sat: string, L: LinkResult | null) {
  if (!L) return `<h2>${title}</h2><p>No satellite assigned.</p>`;
  return `<h2>${title} — ${esc(sat)}</h2>
  <p class="meta">Elevation ${f(L.geometry.look.el, 2)}° · Azimuth ${f(L.geometry.look.az, 2)}° · Range ${f(L.geometry.look.range, 1)} km · Terminal scan ${f(L.geometry.terminalScanDeg, 1)}° · Doppler ${f(L.dopplerFwdKHz, 1)} kHz (${f(L.dopplerRateHzS, 1)} Hz/s) · RTT ${f(L.rttMs, 1)} ms · ${esc(L.beam.beamLabel)}</p>
  <div class="cols"><div><h3>Forward link (satellite → terminal)</h3>${table(L.forward)}</div><div><h3>Return link (terminal → satellite)</h3>${table(L.ret)}</div></div>`;
}

export function buildHtmlReport(s: S): string {
  const t = activeTerminal(s);
  const c = siteClimate(t.lat, t.lon);
  const name = (id: string | undefined) => s.sats.find((x) => x.id === id)?.name ?? '';
  const sim = s.sim;
  const simHtml = sim
    ? `<h2>Make-before-break timeline</h2>
      <p class="meta">${new Date(sim.startMs).toISOString()} → ${new Date(sim.endMs).toISOString()} · step ${sim.stepMs / 1000} s · policy ${s.mbb.policy} / ${s.mbb.orbitPolicy}</p>
      <table class="kv">${Object.entries({
        'Service availability': `${f(sim.summary.availabilityPct, 3)} %`, 'Outage time': `${f(sim.summary.outageS, 0)} s`,
        'Handovers (MBB / break)': `${sim.summary.mbbHandovers} / ${sim.summary.breakHandovers}`, 'Mean forward throughput': `${f(sim.summary.meanThrFwd, 1)} Mbps`,
        'Min forward throughput': `${f(sim.summary.minThrFwd, 1)} Mbps`, 'Mean return throughput': `${f(sim.summary.meanThrRtn, 1)} Mbps`,
        'Mean RTT': `${f(sim.summary.meanLatencyMs, 1)} ms`, 'Orbit share': Object.entries(sim.summary.orbitShare).map(([k, v]) => `${k} ${f(v, 1)}%`).join(', '),
        'Satellites used': String(sim.summary.satsUsed),
      }).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
      <h3>Events</h3><table class="ev">${sim.events.slice(0, 400).map((e) => `<tr><td>${new Date(e.t).toISOString().slice(11, 19)}</td><td>Beam ${e.beam}</td><td>${e.type}</td><td>${esc(e.satName)}</td><td>${esc(e.detail ?? '')}</td></tr>`).join('')}</table>`
    : '<p>No timeline simulation has been run.</p>';
  const payloadRows = s.constellations.filter((x) => x.enabled).map((x) => {
    const p = s.payloads.find((pp) => pp.id === x.payloadId);
    return `<tr><td>${esc(x.name)}</td><td>${x.orbitClass}</td><td>${esc(p?.name ?? '')}</td><td>${p?.band}</td><td>${f(p?.forward.freqGHz ?? NaN)} / ${f(p?.ret.freqGHz ?? NaN)} GHz</td><td>${f(p?.forward.eirpPeakDbw ?? NaN, 1)} dBW</td><td>${f(p?.ret.gtPeakDbK ?? NaN, 1)} dB/K</td><td>${p?.layout.kind}</td></tr>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Link budget report – ${esc(s.name)}</title>
<style>
body{font:13px/1.45 Inter,system-ui,sans-serif;color:#111;max-width:1200px;margin:24px auto;padding:0 20px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:28px 0 6px;border-bottom:2px solid #0e7490;padding-bottom:3px}h3{font-size:14px;margin:12px 0 4px}
.meta{color:#555}table{border-collapse:collapse;width:100%;font-size:12px}td{padding:3px 6px;border-bottom:1px solid #eee;vertical-align:top}
td.v{text-align:right;font-family:ui-monospace,Menlo,monospace;white-space:nowrap}td.u{color:#777;white-space:nowrap}tr.key td{font-weight:700}tr.key td.v{color:#0e7490}
tr.sec td{background:#f3f6fa;font-weight:600;text-transform:uppercase;font-size:10.5px;letter-spacing:.6px;color:#456}
small{color:#777}.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px}.kv td:first-child{width:260px;color:#555}.warn{color:#b45309}
table.ev td{font-family:ui-monospace,Menlo,monospace;font-size:11px}th{text-align:left;font-size:11px;color:#555;border-bottom:1px solid #ccc;padding:3px 6px}
@media print{.cols{grid-template-columns:1fr 1fr}h2{break-before:auto}}
</style></head><body>
<h1>Link budget report — ${esc(s.name)}</h1>
<p class="meta">Generated by OrbitLink Studio · simulation time ${new Date(s.live.t).toISOString()} · availability target ${s.analysis.availabilityPct}% · ITU-R P.618-13 / P.676 / P.840 / P.838-3 / P.837-7 / P.839-4 / P.453</p>
<h2>Earth station</h2>
<table class="kv"><tr><td>Terminal</td><td>${esc(t.name)} (${t.type}, ${t.beams} beam${t.beams > 1 ? 's' : ''})</td></tr>
<tr><td>Location</td><td>${f(t.lat, 4)}°, ${f(t.lon, 4)}°, ${t.altM} m</td></tr>
${Object.entries(t.bands).map(([k, b]) => `<tr><td>${k}-band</td><td>Rx ${b!.rxFreqGHz.join('–')} GHz, G ${f(b!.rxGainDbi, 1)} dBi, G/T ${f(b!.gtDbK, 1)} dB/K · Tx ${b!.txFreqGHz.join('–')} GHz, EIRP ${f(b!.eirpMaxDbw, 1)} dBW</td></tr>`).join('')}
<tr><td>Scan model</td><td>Rx cos^${t.scanLossExpRx}, Tx cos^${t.scanLossExpTx}, max ${t.maxScanDeg}°, tilt ${t.panelTiltDeg}° az ${t.panelAzDeg}°</td></tr>
<tr><td>Climate (ITU maps)</td><td>R0.01 ${f(s.analysis.R001Override ?? c.R001, 1)} mm/h, rain height ${f(c.hRain, 2)} km, ρ ${f(c.rho, 1)} g/m³, V ${f(c.V, 1)} kg/m², Nwet ${f(c.Nwet, 0)}</td></tr></table>
<h2>Systems in scenario</h2>
<table><tr><th>Constellation</th><th>Orbit</th><th>Payload</th><th>Band</th><th>Fwd/Rtn freq</th><th>Peak EIRP</th><th>Peak G/T</th><th>Beam layout</th></tr>${payloadRows}</table>
${linkSection('Beam A', name(s.live.A?.satId), s.live.A?.link ?? null)}
${linkSection('Beam B', name(s.live.B?.satId), s.live.B?.link ?? null)}
${s.live.selected ? linkSection('Selected satellite', name(s.selectedSatId ?? ''), s.live.selected) : ''}
${simHtml}
</body></html>`;
}
