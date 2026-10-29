/* TALOS-3 simulator — tabs taken from the 100–150 kg single-satellite baseline study. Each one is
   a page of its own (own styles and scripts), so it is shown in a frame and only fetched when first opened. */
'use strict';
(function (S) {
  const names = ['chain', 'scaling', 'hardware', 'library'];
  // Guests get neither the tabs nor the views, so #chain etc. falls back to Operations.
  if (!window.RFEYE_ADMIN) {
    names.forEach(name => { document.getElementById('tab-' + name)?.remove(); document.getElementById('view-' + name)?.remove(); });
    return;
  }
  names.forEach(name => {
    const onShow = () => {
      const sec = document.getElementById('view-' + name);
      if (!sec || sec.firstElementChild) return;
      const f = document.createElement('iframe');
      f.src = sec.dataset.src;
      f.title = document.getElementById('tab-' + name).textContent;
      sec.appendChild(f);
    };
    S.views[name] = { onShow };
  });
})(window.SIM);
