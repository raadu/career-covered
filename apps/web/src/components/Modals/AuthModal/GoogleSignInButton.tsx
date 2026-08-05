import { FcGoogle } from 'react-icons/fc';

interface GoogleSignInButtonProps {
  onClick: () => void;
}

const GoogleSignInButton = ({ onClick }: GoogleSignInButtonProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 font-semibold h-9 rounded-lg transition-all text-[12px]"
  >
    <FcGoogle size={16} />
    Continue with Google
  </button>
);

export default GoogleSignInButton;
