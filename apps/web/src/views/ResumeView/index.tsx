import { Navigate } from 'react-router-dom';
import ConfirmModal from 'components/common/ConfirmModal';
import ResumePreviewModal from 'components/common/ResumePreviewModal';
import BatchActionBar from 'views/TemplatesView/BatchActionBar';
import { MAX_RESUMES } from 'utils/resumeConstants';
import Header from './Header';
import ResumeGrid from './ResumeGrid';
import ResumeTable from './ResumeTable';
import { useResume } from './useResume';
import { useResumeViewMode } from './useResumeViewMode';

const ResumeView = () => {
  const {
    authLoading,
    isAuthenticated,
    data,
    isUploading,
    busyId,
    deletingId,
    setDeletingId,
    previewId,
    setPreviewId,
    uploadResume,
    replaceResume,
    renameResume,
    handleDelete,
    reorderResumes,
    notifyMaxResumesReached,
    pagedData,
    pageIndex,
    pageSize,
    pageCount,
    handlePageChange,
    handlePageSizeChange,
    reorderPagedResumes,
    selectedIds,
    allSelected,
    someSelected,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    showBatchConfirm,
    setShowBatchConfirm,
    handleBatchDelete,
  } = useResume();
  const { viewMode, setViewMode } = useResumeViewMode();

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const previewResume = data.find((r) => r.id === previewId) ?? null;
  const atCap = data.length >= MAX_RESUMES;
  const downloadResume = (id: string) =>
    window.open(`/api/resumes/${id}/download`, '_blank');

  return (
    <div className="py-6 md:py-8 px-1 sm:px-2">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        atCap={atCap}
        isUploading={isUploading}
        onUpload={uploadResume}
        onCapReached={notifyMaxResumesReached}
      />

      {viewMode === 'grid' ? (
        <ResumeGrid
          resumes={data}
          isUploading={isUploading}
          busyId={busyId}
          onUpload={uploadResume}
          onCapReached={notifyMaxResumesReached}
          onReorder={reorderResumes}
          onRename={renameResume}
          onPreview={setPreviewId}
          onDownload={downloadResume}
          onReplace={replaceResume}
          onDelete={setDeletingId}
        />
      ) : (
        <>
          {someSelected && (
            <BatchActionBar
              selectedCount={selectedIds.size}
              onDelete={() => setShowBatchConfirm(true)}
              onClear={clearSelection}
            />
          )}

          <ResumeTable
            resumes={pagedData}
            busyId={busyId}
            selectedIds={selectedIds}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelect={toggleSelect}
            onReorder={reorderPagedResumes}
            onRename={renameResume}
            onPreview={setPreviewId}
            onDownload={downloadResume}
            onReplace={replaceResume}
            onDelete={setDeletingId}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={pageCount}
            total={data.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      <ResumePreviewModal
        isOpen={previewId !== null}
        resumeId={previewId}
        resumeName={previewResume?.name}
        onClose={() => setPreviewId(null)}
      />

      <ConfirmModal
        isOpen={deletingId !== null}
        title="Delete resume"
        message="Do you really want to delete this resume?"
        confirmLabel="Sure!"
        cancelLabel="Nope"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <ConfirmModal
        isOpen={showBatchConfirm}
        title={`Delete ${selectedIds.size} resume${selectedIds.size > 1 ? 's' : ''}`}
        message={`Are you sure you want to delete ${selectedIds.size} selected resume${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        onConfirm={handleBatchDelete}
        onCancel={() => setShowBatchConfirm(false)}
      />
    </div>
  );
};

export default ResumeView;
