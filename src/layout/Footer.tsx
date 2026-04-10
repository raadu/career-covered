import React, { useState } from 'react';
import PrivacyModal from '../components/PrivacyModal';

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <footer className="w-full py-2 mt-4 text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between px-4 bg-gradient-to-r from-cyan-50/50 to-blue-50/50">
      <div className="flex items-center mb-1 md:mb-0">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hover:text-blue-600 underline decoration-blue-200 underline-offset-2 transition-colors focus:outline-none"
        >
          We don't store your data.
        </button>
      </div>
      <div>
        Made with <span className="text-red-500">❤️</span> by{' '}
        <a 
          href="https://raadu.github.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Raad
        </a>.
      </div>
      
      <PrivacyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </footer>
  );
};

export default Footer;
