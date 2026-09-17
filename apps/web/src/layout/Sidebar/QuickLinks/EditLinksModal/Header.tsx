import { FaTimes, FaPencilAlt } from 'react-icons/fa';

interface HeaderProps {
  onClose: () => void;
}

const Header = ({ onClose }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center gap-2">
        <div className="bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 p-1">
          <FaPencilAlt size={14} />
        </div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Edit Quick Links
        </h3>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Close modal"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Header;
