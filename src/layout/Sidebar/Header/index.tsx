import { FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface SidebarHeaderProps {
  isExpanded: boolean;
}

const SidebarHeader = ({ isExpanded }: SidebarHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="p-4 border-b border-gray-100 flex items-center h-16 cursor-pointer hover:bg-gray-50/50 transition-colors" 
      title="Career Covered"
      onClick={() => navigate('/')}
    >
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1.5 rounded-lg shrink-0 shadow-lg shadow-cyan-500/20">
          <FaUserShield size={18} />
        </div>
        <h1 
            className={`text-[17px] font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all duration-300 ${
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
