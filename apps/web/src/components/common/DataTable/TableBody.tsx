import { flexRender, type RowModel } from '@tanstack/react-table';
import SkeletonRow from './SkeletonRow';

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
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} cols={columnsLength} />
        ))}
      </tbody>
    );
  }

  if (rowModel.rows.length === 0) {
    return (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        <tr>
          <td
            colSpan={columnsLength}
            className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {rowModel.rows.map((row) => (
        <tr
          key={row.id}
          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
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
