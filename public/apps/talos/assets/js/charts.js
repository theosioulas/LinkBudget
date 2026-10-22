/* charts.js — small d3 chart helpers that follow the study's data-viz rules
   (one axis, thin marks, fixed categorical order, legend for ≥2 series, hover tooltips, table fallback).
   Series colours are taken from CSS tokens --s1..--s8 in order; pass {color} per series to override (e.g. band colours).
   API:
     Charts.bar(el, { title, data:[{label, value, color?, note?}], unit, horizontal:true|false, height, format })
     Charts.line(el, { title, series:[{name, color?, points:[[x,y],...]}], xLabel, yLabel, xLog, yLog, height, format, xFormat, markers })
     Charts.stack(el, { title, categories:[..], series:[{name, color?, values:[..]}], unit, height, horizontal })
     Charts.range(el, { title, data:[{label, lo, hi, color?}], unit, height })   // dumbbell / range bars
   Every chart re-renders on window resize and theme change. */
(function (global) {
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const SER = () => [1, 2, 3, 4, 5, 6, 7, 8].map(i => css('--s' + i));
  const FONT = '"Avenir Next","Segoe UI","Helvetica Neue",system-ui,sans-serif';
  const fmtDefault = v => (Math.abs(v) >= 1000 ? d3.format(',.0f')(v) : Math.abs(v) >= 10 ? d3.format('.1f')(v) : d3.format('.2~f')(v));

  function frame(el, opt) {
    el.classList.add('chart'); el.innerHTML = '';
    el.style.fontFamily = FONT;
    if (opt.title) { const t = document.createElement('div'); t.className = 'chart-title'; t.textContent = opt.title; t.style.cssText = 'font-weight:600;font-size:0.9rem;margin:0 0 .4rem;color:var(--ink)'; el.append(t); }
    const w = Math.max(240, el.clientWidth || 600), h = opt.height || 280;
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('height', h).style('display', 'block').style('overflow', 'visible');
    return { svg, w, h };
  }
  function tip() { return { show: (t, e) => global.showTip && global.showTip(t, e.clientX, e.clientY), hide: () => global.hideTip && global.hideTip() }; }
  function legend(el, items) {
    if (items.length < 2) return;
    const l = document.createElement('div'); l.className = 'legend';
    items.forEach(it => { const s = document.createElement('span'); s.style.setProperty('--c', it.color); s.textContent = it.name; l.append(s); });
    el.append(l);
  }
  function tableFallback(el, headers, rows) {
    const d = document.createElement('details'); d.style.marginTop = '.4rem'; d.className = 'chart-table';
    const s = document.createElement('summary'); s.textContent = 'Show data table'; s.style.fontSize = '.78rem'; d.append(s);
    const b = document.createElement('div'); b.className = 'body'; b.style.overflowX = 'auto';
    const t = document.createElement('table'); t.className = 'compact';
    t.innerHTML = '<thead><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map((c, i) => '<td' + (i ? ' class="num"' : '') + '>' + c + '</td>').join('') + '</tr>').join('') + '</tbody>';
    b.append(t); d.append(b); el.append(d);
  }

  function bar(el, opt) {
    const render = () => {
      const { svg, w, h } = frame(el, opt), T = tip(), f = opt.format || fmtDefault, horiz = opt.horizontal !== false && (opt.horizontal || opt.data.length > 6);
      const m = horiz ? { t: 6, r: 50, b: 20, l: Math.min(220, 8 + 6.5 * d3.max(opt.data, d => d.label.length)) } : { t: 10, r: 10, b: 40, l: 48 };
      const cols = SER();
      if (horiz) {
        const y = d3.scaleBand().domain(opt.data.map(d => d.label)).range([m.t, h - m.b]).padding(0.25);
        const x = d3.scaleLinear().domain([0, d3.max(opt.data, d => d.value) * 1.08]).nice().range([m.l, w - m.r]);
        svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(5).tickSize(-(h - m.t - m.b))).call(g => { g.selectAll('line').attr('stroke', css('--grid')); g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-3')).style('font-size', '10px'); });
        svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).tickSize(0)).call(g => { g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-2')).style('font-size', '11px'); });
        svg.selectAll('rect.bar').data(opt.data).join('rect').attr('class', 'bar').attr('x', x(0)).attr('y', d => y(d.label)).attr('height', y.bandwidth()).attr('width', d => Math.max(0, x(d.value) - x(0))).attr('rx', 3).attr('fill', (d, i) => d.color || cols[0])
          .on('mousemove', (e, d) => T.show(`${d.label}: ${f(d.value)} ${opt.unit || ''}${d.note ? ' — ' + d.note : ''}`, e)).on('mouseleave', T.hide);
        svg.selectAll('text.val').data(opt.data).join('text').attr('class', 'val').attr('x', d => x(d.value) + 4).attr('y', d => y(d.label) + y.bandwidth() / 2).attr('dy', '0.35em').attr('fill', css('--ink-2')).style('font-size', '10.5px').style('font-variant-numeric', 'tabular-nums').text(d => f(d.value));
      } else {
        const x = d3.scaleBand().domain(opt.data.map(d => d.label)).range([m.l, w - m.r]).padding(0.3);
        const y = d3.scaleLinear().domain([0, d3.max(opt.data, d => d.value) * 1.1]).nice().range([h - m.b, m.t]);
        svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(w - m.l - m.r))).call(g => { g.selectAll('line').attr('stroke', css('--grid')); g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-3')).style('font-size', '10px'); });
        svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).tickSize(0)).call(g => { g.select('.domain').attr('stroke', css('--axis')); g.selectAll('text').attr('fill', css('--ink-2')).style('font-size', '11px').call(wrap, x.bandwidth()); });
        svg.selectAll('rect.bar').data(opt.data).join('rect').attr('class', 'bar').attr('x', d => x(d.label)).attr('y', d => y(d.value)).attr('width', x.bandwidth()).attr('height', d => Math.max(0, y(0) - y(d.value))).attr('rx', 3).attr('fill', (d, i) => d.color || cols[0])
          .on('mousemove', (e, d) => T.show(`${d.label}: ${f(d.value)} ${opt.unit || ''}${d.note ? ' — ' + d.note : ''}`, e)).on('mouseleave', T.hide);
        svg.selectAll('text.val').data(opt.data).join('text').attr('class', 'val').attr('x', d => x(d.label) + x.bandwidth() / 2).attr('y', d => y(d.value) - 4).attr('text-anchor', 'middle').attr('fill', css('--ink-2')).style('font-size', '10.5px').style('font-variant-numeric', 'tabular-nums').text(d => f(d.value));
        if (opt.yLabel) svg.append('text').attr('x', m.l).attr('y', m.t - 2).attr('fill', css('--ink-3')).style('font-size', '10px').text(opt.yLabel);
      }
      tableFallback(el, ['Item', opt.unit || 'Value'], opt.data.map(d => [d.label, f(d.value)]));
    };
    render(); observe(el, render);
  }

  function wrap(text, width) {
    text.each(function () {
      const t = d3.select(this), words = t.text().split(/\s+/).reverse(); let word, line = [], ln = 0; const y = t.attr('y'), dy = parseFloat(t.attr('dy')) || 0;
      let tspan = t.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      while ((word = words.pop())) { line.push(word); tspan.text(line.join(' ')); if (tspan.node().getComputedTextLength() > width && line.length > 1) { line.pop(); tspan.text(line.join(' ')); line = [word]; tspan = t.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++ln * 1.1 + dy + 'em').text(word); } }
    });
  }

  function line(el, opt) {
    const render = () => {
      const { svg, w, h } = frame(el, opt), T = tip(), f = opt.format || fmtDefault, xf = opt.xFormat || fmtDefault, cols = SER();
      const m = { t: 12, r: 16, b: 40, l: 56 };
      const all = opt.series.flatMap(s => s.points);
      const x = (opt.xLog ? d3.scaleLog() : d3.scaleLinear()).domain(opt.xDomain || d3.extent(all, p => p[0])).range([m.l, w - m.r]);
      const y = (opt.yLog ? d3.scaleLog() : d3.scaleLinear()).domain(opt.yDomain || [opt.yLog ? d3.min(all, p => p[1]) : Math.min(0, d3.min(all, p => p[1])), d3.max(all, p => p[1])]).nice().range([h - m.b, m.t]);
      svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6, opt.yLog ? '~s' : undefined).tickSize(-(w - m.l - m.r))).call(g => { g.selectAll('line').attr('stroke', css('--grid')); g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-3')).style('font-size', '10px'); });
      svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(opt.xLog ? 8 : 7, opt.xLog ? '~s' : undefined)).call(g => { g.select('.domain').attr('stroke', css('--axis')); g.selectAll('line').attr('stroke', css('--axis')); g.selectAll('text').attr('fill', css('--ink-3')).style('font-size', '10px'); });
      if (opt.xLabel) svg.append('text').attr('x', (m.l + w - m.r) / 2).attr('y', h - 4).attr('text-anchor', 'middle').attr('fill', css('--ink-3')).style('font-size', '10.5px').text(opt.xLabel);
      if (opt.yLabel) svg.append('text').attr('transform', `translate(12,${(m.t + h - m.b) / 2}) rotate(-90)`).attr('text-anchor', 'middle').attr('fill', css('--ink-3')).style('font-size', '10.5px').text(opt.yLabel);
      if (opt.bands) opt.bands.forEach(b => { svg.append('rect').attr('x', x(b.x0)).attr('y', m.t).attr('width', x(b.x1) - x(b.x0)).attr('height', h - m.t - m.b).attr('fill', b.color).attr('opacity', 0.12); svg.append('text').attr('x', (x(b.x0) + x(b.x1)) / 2).attr('y', m.t + 11).attr('text-anchor', 'middle').attr('fill', css('--ink-3')).style('font-size', '9.5px').text(b.label); });
      if (opt.hlines) opt.hlines.forEach(l => { svg.append('line').attr('x1', m.l).attr('x2', w - m.r).attr('y1', y(l.y)).attr('y2', y(l.y)).attr('stroke', l.color || css('--ink-faint')).attr('stroke-dasharray', '4 3'); svg.append('text').attr('x', w - m.r).attr('y', y(l.y) - 3).attr('text-anchor', 'end').attr('fill', css('--ink-3')).style('font-size', '9.5px').text(l.label); });
      const lg = d3.line().x(p => x(p[0])).y(p => y(p[1])).defined(p => isFinite(p[1]) && (!opt.yLog || p[1] > 0));
      opt.series.forEach((s, i) => {
        const c = s.color || cols[i % 8];
        svg.append('path').datum(s.points).attr('d', lg).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 2).attr('stroke-dasharray', s.dash || null);
        if (opt.markers || s.markers) svg.selectAll(null).data(s.points).join('circle').attr('cx', p => x(p[0])).attr('cy', p => y(p[1])).attr('r', 3.5).attr('fill', c).attr('stroke', css('--surface')).attr('stroke-width', 1.5);
        const lastP = [...s.points].reverse().find(q => isFinite(q[0]) && isFinite(q[1]) && (!opt.yLog || q[1] > 0) && isFinite(y(q[1])));
        if (opt.labels !== false && opt.series.length <= 4 && lastP) { const p = lastP; const px = x(p[0]); const flip = px > w - m.r - 60; svg.append('text').attr('x', flip ? px - 6 : px + 5).attr('y', y(p[1]) - (flip ? 6 : 0)).attr('dy', '0.35em').attr('text-anchor', flip ? 'end' : 'start').attr('fill', c).style('font-size', '10.5px').style('font-weight', 600).style('paint-order', 'stroke').style('stroke', css('--surface')).style('stroke-width', '3px').text(s.name); }
      });
      // crosshair hover
      const guide = svg.append('line').attr('y1', m.t).attr('y2', h - m.b).attr('stroke', css('--ink-faint')).attr('stroke-dasharray', '3 3').style('display', 'none');
      svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', w - m.l - m.r).attr('height', h - m.t - m.b).attr('fill', 'transparent')
        .on('mousemove', e => { const [mx] = d3.pointer(e); const xv = x.invert(mx); guide.attr('x1', mx).attr('x2', mx).style('display', null); const parts = opt.series.map(s => { const p = s.points.reduce((a, b) => Math.abs(b[0] - xv) < Math.abs(a[0] - xv) ? b : a); return `${s.name}: ${f(p[1])}`; }); T.show(`${opt.xLabel ? opt.xLabel + ' ' : ''}${xf(xv)} — ${parts.join(' · ')}`, e); })
        .on('mouseleave', () => { guide.style('display', 'none'); T.hide(); });
      legend(el, opt.series.map((s, i) => ({ name: s.name, color: s.color || cols[i % 8] })));
      tableFallback(el, [opt.xLabel || 'x', ...opt.series.map(s => s.name)], (opt.series[0].points).map((p, k) => [xf(p[0]), ...opt.series.map(s => s.points[k] ? f(s.points[k][1]) : '')]));
    };
    render(); observe(el, render);
  }

  function stack(el, opt) {
    const render = () => {
      const { svg, w, h } = frame(el, opt), T = tip(), f = opt.format || fmtDefault, cols = SER();
      const horiz = opt.horizontal;
      const totals = opt.categories.map((c, i) => opt.series.reduce((a, s) => a + (s.values[i] || 0), 0));
      const m = horiz ? { t: 6, r: 50, b: 20, l: Math.min(200, 8 + 6.5 * d3.max(opt.categories, d => d.length)) } : { t: 10, r: 10, b: 40, l: 48 };
      const band = d3.scaleBand().domain(opt.categories).range(horiz ? [m.t, h - m.b] : [m.l, w - m.r]).padding(0.3);
      const lin = d3.scaleLinear().domain([0, d3.max(totals) * 1.08]).nice().range(horiz ? [m.l, w - m.r] : [h - m.b, m.t]);
      if (horiz) { svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(lin).ticks(5).tickSize(-(h - m.t - m.b))).call(g => { g.selectAll('line').attr('stroke', css('--grid')); g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-3')).style('font-size', '10px'); }); svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(band).tickSize(0)).call(g => { g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-2')).style('font-size', '11px'); }); }
      else { svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(lin).ticks(5).tickSize(-(w - m.l - m.r))).call(g => { g.selectAll('line').attr('stroke', css('--grid')); g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-3')).style('font-size', '10px'); }); svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(band).tickSize(0)).call(g => { g.select('.domain').attr('stroke', css('--axis')); g.selectAll('text').attr('fill', css('--ink-2')).style('font-size', '11px').call(wrap, band.bandwidth()); }); }
      opt.categories.forEach((c, i) => {
        let acc = 0;
        opt.series.forEach((s, k) => {
          const v = s.values[i] || 0; if (!v) return; const col = s.color || cols[k % 8];
          const r = svg.append('rect').attr('fill', col).attr('stroke', css('--surface')).attr('stroke-width', 2);
          if (horiz) r.attr('x', lin(acc)).attr('y', band(c)).attr('width', lin(acc + v) - lin(acc)).attr('height', band.bandwidth());
          else r.attr('x', band(c)).attr('y', lin(acc + v)).attr('width', band.bandwidth()).attr('height', lin(acc) - lin(acc + v));
          r.on('mousemove', e => T.show(`${c} — ${s.name}: ${f(v)} ${opt.unit || ''} (total ${f(totals[i])})`, e)).on('mouseleave', T.hide);
          acc += v;
        });
        const t = svg.append('text').attr('fill', css('--ink-2')).style('font-size', '10.5px').style('font-variant-numeric', 'tabular-nums').text(f(totals[i]));
        if (horiz) t.attr('x', lin(totals[i]) + 4).attr('y', band(c) + band.bandwidth() / 2).attr('dy', '0.35em'); else t.attr('x', band(c) + band.bandwidth() / 2).attr('y', lin(totals[i]) - 4).attr('text-anchor', 'middle');
      });
      legend(el, opt.series.map((s, k) => ({ name: s.name, color: s.color || cols[k % 8] })));
      tableFallback(el, ['Category', ...opt.series.map(s => s.name), 'Total'], opt.categories.map((c, i) => [c, ...opt.series.map(s => f(s.values[i] || 0)), f(totals[i])]));
    };
    render(); observe(el, render);
  }

  function range(el, opt) {
    const render = () => {
      const { svg, w, h } = frame(el, opt), T = tip(), f = opt.format || fmtDefault, cols = SER();
      const m = { t: 6, r: 60, b: 22, l: Math.min(240, 8 + 6.5 * d3.max(opt.data, d => d.label.length)) };
      const y = d3.scaleBand().domain(opt.data.map(d => d.label)).range([m.t, h - m.b]).padding(0.35);
      const x = (opt.xLog ? d3.scaleLog() : d3.scaleLinear()).domain([opt.xLog ? d3.min(opt.data, d => d.lo) / 1.5 : 0, d3.max(opt.data, d => d.hi) * 1.1]).nice().range([m.l, w - m.r]);
      svg.append('g').attr('transform', `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(6, opt.xLog ? '~s' : undefined).tickSize(-(h - m.t - m.b))).call(g => { g.selectAll('line').attr('stroke', css('--grid')); g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-3')).style('font-size', '10px'); });
      svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).tickSize(0)).call(g => { g.select('.domain').remove(); g.selectAll('text').attr('fill', css('--ink-2')).style('font-size', '11px'); });
      svg.selectAll('rect').data(opt.data).join('rect').attr('x', d => x(d.lo)).attr('y', d => y(d.label)).attr('width', d => Math.max(2, x(d.hi) - x(d.lo))).attr('height', y.bandwidth()).attr('rx', 3).attr('fill', d => d.color || cols[0])
        .on('mousemove', (e, d) => T.show(`${d.label}: ${f(d.lo)} – ${f(d.hi)} ${opt.unit || ''}${d.note ? ' — ' + d.note : ''}`, e)).on('mouseleave', T.hide);
      svg.selectAll('text.v').data(opt.data).join('text').attr('x', d => x(d.hi) + 5).attr('y', d => y(d.label) + y.bandwidth() / 2).attr('dy', '0.35em').attr('fill', css('--ink-2')).style('font-size', '10.5px').style('font-variant-numeric', 'tabular-nums').text(d => `${f(d.lo)}–${f(d.hi)}`);
      if (opt.xLabel) svg.append('text').attr('x', (m.l + w - m.r) / 2).attr('y', h - 2).attr('text-anchor', 'middle').attr('fill', css('--ink-3')).style('font-size', '10.5px').text(opt.xLabel);
      tableFallback(el, ['Item', 'Low', 'High'], opt.data.map(d => [d.label, f(d.lo), f(d.hi)]));
    };
    render(); observe(el, render);
  }

  const observers = new WeakMap();
  function observe(el, render) {
    // re-calling a Charts.* function on the same element replaces the stored render (calculator charts re-render on input)
    const prev = observers.get(el);
    if (prev) { prev.render = render; return; }
    const rec = { render };
    let w = el.clientWidth; const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 20) { w = el.clientWidth; rec.render(); } }); ro.observe(el);
    document.addEventListener('themechange', () => rec.render()); rec.ro = ro; observers.set(el, rec);
  }
  global.Charts = { bar, line, stack, range, css, SER };
})(window);
