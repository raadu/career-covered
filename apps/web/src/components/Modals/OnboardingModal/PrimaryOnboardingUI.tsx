import { PROVIDER_URL } from 'utils/AIModelUtils';
import { FaExternalLinkAlt, FaLifeRing } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface PrimaryOnboardingUIProps {
  onShowDetailed: () => void;
  isSettingsMode: boolean;
}

const PrimaryOnboardingUI = ({
  onShowDetailed,
  isSettingsMode,
}: PrimaryOnboardingUIProps) => {
  return (
    <>
      <p className="text-neutral-500 dark:text-neutral-400 text-[15px] max-w-md mx-auto leading-relaxed">
        {isSettingsMode ? (
          'You need an API key. It’s easy to get one for free. Just follow the steps.'
        ) : (
          <>
            You just need an API key. It’s easy to get one for free.
            <br />
            Just follow the steps.
          </>
        )}
      </p>

      <div className="text-left">
        <ol className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold mt-0.5">
              1
            </span>
            <div className="flex-1">
              Go to{' '}
              <a
                href={PROVIDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-semibold inline-flex items-center gap-1 transition-colors underline underline-offset-4"
              >
                groq website <FaExternalLinkAlt size={9} />
              </a>{' '}
              and login with your google account.
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold mt-0.5">
              2
            </span>
            <div className="flex-1">
              Click "API Keys" on the top right corner of the dashboard.
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] mt-0.5">
              3
            </span>
            <div className="flex-1 font-normal text-neutral-700 dark:text-neutral-300">
              Then create a new API key. Copy the key and come back here.
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] mt-0.5">
              4
            </span>
            <div className="flex-1 font-normal text-neutral-700 dark:text-neutral-300">
              Put the copied API key in the box below. Press Start.
            </div>
          </li>
        </ol>
      </div>

      <div className="text-center">
        <button
          onClick={onShowDetailed}
          className="min-h-10 px-2 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline underline-offset-2 transition-colors font-medium cursor-pointer"
        >
          Still stuck? Click here for more information.
        </button>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700 mt-4 flex justify-center">
          <Link
            to="/support"
            className="min-h-10 flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-bold uppercase tracking-widest"
          >
            <FaLifeRing size={12} />
            Contact Support
          </Link>
        </div>
      </div>
    </>
  );
};

export default PrimaryOnboardingUI;
