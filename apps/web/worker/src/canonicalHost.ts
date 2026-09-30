// The site is served on both careercovered.com and www.careercovered.com,
// but the browser keeps localStorage/sessionStorage separately per origin.
// Google sign-in always returns to the API's single WEB_URL, so a visit that
// started on the other host lost everything saved for the round-trip (the
// job description and generated letter). Redirecting page loads to one
// canonical host keeps all browser storage in a single origin.

const REDIRECTABLE_METHODS = new Set(['GET', 'HEAD']);

/**
 * Returns the canonical URL to redirect to, or null to serve the request as
 * is. Only GET/HEAD are redirected — a redirected POST would lose its body.
 * No-op when `canonicalHost` is unset (local development).
 */
export function canonicalRedirectUrl(
  url: URL,
  method: string,
  canonicalHost: string | undefined,
): string | null {
  if (!canonicalHost || url.hostname !== `www.${canonicalHost}`) return null;
  if (!REDIRECTABLE_METHODS.has(method.toUpperCase())) return null;

  const target = new URL(url);
  target.hostname = canonicalHost;
  return target.toString();
}
