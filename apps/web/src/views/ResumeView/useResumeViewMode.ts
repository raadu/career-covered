import { useLocalStorageState } from 'hooks/useLocalStorageState';

export type ViewMode = 'grid' | 'list';

function isViewMode(value: unknown): value is ViewMode {
  return value === 'grid' || value === 'list';
}

export function useResumeViewMode() {
  const [viewMode, setViewMode] = useLocalStorageState<ViewMode>(
    'resume_view_mode',
    'grid',
    {
      deserialize: (raw) => {
        const parsed = JSON.parse(raw);
        return isViewMode(parsed) ? parsed : 'grid';
      },
    },
  );

  return { viewMode, setViewMode };
}
