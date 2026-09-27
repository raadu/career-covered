import { useDarkMode } from 'hooks/useDarkMode';
import { FaSun, FaMoon } from 'react-icons/fa';
import { clsx } from 'clsx';
import Tooltip from 'components/common/Tooltip';

interface DarkModeToggleProps {
  isExpanded: boolean;
}

// Tablet/desktop only — on phones the toggle lives in the hamburger menu.
const DarkModeToggle = ({ isExpanded }: DarkModeToggleProps) => {
  const { isDark, toggleDark } = useDarkMode();
  const label = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  return (
    <Tooltip label={label} side="right" className="w-full">
      <button
        onClick={toggleDark}
        aria-label={label}
        className={clsx(
          'min-h-10 flex items-center transition-all duration-300 group shrink-0 text-neutral-400 dark:text-neutral-500 hover:text-amber-500 dark:hover:text-amber-400 justify-center w-full border-t border-neutral-100 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800',
          isExpanded && 'lg:gap-2 lg:px-3',
        )}
      >
        {isDark ? (
          <FaSun
            size={14}
            className="group-hover:scale-110 transition-all shrink-0"
          />
        ) : (
          <FaMoon
            size={13}
            className="group-hover:scale-110 transition-all shrink-0"
          />
        )}
        {isExpanded && (
          <span className="hidden lg:block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </button>
    </Tooltip>
  );
};

export default DarkModeToggle;
