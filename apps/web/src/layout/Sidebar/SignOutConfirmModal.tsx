import ConfirmModal from 'components/common/ConfirmModal';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SignOutConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: SignOutConfirmModalProps) => (
  <ConfirmModal
    isOpen={isOpen}
    title="Sign out"
    message="Are you sure you want to sign out?"
    confirmLabel="Sure!"
    cancelLabel="Nope"
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);

export default SignOutConfirmModal;
