import { useState } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { clsx } from 'clsx';
import Tooltip from 'components/common/Tooltip';
import EditLinksModal from './EditLinksModal';
import { useQuickLinkItems, type QuickLinkItem } from './useQuickLinkItems';

// LinkedIn blue and GitHub black/white are real brand colors, kept as-is —
// everything else (website, email, edit) uses the app's own brand accent
// rather than an arbitrary per-icon hue, replacing the previous blue/gray/
// emerald/amber/cyan five-color row with one deliberate accent plus the two
// icons that have a genuine brand identity of their own.
const linkButtonClass = (isSet: boolean, hoverColorClass: string) =>
  clsx(
    'min-h-10 min-w-10 flex items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0',
    hoverColorClass,
    !isSet && 'opacity-40',
  );

const editButtonClass = clsx(
  linkButtonClass(true, 'hover:text-brand-600 dark:hover:text-brand-400'),
);

interface QuickLinksButtonListProps {
  links: QuickLinkItem[];
  onEditClick: () => void;
}

const QuickLinksButtonList = ({
  links,
  onEditClick,
}: QuickLinksButtonListProps) => (
  <div className="flex flex-col items-center gap-1 shrink-0">
    {links.map(({ key, Icon, title, value, label, hover, handleCopy }) => (
      <Tooltip key={key} label={title} side="right">
        <button
          onClick={(e) => handleCopy(value ?? '', label, e)}
          aria-label={title}
          className={linkButtonClass(!!value, hover)}
        >
          <Icon size={14} />
        </button>
      </Tooltip>
    ))}
    <div className="w-4 h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
    <Tooltip label="Edit links" side="right">
      <button
        onClick={onEditClick}
        aria-label="Edit links"
        className={editButtonClass}
      >
        <FaPencilAlt size={14} />
      </button>
    </Tooltip>
  </div>
);

// Desktop only (lg+). Phones get these links in the hamburger menu's Quick
// Links submenu (MobileMenu/MobileQuickLinks); tablets get a rail icon that
// opens them in a panel (QuickLinksFlyout).
const QuickLinks = () => {
  const links = useQuickLinkItems();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!links) return null;

  return (
    <>
      {/* Floating widget attached to the sidebar's border, outside it —
          see Modal.tsx's portal comment for why anything rendered from
          inside <aside> needs to escape its stacking context; this one is a
          plain positioned div, not a modal, so it doesn't need a portal,
          but it does need to sit outside the rail's own box via
          translate-x-full to read as "attached to the edge," not "part of
          the sidebar." */}
      <div className="hidden lg:flex flex-col items-center gap-1 absolute top-1/2 -translate-y-1/2 right-0 translate-x-full bg-white dark:bg-neutral-900 border border-l-0 border-neutral-200 dark:border-neutral-700 shadow-sm py-2 px-1.5 z-20">
        <QuickLinksButtonList
          links={links}
          onEditClick={() => setIsModalOpen(true)}
        />
      </div>

      {isModalOpen && (
        <EditLinksModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default QuickLinks;
