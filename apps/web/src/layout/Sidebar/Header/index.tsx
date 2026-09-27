import { FaUserShield } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import Tooltip from 'components/common/Tooltip';

interface SidebarHeaderProps {
  isExpanded: boolean;
}

const SidebarHeader = ({ isExpanded }: SidebarHeaderProps) => {
  return (
    <Tooltip
      label="Career Covered"
      side="bottom"
      className="shrink-0 md:border-b border-neutral-100 dark:border-neutral-800"
    >
      <Link
        to="/"
        aria-label="Career Covered"
        className="px-3 flex items-center gap-2 h-14 md:h-16 w-full hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="bg-brand-600 text-white p-1.5 shrink-0">
          <FaUserShield className="w-4 h-4 md:w-[18px] md:h-[18px]" />
        </div>
        {/* Sized to fit the 180px expanded rail without clipping. */}
        <span
          className={clsx(
            'text-[15px] font-black text-neutral-900 dark:text-neutral-100 whitespace-nowrap overflow-hidden transition-all duration-300 hidden',
            isExpanded && 'lg:block',
          )}
        >
          Career Covered
        </span>
      </Link>
    </Tooltip>
  );
};

export default SidebarHeader;
