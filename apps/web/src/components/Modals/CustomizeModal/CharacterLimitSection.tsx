import { type ChangeEvent } from 'react';

interface CharacterLimitSectionProps {
  limitCharacters: boolean;
  setLimitCharacters: (val: boolean) => void;
  charCountStr: string;
  onCharCountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error: string;
}

const CharacterLimitSection = ({
  limitCharacters,
  setLimitCharacters,
  charCountStr,
  onCharCountChange,
  error,
}: CharacterLimitSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className="peer appearance-none w-5 h-5 border-2 border-neutral-300 dark:border-neutral-600 rounded focus:ring-2 focus:ring-brand-500/30 checked:bg-brand-600 checked:border-brand-600 transition-colors"
            checked={limitCharacters}
            onChange={(e) => setLimitCharacters(e.target.checked)}
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
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
          Limit characters
        </span>
      </label>

      {limitCharacters && (
        <div className="pl-8 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={charCountStr}
              onChange={onCharCountChange}
              placeholder="e.g. 2000 (200 - 5000)"
              className={`flex-1 p-1.5 text-sm border ${error ? 'border-danger' : 'border-neutral-300 dark:border-neutral-600'} focus:ring-2 ${error ? 'focus:ring-danger' : 'focus:ring-brand-500'} focus:border-transparent outline-none transition-all bg-transparent text-neutral-900 dark:text-neutral-100`}
            />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              characters
            </span>
          </div>
          {error && (
            <p className="text-danger dark:text-danger-fg-dark text-xs mt-1">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterLimitSection;
