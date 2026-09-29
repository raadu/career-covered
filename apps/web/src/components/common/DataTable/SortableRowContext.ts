import { createContext, useContext } from 'react';
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';

interface SortableRowContextValue {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

// Lets a column's `cell` renderer (a plain function, not a component that
// could call `useSortable` itself) reach the current row's drag
// attributes/listeners via `<DragHandle />` instead — SortableTableBody's
// row wrapper is the one that actually calls `useSortable`.
export const SortableRowContext =
  createContext<SortableRowContextValue | null>(null);

export function useSortableRow(): SortableRowContextValue {
  const context = useContext(SortableRowContext);
  if (!context) {
    throw new Error(
      'useSortableRow (and <DragHandle />) must be used within a sortable DataTable row',
    );
  }
  return context;
}
