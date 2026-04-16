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
    <div className="w-full md:w-auto flex flex-col items-end">
      <CommonButton
        variant="gradient"
        onClick={onGenerate}
        isLoading={isLoading}
        disabled={isLoading || !hasJobDescription}
        icon={!isLoading && <FaBolt />}
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
