import { useState, useEffect, type RefObject } from 'react';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from 'store';
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

interface TemplateInputProps {
  // Forwarded to the "Your Cover Letter Template" card only (not the saved
  // templates row above it), so a sibling can match its height exactly.
  boxRef?: RefObject<HTMLDivElement | null>;
}

const TemplateInput = ({ boxRef }: TemplateInputProps) => {
  const dispatch = useAppDispatch();
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
      showToast(
        'Oops! You should login to do that. Creating an account is so easy.',
        { type: 'info', duration: 6000 },
      );
      dispatch(setAuthModalOpen(true));
      return;
    }
    const trimmed = template.trim();
    if (!trimmed) return;
    const nextNumber = savedTemplates.length + 1;
    dispatch(
      createTemplate({ name: `Template ${nextNumber}`, content: trimmed }),
    );
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
    // lg:contents un-boxes this wrapper at desktop so its two children become
    // direct items of the parent grid — the saved-templates row and the card
    // land in separate grid rows, letting the Resume box align to the card
    // itself (row 2) instead of guessing a fixed offset for the row above it.
    // Below lg it stays a normal block so mobile keeps its original stacking.
    <div className="space-y-1 lg:space-y-0 lg:contents">
      <div className="lg:col-start-1 lg:row-start-1">
        {isLoadingTemplates ? (
          <div className="flex gap-2 py-1">
            <div className="w-24 h-7 bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div className="w-20 h-7 bg-gray-100 dark:bg-gray-700 animate-pulse" />
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
      </div>

      <div className="space-y-1 lg:col-start-1 lg:row-start-2">
        <CollapsibleTextArea
          ref={boxRef}
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
    </div>
  );
};

export default TemplateInput;
