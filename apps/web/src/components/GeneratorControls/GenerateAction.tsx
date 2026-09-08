import { FaBolt } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';

interface GenerateActionProps {
  isLoading: boolean;
  hasJobDescription: boolean;
  hasGeneratedLetter: boolean;
  onGenerate: () => void;
}

const GenerateAction = ({
  isLoading,
  hasJobDescription,
  hasGeneratedLetter,
  onGenerate,
}: GenerateActionProps) => {
  return (
    <div className="flex justify-center w-full sm:w-auto">
      <CommonButton
        variant="primary"
        onClick={onGenerate}
        isLoading={isLoading}
        disabled={isLoading || !hasJobDescription}
        icon={!isLoading && <FaBolt />}
        fullWidth={true}
        className="bg-black hover:bg-gray-900 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black border-0 rounded-none sm:w-auto"
      >
        {hasGeneratedLetter ? 'Generate Another One' : 'Generate Cover Letter'}
      </CommonButton>
    </div>
  );
};

export default GenerateAction;
