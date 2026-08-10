import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import UploadSlot from './UploadSlot';
import ResumeCard from './ResumeCard';
import type { Resume } from './types';
import { MAX_RESUMES } from './resumeConstants';
import { useReorderDnd } from './useReorderDnd';

interface ResumeGridProps {
  resumes: Resume[];
  isUploading: boolean;
  busyId: string | null;
  onUpload: (file: File) => void;
  onCapReached: () => void;
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
  onCapReached,
  onReorder,
  onRename,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
}: ResumeGridProps) => {
  const { handleDragEnd } = useReorderDnd(resumes, onReorder);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      <UploadSlot
        atCap={resumes.length >= MAX_RESUMES}
        isUploading={isUploading}
        onUpload={onUpload}
        onCapReached={onCapReached}
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
