import { describe, it, expect } from 'vitest';
import { sanitizeOutput, isTextContent, enforceEntryLimit, MAX_CONSOLE_ENTRIES } from './sanitize';

describe('sanitize', () => {
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

  describe('sanitizeOutput leaves text as written', () => {
    it('does not HTML-escape quotes, tags, ampersands or apostrophes', () => {
      const text = `"Hello" <script>alert(1)</script> a & b it's`;
      expect(sanitizeOutput(text)).toBe(text);
    });

    it('does not HTML-escape strings inside objects', () => {
      expect(sanitizeOutput({ key: "<b>it's</b> & more" })).toContain("<b>it's</b> & more");
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
