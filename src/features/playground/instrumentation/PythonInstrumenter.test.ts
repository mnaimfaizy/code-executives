import { describe, it, expect } from 'vitest';
import { wrapPythonCodeWithTrace, parsePythonSteps } from './PythonInstrumenter';

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

    it('captures local variables', () => {
      const wrapped = wrapPythonCodeWithTrace('x = 1');
      expect(wrapped).toContain('_capture_vars');
      expect(wrapped).toContain('local_vars');
    });

    it('serializes what it recorded to JSON', () => {
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

  describe('parsePythonSteps', () => {
    /** What the trace function records for: x = 1 / def add(a, b) / total = add(x, 2) */
    const records = [
      { line: 1, callStack: [{ functionName: '<module>' }], variables: [] },
      {
        line: 4,
        callStack: [{ functionName: '<module>' }],
        variables: [{ name: 'x', value: 1, type: 'number' }],
      },
      {
        line: 3,
        callStack: [{ functionName: '<module>' }, { functionName: 'add' }],
        variables: [
          { name: 'a', value: 1, type: 'number' },
          { name: 'b', value: 2, type: 'number' },
        ],
      },
      {
        line: 5,
        callStack: [{ functionName: '<module>' }],
        variables: [
          { name: 'x', value: 1, type: 'number' },
          { name: 'total', value: 3, type: 'number' },
        ],
      },
    ];
    const steps = parsePythonSteps(JSON.stringify(records));

    it('makes one statement step per record, with its line and no heap', () => {
      expect(steps.map((step) => step.line)).toEqual([1, 4, 3, 5]);
      for (const step of steps) {
        expect(step.kind).toBe('statement');
        expect(step.snapshot.objects).toEqual([]);
      }
    });

    it('builds the frames from the call stack, with ids that are stable per depth', () => {
      expect(steps[1].snapshot.frames).toEqual([
        { id: 'frame-0', name: 'global', slots: [{ name: 'x', value: '1' }] },
      ]);
      expect(steps[2].snapshot.frames.map((frame) => [frame.id, frame.name])).toEqual([
        ['frame-0', 'global'],
        ['frame-1', 'add'],
      ]);
      expect(steps[3].snapshot.frames.map((frame) => frame.id)).toEqual(['frame-0']);
    });

    it('gives the top frame the recorded values; a frame below keeps its last slots', () => {
      const [global, add] = steps[2].snapshot.frames;
      expect(add.slots).toEqual([
        { name: 'a', value: '1' },
        { name: 'b', value: '2' },
      ]);
      expect(global.slots).toEqual([{ name: 'x', value: '1' }]);
    });

    it('derives the focus from the values that changed since the previous step', () => {
      expect(steps[0].focus).toEqual(['frame-0']);
      expect(steps[1].focus).toEqual(['frame-0.x']);
      expect(steps[2].focus).toEqual(['frame-1', 'frame-1.a', 'frame-1.b']);
      expect(steps[3].focus).toEqual(['frame-0.total']);
    });

    it('writes values the way Python does', () => {
      const [step] = parsePythonSteps(
        JSON.stringify([
          {
            line: 1,
            callStack: [],
            variables: [
              { name: 'name', value: 'Ada' },
              { name: 'done', value: true },
              { name: 'nothing', value: null },
              { name: 'items', value: [1, 'two', [3]] },
              { name: 'ages', value: { ada: 36 } },
              { name: 'long', value: 'x'.repeat(100) },
            ],
          },
        ])
      );
      const [frame] = step.snapshot.frames;
      expect(frame.name).toBe('global');
      expect(frame.slots.slice(0, 5).map((slot) => slot.value)).toEqual([
        "'Ada'",
        'True',
        'None',
        "[1, 'two', [3]]",
        "{'ada': 36}",
      ]);
      expect(frame.slots[5].value).toHaveLength(61);
      expect(frame.slots.every((slot) => slot.refId === undefined)).toBe(true);
    });

    it('returns no steps for JSON that is invalid, empty or not a list', () => {
      expect(parsePythonSteps('not valid json')).toEqual([]);
      expect(parsePythonSteps('')).toEqual([]);
      expect(parsePythonSteps('{}')).toEqual([]);
      expect(parsePythonSteps('[]')).toEqual([]);
    });
  });
});
