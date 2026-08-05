import { FaTimes } from 'react-icons/fa';
import { useAuthForm } from './useAuthForm';
import GoogleSignInButton from './GoogleSignInButton';
import AuthFormFields from './AuthFormFields';

const AuthModal = () => {
  const {
    isAuthModalOpen,
    isRegister,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    loading,
    errors,
    clearError,
    handleClose,
    handleSubmit,
    handleGoogleSignIn,
    toggleMode,
  } = useAuthForm();

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 transition-all"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>

        <div className="mb-4 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {isRegister ? 'Create account' : 'Sign in'}
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-[12px] mt-0.5">
            {isRegister
              ? 'Get access to hidden features'
              : 'Sign in to get more features'}
          </p>
        </div>

        {errors.general && (
          <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-[11px] text-red-600 dark:text-red-400 font-medium">
            {errors.general}
          </div>
        )}

        <GoogleSignInButton onClick={handleGoogleSignIn} />

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 dark:border-gray-700 w-full" />
          <span className="absolute bg-white dark:bg-gray-800 px-2.5 text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
            or
          </span>
        </div>

        <AuthFormFields
          isRegister={isRegister}
          name={name}
          onNameChange={(value) => {
            setName(value);
            clearError('name');
          }}
          email={email}
          onEmailChange={(value) => {
            setEmail(value);
            clearError('email');
          }}
          password={password}
          onPasswordChange={(value) => {
            setPassword(value);
            clearError('password');
          }}
          errors={errors}
          loading={loading}
          onSubmit={handleSubmit}
          onForgotPasswordClick={handleClose}
        />

        <div className="mt-4 text-center text-[12px] text-gray-500 dark:text-gray-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold outline-none transition-colors"
          >
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
