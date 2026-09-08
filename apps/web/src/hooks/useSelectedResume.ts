import { useLocalStorageState } from 'hooks/useLocalStorageState';

export function useSelectedResume() {
  return useLocalStorageState<string | null>('selected_resume_id', null);
}
