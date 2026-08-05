import CommonButton from 'components/common/CommonButton';
import type { Template } from './types';

interface EditTemplateModalProps {
  template: Template | null;
  name: string;
  content: string;
  isUpdating: boolean;
  onNameChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const EditTemplateModal = ({
  template,
  name,
  content,
  isUpdating,
  onNameChange,
  onContentChange,
  onSave,
  onClose,
}: EditTemplateModalProps) => {
  if (!template) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={() => {
        if (!isUpdating) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Edit Template
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <CommonButton
            variant="secondary"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </CommonButton>
          <CommonButton
            variant="dark"
            onClick={onSave}
            isLoading={isUpdating}
            disabled={!name.trim() || !content.trim()}
          >
            Save
          </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default EditTemplateModal;
