/**
 * PythonInstrumenter — Generates Python wrapper code that uses sys.settrace()
 * to capture execution state at each line.
 *
 * The trace function captures: line number, local variables, call stack depth.
 * Internal Pyodide frames are filtered out — only user code is traced.
 * The collected frame data is serialized to JSON and returned to JavaScript.
 */

import type { StateSnapshot } from '../types';

/** Maximum number of steps to capture before sampling */
const MAX_PYTHON_STEPS = 1000;

/**
 * Generate the Python instrumentation wrapper that uses sys.settrace().
 *
 * The wrapper:
 * 1. Sets up a trace function that fires on every line
 * 2. Captures local variables, call stack, and line numbers
 * 3. Filters out Pyodide internals (exec frames, importlib, etc.)
 * 4. Stores snapshots in a JSON-serializable list
 * 5. Returns the snapshots list after execution
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

_snapshots = []
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

        _snapshots.append({
            'step': _step_counter[0],
            'line': frame.f_lineno,
            'timestamp': 0,
            'callStack': list(_call_stack),
            'variables': _capture_vars(local_vars),
            'heapObjects': [],
            'microtaskQueue': [],
            'macrotaskQueue': [],
            'consoleOutput': []
        })
        _step_counter[0] += 1
        return _trace_function

    return _trace_function

# Decode and execute user code with tracing
_user_code = base64.b64decode('${encoded}').decode('utf-8')
sys.settrace(_trace_function)
try:
    exec(compile(_user_code, _TRACE_FILE, 'exec'))
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
finally:
    sys.settrace(None)

# Make snapshots available to JavaScript
_instrumentation_result = json.dumps(_snapshots)
`;
}

/**
 * Parse the JSON snapshots string returned from Python execution.
 */
export function parsePythonSnapshots(jsonStr: string): StateSnapshot[] {
  try {
    const raw = JSON.parse(jsonStr) as StateSnapshot[];
    return raw;
  } catch {
    return [];
  }
}
