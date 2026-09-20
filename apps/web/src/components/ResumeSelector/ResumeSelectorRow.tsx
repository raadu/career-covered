import { FaEye } from 'react-icons/fa';
import type { Resume } from 'views/ResumeView/types';

interface ResumeSelectorRowProps {
  resume: Resume;
  isSelected: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
}

const ResumeSelectorRow = ({
  resume,
  isSelected,
  onToggleSelect,
  onPreview,
}: ResumeSelectorRowProps) => (
  <div
    onClick={onToggleSelect}
    className={`flex items-center gap-2 p-1 border cursor-pointer transition-all text-sm shrink-0 ${
      isSelected
        ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-600'
        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-brand-200 dark:hover:border-brand-700'
    }`}
  >
    <span className="flex-1 min-w-0 truncate text-xs text-neutral-800 dark:text-neutral-200">
      {resume.name}
    </span>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPreview();
      }}
      title="Preview"
      className="min-h-10 min-w-10 flex items-center justify-center text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shrink-0"
    >
      <FaEye size={13} />
    </button>
  </div>
);

export default ResumeSelectorRow;
