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
        ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
    }`}
  >
    <span className="flex-1 min-w-0 truncate text-xs text-gray-800 dark:text-gray-200">
      {resume.name}
    </span>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPreview();
      }}
      title="Preview"
      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-sm transition-colors shrink-0"
    >
      <FaEye size={13} />
    </button>
  </div>
);

export default ResumeSelectorRow;
