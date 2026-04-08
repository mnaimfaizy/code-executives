import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeOutput,
  sanitizeForDisplay,
  isTextContent,
  enforceEntryLimit,
  MAX_CONSOLE_ENTRIES,
} from './sanitize';

describe('sanitize', () => {
  describe('escapeHtml', () => {
    it('escapes ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('escapes angle brackets', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('escapes quotes', () => {
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
      expect(escapeHtml("'hello'")).toBe('&#x27;hello&#x27;');
    });

    it('escapes backticks', () => {
      expect(escapeHtml('`template`')).toBe('&#x60;template&#x60;');
    });

    it('escapes forward slashes', () => {
      expect(escapeHtml('a/b')).toBe('a&#x2F;b');
    });

    it('returns empty string unchanged', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('returns safe strings unchanged', () => {
      expect(escapeHtml('hello world 123')).toBe('hello world 123');
    });

    it('handles multiple special characters together', () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = escapeHtml(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
    });
  });

  describe('sanitizeOutput', () => {
    it('stringifies primitives', () => {
      expect(sanitizeOutput(42)).toBe('42');
      expect(sanitizeOutput('hello')).toBe('hello');
      expect(sanitizeOutput(true)).toBe('true');
      expect(sanitizeOutput(null)).toBe('null');
      expect(sanitizeOutput(undefined)).toBe('undefined');
    });

    it('stringifies objects', () => {
      const result = sanitizeOutput({ a: 1, b: 'two' });
      expect(result).toContain('"a"');
      expect(result).toContain('1');
    });

    it('stringifies arrays', () => {
      const result = sanitizeOutput([1, 2, 3]);
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
    });

    it('handles circular references', () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.self = obj;
      const result = sanitizeOutput(obj);
      expect(result).toContain('[Circular]');
    });

    it('handles deeply nested objects', () => {
      let obj: Record<string, unknown> = { value: 'leaf' };
      for (let i = 0; i < 15; i++) {
        obj = { nested: obj };
      }
      const result = sanitizeOutput(obj);
      expect(result).toContain('[Max depth]');
    });

    it('filters prototype pollution keys', () => {
      const obj = { normal: 1, __proto__: 'bad', constructor: 'evil' };
      const result = sanitizeOutput(obj);
      expect(result).toContain('[Filtered]');
    });

    it('handles BigInt values', () => {
      const result = sanitizeOutput(BigInt(123));
      expect(result).toBe('123n');
    });

    it('handles Symbol values', () => {
      const result = sanitizeOutput(Symbol('test'));
      expect(result).toBe('Symbol(test)');
    });

    it('handles function values', () => {
      function myFunc(): void {}
      const result = sanitizeOutput(myFunc);
      expect(result).toContain('[Function: myFunc]');
    });

    it('truncates oversized output', () => {
      const bigStr = 'x'.repeat(20_000);
      const result = sanitizeOutput(bigStr);
      expect(result.length).toBeLessThan(20_000);
      expect(result).toContain('… (truncated)');
    });
  });

  describe('sanitizeForDisplay', () => {
    it('combines stringify and HTML escaping', () => {
      const result = sanitizeForDisplay('<script>alert(1)</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('handles objects with HTML-like values', () => {
      const result = sanitizeForDisplay({ key: '<b>bold</b>' });
      expect(result).not.toContain('<b>');
    });
  });

  describe('isTextContent', () => {
    it('returns true for normal text', () => {
      expect(isTextContent('hello world')).toBe(true);
    });

    it('returns true for text with newlines and tabs', () => {
      expect(isTextContent('line1\nline2\ttab')).toBe(true);
    });

    it('returns false for binary content with null bytes', () => {
      expect(isTextContent('abc\x00def')).toBe(false);
    });

    it('returns false for content with control characters', () => {
      expect(isTextContent('abc\x05def')).toBe(false);
    });

    it('returns true for empty string', () => {
      expect(isTextContent('')).toBe(true);
    });
  });

  describe('enforceEntryLimit', () => {
    it('returns array unchanged when under limit', () => {
      const entries = [1, 2, 3];
      expect(enforceEntryLimit(entries)).toBe(entries); // same reference
    });

    it('trims from the beginning when over limit', () => {
      const entries = Array.from({ length: MAX_CONSOLE_ENTRIES + 10 }, (_, i) => i);
      const result = enforceEntryLimit(entries);
      expect(result).toHaveLength(MAX_CONSOLE_ENTRIES);
      // Should keep the most recent entries
      expect(result[0]).toBe(10);
      expect(result[result.length - 1]).toBe(MAX_CONSOLE_ENTRIES + 9);
    });

    it('returns exactly MAX_CONSOLE_ENTRIES items when at limit', () => {
      const entries = Array.from({ length: MAX_CONSOLE_ENTRIES }, (_, i) => i);
      const result = enforceEntryLimit(entries);
      expect(result).toHaveLength(MAX_CONSOLE_ENTRIES);
      expect(result).toBe(entries); // same reference, no trimming needed
    });

    it('works with generic types', () => {
      const entries = Array.from({ length: MAX_CONSOLE_ENTRIES + 5 }, (_, i) => ({
        id: i,
        text: `entry-${i}`,
      }));
      const result = enforceEntryLimit(entries);
      expect(result).toHaveLength(MAX_CONSOLE_ENTRIES);
      expect(result[0].id).toBe(5);
    });
  });
});
