/* TALOS-3 simulator — who is signed in on the RF Eye site. The site's Supabase session lives in
   this origin's localStorage; only accounts whose role is "admin" see the baseline-study tabs.
   Opened outside the site (no session), the viewer counts as a guest. */
'use strict';
window.RFEYE_ADMIN = (function () {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!/^sb-.+-auth-token$/.test(k)) continue;
      const s = JSON.parse(localStorage.getItem(k));
      if (s && s.user && s.user.app_metadata && s.user.app_metadata.role === 'admin') return true;
    }
  } catch (e) { /* storage unavailable */ }
  return false;
})();
