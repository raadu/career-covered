import { FaPlus } from 'react-icons/fa';
import Modal from 'components/common/Modal';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';

interface CreateTemplateModalProps {
  isOpen: boolean;
  name: string;
  content: string;
  isCreating: boolean;
  onNameChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const CreateTemplateModal = ({
  isOpen,
  name,
  content,
  isCreating,
  onNameChange,
  onContentChange,
  onSave,
  onClose,
}: CreateTemplateModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={() => {
      if (!isCreating) onClose();
    }}
    title="Add a New Template"
    icon={<FaPlus size={ICON_SIZE.sm} />}
    maxWidth="max-w-lg"
    footer={
      <>
        <CommonButton
          variant="secondary"
          onClick={onClose}
          disabled={isCreating}
        >
          Cancel
        </CommonButton>
        <CommonButton
          variant="primary"
          onClick={onSave}
          isLoading={isCreating}
          disabled={!name.trim() || !content.trim()}
        >
          Create
        </CommonButton>
      </>
    }
  >
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          Template Name
        </label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Fullstack Developer Template"
          className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          Template Content
        </label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Write or paste down your cover letter template..."
          rows={6}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
        />
      </div>
    </div>
  </Modal>
);

export default CreateTemplateModal;
