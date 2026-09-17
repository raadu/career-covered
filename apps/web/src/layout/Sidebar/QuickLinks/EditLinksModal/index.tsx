import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from 'store';
import { updateProfileLinks } from 'store/authSlice';
import { showToast } from 'components/common/Toast';
import { FaLinkedin, FaGithub, FaGlobe, FaEnvelope } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';

interface EditLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full pl-8 pr-3 h-9 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none text-[13px] transition-all dark:text-gray-100 placeholder:text-gray-400';

const iconClass = 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400';

const EditLinksModal = ({ isOpen, onClose }: EditLinksModalProps) => {
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl ?? '');
  const [contactEmail, setContactEmail] = useState(user?.contactEmail ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

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

  // Portaled to document.body: this modal is mounted from inside <aside>,
  // which sets z-10 to layer itself above scrolled page content. A
  // position:relative ancestor with a non-auto z-index creates a stacking
  // context that a position:fixed descendant can never escape by raising
  // its own z-index — so without the portal, this modal's z-50 only
  // competes within the sidebar's z-10 context, and page content elsewhere
  // with its own z-index (e.g. the toolbar's "HELP" button) can render on
  // top of it. Portaling to <body> puts the modal in the root stacking
  // context, matching how CustomizeModal/AuthModal behave from <main>.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/30 backdrop-blur-md transition-all overscroll-none"
      onClick={onClose}
    >
      <div
        className="flex flex-col bg-white dark:bg-gray-800 shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-200 dark:border-gray-700"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0">
          <Header onClose={onClose} />
        </div>

        <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add links of your LinkedIn, portfolio website, GitHub and email so
            you can quickly copy from here and then paste in the job
            application form.
          </p>

          {error && (
            <p className="px-3 py-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-[11px] text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          )}

          <div className="relative">
            <FaLinkedin className={iconClass} size={12} />
            <input
              type="text"
              placeholder="LinkedIn URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="relative">
            <FaGithub className={iconClass} size={12} />
            <input
              type="text"
              placeholder="GitHub URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="relative">
            <FaGlobe className={iconClass} size={12} />
            <input
              type="text"
              placeholder="Website URL"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="relative">
            <FaEnvelope className={iconClass} size={12} />
            <input
              type="email"
              placeholder="Contact email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="shrink-0">
          <Footer onSave={handleSave} isSaving={isSaving} />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EditLinksModal;
