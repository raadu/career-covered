import { FaPencilAlt } from 'react-icons/fa';
import type { QuickLinkItem } from 'layout/Sidebar/QuickLinks/useQuickLinkItems';
import MobileMenuItem from './MobileMenuItem';

interface QuickLinkMenuItemsProps {
  links: QuickLinkItem[];
  onEditLinks: () => void;
  /** Indent the rows under a parent "Quick Links" row. */
  isNested?: boolean;
}

// The five copy-to-clipboard links plus "Edit links", as menu rows. Shared
// by the phone menu's Quick Links submenu and the tablet rail's flyout.
const QuickLinkMenuItems = ({
  links,
  onEditLinks,
  isNested = false,
}: QuickLinkMenuItemsProps) => (
  <>
    {links.map(({ key, Icon, name, value, label, handleCopy }) => (
      <MobileMenuItem
        key={key}
        Icon={Icon}
        label={name}
        isNested={isNested}
        isMuted={!value}
        onClick={() => handleCopy(value ?? '', label)}
      />
    ))}
    <MobileMenuItem
      Icon={FaPencilAlt}
      label="Edit links"
      isNested={isNested}
      onClick={onEditLinks}
    />
  </>
);

export default QuickLinkMenuItems;
