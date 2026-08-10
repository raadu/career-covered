import { useCallback, useState } from 'react';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from 'utils/localStorageUtils';

interface UseLocalStorageStateOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options?: UseLocalStorageStateOptions<T>,
): [T, (value: T) => void] {
  const deserialize =
    options?.deserialize ?? ((raw: string) => JSON.parse(raw) as T);

  const [state, setState] = useState<T>(() => {
    const raw = getLocalStorageItem(key);
    if (raw === null) return defaultValue;
    try {
      return deserialize(raw);
    } catch {
      return defaultValue;
    }
  });

  const serializeOption = options?.serialize;
  const setPersistedState = useCallback(
    (value: T) => {
      const serializeValue = serializeOption ?? ((v: T) => JSON.stringify(v));
      setState(value);
      setLocalStorageItem(key, serializeValue(value));
    },
    [key, serializeOption],
  );

  return [state, setPersistedState];
}
