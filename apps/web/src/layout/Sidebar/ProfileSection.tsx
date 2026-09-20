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
            'flex items-center gap-2 min-h-10 px-2 transition-all shrink-0',
            isExpanded
              ? 'md:hover:bg-neutral-100 md:dark:hover:bg-neutral-800 w-full'
              : 'justify-center w-auto md:w-full',
          )}
        >
          {/* 40px touch target even though the avatar glyph itself is small */}
          <button
            onClick={handleAuthAction}
            className="min-h-10 min-w-10 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </span>
          </button>

          {isExpanded && (
            <span className="hidden lg:contents">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-neutral-400 truncate leading-tight">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleAuthAction}
                title="Sign Out"
                className="min-h-10 min-w-10 flex items-center justify-center text-neutral-400 hover:text-danger dark:hover:text-danger-fg-dark transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
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
            'min-h-10 flex items-center transition-all duration-300 group shrink-0 text-neutral-400 dark:text-neutral-500 hover:text-brand-600 dark:hover:text-brand-400 justify-center w-auto md:w-full md:border-t border-neutral-100 dark:border-neutral-700 md:hover:bg-neutral-100 md:dark:hover:bg-neutral-800',
            isExpanded && 'lg:gap-2 lg:px-3',
          )}
          title="Sign In"
        >
          <FaSignInAlt
            size={14}
            className="group-hover:scale-110 transition-all shrink-0"
          />
          {isExpanded && (
            <span className="hidden lg:block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
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
