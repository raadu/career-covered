import { toast, type ToastOptions } from 'react-hot-toast';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

type ToastType = 'success' | 'error' | 'info';

interface ShowToastOptions {
  duration?: number;
  type?: ToastType;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <FaCheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
  error: <FaExclamationCircle className="w-4 h-4 text-red-500 shrink-0" />,
  info: null,
};

const borderColors: Record<ToastType, string> = {
  success: 'border-green-200 dark:border-green-800',
  error: 'border-red-200 dark:border-red-800',
  info: 'border-blue-200 dark:border-blue-800',
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
      borderRadius: '0',
      background: 'transparent',
      boxShadow: 'none',
      padding: '0',
    },
  };

  return toast.custom(
    (t) => (
      <div
        className={`flex items-start gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 ${borderColors[type]} shadow-lg max-w-sm pointer-events-auto ${
          t.visible ? 'animate-in fade-in slide-in-from-right-2 duration-200' : 'animate-out fade-out slide-out-to-right-2 duration-200'
        }`}
        style={{ borderRadius: '0' }}
      >
        {icons[type]}
        <div className="flex-1 text-[13px] font-medium text-gray-700 dark:text-gray-200 leading-snug pt-0.5">
          {message}
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>
    ),
    toastOptions,
  );
}
