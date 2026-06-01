import { FaKey, FaQuestionCircle, FaTimes } from "react-icons/fa";
import CommonButton from "components/common/CommonButton";
import { PROVIDER_NAME } from "utils/AIModelUtils";

interface ApiKeySectionProps {
  apiKey: string;
  setApiKey: (value: string) => void;
  showKeyInput: boolean;
  setShowKeyInput: (show: boolean) => void;
  setShowHelpModal: (show: boolean) => void;
}

const ApiKeySection = ({
  apiKey,
  setApiKey,
  showKeyInput,
  setShowKeyInput,
  setShowHelpModal,
}: ApiKeySectionProps) => {
  if (showKeyInput) {
    return (
      <div className="flex-1 w-full lg:w-auto flex items-center gap-2 animate-in flex-in slide-in-from-left-2 duration-300">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
            <FaKey
              className="text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors"
              size={12}
            />
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter ${PROVIDER_NAME} API Key`}
            className="pl-9 w-full h-9 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-gray-50/50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-600 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono text-gray-900 dark:text-gray-100"
          />
        </div>
        
        {apiKey && (
          <button
            onClick={() => setShowKeyInput(false)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Cancel editing"
          >
            <FaTimes size={14} />
          </button>
        )}

        <CommonButton
          variant="ghost"
          onClick={() => setShowHelpModal(true)}
          icon={<FaQuestionCircle size={14} />}
          title="Help with API Key"
        >
          Help
        </CommonButton>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800 flex items-center justify-center min-w-[50px]">
          Done
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 w-full lg:w-auto">
      <CommonButton
        variant="outline"
        onClick={() => setShowKeyInput(true)}
        icon={<FaKey size={10} className="group-hover:rotate-12 transition-transform" />}
        className="group"
      >
        {apiKey ? "Update API Key" : "Add Custom API Key"}
      </CommonButton>
      <CommonButton
        variant="ghost"
        onClick={() => setShowHelpModal(true)}
        icon={<FaQuestionCircle size={11} />}
      >
        Help
      </CommonButton>
    </div>
  );
};

export default ApiKeySection;
