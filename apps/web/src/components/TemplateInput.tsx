import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from 'store';
import {
  setTemplate,
  toggleTemplateExpanded,
  selectTemplate,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  clearTemplate,
} from 'store/coverLetterSlice';
import { setAuthModalOpen } from 'store/authSlice';
import { showToast } from 'components/common/Toast';
import ConfirmModal from 'components/common/ConfirmModal';
import CollapsibleTextArea from 'components/common/CollapsibleTextArea';
import TemplateSelector from 'components/TemplateSelector';

const TemplateInput = () => {
  const dispatch = useDispatch();
  const {
    template,
    isTemplateExpanded,
    savedTemplates,
    activeTemplateId,
    isLoadingTemplates,
  } = useSelector((state: RootState) => state.coverLetter);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTemplates());
    }
  }, [isAuthenticated, dispatch]);

  const handleAddTemplate = () => {
    if (!isAuthenticated) {
      showToast("Oops! You should login to do that. Creating an account is so easy.", { type: 'info', duration: 6000 });
      dispatch(setAuthModalOpen(true));
      return;
    }
    const trimmed = template.trim();
    if (!trimmed) return;
    const nextNumber = savedTemplates.length + 1;
    dispatch(createTemplate({ name: `Template ${nextNumber}`, content: trimmed }));
  };

  const handleRename = (id: string, name: string) => {
    const existing = savedTemplates.find((t) => t.id === id);
    if (existing) {
      dispatch(updateTemplate({ id, name, content: existing.content }));
    }
  };

  const handleRemove = (id: string) => {
    setTemplateToDelete(id);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      dispatch(deleteTemplate(templateToDelete));
      setTemplateToDelete(null);
    }
  };

  const cancelDelete = () => {
    setTemplateToDelete(null);
  };

  return (
    <div className="space-y-1">
      {isLoadingTemplates ? (
        <div className="flex gap-2 py-1">
          <div className="w-24 h-7 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="w-20 h-7 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      ) : (
        <TemplateSelector
          templates={savedTemplates}
          activeId={activeTemplateId}
          onSelect={(id) => dispatch(selectTemplate(id))}
          onRename={handleRename}
          onRemove={handleRemove}
        />
      )}
      <CollapsibleTextArea
        label="Your Cover Letter Template"
        value={template}
        onChange={(val) => dispatch(setTemplate(val))}
        isExpanded={isTemplateExpanded}
        onToggleExpand={() => dispatch(toggleTemplateExpanded())}
        onClear={() => dispatch(clearTemplate())}
        onAddTemplate={handleAddTemplate}
        placeholder="Paste your existing cover letter here. We'll largely keep your tone and structure but adapt it to the job."
      />

      <ConfirmModal
        isOpen={templateToDelete !== null}
        title="Delete template"
        message="Do you really want to delete it?"
        confirmLabel="Sure!"
        cancelLabel="Nope"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default TemplateInput;
