import { flexRender, type RowModel } from '@tanstack/react-table';
import SkeletonRow from './SkeletonRow';
import { hideBelowClass } from './tableColumnMeta';

interface TableBodyProps<T> {
  rowModel: RowModel<T>;
  columnsLength: number;
  isLoading?: boolean;
  emptyMessage: string;
}

const TableBody = <T extends object>({
  rowModel,
  columnsLength,
  isLoading,
  emptyMessage,
}: TableBodyProps<T>) => {
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
    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
      {rowModel.rows.map((row) => (
        <tr
          key={row.id}
          className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
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
      ))}
    </tbody>
  );
};

export default TableBody;
