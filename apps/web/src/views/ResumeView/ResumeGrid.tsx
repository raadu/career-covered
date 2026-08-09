import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import UploadSlot from './UploadSlot';
import ResumeCard from './ResumeCard';
import type { Resume } from './types';
import { MAX_RESUMES } from './resumeConstants';

interface ResumeGridProps {
  resumes: Resume[];
  isUploading: boolean;
  busyId: string | null;
  onUpload: (file: File) => void;
  onReorder: (newOrder: Resume[]) => void;
  onRename: (id: string, name: string) => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onReplace: (id: string, file: File) => void;
  onDelete: (id: string) => void;
}

const ResumeGrid = ({
  resumes,
  isUploading,
  busyId,
  onUpload,
  onReorder,
  onRename,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
}: ResumeGridProps) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = resumes.findIndex((r) => r.id === active.id);
    const newIndex = resumes.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(resumes, oldIndex, newIndex));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      <UploadSlot
        disabled={resumes.length >= MAX_RESUMES}
        isUploading={isUploading}
        onUpload={onUpload}
      />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={resumes.map((r) => r.id)}
          strategy={rectSortingStrategy}
        >
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              isBusy={busyId === resume.id}
              onRename={(name) => onRename(resume.id, name)}
              onPreview={() => onPreview(resume.id)}
              onDownload={() => onDownload(resume.id)}
              onReplace={(file) => onReplace(resume.id, file)}
              onDelete={() => onDelete(resume.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ResumeGrid;
