import { describe, expect, it } from 'vitest';
import { SITE_URL, absoluteUrl } from './site';

describe('absoluteUrl', () => {
  it('prefixes a path with the site origin', () => {
    expect(absoluteUrl('/javascript')).toBe(`${SITE_URL}/javascript`);
  });

  it('adds a missing leading slash', () => {
    expect(absoluteUrl('og-default.png')).toBe(`${SITE_URL}/og-default.png`);
  });

  it('maps the root path to the origin with a trailing slash', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`);
  });

  it('leaves absolute URLs unchanged', () => {
    expect(absoluteUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
  });
});
