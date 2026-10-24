/* TALOS-3 simulator — shared UI helpers: theme tokens, canvas sizing, plot axes, tables, map drawing. */
'use strict';
(function (S) {
  const { C } = S;
  const U = S.ui = {};
  S.views = {};

  /* ---------- theme tokens ---------- */
  const TOK = ['bg', 'panel', 'panel-2', 'raise', 'line', 'line-soft', 'fg', 'muted', 'dim', 'accent', 'accent-soft', 'accent-ink', 'ocean', 'land', 'land-edge', 'grid', 'night',
    'scope-bg', 'scope-grid', 'scope-trace', 's1', 's2', 's3', 's4', 'ok', 'warn', 'crit', 'c-radar', 'c-comms', 'c-jammer', 'c-sar', 'c-satcom', 'font-mono', 'font-ui'];
  const cache = {};
  U.refreshTokens = () => { const cs = getComputedStyle(document.documentElement); for (const k of TOK) cache[k] = cs.getPropertyValue('--' + k).trim(); };
  S.tk = n => cache[n.replace(/^--/, '')] || '#888';
  S.rgba = (col, a) => {
    if (!col || col[0] !== '#') return col;
    let h = col.slice(1); if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };
  U.satColor = i => S.tk(['s1', 's2', 's3', 's4'][i] || 's1');
  U.classColor = cls => S.tk((S.CLASS_INFO[cls] || S.CLASS_INFO.comms).color);
  U.mono = px => `${px}px ${S.tk('font-mono') || 'monospace'}`;
  U.sans = (px, w = 400) => `${w} ${px}px ${S.tk('font-ui') || 'sans-serif'}`;

  /* ---------- canvas ---------- */
  U.fit = cv => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h, dpr };
  };
  U.visible = el => el && el.offsetParent !== null && el.clientWidth > 0;

  U.niceStep = (range, n) => {
    const raw = range / Math.max(n, 1), mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  };
  U.ticks = (a, b, n) => { const st = U.niceStep(b - a, n), out = []; for (let v = Math.ceil(a / st) * st; v <= b + st * 1e-9; v += st) out.push(+v.toPrecision(12)); return out; };

  // Plot frame: returns {x(v), y(v), box}. opts: x0,x1,y0,y1, xfmt, yfmt, xticks, yticks, ylabel
  U.axes = (ctx, box, o) => {
    const { x0, x1, y0, y1 } = o;
    const X = v => box.x + (v - x0) / (x1 - x0) * box.w, Y = v => box.y + box.h - (v - y0) / (y1 - y0) * box.h;
    ctx.save();
    ctx.strokeStyle = S.tk('line-soft'); ctx.lineWidth = 1; ctx.fillStyle = S.tk('muted'); ctx.font = U.mono(10);
    const xt = o.xticks || U.ticks(x0, x1, Math.max(2, box.w / 90)), yt = o.yticks || U.ticks(y0, y1, Math.max(2, box.h / 34));
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (const v of xt) { const px = Math.round(X(v)) + 0.5; ctx.beginPath(); ctx.moveTo(px, box.y); ctx.lineTo(px, box.y + box.h); ctx.stroke(); if (!o.noXLabels) ctx.fillText(o.xfmt ? o.xfmt(v) : v, px, box.y + box.h + 4); }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (const v of yt) { const py = Math.round(Y(v)) + 0.5; ctx.beginPath(); ctx.moveTo(box.x, py); ctx.lineTo(box.x + box.w, py); ctx.stroke(); ctx.fillText(o.yfmt ? o.yfmt(v) : v, box.x - 5, py); }
    ctx.strokeStyle = S.tk('line'); ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
    if (o.ylabel) { ctx.save(); ctx.translate(box.x - (o.ylabelOff || 44), box.y + box.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = S.tk('muted'); ctx.font = U.sans(10.5); ctx.fillText(o.ylabel, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X, Y, box };
  };
  U.label = (ctx, txt, x, y, col, align = 'left', bg = true) => {
    ctx.save(); ctx.font = U.sans(11, 500); ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (bg) { ctx.lineWidth = 3; ctx.strokeStyle = S.rgba(S.tk('panel'), 0.85); ctx.strokeText(txt, x, y); }
    ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore();
  };
  U.satGlyph = (ctx, x, y, col, r = 5) => {
    ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = S.tk('panel'); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.rect(x - r * 0.55, y - r * 0.55, r * 1.1, r * 1.1); ctx.fill(); ctx.stroke();
    ctx.fillRect(x - r * 1.9, y - r * 0.25, r * 1.1, r * 0.5); ctx.fillRect(x + r * 0.8, y - r * 0.25, r * 1.1, r * 0.5);
    ctx.restore();
  };
  U.emitterGlyph = (ctx, x, y, col, sel) => {
    ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = sel ? S.tk('fg') : S.tk('panel'); ctx.lineWidth = sel ? 2 : 1.2;
    ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (sel) { ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.restore();
  };
  U.ellipse = (ctx, cx, cy, a, b, angE, stroke, fill, dash) => {
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(a, 0.5), Math.max(b, 0.5), -angE, 0, 2 * Math.PI);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (dash) ctx.setLineDash(dash);
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
  };

  /* ---------- world map (equirectangular) ---------- */
  U.EquiMap = class {
    constructor() { this.cLon = 20; this.cLat = 20; this.zoom = 1; }
    setup(w, h) {
      this.w = w; this.h = h;
      const base = Math.min(w / 360, h / 180) * 1.0, s = base * this.zoom;
      this.s = s; // px per degree
      const halfLat = h / 2 / s; this.cLat = S.clamp(this.cLat, -90 + Math.min(halfLat, 90), 90 - Math.min(halfLat, 90));
    }
    xy(latDeg, lonDeg) {
      let dl = lonDeg - this.cLon; dl = ((dl + 180) % 360 + 360) % 360 - 180;
      return [this.w / 2 + dl * this.s, this.h / 2 - (latDeg - this.cLat) * this.s];
    }
    ll(x, y) { return [this.cLat - (y - this.h / 2) / this.s, ((this.cLon + (x - this.w / 2) / this.s + 540) % 360) - 180]; }
    drawBase(ctx, opts = {}) {
      const { w, h } = this;
      ctx.fillStyle = S.tk('ocean'); ctx.fillRect(0, 0, w, h);
      // graticule
      ctx.strokeStyle = S.tk('grid'); ctx.lineWidth = 1; ctx.beginPath();
      const step = this.zoom > 3 ? 5 : this.zoom > 1.5 ? 10 : 30;
      for (let lo = -180; lo < 180; lo += step) { const [x] = this.xy(0, lo); ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, h); }
      for (let la = -90; la <= 90; la += step) { const [, y] = this.xy(la, this.cLon); ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(w, Math.round(y) + 0.5); }
      ctx.stroke();
      if (!S.world.ready) return;
      ctx.fillStyle = S.tk('land'); ctx.strokeStyle = S.tk('land-edge'); ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (const r of S.world.rings) {
        const p = r.pts;
        let [x0] = this.xy(p[1], p[0]); let prevX = x0;
        // shift whole ring so it does not tear at the seam: use first point as anchor
        const shiftRing = this.xy(p[1], p[0])[0] - (this.w / 2 + (p[0] - this.cLon) * this.s);
        for (let i = 0; i < p.length; i += 2) {
          const x = this.w / 2 + (p[i] - this.cLon) * this.s + shiftRing, y = this.h / 2 - (p[i + 1] - this.cLat) * this.s;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          prevX = x;
        }
        ctx.closePath();
        // duplicate copies for rings that cross the frame edge
        const minX = this.w / 2 + (r.bbox[0] - this.cLon) * this.s + shiftRing, maxX = this.w / 2 + (r.bbox[2] - this.cLon) * this.s + shiftRing;
        for (const off of [-360, 360]) {
          const o = off * this.s;
          if (maxX + o < 0 || minX + o > w) continue;
          for (let i = 0; i < p.length; i += 2) {
            const x = this.w / 2 + (p[i] - this.cLon) * this.s + shiftRing + o, y = this.h / 2 - (p[i + 1] - this.cLat) * this.s;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.closePath();
        }
      }
      ctx.fill(); ctx.stroke();
    }
    // night side shading from the sub-solar point
    drawNight(ctx, ms) {
      const ss = S.subSolar(ms), dec = ss.lat, lonS = ss.lon * C.RAD, { w, h } = this;
      ctx.save(); ctx.fillStyle = S.tk('night'); ctx.beginPath();
      const pts = [];
      for (let x = 0; x <= w; x += 4) {
        const [, lon] = this.ll(x, h / 2), H = (lon - lonS) * C.DEG;
        const lat = Math.abs(dec) < 1e-6 ? (Math.cos(H) > 0 ? -90 : 90) : Math.atan(-Math.cos(H) / Math.tan(dec)) * C.RAD;
        pts.push([x, this.xy(lat, lon)[1]]);
      }
      const yEdge = dec > 0 ? this.xy(-90, 0)[1] : this.xy(90, 0)[1];
      ctx.moveTo(0, yEdge); for (const [x, y] of pts) ctx.lineTo(x, y); ctx.lineTo(w, yEdge); ctx.closePath(); ctx.fill();
      // sun marker
      const [sx, sy] = this.xy(ss.lat * C.RAD, lonS);
      ctx.fillStyle = S.tk('warn'); ctx.beginPath(); ctx.arc(sx, sy, 5, 0, 7); ctx.fill();
      ctx.restore();
    }
    // polyline of lat/lon (rad) points with seam breaks
    path(ctx, pts) {
      ctx.beginPath(); let px = null;
      for (const [la, lo] of pts) {
        const [x, y] = this.xy(la * C.RAD, lo * C.RAD);
        if (px === null || Math.abs(x - px) > this.w * 0.5) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        px = x;
      }
    }
  };

  /* ---------- HTML helpers ---------- */
  U.table = (el, head, rows, opts = {}) => {
    const th = head.map(h => `<th class="${h.num ? 'num' : ''}">${h.t}</th>`).join('');
    const tb = rows.map(r => `<tr class="${r.cls || ''}"${r.attrs ? ' ' + r.attrs : ''}>${r.cells.map((c, i) => `<td class="${head[i] && head[i].num ? 'num' : ''}${head[i] && head[i].wrap ? ' wrap' : ''}">${c}</td>`).join('')}</tr>`).join('');
    el.innerHTML = `<thead><tr>${th}</tr></thead><tbody>${tb}</tbody>${opts.foot ? `<tfoot><tr>${opts.foot.map((c, i) => `<td class="${head[i] && head[i].num ? 'num' : ''}">${c}</td>`).join('')}</tr></tfoot>` : ''}`;
  };
  U.pill = (txt, kind) => `<span class="pill ${kind}">${S.esc(txt)}</span>`;
  U.satDot = i => `<span class="dot" style="background:var(${S.SAT_COLORS[i]})"></span>`;
  U.clsDot = cls => `<span class="dot" style="background:var(${(S.CLASS_INFO[cls] || S.CLASS_INFO.comms).color})"></span>`;
  U.setSeg = (seg, attr, val) => seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === String(val))));
  U.copy = (text, btn) => {
    const ok = () => { const t = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = t; }, 1400); };
    const fallback = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        ok();
      } catch (e) {
        U.selectText(btn.closest('.panel')?.querySelector('pre'));
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else fallback();
  };
  U.selectText = el => { if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  U.cepTxt = m => m == null ? '—' : S.fmtM(m);
  U.cepKind = m => m == null ? 'dim' : m < 250 ? 'ok' : m < 1500 ? 'warn' : 'crit';
})(window.SIM);
