import { FaPlus } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';
import ViewModeToggle from 'components/common/ViewModeToggle';
import { ICON_SIZE } from 'components/common/iconSizes';
import type { ViewMode } from 'hooks/useViewMode';

interface TemplatesHeaderProps {
  total: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showViewModeToggle: boolean;
  onCreateClick: () => void;
}

const TemplatesHeader = ({
  total,
  viewMode,
  onViewModeChange,
  showViewModeToggle,
  onCreateClick,
}: TemplatesHeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
        Cover Letter Templates
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        You have {total} {total === 1 ? 'template' : 'templates'}
      </p>
    </div>
    <div className="flex items-center gap-2">
      {showViewModeToggle && (
        <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
      )}
      {/* Short label on phones, matching Previously Created's "New". */}
      <CommonButton
        variant="primary"
        icon={<FaPlus size={ICON_SIZE.xs} />}
        onClick={onCreateClick}
        className="shrink-0 whitespace-nowrap"
      >
        <span className="md:hidden">New</span>
        <span className="hidden md:inline">New Template</span>
      </CommonButton>
    </div>
  </div>
);

export default TemplatesHeader;
