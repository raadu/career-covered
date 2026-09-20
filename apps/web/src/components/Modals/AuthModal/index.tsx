import { useAuthForm } from './useAuthForm';
import Modal from 'components/common/Modal';
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

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={handleClose}
      title={isRegister ? 'Create account' : 'Sign in'}
      maxWidth="max-w-sm"
    >
      <div className="space-y-4">
        <p className="text-center text-neutral-400 dark:text-neutral-500 text-xs -mt-1">
          {isRegister
            ? 'Get access to hidden features'
            : 'Sign in to get more features'}
        </p>

        {errors.general && (
          <div className="px-3 py-2 bg-danger-subtle dark:bg-danger-subtle-dark border border-danger-border dark:border-danger-border-dark text-[11px] text-danger dark:text-danger-fg-dark font-medium">
            {errors.general}
          </div>
        )}

        <GoogleSignInButton onClick={handleGoogleSignIn} />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 dark:border-neutral-700 w-full" />
          <span className="absolute bg-white dark:bg-neutral-900 px-2.5 text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
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

        <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            className="text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 font-semibold outline-none transition-colors"
          >
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
