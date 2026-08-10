import { FaThLarge, FaListUl } from 'react-icons/fa';
import type { ViewMode } from './useResumeViewMode';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const activeClasses = 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900';
const inactiveClasses =
  'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300';

const ViewModeToggle = ({ viewMode, onChange }: ViewModeToggleProps) => (
  <div className="inline-flex items-center h-9 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <button
      type="button"
      title="Grid View"
      aria-pressed={viewMode === 'grid'}
      onClick={() => onChange('grid')}
      className={`h-full px-3 flex items-center justify-center transition-colors ${viewMode === 'grid' ? activeClasses : inactiveClasses}`}
    >
      <FaThLarge size={13} />
    </button>
    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
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
