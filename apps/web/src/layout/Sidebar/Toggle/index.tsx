import { HiChevronRight, HiChevronLeft } from 'react-icons/hi';
import Tooltip from 'components/common/Tooltip';

interface SidebarToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

// Only ever shown at `lg:` — collapsing/expanding is a desktop-only
// affordance, the tablet rail below `lg:` has no variable width to toggle.
const SidebarToggle = ({ isExpanded, onToggle }: SidebarToggleProps) => {
  const label = isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar';

  return (
    <Tooltip label={label} side="right" className="w-full hidden lg:flex">
      <button
        onClick={onToggle}
        aria-label={label}
        className="min-h-10 w-full text-neutral-400 dark:text-neutral-500 hover:text-brand-600 dark:hover:text-brand-400 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300 group shrink-0"
      >
        {isExpanded ? (
          <HiChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
        ) : (
          <HiChevronRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        )}
      </button>
    </Tooltip>
  );
};

export default SidebarToggle;
