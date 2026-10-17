import type { ReactNode } from 'react';

const I = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export const Icon = {
  play: () => <I><path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none" /></I>,
  pause: () => <I><path d="M8 5v14M16 5v14" strokeWidth={2.6} /></I>,
  scenarios: () => <I><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /></I>,
  satellites: () => <I><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-30 12 12)" /></I>,
  payload: () => <I><rect x="9" y="8" width="6" height="8" rx="1" /><path d="M3 10h6M3 14h6M15 10h6M15 14h6" /></I>,
  terminal: () => <I><path d="M4 16h16l-2-6H6z" /><path d="M12 10V5M9 5l3-2 3 2" /><path d="M8 20h8" /></I>,
  coverage: () => <I><path d="M3 12c3-6 15-6 18 0-3 6-15 6-18 0z" /><circle cx="12" cy="12" r="2.5" /></I>,
  beamlab: () => <I><path d="M12 3l-6 15h12z" /><path d="M9 11h6" /></I>,
  settings: () => <I><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></I>,
  layers: () => <I><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></I>,
  target: () => <I><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></I>,
  globe: () => <I><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></I>,
  download: () => <I><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></I>,
  open: () => <I><path d="M4 7h6l2 2h8v9H4z" /></I>,
  report: () => <I><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h7M9 8h4" /></I>,
  close: () => <I><path d="M6 6l12 12M18 6L6 18" /></I>,
  chevronUp: () => <I><path d="M6 15l6-6 6 6" /></I>,
  chevronDown: () => <I><path d="M6 9l6 6 6-6" /></I>,
  run: () => <I><path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v4h4" /></I>,
  check: () => <I><path d="M5 12l5 5 9-10" /></I>,
  user: () => <I><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></I>,
  lock: () => <I><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></I>,
};
