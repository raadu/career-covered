import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { FaEllipsisV } from 'react-icons/fa';

export interface TableAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  dividerBefore?: boolean;
}

interface TableActionsProps {
  actions: TableAction[];
  mode?: 'inline' | 'menu';
}

const MENU_WIDTH = 144; // w-36
const MENU_CLOSE_DELAY_MS = 200;

const iconButtonClasses: Record<'default' | 'danger', string> = {
  default:
    'p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm transition-colors',
  danger:
    'p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors',
};

const menuItemClasses: Record<'default' | 'danger', string> = {
  default:
    'w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors',
  danger:
    'w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-colors',
};

const InlineActions = ({ actions }: { actions: TableAction[] }) => (
  <div className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 flex items-center gap-1 w-fit">
    {actions.map((action) => (
      <div key={action.key} className="flex items-center gap-1">
        {action.dividerBefore && (
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
        )}
        <button
          type="button"
          onClick={action.onClick}
          title={action.label}
          className={iconButtonClasses[action.variant ?? 'default']}
        >
          {action.icon}
        </button>
      </div>
    ))}
  </div>
);

const MenuActions = ({ actions }: { actions: TableAction[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, left: rect.right - MENU_WIDTH });
  }, []);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeTimeoutRef.current = setTimeout(
      () => setIsOpen(false),
      MENU_CLOSE_DELAY_MS,
    );
  }, [cancelScheduledClose]);

  useEffect(() => cancelScheduledClose, [cancelScheduledClose]);

  // Positioned via a portal + fixed coordinates rather than an absolutely
  // positioned child, so the popup can never be clipped by a table
  // container's overflow-hidden/overflow-x-auto (needed for rounded
  // corners + horizontal scroll). The initial measurement happens in the
  // click handler that opens the menu (an event, not an effect body) —
  // this effect only keeps it in sync with scroll/resize while open.
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuContentRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Actions"
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen((open) => !open);
        }}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
      >
        <FaEllipsisV size={13} />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuContentRef}
            role="menu"
            style={{ top: position.top, left: position.left }}
            className="fixed z-50 w-36 rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
            onMouseEnter={cancelScheduledClose}
            onMouseLeave={scheduleClose}
          >
            {actions.map((action) => (
              <button
                key={action.key}
                role="menuitem"
                type="button"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={menuItemClasses[action.variant ?? 'default']}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

const TableActions = ({ actions, mode = 'inline' }: TableActionsProps) => {
  if (mode === 'menu') return <MenuActions actions={actions} />;
  return <InlineActions actions={actions} />;
};

export default TableActions;
