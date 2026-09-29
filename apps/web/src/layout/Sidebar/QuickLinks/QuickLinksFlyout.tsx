import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaLink } from 'react-icons/fa';
import Tooltip from 'components/common/Tooltip';
import { useAnchoredPopover } from 'hooks/useAnchoredPopover';
import QuickLinkMenuItems from 'layout/Sidebar/MobileMenu/QuickLinkMenuItems';
import EditLinksModal from './EditLinksModal';
import { useQuickLinkItems } from './useQuickLinkItems';

const PANEL_GAP_PX = 4;

// Tablet rail only (md → lg): the floating widget is hidden there, so Quick
// Links becomes a rail icon that opens every link in a panel beside the rail.
// Anchored to the trigger's bottom edge because it sits near the bottom of
// the screen — the panel grows upward instead of running off-screen.
const QuickLinksFlyout = () => {
  const links = useQuickLinkItems();
  const [isEditLinksOpen, setIsEditLinksOpen] = useState(false);
  const panelId = useId();
  const { isOpen, style, triggerRef, panelRef, toggle, close } =
    useAnchoredPopover((rect) => ({
      left: rect.right + PANEL_GAP_PX,
      bottom: window.innerHeight - rect.bottom,
    }));

  if (!links) return null;

  return (
    <>
      <Tooltip label="Quick Links" side="right" className="w-full">
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          aria-label="Quick Links"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          className="min-h-10 w-full flex items-center justify-center border-t border-neutral-100 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <FaLink size={13} />
        </button>
      </Tooltip>

      {style &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="menu"
            aria-label="Quick Links"
            style={style}
            className="fixed z-40 w-52 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg py-1 animate-in fade-in slide-in-from-left-2 duration-150"
          >
            <QuickLinkMenuItems
              links={links}
              onEditLinks={() => {
                close();
                setIsEditLinksOpen(true);
              }}
            />
          </div>,
          document.body,
        )}

      {isEditLinksOpen && (
        <EditLinksModal
          isOpen={isEditLinksOpen}
          onClose={() => setIsEditLinksOpen(false)}
        />
      )}
    </>
  );
};

export default QuickLinksFlyout;
