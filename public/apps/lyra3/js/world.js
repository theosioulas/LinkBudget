/* LYRA-3 simulator — coastline data.
   Loads the Natural-Earth-derived world outline shipped with ECharts 4 (a UMD script that calls
   echarts.registerMap) and decodes its quantised polygon encoding. Falls back to a graticule only. */
'use strict';
(function (S) {
  const W = S.world = { rings: [], ready: false, failed: false };
  const SRC = 'https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/js/world.js';

  const decodeRing = (str, off, scale) => {
    const out = new Float32Array(str.length);
    let px = off[0], py = off[1];
    for (let i = 0; i < str.length; i += 2) {
      let x = str.charCodeAt(i) - 64, y = str.charCodeAt(i + 1) - 64;
      x = (x >> 1) ^ (-(x & 1)); y = (y >> 1) ^ (-(y & 1));
      x += px; y += py; px = x; py = y;
      out[i] = x / scale; out[i + 1] = y / scale;
    }
    return out;
  };
  const addRing = pts => {
    let a = 180, b = 90, c = -180, d = -90;
    for (let i = 0; i < pts.length; i += 2) { a = Math.min(a, pts[i]); c = Math.max(c, pts[i]); b = Math.min(b, pts[i + 1]); d = Math.max(d, pts[i + 1]); }
    // unit-sphere vectors for the globe renderer
    const n = pts.length / 2, xyz = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
      const lo = pts[2 * k] * S.C.DEG, la = pts[2 * k + 1] * S.C.DEG, cl = Math.cos(la);
      xyz[3 * k] = cl * Math.cos(lo); xyz[3 * k + 1] = cl * Math.sin(lo); xyz[3 * k + 2] = Math.sin(la);
    }
    W.rings.push({ pts, xyz, bbox: [a, b, c, d] });
  };
  const ingest = geo => {
    const scale = geo.UTF8Scale || 1024;
    for (const f of geo.features) {
      const g = f.geometry;
      if (g.type === 'Polygon') g.coordinates.forEach((r, k) => addRing(decodeRing(r, g.encodeOffsets[k], scale)));
      else if (g.type === 'MultiPolygon') g.coordinates.forEach((poly, p) => poly.forEach((r, k) => addRing(decodeRing(r, g.encodeOffsets[p][k], scale))));
    }
  };

  W.load = () => new Promise(resolve => {
    const done = ok => { W.ready = ok; W.failed = !ok; S.emit('world', ok); resolve(ok); };
    try {
      const prev = window.echarts;
      window.echarts = { registerMap: (name, geo) => { if (name === 'world') { try { ingest(geo); } catch (e) { /* keep graticule */ } } } };
      const s = document.createElement('script');
      s.src = SRC; s.async = true;
      s.onload = () => { if (prev) window.echarts = prev; done(W.rings.length > 0); };
      s.onerror = () => { if (prev) window.echarts = prev; done(false); };
      document.head.appendChild(s);
      setTimeout(() => { if (!W.ready && !W.failed) done(W.rings.length > 0); }, 12000);
    } catch (e) { done(false); }
  });
})(window.SIM);
