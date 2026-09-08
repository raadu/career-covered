import { useRef, type ChangeEvent } from 'react';

export function useHiddenFileInput(onFile: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onFile(file);
  };

  return { inputRef, openPicker, handleChange };
}
