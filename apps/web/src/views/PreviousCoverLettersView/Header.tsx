import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CommonButton from 'components/common/CommonButton';
import ViewModeToggle from 'components/common/ViewModeToggle';
import { ICON_SIZE } from 'components/common/iconSizes';
import { MAX_SAVED_COVER_LETTERS } from 'utils/coverLetterConstants';
import type { ViewMode } from 'hooks/useViewMode';

interface HeaderProps {
  total: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showViewModeToggle: boolean;
}

const Header = ({
  total,
  viewMode,
  onViewModeChange,
  showViewModeToggle,
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
          Previously created cover letters
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          You have {total} saved cover letter{total !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
          Only the latest {MAX_SAVED_COVER_LETTERS} entries are saved and
          shown.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {showViewModeToggle && (
          <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
        )}
        <CommonButton
          variant="primary"
          icon={<FaPlus size={ICON_SIZE.xs} />}
          onClick={() => navigate('/')}
        >
          Create New
        </CommonButton>
      </div>
    </div>
  );
};

export default Header;
