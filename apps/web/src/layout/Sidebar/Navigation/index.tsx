import {
  FaFileAlt,
  FaFileUpload,
  FaLifeRing,
  FaQuestionCircle,
  FaChevronDown,
} from 'react-icons/fa';
import { clsx } from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';

interface MenuChild {
  path: string;
  label: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: typeof FaFileAlt;
  title: string;
  children?: MenuChild[];
}

interface SidebarNavigationProps {
  isExpanded: boolean;
}

const SidebarNavigation = ({ isExpanded }: SidebarNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const menuItems: MenuItem[] = [
    {
      path: '/',
      label: 'Cover Letter',
      icon: FaFileAlt,
      title: 'Cover Letter Generator',
      children: [
        ...(isAuthenticated
          ? [
              { path: '/cover-letter/templates', label: 'Templates' },
              { path: '/cover-letter/previous', label: 'Previously Created' },
            ]
          : []),
      ],
    },
    ...(isAuthenticated
      ? [
          {
            path: '/resume',
            label: 'Resumes',
            icon: FaFileUpload,
            title: 'Manage your resumes',
          },
        ]
      : []),
    {
      path: '/faq',
      label: 'FAQ',
      icon: FaQuestionCircle,
      title: 'Frequently Asked Questions',
    },
    {
      path: '/support',
      label: 'Support',
      icon: FaLifeRing,
      title: 'Get Support',
    },
  ];

  return (
    <nav className="flex-1 flex flex-row md:flex-col p-0.5 md:p-1 gap-1 md:gap-0 md:space-y-0.5 w-full overflow-x-auto md:overflow-visible items-center md:items-stretch h-full no-scrollbar">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        const hasChildren = !!item.children?.length;
        const isChildActive =
          hasChildren && item.children!.some((c) => currentPath === c.path);
        const isExpandedItem = isActive || isChildActive;

        return (
          <div key={item.path} className="flex flex-col w-full">
            <div
              onClick={() => navigate(item.path)}
              className={clsx(
                'group flex items-center cursor-pointer transition-all duration-300 relative min-h-10',
                'py-1.5 px-2 mx-0.5 whitespace-nowrap',
                isExpanded ? 'md:gap-2 gap-1.5' : 'md:justify-center gap-1.5',
                isExpandedItem
                  ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
                  : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200',
              )}
              title={item.title}
            >
              <div
                className={clsx(
                  'shrink-0 flex items-center justify-center transition-all duration-300',
                  isExpandedItem ? 'scale-105' : 'group-hover:scale-105',
                )}
              >
                <Icon
                  size={isExpanded ? 14 : 16}
                  className="md:w-4 md:h-4 w-3.5 h-3.5"
                />
              </div>

              <span
                className={clsx(
                  'text-[11px] md:text-xs font-semibold tracking-tight transition-all truncate flex-1',
                  isExpandedItem ? 'opacity-100' : 'opacity-80',
                  'hidden sm:block md:hidden',
                  isExpanded && 'lg:block',
                )}
              >
                {item.label}
              </span>

              {hasChildren && item.path !== '/' && (
                <FaChevronDown
                  size={10}
                  className={clsx(
                    'transition-transform duration-200 hidden sm:block md:hidden',
                    isExpanded && 'lg:block',
                    isExpandedItem ? 'rotate-0' : '-rotate-90',
                  )}
                />
              )}

              {isExpandedItem && (
                <div className="absolute bottom-0 md:bottom-auto left-auto md:left-0 w-4 md:w-0.5 h-0.5 md:h-3 bg-brand-600" />
              )}
            </div>

            {hasChildren && isExpandedItem && (
              <div className="flex flex-row md:flex-col ml-2 md:ml-2.5 mt-0.5 md:mt-0.5 gap-0.5">
                {item.children!.map((child) => {
                  const isChildRouteActive = currentPath === child.path;
                  return (
                    <div
                      key={child.path}
                      onClick={() => navigate(child.path)}
                      className={clsx(
                        'group flex items-center cursor-pointer transition-all duration-200 relative min-h-10',
                        'px-2 py-1 mx-0.5 whitespace-nowrap',
                        isExpanded ? 'md:gap-1.5 gap-1' : 'md:justify-center gap-1',
                        isChildRouteActive
                          ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                          : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200',
                      )}
                      title={child.label}
                    >
                      <div
                        className={clsx(
                          'w-1 h-1 rounded-full shrink-0 transition-all',
                          isChildRouteActive
                            ? 'bg-brand-600'
                            : 'bg-neutral-300 dark:bg-neutral-600',
                        )}
                      />
                      <span
                        className={clsx(
                          'text-[10px] md:text-[11px] font-semibold tracking-tight transition-all truncate hidden sm:block md:hidden',
                          isExpanded && 'lg:block',
                        )}
                      >
                        {child.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default SidebarNavigation;
