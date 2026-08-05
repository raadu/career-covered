import { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from 'store';
import { setAuthModalOpen, logoutUser } from 'store/authSlice';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { clsx } from 'clsx';
import { showToast } from 'components/common/Toast';
import { EMOJI_CRY } from 'utils/emojiUtils';
import ConfirmModal from 'components/common/ConfirmModal';

interface ProfileSectionProps {
  isExpanded: boolean;
}

const ProfileSection = ({ isExpanded }: ProfileSectionProps) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() =>
        showToast(`You're logged out. We're gonna miss you ${EMOJI_CRY}`, {
          type: 'info',
        }),
      )
      .catch(() => showToast('Sign out failed', { type: 'error' }));
    setShowConfirm(false);
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      setShowConfirm(true);
    } else {
      dispatch(setAuthModalOpen(true));
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex flex-col shrink-0">
      {isAuthenticated && user ? (
        <div
          className={clsx(
            'flex items-center gap-2.5 h-12 lg:h-12 px-3 transition-all shrink-0',
            isExpanded
              ? 'lg:hover:bg-gray-50 lg:dark:hover:bg-gray-800/50 w-full lg:w-full'
              : 'justify-center lg:justify-center w-auto lg:w-full',
          )}
        >
          <button
            onClick={handleAuthAction}
            className="w-5 h-5 lg:w-7 lg:h-7 rounded-full lg:rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[9px] lg:text-[11px] shrink-0 shadow-sm cursor-pointer"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover rounded-full lg:rounded-lg"
              />
            ) : (
              initial
            )}
          </button>

          {isExpanded && (
            <span className="hidden lg:contents">
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
            </span>
          )}
        </div>
      ) : (
        <button
          onClick={handleAuthAction}
          className={clsx(
            'h-12 flex items-center transition-all duration-300 group shrink-0 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 justify-center w-auto lg:w-full lg:border-t border-gray-100 dark:border-gray-700 lg:hover:bg-gray-50 lg:dark:hover:bg-gray-700',
            isExpanded && 'lg:gap-3 lg:px-4',
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

      <ConfirmModal
        isOpen={showConfirm}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sure!"
        cancelLabel="Nope"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default ProfileSection;
