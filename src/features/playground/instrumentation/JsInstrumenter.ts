/**
 * JsInstrumenter — Higher-level wrapper around instrumentCode.
 *
 * Coordinates the instrumentation → execution → snapshot-collection pipeline.
 * The __tracker__ runtime object is defined inside instrumentCode.ts and gets
 * embedded in the instrumented source, so the sandbox iframe receives everything
 * in a single code string via postMessage.
 */

import { instrumentCode } from '../services/instrumentCode';
import type { InstrumentationResult } from '../services/instrumentCode';
import type { StateSnapshot, TimelineEntry } from '../types';

/**
 * Result of preparing instrumented code for execution.
 * The `code` field is ready to be sent to the sandbox iframe.
 * After execution, the sandbox returns both console entries and snapshots.
 */
export interface InstrumentedPayload {
  /** Instrumented code with embedded tracker runtime */
  code: string;
  /** Maps instrumented lines → original lines */
  sourceMap: Map<number, number>;
}

/**
 * Prepare JavaScript code for instrumented execution.
 *
 * Parses the code, injects tracker calls, and returns the instrumented
 * code string. The tracker runtime is embedded so the sandbox needs no
 * special setup — just execute the returned code and read the snapshots
 * from postMessage.
 */
export function prepareInstrumentedCode(rawCode: string): InstrumentedPayload | { error: string } {
  const result: InstrumentationResult = instrumentCode(rawCode);

  if (!result.success) {
    return { error: result.error ?? 'Instrumentation failed' };
  }

  // No need to append a separate postMessage — the sandbox iframe
  // reads from __tracker__ directly when posting its 'result' message.
  return {
    code: result.instrumentedCode,
    sourceMap: result.sourceMap,
  };
}

/**
 * Parse raw snapshot data from the sandbox iframe into a TimelineEntry.
 */
export function parseTimelineData(
  snapshots: StateSnapshot[],
  totalSteps: number,
  executionTimeMs: number
): TimelineEntry {
  return {
    snapshots: snapshots ?? [],
    totalSteps: totalSteps ?? snapshots?.length ?? 0,
    executionTimeMs,
  };
}
