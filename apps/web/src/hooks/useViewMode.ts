import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { useIsMobile } from 'hooks/useIsMobile';

export type ViewMode = 'grid' | 'list';

function isViewMode(value: unknown): value is ViewMode {
  return value === 'grid' || value === 'list';
}

export function useViewMode(storageKey: string, defaultMode: ViewMode = 'grid') {
  const [storedMode, setViewMode] = useLocalStorageState<ViewMode>(
    storageKey,
    defaultMode,
    {
      deserialize: (raw) => {
        const parsed = JSON.parse(raw);
        return isViewMode(parsed) ? parsed : defaultMode;
      },
    },
  );

  // On phones there's no horizontally-scrolling table fallback — grid is the
  // only mode, regardless of the user's stored table/grid preference. The
  // toggle itself should be hidden by consumers when `isMobile` is true.
  const isMobile = useIsMobile();
  const viewMode: ViewMode = isMobile ? 'grid' : storedMode;

  return { viewMode, setViewMode, isMobile };
}
