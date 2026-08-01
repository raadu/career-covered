import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions: number[];
}

const Pagination = ({
  pageCount,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
}: PaginationProps) => {
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

  if (pageCount <= 1 && pageSizeOptions.length === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Items per page:
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
          {total} total
        </span>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft size={10} />
            Prev
          </button>

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p - 1)}
              className={`w-7 h-7 text-xs font-semibold rounded-sm transition-colors ${
                p === pageIndex + 1
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <FaChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
