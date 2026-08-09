import { Navigate } from 'react-router-dom';
import ConfirmModal from 'components/common/ConfirmModal';
import Header from './Header';
import ResumeGrid from './ResumeGrid';
import PreviewModal from './PreviewModal';
import { useResume } from './useResume';

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
  } = useResume();

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const previewResume = data.find((r) => r.id === previewId) ?? null;

  return (
    <div className="py-6 md:py-8 px-1 sm:px-2">
      <Header />

      <ResumeGrid
        resumes={data}
        isUploading={isUploading}
        busyId={busyId}
        onUpload={uploadResume}
        onReorder={reorderResumes}
        onRename={renameResume}
        onPreview={setPreviewId}
        onDownload={(id) => window.open(`/api/resumes/${id}/download`, '_blank')}
        onReplace={replaceResume}
        onDelete={setDeletingId}
      />

      <PreviewModal
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
    </div>
  );
};

export default ResumeView;
