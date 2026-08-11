import { FaPlus } from 'react-icons/fa';
import { LuLoader } from 'react-icons/lu';

interface ResumeUploadTileProps {
  label: string;
  isUploading?: boolean;
  onClick: () => void;
}

const ResumeUploadTile = ({
  label,
  isUploading,
  onClick,
}: ResumeUploadTileProps) => (
  <button
    type="button"
    disabled={isUploading}
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
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
