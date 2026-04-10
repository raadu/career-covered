import React from 'react';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

interface ApiHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  providerUrl: string;
}

const ApiHelpModal: React.FC<ApiHelpModalProps> = ({ isOpen, onClose, providerName, providerUrl }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            How to get your API Key
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-5 text-sm text-gray-600 space-y-4">
          <p>
            To generate cover letters, you need an API key from <strong>{providerName}</strong>. This project connects directly to their service to process requests.
          </p>
          
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2">Steps to secure your key:</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800/80">
              <li>Visit the {providerName} developer console.</li>
              <li>Create a free account or sign in.</li>
              <li>Navigate to the API Keys section.</li>
              <li>Generate a new secret key and copy it.</li>
              <li>Paste the key into the input field here.</li>
            </ol>
          </div>
          
          <p className="text-xs text-gray-500 italic pb-2 border-b border-gray-100">
            Your API key is stored locally in your browser and is never sent to our servers.
          </p>
          
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
            <p className="text-[11px] leading-relaxed text-gray-400">
              Sorry, I&apos;m unable to provide AI models for free right now due to budget constraints. So you have to use your own API key. If you want to contribute to the project then please <a href="https://www.linkedin.com/in/raiyadraad" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-semibold underline underline-offset-2 transition-colors">contact me</a>.
            </p>
          </div>
        </div>
        
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
      </div>
    </div>
  );
};

export default ApiHelpModal;
