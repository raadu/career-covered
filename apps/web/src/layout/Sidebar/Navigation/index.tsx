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
    <nav className="flex-1 flex flex-row lg:flex-col p-0.5 lg:p-1 gap-1 lg:gap-0 lg:space-y-0.5 w-full overflow-x-auto lg:overflow-visible items-center lg:items-stretch h-full no-scrollbar">
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
                'group flex items-center cursor-pointer transition-all duration-300 relative',
                'py-1.5 px-2 mx-0.5 rounded-md whitespace-nowrap',
                isExpanded
                  ? 'lg:rounded-md lg:gap-2 gap-1.5'
                  : 'lg:justify-center gap-1.5',
                isExpandedItem
                  ? 'bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/5'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300',
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
                  className="lg:w-4 lg:h-4 w-3.5 h-3.5"
                />
              </div>

              <span
                className={clsx(
                  'text-[11px] lg:text-[12px] font-semibold tracking-tight transition-all truncate flex-1',
                  isExpandedItem ? 'opacity-100' : 'opacity-80',
                  !isExpanded ? 'lg:hidden block' : 'block',
                  'hidden sm:block',
                )}
              >
                {item.label}
              </span>

              {hasChildren && item.path !== '/' && (
                <FaChevronDown
                  size={10}
                  className={clsx(
                    'transition-transform duration-200',
                    isExpanded ? 'block' : 'lg:hidden block',
                    'hidden sm:block',
                    isExpandedItem ? 'rotate-0' : '-rotate-90',
                  )}
                />
              )}

              {isExpandedItem && (
                <div className="absolute bottom-0 lg:bottom-auto left-auto lg:left-0 w-4 lg:w-0.5 h-0.5 lg:h-3 bg-blue-500 rounded-full" />
              )}
            </div>

            {hasChildren && isExpandedItem && (
              <div className="flex flex-row lg:flex-col ml-2 lg:ml-2.5 mt-0.5 lg:mt-0.5 gap-0.5">
                {item.children!.map((child) => {
                  const isChildRouteActive = currentPath === child.path;
                  return (
                    <div
                      key={child.path}
                      onClick={() => navigate(child.path)}
                      className={clsx(
                        'group flex items-center cursor-pointer transition-all duration-200 relative',
                        'px-2 py-1 mx-0.5 rounded whitespace-nowrap',
                        isExpanded
                          ? 'lg:gap-1.5 gap-1'
                          : 'lg:justify-center gap-1',
                        isChildRouteActive
                          ? 'bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300',
                      )}
                      title={child.label}
                    >
                      <div
                        className={clsx(
                          'w-1 h-1 rounded-full shrink-0 transition-all',
                          isChildRouteActive
                            ? 'bg-blue-500'
                            : 'bg-gray-300 dark:bg-gray-600',
                        )}
                      />
                      <span
                        className={clsx(
                          'text-[10px] lg:text-[11px] font-semibold tracking-tight transition-all truncate',
                          !isExpanded ? 'lg:hidden block' : 'block',
                          'hidden sm:block',
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
