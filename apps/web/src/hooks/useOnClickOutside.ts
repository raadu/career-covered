import { useEffect, type RefObject } from 'react';

type ElementRef = RefObject<HTMLElement | null>;

// Accepts several refs so a trigger and a portaled popup (which lives
// outside the trigger's DOM subtree) can both count as "inside". Pass a
// stable array (module constant or useMemo) — a fresh array each render
// would re-subscribe the listeners every render.
export function useOnClickOutside(
  refs: ElementRef | readonly ElementRef[],
  onOutsideClick: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const refList = Array.isArray(refs) ? refs : [refs];
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const isInside = refList.some((ref) => ref.current?.contains(target));
      if (!isInside) onOutsideClick();
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [enabled, onOutsideClick, refs]);
}
