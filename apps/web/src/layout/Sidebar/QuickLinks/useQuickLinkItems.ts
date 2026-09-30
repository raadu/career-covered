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
  FaLink,
  FaExternalLinkAlt,
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
  /** Left out of the list entirely when it has no value (the extras). */
  hideWhenEmpty?: boolean;
  handleCopy: (value: string, label?: string, e?: MouseEvent) => void;
}

// Shared by the desktop floating widget, the tablet rail's flyout and the
// mobile menu's Quick Links submenu, so all copy the same values with the
// same toasts. Returns null when signed out — there are no saved links to
// show. The two extra links only appear once they have a value; the core
// five always show (dimmed when unset) so users know they can fill them in.
export function useQuickLinkItems(): QuickLinkItem[] | null {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const linkedin = useCopy();
  const github = useCopy();
  const website = useCopy();
  const email = useCopy();
  const phone = useCopy();
  const extra1 = useCopy();
  const extra2 = useCopy();

  if (!isAuthenticated || !user) return null;

  const items: QuickLinkItem[] = [
    {
      key: 'linkedin',
      Icon: FaLinkedin,
      name: 'LinkedIn',
      title: 'Copy LinkedIn Link',
      value: user.linkedinUrl,
      label: 'LinkedIn link',
      hover: 'hover:text-blue-600 dark:hover:text-blue-400',
      handleCopy: linkedin.handleCopy,
    },
    {
      key: 'github',
      Icon: FaGithub,
      name: 'GitHub',
      title: 'Copy GitHub Link',
      value: user.githubUrl,
      label: 'GitHub link',
      hover: 'hover:text-neutral-900 dark:hover:text-neutral-100',
      handleCopy: github.handleCopy,
    },
    {
      key: 'website',
      Icon: FaGlobe,
      name: 'Website',
      title: 'Copy Website Link',
      value: user.websiteUrl,
      label: 'Website link',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      handleCopy: website.handleCopy,
    },
    {
      key: 'email',
      Icon: FaEnvelope,
      name: 'Email',
      title: 'Copy Contact Email',
      value: user.contactEmail,
      label: 'Contact email',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      handleCopy: email.handleCopy,
    },
    {
      key: 'phone',
      Icon: FaPhone,
      name: 'Phone',
      title: 'Copy Phone Number',
      value: user.phoneNumber,
      label: 'Phone number',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      handleCopy: phone.handleCopy,
    },
    {
      key: 'extra1',
      Icon: FaLink,
      name: 'Extra Link 1',
      title: 'Copy Extra Link 1',
      value: user.extraLink1Url,
      label: 'Extra link 1',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      hideWhenEmpty: true,
      handleCopy: extra1.handleCopy,
    },
    {
      key: 'extra2',
      Icon: FaExternalLinkAlt,
      name: 'Extra Link 2',
      title: 'Copy Extra Link 2',
      value: user.extraLink2Url,
      label: 'Extra link 2',
      hover: 'hover:text-brand-600 dark:hover:text-brand-400',
      hideWhenEmpty: true,
      handleCopy: extra2.handleCopy,
    },
  ];

  return items.filter((item) => !item.hideWhenEmpty || !!item.value);
}
