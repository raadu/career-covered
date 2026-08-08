import { useSelector } from 'react-redux';
import { showToast } from 'components/common/Toast';
import { type RootState, useAppDispatch } from 'store';
import { useState } from 'react';
import { setGeneratedLetter } from 'store/coverLetterSlice';
import { setAuthModalOpen } from 'store/authSlice';
import { useGenerateCoverLetterMutation } from 'store/apiSlice';
import { DEFAULT_MODEL } from 'utils/AIModelUtils';
import { useCopy } from 'hooks/useCopy';
import { generatePdf, generateWord } from 'utils/downloadUtils';
import { getPdfDesign, type PdfDesignId } from 'utils/pdfDesigns';
import PdfDesignsModal from 'components/Modals/PdfDesignsModal';

// Modular Components
import ResultHeader from './ResultHeader';
import ResultEditor from './ResultEditor';

const ResultDisplay = () => {
  const dispatch = useAppDispatch();
  const { generatedLetter, template, apiKey } = useSelector(
    (state: RootState) => state.coverLetter,
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [generate] = useGenerateCoverLetterMutation();
  const { copied, handleCopy } = useCopy();

  const [isDownloading, setIsDownloading] = useState<'word' | null>(null);
  const [extractedName, setExtractedName] = useState<string | null>(null);
  const [isDesignsModalOpen, setIsDesignsModalOpen] = useState(false);
  const [downloadingDesignId, setDownloadingDesignId] =
    useState<PdfDesignId | null>(null);

  /**
   * Extracts the user's name from the template to use as a filename.
   */
  const extractNameFromTemplate = async (): Promise<string> => {
    if (extractedName) return extractedName;
    if (!template || !apiKey) return 'Cover_Letter';

    try {
      const prompt = `Identify the sender's Firstname and Lastname from this cover letter template. 
            Return ONLY the name as 'Firstname Lastname'. 
            If not found, return 'NOT_FOUND'. 
            
            Template:
            ${template}`;

      const result = await generate({
        prompt,
        model: DEFAULT_MODEL,
        ...(apiKey && { userApiKey: apiKey }),
      }).unwrap();

      const name = result?.trim();
      if (name && name !== 'NOT_FOUND' && name.length < 50) {
        const formattedName = name.replace(/\s+/g, '_');
        const fileName = `Cover_Letter_${formattedName}`;
        setExtractedName(fileName);
        return fileName;
      }
    } catch (err) {
      console.error('Name extraction error:', err);
      showToast(
        "Couldn't identify your name in the template. Using default filename.",
        { type: 'error', duration: 5000 },
      );
    }

    return 'Cover_Letter';
  };

  /**
   * Opens the PDF design picker, gated behind login. This is the only way
   * to download a PDF now — the plain "PDF" button was removed in favor of
   * always choosing a design first.
   */
  const handleOpenDesigns = () => {
    if (!isAuthenticated) {
      showToast(
        'Oops! You should login to do that. Creating an account is so easy.',
        { type: 'info', duration: 6000 },
      );
      dispatch(setAuthModalOpen(true));
      return;
    }
    setIsDesignsModalOpen(true);
  };

  /**
   * Generates and downloads the PDF in the chosen design. Keeps the modal
   * open on failure so the user can retry or pick a different design.
   */
  const handleSelectDesign = async (designId: PdfDesignId) => {
    setDownloadingDesignId(designId);
    try {
      const fileName = await extractNameFromTemplate();
      generatePdf(generatedLetter, fileName, designId);
      showToast(`Downloaded as ${getPdfDesign(designId).name}!`, {
        type: 'success',
        duration: 3000,
      });
      setIsDesignsModalOpen(false);
    } catch (err) {
      console.error('PDF generation failed', err);
      showToast('Failed to generate PDF. Please try again.', {
        type: 'error',
      });
    } finally {
      setDownloadingDesignId(null);
    }
  };

  /**
   * Simplifies Word document generation and download.
   */
  const handleDownloadWord = async () => {
    setIsDownloading('word');
    try {
      const fileName = await extractNameFromTemplate();
      await generateWord(generatedLetter, fileName);
    } catch (err) {
      console.error('Word generation failed', err);
      showToast('Failed to generate Word document.', { type: 'error' });
    } finally {
      setIsDownloading(null);
    }
  };

  if (!generatedLetter) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in mb-8">
      <ResultHeader
        isDownloading={isDownloading}
        handleOpenDesigns={handleOpenDesigns}
        handleDownloadWord={handleDownloadWord}
        handleCopy={() => handleCopy(generatedLetter, 'Result')}
        copied={copied}
      />

      <ResultEditor
        value={generatedLetter}
        onChange={(val) => dispatch(setGeneratedLetter(val))}
      />

      <PdfDesignsModal
        isOpen={isDesignsModalOpen}
        onClose={() => setIsDesignsModalOpen(false)}
        downloadingDesignId={downloadingDesignId}
        onSelectDesign={handleSelectDesign}
      />
    </div>
  );
};

export default ResultDisplay;
