import { useState } from 'react';
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

const linkButtonClass = (isSet: boolean, hoverColorClass: string) =>
  clsx(
    'p-1.5 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0',
    hoverColorClass,
    !isSet && 'opacity-40',
  );

const editButtonClass =
  'p-1.5 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0';

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

  const links = [
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
      hover: 'hover:text-gray-900 dark:hover:text-gray-100',
      handleCopy: github.handleCopy,
    },
    {
      key: 'website',
      Icon: FaGlobe,
      title: 'Copy website link',
      value: user.websiteUrl,
      label: 'Website link',
      hover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
      handleCopy: website.handleCopy,
    },
    {
      key: 'email',
      Icon: FaEnvelope,
      title: 'Copy contact email',
      value: user.contactEmail,
      label: 'Contact email',
      hover: 'hover:text-amber-600 dark:hover:text-amber-400',
      handleCopy: email.handleCopy,
    },
  ];

  return (
    <>
      {/* Mobile: inline row inside the sidebar's top bar */}
      <div className="flex lg:hidden items-center gap-0.5 shrink-0">
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
        <button
          onClick={() => setIsModalOpen(true)}
          title="Edit links"
          className={editButtonClass}
        >
          <FaPencilAlt size={14} />
        </button>
      </div>

      {/* Desktop: floating widget attached to the sidebar's border, outside it */}
      <div className="hidden lg:flex flex-col items-center gap-1 absolute top-1/2 -translate-y-1/2 right-0 translate-x-full bg-white dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-xl shadow-sm py-2 px-1.5 z-20">
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
        <div className="w-4 h-px bg-gray-200 dark:bg-gray-700 my-0.5" />
        <button
          onClick={() => setIsModalOpen(true)}
          title="Edit links"
          className={editButtonClass}
        >
          <FaPencilAlt size={14} />
        </button>
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
