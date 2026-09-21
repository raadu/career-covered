import { FaThLarge, FaListUl } from 'react-icons/fa';
import type { ViewMode } from 'hooks/useViewMode';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const activeClasses = 'bg-brand-600 text-white';
const inactiveClasses =
  'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300';

const ViewModeToggle = ({ viewMode, onChange }: ViewModeToggleProps) => (
  <div className="inline-flex items-center h-9 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
    <button
      type="button"
      title="Grid View"
      aria-pressed={viewMode === 'grid'}
      onClick={() => onChange('grid')}
      className={`h-full px-3 flex items-center justify-center transition-colors ${viewMode === 'grid' ? activeClasses : inactiveClasses}`}
    >
      <FaThLarge size={13} />
    </button>
    <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700" />
    <button
      type="button"
      title="List View"
      aria-pressed={viewMode === 'list'}
      onClick={() => onChange('list')}
      className={`h-full px-3 flex items-center justify-center transition-colors ${viewMode === 'list' ? activeClasses : inactiveClasses}`}
    >
      <FaListUl size={13} />
    </button>
  </div>
);

export default ViewModeToggle;
