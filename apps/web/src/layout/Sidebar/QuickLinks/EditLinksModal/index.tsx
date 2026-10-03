import { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from 'store';
import { updateProfileLinks, type ProfileLinksPayload } from 'store/authSlice';
import { showToast } from 'components/common/Toast';
import Modal from 'components/common/Modal';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';
import type { IconType } from 'react-icons';
import {
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaLink,
  FaExternalLinkAlt,
  FaPencilAlt,
} from 'react-icons/fa';

interface EditLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LinkField = keyof Required<ProfileLinksPayload>;

interface FieldConfig {
  key: LinkField;
  Icon: IconType;
  placeholder: string;
  type: 'text' | 'email' | 'tel';
}

// Every field is always editable here — the extra links are only hidden from
// the Quick Links lists while empty, not from this form.
const FIELDS: FieldConfig[] = [
  { key: 'linkedinUrl', Icon: FaLinkedin, placeholder: 'LinkedIn URL', type: 'text' },
  { key: 'githubUrl', Icon: FaGithub, placeholder: 'GitHub URL', type: 'text' },
  { key: 'websiteUrl', Icon: FaGlobe, placeholder: 'Website URL', type: 'text' },
  { key: 'contactEmail', Icon: FaEnvelope, placeholder: 'Contact email', type: 'email' },
  { key: 'phoneNumber', Icon: FaPhone, placeholder: 'Phone number', type: 'tel' },
  { key: 'extraLink1Url', Icon: FaLink, placeholder: 'Extra Link 1 URL', type: 'text' },
  { key: 'extraLink2Url', Icon: FaExternalLinkAlt, placeholder: 'Extra Link 2 URL', type: 'text' },
];

const inputClass =
  'w-full pl-8 pr-3 h-10 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm transition-all dark:text-neutral-100 placeholder:text-neutral-400';

const iconClass = 'absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400';

const EditLinksModal = ({ isOpen, onClose }: EditLinksModalProps) => {
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [values, setValues] = useState<Record<LinkField, string>>(() =>
    Object.fromEntries(
      FIELDS.map(({ key }) => [key, user?.[key] ?? '']),
    ) as Record<LinkField, string>,
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      // Every field is sent; an empty (trimmed) value clears it server-side.
      const payload = Object.fromEntries(
        FIELDS.map(({ key }) => [key, values[key].trim()]),
      ) as Required<ProfileLinksPayload>;
      await dispatch(updateProfileLinks(payload)).unwrap();
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
          Add links of your LinkedIn, portfolio website, GitHub, email and
          phone number so you can quickly copy from here and then paste in
          the job application form. The two extra links show up in Quick
          Links only once you fill them in.
        </p>

        {error && (
          <p className="px-3 py-2 bg-danger-subtle dark:bg-danger-subtle-dark border border-danger-border dark:border-danger-border-dark text-xs text-danger dark:text-danger-fg-dark font-medium">
            {error}
          </p>
        )}

        {FIELDS.map(({ key, Icon, placeholder, type }) => (
          <div key={key} className="relative">
            <Icon className={iconClass} size={ICON_SIZE.xs} />
            <input
              type={type}
              placeholder={placeholder}
              aria-label={placeholder}
              value={values[key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default EditLinksModal;
