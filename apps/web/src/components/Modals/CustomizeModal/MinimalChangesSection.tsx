interface MinimalChangesSectionProps {
  minimalChanges: boolean;
  onToggle: () => void;
  hasTemplate: boolean;
}

const MinimalChangesSection = ({
  minimalChanges,
  onToggle,
  hasTemplate,
}: MinimalChangesSectionProps) => {
  if (!hasTemplate) return null;

  return (
    <>
      <hr className="border-gray-100 dark:border-gray-700" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Minimal Changes to template
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Only replace placeholders and minor tweaks.
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={minimalChanges}
            onChange={onToggle}
          />
          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          <span className="ml-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-8">
            {minimalChanges ? 'ON' : 'OFF'}
          </span>
        </label>
      </div>
    </>
  );
};

export default MinimalChangesSection;
