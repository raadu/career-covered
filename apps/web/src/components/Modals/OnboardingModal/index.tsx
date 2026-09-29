import { useState } from 'react';
import { useAppDispatch } from 'store';
import { setApiKey } from 'store/coverLetterSlice';
import CommonButton from 'components/common/CommonButton';
import Modal from 'components/common/Modal';
import { ICON_SIZE } from 'components/common/iconSizes';
import { PROVIDER_NAME } from 'utils/AIModelUtils';
import { setLocalStorageItem } from 'utils/localStorageUtils';
import { FaKey } from 'react-icons/fa';
import PrimaryOnboardingUI from './PrimaryOnboardingUI';
import DetailedOnboardingUI from './DetailedOnboardingUI';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

const OnboardingModal = ({
  isOpen,
  onComplete,
  onClose,
}: OnboardingModalProps) => {
  const [tempKey, setTempKey] = useState('');
  const [view, setView] = useState<'primary' | 'detailed'>('primary');
  const dispatch = useAppDispatch();

  const handleStart = () => {
    if (tempKey.trim()) {
      dispatch(setApiKey(tempKey.trim()));
      setLocalStorageItem('visited_before', 'true');
      onComplete();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose?.()}
      title={onClose ? 'Add Your API Key' : 'Getting Started'}
      icon={<FaKey size={ICON_SIZE.sm} />}
      maxWidth="max-w-xl"
      footer={
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400 transition-colors">
              <FaKey size={ICON_SIZE.xs} />
            </div>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              placeholder={`Enter your ${PROVIDER_NAME} API Key here`}
              className="pl-9 w-full h-10 border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm bg-neutral-50 dark:bg-neutral-800 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-mono text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <CommonButton
            variant="primary"
            onClick={handleStart}
            disabled={!tempKey.trim()}
            className="px-8 text-xs uppercase tracking-widest font-black"
          >
            Start
          </CommonButton>
        </div>
      }
    >
      <div className="space-y-5 text-center">
        {view === 'primary' ? (
          <PrimaryOnboardingUI
            onShowDetailed={() => setView('detailed')}
            isSettingsMode={!!onClose}
          />
        ) : (
          <DetailedOnboardingUI onBack={() => setView('primary')} />
        )}
      </div>
    </Modal>
  );
};

export default OnboardingModal;
