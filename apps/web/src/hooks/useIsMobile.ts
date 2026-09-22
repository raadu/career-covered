import { useEffect, useState } from 'react';

// Below md (768px) — phones only. Tablet and up keep the table/grid toggle.
const MOBILE_QUERY = '(max-width: 767px)';

function getIsMobile(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia
    ? window.matchMedia(MOBILE_QUERY).matches
    : false;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
