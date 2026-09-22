import CoverLetterCard from './CoverLetterCard';
import type { CoverLetterItem } from './types';

interface CoverLetterGridProps {
  items: CoverLetterItem[];
  onOpenDesigns: (item: CoverLetterItem) => void;
  onDownloadWord: (item: CoverLetterItem) => void;
  onCopy: (item: CoverLetterItem) => void;
  onDelete: (id: string) => void;
}

const CoverLetterGrid = ({
  items,
  onOpenDesigns,
  onDownloadWord,
  onCopy,
  onDelete,
}: CoverLetterGridProps) => {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
        No saved cover letters yet. Generate one to get started.
      </p>
    );
  }

  return (
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
  );
};

export default CoverLetterGrid;
