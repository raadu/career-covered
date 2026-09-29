import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useOnClickOutside } from 'hooks/useOnClickOutside';

// Open/close state for a popup anchored to a trigger button and rendered
// in a portal (so it can escape the sidebar's stacking context). Closes on
// a press outside both the trigger and the panel, on Escape (returning focus
// to the trigger), and on resize, since the anchor position goes stale.
export function useAnchoredPopover<
  TTrigger extends HTMLElement = HTMLButtonElement,
>(getStyle: (triggerRect: DOMRect) => CSSProperties) {
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const triggerRef = useRef<TTrigger>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [refs] = useState(() => [triggerRef, panelRef]);
  const isOpen = style !== null;

  const close = useCallback(() => setStyle(null), []);
  useOnClickOutside(refs, close, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', close);
    };
  }, [isOpen, close]);

  const toggle = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (isOpen || !rect) return close();
    setStyle(getStyle(rect));
  };

  return { isOpen, style, triggerRef, panelRef, toggle, close };
}
