/* SIGINT LEO Constellation Study — shared shell
   Usage: <script src="../assets/js/app.js" data-root="../"></script>
   The script builds the sidebar from SITEMAP, breadcrumbs, the on-page TOC,
   theme toggle, tabs, sortable tables, tooltips and KaTeX rendering. */
(function () {
  const me = document.currentScript;
  const ROOT = (me && me.getAttribute('data-root')) || './';
  // safe stubs until the tooltip layer mounts
  window.showTip = window.showTip || function () {}; window.hideTip = window.hideTip || function () {};

  const SITEMAP = [
    { idx: '', title: 'Overview', pages: [
      { href: 'index.html', title: 'Study hub' },
      { href: 'executive_summary.html', title: 'Executive summary' },
      { href: 'how_to_use.html', title: 'How to use this study' },
    ]},
    { idx: '01', title: 'Research & landscape', dir: '01_Research_Landscape/', pages: [
      { href: 'index.html', title: 'State of the art' },
      { href: 'operators.html', title: 'Operators & programmes' },
      { href: 'suppliers.html', title: 'Supplier catalogue' },
      { href: 'market_regulatory.html', title: 'Market, customers & regulation' },
      { href: 'lessons_learned.html', title: 'Lessons learned' },
      { href: 'references.html', title: 'References' },
    ]},
    { idx: '02', title: 'Technical understanding', dir: '02_Technical_Understanding/', pages: [
      { href: 'index.html', title: 'System architecture' },
      { href: 'payload_explorer.html', title: 'Payload explorer (exploded view)' },
      { href: 'emitters.html', title: 'Target emitters & detectability' },
      { href: 'antennas.html', title: 'Antenna trade study' },
      { href: 'rf_chain.html', title: 'RF chain & digitiser' },
      { href: 'processing_data.html', title: 'On-board processing & data' },
      { href: 'geolocation.html', title: 'Geolocation theory' },
      { href: 'bus.html', title: 'Bus subsystems' },
      { href: 'budgets.html', title: 'Mass, power, link & data budgets' },
      { href: 'environment.html', title: 'Environment, radiation & EMC' },
      { href: 'risks.html', title: 'Risk register' },
      { href: 'roadmap_cost.html', title: 'Roadmap, cost & schedule' },
    ]},
    { idx: '03', title: 'Scenarios & services', dir: '03_Scenarios_Services/', pages: [
      { href: 'index.html', title: 'Concept of operations' },
      { href: 'use_cases.html', title: 'Use cases' },
      { href: 'single_vs_constellation.html', title: 'Single satellite vs constellation' },
      { href: 'coverage_sim.html', title: 'Orbit & coverage simulator' },
      { href: 'geolocation_sim.html', title: 'TDOA / FDOA simulator' },
      { href: 'collection_planning.html', title: 'Collection planning & data flow' },
      { href: 'products_services.html', title: 'Products, services & pricing' },
      { href: 'ew_database.html', title: 'EW database & signature catalogue' },
    ]},
    { idx: '04', title: 'Service demo', dir: '04_Service_Demo/', pages: [
      { href: 'index.html', title: 'Operations console (demo)' },
      { href: 'ground_segment.html', title: 'Ground segment assumptions' },
      { href: 'software_architecture.html', title: 'Software architecture' },
    ]},
    { idx: '05', title: 'Orbit study', dir: '05_Orbit_Study/', pages: [
      { href: 'index.html', title: 'How many satellites? (answer finder)' },
      { href: 'templates.html', title: 'Constellation templates' },
      { href: 'orbit_selection.html', title: 'Choosing the orbit' },
    ]},
  ];
  window.SITEMAP = SITEMAP;
  window.SITE_ROOT = ROOT;

  // ---- locate current page
  const path = location.pathname.replace(/\\/g, '/');
  const parts = path.split('/');
  const file = parts.pop() || 'index.html';
  const dirName = (parts.pop() || '') + '/';
  let current = null;
  SITEMAP.forEach(sec => sec.pages.forEach(p => {
    const d = sec.dir || '';
    if (p.href === file && ((d === '' && !/^0[1-4]_/.test(dirName)) || d === dirName)) current = { sec, p };
  }));

  // ---- theme
  const themeKey = 'sigint-theme';
  function applyTheme(t) { if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  let saved = null; try { saved = localStorage.getItem(themeKey); } catch (e) {}
  if (saved) applyTheme(saved);
  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    applyTheme(next); try { localStorage.setItem(themeKey, next); } catch (e) {}
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  }
  window.toggleTheme = toggleTheme;
  window.isDark = () => document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);

  // ---- build shell
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (k === 'class') el.className = attrs[k]; else if (k.startsWith('on')) el.addEventListener(k.slice(2), attrs[k]); else if (attrs[k] != null) el.setAttribute(k, attrs[k]); }
    kids.flat().forEach(k => { if (k == null) return; el.append(k.nodeType ? k : document.createTextNode(String(k))); });
    return el;
  }
  const MARK = '<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 16c4-9 20-9 24 0" fill="none" stroke="var(--band-uhf)" stroke-width="1.8"/><path d="M7 20c3.5-6 14.5-6 18 0" fill="none" stroke="var(--band-s)" stroke-width="1.8"/><path d="M10.5 24c1.8-3 9.2-3 11 0" fill="none" stroke="var(--band-x)" stroke-width="1.8"/><circle cx="16" cy="12" r="1.8" fill="currentColor"/></svg>';

  function buildSidebar() {
    const side = h('nav', { class: 'sidebar', 'aria-label': 'Study navigation' });
    const brand = h('a', { class: 'brand', href: ROOT + 'index.html' });
    brand.innerHTML = MARK + '<span>SIGINT LEO constellation<small>Feasibility &amp; engineering study</small></span>';
    side.append(brand);
    const tools = h('div', { class: 'tools' },
      h('button', { class: 'small', onclick: toggleTheme, title: 'Toggle light / dark' }, 'Theme'),
      h('button', { class: 'small', onclick: () => window.print(), title: 'Print this page' }, 'Print'));
    side.append(tools);
    SITEMAP.forEach(sec => {
      const s = h('div', { class: 'nav-section' });
      s.append(h('div', { class: 'nav-title' }, h('span', { class: 'idx' }, sec.idx || '—'), sec.title));
      const ul = h('ul');
      sec.pages.forEach(p => {
        const a = h('a', { href: ROOT + (sec.dir || '') + p.href }, p.title);
        if (current && current.p === p) a.setAttribute('aria-current', 'page');
        ul.append(h('li', null, a));
      });
      s.append(ul); side.append(s);
    });
    return side;
  }

  function buildTopbar() {
    const crumbs = h('div', { class: 'crumbs' });
    crumbs.append(h('a', { href: ROOT + 'index.html' }, 'Study'));
    if (current) {
      if (current.sec.dir) { crumbs.append(h('span', { class: 'sep' }, '/')); crumbs.append(h('a', { href: ROOT + current.sec.dir + 'index.html' }, current.sec.title)); }
      crumbs.append(h('span', { class: 'sep' }, '/')); crumbs.append(h('span', null, current.p.title));
    }
    const menu = h('button', { class: 'menu-btn small', 'aria-label': 'Open navigation', onclick: () => document.querySelector('.sidebar').classList.toggle('open') }, 'Menu');
    const nav = h('div', { class: 'ui small muted' });
    // prev / next
    if (current) {
      const flat = []; SITEMAP.forEach(sec => sec.pages.forEach(p => flat.push({ sec, p })));
      const i = flat.findIndex(x => x.p === current.p);
      if (i > 0) nav.append(h('a', { href: ROOT + (flat[i-1].sec.dir||'') + flat[i-1].p.href, title: flat[i-1].p.title }, '← Previous'));
      if (i > 0 && i < flat.length - 1) nav.append(document.createTextNode('   '));
      if (i < flat.length - 1) nav.append(h('a', { href: ROOT + (flat[i+1].sec.dir||'') + flat[i+1].p.href, title: flat[i+1].p.title }, 'Next →'));
    }
    return h('div', { class: 'topbar' }, menu, crumbs, nav);
  }

  function buildToc(content) {
    const heads = content.querySelectorAll('h2, h3');
    if (heads.length < 3) return null;
    const toc = h('aside', { class: 'toc', 'aria-label': 'On this page' }, h('div', { class: 'toc-title' }, 'On this page'));
    const ul = h('ul');
    heads.forEach((hd, i) => {
      if (!hd.id) hd.id = 'sec-' + i + '-' + hd.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
      ul.append(h('li', { class: hd.tagName.toLowerCase() }, h('a', { href: '#' + hd.id }, hd.textContent)));
    });
    toc.append(ul);
    // scroll spy
    const links = [...ul.querySelectorAll('a')];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); const l = links.find(l => l.getAttribute('href') === '#' + e.target.id); if (l) l.classList.add('active'); } });
    }, { rootMargin: '-10% 0px -80% 0px' });
    heads.forEach(hd => obs.observe(hd));
    return toc;
  }

  function mount() {
    const content = document.querySelector('.content');
    if (!content) return;
    const wide = content.classList.contains('wide') || document.body.classList.contains('wide');
    const page = h('div', { class: 'page' + (wide ? ' wide' : '') });
    content.parentNode.insertBefore(page, content);
    page.append(content);
    if (!wide) { const toc = buildToc(content); if (toc) page.append(toc); else page.classList.add('no-toc'); }
    const main = h('main', { class: 'main' }, buildTopbar(), page);
    const app = h('div', { class: 'app' }, buildSidebar(), main);
    document.body.prepend(app);
    keepSidebarScroll(app.querySelector('.sidebar'));
    // move stray elements that follow content (e.g., tooltip divs) stay in body
    document.addEventListener('click', e => { const sb = document.querySelector('.sidebar'); if (sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('.menu-btn')) sb.classList.remove('open'); });
    initTabs(); initSortable(); initTooltips(); initDetailsBodies(); renderMath();
  }

  // ---- sidebar scroll survives page-to-page navigation
  const sideKey = 'sigint-sidebar-scroll';
  function keepSidebarScroll(side) {
    let y = null; try { y = sessionStorage.getItem(sideKey); } catch (e) {}
    if (y != null) side.scrollTop = +y;
    const cur = side.querySelector('[aria-current="page"]');
    if (cur) {
      const r = cur.getBoundingClientRect(), s = side.getBoundingClientRect();
      if (r.top < s.top || r.bottom > s.bottom) side.scrollTop += r.top - s.top - (s.height - r.height) / 2;
    }
    const save = () => { try { sessionStorage.setItem(sideKey, side.scrollTop); } catch (e) {} };
    side.addEventListener('click', e => { if (e.target.closest('a')) save(); });
    addEventListener('pagehide', save);
  }

  // ---- tabs: <div class="tabs"><div class="tablist"><button data-tab="a">..</button></div><div class="tabpanel" data-tab="a">..</div></div>
  function initTabs() {
    document.querySelectorAll('.tabs').forEach(t => {
      const btns = [...t.querySelectorAll('.tablist button')];
      const panels = [...t.querySelectorAll(':scope > .tabpanel')];
      function show(id) {
        btns.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false'));
        panels.forEach(p => { p.hidden = p.dataset.tab !== id; });
        t.dispatchEvent(new CustomEvent('tabchange', { detail: id }));
      }
      btns.forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
      show((btns.find(b => b.getAttribute('aria-selected') === 'true') || btns[0]).dataset.tab);
    });
  }

  // ---- sortable tables: <th data-sort="num|str">
  function initSortable() {
    document.querySelectorAll('table').forEach(tbl => {
      const ths = tbl.querySelectorAll('thead th[data-sort]');
      ths.forEach((th, idx) => th.addEventListener('click', () => {
        const type = th.dataset.sort; const asc = !th.classList.contains('asc');
        ths.forEach(x => x.classList.remove('asc', 'desc')); th.classList.add(asc ? 'asc' : 'desc');
        const tb = tbl.tBodies[0]; const rows = [...tb.rows];
        const col = [...th.parentNode.children].indexOf(th);
        rows.sort((a, b) => {
          let va = a.cells[col] ? (a.cells[col].dataset.v ?? a.cells[col].textContent.trim()) : '';
          let vb = b.cells[col] ? (b.cells[col].dataset.v ?? b.cells[col].textContent.trim()) : '';
          if (type === 'num') { va = parseFloat(String(va).replace(/[^0-9.\-eE]/g, '')) || 0; vb = parseFloat(String(vb).replace(/[^0-9.\-eE]/g, '')) || 0; return asc ? va - vb : vb - va; }
          return asc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
        });
        rows.forEach(r => tb.append(r));
      }));
    });
  }

  // ---- tooltips: any element with data-tip
  function initTooltips() {
    const tip = h('div', { class: 'tip', role: 'tooltip' }); document.body.append(tip);
    let cur = null;
    function show(el) { tip.textContent = el.dataset.tip; tip.classList.add('on'); cur = el; }
    function move(e) { if (!cur) return; const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8); const y = Math.min(e.clientY + 14, innerHeight - tip.offsetHeight - 8); tip.style.left = x + 'px'; tip.style.top = y + 'px'; }
    document.addEventListener('mouseover', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) { show(el); move(e); } });
    document.addEventListener('mouseout', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el && el === cur) { tip.classList.remove('on'); cur = null; } });
    document.addEventListener('mousemove', move);
    window.showTip = (text, x, y) => { tip.textContent = text; tip.classList.add('on'); tip.style.left = Math.min(x + 14, innerWidth - 300) + 'px'; tip.style.top = (y + 14) + 'px'; cur = null; };
    window.hideTip = () => tip.classList.remove('on');
  }

  function initDetailsBodies() {
    document.querySelectorAll('details').forEach(d => {
      if (d.querySelector(':scope > .body')) return;
      const body = h('div', { class: 'body' });
      [...d.childNodes].forEach(n => { if (n.tagName !== 'SUMMARY') body.append(n); });
      d.append(body);
    });
  }

  function renderMath() {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.querySelector('.content') || document.body, {
        delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }, { left: '\\[', right: '\\]', display: true }],
        throwOnError: false
      });
    }
  }

  // ---- utilities shared by pages
  const U = {
    fmt(n, d = 1) { if (n == null || !isFinite(n)) return '—'; const a = Math.abs(n); if (a >= 1e9) return (n / 1e9).toFixed(d) + ' G'; if (a >= 1e6) return (n / 1e6).toFixed(d) + ' M'; if (a >= 1e3) return (n / 1e3).toFixed(d) + ' k'; if (a < 1 && a > 0) return n.toPrecision(2); return n.toFixed(d); },
    si(n, unit = '', d = 2) { if (n == null || !isFinite(n)) return '—'; const a = Math.abs(n); const p = [[1e12,'T'],[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p']]; for (const [v, s] of p) if (a >= v) return (n / v).toFixed(d) + ' ' + s + unit; return n.toExponential(1) + ' ' + unit; },
    dB(x) { return 10 * Math.log10(x); },
    lin(db) { return Math.pow(10, db / 10); },
    dBm2W(dbm) { return Math.pow(10, (dbm - 30) / 10); },
    W2dBm(w) { return 10 * Math.log10(w) + 30; },
    clamp(x, a, b) { return Math.max(a, Math.min(b, x)); },
    bandOf(fMHz) { if (fFreqHelper(fMHz) === null) return null; return fFreqHelper(fMHz); },
    bandColor(b) { return getComputedStyle(document.documentElement).getPropertyValue('--band-' + b.toLowerCase()).trim(); },
    css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); },
    el: h,
  };
  function fFreqHelper(f) { if (f < 1000) return 'uhf'; if (f < 2000) return 'l'; if (f < 4000) return 's'; if (f < 8000) return 'c'; if (f < 12000) return 'x'; return 'ku'; }
  window.U = U;
  // range input helper: binds <input type=range id> to <output for=id> and callback
  window.bindRange = function (id, cb, fmt) {
    const inp = document.getElementById(id); if (!inp) return;
    const out = document.querySelector('output[for="' + id + '"]');
    const upd = () => { if (out) out.textContent = fmt ? fmt(parseFloat(inp.value)) : inp.value; if (cb) cb(parseFloat(inp.value)); };
    inp.addEventListener('input', upd); upd();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
