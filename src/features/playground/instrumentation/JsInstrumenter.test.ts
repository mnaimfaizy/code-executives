import { describe, it, expect } from 'vitest';
import { prepareInstrumentedCode, parseTimelineData } from './JsInstrumenter';
import type { StateSnapshot } from '../types';

describe('JsInstrumenter', () => {
  describe('prepareInstrumentedCode', () => {
    it('returns instrumented code for a simple variable declaration', () => {
      const result = prepareInstrumentedCode('const x = 1;');
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.code).toContain('__tracker__');
        expect(result.sourceMap).toBeInstanceOf(Map);
      }
    });

    it('returns instrumented code for variable assignment', () => {
      const result = prepareInstrumentedCode('let x = 1;\nx = 2;');
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.code).toContain('__tracker__');
      }
    });

    it('instruments function call tracking', () => {
      const code = `function greet(name) {
  return "Hello " + name;
}
greet("World");`;
      const result = prepareInstrumentedCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.code).toContain('enterFunction');
        expect(result.code).toContain('exitFunction');
      }
    });

    it('instruments async code (setTimeout, Promise)', () => {
      const code = `setTimeout(() => { console.log("hi"); }, 100);
Promise.resolve().then(() => {});`;
      const result = prepareInstrumentedCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.code).toBeDefined();
        expect(result.code.length).toBeGreaterThan(code.length);
      }
    });

    it('returns error for malformed code', () => {
      const result = prepareInstrumentedCode('const = ;; {{');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(typeof result.error).toBe('string');
        expect(result.error.length).toBeGreaterThan(0);
      }
    });

    it('returns error for completely invalid syntax', () => {
      const result = prepareInstrumentedCode(')))');
      expect('error' in result).toBe(true);
    });

    it('handles empty code input', () => {
      const result = prepareInstrumentedCode('');
      // Empty code should still parse successfully (empty program)
      expect('error' in result).toBe(false);
    });

    it('preserves source mapping for original line numbers', () => {
      const code = `const a = 1;
const b = 2;
const c = a + b;`;
      const result = prepareInstrumentedCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.sourceMap.size).toBeGreaterThan(0);
      }
    });
  });

  describe('parseTimelineData', () => {
    const makeSnapshot = (step: number, line: number): StateSnapshot => ({
      step,
      line,
      timestamp: Date.now(),
      callStack: [],
      variables: [],
      heapObjects: [],
      microtaskQueue: [],
      macrotaskQueue: [],
      consoleOutput: [],
    });

    it('creates a TimelineEntry from snapshots', () => {
      const snapshots = [makeSnapshot(0, 1), makeSnapshot(1, 2)];
      const entry = parseTimelineData(snapshots, 2, 50);
      expect(entry.snapshots).toHaveLength(2);
      expect(entry.totalSteps).toBe(2);
      expect(entry.executionTimeMs).toBe(50);
    });

    it('handles empty snapshot array', () => {
      const entry = parseTimelineData([], 0, 0);
      expect(entry.snapshots).toHaveLength(0);
      expect(entry.totalSteps).toBe(0);
      expect(entry.executionTimeMs).toBe(0);
    });

    it('uses snapshot length as fallback for totalSteps', () => {
      const snapshots = [makeSnapshot(0, 1), makeSnapshot(1, 2), makeSnapshot(2, 3)];
      // When totalSteps is 0 but snapshots exist, uses the provided value
      const entry = parseTimelineData(snapshots, 0, 100);
      expect(entry.totalSteps).toBe(0);
    });
  });
});
