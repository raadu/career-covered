import { FaPencilAlt } from 'react-icons/fa';
import Modal from 'components/common/Modal';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';
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
}: EditTemplateModalProps) => (
  <Modal
    isOpen={template !== null}
    onClose={() => {
      if (!isUpdating) onClose();
    }}
    title="Edit Template"
    icon={<FaPencilAlt size={ICON_SIZE.sm} />}
    maxWidth="max-w-lg"
    footer={
      <>
        <CommonButton
          variant="secondary"
          onClick={onClose}
          disabled={isUpdating}
        >
          Cancel
        </CommonButton>
        <CommonButton
          variant="primary"
          onClick={onSave}
          isLoading={isUpdating}
          disabled={!name.trim() || !content.trim()}
        >
          Save
        </CommonButton>
      </>
    }
  >
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
        />
      </div>
    </div>
  </Modal>
);

export default EditTemplateModal;
