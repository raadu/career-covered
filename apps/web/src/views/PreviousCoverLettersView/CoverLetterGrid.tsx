import Pagination from 'components/common/DataTable/Pagination';
import { DEFAULT_PAGE_SIZES } from 'components/common/DataTable/tableColumnMeta';
import CoverLetterCard from './CoverLetterCard';
import type { CoverLetterItem } from './types';

interface CoverLetterGridProps {
  items: CoverLetterItem[];
  onOpenDesigns: (item: CoverLetterItem) => void;
  onDownloadWord: (item: CoverLetterItem) => void;
  onCopy: (item: CoverLetterItem) => void;
  onDelete: (id: string) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const CoverLetterGrid = ({
  items,
  onOpenDesigns,
  onDownloadWord,
  onCopy,
  onDelete,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: CoverLetterGridProps) => {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
        No saved cover letters yet. Generate one to get started.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item) => (
          <CoverLetterCard
            key={item.id}
            item={item}
            onOpenDesigns={() => onOpenDesigns(item)}
            onDownloadWord={() => onDownloadWord(item)}
            onCopy={() => onCopy(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
      </div>

      <div className="mt-3">
        <Pagination
          pageCount={totalPages}
          pageIndex={page - 1}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={DEFAULT_PAGE_SIZES}
        />
      </div>
    </div>
  );
};

export default CoverLetterGrid;
