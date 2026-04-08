/**
 * Output sanitization utilities for the Playground.
 *
 * Prevents XSS in console output, handles circular references,
 * limits output size, and guards against prototype pollution.
 */

/** Maximum length of a single stringified output entry */
const MAX_ENTRY_LENGTH = 10_240; // 10 KB

/** Maximum number of console entries retained */
export const MAX_CONSOLE_ENTRIES = 500;

/** Maximum recursion depth for object stringification */
const MAX_DEPTH = 10;

/** Characters that could trigger HTML/script injection */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

const HTML_ESCAPE_RE = /[&<>"'/`]/g;

/**
 * HTML-encode a string to prevent XSS when displayed in the console.
 */
export function escapeHtml(str: string): string {
  return str.replace(HTML_ESCAPE_RE, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/**
 * Safely stringify any value for display, guarding against:
 * - Circular references → "[Circular]"
 * - Deeply nested objects → "[Max depth]"
 * - Prototype pollution (only own properties traversed)
 * - BigInt values
 * - Symbols
 * - Functions (shows signature)
 * - Oversized output (truncated)
 */
export function sanitizeOutput(value: unknown): string {
  const raw = safeStringify(value, MAX_DEPTH);
  return truncateString(raw, MAX_ENTRY_LENGTH);
}

/**
 * Full sanitization pipeline: stringify → HTML-escape → truncate.
 * Use this when the output will be rendered as HTML (e.g., innerHTML).
 */
export function sanitizeForDisplay(value: unknown): string {
  return escapeHtml(sanitizeOutput(value));
}

/**
 * Truncate a string to `maxLength`, appending an ellipsis indicator.
 */
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '… (truncated)';
}

/**
 * Core safe-stringify that handles all edge cases.
 */
function safeStringify(value: unknown, maxDepth: number): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') {
    const name = value.name || 'anonymous';
    return `[Function: ${name}]`;
  }
  if (typeof value === 'string') return value;

  // Objects and arrays — use JSON with circular ref detection
  try {
    const seen = new WeakSet();
    let depth = 0;

    const result = JSON.stringify(
      value,
      function (_key: string, val: unknown): unknown {
        // Guard against __proto__ / constructor keys (prototype pollution)
        if (_key === '__proto__' || _key === 'constructor' || _key === 'prototype') {
          return '[Filtered]';
        }
        if (typeof val === 'bigint') return `${val}n`;
        if (typeof val === 'symbol') return val.toString();
        if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
        if (typeof val === 'undefined') return '[undefined]';
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
          depth++;
          if (depth > maxDepth) {
            depth--;
            return '[Max depth]';
          }
        }
        return val;
      },
      2
    );

    return result ?? 'undefined';
  } catch {
    return String(value);
  }
}

/**
 * Validate that content is a text string (not binary).
 * Returns true for valid text content.
 */
export function isTextContent(content: string): boolean {
  // Check for null bytes which indicate binary content
  // eslint-disable-next-line no-control-regex
  return !/[\x00-\x08\x0E-\x1F]/.test(content);
}

/**
 * Enforce console entry limits: returns a trimmed array if it exceeds MAX_CONSOLE_ENTRIES.
 */
export function enforceEntryLimit<T>(entries: T[]): T[] {
  if (entries.length <= MAX_CONSOLE_ENTRIES) return entries;
  return entries.slice(entries.length - MAX_CONSOLE_ENTRIES);
}
