import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setApiKey } from 'store/coverLetterSlice';
import CommonButton from 'components/common/CommonButton';
import { PROVIDER_NAME } from 'utils/AIModelUtils';
import { FaKey, FaTimes } from 'react-icons/fa';
import PrimaryOnboardingUI from './PrimaryOnboardingUI';
import DetailedOnboardingUI from './DetailedOnboardingUI';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

const OnboardingModal = ({ isOpen, onComplete, onClose }: OnboardingModalProps) => {
  const [tempKey, setTempKey] = useState('');
  const [view, setView] = useState<'primary' | 'detailed'>('primary');
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-all overscroll-none"
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

        <div className="p-7 md:p-10 space-y-5 text-center">
          {view === 'primary' ? (
            <PrimaryOnboardingUI 
              onShowDetailed={() => setView('detailed')} 
              isSettingsMode={!!onClose}
            />
          ) : (
            <DetailedOnboardingUI 
              onBack={() => setView('primary')} 
            />
          )}

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors">
                <FaKey
                  className="text-gray-300 group-focus-within:text-blue-400 transition-colors"
                  size={13}
                />
              </div>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder={`Enter your ${PROVIDER_NAME} API Key here`}
                className="pl-11 w-full h-11 border border-gray-100 rounded-md focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none text-sm bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-400 font-mono"
              />
            </div>
            <CommonButton
              variant="gradient"
              onClick={handleStart}
              disabled={!tempKey.trim()}
              className="h-11 px-8 text-xs uppercase tracking-widest font-black active:scale-[0.98] rounded-md"
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
