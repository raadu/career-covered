import { FaTrash } from 'react-icons/fa';

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
  <div className="flex flex-wrap items-center gap-3 mb-4 px-3 py-2.5 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-sm">
    <span className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">
      {selectedCount} selected
    </span>
    <button
      onClick={onDelete}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
    >
      <FaTrash size={10} /> Delete Selected
    </button>
    <button
      onClick={onClear}
      className="ml-auto text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline transition-colors"
    >
      Clear selection
    </button>
  </div>
);

export default BatchActionBar;
