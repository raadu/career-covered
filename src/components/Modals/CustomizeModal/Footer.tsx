interface FooterProps {
  onSave: () => void;
  onReset: () => void;
}

const Footer = ({ onSave, onReset }: FooterProps) => {
  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
      >
        Reset
      </button>
      <button
        onClick={onSave}
        className="px-5 py-2 text-sm font-bold text-white bg-gray-800 rounded-lg hover:bg-black transition-all shadow-sm active:scale-95"
      >
        Save Options
      </button>
    </div>
  );
};

export default Footer;
