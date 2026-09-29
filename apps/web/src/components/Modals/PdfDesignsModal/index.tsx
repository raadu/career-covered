import { FaPalette } from 'react-icons/fa';
import { PDF_DESIGNS, type PdfDesignId } from 'utils/pdfDesigns';
import Modal from 'components/common/Modal';
import { ICON_SIZE } from 'components/common/iconSizes';
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
  const isBusy = downloadingDesignId !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose a PDF Design"
      icon={<FaPalette size={ICON_SIZE.sm} />}
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
    </Modal>
  );
};

export default PdfDesignsModal;
