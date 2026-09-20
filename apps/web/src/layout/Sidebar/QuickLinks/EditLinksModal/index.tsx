import { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from 'store';
import { updateProfileLinks } from 'store/authSlice';
import { showToast } from 'components/common/Toast';
import Modal from 'components/common/Modal';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';
import { FaLinkedin, FaGithub, FaGlobe, FaEnvelope, FaPencilAlt } from 'react-icons/fa';

interface EditLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full pl-8 pr-3 h-10 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm transition-all dark:text-neutral-100 placeholder:text-neutral-400';

const iconClass = 'absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400';

const EditLinksModal = ({ isOpen, onClose }: EditLinksModalProps) => {
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl ?? '');
  const [contactEmail, setContactEmail] = useState(user?.contactEmail ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      await dispatch(
        updateProfileLinks({
          linkedinUrl: linkedinUrl.trim(),
          githubUrl: githubUrl.trim(),
          websiteUrl: websiteUrl.trim(),
          contactEmail: contactEmail.trim(),
        }),
      ).unwrap();
      showToast('Links updated!', { type: 'success' });
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to update profile links');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Quick Links"
      icon={<FaPencilAlt size={ICON_SIZE.sm} />}
      footer={
        <CommonButton variant="primary" onClick={handleSave} isLoading={isSaving}>
          Save
        </CommonButton>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Add links of your LinkedIn, portfolio website, GitHub and email so
          you can quickly copy from here and then paste in the job
          application form.
        </p>

        {error && (
          <p className="px-3 py-2 bg-danger-subtle dark:bg-danger-subtle-dark border border-danger-border dark:border-danger-border-dark text-xs text-danger dark:text-danger-fg-dark font-medium">
            {error}
          </p>
        )}

        <div className="relative">
          <FaLinkedin className={iconClass} size={ICON_SIZE.xs} />
          <input
            type="text"
            placeholder="LinkedIn URL"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="relative">
          <FaGithub className={iconClass} size={ICON_SIZE.xs} />
          <input
            type="text"
            placeholder="GitHub URL"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="relative">
          <FaGlobe className={iconClass} size={ICON_SIZE.xs} />
          <input
            type="text"
            placeholder="Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="relative">
          <FaEnvelope className={iconClass} size={ICON_SIZE.xs} />
          <input
            type="email"
            placeholder="Contact email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditLinksModal;
