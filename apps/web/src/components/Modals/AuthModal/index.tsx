import { useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from 'store';
import { setAuthModalOpen, setUser } from 'store/authSlice';
import { FaEnvelope, FaLock, FaUser, FaTimes } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthModal = () => {
  const dispatch = useDispatch();
  const { isAuthModalOpen } = useSelector((state: RootState) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  if (!isAuthModalOpen) return null;

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (isRegister && !name.trim()) {
      errs.name = 'Name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!EMAIL_RE.test(email)) {
      errs.email = 'Invalid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (isRegister && password.length < 8) {
      errs.password = 'Must be at least 8 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleClose = () => {
    dispatch(setAuthModalOpen(false));
    setEmail('');
    setPassword('');
    setName('');
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { email, password, name } : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ email: 'A user with this email already exists' });
        } else {
          setErrors({ general: data.message || 'Authentication failed' });
        }
        return;
      }

      toast.success(isRegister ? 'Registered!' : 'Signed in!');
      dispatch(setUser(data));
      handleClose();
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/auth/google';
  };

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
              ? 'Sync templates across your devices'
              : 'Access your templates and history'}
          </p>
        </div>

        {errors.general && (
          <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-[11px] text-red-600 dark:text-red-400 font-medium">
            {errors.general}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 font-semibold h-9 rounded-lg transition-all text-[12px]"
        >
          <FcGoogle size={16} />
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 dark:border-gray-700 w-full" />
          <span className="absolute bg-white dark:bg-gray-800 px-2.5 text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
            or
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError('name'); }}
                  className={`w-full pl-8 pr-3 h-9 bg-gray-50 dark:bg-gray-700/50 border ${errors.name ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none text-[13px] transition-all dark:text-gray-100 placeholder:text-gray-400`}
                />
              </div>
              {errors.name && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.name}</p>}
            </div>
          )}

          <div>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                className={`w-full pl-8 pr-3 h-9 bg-gray-50 dark:bg-gray-700/50 border ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none text-[13px] transition-all dark:text-gray-100 placeholder:text-gray-400`}
              />
            </div>
            {errors.email && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                className={`w-full pl-8 pr-3 h-9 bg-gray-50 dark:bg-gray-700/50 border ${errors.password ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none text-[13px] transition-all dark:text-gray-100 placeholder:text-gray-400`}
              />
            </div>
            {errors.password && <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.password}</p>}
          </div>

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

        <div className="mt-4 text-center text-[12px] text-gray-500 dark:text-gray-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setErrors({}); }}
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
