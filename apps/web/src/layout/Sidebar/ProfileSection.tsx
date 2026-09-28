import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from 'store';
import { setAuthModalOpen } from 'store/authSlice';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { clsx } from 'clsx';
import Tooltip from 'components/common/Tooltip';
import SignOutConfirmModal from './SignOutConfirmModal';
import { useSignOut } from './useSignOut';

interface ProfileSectionProps {
  isExpanded: boolean;
}

// Tablet/desktop only — on phones sign in/out lives in the hamburger menu.
const ProfileSection = ({ isExpanded }: ProfileSectionProps) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const { isConfirmOpen, requestSignOut, cancelSignOut, confirmSignOut } =
    useSignOut();

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex flex-col shrink-0">
      {isAuthenticated && user ? (
        <div
          className={clsx(
            'flex items-center gap-2 min-h-10 px-2 transition-all shrink-0 w-full',
            isExpanded
              ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              : 'justify-center',
          )}
        >
          {/* 40px touch target even though the avatar glyph itself is small */}
          <Tooltip label="Sign Out" side="right" className="shrink-0">
            <button
              onClick={requestSignOut}
              aria-label="Sign Out"
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
          </Tooltip>

          {isExpanded && (
            <span className="hidden lg:contents">
              {/* Both lines truncate at 180px, so each reveals its full
                  text in a tooltip on hover. */}
              <div className="flex-1 min-w-0">
                <Tooltip label={user.name} side="right" className="min-w-0">
                  <p className="min-w-0 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 truncate leading-tight">
                    {user.name}
                  </p>
                </Tooltip>
                <Tooltip label={user.email} side="right" className="min-w-0">
                  <p className="min-w-0 text-[10px] text-neutral-400 truncate leading-tight">
                    {user.email}
                  </p>
                </Tooltip>
              </div>
              <Tooltip label="Sign Out" side="right" className="shrink-0">
                <button
                  onClick={requestSignOut}
                  aria-label="Sign Out"
                  className="min-h-10 min-w-10 flex items-center justify-center text-neutral-400 hover:text-danger dark:hover:text-danger-fg-dark transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                >
                  <FaSignOutAlt className="w-3 h-3" />
                </button>
              </Tooltip>
            </span>
          )}
        </div>
      ) : (
        <Tooltip label="Sign In" side="right" className="w-full">
          <button
            onClick={() => dispatch(setAuthModalOpen(true))}
            aria-label="Sign In"
            className={clsx(
              'min-h-10 flex items-center transition-all duration-300 group shrink-0 text-neutral-400 dark:text-neutral-500 hover:text-brand-600 dark:hover:text-brand-400 justify-center w-full border-t border-neutral-100 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800',
              isExpanded && 'lg:gap-2 lg:px-3',
            )}
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
        </Tooltip>
      )}

      <SignOutConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={confirmSignOut}
        onCancel={cancelSignOut}
      />
    </div>
  );
};

export default ProfileSection;
