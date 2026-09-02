import { FaTimes, FaPalette } from 'react-icons/fa';
import { PDF_DESIGNS, type PdfDesignId } from 'utils/pdfDesigns';
import DesignCard from './DesignCard';

interface PdfDesignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadingDesignId: PdfDesignId | null;
  onSelectDesign: (designId: PdfDesignId) => void;
}

const PdfDesignsModal = ({
  isOpen,
  onClose,
  downloadingDesignId,
  onSelectDesign,
}: PdfDesignsModalProps) => {
  if (!isOpen) return null;

  const isBusy = downloadingDesignId !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-md transition-all overscroll-none"
      onClick={onClose}
    >
      <div
        className="flex flex-col bg-white dark:bg-gray-800 rounded-sm shadow-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 sm:p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 p-1.5 rounded-sm">
              <FaPalette size={14} />
            </div>
            <h3 className="text-base sm:text-md font-semibold text-gray-800 dark:text-gray-100">
              Choose a PDF Design
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-200 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-5 overflow-y-auto">
          {PDF_DESIGNS.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              isDownloading={downloadingDesignId === design.id}
              disabled={isBusy}
              onSelect={() => onSelectDesign(design.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PdfDesignsModal;
