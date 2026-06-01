import { FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface SidebarHeaderProps {
  isExpanded: boolean;
}

const SidebarHeader = ({ isExpanded }: SidebarHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="p-3 lg:p-4 border-r lg:border-r-0 lg:border-b border-gray-100 dark:border-gray-800 flex items-center h-14 lg:h-16 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors shrink-0" 
      title="Career Covered"
      onClick={() => navigate('/')}
    >
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1.5 rounded-lg shrink-0 shadow-lg shadow-cyan-500/20">
          <FaUserShield className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
        </div>
        <h1 
            className={`text-sm lg:text-[17px] font-black bg-gradient-to-r from-gray-900 dark:from-white to-gray-600 dark:to-gray-300 bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all duration-300 hidden sm:block ${
                isExpanded ? 'opacity-100 w-auto ml-1' : 'opacity-0 w-0'
            }`}
        >
          Career Covered
        </h1>
      </div>
    </div>
  );
};

export default SidebarHeader;
