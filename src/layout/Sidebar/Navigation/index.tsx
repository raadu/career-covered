import { FaFileAlt, FaLifeRing } from 'react-icons/fa';
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
      path: '/support', 
      label: 'Support', 
      icon: FaLifeRing,
      title: 'Get Support'
    },
  ];

  return (
    <nav className="flex-1 p-2 space-y-1.5">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;

        return (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={clsx(
              "group flex items-center cursor-pointer transition-all duration-300 relative",
              isExpanded ? "p-2.5 mx-1 rounded-xl gap-3" : "p-2.5 justify-center rounded-2xl mx-1",
              isActive 
                ? "bg-blue-50/80 text-blue-600 shadow-sm shadow-blue-500/5" 
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            )}
            title={item.title}
          >
            <div className={clsx(
              "shrink-0 flex items-center justify-center transition-all duration-300",
              isActive ? "scale-110" : "group-hover:scale-110"
            )}>
              <Icon size={isExpanded ? 16 : 20} />
            </div>
            
            {isExpanded && (
              <span className={clsx(
                "text-[13px] font-bold tracking-tight transition-all truncate",
                isActive ? "opacity-100" : "opacity-80"
              )}>
                {item.label}
              </span>
            )}

            {isActive && (
              <div className="absolute left-0 w-1 h-4 bg-blue-500 rounded-full" />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default SidebarNavigation;
