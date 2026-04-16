import { FaExternalLinkAlt } from 'react-icons/fa';

interface FooterProps {
  onClose: () => void;
  providerName: string;
  providerUrl: string;
}

const Footer = ({ onClose, providerName, providerUrl }: FooterProps) => {
  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        Close
      </button>
      <a
        href={providerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        Get {providerName} Key <FaExternalLinkAlt size={12} />
      </a>
    </div>
  );
};

export default Footer;
