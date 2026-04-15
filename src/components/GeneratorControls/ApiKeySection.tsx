import { FaKey, FaQuestionCircle } from "react-icons/fa";
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
      <div className="flex-1 w-full md:w-auto flex items-center gap-2 animate-in flex-in slide-in-from-left-2 duration-300">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
            <FaKey
              className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={12}
            />
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter ${PROVIDER_NAME} API Key`}
            className="pl-9 w-full h-9 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-400 font-mono"
          />
        </div>
        <CommonButton
          variant="ghost"
          onClick={() => setShowHelpModal(true)}
          icon={<FaQuestionCircle size={14} />}
          title="Help with API Key"
        >
          Help
        </CommonButton>
        <CommonButton
          variant="dark"
          onClick={() => setShowKeyInput(false)}
          disabled={!apiKey || !apiKey.trim()}
        >
          Done
        </CommonButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <CommonButton
        variant="outline"
        onClick={() => setShowKeyInput(true)}
        icon={<FaKey size={10} className="group-hover:rotate-12 transition-transform" />}
        className="group"
      >
        Update API Key
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
