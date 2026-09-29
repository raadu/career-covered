import { useState } from 'react';
import { FaChevronDown, FaLink } from 'react-icons/fa';
import { clsx } from 'clsx';
import type { QuickLinkItem } from 'layout/Sidebar/QuickLinks/useQuickLinkItems';
import MobileMenuItem from './MobileMenuItem';
import QuickLinkMenuItems from './QuickLinkMenuItems';

interface MobileQuickLinksProps {
  links: QuickLinkItem[];
  onEditLinks: () => void;
}

// Collapsed by default so the menu stays short; each entry copies its
// saved value, exactly like the desktop floating widget.
const MobileQuickLinks = ({ links, onEditLinks }: MobileQuickLinksProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <MobileMenuItem
        Icon={FaLink}
        label="Quick Links"
        ariaExpanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        trailing={
          <FaChevronDown
            aria-hidden
            className={clsx(
              'w-3 h-3 shrink-0 transition-transform duration-200',
              isOpen ? 'rotate-0' : '-rotate-90',
            )}
          />
        }
      />
      {isOpen && (
        <div role="group" aria-label="Quick Links">
          <QuickLinkMenuItems
            links={links}
            onEditLinks={onEditLinks}
            isNested
          />
        </div>
      )}
    </>
  );
};

export default MobileQuickLinks;
