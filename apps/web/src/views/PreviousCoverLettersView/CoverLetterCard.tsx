import { FaFilePdf, FaFileWord, FaCopy, FaTrash } from 'react-icons/fa';
import { ICON_SIZE } from 'components/common/iconSizes';
import { tableActionButtonClass } from 'components/common/DataTable/tableColumnMeta';
import formatDate from 'utils/dateUtils';
import type { CoverLetterItem } from './types';

interface CoverLetterCardProps {
  item: CoverLetterItem;
  onOpenDesigns: () => void;
  onDownloadWord: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

const CoverLetterCard = ({
  item,
  onOpenDesigns,
  onDownloadWord,
  onCopy,
  onDelete,
}: CoverLetterCardProps) => (
  <div className="flex flex-col border border-neutral-200 dark:border-neutral-700 p-2.5 sm:p-3 bg-white dark:bg-neutral-900">
    <p className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">
      {item.jobDescription}
    </p>
    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
      Template: {item.template?.name || 'N/A'}
    </p>
    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
      {formatDate(item.createdAt)}
    </p>

    <div className="mt-auto pt-2.5 flex items-center gap-1 border-t border-neutral-100 dark:border-neutral-800">
      <button
        type="button"
        onClick={onOpenDesigns}
        title="Choose a PDF design"
        className={tableActionButtonClass}
      >
        <FaFilePdf size={ICON_SIZE.xs} />
      </button>
      <button
        type="button"
        onClick={onDownloadWord}
        title="Download as Word"
        className={tableActionButtonClass}
      >
        <FaFileWord size={ICON_SIZE.xs} />
      </button>
      <button
        type="button"
        onClick={onCopy}
        title="Copy to clipboard"
        className={tableActionButtonClass}
      >
        <FaCopy size={ICON_SIZE.xs} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete"
        className={`ml-auto ${tableActionButtonClass}`}
      >
        <FaTrash size={ICON_SIZE.xs} />
      </button>
    </div>
  </div>
);

export default CoverLetterCard;
