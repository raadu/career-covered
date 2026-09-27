import {
  FaFileAlt,
  FaFileUpload,
  FaHistory,
  FaLayerGroup,
  FaLifeRing,
  FaQuestionCircle,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { clsx } from 'clsx';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';
import { useIsMobile } from 'hooks/useIsMobile';
import NavItem from './NavItem';

interface MenuLink {
  path: string;
  label: string;
  icon: IconType;
}

interface MenuItem extends MenuLink {
  children?: MenuLink[];
  /** Hidden in the phone top bar — reachable from the hamburger menu there. */
  desktopOnly?: boolean;
}

const COVER_LETTER_CHILDREN: MenuLink[] = [
  { path: '/cover-letter/templates', label: 'Templates', icon: FaLayerGroup },
  {
    path: '/cover-letter/previous',
    label: 'Previously Created',
    icon: FaHistory,
  },
];

function buildMenuItems(isAuthenticated: boolean): MenuItem[] {
  return [
    {
      path: '/',
      label: 'Cover Letter',
      icon: FaFileAlt,
      children: isAuthenticated ? COVER_LETTER_CHILDREN : [],
    },
    ...(isAuthenticated
      ? [{ path: '/resume', label: 'Resumes', icon: FaFileUpload }]
      : []),
    { path: '/faq', label: 'FAQ', icon: FaQuestionCircle, desktopOnly: true },
    { path: '/support', label: 'Support', icon: FaLifeRing, desktopOnly: true },
  ];
}

interface SidebarNavigationProps {
  isExpanded: boolean;
}

const SidebarNavigation = ({ isExpanded }: SidebarNavigationProps) => {
  const currentPath = useLocation().pathname;
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const tooltipSide = useIsMobile() ? 'bottom' : 'right';

  return (
    <nav
      aria-label="Main"
      className="flex-1 flex flex-row md:flex-col p-0.5 md:p-1 gap-0.5 w-full overflow-x-auto md:overflow-visible items-center md:items-stretch no-scrollbar"
    >
      {buildMenuItems(isAuthenticated).map((item) => (
        <div
          key={item.path}
          className={clsx(
            'flex-row md:flex-col gap-0.5 md:w-full',
            item.desktopOnly ? 'hidden md:flex' : 'flex',
          )}
        >
          <NavItem
            path={item.path}
            label={item.label}
            Icon={item.icon}
            isActive={currentPath === item.path}
            isExpanded={isExpanded}
            tooltipSide={tooltipSide}
          />
          {item.children?.map((child) => (
            <NavItem
              key={child.path}
              path={child.path}
              label={child.label}
              Icon={child.icon}
              isActive={currentPath === child.path}
              isExpanded={isExpanded}
              tooltipSide={tooltipSide}
              isChild
            />
          ))}
        </div>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
