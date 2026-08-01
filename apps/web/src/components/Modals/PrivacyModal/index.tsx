import Header from './Header';
import Content from './Content';
import Footer from './Footer';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal = ({ isOpen, onClose }: PrivacyModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <Header onClose={onClose} />
        <Content />
        <Footer onClose={onClose} />
      </div>
    </div>
  );
};

export default PrivacyModal;
