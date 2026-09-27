import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import {
  tooltipPosition,
  viewportNudge,
  type TooltipPosition,
  type TooltipSide,
} from 'components/common/tooltipPosition';

interface TooltipProps {
  label: string;
  side?: TooltipSide;
  className?: string;
  children: ReactNode;
}

const SIDE_CLASSES: Record<TooltipSide, string> = {
  right: '-translate-y-1/2',
  left: '-translate-y-1/2 -translate-x-full',
  bottom: '-translate-x-1/2',
};

// Portaled to document.body for the same reason as Modal/TableActions: the
// sidebar's z-10 stacking context and its nav's overflow-x-auto would
// otherwise clip or bury a tooltip rendered inside it.
const Tooltip = ({ label, side = 'right', className, children }: TooltipProps) => {
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  // The tooltip's width is only known once rendered, so the viewport clamp
  // is applied to the DOM directly before paint rather than via state.
  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!el) return;
    el.style.marginLeft = '0px';
    const nudge = viewportNudge(el.getBoundingClientRect(), window.innerWidth);
    el.style.marginLeft = `${nudge}px`;
  }, [position]);

  const show = (e: { currentTarget: HTMLElement }) =>
    setPosition(tooltipPosition(e.currentTarget.getBoundingClientRect(), side));
  const hide = () => setPosition(null);

  return (
    <div
      className={clsx('flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={hide}
      aria-describedby={position ? tooltipId : undefined}
    >
      {children}
      {position &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={{ top: position.top, left: position.left }}
            className={clsx(
              'fixed z-50 pointer-events-none whitespace-nowrap px-2 py-1 text-[11px] font-semibold shadow-md',
              'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
              SIDE_CLASSES[side],
            )}
          >
            {label}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Tooltip;
