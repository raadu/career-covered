import { useState, type FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from 'store';
import { setAuthModalOpen, setUser } from 'store/authSlice';
import { showToast } from 'components/common/Toast';
import { EMOJI_SERIOUS } from 'utils/emojiUtils';

const PASSWORD_RULES = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export function useAuthForm() {
  const dispatch = useAppDispatch();
  const { isAuthModalOpen } = useSelector((state: RootState) => state.auth);
  const { jobDescription, generatedLetter } = useSelector(
    (state: RootState) => state.coverLetter,
  );

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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
    } else if (isRegister && !PASSWORD_RULES.test(password)) {
      errs.password =
        'Password should have minimum 6 characters, 1 capital letter and 1 number.';
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

  const switchToLogin = () => {
    setIsRegister(false);
    setErrors({});
    setPassword('');
  };

  const switchToRegister = () => {
    setIsRegister(true);
    setErrors({});
    setPassword('');
  };

  const toggleMode = () => {
    setIsRegister((prev) => !prev);
    setErrors({});
    setPassword('');
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
          showToast("Your email already exists. Let's log into your account!", {
            type: 'info',
          });
          switchToLogin();
          return;
        }
        if (response.status === 404) {
          showToast("You're not registered yet. Let's get you onboarded!", {
            type: 'info',
            duration: 5000,
          });
          switchToRegister();
          return;
        }
        setErrors({ general: data.message || 'Authentication failed' });
        return;
      }

      showToast(
        isRegister
          ? "Awesome! You're now registered."
          : `Welcome! Let's be serious about your job hunt ${EMOJI_SERIOUS}`,
        { type: 'success', duration: 3000 },
      );
      dispatch(setUser(data));
      handleClose();
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (jobDescription) sessionStorage.setItem('cl_restore_jd', jobDescription);
    if (generatedLetter)
      sessionStorage.setItem('cl_restore_gl', generatedLetter);
    sessionStorage.setItem('google_oauth_redirect', 'true');
    window.location.href = '/auth/google';
  };

  return {
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
  };
}
