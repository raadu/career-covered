import { FaUserShield } from 'react-icons/fa';

const MobileHeader = () => {
  return (
    <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
       <div className="flex items-center gap-2 cursor-pointer" title="Career Covered">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1.5 rounded-lg shadow-lg shadow-cyan-500/30">
            <FaUserShield size={16} />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Career Covered</span>
       </div>
    </header>
  );
};

export default MobileHeader;
