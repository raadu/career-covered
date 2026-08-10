import ViewModeToggle from './ViewModeToggle';
import UploadHeaderButton from './UploadHeaderButton';
import type { ViewMode } from './useResumeViewMode';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  atCap: boolean;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onCapReached: () => void;
}

const Header = ({
  viewMode,
  onViewModeChange,
  atCap,
  isUploading,
  onUpload,
  onCapReached,
}: HeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
        Resumes
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Upload and manage your resumes here
      </p>
    </div>
    <div className="flex items-center gap-2">
      <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
      {viewMode === 'list' && (
        <UploadHeaderButton
          atCap={atCap}
          isUploading={isUploading}
          onUpload={onUpload}
          onCapReached={onCapReached}
        />
      )}
    </div>
  </div>
);

export default Header;
