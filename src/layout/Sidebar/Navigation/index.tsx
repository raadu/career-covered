import { FaFileAlt, FaLifeRing, FaQuestionCircle } from 'react-icons/fa';
import { clsx } from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarNavigationProps {
  isExpanded: boolean;
}

const SidebarNavigation = ({ isExpanded }: SidebarNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const menuItems = [
    { 
      path: '/', 
      label: 'Cover Letter', 
      icon: FaFileAlt,
      title: 'Cover Letter Generator'
    },
    { 
      path: '/faq', 
      label: 'FAQ', 
      icon: FaQuestionCircle,
      title: 'Frequently Asked Questions'
    },
    { 
      path: '/support', 
      label: 'Support', 
      icon: FaLifeRing,
      title: 'Get Support'
    },
  ];

  return (
    <nav className="flex-1 flex flex-row lg:flex-col p-1 lg:p-2 gap-2 lg:gap-0 lg:space-y-1.5 w-full overflow-x-auto lg:overflow-visible items-center lg:items-stretch h-full no-scrollbar">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;

        return (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={clsx(
              "group flex items-center cursor-pointer transition-all duration-300 relative",
              "p-2 lg:p-2.5 mx-1 rounded-xl lg:rounded-2xl whitespace-nowrap",
              isExpanded ? "lg:rounded-xl lg:gap-3 gap-2" : "lg:justify-center gap-2",
              isActive 
                ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/5" 
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
            )}
            title={item.title}
          >
            <div className={clsx(
              "shrink-0 flex items-center justify-center transition-all duration-300",
              isActive ? "scale-110" : "group-hover:scale-110"
            )}>
              <Icon size={isExpanded ? 16 : 20} className="lg:w-5 lg:h-5 w-4 h-4" />
            </div>
            
            <span className={clsx(
                "text-[12px] lg:text-[13px] font-bold tracking-tight transition-all truncate",
                isActive ? "opacity-100" : "opacity-80",
                !isExpanded ? "lg:hidden block" : "block",
                "hidden sm:block"
              )}>
                {item.label}
            </span>

            {isActive && (
              <div className="absolute bottom-0 lg:bottom-auto left-auto lg:left-0 w-5 lg:w-1 h-1 lg:h-4 bg-blue-500 rounded-full" />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default SidebarNavigation;
