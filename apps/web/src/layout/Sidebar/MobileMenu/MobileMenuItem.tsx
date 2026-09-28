import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import type { IconType } from 'react-icons';
import Tooltip from 'components/common/Tooltip';

interface MobileMenuItemProps {
  Icon: IconType;
  label: string;
  /** Navigates when set; otherwise renders a button. */
  to?: string;
  onClick: () => void;
  /** Right-aligned extra content, e.g. a submenu chevron. */
  trailing?: ReactNode;
  ariaExpanded?: boolean;
  variant?: 'default' | 'danger';
  isNested?: boolean;
  /** Dims the row (e.g. a quick link with no saved value). */
  isMuted?: boolean;
}

const MobileMenuItem = ({
  Icon,
  label,
  to,
  onClick,
  trailing,
  ariaExpanded,
  variant = 'default',
  isNested = false,
  isMuted = false,
}: MobileMenuItemProps) => {
  const className = clsx(
    'w-full min-h-10 flex items-center gap-3 text-sm font-medium text-left transition-colors',
    isNested ? 'pl-9 pr-4' : 'px-4',
    // Touch browsers keep the last-tapped element in :hover, which left a
    // tapped row looking selected. Hover styles only apply where real hover
    // exists; taps get brief active-state feedback instead.
    variant === 'danger'
      ? 'text-danger dark:text-danger-fg-dark active:bg-danger-subtle dark:active:bg-danger-subtle-dark [@media(hover:hover)]:hover:bg-danger-subtle dark:[@media(hover:hover)]:hover:bg-danger-subtle-dark'
      : 'text-neutral-700 dark:text-neutral-200 active:bg-neutral-100 dark:active:bg-neutral-800 [@media(hover:hover)]:hover:bg-neutral-100 dark:[@media(hover:hover)]:hover:bg-neutral-800',
    isMuted && 'opacity-50',
  );
  const content = (
    <>
      <Icon aria-hidden className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </>
  );

  return (
    <Tooltip label={label} side="left" className="w-full">
      {to ? (
        <Link to={to} role="menuitem" onClick={onClick} className={className}>
          {content}
        </Link>
      ) : (
        <button
          type="button"
          role="menuitem"
          aria-expanded={ariaExpanded}
          onClick={onClick}
          className={className}
        >
          {content}
        </button>
      )}
    </Tooltip>
  );
};

export default MobileMenuItem;
