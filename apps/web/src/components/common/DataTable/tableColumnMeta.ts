import type { RowData } from '@tanstack/react-table';

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

// Shared sizing for a table row's icon-only action buttons — 40px min
// target regardless of the icon's own size, for callers building cell
// content (row actions are rendered by each view, not by DataTable itself).
export const tableActionButtonClass =
  'min-h-10 min-w-10 flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors';
