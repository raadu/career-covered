import { flexRender, type Row, type RowModel } from '@tanstack/react-table';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SkeletonRow from './SkeletonRow';
import { hideBelowClass } from './tableColumnMeta';
import { SortableRowContext } from './SortableRowContext';

interface SortableTableBodyProps<T> {
  rowModel: RowModel<T>;
  columnsLength: number;
  isLoading?: boolean;
  emptyMessage: string;
  getRowClassName?: (row: T) => string;
}

interface SortableTableRowProps<T> {
  row: Row<T>;
  className: string;
}

// `row.id` is TanStack's row identity, which DataTable configures (via
// `getRowId`) to equal the sortable id whenever `sortable` is on — so this
// never needs its own id-extraction logic.
const SortableTableRow = <T,>({ row, className }: SortableTableRowProps<T>) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableRowContext.Provider value={{ attributes, listeners }}>
      <tr
        ref={setNodeRef}
        style={style}
        className={`hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
          isDragging ? 'shadow-lg z-10 opacity-90 relative' : ''
        } ${className}`}
      >
        {row.getVisibleCells().map((cell) => (
          <td
            key={cell.id}
            className={`px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 ${hideBelowClass(cell.column.columnDef.meta?.hideBelow)}`}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    </SortableRowContext.Provider>
  );
};

const SortableTableBody = <T extends object>({
  rowModel,
  columnsLength,
  isLoading,
  emptyMessage,
  getRowClassName,
}: SortableTableBodyProps<T>) => {
  if (isLoading) {
    return (
      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} cols={columnsLength} />
        ))}
      </tbody>
    );
  }

  if (rowModel.rows.length === 0) {
    return (
      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
        <tr>
          <td
            colSpan={columnsLength}
            className="px-4 py-12 text-center text-sm text-neutral-400 dark:text-neutral-500"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <SortableContext
      items={rowModel.rows.map((row) => row.id)}
      strategy={verticalListSortingStrategy}
    >
      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {rowModel.rows.map((row) => (
          <SortableTableRow
            key={row.id}
            row={row}
            className={getRowClassName?.(row.original) ?? ''}
          />
        ))}
      </tbody>
    </SortableContext>
  );
};

export default SortableTableBody;
