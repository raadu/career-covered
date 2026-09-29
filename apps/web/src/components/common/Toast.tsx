import { toast, type ToastOptions } from 'react-hot-toast';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { ICON_BUTTON_SIZE } from 'components/common/buttonSizes';

type ToastType = 'success' | 'error' | 'info';

interface ShowToastOptions {
  duration?: number;
  type?: ToastType;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <FaCheckCircle className="w-4 h-4 text-success dark:text-success-fg-dark shrink-0" />,
  error: <FaExclamationCircle className="w-4 h-4 text-danger dark:text-danger-fg-dark shrink-0" />,
  info: null,
};

const borderColors: Record<ToastType, string> = {
  success: 'border-success-border dark:border-success-border-dark',
  error: 'border-danger-border dark:border-danger-border-dark',
  info: 'border-neutral-200 dark:border-neutral-700',
};

export function showToast(
  message: string | React.ReactNode,
  options?: ShowToastOptions,
): string {
  const { duration = 2000, type = 'success' } = options ?? {};

  const toastOptions: ToastOptions = {
    duration,
    position: 'bottom-right',
    style: {
      background: 'transparent',
      boxShadow: 'none',
      padding: '0',
    },
  };

  return toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 px-4 py-1.5 bg-white dark:bg-neutral-800 border-2 ${borderColors[type]} shadow-lg max-w-sm pointer-events-auto ${
          t.visible
            ? 'animate-in fade-in slide-in-from-right-2 duration-200'
            : 'animate-out fade-out slide-out-to-right-2 duration-200'
        }`}
      >
        {icons[type]}
        <div className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-200 leading-snug py-1">
          {message}
        </div>
        {/* Negative margins keep the 40px touch target without letting it
            set the toast's height, so the text keeps even, tight padding. */}
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss"
          className={`-my-1.5 -mr-2 ${ICON_BUTTON_SIZE} flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0`}
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>
    ),
    toastOptions,
  );
}
