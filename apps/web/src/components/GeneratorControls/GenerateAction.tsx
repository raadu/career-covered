import { FaBolt } from "react-icons/fa";
import CommonButton from "components/common/CommonButton";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface GenerateActionProps {
  isLoading: boolean;
  hasJobDescription: boolean;
  hasGeneratedLetter: boolean;
  onGenerate: () => void;
  error?: FetchBaseQueryError | SerializedError;
}

const GenerateAction = ({
  isLoading,
  hasJobDescription,
  hasGeneratedLetter,
  onGenerate,
  error,
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
        className="bg-black hover:bg-gray-900 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-black border-0 sm:w-auto"
      >
        {hasGeneratedLetter ? "Generate Another One" : "Generate Cover Letter"}
      </CommonButton>
      {error && (
        <p className="text-red-500 text-xs mt-2">
          Error generating. Check API Key.
        </p>
      )}
    </div>
  );
};

export default GenerateAction;
