import { describe, it, expect } from 'vitest';
import { mapTraceLines } from './useSandbox';
import { traceSync } from '../tracer';

describe('mapTraceLines', () => {
  it('maps the line of each step and of the error', () => {
    const trace = traceSync('const a = 1;\nnull.x;');
    expect(trace.outcome).toBe('error');
    const mapped = mapTraceLines(trace, (line) => line + 10);

    expect(mapped.steps.map((step) => step.line)).toEqual(
      trace.steps.map((step) => step.line + 10)
    );
    expect(mapped.error).toEqual({ message: trace.error?.message, line: 12 });
    expect(mapped.outcome).toBe('error');
  });

  it('keeps each snapshot and leaves the trace it was given unchanged', () => {
    const trace = traceSync('const a = [1];\nconst b = a;');
    const lines = trace.steps.map((step) => step.line);
    const mapped = mapTraceLines(trace, () => 99);

    expect(trace.steps.map((step) => step.line)).toEqual(lines);
    expect(mapped.steps.map((step) => step.snapshot)).toEqual(
      trace.steps.map((step) => step.snapshot)
    );
    expect(mapped.error).toBeUndefined();
  });
});
