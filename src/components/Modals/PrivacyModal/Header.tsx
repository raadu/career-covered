import { FaTimes } from 'react-icons/fa';

interface HeaderProps {
  onClose: () => void;
}

const Header = ({ onClose }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">
        Data Privacy
      </h3>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
        aria-label="Close modal"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Header;
