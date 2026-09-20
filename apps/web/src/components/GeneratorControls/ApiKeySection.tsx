import { FaKey, FaQuestionCircle, FaTimes } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';
import { PROVIDER_NAME } from 'utils/AIModelUtils';

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
      <div className="flex-1 w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in flex-in slide-in-from-left-2 duration-300">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-500">
            <FaKey
              className="text-neutral-400 dark:text-neutral-500 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors"
              size={12}
            />
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter ${PROVIDER_NAME} API Key`}
            className="pl-9 w-full h-10 border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm bg-neutral-50/50 dark:bg-neutral-700/50 focus:bg-white dark:focus:bg-neutral-600 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-mono text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
          {apiKey && (
            <button
              onClick={() => setShowKeyInput(false)}
              className="min-h-10 min-w-10 flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-danger dark:hover:text-danger-fg-dark transition-colors hover:bg-danger-subtle dark:hover:bg-danger-subtle-dark"
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
          <div className="bg-success-subtle dark:bg-success-subtle-dark text-success-fg dark:text-success-fg-dark px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-success-border dark:border-success-border-dark flex items-center justify-center min-w-[50px]">
            Done
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
      <CommonButton
        variant="outline"
        onClick={() => setShowKeyInput(true)}
        icon={
          <FaKey
            size={10}
            className="group-hover:rotate-12 transition-transform"
          />
        }
        className="group"
      >
        {apiKey ? 'Update API Key' : 'Add Custom API Key'}
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
