import { FaGripVertical } from 'react-icons/fa';
import { ICON_SIZE } from 'components/common/iconSizes';
import { useSortableRow } from './SortableRowContext';

// Drop into any cell of a sortable DataTable's column defs to make that row
// draggable from this handle specifically (not the whole row).
const DragHandle = () => {
  const { attributes, listeners } = useSortableRow();

  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      title="Drag to reorder"
      className="min-h-10 min-w-10 flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 cursor-grab active:cursor-grabbing touch-none transition-colors"
    >
      <FaGripVertical size={ICON_SIZE.xs} />
    </button>
  );
};

export default DragHandle;
