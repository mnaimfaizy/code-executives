import { describe, it, expect } from 'vitest';
import { wrapPythonCodeWithTrace, parsePythonSnapshots } from './PythonInstrumenter';

describe('PythonInstrumenter', () => {
  describe('wrapPythonCodeWithTrace', () => {
    it('generates a Python wrapper with sys.settrace', () => {
      const wrapped = wrapPythonCodeWithTrace('x = 1');
      expect(wrapped).toContain('sys.settrace');
      expect(wrapped).toContain('_trace_function');
    });

    it('encodes user code as base64 to avoid escaping issues', () => {
      const wrapped = wrapPythonCodeWithTrace('print("hello")');
      expect(wrapped).toContain('base64.b64decode');
      expect(wrapped).toContain('_user_code');
    });

    it('includes frame filtering for user code only', () => {
      const wrapped = wrapPythonCodeWithTrace('x = 1');
      expect(wrapped).toContain('<user_code>');
      expect(wrapped).toContain('filename != _TRACE_FILE');
    });

    it('captures local variables in snapshots', () => {
      const wrapped = wrapPythonCodeWithTrace('x = 1');
      expect(wrapped).toContain('_capture_vars');
      expect(wrapped).toContain('local_vars');
    });

    it('includes snapshot serialization to JSON', () => {
      const wrapped = wrapPythonCodeWithTrace('x = 1');
      expect(wrapped).toContain('json.dumps');
      expect(wrapped).toContain('_instrumentation_result');
    });

    it('handles code with special characters', () => {
      const code = 'print("Hello, \'World\'! <>&")';
      const wrapped = wrapPythonCodeWithTrace(code);
      // base64 encoding handles the special characters
      expect(wrapped).toContain('base64.b64decode');
    });

    it('handles multi-line code', () => {
      const code = `x = 1
y = 2
z = x + y
print(z)`;
      const wrapped = wrapPythonCodeWithTrace(code);
      expect(wrapped).toContain('base64.b64decode');
    });

    it('includes MAX_STEPS limit', () => {
      const wrapped = wrapPythonCodeWithTrace('x = 1');
      expect(wrapped).toContain('_MAX_STEPS');
      expect(wrapped).toContain('1000');
    });

    it('includes error handling with try/finally', () => {
      const wrapped = wrapPythonCodeWithTrace('x = 1');
      expect(wrapped).toContain('try:');
      expect(wrapped).toContain('finally:');
      expect(wrapped).toContain('sys.settrace(None)');
    });

    it('tracks call stack with call/return events', () => {
      const wrapped = wrapPythonCodeWithTrace('def foo(): pass');
      expect(wrapped).toContain("event == 'call'");
      expect(wrapped).toContain("event == 'return'");
      expect(wrapped).toContain('_call_stack');
    });
  });

  describe('parsePythonSnapshots', () => {
    it('parses valid JSON snapshot data', () => {
      const data = JSON.stringify([
        {
          step: 0,
          line: 1,
          timestamp: 0,
          callStack: [],
          variables: [{ name: 'x', value: 1, type: 'number' }],
          heapObjects: [],
          microtaskQueue: [],
          macrotaskQueue: [],
          consoleOutput: [],
        },
      ]);
      const result = parsePythonSnapshots(data);
      expect(result).toHaveLength(1);
      expect(result[0].step).toBe(0);
      expect(result[0].line).toBe(1);
      expect(result[0].variables[0].name).toBe('x');
    });

    it('returns empty array for invalid JSON', () => {
      const result = parsePythonSnapshots('not valid json');
      expect(result).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      const result = parsePythonSnapshots('');
      expect(result).toEqual([]);
    });

    it('handles empty snapshot array', () => {
      const result = parsePythonSnapshots('[]');
      expect(result).toEqual([]);
    });

    it('parses multiple snapshots', () => {
      const data = JSON.stringify([
        {
          step: 0,
          line: 1,
          timestamp: 0,
          callStack: [],
          variables: [],
          heapObjects: [],
          microtaskQueue: [],
          macrotaskQueue: [],
          consoleOutput: [],
        },
        {
          step: 1,
          line: 2,
          timestamp: 0,
          callStack: [{ functionName: 'foo', line: 2 }],
          variables: [{ name: 'y', value: 42, type: 'number' }],
          heapObjects: [],
          microtaskQueue: [],
          macrotaskQueue: [],
          consoleOutput: [],
        },
      ]);
      const result = parsePythonSnapshots(data);
      expect(result).toHaveLength(2);
      expect(result[1].callStack).toHaveLength(1);
    });
  });
});
