import SidebarHeader from 'layout/Sidebar/Header';
import SidebarNavigation from 'layout/Sidebar/Navigation';
import SidebarToggle from 'layout/Sidebar/Toggle';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isExpanded, onToggle }: SidebarProps) => {
  return (
    <aside 
      className={`${
        isExpanded ? 'w-56' : 'w-16'
      } bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out relative`}
    >
      <SidebarHeader isExpanded={isExpanded} />
      <SidebarNavigation isExpanded={isExpanded} />
      <SidebarToggle isExpanded={isExpanded} onToggle={onToggle} />
    </aside>
  );
};

export default Sidebar;
