import { FaFilePdf } from 'react-icons/fa';
import Modal from 'components/common/Modal';
import { ICON_SIZE } from 'components/common/iconSizes';

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
  if (!resumeId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resumeName ?? 'Resume'}
      icon={<FaFilePdf size={ICON_SIZE.sm} />}
      maxWidth="max-w-3xl"
    >
      <iframe
        src={`/api/resumes/${resumeId}/preview`}
        title={resumeName ?? 'Resume preview'}
        className="w-full h-[70vh]"
      />
    </Modal>
  );
};

export default ResumePreviewModal;
