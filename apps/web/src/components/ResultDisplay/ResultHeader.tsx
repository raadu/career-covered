import { LuCheck, LuCopy, LuPalette } from 'react-icons/lu';
import { FaFileWord } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';

interface ResultHeaderProps {
  isDownloading: 'word' | null;
  handleOpenDesigns: () => void;
  handleDownloadWord: () => void;
  handleCopy: () => void;
  copied: boolean;
}

const ResultHeader = ({
  isDownloading,
  handleOpenDesigns,
  handleDownloadWord,
  handleCopy,
  copied,
}: ResultHeaderProps) => {
  return (
    <div className="bg-brand-50 dark:bg-brand-950 p-2.5 md:p-5 border-b border-brand-100 dark:border-brand-900 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
      <h3 className="font-bold text-brand-900 dark:text-brand-200 tracking-tight text-xs sm:text-sm md:text-base">
        Generated Cover Letter
      </h3>
      <div className="flex items-center justify-center sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
        <CommonButton
          variant="outline"
          onClick={handleOpenDesigns}
          disabled={!!isDownloading}
          icon={<LuPalette className="text-violet-500" size={ICON_SIZE.xs} />}
          className="h-8 px-3 text-xs"
          title="Choose a PDF design"
        >
          PDF
        </CommonButton>

        <CommonButton
          variant="outline"
          onClick={handleDownloadWord}
          isLoading={isDownloading === 'word'}
          disabled={!!isDownloading}
          icon={
            isDownloading !== 'word' && (
              <FaFileWord className="text-brand-500" size={ICON_SIZE.xs} />
            )
          }
          className="h-8 px-3 text-xs"
          title="Download as Microsoft Word"
        >
          {isDownloading === 'word' ? 'Preparing Word...' : 'Word'}
        </CommonButton>

        <CommonButton
          variant={copied ? 'secondary' : 'outline'}
          onClick={handleCopy}
          icon={
            copied ? (
              <LuCheck className="text-success" size={ICON_SIZE.xs} />
            ) : (
              <LuCopy size={ICON_SIZE.xs} />
            )
          }
          className="h-8 px-3 text-xs"
        >
          {copied ? 'Copied!' : 'Copy'}
        </CommonButton>
      </div>
    </div>
  );
};

export default ResultHeader;
