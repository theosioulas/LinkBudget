/* geo.js — offline world map renderer built on d3-geo + canvas.
   Requires: d3.v7.min.js, assets/data/world.js (window.WORLD_GEO).
   const map = new GeoMap(containerEl, { projection: 'equirect'|'ortho'|'mercator', center:[lon,lat], scale, interactive:true });
   map.layers = [ {type:'polygon', coords:[[lon,lat],...], fill, stroke, width},
                  {type:'line', coords:[[lon,lat],...], stroke, width, dash},
                  {type:'circle', center:[lon,lat], radiusKm, fill, stroke},
                  {type:'ellipse', center:[lon,lat], semiMajorKm, semiMinorKm, angleDeg, fill, stroke},
                  {type:'point', coords:[lon,lat], r, fill, stroke, label, labelColor},
                  {type:'grid', values: Float64Array, lats, lons, color:(v)=>css, opacity},
                  {type:'text', coords:[lon,lat], text, color, size, dx, dy} ];
   map.draw(); map.on('click', ({lon,lat}) => ...); map.on('move', ...); map.setCenter([lon,lat]); map.setProjection('ortho'); map.setZoom(k); map.resetView();
   map.project([lon,lat]) -> [x,y] | null;  map.invert([x,y]) -> [lon,lat] | null */
(function (global) {
  const RE = 6378.137;
  function dest(lat, lon, brg, dKm) {
    const D2R = Math.PI / 180, d = dKm / RE, br = brg * D2R, p1 = lat * D2R, l1 = lon * D2R;
    const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(br));
    const l2 = l1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
    return [((l2 / D2R + 540) % 360) - 180, p2 / D2R];
  }
  class GeoMap {
    constructor(el, opts = {}) {
      this.el = el; this.opts = Object.assign({ projection: 'equirect', center: [20, 30], scale: null, interactive: true, graticule: true, land: true, labels: false, padding: 0 }, opts);
      this.layers = []; this.handlers = {};
      this.canvas = document.createElement('canvas'); this.canvas.style.display = 'block'; this.canvas.style.width = '100%'; this.canvas.style.height = '100%';
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; el.append(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.rotation = [-this.opts.center[0], -this.opts.center[1]];
      this.zoomK = 1;
      this.setProjection(this.opts.projection, false);
      this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(el);
      this.resize();
      if (this.opts.interactive) this._bindInteraction();
    }
    get theme() {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      return this.opts.theme || (dark ? { sea: '#0b1220', land: '#1d2a3d', border: '#2e405a', grat: 'rgba(255,255,255,0.06)', text: '#c9d2de', ocean2: '#0e1726' } : { sea: '#dfe8f0', land: '#f7f8f9', border: '#b9c4d0', grat: 'rgba(15,27,45,0.07)', text: '#3f4b5c', ocean2: '#d6e1ea' });
    }
    setProjection(name, redraw = true) {
      this.projName = name;
      if (name === 'ortho') this.proj = d3.geoOrthographic().clipAngle(90).rotate([this.rotation[0], this.rotation[1]]);
      else if (name === 'mercator') this.proj = d3.geoMercator().rotate([this.rotation[0], 0]).clipExtent(null);
      else this.proj = d3.geoEquirectangular().rotate([this.rotation[0], 0]);
      this.path = d3.geoPath(this.proj, this.ctx);
      this.fit(); if (redraw) this.draw();
    }
    fit() {
      const w = this.w || 800, h = this.h || 400;
      if (this.projName === 'ortho') { this.baseScale = Math.min(w, h) / 2 - 4; }
      else if (this.projName === 'mercator') { this.baseScale = w / (2 * Math.PI); }
      else { this.baseScale = Math.min(w / (2 * Math.PI), h / Math.PI); }
      this.proj.scale(this.baseScale * this.zoomK).translate([w / 2 + (this.tx || 0), h / 2 + (this.ty || 0)]);
      if (this.projName !== 'ortho') this.proj.center([0, this.projName === 'mercator' ? Math.max(-70, Math.min(70, -this.rotation[1])) : -this.rotation[1]]);
    }
    resize() {
      const r = this.el.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
      this.w = Math.max(50, r.width); this.h = Math.max(50, r.height);
      this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.fit(); this.draw();
    }
    setCenter(c, redraw = true) { this.rotation = [-c[0], -c[1]]; if (this.projName === 'ortho') this.proj.rotate(this.rotation); else this.proj.rotate([this.rotation[0], 0]); this.fit(); if (redraw) this.draw(); }
    setZoom(k, redraw = true) { this.zoomK = Math.max(0.5, Math.min(400, k)); this.fit(); if (redraw) this.draw(); }
    project(c) { const p = this.proj(c); if (!p) return null; if (this.projName === 'ortho') { const r = this.rotation; const d = d3.geoDistance(c, [-r[0], -r[1]]); if (d > Math.PI / 2) return null; } return p; }
    invert(xy) { const c = this.proj.invert(xy); if (!c || isNaN(c[0])) return null; if (this.projName === 'ortho') { const p = this.proj(c); if (!p || Math.hypot(p[0] - xy[0], p[1] - xy[1]) > 1) return null; } return c; }
    on(evt, fn) { (this.handlers[evt] = this.handlers[evt] || []).push(fn); return this; }
    emit(evt, data) { (this.handlers[evt] || []).forEach(f => f(data)); }
    _bindInteraction() {
      let drag = null, moved = false;
      this.canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, rot: [...this.rotation], tx: this.tx || 0, ty: this.ty || 0 }; moved = false; this.canvas.setPointerCapture(e.pointerId); });
      this.canvas.addEventListener('pointermove', e => {
        const rect = this.canvas.getBoundingClientRect(); const xy = [e.clientX - rect.left, e.clientY - rect.top];
        if (drag) {
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 3) moved = true;
          if (this.projName === 'ortho') { const k = 0.25 / this.zoomK; this.rotation = [drag.rot[0] + dx * k, Math.max(-90, Math.min(90, drag.rot[1] - dy * k))]; this.proj.rotate(this.rotation); }
          else { this.tx = drag.tx + dx; this.ty = drag.ty + dy; this.fit(); }
          this.draw();
        }
        const c = this.invert(xy); this.emit('move', c ? { lon: c[0], lat: c[1], x: xy[0], y: xy[1], event: e } : { lon: null, lat: null, x: xy[0], y: xy[1], event: e });
      });
      const end = e => { if (drag && !moved) { const rect = this.canvas.getBoundingClientRect(); const c = this.invert([e.clientX - rect.left, e.clientY - rect.top]); if (c) this.emit('click', { lon: c[0], lat: c[1], event: e }); } drag = null; };
      this.canvas.addEventListener('pointerup', end); this.canvas.addEventListener('pointercancel', () => drag = null);
      this.canvas.addEventListener('wheel', e => { e.preventDefault(); const rect = this.canvas.getBoundingClientRect(); const mx = e.clientX - rect.left, my = e.clientY - rect.top; const k0 = this.zoomK; const k1 = Math.max(0.5, Math.min(400, k0 * (e.deltaY < 0 ? 1.15 : 1 / 1.15))); if (this.projName !== 'ortho') { const cx = this.w / 2 + (this.tx || 0), cy = this.h / 2 + (this.ty || 0); this.tx = (this.tx || 0) + (mx - cx) * (1 - k1 / k0); this.ty = (this.ty || 0) + (my - cy) * (1 - k1 / k0); } this.zoomK = k1; this.fit(); this.draw(); }, { passive: false });
      this.canvas.style.cursor = 'crosshair';
    }
    resetView() { this.tx = 0; this.ty = 0; this.zoomK = 1; this.fit(); this.draw(); }
    draw() {
      const ctx = this.ctx, T = this.theme, w = this.w, h = this.h; ctx.clearRect(0, 0, w, h);
      // sea
      ctx.save(); ctx.beginPath(); this.path({ type: 'Sphere' }); ctx.fillStyle = T.sea; ctx.fill(); ctx.clip();
      if (this.opts.graticule) { ctx.beginPath(); this.path(d3.geoGraticule().step([15, 15])()); ctx.strokeStyle = T.grat; ctx.lineWidth = 1; ctx.stroke(); }
      if (this.opts.land && global.WORLD_GEO) { ctx.beginPath(); this.path(global.WORLD_GEO); ctx.fillStyle = T.land; ctx.fill(); ctx.strokeStyle = T.border; ctx.lineWidth = 0.6; ctx.stroke(); }
      for (const L of this.layers) this._drawLayer(L, ctx, T);
      ctx.restore();
      // sphere outline
      ctx.beginPath(); this.path({ type: 'Sphere' }); ctx.strokeStyle = T.border; ctx.lineWidth = 1; ctx.stroke();
      this.emit('draw', ctx);
    }
    _drawLayer(L, ctx, T) {
      if (L.hidden) return;
      ctx.save(); if (L.opacity != null) ctx.globalAlpha = L.opacity;
      switch (L.type) {
        case 'grid': {
          const nO = L.lons.length, dLat = L.lats.length > 1 ? L.lats[1] - L.lats[0] : 5, dLon = nO > 1 ? L.lons[1] - L.lons[0] : 5;
          for (let r = 0; r < L.lats.length; r++) for (let c = 0; c < nO; c++) { const v = L.values[r * nO + c]; if (v == null || isNaN(v)) continue; const la = L.lats[r], lo = L.lons[c]; const poly = { type: 'Polygon', coordinates: [[[lo - dLon / 2, la - dLat / 2], [lo - dLon / 2, la + dLat / 2], [lo + dLon / 2, la + dLat / 2], [lo + dLon / 2, la - dLat / 2], [lo - dLon / 2, la - dLat / 2]]] }; /* clockwise for d3-geo */ ctx.beginPath(); this.path(poly); ctx.fillStyle = L.color(v); ctx.fill(); }
          break; }
        case 'polygon': { ctx.beginPath(); this.path({ type: 'Polygon', coordinates: [this._closeRing(L.coords)] }); if (L.fill) { ctx.fillStyle = L.fill; ctx.fill(); } if (L.stroke) { ctx.strokeStyle = L.stroke; ctx.lineWidth = L.width || 1; if (L.dash) ctx.setLineDash(L.dash); ctx.stroke(); } break; }
        case 'line': { ctx.beginPath(); this.path({ type: 'LineString', coordinates: L.coords }); ctx.strokeStyle = L.stroke || T.text; ctx.lineWidth = L.width || 1.5; if (L.dash) ctx.setLineDash(L.dash); ctx.stroke(); break; }
        case 'circle': { const circ = d3.geoCircle().center(L.center).radius(L.radiusKm / RE * 180 / Math.PI).precision(2)(); ctx.beginPath(); this.path(circ); if (L.fill) { ctx.fillStyle = L.fill; ctx.fill(); } if (L.stroke) { ctx.strokeStyle = L.stroke; ctx.lineWidth = L.width || 1; if (L.dash) ctx.setLineDash(L.dash); ctx.stroke(); } break; }
        case 'ellipse': { const pts = []; for (let k = 0; k <= 72; k++) { const t = 2 * Math.PI * k / 72; const x = L.semiMajorKm * Math.cos(t), y = L.semiMinorKm * Math.sin(t); const a = (L.angleDeg || 0) * Math.PI / 180; const e = x * Math.cos(a) - y * Math.sin(a), n = x * Math.sin(a) + y * Math.cos(a); const d = Math.hypot(e, n); const brg = Math.atan2(e, n) * 180 / Math.PI; pts.push(dest(L.center[1], L.center[0], brg, d)); } ctx.beginPath(); this.path({ type: 'Polygon', coordinates: [this._closeRing(pts)] }); if (L.fill) { ctx.fillStyle = L.fill; ctx.fill(); } if (L.stroke) { ctx.strokeStyle = L.stroke; ctx.lineWidth = L.width || 1.2; ctx.stroke(); } break; }
        case 'point': { const p = this.project(L.coords); if (!p) break; ctx.beginPath(); ctx.arc(p[0], p[1], L.r || 4, 0, 2 * Math.PI); ctx.fillStyle = L.fill || '#e34948'; ctx.fill(); if (L.stroke) { ctx.strokeStyle = L.stroke; ctx.lineWidth = L.width || 1.5; ctx.stroke(); } if (L.label) { ctx.font = (L.size || 11) + 'px "Avenir Next","Segoe UI",system-ui,sans-serif'; ctx.fillStyle = L.labelColor || T.text; ctx.textBaseline = 'middle'; ctx.fillText(L.label, p[0] + (L.r || 4) + 4, p[1]); } break; }
        case 'text': { const p = this.project(L.coords); if (!p) break; ctx.font = (L.size || 11) + 'px "Avenir Next","Segoe UI",system-ui,sans-serif'; ctx.fillStyle = L.color || T.text; ctx.textAlign = L.align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(L.text, p[0] + (L.dx || 0), p[1] + (L.dy || 0)); break; }
        case 'marker': { const p = this.project(L.coords); if (!p) break; ctx.translate(p[0], p[1]); if (L.draw) L.draw(ctx, L); break; }
        case 'custom': { if (L.draw) L.draw(ctx, this); break; }
      }
      ctx.restore();
    }
    _closeRing(c) {
      if (c.length && (c[0][0] !== c[c.length - 1][0] || c[0][1] !== c[c.length - 1][1])) c = [...c, c[0]];
      // d3-geo expects clockwise exterior rings; a counter-clockwise ring would fill the whole sphere minus the polygon
      if (d3.geoArea({ type: 'Polygon', coordinates: [c] }) > 2 * Math.PI) c = [...c].reverse();
      return c;
    }
    destroy() { this._ro.disconnect(); this.canvas.remove(); }
  }
  // colour ramps (sequential blue; magnitude) and diverging helpers
  GeoMap.ramp = {
    blue: ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'],
    revisit(minutes, maxMin = 720) { const t = Math.max(0, Math.min(1, minutes / maxMin)); const steps = GeoMap.ramp.blue; return steps[Math.min(steps.length - 1, Math.floor(t * steps.length))]; },
    seq(t, steps) { steps = steps || GeoMap.ramp.blue; return steps[Math.max(0, Math.min(steps.length - 1, Math.floor(t * steps.length)))]; },
  };
  global.GeoMap = GeoMap;
})(window);
