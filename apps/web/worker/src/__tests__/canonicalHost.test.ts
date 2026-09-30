import { describe, it, expect } from 'vitest';
import { canonicalRedirectUrl } from '../canonicalHost';

const HOST = 'careercovered.com';
const redirect = (href: string, method = 'GET', host: string | undefined = HOST) =>
  canonicalRedirectUrl(new URL(href), method, host);

describe('canonicalRedirectUrl', () => {
  it('redirects the www host to the apex', () => {
    expect(redirect('https://www.careercovered.com/')).toBe(
      'https://careercovered.com/',
    );
  });

  it('keeps the path and query string', () => {
    expect(redirect('https://www.careercovered.com/faq?ref=ad&x=1')).toBe(
      'https://careercovered.com/faq?ref=ad&x=1',
    );
  });

  it('keeps a hash route when one is on the URL', () => {
    expect(
      redirect('https://www.careercovered.com/#/cover-letter/previous'),
    ).toBe('https://careercovered.com/#/cover-letter/previous');
  });

  it('redirects HEAD as well as GET, case-insensitively', () => {
    expect(redirect('https://www.careercovered.com/', 'head')).toBe(
      'https://careercovered.com/',
    );
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'passes %s through untouched, since a redirect would drop its body',
    (method) => {
      expect(
        redirect('https://www.careercovered.com/api/cover-letters', method),
      ).toBeNull();
    },
  );

  it('does not redirect the apex itself', () => {
    expect(redirect('https://careercovered.com/')).toBeNull();
  });

  it('ignores other subdomains, including the API host', () => {
    expect(redirect('https://api.careercovered.com/')).toBeNull();
    expect(redirect('https://staging.careercovered.com/')).toBeNull();
  });

  it('does nothing when no canonical host is configured (local dev)', () => {
    // Called directly: the `redirect` helper's default would fill in HOST.
    for (const href of [
      'http://localhost:5173/',
      'https://www.careercovered.com/',
    ]) {
      expect(canonicalRedirectUrl(new URL(href), 'GET', undefined)).toBeNull();
      expect(canonicalRedirectUrl(new URL(href), 'GET', '')).toBeNull();
    }
  });

  it('does not treat a look-alike domain as www', () => {
    expect(redirect('https://www.careercovered.com.evil.test/')).toBeNull();
    expect(redirect('https://wwwcareercovered.com/')).toBeNull();
  });
});
