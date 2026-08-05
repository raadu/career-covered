import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={12}
          />
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={`w-full pl-8 pr-3 h-9 bg-gray-50 dark:bg-gray-700/50 border ${errors.name ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none text-[13px] transition-all dark:text-gray-100 placeholder:text-gray-400`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-[11px] text-red-500 font-medium">
            {errors.name}
          </p>
        )}
      </div>
    )}

    <div>
      <div className="relative">
        <FaEnvelope
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={12}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={`w-full pl-8 pr-3 h-9 bg-gray-50 dark:bg-gray-700/50 border ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none text-[13px] transition-all dark:text-gray-100 placeholder:text-gray-400`}
        />
      </div>
      {errors.email && (
        <p className="mt-1 text-[11px] text-red-500 font-medium">
          {errors.email}
        </p>
      )}
    </div>

    <div>
      <div className="relative">
        <FaLock
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={12}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`w-full pl-8 pr-3 h-9 bg-gray-50 dark:bg-gray-700/50 border ${errors.password ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none text-[13px] transition-all dark:text-gray-100 placeholder:text-gray-400`}
        />
      </div>
      {errors.password && (
        <p className="mt-1 text-[11px] text-red-500 font-medium">
          {errors.password}
        </p>
      )}
    </div>

    {!isRegister && (
      <div className="text-center">
        <Link
          to="/support"
          onClick={onForgotPasswordClick}
          className="text-[11px] text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
        >
          Forgot password?
        </Link>
      </div>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 rounded-lg transition-all text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
          Processing...
        </span>
      ) : isRegister ? (
        'Create account'
      ) : (
        'Sign in'
      )}
    </button>
  </form>
);

export default AuthFormFields;
