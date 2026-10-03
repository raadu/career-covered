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

  describe('extra links', () => {
    it('are left out of the list entirely while unset', () => {
      const keys = renderItems({ user, isAuthenticated: true })!.map(
        (i) => i.key,
      );
      expect(keys).not.toContain('extra1');
      expect(keys).not.toContain('extra2');
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['an empty string', ''],
    ])('stay hidden when the value is %s', (_label, value) => {
      const keys = renderItems({
        user: { ...user, extraLink1Url: value, extraLink2Url: value },
        isAuthenticated: true,
      })!.map((i) => i.key);
      expect(keys).toHaveLength(5);
    });

    it('appear after the core five, with names, icons and toast labels, once set', () => {
      const items = renderItems({
        user: {
          ...user,
          extraLink1Url: 'https://portfolio.dev',
          extraLink2Url: 'https://blog.dev',
        },
        isAuthenticated: true,
      })!;
      expect(items.map((i) => i.key)).toEqual([
        'linkedin',
        'github',
        'website',
        'email',
        'phone',
        'extra1',
        'extra2',
      ]);
      const [extra1, extra2] = items.slice(5);
      expect(extra1).toMatchObject({
        name: 'Extra Link 1',
        title: 'Copy Extra Link 1',
        label: 'Extra link 1',
        value: 'https://portfolio.dev',
      });
      expect(extra2).toMatchObject({
        name: 'Extra Link 2',
        title: 'Copy Extra Link 2',
        label: 'Extra link 2',
        value: 'https://blog.dev',
      });
      expect(extra1.Icon).not.toBe(extra2.Icon);
    });

    it('shows only the extra that is set', () => {
      const keys = renderItems({
        user: { ...user, extraLink2Url: 'https://blog.dev' },
        isAuthenticated: true,
      })!.map((i) => i.key);
      expect(keys).toContain('extra2');
      expect(keys).not.toContain('extra1');
    });

    it('never hides the core five, even when empty', () => {
      const keys = renderItems({
        user: {
          id: '1',
          email: 'a@b.c',
          name: 'N',
          linkedinUrl: null,
          githubUrl: null,
        },
        isAuthenticated: true,
      })!.map((i) => i.key);
      expect(keys).toEqual(['linkedin', 'github', 'website', 'email', 'phone']);
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
