import { useState } from 'react';
import { useAppDispatch } from 'store';
import { logoutUser } from 'store/authSlice';
import { showToast } from 'components/common/Toast';
import { EMOJI_CRY } from 'utils/emojiUtils';

// Sign-out is always confirmed first. Shared by the desktop ProfileSection
// and the mobile menu; each renders its own ConfirmModal from this state.
export function useSignOut() {
  const dispatch = useAppDispatch();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const requestSignOut = () => setIsConfirmOpen(true);
  const cancelSignOut = () => setIsConfirmOpen(false);

  const confirmSignOut = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() =>
        showToast(`You're logged out. We're gonna miss you ${EMOJI_CRY}`, {
          type: 'info',
        }),
      )
      .catch(() => showToast('Sign out failed', { type: 'error' }));
    setIsConfirmOpen(false);
  };

  return { isConfirmOpen, requestSignOut, cancelSignOut, confirmSignOut };
}
