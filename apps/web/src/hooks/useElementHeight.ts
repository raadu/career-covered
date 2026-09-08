import { useEffect, useRef, useState, type RefObject } from 'react';

// Tracks an element's live rendered height via ResizeObserver, so a sibling
// can match it exactly (including CSS transitions, content reflow, etc.)
// without hardcoding pixel values that silently drift out of sync.
export function useElementHeight<T extends HTMLElement>(): [
  RefObject<T | null>,
  number | null,
] {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setHeight(entries[0].contentRect.height);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return [ref, height];
}
