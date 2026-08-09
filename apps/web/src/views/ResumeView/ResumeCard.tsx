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
      className={`relative flex flex-col rounded-sm border border-gray-200 dark:border-gray-700 p-2.5 sm:p-3 bg-white dark:bg-gray-800 ${
        isDragging ? 'shadow-lg z-10 opacity-90' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-sm bg-red-50 dark:bg-red-900/20 text-rose-500">
          <FaFilePdf size={28} />
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
        >
          <FaGripVertical size={14} />
        </button>
      </div>

      <InlineEditableText
        value={resume.name}
        onCommit={onRename}
        maxLength={200}
        className="text-left text-sm font-bold text-gray-900 dark:text-gray-100 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        inputClassName="text-sm font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-600 rounded-sm px-1 -mx-1 outline-none w-full"
      />
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
        {(resume.fileSize / 1024).toFixed(0)} KB
      </p>

      <div className="mt-auto pt-2.5 flex items-center gap-1 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={onPreview}
          title="View"
          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm transition-colors"
        >
          <FaEye size={13} />
        </button>
        <button
          type="button"
          onClick={onDownload}
          title="Download"
          className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-sm transition-colors"
        >
          <FaDownload size={13} />
        </button>
        <button
          type="button"
          onClick={() => replaceInputRef.current?.click()}
          title="Replace file"
          className="p-1.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-sm transition-colors"
        >
          <FaSyncAlt size={13} />
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
          className="ml-auto p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
        >
          <FaTrash size={13} />
        </button>
      </div>

      {isBusy && (
        <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-white/80 dark:bg-gray-800/80">
          <LuLoader className="animate-spin text-cyan-500" size={22} />
        </div>
      )}
    </div>
  );
};

export default ResumeCard;
