import Header from './Header';
import Steps from './Steps';
import Footer from './Footer';

interface ApiHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  providerUrl: string;
}

const ApiHelpModal = ({ isOpen, onClose, providerName, providerUrl }: ApiHelpModalProps) => {
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
        <Header onClose={onClose} />
        
        <div className="p-5 text-sm text-gray-600 space-y-4">
          <p>
            To generate cover letters, you need an API key from <strong>{providerName}</strong>. This project connects directly to their service to process requests.
          </p>
          
          <Steps providerName={providerName} />
          
          <p className="text-xs text-gray-500 italic pb-2 border-b border-gray-100">
            Your API key is stored locally in your browser and is never sent to our servers.
          </p>
          
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
            <p className="text-[11px] leading-relaxed text-gray-400">
              Sorry, I&apos;m unable to provide AI models for free right now due to budget constraints. So you have to use your own API key. If you want to contribute to the project then please <a href="https://www.linkedin.com/in/raiyadraad" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-semibold underline underline-offset-2 transition-colors">contact me</a>.
            </p>
          </div>
        </div>
        
        <Footer 
          onClose={onClose} 
          providerName={providerName} 
          providerUrl={providerUrl} 
        />
      </div>
    </div>
  );
};

export default ApiHelpModal;
