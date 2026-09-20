import { FcGoogle } from 'react-icons/fc';

interface GoogleSignInButtonProps {
  onClick: () => void;
}

const GoogleSignInButton = ({ onClick }: GoogleSignInButtonProps) => (
  <button
    onClick={onClick}
    className="w-full min-h-10 flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 font-semibold transition-all text-sm"
  >
    <FcGoogle size={16} />
    Continue with Google
  </button>
);

export default GoogleSignInButton;
