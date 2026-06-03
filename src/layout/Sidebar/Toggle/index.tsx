import { HiChevronRight, HiChevronLeft } from 'react-icons/hi';

interface SidebarToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SidebarToggle = ({ isExpanded, onToggle }: SidebarToggleProps) => {
  return (
    <button 
        onClick={onToggle}
        className="h-12 w-full text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 border-t border-gray-100 dark:border-gray-700 hidden lg:flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group shrink-0"
        title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
    >
        {isExpanded ? (
            <HiChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
        ) : (
            <HiChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
        )}
    </button>
  );
};

export default SidebarToggle;
