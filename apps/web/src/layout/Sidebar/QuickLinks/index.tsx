import { useState, type MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from 'store';
import { useCopy } from 'hooks/useCopy';
import {
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaEnvelope,
  FaPencilAlt,
} from 'react-icons/fa';
import { clsx } from 'clsx';
import EditLinksModal from './EditLinksModal';

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

interface LinkItem {
  key: string;
  Icon: typeof FaLinkedin;
  title: string;
  value: string | null | undefined;
  label: string;
  hover: string;
  handleCopy: (value: string, label?: string, e?: MouseEvent) => void;
}

interface QuickLinksButtonListProps {
  links: LinkItem[];
  layout: 'row' | 'column';
  onEditClick: () => void;
}

const QuickLinksButtonList = ({
  links,
  layout,
  onEditClick,
}: QuickLinksButtonListProps) => (
  <div
    className={clsx(
      'flex items-center shrink-0',
      layout === 'row' ? 'gap-0.5' : 'flex-col gap-1',
    )}
  >
    {links.map(({ key, Icon, title, value, label, hover, handleCopy }) => (
      <button
        key={key}
        onClick={(e) => handleCopy(value ?? '', label, e)}
        title={title}
        className={linkButtonClass(!!value, hover)}
      >
        <Icon size={14} />
      </button>
    ))}
    {layout === 'column' && (
      <div className="w-4 h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
    )}
    <button onClick={onEditClick} title="Edit links" className={editButtonClass}>
      <FaPencilAlt size={14} />
    </button>
  </div>
);

const QuickLinks = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const linkedin = useCopy();
  const github = useCopy();
  const website = useCopy();
  const email = useCopy();

  if (!isAuthenticated || !user) return null;

  const links: LinkItem[] = [
    {
      key: 'linkedin',
      Icon: FaLinkedin,
      title: 'Copy LinkedIn link',
      value: user.linkedinUrl,
      label: 'LinkedIn link',
      hover: 'hover:text-blue-600 dark:hover:text-blue-400',
      handleCopy: linkedin.handleCopy,
    },
    {
      key: 'github',
      Icon: FaGithub,
      title: 'Copy GitHub link',
      value: user.githubUrl,
      label: 'GitHub link',
      hover: 'hover:text-neutral-900 dark:hover:text-neutral-100',
      handleCopy: github.handleCopy,
    },
    {
      key: 'website',
      Icon: FaGlobe,
      title: 'Copy website link',
      value: user.websiteUrl,
      label: 'Website link',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      handleCopy: website.handleCopy,
    },
    {
      key: 'email',
      Icon: FaEnvelope,
      title: 'Copy contact email',
      value: user.contactEmail,
      label: 'Contact email',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      handleCopy: email.handleCopy,
    },
  ];

  return (
    <>
      {/* Mobile: inline row inside the sidebar's top bar */}
      <div className="flex md:hidden shrink-0">
        <QuickLinksButtonList
          links={links}
          layout="row"
          onEditClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Tablet/desktop: floating widget attached to the sidebar's border,
          outside it — see Modal.tsx's portal comment for why anything
          rendered from inside <aside> needs to escape its stacking context;
          this one is a plain positioned div, not a modal, so it doesn't
          need a portal, but it does need to sit outside the rail's own box
          via translate-x-full to read as "attached to the edge," not "part
          of the sidebar." */}
      <div className="hidden md:flex flex-col items-center gap-1 absolute top-1/2 -translate-y-1/2 right-0 translate-x-full bg-white dark:bg-neutral-900 border border-l-0 border-neutral-200 dark:border-neutral-700 shadow-sm py-2 px-1.5 z-20">
        <QuickLinksButtonList
          links={links}
          layout="column"
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
