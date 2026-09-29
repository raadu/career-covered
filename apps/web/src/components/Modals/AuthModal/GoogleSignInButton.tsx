import { FcGoogle } from 'react-icons/fc';
import { clsx } from 'clsx';
import { TEXT_BUTTON_HEIGHT } from 'components/common/buttonSizes';

interface GoogleSignInButtonProps {
  onClick: () => void;
}

const GoogleSignInButton = ({ onClick }: GoogleSignInButtonProps) => (
  <button
    onClick={onClick}
    className={clsx(
      'w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 font-semibold transition-all text-sm',
      TEXT_BUTTON_HEIGHT,
    )}
  >
    <FcGoogle size={16} />
    Continue with Google
  </button>
);

export default GoogleSignInButton;
