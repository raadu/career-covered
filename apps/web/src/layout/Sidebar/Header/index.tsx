import { FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface SidebarHeaderProps {
  isExpanded: boolean;
}

const SidebarHeader = ({ isExpanded }: SidebarHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="p-3 md:p-4 border-r md:border-r-0 md:border-b border-neutral-100 dark:border-neutral-800 flex items-center h-14 md:h-16 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors shrink-0"
      title="Career Covered"
      onClick={() => navigate('/')}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div className="bg-brand-600 text-white p-1.5 shrink-0">
          <FaUserShield className="w-4 h-4 md:w-[18px] md:h-[18px]" />
        </div>
        <h1
          className={clsx(
            'text-sm md:text-[17px] font-black text-neutral-900 dark:text-neutral-100 whitespace-nowrap overflow-hidden transition-all duration-300 hidden sm:block md:hidden',
            isExpanded ? 'lg:block opacity-100 w-auto ml-1' : 'opacity-0 w-0',
          )}
        >
          Career Covered
        </h1>
      </div>
    </div>
  );
};

export default SidebarHeader;
