import { LuCheck, LuCopy, LuPalette } from 'react-icons/lu';
import { FaFilePdf, FaFileWord } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';

interface ResultHeaderProps {
  isDownloading: 'pdf' | 'word' | null;
  handleOpenDesigns: () => void;
  handleDownloadPDF: () => void;
  handleDownloadWord: () => void;
  handleCopy: () => void;
  copied: boolean;
}

const ResultHeader = ({
  isDownloading,
  handleOpenDesigns,
  handleDownloadPDF,
  handleDownloadWord,
  handleCopy,
  copied,
}: ResultHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/30 dark:to-indigo-900/30 p-2.5 md:p-5 border-b border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
      <h3 className="font-bold text-blue-900 dark:text-blue-200 tracking-tight text-xs sm:text-sm md:text-base">
        Generated Cover Letter
      </h3>
      <div className="flex items-center justify-center sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
        <CommonButton
          variant="outline"
          onClick={handleOpenDesigns}
          disabled={!!isDownloading}
          icon={<LuPalette className="text-violet-500" size={14} />}
          className="bg-white dark:bg-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-200 dark:hover:border-violet-800 hover:text-violet-600 dark:hover:text-violet-400 text-gray-700 dark:text-gray-300 h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-[11px]"
          title="Choose a PDF design"
        >
          Designs
        </CommonButton>

        <CommonButton
          variant="outline"
          onClick={handleDownloadPDF}
          isLoading={isDownloading === 'pdf'}
          disabled={!!isDownloading}
          icon={
            isDownloading !== 'pdf' && (
              <FaFilePdf className="text-rose-500" size={14} />
            )
          }
          className="bg-white dark:bg-gray-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-gray-700 dark:text-gray-300 h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-[11px]"
          title="Download as PDF"
        >
          {isDownloading === 'pdf' ? 'Preparing PDF...' : 'PDF'}
        </CommonButton>

        <CommonButton
          variant="outline"
          onClick={handleDownloadWord}
          isLoading={isDownloading === 'word'}
          disabled={!!isDownloading}
          icon={
            isDownloading !== 'word' && (
              <FaFileWord className="text-blue-500" size={14} />
            )
          }
          className="bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300 h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-[11px]"
          title="Download as Microsoft Word"
        >
          {isDownloading === 'word' ? 'Preparing Word...' : 'Word'}
        </CommonButton>

        <CommonButton
          variant={copied ? 'secondary' : 'outline'}
          onClick={handleCopy}
          icon={
            copied ? (
              <LuCheck className="text-green-500" size={14} />
            ) : (
              <LuCopy size={14} />
            )
          }
          className={`h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-[11px] ${copied ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </CommonButton>
      </div>
    </div>
  );
};

export default ResultHeader;
