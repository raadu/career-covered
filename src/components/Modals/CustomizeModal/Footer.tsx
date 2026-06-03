interface FooterProps {
  onSave: () => void;
  onReset: () => void;
}

const Footer = ({ onSave, onReset }: FooterProps) => {
  return (
    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-lg"
      >
        Reset
      </button>
      <button
        onClick={onSave}
        className="px-5 py-2 text-sm font-bold text-white bg-gray-800 dark:bg-gray-600 rounded-lg hover:bg-black dark:hover:bg-gray-500 transition-all shadow-sm active:scale-95"
      >
        Save Options
      </button>
    </div>
  );
};

export default Footer;
