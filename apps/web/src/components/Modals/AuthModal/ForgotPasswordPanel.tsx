import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLifeRing } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';
import { TEXT_BUTTON_HEIGHT } from 'components/common/buttonSizes';

interface ForgotPasswordPanelProps {
  onBack: () => void;
  onClose: () => void;
}

// There's no automated reset flow (no reset endpoint or email sending yet),
// so this explains the manual route instead of a dead-end link.
const ForgotPasswordPanel = ({ onBack, onClose }: ForgotPasswordPanelProps) => {
  const navigate = useNavigate();

  const contactSupport = () => {
    onClose();
    navigate('/support');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
        <p>
          Password resets aren't automated yet. Get in touch through the Support
          page and I'll help you get back into your account.
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Signed up with Google? There's no password to reset — just use{' '}
          <strong>Continue with Google</strong>.
        </p>
      </div>

      <CommonButton
        fullWidth
        icon={<FaLifeRing size={ICON_SIZE.xs} />}
        onClick={contactSupport}
      >
        Contact Support
      </CommonButton>

      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-1.5 ${TEXT_BUTTON_HEIGHT} px-2 text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors`}
        >
          <FaArrowLeft size={10} />
          Back to sign in
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPanel;
