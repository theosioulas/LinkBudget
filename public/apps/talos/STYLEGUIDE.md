# TALOS study site — build guide for page authors

This is a static, offline-capable web application opened from a Google Drive folder (file://). No build step, no CDN, no fetch() of JSON (file:// blocks it) — all data is loaded as `<script>` files that set `window.*` globals.

## Page skeleton (copy exactly; adjust `data-root` and paths for the folder depth)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Antenna trade study — TALOS study</title>
<link rel="stylesheet" href="../assets/css/app.css">
<link rel="stylesheet" href="../assets/js/vendor/katex/katex.min.css">
</head>
<body>
<div class="content">            <!-- add class "wide" for full-width pages (simulators, console) -->
  <header class="page-head">
    <div class="kicker"><b>02 Technical understanding</b> · Antennas</div>
    <h1>Antenna trade study</h1>
    <p class="lead">One-paragraph statement of what this page answers and the bottom line.</p>
    <div class="meta"><span>Baseline: TALOS-1 v0.3</span><span>Sources: research notes 02, 03</span></div>
  </header>

  <h2>Section</h2>
  <p>Body text …</p>
  …
  <h2>Sources</h2>
  <div class="refs"><ol id="refs"></ol></div>
</div>

<script src="../assets/js/vendor/d3.v7.min.js"></script>
<script src="../assets/js/vendor/katex/katex.min.js"></script>
<script src="../assets/js/vendor/katex/auto-render.min.js"></script>
<script src="../assets/data/baseline.js"></script>
<script src="../assets/data/components.js"></script>   <!-- only the data files the page uses -->
<script src="../assets/data/emitters.js"></script>
<script src="../assets/data/references.js"></script>
<script src="../assets/js/orbit.js"></script>           <!-- when orbital / RF maths is needed -->
<script src="../assets/js/charts.js"></script>          <!-- when charts are drawn -->
<script src="../assets/data/world.js"></script>         <!-- + geo.js when a map is drawn -->
<script src="../assets/js/geo.js"></script>
<script src="../assets/js/app.js" data-root="../"></script>  <!-- ALWAYS LAST: builds the shell -->
<script>
  // page logic — runs after app.js has built the shell (scripts execute in order; app.js mounts on DOMContentLoaded or immediately)
</script>
</body>
</html>
```

`app.js` wraps `.content` with the sidebar, top bar (breadcrumbs, prev/next) and an auto-generated "On this page" TOC from `h2`/`h3` (needs ≥3 headings; otherwise the reading column stays centred without it). It also initialises tabs, sortable tables, tooltips, `<details>` and KaTeX. The sitemap lives in `app.js` (`SITEMAP`) — page file names must match it.

## Writing rules
- Audience: payload engineers, sales, software developers, management. Lead with the conclusion, then evidence. Use real numbers with units and say where they come from.
- Cite sources with `<sup class="ref"><a href="#ref-R3-2">[R3-2]</a></sup>` style markers. Reference ids are `R<file>-<n>`: R1 = operators landscape note, R2 = supplier catalogue, R3 = payload engineering, R4 = use cases/services/ground, R5 = risks/programmatics. `window.REFERENCES` (references.js) has `{id, title, urls}` — at the bottom of the page build the Sources list with the helper below so the links are real:
  ```js
  function renderRefs(ids){ const ol=document.getElementById('refs'); ids.forEach(id=>{ const r=REFERENCES.find(x=>x.id===id); if(!r) return; const li=document.createElement('li'); li.id='ref-'+id; li.innerHTML=`<b>[${id}]</b> ${r.title} — ${r.urls.map(u=>`<a href="${u}" target="_blank" rel="noopener">${u.replace(/^https?:\/\//,'').slice(0,70)}</a>`).join(' · ')}`; ol.append(li); }); }
  ```
  Only cite ids that exist in references.js (check with `REFERENCES.some(r=>r.id===id)`). The research notes in `/home/claude/sigint/research/*.md` carry the [n] numbers inline, so the mapping is direct (e.g., "[3]" in 03_payload_engineering.md → `R3-3`).
- Flag estimates: use `<span class="tag">est.</span>` or write "(est.)" exactly as the research does. Never upgrade an estimate to a fact.
- Prose is serif body; headings/UI are sans — that is automatic. Keep paragraphs ≤ 72ch (automatic max-width). Use lists only for scannable content, tables for comparisons.
- No decorative numbering, no ALL-CAPS eyebrows, no emoji. Figures get a `<figcaption>` that states what to see, not just a title.
- Consistent numbers: use `BASELINE` (baseline.js) and `COMPONENTS` (components.js) values rather than retyping — e.g. `BASELINE.orbit.altKm`. If a page computes a budget, compute it from the data at load time.

## Components (CSS classes in app.css)
- Layout: `.grid.c2|c3|c4`, `.card`, `.kpi` (`<div class="kpi"><div class="v">4–6<small>passes/day</small></div><div class="l">Athens, 53° orbit</div><div class="d">optional detail</div></div>`)
- Callouts: `.callout` + `.warn|.risk|.ok|.note|.decision` with `<div class="t">Title</div><p>…</p>`
- Tags: `.tag`, `.tag.ok|warn|critical|accent`, `.band-chip.uhf|l|s|c|x|ku` (`<span class="band-chip s">S</span>`)
- Tables: wrap in `<div class="table-wrap">`; `th[data-sort="num|str"]` makes a column sortable; `td.num` right-aligns; `table.compact`
- Tabs: `<div class="tabs"><div class="tablist"><button data-tab="a" aria-selected="true">A</button><button data-tab="b">B</button></div><div class="tabpanel" data-tab="a">…</div><div class="tabpanel" data-tab="b">…</div></div>`
- Collapsibles: `<details><summary>Title</summary> …content… </details>` (app.js wraps content in `.body`)
- Calculators: `<div class="panel"><h3>…</h3><div class="controls"><div class="ctl"><label>Altitude <output for="alt">530</output> km</label><input type="range" id="alt" min="400" max="700" step="10" value="530"></div>…</div><div class="readout"><div><div class="k">Footprint radius</div><div class="v" id="r1">—</div></div></div></div>`; bind with `bindRange('alt', v => recompute(), v => v + ' km')`.
- Timeline (true sequences only): `<ul class="timeline"><li><div class="when">2030</div><div class="what">Launch</div><p>…</p></li></ul>`
- Risk heat: `.heat` grid (see risks page spec)
- Tooltips: any element with `data-tip="…"`.
- Diagrams: inline SVG inside `<figure class="diagram">…<figcaption>…</figcaption></figure>`; use the SVG classes `.lbl .lbl.s .lbl.xs .box .box.hi .wire .wire.rf .wire.data .wire.pwr .wire.time .grid-line .axis-line` so colours follow the theme. Use `viewBox` and no fixed width. Keep text ≥ 10 px at the design size. Band colours in SVG: `fill="var(--band-s)"` etc. Draw the real mechanism (signal flow, geometry), not decoration.

## Shared JS APIs
- `U` (app.js): `U.fmt(n,d)`, `U.si(n,unit)`, `U.dB(x)`, `U.lin(db)`, `U.css('--band-l')`, `U.bandColor('l')`, `U.el(tag, attrs, ...children)`; `bindRange(id, cb, fmt)`; `showTip(text,x,y)`, `hideTip()`; `isDark()`, `toggleTheme()`; `document.addEventListener('themechange', …)`.
- `ORB` (orbit.js): `ORB.makeOrbit({alt, inc, raan, ta, epoch, name})`, `ORB.stateEcef(orb, date)` → `{r, v, lat, lon, alt}`, `ORB.groundTrack(orb, t0, durationS, stepS)` → `[[lon,lat,t]…]`, `ORB.footprintRadiusKm(alt, minEl)`, `ORB.slantRange(alt, el)`, `ORB.nadirAngle(alt, el)`, `ORB.period(a)`, `ORB.ssoInclination(alt)`, `ORB.walker(T,P,F,alt,inc,epoch)`, `ORB.cluster({alt,inc,raan,ta,name}, N, alongKm, crossKm, epoch)`, `ORB.passes(orb, lat, lon, altKm, t0, durationS, minEl, stepS)`, `ORB.siteStats(orbits, lat, lon, {durationS,minEl,t0})`, `ORB.coverageGrid(orbits, {dLat,dLon,stepS,durationS,minEl,t0})` → `{lats, lons, nO, revisitMax[], revisitMean[], accesses[]}` (minutes), `ORB.geoAccuracy(lat, lon, satStates, {sigmaT, sigmaF, f0, useTdoa, useFdoa, prob})` → `{cov, ellipse:{semiMajor, semiMinor, angleDeg, cep}}` (km), `ORB.doppler(lat, lon, satState, f0Hz)`, `ORB.lopGrid(sats, [i,j], lat, lon, spanDeg, n, f0)` (TDOA/FDOA residual grids for contouring with `d3.contours`), `ORB.eclipseFraction(orb, date)`, `ORB.lookAngles(lat, lon, alt, satEcef)`.
  `ORB.RF`: `sigmaTdoaStein/sigmaFdoaStein` (Stein form as in research 03), `fspl(dKm, fMHz)`, `kTB(bHz, T)` (dBm), `sensitivity(bHz, nfDb, snrDb)`, `rxPower(eirpDbm, dKm, fMHz, gRxDbi, lossDb)`, `apertureGain(diamM, fMHz, eff)`, `beamwidth(diamM, fMHz)`, `helixGain(turns, fMHz)`, `sigmaTdoa(bHz, tS, snrLin)` (s), `sigmaFdoa(bHz, tS, snrLin)` (Hz), `wavelength(fMHz)` (m).
- `GeoMap` (geo.js): `new GeoMap(el, {projection:'equirect'|'ortho'|'mercator', center:[lon,lat], interactive:true})`; set `map.layers = [...]` with layer types `line|polygon|circle|ellipse|point|text|grid|custom` (see geo.js header) then `map.draw()`; `map.on('click', ({lon,lat})=>…)`, `map.on('move', …)`; `map.setProjection('ortho')`, `map.setCenter([lon,lat])`, `map.resetView()`. Give the container an explicit height. Polygon rings are auto-oriented. `GeoMap.ramp.revisit(minutes, maxMin)` for sequential colours.
- `Charts` (charts.js): `Charts.bar(el,{title,data:[{label,value,color?,note?}],unit,horizontal,height,format})`, `Charts.line(el,{title,series:[{name,color?,points:[[x,y]…],dash?}],xLabel,yLabel,xLog,yLog,xDomain,yDomain,bands:[{x0,x1,color,label}],hlines:[{y,label,color}],markers})`, `Charts.stack(el,{title,categories,series:[{name,values,color?}],unit,horizontal})`, `Charts.range(el,{title,data:[{label,lo,hi,color?,note?}],unit,xLog,xLabel})`. Charts re-render on resize/theme and include a data-table fallback. Use band colours (`U.bandColor('x')`) when series are bands; otherwise leave default series colours (fixed order).
- Data globals: `BASELINE`, `COMPONENTS`, `SUBSYSTEMS`, `LAYERS`, `IFACE_TYPES` (components.js); `EMITTERS`, `EMITTER_GROUPS`; `RISKS`; `SUPPLIERS` (categories A–N with items), `OPERATORS_TABLE`; `COST_ELEMENTS`, `COST_SCENARIOS`, `COMPARATORS`, `PHASES`, `LONG_LEAD`, `GATES`, `ROADMAP`, `HEADCOUNT`, `BUILD_VS_BUY`, `PATHFINDER_OPTIONS`, `USECASES`, `CUSTOMERS`, `PRODUCTS`, `KPIS` (programmatics.js); `REFERENCES`; `WORLD_GEO`.

## Maths
Write equations with KaTeX delimiters: inline `\( P_r = EIRP - L_{fs} + G_r \)`, display `$$ \sigma_\tau = \frac{1}{\beta\sqrt{BT\gamma}} $$`. Auto-render runs on page load.

## Quality floor
- Opens from file:// with no console errors (test: `node /home/claude/sigint/tools/shot.js <page.html> <out.png> 1400 900 1`).
- Works at 390 px width (no horizontal scroll), light and dark theme (toggle in sidebar), keyboard-focusable controls.
- Every chart/diagram has a caption; every table of numbers has units; every claim that comes from research has a reference marker.
- No lorem ipsum, no placeholders, no "TBD" — if something is unknown, say it is unknown and why.
