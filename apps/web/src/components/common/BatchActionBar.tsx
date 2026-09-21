import { FaTrash } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';

interface BatchActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
}

const BatchActionBar = ({
  selectedCount,
  onDelete,
  onClear,
}: BatchActionBarProps) => (
  <div className="flex flex-wrap items-center gap-3 mb-4 px-3 py-2.5 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
    <span className="text-sm text-brand-700 dark:text-brand-300 font-medium">
      {selectedCount} selected
    </span>
    <CommonButton
      variant="destructive"
      icon={<FaTrash size={ICON_SIZE.xs} />}
      onClick={onDelete}
      className="h-8 px-3 text-xs"
    >
      Delete Selected
    </CommonButton>
    <button
      type="button"
      onClick={onClear}
      className="ml-auto text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline transition-colors"
    >
      Clear selection
    </button>
  </div>
);

export default BatchActionBar;
