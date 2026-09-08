import { FaTimes, FaFilePdf } from 'react-icons/fa';

interface ResumePreviewModalProps {
  isOpen: boolean;
  resumeId: string | null;
  resumeName?: string;
  onClose: () => void;
}

const ResumePreviewModal = ({
  isOpen,
  resumeId,
  resumeName,
  onClose,
}: ResumePreviewModalProps) => {
  if (!isOpen || !resumeId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-md transition-all overscroll-none"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 p-1.5 rounded-lg shrink-0">
              <FaFilePdf size={14} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
              {resumeName ?? 'Resume'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        <iframe
          src={`/api/resumes/${resumeId}/preview`}
          title={resumeName ?? 'Resume preview'}
          className="flex-1 w-full"
        />
      </div>
    </div>
  );
};

export default ResumePreviewModal;
