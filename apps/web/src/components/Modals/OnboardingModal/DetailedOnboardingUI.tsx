import { PROVIDER_URL } from 'utils/AIModelUtils';
import { FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';

interface DetailedOnboardingUIProps {
  onBack: () => void;
}

const DetailedOnboardingUI = ({ onBack }: DetailedOnboardingUIProps) => {
  return (
    <div className="text-left space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
      <button
        onClick={onBack}
        className="min-h-10 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to simple guide
      </button>

      <div className="space-y-3">
        <div className="bg-brand-50 dark:bg-brand-950 p-3 border border-brand-200 dark:border-brand-800">
          <h2 className="text-[13px] font-bold text-brand-900 dark:text-brand-200 mb-0.5">
            Why do I need an API key?
          </h2>
          <p className="text-xs text-brand-800 dark:text-brand-300 leading-relaxed">
            I am currently unable to provide paid AI tokens. So you can use your
            own API keys to access the AI feature. It does not cost you any
            money. It's always free.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Step-by-step Guide
          </h2>
          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold mt-0.5">
                1
              </div>
              <div className="flex-1">
                <strong className="text-neutral-800 dark:text-neutral-200 block mb-0">
                  Visit the Platform
                </strong>
                Go to the{' '}
                <a
                  href={PROVIDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 dark:text-brand-400 font-semibold underline underline-offset-4"
                >
                  Groq Cloud Console{' '}
                  <FaExternalLinkAlt size={9} className="inline mb-1" />
                </a>
                . This is the official developer portal.
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold mt-0.5">
                2
              </div>
              <div className="flex-1">
                <strong className="text-neutral-800 dark:text-neutral-200 block mb-0">
                  Free Account Setup
                </strong>
                Login using your Google account. It's a one-click process and
                completely free for personal use. You can also login using
                GitHub or email.
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold mt-0.5">
                3
              </div>
              <div className="flex-1">
                <strong className="text-neutral-800 dark:text-neutral-200 block mb-0">
                  Locate API Keys
                </strong>
                On the dashboard, find the <strong>"API Keys"</strong> tab. On
                mobile, you may need to open the{' '}
                <strong>top-left hamburger menu</strong> first to see the
                sidebar options.
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold mt-0.5">
                4
              </div>
              <div className="flex-1">
                <strong className="text-neutral-800 dark:text-neutral-200 block mb-0">
                  Create API Key
                </strong>
                Click <strong>"Create API Key"</strong> button. Put any display
                name or expiration you want. Then click{' '}
                <strong>"Submit"</strong> button.
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold mt-0.5">
                5
              </div>
              <div className="flex-1">
                <strong className="text-neutral-800 dark:text-neutral-200 block mb-0">
                  Copy the Key
                </strong>
                Copy the generated key. Then come back here.
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold mt-0.5">
                6
              </div>
              <div className="flex-1">
                <strong className="text-neutral-800 dark:text-neutral-200 block mb-0">
                  The Final Step
                </strong>
                Paste the key in the box below. Then press{' '}
                <strong>"Start"</strong> button.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedOnboardingUI;
