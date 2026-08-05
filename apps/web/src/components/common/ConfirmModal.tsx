import { FaTimes } from 'react-icons/fa';

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
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="relative bg-white dark:bg-gray-800 w-full max-w-xs rounded-sm shadow-xl border border-gray-100 dark:border-gray-700 p-5 transition-all"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>

        <div className="mb-4 text-center">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-[13px] mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-sm transition-all text-[12px]"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-sm transition-all text-[12px]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
