interface FooterProps {
  onSave: () => void;
}

const Footer = ({ onSave }: FooterProps) => {
  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
      <button
        onClick={onSave}
        className="px-5 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
      >
        Save Options
      </button>
    </div>
  );
};

export default Footer;
