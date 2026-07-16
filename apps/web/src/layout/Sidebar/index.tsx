import SidebarHeader from 'layout/Sidebar/Header';
import SidebarNavigation from 'layout/Sidebar/Navigation';
import SidebarToggle from 'layout/Sidebar/Toggle';
import DarkModeToggle from 'layout/Sidebar/DarkModeToggle';
import ProfileSection from './ProfileSection';
import { clsx } from 'clsx';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isExpanded, onToggle }: SidebarProps) => {
  return (
    <aside 
      className={clsx(
        "bg-white dark:bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-row lg:flex-col items-center lg:items-stretch transition-all duration-300 ease-in-out relative shrink-0 z-10 w-full lg:w-auto h-auto lg:h-full",
        isExpanded ? 'lg:w-56' : 'lg:w-16'
      )}
    >
      <SidebarHeader isExpanded={isExpanded} />
      <SidebarNavigation 
        isExpanded={isExpanded} 
      />
      <div className="flex lg:flex-col ml-auto lg:ml-0 lg:mt-auto items-center lg:items-stretch lg:w-full gap-4 lg:gap-0 pr-3 lg:pr-0">
        <ProfileSection isExpanded={isExpanded} />
        <DarkModeToggle isExpanded={isExpanded} />
        <SidebarToggle isExpanded={isExpanded} onToggle={onToggle} />
      </div>
    </aside>
  );
};

export default Sidebar;

