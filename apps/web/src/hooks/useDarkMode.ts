import { useEffect, useCallback } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState';

const applyDarkClass = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useDarkMode = () => {
  const [isDark, setIsDark] = useLocalStorageState<boolean>('darkMode', false);

  useEffect(() => {
    applyDarkClass(isDark);
  }, [isDark]);

  const toggleDark = useCallback(() => {
    setIsDark(!isDark);
  }, [isDark, setIsDark]);

  return { isDark, toggleDark };
};
