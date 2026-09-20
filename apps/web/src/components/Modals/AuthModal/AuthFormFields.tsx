import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';
import type { FormErrors } from './useAuthForm';

interface AuthFormFieldsProps {
  isRegister: boolean;
  name: string;
  onNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  errors: FormErrors;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
  onForgotPasswordClick: () => void;
}

const AuthFormFields = ({
  isRegister,
  name,
  onNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  errors,
  loading,
  onSubmit,
  onForgotPasswordClick,
}: AuthFormFieldsProps) => (
  <form onSubmit={onSubmit} className="space-y-3">
    {isRegister && (
      <div>
        <div className="relative">
          <FaUser
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={12}
          />
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={`w-full pl-8 pr-3 h-10 bg-neutral-50 dark:bg-neutral-800 border ${errors.name ? 'border-danger-border dark:border-danger-border-dark' : 'border-neutral-200 dark:border-neutral-600'} focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm transition-all dark:text-neutral-100 placeholder:text-neutral-400`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-[11px] text-danger dark:text-danger-fg-dark font-medium">
            {errors.name}
          </p>
        )}
      </div>
    )}

    <div>
      <div className="relative">
        <FaEnvelope
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          size={12}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={`w-full pl-8 pr-3 h-10 bg-neutral-50 dark:bg-neutral-800 border ${errors.email ? 'border-danger-border dark:border-danger-border-dark' : 'border-neutral-200 dark:border-neutral-600'} focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm transition-all dark:text-neutral-100 placeholder:text-neutral-400`}
        />
      </div>
      {errors.email && (
        <p className="mt-1 text-[11px] text-danger dark:text-danger-fg-dark font-medium">
          {errors.email}
        </p>
      )}
    </div>

    <div>
      <div className="relative">
        <FaLock
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          size={12}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`w-full pl-8 pr-3 h-10 bg-neutral-50 dark:bg-neutral-800 border ${errors.password ? 'border-danger-border dark:border-danger-border-dark' : 'border-neutral-200 dark:border-neutral-600'} focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm transition-all dark:text-neutral-100 placeholder:text-neutral-400`}
        />
      </div>
      {errors.password && (
        <p className="mt-1 text-[11px] text-danger dark:text-danger-fg-dark font-medium">
          {errors.password}
        </p>
      )}
    </div>

    {!isRegister && (
      <div className="text-center">
        <Link
          to="/support"
          onClick={onForgotPasswordClick}
          className="text-[11px] text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
        >
          Forgot password?
        </Link>
      </div>
    )}

    <CommonButton type="submit" disabled={loading} isLoading={loading} fullWidth>
      {isRegister ? 'Create account' : 'Sign in'}
    </CommonButton>
  </form>
);

export default AuthFormFields;
