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
    // Tablet: its own full-width row 3 of the parent grid.
    <div className="flex justify-center w-full sm:w-auto md:order-6 md:col-span-6 md:w-full lg:order-none lg:w-auto">
      <CommonButton
        variant="primary"
        onClick={onGenerate}
        isLoading={isLoading}
        disabled={isLoading || !hasJobDescription}
        icon={!isLoading && <FaBolt />}
        fullWidth={true}
        className="sm:w-auto md:w-full lg:w-auto"
      >
        {hasGeneratedLetter ? 'Generate Another One' : 'Generate Cover Letter'}
      </CommonButton>
    </div>
  );
};

export default GenerateAction;
