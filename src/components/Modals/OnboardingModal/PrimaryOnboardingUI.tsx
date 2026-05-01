import { PROVIDER_URL } from 'utils/AIModelUtils';
import { FaExternalLinkAlt, FaLifeRing } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface PrimaryOnboardingUIProps {
  onShowDetailed: () => void;
  isSettingsMode: boolean;
}

const PrimaryOnboardingUI = ({ onShowDetailed, isSettingsMode }: PrimaryOnboardingUIProps) => {
  return (
    <>
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          {isSettingsMode ? "How to get your API Key" : "It’s so easy to start!"}
        </h1>
        <p className="text-gray-500 text-[15px] max-w-md mx-auto leading-relaxed">
          {isSettingsMode ? (
            "You need an API key. It’s easy to get one for free. Just follow the steps."
          ) : (
            <>
              You just need an API key. It’s easy to get one for free.
              <br />
              Just follow the steps.
            </>
          )}
        </p>
      </div>

      <div className="text-left">
        <ol className="space-y-4 text-[14px] text-gray-600">
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">
              1
            </span>
            <div className="flex-1">
              Go to{" "}
              <a
                href={PROVIDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors underline underline-offset-4 decoration-blue-200"
              >
                groq website <FaExternalLinkAlt size={9} />
              </a>{" "}
              and login with your google account.
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] font-bold mt-0.5">
              2
            </span>
            <div className="flex-1">
              Click "API Keys" on the top right corner of the dashboard.
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] mt-0.5">
              3
            </span>
            <div className="flex-1 font-normal text-gray-700">
              Then create a new API key. Copy the key and come back here.
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[11px] mt-0.5">
              4
            </span>
            <div className="flex-1 font-normal text-gray-700">
              Put the copied API key in the box below. Press Start.
            </div>
          </li>
        </ol>
      </div>

      <div className="text-center">
        <button
          onClick={onShowDetailed}
          className="text-[12px] text-blue-500 hover:text-blue-600 underline underline-offset-2 transition-colors font-medium cursor-pointer"
        >
          Still stuck? Click here for more information.
        </button>

        <div className="pt-4 border-t border-gray-50 mt-4 flex justify-center">
          <Link 
            to="/support"
            className="flex items-center gap-2 text-[11px] text-gray-400 hover:text-blue-500 transition-colors font-bold uppercase tracking-widest"
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
