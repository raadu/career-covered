import { FaFileAlt } from 'react-icons/fa';

interface SidebarNavigationProps {
  isExpanded: boolean;
}

const SidebarNavigation = ({ isExpanded }: SidebarNavigationProps) => {
  return (
    <nav className="flex-1 p-3 space-y-2">
      <div 
        className="p-2.5 bg-gradient-to-r from-cyan-50 to-blue-50 text-blue-900 border border-blue-100 hover:border-blue-200 rounded-lg flex items-center gap-3 font-medium cursor-pointer overflow-hidden justify-center transition-all shadow-sm"
        title="Cover Letter Generator"
        style={{ justifyContent: isExpanded ? 'flex-start' : 'center' }}
      >
        <FaFileAlt className="shrink-0 text-cyan-600" size={16} />
        <span className={`transition-opacity duration-300 text-sm ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            Cover Letter Generator
        </span>
      </div>
    </nav>
  );
};

export default SidebarNavigation;
