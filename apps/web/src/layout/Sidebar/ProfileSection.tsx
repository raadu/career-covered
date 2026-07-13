import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from 'store';
import { setAuthModalOpen, logoutUser } from 'store/authSlice';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

interface ProfileSectionProps {
  isExpanded: boolean;
}

const ProfileSection = ({ isExpanded }: ProfileSectionProps) => {
  const dispatch = useDispatch<any>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      dispatch(logoutUser())
        .unwrap()
        .then(() => toast.success('Signed out'))
        .catch(() => toast.error('Sign out failed'));
    } else {
      dispatch(setAuthModalOpen(true));
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex flex-col shrink-0">
      {isAuthenticated && user ? (
        <div className={clsx(
          "flex items-center gap-2.5 h-12 w-full px-3 transition-all shrink-0",
          isExpanded
            ? "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            : "justify-center"
        )}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-sm">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              initial
            )}
          </div>

          {isExpanded && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[9px] text-gray-400 truncate leading-tight">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleAuthAction}
                title="Sign Out"
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
              >
                <FaSignOutAlt className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={handleAuthAction}
          className={clsx(
            "h-12 w-full text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 lg:border-t border-gray-100 dark:border-gray-700 flex items-center transition-all duration-300 group shrink-0",
            isExpanded
              ? "gap-3 px-4 lg:hover:bg-gray-50 lg:dark:hover:bg-gray-700"
              : "justify-center lg:hover:bg-gray-50 lg:dark:hover:bg-gray-700"
          )}
          title="Sign In"
        >
          <FaSignInAlt
            size={18}
            className="group-hover:scale-110 transition-all shrink-0"
          />
          {isExpanded && (
            <span className="hidden lg:block text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Sign In
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default ProfileSection;
