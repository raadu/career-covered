interface FooterProps {
  onClose: () => void;
}

const Footer = ({ onClose }: FooterProps) => {
  return (
    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
      >
        Got it
      </button>
    </div>
  );
};

export default Footer;
