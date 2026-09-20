import Modal from './Modal';
import CommonButton from './CommonButton';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Sure!',
  cancelLabel = 'Nope',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title={title}
    maxWidth="max-w-xs"
    footer={
      <>
        <CommonButton variant="secondary" onClick={onConfirm} fullWidth>
          {confirmLabel}
        </CommonButton>
        <CommonButton variant="primary" onClick={onCancel} fullWidth>
          {cancelLabel}
        </CommonButton>
      </>
    }
  >
    <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed text-center">
      {message}
    </p>
  </Modal>
);

export default ConfirmModal;
