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
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Items per page:
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-1 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-1">
          {total} total
        </span>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="min-h-10 flex items-center gap-1 px-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft size={10} />
            Prev
          </button>

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p - 1)}
              className={`min-h-10 min-w-10 text-xs font-semibold transition-colors ${
                p === pageIndex + 1
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
            className="min-h-10 flex items-center gap-1 px-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
