import { FaPlus } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';
import { useHiddenFileInput } from './useHiddenFileInput';

interface UploadHeaderButtonProps {
  atCap: boolean;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onCapReached: () => void;
}

const UploadHeaderButton = ({
  atCap,
  isUploading,
  onUpload,
  onCapReached,
}: UploadHeaderButtonProps) => {
  const { inputRef, openPicker, handleChange } = useHiddenFileInput(onUpload);

  return (
    <>
      <CommonButton
        variant="dark"
        icon={<FaPlus size={12} />}
        isLoading={isUploading}
        onClick={() => (atCap ? onCapReached() : openPicker())}
      >
        Upload Resume
      </CommonButton>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
};

export default UploadHeaderButton;
