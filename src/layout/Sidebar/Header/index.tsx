import { FaUserShield } from 'react-icons/fa';

interface SidebarHeaderProps {
  isExpanded: boolean;
}

const SidebarHeader = ({ isExpanded }: SidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-100 flex items-center justify-between h-16 cursor-pointer" title="Career Covered">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1.5 rounded-lg shrink-0 shadow-lg shadow-cyan-500/30">
          <FaUserShield size={16} />
        </div>
        <h1 
            className={`text-lg font-extrabold bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}
        >
          Career Covered
        </h1>
      </div>
    </div>
  );
};

export default SidebarHeader;
