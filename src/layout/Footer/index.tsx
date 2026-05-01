import { useState } from 'react';
import PrivacyModal from 'components/Modals/PrivacyModal';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <footer className="h-12 w-full text-[10px] sm:text-xs text-gray-400 border-t border-gray-100 flex items-center justify-between px-4 sm:px-6 bg-white shrink-0 mt-auto">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="hover:text-blue-600 underline decoration-gray-300 underline-offset-2 transition-colors focus:outline-none"
      >
        We don't store your data.
      </button>
      <div>
        Made with <span className="text-red-400">❤️</span> by{' '}
        <a 
          href="https://raadu.github.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-gray-500 hover:text-blue-600 transition-colors"
        >
          Raad
        </a>.
      </div>
      
      <PrivacyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </footer>
  );
};

export default Footer;
