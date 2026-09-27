import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import {
  FaBars,
  FaLifeRing,
  FaMoon,
  FaQuestionCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaSun,
  FaTimes,
} from 'react-icons/fa';
import { type RootState, useAppDispatch } from 'store';
import { setAuthModalOpen } from 'store/authSlice';
import { useDarkMode } from 'hooks/useDarkMode';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import Tooltip from 'components/common/Tooltip';
import EditLinksModal from 'layout/Sidebar/QuickLinks/EditLinksModal';
import { useQuickLinkItems } from 'layout/Sidebar/QuickLinks/useQuickLinkItems';
import SignOutConfirmModal from 'layout/Sidebar/SignOutConfirmModal';
import { useSignOut } from 'layout/Sidebar/useSignOut';
import MobileMenuItem from './MobileMenuItem';
import MobileQuickLinks from './MobileQuickLinks';

interface PanelPosition {
  top: number;
  right: number;
}

// Phone-only (<md) home for everything that doesn't fit the top bar. The
// panel is portaled for the same stacking-context reason as Modal.tsx, which
// is why the outside-click check needs both the trigger and the panel refs.
const MobileMenu = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isDark, toggleDark } = useDarkMode();
  const quickLinks = useQuickLinkItems();
  const { isConfirmOpen, requestSignOut, cancelSignOut, confirmSignOut } =
    useSignOut();

  const [position, setPosition] = useState<PanelPosition | null>(null);
  const [isEditLinksOpen, setIsEditLinksOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [refs] = useState(() => [triggerRef, panelRef]);
  const panelId = useId();
  const isOpen = position !== null;

  const close = useCallback(() => setPosition(null), []);
  useOnClickOutside(refs, close, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', close);
    };
  }, [isOpen, close]);

  const toggle = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (isOpen || !rect) return close();
    setPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
  };

  // Runs an item's action and closes the menu, so the next tap on the page
  // isn't swallowed by an outside-click close.
  const select = (action?: () => void) => () => {
    action?.();
    close();
  };

  const menuLabel = isOpen ? 'Close menu' : 'Open menu';

  return (
    <>
      <Tooltip label={menuLabel} side="bottom" className="shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          aria-label={menuLabel}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          className="min-h-10 min-w-10 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {isOpen ? (
            <FaTimes className="w-4 h-4" />
          ) : (
            <FaBars className="w-4 h-4" />
          )}
        </button>
      </Tooltip>

      {position &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="menu"
            aria-label="Menu"
            style={{ top: position.top, right: position.right }}
            className="fixed z-40 w-56 max-h-[calc(100vh-4rem)] overflow-y-auto border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <MobileMenuItem
              Icon={isDark ? FaSun : FaMoon}
              label={isDark ? 'Light Mode' : 'Dark Mode'}
              onClick={select(toggleDark)}
            />
            <MobileMenuItem
              Icon={FaQuestionCircle}
              label="FAQ"
              to="/faq"
              onClick={select()}
            />
            <MobileMenuItem
              Icon={FaLifeRing}
              label="Support"
              to="/support"
              onClick={select()}
            />
            {quickLinks && (
              <MobileQuickLinks
                links={quickLinks}
                onEditLinks={select(() => setIsEditLinksOpen(true))}
              />
            )}
            <div className="my-1 h-px bg-neutral-100 dark:bg-neutral-800" />
            {isAuthenticated ? (
              <MobileMenuItem
                Icon={FaSignOutAlt}
                label="Logout"
                variant="danger"
                onClick={select(requestSignOut)}
              />
            ) : (
              <MobileMenuItem
                Icon={FaSignInAlt}
                label="Sign In"
                onClick={select(() => dispatch(setAuthModalOpen(true)))}
              />
            )}
          </div>,
          document.body,
        )}

      {isEditLinksOpen && (
        <EditLinksModal
          isOpen={isEditLinksOpen}
          onClose={() => setIsEditLinksOpen(false)}
        />
      )}
      <SignOutConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={confirmSignOut}
        onCancel={cancelSignOut}
      />
    </>
  );
};

export default MobileMenu;
