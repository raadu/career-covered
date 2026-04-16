interface FooterProps {
  onClose: () => void;
}

const Footer = ({ onClose }: FooterProps) => {
  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        Got it
      </button>
    </div>
  );
};

export default Footer;
