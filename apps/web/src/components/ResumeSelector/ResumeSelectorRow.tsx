import { FaEye } from 'react-icons/fa';
import { clsx } from 'clsx';
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
    // Compact row: the preview button's negative margins keep it out of the
    // height calculation, so the row sizes around the text (~8px above and
    // below the name) instead of around a 40px button.
    // Selected: a solid dark-teal fill (brand-800) matching its border, with
    // white text and icon — same in both themes.
    className={clsx(
      'flex items-center gap-2 px-1 py-1.5 border cursor-pointer transition-all text-sm shrink-0',
      isSelected
        ? 'bg-brand-800 border-brand-800'
        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-brand-200 dark:hover:border-brand-700',
    )}
  >
    <span
      className={clsx(
        'flex-1 min-w-0 truncate text-xs',
        isSelected
          ? 'font-semibold text-white'
          : 'text-neutral-800 dark:text-neutral-200',
      )}
    >
      {resume.name}
    </span>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPreview();
      }}
      title="Preview"
      className={clsx(
        'min-h-8 -my-1.5 min-w-10 flex items-center justify-center transition-colors shrink-0',
        isSelected
          ? 'text-brand-100 hover:text-white'
          : 'text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400',
      )}
    >
      <FaEye size={13} />
    </button>
  </div>
);

export default ResumeSelectorRow;
