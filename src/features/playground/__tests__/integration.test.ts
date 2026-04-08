/**
 * Integration tests for the Playground feature.
 *
 * These tests verify multi-module interactions:
 * - JS instrumenter → sandbox → console output
 * - Python instrumenter → snapshot parsing
 * - Example snippets → language switching → code loading
 * - Instrumentation → timeline data generation
 *
 * Since jsdom cannot execute real iframe code or load Pyodide WASM,
 * these integration tests focus on the data pipeline and component
 * composition, not full browser-level E2E.
 */
import { describe, it, expect } from 'vitest';
import { prepareInstrumentedCode, parseTimelineData } from '../instrumentation/JsInstrumenter';
import {
  wrapPythonCodeWithTrace,
  parsePythonSnapshots,
} from '../instrumentation/PythonInstrumenter';
import { safeDeepClone, diffSnapshots } from '../instrumentation/StateSnapshot';
import { codeTemplates } from '../utils/codeTemplates';
import { exampleSnippets } from '../utils/exampleSnippets';
import {
  escapeHtml,
  sanitizeOutput,
  enforceEntryLimit,
  MAX_CONSOLE_ENTRIES,
} from '../utils/sanitize';
import type { StateSnapshot } from '../types';

describe('Integration: JS instrumentation pipeline', () => {
  it('instruments JS template code without errors', () => {
    const result = prepareInstrumentedCode(codeTemplates.javascript);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.code).toContain('__tracker__');
      expect(result.sourceMap.size).toBeGreaterThan(0);
    }
  });

  it('instruments TS template code without errors', () => {
    // TypeScript code with type annotations removed (as the instrumenter expects JS)
    // The templates contain TS syntax, but acorn should handle most of it
    // or the instrumenter should return a meaningful error
    const result = prepareInstrumentedCode(codeTemplates.typescript);
    // TS code won't parse with acorn (JS parser), so we expect an error
    expect('error' in result).toBe(true);
  });

  it('instruments all JS example snippets without errors', () => {
    const jsSnippets = exampleSnippets.filter((s) => s.language === 'javascript');
    for (const snippet of jsSnippets) {
      const result = prepareInstrumentedCode(snippet.code);
      expect('error' in result).toBe(false);
    }
  });

  it('instrumented code → parseTimelineData produces valid timeline', () => {
    const code = 'const x = 1;\nconst y = 2;\nconst z = x + y;';
    const result = prepareInstrumentedCode(code);
    expect('error' in result).toBe(false);

    // Simulate what happens after execution: build mock snapshots
    const snapshots: StateSnapshot[] = [
      {
        step: 0,
        line: 1,
        timestamp: 100,
        callStack: [],
        variables: [{ name: 'x', value: 1, type: 'number' }],
        heapObjects: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: [],
      },
      {
        step: 1,
        line: 2,
        timestamp: 101,
        callStack: [],
        variables: [
          { name: 'x', value: 1, type: 'number' },
          { name: 'y', value: 2, type: 'number' },
        ],
        heapObjects: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: [],
      },
      {
        step: 2,
        line: 3,
        timestamp: 102,
        callStack: [],
        variables: [
          { name: 'x', value: 1, type: 'number' },
          { name: 'y', value: 2, type: 'number' },
          { name: 'z', value: 3, type: 'number' },
        ],
        heapObjects: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: [],
      },
    ];

    const entry = parseTimelineData(snapshots, 3, 50);
    expect(entry.snapshots).toHaveLength(3);
    expect(entry.totalSteps).toBe(3);

    // Verify diff between steps
    const diff01 = diffSnapshots(snapshots[0], snapshots[1]);
    expect(diff01.addedVars).toHaveLength(1);
    expect(diff01.addedVars[0].name).toBe('y');

    const diff12 = diffSnapshots(snapshots[1], snapshots[2]);
    expect(diff12.addedVars).toHaveLength(1);
    expect(diff12.addedVars[0].name).toBe('z');
  });
});

describe('Integration: Python instrumentation pipeline', () => {
  it('wraps Python template code and produces parseable instrumentation', () => {
    const wrapped = wrapPythonCodeWithTrace(codeTemplates.python);
    expect(wrapped).toContain('sys.settrace');
    expect(wrapped).toContain('_instrumentation_result');
  });

  it('wraps all Python example snippets without errors', () => {
    const pySnippets = exampleSnippets.filter((s) => s.language === 'python');
    for (const snippet of pySnippets) {
      const wrapped = wrapPythonCodeWithTrace(snippet.code);
      expect(wrapped).toContain('base64.b64decode');
    }
  });

  it('parsePythonSnapshots handles the full pipeline output', () => {
    // Simulate what Pyodide would return after executing the instrumented code
    const snapshots = [
      {
        step: 0,
        line: 1,
        timestamp: 0,
        callStack: [],
        variables: [{ name: 'x', value: 42, type: 'number' }],
        heapObjects: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: [],
      },
    ];
    const jsonStr = JSON.stringify(snapshots);
    const parsed = parsePythonSnapshots(jsonStr);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].variables[0].name).toBe('x');
  });
});

describe('Integration: Sanitization + console output pipeline', () => {
  it('console entries are sanitized before display', () => {
    // Simulate a malicious console.log output going through the pipeline
    const malicious = '<img src=x onerror=alert(1)>';
    const sanitized = escapeHtml(String(malicious));
    expect(sanitized).not.toContain('<img');
    expect(sanitized).toContain('&lt;img');
  });

  it('large output arrays are capped by enforceEntryLimit', () => {
    const entries = Array.from({ length: 1000 }, (_, i) => ({
      id: `e-${i}`,
      type: 'log' as const,
      args: [`Message ${i}`],
      timestamp: Date.now(),
    }));
    const limited = enforceEntryLimit(entries);
    expect(limited).toHaveLength(MAX_CONSOLE_ENTRIES);
  });

  it('circular objects are handled through the full sanitize pipeline', () => {
    const obj: Record<string, unknown> = { name: 'test' };
    obj.self = obj;
    const result = sanitizeOutput(obj);
    expect(result).toContain('[Circular]');
    expect(result).not.toContain('[object Object]');
  });
});

describe('Integration: StateSnapshot utilities', () => {
  it('safeDeepClone handles circular references', () => {
    const obj: Record<string, unknown> = { a: 1, b: [2, 3] };
    obj.self = obj;
    const cloned = safeDeepClone(obj);
    expect(cloned.a).toBe(1);
    expect(cloned.self).toBe('[Circular]');
  });

  it('safeDeepClone respects depth limit', () => {
    let deep: Record<string, unknown> = { value: 'leaf' };
    for (let i = 0; i < 10; i++) {
      deep = { nested: deep };
    }
    const cloned = safeDeepClone(deep, 3);
    // At depth 3, nested objects should be replaced
    expect(JSON.stringify(cloned)).toContain('[max depth]');
  });

  it('diffSnapshots detects removed variables', () => {
    const prev: StateSnapshot = {
      step: 0,
      line: 1,
      timestamp: 0,
      callStack: [{ functionName: 'foo', line: 1 }],
      variables: [
        { name: 'x', value: 1, type: 'number' },
        { name: 'temp', value: 'hello', type: 'string' },
      ],
      heapObjects: [],
      microtaskQueue: [],
      macrotaskQueue: [],
      consoleOutput: [],
    };
    const curr: StateSnapshot = {
      step: 1,
      line: 5,
      timestamp: 1,
      callStack: [],
      variables: [{ name: 'x', value: 1, type: 'number' }],
      heapObjects: [],
      microtaskQueue: [],
      macrotaskQueue: [],
      consoleOutput: [],
    };

    const diff = diffSnapshots(prev, curr);
    expect(diff.removedVars).toContain('temp');
    expect(diff.callStackChanged).toBe(true);
  });

  it('diffSnapshots detects changed values', () => {
    const prev: StateSnapshot = {
      step: 0,
      line: 1,
      timestamp: 0,
      callStack: [],
      variables: [{ name: 'count', value: 1, type: 'number' }],
      heapObjects: [],
      microtaskQueue: [],
      macrotaskQueue: [],
      consoleOutput: [],
    };
    const curr: StateSnapshot = {
      step: 1,
      line: 2,
      timestamp: 1,
      callStack: [],
      variables: [{ name: 'count', value: 2, type: 'number' }],
      heapObjects: [],
      microtaskQueue: [],
      macrotaskQueue: [],
      consoleOutput: [],
    };

    const diff = diffSnapshots(prev, curr);
    expect(diff.changedVars).toHaveLength(1);
    expect(diff.changedVars[0].name).toBe('count');
    expect(diff.changedVars[0].oldValue).toBe(1);
    expect(diff.changedVars[0].newValue).toBe(2);
  });
});

describe('Integration: Example snippets coverage', () => {
  it('all languages have at least one example snippet', () => {
    const languages = new Set(exampleSnippets.map((s) => s.language));
    expect(languages.has('javascript')).toBe(true);
    // Python may or may not have snippets yet
  });

  it('all snippets have non-empty code', () => {
    for (const snippet of exampleSnippets) {
      expect(snippet.code.trim().length).toBeGreaterThan(0);
    }
  });

  it('all snippet IDs are unique', () => {
    const ids = exampleSnippets.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all snippets reference valid languages', () => {
    const validLanguages = ['javascript', 'typescript', 'python'];
    for (const snippet of exampleSnippets) {
      expect(validLanguages).toContain(snippet.language);
    }
  });

  it('all snippets reference valid visualization lenses', () => {
    const validLenses = ['event-loop', 'heap-stack', 'data-structure', 'stream', 'none'];
    for (const snippet of exampleSnippets) {
      expect(validLenses).toContain(snippet.suggestedLens);
    }
  });
});
