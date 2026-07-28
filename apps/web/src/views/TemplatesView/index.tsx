import { Navigate } from 'react-router-dom';
import ConfirmModal from 'components/common/ConfirmModal';
import TemplatesHeader from './TemplatesHeader';
import BatchActionBar from './BatchActionBar';
import TemplateTable from './TemplateTable';
import CreateTemplateModal from './CreateTemplateModal';
import EditTemplateModal from './EditTemplateModal';
import { useTemplates } from './useTemplates';

const TemplatesView = () => {
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
    isCreateOpen,
    setIsCreateOpen,
    createName,
    setCreateName,
    createContent,
    setCreateContent,
    isCreating,
    editingTemplate,
    setEditingTemplate,
    editName,
    setEditName,
    editContent,
    setEditContent,
    isUpdating,
    deletingTemplateId,
    setDeletingTemplateId,
    allSelected,
    toggleSelectAll,
    clearSelection,
    toggleSelect,
    handlePageChange,
    handlePageSizeChange,
    handleCreate,
    openEditModal,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
  } = useTemplates();

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="py-6 md:py-8 px-1 sm:px-2">
      <TemplatesHeader total={total} onCreateClick={() => setIsCreateOpen(true)} />

      {someSelected && (
        <BatchActionBar
          selectedCount={selectedIds.size}
          onDelete={() => setShowBatchConfirm(true)}
          onClear={clearSelection}
        />
      )}

      <TemplateTable
        data={data}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        total={total}
        isLoading={isLoading}
        selectedIds={selectedIds}
        allSelected={allSelected}
        someSelected={someSelected}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelect={toggleSelect}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onEdit={openEditModal}
        onDelete={setDeletingTemplateId}
      />

      <CreateTemplateModal
        isOpen={isCreateOpen}
        name={createName}
        content={createContent}
        isCreating={isCreating}
        onNameChange={setCreateName}
        onContentChange={setCreateContent}
        onSave={handleCreate}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditTemplateModal
        template={editingTemplate}
        name={editName}
        content={editContent}
        isUpdating={isUpdating}
        onNameChange={setEditName}
        onContentChange={setEditContent}
        onSave={handleUpdate}
        onClose={() => setEditingTemplate(null)}
      />

      <ConfirmModal
        isOpen={deletingTemplateId !== null}
        title="Delete template"
        message="Do you really want to delete it?"
        confirmLabel="Sure!"
        cancelLabel="Nope"
        onConfirm={handleDelete}
        onCancel={() => setDeletingTemplateId(null)}
      />

      <ConfirmModal
        isOpen={showBatchConfirm}
        title={`Delete ${selectedIds.size} template${selectedIds.size > 1 ? 's' : ''}`}
        message={`Are you sure you want to delete ${selectedIds.size} selected template${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        onConfirm={handleBatchDelete}
        onCancel={() => setShowBatchConfirm(false)}
      />
    </div>
  );
};

export default TemplatesView;