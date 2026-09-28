import type { RowData } from '@tanstack/react-table';
import { ICON_BUTTON_SIZE, TEXT_BUTTON_HEIGHT } from 'components/common/buttonSizes';

// Opt-in column capability: a column tagged `hideBelow` collapses out of the
// table below that breakpoint. Nothing wires this into a real table yet
// (that's Phase 2c, once each table view gets its mobile card fallback) —
// this only makes the capability available to column defs that opt in.
declare module '@tanstack/react-table' {
  // TData/TValue are required by TanStack's own generic signature for this
  // interface to merge correctly — unused by design, not an oversight.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    hideBelow?: 'sm' | 'md' | 'lg';
  }
}

export function hideBelowClass(hideBelow?: 'sm' | 'md' | 'lg'): string {
  if (!hideBelow) return '';
  return `hidden ${hideBelow}:table-cell`;
}

// Shared sizing for a table row's icon-only action buttons — the shared
// icon-button size (40px touch / 34px mouse) regardless of the icon's size, for callers building cell
// content (row actions are rendered by each view, not by DataTable itself).
export const tableActionButtonClass = `${ICON_BUTTON_SIZE} flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors`;

// Grid-card variant: each button takes an equal share of the card's action
// row (flex-1, no 40px min-width), so the icons spread across the full
// width with even spacing and can never overflow a narrow two-column phone
// card. Keeps the shared button height.
export const cardActionButtonClass = `flex-1 min-w-0 ${TEXT_BUTTON_HEIGHT} flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors`;

// Shared page-size options for DataTable and its grid-view counterparts
// (TemplateGrid, CoverLetterGrid) — kept here rather than DataTable/index.tsx
// so pagination-less consumers don't trigger a fast-refresh warning importing
// a constant from a component file.
export const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
