import { useDarkMode } from 'hooks/useDarkMode';
import { FaSun, FaMoon } from 'react-icons/fa';
import { clsx } from 'clsx';

interface DarkModeToggleProps {
  isExpanded: boolean;
}

const DarkModeToggle = ({ isExpanded }: DarkModeToggleProps) => {
  const { isDark, toggleDark } = useDarkMode();

  return (
    <button
      onClick={toggleDark}
      className={clsx(
        'h-12 flex items-center transition-all duration-300 group shrink-0 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 justify-center w-auto lg:w-full lg:border-t border-gray-100 dark:border-gray-700 lg:hover:bg-gray-50 lg:dark:hover:bg-gray-700',
        isExpanded && 'lg:gap-3 lg:px-4',
      )}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <FaSun
          size={18}
          className="lg:size-5 group-hover:scale-110 group-hover:text-amber-500 transition-all shrink-0"
        />
      ) : (
        <FaMoon
          size={16}
          className="lg:size-[18px] group-hover:scale-110 group-hover:text-blue-500 transition-all shrink-0"
        />
      )}
      {isExpanded && (
        <span className="hidden lg:block text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

export default DarkModeToggle;
