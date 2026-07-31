import { Navigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { useSelector } from 'react-redux';
import { showToast } from 'components/common/Toast';
import ConfirmModal from 'components/common/ConfirmModal';
import Header from './Header';
import BatchActionBar from './BatchActionBar';
import PreviousCoverLettersTable from './PreviousCoverLettersTable';
import { usePreviousCoverLetters } from './usePreviousCoverLetters';
import { useCopy } from 'hooks/useCopy';
import { buildFileName } from 'utils/fileNameUtils';
import type { RootState } from 'store';
import type { CoverLetterItem } from './types';

const PreviousCoverLettersView = () => {
  const {
    authLoading,
    isAuthenticated,
    data,
    total,
    page,
    totalPages,
    pageSize,
    isLoading,
    selectedIds,
    someSelected,
    showBatchConfirm,
    setShowBatchConfirm,
    deletingId,
    setDeletingId,
    toggleSelectAll,
    clearSelection,
    toggleSelect,
    handlePageChange,
    handlePageSizeChange,
    handleDelete,
    handleBatchDelete,
  } = usePreviousCoverLetters();

  const { handleCopy } = useCopy();
  const { user } = useSelector((state: RootState) => state.auth);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleDownloadPdf = (item: CoverLetterItem) => {
    try {
      const doc = new jsPDF();
      const pageWidth = 180;
      const marginX = 15;
      const startY = 20;
      const pageHeightLimit = 280;
      const lineSpacing = 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      const lines: string[] = doc.splitTextToSize(
        item.generatedText,
        pageWidth,
      );
      let currentY = startY;

      lines.forEach((line) => {
        if (currentY > pageHeightLimit) {
          doc.addPage();
          currentY = startY;
        }
        doc.text(line, marginX, currentY);
        currentY += lineSpacing;
      });

      const fileName = buildFileName(user?.name);
      doc.save(`${fileName}.pdf`);
    } catch {
      showToast('Failed to generate PDF', { type: 'error' });
    }
  };

  const handleDownloadWord = async (item: CoverLetterItem) => {
    try {
      const lines = item.generatedText.split('\n');
      const paragraphs = lines.map(
        (line) =>
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: 'Arial',
                size: 24,
              }),
            ],
            spacing: { after: 120 },
          }),
      );

      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = buildFileName(user?.name);
      saveAs(blob, `${fileName}.docx`);
    } catch {
      showToast('Failed to generate Word document', { type: 'error' });
    }
  };

  const handleCopyItem = (item: CoverLetterItem) => {
    handleCopy(item.generatedText, 'Cover letter');
  };

  return (
    <div className="py-6 md:py-8 px-1 sm:px-2">
      <Header total={total} />

      {someSelected && (
        <BatchActionBar
          selectedCount={selectedIds.size}
          onDelete={() => setShowBatchConfirm(true)}
          onClear={clearSelection}
        />
      )}

      <PreviousCoverLettersTable
        data={data}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        total={total}
        isLoading={isLoading}
        selectedIds={selectedIds}
        allSelected={
          data.length > 0 && data.every((d) => selectedIds.has(d.id))
        }
        someSelected={someSelected}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelect={toggleSelect}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        onCopy={handleCopyItem}
        onDelete={setDeletingId}
      />

      <ConfirmModal
        isOpen={deletingId !== null}
        title="Delete cover letter"
        message="Do you really want to delete it?"
        confirmLabel="Sure!"
        cancelLabel="Nope"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <ConfirmModal
        isOpen={showBatchConfirm}
        title={`Delete ${selectedIds.size} cover letter${selectedIds.size > 1 ? 's' : ''}`}
        message={`Are you sure you want to delete ${selectedIds.size} selected cover letter${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        onConfirm={handleBatchDelete}
        onCancel={() => setShowBatchConfirm(false)}
      />
    </div>
  );
};

export default PreviousCoverLettersView;
