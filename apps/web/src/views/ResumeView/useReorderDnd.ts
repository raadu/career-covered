import { type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Resume } from './types';

export function useReorderDnd(
  resumes: Resume[],
  onReorder: (newOrder: Resume[]) => void,
) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = resumes.findIndex((r) => r.id === active.id);
    const newIndex = resumes.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(resumes, oldIndex, newIndex));
  };

  return { handleDragEnd };
}
