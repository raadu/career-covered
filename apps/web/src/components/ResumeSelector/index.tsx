import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from 'store';
import { setAuthModalOpen } from 'store/authSlice';
import ResumePreviewModal from 'components/common/ResumePreviewModal';
import { useHiddenFileInput } from 'hooks/useHiddenFileInput';
import { MAX_RESUMES } from 'utils/resumeConstants';
import ResumeSelectorRow from './ResumeSelectorRow';
import ResumeUploadTile from './ResumeUploadTile';
import { useResumeSelector } from './useResumeSelector';

interface ResumeSelectorProps {
  selectedResumeId: string | null;
  onSelectResume: (id: string | null) => void;
}

const ResumeSelector = ({
  selectedResumeId,
  onSelectResume,
}: ResumeSelectorProps) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const {
    resumes,
    isUploading,
    previewId,
    setPreviewId,
    uploadResume,
    notifyMaxResumesReached,
    toggleSelect,
  } = useResumeSelector(selectedResumeId, onSelectResume);
  const { inputRef, openPicker, handleChange } =
    useHiddenFileInput(uploadResume);

  const previewResume = resumes.find((r) => r.id === previewId) ?? null;
  const atCap = resumes.length >= MAX_RESUMES;

  const handleUploadClick = () => {
    if (atCap) {
      notifyMaxResumesReached();
      return;
    }
    openPicker();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-2.5 flex flex-col gap-1.5">
      <div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Your Resumes
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Select your resume to make cover letter based on that
        </p>
      </div>

      {!isAuthenticated ? (
        <ResumeUploadTile
          label="Login to add resume"
          onClick={() => dispatch(setAuthModalOpen(true))}
        />
      ) : (
        <>
          {resumes.map((resume) => (
            <ResumeSelectorRow
              key={resume.id}
              resume={resume}
              isSelected={resume.id === selectedResumeId}
              onToggleSelect={() => toggleSelect(resume.id)}
              onPreview={() => setPreviewId(resume.id)}
            />
          ))}
          <ResumeUploadTile
            label={
              resumes.length === 0 ? 'Upload Resume' : 'Upload More Resumes'
            }
            isUploading={isUploading}
            onClick={handleUploadClick}
          />
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleChange}
          />
        </>
      )}

      <ResumePreviewModal
        isOpen={previewId !== null}
        resumeId={previewId}
        resumeName={previewResume?.name}
        onClose={() => setPreviewId(null)}
      />
    </div>
  );
};

export default ResumeSelector;
