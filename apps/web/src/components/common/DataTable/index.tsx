import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPaginationChange: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

const DataTable = <T extends object>({
  columns,
  data,
  pageCount,
  pageIndex,
  onPaginationChange,
  isLoading,
  emptyMessage = 'No data found',
}: DataTableProps<T>) => {
  const table = useReactTable({
    columns,
    data,
    pageCount,
    state: { pagination: { pageIndex, pageSize: 10 } },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function'
        ? updater({ pageIndex, pageSize: 10 })
        : updater;
      onPaginationChange(next.pageIndex + 1);
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const pages: number[] = [];
  if (pageCount > 0) {
    const maxVisible = 5;
    let start = Math.max(0, pageIndex - 2);
    const end = Math.min(pageCount, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i + 1);
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            onClick={() => onPaginationChange(pageIndex)}
            disabled={pageIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft size={10} />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => onPaginationChange(p)}
                className={`w-7 h-7 text-xs font-semibold rounded-sm transition-colors ${
                  p === pageIndex + 1
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPaginationChange(pageIndex + 2)}
            disabled={pageIndex >= pageCount - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <FaChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
