import SidebarHeader from 'layout/Sidebar/Header';
import SidebarNavigation from 'layout/Sidebar/Navigation';
import SidebarToggle from 'layout/Sidebar/Toggle';
import DarkModeToggle from 'layout/Sidebar/DarkModeToggle';
import QuickLinks from 'layout/Sidebar/QuickLinks';
import ProfileSection from './ProfileSection';
import { clsx } from 'clsx';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isExpanded, onToggle }: SidebarProps) => {
  return (
    // Three states, not two: below `md:` this is a horizontal top bar
    // (phone); `md:` and up it's a vertical rail, icon-only by default
    // (tablet — there was previously no distinct treatment here at all,
    // it inherited the phone layout up to `lg:`); only at `lg:` does it
    // gain the expand/collapse width toggle and labels.
    <aside
      className={clsx(
        'bg-white dark:bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-row md:flex-col items-center md:items-stretch transition-all duration-300 ease-in-out relative shrink-0 z-10 w-full md:w-16 h-auto md:h-full',
        isExpanded && 'lg:w-56',
      )}
    >
      <SidebarHeader isExpanded={isExpanded} />
      <SidebarNavigation isExpanded={isExpanded} />
      <div className="flex md:flex-col ml-auto md:ml-0 md:mt-auto items-center md:items-stretch md:w-full gap-1 md:gap-0 pr-3 md:pr-0">
        <ProfileSection isExpanded={isExpanded} />
        <QuickLinks />
        <DarkModeToggle isExpanded={isExpanded} />
        <SidebarToggle isExpanded={isExpanded} onToggle={onToggle} />
      </div>
    </aside>
  );
};

export default Sidebar;
