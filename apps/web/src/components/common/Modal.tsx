import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { ICON_SIZE } from './iconSizes';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

// Every modal in the app should be built on this shell, not roll its own
// overlay. Two structural guarantees every consumer gets for free:
//
// 1. Portaled to document.body. A modal mounted deep in the component tree
//    (e.g. from inside the Sidebar) can sit inside an ancestor's stacking
//    context despite its own `position: fixed` — a position:relative
//    ancestor with a non-auto z-index (like <aside>'s z-10) confines any
//    fixed descendant's z-index to compete only within *that* context, so
//    unrelated page content with its own z-index can render on top of it
//    regardless of how high the modal's own z-index is set. Portaling
//    escapes this entirely; this is not theoretical — it's the exact bug
//    the Quick Links edit modal shipped with before being portaled.
// 2. max-h-[85vh] with the body as the only scrolling region. A modal with
//    no scroll mechanism can clip content (e.g. the submit button) on a
//    short viewport or with the on-screen keyboard open.
const Modal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = 'max-w-md',
}: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/30 backdrop-blur-md overscroll-none"
      onClick={onClose}
    >
      <div
        className={`flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-xl w-full ${maxWidth} max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className="shrink-0 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 p-1.5">
                {icon}
              </div>
            )}
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 min-h-10 min-w-10 flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <FaTimes size={ICON_SIZE.sm} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4">{children}</div>

        {footer && (
          <div className="shrink-0 flex justify-end gap-2 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
