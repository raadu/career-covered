import { LuLoader } from 'react-icons/lu';
import type { PdfDesign } from 'utils/pdfDesigns';

interface DesignCardProps {
  design: PdfDesign;
  isDownloading: boolean;
  disabled: boolean;
  onSelect: () => void;
}

const PLACEHOLDER_LINE_WIDTHS = ['w-full', 'w-5/6', 'w-full', 'w-2/3'];

const DesignSwatch = ({
  swatchStyle,
  accentColor,
}: {
  swatchStyle: PdfDesign['swatchStyle'];
  accentColor: string;
}) => {
  const lines = (extraClass = '') => (
    <div className={`space-y-1.5 ${extraClass}`}>
      {PLACEHOLDER_LINE_WIDTHS.map((width, i) => (
        <div
          key={i}
          className={`h-1 rounded-full bg-gray-200 dark:bg-gray-600 ${width}`}
        />
      ))}
    </div>
  );

  if (swatchStyle === 'fullSidebar') {
    return (
      <div className="flex h-full w-full overflow-hidden rounded-sm">
        <div
          className="h-full w-[30%] shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex-1 bg-white dark:bg-gray-800 p-3">{lines()}</div>
      </div>
    );
  }

  if (swatchStyle === 'leftBar') {
    return (
      <div className="flex h-full w-full overflow-hidden rounded-sm bg-white dark:bg-gray-800">
        <div
          className="h-full w-1.5 shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex-1 p-3">{lines()}</div>
      </div>
    );
  }

  if (swatchStyle === 'header') {
    return (
      <div className="h-full w-full overflow-hidden rounded-sm bg-white dark:bg-gray-800">
        <div
          className="h-1/4 w-full"
          style={{ backgroundColor: accentColor }}
        />
        <div className="p-3">{lines()}</div>
      </div>
    );
  }

  if (swatchStyle === 'topBar') {
    return (
      <div className="h-full w-full overflow-hidden rounded-sm bg-white dark:bg-gray-800">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: accentColor }}
        />
        <div className="p-3">{lines()}</div>
      </div>
    );
  }

  if (swatchStyle === 'rules') {
    return (
      <div className="h-full w-full overflow-hidden rounded-sm bg-white dark:bg-gray-800 p-3">
        <div className="space-y-0.5 mb-3">
          <div className="h-px w-full bg-gray-400 dark:bg-gray-500" />
          <div className="h-px w-full bg-gray-300 dark:bg-gray-600" />
        </div>
        {lines()}
      </div>
    );
  }

  if (swatchStyle === 'frame') {
    return (
      <div
        className="h-full w-full overflow-hidden rounded-sm bg-white dark:bg-gray-800 p-1"
        style={{ border: `1.5px solid ${accentColor}` }}
      >
        <div
          className="h-full w-full p-2.5"
          style={{ border: `1px solid ${accentColor}` }}
        >
          {lines()}
        </div>
      </div>
    );
  }

  if (swatchStyle === 'twoTone') {
    return (
      <div className="h-full w-full overflow-hidden rounded-sm bg-white dark:bg-gray-800">
        <div
          className="h-[16%] w-full"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="h-[10%] w-full"
          style={{ backgroundColor: accentColor, opacity: 0.35 }}
        />
        <div className="p-3">{lines()}</div>
      </div>
    );
  }

  if (swatchStyle === 'cornerAccent') {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-sm bg-white dark:bg-gray-800 p-3">
        {lines()}
        <div
          className="absolute -top-2 -right-2 h-10 w-10"
          style={{
            backgroundColor: accentColor,
            clipPath: 'polygon(100% 0%, 0% 0%, 100% 100%)',
          }}
        />
      </div>
    );
  }

  // 'plain'
  return (
    <div className="h-full w-full overflow-hidden rounded-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3">
      {lines()}
    </div>
  );
};

const DesignCard = ({
  design,
  isDownloading,
  disabled,
  onSelect,
}: DesignCardProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className="relative flex flex-col text-left rounded-sm border border-gray-200 dark:border-gray-700 p-2.5 sm:p-3 transition-all hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700"
    >
      <div className="h-20 sm:h-24 w-full mb-2 sm:mb-3">
        <DesignSwatch
          swatchStyle={design.swatchStyle}
          accentColor={design.accentColor}
        />
      </div>

      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
        {design.name}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
        {design.description}
      </p>
      <span className="mt-1.5 inline-block w-fit text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
        {design.recommendedFor}
      </span>

      {isDownloading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-white/80 dark:bg-gray-800/80">
          <LuLoader className="animate-spin text-cyan-500" size={22} />
        </div>
      )}
    </button>
  );
};

export default DesignCard;
