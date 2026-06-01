import { LuCheck, LuCopy } from "react-icons/lu";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import CommonButton from "components/common/CommonButton";

interface ResultHeaderProps {
  isDownloading: "pdf" | "word" | null;
  handleDownloadPDF: () => void;
  handleDownloadWord: () => void;
  handleCopy: () => void;
  copied: boolean;
}

const ResultHeader = ({
  isDownloading,
  handleDownloadPDF,
  handleDownloadWord,
  handleCopy,
  copied,
}: ResultHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/30 dark:to-indigo-900/30 p-3 md:p-5 border-b border-blue-100 dark:border-blue-800 flex flex-col lg:flex-row items-center justify-between gap-4">
      <h3 className="font-bold text-blue-900 dark:text-blue-200 tracking-tight text-sm md:text-base">Generated Cover Letter</h3>
      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full lg:w-auto">
        <CommonButton
          variant="outline"
          onClick={handleDownloadPDF}
          isLoading={isDownloading === "pdf"}
          disabled={!!isDownloading}
          icon={isDownloading !== "pdf" && <FaFilePdf className="text-rose-500" size={16} />}
          className="bg-white dark:bg-gray-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-gray-700 dark:text-gray-300"
          title="Download as PDF"
        >
          {isDownloading === "pdf" ? "Preparing PDF..." : "Download PDF"}
        </CommonButton>

        <CommonButton
          variant="outline"
          onClick={handleDownloadWord}
          isLoading={isDownloading === "word"}
          disabled={!!isDownloading}
          icon={isDownloading !== "word" && <FaFileWord className="text-blue-500" size={16} />}
          className="bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300"
          title="Download as Microsoft Word"
        >
          {isDownloading === "word" ? "Preparing Word..." : "Download Word"}
        </CommonButton>

        <CommonButton
          variant={copied ? "secondary" : "outline"}
          onClick={handleCopy}
          icon={copied ? <LuCheck className="text-green-500" size={16} /> : <LuCopy size={16} />}
          className={copied ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"}
        >
          {copied ? "Copied!" : "Copy Text"}
        </CommonButton>
      </div>
    </div>
  );
};

export default ResultHeader;
