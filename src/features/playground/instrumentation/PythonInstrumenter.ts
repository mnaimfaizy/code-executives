/**
 * PythonInstrumenter — Generates Python wrapper code that uses sys.settrace()
 * to capture execution state at each line.
 *
 * The trace function captures: line number, local variables, call stack depth.
 * Internal Pyodide frames are filtered out — only user code is traced.
 * The collected records are serialized to JSON and returned to JavaScript, where
 * `parsePythonSteps` turns them into the steps every trace holds (ADR 0004).
 *
 * Python records values only: a step's snapshot has frames and no heap objects, so
 * a list shows as its text and two names for one list cannot be told apart. A record
 * is taken when a line is about to run, so a step shows what the lines before it did.
 */

import { slotKey } from '../../../shared/snapshot';
import type { Slot, StackFrame } from '../../../shared/snapshot';
import type { Step } from '../tracer';

/** Maximum number of steps to capture before sampling */
const MAX_PYTHON_STEPS = 1000;

/**
 * Generate the Python instrumentation wrapper that uses sys.settrace().
 *
 * The wrapper:
 * 1. Sets up a trace function that fires on every line
 * 2. Captures local variables, call stack, and line numbers
 * 3. Filters out Pyodide internals (exec frames, importlib, etc.)
 * 4. Stores one record per line in a JSON-serializable list
 * 5. Leaves the list in a global after execution
 */
export function wrapPythonCodeWithTrace(userCode: string): string {
  // Escape the user code for embedding in a Python string.
  // We use base64 encoding to avoid any escaping issues.
  const encoded = btoa(unescape(encodeURIComponent(userCode)));

  return `
import sys
import json
import base64
import traceback

_records = []
_call_stack = []
_step_counter = [0]
_MAX_STEPS = ${MAX_PYTHON_STEPS}
_TRACE_FILE = '<user_code>'

def _safe_repr(val, depth=0):
    if depth > 3:
        return '(deep)'
    try:
        if val is None:
            return None
        if isinstance(val, (int, float, bool)):
            return val
        if isinstance(val, str):
            if len(val) > 200:
                return val[:200] + '...'
            return val
        if isinstance(val, (list, tuple)):
            if len(val) > 20:
                return [_safe_repr(v, depth + 1) for v in val[:20]] + ['...(' + str(len(val)) + ' total)']
            return [_safe_repr(v, depth + 1) for v in val]
        if isinstance(val, dict):
            result = {}
            keys = list(val.keys())[:20]
            for k in keys:
                result[str(k)] = _safe_repr(val[k], depth + 1)
            if len(val) > 20:
                result['...'] = '(' + str(len(val)) + ' keys total)'
            return result
        if isinstance(val, set):
            return list(val)[:20]
        return str(val)
    except Exception:
        return '(error)'

def _get_type(val):
    if val is None:
        return 'null'
    if isinstance(val, bool):
        return 'boolean'
    if isinstance(val, int):
        return 'number'
    if isinstance(val, float):
        return 'number'
    if isinstance(val, str):
        return 'string'
    if isinstance(val, (list, tuple)):
        return 'array'
    if isinstance(val, dict):
        return 'object'
    return type(val).__name__

def _capture_vars(local_vars):
    result = []
    for name, val in local_vars.items():
        if name.startswith('_') and name not in ('__builtins__',):
            continue
        if name == '__builtins__':
            continue
        result.append({
            'name': name,
            'value': _safe_repr(val),
            'type': _get_type(val)
        })
    return result

def _trace_function(frame, event, arg):
    if _step_counter[0] >= _MAX_STEPS:
        return None

    filename = frame.f_code.co_filename
    if filename != _TRACE_FILE and not filename.endswith('<string>'):
        return _trace_function

    if event == 'call':
        func_name = frame.f_code.co_name
        if func_name.startswith('_') and func_name != '<module>':
            return None
        _call_stack.append({
            'functionName': func_name,
            'line': frame.f_lineno
        })
        return _trace_function

    if event == 'return':
        if _call_stack:
            _call_stack.pop()
        return _trace_function

    if event == 'line':
        local_vars = {k: v for k, v in frame.f_locals.items()
                       if not k.startswith('__') and not callable(v)}

        _records.append({
            'line': frame.f_lineno,
            'callStack': list(_call_stack),
            'variables': _capture_vars(local_vars)
        })
        _step_counter[0] += 1
        return _trace_function

    return _trace_function

# Decode and execute user code with tracing
_user_code = base64.b64decode('${encoded}').decode('utf-8')
sys.settrace(_trace_function)
try:
    # A namespace of its own, so that the wrapper's imports are not the learner's variables
    exec(compile(_user_code, _TRACE_FILE, 'exec'), {'__name__': '__main__'})
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
finally:
    sys.settrace(None)

# Make the records available to JavaScript
_instrumentation_result = json.dumps(_records)
`;
}

/** What the trace function records each time a line is about to run */
interface PythonRecord {
  line: number;
  callStack: Array<{ functionName: string }>;
  /** The locals of the function that is running */
  variables: Array<{ name: string; value: unknown }>;
}

const MAX_VALUE_LENGTH = 60;

/** A recorded value as Python would write it */
function pythonText(value: unknown): string {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'string') return `'${value}'`;
  if (Array.isArray(value)) return `[${value.map(pythonText).join(', ')}]`;
  if (typeof value === 'object') {
    const pairs = Object.entries(value).map(([key, item]) => `'${key}': ${pythonText(item)}`);
    return `{${pairs.join(', ')}}`;
  }
  return String(value);
}

const cut = (text: string): string =>
  text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text;

/**
 * Turn the JSON the trace function produced into steps.
 *
 * A record holds the locals of the running function only, so a frame further down the
 * stack keeps the slots it had when it was last on top. A frame's id is its depth.
 */
export function parsePythonSteps(json: string): Step[] {
  let records: PythonRecord[];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    records = parsed as PythonRecord[];
  } catch {
    return [];
  }

  const steps: Step[] = [];
  /** The slots each depth had when it was last on top */
  const known: Slot[][] = [];
  let previous: StackFrame[] = [];

  for (const record of records) {
    // The module's own code is the first entry of the call stack
    const names = record.callStack.map(({ functionName }) =>
      functionName === '<module>' ? 'global' : functionName
    );
    if (names.length === 0) names.push('global');
    const top = names.length - 1;
    known.length = names.length;
    known[top] = record.variables.map(({ name, value }) => ({
      name,
      value: cut(pythonText(value)),
    }));

    const frames: StackFrame[] = names.map((name, depth) => ({
      id: `frame-${depth}`,
      name,
      slots: known[depth] ?? [],
    }));

    const before = previous[top];
    const focus = frames[top].slots
      .filter((slot) => before?.slots.find((old) => old.name === slot.name)?.value !== slot.value)
      .map((slot) => slotKey(frames[top].id, slot.name));
    if (!before) focus.unshift(frames[top].id);

    steps.push({
      snapshot: { frames, objects: [] },
      line: record.line,
      focus,
      kind: 'statement',
      consoleLength: 0,
      truncated: false,
    });
    previous = frames;
  }
  return steps;
}
