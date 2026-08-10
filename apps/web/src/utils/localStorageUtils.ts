const PREFIX = 'cl_';

export function getLocalStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(`${PREFIX}${key}`);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, value);
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded) — fail silently
  }
}

export function removeLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded) — fail silently
  }
}
