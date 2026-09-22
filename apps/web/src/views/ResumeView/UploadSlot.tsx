import { useRef } from 'react';
import { FaPlus } from 'react-icons/fa';
import { LuLoader } from 'react-icons/lu';

interface UploadSlotProps {
  atCap: boolean;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onCapReached: () => void;
}

const UploadSlot = ({
  atCap,
  isUploading,
  onUpload,
  onCapReached,
}: UploadSlotProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      disabled={isUploading}
      onClick={() => (atCap ? onCapReached() : inputRef.current?.click())}
      title={atCap ? 'You can have up to 8 resumes' : 'Upload a resume'}
      className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-200 dark:border-neutral-700 p-2.5 sm:p-3 min-h-[168px] text-neutral-400 dark:text-neutral-500 hover:border-brand-400 dark:hover:border-brand-500 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-200 dark:disabled:hover:border-neutral-700 disabled:hover:text-neutral-400 disabled:hover:bg-transparent"
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
