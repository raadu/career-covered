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
    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 border-b border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
      <h3 className="font-bold text-blue-900 tracking-tight">Generated Cover Letter</h3>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <CommonButton
          variant="outline"
          onClick={handleDownloadPDF}
          isLoading={isDownloading === "pdf"}
          disabled={!!isDownloading}
          icon={isDownloading !== "pdf" && <FaFilePdf className="text-rose-500" size={16} />}
          className="bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-gray-700"
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
          className="bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-gray-700"
          title="Download as Microsoft Word"
        >
          {isDownloading === "word" ? "Preparing Word..." : "Download Word"}
        </CommonButton>

        <CommonButton
          variant={copied ? "secondary" : "outline"}
          onClick={handleCopy}
          icon={copied ? <LuCheck className="text-green-500" size={16} /> : <LuCopy size={16} />}
          className={copied ? "bg-green-50 border-green-200 text-green-700" : "bg-white text-gray-700"}
        >
          {copied ? "Copied!" : "Copy Text"}
        </CommonButton>
      </div>
    </div>
  );
};

export default ResultHeader;
