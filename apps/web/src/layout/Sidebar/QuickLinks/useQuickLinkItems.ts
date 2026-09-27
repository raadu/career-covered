import type { MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';
import { useCopy } from 'hooks/useCopy';
import {
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';

export interface QuickLinkItem {
  key: string;
  Icon: typeof FaLinkedin;
  /** Short display name, e.g. "LinkedIn". */
  name: string;
  /** Accessible name / tooltip for the copy action. */
  title: string;
  value: string | null | undefined;
  /** Noun used in the "<label> copied!" toast. */
  label: string;
  hover: string;
  handleCopy: (value: string, label?: string, e?: MouseEvent) => void;
}

// Shared by the desktop floating widget and the mobile menu's Quick Links
// submenu, so both copy the same values with the same toasts. Returns null
// when signed out — there are no saved links to show.
export function useQuickLinkItems(): QuickLinkItem[] | null {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const linkedin = useCopy();
  const github = useCopy();
  const website = useCopy();
  const email = useCopy();
  const phone = useCopy();

  if (!isAuthenticated || !user) return null;

  return [
    {
      key: 'linkedin',
      Icon: FaLinkedin,
      name: 'LinkedIn',
      title: 'Copy LinkedIn link',
      value: user.linkedinUrl,
      label: 'LinkedIn link',
      hover: 'hover:text-blue-600 dark:hover:text-blue-400',
      handleCopy: linkedin.handleCopy,
    },
    {
      key: 'github',
      Icon: FaGithub,
      name: 'GitHub',
      title: 'Copy GitHub link',
      value: user.githubUrl,
      label: 'GitHub link',
      hover: 'hover:text-neutral-900 dark:hover:text-neutral-100',
      handleCopy: github.handleCopy,
    },
    {
      key: 'website',
      Icon: FaGlobe,
      name: 'Website',
      title: 'Copy website link',
      value: user.websiteUrl,
      label: 'Website link',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      handleCopy: website.handleCopy,
    },
    {
      key: 'email',
      Icon: FaEnvelope,
      name: 'Email',
      title: 'Copy contact email',
      value: user.contactEmail,
      label: 'Contact email',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      handleCopy: email.handleCopy,
    },
    {
      key: 'phone',
      Icon: FaPhone,
      name: 'Phone',
      title: 'Copy phone number',
      value: user.phoneNumber,
      label: 'Phone number',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      handleCopy: phone.handleCopy,
    },
  ];
}
