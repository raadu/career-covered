export type TooltipSide = 'right' | 'bottom' | 'left';

export interface TooltipPosition {
  top: number;
  left: number;
}

const GAP_PX = 6;
const VIEWPORT_MARGIN_PX = 4;

// Horizontal shift (px) that pulls a rendered tooltip back inside the
// viewport — e.g. a bottom tooltip under the phone top bar's right-most
// hamburger would otherwise hang off-screen. 0 when it already fits.
export function viewportNudge(
  rect: Pick<DOMRect, 'left' | 'right'>,
  viewportWidth: number,
): number {
  const overflowRight = rect.right - (viewportWidth - VIEWPORT_MARGIN_PX);
  if (overflowRight > 0) return -overflowRight;
  const overflowLeft = VIEWPORT_MARGIN_PX - rect.left;
  if (overflowLeft > 0) return overflowLeft;
  return 0;
}

// Anchors the tooltip's near edge next to the trigger; Tooltip's per-side
// translate class centres it along the other axis.
export function tooltipPosition(
  rect: DOMRect,
  side: TooltipSide,
): TooltipPosition {
  switch (side) {
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.right + GAP_PX };
    case 'left':
      return { top: rect.top + rect.height / 2, left: rect.left - GAP_PX };
    case 'bottom':
      return { top: rect.bottom + GAP_PX, left: rect.left + rect.width / 2 };
  }
}
