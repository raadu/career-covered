import { FaTimes, FaSlidersH } from 'react-icons/fa';

interface HeaderProps {
  onClose: () => void;
}

const Header = ({ onClose }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-2">
        <div className="bg-cyan-100 text-cyan-600 p-1.5 rounded-lg">
          <FaSlidersH size={14} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Cover Letter Customization
        </h3>
      </div>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"
        aria-label="Close modal"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Header;
