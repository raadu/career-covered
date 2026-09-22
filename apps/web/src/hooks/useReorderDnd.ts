import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// Generic drag-end handler for any dnd-kit sortable list — reorders `items`
// by the dragged id's old/new index and hands the caller the full new
// array. Used by both card-grid drag-reorder (ResumeGrid) and the sortable
// DataTable row extension.
export function useReorderDnd<T>(
  items: T[],
  getId: (item: T) => string,
  onReorder: (newOrder: T[]) => void,
) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => getId(item) === active.id);
    const newIndex = items.findIndex((item) => getId(item) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return { handleDragEnd };
}
