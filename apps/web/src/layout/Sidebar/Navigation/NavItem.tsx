import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import type { IconType } from 'react-icons';
import Tooltip from 'components/common/Tooltip';
import type { TooltipSide } from 'components/common/tooltipPosition';

interface NavItemProps {
  path: string;
  label: string;
  Icon: IconType;
  isActive: boolean;
  isExpanded: boolean;
  tooltipSide: TooltipSide;
  /** Sub-items (Templates, Previously Created) sit indented and smaller. */
  isChild?: boolean;
}

const NavItem = ({
  path,
  label,
  Icon,
  isActive,
  isExpanded,
  tooltipSide,
  isChild = false,
}: NavItemProps) => (
  <Tooltip label={label} side={tooltipSide} className="md:w-full">
    <Link
      to={path}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'group flex items-center transition-all duration-300 relative min-h-10 min-w-10 whitespace-nowrap w-full',
        isChild ? 'md:pl-4 px-2 py-1' : 'px-2 py-1.5',
        isExpanded ? 'justify-center lg:justify-start gap-2' : 'justify-center',
        isActive
          ? isChild
            ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
            : 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
          : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200',
      )}
    >
      <Icon
        aria-hidden
        className={clsx(
          'shrink-0 transition-transform duration-300',
          isChild ? 'w-3.5 h-3.5' : 'w-4 h-4',
          isActive ? 'scale-105' : 'group-hover:scale-105',
        )}
      />
      <span
        className={clsx(
          'font-semibold tracking-tight truncate flex-1 hidden',
          isChild ? 'text-[11px]' : 'text-xs',
          isActive ? 'opacity-100' : 'opacity-80',
          isExpanded && 'lg:block',
        )}
      >
        {label}
      </span>

      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-auto md:left-0 w-4 md:w-0.5 h-0.5 md:h-3 bg-brand-600" />
      )}
    </Link>
  </Tooltip>
);

export default NavItem;
