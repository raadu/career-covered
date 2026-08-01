import { type ChangeEvent } from 'react';

interface WordLimitSectionProps {
  limitWords: boolean;
  setLimitWords: (val: boolean) => void;
  wordCountStr: string;
  onWordCountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error: string;
}

const WordLimitSection = ({
  limitWords,
  setLimitWords,
  wordCountStr,
  onWordCountChange,
  error,
}: WordLimitSectionProps) => {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-cyan-500/30 checked:bg-cyan-500 checked:border-cyan-500 transition-colors"
            checked={limitWords}
            onChange={(e) => setLimitWords(e.target.checked)}
          />
          <svg
            className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
          Limit words
        </span>
      </label>

      {limitWords && (
        <div className="pl-8 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={wordCountStr}
              onChange={onWordCountChange}
              placeholder="Numbers should be between 50 - 1000"
              className={`flex-1 p-1.5 text-sm border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-cyan-500'} focus:border-transparent outline-none transition-all bg-transparent text-gray-900 dark:text-gray-100`}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              words
            </span>
          </div>
          {error && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WordLimitSection;
