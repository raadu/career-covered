import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { describe, it, expect } from 'vitest';
import { createTestStore } from '../../../../../tests/test-utils';
import { useQuickLinkItems } from '../useQuickLinkItems';

const user = {
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
  linkedinUrl: 'https://linkedin.com/in/x',
  githubUrl: null,
  websiteUrl: 'https://x.dev',
  contactEmail: 'me@x.dev',
  phoneNumber: undefined,
};

const renderItems = (auth: Record<string, unknown>) => {
  const store = createTestStore({
    auth: { isLoading: false, ...auth },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useQuickLinkItems(), { wrapper }).result.current;
};

describe('useQuickLinkItems', () => {
  it('returns null when signed out', () => {
    expect(renderItems({ user: null, isAuthenticated: false })).toBeNull();
  });

  it('returns null when flagged authenticated but the user is not loaded yet', () => {
    expect(renderItems({ user: null, isAuthenticated: true })).toBeNull();
  });

  it('returns all five links in a stable order with short display names', () => {
    const items = renderItems({ user, isAuthenticated: true })!;
    expect(items.map((i) => i.key)).toEqual([
      'linkedin',
      'github',
      'website',
      'email',
      'phone',
    ]);
    expect(items.map((i) => i.name)).toEqual([
      'LinkedIn',
      'GitHub',
      'Website',
      'Email',
      'Phone',
    ]);
  });

  it('maps each link to the matching profile field, keeping unset values as-is', () => {
    const byKey = Object.fromEntries(
      renderItems({ user, isAuthenticated: true })!.map((i) => [i.key, i.value]),
    );
    expect(byKey).toEqual({
      linkedin: 'https://linkedin.com/in/x',
      github: null,
      website: 'https://x.dev',
      email: 'me@x.dev',
      phone: undefined,
    });
  });

  it('gives every link a distinct copy handler and toast label', () => {
    const items = renderItems({ user, isAuthenticated: true })!;
    expect(new Set(items.map((i) => i.label)).size).toBe(5);
    for (const item of items) {
      expect(item.handleCopy).toBeInstanceOf(Function);
    }
  });
});
