import { useState, type MouseEvent } from 'react';
import { showToast } from 'components/common/Toast';

interface UseCopyOptions {
  duration?: number;
  onSuccess?: () => void;
}

export const useCopy = (options: UseCopyOptions = {}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (
    value: string,
    label: string = 'Text',
    e?: MouseEvent,
  ) => {
    if (e) e.stopPropagation();

    if (!value) {
      showToast('Nothing to copy!', { type: 'error' });
      return;
    }

    navigator.clipboard.writeText(value);
    setCopied(true);

    showToast(`${label} copied!`, {
      type: 'success',
      duration: options.duration,
    });

    if (options.onSuccess) options.onSuccess();

    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, handleCopy };
};
