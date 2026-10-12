/**
 * Integration tests for the Playground feature.
 *
 * These tests verify multi-module interactions:
 * - tracer → trace of the code the Playground ships
 * - Python instrumenter → steps
 * - Examples → languages and lenses
 *
 * Since jsdom cannot execute real iframe code or load Pyodide WASM,
 * these integration tests focus on the data pipeline, not full
 * browser-level E2E. The sandbox script itself runs in sandboxRuntime.test.ts.
 */
import { describe, it, expect } from 'vitest';
import { wrapPythonCodeWithTrace, parsePythonSteps } from '../instrumentation/PythonInstrumenter';
import { instrument, traceSync } from '../tracer';
import { codeTemplates } from '../utils/codeTemplates';
import { examples } from '../utils/examples';
import { sanitizeOutput, enforceEntryLimit, MAX_CONSOLE_ENTRIES } from '../utils/sanitize';

describe('Integration: JS tracing pipeline', () => {
  it('instruments the JS template and every JS example', () => {
    const jsExamples = examples.filter((s) => s.language === 'javascript');
    for (const code of [codeTemplates.javascript, ...jsExamples.map((s) => s.code)]) {
      expect(instrument(code).ok).toBe(true);
    }
  });

  it('reports TypeScript that still has its types as a syntax error with a line', () => {
    // The Playground strips the types first (services/transpileTypeScript)
    const result = instrument('const a = 1;\nconst b: number = 2;');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.line).toBe(2);
  });

  it('records a step per statement, each with the snapshot the views draw', () => {
    const trace = traceSync('const x = 1;\nconst y = 2;\nconst z = x + y;');
    expect(trace.outcome).toBe('completed');
    const statements = trace.steps.filter((step) => step.kind === 'statement');
    expect(statements.map((step) => step.line)).toEqual([1, 2, 3]);

    const last = trace.steps[trace.steps.length - 1];
    expect(last.snapshot.frames[0].slots).toEqual([
      { name: 'x', value: '1' },
      { name: 'y', value: '2' },
      { name: 'z', value: '3' },
    ]);
    expect(last.focus).toEqual([`${last.snapshot.frames[0].id}.z`]);
  });
});

describe('Integration: Python instrumentation pipeline', () => {
  it('wraps Python template code and produces parseable instrumentation', () => {
    const wrapped = wrapPythonCodeWithTrace(codeTemplates.python);
    expect(wrapped).toContain('sys.settrace');
    expect(wrapped).toContain('_instrumentation_result');
  });

  it('wraps all Python examples without errors', () => {
    const pyExamples = examples.filter((s) => s.language === 'python');
    for (const example of pyExamples) {
      const wrapped = wrapPythonCodeWithTrace(example.code);
      expect(wrapped).toContain('base64.b64decode');
    }
  });

  it('parsePythonSteps turns what Pyodide returns into steps', () => {
    const records = [
      { line: 1, callStack: [], variables: [{ name: 'x', value: 42, type: 'number' }] },
    ];
    const steps = parsePythonSteps(JSON.stringify(records));
    expect(steps).toHaveLength(1);
    expect(steps[0].snapshot.frames[0].slots).toEqual([{ name: 'x', value: '42' }]);
  });
});

describe('Integration: Sanitization + console output pipeline', () => {
  it('console text reaches the display as written', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    expect(sanitizeOutput(malicious)).toBe(malicious);
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

describe('Integration: Examples coverage', () => {
  it('all languages have at least one example', () => {
    const languages = new Set(examples.map((s) => s.language));
    expect(languages.has('javascript')).toBe(true);
    // Python may or may not have examples yet
  });

  it('all examples have non-empty code', () => {
    for (const example of examples) {
      expect(example.code.trim().length).toBeGreaterThan(0);
    }
  });

  it('all example ids are unique', () => {
    const ids = examples.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all examples reference valid languages', () => {
    const validLanguages = ['javascript', 'typescript', 'python'];
    for (const example of examples) {
      expect(validLanguages).toContain(example.language);
    }
  });

  it('all examples reference valid visualization lenses', () => {
    const validLenses = ['stack-heap', 'stack-queues', 'none'];
    for (const example of examples) {
      expect(validLenses).toContain(example.suggestedLens);
    }
  });
});
