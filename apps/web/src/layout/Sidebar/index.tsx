import SidebarHeader from 'layout/Sidebar/Header';
import SidebarNavigation from 'layout/Sidebar/Navigation';
import SidebarToggle from 'layout/Sidebar/Toggle';
import DarkModeToggle from 'layout/Sidebar/DarkModeToggle';
import QuickLinks from 'layout/Sidebar/QuickLinks';
import MobileMenu from 'layout/Sidebar/MobileMenu';
import ProfileSection from './ProfileSection';
import { clsx } from 'clsx';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isExpanded, onToggle }: SidebarProps) => {
  return (
    // Three states, not two: below `md:` this is a horizontal top bar
    // (phone) with the secondary controls behind a hamburger menu; `md:` and
    // up it's a vertical rail, icon-only by default (tablet); only at `lg:`
    // does it gain the expand/collapse width toggle and labels.
    <aside
      className={clsx(
        'bg-white dark:bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-row md:flex-col items-center md:items-stretch transition-all duration-300 ease-in-out relative shrink-0 z-10 w-full md:w-16 h-auto md:h-full pr-1 md:pr-0',
        isExpanded && 'lg:w-[180px]',
      )}
    >
      <SidebarHeader isExpanded={isExpanded} />
      <SidebarNavigation isExpanded={isExpanded} />
      <div className="md:hidden">
        <MobileMenu />
      </div>
      <div className="hidden md:flex flex-col mt-auto items-stretch w-full">
        <ProfileSection isExpanded={isExpanded} />
        <QuickLinks />
        <DarkModeToggle isExpanded={isExpanded} />
        <SidebarToggle isExpanded={isExpanded} onToggle={onToggle} />
      </div>
    </aside>
  );
};

export default Sidebar;
