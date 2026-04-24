import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setApiKey } from 'store/coverLetterSlice';
import CommonButton from 'components/common/CommonButton';
import { PROVIDER_NAME, PROVIDER_URL } from 'utils/AIModelUtils';
import { FaKey, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

const OnboardingModal = ({ isOpen, onComplete, onClose }: OnboardingModalProps) => {
  const [tempKey, setTempKey] = useState('');
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleStart = () => {
    if (tempKey.trim()) {
      dispatch(setApiKey(tempKey.trim()));
      localStorage.setItem('cl_visited_before', 'true');
      onComplete();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md transition-all overscroll-none"
      onClick={() => onClose && onClose()}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 scrollbar-hide border border-white/20 relative"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50 z-10"
            aria-label="Close"
          >
            <FaTimes size={15} />
          </button>
        )}

        <div className="p-7 md:p-10 space-y-7 text-center">
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {onClose ? 'How to get your API Key' : 'It’s so easy to start!'}
            </h1>
            <p className="text-gray-500 text-[15px] max-w-xs mx-auto leading-relaxed">
              {`You need an API key. It’s easy to get one for free. Just follow the steps.`}
            </p>
          </div>

          <div className="text-left space-y-4 py-2">
            <ol className="space-y-4 text-[14px] text-gray-600">
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">1</span>
                <div className="flex-1">
                  Go to <a href={PROVIDER_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors underline underline-offset-4 decoration-blue-200">groq website <FaExternalLinkAlt size={9} /></a>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">2</span>
                <div className="flex-1">
                  Login with your google account.
                  <p className="text-[11px] text-gray-400 mt-0.5">You can also use other login methods.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">3</span>
                <div className="flex-1">
                  Go to this page after login: <a href={PROVIDER_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors underline underline-offset-4 decoration-blue-200">groq console <FaExternalLinkAlt size={9} /></a>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">4</span>
                <div className="flex-1 font-medium text-gray-700">You can see "API Keys" written in the top right corner. Click it.</div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">5</span>
                <div className="flex-1 font-medium text-gray-700">Then click "Create API Key" button. Put any display name and expiration you want. Click "Submit" button.</div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">6</span>
                <div className="flex-1 font-medium text-gray-700">Copy the API Key and come back here. Put the copied API key in the box below.</div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">7</span>
                <div className="flex-1 font-medium text-gray-700">Press Start.</div>
              </li>
            </ol>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                <FaKey className="text-gray-300 group-focus-within:text-blue-400 transition-colors" size={13} />
              </div>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder={`Enter your ${PROVIDER_NAME} API Key here`}
                className="pl-11 w-full h-11 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none text-sm bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-400 font-mono"
              />
            </div>
            <CommonButton
              variant="gradient"
              onClick={handleStart}
              disabled={!tempKey.trim()}
              className="h-11 px-8 text-xs uppercase tracking-widest font-black active:scale-[0.98]"
            >
              Start
            </CommonButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
