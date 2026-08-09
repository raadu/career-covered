import { useRef } from 'react';
import { FaPlus } from 'react-icons/fa';
import { LuLoader } from 'react-icons/lu';

interface UploadSlotProps {
  disabled: boolean;
  isUploading: boolean;
  onUpload: (file: File) => void;
}

const UploadSlot = ({ disabled, isUploading, onUpload }: UploadSlotProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      disabled={disabled || isUploading}
      onClick={() => inputRef.current?.click()}
      title={disabled ? 'You can have up to 8 resumes' : 'Upload a resume'}
      className="relative flex flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-gray-200 dark:border-gray-700 p-2.5 sm:p-3 min-h-[168px] text-gray-400 dark:text-gray-500 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
    >
      {isUploading ? (
        <LuLoader className="animate-spin" size={24} />
      ) : (
        <>
          <FaPlus size={20} />
          <span className="text-xs font-semibold">Upload Resume</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onUpload(file);
        }}
      />
    </button>
  );
};

export default UploadSlot;
