import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FaFilePdf,
  FaEye,
  FaDownload,
  FaSyncAlt,
  FaTrash,
  FaGripVertical,
} from 'react-icons/fa';
import { LuLoader } from 'react-icons/lu';
import InlineEditableText from 'components/common/InlineEditableText';
import { ICON_SIZE } from 'components/common/iconSizes';
import { tableActionButtonClass } from 'components/common/DataTable/tableColumnMeta';
import type { Resume } from './types';

interface ResumeCardProps {
  resume: Resume;
  isBusy: boolean;
  onRename: (name: string) => void;
  onPreview: () => void;
  onDownload: () => void;
  onReplace: (file: File) => void;
  onDelete: () => void;
}

const ResumeCard = ({
  resume,
  isBusy,
  onRename,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
}: ResumeCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resume.id });
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col border border-neutral-200 dark:border-neutral-700 p-2.5 sm:p-3 bg-white dark:bg-neutral-900 ${
        isDragging ? 'shadow-lg z-10 opacity-90' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center bg-danger-subtle dark:bg-danger-subtle-dark text-danger dark:text-danger-fg-dark">
          <FaFilePdf size={28} />
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="min-h-10 min-w-10 flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 cursor-grab active:cursor-grabbing touch-none transition-colors"
          title="Drag to reorder"
        >
          <FaGripVertical size={ICON_SIZE.xs} />
        </button>
      </div>

      <InlineEditableText
        value={resume.name}
        onCommit={onRename}
        maxLength={200}
        className="text-left text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        inputClassName="text-sm font-bold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 border border-brand-300 dark:border-brand-600 px-1 -mx-1 outline-none w-full"
      />
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
        {(resume.fileSize / 1024).toFixed(0)} KB
      </p>

      <div className="mt-auto pt-2.5 flex items-center gap-1 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={onPreview}
          title="View"
          className={tableActionButtonClass}
        >
          <FaEye size={ICON_SIZE.xs} />
        </button>
        <button
          type="button"
          onClick={onDownload}
          title="Download"
          className={tableActionButtonClass}
        >
          <FaDownload size={ICON_SIZE.xs} />
        </button>
        <button
          type="button"
          onClick={() => replaceInputRef.current?.click()}
          title="Replace file"
          className={tableActionButtonClass}
        >
          <FaSyncAlt size={ICON_SIZE.xs} />
        </button>
        <input
          ref={replaceInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onReplace(file);
          }}
        />
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          className={`ml-auto ${tableActionButtonClass}`}
        >
          <FaTrash size={ICON_SIZE.xs} />
        </button>
      </div>

      {isBusy && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80">
          <LuLoader className="animate-spin text-brand-500" size={22} />
        </div>
      )}
    </div>
  );
};

export default ResumeCard;
