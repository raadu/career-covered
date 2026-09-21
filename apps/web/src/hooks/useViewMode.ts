import { useLocalStorageState } from 'hooks/useLocalStorageState';

export type ViewMode = 'grid' | 'list';

function isViewMode(value: unknown): value is ViewMode {
  return value === 'grid' || value === 'list';
}

export function useViewMode(storageKey: string, defaultMode: ViewMode = 'grid') {
  const [viewMode, setViewMode] = useLocalStorageState<ViewMode>(
    storageKey,
    defaultMode,
    {
      deserialize: (raw) => {
        const parsed = JSON.parse(raw);
        return isViewMode(parsed) ? parsed : defaultMode;
      },
    },
  );

  return { viewMode, setViewMode };
}
