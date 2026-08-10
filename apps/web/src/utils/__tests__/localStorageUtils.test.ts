import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from '../localStorageUtils';

describe('localStorageUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('setLocalStorageItem writes under the cl_ prefixed key', () => {
    setLocalStorageItem('darkMode', 'true');
    expect(localStorage.getItem('cl_darkMode')).toBe('true');
  });

  it('getLocalStorageItem reads back the cl_ prefixed key', () => {
    localStorage.setItem('cl_darkMode', 'true');
    expect(getLocalStorageItem('darkMode')).toBe('true');
  });

  it('getLocalStorageItem returns null when the key is absent', () => {
    expect(getLocalStorageItem('missingKey')).toBeNull();
  });

  it('removeLocalStorageItem removes the cl_ prefixed key', () => {
    localStorage.setItem('cl_darkMode', 'true');
    removeLocalStorageItem('darkMode');
    expect(localStorage.getItem('cl_darkMode')).toBeNull();
  });

  describe('when localStorage throws (private browsing / quota exceeded)', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('getLocalStorageItem returns null instead of throwing', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(getLocalStorageItem('darkMode')).toBeNull();
    });

    it('setLocalStorageItem fails silently instead of throwing', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(() => setLocalStorageItem('darkMode', 'true')).not.toThrow();
    });

    it('removeLocalStorageItem fails silently instead of throwing', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(() => removeLocalStorageItem('darkMode')).not.toThrow();
    });
  });
});
