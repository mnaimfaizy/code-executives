/**
 * Site Configuration
 *
 * The public origin of the live site. Canonical, Open Graph and Twitter URLs
 * are all built from this, so the domain is changed in one place.
 */

/** Public origin of the live site, without a trailing slash */
export const SITE_URL = 'https://codexecutives.com';

/**
 * Turn a site path (e.g. `/javascript`) into an absolute URL on SITE_URL.
 * Absolute `http(s)://` URLs are returned unchanged.
 */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}
