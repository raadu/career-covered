interface FooterProps {
  onSave: () => void;
  isSaving: boolean;
}

const Footer = ({ onSave, isSaving }: FooterProps) => {
  return (
    <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end items-center">
      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-4 py-1.5 text-sm font-bold text-white bg-gray-800 dark:bg-gray-600 hover:bg-black dark:hover:bg-gray-500 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <span className="inline-flex items-center gap-2">
            <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
            Saving...
          </span>
        ) : (
          'Save'
        )}
      </button>
    </div>
  );
};

export default Footer;
