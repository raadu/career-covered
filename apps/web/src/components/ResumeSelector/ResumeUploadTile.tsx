import { FaPlus } from 'react-icons/fa';
import { LuLoader } from 'react-icons/lu';

interface ResumeUploadTileProps {
  label: string;
  isUploading?: boolean;
  onClick: () => void;
  // Shorter vertical padding, used for the logged-out "Login to add resume"
  // tile so it doesn't take up as much of the resume panel.
  compact?: boolean;
}

const ResumeUploadTile = ({
  label,
  isUploading,
  onClick,
  compact,
}: ResumeUploadTileProps) => (
  <button
    type="button"
    disabled={isUploading}
    onClick={onClick}
    className={`w-full min-h-10 flex items-center justify-center gap-2 px-2 border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-sm text-neutral-400 dark:text-neutral-500 hover:border-brand-400 dark:hover:border-brand-500 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-200 dark:disabled:hover:border-neutral-700 disabled:hover:text-neutral-400 disabled:hover:bg-transparent ${compact ? 'py-0.5' : 'py-1'}`}
  >
    {isUploading ? (
      <LuLoader className="animate-spin" size={16} />
    ) : (
      <FaPlus size={12} />
    )}
    {label}
  </button>
);

export default ResumeUploadTile;
