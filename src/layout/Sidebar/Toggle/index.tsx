import { HiChevronRight, HiChevronLeft } from 'react-icons/hi';

interface SidebarToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SidebarToggle = ({ isExpanded, onToggle }: SidebarToggleProps) => {
  return (
    <button 
        onClick={onToggle}
        className="h-12 w-full text-gray-400 hover:text-blue-600 border-t border-gray-100 flex items-center justify-center hover:bg-blue-50 transition-all duration-300 group"
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
